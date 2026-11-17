import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { sanitizeSupabaseUrl } from "./helpers";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!rawUrl || !rawKey) {
    return supabaseResponse;
  }

  const supabaseUrl = sanitizeSupabaseUrl(rawUrl);
  const supabaseKey = rawKey.trim();

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options as any)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  const isProtectedPage =
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/api/");

  // Se o usuário estiver autenticado, valida se está na lista de e-mails permitidos (se configurado)
  const allowedEmailsStr = process.env.ALLOWED_EMAILS || "";
  const allowedEmails = allowedEmailsStr
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (user && allowedEmails.length > 0) {
    const userEmail = (user.email || "").toLowerCase();
    if (!allowedEmails.includes(userEmail)) {
      // Usuário não autorizado: realiza sign out e manda para login com erro
      await supabase.auth.signOut();
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Redireciona usuários não autenticados que tentam acessar páginas protegidas
  if (!user && isProtectedPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // Redireciona usuários já autenticados para o dashboard ao acessar /login
  if (user && isAuthPage) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
