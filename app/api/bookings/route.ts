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
      duration,
      numberOfAdults,
      numberOfChildren,
      extraAdults,
      specialRequests,
      roomId,
    } = body;

    // Validate required fields
    if (!guestName || !guestEmail || !checkInDate || !roomId || !duration) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get room details for pricing calculation
    const room = await prisma.room.findUnique({
      where: { id: parseInt(roomId) }
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Calculate total amount based on duration and extra adults
    const basePrice = duration === 24 ? room.basePrice24h : room.basePrice12h;
    const extraAdultCost = (extraAdults || 0) * room.extraAdultPrice;
    const totalAmount = Number(basePrice) + extraAdultCost;

    // Check for booking conflicts - check if there's already a booking on the same date
    const conflictingBookings = await prisma.booking.findMany({
      where: {
        roomId: parseInt(roomId),
        status: {
          in: ['CONFIRMED', 'PENDING_PAYMENT'],
        },
        checkInDate: new Date(checkInDate),
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
        duration: parseInt(duration) || 12,
        numberOfAdults: parseInt(numberOfAdults) || 2,
        numberOfChildren: parseInt(numberOfChildren) || 0,
        extraAdults: parseInt(extraAdults) || 0,
        totalAmount: totalAmount,
        status: 'DRAFT',
        specialRequests: specialRequests || null,
        roomId: parseInt(roomId),
      },
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: totalAmount,
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
