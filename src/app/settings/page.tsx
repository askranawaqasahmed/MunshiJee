'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSettingsForm } from '@/components/settings/email-settings-form';
import { SmsSettingsForm } from '@/components/settings/sms-settings-form';

interface EmailSettings {
  provider: 'gmail' | 'outlook' | 'resend';
  config: any;
}

interface SmsSettings {
  provider: 'twilio';
  config: any;
}

export default function SettingsPage() {
  const [emailSettings, setEmailSettings] = useState<EmailSettings | undefined>();
  const [smsSettings, setSmsSettings] = useState<SmsSettings | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.settings.email_provider && data.settings.email_config) {
          setEmailSettings({
            provider: data.settings.email_provider,
            config: data.settings.email_config,
          });
        }
        if (data.settings.sms_provider && data.settings.sms_config) {
          setSmsSettings({
            provider: data.settings.sms_provider,
            config: data.settings.sms_config,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async (settings: EmailSettings) => {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailProvider: settings.provider,
        emailConfig: settings.config,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save email settings');
    }

    setEmailSettings(settings);
  };

  const handleTestEmail = async (settings: EmailSettings) => {
    const response = await fetch('/api/settings/test-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'email',
        config: settings,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to send test email');
    }
  };

  const handleSaveSms = async (settings: SmsSettings) => {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        smsProvider: settings.provider,
        smsConfig: settings.config,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save SMS settings');
    }

    setSmsSettings(settings);
  };

  const handleTestSms = async (settings: SmsSettings, phoneNumber: string) => {
    const response = await fetch('/api/settings/test-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'sms',
        config: settings,
        phoneNumber,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to send test SMS');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure email and SMS notifications for invoices
        </p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
        </TabsList>

        <TabsContent value="email" className="mt-6">
          <EmailSettingsForm
            initialSettings={emailSettings}
            onSave={handleSaveEmail}
            onTest={handleTestEmail}
          />
        </TabsContent>

        <TabsContent value="sms" className="mt-6">
          <SmsSettingsForm
            initialSettings={smsSettings}
            onSave={handleSaveSms}
            onTest={handleTestSms}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
