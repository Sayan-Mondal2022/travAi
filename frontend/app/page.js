"use client"

import React from "react";
import { motion } from "framer-motion";

// Single-file Next.js (App Router) page component
// Place this file as `app/page.jsx` (or adapt for pages/ by renaming to index.jsx)
// Requires: Tailwind CSS configured in the project. Framer Motion is optional.

export default function TravelLanding() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Nav />
      <main className="max-w-7xl mx-auto px-6 md:px-8">
        <Hero />
        <FeaturedSearch />
        <CardGrid />
      </main>
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="py-6">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold">T</div>
          <span className="font-semibold text-lg">Travelo</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm text-gray-700">
          <a href="#" className="hover:text-gray-900">Explore</a>
          <a href="#" className="hover:text-gray-900">Experiences</a>
          <a href="#" className="hover:text-gray-900">Blog</a>
          <a href="#" className="hover:text-gray-900">Contact</a>
        </nav>

        <div className="flex items-center gap-3">
          <button className="hidden md:inline-block px-4 py-2 rounded-lg border text-sm">Log in</button>
          <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm">Get started</button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          Discover your next <span className="text-indigo-600">adventure</span>
        </h1>
        <p className="text-gray-600 max-w-xl">
          Handpicked trips, inspiring stories, and travel tools to plan your perfect getaway. Find secret beaches,
          charming towns and unforgettable experiences.
        </p>

        <div className="flex gap-3">
          <input
            aria-label="search"
            className="flex-1 rounded-lg border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            placeholder="Search destinations, e.g. Bali, Paris..."
          />
          <button className="rounded-lg px-5 py-3 bg-indigo-600 text-white font-semibold">Search</button>
        </div>

        <div className="flex gap-4 text-sm text-gray-600 mt-2">
          <div className="rounded-md bg-white px-3 py-2 shadow">Family trips</div>
          <div className="rounded-md bg-white px-3 py-2 shadow">Adventure</div>
          <div className="rounded-md bg-white px-3 py-2 shadow">Budget</div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-xl overflow-hidden shadow-xl h-72 md:h-96"
      >
        {/* Replace the src below with your preferred hero image (public folder or external) */}
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80"
          alt="beach"
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-4 left-4 bg-white/70 backdrop-blur-sm rounded-md px-4 py-2">
          <div className="text-sm font-semibold">Maldives</div>
          <div className="text-xs text-gray-700">From $299 · 5 days</div>
        </div>
      </motion.div>
    </section>
  );
}

function FeaturedSearch() {
  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold mb-4">Featured Experiences</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Island Hopping", subtitle: "7 trips", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=60" },
          { title: "Mountain Treks", subtitle: "12 trips", img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=60" },
          { title: "City Breaks", subtitle: "30 trips", img: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=60" },
          { title: "Culinary Tours", subtitle: "8 trips", img: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=60" },
        ].map((f) => (
          <div key={f.title} className="rounded-lg overflow-hidden shadow-md bg-white">
            <img src={f.img} alt={f.title} className="w-full h-36 object-cover" />
            <div className="p-4">
              <div className="font-semibold">{f.title}</div>
              <div className="text-sm text-gray-500">{f.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CardGrid() {
  const cards = new Array(6).fill(0).map((_, i) => ({
    title: [`Santorini`, `Bali Escape`, `Swiss Alps`, `Kyoto`][i % 4],
    desc: `A carefully curated trip with local guides and unique stays.`,
    price: [`$499`, `$349`, `$799`, `$599`][i % 4],
    img: `https://images.unsplash.com/photo-1${i}00?auto=format&fit=crop&w=900&q=60`,
  }));

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Popular trips</h3>
        <a href="#" className="text-sm text-indigo-600">See all</a>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((c, idx) => (
          <motion.article
            key={idx}
            whileHover={{ translateY: -6 }}
            className="rounded-2xl overflow-hidden bg-white shadow"
          >
            <div className="h-44 bg-gray-200 flex items-end">
              <img
                src={`https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=60&ixid=${idx}`}
                alt={c.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{c.title}</div>
                <div className="text-indigo-600 font-semibold">{c.price}</div>
              </div>
              <p className="text-sm text-gray-500 mt-2">{c.desc}</p>
              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-gray-600">4.8 ⭐ (128)</div>
                <button className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs">Book</button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t pt-8 pb-12 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between gap-6">
        <div>
          <div className="font-semibold">Travelo</div>
          <p className="text-sm text-gray-500 mt-2">Inspiring journeys and handpicked experiences around the world.</p>
        </div>

        <div className="flex gap-8">
          <div>
            <div className="font-semibold">Company</div>
            <ul className="mt-2 text-sm text-gray-600">
              <li>About</li>
              <li>Careers</li>
              <li>Press</li>
            </ul>
          </div>

          <div>
            <div className="font-semibold">Support</div>
            <ul className="mt-2 text-sm text-gray-600">
              <li>Help center</li>
              <li>Terms</li>
              <li>Privacy</li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
