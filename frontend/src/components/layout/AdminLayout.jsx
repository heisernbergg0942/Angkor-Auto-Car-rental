import { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, BookOpen, Users, DollarSign,
  Settings, HelpCircle, LogOut, Plus, Menu, X, Bell, CheckCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/fleet', label: 'View Cars', icon: Car },
  { to: '/admin/rentals', label: 'Manage Booking', icon: BookOpen },
  { to: '/admin/customers', label: 'Customer Data', icon: Users },
  { to: '/admin/revenue', label: 'Revenue', icon: DollarSign },
  { to: '/admin/settings', label: 'System Settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const displayName = user?.name || 'Admin';
  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : 'Staff';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await notificationAPI.unreadCount();
      setUnreadCount(data.count ?? 0);
    } catch { /* silent */ }
  }, []);

  // Fetch notification history list
  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await notificationAPI.list();
      setNotifications(data.data ?? []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [user, fetchUnreadCount]);

  // Click outside to close notification panel
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
      handleMarkAllRead(); // Auto mark all read when clicked so the badge disappears instantly
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
          <div className="w-9 h-9 rounded-full bg-[#2D6A4F] flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-bold text-[#2D6A4F] text-sm leading-tight truncate max-w-[120px]">{displayName}</div>
            <div className="text-[10px] text-gray-400 leading-tight">Angkor Auto {displayRole}</div>
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
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* ---- Top Navigation Bar ---- */}
        <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="md:hidden">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <span className="font-bold text-gray-800 text-sm hidden md:inline capitalize">
              Angkor Auto Admin Management
            </span>
            <span className="font-bold text-[#2D6A4F] text-sm md:hidden">
              Angkor Auto Admin
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Dynamic Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={toggleNotif}
                className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                aria-label="Admin Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Dynamic Notification Dropdown */}
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden text-left">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                    <span className="text-xs font-semibold text-gray-700">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="flex items-center gap-1 text-[10px] text-[#2D6A4F] hover:underline font-semibold"
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
                        No new notifications
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

            {/* Quick Profile display in Topbar */}
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center font-bold text-xs">
                {displayName.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-50">
          {children}
        </main>

        <footer className="text-center text-[11px] text-gray-400 py-2.5 border-t border-gray-100 bg-white">
          © 2026 Angkor Auto Systems. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
