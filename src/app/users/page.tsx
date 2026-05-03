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
import { UsersFilter } from "@/components/users/users-filter";
import type { Prisma } from "@prisma/client";

interface UsersPageProps {
  searchParams: Promise<{ q?: string; plan?: string; status?: string }>;
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const planSlug = params.plan ?? "all";
  const statusFilter = params.status ?? "all";

  const where: Prisma.UserWhereInput = { role: "ADMIN" };

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  if (statusFilter === "disabled") {
    where.isActive = false;
  } else if (statusFilter !== "all") {
    where.isActive = true;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { invoices: true, customers: true, sales: true, payments: true },
      },
    },
  });

  const usersWithRevenue = await Promise.all(
    users.map(async (user) => {
      const [revenue, subscription] = await Promise.all([
        prisma.payment.aggregate({
          where: { userId: user.id },
          _sum: { amount: true },
        }),
        prisma.userSubscription.findFirst({
          where: { userId: user.id, status: "ACTIVE" },
          include: { plan: true },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      return {
        ...user,
        totalRevenue: revenue._sum.amount || 0,
        subscription,
      };
    })
  );

  // Apply post-fetch filters that depend on the subscription join
  const now = new Date();
  const sevenDays = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const filtered = usersWithRevenue.filter((u) => {
    if (planSlug !== "all") {
      if (!u.subscription || u.subscription.plan.slug !== planSlug) return false;
    }
    if (statusFilter === "active") {
      if (!u.subscription || new Date(u.subscription.endDate) < now) return false;
    } else if (statusFilter === "expiring") {
      if (
        !u.subscription ||
        new Date(u.subscription.endDate) >= sevenDays ||
        new Date(u.subscription.endDate) < now
      )
        return false;
    } else if (statusFilter === "expired") {
      if (u.subscription && new Date(u.subscription.endDate) >= now) return false;
    }
    return true;
  });

  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { price: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-600 mt-2">
            View and manage all registered admins
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Admins ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <UsersFilter
            plans={plans}
            initialQuery={q}
            initialPlan={planSlug}
            initialStatus={statusFilter}
          />

          {filtered.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Name</th>
                    <th className="text-left p-3 font-medium">Email</th>
                    <th className="text-left p-3 font-medium">Status</th>
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
                  {filtered.map((user) => {
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
                        <td className="p-3 text-sm text-gray-600">{user.email}</td>
                        <td className="p-3">
                          {user.isActive ? (
                            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Disabled</Badge>
                          )}
                        </td>
                        <td className="p-3">
                          {user.subscription ? (
                            <div>
                              <Badge variant={user.subscription.plan.isFree ? "secondary" : "default"}>
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
                              <p
                                className={`font-semibold ${
                                  emailLeft <= 2 ? "text-red-600" : "text-green-600"
                                }`}
                              >
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
                                <p
                                  className={`font-semibold ${
                                    smsLeft <= 2 ? "text-red-600" : "text-green-600"
                                  }`}
                                >
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
                                <p
                                  className={`font-semibold ${
                                    whatsappLeft <= 2 ? "text-red-600" : "text-green-600"
                                  }`}
                                >
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
                              <p
                                className={`text-sm font-medium ${
                                  new Date(user.subscription.endDate) < sevenDays
                                    ? "text-red-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {format(new Date(user.subscription.endDate), "MMM dd, yyyy")}
                              </p>
                              {new Date(user.subscription.endDate) < sevenDays && (
                                <p className="text-xs text-red-600">Expiring soon</p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">{user._count.invoices}</td>
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
              <p className="text-gray-500">No users match the current filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
