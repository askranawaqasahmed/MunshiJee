import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { CustomerDashboard } from "@/components/dashboard/customer-dashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user.role === "SUPER_ADMIN") {
    return <AdminDashboard />;
  }

  return <CustomerDashboard />;
}
