"use server";

import { createClient } from "@/utils/supabase/server";

export async function getBuyerOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("orders")
    .select(
      `
      *,
      shop:shops(name, slug),
      items:order_items(*)
    `,
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getBuyerProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data as any;
}

export async function updateBuyerProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;

  const { error } = await (supabase.from("profiles") as any)
    .update({ name, phone, address })
    .eq("id", user.id);

  if (error) return { error: error.message };

  return { success: true };
}
