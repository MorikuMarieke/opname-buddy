"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { SecondaryButton } from "@/components/ui/secondary-button";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);

    const supabase = createClient();
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <SecondaryButton
      size="sm"
      onClick={handleLogout}
      disabled={isLoading}
    >
      {isLoading ? "Bezig..." : "Uitloggen"}
    </SecondaryButton>
  );
}
