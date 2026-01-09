"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, ArrowRight, Plane, Navigation, Home } from "lucide-react";
import Globe3D from "@/components/Globe3D";

// 🟢 SAFE GEOCODING UTILITY
const geocodeCity = async (city) => {
  if (!city || city.trim() === "") return null;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === "OK" && data.results[0]) {
      return data.results[0].geometry.location;
    }
    return null;
  } catch {
    return null;
  }
};

export default function DestinationStep() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    from_location: "",
    to_location: "",
  });

  const [coords, setCoords] = useState({ start: null, end: null });
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = setTimeout(async () => {
      const { from_location, to_location } = formData;

      // ❌ SAME SOURCE & DESTINATION CHECK
      if (
        from_location.trim() &&
        to_location.trim() &&
        from_location.trim().toLowerCase() ===
          to_location.trim().toLowerCase()
      ) {
        setError("Source and destination cannot be the same.");
        return;
      } else {
        setError("");
      }

      if (from_location.trim()) {
        const geoStart = await geocodeCity(from_location);
        setCoords((p) => ({
          ...p,
          start: geoStart
            ? { lat: geoStart.lat, lng: geoStart.lng, label: from_location }
            : null,
        }));
      } else {
        setCoords((p) => ({ ...p, start: null }));
      }

      if (to_location.trim()) {
        const geoEnd = await geocodeCity(to_location);
        setCoords((p) => ({
          ...p,
          end: geoEnd
            ? { lat: geoEnd.lat, lng: geoEnd.lng, label: to_location }
            : null,
        }));
      } else {
        setCoords((p) => ({ ...p, end: null }));
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [formData.from_location, formData.to_location]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (error) return;

    const { from_location, to_location } = formData;
    if (!from_location.trim() || !to_location.trim()) return;

    localStorage.setItem("tripData", JSON.stringify(formData));
    router.push("/trip/details");
  };

  const handleInputChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const popularDestinations = [
    { name: "Goa", emoji: "🏖️" },
    { name: "Manali", emoji: "🏔️" },
    { name: "London", emoji: "💂" },
    { name: "Tokyo", emoji: "🗼" },
  ];

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 flex items-center p-2 md:p-4 gap-4 overflow-hidden">

      {/* LEFT SIDE */}
      <div className="w-full lg:w-1/2 flex items-center justify-center h-[92vh]">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 w-full max-w-xl h-full flex flex-col relative border border-white/50">

          <Link
            href="/"
            className="absolute top-4 left-4 p-2 rounded-full bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 transition"
          >
            <Home className="w-5 h-5" />
          </Link>

          <div className="absolute top-6 right-6">
            <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
              Step 1 of 4
            </span>
          </div>

          <div className="text-center mb-4 mt-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
              <Plane className="w-6 h-6 text-white -rotate-45" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Plan Your Journey
            </h1>
          </div>

          {/* 🔴 ERROR BANNER */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-semibold">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 flex-grow flex flex-col justify-center">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                <Navigation className="w-3 h-3 inline mr-2 text-blue-500" />
                Starting Point
              </label>
              <input
                name="from_location"
                value={formData.from_location}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border-2 border-blue-50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none"
              />
            </div>

            <div className="flex justify-center -my-1">
              <ArrowRight className="rotate-90 text-gray-400 w-4 h-4" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-blue-700 mb-1">
                <MapPin className="w-3 h-3 inline mr-2 text-purple-500" />
                Destination
              </label>
              <input
                name="to_location"
                value={formData.to_location}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 border-2 border-purple-50 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none"
              />
            </div>

            <button
              disabled={!formData.from_location || !formData.to_location || !!error}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 rounded-2xl font-bold disabled:opacity-50"
            >
              Start Planning
            </button>

            {/* ⭐ FILTERED SHORTCUTS */}
            <div className="pt-4 border-t border-gray-50">
              <p className="text-[11px] font-bold text-gray-400 text-center mb-2">
                Popular Locations
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularDestinations
                  .filter(
                    (d) =>
                      d.name.toLowerCase() !==
                      formData.from_location.trim().toLowerCase()
                  )
                  .map((d) => (
                    <button
                      key={d.name}
                      type="button"
                      onClick={() =>
                        setFormData((p) => ({ ...p, to_location: d.name }))
                      }
                      className="px-3 py-1.5 bg-gray-50 border rounded-3xl text-xs"
                    >
                      {d.emoji} {d.name}
                    </button>
                  ))}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 h-[92vh]">
        <Globe3D startPoint={coords.start} endPoint={coords.end} />
      </div>
    </div>
  );
}
