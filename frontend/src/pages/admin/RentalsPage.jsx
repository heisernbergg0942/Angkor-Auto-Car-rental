import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle,
  X,
  Car,
  Trash2,
} from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { bookingAPI, rentalAPI, invoiceAPI } from '../../services/api';

const BOOKING_STATUS = {
  pending: {
    cls: 'bg-amber-50 text-amber-600 border border-amber-200',
    icon: Clock,
  },
  confirmed: {
    cls: 'bg-emerald-50 text-emerald-600 border border-emerald-200',
    icon: CheckCircle,
  },
  cancelled: {
    cls: 'bg-red-50 text-red-500 border border-red-200',
    icon: AlertTriangle,
  },
};

export default function RentalsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Damage states
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [damageDesc, setDamageDesc] = useState('');
  const [damageCost, setDamageCost] = useState('');
  const [submittingDamage, setSubmittingDamage] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await bookingAPI.list({ per_page: 100 });
      setBookings(data.data || data);
    } catch {
      setError('Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDrawer = async (b) => {
    setSelected(b);
    setLoadingDetails(true);
    try {
      const { data } = await bookingAPI.get(b.id);
      setSelected(data);
    } catch {
      setError('Failed to fetch full details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const updateStatus = async (id, status, vehicleStatus) => {
    setUpdating(id);
    try {
      await bookingAPI.updateStatus(id, status, vehicleStatus);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status,
                vehicle: b.vehicle
                  ? {
                      ...b.vehicle,
                      status:
                        vehicleStatus ||
                        (status === 'confirmed' ? 'booked' : 'available'),
                    }
                  : null,
              }
            : b,
        ),
      );

      // Re-fetch full details to sync invoices/rentals
      const { data } = await bookingAPI.get(id);
      setSelected(data);
    } catch {
      setError('Status update failed.');
    } finally {
      setUpdating(null);
    }
  };

  const handleAddDamageInvoice = async (e) => {
    e.preventDefault();
    if (
      !damageDesc ||
      !damageCost ||
      isNaN(damageCost) ||
      Number(damageCost) <= 0
    ) {
      alert('Please fill in a valid description and cost.');
      return;
    }
    setSubmittingDamage(true);
    try {
      await invoiceAPI.create({
        rental_id: selected.rental.id,
        subtotal: parseFloat(damageCost),
        type: 'damage',
        description: damageDesc,
      });
      setDamageDesc('');
      setDamageCost('');

      // Refresh full details
      const { data } = await bookingAPI.get(selected.id);
      setSelected(data);
      alert(
        'Damage repair invoice created successfully, and the customer has been notified!',
      );
    } catch (err) {
      alert('Failed to submit damage invoice.');
    } finally {
      setSubmittingDamage(false);
    }
  };

  const handleDeleteDamageInvoice = async (invoiceId) => {
    if (!window.confirm('Are you sure you want to delete this damage invoice?'))
      return;
    try {
      await invoiceAPI.delete(invoiceId);
      alert('Damage invoice deleted successfully!');

      // Refresh details
      const { data } = await bookingAPI.get(selected.id);
      setSelected(data);
    } catch (err) {
      alert('Failed to delete invoice.');
    }
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';
  const daysBetween = (a, b) =>
    a && b ? Math.max(1, Math.ceil((new Date(b) - new Date(a)) / 86400000)) : 1;

  const filtered = bookings.filter((b) => {
    const matchSearch =
      !search ||
      b.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle?.brand?.toLowerCase().includes(search.toLowerCase()) ||
      b.vehicle?.model?.toLowerCase().includes(search.toLowerCase()) ||
      String(b.id).includes(search);
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <AdminLayout>
      <div className="p-6 animate-fadeIn">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              Bookings & Rentals
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Manage all customer bookings and rental workflow.
            </p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            {
              label: 'Total Bookings',
              value: counts.total,
              color: 'text-gray-800',
            },
            {
              label: 'Pending',
              value: counts.pending,
              color: 'text-amber-600',
            },
            {
              label: 'Confirmed',
              value: counts.confirmed,
              color: 'text-emerald-600',
            },
            {
              label: 'Cancelled',
              value: counts.cancelled,
              color: 'text-red-500',
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="bg-white border border-gray-100 rounded-xl p-4 text-center"
            >
              <div className={`text-2xl font-bold ${color}`}>
                {loading ? '…' : value}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bookings..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[#2D6A4F]"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'confirmed', 'cancelled'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium capitalize transition-colors ${filterStatus === s ? 'bg-[#2D6A4F] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'}`}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-[#2D6A4F]" />
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {[
                    '#',
                    'Customer',
                    'Vehicle',
                    'Pickup',
                    'Return',
                    'Days',
                    'Status',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((b) => {
                  const { cls, icon: Icon } =
                    BOOKING_STATUS[b.status] || BOOKING_STATUS.pending;
                  const days = daysBetween(b.pickup_date, b.return_date);
                  const total = b.vehicle
                    ? (parseFloat(b.vehicle.daily_rate) * days).toFixed(2)
                    : '—';
                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-3.5 text-xs font-mono font-semibold text-gray-500">
                        #{b.id}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-gray-800">
                          {b.customer?.name || '—'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {b.customer?.email}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs font-semibold text-gray-800">
                          {b.vehicle
                            ? `${b.vehicle.brand} ${b.vehicle.model}`
                            : '—'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {b.vehicle?.plate_number}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">
                        {formatDate(b.pickup_date)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-600">
                        {formatDate(b.return_date)}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-semibold text-gray-700">
                        {days}d · ${total}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize inline-flex items-center gap-1 ${cls}`}
                        >
                          <Icon className="w-2.5 h-2.5" />
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenDrawer(b)}
                            className="p-1.5 text-gray-400 hover:text-[#2D6A4F] rounded-md transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {b.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => {
                                  if (window.confirm('Approve this booking?'))
                                    updateStatus(b.id, 'confirmed');
                                }}
                                disabled={updating === b.id}
                                className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded hover:bg-emerald-600 transition-colors disabled:opacity-50"
                              >
                                {updating === b.id ? '…' : 'Approve'}
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Reject this booking?'))
                                    updateStatus(b.id, 'cancelled');
                                }}
                                disabled={updating === b.id}
                                className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 transition-colors disabled:opacity-50"
                              >
                                {updating === b.id ? '…' : 'Reject'}
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-gray-400">
                      <Car className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <div className="text-xs">No bookings found</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Booking Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl animate-slideLeft">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">
                Booking #{selected.id}
              </h2>
              <button onClick={() => setSelected(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-[#2D6A4F]" />
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${BOOKING_STATUS[selected.status]?.cls || ''}`}
                  >
                    {selected.status}
                  </span>
                  <div className="flex gap-2">
                    {selected.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            if (window.confirm('Approve this booking?'))
                              updateStatus(selected.id, 'confirmed');
                          }}
                          className="text-xs bg-emerald-500 text-white px-3 py-1 rounded-lg hover:bg-emerald-600 transition-all font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Reject this booking?'))
                              updateStatus(selected.id, 'cancelled');
                          }}
                          className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-all font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3">
                  {/* Vehicle Status Control */}
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4">
                    <div className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-2">
                      Update Vehicle Status
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">
                        Current Status:
                      </span>
                      <span className="text-xs font-bold capitalize px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                        {selected.vehicle?.status || '—'}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {['available', 'booked', 'rented', 'maintenance'].map(
                        (vStatus) => (
                          <button
                            key={vStatus}
                            onClick={() =>
                              updateStatus(
                                selected.id,
                                selected.status,
                                vStatus,
                              )
                            }
                            disabled={updating === selected.id}
                            className={`px-2 py-1.5 rounded text-[11px] font-semibold capitalize border transition-all text-center ${
                              selected.vehicle?.status === vStatus
                                ? 'bg-[#2D6A4F] text-white border-[#2D6A4F] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {vStatus}
                          </button>
                        ),
                      )}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">
                      Customer
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {selected.customer?.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {selected.customer?.email}
                    </div>
                  </div>

                  {/* Vehicle Info */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">
                      Vehicle
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {selected.vehicle?.brand} {selected.vehicle?.model}
                    </div>
                    <div className="text-xs text-gray-400">
                      {selected.vehicle?.plate_number} · $
                      {selected.vehicle?.daily_rate}/day
                    </div>
                  </div>

                  {/* Invoices and Charges List (Calculated dynamically) */}
                  {selected.rental && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-[10px] font-semibold text-gray-400 uppercase mb-2">
                        Invoices & Charges
                      </div>
                      <div className="space-y-2">
                        {/* Standard Rental Invoice */}
                        {selected.rental.invoice && (
                          <div className="flex items-center justify-between text-xs border-b border-gray-100 pb-2">
                            <div>
                              <span className="font-semibold text-gray-700">
                                Rental Charge
                              </span>
                              <div className="text-[9px] text-gray-400">
                                Invoice #{selected.rental.invoice.id}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-gray-800">
                                $
                                {parseFloat(
                                  selected.rental.invoice.total,
                                ).toFixed(2)}
                              </span>
                              <div className="text-[9px] text-emerald-600 font-semibold uppercase">
                                Paid
                              </div>
                            </div>
                          </div>
                        )}
                        {/* Additional Invoices (including damage) */}
                        {(selected.rental.invoices || [])
                          .filter((inv) => inv.type === 'damage')
                          .map((inv) => (
                            <div
                              key={inv.id}
                              className="flex items-start justify-between text-xs border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                            >
                              <div>
                                <span className="font-semibold text-red-600">
                                  🚨 Repair Charge
                                </span>
                                <p className="text-[10px] text-gray-600 leading-tight mt-0.5">
                                  {inv.description}
                                </p>
                                <div className="text-[9px] text-gray-400">
                                  Invoice #{inv.id}
                                </div>
                              </div>
                              <div className="text-right shrink-0 flex items-center gap-2">
                                <div>
                                  <span className="font-bold text-gray-800">
                                    ${parseFloat(inv.total).toFixed(2)}
                                  </span>
                                  <div className="text-[9px] text-amber-600 font-semibold uppercase">
                                    Unpaid
                                  </div>
                                </div>
                                <button
                                  onClick={() =>
                                    handleDeleteDamageInvoice(inv.id)
                                  }
                                  className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                                  title="Delete Invoice"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Damage Invoicing Form */}
                  {selected.rental && (
                    <div className="bg-red-50/50 border border-red-100 rounded-lg p-4">
                      <div className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-2">
                        Record Vehicle Damage
                      </div>
                      <form
                        onSubmit={handleAddDamageInvoice}
                        className="space-y-3"
                      >
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">
                            Damage Description
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Scratched front bumper"
                            value={damageDesc}
                            onChange={(e) => setDamageDesc(e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-red-500 bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">
                            Repair Cost ($)
                          </label>
                          <input
                            type="number"
                            placeholder="e.g. 150.00"
                            value={damageCost}
                            onChange={(e) => setDamageCost(e.target.value)}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:border-red-500 bg-white"
                            required
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submittingDamage}
                          className="w-full bg-red-600 text-white text-[11px] font-bold py-2 rounded hover:bg-red-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {submittingDamage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            'Issue Repair Invoice & Notify'
                          )}
                        </button>
                      </form>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">
                      Dates
                    </div>
                    <div className="text-sm font-semibold text-gray-800">
                      {formatDate(selected.pickup_date)} →{' '}
                      {formatDate(selected.return_date)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {daysBetween(selected.pickup_date, selected.return_date)}{' '}
                      days
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
