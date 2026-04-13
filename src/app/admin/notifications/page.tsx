import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const [recentNotifications, notificationStats] = await Promise.all([
    prisma.notificationLog.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        invoice: {
          include: {
            customer: true,
            user: true,
          },
        },
      },
    }),
    prisma.notificationLog.groupBy({
      by: ['status', 'type'],
      _count: true,
    }),
  ]);

  const stats = {
    total: notificationStats.reduce((sum, stat) => sum + stat._count, 0),
    sent: notificationStats.filter(s => s.status === 'SENT').reduce((sum, stat) => sum + stat._count, 0),
    failed: notificationStats.filter(s => s.status === 'FAILED').reduce((sum, stat) => sum + stat._count, 0),
    pending: notificationStats.filter(s => s.status === 'PENDING').reduce((sum, stat) => sum + stat._count, 0),
    email: notificationStats.filter(s => s.type === 'EMAIL').reduce((sum, stat) => sum + stat._count, 0),
    sms: notificationStats.filter(s => s.type === 'SMS').reduce((sum, stat) => sum + stat._count, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Management</h1>
        <p className="text-gray-600 mt-1">Monitor all notifications sent across the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Delivery failed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Notifications</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.email}</div>
            <p className="text-xs text-muted-foreground">Total emails sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Notifications</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sms}</div>
            <p className="text-xs text-muted-foreground">Total SMS sent</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotifications.length > 0 ? (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between border-b pb-4 last:border-0"
                >
                  <div className="flex items-start space-x-3">
                    {notification.type === 'EMAIL' ? (
                      <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-purple-600 mt-1" />
                    )}
                    <div>
                      <p className="font-medium">
                        {notification.invoice.invoiceNumber}
                      </p>
                      <p className="text-sm text-gray-600">
                        To: {notification.recipient} | User: {notification.invoice.user.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Customer: {notification.invoice.customer.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notification.createdAt), "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                      {notification.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">
                          Error: {notification.errorMessage}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge
                      variant={
                        notification.status === 'SENT'
                          ? 'default'
                          : notification.status === 'FAILED'
                          ? 'destructive'
                          : 'secondary'
                      }
                    >
                      {notification.status}
                    </Badge>
                    <span className="text-xs text-gray-500">{notification.provider}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">No notifications yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
