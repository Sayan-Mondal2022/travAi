// app/trip/preferences/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Cloud,
  Route,
  DollarSign,
  Bike,
  Car,
  Plane,
  Train,
  ArrowLeft,
} from "lucide-react";
import { apiPost } from "@/lib/api";

const WEATHER_OPTIONS = [
  { id: "warm", label: "Warm & Sunny", emoji: "☀️" },
  { id: "cool", label: "Cool & Breezy", emoji: "🌤️" },
  { id: "cold", label: "Cold & Snowy", emoji: "❄️" },
  { id: "any", label: "Any Weather", emoji: "🌈" },
];

const TRANSPORT_OPTIONS = [
  {
    id: "flight",
    label: "Flight",
    icon: Plane,
    color: "text-red-500",
    minBudget: 1500,
  },
  {
    id: "train",
    label: "Train",
    icon: Train,
    color: "text-green-500",
    minBudget: 800,
  },
  {
    id: "car",
    label: "Car",
    icon: Car,
    color: "text-blue-500",
    minBudget: 600,
  },
  {
    id: "bike",
    label: "Bike",
    icon: Bike,
    color: "text-purple-500",
    minBudget: 300,
  },
  {
    id: "mixed",
    label: "Mixed",
    emoji: "🚗✈️",
    color: "text-orange-500",
    minBudget: 1000,
  },
];

const TRAVEL_PREFERENCES = [
  "Adventure",
  "Relaxation",
  "Cultural",
  "Food",
  "Shopping",
  "Nature",
  "Historical",
  "Nightlife",
  "Local Experiences",
];

// Budget ranges for different transport modes
const BUDGET_RANGES = {
  default: { min: 500, max: 10000, step: 500 },
  flight: { min: 1500, max: 10000, step: 500 },
  train: { min: 800, max: 10000, step: 500 },
  car: { min: 600, max: 10000, step: 500 },
  bike: { min: 300, max: 10000, step: 500 },
  mixed: { min: 1000, max: 10000, step: 500 },
};

