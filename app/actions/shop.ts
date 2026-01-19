"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Database } from "@/types/database.types";

// Schema validation for creating a shop
const CreateShopSchema = z.object({
  name: z.string().min(3, { message: "Nama toko minimal 3 karakter" }),
  slug: z
    .string()
    .min(3, "Slug minimal 3 karakter")
    .regex(/^[a-z0-9-]+$/, "Slug hanya boleh huruf kecil, angka, dan strip"),
  description: z.string().optional(),
  address: z.string().min(5, "Alamat minimal 5 karakter"),
  google_maps_link: z
    .string()
    .url("Link Google Maps harus berupa URL valid")
    .optional()
    .or(z.literal("")),
  whatsapp: z.string().min(10, "Nomor WhatsApp minimal 10 digit"),
});

export async function getShop(): Promise<
  Database["public"]["Tables"]["shops"]["Row"] | null
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: shop, error } = await supabase
    .from("shops")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (error) {
    return null;
  }

  return shop;
}

export async function createShop(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    address: formData.get("address") as string,
    google_maps_link: formData.get("google_maps_link") as string,
    whatsapp: formData.get("whatsapp") as string,
  };

  const logoFile = formData.get("logo") as File | null;
  const coverFile = formData.get("cover_image") as File | null;

  if (!logoFile || logoFile.size === 0) {
    return { error: "Logo toko wajib diupload" };
  }

  const result = CreateShopSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  // Upload Logo
  const logoPath = `shops/${result.data.slug}/logo-${Date.now()}`;
  const { error: logoUploadError } = await supabase.storage
    .from("products")
    .upload(logoPath, logoFile);

  if (logoUploadError) {
    return { error: `Gagal upload logo: ${logoUploadError.message}` };
  }

  const {
    data: { publicUrl: logoUrl },
  } = supabase.storage.from("products").getPublicUrl(logoPath);

  // Upload Cover (Optional)
  let coverUrl = null;
  if (coverFile && coverFile.size > 0) {
    const coverPath = `shops/${result.data.slug}/cover-${Date.now()}`;
    const { error: coverUploadError } = await supabase.storage
      .from("products")
      .upload(coverPath, coverFile);

    if (coverUploadError) {
      // Optional, so maybe just log or ignore? safer to return error.
      return { error: `Gagal upload cover: ${coverUploadError.message}` };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(coverPath);
    coverUrl = publicUrl;
  }

  const shopData: any = {
    owner_id: user.id,
    name: result.data.name,
    slug: result.data.slug,
    description: result.data.description || null,
    address: result.data.address,
    google_maps_link: result.data.google_maps_link || null,
    whatsapp: result.data.whatsapp,
    logo_url: logoUrl,
    cover_url: coverUrl,
  };

  const { data, error } = await supabase
    .from("shops")
    .insert(shopData as any)
    .select()
    .single();

  if (error) {
    // Check for duplicate slug error (Postgres error code 23505)
    if (error.code === "23505") {
      return { error: "Link toko (slug) sudah digunakan. Pilih yang lain." };
    }
    return { error: error.message };
  }

  // Create initial wallet for the shop
  await (supabase.from("wallets") as any).insert({ shop_id: (data as any).id });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
