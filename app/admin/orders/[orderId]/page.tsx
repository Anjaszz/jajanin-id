import { getAdminOrderById } from "@/app/actions/admin";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, User, MapPin, Store, CreditCard, Clock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getAdminOrderById(orderId);

  if (!order) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending_payment":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "processing":
      case "accepted":
      case "ready":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
      case "rejected":
      case "cancelled_by_buyer":
      case "cancelled_by_seller":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
        case 'pending_payment': return 'Menunggu Pembayaran';
        case 'pending_confirmation': return 'Menunggu Konfirmasi';
        case 'paid': return 'Dibayar';
        case 'accepted': return 'Diproses';
        case 'processing': return 'Sedang Disiapkan';
        case 'ready': return 'Siap Diambil/Dikirim';
        case 'completed': return 'Selesai';
        case 'rejected': return 'Ditolak';
        case 'cancelled_by_seller': return 'Dibatalkan Seller';
        case 'cancelled_by_buyer': return 'Dibatalkan Pembeli';
        default: return status;
    }
}

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Pesanan</h1>
          <p className="text-muted-foreground text-sm">
            #{order.id} • {new Date(order.created_at).toLocaleString("id-ID")}
          </p>
        </div>
        <div className="ml-auto">
          <Badge className={`text-base px-4 py-1 ${getStatusColor(order.status)}`} variant="outline">
            {getStatusLabel(order.status)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Buyer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" />
              Informasi Pembeli
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">Nama</span>
              <span className="font-semibold">{order.buyer?.name || "Guest"}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">Email</span>
              <span>{order.buyer?.email || "-"}</span>
            </div>
             <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">Telepon</span>
              <span>{order.buyer?.phone || "-"}</span>
            </div>
             <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">Alamat Pengiriman</span>
              <div className="flex items-start gap-2">
                 <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                 <span>{order.buyer?.address || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shop Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Store className="h-4 w-4" />
              Informasi Toko
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">Nama Toko</span>
              <span className="font-semibold">{order.shop?.name}</span>
            </div>
             <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">Alamat Toko</span>
              <div className="flex items-start gap-2">
                 <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                 <span>{order.shop?.address || "-"}</span>
              </div>
            </div>
            <div className="grid gap-1">
              <span className="text-sm font-medium text-muted-foreground">Metode Pembayaran</span>
               <div className="flex items-center gap-2">
                 <CreditCard className="h-4 w-4 text-muted-foreground" />
                 <span className="capitalize font-medium">
                    {order.payment_method === 'gateway' ? 'Digital / QRIS' : 
                     order.payment_method === 'balance' ? 'Saldo Dompet' : 'Tunai'}
                 </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle>Rincian Produk</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produk</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.products?.name || "Deleted Product"}</div>
                    {item.metadata?.variant_name && (
                       <div className="text-xs text-muted-foreground">Varian: {item.metadata.variant_name}</div>
                    )}
                    {item.metadata?.note && (
                       <div className="text-xs text-muted-foreground italic">Note: {item.metadata.note}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price_at_purchase)}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(item.subtotal)}</TableCell>
                </TableRow>
              ))}
              
              {/* Summary Rows */}
              <TableRow>
                 <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                 <TableCell className="text-right font-bold">{formatCurrency(order.total_amount)}</TableCell>
              </TableRow>
              {order.platform_fee > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium text-muted-foreground">Biaya Platform</TableCell>
                    <TableCell className="text-right text-muted-foreground">+{formatCurrency(order.platform_fee)}</TableCell>
                  </TableRow>
              )}
               {order.gateway_fee > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium text-muted-foreground">Biaya Layanan (Gateway)</TableCell>
                    <TableCell className="text-right text-muted-foreground">+{formatCurrency(order.gateway_fee)}</TableCell>
                  </TableRow>
              )}
              {order.discount > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-medium text-green-600">Diskon</TableCell>
                    <TableCell className="text-right text-green-600">-{formatCurrency(order.discount)}</TableCell>
                  </TableRow>
              )}
               <TableRow className="bg-muted/50">
                 <TableCell colSpan={3} className="text-right font-black text-lg">Total Bayar</TableCell>
                 <TableCell className="text-right font-black text-lg">{formatCurrency(order.total_amount + (order.gateway_fee || 0))}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Logs / Timeline placeholders could go here */}
    </div>
  );
}
