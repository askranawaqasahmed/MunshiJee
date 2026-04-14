import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EasypaisaService, getEasypaisaSettings } from '@/lib/easypaisa-service';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const transactionUrl = searchParams.get('URL');
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    const transaction = await prisma.easypaisaTransaction.findUnique({
      where: { orderId },
      include: {
        invoice: true,
      },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    const easypaisaSettings = await getEasypaisaSettings(null);
    if (!easypaisaSettings) {
      console.error('EasyPaisa settings not configured');
      return NextResponse.json(
        { error: 'Payment gateway configuration missing' },
        { status: 500 }
      );
    }

    const easypaisaService = new EasypaisaService(easypaisaSettings.config);

    const statusResponse = await easypaisaService.inquireTransactionStatus({
      orderId: transaction.orderId,
      storeId: transaction.storeId,
      accountNum: easypaisaSettings.config.accountNum,
    });

    const newStatus = EasypaisaService.mapTransactionStatus(
      statusResponse.transactionStatus || 'PENDING'
    );

    await prisma.easypaisaTransaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus,
        responseCode: statusResponse.responseCode,
        responseDesc: statusResponse.responseDesc,
      },
    });

    if (newStatus === 'PAID' && transaction.invoice.status !== 'PAID') {
      await prisma.$transaction(async (tx) => {
        await tx.payment.create({
          data: {
            userId: transaction.userId,
            invoiceId: transaction.invoiceId,
            customerId: transaction.customerId,
            amount: new Prisma.Decimal(transaction.amount.toString()),
            paymentDate: new Date(),
            method: 'EASYPAISA',
            reference: transaction.orderId,
            notes: `EasyPaisa ${transaction.transactionType} payment - Token: ${transaction.paymentToken}`,
          },
        });

        await tx.invoice.update({
          where: { id: transaction.invoiceId },
          data: { status: 'PAID' },
        });
      });
    }

    return NextResponse.json({
      success: true,
      orderId: transaction.orderId,
      status: newStatus,
      message: 'Transaction status updated successfully',
    });
  } catch (error: any) {
    console.error('Error processing EasyPaisa callback:', error);
    return NextResponse.json(
      { error: 'Failed to process callback', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}
