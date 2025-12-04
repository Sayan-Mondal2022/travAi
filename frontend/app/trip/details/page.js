// app/trip/details/page.js
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Users, ArrowLeft, Plane, PlaneLanding, Sparkles } from "lucide-react";

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

  const handleTravelTypeClick = (typeId) => {
    setFormData((prev) => ({
      ...prev,
      travel_type: typeId,
    }));
  };

  const handleBack = () => {
    router.back();
  };

  const calendarDays = generateCalendar();
  const duration = getDurationDays();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center p-2 relative overflow-hidden"> {/* Reduced p-4 to p-2 */}
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-[#caf0f8]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#90e0ef]/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#00b4d8]/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-5 w-full max-w-6xl relative z-10 border border-white/20"> {/* Reduced p-8 to p-5 */}
        {/* Header */}
        <div className="text-center mb-8 relative">
          <button
            onClick={handleBack}
            className="absolute left-0 top-0 p-3 text-[#0077b6] hover:text-[#03045e] hover:bg-[#caf0f8]/30 rounded-full transition-all duration-300 transform hover:scale-110 cursor-pointer group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
          </button>

          <div className="w-20 h-20 bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-2xl flex items-center justify-center mx-auto mb-4 transform transition-all duration-300 hover:scale-110 hover:rotate-6 shadow-xl relative">
            <Calendar className="w-10 h-10 text-white" />
            <Sparkles className="w-4 h-4 text-[#caf0f8] absolute -top-1 -right-1 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#0077b6] to-[#03045e] bg-clip-text text-transparent mb-3">
            Plan Your Journey
          </h1>
          <p className="text-[#0077b6] text-lg font-medium">Choose your dates and travel companions</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Content - Side by Side Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"> {/* Reduced gap-6 to gap-4 */}
            {/* Calendar Section */}
            <div className="bg-gradient-to-br from-[#caf0f8]/40 to-[#90e0ef]/40 rounded-3xl p-4 border-2 border-[#00b4d8]/40 backdrop-blur-sm shadow-2xl relative overflow-hidden group hover:shadow-[0_0_40px_rgba(0,180,216,0.3)] transition-all duration-500"> {/* Reduced p-6 to p-4 */}
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-[#00b4d8]/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-gradient-to-tr from-[#90e0ef]/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <label className="flex items-center gap-2 text-xl font-bold text-[#03045e] mb-6 relative z-10">
                <div className="p-2 bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-xl shadow-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                Travel Dates
              </label>

              {/* Selected Dates Cards */}
              <div className="grid grid-cols-1 gap-3 mb-6 relative z-10">
                <div className={`relative overflow-hidden p-2 rounded-2xl border-2 transition-all duration-500 transform hover:scale-[1.02] ${ /* Reduced p-3 to p-2 */
                  selectedDates.start 
                    ? 'border-[#00b4d8] bg-gradient-to-r from-[#00b4d8]/20 via-[#0077b6]/10 to-transparent shadow-xl' 
                    : 'border-[#90e0ef]/50 bg-white/70'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#caf0f8]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      selectedDates.start ? 'bg-gradient-to-br from-[#00b4d8] to-[#0077b6] shadow-lg' : 'bg-[#90e0ef]/30'
                    }`}>
                      <Plane className={`w-5 h-5 transition-all duration-300 ${
                        selectedDates.start ? 'text-white' : 'text-[#90e0ef]'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#0077b6] mb-0.5 uppercase tracking-wide">Departure</div>
                      <div className={`text-sm font-bold ${
                        selectedDates.start ? 'text-[#03045e]' : 'text-[#90e0ef]'
                      }`}>
                        {selectedDates.start 
                          ? selectedDates.start.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Select departure date'
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`relative overflow-hidden p-2 rounded-2xl border-2 transition-all duration-500 transform hover:scale-[1.02] ${ /* Reduced p-3 to p-2 */
                  selectedDates.end 
                    ? 'border-[#0077b6] bg-gradient-to-r from-[#0077b6]/20 via-[#03045e]/10 to-transparent shadow-xl' 
                    : 'border-[#90e0ef]/50 bg-white/70'
                }`}>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#90e0ef]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="flex items-center gap-3 relative z-10">
                    <div className={`p-2 rounded-xl transition-all duration-300 ${
                      selectedDates.end ? 'bg-gradient-to-br from-[#0077b6] to-[#03045e] shadow-lg' : 'bg-[#90e0ef]/30'
                    }`}>
                      <PlaneLanding className={`w-5 h-5 transition-all duration-300 ${
                        selectedDates.end ? 'text-white' : 'text-[#90e0ef]'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-[#0077b6] mb-0.5 uppercase tracking-wide">Return</div>
                      <div className={`text-sm font-bold ${
                        selectedDates.end ? 'text-[#03045e]' : 'text-[#90e0ef]'
                      }`}>
                        {selectedDates.end 
                          ? selectedDates.end.toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Select return date'
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Duration Display */}
              {duration > 0 && (
                <div className="text-center mb-6 p-4 bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#03045e] rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 relative z-10 overflow-hidden group/duration">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/duration:translate-x-[100%] transition-transform duration-1000"></div>
                  <div className="text-white relative z-10">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 animate-pulse" />
                      <span className="text-sm font-bold uppercase tracking-wider">Trip Duration</span>
                      <Sparkles className="w-4 h-4 animate-pulse" style={{animationDelay: '0.5s'}} />
                    </div>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl font-black">{duration}</span>
                      <span className="text-xl font-semibold">{duration === 1 ? 'Day' : 'Days'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Calendar Navigation */}
              <div className="flex items-center justify-between mb-4 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg relative z-10"> {/* Reduced padding/rounded-ness slightly */}
                <button
                  type="button"
                  onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  className="p-2 rounded-lg bg-gradient-to-r from-[#00b4d8] to-[#0077b6] text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-2xl group/btn"
                >
                  <svg className="w-4 h-4 group-hover/btn:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* Smaller icon */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="text-base font-black text-[#03045e] px-4"> {/* Reduced text size */}
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                
                <button
                  type="button"
                  onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  className="p-2 rounded-lg bg-gradient-to-r from-[#0077b6] to-[#00b4d8] text-white hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-2xl group/btn"
                >
                  <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"> {/* Smaller icon */}
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-inner relative z-10"> {/* Reduced p-4 to p-3 */}
                <div className="grid grid-cols-7 gap-1 mb-2"> {/* Gap reduced, mb reduced */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-black text-[#0077b6] py-0.5 uppercase tracking-wide"> {/* py reduced */}
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
                          relative h-7 rounded-lg text-xs font-bold transition-all duration-300 /* Reduced h-8 to h-7, rounded-xl to rounded-lg */
                          ${day.isPast 
                            ? 'text-gray-300 cursor-not-allowed bg-gray-50' 
                            : isSelected
                              ? 'bg-gradient-to-br from-[#0077b6] to-[#03045e] text-white shadow-xl scale-110 ring-4 ring-[#90e0ef]/60 z-10'
                              : isInRange
                                ? 'bg-gradient-to-br from-[#90e0ef] to-[#caf0f8] text-[#03045e] shadow-lg scale-105'
                                : isToday
                                  ? 'bg-gradient-to-br from-[#00b4d8]/40 to-[#90e0ef]/40 text-[#03045e] ring-2 ring-[#00b4d8] font-black'
                                  : 'text-[#0077b6] bg-white hover:bg-gradient-to-br hover:from-[#caf0f8] hover:to-[#90e0ef] hover:scale-110 hover:shadow-lg active:scale-95'
                          }
                          ${!day.isCurrentMonth ? 'opacity-30' : ''}
                        `}
                      >
                        {day.date.getDate()}
                        {isToday && !isSelected && (
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-[#00b4d8] rounded-full animate-pulse"></div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Calendar Legend */}
              <div className="flex justify-center gap-4 mt-4 text-xs relative z-10"> {/* Reduced gap/mt */}
                <div className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full shadow-md"> {/* py reduced */}
                  <div className="w-3 h-3 bg-gradient-to-br from-[#0077b6] to-[#03045e] rounded-md shadow-md"></div>
                  <span className="text-[#03045e] font-bold">Selected</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full shadow-md"> {/* py reduced */}
                  <div className="w-3 h-3 bg-gradient-to-br from-[#90e0ef] to-[#caf0f8] rounded-md shadow-md"></div>
                  <span className="text-[#03045e] font-bold">Range</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full shadow-md"> {/* py reduced */}
                  <div className="w-3 h-3 bg-[#00b4d8]/40 rounded-md ring-2 ring-[#00b4d8]"></div>
                  <span className="text-[#03045e] font-bold">Today</span>
                </div>
              </div>
            </div>

            {/* Travel Type Selection */}
            <div className="bg-gradient-to-br from-[#90e0ef]/40 to-[#caf0f8]/40 rounded-3xl p-4 border-2 border-[#00b4d8]/40 backdrop-blur-sm shadow-2xl relative overflow-hidden group hover:shadow-[0_0_40px_rgba(0,180,216,0.3)] transition-all duration-500"> {/* Reduced p-6 to p-4 */}
              {/* Decorative elements */}
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-gradient-to-br from-[#90e0ef]/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-[#00b4d8]/20 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <label className="flex items-center gap-2 text-xl font-bold text-[#03045e] mb-6 relative z-10">
                <div className="p-2 bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-xl shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Travel Companions
              </label>
              
              <div className="grid grid-cols-2 gap-3 relative z-10"> {/* Reduced gap-4 to gap-3 */}
                {TRAVEL_TYPES.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => handleTravelTypeClick(type.id)}
                    className={`relative overflow-hidden flex flex-col items-center p-4 border-2 rounded-2xl cursor-pointer transition-all duration-500 transform hover:scale-105 group/card ${ /* Reduced p-5 to p-4 */
                      formData.travel_type === type.id
                        ? "border-[#0077b6] bg-gradient-to-br from-[#00b4d8]/30 to-[#0077b6]/20 shadow-2xl scale-105 ring-4 ring-[#90e0ef]/60"
                        : "border-[#90e0ef]/60 bg-white/80 hover:border-[#00b4d8] hover:shadow-xl hover:bg-white/90"
                    }`}
                  >
                    {/* Animated gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-[#caf0f8]/0 via-[#90e0ef]/30 to-[#00b4d8]/0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ${
                      formData.travel_type === type.id ? 'opacity-50' : ''
                    }`}></div>
                    
                    {/* Decorative corner accent */}
                    <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#caf0f8]/40 to-transparent rounded-full -mr-10 -mt-10 group-hover/card:scale-150 transition-transform duration-500"></div>
                    
                    <span className={`text-4xl mb-2 transition-all duration-500 relative z-10 ${ /* Reduced text-5xl to text-4xl, mb-3 to mb-2 */
                      formData.travel_type === type.id 
                        ? 'scale-125 drop-shadow-lg' 
                        : 'group-hover/card:scale-125 group-hover/card:drop-shadow-lg'
                    }`}>
                      {type.emoji}
                    </span>
                    <span className="text-base font-black text-[#03045e] mb-1 relative z-10">
                      {type.label}
                    </span>
                    <span className="text-xs text-[#0077b6] text-center font-semibold relative z-10">
                      {type.description}
                    </span>
                    
                    {/* Selected indicator */}
                    {formData.travel_type === type.id && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-gradient-to-br from-[#00b4d8] to-[#0077b6] rounded-full flex items-center justify-center shadow-lg z-10">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="pt-4"> {/* Reduced pt-6 to pt-4 */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#00b4d8] via-[#0077b6] to-[#03045e] text-white py-4 px-6 rounded-2xl hover:shadow-2xl hover:shadow-[#00b4d8]/50 hover:scale-[1.02] active:scale-98 transition-all duration-500 font-bold text-lg shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg relative overflow-hidden group/submit" /* Reduced py-5 to py-4 */
              disabled={!formData.start_date || !formData.end_date || !formData.travel_type}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/submit:translate-x-[100%] transition-transform duration-700"></div>
              <span className="relative z-10 flex items-center justify-center gap-2">
                Continue to Group Details
                <svg className="w-5 h-5 group-hover/submit:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>
        </form>

        {/* Display selected locations */}
        <div className="mt-4 p-4 bg-gradient-to-r from-[#caf0f8]/30 via-[#90e0ef]/30 to-[#caf0f8]/30 rounded-2xl transform transition-all duration-300 hover:scale-[1.01] border border-[#00b4d8]/30 shadow-lg backdrop-blur-sm"> {/* Reduced mt-6 to mt-4, p-5 to p-4 */}
          <p className="text-sm text-[#0077b6] text-center font-semibold flex items-center justify-center gap-2">
            <span className="text-xl">✈️</span> {/* Reduced text-2xl to text-xl */}
            <span>From</span>
            <span className="font-black text-[#03045e] px-3 py-1 bg-white/80 rounded-lg shadow-md">
              {JSON.parse(localStorage.getItem("tripData") || "{}")
                .from_location || "..."}
            </span>
            <span>to</span>
            <span className="font-black text-[#03045e] px-3 py-1 bg-white/80 rounded-lg shadow-md">
              {JSON.parse(localStorage.getItem("tripData") || "{}")
                .to_location || "..."}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}