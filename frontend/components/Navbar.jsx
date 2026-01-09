'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const { user, logOut } = useAuth();

  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /* ------------------ Scroll Handling ------------------ */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /* ------------------ Greeting ------------------ */
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  /* ------------------ Nav Link Style ------------------ */
  const navLinkClasses = `
    relative text-sm font-semibold px-4 py-2 rounded-full
    transition-all duration-300
    ${
      scrolled
        ? 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50'
        : 'text-white hover:text-white hover:bg-white/20'
    }
  `;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm'
          : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">

        {/* ------------------ Logo ------------------ */}
        <Link
          href="/"
          className={`text-2xl font-black tracking-tighter transition-colors ${
            scrolled ? 'text-indigo-600' : 'text-white'
          }`}
        >
          TravAI
        </Link>

        {/* ------------------ CENTER LINKS (FIXED) ------------------ */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-4">
          <Link href="/" className={navLinkClasses}>Home</Link>
          <Link href="/about" className={navLinkClasses}>About Us</Link>
        </div>

        {/* ------------------ RIGHT SECTION ------------------ */}
        <div className="flex items-center space-x-4">

          {/* ------------------ AUTH SECTION ------------------ */}
          {!user ? (
            <Link href="/login" className={navLinkClasses}>
              Login
            </Link>
          ) : (
            <div className="relative">

              {/* Profile Trigger */}
              <div
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="hidden sm:flex flex-col text-right leading-tight">
                  <span
                    className={`text-xs font-medium ${
                      scrolled ? 'text-gray-500' : 'text-indigo-100'
                    }`}
                  >
                    {getGreeting()},
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      scrolled ? 'text-gray-900' : 'text-white'
                    }`}
                  >
                    {user.displayName || 'Traveler'}
                  </span>
                </div>

                <img
                  src={user.photoURL || '/default-avatar.png'}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-indigo-400 group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Dropdown */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                  >
                    <Link
                      href="/profile"
                      className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                      👤 Edit Profile
                    </Link>

                    <Link
                      href="/trips"
                      className="block px-5 py-3 text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                    >
                      🧭 Past Trips
                    </Link>

                    <div className="border-t border-gray-100" />

                    <button
                      onClick={logOut}
                      className="w-full text-left px-5 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition"
                    >
                      🚪 Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ------------------ MOBILE MENU TOGGLE ------------------ */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={scrolled ? 'text-gray-900' : 'text-white'} />
            ) : (
              <Menu className={scrolled ? 'text-gray-900' : 'text-white'} />
            )}
          </button>
        </div>
      </div>

      {/* ------------------ MOBILE MENU ------------------ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>About Us</Link>
              <Link
                href="/trip"
                onClick={() => setIsMobileMenuOpen(false)}
                className="bg-indigo-600 text-white p-3 rounded-xl text-center font-bold"
              >
                Create Trip
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
