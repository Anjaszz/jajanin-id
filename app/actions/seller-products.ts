"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { Database } from "@/types/database.types";

const ProductSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Harga tidak boleh negatif"),
  stock: z.coerce.number().int().min(0, "Stok tidak boleh negatif"),
  category_id: z.string().uuid("Kategori tidak valid").optional(),
});

export async function getSellerProducts(page = 1, limit = 10) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], count: 0 };

  // First get the shop ID
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return { data: [], count: 0 };

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, count, error } = await supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("shop_id", (shop as any).id)
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return { data: [], count: 0 };
  }

  return {
    data: data as Database["public"]["Tables"]["products"]["Row"][],
    count,
  };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    return { error: "Shop not found" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = formData.get("price");
  const stock = formData.get("stock");
  const category_id =
    formData.get("category_id") === "none"
      ? null
      : (formData.get("category_id") as string);
  const imageFiles = formData.getAll("image") as File[];

  const result = ProductSchema.safeParse({
    name,
    description,
    price,
    stock,
    category_id: category_id || undefined,
  });

  if (!result.success) {
    return { error: result.error.flatten().fieldErrors };
  }

  let imageUrls: string[] = [];

  // Handle Multiple Image Uploads (Max 5)
  const filesToUpload = imageFiles.filter((f) => f.size > 0).slice(0, 5);

  for (const file of filesToUpload) {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("products")
      .upload(filePath, file);

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("products").getPublicUrl(filePath);
      imageUrls.push(publicUrl);
    }
  }

  const productData: any = {
    shop_id: (shop as any).id,
    name: result.data.name,
    description: result.data.description || null,
    price: result.data.price,
    stock: result.data.stock,
    image_url: imageUrls[0] || null, // Primary image
    images: imageUrls, // All images array
    category_id: result.data.category_id || null,
    is_active: true,
  };

  const { error } = await supabase.from("products").insert(productData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/dashboard/products");
}
