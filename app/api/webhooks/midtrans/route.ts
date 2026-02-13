import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Midtrans Webhook Received:", JSON.stringify(body));

    const {
      order_id,
      transaction_status,
      status_code,
      gross_amount,
      signature_key,
      fraud_status,
    } = body;

    // 1. Verify Signature (Official Midtrans: order_id + status_code + gross_amount + serverKey)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hashed = crypto
      .createHash("sha512")
      .update(order_id + status_code + gross_amount + serverKey)
      .digest("hex");

    if (hashed !== signature_key) {
      console.warn(
        "Invalid Midtrans Signature! \nExpected: " +
          hashed +
          "\nReceived: " +
          signature_key,
      );
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 403 },
      );
    }

    // 2. Map Midtrans status to our internal order status
    let newStatus = "";
    if (transaction_status === "capture") {
      if (fraud_status === "challenge") {
        newStatus = "pending_confirmation";
      } else if (fraud_status === "accept") {
        newStatus = "paid";
      }
    } else if (transaction_status === "settlement") {
      newStatus = "paid";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny" ||
      transaction_status === "expire"
    ) {
      newStatus = "cancelled_by_buyer";
    } else if (transaction_status === "pending") {
      newStatus = "pending_payment";
    }

    if (!newStatus) {
      return NextResponse.json({ message: "OK, no status change needed" });
    }

    // Initialize Supabase Client (Service Role)
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Check for auto-accept logic if paid
    if (newStatus === "paid" || newStatus === "pending_confirmation") {
      const { data: order } = await supabase
        .from("orders")
        .select("id, scheduled_for, shop:shops(auto_accept_order)")
        .eq("id", order_id)
        .single();

      if (order) {
        const isAutoAccept = (order as any).shop?.auto_accept_order || false;
        const isScheduled = !!order.scheduled_for;

        // If auto-accept is on and not scheduled, move straight to accepted
        if (newStatus === "paid" && isAutoAccept && !isScheduled) {
          newStatus = "accepted";
          console.log(`Auto-accepting order ${order_id}`);
        }
      }
    }

    console.log(`Processing Order ${order_id} -> New Status: ${newStatus}`);

    const { error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
        payment_details: body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (error) {
      console.error("Database Error updating status:", error.message);
      return NextResponse.json(
        {
          message: "Failed to update order in database",
          error: error.message,
        },
        { status: 500 },
      );
    }

    // NOTE: Wallet balance update is now handled by updateOrderStatus when status is 'completed'
    // to ensure consistency across both cash and gateway payments. Money only enters
    // the wallet after the seller fulfills the order.

    console.log(`Success! Order ${order_id} is now ${newStatus}`);

    // Auto-revalidate paths for real-time update feel
    try {
      revalidatePath(`/orders/${order_id}`);
      revalidatePath("/dashboard/orders");
      revalidatePath("/");
    } catch (err) {
      console.error("Revalidation Error (non-fatal):", err);
    }

    return NextResponse.json({ message: "OK" });
  } catch (error: any) {
    console.error("Webhook Global Exception:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 },
    );
  }
}
