import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { EmailService, EmailConfig } from '@/lib/email-service';
import { SmsService, SmsConfig } from '@/lib/sms-service';
import { WhatsAppService, WhatsAppConfig } from '@/lib/whatsapp-service';
import { getTestEmailTemplate } from '@/lib/email-templates';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, config } = body;

    if (type === 'email') {
      const emailConfig = config as EmailConfig;
      const emailService = new EmailService(emailConfig);

      if (!session.user.email) {
        return NextResponse.json(
          { error: 'User email not found' },
          { status: 400 }
        );
      }

      const htmlContent = getTestEmailTemplate({
        recipientName: session.user.name || 'Admin',
        testMessage:
          'Your email configuration is working correctly! You can now send invoice notifications via email.',
      });

      await emailService.send({
        to: session.user.email,
        subject: 'Test Email - MunshiJee Settings',
        html: htmlContent,
      });

      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully',
      });
    } else if (type === 'sms') {
      const { phoneNumber } = body;
      if (!phoneNumber) {
        return NextResponse.json(
          { error: 'Phone number is required for SMS test' },
          { status: 400 }
        );
      }

      const smsConfig = config as SmsConfig;
      const smsService = new SmsService(smsConfig);

      await smsService.send({
        to: phoneNumber,
        message: 'Test SMS from MunshiJee: Your SMS configuration is working correctly!',
      });

      return NextResponse.json({
        success: true,
        message: 'Test SMS sent successfully',
      });
    } else if (type === 'whatsapp') {
      const { phoneNumber } = body;
      
      if (!phoneNumber) {
        return NextResponse.json(
          { error: 'Phone number is required for WhatsApp test' },
          { status: 400 }
        );
      }

      const whatsappConfig = config as WhatsAppConfig;
      const whatsappService = new WhatsAppService(whatsappConfig);

      console.log('Testing WhatsApp with config:', {
        provider: whatsappConfig.provider,
        phoneNumber,
      });

      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(dueDate.getDate() + 30);

      await whatsappService.send({
        to: phoneNumber,
        customerName: session.user.name || 'Test Customer',
        invoiceNumber: 'TEST-0001',
        amount: 'Rs.1000.00',
        dueDate: dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        pdfDownloadUrl: 'https://example.com/invoice.pdf',
      });

      return NextResponse.json({
        success: true,
        message: 'Test WhatsApp message sent successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid notification type' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error sending test notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to send test notification', details: errorMessage },
      { status: 500 }
    );
  }
}
