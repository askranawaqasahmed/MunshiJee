'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface WhatsAppSettings {
  provider: 'barty' | 'wati';
  config: {
    bearerToken?: string;
    accessToken?: string;
    apiEndpoint?: string;
    phoneNumberId?: string;
    templateName?: string;
  };
}

interface WhatsAppSettingsFormProps {
  initialSettings?: WhatsAppSettings;
  onSave: (settings: WhatsAppSettings) => Promise<void>;
  onTest: (settings: WhatsAppSettings, phoneNumber: string) => Promise<void>;
}

export function WhatsAppSettingsForm({ initialSettings, onSave, onTest }: WhatsAppSettingsFormProps) {
  const [provider, setProvider] = useState<'barty' | 'wati'>(initialSettings?.provider || 'barty');
  const [config, setConfig] = useState(initialSettings?.config || {});
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
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
      // Clean the config before saving
      const cleanedConfig = { ...config };
      
      // Remove "Bearer " prefix from access token if present (Wati)
      if (provider === 'wati' && cleanedConfig.accessToken) {
        cleanedConfig.accessToken = cleanedConfig.accessToken.replace(/^Bearer\s+/i, '').trim();
      }
      
      // Remove "Bearer " prefix from bearer token if present (Barty)
      if (provider === 'barty' && cleanedConfig.bearerToken) {
        cleanedConfig.bearerToken = cleanedConfig.bearerToken.replace(/^Bearer\s+/i, '').trim();
      }

      await onSave({ provider, config: cleanedConfig });
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
      // Clean the config before testing
      const cleanedConfig = { ...config };
      
      // Remove "Bearer " prefix from access token if present (Wati)
      if (provider === 'wati' && cleanedConfig.accessToken) {
        cleanedConfig.accessToken = cleanedConfig.accessToken.replace(/^Bearer\s+/i, '').trim();
      }
      
      // Remove "Bearer " prefix from bearer token if present (Barty)
      if (provider === 'barty' && cleanedConfig.bearerToken) {
        cleanedConfig.bearerToken = cleanedConfig.bearerToken.replace(/^Bearer\s+/i, '').trim();
      }

      await onTest({ provider, config: cleanedConfig }, testPhoneNumber);
      setMessage({ type: 'success', text: 'Test message sent successfully! Check your WhatsApp.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to send test message.' });
    } finally {
      setTesting(false);
    }
  };

  const isConfigComplete = () => {
    if (provider === 'barty') {
      return config.bearerToken && config.apiEndpoint;
    } else if (provider === 'wati') {
      return config.accessToken && config.apiEndpoint;
    }
    return false;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WhatsApp Notifications</CardTitle>
        <CardDescription>
          Configure WhatsApp provider to send invoice notifications via WhatsApp
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
          <Label htmlFor="provider">WhatsApp Provider</Label>
          <Select value={provider} onValueChange={(v) => setProvider(v as 'barty' | 'wati')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="barty">Barty.io</SelectItem>
              <SelectItem value="wati">Wati.io</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Select your WhatsApp Business API provider
          </p>
        </div>

        {provider === 'barty' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="bearerToken">Bearer Token</Label>
              <Input
                id="bearerToken"
                type="password"
                placeholder="Your Barty.io bearer token"
                value={config.bearerToken || ''}
                onChange={(e) => setConfig({ ...config, bearerToken: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Get your bearer token from{' '}
                <a
                  href="https://barty.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Barty.io Dashboard
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiEndpoint">API Endpoint</Label>
              <Input
                id="apiEndpoint"
                type="url"
                placeholder="https://api.barty.io/v1"
                value={config.apiEndpoint || ''}
                onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Your Barty.io API endpoint URL
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumberId">Phone Number ID (Optional)</Label>
              <Input
                id="phoneNumberId"
                type="text"
                placeholder="Your WhatsApp phone number ID"
                value={config.phoneNumberId || ''}
                onChange={(e) => setConfig({ ...config, phoneNumberId: e.target.value })}
              />
            </div>
          </>
        )}

        {provider === 'wati' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="accessToken">Access Token</Label>
              <Input
                id="accessToken"
                type="password"
                placeholder="Your Wati.io access token"
                value={config.accessToken || ''}
                onChange={(e) => setConfig({ ...config, accessToken: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Get your access token from{' '}
                <a
                  href="https://app.wati.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  Wati.io Dashboard
                </a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiEndpoint">API Endpoint</Label>
              <Input
                id="apiEndpoint"
                type="url"
                placeholder="https://live-mt-server.wati.io/101344347"
                value={config.apiEndpoint || ''}
                onChange={(e) => setConfig({ ...config, apiEndpoint: e.target.value })}
              />
              <p className="text-sm text-yellow-600 font-medium">
                ⚠️ Important: Include your account ID at the end (e.g., /101344347)
              </p>
              <p className="text-sm text-muted-foreground">
                Copy the exact URL from your Wati.io API Docs page
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name (Optional)</Label>
              <Input
                id="templateName"
                type="text"
                placeholder="invoice_notification"
                value={config.templateName || ''}
                onChange={(e) => setConfig({ ...config, templateName: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">
                Name of your approved WhatsApp template for invoice notifications (leave empty to use session messages only)
              </p>
            </div>
          </>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Important: Configuration Tips</h4>
          <div className="space-y-2 text-sm text-blue-800">
            {provider === 'wati' && (
              <>
                <p className="font-medium">For Wati.io:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Copy the EXACT API Endpoint from your Wati dashboard (including account ID)</li>
                  <li>Example: <code className="bg-blue-100 px-1 rounded">https://live-mt-server.wati.io/101344347</code></li>
                  <li>Remove "Bearer " from the access token if present (just paste the token itself)</li>
                  <li>Test phone number must have an active WhatsApp session with your Wati number</li>
                </ul>
              </>
            )}
            {provider === 'barty' && (
              <>
                <p className="font-medium">For Barty.io:</p>
                <ul className="list-disc list-inside ml-2 space-y-1">
                  <li>Use the base API endpoint provided by Barty</li>
                  <li>Include the Bearer token as provided</li>
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Setup Instructions</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Register for a WhatsApp Business API account with {provider === 'barty' ? 'Barty.io' : 'Wati.io'}</li>
            <li>Complete the verification process and get your credentials</li>
            <li>Enter the credentials above</li>
            <li>Test the connection before saving</li>
            <li>Enable WhatsApp notifications for users in their notification preferences</li>
          </ol>
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
            Please fill in all required fields to enable saving and testing
          </p>
        )}

        {provider === 'wati' && config.apiEndpoint && !config.apiEndpoint.match(/\/\d+\s*$/) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>
                <strong>Warning:</strong> Your API endpoint might be missing the account ID. 
                It should end with your account number (e.g., /101344347)
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
