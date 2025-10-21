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
          days: savedTrip.days,
          preferences: savedTrip.preferences || [],
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
        if (!itineraryData || !itineraryData.itinerary || !Array.isArray(itineraryData.itinerary)) {
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
            Our AI is crafting the perfect trip for you. This might take a moment.
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
            onClick={() => router.push("/trip/places")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Get the first day itinerary (since your response has array with one day)
  const dayItinerary = itinerary?.itinerary?.[0];

  // ✅ Success UI
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            {`Your Trip to ${tripData?.to_location}`}
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            {dayItinerary?.theme || "Here's your personalized day plan. Enjoy your adventure!"}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Generated on {new Date(itinerary?.enriched_at).toLocaleDateString()} • Source: {itinerary?.data_source}</p>
          </div>
        </div>

        {/* Budget Summary */}
        {dayItinerary?.budget_estimate_for_2_people_day && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-green-600" />
              Budget Estimate (for 2 people)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <Utensils className="w-6 h-6 mx-auto text-green-600 mb-1" />
                <p className="text-sm text-gray-600">Food</p>
                <p className="font-semibold text-gray-900">{dayItinerary.budget_estimate_for_2_people_day.food}</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <Activity className="w-6 h-6 mx-auto text-blue-600 mb-1" />
                <p className="text-sm text-gray-600">Transport</p>
                <p className="font-semibold text-gray-900">{dayItinerary.budget_estimate_for_2_people_day.transportation}</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <MapPin className="w-6 h-6 mx-auto text-purple-600 mb-1" />
                <p className="text-sm text-gray-600">Activities</p>
                <p className="font-semibold text-gray-900">{dayItinerary.budget_estimate_for_2_people_day.activities_entry_fees}</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <ShoppingBag className="w-6 h-6 mx-auto text-yellow-600 mb-1" />
                <p className="text-sm text-gray-600">Shopping</p>
                <p className="font-semibold text-gray-900">{dayItinerary.budget_estimate_for_2_people_day.miscellaneous_shopping}</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg md:col-span-3 lg:col-span-1">
                <DollarSign className="w-6 h-6 mx-auto text-red-600 mb-1" />
                <p className="text-sm text-gray-600">Total Range</p>
                <p className="font-semibold text-gray-900">{dayItinerary.budget_estimate_for_2_people_day.total_range}</p>
              </div>
            </div>
          </div>
        )}

        {/* Daily Schedule Timeline */}
        <div className="space-y-8">
          {dayItinerary?.schedule?.map((slot, index) => (
            <div key={index} className="flex items-start">
              {/* Time Marker */}
              <div className="flex flex-col items-center mr-4">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold text-lg">
                  {index + 1}
                </div>
                {index !== dayItinerary.schedule.length - 1 && (
                  <div className="w-px h-full bg-gray-300 mt-2"></div>
                )}
              </div>

              {/* Time Slot Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 w-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {slot.time_slot}
                  </h2>
                  <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-medium">
                    {slot.activities?.length || 0} Activities
                  </span>
                </div>

                <div className="space-y-6">
                  {slot.activities?.map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-start p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="mr-4 pt-1">
                        {slot.time_slot.toLowerCase().includes("evening") ? (
                          <Moon className="w-6 h-6 text-indigo-500" />
                        ) : (
                          <Sun className="w-6 h-6 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {activity.name}
                          </h3>
                          {activity.estimated_cost_for_2 && (
                            <p className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                              {activity.estimated_cost_for_2}
                            </p>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{activity.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {activity.cuisine_suggestion && (
                            <div className="flex items-start">
                              <Utensils className="w-4 h-4 mr-2 text-orange-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700">Food:</span>
                                <span className="text-gray-600 ml-1">{activity.cuisine_suggestion}</span>
                              </div>
                            </div>
                          )}
                          
                          {activity.transportation && (
                            <div className="flex items-start">
                              <Activity className="w-4 h-4 mr-2 text-blue-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700">Transport:</span>
                                <span className="text-gray-600 ml-1">{activity.transportation}</span>
                              </div>
                            </div>
                          )}
                          
                          {activity.travel_tips && (
                            <div className="md:col-span-2 flex items-start">
                              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <span className="font-medium text-gray-700">Tips:</span>
                                <span className="text-gray-600 ml-1">{activity.travel_tips}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Travel Tips & Recommendations */}
        {dayItinerary?.overall_travel_tips && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Travel Tips & Recommendations
            </h2>
            <div className="grid gap-4">
              {dayItinerary.overall_travel_tips.map((tip, i) => (
                <div key={i} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">
                    {tip.replace(/\*\*(.*?)\*\*/g, '$1')} {/* Remove markdown bold */}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Itinerary generated by {itinerary?.data_source} on {new Date(itinerary?.enriched_at).toLocaleDateString()}</p>
          {itinerary?.itinerary_id && (
            <p className="mt-1">Reference ID: {itinerary.itinerary_id}</p>
          )}
        </div>
      </div>
    </div>
  );
}