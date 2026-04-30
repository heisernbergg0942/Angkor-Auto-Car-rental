import { useState } from 'react';
import { Search, Plus, Eye, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { activeRentals } from '../../data/mockData';

const statusConfig = {
  Active: { cls: 'badge-available', icon: CheckCircle },
  'Extension Requested': { cls: 'badge-rented', icon: Clock },
  Overdue: { cls: 'badge-high', icon: AlertTriangle },
  Completed: { cls: 'badge-normal', icon: CheckCircle },
};

export default function RentalsPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const filtered = activeRentals.filter(r => {
    const matchSearch = r.customer.toLowerCase().includes(search.toLowerCase()) ||
      r.vehicle.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="p-6 animate-fadeIn">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Rental Logic</h1>
            <p className="text-slate-500 text-sm mt-0.5">Track and manage all active and historical rentals.</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New Rental
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Rentals', value: activeRentals.length },
            { label: 'Active', value: activeRentals.filter(r => r.status === 'Active').length, color: 'text-emerald-600' },
            { label: 'Overdue', value: activeRentals.filter(r => r.status === 'Overdue').length, color: 'text-red-600' },
            { label: 'Extensions', value: activeRentals.filter(r => r.status === 'Extension Requested').length, color: 'text-blue-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4 text-center">
              <div className={`text-2xl font-bold ${color || 'text-slate-800'}`}>{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rentals..." className="input-field pl-9" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Active', 'Extension Requested', 'Overdue', 'Completed'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterStatus === s ? 'bg-forest text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-header">Rental ID</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Vehicle</th>
                  <th className="table-header">Dates</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(r => {
                  const { cls, icon: Icon } = statusConfig[r.status] || { cls: 'badge-normal', icon: CheckCircle };
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="table-cell font-mono text-xs font-semibold text-slate-600">{r.id}</td>
                      <td className="table-cell font-medium text-slate-800 text-sm">{r.customer}</td>
                      <td className="table-cell">
                        <div className="text-sm text-slate-700">{r.vehicle}</div>
                        <div className="text-xs text-slate-400">{r.plate}</div>
                      </td>
                      <td className="table-cell text-xs text-slate-600">
                        <div>{r.start}</div>
                        <div className="text-slate-400">→ {r.end}</div>
                      </td>
                      <td className="table-cell font-semibold text-slate-800">{r.amount}</td>
                      <td className="table-cell">
                        <span className={`${cls} inline-flex items-center gap-1`}>
                          <Icon className="w-3 h-3" />
                          {r.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button className="p-1.5 text-slate-400 hover:text-forest hover:bg-forest/5 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
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
