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
import { CustomerSelector } from "@/components/forms/customer-selector";

interface AddBulkInvoiceSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddBulkInvoiceSheet({
  open,
  onOpenChange,
  onSuccess,
}: AddBulkInvoiceSheetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [billingDate, setBillingDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [sales, setSales] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  useEffect(() => {
    if (customerId) {
      fetchUninvoicedSales(customerId);
    } else {
      setSales([]);
    }
  }, [customerId]);

  const fetchUninvoicedSales = async (custId: string) => {
    setLoadingSales(true);
    try {
      const response = await fetch("/api/sales");
      const data = await response.json();

      const customerSales = (data.sales || []).filter(
        (sale: any) => sale.customerId === custId && !sale.invoiced
      );

      setSales(customerSales);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoadingSales(false);
    }
  };

  const totalAmount = sales.reduce((sum, sale) => sum + Number(sale.amount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (sales.length === 0) {
      setError("No un-invoiced sales found for this customer");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const items = sales.map((sale) => ({
        description: sale.description,
        quantity: 1,
        unitPrice: Number(sale.amount),
        total: Number(sale.amount),
      }));

      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          type: "BULK",
          amount: totalAmount,
          status: "SENT",
          billingDate,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          notes: `Bulk invoice for period ending ${new Date().toLocaleDateString()}`,
          items,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create invoice");
      }

      for (const sale of sales) {
        await fetch(`/api/sales/${sale.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoiced: true,
            invoiceId: data.invoice.id,
          }),
        });
      }

      // Reset form
      setCustomerId("");
      setBillingDate(new Date().toISOString().split("T")[0]);
      setSales([]);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Create Bulk Invoice</SheetTitle>
          <SheetDescription>
            Generate an invoice from all uninvoiced sales for a customer.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <CustomerSelector
            value={customerId}
            onChange={setCustomerId}
            disabled={loading}
          />

          <div className="space-y-2">
            <Label htmlFor="billingDate">Billing Date *</Label>
            <Input
              id="billingDate"
              type="date"
              value={billingDate}
              onChange={(e) => setBillingDate(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {customerId && (
            <div className="space-y-4 border-t pt-4">
              <Label>Un-invoiced Sales</Label>
              {loadingSales ? (
                <div className="text-sm text-muted-foreground">
                  Loading sales...
                </div>
              ) : sales.length === 0 ? (
                <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-md">
                  No un-invoiced sales found for this customer.
                </div>
              ) : (
                <div className="space-y-2">
                  {sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <div className="font-medium">{sale.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(sale.saleDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="font-semibold">
                        ${Number(sale.amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end pt-2 border-t">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Total Amount
                      </div>
                      <div className="text-2xl font-bold">
                        ${totalAmount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <SheetFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !customerId || sales.length === 0}
            >
              {loading ? "Creating..." : "Generate Bulk Invoice"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
