'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SmsSettings {
  provider: 'twilio';
  config: {
    accountSid?: string;
    authToken?: string;
    fromNumber?: string;
  };
}

interface SmsSettingsFormProps {
  initialSettings?: SmsSettings;
  onSave: (settings: SmsSettings) => Promise<void>;
  onTest: (settings: SmsSettings, phoneNumber: string) => Promise<void>;
}

export function SmsSettingsForm({ initialSettings, onSave, onTest }: SmsSettingsFormProps) {
  const [config, setConfig] = useState(initialSettings?.config || {});
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
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
      await onSave({ provider: 'twilio', config });
      setMessage({ type: 'success', text: 'SMS settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save SMS settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPhoneNumber) {
      setMessage({ type: 'error', text: 'Please enter a phone number for testing.' });
      return;
    }
    setTesting(true);
    setMessage(null);
    try {
      await onTest({ provider: 'twilio', config }, testPhoneNumber);
      setMessage({ type: 'success', text: 'Test SMS sent successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test SMS.' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Settings</CardTitle>
        <CardDescription>
          Configure Twilio to send SMS notifications for invoices
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
          <Label htmlFor="accountSid">Account SID</Label>
          <Input
            id="accountSid"
            type="text"
            placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            value={config.accountSid || ''}
            onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="authToken">Auth Token</Label>
          <Input
            id="authToken"
            type="password"
            placeholder="Your Twilio Auth Token"
            value={config.authToken || ''}
            onChange={(e) => setConfig({ ...config, authToken: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Find your credentials at{' '}
            <a
              href="https://console.twilio.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline"
            >
              Twilio Console
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fromNumber">From Number</Label>
          <Input
            id="fromNumber"
            type="tel"
            placeholder="+1234567890"
            value={config.fromNumber || ''}
            onChange={(e) => setConfig({ ...config, fromNumber: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Must include country code (e.g., +1 for US)
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={saving || testing}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        <div className="pt-6 border-t">
          <h3 className="text-lg font-semibold mb-4">Test SMS</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="testPhone">Test Phone Number</Label>
              <Input
                id="testPhone"
                type="tel"
                placeholder="+1234567890"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={handleTest} disabled={saving || testing}>
              {testing ? 'Sending...' : 'Send Test SMS'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
