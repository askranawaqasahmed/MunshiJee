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
    invoiceTemplateName?: string;
    paymentTemplateName?: string;
  };
}

interface WhatsAppSettingsFormProps {
  initialSettings?: WhatsAppSettings;
  onSave: (settings: WhatsAppSettings) => Promise<void>;
}

export function WhatsAppSettingsForm({ initialSettings, onSave }: WhatsAppSettingsFormProps) {
  const [config, setConfig] = useState(initialSettings?.config || {
    apiVersion: 'v20.0',
    invoiceTemplateName: 'invoice_generation',
    paymentTemplateName: 'payment_confirmation',
  });
  const [testPhoneNumber, setTestPhoneNumber] = useState('923003487592');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (initialSettings) {
      setConfig({
        ...initialSettings.config,
        apiVersion: initialSettings.config.apiVersion || 'v20.0',
        invoiceTemplateName: initialSettings.config.invoiceTemplateName || 'invoice_generation',
        paymentTemplateName: initialSettings.config.paymentTemplateName || 'payment_confirmation',
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

  const handleTest = async (templateType: 'hello_world' | 'invoice') => {
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

      const testConfig = {
        ...cleanedConfig,
        invoiceTemplateName: templateType === 'hello_world' ? 'hello_world' : cleanedConfig.invoiceTemplateName,
      };

      const response = await fetch('/api/settings/test-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'whatsapp',
          config: { provider: 'meta', config: testConfig },
          phoneNumber: testPhoneNumber,
          templateType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || 'Failed to send test message');
      }

      const templateName = templateType === 'hello_world' ? 'Hello World' : 'Invoice Generation';
      setMessage({ type: 'success', text: `${templateName} test message sent successfully! Check your WhatsApp.` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send test message.' });
    } finally {
      setTesting(false);
    }
  };

  const isConfigComplete = () => {
    return config.accessToken && config.phoneNumberId && config.invoiceTemplateName;
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
          <Label htmlFor="invoiceTemplateName">Invoice Template Name *</Label>
          <Input
            id="invoiceTemplateName"
            type="text"
            placeholder="invoice_generation"
            value={config.invoiceTemplateName || ''}
            onChange={(e) => setConfig({ ...config, invoiceTemplateName: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Name of your approved WhatsApp template for invoice notifications
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentTemplateName">Payment Template Name</Label>
          <Input
            id="paymentTemplateName"
            type="text"
            placeholder="payment_confirmation"
            value={config.paymentTemplateName || ''}
            onChange={(e) => setConfig({ ...config, paymentTemplateName: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Name of your approved WhatsApp template for payment confirmations
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
            <p className="font-medium">Header (with 1 parameter):</p>
            <p className="mb-2">New Invoice from {'{{1}}'} (Business Name)</p>
            
            <p className="font-medium mt-3">Body (with 4 parameters in order):</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li><code className="bg-yellow-100 px-1 rounded">{'{{1}}'}</code> - Customer Name</li>
              <li><code className="bg-yellow-100 px-1 rounded">{'{{2}}'}</code> - Invoice Number</li>
              <li><code className="bg-yellow-100 px-1 rounded">{'{{3}}'}</code> - Amount</li>
              <li><code className="bg-yellow-100 px-1 rounded">{'{{4}}'}</code> - Due Date</li>
            </ul>
            
            <p className="font-medium mt-3">Button:</p>
            <p>Type: Call to Action - Visit Website</p>
            <p>Text: "Pay Now"</p>
            <p>URL: https://munshiji.pk/payment/{'{{1}}'} (Invoice ID)</p>
            
            <p className="mt-2 text-xs">
              Example body: "Hi {'{{1}}'}, your invoice {'{{2}}'} for {'{{3}}'} has been generated. Due Date: {'{{4}}'}"
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

          <div className="space-y-4">
            <div className="flex gap-4">
              <Button onClick={handleSave} disabled={saving || testing || !isConfigComplete()}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold mb-3">Test Messages</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => handleTest('hello_world')} 
                  disabled={saving || testing || !config.accessToken || !config.phoneNumberId || !testPhoneNumber}
                  className="w-full"
                >
                  {testing ? 'Testing...' : 'Test Hello World'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleTest('invoice')} 
                  disabled={saving || testing || !isConfigComplete() || !testPhoneNumber}
                  className="w-full"
                >
                  {testing ? 'Testing...' : 'Test Invoice Template'}
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                <p className="text-xs text-blue-800">
                  <span className="font-semibold">💡 Testing Guide:</span>
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1 ml-4 list-disc">
                  <li><span className="font-medium">Hello World:</span> Always works - tests basic connection using Meta's default template (no parameters needed)</li>
                  <li><span className="font-medium">Invoice Template:</span> Only works after your <code className="bg-blue-100 px-1 rounded">invoice_generation</code> template is approved - tests with dummy data:
                    <ul className="mt-1 ml-4 list-circle space-y-0.5">
                      <li>Business: MunshiJee</li>
                      <li>Customer: Rana Waqas</li>
                      <li>Invoice: INV-0001</li>
                      <li>Amount: Rs.1000</li>
                      <li>Due Date: 30 days from now</li>
                      <li>Pay Now button included</li>
                    </ul>
                  </li>
                </ul>
              </div>
            </div>
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
