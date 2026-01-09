"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  ArrowLeft,
  Plane,
  PlaneLanding,
  Check,
  ChevronRight,
} from "lucide-react";

const TRAVEL_TYPES = [
  { id: "solo", label: "Solo", emoji: "🧍" },
  { id: "duo", label: "Duo", emoji: "🧑‍🤝‍🧑" },
  { id: "couple", label: "Couple", emoji: "👩‍❤️‍👨" },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧‍👦" },
  { id: "friends", label: "Friends", emoji: "👯‍♂️" },
  { id: "business", label: "Business", emoji: "💼" },
];

const toSafeDate = (date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .split("T")[0];

const formatDate = (date) => {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

export default function DetailsStep() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    travel_type: "",
    trip_type: "",
    start_date: "",
    end_date: "",
  });

  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null,
  });

  const [showCalendar, setShowCalendar] = useState(false);

  /* -------- Calendar Logic -------- */
  const today = new Date();
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  const handleDateSelect = (date) => {
    if (!formData.trip_type) return;

    if (formData.trip_type === "oneway") {
      setSelectedDates({ start: date, end: null });
      setFormData((p) => ({
        ...p,
        start_date: toSafeDate(date),
        end_date: "",
      }));
      return;
    }

    if (!selectedDates.start || selectedDates.end) {
      setSelectedDates({ start: date, end: null });
      setFormData((p) => ({
        ...p,
        start_date: toSafeDate(date),
        end_date: "",
      }));
    } else {
      const start = date < selectedDates.start ? date : selectedDates.start;
      const end = date > selectedDates.start ? date : selectedDates.start;

      setSelectedDates({ start, end });
      setFormData((p) => ({
        ...p,
        start_date: toSafeDate(start),
        end_date: toSafeDate(end),
      }));
    }
  };

  const duration =
  selectedDates.start && selectedDates.end
    ? Math.max(
        1,
        Math.round(
          (new Date(
            selectedDates.end.getFullYear(),
            selectedDates.end.getMonth(),
            selectedDates.end.getDate()
          ) -
            new Date(
              selectedDates.start.getFullYear(),
              selectedDates.start.getMonth(),
              selectedDates.start.getDate()
            )) /
            (1000 * 60 * 60 * 24)
        ) + 1
      )
    : selectedDates.start
    ? 1
    : 0;


  const handleContinueToCalendar = () => {
    if (formData.travel_type && formData.trip_type) {
      setShowCalendar(true);
    }
  };

  const handleEditDetails = () => {
    setShowCalendar(false);
  };

  /* -------- Submit -------- */
  const handleSubmit = () => {
    const prev = JSON.parse(localStorage.getItem("tripData") || "{}");
    localStorage.setItem(
      "tripData",
      JSON.stringify({ ...prev, ...formData })
    );
    router.push("/trip/group-details");
  };

  const isStepOneComplete = formData.travel_type && formData.trip_type;
  const canSubmit =
    formData.start_date &&
    (formData.trip_type === "oneway" || formData.end_date);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 w-full max-w-4xl border border-white/20">
        {/* HEADER */}
        <div className="relative text-center mb-8">
          <button
            onClick={() => router.back()}
            className="absolute left-0 top-0 p-2 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:scale-110"
          >
            <ArrowLeft className="text-[#03045e]" />
          </button>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#03045e] to-[#0077b6] bg-clip-text text-transparent">
              Plan Your Journey
            </h1>
            <p className="text-sm text-[#0077b6]">
              {!showCalendar
                ? "Tell us about your travel preferences"
                : "Choose your travel dates"}
            </p>
          </div>
        </div>

        {/* PROGRESS INDICATOR */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isStepOneComplete ? "w-20 bg-[#00b4d8]" : "w-12 bg-gray-300"
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              showCalendar ? "w-20 bg-[#00b4d8]" : "w-12 bg-gray-300"
            }`}
          />
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              canSubmit ? "w-20 bg-[#00b4d8]" : "w-12 bg-gray-300"
            }`}
          />
        </div>

        {/* STEP 1: TRAVEL & TRIP TYPE */}
        <div
          className={`transition-all duration-700 ease-in-out ${
            showCalendar
              ? "opacity-0 h-0 overflow-hidden scale-95"
              : "opacity-100 scale-100"
          }`}
        >
          {/* TRAVEL TYPE */}
          <div className="mb-8">
            <label className="font-bold flex items-center gap-2 mb-4 text-[#03045e]">
              <Users className="text-[#00b4d8]" size={20} /> Who's Traveling?
            </label>

            <div className="grid grid-cols-3 gap-3">
              {TRAVEL_TYPES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() =>
                    setFormData((p) => ({ ...p, travel_type: t.id }))
                  }
                  className={`group relative p-4 rounded-2xl border-2 transition-all duration-300 ${
                    formData.travel_type === t.id
                      ? "bg-gradient-to-br from-[#caf0f8] to-[#90e0ef] border-[#0077b6] shadow-lg scale-105"
                      : "border-gray-200 hover:border-[#00b4d8] hover:shadow-md hover:scale-102"
                  }`}
                >
                  {formData.travel_type === t.id && (
                    <div className="absolute -top-2 -right-2 bg-[#0077b6] rounded-full p-1 shadow-lg animate-bounce">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <div className="text-3xl mb-2 transition-transform duration-300 group-hover:scale-110">
                    {t.emoji}
                  </div>
                  <div className="text-sm font-semibold text-[#03045e]">
                    {t.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* TRIP TYPE */}
          <div
            className={`transition-all duration-500 ${
              formData.travel_type
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <label className="font-bold flex items-center gap-2 mb-4 text-[#03045e]">
              <Plane className="text-[#00b4d8]" size={20} /> Trip Type
            </label>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    trip_type: "oneway",
                    end_date: "",
                  }))
                }
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  formData.trip_type === "oneway"
                    ? "bg-gradient-to-br from-[#caf0f8] to-[#90e0ef] border-[#0077b6] shadow-lg scale-105"
                    : "border-gray-200 hover:border-[#00b4d8] hover:shadow-md hover:scale-102"
                }`}
              >
                {formData.trip_type === "oneway" && (
                  <div className="absolute -top-2 -right-2 bg-[#0077b6] rounded-full p-1 shadow-lg animate-bounce">
                    <Check size={14} className="text-white" />
                  </div>
                )}
                <Plane
                  className="mx-auto mb-2 transition-transform duration-300 group-hover:translate-x-2"
                  size={32}
                />
                <div className="font-semibold text-[#03045e]">One Way</div>
              </button>

              <button
                onClick={() =>
                  setFormData((p) => ({ ...p, trip_type: "round" }))
                }
                className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                  formData.trip_type === "round"
                    ? "bg-gradient-to-br from-[#caf0f8] to-[#90e0ef] border-[#0077b6] shadow-lg scale-105"
                    : "border-gray-200 hover:border-[#00b4d8] hover:shadow-md hover:scale-102"
                }`}
              >
                {formData.trip_type === "round" && (
                  <div className="absolute -top-2 -right-2 bg-[#0077b6] rounded-full p-1 shadow-lg animate-bounce">
                    <Check size={14} className="text-white" />
                  </div>
                )}
                <PlaneLanding
                  className="mx-auto mb-2 transition-transform duration-300 group-hover:translate-x-2"
                  size={32}
                />
                <div className="font-semibold text-[#03045e]">Round Trip</div>
              </button>
            </div>

            {isStepOneComplete && (
              <button
                onClick={handleContinueToCalendar}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#03045e] text-white font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-xl flex items-center justify-center gap-2 group"
              >
                Continue to Dates
                <ChevronRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            )}
          </div>
        </div>

        {/* STEP 2: CALENDAR */}
        <div
          className={`transition-all duration-700 ease-in-out ${
            showCalendar
              ? "opacity-100 scale-100"
              : "opacity-0 h-0 overflow-hidden scale-95"
          }`}
        >
          {/* SELECTION SUMMARY */}
          {showCalendar && (
            <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-[#caf0f8]/60 to-[#90e0ef]/40 border-2 border-[#00b4d8]/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {
                      TRAVEL_TYPES.find((t) => t.id === formData.travel_type)
                        ?.emoji
                    }
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0077b6]">
                      {formData.trip_type === "round"
                        ? "Round Trip"
                        : "One Way"}{" "}
                      •{" "}
                      {
                        TRAVEL_TYPES.find((t) => t.id === formData.travel_type)
                          ?.label
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleEditDetails}
                  className="text-xs text-[#0077b6] hover:text-[#03045e] font-semibold transition-colors duration-300"
                >
                  Edit
                </button>
              </div>

              <div className="flex items-center gap-4">
                {selectedDates.start ? (
                  <>
                    <div className="flex-1 p-3 rounded-xl bg-white/70 backdrop-blur-sm">
                      <p className="text-xs text-[#0077b6] mb-1">Start Date</p>
                      <p className="text-lg font-bold text-[#03045e]">
                        {formatDate(selectedDates.start)}
                      </p>
                    </div>
                    {formData.trip_type === "round" && (
                      <>
                        <div className="text-[#00b4d8]">→</div>
                        <div className="flex-1 p-3 rounded-xl bg-white/70 backdrop-blur-sm">
                          <p className="text-xs text-[#0077b6] mb-1">
                            End Date
                          </p>
                          <p className="text-lg font-bold text-[#03045e]">
                            {selectedDates.end
                              ? formatDate(selectedDates.end)
                              : "Select date"}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-[#0077b6]">
                    Select your travel dates below
                  </p>
                )}
              </div>

              {duration > 0 && formData.trip_type === "round" && (
                <div className="mt-3 text-center">
                  <span className="inline-block px-4 py-2 rounded-full bg-white/70 text-sm font-semibold text-[#03045e]">
                    {duration} {duration === 1 ? "day" : "days"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* CALENDAR */}
          <div>
            <label className="font-bold flex items-center gap-2 mb-4 text-[#03045e]">
              <Calendar className="text-[#00b4d8]" size={20} /> Select Dates
            </label>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-[#0077b6] py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((d, i) => {
                const isStart =
                  selectedDates.start &&
                  d.toDateString() === selectedDates.start.toDateString();
                const isEnd =
                  selectedDates.end &&
                  d.toDateString() === selectedDates.end.toDateString();
                const inRange =
                  selectedDates.start &&
                  selectedDates.end &&
                  d > selectedDates.start &&
                  d < selectedDates.end;

                return (
                  <button
                    key={i}
                    onClick={() => handleDateSelect(d)}
                    className={`relative h-12 rounded-xl font-semibold transition-all duration-300 ${
                      isStart || isEnd
                        ? "bg-gradient-to-br from-[#0077b6] to-[#03045e] text-white scale-110 shadow-lg z-10"
                        : inRange
                        ? "bg-[#caf0f8] text-[#03045e] scale-105"
                        : "hover:bg-[#90e0ef] hover:scale-105 text-[#03045e]"
                    }`}
                  >
                    {d.getDate()}
                    {(isStart || isEnd) && (
                      <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SUBMIT */}
          {canSubmit && (
            <button
              onClick={handleSubmit}
              className="mt-8 w-full py-4 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#03045e] text-white font-bold transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center gap-2 group animate-fade-in"
            >
              Continue to Group Details
              <ChevronRight
                size={20}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}