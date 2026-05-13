import { useState, useEffect } from 'react';
import {
  Car, Key, DollarSign, Wrench, Users,
  AlertTriangle, UserPlus, CheckCircle, Calendar,
  CreditCard, Loader2, Clock
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AdminLayout from '../../components/layout/AdminLayout';
import { dashboardAPI } from '../../services/api';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-lg text-xs">
        <div className="font-semibold text-gray-700 mb-1.5">{label}</div>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-600">{entry.name}: <b>${entry.value?.toLocaleString()}</b></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const StatCard = ({ label, value, icon: Icon, sub, subColor = 'text-emerald-600', loading }) => (
  <div className="bg-white border border-gray-100 rounded-xl p-4">
    <div className="flex items-start justify-between mb-3">
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
        <Icon className="w-4 h-4 text-gray-500" />
      </div>
    </div>
    {loading ? (
      <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
    ) : (
      <div className="text-3xl font-bold text-gray-800">{value}</div>
    )}
    {sub && <div className={`mt-2 text-[10px] font-semibold ${subColor}`}>{sub}</div>}
  </div>
);

export default function DashboardPage() {
  const [stats,    setStats]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [chartRange, setChartRange] = useState('Last 30 Days');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data } = await dashboardAPI.stats();
      setStats(data);
    } catch (err) {
      console.error('Dashboard stats failed', err);
    } finally {
      setLoading(false);
    }
  };

  const s = stats?.summary || {};
  const recentBookings = stats?.recent_bookings || [];
  const monthlyRevenue = (stats?.monthly_revenue || []).map(m => ({
    month: MONTH_NAMES[(m.month || 1) - 1],
    revenue: parseFloat(m.total || 0),
  }));

  const vehiclesByStatus = stats?.vehicles_status || [];

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Pending bookings alert */}
        {!loading && s.pending_bookings > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-700">
                <span className="font-semibold">{s.pending_bookings} Pending Booking{s.pending_bookings > 1 ? 's' : ''}:</span>{' '}
                Awaiting your review and confirmation.
              </p>
            </div>
            <a href="/admin/rentals" className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-md transition-colors whitespace-nowrap">
              Review Now
            </a>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-xs text-gray-400 mt-0.5">Live metrics and daily operational snapshot.</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Data
            </span>
            <span>|</span>
            <button onClick={fetchStats} className="hover:text-gray-600 transition-colors">↻ Refresh</button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <StatCard label="Total Vehicles"   value={s.total_vehicles   ?? '—'} icon={Car}      sub={`${s.avail_vehicles ?? 0} available`}    loading={loading} />
          <StatCard label="Active Rentals"   value={s.active_rentals   ?? '—'} icon={Key}      sub={s.total_vehicles ? `${Math.round((s.active_rentals/s.total_vehicles)*100)}% Utilization` : ''}  loading={loading} />
          <StatCard label="Total Customers"  value={s.total_customers  ?? '—'} icon={Users}    sub={`${s.total_bookings ?? 0} total bookings`}  loading={loading} />
          <StatCard label="Monthly Revenue"  value={`$${parseFloat(s.month_revenue ?? 0).toLocaleString()}`} icon={DollarSign} sub={`$${parseFloat(s.total_revenue ?? 0).toLocaleString()} all-time`} loading={loading} />
        </div>

        {/* Chart + Recent Bookings */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Revenue Chart */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="font-semibold text-gray-800 text-sm">Monthly Revenue</div>
                <div className="text-[11px] text-gray-400">Revenue trend for {new Date().getFullYear()}</div>
              </div>
              <select
                value={chartRange}
                onChange={e => setChartRange(e.target.value)}
                className="text-[11px] text-gray-600 border border-gray-200 rounded-md px-2 py-1 cursor-pointer focus:outline-none"
              >
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
              </select>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-52">
                <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
              </div>
            ) : monthlyRevenue.length === 0 ? (
              <div className="flex items-center justify-center h-52 text-gray-300 text-sm">No revenue data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={monthlyRevenue} barSize={20} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                  <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#2D6A4F" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Recent Bookings */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="font-semibold text-gray-800 text-sm mb-3">Recent Bookings</div>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-50 rounded-lg animate-pulse" />)}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-300 text-sm">No bookings yet</div>
            ) : (
              <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '280px' }}>
                {recentBookings.map(b => {
                  const statusClr = { pending: 'text-amber-600 bg-amber-50', confirmed: 'text-emerald-600 bg-emerald-50', cancelled: 'text-red-500 bg-red-50' };
                  return (
                    <div key={b.id} className="flex gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="text-[11px] font-semibold text-gray-700 truncate">
                            {b.customer?.name || 'Customer'} — {b.vehicle?.brand} {b.vehicle?.model}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${statusClr[b.status] || statusClr.pending}`}>{b.status}</span>
                          <span className="text-[10px] text-gray-400">{b.pickup_date} → {b.return_date}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Status Summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-gray-800 text-sm">Fleet Status</div>
            <a href="/admin/fleet" className="text-[11px] font-semibold text-[#2D6A4F] hover:underline">View All Vehicles</a>
          </div>
          {loading ? (
            <div className="h-16 bg-gray-50 rounded-lg animate-pulse" />
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {['available','booked','rented','maintenance'].map(status => {
                const entry = vehiclesByStatus.find(v => v.status === status);
                const count = entry?.count ?? 0;
                const colors = {
                  available:   'bg-emerald-50 text-emerald-600 border-emerald-200',
                  booked:      'bg-blue-50 text-blue-600 border-blue-200',
                  rented:      'bg-purple-50 text-purple-600 border-purple-200',
                  maintenance: 'bg-amber-50 text-amber-600 border-amber-200',
                };
                return (
                  <div key={status} className={`border rounded-xl p-3 text-center ${colors[status]}`}>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-[10px] font-semibold capitalize mt-0.5">{status}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
