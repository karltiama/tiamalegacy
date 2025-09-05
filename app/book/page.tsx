'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Room {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  basePrice: number;
  amenities: string[];
}

export default function BookPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    specialRequests: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Fetch rooms on component mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms');
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      } else {
        console.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setBookingData(prev => ({
      ...prev,
      numberOfGuests: Math.min(prev.numberOfGuests, room.capacity)
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: name === 'numberOfGuests' ? parseInt(value) : value
    }));
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    return nights * Number(selectedRoom.basePrice);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;

    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          roomId: selectedRoom.id,
          totalAmount: calculateTotal(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBookingResult(result);
      } else {
        const error = await response.json();
        alert(`Booking failed: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (bookingResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h2>
          <div className="text-left space-y-2 mb-6">
            <p><strong>Booking Reference:</strong> {bookingResult.bookingReference}</p>
            <p><strong>Room:</strong> {selectedRoom?.name}</p>
            <p><strong>Guest:</strong> {bookingData.guestName}</p>
            <p><strong>Check-in:</strong> {bookingData.checkInDate}</p>
            <p><strong>Check-out:</strong> {bookingData.checkOutDate}</p>
            <p><strong>Total:</strong> ₱{calculateTotal().toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <Link
              href="/"
              className="block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Back to Home
            </Link>
            <Link
              href="/admin"
              className="block w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700"
            >
              View in Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Rest Stop Booking
            </Link>
            <Link 
              href="/admin"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Room Selection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Room</h2>
            <div className="space-y-4">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRoom?.id === room.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{room.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                      <p className="text-sm text-gray-600">Capacity: {room.capacity} guests</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {room.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-xs text-gray-600 rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">₱{room.basePrice.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">per night</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Details</h2>
            {selectedRoom ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={bookingData.guestName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="guestEmail"
                    value={bookingData.guestEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="guestPhone"
                    value={bookingData.guestPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      name="checkInDate"
                      value={bookingData.checkInDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Check-out Date
                    </label>
                    <input
                      type="date"
                      name="checkOutDate"
                      value={bookingData.checkOutDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Number of Guests
                  </label>
                  <select
                    name="numberOfGuests"
                    value={bookingData.numberOfGuests}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: selectedRoom.capacity }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} guest{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Room:</span>
                      <span>{selectedRoom.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Price per night:</span>
                      <span>₱{selectedRoom.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Nights:</span>
                      <span>
                        {bookingData.checkInDate && bookingData.checkOutDate
                          ? Math.ceil(
                              (new Date(bookingData.checkOutDate).getTime() - 
                               new Date(bookingData.checkInDate).getTime()) / 
                              (1000 * 60 * 60 * 24)
                            )
                          : 0}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>₱{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !bookingData.guestName || !bookingData.guestEmail || !bookingData.checkInDate || !bookingData.checkOutDate}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating Booking...' : 'Book Now'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Please select a room to continue with your booking.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
