import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Meta webhook verification (GET)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// Incoming webhook events (POST)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.object !== 'whatsapp_business_account') {
      return NextResponse.json({ error: 'Invalid object type' }, { status: 400 });
    }

    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        if (change.field !== 'messages') continue;
        const value = change.value;

        // Handle message status updates (sent, delivered, read, failed)
        for (const status of value.statuses ?? []) {
          await handleStatusUpdate(status);
        }
      }
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleStatusUpdate(status: {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
  errors?: { code: number; title: string }[];
}) {
  // Log the delivery status update — extend schema with providerMessageId to enable lookup
  console.log('WhatsApp status update:', {
    messageId: status.id,
    status: status.status,
    recipient: status.recipient_id,
    timestamp: new Date(parseInt(status.timestamp) * 1000).toISOString(),
    errors: status.errors,
  });
}

function mapMetaStatus(metaStatus: string): string | null {
  const map: Record<string, string> = {
    sent: 'SENT',
    delivered: 'DELIVERED',
    read: 'READ',
    failed: 'FAILED',
  };
  return map[metaStatus] ?? null;
}
