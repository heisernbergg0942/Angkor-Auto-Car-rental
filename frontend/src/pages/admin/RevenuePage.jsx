import { TrendingUp, DollarSign, ArrowUpRight } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AdminLayout from '../../components/layout/AdminLayout';
import { revenueData } from '../../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-lg text-xs">
        <div className="font-semibold text-slate-700 mb-2">{label}</div>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-600">{entry.name}: <strong>${entry.value.toLocaleString()}</strong></span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function RevenuePage() {
  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const avgRevenue = Math.round(totalRevenue / revenueData.length);
  const lastMonth = revenueData[revenueData.length - 1];
  const growth = (((lastMonth.revenue - revenueData[revenueData.length - 2].revenue) / revenueData[revenueData.length - 2].revenue) * 100).toFixed(1);

  return (
    <AdminLayout>
      <div className="p-6 animate-fadeIn">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Revenue</h1>
          <p className="text-slate-500 text-sm mt-0.5">Financial overview and monthly performance.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Month</div>
                <div className="text-3xl font-bold text-slate-800">${lastMonth.revenue.toLocaleString()}</div>
                <div className="inline-flex items-center gap-1 mt-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />+{growth}%
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">6-Month Total</div>
            <div className="text-3xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">Jan – {lastMonth.month} 2023</div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Monthly Average</div>
            <div className="text-3xl font-bold text-slate-800">${avgRevenue.toLocaleString()}</div>
            <div className="text-xs text-slate-500 mt-2">Based on 6 months</div>
          </div>
        </div>

        {/* Area Chart */}
        <div className="card p-5 mb-5">
          <div className="font-bold text-slate-800 mb-4">Revenue vs Target</div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2D6A4F" strokeWidth={2.5} fill="url(#colorRevenue)" dot={{ fill: '#2D6A4F', r: 4 }} />
              <Area type="monotone" dataKey="target" name="Target" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" fill="url(#colorTarget)" dot={{ fill: '#94a3b8', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Breakdown */}
        <div className="card p-5">
          <div className="font-bold text-slate-800 mb-4">Monthly Breakdown</div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-100">
                <tr>
                  <th className="table-header">Month</th>
                  <th className="table-header">Revenue</th>
                  <th className="table-header">Target</th>
                  <th className="table-header">Achievement</th>
                  <th className="table-header">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {revenueData.map((d, i) => {
                  const achievement = Math.round((d.revenue / d.target) * 100);
                  const prev = revenueData[i - 1];
                  const growth = prev ? (((d.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : null;
                  return (
                    <tr key={d.month} className="hover:bg-slate-50/50">
                      <td className="table-cell font-medium text-slate-700">{d.month} 2023</td>
                      <td className="table-cell font-bold text-slate-800">${d.revenue.toLocaleString()}</td>
                      <td className="table-cell text-slate-500">${d.target.toLocaleString()}</td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${achievement >= 100 ? 'bg-emerald-500' : achievement >= 80 ? 'bg-amber-500' : 'bg-red-400'}`}
                              style={{ width: `${Math.min(achievement, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-slate-600 w-10">{achievement}%</span>
                        </div>
                      </td>
                      <td className="table-cell">
                        {growth && (
                          <span className={`inline-flex items-center gap-1 text-xs font-medium ${Number(growth) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            <ArrowUpRight className={`w-3 h-3 ${Number(growth) < 0 ? 'rotate-180' : ''}`} />
                            {Number(growth) >= 0 ? '+' : ''}{growth}%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
