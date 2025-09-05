import { NextRequest, NextResponse } from 'next/server';
import { PayMongoService } from '@/lib/paymongo';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('paymongo-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    const isValid = PayMongoService.verifyWebhookSignature(
      body,
      signature,
      process.env.PAYMONGO_WEBHOOK_SECRET!
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data);
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSucceeded(data: any) {
  try {
    const paymentIntentId = data.id;
    const bookingId = data.metadata?.booking_id;

    if (!bookingId) {
      console.error('No booking_id in payment metadata');
      return;
    }

    // Update booking status to CONFIRMED
    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: { status: 'CONFIRMED' },
    });

    // Update payment status to COMPLETED
    await prisma.payment.updateMany({
      where: { bookingId: parseInt(bookingId) },
      data: { 
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    console.log(`Payment succeeded for booking ${bookingId}`);

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

async function handlePaymentFailed(data: any) {
  try {
    const paymentIntentId = data.id;
    const bookingId = data.metadata?.booking_id;

    if (!bookingId) {
      console.error('No booking_id in payment metadata');
      return;
    }

    // Update booking status to CANCELLED
    await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: { status: 'CANCELLED' },
    });

    // Update payment status to FAILED
    await prisma.payment.updateMany({
      where: { bookingId: parseInt(bookingId) },
      data: { 
        status: 'FAILED',
        processedAt: new Date(),
      },
    });

    console.log(`Payment failed for booking ${bookingId}`);

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}
