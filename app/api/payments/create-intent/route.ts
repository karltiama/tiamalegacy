import { NextRequest, NextResponse } from 'next/server';
import { PayMongoService } from '@/lib/paymongo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency, description, metadata } = body;

    // Validate required fields
    if (!amount || !currency || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, description' },
        { status: 400 }
      );
    }

    // Validate amount (must be positive)
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Create payment intent
    const result = await PayMongoService.createPaymentIntent({
      amount,
      currency,
      description,
      metadata,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentIntent: result.data,
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
