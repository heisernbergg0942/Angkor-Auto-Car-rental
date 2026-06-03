import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Users, Fuel, Calendar, Loader2, AlertCircle } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { vehicleAPI, addonAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function VehicleDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [vehicle,    setVehicle]    = useState(null);
  const [addons,     setAddons]     = useState([]);
  const [similar,    setSimilar]    = useState([]);
  const [selected,   setSelected]   = useState({});   // addonId → boolean
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    Promise.all([
      vehicleAPI.get(id),
      addonAPI.list(),
      vehicleAPI.list({ per_page: 4 }),
    ]).then(([vRes, aRes, allRes]) => {
      setVehicle(vRes.data);
      const addonList = aRes.data?.data || aRes.data || [];
      setAddons(addonList);
      const all = allRes.data?.data || allRes.data || [];
      setSimilar(all.filter(v => String(v.id) !== String(id)).slice(0, 3));
    }).catch(() => setError('Failed to load vehicle details.'))
      .finally(() => setLoading(false));
  }, [id]);

  const days = (() => {
    if (!startDate || !endDate) return 1;
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return Math.max(1, diff);
  })();

  const baseTotal    = vehicle ? parseFloat(vehicle.daily_rate) * days : 0;
  const addonsTotal  = addons
    .filter(a => selected[a.id])
    .reduce((sum, a) => sum + parseFloat(a.price_per_day) * days, 0);
  const total = baseTotal + addonsTotal;

  const toggleAddon = (id) => setSelected(prev => ({ ...prev, [id]: !prev[id] }));

  const handleBook = () => {
    if (!user) { navigate('/login'); return; }
    if (!startDate || !endDate) { setError('Please select pickup and return dates.'); return; }
    navigate('/checkout', {
      state: {
        vehicle,
        pickup_date:  startDate,
        return_date:  endDate,
        addon_ids:    addons.filter(a => selected[a.id]).map(a => a.id),
        days,
        baseTotal,
        addonsTotal,
        total,
      }
    });
  };

  if (loading) return (
    <CustomerLayout>
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
      </div>
    </CustomerLayout>
  );

  if (!vehicle) return (
    <CustomerLayout>
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-5xl mb-4">🚗</div>
        <h1 className="text-xl font-bold text-gray-700 mb-2">Vehicle not found</h1>
        <button onClick={() => navigate('/browse')} className="mt-4 text-[#2D6A4F] underline">Back to Fleet</button>
      </div>
    </CustomerLayout>
  );

  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';
  const imgSrc = vehicle.image
    ? `${baseUrl}/storage/${vehicle.image}`
    : null;

  const statusBadge = {
    available:   'bg-emerald-50 text-emerald-600 border-emerald-200',
    booked:      'bg-blue-50 text-blue-600 border-blue-200',
    rented:      'bg-purple-50 text-purple-600 border-purple-200',
    maintenance: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <CustomerLayout>
      <div className="max-w-screen-xl mx-auto px-6 py-6">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Fleet
        </button>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex gap-8">
          {/* Left */}
          <div className="flex-1 min-w-0">
            {/* Hero Image */}
            <div className="rounded-xl overflow-hidden relative mb-5 bg-gradient-to-br from-gray-100 to-gray-200" style={{ height: '380px' }}>
              {imgSrc ? (
                <img src={imgSrc} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">🚗</div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize ${statusBadge[vehicle.status] || 'bg-gray-100 text-gray-500'}`}>
                  {vehicle.status}
                </span>
                <span className="border border-white/30 bg-black/40 backdrop-blur-md text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  {vehicle.year}
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{vehicle.brand} {vehicle.model}</h1>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Phnom Penh, Cambodia</span>
                  <span>•</span>
                  <span className="font-mono">{vehicle.plate_number}</span>
                  <span>•</span>
                  <span>{vehicle.color}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#2D6A4F]">${vehicle.daily_rate}</div>
                <div className="text-xs text-gray-400">per day</div>
              </div>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-3 mb-7">
              {[
                { icon: Calendar, label: 'Year',      value: vehicle.year },
                { icon: Users,    label: 'Color',     value: vehicle.color },
                { icon: Fuel,     label: 'Plate',     value: vehicle.plate_number },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-4 flex flex-col items-center text-center">
                  <Icon className="w-4 h-4 text-[#2D6A4F] mb-1.5" />
                  <div className="text-[10px] font-medium text-gray-400 mb-0.5">{label}</div>
                  <div className="text-sm font-bold text-gray-900">{value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            {vehicle.description && (
              <div className="mb-7">
                <h2 className="font-bold text-gray-900 text-base mb-3">About this vehicle</h2>
                <p className="text-sm leading-relaxed text-gray-600">{vehicle.description}</p>
              </div>
            )}

            {/* Available Add-ons */}
            {addons.length > 0 && (
              <div>
                <h2 className="font-bold text-gray-900 text-base mb-3">Available Add-ons</h2>
                <div className="grid grid-cols-2 gap-3">
                  {addons.map(addon => (
                    <label key={addon.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${selected[addon.id] ? 'border-[#2D6A4F] bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={!!selected[addon.id]}
                          onChange={() => toggleAddon(addon.id)}
                          className="w-3.5 h-3.5 rounded text-[#2D6A4F] border-gray-300 focus:ring-[#2D6A4F]"
                        />
                        <div>
                          <div className="text-xs font-semibold text-gray-700">{addon.name}</div>
                          <div className="text-[10px] text-gray-400">{addon.description}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#2D6A4F] ml-2 shrink-0">${addon.price_per_day}/day</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right — Booking Panel */}
          <div className="w-80 shrink-0">
            <div className="border border-gray-100 rounded-xl p-6 sticky top-24 shadow-sm bg-white">
              <div className="flex items-baseline gap-1.5 mb-5">
                <span className="text-2xl font-bold text-[#2D6A4F]">${vehicle.daily_rate}</span>
                <span className="text-xs text-gray-400">/ day</span>
              </div>

              {/* Dates */}
              <div className="mb-5">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">SELECT DATES</div>
                <div className="grid grid-cols-2 gap-0 border border-gray-200 rounded-md overflow-hidden">
                  <div className="p-2.5 border-r border-gray-200">
                    <div className="text-[9px] text-gray-400 uppercase font-semibold mb-1">Pickup</div>
                    <input
                      type="date"
                      value={startDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setStartDate(e.target.value)}
                      className="w-full text-xs font-medium text-gray-800 focus:outline-none bg-transparent"
                    />
                  </div>
                  <div className="p-2.5">
                    <div className="text-[9px] text-gray-400 uppercase font-semibold mb-1">Return</div>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      onChange={e => setEndDate(e.target.value)}
                      className="w-full text-xs font-medium text-gray-800 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 py-4 border-t border-b border-gray-100 mb-4">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>${vehicle.daily_rate} × {days} day{days !== 1 ? 's' : ''}</span>
                  <span className="font-medium text-gray-900">${baseTotal.toFixed(2)}</span>
                </div>
                {addons.filter(a => selected[a.id]).map(a => (
                  <div key={a.id} className="flex justify-between text-xs text-gray-600">
                    <span>{a.name}</span>
                    <span className="font-medium text-gray-900">${(parseFloat(a.price_per_day) * days).toFixed(2)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1.5">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleBook}
                disabled={vehicle.status !== 'available'}
                className="w-full bg-[#2D6A4F] text-white text-sm font-bold py-3 rounded-lg hover:bg-[#1B4332] transition-colors flex items-center justify-center gap-2 mb-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {vehicle.status === 'available' ? 'Proceed to Booking →' : `Not Available (${vehicle.status})`}
              </button>
              <p className="text-[10px] text-gray-400 text-center">You won't be charged yet. Free cancellation up to 24h before pickup.</p>
            </div>
          </div>
        </div>

        {/* Similar Vehicles */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Similar vehicles</h2>
            <div className="grid grid-cols-3 gap-5">
              {similar.map(v => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/browse/${v.id}`)}
                  className="border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="h-36 bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                    {v.image ? (
                      <img src={`${baseUrl}/storage/${v.image}`} alt={v.model} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🚗</span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{v.brand} {v.model}</div>
                        <div className="text-[10px] text-gray-400">{v.year} • {v.color}</div>
                      </div>
                      <div className="text-[#2D6A4F] text-xs font-bold">${v.daily_rate}/day</div>
                    </div>
                    <button className="mt-3 w-full border border-gray-200 text-gray-600 text-[11px] font-semibold py-2 rounded-md hover:bg-gray-50 transition-colors">
                      View Details
                    </button>
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
