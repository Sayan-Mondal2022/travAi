'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import './login.css';

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
      <div className="login-wrapper">
        <div className="text-center" style={{ color: 'white' }}>
          <div className="animate-spin h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrapper">
      {/* SUCCESS MESSAGE OVERLAY */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-card">
            <div className="success-checkmark">
              <svg 
                className="checkmark-icon" 
                viewBox="0 0 52 52"
              >
                <circle 
                  className="checkmark-circle" 
                  cx="26" 
                  cy="26" 
                  r="25" 
                  fill="none"
                />
                <path 
                  className="checkmark-check" 
                  fill="none" 
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>
            <h2 className="success-title">Login Successful!</h2>
            <p className="success-message">Redirecting you to dashboard...</p>
          </div>
        </div>
      )}

      <div className="login-container fade-in">

        {/* LEFT PANEL */}
        <div className="left-panel slide-up">

          <h1 className="logo center-logo">TravAI</h1>
          <p className="tagline center-tagline">Plan your journeys smarter</p>

          <h2 className="title center-title">Sign In</h2>

          {/* ERROR */}
          {error && (
            <div
              style={{
                background: '#ffe5e5',
                color: '#e74c3c',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '10px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              {error}
            </div>
          )}

          {/* EMAIL LOGIN FORM */}
          <form className="login-form" onSubmit={handleEmailSignIn}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="input-group password-wrapper">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            {/* DIVIDER */}
            <div className="or-container">
              <div className="or-line"></div>
              <span className="or-text">OR</span>
              <div className="or-line"></div>
            </div>

            {/* GOOGLE LOGIN BUTTON */}
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
              className="google-btn"
            >
              <img
                src="/images/google-icon.png"
                className="google-icon"
                alt="Google"
              />
              Continue with Google
            </button>

            {/* SIGNUP */}
            <a href="/register" className="signup-btn">
              Create an Account
            </a>
          </form>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel slide-right">
          <div className="image-area bg-parallax">
            <img
              src="/images/login-bg.jpg"
              alt="Background"
              className="bg-image"
            />
          </div>

          <div className="bottom-caption">
            <h2>Explore your next adventure</h2>
            <button className="cta-btn">Start Planning</button>
          </div>
        </div>

      </div>

      {/* SUCCESS ANIMATION STYLES */}
      <style jsx>{`
        .success-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          animation: fadeIn 0.3s ease-out;
        }

        .success-card {
          background: white;
          padding: 40px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: scaleIn 0.4s ease-out;
          max-width: 400px;
        }

        .success-checkmark {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
        }

        .checkmark-icon {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: block;
          stroke-width: 2;
          stroke: #10b981;
          stroke-miterlimit: 10;
          box-shadow: inset 0px 0px 0px #10b981;
          animation: fill 0.4s ease-in-out 0.4s forwards, scale 0.3s ease-in-out 0.9s both;
        }

        .checkmark-circle {
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
          stroke-width: 2;
          stroke-miterlimit: 10;
          stroke: #10b981;
          fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .checkmark-check {
          transform-origin: 50% 50%;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
          stroke: #10b981;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }

        .success-title {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 10px;
        }

        .success-message {
          font-size: 16px;
          color: #6b7280;
          margin: 0;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        @keyframes scale {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: scale3d(1.1, 1.1, 1);
          }
        }

        @keyframes fill {
          100% {
            box-shadow: inset 0px 0px 0px 30px #10b981;
          }
        }
      `}</style>
    </div>
  );
}