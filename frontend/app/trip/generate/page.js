// app/trip/itinerary/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "../../../lib/api";
import {
  Loader,
  MapPin,
  Clock,
  Calendar,
  AlertTriangle,
  Sun,
  Moon,
} from "lucide-react";

export default function ItineraryPage() {
  const router = useRouter();
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tripData, setTripData] = useState(null);

  useEffect(() => {
    const generateItinerary = async () => {
      try {
        // 1. Retrieve data from localStorage
        const savedTrip = JSON.parse(
          localStorage.getItem("currentTrip") || "{}"
        );
        const mode = localStorage.getItem("itineraryMode") || "ai";
        const selectedPlaces = JSON.parse(
          localStorage.getItem("selectedPlaces") || "[]"
        );

        if (!savedTrip || !savedTrip.to_location) {
          throw new Error("No trip data found. Please create a trip first.");
        }
        setTripData(savedTrip);

        // 2. Prepare the request payload for the backend
        const payload = {
          destination: savedTrip.to_location,
          days: savedTrip.days,
          preferences: savedTrip.preferences || [],
          mode: mode,
        };

        // For 'custom' mode, we send the list of places the user selected.
        // For 'ai' mode, the backend will use the destination to get the top places.
        if (mode === "custom") {
          if (selectedPlaces.length === 0) {
            throw new Error(
              "You haven't selected any places for your custom itinerary."
            );
          }
          payload.places = selectedPlaces;
        }

        // 3. Make the API call to the backend
        // This endpoint will contain the logic to call the LLM
        console.log(payload.places);
        const response = await apiPost("/api/tour/itinerary/generate", payload);

        if (!response || !response.itinerary) {
          throw new Error("Failed to generate itinerary from the server.");
        }

        setItinerary(response.itinerary);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateItinerary();
  }, []);

  // Loading State UI
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-gray-800">
            Generating Your Itinerary...
          </h1>
          <p className="mt-2 text-gray-600">
            Our AI is crafting the perfect trip for you. This might take a
            moment.
          </p>
        </div>
      </div>
    );
  }

  // Error State UI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            An Error Occurred
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/trip/places")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Success State UI
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Your Trip to {tripData?.to_location}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Here is your personalized travel plan. Enjoy your adventure!
          </p>
        </div>

        {/* Itinerary Timeline */}
        <div className="space-y-8">
          {itinerary &&
            itinerary.map((dayPlan, index) => (
              <div key={index} className="flex items-start">
                {/* Day Marker */}
                <div className="flex flex-col items-center mr-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-xl">
                    {dayPlan.day}
                  </div>
                  <div className="w-px h-full bg-gray-300 mt-2"></div>
                </div>

                {/* Day Content */}
                <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">
                      Day {dayPlan.day}
                    </h2>
                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
                      {dayPlan.theme}
                    </span>
                  </div>

                  <div className="space-y-6">
                    {dayPlan.activities &&
                      dayPlan.activities.map((activity, actIndex) => (
                        <div
                          key={actIndex}
                          className="flex items-start p-4 border rounded-lg bg-gray-50"
                        >
                          <div className="mr-4 pt-1">
                            {activity.time.toLowerCase().includes("am") ? (
                              <Sun className="w-6 h-6 text-yellow-500" />
                            ) : (
                              <Moon className="w-6 h-6 text-indigo-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold text-gray-900">
                                {activity.place}
                              </h3>
                              <p className="text-sm font-medium text-blue-600 flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {activity.time}
                              </p>
                            </div>
                            <p className="text-gray-600 mt-1">
                              {activity.details}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
