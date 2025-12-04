"use client";

import { useState, useEffect } from "react";
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
  Heart,
  Sparkles,
  Check,
} from "lucide-react";

const WEATHER_OPTIONS = [
  { id: "warm", label: "Warm Climate", emoji: "☀️", desc: "25°C+" },
  { id: "cool", label: "Cool Weather", emoji: "🌤️", desc: "15-25°C" },
  { id: "cold", label: "Cold Climate", emoji: "❄️", desc: "Below 15°C" },
  { id: "any", label: "Flexible", emoji: "🌈", desc: "Any weather" },
];

const TRANSPORT_OPTIONS = [
  { id: "flight", label: "Flight", icon: Plane, minBudget: 1500 },
  { id: "train", label: "Train", icon: Train, minBudget: 800 },
  { id: "car", label: "Car", icon: Car, minBudget: 600 },
  { id: "bike", label: "Bike", icon: Bike, minBudget: 300 },
  { id: "mixed", label: "Mixed", icon: Route, minBudget: 1000 },
];

const EXPERIENCE_OPTIONS = [
  { id: "budget", label: "Budget", description: "Cost-effective travel", icon: Wallet, multiplier: 0.7 },
  { id: "moderate", label: "Moderate", description: "Balanced comfort", icon: Star, multiplier: 1 },
  { id: "luxury", label: "Luxury", description: "Premium experience", icon: Crown, multiplier: 1.5 },
];

const TRAVEL_PREFERENCES = [
  { id: "Adventure", label: "Adventure", icon: "🏔️" },
  { id: "Relaxation", label: "Relaxation", icon: "🧘" },
  { id: "Romantic", label: "Romantic", icon: "💑" },
  { id: "Cultural", label: "Cultural", icon: "🏛️" },
  { id: "Food", label: "Culinary", icon: "🍜" },
  { id: "Shopping", label: "Shopping", icon: "🛍️" },
  { id: "Nature", label: "Nature", icon: "🌲" },
  { id: "Historical", label: "Historical", icon: "📜" },
  { id: "Nightlife", label: "Nightlife", icon: "🌃" },
  { id: "Local Experiences", label: "Local Culture", icon: "🏘️" },
];

const BUDGET_RANGES = {
  default: { min: 1500, step: 500 },
  flight: { min: 3500, step: 500 },
  train: { min: 1500, step: 500 },
  car: { min: 1000, step: 500 },
  bike: { min: 850, step: 500 },
  mixed: { min: 2500, step: 500 },
};

