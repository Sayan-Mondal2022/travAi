// app/trip/group-details/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Users, Baby, Dog, ArrowLeft, Heart, Sparkles } from "lucide-react";

export default function GroupDetailsStep() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    people_count: 1,
    has_elderly: false,
    has_children: false,
    has_pets: false,
    children_count: 0,
    elder_count: 0,
    pets_count: 0,
  });

  const [travelType, setTravelType] = useState("");

  useEffect(() => {
    // Load previous data
    const savedData = localStorage.getItem("tripData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData((prev) => ({ ...prev, ...parsedData }));
      setTravelType(parsedData.travel_type || "");

      // Auto-set people_count based on travel type
      if (parsedData.travel_type) {
        handleTravelTypeAutoFill(parsedData.travel_type);
      }
    }
  }, []);

  const handleTravelTypeAutoFill = (type) => {
    switch (type) {
      case "solo":
        setFormData((prev) => ({
          ...prev,
          people_count: 1,
          has_elderly: false,
          has_children: false,
          children_count: 0,
          elder_count: 0,
        }));
        break;
      case "duo":
        setFormData((prev) => ({
          ...prev,
          people_count: 2,
          has_elderly: false,
          has_children: false,
          children_count: 0,
          elder_count: 0,
        }));
        break;
      case "couple":
        setFormData((prev) => ({
          ...prev,
          people_count: 2,
          has_elderly: false,
          has_children: false,
          children_count: 0,
          elder_count: 0,
        }));
        break;
      case "friends":
        setFormData((prev) => ({
          ...prev,
          has_elderly: false,
          has_children: false,
          children_count: 0,
          elder_count: 0,
        }));
        break;
      case "business":
        setFormData((prev) => ({
          ...prev,
          has_elderly: false,
          has_children: false,
          children_count: 0,
          elder_count: 0,
        }));
        break;
      default:
        // Keep existing values for family
        break;
    }
  };

  const shouldShowPeopleCount = () => {
    return !["solo", "duo", "couple"].includes(travelType);
  };

  const shouldShowChildrenElderly = () => {
    return travelType === "family";
  };

  const shouldShowPets = () => {
    return ["solo", "duo", "family"].includes(travelType);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save data
    const allData = {
      ...JSON.parse(localStorage.getItem("tripData")),
      ...formData,
    };
    localStorage.setItem("tripData", JSON.stringify(allData));
    router.push("/trip/preferences");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleBack = () => {
    router.back();
  };

  // Get travel type emoji
  const getTravelTypeEmoji = () => {
    const emojis = {
      solo: "🧍",
      duo: "👥",
      couple: "💑",
      family: "👨‍👩‍👧‍👦",
      friends: "👯‍♂️",
      business: "💼"
    };
    return emojis[travelType] || "👥";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4 transition-all duration-500">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative transform transition-all duration-300 hover:shadow-3xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute left-6 top-6 p-3 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-2xl transition-all duration-300 cursor-pointer transform hover:scale-110"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-500 hover:scale-110 hover:rotate-3 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 transform transition-all duration-300">
            Group Details
          </h1>
          <p className="text-gray-600 transition-all duration-300">
            Tell us about your travel companions
          </p>

          {/* Travel Type Badge */}
          {travelType && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl border border-purple-200 transform transition-all duration-300 hover:scale-105">
              <span className="text-2xl">{getTravelTypeEmoji()}</span>
              <span className="text-sm font-semibold text-purple-700 capitalize">
                {travelType} Trip
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* People Count - Conditionally shown */}
          {shouldShowPeopleCount() && (
            <div className="group">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 transform transition-all duration-500 group-hover:border-blue-400 group-hover:shadow-xl group-hover:scale-[1.02]">
                <label className="block text-sm font-semibold text-blue-700 mb-4">
                  <User className="w-5 h-5 inline mr-2 transition-transform duration-300 group-hover:scale-110" />
                  How many people total?
                </label>
                <div className="flex items-center justify-center space-x-4">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        people_count: Math.max(1, prev.people_count - 1),
                      }))
                    }
                    className="w-14 h-14 bg-white rounded-2xl text-2xl font-bold border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    −
                  </button>
                  <div className="relative">
                    <span className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent transition-all duration-300">
                      {formData.people_count}
                    </span>
                    <Sparkles className="w-4 h-4 text-yellow-500 absolute -top-2 -right-2 animate-pulse" />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        people_count: prev.people_count + 1,
                      }))
                    }
                    className="w-14 h-14 bg-white rounded-2xl text-2xl font-bold border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Special Considerations - Conditionally shown */}
          {shouldShowChildrenElderly() && (
            <div className="grid grid-cols-1 gap-4">
              <div className="group">
                <label className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-[1.02] ${
                  formData.has_elderly
                    ? "border-orange-500 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg scale-105"
                    : "border-gray-200 hover:border-orange-300 bg-white hover:shadow-lg"
                }`}>
                  <input
                    type="checkbox"
                    name="has_elderly"
                    checked={formData.has_elderly}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-orange-600 mr-4 transition-all duration-300"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Heart className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <span className="block font-semibold text-gray-900">Elderly Companions</span>
                      <span className="text-sm text-gray-500">65+ years old</span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="group">
                <label className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-[1.02] ${
                  formData.has_children
                    ? "border-yellow-500 bg-gradient-to-r from-yellow-50 to-amber-50 shadow-lg scale-105"
                    : "border-gray-200 hover:border-yellow-300 bg-white hover:shadow-lg"
                }`}>
                  <input
                    type="checkbox"
                    name="has_children"
                    checked={formData.has_children}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-yellow-600 mr-4 transition-all duration-300"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                      <Baby className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <span className="block font-semibold text-gray-900">Children</span>
                      <span className="text-sm text-gray-500">Under 12 years</span>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Pets - Conditionally shown */}
          {shouldShowPets() && (
            <div className="group">
              <label className={`flex items-center p-5 border-2 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-[1.02] ${
                formData.has_pets
                  ? "border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-lg scale-105"
                  : "border-gray-200 hover:border-green-300 bg-white hover:shadow-lg"
              }`}>
                <input
                  type="checkbox"
                  name="has_pets"
                  checked={formData.has_pets}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-green-600 mr-4 transition-all duration-300"
                />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110">
                    <Dog className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <span className="block font-semibold text-gray-900">Pets</span>
                    <span className="text-sm text-gray-500">Bringing furry friends</span>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Conditional Fields for Children */}
          {shouldShowChildrenElderly() && formData.has_children && (
            <div className="group">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-300 transform transition-all duration-500 group-hover:border-yellow-400 group-hover:shadow-lg group-hover:scale-[1.02]">
                <label className="block text-sm font-semibold text-yellow-700 mb-4">
                  <Baby className="w-5 h-5 inline mr-2 transition-transform duration-300 group-hover:scale-110" />
                  How many children?
                </label>
                <input
                  type="number"
                  name="children_count"
                  value={formData.children_count}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  className="w-full px-4 py-3 text-lg font-semibold text-yellow-700 border-2 border-yellow-300 rounded-2xl focus:border-yellow-500 focus:ring-4 focus:ring-yellow-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-yellow-400"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Conditional Fields for Elderly */}
          {shouldShowChildrenElderly() && formData.has_elderly && (
            <div className="group">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border-2 border-orange-300 transform transition-all duration-500 group-hover:border-orange-400 group-hover:shadow-lg group-hover:scale-[1.02]">
                <label className="block text-sm font-semibold text-orange-700 mb-4">
                  <Heart className="w-5 h-5 inline mr-2 transition-transform duration-300 group-hover:scale-110" />
                  How many elders?
                </label>
                <input
                  type="number"
                  name="elder_count"
                  value={formData.elder_count}
                  onChange={handleInputChange}
                  min="0"
                  max="10"
                  className="w-full px-4 py-3 text-lg font-semibold text-orange-700 border-2 border-orange-300 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-orange-400"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Conditional Fields for Pets */}
          {shouldShowPets() && formData.has_pets && (
            <div className="group">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-300 transform transition-all duration-500 group-hover:border-green-400 group-hover:shadow-lg group-hover:scale-[1.02]">
                <label className="block text-sm font-semibold text-green-700 mb-4">
                  <Dog className="w-5 h-5 inline mr-2 transition-transform duration-300 group-hover:scale-110" />
                  How many pets?
                </label>
                <input
                  type="number"
                  name="pets_count"
                  value={formData.pets_count}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  className="w-full px-4 py-3 text-lg font-semibold text-green-700 border-2 border-green-300 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-100 outline-none transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-green-400"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="pt-6 transform transition-all duration-300 hover:scale-[1.01]">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl hover:from-purple-700 hover:to-pink-700 hover:scale-105 active:scale-95 transition-all duration-300 font-bold shadow-2xl cursor-pointer group"
            >
              <span className="flex items-center justify-center gap-3">
                Continue to Preferences 
                <Sparkles className="w-5 h-5 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
              </span>
            </button>
          </div>
        </form>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
      </div>
    </div>
  );
}