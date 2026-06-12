import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { BaseUrl } from '../../components/objects/baseUrl';
import { useAuthStore } from '../../admin/store/authStore';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${BaseUrl}/admin-auth/login`, {
        email,
        password,
      }, {
        withCredentials: true
      });

      if (response.data.success) {
        setAuth(response.data.data.admin);
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-white font-sans text-slate-900">

      {/* Left Split Panel (Brand Graphic - Maroon Theme) */}
      <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden flex-col justify-between p-12 bg-gradient-to-br from-[#4a0000] via-[#800000] to-[#b31919] items-end text-right">
        {/* Organic curved wave lines pattern overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50,150 Q100,50 250,200 T550,150" fill="none" stroke="white" strokeWidth="2" />
            <path d="M-50,250 Q120,130 280,320 T550,250" fill="none" stroke="white" strokeWidth="2" />
            <path d="M-50,350 Q140,210 310,440 T550,350" fill="none" stroke="white" strokeWidth="2" />
            <path d="M-50,450 Q160,290 340,560 T550,450" fill="none" stroke="white" strokeWidth="2" />
            <path d="M-50,550 Q180,370 370,680 T550,550" fill="none" stroke="white" strokeWidth="2" />
          </svg>
        </div>

        {/* Top Section spacer for layout balance */}
        <div className="z-10 h-16" />

        {/* Middle Section - Brand Logo & Tagline */}
        <div className="z-10 flex flex-col items-end space-y-6">
          <img
            src="/logo/pup wayfinder logo 3.png"
            alt="PUP Wayfinder Logo"
            className="h-36 w-auto object-contain rounded-lg"
          />
          <h2
            className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight max-w-sm"
            style={{ fontFamily: '"Lucida Fax", Georgia, serif' }}
          >
            Digitizing your campus experience
          </h2>
        </div>

        {/* Bottom Section - Copyright Info */}
        <div className="z-10">
          <p className="text-white/60 text-xs font-semibold tracking-wide">
            &copy; {new Date().getFullYear()} Wayfinder. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Split Panel (Minimalist Sign-in Form - Forced White Background) */}
      <div className="lg:col-span-7 flex flex-col justify-between p-8 md:p-16 lg:p-24 bg-white text-slate-900 dark:bg-white dark:text-slate-900">

        {/* Top Logo / App Name */}
        <div className="text-2xl font-black tracking-wider uppercase text-[#800000]">
          Wayfinder
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto py-12 space-y-8">

          {/* Header */}
          <div className="space-y-2.5">
            <h2 className="text-4xl font-black text-slate-950 tracking-tight">Welcome Back!</h2>
            <p className="text-xs xl:text-sm text-slate-500 font-medium">
              Accidentally landed here?{" "}
              <Link to="/" className="text-[#800000] font-bold hover:underline cursor-pointer">
                Return to the homepage
              </Link>
              .
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-xs font-semibold text-center animate-slideDown">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-7">

            {/* Email Field */}
            <div className="relative border-b border-slate-200 focus-within:border-[#800000] transition-colors py-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm xl:text-base text-slate-900 outline-none placeholder-slate-400 py-1"
                placeholder="Email Address"
                required
              />
            </div>

            {/* Password Field */}
            <div className="relative border-b border-slate-200 focus-within:border-[#800000] transition-colors py-3">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm xl:text-base text-slate-900 outline-none placeholder-slate-400 py-1 pr-10"
                placeholder="Password"
                required
              />
              <button
                type="button"
                className="absolute right-0 bottom-4 text-slate-400 hover:text-slate-700 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            {/* Submit Button (Maroon styled) */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#800000] hover:bg-[#680000] text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99] disabled:pointer-events-none text-base xl:text-lg"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  'Login Now'
                )}
              </button>
            </div>
          </form>

          {/* Footer Utility Link */}
          <div className="text-center text-xs xl:text-sm text-slate-400 font-medium">
            Forgot password? <span className="font-semibold text-slate-700 hover:underline cursor-pointer">Click here</span>
          </div>
        </div>

        {/* Empty bottom element for layout balance */}
        <div className="hidden lg:block h-6" />
      </div>

    </div>
  );
}
