import { safeText } from "@/components/itinerary/helpers";
import TypeBadgeList from "./TypeBadgeList";
import LandmarkList from "./LandmarkList";

export default function LodgingCard({ h }) {
  return (
    <div className="bg-white/60 backdrop-blur-md shadow-md rounded-2xl p-5 transition-all hover:shadow-xl">
      <p className="font-semibold text-deep_twilight text-lg">
        {safeText(h.name)}
      </p>

      <p className="text-sm text-deep_twilight/70">
        {safeText(h.formatted_address)}
      </p>

      <TypeBadgeList types={h.types} />
      <LandmarkList landmarks={h.landmarks} />

      {h.rating && (
        <p className="text-xs text-deep_twilight/70 mt-1">
          ⭐ {h.rating}
        </p>
      )}

      {h.editorial_summary && (
        <p className="text-xs text-deep_twilight/80 mt-2 italic">
          {safeText(h.editorial_summary)}
        </p>
      )}

      <div className="flex gap-4 mt-3">
        {h.google_maps_url && (
          <a
            href={h.google_maps_url}
            target="_blank"
            className="text-bright_teal_blue font-medium text-sm hover:underline"
          >
            View →
          </a>
        )}

        {h.directions_url && (
          <a
            href={h.directions_url}
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
