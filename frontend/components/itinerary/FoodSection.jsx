import RestaurantCard from "@/components/itinerary/RestaurantCard";

export default function FoodSection({ food }) {
  if (!food) return null;

  return (
    <div>
      <h3 className="text-2xl font-bold text-deep_twilight mb-4">
        Food Suggestions
      </h3>

      {/* Breakfast */}
      {food.breakfast?.length > 0 && (
        <>
          <h4 className="text-xl font-semibold text-bright_teal_blue mt-4 mb-2">
            🥞 Breakfast
          </h4>
          {food.breakfast.map((r, i) => (
            <RestaurantCard key={`b-${i}`} r={r} />
          ))}
        </>
      )}

      {/* Lunch */}
      {food.lunch?.length > 0 && (
        <>
          <h4 className="text-xl font-semibold text-bright_teal_blue mt-6 mb-2">
            🍽️ Lunch
          </h4>
          {food.lunch.map((r, i) => (
            <RestaurantCard key={`l-${i}`} r={r} />
          ))}
        </>
      )}

      {/* Dinner */}
      {food.dinner?.length > 0 && (
        <>
          <h4 className="text-xl font-semibold text-bright_teal_blue mt-6 mb-2">
            🍛 Dinner
          </h4>
          {food.dinner.map((r, i) => (
            <RestaurantCard key={`d-${i}`} r={r} />
          ))}
        </>
      )}
    </div>
  );
}
