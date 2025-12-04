import { safeText } from "@/components/itinerary/helpers";
import TypeBadgeList from "./TypeBadgeList";
import LandmarkList from "./LandmarkList";

export default function AttractionCard({ place }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm mb-4">
      <p className="font-semibold text-gray-900">
        {safeText(place.time_block)} — {safeText(place.place_name)}
      </p>

      {place.summary && (
        <p className="text-gray-700 mt-1">
          {safeText(place.summary)}
        </p>
      )}

      <TypeBadgeList types={place.types} />
      <LandmarkList landmarks={place.landmarks} />

      {place.rating && (
        <p className="text-sm text-gray-500 mt-1">
          ⭐ {place.rating}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        {place.google_maps_url && (
          <a
            href={place.google_maps_url}
            target="_blank"
            className="text-blue-600 underline text-sm"
          >
            View on Maps →
          </a>
        )}

        {place.directions_url && (
          <a
            href={place.directions_url}
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
