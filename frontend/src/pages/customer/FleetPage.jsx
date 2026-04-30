import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, X } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import VehicleCard from '../../components/ui/VehicleCard';
import { vehicles } from '../../data/vehicles';

const vehicleTypes = ['SUV & Crossovers', 'Executive Sedans', 'Electric (EV)', 'Luxury Sport'];
const sortOptions = ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Rating'];

export default function FleetPage() {
  const [searchParams] = useSearchParams();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedTypes, setSelectedTypes] = useState(['Executive Sedans']);
  const [priceRange, setPriceRange] = useState(1000);
  const [sortBy, setSortBy] = useState('Recommended');
  const query = searchParams.get('q') || '';

  const toggleType = (type) =>
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  const filtered = useMemo(() => {
    let result = [...vehicles];
    if (query) result = result.filter(v => v.name.toLowerCase().includes(query.toLowerCase()));
    if (selectedTypes.length > 0) result = result.filter(v => selectedTypes.includes(v.type) || selectedTypes.includes(v.category));
    result = result.filter(v => v.price <= priceRange);
    if (sortBy === 'Price: Low to High') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'Price: High to Low') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'Rating') result.sort((a, b) => b.rating - a.rating);
    return result;
  }, [query, selectedTypes, priceRange, sortBy]);

  return (
    <CustomerLayout>
      <div className="flex max-w-screen-xl mx-auto px-6 py-8 gap-8">
        {/* Left Sidebar Filters */}
        <aside className="w-48 shrink-0">
          <h2 className="text-base font-bold text-gray-900 mb-4">Filters</h2>

          {/* Availability Dates */}
          <div className="mb-5">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Availability Dates</div>
            <div className="space-y-2">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                placeholder="mm/dd/yyyy"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-500 focus:outline-none focus:border-[#2D6A4F]"
              />
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                placeholder="mm/dd/yyyy"
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs text-gray-500 focus:outline-none focus:border-[#2D6A4F]"
              />
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="mb-5">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Vehicle Type</div>
            <div className="space-y-2.5">
              {vehicleTypes.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                      selectedTypes.includes(type)
                        ? 'bg-[#2D6A4F] border-[#2D6A4F]'
                        : 'border-gray-300 bg-white'
                    }`}
                    onClick={() => toggleType(type)}
                  >
                    {selectedTypes.includes(type) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-xs text-gray-700" onClick={() => toggleType(type)}>{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-5">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">Price Range (Daily)</div>
            <input
              type="range" min={50} max={1000} step={10}
              value={priceRange}
              onChange={e => setPriceRange(Number(e.target.value))}
              className="w-full h-1.5 accent-[#2D6A4F] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5">
              <span>$50</span>
              <span className="text-gray-600 font-medium">${priceRange >= 1000 ? '1,000+' : priceRange}</span>
            </div>
          </div>

          {/* Apply Button */}
          <button className="w-full bg-[#2D6A4F] text-white text-xs font-semibold py-2.5 rounded-md hover:bg-[#1B4332] transition-colors">
            Apply All Filters
          </button>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Available Fleet</h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {filtered.length} premium vehicles found for your selection
              </p>
            </div>
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="text-xs text-gray-700 border border-gray-200 rounded-md pl-3 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:border-[#2D6A4F] bg-white"
              >
                {sortOptions.map(opt => (
                  <option key={opt} value={opt}>Sort by: {opt}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Vehicle Grid */}
          <div className="grid grid-cols-3 gap-5 mt-5">
            {filtered.map(v => (
              <VehicleCard key={v.id} vehicle={v} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3">🚗</div>
              <div className="font-medium text-gray-600">No vehicles match your filters</div>
              <button
                onClick={() => { setSelectedTypes([]); setPriceRange(1000); }}
                className="mt-3 text-sm text-[#2D6A4F] underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Load More */}
          {filtered.length > 0 && (
            <div className="text-center mt-10">
              <button className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 text-xs font-medium px-5 py-2.5 rounded-md hover:bg-gray-50 transition-colors">
                Load More Vehicles
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}
