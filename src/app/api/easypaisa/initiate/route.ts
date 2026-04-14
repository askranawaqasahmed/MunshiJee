import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { easypaisaInitiateSchema } from '@/lib/validators';
import { EasypaisaService, getEasypaisaSettings } from '@/lib/easypaisa-service';
import { Prisma } from '@prisma/client';
import { format, addHours } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = easypaisaInitiateSchema.parse(body);

    const easypaisaSettings = await getEasypaisaSettings(null);
    if (!easypaisaSettings) {
      return NextResponse.json(
        { error: 'EasyPaisa payment gateway is not configured. Please contact support.' },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.findUnique({
      where: { id: validatedData.invoiceId },
      include: {
        customer: true,
        user: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (session.user.role !== 'SUPER_ADMIN' && invoice.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized to access this invoice' }, { status: 403 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
    }

    const orderId = `INV-${invoice.invoiceNumber}-${Date.now()}`;
    const tokenExpiry = format(addHours(new Date(), 24), 'yyyyMMdd HHmmss');

    const easypaisaTransaction = await prisma.easypaisaTransaction.create({
      data: {
        orderId,
        invoiceId: invoice.id,
        userId: invoice.userId,
        customerId: invoice.customerId,
        transactionType: validatedData.transactionType,
        amount: new Prisma.Decimal(invoice.amount.toString()),
        mobileAccountNo: validatedData.mobileAccountNo,
        storeId: easypaisaSettings.config.storeId,
        status: 'PENDING',
      },
    });

    const easypaisaService = new EasypaisaService(easypaisaSettings.config);

    let response;
    if (validatedData.transactionType === 'MA') {
      response = await easypaisaService.initiateMATransaction({
        orderId,
        storeId: easypaisaSettings.config.storeId,
        transactionAmount: Number(invoice.amount),
        mobileAccountNo: validatedData.mobileAccountNo!,
        emailAddress: validatedData.emailAddress || invoice.customer.email,
        tokenExpiry,
      });
    } else {
      response = await easypaisaService.initiateOTCTransaction({
        orderId,
        storeId: easypaisaSettings.config.storeId,
        transactionAmount: Number(invoice.amount),
        msisdn: invoice.customer.phone,
        emailAddress: validatedData.emailAddress || invoice.customer.email,
        tokenExpiry,
      });
    }

    const isSuccess = response.responseCode === '0000';
    
    await prisma.easypaisaTransaction.update({
      where: { id: easypaisaTransaction.id },
      data: {
        paymentToken: response.paymentToken,
        responseCode: response.responseCode,
        responseDesc: response.responseDesc,
        transactionDateTime: response.transactionDateTime,
        tokenExpiryDateTime: response.paymentTokenExpiryDateTime,
        status: isSuccess ? 'PENDING' : 'FAILED',
      },
    });

    if (!isSuccess) {
      return NextResponse.json(
        {
          error: 'Transaction initiation failed',
          details: EasypaisaService.getResponseMessage(response.responseCode),
          responseCode: response.responseCode,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction: {
        orderId,
        transactionType: validatedData.transactionType,
        paymentToken: response.paymentToken,
        tokenExpiry: response.paymentTokenExpiryDateTime,
        amount: invoice.amount.toString(),
        responseCode: response.responseCode,
        responseDesc: response.responseDesc,
      },
    });
  } catch (error: any) {
    console.error('Error initiating EasyPaisa transaction:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to initiate transaction', details: error.message },
      { status: 500 }
    );
  }
}
