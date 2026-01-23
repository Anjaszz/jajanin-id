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
  const role = (formData.get("role") as string) || "buyer";

  const origin = (await headers()).get("origin");

  // 1. Sign Up to Auth
  const { data: authData, error: signupError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/api/auth/callback?next=/verify_success`,
      data: { name, phone: whatsapp, role },
    },
  });

  if (signupError) {
    console.error("Signup Auth Error:", signupError);
    return { error: signupError.message };
  }

  const userId = authData.user?.id;
  if (userId) {
    // 2. Initialize Admin Client for Manual Data Creation (Bypass RLS)
    const { createClient: createAdminClient } =
      await import("@supabase/supabase-js");
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    try {
      // 3. Create Profile
      await adminSupabase.from("profiles").upsert({
        id: userId,
        email,
        name,
        phone: whatsapp,
        role: role as any,
      });

      // 4. If Buyer, Handle Wallet & Guest Balance
      if (role === "buyer") {
        // A. Check Guest Balance
        const { data: guestBal } = await adminSupabase
          .from("guest_balances")
          .select("balance")
          .eq("email", email)
          .maybeSingle();

        const initialBalance = Number(guestBal?.balance || 0);

        // B. Create Wallet
        const { data: wallet } = await adminSupabase
          .from("wallets")
          .insert({ user_id: userId, balance: initialBalance })
          .select()
          .single();

        // C. Record Transaction if migrated
        if (initialBalance > 0 && wallet) {
          await adminSupabase.from("wallet_transactions").insert({
            wallet_id: wallet.id,
            amount: initialBalance,
            type: "deposit",
            description: "Migrasi saldo pengembalian dana Guest",
          });

          // Delete shadow balance
          await adminSupabase
            .from("guest_balances")
            .delete()
            .eq("email", email);
        }
      }
    } catch (dbError) {
      console.error("Database initialization error during signup:", dbError);
      // We don't return error here because the Auth account is already created
    }
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
