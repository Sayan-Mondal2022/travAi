'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react'; // Available in your package.json

export default function Navbar() {
  const { user, logOut } = useAuth();
  const [showCreateTrip, setShowCreateTrip] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const heroEl = document.querySelector('#hero');
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = heroEl?.clientHeight || 500;
      setShowCreateTrip(scrollY > heroHeight * 0.5);
      setScrolled(scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClasses = `text-sm font-semibold transition-colors duration-300 ${
    scrolled ? 'text-gray-700 hover:text-indigo-600' : 'text-white hover:text-indigo-200'
  }`;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm' : 'bg-transparent py-6'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center relative">
        
        {/* Left: Logo */}
        <Link href="/" className={`text-2xl font-black tracking-tighter transition-colors ${
          scrolled ? 'text-indigo-600' : 'text-white'
        }`}>
          TravAi
        </Link>

        {/* Center: Navigation Links (Hidden on Mobile) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-10">
          <AnimatePresence>
            {showCreateTrip && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Link href="/" className={navLinkClasses}>Home</Link>
              </motion.div>
            )}
          </AnimatePresence>
          <Link href="/about" className={navLinkClasses}>About Us</Link>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center space-x-4">
          {/* Create Trip Button */}
          <AnimatePresence>
            {showCreateTrip && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <Link
                  href="/trip"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg transition-transform active:scale-95 hidden sm:block"
                >
                  Create Trip
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          {/* User Auth Section */}
          {!user ? (
            <Link href="/login" className={navLinkClasses}>Login</Link>
          ) : (
            <div className="relative">
              <img
                src={user.photoURL || "/default-avatar.png"}
                className="w-9 h-9 rounded-full cursor-pointer border-2 border-indigo-400 hover:scale-105 transition-transform"
                onClick={() => setMenuOpen(!menuOpen)}
              />
              {menuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-2xl p-2 border border-gray-100"
                >
                  <button onClick={logOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium rounded-lg">
                    Logout
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* Mobile Menu Toggle */}
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
          >
            <div className="flex flex-col p-6 space-y-4">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium">Home</Link>
              <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-800 font-medium">About Us</Link>
              <Link href="/trip" onClick={() => setIsMobileMenuOpen(false)} className="bg-indigo-600 text-white p-3 rounded-xl text-center font-bold">Create Trip</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}