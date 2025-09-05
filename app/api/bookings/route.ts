import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      guestName,
      guestEmail,
      guestPhone,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      specialRequests,
      roomId,
      totalAmount,
    } = body;

    // Validate required fields
    if (!guestName || !guestEmail || !checkInDate || !checkOutDate || !roomId || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for booking conflicts
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId: parseInt(roomId),
        status: {
          in: ['CONFIRMED', 'PENDING_PAYMENT'],
        },
        OR: [
          {
            checkInDate: {
              lte: new Date(checkOutDate),
            },
            checkOutDate: {
              gte: new Date(checkInDate),
            },
          },
        ],
      },
    });

    if (conflictingBookings.length > 0) {
      return NextResponse.json(
        { error: 'Room is not available for the selected dates' },
        { status: 409 }
      );
    }

    // Generate booking reference
    const bookingReference = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingReference,
        guestName,
        guestEmail,
        guestPhone: guestPhone || null,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        numberOfGuests: parseInt(numberOfGuests) || 1,
        totalAmount: parseFloat(totalAmount),
        status: 'DRAFT',
        specialRequests: specialRequests || null,
        roomId: parseInt(roomId),
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: parseFloat(totalAmount),
        currency: 'PHP',
        paymentMethod: 'CASH_ON_ARRIVAL', // Default for now
        status: 'PENDING',
      },
    });

    // Update booking status to PENDING_PAYMENT
    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'PENDING_PAYMENT' },
      include: {
        room: true,
        payments: true,
      },
    });

    return NextResponse.json({
      ...updatedBooking,
      bookingReference: updatedBooking.bookingReference,
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        room: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}
