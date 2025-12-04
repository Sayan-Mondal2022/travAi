"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Navigation, Star, Landmark } from "lucide-react";

export default function ItineraryPage() {
  const router = useRouter();

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);

  const [activeTab, setActiveTab] = useState("tourist");

  // Hover state for expanded view
  const [hovered, setHovered] = useState(null);
  const hoverTimeout = useRef(null);

  /* -----------------------------------------------------
      LOAD TRIP DATA
  ------------------------------------------------------ */
  const tripData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("tripData") || "{}")
      : {};

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

  // Capitalize every word (for summary fields, types, etc.)
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

  // Rating stars
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
      LOAD SELECTED PLACES
  ------------------------------------------------------ */
  useEffect(() => {
    const stored = localStorage.getItem("selected_places");
    if (stored) {
      setSelectedPlaces(JSON.parse(stored));
    }
  }, []);

  /* -----------------------------------------------------
      REMOVE PLACE
  ------------------------------------------------------ */
  const removePlace = (id) => {
    const updated = selectedPlaces.filter((p) => (p.id || p.place_id) !== id);
    setSelectedPlaces(updated);
    localStorage.setItem("selected_places", JSON.stringify(updated));
  };

  /* -----------------------------------------------------
      FILTER PLACES BY TYPE
  ------------------------------------------------------ */
  const touristPlaces = selectedPlaces.filter((p) =>
    p.types?.includes("tourist_attraction")
  );
  const lodgingPlaces = selectedPlaces.filter((p) =>
    p.types?.includes("lodging")
  );
  const restaurantPlaces = selectedPlaces.filter((p) =>
    p.types?.includes("restaurant")
  );

  const tabMapping = {
    tourist: touristPlaces,
    lodging: lodgingPlaces,
    restaurants: restaurantPlaces,
  };

  const placesToShow = tabMapping[activeTab] || [];

  /* -----------------------------------------------------
      HOVER EXPANSION (same behavior as places page)
  ------------------------------------------------------ */
  const handleMouseEnter = (id) => {
    hoverTimeout.current = setTimeout(() => {
      setHovered(id);
    }, 2000); // 2 seconds delay
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setHovered(null);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") setHovered(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  /* -----------------------------------------------------
      GENERATE ITINERARY (Custom using selected places)
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
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/tour/itinerary/generate/`;

      const payload = {
        destination,
        days,
        preferences: travel_preferences,
        mode: "custom",
        places: selectedPlaces.map((p) => ({
          name: p.displayName,
          address: p.formattedAddress,
          preference: p.preference_tag,

          // ⭐ NEW FIELDS ADDED
          types: p.types || [],

          rating: p.rating || null,
          userRatingCount: p.userRatingCount || null,

          editorialSummary: p["editorialSummary.text"] || null,
          reviewSummary: p["reviewSummary.text"]?.text || null,

          landmarks: p["addressDescriptor.landmarks"] || [],

          googleMaps: {
            placeUri: p["googleMapsLinks.placeUri"] || null,
            directionsUri: p["googleMapsLinks.directionsUri"] || null,
            reviewsUri: p["googleMapsLinks.reviewsUri"] || null,
            photosUri: p["googleMapsLinks.photosUri"] || null,
          },
        })),
      };

      const res = await axios.post(url, payload);

      if (res.data.success) {
        setItinerary(res.data.itinerary);
      } else {
        alert("Error generating itinerary");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to generate itinerary.");
    }

    setLoading(false);
  };

  /* =====================================================
      UI
  ====================================================== */
  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.push("/trip/places")}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Places
      </button>

      {/* ---------------------------------------------------
            TRIP SUMMARY
      ---------------------------------------------------- */}
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

      {/* ---------------------------------------------------
            TABS
      ---------------------------------------------------- */}
      <div className="flex gap-6 border-b mb-6 pb-2 text-lg font-medium">
        <button
          onClick={() => setActiveTab("tourist")}
          className={
            activeTab === "tourist"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }
        >
          Tourist Places
        </button>

        <button
          onClick={() => setActiveTab("lodging")}
          className={
            activeTab === "lodging"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }
        >
          Lodging
        </button>

        <button
          onClick={() => setActiveTab("restaurants")}
          className={
            activeTab === "restaurants"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500"
          }
        >
          Restaurants
        </button>
      </div>

      {/* ---------------------------------------------------
            PLACES DISPLAY (with PHOTOS + SUMMARY)
      ---------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {placesToShow.length === 0 && (
          <p className="text-gray-600 col-span-full">
            No places in this category.
          </p>
        )}

        {placesToShow.map((place, i) => {
          const id = place.id || place.place_id;
          const photos = place.photos;
          const address = place.formattedAddress;
          const typesRaw = place.types || [];
          const types = typesRaw.map(capitalizeWords).join(", ");
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
                  className="mt-3 px-3 py-1 bg-red-600 text-white rounded"
                  onClick={() => removePlace(id)}
                >
                  Remove
                </button>
              </div>

              {/* ----------------- HOVER EXPANDED PANEL ----------------- */}
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
                  {/* Close Button */}
                  <button
                    onClick={() => setHovered(null)}
                    className="absolute top-4 right-6 text-gray-700 hover:text-black text-3xl font-bold"
                  >
                    ✕
                  </button>

                  <div className="max-w-5xl mx-auto flex gap-10 mt-6">
                    {/* LEFT SIDE */}
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

                      {types && (
                        <p className="text-sm mb-3">
                          <b>Types:</b> {types}
                        </p>
                      )}

                      {editorial && (
                        <p className="text-gray-700 mb-4 leading-relaxed">
                          {editorial}
                        </p>
                      )}

                      {reviewSummary && (
                        <p className="italic text-gray-600 mb-6">
                          “{reviewSummary}”
                        </p>
                      )}

                      {reviewsLink && (
                        <a
                          href={reviewsLink}
                          target="_blank"
                          className="text-purple-600 underline block mb-3"
                        >
                          View Reviews →
                        </a>
                      )}

                      {placeLink && (
                        <a
                          href={placeLink}
                          target="_blank"
                          className="text-blue-600 underline block mb-2"
                        >
                          Open in Google Maps →
                        </a>
                      )}

                      {directionLink && (
                        <a
                          href={directionLink}
                          target="_blank"
                          className="text-green-600 underline block mb-4"
                        >
                          Get Directions →
                        </a>
                      )}
                    </div>

                    {/* RIGHT SIDE LANDMARKS */}
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

      {/* ---------------------------------------------------
            GENERATE BUTTON
      ---------------------------------------------------- */}
      <div className="text-center">
        <button
          onClick={generateItinerary}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow mb-10 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>
      </div>

      {/* ---------------------------------------------------
            DISPLAY GENERATED ITINERARY
      ---------------------------------------------------- */}
      {itinerary && (
        <div className="border p-6 rounded shadow bg-white">
          <h2 className="text-2xl font-bold mb-4">Generated Itinerary</h2>
          <pre className="whitespace-pre-wrap text-gray-800">
            {typeof itinerary === "string"
              ? itinerary
              : JSON.stringify(itinerary, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
