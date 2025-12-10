'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { user, signInWithGoogle, signInWithEmail, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Redirect if logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Success message and redirect handler
  const handleSuccessAndRedirect = () => {
    setShowSuccess(true);
    
    // Set flag for home page to show success toast
    sessionStorage.setItem('justLoggedIn', 'true');
    
    // Wait 1.5 seconds to show success message, then redirect
    setTimeout(() => {
      router.push('/');
    }, 1500);
  };

  // Google Sign In
  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);

    try {
      const result = await signInWithGoogle();
      if (result.success) {
        handleSuccessAndRedirect();
      } else {
        setError(result.error || 'Google sign-in failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  // Email Sign In
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signInWithEmail(email, password);
      if (result.success) {
        handleSuccessAndRedirect();
      } else {
        setError(result.error || 'Sign-in failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  // Initial Loading
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] flex items-center justify-center p-5">
        <div className="text-center text-white">
          <div className="animate-spin h-12 w-12 border-b-2 border-[#caf0f8] mx-auto"></div>
          <p className="mt-4 text-[#caf0f8]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] flex items-center justify-center p-5 overflow-hidden">
      {/* Animated Background Overlay */}
      <div className="absolute inset-0 opacity-100 animate-[gradientShift_8s_ease-in-out_infinite] pointer-events-none">
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(circle at 20% 80%, rgba(0, 180, 216, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(144, 224, 239, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(202, 240, 248, 0.1) 0%, transparent 50%)
          `
        }}></div>
      </div>

      {/* SUCCESS MESSAGE OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 bg-[#03045e]/80 flex items-center justify-center z-[9999] animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white p-10 rounded-3xl text-center shadow-2xl animate-[scaleIn_0.4s_ease-out] max-w-md">
            <div className="w-20 h-20 mx-auto mb-5">
              <svg 
                className="w-20 h-20 rounded-full stroke-[#00b4d8] stroke-2 animate-[fill_0.4s_ease-in-out_0.4s_forwards,scale_0.3s_ease-in-out_0.9s_both]" 
                viewBox="0 0 52 52"
                style={{ strokeMiterlimit: 10, boxShadow: 'inset 0px 0px 0px #00b4d8' }}
              >
                <circle 
                  className="animate-[stroke_0.6s_cubic-bezier(0.65,0,0.45,1)_forwards]" 
                  cx="26" 
                  cy="26" 
                  r="25" 
                  fill="none"
                  style={{
                    strokeDasharray: 166,
                    strokeDashoffset: 166,
                    stroke: '#00b4d8'
                  }}
                />
                <path 
                  className="animate-[stroke_0.3s_cubic-bezier(0.65,0,0.45,1)_0.8s_forwards]" 
                  fill="none" 
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  style={{
                    strokeDasharray: 48,
                    strokeDashoffset: 48,
                    stroke: '#00b4d8',
                    transformOrigin: '50% 50%'
                  }}
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#03045e] mb-2">Login Successful!</h2>
            <p className="text-base text-[#0077b6]">Redirecting you to dashboard...</p>
          </div>
        </div>
      )}

      {/* MAIN LOGIN CONTAINER */}
      <div className="flex w-full max-w-6xl h-auto bg-gradient-to-br from-[#e6f7ff] to-[#f0f9ff] rounded-[30px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/60 relative z-10 animate-[fadeIn_420ms_cubic-bezier(0.2,0.9,0.2,1)_forwards]">
        
        {/* LEFT PANEL */}
        <div className="flex-1 p-6 px-8 flex flex-col justify-center bg-gradient-to-b from-white/95 to-[#f8fcff] backdrop-blur-sm border-r border-white/50 relative overflow-y-auto scrollbar-hide animate-[slideUp_700ms_cubic-bezier(0.2,0.9,0.2,1)_forwards]">
          {/* Background Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#caf0f8]/20 via-white/40 to-white/60 -z-10 rounded-l-[30px]"></div>

          {/* Logo with Home Link - CENTERED */}
          <div className="text-center mb-6">
            <Link href="/" className="inline-block transition-all duration-300 hover:scale-105 active:scale-95">
              <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] bg-clip-text drop-shadow-[0_2px_8px_rgba(3,4,94,0.3)]">
                TravAI
              </h1>
            </Link>
          </div>

          <h2 className="text-[24px] font-bold text-transparent bg-gradient-to-r from-[#03045e] to-[#0077b6] bg-clip-text drop-shadow-[0_2px_6px_rgba(3,4,94,0.2)] text-center mb-8">
            Welcome Back
          </h2>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-[#e74c3c] text-[#c0392b] px-4 py-3.5 rounded-xl mb-3 text-sm font-semibold shadow-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* EMAIL LOGIN FORM */}
          <form className="flex flex-col gap-5" onSubmit={handleEmailSignIn}>
            {/* Email Input */}
            <div className="flex flex-col transition-all duration-300 hover:scale-[1.01]">
              <label className="text-[#16213e] font-semibold mb-1.5 text-sm transition-all duration-300">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="px-4 py-3.5 rounded-2xl border-[1.5px] border-white/40 bg-white/70 outline-none text-[15px] text-[#16213e] transition-all duration-[220ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] backdrop-blur-sm focus:bg-white/95 focus:border-[#00b4d8] focus:shadow-[0_6px_20px_rgba(0,180,216,0.15),inset_0_2px_6px_rgba(0,0,0,0.05)] focus:-translate-y-0.5 disabled:opacity-50 hover:border-[#00b4d8]/50 hover:bg-white/85 hover:shadow-[0_4px_15px_rgba(0,180,216,0.1)]"
              />
            </div>

            {/* Password Input */}
            <div className="flex flex-col transition-all duration-300 hover:scale-[1.01]">
              <label className="text-[#16213e] font-semibold mb-1.5 text-sm transition-all duration-300">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="px-4 py-3.5 rounded-2xl border-[1.5px] border-white/40 bg-white/70 outline-none text-[15px] text-[#16213e] transition-all duration-[220ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] backdrop-blur-sm focus:bg-white/95 focus:border-[#00b4d8] focus:shadow-[0_6px_20px_rgba(0,180,216,0.15),inset_0_2px_6px_rgba(0,0,0,0.05)] focus:-translate-y-0.5 disabled:opacity-50 hover:border-[#00b4d8]/50 hover:bg-white/85 hover:shadow-[0_4px_15px_rgba(0,180,216,0.1)]"
              />
            </div>

            {/* Sign In Button */}
            <button 
              type="submit" 
              className="mt-2 px-4 py-4 bg-gradient-to-br from-[#00b4d8] to-[#00e5ff] border-none text-white rounded-2xl text-base font-semibold cursor-pointer transition-all duration-[220ms] ease-[cubic-bezier(0.2,0.9,0.2,1)] shadow-[0_8px_24px_rgba(0,180,216,0.3)] hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(0,180,216,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              disabled={isLoading}
            >
              <span className="transition-all duration-300 group-hover:tracking-wide">
                {isLoading ? 'Signing in...' : 'Sign In'}
              </span>
            </button>

            {/* OR DIVIDER */}
            <div className="flex items-center justify-center my-4 mb-2">
              <div className="h-px w-[30%] bg-gradient-to-r from-transparent to-[#90e0ef]"></div>
              <span className="mx-4 text-sm text-[#0077b6] font-semibold opacity-80">OR</span>
              <div className="h-px w-[30%] bg-gradient-to-l from-transparent to-[#90e0ef]"></div>
            </div>

            {/* GOOGLE LOGIN BUTTON */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border-[1.5px] border-[#dcdcdc] text-[15px] font-semibold text-[#444] flex items-center justify-center gap-2.5 cursor-pointer transition-all duration-300 hover:bg-[#f8f8f8] hover:border-[#4285f4]/30 hover:shadow-[0_6px_20px_rgba(66,133,244,0.15)] hover:-translate-y-0.5 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <img
                src="/images/google-icon.png"
                className="w-5 h-5 transition-all duration-300 group-hover:scale-110"
                alt="Google"
              />
              <span className="transition-all duration-300 group-hover:text-[#4285f4] group-hover:tracking-wide">
                Continue with Google
              </span>
            </button>

            {/* SIGNUP BUTTON */}
            <Link 
              href="/register" 
              className="mt-1.5 px-4 py-3.5 border-2 border-[#00b4d8] text-[#00b4d8] rounded-2xl font-semibold text-center no-underline transition-all duration-300 hover:bg-[#00b4d8] hover:text-white hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,180,216,0.3)] hover:scale-[1.01] active:scale-[0.99] group">
              Create an Account
            </Link>

            {/* Forgot Password */}
            <div className="text-center mt-4">
              <Link 
                href="/forgot-password" 
                className="text-[#0077b6] text-sm font-medium hover:text-[#03045e] transition-all duration-300 hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div className="relative flex-[1.3] rounded-r-[30px] overflow-hidden animate-[slideRight_700ms_cubic-bezier(0.2,0.9,0.2,1)_forwards] hidden md:block">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 overflow-hidden z-[1]">
            <img
              src="/images/login-bg.jpg"
              alt="Travel Adventure"
              className="w-full h-full object-cover"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#03045e]/70 via-[#0077b6]/50 to-transparent"></div>
          </div>

          {/* Main Caption */}
          <div className="absolute bottom-10 left-10 right-10 text-white z-[5] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            <h2 className="text-[28px] font-extrabold mb-4 leading-tight">
              Discover Your Next<br />Great Adventure
            </h2>
            <p className="text-[#caf0f8] font-medium text-lg opacity-90 max-w-md">
              Let AI craft your perfect journey. Personalized travel plans in seconds.
            </p>
          </div>
        </div>
      </div>

      {/* Custom Animations via Style Tag */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px) scale(0.998); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(26px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%, 100% 50%, 50% 50%; }
          50% { background-position: 100% 50%, 0% 50%, 80% 80%; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        @keyframes stroke {
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes scale {
          0%, 100% { transform: none; }
          50% { transform: scale3d(1.1, 1.1, 1); }
        }
        
        @keyframes fill {
          100% { box-shadow: inset 0px 0px 0px 30px #00b4d8; }
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}