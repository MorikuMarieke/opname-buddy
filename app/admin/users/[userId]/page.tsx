import { AdminUserDetailView } from "@/components/dashboard/admin-user-detail-view";

interface AdminUserDetailPageProps {
  params: Promise<{ userId: string }>;
}

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { userId } = await params;

  return <AdminUserDetailView userId={userId} />;
}
