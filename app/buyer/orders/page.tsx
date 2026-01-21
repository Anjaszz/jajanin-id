import { getBuyerOrders } from "@/app/actions/buyer";
import OrdersClient from "./orders-client";

export default async function BuyerOrdersPage() {
  const initialOrders = await getBuyerOrders();

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8">
      <OrdersClient initialOrders={initialOrders} />
    </div>
  );
}
