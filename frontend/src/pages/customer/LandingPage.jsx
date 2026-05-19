import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Phone, BriefcaseBusiness, LogOut, Bell, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';

const navLinks = ['Browse', 'Support'];

const features = [
  { icon: Shield, title: 'Impeccable Maintenance', desc: 'Regular diagnostic checks and premium detailing before every rental.' },
  { icon: Phone, title: '24/7 Corporate Support', desc: 'Dedicated account managers and roadside assistance always available.' },
  { icon: BriefcaseBusiness, title: 'Comprehensive Insurance', desc: 'Flexible coverage options designed to protect high-value assets and personnel.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout, isAdminOrStaff } = useAuth();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  // Fetch unread notifications count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await notificationAPI.unreadCount();
      setUnreadCount(data.count ?? 0);
    } catch { /* silent */ }
  }, []);

  // Fetch notification list on dropdown open
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

  // Close dropdown on click outside
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
    <div className="font-sans">
      {/* ===== TOP NAV ===== */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-screen-lg mx-auto px-6">
          <div className="flex items-center h-13 gap-6">
            <Link to="/" className="font-bold text-[#2D6A4F] text-base shrink-0">Angkor Auto </Link>
            <nav className="flex items-center gap-1">
              {navLinks.map((link, i) => (
                <a
                  key={link}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (link === 'Browse') navigate('/browse');
                    if (link === 'Support') navigate('/support');
                  }}
                  className="px-3 py-5 text-sm transition-colors text-gray-500 hover:text-gray-800"
                >
                  {link}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-3">
              {user ? (
                // ── Logged-in state ──
                <>
                  <button
                    onClick={() => navigate('/my-trips')}
                    className="text-[#2D6A4F] bg-white border border-[#2D6A4F] text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#e8f3ee] transition-colors"
                  >
                    My Trips
                  </button>

                  {/* Notification Bell */}
                  <div className="relative" ref={notifRef}>
                    <button
                      onClick={toggleNotif}
                      className="relative p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50 transition-colors"
                      aria-label="Notifications"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
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

                  <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                      <div className="text-xs font-semibold text-gray-800 leading-none">{user.name}</div>
                      <div className="text-[10px] text-gray-400 capitalize">{user.role}</div>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-[#2D6A4F]/10 flex items-center justify-center text-[#2D6A4F] font-bold text-sm shrink-0">
                      {user.name?.charAt(0)}
                    </div>
                    <button
                      onClick={async () => { await logout(); navigate('/'); }}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                // ── Guest state ──
                <>
                  <Link to="/login" className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-2 py-2">Login</Link>
                  <Link to="/register" className="bg-gray-100 text-gray-800 text-xs font-semibold px-4 py-2 rounded-md hover:bg-gray-200 transition-colors">Sign Up</Link>
                </>
              )}
              <button
                onClick={() => navigate('/browse')}
                className="bg-[#2D6A4F] text-white text-xs font-semibold px-4 py-2 rounded-md hover:bg-[#1B4332] transition-colors"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden" style={{ minHeight: '420px' }}>
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            background: 'linear-gradient(to right, rgba(20,30,25,0.92) 0%, rgba(20,30,25,0.6) 50%, rgba(20,30,25,0.3) 100%), url(https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1400&q=80) center/cover no-repeat',
          }}
        />
        <div className="relative max-w-screen-lg mx-auto px-6 py-24 flex items-center justify-center text-center min-h-[420px]">
          {/* Hero text centered */}
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Find Your Perfect Ride.
            </h1>
            <p className="text-gray-200 text-lg leading-relaxed mb-10">
              Experience precision and reliability with AutoSage Rental. Premium vehicles for discerning professionals, available precisely when you need them.
            </p>
            <button
              onClick={() => navigate('/browse')}
              className="bg-[#2D6A4F] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#1B4332] transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95"
            >
              Browse Our Cars
            </button>
          </div>
        </div>
      </section>

      {/* ===== RELIABILITY SECTION ===== */}
      <section className="py-14 bg-gray-50">
        <div className="max-w-screen-lg mx-auto px-6">
          <div className="flex items-center gap-12">
            {/* Left text */}
            <div className="flex-1 max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Engineered for Reliability</h2>
              <p className="text-xs text-gray-500 leading-relaxed mb-7">
                We understand that in business, time is an asset. Our Car rental management ensures every vehicle meets stringent safety and cleanliness standards, so you can focus on the road ahead.
              </p>
              <div className="space-y-5">
                {features.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex gap-3">
                    <div className="w-5 h-5 mt-0.5 shrink-0">
                      <div className="w-5 h-5 rounded-full border-2 border-[#2D6A4F] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F]" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-800 mb-0.5">{title}</div>
                      <div className="text-[11px] text-gray-500 leading-relaxed">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right image */}
            <div className="flex-1 max-w-md">
              <div className="rounded-2xl overflow-hidden shadow-lg" style={{ height: '280px' }}>
                <img
                  src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80"
                  alt="Driver in premium vehicle"
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.parentElement.style.background = 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)';
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-white border-t border-gray-100 py-6">
        <div className="max-w-screen-lg mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-bold text-[#2D6A4F] text-sm">Angkor Auto Car Rental </span>
          <div className="flex flex-wrap justify-center gap-4 text-[11px] text-gray-400">
            {['Privacy Policy', 'Terms of Service', 'Fleet Insurance', 'Partner Program', 'Contact'].map(l => (
              <a key={l} href="#" className="hover:text-gray-600">{l}</a>
            ))}
          </div>
          <span className="text-[11px] text-gray-400">© 2026 Angkor Auto Systems. All rights reserved.</span>
        </div>
      </footer>

      {/* Admin portal link — only for admins/staff */}
      {isAdminOrStaff && (
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => navigate('/admin')}
            className="bg-[#2D6A4F] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg hover:bg-[#1B4332] transition-colors"
          >
            🔧 Admin Portal
          </button>
        </div>
      )}
    </div>
  );
}
