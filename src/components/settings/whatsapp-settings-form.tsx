'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface WhatsAppSettings {
  provider: 'meta';
  config: {
    accessToken?: string;
    phoneNumberId?: string;
    wabaId?: string;
    apiVersion?: string;
    templateName?: string;
    templateLanguage?: string;
  };
}

interface WhatsAppSettingsFormProps {
  initialSettings?: WhatsAppSettings;
  onSave: (settings: WhatsAppSettings) => Promise<void>;
  onTest: (settings: WhatsAppSettings, phoneNumber: string) => Promise<void>;
}

export function WhatsAppSettingsForm({ initialSettings, onSave, onTest }: WhatsAppSettingsFormProps) {
  const [config, setConfig] = useState(initialSettings?.config || {
    apiVersion: 'v20.0',
    templateLanguage: 'en_US',
  });
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setConfig({
        ...initialSettings.config,
        apiVersion: initialSettings.config.apiVersion || 'v20.0',
        templateLanguage: initialSettings.config.templateLanguage || 'en_US',
      });
    }
  }, [initialSettings]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const cleanedConfig = { ...config };
      
      if (cleanedConfig.accessToken) {
        cleanedConfig.accessToken = cleanedConfig.accessToken.replace(/^Bearer\s+/i, '').trim();
      }

      await onSave({ provider: 'meta', config: cleanedConfig });
      setMessage({ type: 'success', text: 'WhatsApp settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save WhatsApp settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPhoneNumber) {
      setMessage({ type: 'error', text: 'Please enter a phone number to test.' });
      return;
    }

    setTesting(true);
    setMessage(null);
    try {
      const cleanedConfig = { ...config };
      
      if (cleanedConfig.accessToken) {
        cleanedConfig.accessToken = cleanedConfig.accessToken.replace(/^Bearer\s+/i, '').trim();
      }

      await onTest({ provider: 'meta', config: cleanedConfig }, testPhoneNumber);
      setMessage({ type: 'success', text: 'Test message sent successfully! Check your WhatsApp.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send test message.' });
    } finally {
      setTesting(false);
    }
  };

  const isConfigComplete = () => {
    return config.accessToken && config.phoneNumberId && config.templateName;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Notifications (Meta Cloud API)</CardTitle>
        <CardDescription>
          Configure Meta (Facebook) WhatsApp Business Cloud API to send invoice notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {message && (
          <div
            className={`p-4 rounded-md flex items-start gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="accessToken">Access Token *</Label>
          <Input
            id="accessToken"
            type="password"
            placeholder="Your Meta WhatsApp access token"
            value={config.accessToken || ''}
            onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Permanent access token from your Meta Business App (System User token recommended)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumberId">Phone Number ID *</Label>
          <Input
            id="phoneNumberId"
            type="text"
            placeholder="123456789012345"
            value={config.phoneNumberId || ''}
            onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Your WhatsApp Business Phone Number ID from the Meta Business dashboard
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="wabaId">WhatsApp Business Account ID (Optional)</Label>
          <Input
            id="wabaId"
            type="text"
            placeholder="123456789012345"
            value={config.wabaId || ''}
            onChange={(e) => setConfig({ ...config, wabaId: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Your WABA ID (for reference only, not used in API calls)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiVersion">API Version</Label>
          <Input
            id="apiVersion"
            type="text"
            placeholder="v20.0"
            value={config.apiVersion || 'v20.0'}
            onChange={(e) => setConfig({ ...config, apiVersion: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Meta Graph API version (default: v20.0)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="templateName">Template Name *</Label>
          <Input
            id="templateName"
            type="text"
            placeholder="invoice_notification"
            value={config.templateName || ''}
            onChange={(e) => setConfig({ ...config, templateName: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Name of your approved WhatsApp message template for invoice notifications
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="templateLanguage">Template Language</Label>
          <Input
            id="templateLanguage"
            type="text"
            placeholder="en_US"
            value={config.templateLanguage || 'en_US'}
            onChange={(e) => setConfig({ ...config, templateLanguage: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Language code of your template (default: en_US)
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Setup Instructions</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Create a Meta Business App at{' '}
              <a
                href="https://developers.facebook.com/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                developers.facebook.com
              </a>
            </li>
            <li>Add the WhatsApp product and complete the setup wizard</li>
            <li>Create a System User and generate a permanent access token with <code className="bg-blue-100 px-1 rounded">whatsapp_business_messaging</code> permission</li>
            <li>Get your Phone Number ID from the WhatsApp Business API settings</li>
            <li>Create and submit a message template for approval (must include 4 body parameters: customer name, invoice number, amount, due date)</li>
            <li>Enter your credentials above and test the connection</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-900 mb-2">Important: Template Requirements</h4>
          <div className="space-y-2 text-sm text-yellow-800">
            <p>Your WhatsApp message template must include these body parameters in order:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><code className="bg-yellow-100 px-1 rounded">{'{{1}}'}</code> - Customer Name</li>
              <li><code className="bg-yellow-100 px-1 rounded">{'{{2}}'}</code> - Invoice Number</li>
              <li><code className="bg-yellow-100 px-1 rounded">{'{{3}}'}</code> - Amount</li>
              <li><code className="bg-yellow-100 px-1 rounded">{'{{4}}'}</code> - Due Date</li>
            </ul>
            <p className="mt-2">
              Example template body: "Hi {'{{1}}'}, your invoice {'{{2}}'} for {'{{3}}'} is ready. Due date: {'{{4}}'}."
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testPhoneNumber">Test Phone Number</Label>
            <Input
              id="testPhoneNumber"
              type="tel"
              placeholder="923001234567 or +923001234567"
              value={testPhoneNumber}
              onChange={(e) => setTestPhoneNumber(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Enter your WhatsApp number to receive a test message. Use international format (e.g., 923001234567 for Pakistan).
            </p>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={saving || testing || !isConfigComplete()}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleTest} 
              disabled={saving || testing || !isConfigComplete() || !testPhoneNumber}
            >
              {testing ? 'Testing...' : 'Send Test Message'}
            </Button>
          </div>
        </div>

        {!isConfigComplete() && (
          <p className="text-sm text-yellow-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Please fill in all required fields (*) to enable saving and testing
          </p>
        )}
      </CardContent>
    </Card>
  );
}
