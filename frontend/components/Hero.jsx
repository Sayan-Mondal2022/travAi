'use client'
import Link from 'next/link'

export default function Hero() {
  return (
    <section
      id="hero"
      className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-black to-indigo-950 px-6 py-24 text-center text-white sm:px-12 lg:px-20"
    >
      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="absolute -top-40 left-1/2 -z-10 h-[36rem] w-[72rem] -translate-x-1/2 rotate-45 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-3xl"
      />

      <div className="mx-auto max-w-3xl">
        {/* Small badge */}
        <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm text-indigo-300 ring-1 ring-white/20 backdrop-blur-sm">
          ✨ Plan smarter, travel better
        </div>

        {/* Main heading */}
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
          Navigate, Plan & Explore Effortlessly
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg leading-8 text-gray-300 sm:text-xl">
          TravAi helps you create smarter itineraries, discover the best routes, and make every trip seamless — all in one place.
        </p>

        {/* Buttons */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/trip"
            className="rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-md hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
          >
            🚀 Start Planning
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-gray-500/40 px-6 py-3 text-base font-semibold text-gray-200 hover:bg-white/10 transition"
          >
            Learn More →
          </Link>
        </div>
      </div>
    </section>
  )
}
