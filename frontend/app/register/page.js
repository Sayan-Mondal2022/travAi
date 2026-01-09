"use client";

import { useState } from "react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.displayName || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    // Simulate success
    setTimeout(() => {
      setShowSuccess(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccess(false);
      }, 2000);
    }, 1000);
  };

  const handleGoogleSignIn = () => {
    setError("");
    setIsLoading(true);

    setTimeout(() => {
      setShowSuccess(true);
      setTimeout(() => {
        setIsLoading(false);
        setShowSuccess(false);
      }, 2000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] flex items-center justify-center p-4 lg:p-8 overflow-auto">
      {/* Animated Background Overlay */}
      <div className="absolute inset-0 opacity-100 animate-[gradientShift_8s_ease-in-out_infinite] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `
            radial-gradient(circle at 20% 80%, rgba(0, 180, 216, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(144, 224, 239, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(202, 240, 248, 0.1) 0%, transparent 50%)
          `,
          }}
        ></div>
      </div>

      {/* SUCCESS MESSAGE OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 bg-[#03045e]/80 flex items-center justify-center z-[9999] animate-[fadeIn_0.3s_ease-out]">
          <div className="bg-white p-10 rounded-3xl text-center shadow-2xl animate-[scaleIn_0.4s_ease-out] max-w-md mx-4">
            <div className="w-20 h-20 mx-auto mb-5">
              <svg
                className="w-20 h-20 rounded-full stroke-[#00b4d8] stroke-2"
                viewBox="0 0 52 52"
                style={{ strokeMiterlimit: 10 }}
              >
                <circle
                  cx="26"
                  cy="26"
                  r="25"
                  fill="none"
                  stroke="#00b4d8"
                  strokeWidth="2"
                />
                <path
                  fill="none"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                  stroke="#00b4d8"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-[#03045e] mb-2">
              Account Created!
            </h2>
            <p className="text-base text-[#0077b6]">
              Redirecting you to dashboard...
            </p>
          </div>
        </div>
      )}

      {/* MAIN REGISTER CONTAINER */}
      <div className="flex flex-col md:flex-row w-full max-w-6xl h-auto md:h-[700px] bg-gradient-to-br from-[#e6f7ff] to-[#f0f9ff] rounded-[30px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-white/60 relative z-10 animate-[fadeIn_420ms_cubic-bezier(0.2,0.9,0.2,1)_forwards]">
        {/* LEFT PANEL - IMAGE */}
        <div className="relative flex-[1.2] rounded-l-[30px] overflow-hidden animate-[slideLeft_700ms_cubic-bezier(0.2,0.9,0.2,1)_forwards] hidden md:block">
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

          {/* Decorative Elements */}
          <div className="absolute inset-0 z-[2]">
            <div className="absolute top-20 left-12 w-32 h-32 rounded-full bg-white/10 blur-2xl animate-pulse"></div>
            <div
              className="absolute bottom-32 right-16 w-40 h-40 rounded-full bg-[#caf0f8]/20 blur-3xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          {/* Main Caption */}
          <div className="absolute bottom-12 left-12 right-12 text-white z-[5] drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            <h2 className="text-[32px] font-extrabold mb-4 leading-tight">
              Start Your Journey
              <br />
              With TravAI
            </h2>
            <p className="text-[#caf0f8] font-medium text-lg opacity-90 max-w-md">
              Join thousands of travelers who trust AI to plan their perfect
              adventures.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL - FORM */}
        <div className="flex-1 p-4 md:p-5 lg:p-6 flex flex-col justify-center bg-gradient-to-b from-white/95 to-[#f8fcff] backdrop-blur-sm relative overflow-y-auto scrollbar-hide animate-[slideRight_700ms_cubic-bezier(0.2,0.9,0.2,1)_forwards] margin-top: 25px;">
          {/* Background Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-bl from-[#caf0f8]/20 via-white/40 to-white/60 -z-10 rounded-r-[30px]"></div>

          {/* HEADER SECTION */}
          <div className="text-center mb-5">
            <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-[#03045e] via-[#0077b6] to-[#00b4d8] bg-clip-text drop-shadow-[0_2px_8px_rgba(3,4,94,0.3)]">
              TravAI
            </h1>

            <h2 className="mt-2 text-[24px] font-bold text-transparent bg-gradient-to-r from-[#03045e] to-[#0077b6] bg-clip-text">
              Create Your Account
            </h2>

            <p className="mt-1 text-[#0077b6] text-sm">
              Join TravAI to start planning amazing trips
            </p>
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-[#e74c3c] text-[#c0392b] px-4 py-3.5 rounded-xl mb-4 text-sm font-semibold shadow-md">
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* REGISTRATION FORM */}
          <div className="flex flex-col gap-4">
            {/* Full Name Input */}
            <div className="flex flex-col">
              <label className="text-[#03045e] font-semibold mb-2 text-sm">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="displayName"
                  placeholder="John Doe"
                  value={formData.displayName}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 pl-11 py-3 rounded-2xl border-2 border-white bg-white/80 outline-none text-[15px] text-[#03045e] transition-all duration-300 ease-out backdrop-blur-sm focus:bg-white focus:border-[#00b4d8] focus:shadow-[0_4px_12px_rgba(0,180,216,0.15)] disabled:opacity-50"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#0077b6]">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email Input */}
            <div className="flex flex-col">
              <label className="text-[#03045e] font-semibold mb-2 text-sm">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 pl-11 py-3 rounded-2xl border-2 border-white bg-white/80 outline-none text-[15px] text-[#03045e] transition-all duration-300 ease-out backdrop-blur-sm focus:bg-white focus:border-[#00b4d8] focus:shadow-[0_4px_12px_rgba(0,180,216,0.15)] disabled:opacity-50"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#0077b6]">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col">
              <label className="text-[#03045e] font-semibold mb-2 text-sm">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 pl-11 py-3 rounded-2xl border-2 border-white bg-white/80 outline-none text-[15px] text-[#03045e] transition-all duration-300 ease-out backdrop-blur-sm focus:bg-white focus:border-[#00b4d8] focus:shadow-[0_4px_12px_rgba(0,180,216,0.15)] disabled:opacity-50"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#0077b6]">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="flex flex-col">
              <label className="text-[#03045e] font-semibold mb-2 text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 pl-11 py-3 rounded-2xl border-2 border-white bg-white/80 outline-none text-[15px] text-[#03045e] transition-all duration-300 ease-out backdrop-blur-sm focus:bg-white focus:border-[#00b4d8] focus:shadow-[0_4px_12px_rgba(0,180,216,0.15)] disabled:opacity-50"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#0077b6]">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Create Account Button */}
            <button
              onClick={handleSubmit}
              className="mt-2 px-4 py-3 bg-gradient-to-br from-[#0077b6] via-[#00b4d8] to-[#90e0ef] border-none text-white rounded-2xl text-base font-bold cursor-pointer transition-all duration-300 shadow-[0_8px_20px_rgba(0,119,182,0.3)] hover:shadow-[0_12px_28px_rgba(0,180,216,0.4)] hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            {/* OR DIVIDER */}
            <div className="flex items-center justify-center">
              <div className="h-px w-[30%] bg-gradient-to-r from-transparent to-[#90e0ef]"></div>
              <span className="mx-4 text-sm text-[#0077b6] font-semibold opacity-80">
                OR
              </span>
              <div className="h-px w-[30%] bg-gradient-to-l from-transparent to-[#90e0ef]"></div>
            </div>

            {/* GOOGLE SIGN UP BUTTON */}
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
            {/* SIGN IN LINK */}
            <div className="text-center mt-2">
              <p className="text-sm text-[#0077b6]">
                Already have an account?{" "}
                <span className="font-semibold text-[#0077b6] hover:text-[#03045e] transition-all duration-300 hover:underline cursor-pointer">
                  Sign in here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.998);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(-40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes gradientShift {
          0%,
          100% {
            background-position: 0% 50%, 100% 50%, 50% 50%;
          }
          50% {
            background-position: 100% 50%, 0% 50%, 80% 80%;
          }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
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
