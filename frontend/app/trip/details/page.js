// app/trip/details/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, ArrowLeft } from "lucide-react";

const TRAVEL_TYPES = [
  { id: "solo", label: "Solo", emoji: "🧍", description: "Traveling alone" },
  {
    id: "duo",
    label: "Duo",
    emoji: "🧑‍🤝‍🧑",
    description: "Two people traveling together",
  },
  {
    id: "couple",
    label: "Couple",
    emoji: "👩‍❤️‍👨",
    description: "Romantic getaway",
  },
  {
    id: "family",
    label: "Family",
    emoji: "👨‍👩‍👧‍👦",
    description: "With family members",
  },
  {
    id: "friends",
    label: "Friends",
    emoji: "👯‍♂️",
    description: "Group of friends",
  },
  {
    id: "business",
    label: "Business",
    emoji: "💼",
    description: "Business trip",
  },
];

export default function DetailsStep() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    date: "",
    travel_type: "",
    duration_days: 2,
  });

  useEffect(() => {
    // Load previous data from localStorage
    const savedData = localStorage.getItem("tripData");
    if (savedData) {
      setFormData((prev) => ({ ...prev, ...JSON.parse(savedData) }));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.date || !formData.travel_type) {
      alert("Please fill in all fields");
      return;
    }

    // Save updated data
    const allData = {
      ...JSON.parse(localStorage.getItem("tripData") || "{}"),
      ...formData,
    };
    localStorage.setItem("tripData", JSON.stringify(allData));

    // Route to next step (group details)
    router.push("/trip/group-details");
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={handleBack}
            className="absolute left-4 top-4 p-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-5 h-5 cursor-pointer rounded-2xl" />
          </button>

          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Trip Details
          </h1>
          <p className="text-gray-600">When and who&apos;s traveling?</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date */}
          <div className="bg-gray-50 rounded-2xl p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 inline mr-2 text-green-500" />
              When are you going?
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 text-lg border border-green-300 rounded-2xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-200"
            />
          </div>

          {/* Duration */}
          <div className="bg-blue-50 rounded-2xl p-4 transition-all duration-200">
            <label className="block text-sm font-medium text-blue-700 mb-3 cursor-pointer">
              ⏰ How many days?
            </label>
            <div className="flex items-center space-x-3 mb-2">
              <input
                type="range"
                name="duration_days"
                value={formData.duration_days}
                onChange={handleInputChange}
                min="1"
                max="30"
                className="flex-1 cursor-pointer transition-all duration-200"
              />
              <span className="text-xl font-bold text-blue-600 min-w-[2rem] transition-all duration-200">
                {formData.duration_days}
              </span>
            </div>
            <div className="flex justify-between text-xs text-blue-500">
              <span>1 day</span>
              <span>30 days</span>
            </div>
          </div>

          {/* Travel Type */}
          <div className="bg-pink-50 rounded-2xl p-4">
            <label className="block text-sm font-medium text-pink-700 mb-3">
              <Users className="w-4 h-4 inline mr-2 text-pink-500" />
              Who&apos;s traveling?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TRAVEL_TYPES.map((type) => (
                <label
                  key={type.id}
                  className={`flex flex-col items-center p-3 border-2 rounded-3xl cursor-pointer transition-all duration-300 ease-out ${
                    formData.travel_type === type.id
                      ? "border-pink-500 bg-white shadow-md scale-105 ring-2 ring-pink-200"
                      : "border-gray-200 bg-white hover:border-pink-300 hover:shadow-lg hover:scale-[1.03] active:scale-95"
                  }`}
                >
                  <input
                    type="radio"
                    name="travel_type"
                    value={type.id}
                    checked={formData.travel_type === type.id}
                    onChange={handleInputChange}
                    required
                    className="sr-only"
                  />
                  <span className="text-xl mb-1 transition-all duration-300 ease-out hover:scale-110">
                    {type.emoji}
                  </span>
                  <span className="text-xs font-medium text-gray-900">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-2xl hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold shadow-lg transform hover:scale-105 transition-transform disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              disabled={!formData.date || !formData.travel_type}
            >
              Continue to Group Details →
            </button>
          </div>
        </form>

        {/* Display selected locations */}
        <div className="mt-6 p-3 bg-gray-100 rounded-2xl">
          <p className="text-sm text-gray-600 text-center">
            ✈️ From{" "}
            <span className="font-semibold">
              {JSON.parse(localStorage.getItem("tripData") || "{}")
                .from_location || "..."}
            </span>{" "}
            to{" "}
            <span className="font-semibold">
              {JSON.parse(localStorage.getItem("tripData") || "{}")
                .to_location || "..."}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
