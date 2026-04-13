import { Resend } from 'resend';

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface EmailConfig {
  provider: 'resend';
  config: ResendConfig;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  constructor(private emailConfig: EmailConfig) {}

  async send(payload: EmailPayload): Promise<void> {
    if (this.emailConfig.provider !== 'resend') {
      throw new Error(`Unsupported email provider: ${this.emailConfig.provider}`);
    }
    return this.sendWithResend(payload);
  }

  private async sendWithResend(payload: EmailPayload): Promise<void> {
    const config = this.emailConfig.config;

    const resend = new Resend(config.apiKey);

    await resend.emails.send({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    });
  }
}
