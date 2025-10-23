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
  DollarSign,
  Utensils,
  ShoppingBag,
  Activity,
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

        const payload = {
          destination: savedTrip.to_location,
          days: savedTrip.duration_days,
          preferences: savedTrip.travel_preferences || [],
          mode: mode,
        };

        if (mode === "custom") {
          if (selectedPlaces.length === 0) {
            throw new Error(
              "You haven't selected any places for your custom itinerary."
            );
          }
          payload.places = selectedPlaces;
        }

        const response = await apiPost(
          "/api/tour/itinerary/generate/",
          payload
        );

        // ✅ Check for API success first
        if (!response.success) {
          throw new Error(response.error || "Failed to generate itinerary");
        }

        // ✅ Extract itinerary from the correct structure
        const itineraryData = response?.itinerary;
        if (
          !itineraryData ||
          !itineraryData.itinerary ||
          !Array.isArray(itineraryData.itinerary)
        ) {
          throw new Error("Invalid itinerary data received from the server.");
        }

        setItinerary(itineraryData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateItinerary();
  }, []);

  // 🌀 Loading State
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

  // ❌ Error State
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
            onClick={() => router.push("/trip/itinerary")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get the first day itinerary (since your response has array with one day)
  const itineraryDays = itinerary?.itinerary || [];
  const firstDay = itineraryDays[0];

  // ✅ Success UI
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Your Trip to {tripData?.to_location}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {firstDay?.theme || "Here's your personalized itinerary!"}
          </p>
          {itinerary?.overall_summary && (
            <p className="mt-2 text-gray-700">{itinerary.overall_summary}</p>
          )}
        </div>

        {/* Budget Section */}
        {firstDay?.budget && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-green-600" />
              Budget Estimate (for 2 people)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(firstDay.budget).map(
                ([key, value]) => (
                  <div
                    key={key}
                    className="text-center p-3 bg-green-50 rounded-lg shadow-sm"
                  >
                    <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, " ")}</p>
                    <p className="font-semibold text-gray-900">{value}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {/* Schedule Section */}
        {firstDay?.schedule && (
          <div className="space-y-6">
            {Object.entries(firstDay.schedule).map(([timeSlot, activities], index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  {timeSlot.toLowerCase().includes("evening") ? (
                    <Moon className="w-6 h-6 text-indigo-500 mr-2" />
                  ) : (
                    <Sun className="w-6 h-6 text-yellow-500 mr-2" />
                  )}
                  <h2 className="text-xl font-semibold text-gray-800 capitalize">{timeSlot}</h2>
                </div>
                <ul className="list-disc pl-6 text-gray-700 space-y-2">
                  {activities.map((activity, i) => (
                    <li key={i}>{activity}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Cuisine & Travel Tips */}
        {(firstDay?.local_cuisine_recommendations || firstDay?.travel_tips) && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
            {firstDay?.local_cuisine_recommendations && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <Utensils className="w-6 h-6 mr-2 text-orange-500" />
                  Local Cuisine
                </h2>
                <ul className="list-disc pl-6 text-gray-700 mb-6">
                  {firstDay.local_cuisine_recommendations.map((dish, i) => (
                    <li key={i}>{dish}</li>
                  ))}
                </ul>
              </>
            )}

            {firstDay?.travel_tips && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-2 text-blue-600" />
                  Travel Tips
                </h2>
                <ul className="list-disc pl-6 text-gray-700">
                  {firstDay.travel_tips.map((tip, i) => (
                    <li key={i}>{tip}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
