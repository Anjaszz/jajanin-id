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

export async function getSellerProducts(page = 1, limit = 10, search = "") {
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

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("shop_id", (shop as any).id);

  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, count, error } = await query
    .range(from, to)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return { data: [], count: 0 };
  }

  return {
    data: data as any[],
    count,
  };
}

export async function getProduct(id: string) {
  // Basic UUID validation
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    console.error("Invalid UUID format for getProduct:", id);
    return null;
  }

  const supabase = await createClient();
  const { data: product, error } = await supabase
    .from("products")
    .select("*, product_variants(*), product_addons(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error(
      "Supabase Error in getProduct:",
      error.message,
      error.details,
    );
    return null;
  }

  return product as any;
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
    .select("id, is_active")
    .eq("owner_id", user.id)
    .single();

  if (!shop) {
    return { error: "Shop not found" };
  }

  if ((shop as any).is_active === false) {
    return {
      error:
        "Akun Anda sedang dinonaktifkan. Anda tidak dapat menambah produk.",
    };
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
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const filesToUpload = imageFiles.filter((f) => f.size > 0).slice(0, 5);

  for (const file of filesToUpload) {
    if (file.size > MAX_FILE_SIZE) {
      return { error: `File ${file.name} terlalu besar. Maksimal 5MB.` };
    }
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

  const { data: newProduct, error } = await supabase
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  const newProductData = newProduct as any;

  // Handle Variants
  const variantsJson = formData.get("variants") as string;
  if (variantsJson) {
    try {
      const variants = JSON.parse(variantsJson);
      if (Array.isArray(variants) && variants.length > 0) {
        const variantsData = variants.map((v) => ({
          product_id: newProductData.id,
          name: v.name,
          price_override: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock) || 0,
        }));

        const { error: variantError } = await supabase
          .from("product_variants")
          .insert(variantsData as any);

        if (variantError) {
          console.error("Gagal simpan varian:", variantError);
        }
      }
    } catch (e) {
      console.error("Gagal parse varian:", e);
    }
  }

  // Handle Addons
  const addonsJson = formData.get("addons") as string;
  if (addonsJson) {
    try {
      const addons = JSON.parse(addonsJson);
      if (Array.isArray(addons) && addons.length > 0) {
        const addonsData = addons.map((a) => ({
          product_id: newProductData.id,
          name: a.name,
          price: parseFloat(a.price) || 0,
        }));

        await supabase.from("product_addons").insert(addonsData as any);
      }
    } catch (e) {
      console.error("Gagal parse addon:", e);
    }
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: shop } = await supabase
    .from("shops")
    .select("is_active")
    .eq("owner_id", user.id)
    .single();

  if (shop && (shop as any).is_active === false) {
    return { error: "Akun dinonaktifkan. Tidak dapat menghapus produk." };
  }

  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }
  revalidatePath("/dashboard/products");
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: shop } = await supabase
    .from("shops")
    .select("is_active")
    .eq("owner_id", user.id)
    .single();

  if (shop && (shop as any).is_active === false) {
    return {
      error:
        "Akun Anda sedang dinonaktifkan. Anda tidak dapat mengubah produk.",
    };
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
  const existingImagesJson = formData.get("existing_images") as string;
  let imageUrls: string[] = existingImagesJson
    ? JSON.parse(existingImagesJson)
    : [];

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

  // Handle New Image Uploads
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const filesToUpload = imageFiles.filter((f) => f.size > 0).slice(0, 5);
  for (const file of filesToUpload) {
    if (file.size > MAX_FILE_SIZE) {
      return { error: `File ${file.name} terlalu besar. Maksimal 5MB.` };
    }
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
    name: result.data.name,
    description: result.data.description || null,
    price: result.data.price,
    stock: result.data.stock,
    image_url: imageUrls[0] || null,
    images: imageUrls.slice(0, 5),
    category_id: result.data.category_id || null,
  };

  const { error } = await (supabase.from("products") as any)
    .update(productData)
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  // Handle Variants (Delete all and re-insert for simplicity in this MVP, or smart update)
  const variantsJson = formData.get("variants") as string;
  if (variantsJson) {
    try {
      // Delete existing variants first
      await supabase.from("product_variants").delete().eq("product_id", id);

      const variants = JSON.parse(variantsJson);
      if (Array.isArray(variants) && variants.length > 0) {
        const variantsData = variants.map((v: any) => ({
          product_id: id,
          name: v.name,
          price_override: v.price ? parseFloat(v.price) : null,
          stock: parseInt(v.stock) || 0,
        }));

        await supabase.from("product_variants").insert(variantsData as any);
      }
    } catch (e) {
      console.error("Gagal update varian:", e);
    }
  }

  // Handle Addons
  const addonsJson = formData.get("addons") as string;
  if (addonsJson) {
    try {
      await supabase.from("product_addons").delete().eq("product_id", id);
      const addons = JSON.parse(addonsJson);
      if (Array.isArray(addons) && addons.length > 0) {
        const addonsData = addons.map((a: any) => ({
          product_id: id,
          name: a.name,
          price: parseFloat(a.price) || 0,
        }));
        await supabase.from("product_addons").insert(addonsData as any);
      }
    } catch (e) {
      console.error("Gagal update addon:", e);
    }
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/products/edit/${id}`);
  redirect("/dashboard/products");
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await (supabase.from("products") as any)
    .update({ is_active: !currentStatus, admin_note: null })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/products");
  return { success: true };
}

export async function updateProductStock(id: string, newStock: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: shop } = await supabase
    .from("shops")
    .select("is_active")
    .eq("owner_id", user.id)
    .single();

  if (shop && (shop as any).is_active === false) {
    return {
      error: "Akun dinonaktifkan. Tidak dapat memperbarui stok.",
    };
  }

  const { error } = await (supabase.from("products") as any)
    .update({ stock: newStock })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/products");
  return { success: true };
}
