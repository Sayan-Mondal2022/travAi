import { formatTypes } from "@/components/itinerary/helpers";

export default function TypeBadgeList({ types = [] }) {
  const formatted = formatTypes(types);
  if (!formatted) return null;

  return (
    <p className="text-xs text-gray-500 mt-1">{formatted}</p>
  );
}
