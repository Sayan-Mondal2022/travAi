'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Replace with real auth state
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

      // show create trip button
      if (scrollY > heroHeight * 0.5) {
        setShowCreateTrip(true);
      } else {
        setShowCreateTrip(false);
      }

      // navbar background change
      if (scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // run on mount
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 shadow-md ${
        scrolled
          ? "bg-white"
          : "bg-gradient-to-r"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link
          href="/"
          className={`text-2xl font-bold transition ${
            scrolled ? "text-indigo-600" : "text-white"
          }`}
        >
          TravAi
        </Link>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Create Trip Button */}
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
              className={`font-medium transition ${
                scrolled ? "text-gray-800 hover:text-indigo-600" : "text-white hover:text-indigo-300"
              }`}
            >
              Account
            </Link>
          ) : (
            <Link
              href="/login"
              className={`font-medium transition ${
                scrolled ? "text-gray-800 hover:text-indigo-600" : "text-white hover:text-indigo-300"
              }`}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
