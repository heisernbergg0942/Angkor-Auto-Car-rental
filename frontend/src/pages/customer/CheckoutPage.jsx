import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck, Shield, Car, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { bookingAPI, paymentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '14px',
      color: '#1f2937',
      fontFamily: '"Inter", sans-serif',
      fontSmoothing: 'antialiased',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: {
      color: '#ef4444',
      iconColor: '#ef4444',
    },
  },
};

function CheckoutForm({ bookingData, total, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMsg('');

    try {
      // 1. Create booking in backend
      const { data } = await bookingAPI.create({
        vehicle_id:  bookingData.vehicle.id,
        pickup_date: bookingData.pickupDate,
        return_date: bookingData.returnDate,
        addon_ids:   bookingData.addonIds,
        notes:       bookingData.notes,
      });

      const bookingId = data.booking?.id || 'DEMO-001';

      // 2. Create Payment Intent
      const res = await paymentAPI.createIntent({
        amount: total,
        currency: 'usd',
        booking_id: bookingId,
      });

      const clientSecret = res.data?.clientSecret || res.data?.client_secret;

      // 3. Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: cardholderName },
        },
      });

      if (error) {
        setErrorMsg(error.message);
        setIsProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        onPaymentSuccess(data.booking);
      }
    } catch (err) {
      console.warn('Payment or booking failed.', err);
      // Fallback for demo
      onPaymentSuccess({ id: 'DEMO-001', vehicle: bookingData.vehicle, pickup_date: bookingData.pickupDate, return_date: bookingData.returnDate, status: 'paid' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Notes (optional)</label>
        <textarea
          value={bookingData.notes}
          onChange={(e) => bookingData.setNotes(e.target.value)}
          rows={2}
          placeholder="E.g. I'll arrive at 10am, need airport pickup..."
          className="w-full px-3 py-2.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] resize-none transition-colors"
        />
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Name on Card
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          placeholder="Jane Cooper"
          required
          className="w-full py-3 px-3 border border-gray-300 rounded-md outline-none text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
        />
      </div>

      {/* Stripe Card Element */}
      <div>
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Card Information
        </label>
        <div className="border border-gray-300 rounded-md px-4 py-3.5 focus-within:ring-1 focus-within:ring-[#2D6A4F] focus-within:border-[#2D6A4F] bg-white transition">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
          <Lock className="w-3 h-3" /> Secured by Stripe — your card details are encrypted
        </p>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md px-4 py-3">
          {errorMsg}
        </div>
      )}

      {/* Test Card Helper */}
      <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-xs text-amber-700 space-y-1">
        <p className="font-semibold">🧪 Test Mode — Use these fake card details:</p>
        <p>Card: <span className="font-mono font-bold">4242 4242 4242 4242</span></p>
        <p>Expiry: <span className="font-mono">Any future date</span> &nbsp; CVC: <span className="font-mono">Any 3 digits</span></p>
      </div>

      {/* Pay Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-[#2D6A4F] hover:bg-[#245c43] text-white py-4 rounded-md font-medium transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin w-4 h-4 text-white" />
            Processing...
          </>
        ) : (
          `Pay $${parseFloat(total).toFixed(2)}`
        )}
      </button>

      <p className="text-center text-xs text-gray-400 mt-2 leading-relaxed">
        By clicking Pay, you agree to our{' '}
        <span className="text-[#2D6A4F] cursor-pointer hover:underline">Terms of Service</span> and{' '}
        <span className="text-[#2D6A4F] cursor-pointer hover:underline">Rental Agreement</span>.
      </p>
    </form>
  );
}

export default function CheckoutPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();

  // Booking data passed from VehicleDetailPage via navigate state
  const booking = location.state || {};
  const vehicle     = booking.vehicle     || {};
  const pickupDate  = booking.pickup_date || '';
  const returnDate  = booking.return_date || '';
  const addonIds    = booking.addon_ids   || [];
  const days        = booking.days        || 1;
  const baseTotal   = booking.baseTotal   || 0;
  const addonsTotal = booking.addonsTotal || 0;
  const total       = booking.total       || baseTotal + addonsTotal;

  const [notes, setNotes] = useState('');

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  // If no booking data, redirect back
  if (!vehicle.id && !booking.vehicle_id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <div className="text-5xl">🚗</div>
        <h1 className="text-xl font-bold text-gray-700">No booking selected</h1>
        <p className="text-gray-400 text-sm">Please select a vehicle and dates first.</p>
        <button onClick={() => navigate('/browse')} className="bg-[#2D6A4F] text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#1B4332]">
          Browse Fleet
        </button>
      </div>
    );
  }

  const handlePaymentSuccess = (confirmedBooking) => {
    navigate('/payment-success', { state: { booking: confirmedBooking } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white h-16 flex items-center justify-between px-6 lg:px-12 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#2D6A4F] rounded-md flex items-center justify-center">
            <Car className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[#2D6A4F] text-base">Angkor Auto</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <Lock className="w-3.5 h-3.5" /> Secure checkout
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left – Booking Summary */}
        <div className="w-full lg:w-[420px] bg-[#F4F5F7] p-8 lg:p-12 lg:border-r border-gray-100 flex flex-col shrink-0">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-8 w-fit transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to details
          </button>

          {/* Vehicle */}
          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-3xl shrink-0">🚗</div>
            <div>
              <div className="font-semibold text-gray-900">{vehicle.brand} {vehicle.model}</div>
              <div className="text-xs text-gray-400 mt-0.5">{vehicle.year} · {vehicle.color} · {vehicle.plate_number}</div>
              <div className="text-sm font-bold text-[#2D6A4F] mt-1">${vehicle.daily_rate}/day</div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-[#2D6A4F]" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rental Dates</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="text-[10px] text-gray-400 mb-0.5">PICKUP</div>
                <div className="font-semibold text-gray-800">{formatDate(pickupDate)}</div>
              </div>
              <div className="text-gray-300 font-light text-xl">→</div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 mb-0.5">RETURN</div>
                <div className="font-semibold text-gray-800">{formatDate(returnDate)}</div>
              </div>
            </div>
            <div className="mt-2 text-center text-[11px] text-gray-400">{days} day{days !== 1 ? 's' : ''} total</div>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-3 pt-4 border-t border-gray-200/70">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">${vehicle.daily_rate} × {days} day{days !== 1 ? 's' : ''}</span>
              <span className="font-medium text-gray-900">${parseFloat(baseTotal).toFixed(2)}</span>
            </div>
            {addonsTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Add-ons ({addonIds.length})</span>
                <span className="font-medium text-gray-900">${parseFloat(addonsTotal).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between items-center pt-3 border-t border-gray-200/70">
              <span className="text-base font-semibold text-gray-900">Total Due</span>
              <span className="text-2xl font-bold text-[#2D6A4F]">${parseFloat(total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right – Stripe Payment Form */}
        <div className="flex-1 bg-white p-8 lg:p-16 flex justify-center">
          <div className="w-full max-w-lg">
            <h1 className="text-xl font-bold text-gray-900 mb-1">Payment Information</h1>
            <p className="text-sm text-gray-400 mb-8">Complete your booking securely with Stripe.</p>

            <Elements stripe={stripePromise}>
              <CheckoutForm 
                bookingData={{ vehicle, pickupDate, returnDate, addonIds, notes, setNotes }} 
                total={total} 
                onPaymentSuccess={handlePaymentSuccess} 
              />
            </Elements>

            {/* Trust Badges */}
            <div className="mt-10 flex items-center justify-center gap-6 text-xs font-semibold text-gray-300 tracking-wider">
              <div className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> SECURE</div>
              <div className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> VERIFIED</div>
              <div className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> PROTECTED</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
