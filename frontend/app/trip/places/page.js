"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { MapPin, Star, Landmark } from "lucide-react";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import ExploreButton from "@/components/ExploreButton";

export default function PlacesPage() {
  const router = useRouter();

  /* -------------------------------------------------------
     CLEAR SELECTED PLACES ON MOUNT
  -------------------------------------------------------- */
  useEffect(() => {
    localStorage.removeItem("selected_places");
    localStorage.removeItem("selected_places_trip_id");
  }, []);

  /* -------------------------------------------------------
     STATE
  -------------------------------------------------------- */
  const [activeTab, setActiveTab] = useState("tourist_attractions");
  const [activeMode, setActiveMode] = useState("reference");
  const [placesData, setPlacesData] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [tripData, setTripData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  const [hovered, setHovered] = useState(null);
  const hoverTimeout = useRef(null);

  /* -------------------------------------------------------
     LOAD TRIP DATA
  -------------------------------------------------------- */
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("tripData") ||
        localStorage.getItem("trip_data");

      if (stored) {
        const parsed = JSON.parse(stored);
        setTripData(parsed);

        if (!localStorage.getItem("tripData")) {
          localStorage.setItem("tripData", JSON.stringify(parsed));
        }
      } else {
        setError("Trip data missing. Please create a trip first.");
      }
    } catch {
      setError("Failed to load trip data.");
    }
  }, []);

  const destination = tripData?.to_location;
  const preferences = tripData?.travel_preferences?.join(",") || "";
  const experienceType = tripData?.experience_type || "";

  /* -------------------------------------------------------
     FETCH PLACES
  -------------------------------------------------------- */
  useEffect(() => {
    if (!destination) return;

    async function load() {
      setLoading(true);

      try {
        const params = new URLSearchParams();
        if (preferences) params.append("travel_preferences", preferences);
        if (experienceType) params.append("experience_type", experienceType);

        const qs = params.toString();
        const endpoint = `/api/tour/preference-places/${destination}${
          qs ? `?${qs}` : ""
        }`;

        const data = await apiGet(endpoint);
        setPlacesData(data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch places.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [destination, preferences, experienceType]);

  /* -------------------------------------------------------
     SELECT / REMOVE PLACE
  -------------------------------------------------------- */
  const toggleSelect = (place) => {
    const id = place.id || place.place_id;

    setSelectedPlaces((prev) => {
      let updated;

      if (prev.some((p) => (p.id || p.place_id) === id)) {
        updated = prev.filter((p) => (p.id || p.place_id) !== id);
      } else {
        updated = [...prev, place];
      }

      localStorage.setItem("selected_places", JSON.stringify(updated));
      return updated;
    });
  };

  /* -------------------------------------------------------
     HOVER PANEL
  -------------------------------------------------------- */
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

  /* -------------------------------------------------------
     HELPERS
  -------------------------------------------------------- */
  const flatten = (obj) => {
    if (!obj) return [];
    const out = [];
    Object.keys(obj).forEach((p) => {
      const arr = obj[p] || [];
      arr.forEach((place) => out.push(place));
    });
    return out;
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

  /* -------------------------------------------------------
     GENERATE ITINERARY
  -------------------------------------------------------- */
  const handleGenerateItinerary = () => {
    if (selectedPlaces.length === 0) return;

    localStorage.setItem("selected_places", JSON.stringify(selectedPlaces));
    router.push("/trip/itinerary");
  };

  /* -------------------------------------------------------
     LOADING / ERROR UI
  -------------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading places...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={() => router.push("/trip")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Trip
        </button>
      </div>
    );
  }

  /* -------------------------------------------------------
     PAGINATION + CATEGORY
  -------------------------------------------------------- */
  const categoryData =
    activeMode === "reference"
      ? placesData?.reference_places
      : placesData?.recommended_places;

  const list = flatten(categoryData?.[activeTab] || []);

  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = list.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  /* -------------------------------------------------------
     PAGE UI
  -------------------------------------------------------- */
  return (
    <div className="min-h-screen p-4 pb-32 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <button
            className={`px-4 py-2 rounded ${
              activeMode === "reference"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => {
              setActiveMode("reference");
              setCurrentPage(1);
            }}
          >
            Reference
          </button>

          <button
            className={`px-4 py-2 rounded ${
              activeMode === "recommended"
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => {
              setActiveMode("recommended");
              setCurrentPage(1);
            }}
          >
            Recommended
          </button>
        </div>

        <button
          onClick={() => router.push("/trip/generate?mode=ai")}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700"
        >
          Generate AI Itinerary
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-6 border-b mb-6 pb-2 text-lg font-medium">
        {["tourist_attractions", "lodging", "restaurants"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500"
            }
          >
            {tab === "tourist_attractions"
              ? "Tourist Places"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* GRID OF PLACES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paginated.map((place) => {
          const id = place.id || place.place_id;
          const isSelected = selectedPlaces.some(
            (p) => (p.id || p.place_id) === id
          );

          const photos = place.photos;
          const address = place.formattedAddress;
          const editorial = place["editorialSummary.text"];
          const reviewSummary = place["reviewSummary.text"]?.text;
          const rating = place.rating;
          const landmarks = place["addressDescriptor.landmarks"];

          const placeLink = place["googleMapsLinks.placeUri"];
          const directionLink = place["googleMapsLinks.directionsUri"];
          const reviewsLink = place["googleMapsLinks.reviewsUri"];

          return (
            <div
              key={id}
              className="relative"
              onMouseEnter={() => handleMouseEnter(id)}
              onMouseLeave={handleMouseLeave}
            >
              {/* CARD */}
              <div className="rounded-xl border bg-white p-3 transition hover:shadow-lg">
                <PhotoCarousel photos={photos} />

                <h3 className="text-xl font-semibold mt-3 mb-2">
                  {place.displayName}
                </h3>

                <div className="flex gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  {address}
                </div>

                {rating && (
                  <div className="flex items-center gap-2 mb-2">
                    {stars(rating)}
                    <span className="text-sm text-gray-500">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => toggleSelect(place)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isSelected
                      ? "bg-red-100 text-red-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {isSelected ? "Remove" : "Add to Trip"}
                </button>
              </div>

              {/* HOVER PANEL */}
              {hovered === id && (
                <div className="fixed inset-0 z-[9999] overflow-y-auto bg-white/80 backdrop-blur-lg shadow-2xl rounded-xl p-8 animate-[fadeIn_0.25s_ease-out]">
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

                      {editorial && (
                        <p className="text-gray-700 mb-4">{editorial}</p>
                      )}

                      {reviewSummary && (
                        <p className="italic text-gray-600 mb-6">
                          {reviewSummary}
                        </p>
                      )}

                      {rating && (
                        <div className="flex items-center gap-3 mb-4">
                          {stars(rating)}
                          <span className="text-gray-600 text-sm">
                            {rating.toFixed(1)} / 5
                          </span>
                          {place.userRatingCount && (
                            <span className="text-gray-500 text-sm">
                              ({place.userRatingCount} reviews)
                            </span>
                          )}
                        </div>
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
                        <ExploreButton href={placeLink} label="Directions" />
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

                    {/* LANDMARKS */}
                    <div className="w-1/3 bg-gray-50 p-6 rounded-xl border">
                      <h4 className="text-xl font-semibold mb-3 flex items-center gap-2">
                        <Landmark className="w-5 h-5" /> Nearby Landmarks
                      </h4>

                      {landmarks ? (
                        <ul className="space-y-3 text-sm">
                          {landmarks.map((lm, i) => (
                            <li key={i}>
                              <p className="font-medium">
                                {lm.displayName?.text}
                              </p>
                              <p className="text-gray-500">
                                {(lm.travelDistanceMeters / 1000).toFixed(2)} km
                                away
                              </p>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">
                          No landmark information available.
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="font-medium text-lg">
            Page {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* STICKY GENERATE BUTTON */}
      <div className="sticky bottom-4 mt-8 bg-white border shadow-lg rounded-xl px-6 py-4 flex items-center justify-between z-50">
        <div>
          <p className="font-semibold text-lg">
            Selected Places: {selectedPlaces.length}
          </p>
          <p className="text-sm text-gray-600">
            Choose places you want included in your custom itinerary.
          </p>
        </div>

        <button
          onClick={handleGenerateItinerary}
          disabled={selectedPlaces.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow disabled:opacity-50"
        >
          Generate Itinerary
        </button>
      </div>
    </div>
  );
}
