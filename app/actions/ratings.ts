"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitRating(params: {
  order_id: string;
  shop_id: string;
  product_id?: string;
  rating: number;
  comment: string;
  type: "shop" | "product";
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await (supabase.from("ratings") as any).insert({
    order_id: params.order_id,
    buyer_id: user?.id || null,
    shop_id: params.shop_id,
    product_id: params.product_id || null,
    rating: params.rating,
    comment: params.comment,
    type: params.type,
  });

  if (error) {
    console.error("Error submitting rating:", error);
    throw new Error(error.message);
  }

  // Revalidate multiple paths
  revalidatePath(`/dashboard/ratings`);
  revalidatePath(`/[slug]`, "page");
  revalidatePath(`/orders/${params.order_id}`);
}

export async function getShopRating(shopId: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("ratings") as any)
    .select("rating")
    .eq("shop_id", shopId)
    .eq("type", "shop");

  if (error || !data || (data as any[]).length === 0)
    return { average: 0, count: 0 };

  const sum = (data as any[]).reduce(
    (acc: number, curr: any) => acc + (curr.rating || 0),
    0,
  );
  return {
    average: parseFloat((sum / (data as any[]).length).toFixed(1)),
    count: (data as any[]).length,
  };
}

export async function getProductRating(productId: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("ratings") as any)
    .select("rating")
    .eq("product_id", productId)
    .eq("type", "product");

  if (error || !data || (data as any[]).length === 0)
    return { average: 0, count: 0 };

  const sum = (data as any[]).reduce(
    (acc: number, curr: any) => acc + (curr.rating || 0),
    0,
  );
  return {
    average: parseFloat((sum / (data as any[]).length).toFixed(1)),
    count: (data as any[]).length,
  };
}

export async function checkIfRated(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("ratings") as any)
    .select("id")
    .eq("order_id", orderId)
    .limit(1);

  if (error) return false;
  return data && (data as any[]).length > 0;
}

export async function getOrderRatings(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase.from("ratings") as any)
    .select(
      `
      *,
      products (name)
    `,
    )
    .eq("order_id", orderId);

  if (error) {
    console.error("Error fetching order ratings:", error);
    return [];
  }

  return data as any[];
}

export async function getShopReviews(shopId: string) {
  const supabase = await createClient();

  const { data, error } = await (supabase.from("ratings") as any)
    .select(
      `
      *,
      orders (guest_info)
    `,
    )
    .eq("shop_id", shopId)
    .eq("type", "shop")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching shop reviews:", error);
    return [];
  }

  return data as any[];
}

export async function getProductReviews(productId: string) {
  const supabase = await createClient();

  const { data, error } = await (supabase.from("ratings") as any)
    .select(
      `
      *,
      orders (guest_info)
    `,
    )
    .eq("product_id", productId)
    .eq("type", "product")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching product reviews:", error);
    return [];
  }

  return data as any[];
}
