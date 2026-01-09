"use client";

import { apiPost } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
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
  Check,
  ChevronRight,
} from "lucide-react";

/* ------------------ CONSTANTS ------------------ */

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
    multiplier: 0.7,
  },
  {
    id: "moderate",
    label: "Moderate",
    description: "Comfortable & balanced",
    icon: Star,
    multiplier: 1,
  },
  {
    id: "luxury",
    label: "Luxury",
    description: "Premium & luxurious",
    icon: Crown,
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

const preferenceImages = {
  Adventure: "🧗‍♂️",
  Relaxation: "🧘",
  Cultural: "🎭",
  Food: "🍕",
  Shopping: "🛍️",
  Nature: "🌲",
  Historical: "🏛️",
  Nightlife: "🌃",
  "Local Experiences": "🏙️",
};

const BUDGET_RANGES = {
  default: { min: 1500 },
  flight: { min: 3500 },
  train: { min: 1500 },
  car: { min: 1000 },
  bike: { min: 850 },
  mixed: { min: 2500 },
};

/* ------------------ COMPONENT ------------------ */

export default function PreferencesStep() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    mode_of_transport: "",
    experience_type: "",
    travel_preferences: [],
    budget: BUDGET_RANGES.default.min,
  });

  const [currentBudgetRange, setCurrentBudgetRange] = useState(
    BUDGET_RANGES.default
  );
  const [suggestedBudget, setSuggestedBudget] = useState(0);
  const [showInterestsAndBudget, setShowInterestsAndBudget] = useState(false);

  /* ------------------ ✅ LOAD FROM LOCALSTORAGE ON MOUNT ------------------ */
  useEffect(() => {
    // Load existing tripData
    const savedTripData = JSON.parse(localStorage.getItem("tripData") || "{}");

    // Load preferences if they exist
    if (
      savedTripData.mode_of_transport ||
      savedTripData.experience_type ||
      savedTripData.travel_preferences
    ) {
      setFormData({
        mode_of_transport: savedTripData.mode_of_transport || "",
        experience_type: savedTripData.experience_type || "",
        travel_preferences: savedTripData.travel_preferences || [],
        budget: savedTripData.budget || BUDGET_RANGES.default.min,
      });

      // If both transport and experience are set, show step 2
      if (savedTripData.mode_of_transport && savedTripData.experience_type) {
        setShowInterestsAndBudget(true);
      }
    }
  }, []);

  /* ------------------ ✅ SAVE TO LOCALSTORAGE WHENEVER FORMDATA CHANGES ------------------ */
  useEffect(() => {
    // Don't save on initial render (when everything is empty)
    if (
      !formData.mode_of_transport &&
      !formData.experience_type &&
      formData.travel_preferences.length === 0
    ) {
      return;
    }

    // Get existing tripData
    const savedTripData = JSON.parse(localStorage.getItem("tripData") || "{}");

    // Merge with new preferences
    const updatedTripData = {
      ...savedTripData,
      mode_of_transport: formData.mode_of_transport,
      experience_type: formData.experience_type,
      travel_preferences: formData.travel_preferences,
      budget: formData.budget,
    };

    // Save back to localStorage
    localStorage.setItem("tripData", JSON.stringify(updatedTripData));
    console.log("💾 Saved to localStorage:", updatedTripData);
  }, [formData]);

  /* ------------------ BUDGET CALCULATION EFFECT ------------------ */
  useEffect(() => {
    if (!formData.mode_of_transport) return;

    const range =
      BUDGET_RANGES[formData.mode_of_transport] || BUDGET_RANGES.default;
    setCurrentBudgetRange(range);

    let base = range.min;
    if (formData.experience_type) {
      const exp = EXPERIENCE_OPTIONS.find(
        (e) => e.id === formData.experience_type
      );
      base = Math.round(range.min * exp.multiplier);
    }

    setSuggestedBudget(base);
    setFormData((p) => ({ ...p, budget: base }));
  }, [formData.mode_of_transport, formData.experience_type]);

  const calculateDurationDays = (start, end) => {
    if (!start || !end) return 1;

    const startDate = new Date(start + "T00:00:00");
    const endDate = new Date(end + "T00:00:00");

    return Math.max(
      1,
      Math.round(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      )
    );
  };

  /* ------------------ HANDLERS ------------------ */

  const handleSubmit = async () => {
    const savedData = JSON.parse(localStorage.getItem("tripData") || "{}");
    const duration_days =
    savedData.trip_type === "round"
      ? calculateDurationDays(savedData.start_date, savedData.end_date) + 1
      : 1;

    const payload = {
      from_location: savedData.from_location,
      to_location: savedData.to_location,

      start_date: savedData.start_date,
      end_date: savedData.end_date || null,
      duration_days: duration_days,

      travel_type: savedData.travel_type,
      trip_type: savedData.trip_type,

      people_count: savedData.people_count,
      has_children: savedData.has_children || false,
      has_elderly: savedData.has_elderly || false,
      has_pets: savedData.has_pets || false,
      children_count: savedData.children_count || 0,
      elder_count: savedData.elder_count || 0,
      pets_count: savedData.pets_count || 0,

      mode_of_transport: formData.mode_of_transport,
      experience_type: formData.experience_type,
      travel_preferences: formData.travel_preferences,
      budget: Number(formData.budget),
    };

    const required = [
      "from_location",
      "to_location",
      "start_date",
      "travel_type",
      "trip_type",
      "mode_of_transport",
      "experience_type",
      "budget",
    ];

    const missing = required.filter((k) => !payload[k]);
    if (missing.length) {
      alert(`Missing required fields: ${missing.join(", ")}`);
      return;
    }

    try {
      console.log("🚀 Submitting payload:", payload);
      const result = await apiPost("/api/trip/add-trip/", payload);
      localStorage.setItem("currentTrip", JSON.stringify(result));

      // ✅ Also update tripData with the complete data
      localStorage.setItem("tripData", JSON.stringify(payload));

      router.push("/trip/places");
    } catch (err) {
      console.error(err);
      alert("Failed to create trip. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;

    if (name === "travel_preferences") {
      setFormData((p) => ({
        ...p,
        travel_preferences: checked
          ? [...p.travel_preferences, value]
          : p.travel_preferences.filter((i) => i !== value),
      }));
    } else if (type === "number") {
      setFormData((p) => ({ ...p, [name]: Number(value) }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const handleTransportChange = (id) =>
    setFormData((p) => ({ ...p, mode_of_transport: id }));

  const handleExperienceChange = (id) =>
    setFormData((p) => ({ ...p, experience_type: id }));

  const handleBack = () => {
    if (showInterestsAndBudget) setShowInterestsAndBudget(false);
    else router.back();
  };

  const handleContinueToInterests = () => {
    setShowInterestsAndBudget(true);
  };

  const handleEditPreferences = () => {
    setShowInterestsAndBudget(false);
  };

  const getCurrentTransportOption = () => {
    return TRANSPORT_OPTIONS.find((t) => t.id === formData.mode_of_transport);
  };

  const getCurrentExperienceOption = () => {
    return EXPERIENCE_OPTIONS.find((e) => e.id === formData.experience_type);
  };

  const isStepOneComplete =
    formData.mode_of_transport && formData.experience_type;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 w-full max-w-4xl border border-white/20">
        {/* Header */}
        <div className="relative text-center mb-8">
          <button
            onClick={handleBack}
            className="absolute left-0 top-0 p-2 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft className="text-[#03045e]" />
          </button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03045e] to-[#0077b6] bg-clip-text text-transparent">
              Final Preferences
            </h1>
            <p className="text-sm text-[#0077b6]">
              {!showInterestsAndBudget
                ? "Choose your travel style"
                : "What interests you?"}
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isStepOneComplete ? "w-20 bg-[#00b4d8]" : "w-12 bg-gray-300"
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              showInterestsAndBudget ? "w-20 bg-[#00b4d8]" : "w-12 bg-gray-300"
            }`}
          />
        </div>

        <div className="space-y-6">
          {/* STEP 1: Transport & Experience */}
          <div
            className={`transition-all duration-700 ease-in-out ${
              showInterestsAndBudget
                ? "opacity-0 h-0 overflow-hidden scale-95"
                : "opacity-100 scale-100"
            }`}
          >
            {/* Transport Preference */}
            <div className="mb-8">
              <label className="font-bold flex items-center gap-2 mb-4 text-[#03045e]">
                <Route className="text-[#00b4d8]" size={20} /> How do you want
                to travel?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {TRANSPORT_OPTIONS.map((transport) => {
                  const IconComponent = transport.icon;
                  return (
                    <button
                      key={transport.id}
                      type="button"
                      onClick={() => handleTransportChange(transport.id)}
                      className={`group relative flex flex-col items-center p-4 border-2 rounded-2xl transition-all duration-300 ${
                        formData.mode_of_transport === transport.id
                          ? "border-[#0077b6] bg-gradient-to-br from-[#caf0f8] to-[#90e0ef] shadow-lg scale-105"
                          : "border-gray-200 hover:border-[#00b4d8] hover:shadow-md hover:scale-102"
                      }`}
                    >
                      {formData.mode_of_transport === transport.id && (
                        <div className="absolute -top-2 -right-2 bg-[#0077b6] rounded-full p-1 shadow-lg animate-bounce">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      {transport.icon ? (
                        <IconComponent
                          className={`w-8 h-8 mb-2 ${transport.color} transition-transform duration-300 group-hover:scale-110`}
                        />
                      ) : (
                        <span className="text-2xl mb-2 transition-transform duration-300 group-hover:scale-110">
                          {transport.emoji}
                        </span>
                      )}
                      <span className="text-sm font-semibold text-[#03045e]">
                        {transport.label}
                      </span>
                      <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        Min: <IndianRupee className="w-3 h-3" />
                        {transport.minBudget.toLocaleString()}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience Type */}
            <div
              className={`transition-all duration-500 ${
                formData.mode_of_transport
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 pointer-events-none"
              }`}
            >
              <label className="font-bold flex items-center gap-2 mb-4 text-[#03045e]">
                <Star className="text-[#00b4d8]" size={20} /> What type of
                experience do you prefer?
              </label>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {EXPERIENCE_OPTIONS.map((experience) => {
                  const IconComponent = experience.icon;
                  return (
                    <button
                      key={experience.id}
                      type="button"
                      onClick={() => handleExperienceChange(experience.id)}
                      className={`group relative flex flex-col items-center p-4 border-2 rounded-2xl transition-all duration-300 ${
                        formData.experience_type === experience.id
                          ? "border-[#0077b6] bg-gradient-to-br from-[#caf0f8] to-[#90e0ef] shadow-lg scale-105"
                          : "border-gray-200 hover:border-[#00b4d8] hover:shadow-md hover:scale-102"
                      }`}
                    >
                      {formData.experience_type === experience.id && (
                        <div className="absolute -top-2 -right-2 bg-[#0077b6] rounded-full p-1 shadow-lg animate-bounce">
                          <Check size={14} className="text-white" />
                        </div>
                      )}
                      <IconComponent
                        className={`w-8 h-8 mb-2 ${experience.color} transition-transform duration-300 group-hover:scale-110`}
                      />
                      <span className="text-sm font-semibold text-[#03045e] text-center">
                        {experience.label}
                      </span>
                      <span className="text-xs text-gray-500 text-center mt-1">
                        {experience.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {isStepOneComplete && (
                <button
                  type="button"
                  onClick={handleContinueToInterests}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#03045e] text-white font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  Continue to Interests
                  <ChevronRight
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              )}
            </div>
          </div>

          {/* STEP 2: Interests & Budget */}
          <div
            className={`transition-all duration-700 ease-in-out ${
              showInterestsAndBudget
                ? "opacity-100 scale-100"
                : "opacity-0 h-0 overflow-hidden scale-95"
            }`}
          >
            {/* Selection Summary */}
            {showInterestsAndBudget && (
              <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#caf0f8]/60 to-[#90e0ef]/40 border-2 border-[#00b4d8]/30 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0077b6]">
                        {getCurrentTransportOption()?.label} •{" "}
                        {getCurrentExperienceOption()?.label}
                      </p>
                      <p className="text-xs text-gray-600">
                        {getCurrentExperienceOption()?.description}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleEditPreferences}
                    className="text-xs text-[#0077b6] hover:text-[#03045e] font-semibold transition-colors duration-300"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}

            {/* Travel Preferences */}
            <div className="mb-6">
              <label className="font-bold flex items-center gap-2 mb-4 text-[#03045e]">
                <span className="text-xl">🌟</span> What are you interested in?
                <span className="text-xs font-normal text-gray-500 ml-2">
                  (Optional)
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TRAVEL_PREFERENCES.map((pref) => (
                  <label
                    key={pref}
                    className={`flex items-center p-3 border-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-102 ${
                      formData.travel_preferences.includes(pref)
                        ? "border-[#0077b6] bg-gradient-to-br from-[#caf0f8] to-[#90e0ef] shadow-md"
                        : "border-gray-200 hover:border-[#00b4d8] hover:shadow-sm"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="travel_preferences"
                      value={pref}
                      checked={formData.travel_preferences.includes(pref)}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 mr-3"
                    />
                    <span className="text-2xl mr-3 transition-transform duration-300 hover:scale-110">
                      {preferenceImages[pref]}
                    </span>
                    <span className="text-sm text-[#03045e] font-medium">
                      {pref}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="bg-gradient-to-br from-[#caf0f8]/40 to-[#90e0ef]/30 rounded-2xl p-6 border-2 border-[#00b4d8]/20">
              <label className="block text-sm font-bold text-[#03045e] mb-4">
                <IndianRupee className="w-5 h-5 inline mr-2" />
                What&apos;s your budget? (INR)
                {formData.mode_of_transport && formData.experience_type && (
                  <span className="block text-[#0077b6] mt-2 text-xs font-normal">
                    Suggested: <IndianRupee className="w-3 h-3 inline" />
                    {suggestedBudget.toLocaleString()} for{" "}
                    {getCurrentTransportOption()?.label} (
                    {getCurrentExperienceOption()?.label})
                  </span>
                )}
              </label>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-xs">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#0077b6]">
                    <IndianRupee className="w-5 h-5" />
                  </span>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleInputChange}
                    min={suggestedBudget || currentBudgetRange.min}
                    className="w-full pl-10 pr-4 py-3 text-lg font-bold text-[#03045e] border-2 border-[#00b4d8]/30 rounded-xl focus:border-[#0077b6] focus:ring-4 focus:ring-[#00b4d8]/20 transition-all duration-300 bg-white hover:border-[#00b4d8] hover:shadow-lg"
                    placeholder="Enter your budget"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleSubmit}
              className="mt-6 w-full py-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#03045e] text-white font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-2 group"
            >
              🎉 Show me places!!
              <ChevronRight
                size={20}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
