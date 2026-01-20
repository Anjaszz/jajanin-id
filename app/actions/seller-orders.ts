"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Database } from "@/types/database.types";

export async function getSellerOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return [];

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        products (name)
      )
    `,
    )
    .eq("shop_id", (shop as any).id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  return data as any[];
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();

  const { error } = await (supabase.from("orders") as any)
    .update({ status: status as any })
    .eq("id", orderId);

  if (error) return { error: error.message };

  // AUTOMATION: If order completed, sync the wallet balance automatically
  if (status === "completed") {
    try {
      const { syncWalletBalance } = await import("./wallet");
      await syncWalletBalance();
    } catch (syncErr) {
      console.error("Auto-sync wallet failed:", syncErr);
    }
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/wallet");
  revalidatePath("/dashboard");
  revalidatePath("/orders/[orderId]", "page");
  revalidatePath("/", "layout");
  return { success: true };
}
