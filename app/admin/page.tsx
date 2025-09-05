'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Booking {
  id: number;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  checkInDate: string;
  duration: number;
  numberOfAdults: number;
  numberOfChildren: number;
  extraAdults: number;
  totalAmount: number;
  status: string;
  specialRequests: string | null;
  room: {
    id: number;
    name: string;
  };
  payments: {
    id: number;
    status: string;
    amount: number;
    paymentMethod: string;
  }[];
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCreateBooking, setShowCreateBooking] = useState(false);
  const [rooms, setRooms] = useState<any[]>([]);
  const [createBookingData, setCreateBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkInDate: '',
    duration: 12,
    numberOfAdults: 2,
    numberOfChildren: 0,
    extraAdults: 0,
    specialRequests: '',
    paymentMethod: 'cash',
  });
  const [creatingBooking, setCreatingBooking] = useState(false);

  // Simple password protection
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
    } else {
      alert('Wrong password');
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
      fetchRooms();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings');
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error('Failed to fetch bookings');
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const handleCreateBookingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCreateBookingData(prev => ({
      ...prev,
      [name]: ['duration', 'numberOfAdults', 'numberOfChildren', 'extraAdults'].includes(name) ? parseInt(value) : value
    }));
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rooms.length) return;

    setCreatingBooking(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createBookingData,
          roomId: rooms[0].id, // Use first room since we only have one
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBookings(prev => [result, ...prev]);
        setShowCreateBooking(false);
        setCreateBookingData({
          guestName: '',
          guestEmail: '',
          guestPhone: '',
          checkInDate: '',
          duration: 12,
          numberOfAdults: 2,
          numberOfChildren: 0,
          extraAdults: 0,
          specialRequests: '',
          paymentMethod: 'cash',
        });
        alert('Booking created successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create booking: ${error.error}`);
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setCreatingBooking(false);
    }
  };

  const handleStatusUpdate = async (bookingId: number, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus.toLowerCase()} this booking?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the booking in the local state
        setBookings(prev => prev.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: newStatus }
            : booking
        ));
        alert(`Booking ${newStatus.toLowerCase()} successfully!`);
      } else {
        const error = await response.json();
        alert(`Failed to update booking: ${error.error}`);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'PENDING_PAYMENT':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
          <h2 className="text-2xl font-bold text-black mb-6 text-center">
            Admin Login
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Enter admin password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Login
            </button>
          </form>
          <p className="text-xs text-black mt-4 text-center">
            Demo password: admin123
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-black">Loading bookings...</p>
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
            <h1 className="text-2xl font-bold text-black">
              Admin Dashboard
            </h1>
            <div className="space-x-4">
              <Link
                href="/"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View Site
              </Link>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats and Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-black mb-2">Total Bookings</h3>
            <p className="text-3xl font-bold text-blue-600">{bookings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-black mb-2">Confirmed</h3>
            <p className="text-3xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-black mb-2">Pending Payment</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === 'PENDING_PAYMENT').length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-black mb-2">Actions</h3>
            <button
              onClick={() => setShowCreateBooking(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-sm"
            >
              Create Booking
            </button>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-black">Recent Bookings</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Booking
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Guest & Room
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider hidden sm:table-cell">
                    Date & Duration
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">
                        {booking.bookingReference}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-black">
                          {booking.guestName}
                        </div>
                        <div className="text-xs text-black">
                          {booking.guestEmail}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {booking.room.name} • {booking.numberOfAdults}A, {booking.numberOfChildren}C
                          {booking.extraAdults > 0 && `, +${booking.extraAdults}`}
                        </div>
                        <div className="text-xs text-blue-600 sm:hidden mt-1">
                          {new Date(booking.checkInDate).toLocaleDateString()} • {booking.duration}h
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-sm text-black">
                        {new Date(booking.checkInDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-blue-600">
                        {booking.duration}h duration
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">
                        ₱{booking.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {booking.payments.length > 0 ? booking.payments[0].paymentMethod : 'No payment'}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'CONFIRMED')}
                          disabled={booking.status === 'CONFIRMED'}
                          className="text-green-600 hover:text-green-900 disabled:text-gray-400 disabled:cursor-not-allowed text-xs px-2 py-1 border border-green-300 rounded hover:bg-green-50 disabled:border-gray-300"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}
                          disabled={booking.status === 'CANCELLED'}
                          className="text-red-600 hover:text-red-900 disabled:text-gray-400 disabled:cursor-not-allowed text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50 disabled:border-gray-300"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {bookings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-black">No bookings found.</p>
            <Link
              href="/book"
              className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
            >
              Create a test booking
            </Link>
          </div>
        )}
      </main>

      {/* Create Booking Modal */}
      {showCreateBooking && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-black">Create New Booking</h3>
                <button
                  onClick={() => setShowCreateBooking(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Guest Name</label>
                  <input
                    type="text"
                    name="guestName"
                    value={createBookingData.guestName}
                    onChange={handleCreateBookingInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Guest Email</label>
                  <input
                    type="email"
                    name="guestEmail"
                    value={createBookingData.guestEmail}
                    onChange={handleCreateBookingInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Guest Phone</label>
                  <input
                    type="tel"
                    name="guestPhone"
                    value={createBookingData.guestPhone}
                    onChange={handleCreateBookingInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Check-in Date</label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={createBookingData.checkInDate}
                    onChange={handleCreateBookingInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Duration</label>
                    <select
                      name="duration"
                      value={createBookingData.duration}
                      onChange={handleCreateBookingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value={12}>12 hours</option>
                      <option value={24}>24 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Adults</label>
                    <select
                      name="numberOfAdults"
                      value={createBookingData.numberOfAdults}
                      onChange={handleCreateBookingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value={1}>1 adult</option>
                      <option value={2}>2 adults</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Children</label>
                    <select
                      name="numberOfChildren"
                      value={createBookingData.numberOfChildren}
                      onChange={handleCreateBookingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value={0}>0 children</option>
                      <option value={1}>1 child</option>
                      <option value={2}>2 children</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Extra Adults</label>
                    <select
                      name="extraAdults"
                      value={createBookingData.extraAdults}
                      onChange={handleCreateBookingInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value={0}>0 extra</option>
                      <option value={1}>1 extra</option>
                      <option value={2}>2 extra</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Special Requests</label>
                  <textarea
                    name="specialRequests"
                    value={createBookingData.specialRequests}
                    onChange={handleCreateBookingInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateBooking(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingBooking}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {creatingBooking ? 'Creating...' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
