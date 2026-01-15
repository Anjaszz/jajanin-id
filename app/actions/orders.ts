"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database.types";
import { revalidatePath } from "next/cache";

interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

interface PlaceOrderParams {
  shop_id: string;
  payment_method: "cash" | "gateway" | "balance";
  items: OrderItem[];
  guest_info?: {
    name: string;
    email: string;
    phone: string;
  };
}

export async function placeOrder(params: PlaceOrderParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const total_amount = params.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Platform fee logic (Spec 5.2)
  // Example 5% fee
  const platform_fee =
    params.payment_method === "gateway" ? total_amount * 0.05 : 0;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      shop_id: params.shop_id,
      buyer_id: user?.id || null,
      guest_info: params.guest_info || null,
      status:
        params.payment_method === "cash"
          ? "pending_confirmation"
          : "pending_payment",
      payment_method: params.payment_method,
      total_amount: total_amount,
      platform_fee: platform_fee,
    } as any)
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  // Insert order items
  const itemsToInsert = params.items.map((item) => ({
    order_id: (order as any).id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_purchase: item.price,
    subtotal: item.price * item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsToInsert as any);

  if (itemsError) return { error: itemsError.message };

  let snapToken = null;
  let snapUrl = null;

  if (params.payment_method === "gateway") {
    try {
      const { snap } = await import("@/lib/midtrans");
      const transaction = await snap.createTransaction({
        transaction_details: {
          order_id: (order as any).id,
          gross_amount: total_amount,
        },
        customer_details: {
          first_name: params.guest_info?.name || "Customer",
          email: params.guest_info?.email || "customer@example.com",
          phone: params.guest_info?.phone || "",
        },
      });
      snapToken = transaction.token;
      snapUrl = transaction.redirect_url;

      // Update order with snap token
      await (supabase.from("orders") as any)
        .update({ snap_token: snapToken } as any)
        .eq("id", (order as any).id);
    } catch (err) {
      console.error("Midtrans Error:", err);
      // We still return success for the order creation, but without snap token
    }
  }

  revalidatePath("/dashboard/orders");

  return {
    success: true,
    orderId: (order as any).id,
    snapToken,
    snapUrl,
  };
}
