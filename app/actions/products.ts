"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database.types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export async function getProducts(page = 1, limit = 10) {
  const supabase = await createClient();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_active", true)
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return { data: [], count: 0, error: error.message };
  }

  return { data, count, error: null };
}

export async function getProductBySlug(slug: string) {
  // Note: Currently we don't have a slug on products, only on shops.
  // We can fetch by ID or add slug to products.
  // For now, let's assume we fetch by ID for detail page.
  return null;
}

export async function getProductById(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      shops (
        name,
        slug,
        owner_id,
        avatar_url
      ),
      categories (
        name
      )
    `
    )
    .eq("id", id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data, error: null };
}
