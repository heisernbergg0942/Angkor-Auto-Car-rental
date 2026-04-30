import { useState } from 'react';
import {
  Car, Key, DollarSign, Wrench, Clock,
  AlertTriangle, UserPlus, CheckCircle, Calendar, User,
  RotateCcw, Search, Wrench as WrenchIcon, CreditCard
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AdminLayout from '../../components/layout/AdminLayout';
import { rentalTrends, recentActivity, actionRequired } from '../../data/mockData';

const activityIcons = {
  return: CheckCircle,
  reservation: Calendar,
  customer: UserPlus,
  alert: AlertTriangle,
  payment: CreditCard,
};

const activityIconColors = {
  emerald: 'text-[#2D6A4F] bg-[#edf7f2]',
  blue: 'text-blue-500 bg-blue-50',
  slate: 'text-gray-500 bg-gray-100',
  amber: 'text-amber-500 bg-amber-50',
};

const severityConfig = {
  High: { dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-100', label: 'High' },
  Medium: { dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-100', label: 'Medium' },
  Normal: { dot: 'bg-gray-400', text: 'text-gray-600', bg: 'bg-gray-100', label: 'Normal' },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-lg p-3 shadow-lg text-xs">
        <div className="font-semibold text-gray-700 mb-1.5">{label}</div>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-gray-600">{entry.name}: <b>{entry.value}</b></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [chartRange, setChartRange] = useState('Last 30 Days');

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Alert Banner */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">
              <span className="font-semibold">Maintenance Overdue:</span> Vehicle FS-782 (Tesla Model 3) has exceeded its scheduled service interval by 450 miles.
            </p>
          </div>
          <button className="shrink-0 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-md transition-colors whitespace-nowrap">
            Schedule Now
          </button>
        </div>

        {/* Page Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-xs text-gray-400 mt-0.5">Live metrics and daily operational snapshot.</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Sync Active
            </span>
            <span>|</span>
            <span>Last updated: Just now</span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {/* Total Vehicles */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Total Vehicles</span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Car className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">142</div>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑+4%
              </span>
            </div>
          </div>

          {/* Active Rentals */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Active Rentals</span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Key className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">125</div>
            <div className="mt-2">
              <span className="text-[10px] text-emerald-600 font-semibold">88% Capacity</span>
              <div className="mt-1.5 w-full h-1 bg-gray-100 rounded-full">
                <div className="h-full bg-[#2D6A4F] rounded-full" style={{ width: '88%' }} />
              </div>
            </div>
          </div>

          {/* In Maintenance */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">In Maintenance</span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">8</div>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                3 Critical
              </span>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Monthly Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-gray-500" />
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-800">$84,250</div>
            <div className="mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑+12.5%
              </span>
            </div>
          </div>
        </div>

        {/* Chart + Activity Row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Chart */}
          <div className="col-span-2 bg-white border border-gray-100 rounded-xl p-4">
            <div className="flex items-start justify-between mb-1">
              <div>
                <div className="font-semibold text-gray-800 text-sm">Rental Trends</div>
                <div className="text-[11px] text-gray-400">Booking source comparison (last 30 days)</div>
              </div>
              <select
                value={chartRange}
                onChange={e => setChartRange(e.target.value)}
                className="text-[11px] text-gray-600 border border-gray-200 rounded-md px-2 py-1 cursor-pointer focus:outline-none"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={rentalTrends} barSize={18} barGap={3} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                <Bar dataKey="online" name="Online" fill="#2D6A4F" radius={[3, 3, 0, 0]} />
                <Bar dataKey="walkIn" name="Walk-in" fill="#b7d4c3" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-100 rounded-xl p-4">
            <div className="font-semibold text-gray-800 text-sm mb-3">Recent Activity</div>
            <div className="space-y-3 overflow-y-auto" style={{ maxHeight: '290px' }}>
              {recentActivity.map(item => {
                const Icon = activityIcons[item.type] || User;
                const colorCls = activityIconColors[item.color] || activityIconColors.slate;
                return (
                  <div key={item.id} className="flex gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${colorCls}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[11px] font-semibold text-gray-700">{item.title}</span>
                        <span className="text-[10px] text-gray-400 shrink-0">{item.time}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Fleet Availability */}
        <div className="bg-white border border-gray-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold text-gray-800 text-sm">Fleet Availability</div>
            <button className="text-[11px] font-semibold text-[#2D6A4F] hover:underline">View All Vehicles</button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Vehicle ID</th>
                <th className="pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Model &amp; Type</th>
                <th className="pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Last Maintenance</th>
                <th className="pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Availability</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'FS-209', model: 'Tesla Model Y', type: 'SUV • White', status: 'Available', maint: 'Oct 12, 2023', avail: 100 },
                { id: 'FS-881', model: 'BMW X5', type: 'Luxury SUV • Black', status: 'Rented', maint: 'Nov 05, 2023', avail: 10 },
                { id: 'FS-782', model: 'Tesla Model 3', type: 'Sedan • Blue', status: 'Maintenance', maint: 'Overdue', avail: 0 },
              ].map(v => {
                const statusClrs = {
                  Available: 'text-emerald-600 bg-emerald-50 border border-emerald-200',
                  Rented: 'text-blue-500 bg-blue-50 border border-blue-200',
                  Maintenance: 'text-amber-600 bg-amber-50 border border-amber-200',
                };
                return (
                  <tr key={v.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 text-xs font-mono font-semibold text-gray-600">{v.id}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center shrink-0">
                          <Car className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-800">{v.model}</div>
                          <div className="text-[10px] text-gray-400">{v.type}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusClrs[v.status]}`}>{v.status}</span>
                    </td>
                    <td className={`py-3 text-xs ${v.maint === 'Overdue' ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>{v.maint}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${v.avail > 50 ? 'bg-[#2D6A4F]' : v.avail > 0 ? 'bg-amber-400' : 'bg-red-200'}`}
                            style={{ width: `${v.avail}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
