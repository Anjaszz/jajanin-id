import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Default to a success page if no "next" is provided
  const next = searchParams.get("next") ?? "/verify_success";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data?.user) {
      // We can append the role to the next URL for the success page to customize itself
      const role = data.user.user_metadata?.role || "buyer";
      return NextResponse.redirect(`${origin}${next}?role=${role}`);
    }
  }

  // If error, redirect to login with error message
  return NextResponse.redirect(
    `${origin}/buyer/login?error=Link verifikasi tidak valid atau sudah kedaluwarsa`,
  );
}
