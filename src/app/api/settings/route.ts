import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Super admin can view global settings (userId = null)
    // Regular users can view their own settings
    const userId = session.user.role === 'SUPER_ADMIN' ? null : session.user.id;

    const settings = await prisma.settings.findMany({
      where: { userId },
    });

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

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Super admin saves global settings (userId = null)
    // Regular users save their own settings
    const userId = session.user.role === 'SUPER_ADMIN' ? null : session.user.id;

    const body = await request.json();
    const { emailProvider, emailConfig, smsProvider, smsConfig } = body;

    if (emailProvider && emailConfig) {
      // Check if settings exist
      const existingProviderSetting = await prisma.settings.findFirst({
        where: { 
          key: 'email_provider',
          userId: userId,
        }
      });

      if (existingProviderSetting) {
        await prisma.settings.update({
          where: { id: existingProviderSetting.id },
          data: { value: emailProvider },
        });
      } else {
        await prisma.settings.create({
          data: { 
            key: 'email_provider', 
            value: emailProvider,
            userId: userId,
          },
        });
      }

      const existingConfigSetting = await prisma.settings.findFirst({
        where: { 
          key: 'email_config',
          userId: userId,
        }
      });

      if (existingConfigSetting) {
        await prisma.settings.update({
          where: { id: existingConfigSetting.id },
          data: { value: emailConfig },
        });
      } else {
        await prisma.settings.create({
          data: { 
            key: 'email_config', 
            value: emailConfig,
            userId: userId,
          },
        });
      }
    }

    if (smsProvider && smsConfig) {
      const existingProviderSetting = await prisma.settings.findFirst({
        where: { 
          key: 'sms_provider',
          userId: userId,
        }
      });

      if (existingProviderSetting) {
        await prisma.settings.update({
          where: { id: existingProviderSetting.id },
          data: { value: smsProvider },
        });
      } else {
        await prisma.settings.create({
          data: { 
            key: 'sms_provider', 
            value: smsProvider,
            userId: userId,
          },
        });
      }

      const existingConfigSetting = await prisma.settings.findFirst({
        where: { 
          key: 'sms_config',
          userId: userId,
        }
      });

      if (existingConfigSetting) {
        await prisma.settings.update({
          where: { id: existingConfigSetting.id },
          data: { value: smsConfig },
        });
      } else {
        await prisma.settings.create({
          data: { 
            key: 'sms_config', 
            value: smsConfig,
            userId: userId,
          },
        });
      }
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
