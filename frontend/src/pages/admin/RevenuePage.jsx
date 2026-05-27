import { useState, useEffect } from 'react';
import { 
  TrendingUp, DollarSign, ArrowUpRight, Check, X, Edit2, Loader2, Calendar, AlertCircle, RefreshCcw 
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import AdminLayout from '../../components/layout/AdminLayout';
import { revenueAPI } from '../../services/api';

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
  const [year, setYear] = useState(new Date().getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingTarget, setSavingTarget] = useState(false);
  const [error, setError] = useState('');
  
  // Inline edit state
  const [editingMonth, setEditingMonth] = useState(null);
  const [editTargetValue, setEditTargetValue] = useState('');

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // refresh every 60 seconds
    return () => clearInterval(interval);
  }, [year]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await revenueAPI.stats({ year });
      setData(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load revenue data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTarget = async (monthNum) => {
    if (!editTargetValue || isNaN(editTargetValue) || Number(editTargetValue) < 0) {
      alert('Please enter a valid target amount.');
      return;
    }
    setSavingTarget(true);
    try {
      await revenueAPI.updateTarget({
        year,
        month: monthNum,
        target_amount: parseFloat(editTargetValue)
      });
      setEditingMonth(null);
      // Re-fetch statistics to sync both the chart and table
      const res = await revenueAPI.stats({ year });
      setData(res.data);
    } catch (err) {
      alert('Failed to update revenue target.');
    } finally {
      setSavingTarget(false);
    }
  };

  if (loading && !data) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[500px]">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
        </div>
      </AdminLayout>
    );
  }

  const s = data?.summary || {};
  const revenueList = data?.revenue_data || [];

  return (
    <AdminLayout>
      <div className="p-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Revenue</h1>
            <p className="text-slate-500 text-sm mt-0.5">Financial overview and monthly performance.</p>
          </div>
          
          {/* Year Filter */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={year}
              onChange={e => setYear(Number(e.target.value))}
              className="text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 cursor-pointer bg-white focus:outline-none focus:ring-1 focus:ring-[#2D6A4F] transition-all"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y} Fiscal Year</option>
              ))}
            </select>
            {/* Refresh button */}
            <button
              onClick={fetchStats}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-[#2D6A4F] text-white rounded hover:bg-[#1B4332] transition-colors"
              title="Refresh revenue data"
            >
              <RefreshCcw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={fetchStats} className="ml-auto underline text-xs font-semibold">Try Again</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  Current Month ({s.current_month || '—'})
                </div>
                <div className="text-3xl font-bold text-slate-800">
                  ${(s.current_revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="inline-flex items-center gap-1 mt-2 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                  <TrendingUp className="w-3 h-3" />
                  {s.growth >= 0 ? '+' : ''}{s.growth}% MoM
                </div>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Annual Total ({year})
            </div>
            <div className="text-3xl font-bold text-slate-800">
              ${(s.total_revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-2.5">
              Accumulated earnings for the fiscal year
            </div>
          </div>
          
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Monthly Average
            </div>
            <div className="text-3xl font-bold text-slate-800">
              ${(s.avg_revenue ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-2.5">
              Consistent monthly standard performance
            </div>
          </div>
        </div>

        {/* Area Chart */}
        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm mb-5">
          <div className="font-bold text-slate-800 mb-4">Revenue vs Target ({year})</div>
          {loading ? (
            <div className="flex items-center justify-center h-72">
              <Loader2 className="w-6 h-6 animate-spin text-[#2D6A4F]" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueList}>
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
          )}
        </div>

        {/* Grid for Monthly Breakdown & Recent Payments */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Breakdown Table */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
            <div className="font-bold text-slate-800 mb-4">Monthly Breakdown</div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Month</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Revenue</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Achievement</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {revenueList.map((d, i) => {
                    const achievement = d.target > 0 ? Math.round((d.revenue / d.target) * 100) : 0;
                    const prev = revenueList[i - 1];
                    const growth = prev && prev.revenue > 0 ? (((d.revenue - prev.revenue) / prev.revenue) * 100).toFixed(1) : null;
                    
                    return (
                      <tr key={d.month} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3.5 text-xs font-semibold text-slate-700">{d.month} {year}</td>
                        <td className="px-4 py-3.5 text-xs font-bold text-slate-800">${d.revenue.toLocaleString()}</td>
                        
                        {/* Target Cell (with Inline Editor) */}
                        <td className="px-4 py-3.5 text-xs text-slate-600">
                          {editingMonth === d.month_num ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-400">$</span>
                              <input
                                type="number"
                                disabled={savingTarget}
                                value={editTargetValue}
                                onChange={e => setEditTargetValue(e.target.value)}
                                className="w-24 px-2 py-1 border border-slate-200 rounded-md text-xs focus:outline-none focus:border-[#2D6A4F]"
                                autoFocus
                              />
                              <button 
                                onClick={() => handleSaveTarget(d.month_num)} 
                                disabled={savingTarget}
                                className="p-1 bg-[#2D6A4F] text-white rounded hover:bg-[#1B4332] disabled:opacity-50"
                              >
                                {savingTarget ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              </button>
                              <button 
                                onClick={() => setEditingMonth(null)} 
                                disabled={savingTarget}
                                className="p-1 bg-slate-100 text-slate-500 rounded hover:bg-slate-200"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group max-w-[120px]">
                              <span className="font-medium">${d.target.toLocaleString()}</span>
                              <button
                                onClick={() => { setEditingMonth(d.month_num); setEditTargetValue(d.target); }}
                                className="p-1 text-slate-400 hover:text-[#2D6A4F] opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                                title="Edit target goal"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>
                        
                        <td className="px-4 py-3.5 text-xs">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-[100px]">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  achievement >= 100 ? 'bg-emerald-500' : achievement >= 80 ? 'bg-amber-500' : 'bg-red-400'
                                }`}
                                style={{ width: `${Math.min(achievement, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 w-10">{achievement}%</span>
                          </div>
                        </td>
                        
                        <td className="px-4 py-3.5 text-xs">
                          {growth && (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${Number(growth) >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
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

          {/* Real-time Recent Payments Log */}
          <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm flex flex-col">
            <div className="font-bold text-slate-800 mb-1">Recent Payments Log</div>
            <p className="text-[10px] text-slate-400 mb-4">Settled invoices and transaction history.</p>
            
            <div className="space-y-4 overflow-y-auto max-h-[380px] pr-1 flex-1">
              {(data?.recent_payments || []).map((pay) => (
                <div key={pay.id} className="flex items-start justify-between text-xs border-b border-slate-50 pb-3 last:border-0 last:pb-0 hover:bg-slate-50/20 transition-colors">
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-700 leading-snug">{pay.description}</div>
                    <div className="text-[10px] text-slate-400">
                      Booking #{pay.booking_id} · {pay.customer_name}
                    </div>
                    <div className="text-[9px] font-mono text-[#2D6A4F] bg-emerald-50 px-1.5 py-0.5 rounded inline-block uppercase tracking-wider font-bold">
                      {pay.payment_method}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-emerald-600 text-sm font-mono">+${pay.amount.toFixed(2)}</span>
                    <div className="text-[9px] text-slate-400 mt-1 font-medium">
                      {new Date(pay.payment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {new Date(pay.payment_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              {(data?.recent_payments || []).length === 0 && (
                <div className="text-center py-16 text-slate-400 text-xs">
                  No settled payments found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
