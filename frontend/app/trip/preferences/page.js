// app/trip/preferences/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Cloud,
  Route,
  IndianRupee,
  Bike,
  Car,
  Plane,
  Train,
  ArrowLeft,
  Star,
  Crown,
  Wallet,
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

const EXPERIENCE_OPTIONS = [
  {
    id: "budget",
    label: "Budget",
    description: "Affordable & economical",
    icon: Wallet,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    multiplier: 0.7,
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "Comfortable & balanced",
    icon: Star,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    multiplier: 1,
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "Premium & luxurious",
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    multiplier: 1.5,
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
  default: { min: 1500, step: 500 },
  flight: { min: 3500, step: 500 },
  train: { min: 1500, step: 500 },
  car: { min: 1000, step: 500 },
  bike: { min: 850, step: 500 },
  mixed: { min: 2500, step: 500 },
};

export default function PreferencesStep() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    // Weather and transport
    weather_preference: "",
    mode_of_transport: "",

    // Experience type
    experience_type: "",

    // Travel preferences
    travel_preferences: [],

    // Budget
    budget: BUDGET_RANGES.default.min,
  });
  const [currentBudgetRange, setCurrentBudgetRange] = useState(
    BUDGET_RANGES.default
  );
  const [suggestedBudget, setSuggestedBudget] = useState(0);

  // This hook loads data when the component first mounts
  useEffect(() => {
    const savedData = localStorage.getItem("tripData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData((prev) => ({ ...prev, ...parsedData }));

      // Set initial budget range based on saved transport mode
      if (parsedData.mode_of_transport) {
        const newRange =
          BUDGET_RANGES[parsedData.mode_of_transport] || BUDGET_RANGES.default;
        setCurrentBudgetRange(newRange);
      }
    }
  }, []);

  // This hook saves the current page's data to localStorage whenever it changes
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("tripData") || "{}");
    const updatedTripData = { ...savedData, ...formData };
    localStorage.setItem("tripData", JSON.stringify(updatedTripData));
  }, [formData]);

  // Update budget range and calculate suggested budget when transport mode or experience type changes
  useEffect(() => {
    if (formData.mode_of_transport) {
      const newRange =
        BUDGET_RANGES[formData.mode_of_transport] || BUDGET_RANGES.default;
      setCurrentBudgetRange(newRange);

      // Calculate suggested budget based on transport and experience type
      let baseBudget = newRange.min;
      if (formData.experience_type) {
        const experience = EXPERIENCE_OPTIONS.find(
          (exp) => exp.id === formData.experience_type
        );
        baseBudget = Math.round(newRange.min * experience.multiplier);
      }

      setSuggestedBudget(baseBudget);

      // Always update budget to the suggested amount when experience type changes
      // or when transport mode changes (if experience type is already selected)
      if (formData.experience_type || formData.mode_of_transport) {
        setFormData((prev) => ({
          ...prev,
          budget: baseBudget,
        }));
      }
    }
  }, [formData.mode_of_transport, formData.experience_type]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get all data from localStorage and combine with current form data
    const savedData = JSON.parse(localStorage.getItem("tripData") || "{}");

    // Prepare data according to your Python schema
    const allData = {
      // Location fields (from previous steps)
      from_location: savedData.from_location || "",
      to_location: savedData.to_location || "",

      // Date fields (from previous steps) - ensure they are strings
      start_date: savedData.start_date
        ? new Date(savedData.start_date).toISOString().split("T")[0]
        : "",
      end_date: savedData.end_date
        ? new Date(savedData.end_date).toISOString().split("T")[0]
        : "",
      to_date: savedData.end_date
        ? new Date(savedData.end_date).toISOString().split("T")[0]
        : "", // to_date matches end_date
      duration_days: savedData.duration_days || 1,

      // Travel type (from previous steps)
      travel_type: savedData.travel_type || "",

      // Group details (from previous steps) - ADD ELDER_COUNT
      people_count: savedData.people_count || 1,
      has_elderly: savedData.has_elderly || false,
      has_children: savedData.has_children || false,
      has_pets: savedData.has_pets || false,
      children_count: savedData.children_count || 0,
      elder_count: savedData.elder_count || 0, 
      pets_count: savedData.pets_count || 0,

      // Current form data (preferences)
      weather_preference: formData.weather_preference,
      mode_of_transport: formData.mode_of_transport,
      experience_type: formData.experience_type,
      travel_preferences: formData.travel_preferences,
      budget: parseFloat(formData.budget) || 0,
    };

    console.log("Data being sent to the backend:", allData);

    // Validate required fields
    const requiredFields = [
      "from_location",
      "to_location",
      "start_date",
      "end_date",
      "travel_type",
      "weather_preference",
      "mode_of_transport",
      "experience_type",
      "budget",
    ];

    const missingFields = requiredFields.filter((field) => !allData[field]);
    if (missingFields.length > 0) {
      alert(
        `Please fill in all required fields. Missing: ${missingFields.join(
          ", "
        )}`
      );
      return;
    }

    try {
      const result = await apiPost("/api/trip/add-trip/", allData);

      // Store the trip data for use in itinerary
      localStorage.setItem("currentTrip", JSON.stringify(result.data));
      router.push(`/trip/places`);
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

  const handleExperienceChange = (experienceId) => {
    setFormData((prev) => ({
      ...prev,
      experience_type: experienceId,
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

  // Get current experience option for display
  const getCurrentExperienceOption = () => {
    return EXPERIENCE_OPTIONS.find(
      (option) => option.id === formData.experience_type
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4 transition-all duration-500">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl relative transform transition-all duration-300 hover:shadow-2xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute left-4 top-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 hover:scale-110">
            <Cloud className="w-8 h-8 text-blue-600" />
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
                      ? "border-blue-500 bg-blue-50 shadow-md scale-105"
                      : "border-gray-200 hover:border-blue-300 bg-white"
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
              <Route className="w-5 h-5 inline mr-2 text-blue-500 transition-transform duration-300 hover:scale-110" />
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
                        ? "border-blue-500 bg-blue-50 shadow-md scale-105"
                        : "border-gray-200 hover:border-blue-300 bg-white"
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
                      Min:{" "}
                      <IndianRupee className="w-3 h-3 inline transition-transform duration-300 hover:scale-110" />
                      {transport.minBudget.toLocaleString()}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Experience Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              <Star className="w-5 h-5 inline mr-2 text-blue-500 transition-transform duration-300 hover:scale-110" />
              What type of experience do you prefer?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {EXPERIENCE_OPTIONS.map((experience) => {
                const IconComponent = experience.icon;
                return (
                  <label
                    key={experience.id}
                    className={`flex flex-col items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      formData.experience_type === experience.id
                        ? `${experience.borderColor} ${experience.bgColor} shadow-md scale-105 border-2`
                        : "border-gray-200 hover:border-blue-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="experience_type"
                      value={experience.id}
                      checked={formData.experience_type === experience.id}
                      onChange={() => handleExperienceChange(experience.id)}
                      required
                      className="sr-only"
                    />
                    <IconComponent
                      className={`w-8 h-8 mb-2 ${experience.color} transition-transform duration-300 hover:scale-110`}
                    />
                    <span className="text-sm font-medium text-gray-900 text-center">
                      {experience.label}
                    </span>
                    <span className="text-xs text-gray-500 text-center mt-1">
                      {experience.description}
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
            <div className="grid grid-cols-2 gap-3">
              {TRAVEL_PREFERENCES.map((pref) => {
                const preferenceImages = {
                  Adventure: "🧗‍♂️",
                  Relaxation: "🏖️",
                  Cultural: "🎭",
                  Food: "🍕",
                  Shopping: "🛍️",
                  Nature: "🌲",
                  Historical: "🏛️",
                  Nightlife: "🌃",
                  "Local Experiences": "🏘️",
                };

                return (
                  <label
                    key={pref}
                    className={`flex items-center p-3 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      formData.travel_preferences.includes(pref)
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-blue-300 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="travel_preferences"
                      value={pref}
                      checked={formData.travel_preferences.includes(pref)}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 mr-3 transition-all duration-200"
                    />
                    <span className="text-2xl mr-3 transition-transform duration-300 hover:scale-110">
                      {preferenceImages[pref]}
                    </span>
                    <span className="text-sm text-gray-700 font-medium">
                      {pref}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Budget */}
          <div className="bg-blue-50 rounded-2xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
            <label className="block text-sm font-medium text-blue-700 mb-4 transition-all duration-300">
              <IndianRupee className="w-5 h-5 inline mr-2 transition-transform duration-300 hover:scale-110" />
              What&apos;s your budget? (INR)
              {formData.mode_of_transport && formData.experience_type && (
                <span className="text-blue-600 ml-2 text-xs animate-fadeIn">
                  Suggested:{" "}
                  <IndianRupee className="w-3 h-3 inline transition-transform duration-300 hover:scale-110" />
                  {suggestedBudget.toLocaleString()} for{" "}
                  {getCurrentTransportOption()?.label} (
                  {getCurrentExperienceOption()?.label})
                </span>
              )}
            </label>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-xs">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 transition-all duration-300 group-hover:scale-110">
                    <IndianRupee className="w-5 h-5" />
                  </span>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min={suggestedBudget || currentBudgetRange.min}
                    className="w-full pl-10 pr-4 py-3 text-lg font-bold text-blue-600 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-500 ease-out backdrop-blur-sm bg-white/50 hover:bg-white/80 hover:border-blue-300 hover:shadow-lg group"
                    placeholder="Enter your budget"
                  />
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
              className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-2xl cursor-pointer hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-200 font-medium"
            >
              🎉 Create My Trip!
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
