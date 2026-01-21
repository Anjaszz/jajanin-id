"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getPosProducts(page = 1, limit = 1000) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { data: [], count: 0 };

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return { data: [], count: 0 };

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Fetch products with variants and addons
  // Note: RLS policies should handle security
  const { data, count, error } = await supabase
    .from("products")
    .select("*, product_variants(*), product_addons(*)", { count: "exact" })
    .eq("shop_id", (shop as any).id)
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return { data: [], count: 0 };
  }

  return { data: data as any[], count };
}

export type PosOrderItem = {
  productId: string;
  quantity: number;
  variantId?: string; // Optional
  addonIds?: string[]; // Optional
};

export async function processPosOrder(
  items: PosOrderItem[],
  paymentMethod: "cash" | "gateway",
  receivedAmount?: number,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return { error: "Shop not found" };

  // 1. Validate & Calculate
  let totalAmount = 0;
  const orderItemsData = [];
  const stockUpdates: any[] = []; // { table, id, newStock }

  // Fetch all related data to validate prices
  // This is a bit heavy loop, ideally using 'in' query for bulk fetch, but logic is complex with variants
  for (const item of items) {
    // Fetch product
    const { data: rawProduct } = await supabase
      .from("products")
      .select("*, product_variants(*), product_addons(*)")
      .eq("id", item.productId)
      .single();

    const product = rawProduct as any;

    if (!product) return { error: `Produk tidak ditemukan: ${item.productId}` };

    let unitPrice = Number(product.price);
    let productName = product.name;
    let description = "";

    // Handle Variant
    if (item.variantId) {
      const variant = product.product_variants.find(
        (v: any) => v.id === item.variantId,
      );
      if (!variant)
        return { error: `Varian tidak valid untuk produk ${product.name}` };

      if (variant.stock < item.quantity) {
        return {
          error: `Stok varian ${variant.name} tidak cukup (Sisa: ${variant.stock})`,
        };
      }

      if (variant.price_override !== null) {
        unitPrice = Number(variant.price_override);
      }
      productName = `${product.name} - ${variant.name}`;
      description += `Varian: ${variant.name}`;

      stockUpdates.push({
        table: "product_variants",
        id: variant.id,
        current: variant.stock,
        deduct: item.quantity,
      });
    } else {
      // Main product stock check if no variant (or if logic dictates main stock is separate)
      // Usually if variants exist, stock is on variant. If simple product, stock is on product.
      if (!item.variantId && product.stock !== null) {
        if (product.stock < item.quantity) {
          return {
            error: `Stok produk ${product.name} tidak cukup (Sisa: ${product.stock})`,
          };
        }
        stockUpdates.push({
          table: "products",
          id: product.id,
          current: product.stock,
          deduct: item.quantity,
        });
      }
    }

    // Handle Addons
    let addonsTotal = 0;
    const selectedAddons = [];
    if (item.addonIds && item.addonIds.length > 0) {
      for (const addonId of item.addonIds) {
        const addon = product.product_addons.find((a: any) => a.id === addonId);
        if (addon) {
          addonsTotal += Number(addon.price);
          selectedAddons.push(addon.name);
        }
      }
    }

    if (selectedAddons.length > 0) {
      description += description
        ? `, Addons: ${selectedAddons.join(", ")}`
        : `Addons: ${selectedAddons.join(", ")}`;
    }

    const finalUnitPrice = unitPrice + addonsTotal;
    const subtotal = finalUnitPrice * item.quantity;
    totalAmount += subtotal;

    orderItemsData.push({
      product_id: product.id,
      quantity: item.quantity,
      price_at_purchase: finalUnitPrice,
      subtotal: subtotal,
      metadata: {
        variant_id: item.variantId || null,
        addon_ids: item.addonIds || [],
        description: description,
        variant_name: description.split(",")[0] || null, // Simplified
      },
    });
  }

  const platformFee = 0;

  // 2. Create Order
  const { data: order, error: orderError } = await (
    supabase.from("orders") as any
  )
    .insert({
      shop_id: (shop as any).id,
      buyer_id: null,
      guest_info: { name: "Pelanggan Kasir (Walk-in)" },
      status: paymentMethod === "gateway" ? "pending_payment" : "completed",
      payment_method: paymentMethod,
      total_amount: totalAmount,
      platform_fee: platformFee,
      gateway_fee: 0,
      payment_details: {
        received_amount: receivedAmount || totalAmount,
        change: receivedAmount ? receivedAmount - totalAmount : 0,
        type: "pos_transaction",
      },
    })
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  // 3. Create Order Items
  const itemsWithOrderId = orderItemsData.map((i) => ({
    ...i,
    order_id: (order as any).id,
  }));

  const { error: itemsError } = await (
    supabase.from("order_items") as any
  ).insert(itemsWithOrderId);

  if (itemsError) return { error: itemsError.message };

  let snapToken = null;

  // 4. Handle Midtrans Logic
  if (paymentMethod === "gateway") {
    try {
      const { snap } = await import("@/lib/midtrans");

      // POS orders use simple generated ID for Midtrans to avoid duplicate if retrying
      const orderIdStr = (order as any).id;

      const transaction = await snap.createTransaction({
        transaction_details: {
          order_id: orderIdStr, // Use actual order ID
          gross_amount: totalAmount, // For POS we might want to pass fees if any
        },
        customer_details: {
          first_name: "Pelanggan",
          last_name: "Kasir",
          email: "pos@example.com",
          phone: "08000000000",
        },
      });

      snapToken = transaction.token;

      // Update order with snap token
      await (supabase.from("orders") as any)
        .update({ snap_token: snapToken })
        .eq("id", orderIdStr);
    } catch (err) {
      console.error("Midtrans POS Error:", err);
      // We don't fail the whole order, just log.
      // The user will likely see "error" when trying to pay if token is missing,
      // or we could return warning.
    }
  }

  // 5. Update Stocks (Only if completed, or update immediately? usually immediately even if pending payment to reserve stock)
  // For POS, stock deduction happens immediately.
  for (const update of stockUpdates) {
    if (update.table === "products") {
      await (supabase.from("products") as any)
        .update({ stock: update.current - update.deduct })
        .eq("id", update.id);
    } else if (update.table === "product_variants") {
      await (supabase.from("product_variants") as any)
        .update({ stock: update.current - update.deduct })
        .eq("id", update.id);
    }
  }

  // 6. Update Wallet (Only if completed)
  if (paymentMethod === "cash") {
    const rawWallet = await supabase
      .from("wallets")
      .select("*")
      .eq("shop_id", (shop as any).id)
      .single();

    const wallet: any = rawWallet.data;

    if (wallet) {
      const currentBalance = Number(wallet.balance) || 0;
      const netAmount = totalAmount - platformFee;
      const newBalance = currentBalance + netAmount;

      await (supabase.from("wallets") as any)
        .update({ balance: newBalance })
        .eq("id", wallet.id);

      await (supabase.from("wallet_transactions") as any).insert({
        wallet_id: wallet.id,
        amount: netAmount,
        type: "sales_revenue",
        description: `Penjualan Kasir #${(order as any).id.slice(0, 8)}`,
        reference_id: (order as any).id,
      });
    }
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/pos");
  revalidatePath("/dashboard/products");
  revalidatePath("/dashboard/income");

  return { success: true, orderId: (order as any).id, snapToken };
}
