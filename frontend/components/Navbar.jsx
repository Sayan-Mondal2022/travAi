'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext.js';

export default function Navbar() {
  const { user, logOut } = useAuth(); // Correct logout function
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const heroEl = document.querySelector('#hero');

    if (!heroEl) {
      setShowCreateTrip(true);
      return;
    }

    const handleScroll = () => {
      const heroHeight = heroEl.clientHeight;
      const scrollY = window.scrollY;

      setShowCreateTrip(scrollY > heroHeight * 0.5);
      setScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 shadow-md ${
        scrolled ? 'bg-white' : 'bg-gradient-to-r'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          href="/"
          className={`text-2xl font-bold transition ${
            scrolled ? 'text-indigo-600' : 'text-white'
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

          {/* Login Button (only if user is not logged in) */}
          {!user && (
            <Link
              href="/login"
              className={`font-medium transition ${
                scrolled ? 'text-gray-800 hover:text-indigo-600' : 'text-white hover:text-indigo-300'
              }`}
            >
              Login
            </Link>
          )}

          {/* User Profile (if logged in) */}
          {user && (
            <div className="relative">
              <img
                src={user.photoURL || "/default-avatar.png"}  // Fallback image
                alt="User"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full cursor-pointer border"
                onClick={() => setMenuOpen(!menuOpen)}
              />

              {/* Dropdown */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md p-3">
                  <p className="text-gray-700 text-sm mb-2">{user.displayName}</p>

                  <button
                    onClick={logOut}
                    className="w-full bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
