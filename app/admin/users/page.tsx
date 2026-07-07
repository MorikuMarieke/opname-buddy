import { Suspense } from "react";

import { AdminUsersView } from "@/components/dashboard/admin-users-view";

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-carbon-black-600">Laden...</p>
      }
    >
      <AdminUsersView />
    </Suspense>
  );
}
