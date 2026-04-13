'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EmailSettings {
  provider: 'resend';
  config: {
    apiKey?: string;
    fromEmail?: string;
    fromName?: string;
  };
}

interface EmailSettingsFormProps {
  initialSettings?: EmailSettings;
  onSave: (settings: EmailSettings) => Promise<void>;
  onTest: (settings: EmailSettings) => Promise<void>;
}

export function EmailSettingsForm({ initialSettings, onSave, onTest }: EmailSettingsFormProps) {
  const [config, setConfig] = useState(initialSettings?.config || {});
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setConfig(initialSettings.config);
    }
  }, [initialSettings]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await onSave({ provider: 'resend', config });
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
      await onTest({ provider: 'resend', config });
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
          Configure Resend to send invoice notifications via email
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

        <div className="space-y-2">
          <Label htmlFor="apiKey">Resend API Key</Label>
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
          <p className="text-sm text-muted-foreground">
            Must be a verified domain in your Resend account
          </p>
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
