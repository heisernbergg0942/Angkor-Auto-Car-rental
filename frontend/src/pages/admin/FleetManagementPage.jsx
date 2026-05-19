import { useState, useEffect } from 'react';
import { Plus, Search, Car, Edit, Trash2, Loader2, AlertCircle, X, Check } from 'lucide-react';
import AdminLayout from '../../components/layout/AdminLayout';
import { vehicleAPI } from '../../services/api';

const STATUS_STYLES = {
  available:   'text-emerald-600 bg-emerald-50 border border-emerald-200',
  booked:      'text-blue-500 bg-blue-50 border border-blue-200',
  rented:      'text-purple-600 bg-purple-50 border border-purple-200',
  maintenance: 'text-amber-600 bg-amber-50 border border-amber-200',
};

const EMPTY_FORM = { brand: '', model: '', year: '', color: '', plate_number: '', daily_rate: '', status: 'available', description: '' };

export default function FleetManagementPage() {
  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000';
  const [vehicles,     setVehicles]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal,    setShowModal]    = useState(false);
  const [editing,      setEditing]      = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(null);

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await vehicleAPI.list({ per_page: 100 });
      setVehicles(data.data || data);
    } catch { setError('Failed to load vehicles.'); }
    finally   { setLoading(false); }
  };

  const filtered = vehicles.filter(v => {
    const matchSearch = !search || `${v.brand} ${v.model} ${v.plate_number}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || v.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openAdd  = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };
  const openEdit = (v) => {
    setEditing(v);
    setForm({ brand: v.brand, model: v.model, year: v.year, color: v.color, plate_number: v.plate_number, daily_rate: v.daily_rate, status: v.status, description: v.description || '' });
    setImageFile(null);
    setImagePreview(v.image ? `${baseUrl}/storage/${v.image}` : null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Build FormData to support file upload
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        await vehicleAPI.update(editing.id, fd);
      } else {
        await vehicleAPI.create(fd);
      }
      setShowModal(false);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    setDeleting(id);
    try {
      await vehicleAPI.delete(id);
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch { setError('Delete failed.'); }
    finally   { setDeleting(null); }
  };

  const counts = {
    total:       vehicles.length,
    available:   vehicles.filter(v => v.status === 'available').length,
    rented:      vehicles.filter(v => v.status === 'rented').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
  };

  return (
    <AdminLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Fleet Management</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage all vehicles in your fleet.</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-1.5 bg-[#2D6A4F] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#1B4332] transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Vehicle
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[
            { label: 'Total Fleet',  value: counts.total,       color: 'text-gray-800' },
            { label: 'Available',    value: counts.available,   color: 'text-emerald-600' },
            { label: 'Rented',       value: counts.rented,      color: 'text-purple-600' },
            { label: 'Maintenance',  value: counts.maintenance, color: 'text-amber-600' },
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
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vehicles..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[#2D6A4F]" />
          </div>
          <div className="flex gap-2">
            {['all', 'available', 'booked', 'rented', 'maintenance'].map(s => (
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
                  {['Plate','Brand & Model','Year','Color','Daily Rate','Status','Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3.5 text-xs font-mono font-semibold text-gray-600">{v.plate_number}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                          {v.image ? (
                            <img
                              src={`${baseUrl}/storage/${v.image}`}
                              alt={`${v.brand} ${v.model}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">🚗</span>
                          )}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-800">{v.brand} {v.model}</div>
                          <div className="text-[10px] text-gray-400 truncate max-w-[180px]">{v.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{v.year}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-600">{v.color}</td>
                    <td className="px-4 py-3.5 text-xs font-semibold text-gray-800">${v.daily_rate}/day</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[v.status] || 'bg-gray-100 text-gray-500'}`}>{v.status}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => openEdit(v)} className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(v.id)} disabled={deleting === v.id} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition-colors">
                          {deleting === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-400"><Car className="w-8 h-8 mx-auto mb-2 opacity-30" /><div className="text-xs">No vehicles found</div></td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">{editing ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle Image</label>
                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#2D6A4F] transition-colors relative overflow-hidden"
                  onClick={() => document.getElementById('vehicleImageInput').click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-md" />
                  ) : (
                    <div className="py-4">
                      <div className="text-3xl mb-1">📷</div>
                      <div className="text-xs text-gray-400">Click to upload image</div>
                      <div className="text-[10px] text-gray-300 mt-0.5">JPG, PNG, WEBP — max 5MB</div>
                    </div>
                  )}
                  <input
                    id="vehicleImageInput"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setImageFile(file);
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
                {imagePreview && (
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="mt-1 text-[10px] text-red-400 hover:text-red-600">
                    Remove image
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[['brand','Brand'],['model','Model'],['year','Year'],['color','Color'],['plate_number','Plate Number'],['daily_rate','Daily Rate ($)']].map(([key, label]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                    <input required type={key === 'year' || key === 'daily_rate' ? 'number' : 'text'} value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F]" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F]">
                  {['available','booked','rented','maintenance'].map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-[#2D6A4F] resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 py-2 bg-[#2D6A4F] text-white rounded-lg text-xs font-semibold hover:bg-[#1B4332] disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" />{editing ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
