'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Check, Phone, MessageCircle } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  slug: string;
  emailLimit: number;
  smsLimit: number;
  whatsappLimit?: number;
  price: number;
  description: string;
  isFree: boolean;
}

interface ActiveSubscription {
  plan: {
    slug: string;
  };
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<ActiveSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [plansResponse, subscriptionResponse] = await Promise.all([
        fetch('/api/subscription/plans'),
        fetch('/api/subscription/current'),
      ]);

      if (plansResponse.ok) {
        const plansData = await plansResponse.json();
        setPlans(plansData.plans);
      }

      if (subscriptionResponse.ok) {
        const subData = await subscriptionResponse.json();
        setActiveSubscription(subData.subscription);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-96 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const isCurrentPlan = (planSlug: string) => {
    return activeSubscription?.plan?.slug === planSlug;
  };

  return (
    <>
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Choose Your Plan
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select the perfect plan for your business needs. Upgrade or downgrade anytime.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan.slug);
          const isPopular = plan.slug === 'GROWTH';
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all hover:shadow-xl ${
                isCurrent 
                  ? 'border-2 border-primary shadow-lg scale-105' 
                  : isPopular 
                  ? 'border-2 border-purple-400 shadow-lg' 
                  : 'border hover:border-gray-300'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary">Current Plan</Badge>
                </div>
              )}
              {isPopular && !isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600">Most Popular</Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mt-4 mb-2">
                  <span className="text-5xl font-bold">Rs.{Number(plan.price).toFixed(0)}</span>
                  <span className="text-gray-500 text-lg">/mo</span>
                </div>
                <CardDescription className="text-sm min-h-[40px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4 pb-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-green-100 p-1 mt-0.5">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {plan.emailLimit.toLocaleString()} Email Notifications
                      </p>
                      <p className="text-xs text-gray-500">per month</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-1 mt-0.5 ${
                      plan.smsLimit > 0 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Check className={`h-4 w-4 ${
                        plan.smsLimit > 0 ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        plan.smsLimit === 0 ? 'text-gray-400' : ''
                      }`}>
                        {plan.smsLimit > 0 
                          ? `${plan.smsLimit.toLocaleString()} SMS Notifications` 
                          : 'No SMS notifications'}
                      </p>
                      {plan.smsLimit > 0 && (
                        <p className="text-xs text-gray-500">per month</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`rounded-full p-1 mt-0.5 ${
                      (plan.whatsappLimit ?? 0) > 0 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Check className={`h-4 w-4 ${
                        (plan.whatsappLimit ?? 0) > 0 ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium text-sm ${
                        (plan.whatsappLimit ?? 0) === 0 ? 'text-gray-400' : ''
                      }`}>
                        {(plan.whatsappLimit ?? 0) > 0 
                          ? `${(plan.whatsappLimit ?? 0).toLocaleString()} WhatsApp Notifications` 
                          : 'No WhatsApp notifications'}
                      </p>
                      {(plan.whatsappLimit ?? 0) > 0 && (
                        <p className="text-xs text-gray-500">per month</p>
                      )}
                    </div>
                  </div>
                  
                  {!plan.isFree && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-green-100 p-1 mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="font-medium text-sm flex-1">Priority Support</p>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="rounded-full bg-green-100 p-1 mt-0.5">
                          <Check className="h-4 w-4 text-green-600" />
                        </div>
                        <p className="font-medium text-sm flex-1">Monthly Quota Reset</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="pt-0">
                {plan.isFree ? (
                  <Button variant="outline" className="w-full" disabled>
                    Free Plan
                  </Button>
                ) : isCurrent ? (
                  <Button variant="outline" className="w-full" disabled>
                    ✓ Active Plan
                  </Button>
                ) : (
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        className={`w-full ${
                          isPopular 
                            ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700' 
                            : ''
                        }`}
                      >
                        {isPopular ? 'Get Started' : 'Subscribe Now'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Contact Us to Subscribe</DialogTitle>
                        <DialogDescription className="text-base">
                          Get in touch to activate your {plan.name} subscription
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <a 
                          href="tel:+1234567890"
                          className="flex items-center space-x-4 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer border border-blue-200"
                        >
                          <div className="rounded-full bg-blue-600 p-3">
                            <Phone className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">Phone</p>
                            <p className="text-blue-600">+1 (234) 567-890</p>
                          </div>
                        </a>
                        
                        <a
                          href="https://wa.me/1234567890"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-4 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer border border-green-200"
                        >
                          <div className="rounded-full bg-green-600 p-3">
                            <MessageCircle className="h-5 w-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold">WhatsApp</p>
                            <p className="text-green-600">Chat with us</p>
                          </div>
                        </a>
                        
                        <p className="text-sm text-center text-gray-600 pt-4 border-t">
                          Our team will respond within 24 hours to help you get started
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </>
  );
}