export default function PreferencesStep() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    weather_preference: "",
    mode_of_transport: "",
    travel_preferences: [],
    budget: 2000,
  });
  const [currentBudgetRange, setCurrentBudgetRange] = useState(
    BUDGET_RANGES.default
  );

  // This hook loads data when the component first mounts
  useEffect(() => {
    const savedData = localStorage.getItem("tripData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData((prev) => ({ ...prev, ...parsedData }));

      // Set initial budget range based on saved transport mode
      if (parsedData.mode_of_transport) {
        setCurrentBudgetRange(
          BUDGET_RANGES[parsedData.mode_of_transport] || BUDGET_RANGES.default
        );
      }
    }
  }, []);

  // This hook saves the current page's data to localStorage whenever it changes
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("tripData") || "{}");
    const updatedTripData = { ...savedData, ...formData };
    localStorage.setItem("tripData", JSON.stringify(updatedTripData));
  }, [formData]);

  // Update budget range when transport mode changes
  useEffect(() => {
    if (formData.mode_of_transport) {
      const newRange =
        BUDGET_RANGES[formData.mode_of_transport] || BUDGET_RANGES.default;
      setCurrentBudgetRange(newRange);

      // Adjust budget if it's below the new minimum
      if (formData.budget < newRange.min) {
        setFormData((prev) => ({
          ...prev,
          budget: newRange.min,
        }));
      }
    }
  }, [formData.mode_of_transport]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get all data from localStorage and combine with current form data
    const savedData = JSON.parse(localStorage.getItem("tripData") || "{}");
    const allData = { ...savedData, ...formData };

    console.log("Data being sent to the backend:", allData);
    try {
      // Use the apiPost function from your api.js
      const result = await apiPost("/api/trip/add-trip/", allData);

      // Store the trip data for use in itinerary
      localStorage.setItem("currentTrip", JSON.stringify(result.data));
      router.push(`/trip/itinerary`);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to create trip. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        travel_preferences: checked
          ? [...prev.travel_preferences, value]
          : prev.travel_preferences.filter((item) => item !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTransportChange = (transportId) => {
    setFormData((prev) => ({
      ...prev,
      mode_of_transport: transportId,
    }));
  };

  const handleBack = () => {
    router.back();
  };

  // Get current transport option for display
  const getCurrentTransportOption = () => {
    return TRANSPORT_OPTIONS.find(
      (option) => option.id === formData.mode_of_transport
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center p-4 transition-all duration-500">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl relative transform transition-all duration-300 hover:shadow-2xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute left-4 top-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 hover:scale-110">
            <Cloud className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 transform transition-all duration-300">
            Final Preferences
          </h1>
          <p className="text-gray-600 transition-all duration-300">
            Customize your perfect trip
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Weather Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              <Cloud className="w-5 h-5 inline mr-2 text-blue-500 transition-transform duration-300 hover:scale-110" />
              Preferred Weather?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {WEATHER_OPTIONS.map((weather) => (
                <label
                  key={weather.id}
                  className={`flex flex-col items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    formData.weather_preference === weather.id
                      ? "border-orange-500 bg-orange-50 shadow-md scale-105"
                      : "border-gray-200 hover:border-orange-300 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="weather_preference"
                    value={weather.id}
                    checked={formData.weather_preference === weather.id}
                    onChange={handleInputChange}
                    required
                    className="sr-only"
                  />
                  <span className="text-2xl mb-2 transition-transform duration-300 hover:scale-110">
                    {weather.emoji}
                  </span>
                  <span className="text-sm text-gray-900 text-center">
                    {weather.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Transport Preference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              <Route className="w-5 h-5 inline mr-2 text-green-500 transition-transform duration-300 hover:scale-110" />
              How do you want to travel?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TRANSPORT_OPTIONS.map((transport) => {
                const IconComponent = transport.icon;
                return (
                  <label
                    key={transport.id}
                    className={`flex flex-col items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      formData.mode_of_transport === transport.id
                        ? "border-green-500 bg-green-50 shadow-md scale-105"
                        : "border-gray-200 hover:border-green-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="mode_of_transport"
                      value={transport.id}
                      checked={formData.mode_of_transport === transport.id}
                      onChange={() => handleTransportChange(transport.id)}
                      required
                      className="sr-only"
                    />
                    {transport.icon ? (
                      <IconComponent
                        className={`w-8 h-8 mb-2 ${transport.color} transition-transform duration-300 hover:scale-110`}
                      />
                    ) : (
                      <span className="text-2xl mb-2 transition-transform duration-300 hover:scale-110">
                        {transport.emoji}
                      </span>
                    )}
                    <span className="text-sm text-gray-900">
                      {transport.label}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      Min: ${transport.minBudget.toLocaleString()}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Travel Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              <span className="text-xl transition-transform duration-300 hover:scale-110">
                🌟
              </span>{" "}
              What are you interested in?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TRAVEL_PREFERENCES.map((pref) => (
                <label
                  key={pref}
                  className="flex items-center p-3 border border-gray-200 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all duration-200 transform hover:scale-[1.02]"
                >
                  <input
                    type="checkbox"
                    name="travel_preferences"
                    value={pref}
                    checked={formData.travel_preferences.includes(pref)}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 mr-2 transition-all duration-200"
                  />
                  <span className="text-sm text-gray-700">{pref}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div className="bg-blue-50 rounded-2xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
            <label className="block text-sm font-medium text-blue-700 mb-4">
              <DollarSign className="w-5 h-5 inline mr-2 transition-transform duration-300 hover:scale-110" />
              What&apos;s your budget? (USD)
              {formData.mode_of_transport && (
                <span className="text-blue-600 ml-2 text-xs">
                  (Minimum: ${currentBudgetRange.min.toLocaleString()} for{" "}
                  {getCurrentTransportOption()?.label})
                </span>
              )}
            </label>
            <div className="space-y-4">
              <input
                type="range"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                min={currentBudgetRange.min}
                max={currentBudgetRange.max}
                step={currentBudgetRange.step}
                className="w-full cursor-pointer transition-all duration-200"
              />
              <div className="text-center">
                <span className="text-3xl font-bold text-blue-600 transition-all duration-300">
                  ${Number(formData.budget).toLocaleString()}
                </span>
                <div className="flex justify-between text-xs text-blue-500 mt-2">
                  <span>${currentBudgetRange.min.toLocaleString()}</span>
                  <span className="text-blue-700 font-medium">
                    Selected: ${Number(formData.budget).toLocaleString()}
                  </span>
                  <span>${currentBudgetRange.max.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-4 pt-6">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-2xl cursor-pointer hover:bg-gray-300 hover:scale-105 active:scale-95 transition-all duration-200 font-medium"
            >
              ← Back
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-2xl cursor-pointer hover:bg-orange-700 hover:scale-105 active:scale-95 transition-all duration-200 font-medium"
            >
              🎉 Create My Trip!
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
