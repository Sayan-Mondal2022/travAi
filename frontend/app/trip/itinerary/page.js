// app/trip/places/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import {
  MapPin,
  Star,
  Clock,
  Check,
  X,
  Loader,
  Navigation,
  Image as ImageIcon,
} from "lucide-react";

export default function PlacesSelectionPage() {
  const router = useRouter();
  const [tripData, setTripData] = useState(null);
  const [placesData, setPlacesData] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("tourist"); // tourist | lodging | restaurants

  // Pagination state
  const [page, setPage] = useState(0);
  const PLACES_PER_PAGE = 12;

  useEffect(() => {
    const fetchPlacesData = async () => {
      try {
        const savedTrip = JSON.parse(
          localStorage.getItem("currentTrip") || "{}"
        );
        if (!savedTrip || !savedTrip.to_location) {
          throw new Error("No trip data found. Please create a trip first.");
        }
        setTripData(savedTrip);

        const places = await apiGet(
          `/api/tour/places/${encodeURIComponent(savedTrip.to_location)}`
        );
        setPlacesData(places);

        // Initialize with tourist attractions selected by default
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
      const isSelected = prev.some(
        (p) => p.place_id === placeToToggle.place_id
      );
      if (isSelected) {
        return prev.filter((p) => p.place_id !== placeToToggle.place_id);
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
          <div className="animate-spin rounded-2xl h-12 w-12 border-b-2 border-[var(--primary)] mx-auto">
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
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
    const isSelected = selectedPlaces.some(
      (p) => p.place_id === place.place_id
    );
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    return (
      <div
        key={place.place_id}
        className={`border-2 rounded-2xl overflow-hidden transition-all cursor-pointer ${
          isSelected
            ? "border-[var(--primary)] bg-[var(--primary-light)]"
            : "border-gray-200 hover:border-gray-300"
        }`}
        onClick={() => togglePlaceSelection(place)}
      >
        {/* Image Section */}
        <div className="relative h-48 bg-gray-100">
          {place.images && place.images.length > 0 ? (
            <>
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-2xl h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                </div>
              )}
              <img
                src={place.images[0]}
                alt={place.name}
                className={`w-full h-full object-cover ${
                  imageLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true);
                  setImageLoading(false);
                }}
              />
              {imageError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {/* Selection Indicator */}
          <div
            className={`absolute top-3 right-3 w-7 h-7 rounded-2xl flex items-center justify-center ${
              isSelected
                ? "bg-[var(--primary)] text-white"
                : "bg-white text-gray-700"
            } shadow-md`}
          >
            {isSelected ? (
              <Check className="w-4 h-4" />
            ) : (
              <X className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-[var(--text)] mb-2 line-clamp-2">
            {place.name}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
            {place.address}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">
                {place.rating || "N/A"}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                ({place.user_ratings_total || 0})
              </span>
            </div>
            {place.opening_hours && <Clock className="w-4 h-4 text-gray-500" />}
          </div>
        </div>
      </div>
    );
  };

  // Get current active list
  const getActivePlaces = () => {
    if (!placesData) return [];
    if (activeTab === "tourist") return placesData.tourist_attractions || [];
    if (activeTab === "lodging") return placesData.lodging || [];
    if (activeTab === "restaurants") return placesData.restaurants || [];
    return [];
  };

  const activePlaces = getActivePlaces();
  const startIndex = page * PLACES_PER_PAGE;
  const currentPlaces = activePlaces.slice(startIndex, startIndex + PLACES_PER_PAGE);
  const hasMore = startIndex + PLACES_PER_PAGE < activePlaces.length;

  return (
    <div className="min-h-screen bg-[var(--bg)] py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Banner */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">
            Itinerary: {tripData.from_location} → {tripData.to_location}
          </h1>
          <p className="text-[var(--text-secondary)]">
            Select the places you&apos;d like to include in your itinerary
          </p>
          <div className="mt-4 flex items-center">
            <div className="bg-blue-100 text-blue-800 py-1 px-3 rounded-2xl text-sm font-medium">
              {selectedPlaces.length} places selected
            </div>
          </div>
        </div>

        {/* Controls row */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          {/* Left: Tabs */}
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "tourist", label: "Tourist Attractions" },
              { id: "lodging", label: "Lodging" },
              { id: "restaurants", label: "Restaurants" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setPage(0); // reset pagination when switching tabs
                }}
                className={`py-2 px-4 rounded-2xl font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-[var(--primary)] text-white shadow-md"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right: Itinerary buttons */}
          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={() => handleGenerateItinerary("ai")}
              className="bg-[var(--secondary)] text-white py-2 px-4 rounded-2xl hover:opacity-90 font-semibold shadow-md transition-opacity"
            >
              AI Generated
            </button>
            <button
              onClick={() => handleGenerateItinerary("custom")}
              disabled={selectedPlaces.length === 0 || saving}
              className="bg-[var(--primary)] text-white py-2 px-4 rounded-2xl hover:opacity-90 font-semibold shadow-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Processing..." : `Custom (${selectedPlaces.length})`}
            </button>
          </div>
        </div>

        {/* Select/Deselect All buttons */}
        <div className="flex gap-3 flex-wrap justify-center mb-6">
          <button
            onClick={() => {
              setSelectedPlaces((prev) => {
                const newSelection = [...prev];
                currentPlaces.forEach((p) => {
                  if (!newSelection.some((sel) => sel.place_id === p.place_id)) {
                    newSelection.push(p);
                  }
                });
                return newSelection;
              });
            }}
            className="bg-green-500 text-white py-2 px-4 rounded-2xl hover:opacity-90 font-semibold shadow-md transition-opacity mr-auto"
          >
            Select All on This Page
          </button>

          <button
            onClick={() => {
              setSelectedPlaces((prev) =>
                prev.filter(
                  (sel) => !currentPlaces.some((p) => p.place_id === sel.place_id)
                )
              );
            }}
            className="bg-red-500 text-white py-2 px-4 rounded-2xl hover:opacity-90 font-semibold shadow-md transition-opacity"
          >
            Deselect All on This Page
          </button>
        </div>

        {/* Places Display */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-[var(--text)] mb-6">
            {activeTab === "tourist" && "Tourist Attractions"}
            {activeTab === "lodging" && "Lodging Options"}
            {activeTab === "restaurants" && "Restaurants"}
          </h2>

          {currentPlaces.length === 0 ? (
            <div className="text-center py-12">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-[var(--text-secondary)]">
                No places found in this category
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPlaces.map((place) => (
                  <PlaceCard key={place.place_id} place={place} />
                ))}
              </div>

              {/* Pagination controls */}
              <div className="flex justify-center gap-4 mt-6">
                {page > 0 && (
                  <button
                    onClick={() => setPage(page - 1)}
                    className="bg-gray-200 text-gray-700 py-2 px-6 rounded-xl hover:bg-gray-300 font-medium"
                  >
                    Back
                  </button>
                )}
                {hasMore && (
                  <button
                    onClick={() => setPage(page + 1)}
                    className="bg-[var(--primary)] text-white py-2 px-6 rounded-2xl hover:opacity-90 font-semibold"
                  >
                    Show More
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}