export default function PreferencesStep() {
  const [formData, setFormData] = useState({
    weather_preference: "",
    mode_of_transport: "",
    experience_type: "",
    travel_preferences: [],
    budget: BUDGET_RANGES.default.min,
  });
  const [currentBudgetRange, setCurrentBudgetRange] = useState(BUDGET_RANGES.default);
  const [suggestedBudget, setSuggestedBudget] = useState(0);

  useEffect(() => {
    if (formData.mode_of_transport) {
      const newRange = BUDGET_RANGES[formData.mode_of_transport] || BUDGET_RANGES.default;
      setCurrentBudgetRange(newRange);

      let baseBudget = newRange.min;
      if (formData.experience_type) {
        const experience = EXPERIENCE_OPTIONS.find((exp) => exp.id === formData.experience_type);
        baseBudget = Math.round(newRange.min * experience.multiplier);
      }

      setSuggestedBudget(baseBudget);

      if (formData.experience_type || formData.mode_of_transport) {
        setFormData((prev) => ({ ...prev, budget: baseBudget }));
      }
    }
  }, [formData.mode_of_transport, formData.experience_type]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Trip preferences saved! (Demo mode - no backend)");
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
    setFormData((prev) => ({ ...prev, mode_of_transport: transportId }));
  };

  const handleExperienceChange = (experienceId) => {
    setFormData((prev) => ({ ...prev, experience_type: experienceId }));
  };

  const handlePreferenceToggle = (prefId) => {
    setFormData((prev) => ({
      ...prev,
      travel_preferences: prev.travel_preferences.includes(prefId)
        ? prev.travel_preferences.filter((item) => item !== prefId)
        : [...prev.travel_preferences, prefId],
    }));
  };

  const getCurrentExperienceOption = () => {
    return EXPERIENCE_OPTIONS.find((option) => option.id === formData.experience_type);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 w-full max-w-7xl relative z-10 border border-white/60">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
          <button
            onClick={() => window.history.back()}
            className="p-2.5 text-gray-600 hover:text-[#0077b6] hover:bg-blue-50 rounded-lg transition-all duration-200 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform duration-200" />
          </button>

          <div className="flex-1 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-xl mb-3 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Travel Preferences
            </h1>
            <p className="text-gray-600 text-sm">Customize your perfect journey</p>
          </div>

          <div className="w-10"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Weather Preference */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Cloud className="w-5 h-5 text-[#0077b6]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Climate Preference</h3>
                  <p className="text-sm text-gray-500">Select your ideal weather</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {WEATHER_OPTIONS.map((weather) => (
                  <button
                    key={weather.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, weather_preference: weather.id }))}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                      formData.weather_preference === weather.id
                        ? "border-[#0077b6] bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{weather.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm mb-0.5">{weather.label}</div>
                        <div className="text-xs text-gray-500">{weather.desc}</div>
                      </div>
                    </div>
                    {formData.weather_preference === weather.id && (
                      <div className="absolute top-3 right-3 w-5 h-5 bg-[#0077b6] rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Travel Interests */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Heart className="w-5 h-5 text-[#0077b6]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Travel Interests</h3>
                  <p className="text-sm text-gray-500">Select activities you enjoy (optional)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#0077b6 #e5e7eb'}}>
                {TRAVEL_PREFERENCES.map((pref) => (
                  <button
                    key={pref.id}
                    type="button"
                    onClick={() => handlePreferenceToggle(pref.id)}
                    className={`relative p-3 rounded-xl border-2 transition-all duration-200 ${
                      formData.travel_preferences.includes(pref.id)
                        ? "border-[#0077b6] bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{pref.icon}</span>
                      <span className="text-sm font-medium text-gray-900">{pref.label}</span>
                    </div>
                    {formData.travel_preferences.includes(pref.id) && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-[#0077b6] rounded-full flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Experience Type */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Star className="w-5 h-5 text-[#0077b6]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Experience Level</h3>
                  <p className="text-sm text-gray-500">Choose your travel style</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {EXPERIENCE_OPTIONS.map((experience) => {
                  const IconComponent = experience.icon;
                  return (
                    <button
                      key={experience.id}
                      type="button"
                      onClick={() => handleExperienceChange(experience.id)}
                      className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                        formData.experience_type === experience.id
                          ? "border-[#0077b6] bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col items-center text-center">
                        <IconComponent className={`w-7 h-7 mb-2 ${
                          experience.id === 'budget' ? 'text-green-600' :
                          experience.id === 'moderate' ? 'text-amber-500' :
                          'text-purple-600'
                        }`} />
                        <div className="font-semibold text-gray-900 text-sm mb-0.5">{experience.label}</div>
                        <div className="text-xs text-gray-500">{experience.description}</div>
                      </div>
                      {formData.experience_type === experience.id && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-[#0077b6] rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Transport Mode */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Route className="w-5 h-5 text-[#0077b6]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Transportation</h3>
                  <p className="text-sm text-gray-500">How will you travel?</p>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2.5">
                {TRANSPORT_OPTIONS.map((transport) => {
                  const IconComponent = transport.icon;
                  return (
                    <button
                      key={transport.id}
                      type="button"
                      onClick={() => handleTransportChange(transport.id)}
                      className={`relative p-3.5 rounded-xl border-2 transition-all duration-200 ${
                        formData.mode_of_transport === transport.id
                          ? "border-[#0077b6] bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <IconComponent className="w-6 h-6 mb-1.5 text-[#0077b6]" />
                        <span className="text-xs font-medium text-gray-700">{transport.label}</span>
                      </div>
                      {formData.mode_of_transport === transport.id && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0077b6] rounded-full flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <IndianRupee className="w-5 h-5 text-[#0077b6]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Budget</h3>
                    <p className="text-sm text-gray-500">Set your spending limit</p>
                  </div>
                </div>
                {formData.mode_of_transport && formData.experience_type && (
                  <div className="text-xs font-medium bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white px-3 py-1.5 rounded-full">
                    Suggested: ₹{suggestedBudget.toLocaleString()}
                  </div>
                )}
              </div>

              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  name="budget"
                  value={formData.budget}
                  onChange={handleInputChange}
                  min={suggestedBudget || BUDGET_RANGES.default.min}
                  step="500"
                  className="w-full pl-12 pr-4 py-3.5 text-lg font-semibold text-gray-900 border-2 border-gray-200 rounded-xl focus:border-[#0077b6] focus:ring-2 focus:ring-blue-100 transition-all duration-200 bg-white"
                  placeholder="Enter amount"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!formData.weather_preference || !formData.mode_of_transport || !formData.experience_type}
            className="w-full bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#0077b6] text-white py-4 px-6 rounded-xl hover:shadow-lg active:scale-[0.99] transition-all duration-200 font-semibold text-base shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100 flex items-center justify-center gap-2 group"
          >
            Create Itinerary
            <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </div>
  );
}