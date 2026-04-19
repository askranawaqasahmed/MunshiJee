"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle, AlertCircle, Loader2, Building2, Mail, Phone, MapPin } from "lucide-react";

export default function PaymentPage() {
  const params = useParams();
  const invoiceId = params.invoiceId as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/payment/invoice/${invoiceId}`);
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

  const handlePayNow = async () => {
    setPaying(true);
    // TODO: Integrate payment gateway here in future
    // For now, just show a message
    alert("Payment gateway integration coming soon! This button will redirect to payment processing.");
    setPaying(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading invoice details...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <CardTitle>Invoice Not Found</CardTitle>
                <CardDescription>Unable to load invoice details</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error || "The requested invoice could not be found. Please check the link and try again."}
            </p>
            <Button 
              onClick={() => window.location.href = "/"}
              variant="outline"
              className="w-full"
            >
              Go to Home
            </Button>
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
  const isPaid = invoice.status === "PAID" || remainingBalance <= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Invoice Payment</h1>
          <p className="text-gray-600">Review your invoice and make payment securely</p>
        </div>

        {/* Status Alert */}
        {isPaid && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800">
              This invoice has been paid in full. Thank you for your payment!
            </AlertDescription>
          </Alert>
        )}

        {/* Invoice Summary Card */}
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">Invoice {invoice.invoiceNumber}</CardTitle>
                <CardDescription className="text-blue-100 mt-1">
                  Issued by {invoice.user.name}
                </CardDescription>
              </div>
              <Badge 
                variant={isPaid ? "default" : invoice.status === "OVERDUE" ? "destructive" : "secondary"}
                className={`text-sm ${isPaid ? 'bg-green-500' : ''}`}
              >
                {isPaid ? "PAID" : invoice.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bill To
                </h3>
                <div className="space-y-2">
                  <p className="font-semibold text-gray-900">{invoice.customer.name}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {invoice.customer.email}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {invoice.customer.phone}
                  </p>
                  {invoice.customer.contactAddress && (
                    <p className="text-sm text-gray-600 flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5" />
                      {invoice.customer.contactAddress}
                    </p>
                  )}
                </div>
              </div>

              {/* Invoice Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  Invoice Details
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Invoice Date:</span>
                    <span className="text-sm font-medium">{formatDate(invoice.issueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Due Date:</span>
                    <span className="text-sm font-medium text-red-600">{formatDate(invoice.dueDate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Invoice Type:</span>
                    <span className="text-sm font-medium capitalize">{invoice.type.toLowerCase().replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
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
                </TableBody>
              </Table>
            </div>

            {/* Payment Summary */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(Number(invoice.amount))}
                  </span>
                </div>
                {totalPaid > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Amount Paid:</span>
                      <span className="text-green-600 font-medium">
                        -{formatCurrency(totalPaid)}
                      </span>
                    </div>
                    <div className="h-px bg-gray-300 my-2"></div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Amount Due:</span>
                      <span className={remainingBalance > 0 ? "text-red-600" : "text-green-600"}>
                        {formatCurrency(remainingBalance)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Payment History */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Payment History</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.payments.map((payment: any) => (
                        <TableRow key={payment.id}>
                          <TableCell>{formatDate(payment.paymentDate)}</TableCell>
                          <TableCell className="capitalize">
                            {payment.method.toLowerCase().replace('_', ' ')}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(Number(payment.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                <p className="text-sm text-gray-600">{invoice.notes}</p>
              </div>
            )}

            {/* Pay Now Button */}
            {!isPaid && remainingBalance > 0 && (
              <div className="mt-6">
                <Button
                  onClick={handlePayNow}
                  disabled={paying}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold shadow-lg"
                >
                  {paying ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay Now - {formatCurrency(remainingBalance)}
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  Payment gateway integration coming soon
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>Powered by MunshiJee - Invoice Management System</p>
          <p className="mt-1">For support, contact: {invoice.user.email}</p>
        </div>
      </div>
    </div>
  );
}
