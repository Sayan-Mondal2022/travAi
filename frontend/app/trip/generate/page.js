"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

import DayTabs from "@/components/itinerary/DayTabs";
import AttractionCard from "@/components/itinerary/AttractionCard";
import FoodSection from "@/components/itinerary/FoodSection";
import LodgingCard from "@/components/itinerary/LodgingCard";
import SuggestionPanel from "@/components/itinerary/SuggestionPanel";
import { safeText } from "@/components/itinerary/helpers";

import {
  Loader,
  AlertTriangle,
  Calendar,
  DollarSign,
} from "lucide-react";

export default function ItineraryPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("itinerary");
  const [activeDay, setActiveDay] = useState(0);

  const [itinerary, setItinerary] = useState(null);
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ======================================================
  // FETCH ITINERARY FROM BACKEND
  // ======================================================
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const savedTrip = JSON.parse(localStorage.getItem("currentTrip") || "{}");
        const mode = localStorage.getItem("itineraryMode") || "ai";
        const selectedPlaces = JSON.parse(localStorage.getItem("selectedPlaces") || "[]");

        if (!savedTrip.to_location) {
          throw new Error("No trip data found. Please create a trip first.");
        }

        setTripData(savedTrip);

        const payload = {
          destination: savedTrip.to_location,
          duration_days: savedTrip.duration_days,
          preferences: savedTrip.travel_preferences || [],
          mode,
        };

        if (mode === "custom") {
          payload.places = selectedPlaces;
        }

        const res = await apiPost("/api/tour/itinerary/generate/", payload);

        if (!res.success) {
          throw new Error(res.error || "Failed to generate itinerary.");
        }

        setItinerary(res.itinerary);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, []);

  // ======================================================
  // LOADING UI
  // ======================================================
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );

  // ======================================================
  // ERROR UI
  // ======================================================
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold mt-3 text-gray-800">Error</h1>
          <p className="text-gray-600 mt-2">{safeText(error)}</p>

          <button
            onClick={() => router.push("/trip")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  // ==================================================================================
  // MAIN RENDER
  // ==================================================================================
  const itineraryDays = itinerary?.itinerary || [];
  const suggestions = itinerary?.packing_suggestions;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">
          Trip to {safeText(tripData?.to_location)}
        </h1>

        {itinerary?.overall_summary && (
          <p className="mt-3 text-lg text-gray-700">
            {safeText(itinerary.overall_summary)}
          </p>
        )}
      </div>

      {/* TOP TABS: ITINERARY / SUGGESTIONS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("itinerary")}
          className={`px-6 py-2 rounded-lg font-semibold border ${
            activeTab === "itinerary"
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-white text-gray-800 border-gray-300"
          }`}
        >
          Itinerary
        </button>

        <button
          onClick={() => setActiveTab("suggestions")}
          className={`px-6 py-2 rounded-lg font-semibold border ${
            activeTab === "suggestions"
              ? "bg-blue-600 text-white border-blue-700"
              : "bg-white text-gray-800 border-gray-300"
          }`}
        >
          Suggestions
        </button>
      </div>

      {/* =============================================== */}
      {/* TAB CONTENT */}
      {/* =============================================== */}
      {activeTab === "itinerary" && (
        <>
          {/* DAY SELECTOR */}
          <DayTabs
            days={itineraryDays}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
          />

          {/* ACTIVE DAY CONTENT */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              <Calendar className="w-7 h-7 text-blue-600 mr-2" />
              Day {activeDay + 1}: {safeText(itineraryDays[activeDay]?.title)}
            </h2>

            {itineraryDays[activeDay]?.theme && (
              <p className="text-gray-700 mb-4">
                {safeText(itineraryDays[activeDay].theme)}
              </p>
            )}

            {/* Schedule */}
            {["morning", "afternoon", "evening"].map((slot) => (
              <div key={slot} className="mb-8">
                <h3 className="text-2xl font-semibold capitalize mb-3">
                  {slot}
                </h3>

                {itineraryDays[activeDay].schedule[slot]?.map((place, i) => (
                  <AttractionCard key={i} place={place} />
                ))}
              </div>
            ))}

            {/* FOOD */}
            <FoodSection food={itineraryDays[activeDay]?.food_recommendations} />

            {/* Lodging only on Day 1 */}
            {activeDay === 0 &&
              itineraryDays[0].lodging?.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-2xl font-bold mb-4">Lodging Options</h3>
                  {itineraryDays[0].lodging.map((h, i) => (
                    <LodgingCard key={i} h={h} />
                  ))}
                </div>
              )}

            {/* Budget */}
            {itineraryDays[activeDay]?.budget && (
              <div className="mt-10 bg-green-50 p-5 rounded-xl border">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-6 h-6 text-green-700 mr-2" />
                  Budget Estimate
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(itineraryDays[activeDay].budget).map(
                    ([k, v]) => (
                      <div
                        key={k}
                        className="text-center bg-white p-4 shadow rounded-lg"
                      >
                        <p className="text-gray-600 capitalize">
                          {safeText(k).replace(/_/g, " ")}
                        </p>
                        <p className="font-semibold text-gray-900">{v}</p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === "suggestions" && (
        <SuggestionPanel suggestions={suggestions} />
      )}
    </div>
  );
}
