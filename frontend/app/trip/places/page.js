"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import { MapPin, Star, Landmark, X } from "lucide-react";
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
  const [showDetailsFor, setShowDetailsFor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  /* -------------------------------------------------------
     LOAD TRIP DATA
  -------------------------------------------------------- */
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("tripData") || localStorage.getItem("trip_data");

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
        console.log("API Response:", data);
        setPlacesData(data);
      } catch (err) {
        console.error("Fetch error:", err);
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
     FLATTEN HELPER
  -------------------------------------------------------- */
  const flatten = (obj) => {
    if (!obj) return [];

    const out = [];

    Object.keys(obj).forEach((preferenceKey) => {
      const preferenceGroup = obj[preferenceKey];

      if (Array.isArray(preferenceGroup)) {
        preferenceGroup.forEach((place) => {
          out.push(place);
        });
      } else if (typeof preferenceGroup === "object") {
        Object.keys(preferenceGroup).forEach((subKey) => {
          const arr = preferenceGroup[subKey] || [];
          if (Array.isArray(arr)) {
            arr.forEach((place) => {
              out.push(place);
            });
          }
        });
      }
    });

    console.log(`Flattened ${out.length} places`);
    return out;
  };

  /* -------------------------------------------------------
     STAR RATING HELPER
  -------------------------------------------------------- */
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
     CLOSE DETAILS MODAL
  -------------------------------------------------------- */
  useEffect(() => {
    const esc = (e) => {
      if (e.key === "Escape") setShowDetailsFor(null);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  /* -------------------------------------------------------
     LOADING / ERROR UI
  -------------------------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-lg text-[#03045e]">
        Loading places...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center gap-4">
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={() => router.push("/trip")}
          className="px-4 py-2 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white rounded-2xl shadow-md hover:opacity-90 transition-all cursor-pointer"
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

  const list = flatten(categoryData?.[activeTab] || {});

  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE) || 1;
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = list.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  /* -------------------------------------------------------
     PAGE UI
  -------------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 pb-32 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex gap-4">
          <button
            type="button"
            className={`px-6 py-3 rounded-2xl transition-all shadow-md cursor-pointer ${
              activeMode === "reference"
                ? "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white"
                : "bg-white/80 text-[#0077b6] hover:bg-white"
            }`}
            onClick={() => {
              setActiveMode("reference");
              setCurrentPage(1);
            }}
          >
            Reference
          </button>

          <button
            type="button"
            className={`px-6 py-3 rounded-2xl transition-all shadow-md cursor-pointer ${
              activeMode === "recommended"
                ? "bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white"
                : "bg-white/80 text-[#0077b6] hover:bg-white"
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
          type="button"
          onClick={() => router.push("/trip/generate?mode=ai")}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-2xl shadow-md hover:from-purple-600 hover:to-purple-700 transition-all cursor-pointer"
        >
          Generate AI Itinerary
        </button>
      </div>

      {/* TABS */}
      <div className="flex gap-6 mb-6 pb-2 text-lg font-semibold overflow-x-auto">
        {["tourist_attractions", "lodging", "restaurants"].map((tab) => (
          <button
            type="button"
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap transition-all pb-2 cursor-pointer ${
              activeTab === tab
                ? "text-[#0077b6] border-b-2 border-[#0077b6]"
                : "text-gray-500 hover:text-[#0077b6]"
            }`}
          >
            {tab === "tourist_attractions"
              ? "Tourist Places"
              : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* PLACES COUNT */}
      <p className="text-[#0077b6] mb-4 font-medium">
        Showing {paginated.length} of {list.length} places
      </p>

      {/* GRID OF PLACES */}
      {paginated.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No places found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {paginated.map((place) => {
            const id = place.id || place.place_id;
            const isSelected = selectedPlaces.some(
              (p) => (p.id || p.place_id) === id
            );

            const photos = place.photos;
            const address = place.formattedAddress;
            const rating = place.rating;

            return (
              <div
                key={id}
                className="flex flex-col rounded-[30px] bg-[#e0e0e0] shadow-[15px_15px_30px_#bebebe,-15px_-15px_30px_#ffffff] hover:shadow-[20px_20px_40px_#bebebe,-20px_-20px_40px_#ffffff] transition-all h-full"
              >
                {/* CARD CONTENT */}
                <div className="p-4 flex flex-col flex-grow">
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

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => toggleSelect(place)}
                      className={`flex-1 px-3 py-2 rounded-2xl text-sm font-semibold transition-all shadow-md cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                          : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                      }`}
                    >
                      {isSelected ? "Remove" : "Add"}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowDetailsFor(place)}
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
      )}

      {/* DETAILS MODAL */}
      {showDetailsFor && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-gradient-to-br from-blue-900/60 via-blue-800/50 to-blue-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border border-white/30">
            <div className="sticky top-0 bg-gradient-to-r from-[#00b4d8]/10 to-[#0077b6]/10 backdrop-blur-xl border-b border-blue-200/30 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#03045e]">
                {showDetailsFor.displayName}
              </h2>
              <button
                type="button"
                onClick={() => setShowDetailsFor(null)}
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
                    <span>{showDetailsFor.formattedAddress}</span>
                  </div>

                  {showDetailsFor.rating && (
                    <div className="flex items-center gap-3">
                      {stars(showDetailsFor.rating)}
                      <span className="text-gray-600">
                        {showDetailsFor.rating.toFixed(1)} / 5
                      </span>
                      {showDetailsFor.userRatingCount && (
                        <span className="text-gray-500">
                          ({showDetailsFor.userRatingCount} reviews)
                        </span>
                      )}
                    </div>
                  )}

                  {showDetailsFor["editorialSummary.text"] && (
                    <div className="bg-gradient-to-br from-blue-50/80 to-cyan-50/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50">
                      <h3 className="font-semibold mb-2 text-[#03045e]">
                        About
                      </h3>
                      <p className="text-gray-700">
                        {showDetailsFor["editorialSummary.text"]}
                      </p>
                    </div>
                  )}

                  {showDetailsFor["reviewSummary.text"]?.text && (
                    <div className="bg-gradient-to-br from-cyan-50/80 to-blue-50/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100/50">
                      <h3 className="font-semibold mb-2 text-[#03045e]">
                        Reviews Summary
                      </h3>
                      <p className="italic text-gray-600">
                        "{showDetailsFor["reviewSummary.text"].text}"
                      </p>
                    </div>
                  )}

                  {/* LINKS */}
                  <div className="flex flex-wrap gap-3 pt-4">
                    {showDetailsFor["googleMapsLinks.placeUri"] && (
                      <ExploreButton
                        href={showDetailsFor["googleMapsLinks.placeUri"]}
                        label="Explore"
                      />
                    )}

                    {showDetailsFor["googleMapsLinks.directionsUri"] && (
                      <a
                        href={showDetailsFor["googleMapsLinks.directionsUri"]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 transition-all shadow-md cursor-pointer"
                      >
                        Directions
                      </a>
                    )}

                    {showDetailsFor["googleMapsLinks.reviewsUri"] && (
                      <a
                        href={showDetailsFor["googleMapsLinks.reviewsUri"]}
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

                  {showDetailsFor["addressDescriptor.landmarks"] &&
                  showDetailsFor["addressDescriptor.landmarks"].length > 0 ? (
                    <ul className="space-y-3 text-sm">
                      {showDetailsFor["addressDescriptor.landmarks"].map(
                        (lm, i) => (
                          <li
                            key={i}
                            className="border-b border-blue-200/30 pb-2 last:border-0"
                          >
                            <p className="font-medium text-[#03045e]">
                              {lm.displayName?.text || "Unknown"}
                            </p>
                            {lm.travelDistanceMeters && (
                              <p className="text-[#0077b6]">
                                {(lm.travelDistanceMeters / 1000).toFixed(2)} km
                                away
                              </p>
                            )}
                          </li>
                        )
                      )}
                    </ul>
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No landmark information available.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-6 py-3 bg-white/80 text-[#0077b6] font-semibold rounded-2xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
          >
            Previous
          </button>

          <span className="font-bold text-lg text-[#03045e]">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-6 py-3 bg-white/80 text-[#0077b6] font-semibold rounded-2xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
          >
            Next
          </button>
        </div>
      )}

      {/* STICKY GENERATE BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-50/95 to-cyan-50/95 backdrop-blur-xl border-t border-blue-200/50 shadow-lg px-6 py-4 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-bold text-lg text-[#03045e]">
              Selected Places: {selectedPlaces.length}
            </p>
            <p className="text-sm text-[#0077b6]">
              Choose places for your custom itinerary.
            </p>
          </div>

          <button
            type="button"
            onClick={handleGenerateItinerary}
            disabled={selectedPlaces.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white font-bold rounded-2xl shadow-md hover:from-[#0077b6] hover:to-[#03045e] disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            Generate Itinerary
          </button>
        </div>
      </div>
    </div>
  );
}