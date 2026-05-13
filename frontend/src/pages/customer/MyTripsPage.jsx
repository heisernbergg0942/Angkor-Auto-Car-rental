import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Calendar, Loader2, AlertCircle, CreditCard, Clock } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { bookingAPI } from '../../services/api';

const statusConfig = {
  pending:   { cls: 'bg-amber-50 text-amber-600 border border-amber-200',    label: 'Pending' },
  confirmed: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200', label: 'Confirmed' },
  cancelled: { cls: 'bg-red-50 text-red-500 border border-red-200',          label: 'Cancelled' },
};

export default function MyTripsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.myBookings();
      setBookings(data.data || data);
    } catch (err) {
      setError('Failed to load your trips. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const daysBetween = (a, b) => Math.max(1, Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)));

  if (loading) return (
    <CustomerLayout>
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
      </div>
    </CustomerLayout>
  );

  return (
    <CustomerLayout>
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Trips</h1>
            <p className="text-sm text-gray-400 mt-1">{bookings.length} booking{bookings.length !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={() => navigate('/browse')}
            className="bg-[#2D6A4F] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1B4332] transition-colors flex items-center gap-2"
          >
            <Car className="w-4 h-4" /> Book New Trip
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-3">No trips yet</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Browse our premium fleet and book your first vehicle.</p>
            <button onClick={() => navigate('/browse')} className="bg-[#2D6A4F] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#1B4332] transition-colors inline-flex items-center gap-2">
              <Car className="w-4 h-4" /> Browse Fleet
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const vehicle = booking.vehicle;
              const days    = daysBetween(booking.pickup_date, booking.return_date);
              const total   = vehicle ? (parseFloat(vehicle.daily_rate) * days).toFixed(2) : '—';
              const cfg     = statusConfig[booking.status] || statusConfig.pending;

              return (
                <div key={booking.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    {/* Vehicle info */}
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-2xl">🚗</div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {vehicle ? `${vehicle.brand} ${vehicle.model}` : `Vehicle #${booking.vehicle_id}`}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{vehicle?.year} • {vehicle?.plate_number}</div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {formatDate(booking.pickup_date)}</span>
                          <span>→</span>
                          <span>{formatDate(booking.return_date)}</span>
                          <span className="text-gray-400">({days} day{days !== 1 ? 's' : ''})</span>
                        </div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                      <div className="mt-2 font-bold text-gray-900">${total}</div>
                      <div className="text-[10px] text-gray-400">${vehicle?.daily_rate}/day × {days} days</div>
                    </div>
                  </div>

                  {/* Invoice link if exists */}
                  {booking.rental?.invoice && (
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-gray-400"><CreditCard className="w-3.5 h-3.5" /> Invoice #{booking.rental.invoice.id}</span>
                      <span className="font-semibold text-gray-700">Total: ${booking.rental.invoice.total}</span>
                    </div>
                  )}

                  {/* Booking ID */}
                  <div className="mt-2 text-[10px] text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Booking #{booking.id} • Created {formatDate(booking.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}
