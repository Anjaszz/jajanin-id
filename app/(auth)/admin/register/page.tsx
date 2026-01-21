
"use client";

import { useState } from "react";
import { signup } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminRegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const secretKey = formData.get("secret_key") as string;

    // Optional: Basic front-end check for secret key if you want
    if (secretKey !== "ADMIN123") {
       setError("Secret Key Admin tidak valid!");
       setLoading(false);
       return;
    }

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="h-2 bg-red-600 w-full" />
      <CardHeader className="space-y-2 text-center pt-8">
        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-4 rounded-3xl">
            <ShieldAlert className="h-10 w-10 text-red-600" />
          </div>
        </div>
        <CardTitle className="text-3xl font-black tracking-tight text-slate-900">Registrasi Admin</CardTitle>
        <CardDescription className="text-slate-500">
          Daftarkan akun administrator baru platform.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="role" value="admin" />
        <CardContent className="space-y-4 px-8 pt-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" name="name" required className="h-11 rounded-xl" placeholder="Admin Name" />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" required className="h-11 rounded-xl" placeholder="0812..." />
              </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Admin</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@yukjajan.id"
              required
              className="h-11 rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2 pt-2">
            <Label htmlFor="secret_key" className="text-red-600 font-bold flex items-center gap-1">
               Secret Admin Key
            </Label>
            <Input
              id="secret_key"
              name="secret_key"
              type="password"
              placeholder="Masukkan kode rahasia admin"
              required
              className="h-11 rounded-xl border-red-200 focus-visible:ring-red-500"
            />
            <p className="text-[10px] text-muted-foreground italic">*Gunakan "ADMIN123" untuk percobaan.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-8 pb-10 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-lg font-bold shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              "Buat Akun Admin"
            )}
          </Button>
          <Link href="/admin/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors font-medium">
              <ArrowLeft className="h-4 w-4" /> Kembali ke Login
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}
