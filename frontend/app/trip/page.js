// app/trip/page.js
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";
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

  return (
    <>
    {/* <Navbar /> */}
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Discover your next destination</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* From Location */}
          <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-2 text-blue-500" />
              Starting from
            </label>
            <input
              type="text"
              name="from_location"
              value={formData.from_location}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-lg border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Current city or airport"
            />
          </div>

          {/* Arrow separator */}
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          {/* To Location */}
          <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
            <label className="block text-sm font-medium text-blue-700 mb-2 ">
              <MapPin className="w-4 h-4 inline mr-2 text-blue-600" />
              Dream destination
            </label>
            <input
              type="text"
              name="to_location"
              value={formData.to_location}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 text-lg border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
              placeholder="Where would you like to go?"
            />
          </div>

          {/* Navigation */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-2xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold shadow-lg transform hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer "
              disabled={
                !formData.from_location.trim() || !formData.to_location.trim()
              }
            >
              Continue to Details →
            </button>
          </div>
        </form>

        {/* Quick Suggestions */}
        <div className="mt-6">
          <p className="text-m text-gray-600 mb-2 text-center">
            Popular destinations:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {["Paris", "Bali", "Tokyo", "New York", "London"].map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, to_location: city }));
                }}
                className="text-s bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-all duration-300 ease-out hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
   </>
  );
}
