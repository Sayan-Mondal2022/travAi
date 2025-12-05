import { safeText } from "@/components/itinerary/helpers";
import TypeBadgeList from "./TypeBadgeList";
import LandmarkList from "./LandmarkList";

export default function RestaurantCard({ r }) {
  return (
    <div className="bg-white/60 backdrop-blur-md shadow-md rounded-2xl p-5 transition-all hover:shadow-xl m-2">
      <p className="font-semibold text-deep_twilight text-lg">
        {safeText(r.name)}
      </p>

      <p className="text-sm text-deep_twilight/70">
        {safeText(r.formatted_address)}
      </p>

      <TypeBadgeList types={r.types} />
      <LandmarkList landmarks={r.landmarks} />

      {r.rating && (
        <p className="text-xs text-deep_twilight/70 mt-1">⭐ {r.rating}</p>
      )}

      {r.review_summary && (
        <p className="text-xs text-deep_twilight/70 mt-2">
          <span className="font-semibold">Highlights:</span>{" "}
          {safeText(r.review_summary)}
        </p>
      )}

      <div className="flex gap-4 mt-3">
        {r.google_maps_url && (
          <a
            href={r.google_maps_url}
            target="_blank"
            className="text-bright_teal_blue font-medium text-sm hover:underline"
          >
            View →
          </a>
        )}

        {r.directions_url && (
          <a
            href={r.directions_url}
            target="_blank"
            className="text-turquoise_surf font-medium text-sm hover:underline"
          >
            Directions →
          </a>
        )}
      </div>
    </div>
  );
}
