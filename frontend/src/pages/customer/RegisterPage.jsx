import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, ShieldCheck, Zap, Info, UserCircle2, ArrowRight, BookOpen, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { customerAPI } from '../../services/api';

export default function RegisterPage() {
  const navigate    = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '', agree: false
  });
  const [documents, setDocuments] = useState({
    nationalIdFront: null,
    nationalIdBack: null,
    license: null,
  });
  const nationalIdFrontRef = useRef(null);
  const nationalIdBackRef = useRef(null);
  const licenseRef = useRef(null);

  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleFileChange = (e, docType) => {
    if (e.target.files && e.target.files[0]) {
      setDocuments(prev => ({ ...prev, [docType]: e.target.files[0] }));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register({
        name:     formData.name,
        email:    formData.email,
        phone:    formData.phone,
        password: formData.password,
        password_confirmation: formData.password,
        role:     'customer',
      });
      
      if (user && user.customer && user.customer.id) {
        const uploadPromises = [];
        
        if (documents.nationalIdFront) {
          const fd = new FormData();
          fd.append('document_type', 'national_id');
          fd.append('file', documents.nationalIdFront);
          uploadPromises.push(customerAPI.uploadMyDocument(fd));
        }
        
        if (documents.nationalIdBack) {
          const fd = new FormData();
          fd.append('document_type', 'national_id');
          fd.append('file', documents.nationalIdBack);
          uploadPromises.push(customerAPI.uploadMyDocument(fd));
        }
        
        if (documents.license) {
          const fd = new FormData();
          fd.append('document_type', 'license');
          fd.append('file', documents.license);
          uploadPromises.push(customerAPI.uploadMyDocument(fd));
        }
        
        if (uploadPromises.length > 0) {
          await Promise.allSettled(uploadPromises);
        }
      }

      navigate(user.role === 'admin' || user.role === 'staff' ? '/admin' : '/');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(' '));
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#ffffff] text-gray-900 font-sans">
      {/* Top Navigation (Absolute) */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <Link to="/" className="text-xl font-bold text-[#2D6A4F] tracking-tight">
          Angkor Auto
        </Link>
        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 bg-white">
          <UserCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Left side - Image & Branding (Desktop) */}
      <div className="hidden md:flex w-[40%] text-white relative flex-col justify-center p-12 overflow-hidden bg-[#5a8071]">
        <div className="absolute inset-0 bg-[#3B6955] mix-blend-multiply opacity-90" />
        <img 
          src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
          alt="Luxury Car" 
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
        />
        
        <div className="relative z-10 pt-20">
          <h2 className="text-[22px] font-medium mb-4">Drive the Future of Mobility.</h2>
          <p className="text-white/90 text-[15px] leading-relaxed mb-12 max-w-md">
            Welcome to Angkor Auto, where precision meets the open road. Join our community of professionals and access a premium fleet of vehicles tailored for reliability and performance.
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2.5 rounded-lg flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wider uppercase mb-1">Security</h3>
                <p className="text-white/80 text-sm">Advanced data protection & identity verification.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-2.5 rounded-lg flex-shrink-0">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm tracking-wider uppercase mb-1">Efficiency</h3>
                <p className="text-white/80 text-sm">Instant booking for verified corporate accounts.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-[60%] flex flex-col pt-24 pb-12 px-6 sm:px-12 lg:px-24 overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto">
          <h1 className="text-xl font-medium text-gray-800 mb-2">Create Professional Account</h1>
          <p className="text-gray-600 text-[15px] mb-10">Complete the form below to begin your journey with FleetRent.</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            {/* Personal Information */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-[18px] h-[18px] text-[#3B6955]" />
                <h2 className="font-medium text-gray-800 text-[15px]">Personal Information</h2>
              </div>
              <div className="border-b border-gray-200 mb-6"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#3B6955] focus:border-[#3B6955] text-sm text-gray-900"
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#3B6955] focus:border-[#3B6955] text-sm text-gray-900"
                    placeholder="john@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Phone Number</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#3B6955] focus:border-[#3B6955] text-sm text-gray-900"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1.5">Password</label>
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-sm focus:outline-none focus:ring-1 focus:ring-[#3B6955] focus:border-[#3B6955] text-sm text-gray-500 tracking-widest"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Document Verification */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-[18px] h-[18px] text-[#3B6955]" />
                <h2 className="font-medium text-gray-800 text-[15px]">Document Verification</h2>
              </div>
              <div className="border-b border-gray-200 mb-6"></div>

              <div className="bg-[#F8F9FA] p-4 rounded-sm border border-gray-100 flex items-start gap-3 mb-6">
                <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-[14px] text-gray-600 leading-relaxed">
                  Please upload clear scans or photos of your identification documents. Accepted formats: JPG, PNG, PDF. Max file size: 5MB per file.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-[13px] text-gray-600 mb-2">National ID (Front)</label>
                  <input type="file" className="hidden" ref={nationalIdFrontRef} onChange={(e) => handleFileChange(e, 'nationalIdFront')} accept=".jpg,.jpeg,.png,.pdf" />
                  <div 
                    onClick={() => nationalIdFrontRef.current?.click()}
                    className={`border border-dashed rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${documents.nationalIdFront ? 'border-[#3B6955] bg-[#F0F7F4] text-[#3B6955]' : 'border-gray-300 text-gray-500 hover:bg-gray-50 bg-white'}`}
                  >
                    {documents.nationalIdFront ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mb-2 text-[#3B6955]" />
                        <span className="text-[13px] text-center px-2 truncate w-full">{documents.nationalIdFront.name}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-[13px]">Click or drag to upload</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] text-gray-600 mb-2">National ID (Back)</label>
                  <input type="file" className="hidden" ref={nationalIdBackRef} onChange={(e) => handleFileChange(e, 'nationalIdBack')} accept=".jpg,.jpeg,.png,.pdf" />
                  <div 
                    onClick={() => nationalIdBackRef.current?.click()}
                    className={`border border-dashed rounded-sm p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${documents.nationalIdBack ? 'border-[#3B6955] bg-[#F0F7F4] text-[#3B6955]' : 'border-gray-300 text-gray-500 hover:bg-gray-50 bg-white'}`}
                  >
                    {documents.nationalIdBack ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 mb-2 text-[#3B6955]" />
                        <span className="text-[13px] text-center px-2 truncate w-full">{documents.nationalIdBack.name}</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-[13px]">Click or drag to upload</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[13px] text-gray-600 mb-2">Driver's License (Full Side)</label>
                <input type="file" className="hidden" ref={licenseRef} onChange={(e) => handleFileChange(e, 'license')} accept=".jpg,.jpeg,.png,.pdf" />
                <div 
                  onClick={() => licenseRef.current?.click()}
                  className={`border border-dashed rounded-sm p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${documents.license ? 'border-[#3B6955] bg-[#F0F7F4] text-[#3B6955]' : 'border-gray-300 text-gray-500 hover:bg-gray-50 bg-white'}`}
                >
                  {documents.license ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 mb-2 text-[#3B6955]" />
                      <span className="text-[14px] text-gray-800 mb-1 font-medium">{documents.license.name}</span>
                      <span className="text-[11px] text-[#3B6955]">Ready for upload</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                      </svg>
                      <span className="text-[14px] text-gray-700 mb-1">Upload Driver's License</span>
                      <span className="text-[9px] font-medium tracking-[0.05em] text-gray-400 uppercase">Verification required for vehicle access</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Terms and Submit */}
            <div className="mb-8 pl-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  required
                  className="mt-1 w-3.5 h-3.5 text-[#3B6955] border-gray-300 rounded-sm focus:ring-[#3B6955]"
                />
                <span className="text-[13.5px] text-gray-600 leading-relaxed">
                  I agree to the <a href="#" className="text-gray-800 hover:underline">Terms of Service</a> and <a href="#" className="text-gray-800 hover:underline">Privacy Policy</a>, including FleetRent's data handling and vehicle usage policies.
                </span>
              </label>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#3B6955] text-white text-[15px] font-medium py-3 rounded-[3px] hover:bg-[#2d5242] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Create Account</span><ArrowRight className="w-4 h-4 ml-1" /></>}
            </button>

            <div className="mt-8 text-center text-[14px] text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-gray-800 hover:underline">
                Log in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
