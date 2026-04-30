import { useState } from 'react';
import { Search, UserPlus, Eye, Mail, Phone } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { customers } from '../../data/mockData';

const tierBadge = {
  Corporate: 'bg-purple-100 text-purple-700',
  Gold: 'bg-yellow-100 text-yellow-700',
  Silver: 'bg-slate-100 text-slate-600',
  Standard: 'bg-blue-50 text-blue-600',
};

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-6 animate-fadeIn">
        <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Customer Data</h1>
            <p className="text-slate-500 text-sm mt-0.5">Manage customer accounts and rental history.</p>
          </div>
          <button className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Customer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Customers', value: customers.length },
            { label: 'Active', value: customers.filter(c => c.status === 'Active').length },
            { label: 'Corporate', value: customers.filter(c => c.tier === 'Corporate').length },
            { label: 'Total Rentals', value: customers.reduce((s, c) => s + c.rentals, 0) },
          ].map(({ label, value }) => (
            <div key={label} className="card p-4 text-center">
              <div className="text-2xl font-bold text-slate-800">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers..."
            className="input-field pl-9"
          />
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="table-header">Customer</th>
                  <th className="table-header">Contact</th>
                  <th className="table-header">Tier</th>
                  <th className="table-header">Rentals</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Joined</th>
                  <th className="table-header">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center shrink-0">
                          <span className="text-forest font-bold text-sm">{c.name.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{c.name}</div>
                          <div className="text-xs text-slate-400">{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-slate-600"><Mail className="w-3 h-3" /> {c.email}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500"><Phone className="w-3 h-3" /> {c.phone}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${tierBadge[c.tier]}`}>{c.tier}</span>
                    </td>
                    <td className="table-cell font-semibold text-slate-700">{c.rentals}</td>
                    <td className="table-cell">
                      <span className={c.status === 'Active' ? 'badge-available' : 'badge-normal'}>{c.status}</span>
                    </td>
                    <td className="table-cell text-slate-500 text-sm">{c.joined}</td>
                    <td className="table-cell">
                      <button className="p-1.5 text-slate-400 hover:text-forest hover:bg-forest/5 rounded-lg transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
