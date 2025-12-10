// app/trip/details/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Users,
  ArrowLeft,
  Plane,
  PlaneLanding,
  Sparkles,
} from "lucide-react";

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
    start_date: "",
    end_date: "",
    travel_type: "",
  });
  const [selectedDates, setSelectedDates] = useState({
    start: null,
    end: null,
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const savedData = localStorage.getItem("tripData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData((prev) => ({ ...prev, ...parsedData }));
      if (parsedData.start_date) {
        setSelectedDates((prev) => ({
          ...prev,
          start: new Date(parsedData.start_date),
        }));
      }
      if (parsedData.end_date) {
        setSelectedDates((prev) => ({
          ...prev,
          end: new Date(parsedData.end_date),
        }));
      }
    }
  }, []);

  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        isCurrentMonth: false,
        isPast: date < new Date().setHours(0, 0, 0, 0),
      });
    }

    const currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      const isPast = currentDate < new Date().setHours(0, 0, 0, 0);
      days.push({
        date: new Date(currentDate),
        isCurrentMonth: true,
        isPast,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalCells = 42;
    const nextMonth = new Date(year, month + 1, 1);
    while (days.length < totalCells) {
      const date = new Date(nextMonth);
      date.setDate(
        nextMonth.getDate() +
          (days.length - (firstDayOfWeek + lastDay.getDate()))
      );
      days.push({
        date,
        isCurrentMonth: false,
        isPast: false,
      });
    }

    return days;
  };

  const handleDateSelect = (day) => {
    if (day.isPast) return;

    const newDate = day.date;

    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      setSelectedDates({ start: newDate, end: null });
      setFormData((prev) => ({
        ...prev,
        start_date: newDate.toISOString().split("T")[0],
        end_date: "",
      }));
    } else if (selectedDates.start && !selectedDates.end) {
      if (newDate > selectedDates.start) {
        setSelectedDates((prev) => ({ ...prev, end: newDate }));
        setFormData((prev) => ({
          ...prev,
          end_date: newDate.toISOString().split("T")[0],
        }));
      } else {
        setSelectedDates({ start: newDate, end: selectedDates.start });
        setFormData((prev) => ({
          ...prev,
          start_date: newDate.toISOString().split("T")[0],
          end_date: selectedDates.start.toISOString().split("T")[0],
        }));
      }
    }
  };

  const getDurationDays = () => {
    if (selectedDates.start && selectedDates.end) {
      const diff = Math.abs(selectedDates.end - selectedDates.start);
      return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const isDateInRange = (date) => {
    if (!selectedDates.start || !selectedDates.end) return false;
    return date >= selectedDates.start && date <= selectedDates.end;
  };

  const isStartDate = (date) =>
    selectedDates.start &&
    date.toDateString() === selectedDates.start.toDateString();

  const isEndDate = (date) =>
    selectedDates.end &&
    date.toDateString() === selectedDates.end.toDateString();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.start_date || !formData.end_date || !formData.travel_type) {
      alert("Please select both travel dates and travel type before continuing.");
      return;
    }

    const allData = {
      ...JSON.parse(localStorage.getItem("tripData") || "{}"),
      ...formData,
      duration_days: getDurationDays(),
    };
    localStorage.setItem("tripData", JSON.stringify(allData));

    router.push("/trip/group-details");
  };

  const handleTravelTypeClick = (typeId) => {
    setFormData((prev) => ({ ...prev, travel_type: typeId }));
  };

  const calendarDays = generateCalendar();
  const duration = getDurationDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-2 overflow-hidden">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-4 w-full max-w-5xl border border-white/30">
        {/* Header */}
        <div className="text-center mb-4 relative">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-0 top-0 p-2 rounded-2xl text-[#0077b6] hover:bg-blue-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-14 h-14 rounded-2xl mx-auto mb-2 flex items-center justify-center bg-gradient-to-br from-[#00b4d8] to-[#0077b6] shadow-md">
            <Calendar className="w-7 h-7 text-white" />
          </div>

          <h1 className="text-2xl font-bold text-[#03045e]">Plan Your Journey</h1>
          <p className="text-sm text-[#0077b6]">Choose your dates and travel companions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Calendar Panel */}
            <div className="rounded-2xl p-3 bg-white border border-[#90e0ef] shadow-md">
              <label className="flex items-center gap-2 text-base font-bold text-[#03045e] mb-3">
                <Calendar className="w-4 h-4 text-[#00b4d8]" />
                Travel Dates
              </label>

              {/* Selected Dates */}
              <div className="space-y-2 mb-3">
                <div className="p-2 rounded-2xl border border-[#00b4d8]/40 bg-[#caf0f8]/30">
                  <div className="text-xs font-semibold text-[#0077b6]">
                    Departure
                  </div>
                  <div className="text-sm font-bold">
                    {selectedDates.start
                      ? selectedDates.start.toLocaleDateString()
                      : "Select date"}
                  </div>
                </div>
                <div className="p-2 rounded-2xl border border-[#0077b6]/40 bg-[#90e0ef]/30">
                  <div className="text-xs font-semibold text-[#0077b6]">Return</div>
                  <div className="text-sm font-bold">
                    {selectedDates.end
                      ? selectedDates.end.toLocaleDateString()
                      : "Select date"}
                  </div>
                </div>
              </div>

              {/* Duration */}
              {duration > 0 && (
                <div className="text-center mb-3 p-2 h-10 rounded-2xl bg-gradient-to-r from-[#00b4d8] to-[#03045e] text-white text-sm font-bold shadow-md">
                  {duration} Days Trip
                </div>
              )}

              {/* Calendar */}
              <div className="rounded-2xl bg-white p-2 shadow-inner">
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="text-center text-[14px] font-bold text-[#0077b6]">
                      {d}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, i) => {
                    const isSel =
                      isStartDate(day.date) || isEndDate(day.date);
                    const inRange = isDateInRange(day.date);

                    return (
                      <button
                        key={i}
                        type="button"
                        disabled={day.isPast}
                        onClick={() => handleDateSelect(day)}
                        className={`h-10 text-[11px] rounded-2xl transition hover:cursor-pointer ${
                          day.isPast
                            ? "text-gray-300 bg-gray-50 cursor-not-allowed"
                            : isSel
                            ? "bg-[#0077b6] text-white"
                            : inRange
                            ? "bg-[#caf0f8] text-[#03045e]"
                            : "bg-white text-[#03045e] hover:bg-[#90e0ef]"
                        } ${!day.isCurrentMonth && "opacity-40"}`}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Travel Types Panel */}
            <div className="rounded-2xl p-3 bg-white border border-[#90e0ef] shadow-md">
              <label className="flex items-center gap-2 text-base font-bold text-[#03045e] mb-3">
                <Users className="w-4 h-4 text-[#00b4d8]" />
                Travel Companions
              </label>

              <div className="grid grid-cols-2 gap-2">
                {TRAVEL_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTravelTypeClick(t.id)}
                    className={`p-2 rounded-2xl border text-center transition hover:cursor-pointer ${
                      formData.travel_type === t.id
                        ? "border-[#0077b6] bg-[#caf0f8]/40 shadow-md"
                        : "border-[#90e0ef] bg-white hover:bg-[#eefaff]"
                    }`}
                  >
                    <div className="text-2xl mb-1">{t.emoji}</div>
                    <div className="text-sm font-bold text-[#03045e]">
                      {t.label}
                    </div>
                    <div className="text-[10px] text-[#0077b6]">{t.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-white bg-gradient-to-r from-[#00b4d8] to-[#03045e] text-base font-bold shadow-md hover:opacity-90 transition-all hover:cursor-pointer"
          >
            Continue to Group Details
          </button>
        </form>

        {/* FROM → TO Summary */}
        <div className="mt-3 p-3 rounded-2xl bg-[#caf0f8]/40 text-center text-sm">
          <span className="font-semibold text-[#0077b6]">From</span>{" "}
          <span className="font-bold text-[#03045e]">
            {JSON.parse(localStorage.getItem("tripData") || "{}").from_location ||
              "..."}
          </span>{" "}
          <span className="font-semibold text-[#0077b6]">to</span>{" "}
          <span className="font-bold text-[#03045e]">
            {JSON.parse(localStorage.getItem("tripData") || "{}").to_location ||
              "..."}
          </span>
        </div>
      </div>
    </div>
  );
}