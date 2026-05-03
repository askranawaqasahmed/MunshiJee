import { prisma } from "@/lib/prisma";
import type { EmailConfig } from "@/lib/email-service";

export async function getSuperAdminEmailSettings(): Promise<EmailConfig | null> {
  try {
    const [providerSetting, configSetting] = await Promise.all([
      prisma.settings.findFirst({
        where: { key: "email_provider", userId: null },
      }),
      prisma.settings.findFirst({
        where: { key: "email_config", userId: null },
      }),
    ]);

    if (!providerSetting || !configSetting) {
      return null;
    }

    return {
      provider: providerSetting.value as "resend",
      config: configSetting.value as any,
    };
  } catch (error) {
    console.error("Error fetching super admin email settings:", error);
    return null;
  }
}
