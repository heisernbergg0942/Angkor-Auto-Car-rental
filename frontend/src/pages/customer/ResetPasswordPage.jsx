import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';
import { authAPI } from '../../services/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Auto-validate parameters on mount
  useEffect(() => {
    if (!token || !email) {
      setError('Invalid or expired password reset link. Please request a new one.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !email) {
      setError('Missing reset token or email address.');
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await authAPI.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation
      });
      setMessage(data.message || 'Password successfully reset! You can now log in.');
      setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-gray-900 bg-white">
      {/* Left side - Branding */}
      <div className="hidden lg:flex w-1/2 relative bg-[#3f6356] overflow-hidden flex-col justify-center">
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80"
            alt="Fleet Background"
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>
        
        <div className="relative z-10 px-16 lg:px-24">
          <h2 className="text-4xl font-bold text-white mb-6">Precision in every mile.</h2>
          <p className="text-[#a8c1b8] text-lg max-w-md mb-12">
            Access your global fleet dashboard and manage high-value
            assets with our industrial-grade reliability. Secure, fast, and
            built for professional logistics managers.
          </p>
          
          <div className="flex gap-12 text-white mb-24">
            <div>
              <div className="text-4xl font-bold mb-1">12k+</div>
              <div className="text-sm text-[#a8c1b8]">Active Vehicles</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">99.9%</div>
              <div className="text-sm text-[#a8c1b8]">Uptime Reliability</div>
            </div>
          </div>
        </div>

        {/* Bottom Card */}
        <div className="absolute bottom-12 left-16 right-16 z-10">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 flex gap-4 items-start">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold mb-1 text-sm"> Angkor Car Rental</h4>
              <p className="text-[#a8c1b8] text-xs leading-relaxed">
                We use multi-factor authentication and bank-grade encryption to protect your fleet data and sensitive operations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center relative p-8 sm:p-12 lg:px-24">
        
        <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
          <h1 className="text-3xl font-bold mb-3">Reset Password</h1>
          <p className="text-gray-500 mb-8 text-sm leading-relaxed">
            Please enter your new secure password below to regain access to your account.
          </p>

          {message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs px-4 py-3 rounded-lg mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f6356]/20 focus:border-[#3f6356] transition-colors"
                  placeholder="At least 8 characters"
                  disabled={!token || !email}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="password" 
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3f6356]/20 focus:border-[#3f6356] transition-colors"
                  placeholder="Repeat your password"
                  disabled={!token || !email}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || !token || !email}
              className="w-full bg-[#3f6356] text-white font-semibold py-3 rounded-lg hover:bg-[#2d483e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full flex justify-between items-center mt-auto pt-8 text-xs text-gray-400">
          <div>© 2026 Angkor Auto Systems</div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-600 transition-colors">Support</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
          </div>
        </div>

      </div>
    </div>
  );
}
