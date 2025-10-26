// app/trip/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, Plane, Navigation } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function DestinationStep() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    from_location: "",
    to_location: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate both fields are filled
    if (!formData.from_location.trim() || !formData.to_location.trim()) {
      alert("Please fill in both locations");
      return;
    }

    // Save to localStorage
    localStorage.setItem("tripData", JSON.stringify(formData));
    router.push("/trip/details");
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const popularDestinations = [
    { name: "Goa", emoji: "🏖️" },
    { name: "Manali", emoji: "🏔️" },
    { name: "Shimla", emoji: "⛰️" },
    { name: "Darjeeling", emoji: "🍵" },
    { name: "Rishikesh", emoji: "🕉️" },
    { name: "Jaipur", emoji: "🕌" },
    { name: "Kerala", emoji: "🛶" },
    { name: "Ladakh", emoji: "🏜️" }
  ];

  return (
    <>
      {/* <Navbar /> */}
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center justify-center p-4 transition-all duration-500">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-xl transform transition-all duration-500 hover:shadow-2xl">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-all duration-500 hover:scale-110 hover:rotate-3">
              <Plane className="w-10 h-10 text-white transform -rotate-45" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 transform transition-all duration-300">
              Discover Your Next Adventure
            </h1>
            <p className="text-gray-600 text-lg transition-all duration-300">
              Where would you like to explore today?
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* From Location */}
            <div className="group">
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200 transition-all duration-500 group-hover:border-blue-300 group-hover:shadow-lg group-hover:scale-[1.02]">
                <label className="block text-sm font-semibold text-gray-700 mb-3 transition-all duration-300">
                  <Navigation className="w-5 h-5 inline mr-2 text-blue-500 transition-transform duration-300 group-hover:scale-110" />
                  Starting from
                </label>
                <input
                  type="text"
                  name="from_location"
                  value={formData.from_location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-lg border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-blue-300"
                  placeholder="📍 Current city or airport"
                />
              </div>
            </div>

            {/* Animated Arrow separator */}
            <div className="flex justify-center transform transition-all duration-500 hover:scale-110">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <ArrowRight className="w-6 h-6 text-white transform transition-all duration-300 hover:rotate-90" />
              </div>
            </div>

            {/* To Location */}
            <div className="group">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200 transition-all duration-500 group-hover:border-purple-400 group-hover:shadow-xl group-hover:scale-[1.02]">
                <label className="block text-sm font-semibold text-blue-700 mb-3 transition-all duration-300">
                  <MapPin className="w-5 h-5 inline mr-2 text-purple-500 transition-transform duration-300 group-hover:scale-110" />
                  Dream Destination
                </label>
                <input
                  type="text"
                  name="to_location"
                  value={formData.to_location}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 text-lg border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-purple-300"
                  placeholder="✨ Where would you like to go?"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="pt-6 transform transition-all duration-300 hover:scale-[1.01]">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl hover:from-blue-700 hover:to-purple-700 hover:scale-105 active:scale-95 transition-all duration-300 font-bold shadow-2xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
                disabled={!formData.from_location.trim() || !formData.to_location.trim()}
              >
                <span className="flex items-center justify-center gap-3">
                  Continue to Details 
                  <ArrowRight className="w-5 h-5 transform transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            </div>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-10 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200 transform transition-all duration-300 hover:shadow-lg">
            <p className="text-lg font-semibold text-gray-700 mb-4 text-center transition-all duration-300">
              🌟 Popular Destinations
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {popularDestinations.map((destination) => (
                <button
                  key={destination.name}
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, to_location: destination.name }));
                  }}
                  className="flex items-center gap-2 bg-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white text-gray-700 px-4 py-3 rounded-2xl border-2 border-gray-200 hover:border-transparent transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1 cursor-pointer transform hover:scale-105 group"
                >
                  <span className="text-xl transform transition-transform duration-300 group-hover:scale-110">
                    {destination.emoji}
                  </span>
                  <span className="font-medium">{destination.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        </div>
      </div>
    </>
  );
}