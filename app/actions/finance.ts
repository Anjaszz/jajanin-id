"use server";

import { createClient } from "@/utils/supabase/server";

export async function getIncomeData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return null;

  // 1. Get orders that are fully COMPLETED
  // Money in hand (Cash) and Money Received (Gateway) are only counted after completion
  const { data: salesData } = await supabase
    .from("orders")
    .select(
      "id, total_amount, platform_fee, created_at, guest_info, status, payment_method",
    )
    .eq("shop_id", (shop as any).id)
    .eq("status", "completed");

  const orderIncome =
    (salesData as any[])?.map((order) => ({
      id: order.id,
      amount: Number(order.total_amount) - Number(order.platform_fee),
      gross_amount: Number(order.total_amount),
      platform_fee: Number(order.platform_fee),
      type: "sales_revenue",
      description: `Penjualan: ${(order.guest_info as any)?.name || "Pelanggan"}`,
      created_at: order.created_at,
      reference_id: order.id,
      payment_method: order.payment_method,
    })) || [];

  // Get wallet transactions (deposits, sales_revenue)
  let { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("shop_id", (shop as any).id)
    .maybeSingle();

  let walletTransactions: any[] = [];
  if (wallet) {
    const { data: txs } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("wallet_id", (wallet as any).id)
      .in("type", ["deposit", "sales_revenue"])
      .order("created_at", { ascending: false });
    walletTransactions = txs || [];
  }

  // Filter out any wallet transactions that are duplicates of orders (using reference_id)
  const orderIds = new Set(orderIncome.map((o) => o.id));
  const otherIncome =
    (walletTransactions as any[])?.filter(
      (tx) => !orderIds.has(tx.reference_id),
    ) || [];

  // Combine both
  const allIncome = [...orderIncome, ...otherIncome].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const totalIncome = allIncome.reduce((sum, tx) => sum + Number(tx.amount), 0);

  return {
    transactions: allIncome,
    totalIncome,
  };
}

export async function getExpenseData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return null;

  const { data: wallet } = await supabase
    .from("wallets")
    .select("id")
    .eq("shop_id", (shop as any).id)
    .single();

  if (!wallet) return { transactions: [], totalExpenses: 0 };

  // Get wallet transactions (withdrawals, platform_fee, etc)
  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", (wallet as any).id)
    .in("type", ["withdrawal", "platform_fee", "refund"])
    .order("created_at", { ascending: false });

  const totalExpenses =
    (transactions as any[])?.reduce((sum, tx) => sum + Number(tx.amount), 0) ||
    0;

  return {
    transactions: transactions || [],
    totalExpenses,
  };
}
