import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";

    // Verify signature
    const signatureStr =
      body.order_id + body.status_code + body.gross_amount + serverKey;
    const computedSignature = crypto
      .createHash("sha512")
      .update(signatureStr)
      .digest("hex");

    if (computedSignature !== body.signature_key) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 403 },
      );
    }

    const supabase = await createClient();
    const status = body.transaction_status;
    const orderId = body.order_id;

    let orderStatus = "pending_payment";
    if (status === "capture" || status === "settlement") {
      orderStatus = "pending_confirmation";

      // First get order info
      const { data: order } = await (supabase.from("orders") as any)
        .select(
          `
          shop_id, 
          total_amount, 
          platform_fee,
          scheduled_for,
          shop:shops(auto_accept_order)
        `,
        )
        .eq("id", orderId)
        .single();

      if (order) {
        const isAutoAccept = (order as any).shop?.auto_accept_order || false;
        const isScheduled = !!(order as any).scheduled_for;
        if (isAutoAccept && !isScheduled) {
          orderStatus = "accepted";
        }

        const netAmount =
          Number(order.total_amount) - Number(order.platform_fee);

        const { data: wallet } = await (supabase.from("wallets") as any)
          .select("id, balance")
          .eq("shop_id", order.shop_id)
          .single();

        if (wallet) {
          await (supabase.from("wallets") as any)
            .update({ balance: Number(wallet.balance) + netAmount })
            .eq("id", wallet.id);

          await (supabase.from("wallet_transactions") as any).insert({
            wallet_id: wallet.id,
            amount: netAmount,
            type: "deposit",
            description: `Hasil penjualan pesanan #${orderId.slice(0, 8)}`,
          } as any);
        }
      }
    } else if (
      status === "deny" ||
      status === "cancel" ||
      status === "expire"
    ) {
      orderStatus = "rejected";
    }

    await (supabase.from("orders") as any)
      .update({
        status: orderStatus as any,
        payment_details: body,
      } as any)
      .eq("id", orderId);

    return NextResponse.json({ message: "OK" });
  } catch (err) {
    console.error("Webhook Error:", err);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
