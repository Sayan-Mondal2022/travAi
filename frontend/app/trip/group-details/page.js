// app/trip/group-details/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Users, Baby, Dog, ArrowLeft } from "lucide-react";

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

  // Fixed: Show children and elderly ONLY for family travel type
  const shouldShowChildrenElderly = () => {
    return travelType === "family";
  };

  // Fixed: Show pets ONLY for solo, duo, or family travel types
  const shouldShowPets = () => {
    return ["solo", "duo", "family"].includes(travelType);
  };

  const shouldDisableChildrenElderly = () => {
    return !shouldShowChildrenElderly();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 flex items-center justify-center p-4 transition-all duration-500">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md relative transform transition-all duration-300 hover:shadow-2xl">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="absolute left-4 top-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 hover:scale-110">
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 transform transition-all duration-300">
            Tell us about your group
          </h1>
          <p className="text-gray-600 transition-all duration-300">
            Help us customize your experience
          </p>

          {/* Show auto-filled info */}
          {!shouldShowPeopleCount() && (
            <div className="mt-4 p-3 bg-blue-50 rounded-2xl transform transition-all duration-300 scale-95 hover:scale-100">
              <p className="text-sm text-blue-700">
                ✅ People count automatically set to {formData.people_count}{" "}
                based on your selection:{" "}
                <span className="font-semibold capitalize">{travelType}</span>
              </p>
            </div>
          )}

          {!shouldShowChildrenElderly() && travelType && (
            <div className="mt-2 p-3 bg-green-50 rounded-2xl transform transition-all duration-300 scale-95 hover:scale-100">
              <p className="text-sm text-green-700">
                ℹ️ Children and elderly options hidden for{" "}
                <span className="font-semibold capitalize">{travelType}</span>{" "}
                travel
              </p>
            </div>
          )}

          {!shouldShowPets() && travelType && (
            <div className="mt-2 p-3 bg-orange-50 rounded-2xl transform transition-all duration-300 scale-95 hover:scale-100">
              <p className="text-sm text-orange-700">
                ℹ️ Pets option hidden for{" "}
                <span className="font-semibold capitalize">{travelType}</span>{" "}
                travel
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* People Count - Conditionally shown */}
          {shouldShowPeopleCount() && (
            <div className="bg-gray-50 rounded-xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                <User className="w-5 h-5 inline mr-2 text-blue-500 transition-transform duration-300 hover:scale-110" />
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
                  className="w-12 h-12 bg-gray-200 rounded-full text-2xl font-bold hover:bg-gray-300 hover:scale-110 active:scale-95 transition-all duration-200"
                >
                  -
                </button>
                <span className="text-4xl font-bold text-blue-600 min-w-[3rem] text-center transition-all duration-300">
                  {formData.people_count}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      people_count: prev.people_count + 1,
                    }))
                  }
                  className="w-12 h-12 bg-gray-200 rounded-full text-2xl font-bold hover:bg-gray-300 hover:scale-110 active:scale-95 transition-all duration-200"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Special Considerations - Conditionally shown */}
          {shouldShowChildrenElderly() && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  shouldDisableChildrenElderly()
                    ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                    : "border-gray-200 hover:border-blue-300 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  name="has_elderly"
                  checked={formData.has_elderly}
                  onChange={handleInputChange}
                  disabled={shouldDisableChildrenElderly()}
                  className="w-5 h-5 text-blue-600 mr-3 transition-all duration-200"
                />
                <div>
                  <span
                    className={`block font-medium ${
                      shouldDisableChildrenElderly()
                        ? "text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    Elderly people
                  </span>
                  <span className="text-sm text-gray-500">65+ years old</span>
                </div>
              </label>

              <label
                className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  shouldDisableChildrenElderly()
                    ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-60"
                    : "border-gray-200 hover:border-blue-300 bg-white"
                }`}
              >
                <input
                  type="checkbox"
                  name="has_children"
                  checked={formData.has_children}
                  onChange={handleInputChange}
                  disabled={shouldDisableChildrenElderly()}
                  className="w-5 h-5 text-blue-600 mr-3 transition-all duration-200"
                />
                <div>
                  <span
                    className={`block font-medium ${
                      shouldDisableChildrenElderly()
                        ? "text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    Children
                  </span>
                  <span className="text-sm text-gray-500">Under 12 years</span>
                </div>
              </label>
            </div>
          )}

          {/* Pets - Conditionally shown based on travel type */}
          {shouldShowPets() && (
            <div className="grid grid-cols-1 gap-4">
              <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] bg-white">
                <input
                  type="checkbox"
                  name="has_pets"
                  checked={formData.has_pets}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 mr-3 transition-all duration-200"
                />
                <div>
                  <span className="block font-medium text-gray-900">Pets</span>
                  <span className="text-sm text-gray-500">
                    Bringing furry friends
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Conditional Fields for Children */}
          {shouldShowChildrenElderly() && formData.has_children && (
            <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200 transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-medium text-yellow-700 mb-3">
                <Baby className="w-5 h-5 inline mr-2 transition-transform duration-300 hover:scale-110" />
                How many children?
              </label>
              <input
                type="number"
                name="children_count"
                value={formData.children_count}
                onChange={handleInputChange}
                min="0"
                max="10"
                className="w-full px-4 py-3 border border-yellow-300 rounded-2xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          )}

          {/* Conditional Fields for Elderly */}
          {shouldShowChildrenElderly() && formData.has_elderly && (
            <div className="bg-orange-50 rounded-xl p-6 border border-orange-200 transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-medium text-orange-700 mb-3">
                <User className="w-5 h-5 inline mr-2 transition-transform duration-300 hover:scale-110" />
                How many Elders?
              </label>
              <input
                type="number"
                name="elder_count"
                value={formData.elder_count}
                onChange={handleInputChange}
                min="0"
                max="10"
                className="w-full px-4 py-3 border border-orange-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          )}

          {/* Conditional Fields for Pets - Only shown if pets are allowed and has_pets is true */}
          {shouldShowPets() && formData.has_pets && (
            <div className="bg-green-50 rounded-xl p-6 border border-green-200 transform transition-all duration-300 hover:scale-[1.02]">
              <label className="block text-sm font-medium text-green-700 mb-3">
                <Dog className="w-5 h-5 inline mr-2 transition-transform duration-300 hover:scale-110" />
                How many pets?
              </label>
              <input
                type="number"
                name="pets_count"
                value={formData.pets_count}
                onChange={handleInputChange}
                min="0"
                max="5"
                className="w-full px-4 py-3 border border-green-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex space-x-4 pt-6">
            <button
              type="submit"
              className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-2xl hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all duration-200 font-medium cursor-pointer"
            >
              Next → Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}