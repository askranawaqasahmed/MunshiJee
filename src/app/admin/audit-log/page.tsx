import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
type AuditAction = "USER_DISABLED" | "USER_ENABLED" | "USER_DELETED" | "SUBSCRIPTION_ASSIGNED" | "SUBSCRIPTION_CHANGED";

const PAGE_SIZE = 50;

const ACTION_LABEL: Record<AuditAction, string> = {
  USER_DISABLED: "Disabled account",
  USER_ENABLED: "Enabled account",
  USER_DELETED: "Deleted account",
  SUBSCRIPTION_ASSIGNED: "Assigned plan",
  SUBSCRIPTION_CHANGED: "Changed plan",
};

const ACTION_VARIANT: Record<AuditAction, "default" | "secondary" | "destructive"> = {
  USER_DISABLED: "destructive",
  USER_ENABLED: "default",
  USER_DELETED: "destructive",
  SUBSCRIPTION_ASSIGNED: "default",
  SUBSCRIPTION_CHANGED: "secondary",
};

interface AuditLogPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AuditLogPage({ searchParams }: AuditLogPageProps) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip,
    }),
    prisma.auditLog.count(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-gray-600 mt-2">
          Every super-admin action is recorded here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{total} entries</CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No audit entries yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="p-3 font-medium">When</th>
                    <th className="p-3 font-medium">Actor</th>
                    <th className="p-3 font-medium">Action</th>
                    <th className="p-3 font-medium">Target</th>
                    <th className="p-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const meta =
                      log.metadata && typeof log.metadata === "object"
                        ? (log.metadata as Record<string, unknown>)
                        : null;
                    return (
                      <tr key={log.id} className="border-b align-top hover:bg-gray-50">
                        <td className="p-3 whitespace-nowrap text-gray-700">
                          {format(new Date(log.createdAt), "MMM dd, yyyy HH:mm")}
                        </td>
                        <td className="p-3 text-gray-700">{log.actorEmail}</td>
                        <td className="p-3">
                          <Badge variant={ACTION_VARIANT[log.action]}>
                            {ACTION_LABEL[log.action]}
                          </Badge>
                        </td>
                        <td className="p-3 text-gray-700">
                          {log.targetEmail ?? "—"}
                          {log.targetId && log.action !== "USER_DELETED" && (
                            <Link
                              href={`/users/${log.targetId}`}
                              className="ml-2 text-xs text-primary hover:underline"
                            >
                              View
                            </Link>
                          )}
                        </td>
                        <td className="p-3 text-xs text-gray-600">
                          {meta && Object.keys(meta).length > 0 ? (
                            <ul className="space-y-0.5">
                              {Object.entries(meta).map(([k, v]) => (
                                <li key={k}>
                                  <span className="text-gray-500">{k}:</span>{" "}
                                  <span className="font-mono">{String(v)}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Link
                  href={`/admin/audit-log?page=${Math.max(1, page - 1)}`}
                  className={page === 1 ? "pointer-events-none" : ""}
                >
                  <Button variant="outline" size="sm" disabled={page === 1}>
                    Previous
                  </Button>
                </Link>
                <Link
                  href={`/admin/audit-log?page=${Math.min(totalPages, page + 1)}`}
                  className={page === totalPages ? "pointer-events-none" : ""}
                >
                  <Button variant="outline" size="sm" disabled={page === totalPages}>
                    Next
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
