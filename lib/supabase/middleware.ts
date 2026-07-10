import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { isAuthUserBanned } from "@/lib/auth/account-active";
import type { Database } from "@/types/database";

function isPublicAuthPath(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/auth/")
  );
}

async function isUserAccountInactive(
  supabase: ReturnType<typeof createServerClient<Database>>,
  userId: string,
  userBanned: boolean,
): Promise<boolean> {
  if (userBanned) {
    return true;
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("[middleware] Failed to read profile active state:", error.message);
    return false;
  }

  return profile?.is_active === false;
}

export async function updateSession(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const inactive = await isUserAccountInactive(
      supabase,
      user.id,
      isAuthUserBanned(user),
    );

    if (inactive) {
      await supabase.auth.signOut();

      if (!isPublicAuthPath(request.nextUrl.pathname)) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "account_inactive");

        const redirectResponse = NextResponse.redirect(loginUrl);

        supabaseResponse.cookies.getAll().forEach((cookie) => {
          redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
        });

        return redirectResponse;
      }
    }
  }

  return supabaseResponse;
}
