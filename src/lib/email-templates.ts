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

export interface WelcomeEmailData {
  name: string;
  email: string;
}

export function getWelcomeEmailTemplate(data: WelcomeEmailData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to MunshiJee</title>
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
      padding: 40px 30px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: 600;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.9;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333333;
      margin-bottom: 20px;
    }
    .welcome-message {
      background-color: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 25px 0;
      border-radius: 4px;
    }
    .credentials-box {
      background-color: #f8f9fa;
      border-radius: 6px;
      padding: 20px;
      margin: 25px 0;
    }
    .credential-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    .credential-row:last-child {
      border-bottom: none;
    }
    .credential-label {
      color: #666666;
      font-weight: 500;
    }
    .credential-value {
      color: #333333;
      font-weight: 600;
      word-break: break-all;
    }
    .features-list {
      margin: 25px 0;
    }
    .features-list li {
      color: #666666;
      margin: 10px 0;
      padding-left: 10px;
    }
    .features-list li::marker {
      color: #667eea;
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
      <h1>Welcome to MunshiJee! 🎉</h1>
      <p>Your Invoice Management System</p>
    </div>
    
    <div class="content">
      <p class="greeting">Hi ${data.name},</p>
      
      <div class="welcome-message">
        <p style="margin: 0; color: #333333;">
          Thank you for signing up! Your account has been successfully created and you're ready to start managing your invoices, customers, and sales with ease.
        </p>
      </div>
      
      <p>Your account details:</p>
      
      <div class="credentials-box">
        <div class="credential-row">
          <span class="credential-label">Email:</span>
          <span class="credential-value">${data.email}</span>
        </div>
        <div class="credential-row">
          <span class="credential-label">Name:</span>
          <span class="credential-value">${data.name}</span>
        </div>
      </div>
      
      <div class="divider"></div>
      
      <h3 style="color: #333333;">What you can do with MunshiJee:</h3>
      
      <ul class="features-list">
        <li>Create and manage invoices (one-time, recurring, and bulk)</li>
        <li>Track customers and their payment history</li>
        <li>Record sales and generate invoices from sales data</li>
        <li>Send professional invoice emails to your customers</li>
        <li>Configure your email settings for delivery via Resend</li>
        <li>Monitor payments and track overdue invoices</li>
      </ul>
      
      <p style="margin-top: 30px; color: #666666;">
        Ready to get started? Log in to your dashboard and explore all the features MunshiJee has to offer!
      </p>
      
      <p style="font-size: 14px; color: #666666; margin-top: 30px;">
        If you have any questions or need assistance, please don't hesitate to reach out to our support team.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>MunshiJee</strong></p>
      <p>Professional Invoice Management System</p>
      <p style="margin-top: 15px; font-size: 12px;">
        This is an automated message. Please do not reply to this email.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export interface PlanChangedEmailData {
  name: string;
  planName: string;
  emailLimit: number;
  smsLimit: number;
  whatsappLimit: number;
  endDate: string;
  isUpgrade: boolean;
}

export function getPlanChangedEmailTemplate(data: PlanChangedEmailData): string {
  const headline = data.isUpgrade
    ? `Welcome to ${data.planName}!`
    : `Your plan has been updated to ${data.planName}`;
  const body = data.isUpgrade
    ? `Great news! A super admin has activated the <strong>${data.planName}</strong> plan on your MunshiJee account. You now have higher limits to send invoices and notifications.`
    : `A super admin has updated your MunshiJee subscription to the <strong>${data.planName}</strong> plan. Your new limits are shown below.`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${headline}</title>
  <style>
    body { margin:0; padding:0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background:#f4f4f4; line-height:1.6; }
    .email-container { max-width:600px; margin:20px auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg,#3b82f6 0%,#1e40af 100%); padding:40px 30px; text-align:center; color:#ffffff; }
    .header h1 { margin:0; font-size:26px; font-weight:600; }
    .content { padding:30px; color:#333; font-size:15px; }
    .plan-card { background:#f8f9fa; border-radius:6px; padding:20px; margin:25px 0; }
    .row { display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e9ecef; }
    .row:last-child { border-bottom:none; }
    .label { color:#6c757d; }
    .value { font-weight:600; color:#212529; }
    .footer { background:#212529; padding:20px; text-align:center; color:#adb5bd; font-size:13px; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header"><h1>${headline}</h1></div>
    <div class="content">
      <p>Hi ${data.name},</p>
      <p>${body}</p>
      <div class="plan-card">
        <div class="row"><span class="label">Plan</span><span class="value">${data.planName}</span></div>
        <div class="row"><span class="label">Email limit</span><span class="value">${data.emailLimit.toLocaleString()}</span></div>
        <div class="row"><span class="label">SMS limit</span><span class="value">${data.smsLimit.toLocaleString()}</span></div>
        <div class="row"><span class="label">WhatsApp limit</span><span class="value">${data.whatsappLimit.toLocaleString()}</span></div>
        <div class="row"><span class="label">Valid until</span><span class="value">${data.endDate}</span></div>
      </div>
      <p>Log in to your dashboard to start using your new limits.</p>
    </div>
    <div class="footer">
      <p>MunshiJee &mdash; Professional Invoice Management</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
