import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Search, Loader2 } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import { vehicleAPI } from '../../services/api';

const sortOptions = ['Recommended', 'Price: Low to High', 'Price: High to Low'];

export default function FleetPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [priceRange, setPriceRange] = useState(500);
  const [sortBy, setSortBy]       = useState('Recommended');
  const [search, setSearch]       = useState(searchParams.get('q') || '');
  const [statusFilter, setStatusFilter] = useState('available');

  const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : '';

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const { data } = await vehicleAPI.list({ per_page: 50 });
      setVehicles(data.data || data);
    } catch (err) {
      console.error('Failed to load vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vehicles
    .filter(v => {
      const matchSearch = !search || `${v.brand} ${v.model}`.toLowerCase().includes(search.toLowerCase());
      const matchPrice  = parseFloat(v.daily_rate) <= priceRange;
      const matchStatus = !statusFilter || v.status === statusFilter;
      return matchSearch && matchPrice && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.daily_rate - b.daily_rate;
      if (sortBy === 'Price: High to Low') return b.daily_rate - a.daily_rate;
      return 0;
    });

  const statusBadge = {
    available:   'bg-emerald-50 text-emerald-600 border border-emerald-200',
    booked:      'bg-blue-50 text-blue-600 border border-blue-200',
    rented:      'bg-purple-50 text-purple-600 border border-purple-200',
    maintenance: 'bg-amber-50 text-amber-600 border border-amber-200',
  };

  return (
    <CustomerLayout>
      <div className="flex max-w-screen-xl mx-auto px-6 py-8 gap-8">
        {/* Sidebar Filters */}
        <aside className="w-52 shrink-0">
          <h2 className="text-base font-bold text-gray-900 mb-4">Filters</h2>

          {/* Search */}
          <div className="mb-5">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Search</div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Brand or model..."
                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          {/* Status */}
          <div className="mb-5">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Status</div>
            <div className="space-y-2">
              {['', 'available', 'booked', 'rented', 'maintenance'].map(s => (
                <label key={s} className="flex items-center gap-2 cursor-pointer" onClick={() => setStatusFilter(s)}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${statusFilter === s ? 'bg-[#2D6A4F] border-[#2D6A4F]' : 'border-gray-300 bg-white'}`}>
                    {statusFilter === s && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-xs text-gray-700 capitalize">{s || 'All'}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-5">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Max Daily Rate</div>
            <input
              type="range" min={20} max={500} step={10}
              value={priceRange}
              onChange={e => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 accent-[#2D6A4F] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
              <span>$20</span>
              <span className="text-gray-600 font-medium">${priceRange >= 500 ? '500+' : priceRange}/day</span>
            </div>
          </div>

          <button
            onClick={() => { setSearch(''); setStatusFilter('available'); setPriceRange(500); }}
            className="w-full border border-gray-200 text-gray-500 text-xs font-medium py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear Filters
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Available Fleet</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {loading ? 'Loading...' : `${filtered.length} vehicles found`}
              </p>
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs text-gray-700 border border-gray-200 rounded-md pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:border-[#2D6A4F] bg-white"
              >
                {sortOptions.map(opt => <option key={opt} value={opt}>Sort: {opt}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-[#2D6A4F]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-5xl mb-3">🚗</div>
              <div className="font-medium text-gray-600">No vehicles match your filters</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(v => (
                <div
                  key={v.id}
                  onClick={() => navigate(`/browse/${v.id}`)}
                  className="bg-white border border-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  {/* Vehicle Image */}
                  <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden">
                    {v.image ? (
                      <img
                        src={`${baseUrl}/storage/${v.image}`}
                        alt={`${v.brand} ${v.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-5xl">🚗</div>
                    )}
                    <span className={`absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusBadge[v.status] || 'bg-gray-100 text-gray-500'}`}>
                      {v.status}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{v.brand} {v.model}</h3>
                        <p className="text-[11px] text-gray-400">{v.year} • {v.color} • {v.plate_number}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-bold text-[#2D6A4F]">${v.daily_rate}</div>
                        <div className="text-[10px] text-gray-400">/day</div>
                      </div>
                    </div>
                    {v.description && (
                      <p className="text-[11px] text-gray-500 mt-2 line-clamp-2">{v.description}</p>
                    )}
                    <button
                      className={`mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                        v.status === 'available'
                          ? 'bg-[#2D6A4F] text-white hover:bg-[#1B4332]'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={v.status !== 'available'}
                    >
                      {v.status === 'available' ? 'View & Book' : v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
