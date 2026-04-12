"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { CustomerSidebar } from "@/components/layout/customer-sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, formatPaymentMethod } from "@/lib/utils";
import { Pagination } from "@/components/ui/pagination";

export default function PaymentsPage() {
  const { data: session, status } = useSession();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
  }, [status]);

  useEffect(() => {
    fetchPayments();
  }, [currentPage]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/payments?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdmin = session.user.role === "SUPER_ADMIN";

  return (
    <div className="flex h-screen overflow-hidden">
      {isAdmin ? (
        <AdminSidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      ) : (
        <CustomerSidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-6">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Payments</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                View all payment transactions
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent className="p-0 sm:p-6">
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground px-4">
                    No payments found.
                  </div>
                ) : (
                  <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {isAdmin && <TableHead>Customer</TableHead>}
                            <TableHead>Invoice</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead>Payment Date</TableHead>
                            <TableHead>Reference</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payments.map((payment: any) => (
                            <TableRow key={payment.id}>
                              {isAdmin && (
                                <TableCell className="font-medium">
                                  {payment.customer.name}
                                </TableCell>
                              )}
                              <TableCell>{payment.invoice.invoiceNumber}</TableCell>
                              <TableCell>
                                {formatCurrency(Number(payment.amount))}
                              </TableCell>
                              <TableCell>
                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                                  {formatPaymentMethod(payment.method)}
                                </span>
                              </TableCell>
                              <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                              <TableCell>
                                {payment.reference || (
                                  <span className="text-muted-foreground">-</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4">
                      {payments.map((payment: any) => (
                        <div
                          key={payment.id}
                          className="border rounded-lg p-4 space-y-3 bg-white"
                        >
                          {isAdmin && (
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-base">{payment.customer.name}</h3>
                              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 whitespace-nowrap">
                                {formatPaymentMethod(payment.method)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Invoice:</span>
                            <span className="font-medium">{payment.invoice.invoiceNumber}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Amount:</span>
                            <span className="font-semibold">{formatCurrency(Number(payment.amount))}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Date:</span>
                            <span>{formatDate(payment.paymentDate)}</span>
                          </div>
                          {payment.reference && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Reference:</span>
                              <span>{payment.reference}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
              {!loading && payments.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
