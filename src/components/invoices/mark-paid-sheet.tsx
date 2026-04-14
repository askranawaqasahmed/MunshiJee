"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

interface MarkPaidSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId: string;
  invoiceAmount: number;
  customerId: string;
  onSuccess?: () => void;
}

export function MarkPaidSheet({
  open,
  onOpenChange,
  invoiceId,
  invoiceAmount,
  customerId,
  onSuccess,
}: MarkPaidSheetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [amount, setAmount] = useState(invoiceAmount.toString());
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const [paymentMode, setPaymentMode] = useState<"manual" | "easypaisa">("manual");
  const [transactionType, setTransactionType] = useState<"MA" | "OTC">("MA");
  const [mobileAccountNo, setMobileAccountNo] = useState("");
  const [easypaisaTransaction, setEasypaisaTransaction] = useState<any>(null);
  const [pollingStatus, setPollingStatus] = useState(false);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    if (easypaisaTransaction && easypaisaTransaction.orderId && pollingStatus) {
      pollInterval = setInterval(async () => {
        try {
          const response = await fetch(`/api/easypaisa/status/${easypaisaTransaction.orderId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.transaction.status === 'PAID') {
              setPollingStatus(false);
              setEasypaisaTransaction({ ...easypaisaTransaction, status: 'PAID' });
              setTimeout(() => {
                if (onSuccess) {
                  onSuccess();
                } else {
                  onOpenChange(false);
                  router.refresh();
                }
              }, 2000);
            } else if (data.transaction.status === 'FAILED' || data.transaction.status === 'EXPIRED') {
              setPollingStatus(false);
              setEasypaisaTransaction({ ...easypaisaTransaction, status: data.transaction.status });
            }
          }
        } catch (error) {
          console.error('Error polling transaction status:', error);
        }
      }, 5000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [easypaisaTransaction, pollingStatus, onSuccess, onOpenChange, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const paymentResponse = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          customerId,
          amount: Number(amount),
          paymentDate,
          method,
          reference,
          notes,
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error || "Failed to record payment");
      }

      const invoiceResponse = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "PAID",
        }),
      });

      if (!invoiceResponse.ok) {
        throw new Error("Failed to update invoice status");
      }

      setAmount(invoiceAmount.toString());
      setPaymentDate(new Date().toISOString().split("T")[0]);
      setMethod("CASH");
      setReference("");
      setNotes("");

      if (onSuccess) {
        onSuccess();
      } else {
        onOpenChange(false);
        router.refresh();
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEasypaisaPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/easypaisa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId,
          transactionType,
          mobileAccountNo: transactionType === "MA" ? mobileAccountNo : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.details || data.error || "Failed to initiate payment");
      }

      setEasypaisaTransaction(data.transaction);
      setPollingStatus(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>Record Payment</SheetTitle>
          <SheetDescription>
            Record a manual payment or pay via EasyPaisa gateway
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          <Tabs value={paymentMode} onValueChange={(v) => setPaymentMode(v as "manual" | "easypaisa")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Payment</TabsTrigger>
              <TabsTrigger value="easypaisa">Pay via EasyPaisa</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="mt-6">
              <form onSubmit={handleSubmit} className="space-y-6" id="mark-paid-form">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount *</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                disabled={loading}
                placeholder="0.00"
              />
              <p className="text-sm text-muted-foreground">
                Invoice Amount: Rs.{invoiceAmount.toFixed(2)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Payment Method *</Label>
              <Select value={method} onValueChange={setMethod} disabled={loading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                  <SelectItem value="ONLINE">Online Payment</SelectItem>
                  <SelectItem value="EASYPAISA">EasyPaisa</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                disabled={loading}
                placeholder="Transaction ID, Check number, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                placeholder="Additional payment notes"
              />
            </div>
          </form>
            </TabsContent>

            <TabsContent value="easypaisa" className="mt-6">
              {!easypaisaTransaction ? (
                <form onSubmit={handleEasypaisaPayment} className="space-y-6" id="easypaisa-payment-form">
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-900">Invoice Amount:</span>
                      <span className="text-lg font-bold text-blue-900">Rs.{invoiceAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transactionType">Payment Method *</Label>
                    <Select value={transactionType} onValueChange={(v) => setTransactionType(v as "MA" | "OTC")} disabled={loading}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MA">Mobile Account (MA)</SelectItem>
                        <SelectItem value="OTC">Over The Counter (OTC)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {transactionType === "MA" 
                        ? "Pay directly from EasyPaisa mobile wallet" 
                        : "Get a token to pay at any EasyPaisa shop"}
                    </p>
                  </div>

                  {transactionType === "MA" && (
                    <div className="space-y-2">
                      <Label htmlFor="mobileAccountNo">Mobile Account Number *</Label>
                      <Input
                        id="mobileAccountNo"
                        type="tel"
                        placeholder="03xxxxxxxxx"
                        value={mobileAccountNo}
                        onChange={(e) => setMobileAccountNo(e.target.value)}
                        required
                        disabled={loading}
                        maxLength={11}
                      />
                      <p className="text-sm text-muted-foreground">
                        Enter the 11-digit mobile number linked to EasyPaisa account
                      </p>
                    </div>
                  )}
                </form>
              ) : (
                <div className="space-y-6">
                  {easypaisaTransaction.status === 'PAID' ? (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <AlertDescription className="text-green-800">
                        <strong>Payment Successful!</strong><br />
                        Your payment has been confirmed. The invoice will be marked as paid.
                      </AlertDescription>
                    </Alert>
                  ) : easypaisaTransaction.status === 'FAILED' ? (
                    <Alert className="bg-red-50 border-red-200">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <AlertDescription className="text-red-800">
                        <strong>Payment Failed</strong><br />
                        The payment could not be processed. Please try again or contact support.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <Alert className="bg-blue-50 border-blue-200">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                          <strong>Payment Initiated</strong><br />
                          {easypaisaTransaction.transactionType === 'OTC' 
                            ? 'Visit any EasyPaisa shop with the token below to complete payment.'
                            : 'Complete the payment on your mobile device.'}
                        </AlertDescription>
                      </Alert>

                      <div className="bg-gray-50 border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Order ID:</span>
                          <span className="text-sm font-mono">{easypaisaTransaction.orderId}</span>
                        </div>
                        {easypaisaTransaction.paymentToken && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Payment Token:</span>
                            <span className="text-lg font-bold">{easypaisaTransaction.paymentToken}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Amount:</span>
                          <span className="text-sm font-bold">Rs.{easypaisaTransaction.amount}</span>
                        </div>
                        {easypaisaTransaction.tokenExpiry && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium">Valid Until:</span>
                            <span className="text-sm">{easypaisaTransaction.tokenExpiry}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Status:</span>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            {pollingStatus && <Loader2 className="h-3 w-3 animate-spin" />}
                            PENDING
                          </Badge>
                        </div>
                      </div>

                      {pollingStatus && (
                        <p className="text-sm text-muted-foreground text-center">
                          Checking payment status automatically...
                        </p>
                      )}
                    </>
                  )}

                  <Button 
                    variant="outline" 
                    onClick={() => setEasypaisaTransaction(null)}
                    className="w-full"
                  >
                    Start New Payment
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="border-t pt-4 mt-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          {paymentMode === "manual" ? (
            <Button type="submit" form="mark-paid-form" disabled={loading}>
              {loading ? "Recording Payment..." : "Mark as Paid"}
            </Button>
          ) : (
            !easypaisaTransaction && (
              <Button 
                type="submit" 
                form="easypaisa-payment-form" 
                disabled={loading || (transactionType === "MA" && !mobileAccountNo)}
              >
                {loading ? "Initiating..." : "Initiate Payment"}
              </Button>
            )
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
