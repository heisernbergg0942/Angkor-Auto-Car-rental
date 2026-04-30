import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Car, BookOpen, Users, DollarSign,
  Settings, HelpCircle, LogOut, Plus, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/fleet', label: 'Fleet Management', icon: Car },
  { to: '/admin/rentals', label: 'Rental Logic', icon: BookOpen },
  { to: '/admin/customers', label: 'Customer Data', icon: Users },
  { to: '/admin/revenue', label: 'Revenue', icon: DollarSign },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-30 flex flex-col h-full bg-white border-r border-gray-100
        w-[200px] shrink-0 shadow-sm
        transition-transform duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
            <img
              src="https://ui-avatars.com/api/?name=Fleet+Admin&background=2D6A4F&color=fff&size=36"
              alt="Fleet Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="font-bold text-[#2D6A4F] text-sm leading-tight">Fleet Admin</div>
            <div className="text-[10px] text-gray-400 leading-tight">Global Operations</div>
          </div>
        </div>

        {/* New Booking Button */}
        <div className="px-3 py-3 border-b border-gray-100">
          <button
            onClick={() => navigate('/browse')}
            className="flex items-center justify-center gap-1.5 w-full bg-[#2D6A4F] text-white rounded-md font-medium text-xs py-2 hover:bg-[#1B4332] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Booking
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#edf7f2] text-[#2D6A4F] border-l-2 border-[#2D6A4F] pl-[10px]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="py-2 px-2 border-t border-gray-100 space-y-0.5">
          <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors">
            <HelpCircle className="w-4 h-4 shrink-0" />
            <span>Help Center</span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button onClick={() => setMobileOpen(true)}>
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="font-bold text-[#2D6A4F] text-sm">Fleet Admin</span>
        </div>

        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>

        <footer className="text-center text-[11px] text-gray-400 py-2.5 border-t border-gray-100 bg-white">
          © 2024 AutoSage Fleet Systems. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
