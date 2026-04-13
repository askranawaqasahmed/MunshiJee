'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Mail, MessageSquare, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SubscriptionManagerProps {
  userId: string;
  currentSubscription: any;
  availablePlans: any[];
}

export function SubscriptionManager({
  userId,
  currentSubscription,
  availablePlans,
}: SubscriptionManagerProps) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAssignSubscription = async () => {
    if (!selectedPlanId) {
      setMessage({ type: 'error', text: 'Please select a plan' });
      return;
    }

    setAssigning(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/subscription/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planId: selectedPlanId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign subscription');
      }

      setMessage({ type: 'success', text: 'Subscription assigned successfully!' });
      setSelectedPlanId('');
      
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to assign subscription. Please try again.' });
    } finally {
      setAssigning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {currentSubscription ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Current Subscription</h3>
              <Badge variant={currentSubscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {currentSubscription.status}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">{currentSubscription.plan.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email Usage</p>
                  <p className="font-medium">
                    {currentSubscription.emailsUsed} / {currentSubscription.plan.emailLimit}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">SMS Usage</p>
                  <p className="font-medium">
                    {currentSubscription.smsUsed} / {currentSubscription.plan.smsLimit}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Expires</p>
                  <p className="font-medium">
                    {format(new Date(currentSubscription.endDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No active subscription
          </div>
        )}

        <div className="border-t pt-6">
          <h3 className="text-lg font-medium mb-4">Assign New Subscription</h3>
          
          {message && (
            <div
              className={`p-3 rounded-md mb-4 text-sm ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Plan</label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a subscription plan" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name} - Rs.{Number(plan.price).toFixed(0)}/month ({plan.emailLimit} emails, {plan.smsLimit} SMS)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAssignSubscription} disabled={assigning || !selectedPlanId}>
              {assigning ? 'Assigning...' : 'Assign Subscription'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
