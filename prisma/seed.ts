import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create single room with hourly rates
  const room = await prisma.room.create({
    data: {
      name: 'Standard Room',
      description: 'Comfortable room for rest stop guests - includes 2 adults and up to 2 children under 10',
      capacity: 4, // Max 4 persons
      basePrice12h: 1000.00, // 12 hours
      basePrice24h: 1800.00, // 24 hours
      extraAdultPrice: 300.00, // Extra adults
      amenities: ['WiFi', 'Air Conditioning', 'Private Bathroom', 'TV'],
    },
  });

  console.log(`✅ Created room: ${room.name}`);

  // Create sample booking
  const sampleBooking = await prisma.booking.create({
    data: {
      bookingReference: 'BK-2024-001',
      guestName: 'Juan Dela Cruz',
      guestEmail: 'juan@example.com',
      guestPhone: '+63 912 345 6789',
      checkInDate: new Date('2024-12-15'),
      duration: 12,
      numberOfAdults: 2,
      numberOfChildren: 1,
      extraAdults: 0,
      totalAmount: 1000.00, // 12-hour rate
      status: 'CONFIRMED',
      specialRequests: 'Late check-in requested',
      roomId: room.id,
    },
  });

  console.log(`✅ Created sample booking: ${sampleBooking.bookingReference}`);

  // Create sample payment
  await prisma.payment.create({
    data: {
      bookingId: sampleBooking.id,
      amount: 1000.00,
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



