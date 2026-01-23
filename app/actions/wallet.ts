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
    .select("id, status, bank_name, account_number, account_holder, admin_note")
    .eq("wallet_id", (wallet as any).id);

  // Merge status into transactions
  const mergedTransactions = (transactions || []).map((tx) => {
    if (tx.type === "withdrawal") {
      const wd = withdrawals?.find((w) => w.id === tx.reference_id);
      let status = wd?.status || "completed";
      if (status === "approved") status = "completed";
      if (status === "rejected") status = "rejected";

      return {
        ...tx,
        status,
        withdrawal_details: wd,
        amount: tx.amount,
      };
    }

    // For refund, also try to find the linked withdrawal for context if possible
    if (
      tx.type === "refund" &&
      tx.description?.includes("penarikan dana ditolak")
    ) {
      return { ...tx, status: "completed" };
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

  // 3. Calculate Income from VALID Gateway Orders ONLY
  const { data: orders, error: ordersError } = await adminSupabase
    .from("orders")
    .select("total_amount, platform_fee, status")
    .eq("shop_id", (shop as any).id)
    .eq("payment_method", "gateway")
    .eq("status", "completed");

  if (ordersError)
    return { error: "Failed to fetch orders: " + ordersError.message };

  const gatewayIncome = ((orders as any[]) || []).reduce((sum, o) => {
    const amt = Number(o.total_amount || 0);
    const fee = Number(o.platform_fee || 0);
    return sum + (amt - fee);
  }, 0);

  // 3b. Sum up ALL internal transactions (POS Cash, Withdrawals, Refunds, Deposits)
  const { data: internalTxs } = await adminSupabase
    .from("wallet_transactions")
    .select("amount")
    .eq("wallet_id", (wallet as any).id);

  const internalTotal = (internalTxs || []).reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0,
  );

  const finalBalance = Math.max(0, gatewayIncome + internalTotal);

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
    `[SYNC SUCCESS] Shop: ${(shop as any).id} | Gateway: ${gatewayIncome} | Internal: ${internalTotal} | Final: ${finalBalance}`,
  );

  revalidatePath("/dashboard/wallet");
  revalidatePath("/dashboard");
  return { success: true, balance: finalBalance };
}

export async function getBuyerWallet(userId: string) {
  const supabase = await createClient();
  let { data: wallet } = await (supabase.from("wallets") as any)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!wallet) {
    // Check if we need to create one using ADMIN privileges to bypass potentially missing RLS for "insert own wallet"
    const { createClient: createAdminClient } =
      await import("@supabase/supabase-js");
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { data: newWallet, error } = await (
      adminSupabase.from("wallets") as any
    )
      .insert({ user_id: userId, balance: 0 })
      .select()
      .single();

    if (error) {
      console.error("Failed to create buyer wallet", error);
      // Return a dummy empty wallet to prevent UI crash, but with 0 balance
      return { balance: 0, id: null };
    }
    wallet = newWallet;
  }
  return wallet;
}

export async function processRefundToBuyer(
  userId: string,
  amount: number,
  orderId: string,
) {
  // Use Admin Client
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let { data: wallet } = await (adminSupabase.from("wallets") as any)
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (!wallet) {
    const { data: newWallet, error } = await (
      adminSupabase.from("wallets") as any
    )
      .insert({ user_id: userId, balance: 0 })
      .select()
      .single();
    if (error || !newWallet) return { error: "Failed to init wallet" };
    wallet = newWallet;
  }

  // Update Balance
  const { error: updateError } = await (adminSupabase.from("wallets") as any)
    .update({ balance: (wallet.balance || 0) + amount })
    .eq("id", wallet.id);

  if (updateError) return { error: updateError.message };

  // Log Transaction
  await (adminSupabase.from("wallet_transactions") as any).insert({
    wallet_id: wallet.id,
    amount: amount,
    type: "refund", // Ensure this type exists in DB enum or text
    description: `Pengembalian dana (Refund) pesanan #${orderId.slice(0, 8)}`,
    reference_id: orderId,
  });

  return { success: true };
}

export async function processGuestRefund(
  email: string,
  amount: number,
  orderId: string,
) {
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Check if record exists
  const { data: existing } = await adminSupabase
    .from("guest_balances")
    .select("balance")
    .eq("email", email)
    .maybeSingle();

  if (existing) {
    // 2. Update existing
    await (adminSupabase.from("guest_balances") as any)
      .update({ balance: Number(existing.balance) + amount })
      .eq("email", email);
  } else {
    // 3. Create new
    await (adminSupabase.from("guest_balances") as any).insert({
      email,
      balance: amount,
    });
  }

  return { success: true };
}

export async function processPaymentFromBuyer(
  userId: string,
  amount: number,
  orderId: string,
) {
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  let { data: wallet } = await (adminSupabase.from("wallets") as any)
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!wallet || (wallet.balance || 0) < amount) {
    return { success: false, error: "Saldo tidak mencukupi" };
  }

  // Deduct
  const { error: updateError } = await (adminSupabase.from("wallets") as any)
    .update({ balance: wallet.balance - amount })
    .eq("id", wallet.id);

  if (updateError) return { success: false, error: updateError.message };

  // Log
  await (adminSupabase.from("wallet_transactions") as any).insert({
    wallet_id: wallet.id,
    amount: -amount,
    type: "payment",
    description: `Pembayaran pesanan #${orderId.slice(0, 8)}`,
    reference_id: orderId,
  });

  return { success: true };
}

export async function getWalletTransactions(userId: string) {
  const supabase = await createClient();
  const { data: wallet } = await (supabase.from("wallets") as any)
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!wallet) return [];

  // Use Admin Client to ensure we can read transactions reliably
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: transactions } = await (
    adminSupabase.from("wallet_transactions") as any
  )
    .select("*")
    .eq("wallet_id", wallet.id)
    .order("created_at", { ascending: false });

  return transactions || [];
}

export async function requestBuyerWithdrawal(formData: FormData) {
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

  // Use Admin Client for wallet ops
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: wallet } = await (adminSupabase.from("wallets") as any)
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!wallet || (wallet as any).balance < amount) {
    return { error: "Saldo tidak mencukupi" };
  }

  // 1. Deduct Balance
  const newBalance = Number((wallet as any).balance) - amount;
  const { error: balanceError } = await (adminSupabase.from("wallets") as any)
    .update({ balance: newBalance })
    .eq("id", (wallet as any).id);

  if (balanceError)
    return { error: "Gagal memproses saldo: " + balanceError.message };

  // 2. Create Withdrawal Record
  const { data: withdrawal, error: withdrawalError } = await (
    adminSupabase.from("withdrawals") as any
  )
    .insert({
      wallet_id: (wallet as any).id,
      amount: amount,
      status: "pending",
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: bankHolderName || "Unknown",
    })
    .select()
    .single();

  if (withdrawalError) {
    // Rollback
    await (adminSupabase.from("wallets") as any)
      .update({ balance: Number((wallet as any).balance) })
      .eq("id", (wallet as any).id);
    return { error: "Gagal membuat pengajuan: " + withdrawalError.message };
  }

  // 3. Log Transaction
  await (adminSupabase.from("wallet_transactions") as any).insert({
    wallet_id: (wallet as any).id,
    type: "withdrawal",
    amount: -amount,
    reference_id: (withdrawal as any).id,
    description: `Penarikan ke ${bankName} (${accountNumber})`,
  });

  revalidatePath("/buyer/profile");
  return { success: true };
}
