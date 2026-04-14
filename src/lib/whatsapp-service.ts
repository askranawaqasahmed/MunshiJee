import { prisma } from '@/lib/prisma';

export interface BartyConfig {
  bearerToken: string;
  apiEndpoint: string;
  phoneNumberId?: string;
}

export interface WatiConfig {
  accessToken: string;
  apiEndpoint: string;
  templateName?: string; // Optional: Template name for initiating conversations
}

export interface WhatsAppConfig {
  provider: 'barty' | 'wati';
  config: BartyConfig | WatiConfig;
}

export interface WhatsAppMessagePayload {
  to: string;
  message: string;
  mediaUrl?: string;
}

export class WhatsAppService {
  constructor(private whatsappConfig: WhatsAppConfig) {}

  async send(payload: WhatsAppMessagePayload): Promise<void> {
    if (this.whatsappConfig.provider === 'barty') {
      return this.sendWithBarty(payload);
    } else if (this.whatsappConfig.provider === 'wati') {
      return this.sendWithWati(payload);
    } else {
      throw new Error(`Unsupported WhatsApp provider: ${this.whatsappConfig.provider}`);
    }
  }

  private async sendWithBarty(payload: WhatsAppMessagePayload): Promise<void> {
    const config = this.whatsappConfig.config as BartyConfig;

    const phoneNumber = this.formatPhoneNumber(payload.to);

    const requestBody: any = {
      receiver: phoneNumber,
      message: {
        text: payload.message,
      },
    };

    if (payload.mediaUrl) {
      requestBody.message.media = {
        url: payload.mediaUrl,
      };
    }

    try {
      const response = await fetch(`${config.apiEndpoint}/messages/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.bearerToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Barty API error: ${response.status} - ${errorData.message || response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Barty WhatsApp message sent:', data);
    } catch (error) {
      console.error('Error sending WhatsApp message via Barty:', error);
      throw error;
    }
  }

  private async sendWithWati(payload: WhatsAppMessagePayload): Promise<void> {
    const config = this.whatsappConfig.config as WatiConfig;

    const phoneNumber = this.formatPhoneNumber(payload.to);

    // Wati expects the phone number WITHOUT + prefix in the URL
    const cleanPhoneNumber = phoneNumber.replace(/^\+/, '');

    // Remove trailing slash from apiEndpoint if present
    const baseUrl = config.apiEndpoint.replace(/\/$/, '');

    // Try session message first, fallback to template if configured
    try {
      await this.sendWatiSessionMessage(baseUrl, config.accessToken, cleanPhoneNumber, payload.message);
      console.log('✅ Wati session message sent successfully');
    } catch (sessionError: any) {
      // If no active session and template is configured, try template message
      if (sessionError.message?.includes('message text can not be empty') && config.templateName) {
        console.log('⚠️ No active session, trying template message...');
        await this.sendWatiTemplateMessage(baseUrl, config.accessToken, cleanPhoneNumber, config.templateName, payload.message);
        console.log('✅ Wati template message sent successfully');
      } else {
        throw sessionError;
      }
    }
  }

  private async sendWatiSessionMessage(
    baseUrl: string,
    accessToken: string,
    phoneNumber: string,
    message: string
  ): Promise<void> {
    const requestBody = {
      messageText: message,
    };

    const fullUrl = `${baseUrl}/api/v1/sendSessionMessage/${phoneNumber}`;

    console.log('Wati session message request:', {
      url: fullUrl,
      phoneNumber,
      messageLength: message.length,
    });

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Wati session message response:', {
      status: response.status,
      body: responseText.substring(0, 500),
    });

    if (!response.ok || responseText.includes('"result":false')) {
      let errorData: any = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        // Response is not JSON
      }

      if (errorData.result === false && errorData.info) {
        throw new Error(`Wati API: ${errorData.info}`);
      }

      throw new Error(
        `Wati API error: ${response.status} - ${errorData.message || errorData.error || response.statusText || responseText}`
      );
    }
  }

  private async sendWatiTemplateMessage(
    baseUrl: string,
    accessToken: string,
    phoneNumber: string,
    templateName: string,
    message: string
  ): Promise<void> {
    // Parse message to extract invoice details for template parameters
    // Expected format: "You have received an invoice of Rs.XXX from BUSINESS. Download PDF: URL"
    const amountMatch = message.match(/Rs\.?([\d,]+\.?\d*)/);
    const businessMatch = message.match(/from (.+?)\./);
    const urlMatch = message.match(/Download PDF: (.+)$/);

    // Wati expects PascalCase field names
    const requestBody = {
      TemplateName: templateName,
      BroadcastName: 'Invoice Notification',
      Parameters: [
        {
          name: '1', // Template {{1}} = amount
          value: amountMatch ? amountMatch[1] : '0',
        },
        {
          name: '2', // Template {{2}} = business name
          value: businessMatch ? businessMatch[1] : 'Business',
        },
        {
          name: '3', // Template {{3}} = PDF URL
          value: urlMatch ? urlMatch[1] : '',
        },
      ],
    };

    const fullUrl = `${baseUrl}/api/v1/sendTemplateMessage?whatsappNumber=${phoneNumber}`;

    console.log('Wati template message request:', {
      url: fullUrl,
      phoneNumber,
      templateName,
      parameters: requestBody.Parameters,
    });

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log('Wati template message response:', {
      status: response.status,
      body: responseText.substring(0, 500),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        // Response is not JSON
      }

      throw new Error(
        `Wati template API error: ${response.status} - ${errorData.message || errorData.info || responseText}`
      );
    }
  }

  private formatPhoneNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('0')) {
      cleaned = '92' + cleaned.substring(1);
    } else if (!cleaned.startsWith('92')) {
      cleaned = '92' + cleaned;
    }
    
    return cleaned;
  }
}

export async function getWhatsAppSettings(userId: string | null = null): Promise<WhatsAppConfig | null> {
  try {
    const [providerSetting, configSetting] = await Promise.all([
      prisma.settings.findFirst({
        where: { 
          key: 'whatsapp_provider',
          userId: userId
        },
      }),
      prisma.settings.findFirst({
        where: { 
          key: 'whatsapp_config',
          userId: userId
        },
      }),
    ]);

    if (!providerSetting || !configSetting) {
      return null;
    }

    return {
      provider: providerSetting.value as 'barty' | 'wati',
      config: configSetting.value as unknown as BartyConfig | WatiConfig,
    };
  } catch (error) {
    console.error('Error fetching WhatsApp settings:', error);
    return null;
  }
}
