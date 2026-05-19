import { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, Clock, AlertTriangle, Loader2, AlertCircle, X, Car } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { bookingAPI, rentalAPI } from '../../services/api';

const BOOKING_STATUS = {
  pending:   { cls: 'bg-amber-50 text-amber-600 border border-amber-200',    icon: Clock },
  confirmed: { cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200', icon: CheckCircle },
  cancelled: { cls: 'bg-red-50 text-red-500 border border-red-200',          icon: AlertTriangle },
};

export default function RentalsPage() {
  const [bookings,     setBookings]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected,     setSelected]     = useState(null);
  const [updating,     setUpdating]     = useState(null);

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.list({ per_page: 100 });
      setBookings(data.data || data);
    } catch { setError('Failed to load bookings.'); }
    finally   { setLoading(false); }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search ||
      b.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle?.model?.toLowerCase().includes(search.toLowerCase()) ||
      String(b.id).includes(search);
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id, status, vehicleStatus) => {
    setUpdating(id);
    try {
      await bookingAPI.updateStatus(id, status, vehicleStatus);
      setBookings(prev => prev.map(b => b.id === id ? {
        ...b,
        status,
        vehicle: b.vehicle ? { ...b.vehicle, status: vehicleStatus || (status === 'confirmed' ? 'booked' : 'available') } : null
      } : b));
      if (selected?.id === id) setSelected(prev => ({
        ...prev,
        status,
        vehicle: prev.vehicle ? { ...prev.vehicle, status: vehicleStatus || (status === 'confirmed' ? 'booked' : 'available') } : null
      }));
    } catch { setError('Status update failed.'); }
    finally   { setUpdating(null); }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const daysBetween = (a, b) => a && b ? Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000)) : 1;

  const counts = {
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Bookings & Rentals</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage all customer bookings and rental workflow.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Bookings', value: counts.total,     color: 'text-gray-800' },
            { label: 'Pending',        value: counts.pending,   color: 'text-amber-600' },
            { label: 'Confirmed',      value: counts.confirmed, color: 'text-emerald-600' },
            { label: 'Cancelled',      value: counts.cancelled, color: 'text-red-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{loading ? '…' : value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[#2D6A4F]" />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'confirmed', 'cancelled'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-md text-[11px] font-medium capitalize transition-colors ${filterStatus === s ? 'bg-[#2D6A4F] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#2D6A4F]" /></div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['#','Customer','Vehicle','Pickup','Return','Days','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(b => {
                  const { cls, icon: Icon } = BOOKING_STATUS[b.status] || BOOKING_STATUS.pending;
                  const days = daysBetween(b.pickup_date, b.return_date);
                  const total = b.vehicle ? (parseFloat(b.vehicle.daily_rate) * days).toFixed(2) : '—';
                  return (
                    <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-3.5 text-xs font-mono font-semibold text-gray-500">#{b.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-gray-800">{b.customer?.name || '—'}</div>
                        <div className="text-[10px] text-gray-400">{b.customer?.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-gray-800">{b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : '—'}</div>
                        <div className="text-[10px] text-gray-400">{b.vehicle?.plate_number}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">{formatDate(b.pickup_date)}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">{formatDate(b.return_date)}</td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-gray-700">{days}d · ${total}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize inline-flex items-center gap-1 ${cls}`}>
                          <Icon className="w-2.5 h-2.5" />{b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => setSelected(b)} className="p-1.5 text-gray-400 hover:text-[#2D6A4F] rounded-md transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {b.status === 'pending' && (
                            <button onClick={() => updateStatus(b.id, 'confirmed')} disabled={updating === b.id}
                              className="ml-1 text-[10px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors disabled:opacity-50">
                              {updating === b.id ? '…' : 'Confirm'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                    <Car className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <div className="text-xs">No bookings found</div>
                  </td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Booking Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Booking #{selected.id}</h2>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${BOOKING_STATUS[selected.status]?.cls || ''}`}>{selected.status}</span>
                <div className="flex gap-2">
                  {selected.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(selected.id, 'confirmed')} className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-lg hover:bg-emerald-600">Confirm</button>
                      <button onClick={() => updateStatus(selected.id, 'cancelled')} className="text-xs bg-red-50 text-red-500 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-100">Cancel</button>
                    </>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3">
                {/* Vehicle Status Control */}
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">Update Vehicle Status</div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">Current Status:</span>
                    <span className="text-xs font-bold capitalize px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">{selected.vehicle?.status || '—'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['available', 'booked', 'rented', 'maintenance'].map((vStatus) => (
                      <button
                        key={vStatus}
                        onClick={() => updateStatus(selected.id, selected.status, vStatus)}
                        disabled={updating === selected.id}
                        className={`px-2 py-1.5 rounded text-[11px] font-semibold capitalize border transition-all text-center ${
                          selected.vehicle?.status === vStatus
                            ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {vStatus}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Customer</div>
                  <div className="text-sm font-semibold text-gray-800">{selected.customer?.name}</div>
                  <div className="text-xs text-gray-400">{selected.customer?.email}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Vehicle</div>
                  <div className="text-sm font-semibold text-gray-800">{selected.vehicle?.brand} {selected.vehicle?.model}</div>
                  <div className="text-xs text-gray-400">{selected.vehicle?.plate_number} · ${selected.vehicle?.daily_rate}/day</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Dates</div>
                  <div className="text-sm font-semibold text-gray-800">{formatDate(selected.pickup_date)} → {formatDate(selected.return_date)}</div>
                  <div className="text-xs text-gray-400">{daysBetween(selected.pickup_date, selected.return_date)} days</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
