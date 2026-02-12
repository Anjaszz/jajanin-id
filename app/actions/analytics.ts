"use server";

import { createClient } from "@/utils/supabase/server";

export type BestSellingProduct = {
  id: string;
  name: string;
  image_url: string | null;
  total_sold: number;
  total_revenue: number;
};

export async function getBestSellingProducts(
  period: "today" | "week" | "month" | "all",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return { success: false, error: "Shop not found" };

  let query = supabase
    .from("orders")
    .select(
      `
      id,
      created_at,
      order_items (
        product_id,
        quantity,
        price_at_purchase,
        products (
          id,
          name,
          image_url
        )
      )
    `,
    )
    .eq("shop_id", (shop as any).id)
    .eq("status", "completed");

  const now = new Date();

  if (period === "today") {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    query = query.gte("created_at", today.toISOString());
  } else if (period === "week") {
    const weekStart = new Date(now);
    const day = weekStart.getDay();
    const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    query = query.gte("created_at", weekStart.toISOString());
  } else if (period === "month") {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    query = query.gte("created_at", monthStart.toISOString());
  }

  const { data: orders, error } = await query;

  if (error) {
    console.error("Error fetching analytics:", error);
    return { success: false, error: error.message };
  }

  const productStats: Record<string, BestSellingProduct> = {};

  orders?.forEach((order: any) => {
    order.order_items?.forEach((item: any) => {
      const product = item.products;
      if (!product) return;

      if (!productStats[product.id]) {
        productStats[product.id] = {
          id: product.id,
          name: product.name || "Produk Tanpa Nama",
          image_url: product.image_url,
          total_sold: 0,
          total_revenue: 0,
        };
      }

      const quantity = Number(item.quantity) || 0;
      const price = Number(item.price_at_purchase) || 0;

      productStats[product.id].total_sold += quantity;
      productStats[product.id].total_revenue += quantity * price;
    });
  });

  const result = Object.values(productStats).sort(
    (a, b) => b.total_sold - a.total_sold,
  );

  return { success: true, data: result };
}
