import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailNotificationsEnabled, smsNotificationsEnabled, whatsappNotificationsEnabled } = body;

    if (
      typeof emailNotificationsEnabled !== 'boolean' || 
      typeof smsNotificationsEnabled !== 'boolean' ||
      (whatsappNotificationsEnabled !== undefined && typeof whatsappNotificationsEnabled !== 'boolean')
    ) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const updateData: any = {
      emailNotificationsEnabled,
      smsNotificationsEnabled,
    };

    if (whatsappNotificationsEnabled !== undefined) {
      updateData.whatsappNotificationsEnabled = whatsappNotificationsEnabled;
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
