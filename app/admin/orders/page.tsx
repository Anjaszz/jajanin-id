import { getAllOrdersAdmin } from "@/app/actions/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, ChevronLeft, ChevronRight, Eye, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>;
}) {
  const { page: pageStr, search: searchStr } = await searchParams;
  const page = Number(pageStr) || 1;
  const search = searchStr || "";
  const limit = 10;
  
  const { data: orders, total } = await getAllOrdersAdmin(page, limit, search);
  const totalPages = Math.ceil(total / limit);

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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Master Pesanan</h1>
           <p className="text-muted-foreground">
             Pantau semua transaksi yang terjadi di platform.
           </p>
        </div>
      </div>

      <Card>
        <CardHeader>
           <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1 w-full sm:w-auto">
                 <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Daftar Pesanan
                 </CardTitle>
                 <CardDescription className="mt-1">
                    {search 
                      ? `Hasil pencarian: "${search}" (${total} ditemukan)`
                      : `Menampilkan pesanan ${((page - 1) * limit) + 1} - ${Math.min(page * limit, total)} dari total ${total} pesanan.`
                    }
                 </CardDescription>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search Form */}
                  <form className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      name="search"
                      placeholder="Cari Order ID atau Nama Toko..."
                      className="pl-9 w-full rounded-xl bg-muted/30"
                      defaultValue={search}
                    />
                  </form>
                  
                  {/* Top Pagination */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page <= 1}
                      asChild={page > 1}
                      className="h-9 w-9"
                    >
                      {page > 1 ? (
                        <Link href={`/admin/orders?page=${page - 1}&search=${search}`}>
                          <ChevronLeft className="h-4 w-4" />
                          <span className="sr-only">Previous</span>
                        </Link>
                      ) : (
                         <span className="flex items-center justify-center">
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous</span>
                         </span>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={page >= totalPages}
                      asChild={page < totalPages}
                      className="h-9 w-9"
                    >
                      {page < totalPages ? (
                        <Link href={`/admin/orders?page=${page + 1}&search=${search}`}>
                          <ChevronRight className="h-4 w-4" />
                          <span className="sr-only">Next</span>
                        </Link>
                      ) : (
                        <span className="flex items-center justify-center">
                           <ChevronRight className="h-4 w-4" />
                           <span className="sr-only">Next</span>
                        </span>
                      )}
                    </Button>
                  </div>
              </div>
           </div>
        </CardHeader>
        <CardContent>
            <div className="rounded-md border">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Toko</TableHead>
                    <TableHead>Pembeli</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Metode</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {orders.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                        {search ? "Pesanan tidak ditemukan." : "Belum ada pesanan yang masuk."}
                    </TableCell>
                    </TableRow>
                ) : (
                    orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-mono text-xs font-medium">
                        #{order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell className="text-xs">
                        {new Date(order.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                        </TableCell>
                        <TableCell className="font-medium">
                            {order.shop?.name || "-"}
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{order.buyer?.name || "Guest / Deleted"}</span>
                                <span className="text-xs text-muted-foreground">{order.buyer?.email}</span>
                            </div>
                        </TableCell>
                        <TableCell className="font-bold">
                        {formatCurrency(order.total_amount)}
                        </TableCell>
                        <TableCell className="capitalize text-xs">
                            {order.payment_method === 'gateway' ? 'Digital / QRIS' : 
                             order.payment_method === 'balance' ? 'Saldo Dompet' : 'Tunai'}
                        </TableCell>
                        <TableCell>
                        <Badge
                            variant="outline"
                            className={`${getStatusColor(order.status)} whitespace-nowrap`}
                        >
                            {getStatusLabel(order.status)}
                        </Badge>
                        </TableCell>
                        <TableCell>
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
                </TableBody>
            </Table>
            </div>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-xs text-muted-foreground">
             Halaman {page} dari {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              asChild={page > 1}
            >
              {page > 1 ? (
                <Link href={`/admin/orders?page=${page - 1}&search=${search}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </Link>
              ) : (
                <span>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Sebelumnya
                </span>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              asChild={page < totalPages}
            >
              {page < totalPages ? (
                <Link href={`/admin/orders?page=${page + 1}&search=${search}`}>
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              ) : (
                <span>
                  Selanjutnya
                  <ChevronRight className="h-4 w-4 ml-2" />
                </span>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
