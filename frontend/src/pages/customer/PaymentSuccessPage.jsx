import { Link } from 'react-router-dom';
import { CheckCircle, Car, Calendar, MapPin, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center px-4 font-sans">
      
      {/* Card */}
      <div className="bg-white rounded-2xl shadow-sm p-10 w-full max-w-md text-center">
        
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#D8F3DC] flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-[#2D6A4F]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Your booking has been confirmed. You'll receive a confirmation email shortly.
        </p>

        {/* Booking Summary Box */}
        <div className="bg-[#F4F5F7] rounded-xl p-5 text-left space-y-3 mb-8">
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Car className="w-4 h-4 text-[#2D6A4F] shrink-0" />
            <span><span className="font-medium">Vehicle:</span> 2024 Tesla Model S Plaid</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-[#2D6A4F] shrink-0" />
            <span><span className="font-medium">Dates:</span> Oct 12 — Oct 15, 2024</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-[#2D6A4F] shrink-0" />
            <span><span className="font-medium">Pick-up:</span> San Francisco Int'l Airport</span>
          </div>
        </div>

        {/* Booking ID */}
        <div className="text-xs text-gray-400 mb-8">
          Booking ID: <span className="font-mono font-medium text-gray-600">BK-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/my-trips"
            className="w-full bg-[#2D6A4F] hover:bg-[#245c43] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          >
            View My Trips <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium transition-colors text-sm"
          >
            Back to Home
          </Link>
        </div>
      </div>

      {/* Footer note */}
      <p className="mt-6 text-xs text-gray-400">
        Questions? <Link to="/support" className="text-[#2D6A4F] hover:underline">Contact Support</Link>
      </p>
    </div>
  );
}
