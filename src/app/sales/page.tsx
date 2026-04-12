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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-muted-foreground">Manage sales entries for bulk invoicing</p>
        </div>
        <Button onClick={() => setAddSheetOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sale
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sales</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No sales found. Add sales entries to generate bulk invoices.
            </div>
          ) : (
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
