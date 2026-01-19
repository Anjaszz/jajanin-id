import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      order_id,
      transaction_status,
      fraud_status,
      gross_amount,
      signature_key,
    } = body;

    // 1. Verify Signature (Security Best Practice)
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const hashed = crypto
      .createHash("sha512")
      .update(order_id + transaction_status + gross_amount + serverKey)
      .digest("hex");

    if (hashed !== signature_key) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 403 },
      );
    }

    // 2. Map Midtrans status to our order status
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

    if (newStatus) {
      const supabase = await createClient();
      const { error } = await (supabase.from("orders") as any)
        .update({
          status: newStatus,
          payment_details: body, // Store full log for audit
        } as any)
        .eq("id", order_id);

      if (error) {
        console.error("Database Error:", error);
        return NextResponse.json(
          { message: "Failed to update order" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
