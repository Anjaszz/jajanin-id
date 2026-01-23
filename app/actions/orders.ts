"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database.types";
import { revalidatePath } from "next/cache";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");

interface OrderItem {
  product_id: string;
  variant_id?: string;
  quantity: number;
  price: number;
  selected_addons?: any[];
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
  scheduled_for?: string;
}

export async function placeOrder(params: PlaceOrderParams) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { total_amount } = params.items.reduce(
    (acc, item) => ({
      total_amount: acc.total_amount + item.price * item.quantity,
    }),
    { total_amount: 0 },
  );

  // Get shop settings for auto-accept
  const { data: shop } = await supabase
    .from("shops")
    .select("auto_accept_order")
    .eq("id", params.shop_id)
    .single();

  const isAutoAccept = (shop as any)?.auto_accept_order || false;

  // Fetch dynamic system settings
  const { getSystemSettings } = await import("./system-settings");
  const settings = await getSystemSettings();

  // Gateway fee: dynamic % of total
  const gateway_fee =
    params.payment_method === "gateway"
      ? Math.round(total_amount * (settings.gateway_fee / 100))
      : 0;

  // Platform fee logic (Spec 5.2)
  const platform_fee =
    params.payment_method === "gateway"
      ? total_amount * (settings.platform_fee / 100)
      : 0;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      shop_id: params.shop_id,
      buyer_id: user?.id || null,
      guest_info: params.guest_info || null,
      status:
        params.payment_method === "cash"
          ? isAutoAccept && !params.scheduled_for
            ? "accepted"
            : "pending_confirmation"
          : "pending_payment",
      payment_method: params.payment_method,
      total_amount: total_amount,
      platform_fee: platform_fee,
      gateway_fee: gateway_fee,
      scheduled_for: params.scheduled_for,
    } as any)
    .select()
    .single();

  if (orderError) return { error: orderError.message };

  // Insert order items
  const itemsToInsert = params.items.map((item) => ({
    order_id: (order as any).id,
    product_id: item.product_id,
    variant_id: item.variant_id || null,
    quantity: item.quantity,
    price_at_purchase: item.price,
    subtotal: item.price * item.quantity,
    selected_addons: item.selected_addons || [],
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

      // Calculate final amount including gateway fee
      const finalAmount = total_amount + gateway_fee;

      const transaction = await snap.createTransaction({
        transaction_details: {
          order_id: (order as any).id,
          gross_amount: finalAmount,
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
      const { data: updateData, error: updateError } = await (
        supabase.from("orders") as any
      )
        .update({ snap_token: snapToken } as any)
        .eq("id", (order as any).id)
        .select();

      if (updateError) {
        console.error("Failed to update snap_token:", updateError);
      } else if (!updateData || updateData.length === 0) {
        console.error("Update returned no data - possible RLS issue");
      } else {
        revalidatePath(`/orders/${(order as any).id}`);
      }
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
