import { safeText } from "@/components/itinerary/helpers";
import TypeBadgeList from "./TypeBadgeList";
import LandmarkList from "./LandmarkList";

export default function LodgingCard({ h }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow border mb-3">
      <p className="font-semibold text-gray-900">{safeText(h.name)}</p>

      <p className="text-sm text-gray-600">
        {safeText(h.formatted_address)}
      </p>

      <TypeBadgeList types={h.types} />
      <LandmarkList landmarks={h.landmarks} />

      {h.rating && (
        <p className="text-xs text-gray-600 mt-1">⭐ {h.rating}</p>
      )}

      {h.editorial_summary && (
        <p className="text-xs text-gray-700 mt-1 italic">
          {safeText(h.editorial_summary)}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        {h.google_maps_url && (
          <a
            href={h.google_maps_url}
            target="_blank"
            className="text-blue-600 underline text-sm"
          >
            View →
          </a>
        )}

        {h.directions_url && (
          <a
            href={h.directions_url}
            target="_blank"
            className="text-green-600 underline text-sm"
          >
            Directions →
          </a>
        )}
      </div>
    </div>
  );
}
