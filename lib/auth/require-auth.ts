import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { isCurrentAccountActive, signOutCurrentUser } from "@/lib/auth/account-active";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const isActive = await isCurrentAccountActive(user);

  if (!isActive) {
    await signOutCurrentUser();
    redirect("/login?error=account_inactive");
  }

  return user;
}
