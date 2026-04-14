import { prisma } from '@/lib/prisma';
import { EmailService, EmailConfig } from '@/lib/email-service';
import { SmsService, SmsConfig } from '@/lib/sms-service';
import { WhatsAppService, WhatsAppConfig, getWhatsAppSettings } from '@/lib/whatsapp-service';
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
        user: {
          select: {
            id: true,
            name: true,
            emailNotificationsEnabled: true,
            smsNotificationsEnabled: true,
            whatsappNotificationsEnabled: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }

    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: invoice.userId,
        status: 'ACTIVE',
        endDate: { gte: new Date() },
      },
      include: {
        plan: true,
      },
    });

    if (!activeSubscription) {
      console.warn(`User ${invoice.userId} has no active subscription. Skipping notifications.`);
      return;
    }

    const emailSettings = await getEmailSettings(null);
    const smsSettings = await getSmsSettings(null);
    const whatsappSettings = await getWhatsAppSettings(null);

    const pdfToken = generatePdfToken(invoiceId);
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const pdfDownloadUrl = `${baseUrl}/api/invoices/pdf/${pdfToken}`;

    const invoiceData = {
      customerName: invoice.customer.name,
      invoiceNumber: invoice.invoiceNumber,
      amount: `Rs.${invoice.amount.toFixed(2)}`,
      dueDate: format(new Date(invoice.dueDate), 'MMM dd, yyyy'),
      pdfDownloadUrl,
    };

    if (
      invoice.user.emailNotificationsEnabled &&
      emailSettings &&
      invoice.customer.email &&
      activeSubscription.emailsUsed < activeSubscription.plan.emailLimit
    ) {
      await sendEmailNotification(
        invoiceId,
        invoice.customer.email,
        emailSettings,
        invoiceData,
        activeSubscription.id
      );
    } else if (invoice.user.emailNotificationsEnabled && activeSubscription.emailsUsed >= activeSubscription.plan.emailLimit) {
      console.warn(`User ${invoice.userId} has reached email quota limit. Auto-disabling email notifications.`);
      
      await prisma.user.update({
        where: { id: invoice.userId },
        data: { emailNotificationsEnabled: false },
      });
    }

    if (
      invoice.user.smsNotificationsEnabled &&
      smsSettings &&
      invoice.customer.phone &&
      activeSubscription.smsUsed < activeSubscription.plan.smsLimit
    ) {
      await sendSmsNotification(
        invoiceId,
        invoice.customer.phone,
        smsSettings,
        invoiceData,
        activeSubscription.id
      );
    } else if (invoice.user.smsNotificationsEnabled && activeSubscription.smsUsed >= activeSubscription.plan.smsLimit) {
      console.warn(`User ${invoice.userId} has reached SMS quota limit. Auto-disabling SMS notifications.`);
      
      await prisma.user.update({
        where: { id: invoice.userId },
        data: { smsNotificationsEnabled: false },
      });
    }

    if (
      invoice.user.whatsappNotificationsEnabled &&
      whatsappSettings &&
      invoice.customer.phone &&
      activeSubscription.whatsappUsed < activeSubscription.plan.whatsappLimit
    ) {
      await sendWhatsAppNotification(
        invoiceId,
        invoice.customer.phone,
        whatsappSettings,
        invoiceData,
        invoice.user.name,
        activeSubscription.id
      );
    } else if (invoice.user.whatsappNotificationsEnabled && activeSubscription.whatsappUsed >= activeSubscription.plan.whatsappLimit) {
      console.warn(`User ${invoice.userId} has reached WhatsApp quota limit. Auto-disabling WhatsApp notifications.`);
      
      await prisma.user.update({
        where: { id: invoice.userId },
        data: { whatsappNotificationsEnabled: false },
      });
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
  },
  subscriptionId: string
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
    
    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { emailsUsed: { increment: 1 } },
    });
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
  },
  subscriptionId: string
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
    
    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { smsUsed: { increment: 1 } },
    });
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

export async function getEmailSettings(userId: string | null = null): Promise<EmailConfig | null> {
  try {
    const [providerSetting, configSetting] = await Promise.all([
      prisma.settings.findFirst({
        where: { 
          key: 'email_provider',
          userId: userId
        },
      }),
      prisma.settings.findFirst({
        where: { 
          key: 'email_config',
          userId: userId
        },
      }),
    ]);

    if (!providerSetting || !configSetting) {
      return null;
    }

    return {
      provider: providerSetting.value as 'resend',
      config: configSetting.value as any,
    };
  } catch (error) {
    console.error('Error fetching email settings:', error);
    return null;
  }
}

export async function getSmsSettings(userId: string | null = null): Promise<SmsConfig | null> {
  try {
    const [providerSetting, configSetting] = await Promise.all([
      prisma.settings.findFirst({
        where: { 
          key: 'sms_provider',
          userId: userId
        },
      }),
      prisma.settings.findFirst({
        where: { 
          key: 'sms_config',
          userId: userId
        },
      }),
    ]);

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

async function sendWhatsAppNotification(
  invoiceId: string,
  recipientPhone: string,
  whatsappSettings: WhatsAppConfig,
  invoiceData: {
    customerName: string;
    invoiceNumber: string;
    amount: string;
    dueDate: string;
    pdfDownloadUrl: string;
  },
  senderName: string,
  subscriptionId: string
): Promise<void> {
  const logId = await createNotificationLog({
    invoiceId,
    type: 'SMS',
    provider: whatsappSettings.provider,
    recipient: recipientPhone,
  });

  try {
    const whatsappService = new WhatsAppService(whatsappSettings);
    
    const whatsappMessage = `You have received an invoice of ${invoiceData.amount} from ${senderName}. Download PDF: ${invoiceData.pdfDownloadUrl}`;

    await whatsappService.send({
      to: recipientPhone,
      message: whatsappMessage,
    });

    await updateNotificationLog(logId, 'SENT', null);
    
    await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { whatsappUsed: { increment: 1 } },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await updateNotificationLog(logId, 'FAILED', errorMessage);
    console.error('Failed to send WhatsApp notification:', error);
  }
}
