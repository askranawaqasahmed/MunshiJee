'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface EasypaisaSettings {
  provider: 'easypaisa';
  config: {
    username?: string;
    password?: string;
    storeId?: string;
    accountNum?: string;
    environment?: 'sandbox' | 'production';
  };
}

interface EasypaisaSettingsFormProps {
  initialSettings?: EasypaisaSettings;
  onSave: (settings: EasypaisaSettings) => Promise<void>;
  onTest: (settings: EasypaisaSettings) => Promise<void>;
}

export function EasypaisaSettingsForm({ initialSettings, onSave, onTest }: EasypaisaSettingsFormProps) {
  const [config, setConfig] = useState(initialSettings?.config || {
    environment: 'sandbox' as 'sandbox' | 'production',
  });
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
      await onSave({ provider: 'easypaisa', config });
      setMessage({ type: 'success', text: 'EasyPaisa settings saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save EasyPaisa settings.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setMessage(null);
    try {
      await onTest({ provider: 'easypaisa', config });
      setMessage({ type: 'success', text: 'Connection test successful! Credentials are valid.' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Connection test failed. Please check your credentials.' });
    } finally {
      setTesting(false);
    }
  };

  const toggleEnvironment = () => {
    setConfig({
      ...config,
      environment: config.environment === 'production' ? 'sandbox' : 'production'
    });
  };

  const isConfigComplete = config.username && config.password && config.storeId && config.accountNum;

  return (
    <Card>
      <CardHeader>
        <CardTitle>EasyPaisa Payment Gateway</CardTitle>
        <CardDescription>
          Configure EasyPaisa merchant credentials to enable online payments for invoices
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
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="environment" className="text-base">Environment</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Use sandbox for testing, production for live payments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${config.environment === 'sandbox' ? 'text-primary' : 'text-muted-foreground'}`}>
                Sandbox
              </span>
              <Switch
                id="environment"
                checked={config.environment === 'production'}
                onCheckedChange={toggleEnvironment}
              />
              <span className={`text-sm font-medium ${config.environment === 'production' ? 'text-primary' : 'text-muted-foreground'}`}>
                Production
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username">Merchant Username</Label>
          <Input
            id="username"
            type="text"
            placeholder="Your EasyPaisa merchant username"
            value={config.username || ''}
            onChange={(e) => setConfig({ ...config, username: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Provided by EasyPaisa during merchant registration
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Merchant Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Your EasyPaisa merchant password"
            value={config.password || ''}
            onChange={(e) => setConfig({ ...config, password: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Keep this secure and do not share with anyone
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="storeId">Store ID</Label>
          <Input
            id="storeId"
            type="text"
            placeholder="Your store ID"
            value={config.storeId || ''}
            onChange={(e) => setConfig({ ...config, storeId: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Assigned during merchant account setup
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="accountNum">Account Number (EWP)</Label>
          <Input
            id="accountNum"
            type="text"
            placeholder="Your EasyPaisa wallet account number"
            value={config.accountNum || ''}
            onChange={(e) => setConfig({ ...config, accountNum: e.target.value })}
          />
          <p className="text-sm text-muted-foreground">
            Find this in your EasyPaisa Merchant Portal profile
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Important Configuration Steps</h4>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Register at EasyPaisa Merchant Portal and complete KYC verification</li>
            <li>Obtain your merchant credentials (username, password, store ID)</li>
            <li>Configure IPN callback URL in portal: <code className="bg-blue-100 px-1 rounded">{`${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/api/easypaisa/callback`}</code></li>
            <li>Test connection using sandbox mode before going live</li>
          </ol>
        </div>

        <div className="flex gap-4">
          <Button onClick={handleSave} disabled={saving || testing || !isConfigComplete}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button 
            variant="outline" 
            onClick={handleTest} 
            disabled={saving || testing || !isConfigComplete}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {!isConfigComplete && (
          <p className="text-sm text-yellow-600 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Please fill in all fields to enable saving and testing
          </p>
        )}
      </CardContent>
    </Card>
  );
}
