import { prisma } from '@/lib/prisma';

export interface EasypaisaConfig {
  username: string;
  password: string;
  storeId: string;
  accountNum: string;
  environment: 'sandbox' | 'production';
}

export interface PaymentConfig {
  provider: 'easypaisa';
  config: EasypaisaConfig;
}

export interface InitiateMATransactionParams {
  orderId: string;
  storeId: string;
  transactionAmount: number;
  mobileAccountNo: string;
  emailAddress?: string;
  tokenExpiry: string;
}

export interface InitiateOTCTransactionParams {
  orderId: string;
  storeId: string;
  transactionAmount: number;
  msisdn: string;
  emailAddress?: string;
  tokenExpiry: string;
}

export interface InquireTransactionParams {
  orderId: string;
  storeId: string;
  accountNum: string;
}

export interface EasypaisaResponse {
  orderId: string;
  storeId: number;
  paymentToken?: string;
  transactionDateTime?: string;
  paymentTokenExpiryDateTime?: string;
  responseCode: string;
  responseDesc: string;
  transactionStatus?: string;
}

export class EasypaisaService {
  private baseUrl: string;
  private credentials: string;

  constructor(private config: EasypaisaConfig) {
    this.baseUrl =
      config.environment === 'production'
        ? 'https://easypay.easypaisa.com.pk/easypay-service/rest/v4'
        : 'https://easypaystg.easypaisa.com.pk/easypay-service/rest/v4';
    
    this.credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
  }

  async initiateMATransaction(params: InitiateMATransactionParams): Promise<EasypaisaResponse> {
    const url = `${this.baseUrl}/initiate-ma-transaction`;
    
    const requestBody = {
      orderId: params.orderId,
      storeId: params.storeId,
      transactionAmount: params.transactionAmount.toFixed(2),
      transactionType: 'MA',
      mobileAccountNo: params.mobileAccountNo,
      emailAddress: params.emailAddress || '',
      tokenExpiry: params.tokenExpiry,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Credentials': this.credentials,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`EasyPaisa API error: ${response.status} ${response.statusText}`);
      }

      const data: EasypaisaResponse = await response.json();
      return data;
    } catch (error) {
      console.error('EasyPaisa MA Transaction Error:', error);
      throw error;
    }
  }

  async initiateOTCTransaction(params: InitiateOTCTransactionParams): Promise<EasypaisaResponse> {
    const url = `${this.baseUrl}/initiate-otc-transaction`;
    
    const requestBody = {
      orderId: params.orderId,
      storeId: params.storeId,
      transactionAmount: params.transactionAmount.toFixed(2),
      transactionType: 'OTC',
      msisdn: params.msisdn,
      emailAddress: params.emailAddress || '',
      tokenExpiry: params.tokenExpiry,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Credentials': this.credentials,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`EasyPaisa API error: ${response.status} ${response.statusText}`);
      }

      const data: EasypaisaResponse = await response.json();
      return data;
    } catch (error) {
      console.error('EasyPaisa OTC Transaction Error:', error);
      throw error;
    }
  }

  async inquireTransactionStatus(params: InquireTransactionParams): Promise<EasypaisaResponse> {
    const url = `${this.baseUrl}/inquire-transaction`;
    
    const requestBody = {
      orderId: params.orderId,
      storeId: params.storeId,
      accountNum: params.accountNum,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Credentials': this.credentials,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`EasyPaisa API error: ${response.status} ${response.statusText}`);
      }

      const data: EasypaisaResponse = await response.json();
      return data;
    } catch (error) {
      console.error('EasyPaisa Inquire Transaction Error:', error);
      throw error;
    }
  }

  static getResponseMessage(responseCode: string): string {
    const messages: Record<string, string> = {
      '0000': 'Transaction successful',
      '0001': 'System error occurred',
      '0002': 'Required field missing',
      '0005': 'Merchant account not active',
      '0006': 'Invalid store ID',
      '0007': 'Store not active',
      '0008': 'Payment method not enabled',
      '0010': 'Invalid credentials',
      '0013': 'Insufficient balance',
      '0014': 'Account does not exist',
      '0015': 'Invalid token or token expired',
      '0017': 'Incomplete merchant information',
    };

    return messages[responseCode] || `Unknown error code: ${responseCode}`;
  }

  static mapTransactionStatus(status: string): 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'BLOCKED' {
    const statusMap: Record<string, 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED' | 'BLOCKED'> = {
      'PAID': 'PAID',
      'PENDING': 'PENDING',
      'FAILED': 'FAILED',
      'EXPIRED': 'EXPIRED',
      'BLOCKED': 'BLOCKED',
    };

    return statusMap[status] || 'PENDING';
  }
}

export async function getEasypaisaSettings(userId: string | null = null): Promise<PaymentConfig | null> {
  try {
    const [providerSetting, configSetting] = await Promise.all([
      prisma.settings.findFirst({
        where: { 
          key: 'easypaisa_provider',
          userId: userId
        },
      }),
      prisma.settings.findFirst({
        where: { 
          key: 'easypaisa_config',
          userId: userId
        },
      }),
    ]);

    if (!providerSetting || !configSetting) {
      return null;
    }

    return {
      provider: providerSetting.value as 'easypaisa',
      config: configSetting.value as unknown as EasypaisaConfig,
    };
  } catch (error) {
    console.error('Error fetching EasyPaisa settings:', error);
    return null;
  }
}
