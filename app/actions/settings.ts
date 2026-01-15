"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateShopSettings(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const google_maps_link = formData.get("google_maps_link") as string;
  const bank_name = formData.get("bank_name") as string;
  const bank_account = formData.get("bank_account") as string;
  const logoFile = formData.get("logo") as File;
  const coverFile = formData.get("cover") as File;

  const { data: shop } = (await supabase
    .from("shops")
    .select("id, logo_url, cover_url")
    .eq("owner_id", user.id)
    .single()) as { data: any };

  if (!shop) return { error: "Shop not found" };

  let logoUrl = shop.logo_url;
  let coverUrl = shop.cover_url;

  // Handle Logo Upload
  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split(".").pop();
    const filePath = `${user.id}/logo_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, logoFile);
    if (!uploadError) {
      logoUrl = supabase.storage.from("products").getPublicUrl(filePath)
        .data.publicUrl;
    }
  }

  // Handle Cover Upload
  if (coverFile && coverFile.size > 0) {
    const fileExt = coverFile.name.split(".").pop();
    const filePath = `${user.id}/cover_${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, coverFile);
    if (!uploadError) {
      coverUrl = supabase.storage.from("products").getPublicUrl(filePath)
        .data.publicUrl;
    }
  }

  const { error } = await supabase
    .from("shops")
    .update({
      name,
      description,
      address,
      whatsapp,
      google_maps_link,
      bank_name,
      bank_account,
      logo_url: logoUrl,
      cover_url: coverUrl,
      updated_at: new Date().toISOString(),
    } as any)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { success: true };
}
