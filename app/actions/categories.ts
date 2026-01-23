"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Database } from "@/types/database.types";
import { isAdmin } from "./admin";

const CategorySchema = z.object({
  name: z.string().min(2, "Nama kategori minimal 2 karakter"),
});

/**
 * Helper to get a Supabase client with Service Role (to bypass RLS for Admin actions)
 */
async function getAdminClient() {
  const { createClient: createSupabaseClient } =
    await import("@supabase/supabase-js");
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

/**
 * Get all categories (Global categories for Admin)
 */
export async function getAllCategoriesAdmin() {
  const supabase = await createClient();
  if (!(await isAdmin())) return [];

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !categories) {
    console.error(error);
    return [];
  }

  return categories;
}

/**
 * Get all categories (Global categories for Sellers/Public)
 */
export async function getCategories() {
  const supabase = await createClient();

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

/**
 * Create a global category
 */
export async function createCategory(formData: FormData) {
  if (!(await isAdmin()))
    return { error: "Unauthorized. Hanya Admin yang bisa menambah kategori." };

  const name = formData.get("name") as string;
  const result = CategorySchema.safeParse({ name });

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  const adminSupabase = await getAdminClient();

  // Use admin client to bypass RLS
  const { error } = await (adminSupabase.from("categories") as any).insert({
    name: result.data.name,
  });

  if (error) {
    console.error("Create Category Error:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/categories");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, name: string) {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const adminSupabase = await getAdminClient();

  const { error } = await (adminSupabase
    .from("categories")
    .update({ name })
    .eq("id", id) as any);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/categories");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const adminSupabase = await getAdminClient();

  const { error } = await adminSupabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/categories");
  revalidatePath("/admin/categories");
  return { success: true };
}

export async function seedCategories() {
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const adminSupabase = await getAdminClient();

  const defaultCategories = [
    "Makanan",
    "Minuman",
    "Camilan",
    "Favorit",
    "Peralatan",
    "Lainnya",
  ];
  const { error } = await (adminSupabase.from("categories") as any).insert(
    defaultCategories.map((name) => ({ name })),
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard/categories");
  revalidatePath("/admin/categories");
  return { success: true };
}
