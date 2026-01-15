"use server";

import { createClient } from "@/utils/supabase/server";

export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile as any)?.role === "admin";
}

export async function getPendingWithdrawals() {
  const supabase = await createClient();
  if (!(await isAdmin())) return [];

  const { data } = await supabase
    .from("withdrawals")
    .select(
      `
      *,
      wallet:wallets(
        shop:shops(name)
      )
    `
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return data as any[];
}

export async function processWithdrawal(
  id: string,
  status: "approved" | "rejected",
  note?: string
) {
  const supabase = await createClient();
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const { error } = await (supabase.from("withdrawals") as any)
    .update({ status, admin_note: note })
    .eq("id", id);

  if (error) return { error: error.message };

  // If rejected, we should probably refund the wallet balance.
  if (status === "rejected") {
    const { data: withdrawal } = await supabase
      .from("withdrawals")
      .select("wallet_id, amount")
      .eq("id", id)
      .single();
    if (withdrawal) {
      const { data: wallet } = await (supabase.from("wallets") as any)
        .select("balance")
        .eq("id", (withdrawal as any).wallet_id)
        .single();
      if (wallet) {
        await (supabase.from("wallets") as any)
          .update({
            balance:
              Number((wallet as any).balance) +
              Number((withdrawal as any).amount),
          })
          .eq("id", (withdrawal as any).wallet_id);

        await (supabase.from("wallet_transactions") as any).insert({
          wallet_id: (withdrawal as any).wallet_id,
          amount: Number((withdrawal as any).amount),
          type: "refund",
          description: `Refund penarikan dana ditolak: ${note || "-"}`,
        } as any);
      }
    }
  }

  return { success: true };
}
