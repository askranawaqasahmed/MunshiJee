import twilio from 'twilio';

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

export type SmsProviderConfig = TwilioConfig;

export interface SmsConfig {
  provider: 'twilio';
  config: SmsProviderConfig;
}

export interface SmsPayload {
  to: string;
  message: string;
}

export class SmsService {
  constructor(private smsConfig: SmsConfig) {}

  async send(payload: SmsPayload): Promise<void> {
    switch (this.smsConfig.provider) {
      case 'twilio':
        return this.sendWithTwilio(payload);
      default:
        throw new Error(`Unsupported SMS provider: ${this.smsConfig.provider}`);
    }
  }

  private async sendWithTwilio(payload: SmsPayload): Promise<void> {
    const config = this.smsConfig.config as TwilioConfig;

    const client = twilio(config.accountSid, config.authToken);

    await client.messages.create({
      body: payload.message,
      from: config.fromNumber,
      to: payload.to,
    });
  }
}
