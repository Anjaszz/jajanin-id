"use server";

import { createClient } from "@/utils/supabase/server";
import { restoreOrderStock } from "./stock-utils";

export async function getPublicOrderDetails(orderId: string) {
  const supabase = await createClient();

  const { data: order, error } = await (supabase.from("orders") as any)
    .select(
      `
      id,
      shop_id,
      buyer_id,
      guest_info,
      status,
      payment_method,
      total_amount,
      platform_fee,
      gateway_fee,
      payment_details,
      snap_token,
      scheduled_for,
      created_at,
      updated_at,
      shops (
        name,
        slug,
        address,
        whatsapp
      ),
      order_items (
        *,
        products (
          name,
          image_url
        ),
        product_variants (
          name
        )
      )
    `,
    )
    .eq("id", orderId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  if (order) {
    const orderAny = order as any;
    // AUTO-EXPIRATION logic for detail page
    if (orderAny.status === "pending_payment") {
      const now = new Date();
      const expiryTime = 24 * 60 * 60 * 1000;

      // ... (in getPublicOrderDetails)
      if (
        now.getTime() - new Date(orderAny.created_at).getTime() >
        expiryTime
      ) {
        // Restore Stock
        await restoreOrderStock(orderAny.id);

        await (supabase.from("orders") as any)
          .update({ status: "cancelled_by_buyer" })
          .eq("id", orderAny.id);
        orderAny.status = "cancelled_by_buyer";
      }
    }
  }

  return order as any;
}
