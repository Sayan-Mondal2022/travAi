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

  const validateForm = () => {
    // Check if children checkbox is checked but count is 0
    if (formData.has_children && formData.children_count === 0) {
      alert("Please enter the number of children traveling with you.");
      return false;
    }

    // Check if elderly checkbox is checked but count is 0
    if (formData.has_elderly && formData.elder_count === 0) {
      alert("Please enter the number of elderly companions traveling with you.");
      return false;
    }

    // Check if pets checkbox is checked but count is 0
    if (formData.has_pets && formData.pets_count === 0) {
      alert("Please enter the number of pets traveling with you.");
      return false;
    }

    // Check if people count is shown and is valid
    if (shouldShowPeopleCount() && formData.people_count < 1) {
      alert("Please enter a valid number of people.");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4 transition-all duration-500">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 w-full max-w-2xl border border-white/30">
        {/* Back Button */}
        <button
          onClick={handleBack}
          type="button"
          className="p-2 rounded-2xl text-[#0077b6] hover:bg-blue-50 transition-all mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center bg-gradient-to-br from-[#00b4d8] to-[#0077b6] shadow-md">
            <Users className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[#03045e] mb-2">Group Details</h1>
          <p className="text-sm text-[#0077b6]">Tell us about your travel companions</p>

          {/* Travel Type Badge */}
          {travelType && (
            <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#caf0f8] to-[#90e0ef] rounded-2xl border border-[#00b4d8]">
              <span className="text-xl">{getTravelTypeEmoji()}</span>
              <span className="text-sm font-semibold text-[#03045e] capitalize">
                {travelType} Trip
              </span>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* People Count - Conditionally shown */}
          {shouldShowPeopleCount() && (
            <div className="rounded-2xl p-4 bg-white border border-[#90e0ef] shadow-md">
              <label className="flex items-center gap-2 text-sm font-bold text-[#03045e] mb-4">
                <User className="w-4 h-4 text-[#00b4d8]" />
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
                  className="w-12 h-12 bg-white rounded-2xl text-xl font-bold border-2 border-[#90e0ef] hover:border-[#00b4d8] hover:bg-[#caf0f8]/30 transition-all shadow-md"
                >
                  −
                </button>
                <div className="relative">
                  <span className="text-4xl font-bold text-[#0077b6]">
                    {formData.people_count}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      people_count: prev.people_count + 1,
                    }))
                  }
                  className="w-12 h-12 bg-white rounded-2xl text-xl font-bold border-2 border-[#90e0ef] hover:border-[#00b4d8] hover:bg-[#caf0f8]/30 transition-all shadow-md"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Special Considerations - Conditionally shown */}
          {shouldShowChildrenElderly() && (
            <div className="rounded-2xl p-4 bg-white border border-[#90e0ef] shadow-md space-y-3">
              <label className="flex items-center gap-2 text-sm font-bold text-[#03045e] mb-2">
                <Heart className="w-4 h-4 text-[#00b4d8]" />
                Special Considerations
              </label>

              <label className={`flex items-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${
                formData.has_elderly
                  ? "border-[#0077b6] bg-[#caf0f8]/40 shadow-md"
                  : "border-[#90e0ef] bg-white hover:bg-[#eefaff]"
              }`}>
                <input
                  type="checkbox"
                  name="has_elderly"
                  checked={formData.has_elderly}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#0077b6] mr-3"
                />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#90e0ef]/50 rounded-2xl flex items-center justify-center">
                    <Heart className="w-4 h-4 text-[#0077b6]" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-[#03045e]">Elderly Companions</span>
                    <span className="text-xs text-[#0077b6]">65+ years old</span>
                  </div>
                </div>
              </label>

              <label className={`flex items-center p-3 border-2 rounded-2xl cursor-pointer transition-all ${
                formData.has_children
                  ? "border-[#0077b6] bg-[#caf0f8]/40 shadow-md"
                  : "border-[#90e0ef] bg-white hover:bg-[#eefaff]"
              }`}>
                <input
                  type="checkbox"
                  name="has_children"
                  checked={formData.has_children}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#0077b6] mr-3"
                />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#90e0ef]/50 rounded-2xl flex items-center justify-center">
                    <Baby className="w-4 h-4 text-[#0077b6]" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-[#03045e]">Children</span>
                    <span className="text-xs text-[#0077b6]">Under 12 years</span>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Pets - Conditionally shown */}
          {shouldShowPets() && (
            <div className="rounded-2xl p-4 bg-white border-[#90e0ef] shadow-md">
              <label className={`flex items-center p-3 rounded-2xl cursor-pointer transition-all ${
                formData.has_pets
                  ? "border-[#0077b6] bg-[#caf0f8]/40 shadow-md"
                  : "border-[#90e0ef] bg-white hover:bg-[#eefaff]"
              }`}>
                <input
                  type="checkbox"
                  name="has_pets"
                  checked={formData.has_pets}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#0077b6] mr-3"
                />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#90e0ef]/50 rounded-2xl flex items-center justify-center">
                    <Dog className="w-4 h-4 text-[#0077b6]" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-[#03045e]">Pets</span>
                    <span className="text-xs text-[#0077b6]">Bringing furry friends</span>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Conditional Fields for Children */}
          {shouldShowChildrenElderly() && formData.has_children && (
            <div className="rounded-2xl p-4 bg-white border border-[#90e0ef] shadow-md">
              <label className="flex items-center gap-2 text-sm font-bold text-[#03045e] mb-3">
                <Baby className="w-4 h-4 text-[#00b4d8]" />
                How many children?
              </label>
              <input
                type="number"
                name="children_count"
                value={formData.children_count}
                onChange={handleInputChange}
                min="0"
                max="10"
                className="w-full px-4 py-2 text-base font-semibold text-[#03045e] border-2 border-[#90e0ef] rounded-2xl focus:border-[#00b4d8] focus:ring-4 focus:ring-[#caf0f8]/50 outline-none transition-all bg-white"
                placeholder="0"
              />
            </div>
          )}

          {/* Conditional Fields for Elderly */}
          {shouldShowChildrenElderly() && formData.has_elderly && (
            <div className="rounded-2xl p-4 bg-white border border-[#90e0ef] shadow-md">
              <label className="flex items-center gap-2 text-sm font-bold text-[#03045e] mb-3">
                <Heart className="w-4 h-4 text-[#00b4d8]" />
                How many elders?
              </label>
              <input
                type="number"
                name="elder_count"
                value={formData.elder_count}
                onChange={handleInputChange}
                min="0"
                max="10"
                className="w-full px-4 py-2 text-base font-semibold text-[#03045e] border-2 border-[#90e0ef] rounded-2xl focus:border-[#00b4d8] focus:ring-4 focus:ring-[#caf0f8]/50 outline-none transition-all bg-white"
                placeholder="0"
              />
            </div>
          )}

          {/* Conditional Fields for Pets */}
          {shouldShowPets() && formData.has_pets && (
            <div className="rounded-2xl p-4 bg-white border border-[#90e0ef] shadow-md">
              <label className="flex items-center gap-2 text-sm font-bold text-[#03045e] mb-3">
                <Dog className="w-4 h-4 text-[#00b4d8]" />
                How many pets?
              </label>
              <input
                type="number"
                name="pets_count"
                value={formData.pets_count}
                onChange={handleInputChange}
                min="0"
                max="5"
                className="w-full px-4 py-2 text-base font-semibold text-[#03045e] border-2 border-[#90e0ef] rounded-2xl focus:border-[#00b4d8] focus:ring-4 focus:ring-[#caf0f8]/50 outline-none transition-all bg-white"
                placeholder="0"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-2xl text-white bg-gradient-to-r from-[#00b4d8] to-[#03045e] text-base font-bold shadow-md hover:opacity-90 transition-all"
            >
              Continue to Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}