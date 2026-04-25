'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailSettingsForm } from '@/components/settings/email-settings-form';
import { SmsSettingsForm } from '@/components/settings/sms-settings-form';
import { EasypaisaSettingsForm } from '@/components/settings/easypaisa-settings-form';
import { WhatsAppSettingsForm } from '@/components/settings/whatsapp-settings-form';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Mail, MessageSquare, Calendar, TrendingUp, Info } from 'lucide-react';

interface EmailSettings {
  provider: 'resend';
  config: any;
}

interface SmsSettings {
  provider: 'twilio';
  config: any;
}

interface EasypaisaSettings {
  provider: 'easypaisa';
  config: any;
}

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

interface SubscriptionData {
  plan: {
    name: string;
    emailLimit: number;
    smsLimit: number;
    whatsappLimit: number;
    price: number;
    isFree: boolean;
  };
  emailsUsed: number;
  smsUsed: number;
  whatsappUsed: number;
  status: string;
  endDate: string;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [whatsappEnabled, setWhatsappEnabled] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [emailSettings, setEmailSettings] = useState<EmailSettings | undefined>();
  const [smsSettings, setSmsSettings] = useState<SmsSettings | undefined>();
  const [easypaisaSettings, setEasypaisaSettings] = useState<EasypaisaSettings | undefined>();
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings | undefined>();

