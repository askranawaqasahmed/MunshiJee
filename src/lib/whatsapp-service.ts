import { prisma } from '@/lib/prisma';

export interface MetaConfig {
  accessToken: string;
  phoneNumberId: string;
  wabaId?: string;
  apiVersion?: string;
  invoiceTemplateName?: string;
  paymentTemplateName?: string;
}

export interface WhatsAppConfig {
  provider: 'meta';
  config: MetaConfig;
}

export interface WhatsAppMessagePayload {
  to: string;
  businessName: string;
  customerName: string;
  invoiceNumber: string;
  amount: string;
  dueDate: string;
  paymentUrl?: string;
}

export class WhatsAppService {
  constructor(private whatsappConfig: WhatsAppConfig) {}

  async send(payload: WhatsAppMessagePayload, templateName?: string): Promise<void> {
    if (this.whatsappConfig.provider !== 'meta') {
      throw new Error(`Unsupported WhatsApp provider: ${this.whatsappConfig.provider}`);
    }
    return this.sendWithMeta(payload, templateName);
  }

  private async sendWithMeta(payload: WhatsAppMessagePayload, templateName?: string): Promise<void> {
    const config = this.whatsappConfig.config;
    const apiVersion = config.apiVersion || 'v20.0';
    const templateLanguage = 'en_US';

    const phoneNumber = this.formatPhoneNumber(payload.to);

    const components: any[] = [
      {
        type: 'header',
        parameters: [
          {
            type: 'text',
            text: payload.businessName,
          },
        ],
      },
      {
        type: 'body',
        parameters: [
          {
            type: 'text',
            text: payload.customerName,
          },
          {
            type: 'text',
            text: payload.invoiceNumber,
          },
          {
            type: 'text',
            text: payload.amount,
          },
          {
            type: 'text',
            text: payload.dueDate,
          },
        ],
      },
    ];

    if (payload.paymentUrl) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: '0',
        parameters: [
          {
            type: 'text',
            text: payload.paymentUrl,
          },
        ],
      });
    }

    const requestBody = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'template',
      template: {
        name: templateName || config.invoiceTemplateName || 'invoice_generation',
        language: {
          code: templateLanguage,
        },
        components,
      },
    };

    try {
      const url = `https://graph.facebook.com/${apiVersion}/${config.phoneNumberId}/messages`;
      
      console.log('Meta WhatsApp API request:', {
        url,
        phoneNumber,
        templateName: config.templateName,
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorDetails = responseData.error 
          ? `${responseData.error.message} (code: ${responseData.error.code}${responseData.error.error_subcode ? `, subcode: ${responseData.error.error_subcode}` : ''})`
          : JSON.stringify(responseData);
        
        throw new Error(
          `Meta WhatsApp API error: ${response.status} - ${errorDetails}`
        );
      }

      console.log('Meta WhatsApp message sent:', responseData);
    } catch (error) {
      console.error('Error sending WhatsApp message via Meta:', error);
      throw error;
    }
  }

  async sendText(to: string, message: string): Promise<void> {
    const config = this.whatsappConfig.config;
    const apiVersion = config.apiVersion || 'v20.0';
    const phoneNumber = this.formatPhoneNumber(to);

    const requestBody = {
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: {
        body: message,
      },
    };

    try {
      const url = `https://graph.facebook.com/${apiVersion}/${config.phoneNumberId}/messages`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorDetails = responseData.error 
          ? `${responseData.error.message} (code: ${responseData.error.code})`
          : JSON.stringify(responseData);
        
        throw new Error(
          `Meta WhatsApp API error: ${response.status} - ${errorDetails}`
        );
      }

      console.log('Meta WhatsApp text message sent:', responseData);
    } catch (error) {
      console.error('Error sending text message via Meta:', error);
      throw error;
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
      provider: providerSetting.value as 'meta',
      config: configSetting.value as unknown as MetaConfig,
    };
  } catch (error) {
    console.error('Error fetching WhatsApp settings:', error);
    return null;
  }
}
