// app/trip/places/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { MapPin, Star, Clock, Check, X, Loader, Navigation } from "lucide-react";

export default function PlacesSelectionPage() {
  const router = useRouter();
  const [tripData, setTripData] = useState(null);
  const [placesData, setPlacesData] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("tourist"); // tourist | lodging | restaurants

  useEffect(() => {
    const fetchPlacesData = async () => {
      try {
        const savedTrip = JSON.parse(localStorage.getItem("currentTrip") || "{}");
        if (!savedTrip || !savedTrip.to_location) {
          throw new Error("No trip data found. Please create a trip first.");
        }
        setTripData(savedTrip);

        const places = await apiGet(
          `/api/tour/places/${encodeURIComponent(savedTrip.to_location)}`
        );
        setPlacesData(places);

        setSelectedPlaces(places.tourist_attractions || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacesData();
  }, []);

  const togglePlaceSelection = (placeToToggle) => {
    setSelectedPlaces((prev) => {
      const isSelected = prev.some((p) => p.name === placeToToggle.name);
      if (isSelected) {
        return prev.filter((p) => p.name !== placeToToggle.name);
      } else {
        return [...prev, placeToToggle];
      }
    });
  };

  const handleGenerateItinerary = (mode) => {
    setSaving(true);
    try {
      localStorage.setItem("selectedPlaces", JSON.stringify(selectedPlaces));
      localStorage.setItem("itineraryMode", mode); // ai | custom
      router.push("/trip/itinerary");
    } catch (err) {
      setError("Failed to generate itinerary. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto">
            <Loader className="w-6 h-6 mx-auto mt-2 text-[var(--primary)]" />
          </div>
          <p className="mt-4 text-[var(--text-secondary)]">
            Discovering amazing places for you...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-[var(--text)] mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-[var(--text-secondary)] mb-6">{error}</p>
          <button
            onClick={() => router.push("/trip/preferences")}
            className="bg-[var(--primary)] text-white py-2 px-6 rounded-xl hover:opacity-90 font-semibold"
          >
            Create New Trip
          </button>
        </div>
      </div>
    );
  }

  const PlaceCard = ({ place }) => {
    const isSelected = selectedPlaces.some((p) => p.name === place.name);
    return (
      <div
        key={place.name}
        className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
          isSelected
            ? "border-[var(--primary)] bg-[var(--primary-light)]"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => togglePlaceSelection(place)}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-[var(--text)] mb-2 pr-2">
            {place.name}
          </h3>
          <div
            className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
              isSelected
                ? "bg-[var(--primary)] text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {isSelected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </div>
        </div>
        <p className="text-sm text-[var(--text-secondary)] mb-3">
          {place.address}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm">{place.rating || "N/A"}</span>
            <span className="text-sm text-gray-500 ml-1">
              ({place.user_ratings_total || 0})
            </span>
          </div>
          {place.opening_hours && <Clock className="w-4 h-4 text-gray-500" />}
        </div>
      </div>
    );
  };

  // get current active list
  const getActivePlaces = () => {
    if (!placesData) return [];
    if (activeTab === "tourist") return placesData.tourist_attractions || [];
    if (activeTab === "lodging") return placesData.lodging || [];
    if (activeTab === "restaurants") return placesData.restaurants || [];
    return [];
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Banner */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
            Itinerary: {tripData.from_location} → {tripData.to_location}
          </h1>
          <p className="text-[var(--text-secondary)]">
            Choose which places you&apos;d like to include in your itinerary
          </p>
        </div>

        {/* Controls row */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          {/* Left: Tabs */}
          <div className="flex gap-3">
            {["tourist", "lodging", "restaurants"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-4 rounded-xl font-medium ${
                  activeTab === tab
                    ? "bg-[var(--primary)] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab === "tourist" && "Tourist Places"}
                {tab === "lodging" && "Lodging"}
                {tab === "restaurants" && "Restaurants"}
              </button>
            ))}
          </div>

          {/* Right: Itinerary buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => handleGenerateItinerary("ai")}
              className="bg-[var(--secondary)] text-white py-2 px-4 rounded-xl hover:opacity-90 font-semibold"
            >
              AI Generated
            </button>
            <button
              onClick={() => handleGenerateItinerary("custom")}
              disabled={selectedPlaces.length === 0 || saving}
              className="bg-[var(--primary)] text-white py-2 px-4 rounded-xl hover:opacity-90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Custom Selected
            </button>
          </div>
        </div>

        {/* Places Display */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-[var(--text)] mb-4">
            {activeTab === "tourist" && "Tourist Attractions"}
            {activeTab === "lodging" && "Lodging"}
            {activeTab === "restaurants" && "Restaurants"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getActivePlaces().map((place) => (
              <PlaceCard key={place.name} place={place} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
