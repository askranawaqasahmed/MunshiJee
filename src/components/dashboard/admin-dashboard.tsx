import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, DollarSign, AlertCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";

interface AdminDashboardProps {
  userId: string;
}

export async function AdminDashboard({ userId }: AdminDashboardProps) {
  const [customerCount, invoiceCount, totalRevenue, pendingPayments, recentInvoices] =
    await Promise.all([
      prisma.customer.count({ where: { userId } }),
      prisma.invoice.count({ where: { userId } }),
      prisma.payment.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: {
          userId,
          status: { in: ["SENT", "OVERDUE"] },
        },
        _sum: { amount: true },
      }),
      prisma.invoice.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          customer: {
            select: {
              name: true,
            },
          },
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
      value: `Rs.${Number(totalRevenue._sum.amount || 0).toFixed(2)}`,
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      title: "Pending Payments",
      value: `Rs.${Number(pendingPayments._sum.amount || 0).toFixed(2)}`,
      icon: AlertCircle,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Overview of your invoicing system
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No recent invoices
            </p>
          ) : (
            <div className="space-y-2">
              {recentInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 py-3 border-b last:border-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm sm:text-base">{invoice.invoiceNumber}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {invoice.customer.name}
                    </p>
                  </div>
                  <div className="flex justify-between sm:block sm:text-right">
                    <p className="font-medium text-sm sm:text-base">
                      Rs.{Number(invoice.amount).toFixed(2)}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {invoice.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
