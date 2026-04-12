"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AddSaleSheet } from "@/components/sales/add-sale-sheet";
import { Pagination } from "@/components/ui/pagination";

export default function SalesPage() {
  const { data: session, status } = useSession();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/login");
    }
    if (session?.user?.role !== "SUPER_ADMIN") {
      redirect("/dashboard");
    }
  }, [session, status]);

  useEffect(() => {
    fetchSales();
  }, [currentPage]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      const response = await fetch(`/api/sales?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSales(data.sales || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch sales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setAddSheetOpen(false);
    setCurrentPage(1);
    fetchSales();
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Sales</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage sales entries for bulk invoicing</p>
        </div>
        <Button onClick={() => setAddSheetOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Sale
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground px-4">
              No sales found. Add sales entries to generate bulk invoices.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Sale Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sales.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell className="font-medium">
                          {sale.customer.name}
                        </TableCell>
                        <TableCell>{sale.description}</TableCell>
                        <TableCell>{formatCurrency(Number(sale.amount))}</TableCell>
                        <TableCell>{formatDate(sale.saleDate)}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              sale.invoiced
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {sale.invoiced ? "Invoiced" : "Pending"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {sale.invoice ? (
                            <Link
                              href={`/invoices/${sale.invoice.id}`}
                              className="text-primary hover:underline"
                            >
                              {sale.invoice.invoiceNumber}
                            </Link>
                          ) : (
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
                {sales.map((sale: any) => (
                  <div
                    key={sale.id}
                    className="border rounded-lg p-4 space-y-3 bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-base">{sale.customer.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{sale.description}</p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                          sale.invoiced
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {sale.invoiced ? "Invoiced" : "Pending"}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">{formatCurrency(Number(sale.amount))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sale Date:</span>
                      <span>{formatDate(sale.saleDate)}</span>
                    </div>
                    {sale.invoice && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Invoice:</span>
                        <Link
                          href={`/invoices/${sale.invoice.id}`}
                          className="text-primary hover:underline"
                        >
                          {sale.invoice.invoiceNumber}
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
        {!loading && sales.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      <AddSaleSheet 
        open={addSheetOpen} 
        onOpenChange={setAddSheetOpen}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
