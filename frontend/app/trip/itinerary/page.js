"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Star, Landmark, RefreshCw } from "lucide-react";

export default function ItineraryPage() {
  const router = useRouter();

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tripData, setTripData] = useState(null);
  const [debugInfo, setDebugInfo] = useState("");

  const [activeTab, setActiveTab] = useState("tourist");

  const [hovered, setHovered] = useState(null);
  const hoverTimeout = useRef(null);

  /* -----------------------------------------------------
      LOAD TRIP DATA
  ------------------------------------------------------ */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("tripData");
      if (stored) {
        setTripData(JSON.parse(stored));
      }
    }
  }, []);

  const {
    from_location,
    to_location,
    start_date,
    end_date,
    duration_days,
    people_count,
    travel_type,
    mode_of_transport,
    experience_type,
    travel_preferences = [],
    budget,
  } = tripData || {};

  const destination = to_location;
  const days = duration_days || 3;

  /* -----------------------------------------------------
      HELPERS
  ------------------------------------------------------ */
  const capitalizeWords = (str) => {
    if (!str || typeof str !== "string") return str || "";
    return str
      .toLowerCase()
      .split("_")
      .join(" ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const stars = (rating) => {
    if (!rating) return null;
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {[...Array(full)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
        ))}
        {half && (
          <div className="relative w-4 h-4">
            <Star className="absolute w-4 h-4 text-gray-300" />
            <Star
              className="absolute w-4 h-4 fill-yellow-400 text-yellow-400"
              style={{ clipPath: "inset(0 50% 0 0)" }}
            />
          </div>
        )}
      </div>
    );
  };

  /* -----------------------------------------------------
      LOAD SELECTED PLACES - WITH DEBUG
  ------------------------------------------------------ */
  const loadPlaces = () => {
    if (typeof window === "undefined") return;

    // Debug: Check what's in localStorage
    const storedPlaces = localStorage.getItem("selected_places");
    const storedTripId = localStorage.getItem("selected_places_trip_id");

    console.log("Loading places from localStorage...");
    console.log("Stored places:", storedPlaces);
    console.log("Stored trip ID:", storedTripId);

    if (storedPlaces) {
      try {
        const parsed = JSON.parse(storedPlaces);
        console.log("Parsed places:", parsed);
        console.log("Number of places:", parsed.length);

        setSelectedPlaces(parsed);
        setDebugInfo(`Loaded ${parsed.length} places from localStorage`);
      } catch (e) {
        console.error("Error parsing selected places:", e);
        setSelectedPlaces([]);
        setDebugInfo("Error parsing places from localStorage");
      }
    } else {
      console.log("No places found in localStorage");
      setDebugInfo("No places found in localStorage");
      setSelectedPlaces([]);
    }
  };

  // Load places on mount
  useEffect(() => {
    loadPlaces();
  }, []);

  /* -----------------------------------------------------
      REMOVE PLACE
  ------------------------------------------------------ */
  const removePlace = (id) => {
    const updated = selectedPlaces.filter((p) => (p.id || p.place_id) !== id);
    setSelectedPlaces(updated);
    localStorage.setItem("selected_places", JSON.stringify(updated));
    setDebugInfo(`Removed place. ${updated.length} places remaining.`);
  };

  /* -----------------------------------------------------
      FILTER BY CATEGORY
  ------------------------------------------------------ */
  const touristPlaces = selectedPlaces.filter((p) => {
    const types = p.types || [];
    // Tourist places include tourist_attraction, landmarks, parks, museums, etc.
    return (
      (types.includes("tourist_attraction") ||
        types.includes("historical_landmark") ||
        types.includes("historical_place") ||
        types.includes("national_park") ||
        types.includes("park") ||
        types.includes("museum") ||
        types.includes("point_of_interest") ||
        types.includes("market") ||
        types.includes("hiking_area") ||
        types.includes("adventure_sports_center") ||
        types.includes("travel_agency") ||
        types.includes("establishment")) &&
      !types.includes("lodging") &&
      !types.includes("restaurant")
    );
  });

  const lodgingPlaces = selectedPlaces.filter(
    (p) =>
      p.types?.includes("lodging") ||
      p.types?.includes("hotel") ||
      p.types?.includes("resort_hotel")
  );

  const restaurantPlaces = selectedPlaces.filter(
    (p) =>
      p.types?.includes("restaurant") ||
      p.types?.includes("cafe") ||
      p.types?.includes("bar")
  );

  const tabMapping = {
    tourist: touristPlaces,
    lodging: lodgingPlaces,
    restaurants: restaurantPlaces,
  };

  const placesToShow = tabMapping[activeTab] || [];

  /* -----------------------------------------------------
      HOVER PANEL
  ------------------------------------------------------ */
  const handleMouseEnter = (id) => {
    hoverTimeout.current = setTimeout(() => setHovered(id), 2000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHovered(null);
  };

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && setHovered(null);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  /* -----------------------------------------------------
      GENERATE ITINERARY
  ------------------------------------------------------ */
  const generateItinerary = async () => {
    if (!destination) {
      alert("Missing destination");
      return;
    }

    if (selectedPlaces.length === 0) {
      alert("Please select at least one place.");
      return;
    }

    setLoading(true);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/tour/itinerary/custom/`;

      const payload = {
        destination,
        days,
        preferences: travel_preferences,
        mode: "custom",

        places: selectedPlaces.map((p) => ({
          // ---------- BASIC FIELDS ----------
          id: p.id || p.place_id,
          name: p.displayName,
          displayName: p.displayName,
          formattedAddress: p.formattedAddress,
          types: p.types || [],
          rating: p.rating || null,
          userRatingCount: p.userRatingCount || null,

          // ---------- SUMMARIES ----------
          // Editorial Summary (Google → editorialSummary.text)
          editorialSummary: p["editorialSummary.text"]
            ? { text: p["editorialSummary.text"] }
            : p.editorialSummary || null,

          // Review Summary (Google → reviewSummary.text)
          reviewSummary: p["reviewSummary.text"]
            ? { text: p["reviewSummary.text"] }
            : p.reviewSummary || null,

          // ---------- LANDMARKS ----------
          addressDescriptor: {
            landmarks: p["addressDescriptor.landmarks"] || [],
          },

          // ---------- GOOGLE MAPS LINKS ----------
          googleMapsLinks: {
            placeUri: p["googleMapsLinks.placeUri"] || null,
            directionsUri: p["googleMapsLinks.directionsUri"] || null,
            reviewsUri: p["googleMapsLinks.reviewsUri"] || null,
            photosUri: p["googleMapsLinks.photosUri"] || null,
          },

          // ---------- LOCATION ----------
          location: p.location ||
            p.geometry?.location || {
              lat: p.lat || null,
              lng: p.lng || null,
            },

          // ---------- PHOTOS ----------
          photos: p.photos || [],
        })),
      };

      console.log("Sending payload (custom):", payload);

      const res = await axios.post(url, payload);

      if (res.data.success) {
        localStorage.setItem(
          "generated_itinerary",
          JSON.stringify(res.data.itinerary)
        );

        console.log("===== SELECTED PLACES (Frontend) =====");
        console.log(JSON.stringify(selectedPlaces, null, 2));

        console.log("===== GENERATED ITINERARY (AI Output) =====");
        console.log(JSON.stringify(res.data.itinerary, null, 2));

        router.push("/trip/generate");
      } else {
        alert(res.data.error || "Error generating itinerary");
      }
    } catch (e) {
      console.error("Error generating itinerary:", e);
      alert("Failed to generate itinerary.");
    }

    setLoading(false);
  };

  /* -----------------------------------------------------
      UI
  ------------------------------------------------------ */
  if (!tripData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading trip data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      {/* Debug Info */}
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-center justify-between">
        <div>
          <p className="text-sm font-mono">{debugInfo}</p>
          <p className="text-xs text-gray-600 mt-1">
            Total in state: {selectedPlaces.length} | Tourist:{" "}
            {touristPlaces.length} | Lodging: {lodgingPlaces.length} |
            Restaurants: {restaurantPlaces.length}
          </p>
        </div>
        <button
          onClick={loadPlaces}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RefreshCw className="w-4 h-4" />
          Reload Places
        </button>
      </div>

      {/* Back */}
      <button
        onClick={() => router.push("/trip/places")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Places
      </button>

      {/* Summary */}
      <div className="border rounded-xl shadow p-6 bg-blue-50 mb-8">
        <h2 className="text-2xl font-bold mb-4">Trip Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p>
              <b>From:</b> {from_location}
            </p>
            <p>
              <b>To:</b> {to_location}
            </p>
            <p>
              <b>Start Date:</b> {start_date}
            </p>
            <p>
              <b>End Date:</b> {end_date}
            </p>
            <p>
              <b>Duration:</b> {days} days
            </p>
          </div>

          <div>
            <p>
              <b>People Count:</b> {people_count}
            </p>
            <p>
              <b>Travel Type:</b> {capitalizeWords(travel_type)}
            </p>
            <p>
              <b>Transport Mode:</b> {capitalizeWords(mode_of_transport)}
            </p>
            <p>
              <b>Experience:</b> {capitalizeWords(experience_type)}
            </p>
            <p>
              <b>Budget:</b> {capitalizeWords(budget)}
            </p>
          </div>
        </div>

        <p className="mt-3">
          <b>Preferences:</b>{" "}
          {travel_preferences.map(capitalizeWords).join(", ")}
        </p>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b mb-6 pb-2 text-lg font-medium">
        <button
          onClick={() => setActiveTab("tourist")}
          className={
            activeTab === "tourist"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }
        >
          Tourist Places ({touristPlaces.length})
        </button>

        <button
          onClick={() => setActiveTab("lodging")}
          className={
            activeTab === "lodging"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }
        >
          Lodging ({lodgingPlaces.length})
        </button>

        <button
          onClick={() => setActiveTab("restaurants")}
          className={
            activeTab === "restaurants"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }
        >
          Restaurants ({restaurantPlaces.length})
        </button>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {placesToShow.length === 0 && (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-600 text-lg mb-4">
              No places in this category.
            </p>
            <button
              onClick={() => router.push("/trip/places")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Go Add Places
            </button>
          </div>
        )}

        {placesToShow.map((place, i) => {
          const id = place.id || place.place_id;

          const photos = place.photos;
          const address = place.formattedAddress;
          const types = (place.types || []).map(capitalizeWords).join(", ");

          const editorial = place["editorialSummary.text"];
          const reviewSummary = place["reviewSummary.text"]?.text;
          const rating = place.rating;

          const placeLink = place["googleMapsLinks.placeUri"];
          const directionLink = place["googleMapsLinks.directionsUri"];
          const reviewsLink = place["googleMapsLinks.reviewsUri"];
          const landmarks = place["addressDescriptor.landmarks"];

          return (
            <div
              key={id || i}
              className="relative"
              onMouseEnter={() => handleMouseEnter(id)}
              onMouseLeave={handleMouseLeave}
            >
              <div className="rounded-xl border p-3 bg-white shadow hover:shadow-lg transition">
                <PhotoCarousel photos={photos} />

                <h3 className="text-xl font-semibold mt-3">
                  {place.displayName}
                </h3>

                <p className="text-sm text-gray-600 mt-1 flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  {address}
                </p>

                {rating && (
                  <div className="flex items-center gap-2 mt-2">
                    {stars(rating)}
                    <span className="text-sm text-gray-700">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                )}

                <p className="text-sm mt-1">
                  <b>Types:</b> {types}
                </p>

                <button
                  className="mt-3 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => removePlace(id)}
                >
                  Remove
                </button>
              </div>

              {/* Hover Panel */}
              {hovered === id && (
                <div
                  className="
                    fixed inset-0 z-[9999] overflow-y-auto
                    bg-white/80 backdrop-blur-lg
                    shadow-2xl rounded-xl p-8
                    animate-[fadeIn_0.25s_ease-out]
                  "
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    onClick={() => setHovered(null)}
                    className="absolute top-4 right-6 text-gray-700 hover:text-black text-3xl font-bold"
                  >
                    ✕
                  </button>

                  <div className="max-w-5xl mx-auto flex gap-10 mt-6">
                    <div className="w-2/3 pr-4">
                      <h2 className="text-3xl font-bold mb-4">
                        {place.displayName}
                      </h2>

                      <p className="text-sm text-gray-600 mb-2 flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5" />
                        {address}
                      </p>

                      {rating && (
                        <div className="flex items-center gap-3 mb-4">
                          {stars(rating)}
                          <span className="text-gray-700 text-sm">
                            {rating.toFixed(1)} / 5
                          </span>
                          {place.userRatingCount && (
                            <span className="text-gray-500 text-sm">
                              ({place.userRatingCount} reviews)
                            </span>
                          )}
                        </div>
                      )}

                      {editorial && (
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {editorial}
                        </p>
                      )}

                      {reviewSummary && (
                        <p className="italic text-gray-600 mb-6">
                          {reviewSummary}
                        </p>
                      )}

                      {reviewsLink && (
                        <a
                          href={reviewsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 underline block mb-3"
                        >
                          View Reviews →
                        </a>
                      )}

                      {placeLink && (
                        <a
                          href={placeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline block mb-2"
                        >
                          Open in Google Maps →
                        </a>
                      )}

                      {directionLink && (
                        <a
                          href={directionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 underline block mb-4"
                        >
                          Get Directions →
                        </a>
                      )}
                    </div>

                    <div className="w-1/3 bg-gray-50 p-6 rounded-xl border">
                      <h4 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Landmark className="w-5 h-5" />
                        Nearby Landmarks
                      </h4>

                      {landmarks && landmarks.length > 0 ? (
                        <ul className="space-y-3 text-sm">
                          {landmarks.map((lm, idx) => (
                            <li key={idx}>
                              <p className="font-medium">
                                {lm.displayName?.text}
                              </p>
                              {lm.travelDistanceMeters && (
                                <p className="text-gray-500">
                                  {(lm.travelDistanceMeters / 1000).toFixed(2)}{" "}
                                  km away
                                </p>
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No nearby landmarks available.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={generateItinerary}
          disabled={loading || selectedPlaces.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow mb-10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
        >
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>
        {selectedPlaces.length === 0 && (
          <p className="text-red-500 text-sm mt-2">
            Please add at least one place from the Places page
          </p>
        )}
      </div>
    </div>
  );
}
