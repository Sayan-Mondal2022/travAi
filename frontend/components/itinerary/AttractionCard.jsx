import { safeText } from "@/components/itinerary/helpers";
import TypeBadgeList from "./TypeBadgeList";
import LandmarkList from "./LandmarkList";

export default function AttractionCard({ place }) {
  return (
    <div className="bg-white/60 backdrop-blur-md shadow-md rounded-2xl p-5 m-3 transition-all hover:shadow-xl">
      <p className="font-semibold text-deep_twilight text-lg">
        {safeText(place.time_block)} — {safeText(place.place_name)}
      </p>

      {place.summary && (
        <p className="text-deep_twilight/70 mt-1">{safeText(place.summary)}</p>
      )}

      <TypeBadgeList types={place.types} />
      <LandmarkList landmarks={place.landmarks} />

      {place.rating && (
        <p className="text-sm text-deep_twilight/60 mt-2">
          ⭐ {place.rating}
        </p>
      )}

      <div className="flex gap-4 mt-3">
        {place.google_maps_url && (
          <a
            href={place.google_maps_url}
            target="_blank"
            className="text-bright_teal_blue font-medium text-sm hover:underline"
          >
            View →
          </a>
        )}

        {place.directions_url && (
          <a
            href={place.directions_url}
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
