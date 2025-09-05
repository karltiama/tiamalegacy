'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Room {
  id: number;
  name: string;
  description: string | null;
  capacity: number;
  basePrice12h: number;
  basePrice24h: number;
  extraAdultPrice: number;
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
    duration: 12,
    numberOfAdults: 2,
    numberOfChildren: 0,
    extraAdults: 0,
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
    // Reset to default values when room is selected
    setBookingData(prev => ({
      ...prev,
      numberOfAdults: 2,
      numberOfChildren: 0,
      extraAdults: 0,
      duration: 12
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: ['duration', 'numberOfAdults', 'numberOfChildren', 'extraAdults'].includes(name) ? parseInt(value) : value
    }));
  };

  const calculateTotal = () => {
    if (!selectedRoom) return 0;
    const basePrice = bookingData.duration === 24 ? selectedRoom.basePrice24h : selectedRoom.basePrice12h;
    const extraAdultCost = bookingData.extraAdults * selectedRoom.extraAdultPrice;
    return Number(basePrice) + extraAdultCost;
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
          <p className="text-black">Loading rooms...</p>
        </div>
      </div>
    );
  }

  if (bookingResult) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full text-center">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-black mb-4">Booking Confirmed!</h2>
          <div className="text-left space-y-2 mb-6">
            <p><strong>Booking Reference:</strong> {bookingResult.bookingReference}</p>
            <p><strong>Room:</strong> {selectedRoom?.name}</p>
            <p><strong>Guest:</strong> {bookingData.guestName}</p>
            <p><strong>Check-in:</strong> {bookingData.checkInDate}</p>
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
            <Link href="/" className="text-2xl font-bold text-black">
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
            <h2 className="text-2xl font-bold text-black mb-6">Select a Room</h2>
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
                      <h3 className="font-semibold text-black">{room.name}</h3>
                      <p className="text-sm text-black mb-2">{room.description}</p>
                      <p className="text-sm text-black">Max capacity: {room.capacity} persons</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {room.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-xs text-black rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="space-y-1">
                        <div>
                          <p className="text-lg font-bold text-black">₱{room.basePrice12h.toLocaleString()}</p>
                          <p className="text-sm text-black">12 hours</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-black">₱{room.basePrice24h.toLocaleString()}</p>
                          <p className="text-sm text-black">24 hours</p>
                        </div>
                        <div>
                          <p className="text-sm text-black">+₱{room.extraAdultPrice.toLocaleString()} per extra adult</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form */}
          <div>
            <h2 className="text-2xl font-bold text-black mb-6">Booking Details</h2>
            {selectedRoom ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Guest Name
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={bookingData.guestName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="guestEmail"
                    value={bookingData.guestEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="guestPhone"
                    value={bookingData.guestPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={bookingData.checkInDate}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                  <p className="text-sm text-black mt-1">
                    You can check in anytime on this date
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Duration
                  </label>
                  <select
                    name="duration"
                    value={bookingData.duration}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value={12}>12 hours (₱{selectedRoom?.basePrice12h.toLocaleString()})</option>
                    <option value={24}>24 hours (₱{selectedRoom?.basePrice24h.toLocaleString()})</option>
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Adults
                    </label>
                    <select
                      name="numberOfAdults"
                      value={bookingData.numberOfAdults}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value={1}>1 adult</option>
                      <option value={2}>2 adults (included)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Children (under 10)
                    </label>
                    <select
                      name="numberOfChildren"
                      value={bookingData.numberOfChildren}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value={0}>0 children</option>
                      <option value={1}>1 child</option>
                      <option value={2}>2 children</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Extra Adults (beyond 2)
                    </label>
                    <select
                      name="extraAdults"
                      value={bookingData.extraAdults}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value={0}>0 extra</option>
                      <option value={1}>1 extra (+₱{selectedRoom?.extraAdultPrice.toLocaleString()})</option>
                      <option value={2}>2 extra (+₱{selectedRoom ? (selectedRoom.extraAdultPrice * 2).toLocaleString() : '0'})</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Special Requests
                  </label>
                  <textarea
                    name="specialRequests"
                    value={bookingData.specialRequests}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-black mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm text-black">
                    <div className="flex justify-between">
                      <span className="text-black">Room:</span>
                      <span className="text-black">{selectedRoom.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Check-in:</span>
                      <span className="text-black">{bookingData.checkInDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-black">Duration:</span>
                      <span className="text-black">{bookingData.duration} hours - ₱{bookingData.duration === 24 ? selectedRoom.basePrice24h.toLocaleString() : selectedRoom.basePrice12h.toLocaleString()}</span>
                    </div>
                    {bookingData.extraAdults > 0 && (
                      <div className="flex justify-between">
                        <span className="text-black">Extra adults ({bookingData.extraAdults}):</span>
                        <span className="text-black">₱{(bookingData.extraAdults * selectedRoom.extraAdultPrice).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-black">Guests:</span>
                      <span className="text-black">{bookingData.numberOfAdults} adults, {bookingData.numberOfChildren} children</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span className="text-black">Total:</span>
                      <span className="text-black">₱{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !bookingData.guestName || !bookingData.guestEmail || !bookingData.checkInDate}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Creating Booking...' : 'Book Now'}
                </button>
              </form>
            ) : (
              <div className="text-center py-8 text-black">
                <p>Please select a room to continue with your booking.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

