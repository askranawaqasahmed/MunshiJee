import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye } from "lucide-react";

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

  // Get total revenue for each user
  const usersWithRevenue = await Promise.all(
    users.map(async (user) => {
      const revenue = await prisma.payment.aggregate({
        where: { userId: user.id },
        _sum: {
          amount: true,
        },
      });

      return {
        ...user,
        totalRevenue: revenue._sum.amount || 0,
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
                    <th className="text-left p-3 font-medium">Phone</th>
                    <th className="text-left p-3 font-medium">
                      Registration Date
                    </th>
                    <th className="text-right p-3 font-medium">Invoices</th>
                    <th className="text-right p-3 font-medium">Customers</th>
                    <th className="text-right p-3 font-medium">
                      Total Revenue
                    </th>
                    <th className="text-center p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersWithRevenue.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{user.name}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {user.email}
                      </td>
                      <td className="p-3 text-sm">
                        {user.phoneNumber || "-"}
                      </td>
                      <td className="p-3 text-sm">
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </td>
                      <td className="p-3 text-right">
                        {user._count.invoices}
                      </td>
                      <td className="p-3 text-right">
                        {user._count.customers}
                      </td>
                      <td className="p-3 text-right font-medium">
                        ${Number(user.totalRevenue).toFixed(2)}
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
                  ))}
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
