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
    .select("id, bank_name, bank_account, bank_holder_name")
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

  // Use Admin Client to bypass RLS for transaction history to ensure reliability
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Get base transactions (deposits, income, etc.)
  const { data: transactions, error: txError } = await adminSupabase
    .from("wallet_transactions")
    .select("*")
    .eq("wallet_id", (wallet as any).id)
    .order("created_at", { ascending: false });

  if (txError) {
    console.error("Fetch transactions error:", txError.message);
  }

  // 2. Get withdrawals status to merge with transactions list
  const { data: withdrawals } = await adminSupabase
    .from("withdrawals")
    .select("id, status, bank_name, account_number")
    .eq("wallet_id", (wallet as any).id);

  // Merge status into transactions
  const mergedTransactions = (transactions || []).map((tx) => {
    if (tx.type === "withdrawal") {
      const wd = withdrawals?.find((w) => w.id === tx.reference_id);
      let status = wd?.status || "completed";
      if (status === "approved") status = "completed";
      if (status === "rejected") status = "failed";

      return {
        ...tx,
        status,
        amount: Math.abs(tx.amount), // For UI we use absolute amount
      };
    }
    return { ...tx, status: "completed" };
  });

  return {
    wallet,
    transactions: mergedTransactions,
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
  const bankHolderName = formData.get("bankHolderName") as string;
  const amount = Number(formData.get("amount"));

  if (amount < 20000) {
    return { error: "Minimal penarikan adalah Rp 20.000" };
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id, is_active")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return { error: "Shop not found" };
  if ((shop as any).is_active === false) {
    return {
      error:
        "Akun Anda sedang dinonaktifkan. Silakan hubungi CS untuk informasi lebih lanjut.",
    };
  }

  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("shop_id", (shop as any).id)
    .single();

  if (!wallet || (wallet as any).balance < amount) {
    return { error: "Saldo tidak mencukupi" };
  }

  // 1. Use Admin Client to update balance (RLS might block direct update)
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 2. Start Withdrawal Process
  // First, deduct the balance
  const newBalance = Number((wallet as any).balance) - amount;
  const { error: balanceError } = await (adminSupabase.from("wallets") as any)
    .update({ balance: newBalance })
    .eq("id", (wallet as any).id);

  if (balanceError)
    return { error: "Gagal memproses saldo: " + balanceError.message };

  // 3. Create record in 'withdrawals' table for Admin
  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const { data: withdrawal, error: withdrawalError } = await adminSupabase
    .from("withdrawals")
    .insert({
      wallet_id: (wallet as any).id,
      amount: amount,
      status: "pending",
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: bankHolderName || "Unknown",
    } as any)
    .select()
    .single();

  if (withdrawalError) {
    // Rollback balance if possible (though in a real app you'd use a DB transaction/RPC)
    await (adminSupabase.from("wallets") as any)
      .update({ balance: Number((wallet as any).balance) })
      .eq("id", (wallet as any).id);
    return { error: "Gagal membuat pengajuan: " + withdrawalError.message };
  }

  // 4. Create record in 'wallet_transactions' for Seller history
  // Using negative amount to follow project convention for withdrawals
  const { error: txError } = await adminSupabase
    .from("wallet_transactions")
    .insert({
      wallet_id: (wallet as any).id,
      type: "withdrawal",
      amount: -amount,
      reference_id: (withdrawal as any).id,
      description: `Penarikan ke ${bankName} (${accountNumber})`,
    } as any);

  if (txError) {
    console.error("Wallet transaction error:", txError.message);
    // Even if this fails, we don't necessarily want to rollback the withdrawal record
    // because that's for admin, but we should know about it.
  }

  revalidatePath("/dashboard/wallet");
  revalidatePath("/admin/withdrawals");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function syncWalletBalance() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Initialize Admin Client to bypass RLS for critical sync calculations
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

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

  // 4. Calculate Expenses (Negative amounts in wallet_transactions)
  // We sum up everything in wallet_transactions that is a withdrawal or platform_fee
  // These should be negative values in the database
  const { data: txOut, error: wdError } = await adminSupabase
    .from("wallet_transactions")
    .select("amount")
    .eq("wallet_id", (wallet as any).id)
    .in("type", ["withdrawal", "platform_fee"]);

  const totalOut = ((txOut as any[]) || []).reduce(
    (sum, w) => sum + Math.abs(Number(w.amount || 0)),
    0,
  );

  const finalBalance = Math.max(0, totalIncome - totalOut);

  // 5. Hard Update Balance in DB (Use Service Role to bypass RLS for balance update)
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
