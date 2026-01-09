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

import { Loader, AlertTriangle, Calendar, DollarSign, Sparkles, MapPin } from "lucide-react";

// ==================================================================================
// SAFE ARRAY ACCESS HELPER
// ==================================================================================
const safeArray = (arr) => (Array.isArray(arr) ? arr : []);
const safeObject = (obj) => (obj && typeof obj === 'object' ? obj : {});

// ==================================================================================
// UPDATED: SUPPORT CUSTOM MODE INVALID STATE WITH EXPLICIT TOGGLE BUTTONS
// ==================================================================================
export default function ItineraryPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("itinerary");
  const [activeDay, setActiveDay] = useState(0);

  const [itinerary, setItinerary] = useState(null);
  const [aiItinerary, setAiItinerary] = useState(null);
  const [customItinerary, setCustomItinerary] = useState(null);

  const [mode, setMode] = useState("ai");
  const [valid, setValid] = useState(true);
  const [showWhich, setShowWhich] = useState("custom");

  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ======================================================
  // ✅ IMPROVED: FETCH ITINERARY WITH BETTER DATA HANDLING
  // ======================================================
  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        // Try to load trip data from multiple sources
        let savedTrip = null;
        
        // Priority 1: currentTrip
        const currentTripStr = localStorage.getItem("currentTrip");
        if (currentTripStr) {
          savedTrip = JSON.parse(currentTripStr);
          console.log("✅ Loaded from currentTrip:", savedTrip);
        }
        
        // Priority 2: tripData
        if (!savedTrip || !savedTrip.to_location) {
          const tripDataStr = localStorage.getItem("tripData");
          if (tripDataStr) {
            savedTrip = JSON.parse(tripDataStr);
            // Save as currentTrip for future use
            localStorage.setItem("currentTrip", tripDataStr);
            console.log("✅ Loaded from tripData and saved as currentTrip:", savedTrip);
          }
        }

        // If still no trip data, throw error
        if (!savedTrip || !savedTrip.to_location) {
          throw new Error("No trip data found. Please create a trip first.");
        }

        const savedMode = localStorage.getItem("itineraryMode") || "ai";
        const selectedPlacesStr = localStorage.getItem("selected_places") || "[]";
        const selectedPlaces = JSON.parse(selectedPlacesStr);

        console.log("📍 Trip Data:", savedTrip);
        console.log("🎯 Mode:", savedMode);
        console.log("📦 Selected Places:", selectedPlaces.length);

        setTripData(savedTrip);
        setMode(savedMode);

        // Build payload
        const payload = {
          destination: savedTrip.to_location,
          duration_days: savedTrip.duration_days || 1,
          preferences: savedTrip.travel_preferences || [],
          experience_type: savedTrip.experience_type || "moderate",
          budget: savedTrip.budget || 5000,
          group_size: savedTrip.people_count || 1,
          mode: savedMode,
        };

        // Add places for custom mode
        if (savedMode === "custom") {
          payload.places = selectedPlaces;
        }

        console.log("🚀 Sending payload:", payload);

        // Call API
        const endpoint = "/api/tour/itinerary/generate/";

        const res = await apiPost(endpoint, payload);

        console.log("✅ API Response:", res);

        if (!res.success) {
          throw new Error(res.error || "Failed to generate itinerary.");
        }

        // Handle response based on mode and validity
        if (res.valid === false && res.mode === "custom") {
          setValid(false);
          setCustomItinerary(res.custom_itinerary || null);
          setAiItinerary(res.ai_itinerary || null);
          setShowWhich("custom");
        } else {
          setValid(true);
          setItinerary(res.itinerary || null);
        }

      } catch (err) {
        console.error("❌ Itinerary Generation Error:", err);
        setError(err?.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, []);

  // ======================================================
  // LOADING UI
  // ======================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 font-medium">Generating your itinerary...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // ERROR UI
  // ======================================================
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold mt-3 text-gray-800">Error</h1>
          <p className="text-gray-600 mt-2">{safeText(error)}</p>

          <button
            onClick={() => router.push("/trip")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ======================================================
  // CHOOSE WHICH ITINERARY TO SHOW
  // ======================================================
  let finalItinerary = null;

  if (mode === "custom" && valid === false) {
    finalItinerary = showWhich === "custom" ? customItinerary : aiItinerary;
  } else {
    finalItinerary = itinerary;
  }

  // Safe access to itinerary data
  const itineraryDays = safeArray(finalItinerary?.itinerary);
  const suggestions = safeObject(finalItinerary?.packing_suggestions);
  const currentDay = itineraryDays[activeDay] || {};
  const currentSchedule = safeObject(currentDay?.schedule);

  // ======================================================
  // NO ITINERARY DATA
  // ======================================================
  if (!finalItinerary || itineraryDays.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto" />
          <h1 className="text-xl font-bold mt-3 text-gray-800">No Itinerary Available</h1>
          <p className="text-gray-600 mt-2">We couldn't generate an itinerary. Please try again.</p>

          <button
            onClick={() => router.push("/trip")}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Back to Trip Planning
          </button>
        </div>
      </div>
    );
  }

  // ==================================================================================
  // MAIN RENDER
  // ==================================================================================
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Trip Summary
        </h2>

        {/* TRIP SUMMARY */}
        <div>
          <p className="text-gray-900 font-semibold text-lg text-justify">
            <span className="font-bold">From:</span>{" "}
            <span className="italic">{safeText(tripData?.from_location) || "N/A"}</span>
            <span className="text-blue-600 font-bold mx-2">→</span>
            <span className="font-bold">To:</span>{" "}
            <span className="italic">{safeText(tripData?.to_location) || "N/A"}</span>
            <span className="mx-3">
              <span className="font-bold">Duration:</span>{" "}
              <span className="italic">{safeText(tripData?.duration_days) || "N/A"} Days</span>
            </span>
          </p>

          {/* OVERALL SUMMARY */}
          {finalItinerary?.overall_summary && (
            <p className="mt-4 text-gray-700 text-justify leading-relaxed">
              <span className="font-bold text-gray-900">Trip Overview:</span>{" "}
              <span className="italic">{safeText(finalItinerary.overall_summary)}</span>
            </p>
          )}

          {/* USER PREFERENCES */}
          <p className="mt-4 text-gray-700 text-justify leading-relaxed">
            <span className="font-bold text-gray-900">Your Interests:</span>{" "}
            <span className="italic">
              {safeArray(tripData?.travel_preferences).length > 0
                ? safeArray(tripData.travel_preferences).join(", ")
                : "No preferences provided"}
            </span>
          </p>
        </div>
      </div>

      {/* ⭐ ITINERARY TYPE TOGGLE - Shows when custom mode is invalid */}
      {mode === "custom" && valid === false && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 mb-8 border-2 border-amber-200">
          <div className="text-center mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              ⚠️ Incomplete Selection Detected
            </h3>
            <p className="text-gray-700 text-sm">
              Your selected places don't meet the minimum requirements. 
              We've generated two itineraries for you to choose from:
            </p>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => setShowWhich("custom")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                showWhich === "custom"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400"
              }`}
            >
              <MapPin className="w-5 h-5" />
              Custom-Based Itinerary
            </button>

            <button
              onClick={() => setShowWhich("ai")}
              className={`px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                showWhich === "ai"
                  ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 border-2 border-gray-300 hover:border-purple-400"
              }`}
            >
              <Sparkles className="w-5 h-5" />
              AI-Generated Itinerary
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {showWhich === "custom" 
                ? "🗺️ Viewing itinerary based on your selected places (with AI enhancements)"
                : "✨ Viewing fully AI-optimized itinerary with complete recommendations"}
            </p>
          </div>
        </div>
      )}

      {/* MODE INDICATOR - Shows for valid itineraries */}
      {(mode === "ai" || (mode === "custom" && valid === true)) && (
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border-l-4 border-blue-600">
          <div className="flex items-center gap-3">
            {mode === "ai" ? (
              <>
                <Sparkles className="w-6 h-6 text-purple-600" />
                <div>
                  <p className="font-semibold text-gray-900">AI-Generated Itinerary</p>
                  <p className="text-sm text-gray-600">Optimized based on your preferences and popular attractions</p>
                </div>
              </>
            ) : (
              <>
                <MapPin className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Custom Itinerary</p>
                  <p className="text-sm text-gray-600">Based on your personally selected places</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("itinerary")}
          className={`px-6 py-2 rounded-2xl hover:cursor-pointer font-semibold transition-all ${
            activeTab === "itinerary"
              ? "bg-blue-600 text-white border-blue-700 shadow-lg"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Itinerary
        </button>

        <button
          onClick={() => setActiveTab("suggestions")}
          className={`px-6 py-2 rounded-2xl hover:cursor-pointer font-semibold transition-all ${
            activeTab === "suggestions"
              ? "bg-blue-600 text-white border-blue-700 shadow-lg"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
          }`}
        >
          Suggestions
        </button>
      </div>

      {/* ITINERARY TAB CONTENT */}
      {activeTab === "itinerary" && (
        <>
          <DayTabs
            days={itineraryDays}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
          />

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-3xl font-bold mb-4 flex items-center">
              <Calendar className="w-7 h-7 text-blue-600 mr-2" />
              Day {activeDay + 1}: {safeText(currentDay?.title) || "Itinerary"}
            </h2>

            {currentDay?.theme && (
              <p className="text-gray-700 mb-6 italic">
                {safeText(currentDay.theme)}
              </p>
            )}

            {/* SCHEDULE SECTIONS */}
            {["morning", "afternoon", "evening"].map((slot) => {
              const slotPlaces = safeArray(currentSchedule[slot]);
              
              if (slotPlaces.length === 0) return null;

              return (
                <div key={slot} className="mb-8">
                  <h3 className="text-2xl font-semibold capitalize mb-3 text-gray-800">
                    {slot}
                  </h3>

                  {slotPlaces.map((place, i) => (
                    <AttractionCard key={i} place={place || {}} />
                  ))}
                </div>
              );
            })}

            {/* FOOD SECTION */}
            {currentDay?.food_recommendations && (
              <FoodSection food={currentDay.food_recommendations} />
            )}

            {/* LODGING SECTION */}
            {safeArray(currentDay?.lodging_options).length > 0 && (
              <div className="mt-10">
                <h3 className="text-2xl font-bold mb-4 text-gray-900">Lodging Options</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {safeArray(currentDay.lodging_options).map((h, i) => (
                    <LodgingCard key={i} h={h || {}} />
                  ))}
                </div>
              </div>
            )}

            {/* BUDGET SECTION */}
            {currentDay?.budget && Object.keys(safeObject(currentDay.budget)).length > 0 && (
              <div className="mt-10 bg-green-50 p-5 rounded-xl border border-green-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-6 h-6 text-green-700 mr-2" />
                  Budget Estimate
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(safeObject(currentDay.budget)).map(([k, v]) => (
                    <div
                      key={k}
                      className="text-center bg-white p-4 shadow rounded-lg"
                    >
                      <p className="text-gray-600 capitalize text-sm">
                        {safeText(k).replace(/_/g, " ")}
                      </p>
                      <p className="font-semibold text-gray-900 mt-1">{safeText(v)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* SUGGESTIONS TAB */}
      {activeTab === "suggestions" && (
        <SuggestionPanel suggestions={suggestions} />
      )}
    </div>
  );
}