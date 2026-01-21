"use server";

import { createClient } from "@/utils/supabase/server";

export async function restoreOrderStock(orderId: string) {
  const supabase = await createClient();

  // Fetch Order with Items
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (error || !order) return { error: "Order not found" };

  // Restore Stock Logic
  for (const item of order.order_items) {
    const qty = item.quantity;
    const metadata = item.metadata || {};

    if (item.product_id) {
      if (metadata.variant_id) {
        // Restore Variant Stock
        const { data: v } = await supabase
          .from("product_variants")
          .select("stock")
          .eq("id", metadata.variant_id)
          .single();
        if (v) {
          await supabase
            .from("product_variants")
            .update({ stock: v.stock + qty } as any)
            .eq("id", metadata.variant_id);
        }
      } else {
        // Restore Product Stock
        const { data: p } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();
        if (p && p.stock !== null) {
          await supabase
            .from("products")
            .update({ stock: p.stock + qty } as any)
            .eq("id", item.product_id);
        }
      }
    }
  }

  return { success: true };
}
