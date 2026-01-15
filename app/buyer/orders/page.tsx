import { getBuyerOrders } from "@/app/actions/buyer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Package, Store } from "lucide-react";

export default async function BuyerOrdersPage() {
  const orders = await getBuyerOrders();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pesanan Saya</h1>
        <p className="text-muted-foreground">Lacak status pesanan terbaru Anda.</p>
      </div>

      <div className="grid gap-4">
        {orders.length > 0 ? (
          orders.map((order: any) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="bg-muted/40 p-4 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  <span>{new Date(order.created_at).toLocaleDateString("id-ID", { dateStyle: "long" })}</span>
                  <span className="mx-1">•</span>
                  <span>Order ID: {order.id.slice(0, 8)}</span>
                </div>
                <Badge variant={order.status === 'paid' ? 'default' : 'secondary'}>
                  {order.status}
                </Badge>
              </CardHeader>
              <CardContent className="p-4">
                 <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Store className="h-4 w-4 text-primary" />
                        </div>
                        <div className="font-semibold">{order.shop?.name}</div>
                    </div>
                    <Link href={`/orders/${order.id}`} className="text-sm text-primary font-medium hover:underline">
                        Lihat Detail
                    </Link>
                 </div>
                 
                 <div className="space-y-2">
                    {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">{item.quantity}x Product ID: {item.product_id.slice(0,8)}...</span>
                            <span>{formatCurrency(item.subtotal)}</span>
                        </div>
                    ))}
                 </div>
                 
                 <div className="border-t mt-4 pt-4 flex justify-between font-bold">
                    <span>Total Belanja</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                 </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 border rounded-xl bg-card">
            <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-bold text-lg">Belum ada pesanan</h3>
            <p className="text-muted-foreground mb-4">Yuk mulai belanja dari toko-toko pilihan!</p>
            <Button asChild>
                <Link href="/">Mulai Belanja</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper utility if not imported
function Button({ asChild, children, ...props }: any) {
    if (asChild) return children;
    return <button {...props}>{children}</button>; 
}
