"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { ArrowLeft, Download, Trash2, CheckCircle } from "lucide-react";
import { formatCurrency, formatDate, formatInvoiceType, formatPaymentMethod } from "@/lib/utils";
import { MarkPaidSheet } from "@/components/invoices/mark-paid-sheet";

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [markPaidSheetOpen, setMarkPaidSheetOpen] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch invoice");
      }

      setInvoice(data.invoice);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`);
      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoice?.invoiceNumber || invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete invoice");
      }

      router.push("/invoices");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Failed to delete invoice");
      setDeleting(false);
    }
  };

  const handleMarkPaidSuccess = () => {
    setMarkPaidSheetOpen(false);
    fetchInvoice();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading invoice...</div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Invoice Not Found</h1>
        </div>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {error || "The requested invoice could not be found."}
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalPaid = invoice.payments?.reduce(
    (sum: number, payment: any) => sum + Number(payment.amount),
    0
  ) || 0;
  const remainingBalance = Number(invoice.amount) - totalPaid;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/invoices">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              Invoice {invoice.invoiceNumber}
            </h1>
            <p className="text-muted-foreground">
              View invoice details and download PDF
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {session?.user?.role === "SUPER_ADMIN" && invoice.status !== "PAID" && (
            <Button
              variant="default"
              onClick={() => setMarkPaidSheetOpen(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
          {session?.user?.role === "SUPER_ADMIN" && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Invoice #</div>
                <div className="font-medium">{invoice.invoiceNumber}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
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
              <div>
                <div className="text-sm text-muted-foreground">Type</div>
                <div className="font-medium">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                    {formatInvoiceType(invoice.type)}
                  </span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">
                  Billing Date
                </div>
                <div className="font-medium">
                  {formatDate(invoice.issueDate)}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Due Date</div>
                <div className="font-medium">{formatDate(invoice.dueDate)}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Amount</div>
                <div className="font-medium text-lg">
                  {formatCurrency(Number(invoice.amount))}
                </div>
              </div>
            </div>

            {invoice.isRecurring && (
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  Recurring Invoice
                </div>
                <div className="font-medium">
                  {invoice.recurringFrequency}
                </div>
                {invoice.nextBillingDate && (
                  <div className="text-sm text-muted-foreground mt-2">
                    Next billing:{" "}
                    <span className="font-medium">
                      {formatDate(invoice.nextBillingDate)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {invoice.notes && (
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">Notes</div>
                <div className="text-sm">{invoice.notes}</div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="font-medium">{invoice.customer.name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Email</div>
              <div className="text-sm">{invoice.customer.email}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Phone</div>
              <div className="text-sm">{invoice.customer.phone}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">
                Contact Address
              </div>
              <div className="text-sm">{invoice.customer.contactAddress || "N/A"}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(Number(item.unitPrice))}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(Number(item.total))}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={3} className="text-right font-bold">
                  Total Amount
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {formatCurrency(Number(invoice.amount))}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {invoice.payments && invoice.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                        {formatPaymentMethod(payment.method)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.reference || "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(Number(payment.amount))}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} className="text-right font-bold">
                    Total Paid
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(totalPaid)}
                  </TableCell>
                </TableRow>
                {remainingBalance > 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-right font-bold">
                      Remaining Balance
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">
                      {formatCurrency(remainingBalance)}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {session?.user?.role === "SUPER_ADMIN" && (
        <MarkPaidSheet
          open={markPaidSheetOpen}
          onOpenChange={setMarkPaidSheetOpen}
          invoiceId={invoiceId}
          invoiceAmount={Number(invoice.amount)}
          customerId={invoice.customerId}
          onSuccess={handleMarkPaidSuccess}
        />
      )}
    </div>
  );
}
