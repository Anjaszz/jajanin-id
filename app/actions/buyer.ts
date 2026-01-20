"use server";

import { createClient } from "@/utils/supabase/server";

export async function getBuyerOrders(orderIds?: string[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("orders").select(
    `
      *,
      shop:shops(name, slug),
      items:order_items(*)
    `,
  );

  if (user) {
    query = query.eq("buyer_id", user.id);
  } else if (orderIds && orderIds.length > 0) {
    query = query.in("id", orderIds);
  } else {
    return [];
  }

  const { data } = await query.order("created_at", { ascending: false });

  if (data) {
    // AUTO-EXPIRATION: Cancel orders pending payment for more than 24h
    const now = new Date();
    const expiryTime = 24 * 60 * 60 * 1000;
    const expiredIds = (data as any[])
      .filter(
        (o) =>
          o.status === "pending_payment" &&
          now.getTime() - new Date(o.created_at).getTime() > expiryTime,
      )
      .map((o) => o.id);

    if (expiredIds.length > 0) {
      await (supabase.from("orders") as any)
        .update({ status: "cancelled_by_buyer" })
        .in("id", expiredIds);

      // Update local data to reflect cancellation
      (data as any[]).forEach((o) => {
        if (expiredIds.includes(o.id)) o.status = "cancelled_by_buyer";
      });
    }
  }

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
