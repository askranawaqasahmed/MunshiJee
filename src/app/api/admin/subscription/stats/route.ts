import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [activeSubscriptions, totalUsers] = await Promise.all([
      prisma.userSubscription.findMany({
        where: { status: 'ACTIVE' },
        include: {
          plan: true,
        },
      }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
    ]);

    const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
      return sum + Number(sub.plan.price);
    }, 0);

    const paidSubscriptions = activeSubscriptions.filter(s => !s.plan.isFree).length;
    const conversionRate = activeSubscriptions.length > 0 
      ? (paidSubscriptions / activeSubscriptions.length) * 100 
      : 0;

    return NextResponse.json({
      stats: {
        activeSubscriptions: activeSubscriptions.length,
        totalRevenue,
        totalUsers,
        conversionRate,
      },
    });
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
