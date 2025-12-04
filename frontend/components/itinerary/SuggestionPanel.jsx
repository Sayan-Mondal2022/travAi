import { safeText } from "@/components/itinerary/helpers";
import { Luggage } from "lucide-react";

export default function SuggestionPanel({ suggestions }) {
  if (!suggestions) return null;

  return (
    <div className="bg-white/60 backdrop-blur-2xl rounded-2xl shadow-xl p-6 m-3">
      <h2 className="text-3xl font-bold flex items-center mb-4 text-deep_twilight">
        <Luggage className="w-7 h-7 text-bright_teal_blue mr-2" />
        Packing & Weather Suggestions
      </h2>

      <p className="text-deep_twilight/80 mb-4">
        {safeText(suggestions.summary)}
      </p>

      <h3 className="text-xl font-semibold text-turquoise_surf mb-2">
        Recommended Items
      </h3>
      <ul className="list-disc pl-6 text-deep_twilight/80 space-y-1">
        {suggestions.recommended_items?.map((item, idx) => (
          <li key={idx}>{safeText(item)}</li>
        ))}
      </ul>

      <h3 className="text-xl font-semibold text-turquoise_surf mt-6 mb-2">
        Weather Highlights
      </h3>

      {suggestions.per_day_highlights?.map((d, i) => (
        <div
          key={i}
          className="p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow mt-2 m-3"
        >
          <p className="font-semibold text-deep_twilight">
            Day {d.day}
          </p>

          <p className="text-deep_twilight/70 text-sm">
            {safeText(d.expected_weather)}
          </p>

          <ul className="list-disc pl-6 text-deep_twilight/80 mt-1 space-y-1">
            {d.notes?.map((n, idx) => (
              <li key={idx}>{safeText(n)}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
