import { Suspense } from "react";

import { AdminDepartmentsView } from "@/components/dashboard/admin-departments-view";

export default function AdminDepartmentsPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-carbon-black-600">Laden...</p>}
    >
      <AdminDepartmentsView />
    </Suspense>
  );
}
