import { prisma } from "./prisma";
import ReactPDF from "@react-pdf/renderer";

export async function generateInvoicePDF(invoiceId: string): Promise<Buffer> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      customer: true,
      items: true,
      payments: true,
    },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const totalPaid = invoice.payments.reduce(
    (sum, payment) => sum + Number(payment.amount),
    0
  );
  const balance = Number(invoice.amount) - totalPaid;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
    .company { font-size: 28px; font-weight: bold; color: #3b82f6; }
    .invoice-title { font-size: 24px; color: #666; }
    .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .info-block { flex: 1; }
    .info-block h3 { font-size: 14px; color: #666; margin-bottom: 10px; }
    .info-block p { margin: 5px 0; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    th { background: #f3f4f6; padding: 12px; text-align: left; font-size: 12px; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
    .total-section { margin-top: 20px; text-align: right; }
    .total-row { display: flex; justify-content: flex-end; margin: 8px 0; }
    .total-label { width: 150px; font-weight: bold; }
    .total-value { width: 120px; text-align: right; }
    .grand-total { font-size: 18px; color: #3b82f6; padding-top: 10px; border-top: 2px solid #e5e7eb; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 11px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company">MunshiJee</div>
      <p style="margin-top: 5px; font-size: 12px; color: #666;">Professional Invoicing System</p>
    </div>
    <div style="text-align: right;">
      <div class="invoice-title">INVOICE</div>
      <p style="margin-top: 5px; font-size: 14px;">#${invoice.invoiceNumber}</p>
    </div>
  </div>
  
  <div class="info-section">
    <div class="info-block">
      <h3>Bill To:</h3>
      <p><strong>${invoice.customer.name}</strong></p>
      <p>${invoice.customer.email}</p>
      <p>${invoice.customer.phone}</p>
      ${invoice.customer.contactAddress ? `<p>${invoice.customer.contactAddress}</p>` : ""}
    </div>
    <div class="info-block" style="text-align: right;">
      <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
      <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
      <p><strong>Status:</strong> <span style="color: ${
        invoice.status === "PAID" ? "#10b981" : "#f59e0b"
      }">${invoice.status}</span></p>
      ${invoice.isRecurring ? `<p><strong>Type:</strong> Recurring (${invoice.recurringFrequency})</p>` : ""}
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th style="text-align: center;">Quantity</th>
        <th style="text-align: right;">Unit Price</th>
        <th style="text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${invoice.items
        .map(
          (item) => `
        <tr>
          <td>${item.description}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">$${Number(item.unitPrice).toFixed(2)}</td>
          <td style="text-align: right;">$${Number(item.total).toFixed(2)}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  
  <div class="total-section">
    <div class="total-row">
      <div class="total-label">Subtotal:</div>
      <div class="total-value">$${Number(invoice.amount).toFixed(2)}</div>
    </div>
    ${
      totalPaid > 0
        ? `
      <div class="total-row">
        <div class="total-label">Paid:</div>
        <div class="total-value">-$${totalPaid.toFixed(2)}</div>
      </div>
    `
        : ""
    }
    <div class="total-row grand-total">
      <div class="total-label">Balance Due:</div>
      <div class="total-value">$${balance.toFixed(2)}</div>
    </div>
  </div>
  
  ${invoice.notes ? `<div style="margin-top: 30px;"><p><strong>Notes:</strong></p><p style="margin-top: 5px; font-size: 12px;">${invoice.notes}</p></div>` : ""}
  
  <div class="footer">
    <p>Thank you for your business!</p>
    <p style="margin-top: 5px;">For any questions, please contact support@munshijee.com</p>
  </div>
</body>
</html>
  `;

  return Buffer.from(html, "utf-8");
}
