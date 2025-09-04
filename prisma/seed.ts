import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create sample rooms
  const rooms = await Promise.all([
    prisma.room.create({
      data: {
        name: 'Standard Room',
        description: 'Comfortable room with basic amenities',
        capacity: 2,
        basePrice: 1500.00,
        amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom'],
      },
    }),
    prisma.room.create({
      data: {
        name: 'Deluxe Room',
        description: 'Spacious room with premium amenities',
        capacity: 4,
        basePrice: 2500.00,
        amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'TV'],
      },
    }),
    prisma.room.create({
      data: {
        name: 'Family Suite',
        description: 'Large suite perfect for families',
        capacity: 6,
        basePrice: 3500.00,
        amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'TV', 'Kitchenette'],
      },
    }),
    prisma.room.create({
      data: {
        name: 'Budget Room',
        description: 'Affordable option for budget travelers',
        capacity: 2,
        basePrice: 1000.00,
        amenities: ['WiFi', 'Shared Bathroom'],
      },
    }),
    prisma.room.create({
      data: {
        name: 'Executive Room',
        description: 'Premium room with business amenities',
        capacity: 2,
        basePrice: 3000.00,
        amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'Mini Fridge', 'TV', 'Work Desk'],
      },
    }),
  ]);

  console.log(`✅ Created ${rooms.length} rooms`);

  // Create sample booking
  const sampleBooking = await prisma.booking.create({
    data: {
      bookingReference: 'BK-2024-001',
      guestName: 'Juan Dela Cruz',
      guestEmail: 'juan@example.com',
      guestPhone: '+63 912 345 6789',
      checkInDate: new Date('2024-12-15'),
      checkOutDate: new Date('2024-12-17'),
      numberOfGuests: 2,
      totalAmount: 3000.00,
      status: 'CONFIRMED',
      specialRequests: 'Late check-in requested',
      roomId: rooms[0].id,
    },
  });

  console.log(`✅ Created sample booking: ${sampleBooking.bookingReference}`);

  // Create sample payment
  await prisma.payment.create({
    data: {
      bookingId: sampleBooking.id,
      amount: 3000.00,
      currency: 'PHP',
      paymentMethod: 'GCASH',
      status: 'COMPLETED',
      transactionId: 'TXN-2024-001',
      paymentReference: 'PAY-2024-001',
      processedAt: new Date(),
    },
  });

  console.log('✅ Created sample payment');

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



