import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { recordAudit } from '@/lib/audit';
import { getSuperAdminEmailSettings } from '@/lib/super-admin-email';
import { EmailService } from '@/lib/email-service';
import { getPlanChangedEmailTemplate } from '@/lib/email-templates';
import { format } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, planId } = body;

    if (!userId || !planId) {
      return NextResponse.json(
        { error: 'Missing userId or planId' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const previousActive = await prisma.userSubscription.findFirst({
      where: { userId, status: 'ACTIVE' },
      include: { plan: true },
    });

    await prisma.userSubscription.updateMany({
      where: {
        userId,
        status: 'ACTIVE',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        emailsUsed: 0,
        smsUsed: 0,
        assignedBy: session.user.id,
      },
      include: {
        plan: true,
      },
    });

    const wasChange = !!previousActive;
    await recordAudit({
      actorId: session.user.id,
      actorEmail: session.user.email ?? '',
      targetId: user.id,
      targetEmail: user.email,
      action: wasChange ? 'SUBSCRIPTION_CHANGED' : 'SUBSCRIPTION_ASSIGNED',
      metadata: {
        fromPlan: previousActive?.plan.slug ?? null,
        toPlan: plan.slug,
        endDate: endDate.toISOString(),
      },
    });

    try {
      const emailSettings = await getSuperAdminEmailSettings();
      if (emailSettings) {
        const emailService = new EmailService(emailSettings);
        const isUpgrade =
          !previousActive ||
          Number(plan.price) >= Number(previousActive.plan.price);

        const html = getPlanChangedEmailTemplate({
          name: user.name,
          planName: plan.name,
          emailLimit: plan.emailLimit,
          smsLimit: plan.smsLimit,
          whatsappLimit: plan.whatsappLimit,
          endDate: format(endDate, 'MMM dd, yyyy'),
          isUpgrade,
        });

        await emailService.send({
          to: user.email,
          subject: `Your MunshiJee plan has been updated to ${plan.name}`,
          html,
        });
      }
    } catch (emailError) {
      console.error('Failed to send plan change email:', emailError);
    }

    return NextResponse.json({ subscription });
  } catch (error) {
    console.error('Error assigning subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
