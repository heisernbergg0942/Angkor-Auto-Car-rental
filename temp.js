import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldCheck, Shield, User, Car } from 'lucide-react';
import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Load Stripe with your publishable key from .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// ÔöÇÔöÇÔöÇ Card Element Style ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
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

// ÔöÇÔöÇÔöÇ Booking details (would come from router state / context in real app) ÔöÇÔöÇÔöÇÔöÇÔöÇ
const BOOKING = {
  vehicle: '2024 Tesla Model S Plaid',
  image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
  dates: 'Oct 12, 10:00 AM ÔÇö Oct 15, 10:00 AM',
  location: "San Francisco Int'l Airport (SFO)",
  rentalCost: 735.00,
  insurance: 45.00,
  taxes: 82.40,
};
const TOTAL = BOOKING.rentalCost + BOOKING.insurance + BOOKING.taxes;

// ÔöÇÔöÇÔöÇ Inner checkout form (needs Stripe context) ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [cardholderName, setCardholderName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMsg('');

    try {
      // 1. Ask your Laravel backend to create a PaymentIntent
      const res = await fetch('/api/payment/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: TOTAL,
          currency: 'usd',
          booking_id: 'DEMO-001',
        }),
      });

      // ÔöÇÔöÇ DEMO MODE: if backend isn't running yet, simulate success ÔöÇÔöÇ
      if (!res.ok) {
        console.warn('Backend not running ÔÇö simulating payment for demo.');
        setTimeout(() => navigate('/payment-success'), 1500);
        return;
      }

      const { clientSecret } = await res.json();

      // 2. Confirm the card payment with Stripe
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
        navigate('/payment-success');
      }
    } catch (err) {
      // Backend not connected ÔÇö simulate for demo/testing
      console.warn('Network error ÔÇö simulating payment for demo.');
      setTimeout(() => navigate('/payment-success'), 1500);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

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
          <Lock className="w-3 h-3" /> Secured by Stripe ÔÇö your card details are encrypted
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
        <p className="font-semibold">­ƒº¬ Test Mode ÔÇö Use these fake card details:</p>
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
            <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processing...
          </>
        ) : (
          `Pay $${TOTAL.toFixed(2)}`
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

// ÔöÇÔöÇÔöÇ Page wrapper ÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇÔöÇ
export default function CheckoutPage() {
  const navigate = useNavigate();

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
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <User className="w-4 h-4" />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col lg:flex-row">

        {/* Left: Booking Summary */}
        <div className="w-full lg:w-[440px] bg-[#F4F5F7] p-8 lg:p-12 lg:border-r border-gray-100 flex flex-col">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium mb-10 w-fit transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to details
          </button>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Selected Vehicle</p>
          <h2 className="text-xl font-semibold text-gray-900 mb-5">{BOOKING.vehicle}</h2>

          <div className="rounded-xl overflow-hidden mb-8 shadow-sm">
            <img src={BOOKING.image} alt={BOOKING.vehicle} className="w-full h-auto object-cover" />
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Pick-up & Drop-off</h3>
            <p className="text-sm font-semibold text-gray-900 mb-1">{BOOKING.dates}</p>
            <p className="text-sm text-gray-500">{BOOKING.location}</p>
          </div>

          <div className="space-y-3 pt-5 border-t border-gray-200/70 flex-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">$245.00 ├ù 3 days</span>
              <span className="font-medium text-gray-900">${BOOKING.rentalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Insurance (Premium)</span>
              <span className="font-medium text-gray-900">${BOOKING.insurance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Taxes & Fees</span>
              <span className="font-medium text-gray-900">${BOOKING.taxes.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-5 mt-5 border-t border-gray-200/70 flex justify-between items-center">
            <span className="text-base font-medium text-gray-900">Total Due</span>
            <span className="text-2xl font-bold text-[#2D6A4F]">${TOTAL.toFixed(2)}</span>
          </div>
        </div>

        {/* Right: Stripe Payment Form */}
        <div className="flex-1 bg-white p-8 lg:p-16 flex justify-center">
          <div className="w-full max-w-lg">
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Payment Information</h1>
            <p className="text-sm text-gray-400 mb-8">Complete your booking securely with Stripe</p>

            <Elements stripe={stripePromise}>
              <CheckoutForm />
            </Elements>

            {/* Trust Badges */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs font-semibold text-gray-400 tracking-wider">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> SECURE PAYMENT
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" /> SSL ENCRYPTED
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" /> FRAUD PROTECTED
              </div>
            </div>

            {/* Stripe branding */}
            <div className="mt-6 flex justify-center">
              <span className="text-xs text-gray-300">
                Powered by <span className="font-semibold text-gray-400">Stripe</span>
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
