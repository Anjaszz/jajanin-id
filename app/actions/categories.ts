"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Database } from "@/types/database.types";

const CategorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
});

export async function getCategories() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data as Database["public"]["Tables"]["categories"]["Row"][];
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return { error: "Shop not found" };

  const name = formData.get("name") as string;
  const result = CategorySchema.safeParse({ name });

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const { error } = await supabase.from("categories").insert({
    shop_id: (shop as any).id,
    name: result.data.name,
  } as any);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/categories");
  return { success: true };
}

export async function seedCategories() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return { error: "Shop not found" };

  const defaultCategories = ["Makanan", "Minuman", "Camilan", "Favorit"];
  const { error } = await (supabase.from("categories") as any).insert(
    defaultCategories.map((name) => ({ shop_id: (shop as any).id, name }))
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard/categories");
  return { success: true };
}
