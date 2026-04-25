"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Mail, MessageSquare, CheckCircle, XCircle, Clock, MessageCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface NotificationLog {
  id: string;
  type: "EMAIL" | "SMS" | "WHATSAPP";
  status: "PENDING" | "SENT" | "FAILED";
  provider: string;
  recipient: string;
  errorMessage: string | null;
  createdAt: string;
  sentAt: string | null;
  invoice: {
    id: string;
    invoiceNumber: string;
    customer: {
      name: string;
    };
  };
}

interface Stats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  email: number;
  sms: number;
  whatsapp: number;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    email: 0,
    sms: 0,
    whatsapp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchLogs();
  }, [page, typeFilter, statusFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(typeFilter !== "all" && { type: typeFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
      });

      const response = await fetch(`/api/logs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setLogs(data.logs);
        setStats(data.stats);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "EMAIL":
        return <Mail className="h-5 w-5 text-blue-600" />;
      case "SMS":
        return <MessageSquare className="h-5 w-5 text-purple-600" />;
      case "WHATSAPP":
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SENT":
        return <Badge variant="default" className="bg-green-600">SENT</Badge>;
      case "FAILED":
        return <Badge variant="destructive">FAILED</Badge>;
      case "PENDING":
        return <Badge variant="secondary">PENDING</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Notification Logs</h1>
        <p className="text-gray-600 mt-1">Track all your notification delivery status</p>
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
            <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
            <MessageCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.whatsapp}</div>
            <p className="text-xs text-muted-foreground">Total WhatsApp</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Notification History</CardTitle>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="EMAIL">Email</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : logs.length > 0 ? (
            <>
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start justify-between border-b pb-4 last:border-0"
                  >
                    <div className="flex items-start space-x-3 flex-1">
                      {getTypeIcon(log.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{log.invoice.invoiceNumber}</p>
                          <Badge 
                            variant="outline" 
                            className={
                              log.type === "EMAIL" 
                                ? "bg-blue-50 text-blue-700 border-blue-200" 
                                : log.type === "SMS"
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : "bg-green-50 text-green-700 border-green-200"
                            }
                          >
                            {log.type}
                          </Badge>
                          {log.status === "SENT" && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              ✓ Delivered
                            </Badge>
                          )}
                          {log.status === "FAILED" && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              ✗ Failed
                            </Badge>
                          )}
                          {log.status === "PENDING" && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              ⏳ Pending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Customer: <span className="font-medium">{log.invoice.customer.name}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          To: <span className="font-medium">{log.recipient}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(log.createdAt), "MMM dd, yyyy 'at' HH:mm:ss")}
                        </p>
                        {log.sentAt && log.status === "SENT" && (
                          <p className="text-xs text-green-600 mt-1">
                            ✓ Sent at {format(new Date(log.sentAt), "HH:mm:ss")}
                          </p>
                        )}
                        {log.errorMessage && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                            <p className="text-xs text-red-700 font-semibold flex items-center gap-1">
                              <XCircle className="h-3 w-3" />
                              Error Details:
                            </p>
                            <p className="text-xs text-red-600 mt-1 break-words font-mono">
                              {log.errorMessage}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2 ml-4">
                      {getStatusBadge(log.status)}
                      <span className="text-xs text-gray-500 whitespace-nowrap bg-gray-100 px-2 py-1 rounded">{log.provider}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-8">No notification logs yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
