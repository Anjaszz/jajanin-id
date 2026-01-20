import { getBuyerOrders } from "@/app/actions/buyer";
import OrdersClient from "./orders-client";

export default async function BuyerOrdersPage() {
  const initialOrders = await getBuyerOrders();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-heading font-black tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Pesanan Saya
        </h1>
        <p className="text-muted-foreground">Lacak status dan riwayat pesanan Anda.</p>
      </div>

      <OrdersClient initialOrders={initialOrders} />
    </div>
  );
}
