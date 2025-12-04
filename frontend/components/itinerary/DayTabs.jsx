export default function DayTabs({ days, activeDay, setActiveDay }) {
  return (
    <div className="flex overflow-x-auto gap-3 py-2 mb-6">
      {days.map((day, index) => {
        const dayNum = index + 1;
        const isActive = activeDay === index;

        return (
          <button
            key={index}
            onClick={() => setActiveDay(index)}
            className={`px-5 py-2 rounded-full font-semibold border transition ${
              isActive
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"
            }`}
          >
            Day {dayNum}
          </button>
        );
      })}
    </div>
  );
}
