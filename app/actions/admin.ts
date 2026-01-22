"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return (profile as any)?.role === "admin";
}

export async function getPendingWithdrawals() {
  const supabase = await createClient();
  if (!(await isAdmin())) return [];

  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await adminSupabase
    .from("withdrawals")
    .select(
      `
      *,
      wallet:wallets(
        shop:shops(name)
      )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return data as any[];
}

export async function processWithdrawal(
  id: string,
  status: "approved" | "rejected",
  note?: string,
) {
  const supabase = await createClient();
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await (adminSupabase.from("withdrawals") as any)
    .update({ status, admin_note: note })
    .eq("id", id);

  if (error) return { error: error.message };

  // Fetch withdrawal details to find corresponding transaction
  const { data: withdrawal } = await adminSupabase
    .from("withdrawals")
    .select("wallet_id, amount")
    .eq("id", id)
    .single();

  if (withdrawal) {
    const walletId = (withdrawal as any).wallet_id;
    const amount = (withdrawal as any).amount;

    // If rejected, we refund the wallet balance.
    if (status === "rejected") {
      const { data: wallet } = await (adminSupabase.from("wallets") as any)
        .select("balance")
        .eq("id", walletId)
        .single();

      if (wallet) {
        await (adminSupabase.from("wallets") as any)
          .update({
            balance: Number((wallet as any).balance) + Number(amount),
          })
          .eq("id", walletId);

        await (adminSupabase.from("wallet_transactions") as any).insert({
          wallet_id: walletId,
          amount: Number(amount),
          type: "refund",
          description: `Refund penarikan dana ditolak: ${note || "-"}`,
          reference_id: id,
        } as any);
      }
    }
  }

  revalidatePath("/admin/withdrawals");
  revalidatePath("/dashboard/wallet");
  return { success: true };
}

export async function getAdminStats() {
  const supabase = await createClient();
  if (!(await isAdmin())) return null;

  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { count: shopCount } = await adminSupabase
    .from("shops")
    .select("*", { count: "exact", head: true });

  const { count: userCount } = await adminSupabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: orderCount } = await adminSupabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "completed");

  const { data: wallets } = await adminSupabase
    .from("wallets")
    .select("balance");

  const totalBalance =
    (wallets as any[])?.reduce((sum, w) => sum + Number(w.balance || 0), 0) ||
    0;

  const { count: pendingWithdrawals } = await adminSupabase
    .from("withdrawals")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending");

  const { count: productCount } = await adminSupabase
    .from("products")
    .select("*", { count: "exact", head: true });

  return {
    shopCount: shopCount || 0,
    userCount: userCount || 0,
    orderCount: orderCount || 0,
    productCount: productCount || 0,
    totalBalance,
    pendingWithdrawals: pendingWithdrawals || 0,
  };
}

export async function getAdminUsers() {
  const supabase = await createClient();
  if (!(await isAdmin())) return [];

  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await adminSupabase
    .from("profiles")
    .select(
      `
      *,
      shops(name)
    `,
    )
    .order("created_at", { ascending: false });

  return data as any[];
}

export async function updateUserRole(userId: string, role: string) {
  const supabase = await createClient();
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await (adminSupabase.from("profiles") as any)
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };
  return { success: true };
}

export async function getAllWithdrawals() {
  const supabase = await createClient();
  if (!(await isAdmin())) return [];

  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data } = await adminSupabase
    .from("withdrawals")
    .select(
      `
      *,
      wallet:wallets(
        shop:shops(name)
      )
    `,
    )
    .order("created_at", { ascending: false });

  return data as any[];
}

export async function getAdminUserDetail(userId: string) {
  const supabase = await createClient();
  if (!(await isAdmin())) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      *,
      shops(*)
    `,
    )
    .eq("id", userId)
    .single();

  if (!profile) return null;

  // Get recent orders as buyer
  const { data: orders } = await supabase
    .from("orders")
    .select("*, shops(name)")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    profile: profile as any,
    orders: orders || [],
  };
}

