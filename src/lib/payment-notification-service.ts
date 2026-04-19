import { prisma } from '@/lib/prisma';
import { WhatsAppService, getWhatsAppSettings } from '@/lib/whatsapp-service';
import { EmailService } from '@/lib/email-service';
import { getEmailSettings } from '@/lib/notification-service';
import { format } from 'date-fns';

export async function sendPaymentConfirmation(paymentId: string): Promise<void> {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: {
            customer: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                emailNotificationsEnabled: true,
                whatsappNotificationsEnabled: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new Error(`Payment ${paymentId} not found`);
    }

    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: payment.invoice.userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: {
        plan: true,
      },
    });

    if (!activeSubscription) {
      console.warn(`User ${payment.invoice.userId} has no active subscription. Skipping payment confirmation.`);
      return;
    }

    const whatsappSettings = await getWhatsAppSettings(null);

    // Send WhatsApp payment confirmation
    if (
      payment.invoice.user.whatsappNotificationsEnabled &&
      whatsappSettings &&
      payment.invoice.customer.phone &&
      activeSubscription.whatsappUsed < activeSubscription.plan.whatsappLimit
    ) {
      await sendWhatsAppPaymentConfirmation(
        payment,
        whatsappSettings,
        activeSubscription.id
      );
    }

    // Send Email payment confirmation (optional)
    const emailSettings = await getEmailSettings(null);
    if (
      payment.invoice.user.emailNotificationsEnabled &&
      emailSettings &&
      payment.invoice.customer.email &&
      activeSubscription.emailsUsed < activeSubscription.plan.emailLimit
    ) {
      await sendEmailPaymentConfirmation(
        payment,
        emailSettings,
        activeSubscription.id
      );
    }
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
  }
}

async function sendWhatsAppPaymentConfirmation(
  payment: any,
  whatsappSettings: any,
  subscriptionId: string
): Promise<void> {
  const logId = await createPaymentNotificationLog({
    paymentId: payment.id,
    invoiceId: payment.invoiceId,
    type: 'WHATSAPP',
    provider: whatsappSettings.provider,
    recipient: payment.invoice.customer.phone,
  });

  try {
    // Check if payment_confirmation template is configured
    const templateName = whatsappSettings.config.templateName;
    const hasPaymentTemplate = templateName === 'payment_confirmation' || 
                               whatsappSettings.config.paymentTemplateName;

    if (!hasPaymentTemplate) {
      console.log('Payment confirmation template not configured, skipping WhatsApp notification');
      await updatePaymentNotificationLog(logId, 'FAILED', 'Payment confirmation template not configured');
      return;
    }

    // Use payment_confirmation template
    const paymentConfig = {
      ...whatsappSettings.config,
      templateName: whatsappSettings.config.paymentTemplateName || 'payment_confirmation',
    };

    const whatsappService = new WhatsAppService({
      provider: 'meta',
      config: paymentConfig,
    });

    const paymentDate = format(new Date(payment.paymentDate), 'dd/MM/yyyy');

    await whatsappService.send({
      to: payment.invoice.customer.phone,
      businessName: payment.invoice.user.name,
      customerName: payment.invoice.customer.name,
      invoiceNumber: payment.invoice.invoiceNumber,
      amount: `Rs.${Number(payment.amount).toFixed(0)}`,
      dueDate: paymentDate, // Using dueDate parameter for payment date
      paymentUrl: payment.invoiceId, // Link to receipt/invoice page
    });

    await updatePaymentNotificationLog(logId, 'SENT', null);

    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { whatsappUsed: { increment: 1 } },
    });

    console.log(`Payment confirmation WhatsApp sent for invoice ${payment.invoice.invoiceNumber}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updatePaymentNotificationLog(logId, 'FAILED', errorMessage);
    console.error('Failed to send WhatsApp payment confirmation:', error);
  }
}

async function sendEmailPaymentConfirmation(
  payment: any,
  emailSettings: any,
  subscriptionId: string
): Promise<void> {
  const logId = await createPaymentNotificationLog({
    paymentId: payment.id,
    invoiceId: payment.invoiceId,
    type: 'EMAIL',
    provider: emailSettings.provider,
    recipient: payment.invoice.customer.email,
  });

  try {
    const emailService = new EmailService(emailSettings);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .info-row:last-child { border-bottom: none; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .footer { text-align: center; color: #666; margin-top: 30px; font-size: 12px; }
            .checkmark { font-size: 48px; color: #10b981; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Payment Received</h1>
              <p>Thank you for your payment!</p>
            </div>
            <div class="content">
              <div class="checkmark">✓</div>
              <p>Hi ${payment.invoice.customer.name},</p>
              <p>We have successfully received your payment. Your invoice is now marked as <strong>PAID</strong>.</p>
              
              <div class="info-box">
                <h3>Payment Details</h3>
                <div class="info-row">
                  <span class="label">Invoice Number:</span>
                  <span class="value">${payment.invoice.invoiceNumber}</span>
                </div>
                <div class="info-row">
                  <span class="label">Amount Paid:</span>
                  <span class="value">Rs.${Number(payment.amount).toFixed(2)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Payment Date:</span>
                  <span class="value">${format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</span>
                </div>
                <div class="info-row">
                  <span class="label">Payment Method:</span>
                  <span class="value">${payment.method.replace('_', ' ')}</span>
                </div>
                ${payment.reference ? `
                <div class="info-row">
                  <span class="label">Reference:</span>
                  <span class="value">${payment.reference}</span>
                </div>
                ` : ''}
              </div>

              <p>We appreciate your business!</p>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If you have any questions, please don't hesitate to contact us.
              </p>
            </div>
            <div class="footer">
              <p>${payment.invoice.user.name}</p>
              <p>Powered by MunshiJee - Invoice Management System</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await emailService.send({
      to: payment.invoice.customer.email,
      subject: `Payment Received - Invoice ${payment.invoice.invoiceNumber}`,
      html: htmlContent,
    });

    await updatePaymentNotificationLog(logId, 'SENT', null);

    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { emailsUsed: { increment: 1 } },
    });

    console.log(`Payment confirmation email sent for invoice ${payment.invoice.invoiceNumber}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updatePaymentNotificationLog(logId, 'FAILED', errorMessage);
    console.error('Failed to send email payment confirmation:', error);
  }
}

async function createPaymentNotificationLog(data: {
  paymentId: string;
  invoiceId: string;
  type: 'EMAIL' | 'WHATSAPP';
  provider: string;
  recipient: string;
}): Promise<string> {
  const log = await prisma.notificationLog.create({
    data: {
      invoiceId: data.invoiceId,
      type: data.type,
      provider: data.provider,
      recipient: data.recipient,
      status: 'PENDING',
    },
  });

  return log.id;
}

async function updatePaymentNotificationLog(
  logId: string,
  status: 'SENT' | 'FAILED',
  errorMessage: string | null
): Promise<void> {
  await prisma.notificationLog.update({
    where: { id: logId },
    data: {
      status,
      errorMessage,
      sentAt: status === 'SENT' ? new Date() : null,
    },
  });
}
