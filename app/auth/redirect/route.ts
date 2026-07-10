import { NextResponse } from "next/server";

import { isCurrentAccountActive, signOutCurrentUser } from "@/lib/auth/account-active";
import { fetchRolesForUser } from "@/lib/auth/fetch-roles-for-user";
import { getPrimaryRole } from "@/lib/auth/get-primary-role";
import { getRoleRedirectPath } from "@/lib/auth/get-role-redirect-path";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isActive = await isCurrentAccountActive(user);

  if (!isActive) {
    await signOutCurrentUser();
    return NextResponse.redirect(
      new URL("/login?error=account_inactive", request.url),
    );
  }

  const admin = createAdminClient();
  const { roles, error } = await fetchRolesForUser(admin, user.id);

  if (error) {
    console.error("[auth/redirect]", error);
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "roles");
    return NextResponse.redirect(loginUrl);
  }

  const path = getRoleRedirectPath(getPrimaryRole(roles));

  return NextResponse.redirect(new URL(path, request.url));
}
