import { useState, useEffect } from 'react';
import { Search, Mail, Phone, Eye, Loader2, AlertCircle, X } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { customerAPI } from '../../services/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState('');
  const [search,    setSearch]    = useState('');
  const [selected,  setSelected]  = useState(null);

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data } = await customerAPI.list({ per_page: 100 });
      setCustomers(data.data || data);
    } catch { setError('Failed to load customers.'); }
    finally   { setLoading(false); }
  };

  const filtered = customers.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Customers</h1>
            <p className="text-xs text-gray-400 mt-0.5">All registered customer accounts.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: 'Total Customers', value: customers.length },
            { label: 'With Bookings',   value: customers.filter(c => c.bookings_count > 0).length },
            { label: 'With Documents',  value: customers.filter(c => c.documents_count > 0).length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-800">{loading ? '…' : value}</div>
              <div className="text-[10px] text-gray-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or phone..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[#2D6A4F]" />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[#2D6A4F]" /></div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Customer','Contact','License','Address','Joined','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center shrink-0">
                          <span className="text-[#2D6A4F] font-bold text-sm">{(c.name || '?').charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-800">{c.name}</div>
                          <div className="text-[10px] text-gray-400">ID #{c.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-xs text-gray-600"><Mail className="w-3 h-3" /> {c.email || '—'}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-400"><Phone className="w-3 h-3" /> {c.phone || '—'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 font-mono">{c.license_number || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 max-w-[140px] truncate">{c.address || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{formatDate(c.created_at)}</td>
                    <td className="px-4 py-3.5">
                      <button onClick={() => setSelected(c)} className="p-1.5 text-gray-400 hover:text-[#2D6A4F] rounded-md transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-12 text-xs text-gray-400">No customers found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Customer Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
          <div className="bg-white w-full max-w-sm h-full overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Customer Details</h2>
              <button onClick={() => setSelected(null)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center text-2xl font-bold text-[#2D6A4F]">
                  {(selected.name || '?').charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-gray-900">{selected.name}</div>
                  <div className="text-xs text-gray-400">Customer #{selected.id}</div>
                </div>
              </div>
              {[
                ['Email',   selected.email],
                ['Phone',   selected.phone],
                ['Address', selected.address],
                ['License', selected.license_number],
                ['Joined',  formatDate(selected.created_at)],
              ].map(([label, val]) => val && (
                <div key={label} className="flex justify-between items-start border-b border-gray-50 pb-3">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-medium text-gray-700 text-right max-w-[180px]">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
