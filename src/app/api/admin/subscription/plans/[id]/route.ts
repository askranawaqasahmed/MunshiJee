import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, emailLimit, smsLimit, whatsappLimit, price, description } = body;

    if (!name || emailLimit === undefined || smsLimit === undefined || whatsappLimit === undefined || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedPlan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name,
        emailLimit: parseInt(emailLimit),
        smsLimit: parseInt(smsLimit),
        whatsappLimit: parseInt(whatsappLimit),
        price: parseFloat(price),
        description,
      },
    });

    return NextResponse.json({ plan: updatedPlan });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription plan' },
      { status: 500 }
    );
  }
}
