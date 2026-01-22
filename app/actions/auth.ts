"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { LoginSchema, SignupSchema } from "@/types/auth-schema";
import { headers } from "next/headers";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    let errorMessage = error.message;
    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Email atau password salah. Silakan periksa kembali.";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "Email belum diverifikasi. Silakan cek inbox Anda.";
    } else if (error.message.includes("Rate limit")) {
      errorMessage = "Terlalu banyak mencoba. Silakan tunggu sebentar.";
    }
    return { error: errorMessage };
  }

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = (profile as any)?.role;

    revalidatePath("/", "layout");

    if (role === "seller") {
      redirect("/dashboard");
    } else if (role === "admin") {
      redirect("/admin");
    } else {
      // Buyer or default
      redirect("/");
    }
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const whatsapp = formData.get("whatsapp") as string;
  const role = (formData.get("role") as string) || "buyer"; // Default role for testing

  const origin = (await headers()).get("origin");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback?next=/verify_success`,
      data: {
        name,
        phone: whatsapp,
        role,
      },
    },
  });

  if (error) {
    let errorMessage = error.message;
    if (error.message.includes("User already registered")) {
      errorMessage = "Email ini sudah terdaftar. Silakan gunakan email lain.";
    } else if (
      error.message.includes("Password should be at least 6 characters")
    ) {
      errorMessage = "Kata sandi harus minimal 6 karakter.";
    }
    return { error: errorMessage };
  }

  revalidatePath("/", "layout");
  redirect(`/verify_email?role=${role}`);
}

export async function signout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutSeller() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/seller/login");
}

export async function signOutBuyer() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/buyer/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return profile;
}
