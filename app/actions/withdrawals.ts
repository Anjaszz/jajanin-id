"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function requestWithdrawal(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const amount = Number(formData.get("amount"));
  const bankName = formData.get("bankName") as string;
  const accountNumber = formData.get("accountNumber") as string;
  const accountHolder = formData.get("accountHolder") as string;

  if (amount < 50000) {
    return { error: "Minimal penarikan adalah Rp 50.000" };
  }

  // Get Shop & Wallet
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return { error: "Toko tidak ditemukan" };

  const { data: wallet } = await supabase
    .from("wallets")
    .select("id, balance")
    .eq("shop_id", (shop as any).id)
    .single();

  if (!wallet || Number((wallet as any).balance) < amount) {
    return { error: "Saldo tidak mencukupi" };
  }

  // Start Transaction (using a workaround since Supabase JS doesn't have native multi-table transactions easily without RPC)
  // For MVP, we'll just insert withdrawal and standard wallet deduction logic

  // 1. Insert Withdrawal Record
  const { data: withdrawal, error: withdrawError } = await (
    supabase.from("withdrawals") as any
  )
    .insert({
      wallet_id: (wallet as any).id,
      amount,
      bank_name: bankName,
      account_number: accountNumber,
      account_holder: accountHolder,
      status: "pending",
    })
    .select()
    .single();

  if (withdrawError) return { error: withdrawError.message };

  // 2. Deduct Balance
  const { error: updateError } = await (supabase.from("wallets") as any)
    .update({ balance: Number((wallet as any).balance) - amount })
    .eq("id", (wallet as any).id);

  if (updateError) return { error: updateError.message };

  // 3. Insert Wallet Transaction
  await (supabase.from("wallet_transactions") as any).insert({
    wallet_id: (wallet as any).id,
    amount: -amount,
    type: "withdrawal",
    description: `Penarikan dana ke ${bankName} (${accountNumber})`,
    reference_id: (withdrawal as any).id,
  });

  revalidatePath("/dashboard/wallet");
  return { success: true };
}
