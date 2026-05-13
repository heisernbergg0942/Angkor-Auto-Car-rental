import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Car, Calendar, ArrowRight, Clock } from 'lucide-react';

export default function PaymentSuccessPage() {
  const location = useLocation();
  const booking  = location.state?.booking || null;

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center px-4 font-sans">
      <div className="bg-white rounded-2xl shadow-sm p-10 w-full max-w-md text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#D8F3DC] flex items-center justify-center animate-bounce-once">
            <CheckCircle className="w-10 h-10 text-[#2D6A4F]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Submitted!</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Your booking request has been submitted and is <span className="font-semibold text-amber-600">pending confirmation</span> by our staff. You'll be notified once confirmed.
        </p>

        {/* Booking Summary */}
        <div className="bg-[#F4F5F7] rounded-xl p-5 text-left space-y-3 mb-6">
          {booking ? (
            <>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Car className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>
                  <span className="font-medium">Vehicle: </span>
                  {booking.vehicle?.brand} {booking.vehicle?.model}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>
                  <span className="font-medium">Dates: </span>
                  {formatDate(booking.pickup_date)} — {formatDate(booking.return_date)}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-700">
                <Clock className="w-4 h-4 text-[#2D6A4F] shrink-0" />
                <span>
                  <span className="font-medium">Status: </span>
                  <span className="capitalize text-amber-600 font-semibold">{booking.status}</span>
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-[#2D6A4F] shrink-0" />
              <span>Booking confirmed — check My Trips for details.</span>
            </div>
          )}
        </div>

        {/* Booking ID */}
        {booking?.id && (
          <div className="text-xs text-gray-400 mb-6">
            Booking ID: <span className="font-mono font-medium text-gray-600">#{booking.id}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Link
            to="/my-trips"
            className="w-full bg-[#2D6A4F] hover:bg-[#245c43] text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
          >
            View My Trips <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/browse"
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-medium transition-colors text-sm"
          >
            Browse More Vehicles
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400">
        Questions? <Link to="/support" className="text-[#2D6A4F] hover:underline">Contact Support</Link>
      </p>
    </div>
  );
}
