import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate  = useNavigate();
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      // Route based on role
      if (user.role === 'admin' || user.role === 'staff') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900 bg-white">
      {/* Left side - Image & Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
          alt="Luxury Car"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute top-8 left-10 z-20">
          <Link to="/" className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2D6A4F] rounded-lg flex items-center justify-center">
              <span className="text-white text-lg leading-none">A</span>
            </div>
            Angkor Auto
          </Link>
        </div>
        <div className="absolute bottom-12 left-10 right-10 z-20 text-white">
          <h2 className="text-4xl font-bold mb-4">Premium fleet.<br />Exceptional service.</h2>
          <p className="text-gray-300 text-lg max-w-md">Access our exclusive collection of premium vehicles for your next journey.</p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="absolute top-8 left-8 lg:hidden">
          <Link to="/" className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2D6A4F] rounded-md flex items-center justify-center">
              <span className="text-white text-sm leading-none">A</span>
            </div>
            Angkor Auto
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-5 h-5 text-[#2D6A4F]" />
            <span className="text-sm font-semibold text-[#2D6A4F] uppercase tracking-wider">Secure Login</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-500 mb-8">Enter your credentials to access your account.</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors"
                  placeholder="admin@angkorauto.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-[#2D6A4F] hover:text-[#1B4332]">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D6A4F]/20 focus:border-[#2D6A4F] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2D6A4F] text-white font-semibold py-2.5 rounded-lg hover:bg-[#1B4332] transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-600 mb-1">Demo accounts:</p>
            <p>Admin: <span className="font-mono">admin@angkorauto.com</span> / <span className="font-mono">password123</span></p>
            <p>Customer: <span className="font-mono">customer@example.com</span> / <span className="font-mono">password123</span></p>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#2D6A4F] hover:text-[#1B4332]">Create one now</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
