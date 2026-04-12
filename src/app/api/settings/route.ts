import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.settings.findMany();

    const settingsMap: Record<string, any> = {};
    settings.forEach((setting) => {
      settingsMap[setting.key] = setting.value;
    });

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { emailProvider, emailConfig, smsProvider, smsConfig } = body;

    if (emailProvider && emailConfig) {
      await prisma.settings.upsert({
        where: { key: 'email_provider' },
        update: { value: emailProvider },
        create: { key: 'email_provider', value: emailProvider },
      });

      await prisma.settings.upsert({
        where: { key: 'email_config' },
        update: { value: emailConfig },
        create: { key: 'email_config', value: emailConfig },
      });
    }

    if (smsProvider && smsConfig) {
      await prisma.settings.upsert({
        where: { key: 'sms_provider' },
        update: { value: smsProvider },
        create: { key: 'sms_provider', value: smsProvider },
      });

      await prisma.settings.upsert({
        where: { key: 'sms_config' },
        update: { value: smsConfig },
        create: { key: 'sms_config', value: smsConfig },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
