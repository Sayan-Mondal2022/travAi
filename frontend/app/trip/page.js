// app/trip/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, Plane, Navigation } from "lucide-react";
import Globe3D from "@/components/Globe3D";

// 🟢 FIX: Safer Geocoding Function
const geocodeCity = async (city) => {
  if (!city) return null;
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("❌ API Key missing. Please check .env.local");
    return null;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`
    );
    
    // Check if fetch itself failed (network error)
    if (!response.ok) {
        console.error("Network response was not ok");
        return null;
    }

    const data = await response.json();

    // Check Google API Status
    if (data.status === "OK" && data.results && data.results[0]) {
      return data.results[0].geometry.location;
    } else {
      console.warn("⚠️ Geocoding API Error:", data.status, data.error_message);
      return null;
    }
  } catch (error) {
    console.error("Geocoding fetch failed", error);
    return null;
  }
};

export default function DestinationStep() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    from_location: "",
    to_location: "",
  });

  const [coords, setCoords] = useState({
    start: null,
    end: null,
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (formData.from_location) {
        const start = await geocodeCity(formData.from_location);
        if (start) {
          setCoords((prev) => ({ 
            ...prev, 
            start: { lat: start.lat, lng: start.lng, label: formData.from_location } 
          }));
        }
      } else {
        setCoords((prev) => ({ ...prev, start: null }));
      }
      
      if (formData.to_location) {
        const end = await geocodeCity(formData.to_location);
        if (end) {
          setCoords((prev) => ({ 
            ...prev, 
            end: { lat: end.lat, lng: end.lng, label: formData.to_location } 
          }));
        }
      } else {
        setCoords((prev) => ({ ...prev, end: null }));
      }
    }, 800); 

    return () => clearTimeout(timer);
  }, [formData.from_location, formData.to_location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.from_location.trim() || !formData.to_location.trim()) {
      alert("Please fill in both locations");
      return;
    }
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
    { name: "London", emoji: "💂" },
    { name: "Tokyo", emoji: "🗼" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex p-4 md:p-8 gap-6 overflow-hidden">
      
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 w-full max-w-xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="w-8 h-8 text-white transform -rotate-45" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Plan Your Journey
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Navigation className="w-4 h-4 inline mr-2 text-blue-500" />
                Starting Point
              </label>
              <input
                type="text"
                name="from_location"
                value={formData.from_location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-blue-100 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                placeholder="Where are you now?"
              />
            </div>

            <div className="flex justify-center -my-2 relative z-10">
                <div className="bg-white p-2 rounded-full shadow-md">
                     <ArrowRight className="text-gray-400 rotate-90" />
                </div>
            </div>

            <div className="group">
              <label className="block text-sm font-semibold text-blue-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-2 text-purple-500" />
                Destination
              </label>
              <input
                type="text"
                name="to_location"
                value={formData.to_location}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all"
                placeholder="Where is your dream?"
              />
            </div>

            <button
              type="submit"
              disabled={!formData.from_location || !formData.to_location}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100"
            >
              Start Planning
            </button>
          </form>

          <div className="mt-8">
            <p className="text-sm font-semibold text-gray-500 mb-3 text-center">Popular Locations</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularDestinations.map((dest) => (
                <button
                  key={dest.name}
                  onClick={() => setFormData(prev => ({...prev, to_location: dest.name}))}
                  className="px-3 py-2 bg-gray-50 hover:bg-blue-50 border border-gray-200 rounded-lg text-sm transition-all hover:scale-105"
                >
                  {dest.emoji} {dest.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: 3D GLOBE */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center">
        <div className="w-full h-[85vh] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50">
          <Globe3D startPoint={coords.start} endPoint={coords.end} />
        </div>
      </div>

    </div>
  );
}