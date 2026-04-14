import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Mail, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function UsersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          invoices: true,
          customers: true,
          sales: true,
          payments: true,
        },
      },
    },
  });

  // Get total revenue and subscription info for each user
  const usersWithRevenue = await Promise.all(
    users.map(async (user) => {
      const [revenue, subscription] = await Promise.all([
        prisma.payment.aggregate({
          where: { userId: user.id },
          _sum: {
            amount: true,
          },
        }),
        prisma.userSubscription.findFirst({
          where: {
            userId: user.id,
            status: 'ACTIVE',
          },
          include: {
            plan: true,
          },
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      return {
        ...user,
        totalRevenue: revenue._sum.amount || 0,
        subscription,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-2">
            View and manage all registered users
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users ({usersWithRevenue.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {usersWithRevenue.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Plan</th>
                    <th className="text-center p-3 font-medium">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Left
                    </th>
                    <th className="text-center p-3 font-medium">
                      <MessageSquare className="h-4 w-4 inline mr-1" />
                      SMS Left
                    </th>
                    <th className="text-center p-3 font-medium">
                      <MessageSquare className="h-4 w-4 inline mr-1 text-green-600" />
                      WhatsApp Left
                    </th>
                    <th className="text-center p-3 font-medium">Expiry Date</th>
                    <th className="text-right p-3 font-medium">Invoices</th>
                    <th className="text-right p-3 font-medium">Revenue</th>
                    <th className="text-center p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithRevenue.map((user) => {
                    const emailLeft = user.subscription 
                      ? user.subscription.plan.emailLimit - user.subscription.emailsUsed 
                      : 0;
                    const smsLeft = user.subscription 
                      ? user.subscription.plan.smsLimit - user.subscription.smsUsed 
                      : 0;
                    const whatsappLeft = user.subscription 
                      ? user.subscription.plan.whatsappLimit - user.subscription.whatsappUsed 
                      : 0;
                    
                    return (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">
                              {format(new Date(user.createdAt), "MMM dd, yyyy")}
                            </p>
                          </div>
                        </td>
                        <td className="p-3 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="p-3">
                          {user.subscription ? (
                            <div>
                              <Badge variant={user.subscription.plan.isFree ? 'secondary' : 'default'}>
                                {user.subscription.plan.name}
                              </Badge>
                              <p className="text-xs text-gray-500 mt-1">
                                Rs.{Number(user.subscription.plan.price).toFixed(0)}/mo
                              </p>
                            </div>
                          ) : (
                            <Badge variant="destructive">No Plan</Badge>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {user.subscription ? (
                            <div>
                              <p className={`font-semibold ${
                                emailLeft <= 2 ? 'text-red-600' : 'text-green-600'
                              }`}>
                                {emailLeft}
                              </p>
                              <p className="text-xs text-gray-500">
                                of {user.subscription.plan.emailLimit}
                              </p>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {user.subscription ? (
                            user.subscription.plan.smsLimit > 0 ? (
                              <div>
                                <p className={`font-semibold ${
                                  smsLeft <= 2 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {smsLeft}
                                </p>
                                <p className="text-xs text-gray-500">
                                  of {user.subscription.plan.smsLimit}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {user.subscription ? (
                            user.subscription.plan.whatsappLimit > 0 ? (
                              <div>
                                <p className={`font-semibold ${
                                  whatsappLeft <= 2 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {whatsappLeft}
                                </p>
                                <p className="text-xs text-gray-500">
                                  of {user.subscription.plan.whatsappLimit}
                                </p>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">N/A</span>
                            )
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          {user.subscription ? (
                            <div>
                              <p className={`text-sm font-medium ${
                                new Date(user.subscription.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                                  ? 'text-red-600'
                                  : 'text-gray-900'
                              }`}>
                                {format(new Date(user.subscription.endDate), "MMM dd, yyyy")}
                              </p>
                              {new Date(user.subscription.endDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                                <p className="text-xs text-red-600">Expiring soon</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          {user._count.invoices}
                        </td>
                        <td className="p-3 text-right font-medium">
                          Rs.{Number(user.totalRevenue).toFixed(2)}
                        </td>
                        <td className="p-3 text-center">
                          <Link href={`/users/${user.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No users registered yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
