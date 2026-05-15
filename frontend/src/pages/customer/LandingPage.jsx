import { Link, useNavigate } from 'react-router-dom';
import { Shield, Phone, BriefcaseBusiness, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navLinks = ['Browse', 'Support'];

const features = [
  { icon: Shield, title: 'Impeccable Maintenance', desc: 'Regular diagnostic checks and premium detailing before every rental.' },
  { icon: Phone, title: '24/7 Corporate Support', desc: 'Dedicated account managers and roadside assistance always available.' },
  { icon: BriefcaseBusiness, title: 'Comprehensive Insurance', desc: 'Flexible coverage options designed to protect high-value assets and personnel.' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { user, logout, isAdminOrStaff } = useAuth();

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
              Browse Our Fleet
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
