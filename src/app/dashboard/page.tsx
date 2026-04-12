import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Super admin has their own dashboard at /admin
  if (session.user.role === "SUPER_ADMIN") {
    redirect("/admin");
  }

  // Regular users see their personal dashboard
  return <AdminDashboard userId={session.user.id} />;
}
