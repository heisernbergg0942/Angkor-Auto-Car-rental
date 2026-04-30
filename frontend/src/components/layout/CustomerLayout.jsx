import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Car, Search, Bell, HelpCircle, User, Menu, X } from 'lucide-react';

export default function CustomerLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* ---- Top Navigation ---- */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center h-14">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 mr-6 shrink-0">
              <div className="w-7 h-7 bg-[#2D6A4F] rounded-md flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-bold text-[#2D6A4F] text-sm leading-none">Angkor Auto</div>
                <div className="text-[9px] text-gray-400 leading-none uppercase tracking-wide">Car Rental Company</div>
              </div>
            </Link>

            {/* Search */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search vehicles, customers, or agreements..."
                  className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>
            </div>

            {/* Right side */}
            <div className="ml-auto flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hidden md:block">
                <Bell className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hidden md:block">
                <HelpCircle className="w-4 h-4" />
              </button>
              <Link
                to="/browse"
                className="hidden md:flex bg-[#2D6A4F] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#1B4332] transition-colors"
              >
                New Rental
              </Link>
              <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-gray-100">
                <div className="text-right">
                  <div className="text-xs font-semibold text-gray-800 leading-none">Alex Rivera</div>
                  <div className="text-[10px] text-gray-400 leading-none mt-0.5">Fleet Manager</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
              </div>
              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5 text-gray-600" /> : <Menu className="w-5 h-5 text-gray-600" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-3 pt-1 border-t border-gray-100 space-y-1">
              <NavLink to="/" end className={({ isActive }) => `block px-3 py-2 text-sm ${isActive ? 'text-[#2D6A4F] font-semibold' : 'text-gray-600'}`}>Explore</NavLink>
              <NavLink to="/my-trips" className={({ isActive }) => `block px-3 py-2 text-sm ${isActive ? 'text-[#2D6A4F] font-semibold' : 'text-gray-600'}`}>My Trips</NavLink>
              <NavLink to="/browse" className="block px-3 py-2 text-sm font-semibold text-[#2D6A4F]">New Rental</NavLink>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 mt-10">
        <div className="max-w-screen-xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#2D6A4F] rounded-md flex items-center justify-center">
                <Car className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-[#2D6A4F] text-sm">FleetRent</span>
            </Link>
            <div className="flex flex-wrap justify-center gap-4 text-[11px] text-gray-400">
              {['Privacy Policy', 'Terms of Service', 'Fleet Insurance', 'Partner Program', 'Contact'].map(l => (
                <a key={l} href="#" className="hover:text-gray-600 transition-colors">{l}</a>
              ))}
            </div>
            <div className="text-[11px] text-gray-400">© 2024 FleetStream Management Systems. All rights reserved. • V 4.2.1-stable</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
