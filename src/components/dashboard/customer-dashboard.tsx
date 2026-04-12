import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, AlertCircle, CheckCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatInvoiceType } from "@/lib/utils";

export async function CustomerDashboard() {
  const session = await getServerSession(authOptions);
  const customerId = session?.user?.customerId;

  if (!customerId) {
    return <div>No customer data available</div>;
  }

  const [totalReceived, pendingDues, recentInvoices] = await Promise.all([
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { customerId },
    }),
    prisma.invoice.aggregate({
      _sum: { amount: true },
      where: {
        customerId,
        status: { in: ["SENT", "OVERDUE"] },
      },
    }),
    prisma.invoice.findMany({
      where: { customerId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const stats = [
    {
      title: "Total Payments Received",
      value: `$${Number(totalReceived._sum.amount || 0).toFixed(2)}`,
      icon: CheckCircle,
      color: "text-green-600",
    },
    {
      title: "Pending Dues",
      value: `$${Number(pendingDues._sum.amount || 0).toFixed(2)}`,
      icon: AlertCircle,
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Your account overview and recent invoices
        </p>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
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
              No invoices to display
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
                      {new Date(invoice.issueDate).toLocaleDateString()} • {formatInvoiceType(invoice.type)}
                    </p>
                  </div>
                  <div className="flex justify-between sm:block sm:text-right">
                    <p className="font-medium text-sm sm:text-base">
                      ${Number(invoice.amount).toFixed(2)}
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
