"use server";

import { createClient } from "@/utils/supabase/server";

export async function getPublicOrderDetails(orderId: string) {
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
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
        )
      )
    `
    )
    .eq("id", orderId)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return order as any;
}
