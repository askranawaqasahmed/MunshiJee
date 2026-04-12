export interface InvoiceEmailData {
  customerName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  pdfDownloadUrl: string;
}

export function getInvoiceEmailTemplate(data: InvoiceEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
      line-height: 1.6;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 20px;
    }
    .invoice-details {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 20px;
      margin: 25px 0;
    }
    .invoice-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .invoice-row:last-child {
      border-bottom: none;
      font-weight: 600;
      font-size: 18px;
      color: #667eea;
    }
    .invoice-label {
      color: #666666;
      font-weight: 500;
    }
    .invoice-value {
      color: #333333;
      font-weight: 600;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 15px 40px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      margin: 20px 0;
      text-align: center;
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 25px 30px;
      text-align: center;
      color: #666666;
      font-size: 14px;
    }
    .footer p {
      margin: 5px 0;
    }
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, #667eea, transparent);
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>📄 Invoice Ready</h1>
    </div>
    
    <div class="content">
      <p class="greeting">Hi ${data.customerName},</p>
      
      <p>Your invoice has been generated and is ready for review. Please find the details below:</p>
      
      <div class="invoice-details">
        <div class="invoice-row">
          <span class="invoice-label">Invoice Number:</span>
          <span class="invoice-value">${data.invoiceNumber}</span>
        </div>
        <div class="invoice-row">
          <span class="invoice-label">Due Date:</span>
          <span class="invoice-value">${data.dueDate}</span>
        </div>
        <div class="invoice-row">
          <span class="invoice-label">Amount:</span>
          <span class="invoice-value">${data.amount}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <p style="text-align: center; color: #666666;">Click the button below to download your invoice as PDF:</p>
      
      <div class="button-container">
        <a href="${data.pdfDownloadUrl}" class="cta-button">Download Invoice PDF</a>
      </div>
      
      <p style="font-size: 14px; color: #666666; margin-top: 30px;">
        If you have any questions about this invoice, please don't hesitate to contact us.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>MunshiJee</strong></p>
      <p>This is an automated message, please do not reply to this email.</p>
      <p style="margin-top: 15px; font-size: 12px;">
        Download link expires in 30 days
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export interface TestEmailData {
  recipientName: string;
  testMessage: string;
}

export function getTestEmailTemplate(data: TestEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Test Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f4f4;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .success-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    h1 {
      color: #22c55e;
      margin: 0;
    }
    p {
      color: #666666;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="success-icon">✅</div>
      <h1>Email Configuration Successful!</h1>
    </div>
    <p>Hi ${data.recipientName},</p>
    <p>${data.testMessage}</p>
    <p style="margin-top: 30px; font-size: 14px; color: #999999;">
      This is a test email from MunshiJee invoice management system.
    </p>
  </div>
</body>
</html>
  `.trim();
}
