import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, DollarSign, TrendingUp, UserCheck, Calendar } from "lucide-react";
import { format, subDays } from "date-fns";

export default async function SuperAdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  // Get user statistics
  const totalUsers = await prisma.user.count({
    where: { role: "ADMIN" },
  });

  const newUsersLast7Days = await prisma.user.count({
    where: {
      role: "ADMIN",
      createdAt: {
        gte: subDays(new Date(), 7),
      },
    },
  });

  const newUsersLast30Days = await prisma.user.count({
    where: {
      role: "ADMIN",
      createdAt: {
        gte: subDays(new Date(), 30),
      },
    },
  });

  // Active users (users who created invoices in last 30 days)
  const activeUsers = await prisma.invoice.findMany({
    where: {
      createdAt: {
        gte: subDays(new Date(), 30),
      },
    },
    distinct: ["userId"],
    select: { userId: true },
  });

  // Get business metrics
  const totalInvoices = await prisma.invoice.count();
  
  const totalRevenue = await prisma.payment.aggregate({
    _sum: {
      amount: true,
    },
  });

  const pendingPayments = await prisma.invoice.aggregate({
    where: {
      status: {
        in: ["SENT", "OVERDUE"],
      },
    },
    _sum: {
      amount: true,
    },
  });

  const totalCustomers = await prisma.customer.count();
  const totalSales = await prisma.sale.count();

  // Recent user signups
  const recentUsers = await prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      phoneNumber: true,
      createdAt: true,
    },
  });

  // Recent invoices across all users
  const recentInvoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      customer: {
        select: {
          name: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of all users and system-wide metrics
        </p>
      </div>

      {/* User Statistics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">User Statistics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New (7 Days)
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newUsersLast7Days}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New (30 Days)
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newUsersLast30Days}</div>
              <p className="text-xs text-muted-foreground">
                Last 30 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeUsers.length}</div>
              <p className="text-xs text-muted-foreground">
                Active in last 30 days
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Business Metrics */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Business Metrics (All Users)
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Invoices
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                Across all users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs.{totalRevenue._sum.amount?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                All payments received
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Payments
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs.{pendingPayments._sum.amount?.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                Unpaid invoices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                {totalSales} sales recorded
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent User Signups</CardTitle>
          </CardHeader>
          <CardContent>
            {recentUsers.length > 0 ? (
              <div className="space-y-4">
                {recentUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      {user.phoneNumber && (
                        <p className="text-xs text-gray-500">
                          {user.phoneNumber}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent signups
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <div className="space-y-4">
                {recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">
                        {invoice.customer.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {invoice.user.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        Rs.{invoice.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {invoice.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No recent invoices
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
