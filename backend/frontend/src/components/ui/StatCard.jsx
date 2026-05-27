import { TrendingUp } from 'lucide-react';

export default function StatCard({ icon: Icon, label, value, sub, trend, trendValue, iconBg = 'bg-slate-100', iconColor = 'text-slate-600', progress }) {
  return (
    <div className="stat-card animate-fadeIn">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</div>
          <div className="text-3xl font-bold text-slate-800">{value}</div>
          {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
        </div>
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      {(trendValue || progress !== undefined) && (
        <div className="mt-1">
          {trendValue && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
              <TrendingUp className="w-3 h-3" />
              {trendValue}
            </span>
          )}
          {progress !== undefined && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">{Math.round(progress)}% Utilization</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-forest rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