  const isSuperAdmin = session?.user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      if (isSuperAdmin) {
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
          if (data.settings.easypaisa_provider && data.settings.easypaisa_config) {
            setEasypaisaSettings({
              provider: data.settings.easypaisa_provider,
              config: data.settings.easypaisa_config,
            });
          }
          if (data.settings.whatsapp_provider && data.settings.whatsapp_config) {
            setWhatsappSettings({
              provider: data.settings.whatsapp_provider,
              config: data.settings.whatsapp_config,
            });
          }
        }
      } else {
        const [subResponse, userResponse] = await Promise.all([
          fetch('/api/subscription/current'),
          fetch('/api/user/settings'),
        ]);

        if (subResponse.ok) {
          const subData = await subResponse.json();
          setSubscription(subData.subscription);
          
          if (!subData.subscription) {
            setMessage({ 
              type: 'error', 
              text: 'No active subscription found. Please contact support to activate your account.' 
            });
          }
        }

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setEmailEnabled(userData.emailNotificationsEnabled);
          setSmsEnabled(userData.smsNotificationsEnabled);
          setWhatsappEnabled(userData.whatsappNotificationsEnabled);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load settings. Please refresh the page.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    if (!subscription) {
      setMessage({ 
        type: 'error', 
        text: 'No active subscription found. Please contact support to activate your account.' 
      });
      return;
    }

    if (smsEnabled && subscription.plan.smsLimit === 0) {
      setMessage({ 
        type: 'error', 
        text: 'SMS notifications are not available on the Free plan. Please upgrade your subscription to enable SMS notifications.' 
      });
      setSmsEnabled(false);
      return;
    }

    if (whatsappEnabled && subscription.plan.whatsappLimit === 0) {
      setMessage({ 
        type: 'error', 
        text: 'WhatsApp notifications are not available on your plan. Please upgrade your subscription to enable WhatsApp notifications.' 
      });
      setWhatsappEnabled(false);
      return;
    }

    // Warning messages for quota limits (but don't prevent enabling)
    let warningMessages = [];
    
    if (emailEnabled && subscription.emailsUsed >= subscription.plan.emailLimit) {
      warningMessages.push('Email quota reached - new emails will not be sent until quota resets or you upgrade.');
    }

    if (whatsappEnabled && subscription.whatsappUsed >= subscription.plan.whatsappLimit) {
      warningMessages.push('WhatsApp quota reached - new WhatsApp messages will not be sent until quota resets or you upgrade.');
    }

    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emailNotificationsEnabled: emailEnabled,
          smsNotificationsEnabled: smsEnabled,
          whatsappNotificationsEnabled: whatsappEnabled,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification settings');
      }

      if (warningMessages.length > 0) {
        setMessage({ 
          type: 'success', 
          text: `Settings saved! Note: ${warningMessages.join(' ')}` 
        });
      } else {
        setMessage({ type: 'success', text: 'Notification settings saved successfully!' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setSaving(false);
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

  const handleSaveEasypaisa = async (settings: EasypaisaSettings) => {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        easypaisaProvider: settings.provider,
        easypaisaConfig: settings.config,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save EasyPaisa settings');
    }

    setEasypaisaSettings(settings);
  };

  const handleTestEasypaisa = async (settings: EasypaisaSettings) => {
    const response = await fetch('/api/easypaisa/status/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        config: settings.config,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.details || 'Failed to test EasyPaisa connection');
    }
  };

  const handleSaveWhatsApp = async (settings: WhatsAppSettings) => {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        whatsappProvider: settings.provider,
        whatsappConfig: settings.config,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to save WhatsApp settings');
    }

    setWhatsappSettings(settings);
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

  if (isSuperAdmin) {
    return (
      <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure global email, SMS, WhatsApp, and payment gateway settings for all users
          </p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-4">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="sms">SMS</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
            <TabsTrigger value="payment">Payment Gateway</TabsTrigger>
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

          <TabsContent value="whatsapp" className="mt-6">
            <WhatsAppSettingsForm
              initialSettings={whatsappSettings}
              onSave={handleSaveWhatsApp}
            />
          </TabsContent>

          <TabsContent value="payment" className="mt-6">
            <EasypaisaSettingsForm
              initialSettings={easypaisaSettings}
              onSave={handleSaveEasypaisa}
              onTest={handleTestEasypaisa}
            />
          </TabsContent>
        </Tabs>
      </>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your email and SMS notification preferences
        </p>
      </div>

      <div className="grid gap-6 max-w-4xl">
        {!subscription && (
          <Card className="border-red-300 bg-red-50">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-red-100 p-3">
                  <Info className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-red-800 mb-2">No Active Subscription</CardTitle>
                  <p className="text-red-700 text-sm">
                    Your account doesn't have an active subscription. You won't be able to send notifications until you have an active plan.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/settings/subscription')}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                View Subscription Plans
              </Button>
            </CardContent>
          </Card>
        )}
        
        {subscription && subscription.plan.isFree && (
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2">Unlock More with Premium</h3>
                  <p className="text-blue-100 mb-4">
                    Get unlimited emails, SMS notifications, and priority support
                  </p>
                  <Button 
                    onClick={() => router.push('/settings/subscription')}
                    variant="secondary"
                    className="bg-white text-purple-600 hover:bg-gray-100"
                  >
                    Explore Premium Plans →
                  </Button>
                </div>
                <div className="hidden md:block text-6xl opacity-20">
                  ✨
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {subscription && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Current Subscription</CardTitle>
                <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {subscription.status}
                </Badge>
              </div>
              <CardDescription>Your current plan and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Plan</p>
                    <p className="font-medium">{subscription.plan.name}</p>
                    {Number(subscription.plan.price) > 0 && (
                      <p className="text-xs text-gray-500">Rs.{Number(subscription.plan.price).toFixed(0)}/month</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">
                      {subscription.emailsUsed} / {subscription.plan.emailLimit}
                    </p>
                    <p className={`text-xs font-semibold ${
                      subscription.plan.emailLimit - subscription.emailsUsed <= 2 
                        ? 'text-red-600' 
                        : 'text-green-600'
                    }`}>
                      {subscription.plan.emailLimit - subscription.emailsUsed} remaining
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-500">SMS</p>
                    <p className="font-medium">
                      {subscription.smsUsed} / {subscription.plan.smsLimit}
                    </p>
                    {subscription.plan.smsLimit > 0 ? (
                      <p className={`text-xs font-semibold ${
                        subscription.plan.smsLimit - subscription.smsUsed <= 2 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {subscription.plan.smsLimit - subscription.smsUsed} remaining
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Not available</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">WhatsApp</p>
                    <p className="font-medium">
                      {subscription.whatsappUsed} / {subscription.plan.whatsappLimit}
                    </p>
                    {subscription.plan.whatsappLimit > 0 ? (
                      <p className={`text-xs font-semibold ${
                        subscription.plan.whatsappLimit - subscription.whatsappUsed <= 2 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {subscription.plan.whatsappLimit - subscription.whatsappUsed} remaining
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Not available</p>
                    )}
                  </div>
                </div>
              </div>
              {subscription.endDate && (
                <div className="mt-4 flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Expires on {format(new Date(subscription.endDate), 'MMM dd, yyyy')}
                  </span>
                </div>
              )}
              <div className="mt-6 flex gap-4">
                {subscription?.plan.isFree ? (
                  <>
                    <Button 
                      onClick={() => router.push('/settings/subscription')} 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1"
                    >
                      ✨ Upgrade to Premium
                    </Button>
                    <Button 
                      onClick={() => router.push('/settings/subscription')} 
                      variant="outline"
                    >
                      View Plans
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => router.push('/settings/subscription')} 
                    variant="outline"
                  >
                    View All Plans
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Enable or disable email and SMS notifications for your invoices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {message && (
              <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {subscription && (
              <>
                {/* Email Quota Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">Email Quota</span>
                    </span>
                    <span className={`font-semibold ${
                      subscription.emailsUsed >= subscription.plan.emailLimit 
                        ? 'text-red-600' 
                        : subscription.plan.emailLimit - subscription.emailsUsed <= 2
                        ? 'text-yellow-600'
                        : 'text-green-600'
                    }`}>
                      {subscription.plan.emailLimit - subscription.emailsUsed} remaining
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        subscription.emailsUsed >= subscription.plan.emailLimit 
                          ? 'bg-red-600' 
                          : subscription.plan.emailLimit - subscription.emailsUsed <= 2
                          ? 'bg-yellow-500'
                          : 'bg-green-600'
                      }`}
                      style={{ 
                        width: `${Math.min((subscription.emailsUsed / subscription.plan.emailLimit) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {subscription.emailsUsed} of {subscription.plan.emailLimit} emails used
                  </p>
                </div>

                {/* SMS Quota Progress */}
                {subscription.plan.smsLimit > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">SMS Quota</span>
                      </span>
                      <span className={`font-semibold ${
                        subscription.smsUsed >= subscription.plan.smsLimit 
                          ? 'text-red-600' 
                          : subscription.plan.smsLimit - subscription.smsUsed <= 2
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>
                        {subscription.plan.smsLimit - subscription.smsUsed} remaining
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          subscription.smsUsed >= subscription.plan.smsLimit 
                            ? 'bg-red-600' 
                            : subscription.plan.smsLimit - subscription.smsUsed <= 2
                            ? 'bg-yellow-500'
                            : 'bg-purple-600'
                        }`}
                        style={{ 
                          width: `${Math.min((subscription.smsUsed / subscription.plan.smsLimit) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {subscription.smsUsed} of {subscription.plan.smsLimit} SMS used
                    </p>
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      SMS notifications are not available on the {subscription.plan.name} plan. 
                      Upgrade to enable SMS notifications.
                    </AlertDescription>
                  </Alert>
                )}

                {/* WhatsApp Quota Progress */}
                {subscription.plan.whatsappLimit > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-green-500" />
                        <span className="font-medium">WhatsApp Quota</span>
                      </span>
                      <span className={`font-semibold ${
                        subscription.whatsappUsed >= subscription.plan.whatsappLimit 
                          ? 'text-red-600' 
                          : subscription.plan.whatsappLimit - subscription.whatsappUsed <= 2
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}>
                        {subscription.plan.whatsappLimit - subscription.whatsappUsed} remaining
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          subscription.whatsappUsed >= subscription.plan.whatsappLimit 
                            ? 'bg-red-600' 
                            : subscription.plan.whatsappLimit - subscription.whatsappUsed <= 2
                            ? 'bg-yellow-500'
                            : 'bg-green-600'
                        }`}
                        style={{ 
                          width: `${Math.min((subscription.whatsappUsed / subscription.plan.whatsappLimit) * 100, 100)}%` 
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {subscription.whatsappUsed} of {subscription.plan.whatsappLimit} WhatsApp messages used
                    </p>
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      WhatsApp notifications are not available on the {subscription.plan.name} plan. 
                      Upgrade to enable WhatsApp notifications.
                    </AlertDescription>
                  </Alert>
                )}

                {subscription.emailsUsed >= subscription.plan.emailLimit && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Email quota limit reached. You can still enable email notifications, but new emails won't be sent until your quota resets or you upgrade your plan.
                    </AlertDescription>
                  </Alert>
                )}

                {subscription.whatsappUsed >= subscription.plan.whatsappLimit && subscription.plan.whatsappLimit > 0 && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      WhatsApp quota limit reached. You can still enable WhatsApp notifications, but new messages won't be sent until your quota resets or you upgrade your plan.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="email-notifications" className="text-base">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive invoice notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailEnabled}
                  onCheckedChange={setEmailEnabled}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="sms-notifications" className="text-base">
                    SMS Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive invoice notifications via SMS
                  </p>
                </div>
                <Switch
                  id="sms-notifications"
                  checked={smsEnabled}
                  onCheckedChange={(checked) => {
                    if (checked && subscription && subscription.plan.smsLimit === 0) {
                      setMessage({ 
                        type: 'error', 
                        text: 'SMS notifications are not available on the Free plan. Please upgrade to enable SMS.' 
                      });
                      return;
                    }
                    setSmsEnabled(checked);
                  }}
                  disabled={!subscription || subscription.plan.smsLimit === 0}
                />
              </div>
              {subscription && subscription.plan.smsLimit === 0 && (
                <p className="text-sm text-yellow-600">
                  SMS notifications are not available on the Free plan. Upgrade to enable SMS.
                </p>
              )}

              <div className="flex items-center justify-between space-x-2">
                <div className="flex-1">
                  <Label htmlFor="whatsapp-notifications" className="text-base">
                    WhatsApp Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Receive invoice notifications via WhatsApp
                  </p>
                </div>
                <Switch
                  id="whatsapp-notifications"
                  checked={whatsappEnabled}
                  onCheckedChange={(checked) => {
                    if (checked && subscription && subscription.plan.whatsappLimit === 0) {
                      setMessage({ 
                        type: 'error', 
                        text: 'WhatsApp notifications are not available on your plan. Please upgrade to enable WhatsApp.' 
                      });
                      return;
                    }
                    setWhatsappEnabled(checked);
                  }}
                  disabled={!subscription || subscription.plan.whatsappLimit === 0}
                />
              </div>
              {subscription && subscription.plan.whatsappLimit === 0 && (
                <p className="text-sm text-yellow-600">
                  WhatsApp notifications are not available on your plan. Upgrade to enable WhatsApp.
                </p>
              )}
            </div>

            <Button onClick={handleSaveNotifications} disabled={saving}>
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
