import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { EasypaisaService, getEasypaisaSettings } from '@/lib/easypaisa-service';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = params;

    const transaction = await prisma.easypaisaTransaction.findUnique({
      where: { orderId },
      include: {
        invoice: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (session.user.role !== 'SUPER_ADMIN' && transaction.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to access this transaction' }, { status: 403 });
    }

    const easypaisaSettings = await getEasypaisaSettings(null);
    if (!easypaisaSettings) {
      return NextResponse.json(
        { error: 'EasyPaisa payment gateway is not configured' },
        { status: 400 }
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
        const existingPayment = await tx.payment.findFirst({
          where: {
            invoiceId: transaction.invoiceId,
            reference: transaction.orderId,
          },
        });

        if (!existingPayment) {
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
        }

        await tx.invoice.update({
          where: { id: transaction.invoiceId },
          data: { status: 'PAID' },
        });
      });
    }

    return NextResponse.json({
      success: true,
      transaction: {
        orderId: transaction.orderId,
        status: newStatus,
        transactionType: transaction.transactionType,
        amount: transaction.amount.toString(),
        paymentToken: transaction.paymentToken,
        responseCode: statusResponse.responseCode,
        responseDesc: statusResponse.responseDesc,
        createdAt: transaction.createdAt,
        updatedAt: transaction.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('Error checking EasyPaisa transaction status:', error);
    return NextResponse.json(
      { error: 'Failed to check transaction status', details: error.message },
      { status: 500 }
    );
  }
}
