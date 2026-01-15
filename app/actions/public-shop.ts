"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/types/database.types";

export async function getAllShops() {
  const supabase = await createClient();
  const { data: shops, error } = await supabase
    .from("shops")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }
  return shops as Database["public"]["Tables"]["shops"]["Row"][];
}

export async function getShopBySlug(slug: string) {
  const supabase = await createClient();

  const { data: shop, error } = await supabase
    .from("shops")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return shop as Database["public"]["Tables"]["shops"]["Row"];
}

export async function getShopProductsByCategory(shopId: string) {
  const supabase = await createClient();

  // Fetch ALL global categories
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  // Fetch all products for this shop
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shopId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (!products) return [];

  const categoriesWithProducts = [
    ...(categories || []).map((cat) => ({
      ...(cat as any),
      products: products.filter(
        (p) => (p as any).category_id === (cat as any).id
      ),
    })),
  ];

  const uncategorized = products.filter((p) => !(p as any).category_id);
  if (uncategorized.length > 0) {
    const lainnyaCat = categoriesWithProducts.find((c) => c.name === "Lainnya");
    if (lainnyaCat) {
      lainnyaCat.products = [...lainnyaCat.products, ...uncategorized];
    } else {
      categoriesWithProducts.push({
        id: "uncategorized",
        name: "Lainnya",
        products: uncategorized,
      } as any);
    }
  }

  return categoriesWithProducts.filter((cat) => cat.products.length > 0);
}

export async function getProductsByIds(ids: string[]) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("id", ids);

  if (error) {
    console.error(error);
    return [];
  }
  return data as Database["public"]["Tables"]["products"]["Row"][];
}
