'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, updateUserProfile, logOut } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
    }
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccess('');

    try {
      await updateUserProfile({ displayName });
      setSuccess('Username updated successfully');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Please login to view this page.
      </div>
    );
  }

  return (
    <>
      {/* Navbar (Login / Greeting hidden via page design) */}
      <Navbar />

      <div className="min-h-screen pt-28 bg-gradient-to-br from-[#03045e] via-[#0077b6] to-[#00b4d8] flex justify-center px-6">
        <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">

          {/* LEFT SIDEBAR */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 h-fit"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              Account
            </h2>

            <div className="space-y-3">
              <Link
                href="/trips"
                className="block px-4 py-3 rounded-xl font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
              >
                🧭 Past Trips
              </Link>

              <button
                onClick={logOut}
                className="w-full text-left px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition"
              >
                🚪 Logout
              </button>
            </div>
          </motion.div>

          {/* MAIN CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-2xl p-8"
          >
            {/* Greeting */}
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                {getGreeting()}, {user.displayName || 'Traveler'} 👋
              </h1>
              <p className="text-gray-500 text-sm">
                Manage your profile details
              </p>
            </div>

            {/* Success */}
            {success && (
              <div className="mb-4 text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-100 text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition disabled:opacity-60"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}
