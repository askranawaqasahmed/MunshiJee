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
      const { phoneNumber, templateType } = body;
      
      if (!phoneNumber) {
        return NextResponse.json(
          { error: 'Phone number is required for WhatsApp test' },
          { status: 400 }
        );
      }

      const whatsappConfig = config as WhatsAppConfig;
      const testType = templateType || 'hello_world';

      console.log('Testing WhatsApp:', {
        provider: whatsappConfig.provider,
        testType,
        phoneNumber,
      });

      // Format phone number
      const formattedPhone = phoneNumber.replace(/\D/g, '').replace(/^0/, '92').replace(/^(?!92)/, '92');

      // Test hello_world template (no parameters)
      if (testType === 'hello_world') {
        const response = await fetch(
          `https://graph.facebook.com/${whatsappConfig.config.apiVersion || 'v20.0'}/${whatsappConfig.config.phoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${whatsappConfig.config.accessToken}`,
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: formattedPhone,
              type: 'template',
              template: {
                name: 'hello_world',
                language: {
                  code: 'en_US',
                },
              },
            }),
          }
        );

        const responseData = await response.json();

        if (!response.ok) {
          const errorDetails = responseData.error 
            ? `${responseData.error.message} (code: ${responseData.error.code})`
            : JSON.stringify(responseData);
          
          throw new Error(`Meta WhatsApp API error: ${response.status} - ${errorDetails}`);
        }

        console.log('WhatsApp hello_world sent:', responseData);
      } else {
        const whatsappService = new WhatsAppService({ provider: 'meta', config: whatsappConfig.config });

        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        const formattedDate = `${dueDate.getDate().toString().padStart(2, '0')}/${(dueDate.getMonth() + 1).toString().padStart(2, '0')}/${dueDate.getFullYear()}`;

        await whatsappService.send({
          to: phoneNumber,
          businessName: 'MunshiJee',
          customerName: session.user.name || 'Rana Waqas',
          invoiceNumber: 'INV-0001',
          amount: 'Rs.1000',
          dueDate: formattedDate,
          paymentUrl: 'clxxx123456789test',
        }, whatsappConfig.config.invoiceTemplateName);
      }

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
