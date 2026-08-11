import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const loginError = (message: string) => {
    const login = new URL("/auth/login", requestUrl.origin);
    login.searchParams.set("error", message);
    return NextResponse.redirect(login);
  };

  if (!code) {
    return loginError("Missing confirmation code. Try logging in or request a new signup email.");
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return loginError(error.message || "Email confirmation failed. Please log in or sign up again.");
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return loginError("Could not establish a session after confirmation. Please log in.");
    }

    return NextResponse.redirect(new URL(next, requestUrl.origin));
  } catch {
    return loginError("Could not complete email confirmation. Please try logging in.");
  }
}
