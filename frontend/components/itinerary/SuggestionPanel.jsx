import { safeText } from "@/components/itinerary/helpers";
import { Luggage } from "lucide-react";

export default function SuggestionPanel({ suggestions }) {
  if (!suggestions) return null;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-3xl font-bold flex items-center mb-4">
        <Luggage className="w-7 h-7 text-purple-600 mr-2" />
        Packing & Weather Suggestions
      </h2>

      <p className="text-gray-700 mb-4">
        {safeText(suggestions.summary)}
      </p>

      <h3 className="text-xl font-semibold mt-4 mb-2">Recommended Items</h3>
      <ul className="list-disc pl-6 text-gray-700 space-y-1">
        {suggestions.recommended_items?.map((item, idx) => (
          <li key={idx}>{safeText(item)}</li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold mt-6 mb-2">Weather Highlights</h3>
      {suggestions.per_day_highlights?.map((d, i) => (
        <div
          key={i}
          className="p-4 bg-gray-50 rounded-lg border mt-2"
        >
          <p className="font-semibold text-gray-900">Day {d.day}</p>
          <p className="text-gray-600 text-sm">
            {safeText(d.expected_weather)}
          </p>

          <ul className="list-disc pl-6 text-gray-700 mt-1">
            {d.notes?.map((n, idx) => (
              <li key={idx}>{safeText(n)}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
