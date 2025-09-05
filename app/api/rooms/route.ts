import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Since we only have one room type, we'll return it as a single room
    // but the frontend expects an array, so we'll wrap it
    const room = await prisma.room.findFirst({
      where: {
        isActive: true,
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: 'No active room found' },
        { status: 404 }
      );
    }

    // Return as array for frontend compatibility
    return NextResponse.json([room]);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}
