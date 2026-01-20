"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getWalletData() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch shop details - making bank fields optional in case columns are not created yet
  let { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, bank_name, bank_account")
    .eq("owner_id", user.id)
    .single();

  // If select with bank fields fails, try just getting the ID
  if (shopError) {
    console.error("Shop query error:", shopError.message);
    const { data: basicShop, error: basicShopError } = await supabase
      .from("shops")
      .select("id")
      .eq("owner_id", user.id)
      .single();

    if (basicShopError) {
      console.error("Basic shop query error:", basicShopError.message);
      return null;
    }
    shop = basicShop as any;
  }

  if (!shop) return null;

  let { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("*")
    .eq("shop_id", (shop as any).id)
    .maybeSingle();

  if (walletError) {
    console.error("Wallet query error:", walletError.message);
  }

  // Auto-create wallet if missing (defense against manual DB deletes or partial setup)
  if (!wallet) {
    const { data: newWallet, error: createError } = await (
      supabase.from("wallets") as any
    )
      .insert({ shop_id: (shop as any).id })
      .select()
      .single();

    if (createError) {
      console.error("Wallet creation error:", createError.message);
      // If insertion fails (likely RLS), we still return shop info but null wallet
      return {
        wallet: null,
        transactions: [],
        shop: shop as any,
      };
    }
    wallet = newWallet;
  }

  const { data: transactions } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", (wallet as any).id)
    .order("created_at", { ascending: false });

  return {
    wallet,
    transactions: transactions || [],
    shop: shop as any,
  };
}

export async function requestWithdrawal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const bankName = formData.get("bankName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const amount = Number(formData.get("amount"));

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return { error: "Shop not found" };

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("shop_id", (shop as any).id)
    .single();

  if (!wallet || (wallet as any).balance < amount) {
    return { error: "Saldo tidak mencukupi" };
  }

  // Logic for withdrawal would go here (e.g., creating a transaction record with 'pending' status)
  // For now, we'll just record it as a transaction
  const { error } = await supabase.from("wallet_transactions").insert({
    wallet_id: (wallet as any).id,
    type: "withdrawal",
    amount: amount,
    status: "pending",
    reference_id: `WD-${Date.now()}`,
    description: `Penarikan ke ${bankName} (${accountNumber})`,
  } as any);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/wallet");
  return { success: true };
}

export async function syncWalletBalance() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // 1. Get Shop
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (shopError || !shop)
    return { error: "Shop not found: " + (shopError?.message || "Empty") };

  // 2. Get/Create Wallet
  let { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("id, balance")
    .eq("shop_id", (shop as any).id)
    .maybeSingle();

  if (!wallet) {
    const { data: newWallet, error: createError } = await (
      supabase.from("wallets") as any
    )
      .insert({ shop_id: (shop as any).id, balance: 0 })
      .select()
      .single();
    if (createError)
      return { error: "Failed to create wallet: " + createError.message };
    wallet = newWallet as any;
  }

  // 3. Calculate Income from VALID Gateway Orders ONLY (Cash is physical)
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("total_amount, platform_fee, status")
    .eq("shop_id", (shop as any).id)
    .eq("payment_method", "gateway")
    .in("status", ["completed", "paid", "ready", "processing", "accepted"]);

  if (ordersError)
    return { error: "Failed to fetch orders: " + ordersError.message };

  const totalIncome = ((orders as any[]) || []).reduce((sum, o) => {
    const amt = Number(o.total_amount || 0);
    const fee = Number(o.platform_fee || 0);
    return sum + (amt - fee);
  }, 0);

  // 4. Calculate Expenses from SUCCESSFUL Withdrawals
  const { data: withdrawals, error: wdError } = await supabase
    .from("wallet_transactions")
    .select("amount")
    .eq("wallet_id", (wallet as any).id)
    .eq("type", "withdrawal")
    .eq("status", "completed");

  const totalOut = ((withdrawals as any[]) || []).reduce(
    (sum, w) => sum + Number(w.amount || 0),
    0,
  );

  const finalBalance = Math.max(0, totalIncome - totalOut);

  // 5. Hard Update Balance in DB (Use Service Role to bypass RLS for balance update)
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error: updateError } = await (adminSupabase.from("wallets") as any)
    .update({
      balance: finalBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", (wallet as any).id);

  if (updateError)
    return { error: "Database update failed: " + updateError.message };

  console.log(
    `[SYNC SUCCESS] Shop: ${(shop as any).id} | Income: ${totalIncome} | Out: ${totalOut} | Final: ${finalBalance}`,
  );

  revalidatePath("/dashboard/wallet");
  revalidatePath("/dashboard");
  return { success: true, balance: finalBalance };
}
