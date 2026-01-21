"use server";

import { createClient } from "@/utils/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: shop } = await supabase
    .from("shops")
    .select("id, name, slug")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return null;

  // Get total sales (completed orders)
  const { data: salesData } = await supabase
    .from("orders")
    .select("total_amount, platform_fee, payment_method, created_at")
    .eq("shop_id", (shop as any).id)
    .eq("status", "completed");

  const totalSales =
    (salesData as any[])?.reduce(
      (sum, order) =>
        sum + (Number(order.total_amount) - Number(order.platform_fee)),
      0,
    ) || 0;

  const gatewayRevenue =
    (salesData as any[])
      ?.filter((o) => o.payment_method === "gateway")
      ?.reduce(
        (sum, order) =>
          sum + (Number(order.total_amount) - Number(order.platform_fee)),
        0,
      ) || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders =
    (salesData as any[])?.filter((o) => new Date(o.created_at) >= today) || [];

  const todaySales =
    todayOrders.reduce(
      (sum, order) =>
        sum + (Number(order.total_amount) - Number(order.platform_fee)),
      0,
    ) || 0;

  const todayCashSales = todayOrders
    .filter((o) => o.payment_method === "cash")
    .reduce(
      (sum, o) => sum + (Number(o.total_amount) - Number(o.platform_fee)),
      0,
    );

  const todayDigitalSales = todayOrders
    .filter((o) => o.payment_method === "gateway")
    .reduce(
      (sum, o) => sum + (Number(o.total_amount) - Number(o.platform_fee)),
      0,
    );

  const todayOrdersCount = todayOrders.length;

  const orderCount = salesData?.length || 0;

  // Get active products count
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("shop_id", (shop as any).id)
    .eq("is_active", true);

  // Get wallet balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("shop_id", (shop as any).id)
    .single();

  // Get recent orders (Excluding pending payment for gateway)
  const { data: recentOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("shop_id", (shop as any).id)
    .neq("status", "pending_payment")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    shopName: (shop as any).name,
    shopSlug: (shop as any).slug,
    totalSales,
    todaySales,
    todayCashSales,
    todayDigitalSales,
    gatewayRevenue,
    todayOrdersCount,
    orderCount,
    productCount: productCount || 0,
    balance: (wallet as any)?.balance || 0,
    recentOrders: recentOrders || [],
  };
}
