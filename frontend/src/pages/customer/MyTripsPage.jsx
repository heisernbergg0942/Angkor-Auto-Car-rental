import { useNavigate } from 'react-router-dom';
import { Car, Calendar } from 'lucide-react';
import CustomerLayout from '../../components/layout/CustomerLayout';

export default function MyTripsPage() {
  const navigate = useNavigate();
  return (
    <CustomerLayout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-6">
          <Calendar className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">My Trips</h1>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">
          You have no upcoming trips. Start by browsing our premium fleet and booking your next vehicle.
        </p>
        <button onClick={() => navigate('/browse')} className="btn-primary inline-flex items-center gap-2">
          <Car className="w-4 h-4" />
          Browse Fleet
        </button>
      </div>
    </CustomerLayout>
  );
}
