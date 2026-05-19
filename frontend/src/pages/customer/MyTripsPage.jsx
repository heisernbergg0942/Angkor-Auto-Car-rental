import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Calendar, Loader2, AlertCircle, CreditCard, Clock, ShieldAlert, X } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { bookingAPI, paymentAPI } from '../../services/api';

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

  // Payment states
  const [payingInvoice, setPayingInvoice] = useState(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [submittingPayment, setSubmittingPayment] = useState(false);

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

  const handlePayInvoice = async (e) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvv) {
      alert('Please fill in card details.');
      return;
    }
    setSubmittingPayment(true);
    try {
      await paymentAPI.store({
        invoice_id: payingInvoice.id,
        amount: parseFloat(payingInvoice.total),
        payment_method: 'card'
      });
      alert(`Payment of $${parseFloat(payingInvoice.total).toFixed(2)} processed successfully!`);
      setPayingInvoice(null);
      setCardNumber('');
      setCardExpiry('');
      setCardCvv('');
      
      // Refresh list
      fetchMyBookings();
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const daysBetween = (a, b) => Math.max(1, Math.ceil((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24)));

  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';

  if (loading) return (
    <CustomerLayout>
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
      </div>
    </CustomerLayout>
  );

  return (
    <CustomerLayout>
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-10 font-sans animate-fadeIn">
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
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                        {vehicle && vehicle.image ? (
                          <img src={`${baseUrl}/storage/${vehicle.image}`} alt={`${vehicle.brand} ${vehicle.model}`} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl">🚗</span>
                        )}
                      </div>
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

                  {/* Invoices List */}
                  {booking.rental && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Invoice Summary</div>
                      
                      {/* Main Rental Invoice */}
                      {booking.rental.invoice && (
                        <div className="flex items-center justify-between text-xs bg-slate-50 rounded-lg p-3">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-emerald-50 rounded text-emerald-600">
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-700">Rental Bill</div>
                              <div className="text-[9px] text-gray-400">Invoice #{booking.rental.invoice.id}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-gray-800">${parseFloat(booking.rental.invoice.total).toFixed(2)}</div>
                            <div className="text-[9px] text-emerald-600 font-semibold uppercase">Paid</div>
                          </div>
                        </div>
                      )}

                      {/* Additional Damage Invoices */}
                      {(booking.rental.invoices || [])
                        .filter(inv => inv.type === 'damage')
                        .map(inv => {
                          const isPaid = inv.payments?.some(p => p.status === 'paid');
                          return (
                            <div key={inv.id} className={`flex items-center justify-between text-xs rounded-lg p-3 border transition-colors ${
                              isPaid ? 'bg-slate-50 border-gray-100' : 'bg-rose-50/40 border-rose-100'
                            }`}>
                              <div className="flex items-start gap-2">
                                <div className={`p-1.5 rounded shrink-0 ${isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                  <ShieldAlert className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-bold text-gray-800">🚨 Damage / Repair Fee</div>
                                  <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{inv.description}</p>
                                  <div className="text-[9px] text-gray-400">Invoice #{inv.id}</div>
                                </div>
                              </div>
                              <div className="text-right flex items-center gap-3 shrink-0">
                                <div>
                                  <div className="font-bold text-gray-800">${parseFloat(inv.total).toFixed(2)}</div>
                                  {isPaid ? (
                                    <div className="text-[9px] text-emerald-600 font-semibold uppercase">Paid</div>
                                  ) : (
                                    <div className="text-[9px] text-rose-600 font-semibold uppercase">Unpaid</div>
                                  )}
                                </div>
                                {!isPaid && (
                                  <button
                                    onClick={() => setPayingInvoice(inv)}
                                    className="bg-red-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors shadow-sm shrink-0"
                                  >
                                    Pay Now
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}

                  {/* Booking ID */}
                  <div className="mt-4 pt-2 border-t border-gray-50 text-[10px] text-gray-300 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Booking #{booking.id} • Created {formatDate(booking.created_at)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mock Credit Card Payment Modal */}
      {payingInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-zoomIn relative">
            <button
              onClick={() => setPayingInvoice(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Damage Repair Payment</h3>
                <p className="text-xs text-gray-400">Invoice #{payingInvoice.id}</p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 mb-6">
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wider mb-1">TOTAL CHARGED</div>
              <div className="text-2xl font-bold text-gray-900">${parseFloat(payingInvoice.total).toFixed(2)}</div>
              <p className="text-[11px] text-gray-500 mt-2">{payingInvoice.description}</p>
            </div>

            <form onSubmit={handlePayInvoice} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Card Number</label>
                <input
                  type="text"
                  placeholder="4000 1234 5678 9010"
                  maxLength={19}
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F]"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Expiry Date</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F] text-center"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">CVV</label>
                  <input
                    type="text"
                    placeholder="123"
                    maxLength={3}
                    value={cardCvv}
                    onChange={e => setCardCvv(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F] text-center"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPayment}
                className="w-full bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-2 disabled:opacity-50"
              >
                {submittingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : `Pay $${parseFloat(payingInvoice.total).toFixed(2)} Now`}
              </button>
            </form>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}
