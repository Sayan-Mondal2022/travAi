import { safeText } from "@/components/itinerary/helpers";

export default function LandmarkList({ landmarks }) {
  // Safe array check - handles null, undefined, and non-arrays
  const safeLandmarks = Array.isArray(landmarks) ? landmarks : [];
  
  if (safeLandmarks.length === 0) return null;

  return (
    <div className="mt-2 pl-3 border-l-2 border-gray-300">
      {safeLandmarks.map((lm, i) => {
        // Safety check for each landmark object
        if (!lm) return null;
        
        const displayName = safeText(lm.display_name || lm.displayName || "");
        const distanceMeters = lm.distance_meters || lm.distanceMeters || 0;
        
        return (
          <p key={i} className="text-xs text-gray-600">
            • {displayName}{" "}
            {distanceMeters > 0
              ? `(${Math.round(distanceMeters / 1000)} km)`
              : ""}
          </p>
        );
      })}
    </div>
  );
}