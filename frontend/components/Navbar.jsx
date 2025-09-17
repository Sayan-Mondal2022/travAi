'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with real auth state
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  // Show/hide Create Trip button based on scroll position
  useEffect(() => {
    const heroEl = document.querySelector('#hero');

    if (!heroEl) {
      // No hero → always show
      setShowCreateTrip(true);
      return;
    }

    const handleScroll = () => {
      const heroHeight = heroEl.clientHeight;
      const scrollY = window.scrollY;

      if (scrollY > heroHeight * 0.5) {
        setShowCreateTrip(true);
      } else {
        setShowCreateTrip(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Call once on mount to set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-indigo-900 to-indigo-950 shadow-md fixed top-0 w-full z-50 transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-indigo-400 hover:text-indigo-300 transition">
          TravAi
        </Link>

        {/* Right Side (Create Trip + Auth) */}
        <div className="flex items-center space-x-4">
          {/* Create Trip Button (appears on scroll or always if no hero) */}
          {showCreateTrip && (
            <Link
              href="/trip"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full shadow-lg transition"
            >
              Create Trip
            </Link>
          )}

          {/* Auth */}
          {isAuthenticated ? (
            <Link
              href="/account"
              className="text-gray-200 hover:text-indigo-400 font-medium transition"
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className="text-gray-200 hover:text-indigo-400 font-medium transition"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
