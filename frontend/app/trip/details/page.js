// app/trip/details/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, ArrowLeft, Plane, PlaneLanding } from "lucide-react";

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
    end: null
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    // Load previous data from localStorage
    const savedData = localStorage.getItem("tripData");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData((prev) => ({ ...prev, ...parsedData }));
      
      // Set selected dates if they exist
      if (parsedData.start_date) {
        setSelectedDates(prev => ({ ...prev, start: new Date(parsedData.start_date) }));
      }
      if (parsedData.end_date) {
        setSelectedDates(prev => ({ ...prev, end: new Date(parsedData.end_date) }));
      }
    }
  }, []);

  // Generate calendar for current month
  const generateCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Add days from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({ date, isCurrentMonth: false, isPast: date < new Date().setHours(0, 0, 0, 0) });
    }

    // Add days of current month
    const currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      const isPast = currentDate < new Date().setHours(0, 0, 0, 0);
      days.push({ 
        date: new Date(currentDate), 
        isCurrentMonth: true,
        isPast 
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add days from next month to fill the last week (up to 6 rows)
    const totalCells = 42; // 6 rows × 7 days
    const nextMonth = new Date(year, month + 1, 1);
    while (days.length < totalCells) {
      const date = new Date(nextMonth);
      date.setDate(nextMonth.getDate() + (days.length - (firstDayOfWeek + lastDay.getDate())));
      days.push({ 
        date, 
        isCurrentMonth: false, 
        isPast: false 
      });
    }

    return days;
  };

  const handleDateSelect = (day) => {
    if (day.isPast) return;

    const newDate = day.date;
    
    if (!selectedDates.start || (selectedDates.start && selectedDates.end)) {
      // Start new selection
      setSelectedDates({ start: newDate, end: null });
      setFormData(prev => ({ 
        ...prev, 
        start_date: newDate.toISOString().split('T')[0],
        end_date: ""
      }));
    } else if (selectedDates.start && !selectedDates.end) {
      // Select end date
      if (newDate > selectedDates.start) {
        setSelectedDates(prev => ({ ...prev, end: newDate }));
        setFormData(prev => ({ 
          ...prev, 
          end_date: newDate.toISOString().split('T')[0]
        }));
      } else {
        // If selected date is before start date, swap them
        setSelectedDates({ start: newDate, end: selectedDates.start });
        setFormData(prev => ({ 
          ...prev, 
          start_date: newDate.toISOString().split('T')[0],
          end_date: selectedDates.start.toISOString().split('T')[0]
        }));
      }
    }
  };

  const getDurationDays = () => {
    if (selectedDates.start && selectedDates.end) {
      const diffTime = Math.abs(selectedDates.end - selectedDates.start);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    return 0;
  };

  const isDateInRange = (date) => {
    if (!selectedDates.start || !selectedDates.end) return false;
    return date >= selectedDates.start && date <= selectedDates.end;
  };

  const isStartDate = (date) => {
    return selectedDates.start && date.toDateString() === selectedDates.start.toDateString();
  };

  const isEndDate = (date) => {
    return selectedDates.end && date.toDateString() === selectedDates.end.toDateString();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.start_date || !formData.end_date || !formData.travel_type) {
      alert("Please select both departure and return dates, and travel type");
      return;
    }

    // Save updated data
    const allData = {
      ...JSON.parse(localStorage.getItem("tripData") || "{}"),
      ...formData,
      duration_days: getDurationDays(),
    };
    localStorage.setItem("tripData", JSON.stringify(allData));

    // Route to next step
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

  const calendarDays = generateCalendar();
  const duration = getDurationDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <button
            onClick={handleBack}
            className="absolute left-4 top-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 hover:scale-110">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 transform transition-all duration-300">
            Trip Dates
          </h1>
          <p className="text-gray-600 transition-all duration-300">Select your departure and return dates</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Calendar Section */}
          <div className="bg-white rounded-2xl p-6 border-2 border-blue-100 transform transition-all duration-300 hover:shadow-lg">
            <label className="block text-sm font-medium text-blue-700 mb-4">
              <Calendar className="w-5 h-5 inline mr-2 text-blue-500 transition-transform duration-300 hover:scale-110" />
              Select your travel dates
            </label>

            {/* Selected Dates Summary */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`text-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                selectedDates.start ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <Plane className={`w-6 h-6 mx-auto mb-2 ${
                  selectedDates.start ? 'text-green-600' : 'text-gray-400'
                }`} />
                <div className="text-sm font-medium text-gray-600">Departure</div>
                <div className={`text-lg font-bold ${
                  selectedDates.start ? 'text-green-700' : 'text-gray-400'
                }`}>
                  {selectedDates.start 
                    ? selectedDates.start.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : 'Select date'
                  }
                </div>
              </div>

              <div className={`text-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                selectedDates.end ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <PlaneLanding className={`w-6 h-6 mx-auto mb-2 ${
                  selectedDates.end ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <div className="text-sm font-medium text-gray-600">Return</div>
                <div className={`text-lg font-bold ${
                  selectedDates.end ? 'text-purple-700' : 'text-gray-400'
                }`}>
                  {selectedDates.end 
                    ? selectedDates.end.toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })
                    : 'Select date'
                  }
                </div>
              </div>
            </div>

            {/* Duration Display */}
            {duration > 0 && (
              <div className="text-center mb-6 p-3 bg-blue-50 rounded-2xl border border-blue-200">
                <div className="text-lg font-semibold text-blue-700">
                  Trip Duration: <span className="text-2xl">{duration}</span> {duration === 1 ? 'day' : 'days'}
                </div>
              </div>
            )}

            {/* Calendar Header with Month Navigation */}
            <div className="flex items-center justify-between mb-4 px-2">
              <button
                type="button"
                onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                className="p-2 rounded-2xl hover:bg-blue-50 transition-all duration-200 hover:scale-110 cursor-pointer"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <div className="text-lg font-semibold text-blue-700 cursor-pointer">
                {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              
              <button
                type="button"
                onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                className="p-2 rounded-2xl hover:bg-blue-50 transition-all duration-200 hover:scale-110 cursor-pointer"
              >
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
<div className="bg-gray-50 rounded-2xl p-4">
  <div className="grid grid-cols-7 gap-1 mb-3">
    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
      <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
        {day}
      </div>
    ))}
  </div>

  <div className="grid grid-cols-7 gap-1">
    {calendarDays.map((day, index) => {
      const isSelected = isStartDate(day.date) || isEndDate(day.date);
      const isInRange = isDateInRange(day.date);
      const isToday = day.date.toDateString() === new Date().toDateString();

      return (
        <button
          key={index}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={day.isPast}
          className={`
            relative h-12 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer
            ${day.isPast 
              ? 'text-gray-300 cursor-not-allowed bg-gray-100' 
              : isSelected
                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                : isInRange
                  ? 'bg-blue-100 text-blue-700'
                  : isToday
                    ? 'bg-green-100 text-green-700'
                    : 'text-gray-700 bg-white hover:bg-blue-100 hover:text-blue-700'
            }
            ${!day.isCurrentMonth ? 'text-gray-400 bg-gray-50' : ''}
          `}
        >
          {day.date.getDate()}
          {isToday && !isSelected && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-2xl"></div>
          )}
        </button>
      );
    })}
  </div>
</div>

            {/* Calendar Legend */}
            <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-600 rounded mr-1"></div>
                Selected
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
                In range
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-100 rounded mr-1 border border-green-400"></div>
                Today
              </div>
            </div>
          </div>

          {/* Travel Type */}
          <div className="bg-blue-50 rounded-2xl p-6 transform transition-all duration-300 hover:scale-[1.02]">
            <label className="block text-sm font-medium text-blue-700 mb-4">
              <Users className="w-5 h-5 inline mr-2 text-blue-500 transition-transform duration-300 hover:scale-110" />
              Who&apos;s traveling?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {TRAVEL_TYPES.map((type) => (
                <label
                  key={type.id}
                  className={`flex flex-col items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                    formData.travel_type === type.id
                      ? "border-blue-500 bg-white shadow-md scale-105 ring-2 ring-blue-200"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg"
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
                  <span className="text-2xl mb-2 transition-transform duration-300 hover:scale-110">
                    {type.emoji}
                  </span>
                  <span className="text-sm font-medium text-gray-900 text-center">
                    {type.label}
                  </span>
                  <span className="text-xs text-gray-500 text-center mt-1">
                    {type.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all duration-300 font-semibold shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={!formData.start_date || !formData.end_date || !formData.travel_type}
            >
              Continue to Group Details →
            </button>
          </div>
        </form>

        {/* Display selected locations */}
        <div className="mt-6 p-4 bg-gray-100 rounded-2xl transform transition-all duration-300 hover:scale-[1.01]">
          <p className="text-sm text-gray-600 text-center">
            ✈️ From{" "}
            <span className="font-semibold text-blue-600">
              {JSON.parse(localStorage.getItem("tripData") || "{}")
                .from_location || "..."}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-blue-600">
              {JSON.parse(localStorage.getItem("tripData") || "{}")
                .to_location || "..."}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}