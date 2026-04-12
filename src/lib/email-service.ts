import nodemailer from 'nodemailer';
import { Resend } from 'resend';

export interface GmailConfig {
  email: string;
  password: string;
  fromName: string;
  host?: string;
  port?: number;
  secure?: boolean;
}

export interface OutlookConfig {
  email: string;
  password: string;
  fromName: string;
  host?: string;
  port?: number;
  secure?: boolean;
}

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export type EmailProviderConfig = GmailConfig | OutlookConfig | ResendConfig;

export interface EmailConfig {
  provider: 'gmail' | 'outlook' | 'resend';
  config: EmailProviderConfig;
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export class EmailService {
  constructor(private emailConfig: EmailConfig) {}

  async send(payload: EmailPayload): Promise<void> {
    switch (this.emailConfig.provider) {
      case 'gmail':
        return this.sendWithGmail(payload);
      case 'outlook':
        return this.sendWithOutlook(payload);
      case 'resend':
        return this.sendWithResend(payload);
      default:
        throw new Error(`Unsupported email provider: ${this.emailConfig.provider}`);
    }
  }

  private async sendWithGmail(payload: EmailPayload): Promise<void> {
    const config = this.emailConfig.config as GmailConfig;

    const transporter = nodemailer.createTransport({
      host: config.host || 'smtp.gmail.com',
      port: config.port || 587,
      secure: config.secure !== undefined ? config.secure : false,
      auth: {
        user: config.email,
        pass: config.password,
      },
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.email}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
  }

  private async sendWithOutlook(payload: EmailPayload): Promise<void> {
    const config = this.emailConfig.config as OutlookConfig;

    const transporter = nodemailer.createTransport({
      host: config.host || 'smtp-mail.outlook.com',
      port: config.port || 587,
      secure: config.secure !== undefined ? config.secure : false,
      auth: {
        user: config.email,
        pass: config.password,
      },
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.email}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
  }

  private async sendWithResend(payload: EmailPayload): Promise<void> {
    const config = this.emailConfig.config as ResendConfig;

    const resend = new Resend(config.apiKey);

    await resend.emails.send({
      from: `${config.fromName} <${config.fromEmail}>`,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
    });
  }
}
