import { formatTypes } from "@/components/itinerary/helpers";

export default function TypeBadgeList({ types = [] }) {
  const formatted = formatTypes(types);
  if (!formatted) return null;

  return (
    <p className="text-xs text-bright_teal_blue mt-2 font-medium">
      {formatted}
    </p>
  );
}