export async function updateAdminUserProfile(
  userId: string,
  data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    shop?: {
      id?: string;
      name?: string;
      address?: string;
      whatsapp?: string;
    };
  },
) {
  const supabase = await createClient();
  if (!(await isAdmin())) return { error: "Unauthorized" };

  // 1. Update Profile
  const { data: updateData, error: profileError } = await (
    supabase.from("profiles") as any
  )
    .update({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)
    .select();

  if (profileError) return { error: profileError.message };
  if (!updateData || updateData.length === 0) {
    return {
      error:
        "Gagal memperbarui profil: Data tidak ditemukan atau Anda tidak memiliki izin (RLS).",
    };
  }

  // 2. Update Shop if provided
  if (data.shop && data.shop.id) {
    const { data: shopUpdateData, error: shopError } = await (
      supabase.from("shops") as any
    )
      .update({
        name: data.shop.name,
        address: data.shop.address,
        whatsapp: data.shop.whatsapp,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.shop.id)
      .select();

    if (shopError)
      return {
        error: `Profil berhasil diupdate, tapi update toko gagal: ${shopError.message}`,
      };

    if (!shopUpdateData || shopUpdateData.length === 0) {
      return {
        error:
          "Profil berhasil, tapi GAGAL update Toko. Kemungkinan besar karena kebijakan keamanan (RLS) di tabel 'shops' belum Anda jalankan di SQL Editor Supabase.",
      };
    }
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/dashboard", "layout");

  return { success: true };
}

export async function deleteUser(userId: string) {
  const supabase = await createClient();
  if (!(await isAdmin())) return { error: "Unauthorized" };

  // Use Service Role to permanently delete user from auth.users
  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { error } = await adminSupabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error("Auth delete error:", error.message);
    // Fallback: try deleting from profile table at least
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId);
    if (profileError) return { error: `Gagal menghapus: ${error.message}` };
  }

  revalidatePath("/admin/users");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function toggleShopStatus(shopId: string, isActive: boolean) {
  const supabase = await createClient();
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const { error } = await (supabase.from("shops") as any)
    .update({ is_active: isActive })
    .eq("id", shopId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function deleteShop(shopId: string) {
  const supabase = await createClient();
  if (!(await isAdmin())) return { error: "Unauthorized" };

  const { error } = await supabase.from("shops").delete().eq("id", shopId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

export async function getAdminGlobalBalance() {
  const supabase = await createClient();
  if (!(await isAdmin())) return 0;

  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const { data: wallets } = await adminSupabase
    .from("wallets")
    .select("balance");

  const totalBalance =
    (wallets as any[])?.reduce((sum, w) => sum + Number(w.balance || 0), 0) ||
    0;

  return totalBalance;
}

export async function getAdminGlobalTransactions() {
  const supabase = await createClient();
  if (!(await isAdmin())) return [];

  const { createClient: createAdminClient } =
    await import("@supabase/supabase-js");
  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // 1. Get Wallet Transactions
  const { data: walletTxs, error: txError } = await adminSupabase
    .from("wallet_transactions")
    .select(
      `
      *,
      wallet:wallets(
        shop:shops(id, name)
      )
    `,
    );

  if (txError) {
    console.error("Fetch global transactions error:", txError.message);
    return [];
  }

  // 2. Get Withdrawals to merge status
  const { data: withdrawals } = await adminSupabase
    .from("withdrawals")
    .select("id, status, admin_note");

  // 3. Get Gateway Orders (Digital Income)
  const { data: orders } = await adminSupabase
    .from("orders")
    .select(
      "id, total_amount, platform_fee, created_at, status, shop:shops(id, name)",
    )
    .eq("payment_method", "gateway")
    .eq("status", "completed");

  // 4. Transform Transactions
  const processedWalletTxs = (walletTxs || [])
    .filter((tx) => tx.type !== "refund")
    .map((tx) => {
      let status = "completed";
      let admin_note = null;

      if (tx.type === "withdrawal") {
        const wd = withdrawals?.find((w) => w.id === tx.reference_id);
        status = wd?.status || "completed";
        admin_note = wd?.admin_note;
      }

      return {
        ...tx,
        status,
        admin_note,
        source: "wallet_transaction",
      };
    });

  const digitalOrderTxs = (orders || []).map((order) => ({
    id: `order-${order.id}`,
    wallet_id: null,
    amount: Number(order.total_amount) - Number(order.platform_fee || 0),
    type: "income",
    description: `Pesanan Digital #${order.id.slice(0, 8)}`,
    created_at: order.created_at,
    reference_id: order.id,
    status: "completed",
    source: "order",
    wallet: {
      shop: order.shop,
    },
  }));

  // 5. Combine and Sort
  const combined = [...processedWalletTxs, ...digitalOrderTxs].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return combined;
}
