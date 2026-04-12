"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Filter } from "lucide-react";
import { formatCurrency, formatDate, formatInvoiceType } from "@/lib/utils";
import { AddOneTimeInvoiceSheet } from "@/components/invoices/add-onetime-invoice-sheet";
import { AddRecurringInvoiceSheet } from "@/components/invoices/add-recurring-invoice-sheet";
import { AddBulkInvoiceSheet } from "@/components/invoices/add-bulk-invoice-sheet";
import { Pagination } from "@/components/ui/pagination";

export default function InvoicesPage() {
  const { data: session, status } = useSession();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [oneTimeSheetOpen, setOneTimeSheetOpen] = useState(false);
  const [recurringSheetOpen, setRecurringSheetOpen] = useState(false);
  const [bulkSheetOpen, setBulkSheetOpen] = useState(false);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, selectedCustomer, selectedStatus]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (selectedCustomer !== "all") {
        params.append("customerId", selectedCustomer);
      }

      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const response = await fetch(`/api/invoices?${params}`);
      if (response.ok) {
        const data = await response.json();
        setInvoices(data.invoices || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  const handleOneTimeSuccess = () => {
    setOneTimeSheetOpen(false);
    setCurrentPage(1);
    fetchInvoices();
  };

  const handleRecurringSuccess = () => {
    setRecurringSheetOpen(false);
    setCurrentPage(1);
    fetchInvoices();
  };

  const handleBulkSuccess = () => {
    setBulkSheetOpen(false);
    setCurrentPage(1);
    fetchInvoices();
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
          <h1 className="text-2xl sm:text-3xl font-bold">Invoices</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage all invoices</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOneTimeSheetOpen(true)} className="w-full sm:w-auto text-xs sm:text-sm">
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            One-Time
          </Button>
          <Button variant="outline" onClick={() => setRecurringSheetOpen(true)} className="w-full sm:w-auto text-xs sm:text-sm">
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Recurring
          </Button>
          <Button onClick={() => setBulkSheetOpen(true)} className="w-full sm:w-auto text-xs sm:text-sm">
            <Plus className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Bulk Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices</CardTitle>
            <Filter className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label>Customer</Label>
              <Select
                value={selectedCustomer}
                onValueChange={(value) => {
                  setSelectedCustomer(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Customers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  handleFilterChange();
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="SENT">Sent</SelectItem>
                  <SelectItem value="PAID">Paid</SelectItem>
                  <SelectItem value="OVERDUE">Overdue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground px-4">
              No invoices found. Create your first invoice to get started.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice: any) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.invoiceNumber}
                        </TableCell>
                        <TableCell>{invoice.customer.name}</TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                            {formatInvoiceType(invoice.type)}
                          </span>
                        </TableCell>
                        <TableCell>{formatCurrency(Number(invoice.amount))}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex px-2 py-1 text-xs rounded-full ${
                              invoice.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : invoice.status === "OVERDUE"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {invoice.status}
                          </span>
                        </TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell className="text-right">
                          <Link href={`/invoices/${invoice.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4 p-4">
                {invoices.map((invoice: any) => (
                  <div
                    key={invoice.id}
                    className="border rounded-lg p-4 space-y-3 bg-white"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-sm">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-muted-foreground">{invoice.customer.name}</p>
                      </div>
                      <span
                        className={`inline-flex px-2 py-1 text-xs rounded-full ${
                          invoice.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "OVERDUE"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="font-semibold">{formatCurrency(Number(invoice.amount))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Due Date:</span>
                      <span>{formatDate(invoice.dueDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                        {formatInvoiceType(invoice.type)}
                      </span>
                    </div>
                    <Link href={`/invoices/${invoice.id}`} className="block">
                      <Button variant="outline" size="sm" className="w-full">
                        View Invoice
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
        {!loading && invoices.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </Card>

      <AddOneTimeInvoiceSheet
        open={oneTimeSheetOpen}
        onOpenChange={setOneTimeSheetOpen}
        onSuccess={handleOneTimeSuccess}
      />
      <AddRecurringInvoiceSheet
        open={recurringSheetOpen}
        onOpenChange={setRecurringSheetOpen}
        onSuccess={handleRecurringSuccess}
      />
      <AddBulkInvoiceSheet
        open={bulkSheetOpen}
        onOpenChange={setBulkSheetOpen}
        onSuccess={handleBulkSuccess}
      />
    </div>
  );
}
