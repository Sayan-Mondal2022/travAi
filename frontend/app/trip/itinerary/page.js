"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function ItineraryPage() {
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState(null);
  const [mode, setMode] = useState("ai"); // ai | custom
  const [days, setDays] = useState(3);

  // Load trip data from localStorage
  const tripData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("trip_data") || "{}")
      : {};

  const destination = tripData.to_location;
  const preferences = tripData.travel_preferences || [];

  useEffect(() => {
    const stored = localStorage.getItem("selected_places");
    if (stored) {
      setSelectedPlaces(JSON.parse(stored));
    }
  }, []);

  const removePlace = (id) => {
    const updated = selectedPlaces.filter((p) => (p.id || p.place_id) !== id);
    setSelectedPlaces(updated);
    localStorage.setItem("selected_places", JSON.stringify(updated));
  };

  const generateItinerary = async () => {
    if (!destination) {
      alert("Missing destination");
      return;
    }

    setLoading(true);

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/tour/itinerary/generate/`;

      const payload = {
        destination: destination,
        days: days,
        preferences: preferences,
        mode: mode,
        places:
          mode === "custom"
            ? selectedPlaces.map((p) => ({
                name: p.name,
                address: p.formattedAddress,
                preference: p.preference_tag,
              }))
            : [],
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

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-3xl font-bold mb-4">Your Itinerary</h1>

      {/* Trip Summary */}
      <div className="mb-6 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold">Trip Summary</h2>
        <p>
          <b>Destination:</b> {destination}
        </p>
        <p>
          <b>Preferences:</b> {preferences.join(", ")}
        </p>
        <p>
          <b>Days:</b>{" "}
          <input
            type="number"
            className="border px-2 py-1 ml-2 w-20"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            min={1}
          />
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-4 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            mode === "ai" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("ai")}
        >
          AI Generated Itinerary
        </button>

        <button
          className={`px-4 py-2 rounded ${
            mode === "custom" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setMode("custom")}
        >
          Custom (Use Selected Places)
        </button>
      </div>

      {/* Selected Places */}
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Selected Places</h2>

        {selectedPlaces.length === 0 && (
          <p className="text-gray-600">No places selected.</p>
        )}

        <div className="space-y-3">
          {selectedPlaces.map((place, i) => {
            const id = place.id || place.place_id;

            return (
              <div
                key={id || i}
                className="border rounded p-4 shadow hover:bg-gray-50"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{place.name}</h3>
                    <p className="text-gray-600">{place.formattedAddress}</p>
                    <p className="text-sm text-blue-700 font-semibold mt-1">
                      Preference: {place.preference_tag || "General"}
                    </p>
                  </div>

                  <button
                    className="px-3 py-1 bg-red-500 text-white rounded"
                    onClick={() => removePlace(id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Generate Button */}
      <div className="text-center">
        <button
          onClick={generateItinerary}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow mb-10 disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Itinerary"}
        </button>
      </div>

      {/* Itinerary Output */}
      {itinerary && (
        <div className="border p-6 rounded shadow-lg bg-white">
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
