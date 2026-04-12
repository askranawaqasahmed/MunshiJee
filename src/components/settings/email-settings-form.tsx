'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface EmailSettings {
  provider: 'gmail' | 'outlook' | 'resend';
  config: {
    email?: string;
    password?: string;
    fromName?: string;
    apiKey?: string;
    fromEmail?: string;
    host?: string;
    port?: number;
    secure?: boolean;
  };
}

interface EmailSettingsFormProps {
  initialSettings?: EmailSettings;
  onSave: (settings: EmailSettings) => Promise<void>;
  onTest: (settings: EmailSettings) => Promise<void>;
}

export function EmailSettingsForm({ initialSettings, onSave, onTest }: EmailSettingsFormProps) {
  const [provider, setProvider] = useState<'gmail' | 'outlook' | 'resend'>(
    initialSettings?.provider || 'gmail'
  );
  const [config, setConfig] = useState(initialSettings?.config || {});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setProvider(initialSettings.provider);
      setConfig(initialSettings.config);
    }
  }, [initialSettings]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await onSave({ provider, config });
      setMessage({ type: 'success', text: 'Email settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save email settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage(null);
    try {
      await onTest({ provider, config });
      setMessage({ type: 'success', text: 'Test email sent successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test email.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Settings</CardTitle>
        <CardDescription>
          Configure your email provider to send invoice notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <div
            className={`p-4 rounded-md ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <Label>Email Provider</Label>
          <RadioGroup value={provider} onValueChange={(value: any) => setProvider(value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="gmail" id="gmail" />
              <Label htmlFor="gmail" className="font-normal cursor-pointer">
                Gmail
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="outlook" id="outlook" />
              <Label htmlFor="outlook" className="font-normal cursor-pointer">
                Outlook
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="resend" id="resend" />
              <Label htmlFor="resend" className="font-normal cursor-pointer">
                Resend
              </Label>
            </div>
          </RadioGroup>
        </div>

        {(provider === 'gmail' || provider === 'outlook') && (
          <>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder={provider === 'gmail' ? 'your@gmail.com' : 'your@outlook.com'}
                value={config.email || ''}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {provider === 'gmail' ? 'App Password' : 'Password'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={provider === 'gmail' ? 'App password (not your Gmail password)' : 'Password'}
                value={config.password || ''}
                onChange={(e) => setConfig({ ...config, password: e.target.value })}
              />
              {provider === 'gmail' && (
                <p className="text-sm text-muted-foreground">
                  Generate an app password at{' '}
                  <a
                    href="https://myaccount.google.com/apppasswords"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline"
                  >
                    Google Account Settings
                  </a>
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                type="text"
                placeholder="MunshiJee Invoices"
                value={config.fromName || ''}
                onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
              />
            </div>

            <div className="pt-4 border-t">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm font-medium text-primary hover:underline"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced SMTP Settings
              </button>
            </div>

            {showAdvanced && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="host">SMTP Host</Label>
                  <Input
                    id="host"
                    type="text"
                    placeholder={provider === 'gmail' ? 'smtp.gmail.com' : 'smtp-mail.outlook.com'}
                    value={config.host || ''}
                    onChange={(e) => setConfig({ ...config, host: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Default: {provider === 'gmail' ? 'smtp.gmail.com' : 'smtp-mail.outlook.com'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">SMTP Port</Label>
                  <Input
                    id="port"
                    type="number"
                    placeholder="587"
                    value={config.port || ''}
                    onChange={(e) => setConfig({ ...config, port: e.target.value ? parseInt(e.target.value) : undefined })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Default: 587 (STARTTLS)
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="secure"
                    checked={config.secure || false}
                    onChange={(e) => setConfig({ ...config, secure: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="secure" className="font-normal cursor-pointer">
                    Use SSL/TLS (Port 465)
                  </Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Leave advanced settings empty to use recommended defaults
                </p>
              </>
            )}
          </>
        )}

        {provider === 'resend' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="re_..."
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://resend.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Resend Dashboard
                </a>
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromEmail">From Email</Label>
              <Input
                id="fromEmail"
                type="email"
                placeholder="invoices@yourdomain.com"
                value={config.fromEmail || ''}
                onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                type="text"
                placeholder="MunshiJee Invoices"
                value={config.fromName || ''}
                onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
              />
            </div>
          </>
        )}

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={saving || testing}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button variant="outline" onClick={handleTest} disabled={saving || testing}>
            {testing ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
