
"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="h-2 bg-blue-600 w-full" />
      <CardHeader className="space-y-2 text-center pt-8">
        <div className="flex justify-center mb-4">
          <div className="bg-blue-100 p-4 rounded-3xl">
            <ShieldCheck className="h-10 w-10 text-blue-600" />
          </div>
        </div>
        <CardTitle className="text-3xl font-black tracking-tight text-slate-900">Admin Login</CardTitle>
        <CardDescription className="text-slate-500">
          Masuk ke panel kontrol platform YukJajan.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-8 pt-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-medium border border-red-100 animate-in fade-in slide-in-from-top-1">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email Admin</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@yukjajan.id"
              required
              className="h-12 rounded-xl focus-visible:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="h-12 rounded-xl focus-visible:ring-blue-500"
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-8 pb-10 pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-lg font-bold shadow-lg shadow-blue-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              "Masuk Panel Admin"
            )}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Belum punya akun admin?{" "}
            <Link href="/admin/register" className="text-blue-600 font-bold hover:underline">
              Daftar Admin Baru
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
