import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Rest Stop Booking System
            </h1>
            <Link 
              href="/admin"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Our Rest Stop
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Book your comfortable stay for your journey
          </p>
          <Link
            href="/book"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Book Now
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Rates</h3>
            <p className="text-black">₱1,000 for 12h or ₱1,800 for 24h</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Up to 4 Guests</h3>
            <p className="text-black">2 adults + 2 children under 10 free</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Extra Adults</h3>
            <p className="text-black">Only ₱300 per additional adult</p>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">✓ Free WiFi</h4>
              <p className="text-black">Stay connected during your stay</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">✓ Air Conditioning</h4>
              <p className="text-black">Comfortable temperature control</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">✓ Flexible Payment</h4>
              <p className="text-black">GCash, cards, or cash on arrival</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">✓ Easy Booking</h4>
              <p className="text-black">Simple online reservation system</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}