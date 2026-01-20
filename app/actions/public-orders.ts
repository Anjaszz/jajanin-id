"use server";

import { createClient } from "@/utils/supabase/server";

export async function getPublicOrderDetails(orderId: string) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
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

  return order as any;
}
