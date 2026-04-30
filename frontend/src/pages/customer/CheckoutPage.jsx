import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock, ShieldCheck, Shield, User, Car } from 'lucide-react';
import { useState } from 'react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      navigate('/my-trips'); // Or some success page
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Minimal Header */}
      <header className="border-b border-gray-100 bg-white h-16 flex items-center justify-between px-6 lg:px-12 shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#2D6A4F] rounded-md flex items-center justify-center">
            <Car className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-[#2D6A4F] text-base">FleetRent</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <User className="w-4 h-4" />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row">
        {/* Left Side: Summary Panel */}
        <div className="w-full lg:w-[450px] bg-[#F4F5F7] p-8 lg:p-12 lg:border-r border-gray-100 flex flex-col">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium mb-10 w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to details
          </button>

          <div className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
            Selected Vehicle
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-6">2024 Tesla Model S Plaid</h2>

          <div className="rounded-xl overflow-hidden mb-8 shadow-sm">
            <img 
              src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Tesla Model S Plaid" 
              className="w-full h-auto object-cover"
            />
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pick-up & Drop-off</h3>
            <p className="text-sm font-bold text-gray-900 mb-1">Oct 12, 10:00 AM — Oct 15, 10:00 AM</p>
            <p className="text-sm text-gray-600">San Francisco Int'l Airport (SFO)</p>
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-200/60 flex-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">$245.00 × 3 days</span>
              <span className="font-medium text-gray-900">$735.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Insurance (Premium Coverage)</span>
              <span className="font-medium text-gray-900">$45.00</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Taxes & Fees</span>
              <span className="font-medium text-gray-900">$82.40</span>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-200/60 flex justify-between items-center">
            <span className="text-base font-medium text-gray-900">Total</span>
            <span className="text-xl font-medium text-[#2D6A4F]">$862.40</span>
          </div>
        </div>

        {/* Right Side: Payment Form */}
        <div className="flex-1 bg-white p-8 lg:p-16 flex justify-center">
          <div className="w-full max-w-lg">
            <h2 className="text-lg font-medium text-gray-900 mb-8">Payment Information</h2>

            <form onSubmit={handlePayment} className="space-y-6">
              {/* Card Information */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Card Information</label>
                <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden focus-within:ring-1 focus-within:ring-[#2D6A4F] focus-within:border-[#2D6A4F]">
                  <div className="pl-3 py-3 text-gray-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="1234 5678 1234 5678" 
                    className="flex-1 py-3 px-3 outline-none text-sm text-gray-800 placeholder-gray-400"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="MM / YY" 
                    className="w-20 py-3 px-3 outline-none border-l border-gray-200 text-sm text-gray-800 placeholder-gray-400"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="CVC" 
                    className="w-16 py-3 px-3 outline-none border-l border-gray-200 text-sm text-gray-800 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Name on Card */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Name on Card</label>
                <input 
                  type="text" 
                  placeholder="Jane Cooper" 
                  className="w-full py-3 px-3 border border-gray-300 rounded-md outline-none text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F]"
                  required
                />
              </div>

              {/* Country or Region */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">Country or Region</label>
                <select className="w-full py-3 px-3 border border-gray-300 rounded-md outline-none text-sm text-gray-800 bg-white focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] appearance-none cursor-pointer">
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
                
                {/* Address Group */}
                <div className="mt-[-1px]">
                  <input 
                    type="text" 
                    placeholder="Address line 1" 
                    className="w-full py-3 px-3 border border-gray-300 outline-none text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] focus:z-10 relative"
                    required
                  />
                </div>
                <div className="flex mt-[-1px]">
                  <input 
                    type="text" 
                    placeholder="City" 
                    className="flex-1 py-3 px-3 border border-gray-300 rounded-bl-md outline-none text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] focus:z-10 relative"
                    required
                  />
                  <input 
                    type="text" 
                    placeholder="ZIP" 
                    className="w-1/3 py-3 px-3 border border-gray-300 border-l-0 rounded-br-md outline-none text-sm text-gray-800 placeholder-gray-400 focus:ring-1 focus:ring-[#2D6A4F] focus:border-[#2D6A4F] focus:z-10 relative"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-[#345e4e] hover:bg-[#284a3d] text-white py-4 rounded-md font-medium transition-colors mt-8 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Pay $862.40'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-4 leading-relaxed">
                By clicking Pay, you agree to our Terms of Service and Rental Agreement.
              </p>
            </form>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 text-xs font-semibold text-gray-500 tracking-wider">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-400" /> SECURE PAYMENT
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" /> SSL ENCRYPTED
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gray-400" /> FRAUD PROTECTED
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
