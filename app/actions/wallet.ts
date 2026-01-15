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
