import { prisma } from '@/lib/prisma';
import { EmailService, EmailConfig } from '@/lib/email-service';
import { SmsService, SmsConfig } from '@/lib/sms-service';
import { generatePdfToken } from '@/lib/pdf-token';
import { getInvoiceEmailTemplate } from '@/lib/email-templates';
import { format } from 'date-fns';

export async function sendInvoiceNotification(invoiceId: string): Promise<void> {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        customer: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    const pdfToken = generatePdfToken(invoiceId);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const pdfDownloadUrl = `${baseUrl}/api/invoices/pdf/${pdfToken}`;

    const emailSettings = await getEmailSettings();
    const smsSettings = await getSmsSettings();

    const invoiceData = {
      customerName: invoice.customer.name,
      invoiceNumber: invoice.invoiceNumber,
      amount: `$${invoice.amount.toFixed(2)}`,
      dueDate: format(new Date(invoice.dueDate), 'MMM dd, yyyy'),
      pdfDownloadUrl,
    };

    if (emailSettings && invoice.customer.email) {
      await sendEmailNotification(
        invoiceId,
        invoice.customer.email,
        emailSettings,
        invoiceData
      );
    }

    if (smsSettings && invoice.customer.phone) {
      await sendSmsNotification(
        invoiceId,
        invoice.customer.phone,
        smsSettings,
        invoiceData
      );
    }
  } catch (error) {
    console.error('Error sending invoice notification:', error);
  }
}

async function sendEmailNotification(
  invoiceId: string,
  recipientEmail: string,
  emailSettings: EmailConfig,
  invoiceData: {
    customerName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    pdfDownloadUrl: string;
  }
): Promise<void> {
  const logId = await createNotificationLog({
    invoiceId,
    type: 'EMAIL',
    provider: emailSettings.provider,
    recipient: recipientEmail,
  });

  try {
    const emailService = new EmailService(emailSettings);
    const htmlContent = getInvoiceEmailTemplate(invoiceData);

    await emailService.send({
      to: recipientEmail,
      subject: `Invoice ${invoiceData.invoiceNumber} - MunshiJee`,
      html: htmlContent,
    });

    await updateNotificationLog(logId, 'SENT', null);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateNotificationLog(logId, 'FAILED', errorMessage);
    throw error;
  }
}

async function sendSmsNotification(
  invoiceId: string,
  recipientPhone: string,
  smsSettings: SmsConfig,
  invoiceData: {
    customerName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    pdfDownloadUrl: string;
  }
): Promise<void> {
  const logId = await createNotificationLog({
    invoiceId,
    type: 'SMS',
    provider: smsSettings.provider,
    recipient: recipientPhone,
  });

  try {
    const smsService = new SmsService(smsSettings);
    
    const smsMessage = `Hi ${invoiceData.customerName}, your invoice ${invoiceData.invoiceNumber} for ${invoiceData.amount} is ready. Due: ${invoiceData.dueDate}. Download: ${invoiceData.pdfDownloadUrl}`;

    await smsService.send({
      to: recipientPhone,
      message: smsMessage,
    });

    await updateNotificationLog(logId, 'SENT', null);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateNotificationLog(logId, 'FAILED', errorMessage);
    throw error;
  }
}

async function createNotificationLog(data: {
  invoiceId: string;
  type: 'EMAIL' | 'SMS';
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

async function updateNotificationLog(
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

export async function getEmailSettings(): Promise<EmailConfig | null> {
  try {
    const providerSetting = await prisma.settings.findUnique({
      where: { key: 'email_provider' },
    });

    const configSetting = await prisma.settings.findUnique({
      where: { key: 'email_config' },
    });

    if (!providerSetting || !configSetting) {
      return null;
    }

    return {
      provider: providerSetting.value as 'gmail' | 'outlook' | 'resend',
      config: configSetting.value as any,
    };
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return null;
  }
}

export async function getSmsSettings(): Promise<SmsConfig | null> {
  try {
    const providerSetting = await prisma.settings.findUnique({
      where: { key: 'sms_provider' },
    });

    const configSetting = await prisma.settings.findUnique({
      where: { key: 'sms_config' },
    });

    if (!providerSetting || !configSetting) {
      return null;
    }

    return {
      provider: providerSetting.value as 'twilio',
      config: configSetting.value as any,
    };
  } catch (error) {
    console.error('Error fetching SMS settings:', error);
    return null;
  }
}
