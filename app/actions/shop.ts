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

  const result = CreateShopSchema.safeParse(rawData);

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const shopData: any = {
    owner_id: user.id,
    name: result.data.name,
    slug: result.data.slug,
    description: result.data.description || null,
    address: result.data.address,
    google_maps_link: result.data.google_maps_link || null,
    whatsapp: result.data.whatsapp,
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
