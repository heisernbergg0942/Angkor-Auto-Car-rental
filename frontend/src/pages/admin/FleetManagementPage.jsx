import { useState } from 'react';
import { Plus, Search, Car, Eye, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { fleetAvailability } from '../../data/mockData';

const statusStyles = {
  Available: 'text-emerald-600 bg-emerald-50 border border-emerald-200',
  Rented: 'text-blue-500 bg-blue-50 border border-blue-200',
  Maintenance: 'text-amber-600 bg-amber-50 border border-amber-200',
};

export default function FleetManagementPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = fleetAvailability.filter(v => {
    const matchSearch = v.model.toLowerCase().includes(search.toLowerCase()) || v.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Fleet Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage and monitor all vehicles in your fleet.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-[#2D6A4F] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#1B4332] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Vehicle
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Fleet', value: fleetAvailability.length, color: 'text-gray-800' },
            { label: 'Available', value: fleetAvailability.filter(v => v.status === 'Available').length, color: 'text-emerald-600' },
            { label: 'Rented Out', value: fleetAvailability.filter(v => v.status === 'Rented').length, color: 'text-blue-500' },
            { label: 'Maintenance', value: fleetAvailability.filter(v => v.status === 'Maintenance').length, color: 'text-amber-600' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
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
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by model or ID..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#2D6A4F]"
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Available', 'Rented', 'Maintenance'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-[#2D6A4F] text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Vehicle ID</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Model &amp; Type</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Last Maintenance</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Availability</th>
                <th className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3.5 text-xs font-mono font-semibold text-gray-600">{v.id}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        <img src={v.image} alt={v.model} className="w-full h-full object-contain p-1" onError={e => { e.target.style.display = 'none'; }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-800">{v.model}</div>
                        <div className="text-[10px] text-gray-400">{v.type} • {v.color}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusStyles[v.status]}`}>{v.status}</span>
                  </td>
                  <td className={`px-4 py-3.5 text-xs ${v.lastMaintenance === 'Overdue' ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                    {v.lastMaintenance}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${v.availability > 50 ? 'bg-[#2D6A4F]' : v.availability > 0 ? 'bg-amber-400' : 'bg-red-300'}`}
                          style={{ width: `${v.availability}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-gray-400">{v.availability}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-0.5">
                      <button className="p-1.5 text-gray-400 hover:text-[#2D6A4F] rounded-md transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Car className="w-8 h-8 mx-auto mb-2 text-gray-200" />
              <div className="text-xs font-medium text-gray-500">No vehicles found</div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
