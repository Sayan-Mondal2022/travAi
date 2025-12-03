"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";
import {
  MapPin,
  Navigation,
  Star,
  Globe,
  Phone,
  Landmark
} from "lucide-react";

/* -------------------------------------------------------
   PHOTO CAROUSEL COMPONENT
-------------------------------------------------------- */
function PhotoCarousel({ photos }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!photos || photos.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, 20000); // 20 seconds per photo
    return () => clearInterval(interval);
  }, [photos]);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
        No Photos
      </div>
    );
  }

  // image URL conversion for Google photo names
  const convert = (photoName) =>
    `https://places.googleapis.com/v1/${photoName}/media?max_width=600&key=${process.env.NEXT_PUBLIC_GOOGLE_KEY}`;

  return (
    <div className="w-full h-40 overflow-hidden rounded-lg">
      <img
        src={convert(photos[index])}
        alt="photo"
        className="w-full h-40 object-cover rounded-lg transition-all duration-700"
      />
    </div>
  );
}

/* -------------------------------------------------------
   MAIN PAGE
-------------------------------------------------------- */

export default function PlacesPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("tourist_attractions");
  const [activeMode, setActiveMode] = useState("reference");
  const [placesData, setPlacesData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [hovered, setHovered] = useState(null);

  const [tripData, setTripData] = useState(null);

  const ITEMS_PER_PAGE = 12;
  const [currentPage, setCurrentPage] = useState(1);

  /* -------------------------------------------------------
     LOAD TRIP DATA
  -------------------------------------------------------- */
  useEffect(() => {
    const str =
      localStorage.getItem("tripData") ||
      localStorage.getItem("trip_data");
    if (str) {
      try {
        setTripData(JSON.parse(str));
      } catch {
        setError("Failed to load trip data");
      }
    } else {
      setError("No trip data found. Please create a trip first.");
    }
  }, []);

  const destination = tripData?.to_location;
  const preferences = tripData?.travel_preferences?.join(",") || "";
  const experienceType = tripData?.experience_type || "";

  /* -------------------------------------------------------
     FETCH PLACES
  -------------------------------------------------------- */
  useEffect(() => {
    if (!tripData || !destination) return;

    async function load() {
      setLoading(true);

      try {
        const params = new URLSearchParams();
        if (preferences) params.append("travel_preferences", preferences);
        if (experienceType)
          params.append("experience_type", experienceType);

        const qs = params.toString();
        const endpoint = `/api/tour/preference-places/${destination}${
          qs ? `?${qs}` : ""
        }`;

        const data = await apiGet(endpoint);
        setPlacesData(data);
      } catch (e) {
        setError("Failed to load places");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [tripData, destination]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-lg">
        Loading Places...
      </div>
    );

  if (error)
    return (
      <div className="text-center p-10">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );

  if (!placesData)
    return (
      <div className="text-center p-10">
        No places found.
        <button
          className="ml-3 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => router.push("/trip/create")}
        >
          Back to Trip
        </button>
      </div>
    );

  /* -------------------------------------------------------
     FLATTENING UTILITY (keeps categories separated)
  -------------------------------------------------------- */
  const flatten = (categoryData) => {
    let result = [];
    if (!categoryData) return [];
    Object.keys(categoryData).forEach((pref) => {
      const arr = categoryData[pref] || [];
      arr.forEach((place) => result.push({ ...place }));
    });
    return result;
  };

  const categoryData =
    activeMode === "reference"
      ? placesData.reference_places
      : placesData.recommended_places;

  const list = flatten(categoryData?.[activeTab] || []);

  // pagination
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = list.slice(pageStart, pageStart + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(list.length / ITEMS_PER_PAGE);

  /* -------------------------------------------------------
     HELPERS
  -------------------------------------------------------- */
  const get = (obj, path) => {
    if (!obj) return null;
    const keys = path.split(".");
    let v = obj;
    for (let k of keys) {
      if (v && typeof v === "object") v = v[k];
      else return null;
    }
    return v;
  };

  const toggleSelect = (place) => {
    const id = place.id || place.place_id;
    if (!id) return;

    if (selectedPlaces.some((p) => (p.id || p.place_id) === id)) {
      setSelectedPlaces((prev) =>
        prev.filter((p) => (p.id || p.place_id) !== id)
      );
    } else {
      setSelectedPlaces((prev) => [...prev, place]);
    }
  };

  const stars = (rating) => {
    if (!rating) return null;
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {[...Array(full)].map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-yellow-400 text-yellow-400"
          />
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
     RENDER
  -------------------------------------------------------- */

  return (
    <div className="min-h-screen p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">
        Places in {placesData.destination || destination}
      </h1>

      {/* MODE TOGGLE */}
      <div className="flex gap-4 my-6">
        {["reference", "recommended"].map((mode) => (
          <button
            key={mode}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeMode === mode
                ? "bg-blue-600 text-white"
                : "bg-gray-200"
            }`}
            onClick={() => {
              setActiveMode(mode);
              setCurrentPage(1);
            }}
          >
            {mode === "reference" ? "Reference Places" : "Recommended Places"}
          </button>
        ))}
      </div>

      {/* CATEGORY TABS */}
      <div className="flex gap-6 border-b pb-2 mb-6 text-lg font-medium">
        {[
          ["tourist_attractions", "Tourist Places"],
          ["lodging", "Lodging"],
          ["restaurants", "Restaurants"]
        ].map(([key, label]) => (
          <button
            key={key}
            className={`pb-2 ${
              activeTab === key
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600"
            }`}
            onClick={() => {
              setActiveTab(key);
              setCurrentPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* GRID — 3 CARDS PER ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paginated.map((place, idx) => {
          const id = place.id || place.place_id;
          const photos = place.photos;
          const address = get(place, "formattedAddress");
          const editorial = get(place, "editorialSummary.text");
          const reviewSumm = get(place, "reviewSummary.text");
          const rating = get(place, "rating");
          const directionLink = get(
            place,
            "googleMapsLinks.directionsUri"
          );
          const landmarks = get(place, "addressDescriptor.landmarks");

          return (
            <div
              key={id || idx}
              className={`rounded-xl border shadow-sm bg-white p-3 transition-all relative ${
                hovered === id ? "shadow-xl" : "hover:shadow-lg"
              }`}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
            >
              <PhotoCarousel photos={photos} />

              <h3 className="text-xl font-semibold mt-3 mb-2">
                {place.displayName || place.name}
              </h3>

              {/* Address */}
              {address && (
                <div className="flex gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  {address}
                </div>
              )}

              {/* Rating */}
              {rating && (
                <div className="flex items-center gap-2 mb-2">
                  {stars(rating)}
                  <span className="text-sm text-gray-500">
                    {rating.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Directions */}
              {directionLink && (
                <a
                  href={directionLink}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm mb-3"
                >
                  <Navigation className="w-4 h-4" />
                  Get Directions
                </a>
              )}

              {/* SELECT BUTTON */}
              <button
                onClick={() => toggleSelect(place)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  selectedPlaces.some(
                    (p) => (p.id || p.place_id) === id
                  )
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {selectedPlaces.some(
                  (p) => (p.id || p.place_id) === id
                )
                  ? "Remove"
                  : "Add to Trip"}
              </button>

              {/* HOVER DETAILS */}
              {hovered === id && (
                <div className="absolute z-20 top-0 left-0 w-full h-full bg-white bg-opacity-95 p-4 rounded-xl overflow-y-auto shadow-xl border">
                  <h3 className="text-lg font-semibold mb-2">
                    More Info
                  </h3>

                  {editorial && (
                    <p className="text-gray-700 mb-3">{editorial}</p>
                  )}

                  {reviewSumm && (
                    <p className="text-gray-700 italic mb-4">
                      {reviewSumm}
                    </p>
                  )}

                  {/* Nearby landmarks */}
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Landmark className="w-4 h-4" />
                    Nearby Landmarks
                  </h4>

                  {landmarks && landmarks.length > 0 ? (
                    <ul className="text-sm space-y-2">
                      {landmarks.map((lm, i) => (
                        <li key={i} className="flex gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full mt-1"></div>
                          <span>
                            {lm.text || lm.title} —{" "}
                            {lm.distanceMeters
                              ? (lm.distanceMeters / 1000).toFixed(2)
                              : "?"}{" "}
                            km
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-gray-500 text-sm">
                      No landmark info
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 my-10">
          <button
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* CONTINUE BUTTON */}
      <div className="sticky bottom-4 bg-white shadow p-4 rounded-xl flex justify-between items-center border">
        <div>
          <p className="font-semibold text-lg">
            {selectedPlaces.length} selected
          </p>
        </div>

        <button
          disabled={selectedPlaces.length === 0}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg disabled:opacity-50"
          onClick={() => {
            localStorage.setItem(
              "selected_places",
              JSON.stringify(selectedPlaces)
            );
            router.push("/trip/itinerary");
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
