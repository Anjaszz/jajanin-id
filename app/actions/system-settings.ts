"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "./admin";

export async function getSystemSettings() {
  const supabase = await createClient();

  // We try to fetch from system_settings table.
  // If it doesn't exist, we return default hardcoded values.
  try {
    const { data, error } = await (supabase
      .from("system_settings")
      .select("*")
      .single() as any);

    if (error || !data) {
      return {
        platform_fee: 5,
        gateway_fee: 0.7,
        is_maintenance: false,
      };
    }

    return {
      platform_fee: data.platform_fee ?? 5,
      gateway_fee: data.gateway_fee ?? 0.7,
      is_maintenance: data.is_maintenance ?? false,
    };
  } catch (e) {
    return {
      platform_fee: 5,
      gateway_fee: 0.7,
      is_maintenance: false,
    };
  }
}

export async function updateSystemSettings(data: {
  platform_fee: number;
  gateway_fee: number;
}) {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const supabase = await createClient();

  // Use Service Role to ensure we can upsert settings
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await adminSupabase.from("system_settings").upsert(
    {
      id: 1, // We only ever have one row of settings
      platform_fee: data.platform_fee,
      gateway_fee: data.gateway_fee,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("Update system settings error:", error.message);
    return {
      error:
        "Gagal menyimpan pengaturan. Pastikan tabel 'system_settings' sudah dibuat di database.",
    };
  }

  revalidatePath("/admin/settings");
  return { success: true };
}
