import { useNavigate } from 'react-router-dom';
import { Zap, Settings2, Users } from 'lucide-react';

const fuelIconMap = {
  Electric: '⚡',
  Hybrid: '⛽',
  Petrol: '⛽',
};

const badgeMap = {
  'EV CERTIFIED': 'bg-[#2D6A4F] text-white',
  'HIGH DEMAND': 'bg-gray-800 text-white',
  'ONLY 1 LEFT': 'bg-red-500 text-white',
};

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Image area */}
      <div className="relative bg-gray-50 overflow-hidden" style={{ height: '190px' }}>
        {vehicle.badge && (
          <span className={`absolute top-3 left-3 z-10 text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wide ${badgeMap[vehicle.badge] || 'bg-gray-800 text-white'}`}>
            {vehicle.badge}
          </span>
        )}
        <img
          src={vehicle.image}
          alt={vehicle.name}
          className="w-full h-full object-contain p-3 hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.style.display = 'none'; }}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Name + Price */}
        <div className="flex items-baseline justify-between mb-0.5">
          <h3 className="font-bold text-gray-900 text-sm leading-tight">{vehicle.name}</h3>
          <div className="text-right shrink-0 ml-2">
            <span className="text-[#2D6A4F] font-bold text-base">${vehicle.price}</span>
            <span className="text-gray-400 text-xs"> / day</span>
          </div>
        </div>
        <p className="text-[11px] text-gray-400 mb-3">{vehicle.subtitle}</p>

        {/* Specs row */}
        <div className="grid grid-cols-3 gap-1 mb-4 border border-gray-100 rounded-lg p-2">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[13px]">{fuelIconMap[vehicle.fuel] || '⛽'}</span>
            <span className="text-[10px] text-gray-600">{vehicle.fuel}</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-gray-100">
            <Settings2 className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] text-gray-600">{vehicle.transmission}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] text-gray-600">{vehicle.seats} Seats</span>
          </div>
        </div>

        {/* Book Now */}
        <button
          onClick={() => navigate(`/browse/${vehicle.id}`)}
          className="w-full bg-[#2D6A4F] text-white text-xs font-semibold py-2.5 rounded-md hover:bg-[#1B4332] transition-colors"
        >
          Book Now
        </button>
      </div>
    </div>
  );
}
