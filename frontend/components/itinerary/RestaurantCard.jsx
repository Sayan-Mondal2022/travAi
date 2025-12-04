import { safeText } from "@/components/itinerary/helpers";
import TypeBadgeList from "./TypeBadgeList";
import LandmarkList from "./LandmarkList";

export default function RestaurantCard({ r }) {
  return (
    <div className="p-4 bg-white rounded-lg shadow border mb-3">
      <p className="font-semibold text-gray-900">{safeText(r.name)}</p>

      <p className="text-sm text-gray-600">
        {safeText(r.formatted_address)}
      </p>

      <TypeBadgeList types={r.types} />
      <LandmarkList landmarks={r.landmarks} />

      {r.rating && (
        <p className="text-xs text-gray-600 mt-1">⭐ {r.rating}</p>
      )}

      {r.review_summary && (
        <p className="text-xs text-gray-700 mt-1">
          <span className="font-semibold">Highlights:</span>{" "}
          {safeText(r.review_summary)}
        </p>
      )}

      <div className="flex gap-3 mt-2">
        {r.google_maps_url && (
          <a
            href={r.google_maps_url}
            target="_blank"
            className="text-blue-600 underline text-sm"
          >
            View →
          </a>
        )}

        {r.directions_url && (
          <a
            href={r.directions_url}
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
