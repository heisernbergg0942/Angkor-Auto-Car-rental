import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Zap, Activity, Route, Timer, Users, ChevronDown } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { vehicles } from '../../data/vehicles';

export default function VehicleDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const vehicle = vehicles.find(v => v.id === id) || vehicles[0];

  const [startDate, setStartDate] = useState('2023-10-24');
  const [endDate, setEndDate] = useState('2023-10-27');
  const [addons, setAddons] = useState({
    gps: false,
    babySeat: false,
    childSeat: false
  });

  const days = (() => {
    if (!startDate || !endDate) return 1;
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return Math.max(1, diff);
  })();
  
  const baseTotal = vehicle.price * days;
  const insurance = 45;
  const fleetFee = 12.50;
  
  const addonsTotal = (addons.gps ? 15 : 0) + 
                      (addons.babySeat ? 10 * days : 0) + 
                      (addons.childSeat ? 5 * days : 0);

  const total = baseTotal + insurance + fleetFee + addonsTotal;

  const similar = vehicles.filter(v => v.id !== vehicle.id).slice(0, 3);

  return (
    <CustomerLayout>
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* ---- Left Column ---- */}
          <div className="flex-1 min-w-0">
            {/* Hero Image */}
            <div className="rounded-xl overflow-hidden relative mb-5" style={{ height: '400px' }}>
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-full object-cover"
                onError={e => { e.target.style.display = 'none'; }}
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2 z-10">
                {vehicle.fuel === 'Electric' && (
                  <span className="flex items-center gap-1 border border-white/30 bg-[#1f2937]/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                    <span>⚡</span> Electric
                  </span>
                )}
                <span className="border border-white/30 bg-[#1f2937]/60 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  Premium Class
                </span>
              </div>
            </div>

            {/* Vehicle Title */}
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vehicle.name}</h1>
                <div className="flex items-center gap-1.5 text-gray-500 text-xs mt-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {vehicle.location}
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-4 h-4 text-[#2D6A4F] stroke-2 fill-transparent" />
                <span className="text-sm font-bold text-[#2D6A4F]">{vehicle.rating}</span>
                <span className="text-xs text-gray-500">({vehicle.reviews} reviews)</span>
              </div>
            </div>

            {/* Quick Specs */}
            <div className="grid grid-cols-4 gap-3 mb-8">
              {[
                { icon: Activity, label: 'Top Speed', value: vehicle.topSpeed },
                { icon: Route, label: 'Range', value: vehicle.range },
                { icon: Users, label: 'Capacity', value: `${vehicle.seats} Seats` },
                { icon: Zap, label: '0-60 mph', value: vehicle.acceleration },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-4 text-center flex flex-col items-center justify-center">
                  <Icon className="w-4 h-4 text-[#2D6A4F] mb-1.5" />
                  <div className="text-[10px] font-medium text-gray-500 mb-0.5">{label}</div>
                  <div className="text-sm font-bold text-gray-900">{value}</div>
                </div>
              ))}
            </div>

            {/* About */}
            <div className="mb-8">
              <h2 className="font-bold text-gray-900 text-base mb-3">About this vehicle</h2>
              <p className="text-xs leading-relaxed text-gray-600">{vehicle.description}</p>
            </div>

            {/* Technical Specifications */}
            <div className="mb-6">
              <h2 className="font-bold text-gray-900 text-base mb-4">Technical Specifications</h2>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                {Object.entries(vehicle.specs).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-xs font-semibold text-gray-900">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ---- Right Booking Panel ---- */}
          <div className="w-80 shrink-0">
            <div className="border border-gray-100 rounded-xl p-6 sticky top-24 shadow-sm bg-white">
              {/* Price */}
              <div className="flex items-baseline gap-1.5 mb-6">
                <span className="text-2xl font-bold text-[#2D6A4F]">${vehicle.price}</span>
                <span className="text-xs text-gray-500">/ day</span>
              </div>

              {/* Dates */}
              <div className="mb-6">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">DATES</div>
                <div className="grid grid-cols-2 gap-0 border border-gray-200 rounded-md overflow-hidden">
                  <div className="p-2.5 border-r border-gray-200 bg-white">
                    <div className="text-[9px] text-gray-500 uppercase font-semibold mb-1">Start Date</div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full text-xs font-medium text-gray-800 focus:outline-none bg-transparent"
                    />
                  </div>
                  <div className="p-2.5 bg-white">
                    <div className="text-[9px] text-gray-500 uppercase font-semibold mb-1">End Date</div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full text-xs font-medium text-gray-800 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Add-ons & Extras */}
              <div className="mb-6">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">ADD-ONS & EXTRAS</div>
                <div className="space-y-3.5">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        checked={addons.gps}
                        onChange={e => setAddons({...addons, gps: e.target.checked})}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#2D6A4F] focus:ring-[#2D6A4F]"
                      />
                      <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">Offline GPS Navigation</span>
                    </div>
                    <span className="text-xs text-gray-500">$15.00/trip</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        checked={addons.babySeat}
                        onChange={e => setAddons({...addons, babySeat: e.target.checked})}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#2D6A4F] focus:ring-[#2D6A4F]"
                      />
                      <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">Baby Seat</span>
                    </div>
                    <span className="text-xs text-gray-500">$10.00/day</span>
                  </label>
                  <label className="flex items-center justify-between cursor-pointer group">
                    <div className="flex items-center gap-2.5">
                      <input 
                        type="checkbox" 
                        checked={addons.childSeat}
                        onChange={e => setAddons({...addons, childSeat: e.target.checked})}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-[#2D6A4F] focus:ring-[#2D6A4F]"
                      />
                      <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">Child Booster Seat</span>
                    </div>
                    <span className="text-xs text-gray-500">$5.00/day</span>
                  </label>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 py-4 border-t border-b border-gray-100 mb-5">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>${vehicle.price} × {days} days</span>
                  <span className="font-medium text-gray-900">${baseTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span className="underline decoration-dashed underline-offset-2">Premium Insurance</span>
                  <span className="font-medium text-gray-900">${insurance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Fleet Fee</span>
                  <span className="font-medium text-gray-900">${fleetFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Selected Extras</span>
                  <span className="font-medium text-gray-900">${addonsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              {/* CTA */}
              <button 
                onClick={() => navigate('/checkout')}
                className="w-full bg-[#407a5d] text-white text-xs font-bold py-3.5 rounded-md hover:bg-[#34634b] transition-colors flex items-center justify-center gap-2 mb-3 shadow-sm"
              >
                Proceed to Payment →
              </button>
              <p className="text-[10px] text-gray-400 text-center leading-relaxed">
                You won't be charged yet. Cancellation is free up to 24 hours before pickup.
              </p>
            </div>
          </div>
        </div>

        {/* Similar Fleet */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Similar fleet options</h2>
            <div className="grid grid-cols-3 gap-5">
              {similar.map(v => (
                <div
                  key={v.id}
                  className="border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow flex flex-col"
                  onClick={() => navigate(`/browse/${v.id}`)}
                >
                  <div className="bg-gray-100 w-full h-[180px] overflow-hidden shrink-0">
                    <img
                      src={v.image}
                      alt={v.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-sm font-bold text-gray-900">{v.name}</span>
                      <span className="text-[#2D6A4F] text-xs font-bold whitespace-nowrap ml-2">${v.price}/day</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-500 mb-5 font-medium">
                      <span className="flex items-center gap-1.5"><Route className="w-3.5 h-3.5 text-gray-400"/> {v.range}</span>
                      <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-gray-400"/> {v.seats}</span>
                    </div>
                    <div className="mt-auto">
                      <button className="w-full border border-gray-200 text-gray-600 text-[11px] font-semibold py-2.5 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
