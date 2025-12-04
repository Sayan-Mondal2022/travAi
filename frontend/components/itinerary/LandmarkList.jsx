import { safeText } from "@/components/itinerary/helpers";

export default function LandmarkList({ landmarks = [] }) {
  if (!landmarks.length) return null;

  return (
    <div className="mt-2 pl-3 border-l-2 border-gray-300">
      {landmarks.map((lm, i) => (
        <p key={i} className="text-xs text-gray-600">
          • {safeText(lm.display_name)}{" "}
          {lm.distance_meters
            ? `(${Math.round(lm.distance_meters / 1000)} km)`
            : ""}
        </p>
      ))}
    </div>
  );
}
