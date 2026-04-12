import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, DollarSign, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

export async function AdminDashboard() {
  const [customerCount, invoiceCount, totalRevenue, pendingPayments] =
    await Promise.all([
      prisma.customer.count(),
      prisma.invoice.count(),
      prisma.payment.aggregate({
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        _sum: { amount: true },
        where: {
          status: { in: ["SENT", "OVERDUE"] },
        },
      }),
    ]);

  const stats = [
    {
      title: "Total Customers",
      value: customerCount,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Total Invoices",
      value: invoiceCount,
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: `$${Number(totalRevenue._sum.amount || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Pending Payments",
      value: `$${Number(pendingPayments._sum.amount || 0).toFixed(2)}`,
      icon: AlertCircle,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your invoicing system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No recent activity to display
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
