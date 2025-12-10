"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPin, Navigation, Star, Landmark, X } from "lucide-react";

export default function ItineraryPage() {
  const router = useRouter();

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("tourist");

  // Hover state for expanded view
  const [hovered, setHovered] = useState(null);
  const hoverTimeout = useRef(null);

  // Fade in state for tab transitions
  const [isTransitioning, setIsTransitioning] = useState(false);

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
      TAB CHANGE WITH SMOOTH TRANSITION
  ------------------------------------------------------ */
  const handleTabChange = (tab) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setIsTransitioning(false);
    }, 150);
  };

  /* -----------------------------------------------------
      HOVER EXPANSION PANEL WITH SMOOTH TRANSITION
  ------------------------------------------------------ */
  const handleMouseEnter = (id) => {
    hoverTimeout.current = setTimeout(() => {
      setHovered(id);
    }, 2000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
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
        localStorage.setItem(
          "generated_itinerary",
          JSON.stringify(res.data.itinerary)
        );
        router.push("/trip/generate");
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6 pb-32 max-w-6xl mx-auto">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => router.push("/trip/places")}
        className="flex items-center gap-2 text-[#0077b6] hover:text-[#03045e] font-semibold mb-6 transition-all cursor-pointer"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Places
      </button>

      {/* Trip Summary */}
      <div className="rounded-2xl shadow-md p-6 bg-white/80 backdrop-blur-sm border border-blue-100/50 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-[#03045e]">Trip Overview</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <p className="text-[#0077b6]">
              <span className="font-semibold text-[#03045e]">From:</span> {from_location}
            </p>
            <p className="text-[#0077b6]">
              <span className="font-semibold text-[#03045e]">To:</span> {to_location}
            </p>
            <p className="text-[#0077b6]">
              <span className="font-semibold text-[#03045e]">Start Date:</span> {start_date}
            </p>
            <p className="text-[#0077b6]">
              <span className="font-semibold text-[#03045e]">End Date:</span> {end_date}
            </p>
            <p className="text-[#0077b6]">
              <span className="font-semibold text-[#03045e]">Duration:</span> {days} days
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-[#0077b6]">
              <span className="font-semibold text-[#03045e]">People Count:</span> {people_count}
            </p>
            <p className="text-[#0077b6]">
              <span className="font-semibold text-[#03045e]">Travel Type:</span> {capitalizeWords(travel_type)}
            </p>
            <p className="text-[#0077b6]">
              <span className="font-semibold text-[#03045e]">Transport Mode:</span> {capitalizeWords(mode_of_transport)}
            </p>
            <p className="text-[#0077b6]">
              <span className="font-semibold text-[#03045e]">Experience:</span> {capitalizeWords(experience_type)}
            </p>
            <p className="text-[#0077b6]">
              <span className="font-semibold text-[#03045e]">Budget:</span> {capitalizeWords(budget)}
            </p>
          </div>
        </div>

        <p className="mt-4 text-[#0077b6]">
          <span className="font-semibold text-[#03045e]">Preferences:</span>{" "}
          {travel_preferences.map(capitalizeWords).join(", ")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 pb-2 text-lg font-semibold overflow-x-auto">
        <button
          type="button"
          onClick={() => handleTabChange("tourist")}
          className={`whitespace-nowrap transition-all pb-2 cursor-pointer ${
            activeTab === "tourist"
              ? "text-[#0077b6] border-b-2 border-[#0077b6]"
              : "text-gray-500 hover:text-[#0077b6]"
          }`}
        >
          Tourist Places
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("lodging")}
          className={`whitespace-nowrap transition-all pb-2 cursor-pointer ${
            activeTab === "lodging"
              ? "text-[#0077b6] border-b-2 border-[#0077b6]"
              : "text-gray-500 hover:text-[#0077b6]"
          }`}
        >
          Lodging
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("restaurants")}
          className={`whitespace-nowrap transition-all pb-2 cursor-pointer ${
            activeTab === "restaurants"
              ? "text-[#0077b6] border-b-2 border-[#0077b6]"
              : "text-gray-500 hover:text-[#0077b6]"
          }`}
        >
          Restaurants
        </button>
      </div>

      {/* Place Cards with Fade Transition */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 transition-opacity duration-300 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {placesToShow.length === 0 && (
          <p className="text-gray-600 col-span-full text-center py-8">
            No places in this category.
          </p>
        )}

        {placesToShow.map((place, i) => {
          const id = place.id || place.place_id;
          const photos = place.photos;
          const address = place.formattedAddress;
          const types = (place.types || []).map(capitalizeWords).join(", ");
          const rating = place.rating;

          return (
            <div key={id || i} className="relative">
              <div className="flex flex-col rounded-[30px] bg-[#e0e0e0] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] hover:shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff] transition-all h-full p-4">
                <PhotoCarousel photos={photos} />

                <h3 className="text-lg font-bold mt-3 mb-2 line-clamp-2 min-h-[3.5rem] text-[#03045e]">
                  {place.displayName}
                </h3>

                <div className="flex gap-2 text-sm text-[#0077b6] mb-2 items-start flex-grow">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{address}</span>
                </div>

                {rating && (
                  <div className="flex items-center gap-2 mb-3">
                    {stars(rating)}
                    <span className="text-sm text-[#0077b6] font-semibold">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                )}

                <p className="text-xs text-gray-600 mb-3">
                  <span className="font-semibold text-[#03045e]">Types:</span> {types}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => removePlace(id)}
                    className="flex-1 px-3 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-all shadow-md cursor-pointer"
                  >
                    Remove
                  </button>

                  <button
                    type="button"
                    onClick={() => setHovered(id)}
                    className="flex-1 px-3 py-2 rounded-2xl text-sm font-semibold bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white hover:from-[#0077b6] hover:to-[#03045e] transition-all shadow-md cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Details Modal with Smooth Transition */}
      {hovered && (
        <div
          className={`fixed inset-0 z-[9999] overflow-y-auto bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-blue-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setHovered(null)}
        >
          <div
            className={`bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/30 transition-all duration-300 transform ${
              hovered ? "scale-100 opacity-100" : "scale-95 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const place = selectedPlaces.find(
                (p) => (p.id || p.place_id) === hovered
              );
              if (!place) return null;

              const address = place.formattedAddress;
              const editorial = place["editorialSummary.text"];
              const reviewSummary = place["reviewSummary.text"]?.text;
              const rating = place.rating;
              const placeLink = place["googleMapsLinks.placeUri"];
              const directionLink = place["googleMapsLinks.directionsUri"];
              const reviewsLink = place["googleMapsLinks.reviewsUri"];
              const landmarks = place["addressDescriptor.landmarks"] ?? [];

              return (
                <>
                  <div className="sticky top-0 bg-gradient-to-r from-[#00b4d8]/10 to-[#0077b6]/10 backdrop-blur-xl border-b border-blue-200/30 p-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#03045e]">
                      {place.displayName}
                    </h2>
                    <button
                      type="button"
                      onClick={() => setHovered(null)}
                      className="p-2 hover:bg-blue-100/50 rounded-full transition-colors cursor-pointer"
                    >
                      <X className="w-6 h-6 text-[#0077b6]" />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      {/* LEFT COLUMN - MAIN INFO */}
                      <div className="md:col-span-2 space-y-4">
                        <div className="flex gap-2 text-gray-600">
                          <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#00b4d8]" />
                          <span>{address}</span>
                        </div>

                        {rating && (
                          <div className="flex items-center gap-3">
                            {stars(rating)}
                            <span className="text-gray-600">
                              {rating.toFixed(1)} / 5
                            </span>
                            {place.userRatingCount && (
                              <span className="text-gray-500">
                                ({place.userRatingCount} reviews)
                              </span>
                            )}
                          </div>
                        )}

                        {editorial && (
                          <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50">
                            <h3 className="font-semibold mb-2 text-[#03045e]">
                              About
                            </h3>
                            <p className="text-gray-700">{editorial}</p>
                          </div>
                        )}

                        {reviewSummary && (
                          <div className="bg-gradient-to-br from-cyan-50/80 to-blue-50/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50">
                            <h3 className="font-semibold mb-2 text-[#03045e]">
                              Reviews Summary
                            </h3>
                            <p className="italic text-gray-600">
                              "{reviewSummary}"
                            </p>
                          </div>
                        )}

                        {/* LINKS */}
                        <div className="flex flex-wrap gap-3 pt-4">
                          {placeLink && (
                            <a
                              href={placeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white rounded-2xl hover:from-[#0077b6] hover:to-[#03045e] transition-all shadow-md cursor-pointer"
                            >
                              Explore
                            </a>
                          )}

                          {directionLink && (
                            <a
                              href={directionLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all shadow-md cursor-pointer"
                            >
                              Directions
                            </a>
                          )}

                          {reviewsLink && (
                            <a
                              href={reviewsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl hover:from-purple-600 hover:to-purple-700 transition-all shadow-md cursor-pointer"
                            >
                              Reviews
                            </a>
                          )}
                        </div>
                      </div>

                      {/* RIGHT COLUMN - LANDMARKS */}
                      <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50 h-fit shadow-md">
                        <h4 className="text-lg font-semibold mb-3 flex items-center gap-2 text-[#03045e]">
                          <Landmark className="w-5 h-5 text-[#00b4d8]" /> Nearby
                          Landmarks
                        </h4>

                        {Array.isArray(landmarks) && landmarks.length > 0 ? (
                          <ul className="space-y-3 text-sm">
                            {landmarks.map((lm, idx) => (
                              <li
                                key={idx}
                                className="border-b border-blue-200/30 pb-2 last:border-0"
                              >
                                <p className="font-medium text-[#03045e]">
                                  {lm.displayName?.text || "Unknown"}
                                </p>
                                {lm.travelDistanceMeters && (
                                  <p className="text-[#0077b6]">
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
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Generate Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-50/95 to-cyan-50/95 backdrop-blur-xl border-t border-blue-200/50 shadow-lg px-6 py-4 z-40">
        <div className="max-w-6xl mx-auto text-center">
          <button
            type="button"
            onClick={generateItinerary}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-bold rounded-2xl shadow-md hover:from-[#0077b6] hover:to-[#03045e] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {loading ? "Generating..." : "Generate Itinerary"}
          </button>
        </div>
      </div>
    </div>
  );
}