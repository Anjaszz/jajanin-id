"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSellerOrders(
  page: number = 1,
  limit: number = 10,
  tab: string = "all",
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return [];

  let query = (supabase.from("orders") as any)
    .select(
      `
      *,
      order_items (
        *,
        products (name, image_url, images)
      )
    `,
    )
    .eq("shop_id", (shop as any).id);

  const now = new Date().toISOString();

  // Tab dynamic filtering
  if (tab === "payment_pending") {
    query = query
      .eq("status", "pending_payment")
      .contains("payment_details", { type: "pos_transaction" });
  } else if (tab === "scheduled") {
    query = query
      .gt("scheduled_for", now)
      .in("status", ["pending_confirmation", "paid", "accepted", "ready"]);
  } else if (tab === "pending") {
    // Normal pending OR Scheduled for the past and still pending
    query = query
      .in("status", ["pending_confirmation", "paid"])
      .or(`scheduled_for.is.null,scheduled_for.lte.${now}`);
  } else if (tab === "processing") {
    // Normal processing OR Scheduled for the past and already accepted
    query = query
      .in("status", ["accepted", "processing", "ready"])
      .or(`scheduled_for.is.null,scheduled_for.lte.${now}`);
  } else if (tab === "completed") {
    query = query.eq("status", "completed");
  } else if (tab === "cancelled") {
    query = query.in("status", [
      "rejected",
      "cancelled_by_seller",
      "cancelled_by_buyer",
    ]);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    return [];
  }

  return data as any[];
}

export async function getSellerOrderById(orderId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (!shop) return null;

  const { data, error } = await (supabase.from("orders") as any)
    .select(
      `
      *,
      order_items (
        *,
        products (name, image_url, images)
      )
    `,
    )
    .eq("id", orderId)
    .eq("shop_id", (shop as any).id)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data as any;
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient();

  // Fetch current order to check previous status and get items for stock restoration
  const { data: currentOrder, error: fetchError } = await (
    supabase.from("orders") as any
  )
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (fetchError || !currentOrder) return { error: "Order not found" };

  const cancelledStatuses = [
    "rejected",
    "cancelled_by_seller",
    "cancelled_by_buyer",
  ];
  const isCancelling = cancelledStatuses.includes(status);
  const wasCancelled = cancelledStatuses.includes(currentOrder.status);

  // RESTORE STOCK LOGIC
  // Only restore if we are cancelling AND it wasn't already cancelled
  if (isCancelling && !wasCancelled) {
    for (const item of currentOrder.order_items) {
      const qty = item.quantity;
      const metadata = item.metadata || {};

      if (item.product_id) {
        if (metadata.variant_id) {
          const { data: v } = await supabase
            .from("product_variants")
            .select("stock")
            .eq("id", metadata.variant_id)
            .single();
          if (v) {
            await (supabase.from("product_variants") as any)
              .update({ stock: (v as any).stock + qty })
              .eq("id", metadata.variant_id);
          }
        } else {
          const { data: p } = await (supabase.from("products") as any)
            .select("stock")
            .eq("id", item.product_id)
            .single();
          if (p && (p as any).stock !== null) {
            await (supabase.from("products") as any)
              .update({ stock: (p as any).stock + qty })
              .eq("id", item.product_id);
          }
        }
      }
    }
  }

  // REFUND LOGIC
  // If order is being cancelled/rejected and it was paid (gateway/balance), refund
  if (isCancelling && !wasCancelled) {
    const isPaidMethod = ["gateway", "balance"].includes(
      currentOrder.payment_method,
    );
    const isPaidStatus = currentOrder.status !== "pending_payment";

    if (isPaidMethod && isPaidStatus) {
      const refundAmount = currentOrder.total_amount || 0;
      const { processRefundToBuyer, processGuestRefund } =
        await import("./wallet");

      if (currentOrder.buyer_id) {
        await processRefundToBuyer(
          currentOrder.buyer_id,
          refundAmount,
          orderId,
        );
      } else {
        // Handle Guest Refund using email from guest_info
        const guestEmail = (currentOrder.guest_info as any)?.email;
        if (guestEmail) {
          await processGuestRefund(guestEmail, refundAmount, orderId);
        }
      }
    }
  }

  const { error } = await (supabase.from("orders") as any)
    .update({ status: status as any })
    .eq("id", orderId);

  if (error) return { error: error.message };

  // AUTOMATION: If order completed, sync the wallet balance automatically
  if (status === "completed") {
    try {
      const { syncWalletBalance } = await import("./wallet");
      await syncWalletBalance();
    } catch (syncErr) {
      console.error("Auto-sync wallet failed:", syncErr);
    }
  }

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/wallet");
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/orders/${orderId}`);
  revalidatePath("/", "layout");
  revalidatePath("/", "layout");
  return { success: true };
}

export async function deletePosOrder(orderId: string) {
  const supabase = await createClient();

  // 1. Fetch Order Items to restore stock
  const { data: order, error: orderError } = await (
    supabase.from("orders") as any
  )
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (orderError || !order) return { error: "Order not found" };

  // Safety Check: Only delete if pending and POS
  const isPos = (order.payment_details as any)?.type === "pos_transaction";
  if (order.status !== "pending_payment" || !isPos) {
    return { error: "Can only delete pending POS orders" };
  }

  // 2. Restore Stock
  for (const item of order.order_items) {
    const qty = item.quantity;
    const metadata = item.metadata || {};

    if (item.product_id) {
      if (metadata.variant_id) {
        // Restore Variant Stock
        // Note: We need to get current stock first ideally to atomic update, but simple increment works if row exists
        // Using rpc or direct increment if supabase supports it?
        // Standard update: get current -> update
        const { data: v } = await supabase
          .from("product_variants")
          .select("stock")
          .eq("id", metadata.variant_id)
          .single();
        if (v) {
          await (supabase.from("product_variants") as any)
            .update({ stock: (v as any).stock + qty })
            .eq("id", metadata.variant_id);
        }
      } else {
        // Restore Product Stock (only if no variant)
        const { data: p } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();
        if (p && (p as any).stock !== null) {
          await (supabase.from("products") as any)
            .update({ stock: (p as any).stock + qty })
            .eq("id", item.product_id);
        }
      }
    }
  }

  // 3. Delete Order
  const { error: deleteError } = await (supabase.from("orders") as any)
    .delete()
    .eq("id", orderId);

  if (deleteError) return { error: deleteError.message };

  revalidatePath("/dashboard/orders");
  revalidatePath("/dashboard/products");

  return { success: true };
}
