'use client';

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, DollarSign, Package } from "lucide-react";
import { EditPlanDialog } from "@/components/admin/edit-plan-dialog";

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
  _count: {
    subscriptions: number;
  };
}

interface Stats {
  activeSubscriptions: number;
  totalRevenue: number;
  totalUsers: number;
  conversionRate: number;
}

export default function SubscriptionsManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'SUPER_ADMIN') {
      router.push('/dashboard');
    } else {
      fetchData();
    }
  }, [session, status, router]);

  const fetchData = async () => {
    try {
      const [plansResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/subscription/plans/list'),
        fetch('/api/admin/subscription/stats'),
      ]);

      if (plansResponse.ok) {
        const data = await plansResponse.json();
        setPlans(data.plans);
      }

      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-gray-600 mt-1">Manage subscription plans and pricing</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Rs.{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From active subscriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Users on paid plans</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plans Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Subscription Plans</CardTitle>
            <p className="text-sm text-gray-600">Edit plan details and pricing</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="border-2">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-xl">{plan.name}</h3>
                      {plan.isFree && <Badge variant="secondary">Free</Badge>}
                    </div>
                    <EditPlanDialog plan={plan} onSuccess={fetchData} />
                  </div>
                  <p className="text-3xl font-bold text-primary">Rs.{Number(plan.price).toFixed(0)}</p>
                  <p className="text-sm text-gray-500">/month</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">Email Notifications</span>
                      <span className="font-semibold">{plan.emailLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">SMS Notifications</span>
                      <span className="font-semibold">{plan.smsLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b">
                      <span className="text-gray-600">WhatsApp Notifications</span>
                      <span className="font-semibold">{(plan.whatsappLimit ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Active Users</span>
                      <Badge variant="outline">{plan._count.subscriptions}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 italic">{plan.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <div>
                <p className="text-sm font-medium text-blue-900">View User Subscriptions</p>
                <p className="text-sm text-blue-700 mt-1">
                  To see which users have which subscriptions, their quota usage, and expiry dates, 
                  go to <Link href="/users" className="underline font-medium">User Management</Link>.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
