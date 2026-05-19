import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Car, Search, Bell, HelpCircle, User, Menu, X, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';

export default function CustomerLayout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Display name & role label
  const displayName = user?.name || 'Guest';
  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : '';

  // Fetch unread count periodically
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await notificationAPI.unreadCount();
      setUnreadCount(data.count ?? 0);
    } catch { /* silent */ }
  }, []);

  // Fetch full notification list when panel opens
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationAPI.list();
      setNotifications(data.data ?? []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  const toggleNotif = () => {
    if (!notifOpen) {
      fetchNotifications();
      handleMarkAllRead();
    }
    setNotifOpen(prev => !prev);
  };

  const handleMarkOne = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

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
                <div className="font-bold text-[#2D6A4F] text-sm leading-none p-2">Angkor Auto</div>
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

              {/* Notification Bell */}
              <div className="relative hidden md:block" ref={notifRef}>
                <button
                  onClick={toggleNotif}
                  className="relative p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                      <span className="text-xs font-semibold text-gray-700">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="flex items-center gap-1 text-[10px] text-[#2D6A4F] hover:underline font-medium"
                        >
                          <CheckCheck className="w-3 h-3" /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* List */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400">
                          <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => !n.is_read && handleMarkOne(n.id)}
                            className={`px-4 py-3 cursor-pointer transition-colors ${
                              n.is_read
                                ? 'bg-white hover:bg-gray-50'
                                : 'bg-green-50 hover:bg-green-100'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.is_read && (
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#2D6A4F] shrink-0" />
                              )}
                              <div className={!n.is_read ? '' : 'ml-3.5'}>
                                <p className="text-xs text-gray-700 leading-snug">{n.message}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  {new Date(n.created_at).toLocaleString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-md hidden md:block">
                <HelpCircle className="w-4 h-4" />
              </button>
              <Link
                to="/browse"
                className="hidden md:flex bg-[#2D6A4F] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#1B4332] transition-colors"
              >
                New Rental
              </Link>

              {/* User Profile */}
              <div className="hidden md:flex items-center gap-2 ml-2 pl-3 border-l border-gray-100">
                <div className="text-right">
                  <div className="text-xs font-semibold text-gray-800 leading-none">{displayName}</div>
                  <div className="text-[10px] text-gray-400 leading-none mt-0.5">Angkor Auto {displayRole}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#2D6A4F] overflow-hidden flex items-center justify-center">
                  <span className="text-white text-xs font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
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
              <span className="font-bold text-[#2D6A4F] text-sm">Angkor Auto</span>
            </Link>
            <div className="flex flex-wrap justify-center gap-4 text-[11px] text-gray-400">
              {['Privacy Policy', 'Terms of Service', 'Fleet Insurance', 'Partner Program', 'Contact'].map(l => (
                <a key={l} href="#" className="hover:text-gray-600 transition-colors">{l}</a>
              ))}
            </div>
            <div className="text-[11px] text-gray-400">© 2026 Angkor Auto Systems. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
