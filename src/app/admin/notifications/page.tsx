import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Mail, MessageSquare, CheckCircle, XCircle, Clock, MessageCircle } from "lucide-react";

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
    whatsapp: notificationStats.filter(s => s.type === 'WHATSAPP').reduce((sum, stat) => sum + stat._count, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Management</h1>
        <p className="text-gray-600 mt-1">Monitor all notifications sent across the platform</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
            <CardTitle className="text-sm font-medium">Email</CardTitle>
            <Mail className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.email}</div>
            <p className="text-xs text-muted-foreground">Total emails</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sms}</div>
            <p className="text-xs text-muted-foreground">Total SMS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.whatsapp}</div>
            <p className="text-xs text-muted-foreground">Total WhatsApp</p>
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
                  <div className="flex items-start space-x-3 flex-1">
                    {notification.type === 'EMAIL' ? (
                      <Mail className="h-5 w-5 text-blue-600 mt-1" />
                    ) : notification.type === 'SMS' ? (
                      <MessageSquare className="h-5 w-5 text-purple-600 mt-1" />
                    ) : (
                      <MessageCircle className="h-5 w-5 text-green-600 mt-1" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">
                          {notification.invoice.invoiceNumber}
                        </p>
                        <Badge 
                          variant="outline" 
                          className={
                            notification.type === "EMAIL" 
                              ? "bg-blue-50 text-blue-700 border-blue-200" 
                              : notification.type === "SMS"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-green-50 text-green-700 border-green-200"
                          }
                        >
                          {notification.type}
                        </Badge>
                        {notification.status === "SENT" && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            ✓ Delivered
                          </Badge>
                        )}
                        {notification.status === "FAILED" && (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            ✗ Failed
                          </Badge>
                        )}
                        {notification.status === "PENDING" && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            ⏳ Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">
                        To: <span className="font-medium">{notification.recipient}</span>
                      </p>
                      <p className="text-sm text-gray-600">
                        User: <span className="font-medium">{notification.invoice.user.name}</span> | Customer: <span className="font-medium">{notification.invoice.customer.name}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(new Date(notification.createdAt), "MMM dd, yyyy 'at' HH:mm:ss")}
                      </p>
                      {notification.sentAt && notification.status === 'SENT' && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Sent at {format(new Date(notification.sentAt), "HH:mm:ss")}
                        </p>
                      )}
                      {notification.errorMessage && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Error Details:
                          </p>
                          <p className="text-xs text-red-600 mt-1 break-words font-mono">
                            {notification.errorMessage}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
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
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{notification.provider}</span>
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
