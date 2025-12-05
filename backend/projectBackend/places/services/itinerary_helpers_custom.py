from places.services.itinerary import GeminiItineraryService
from places.services.db_helpers import (
    build_cache_key,
    load_trip_response
)
from places.services.get_weather import WeatherService
from places.services.utility_helpers import get_coordinates
import os
from dotenv import load_dotenv
from places.services.itinerary_helpers import build_daywise_place_plan

# Load environment variables from .env file
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
weather = WeatherService(GOOGLE_API_KEY)

def _segregate_and_simplify_places(custom_places: list):
    """
    Priority-based segregation + duplicate removal + AI simplification.
    """

    from places.services.itinerary_helpers import _simplify_place_for_ai

    TOURIST_TYPES = {
        "tourist_attraction", "point_of_interest", "museum", "park",
        "adventure_sports_center", "hiking_area", "historical_place",
        "national_park", "zoo", "beach", "amusement_park"
    }

    def normalize_id(p):
        return p.get("id") or p.get("place_id") or p.get("displayName")

    # sets for uniqueness
    tourist_ids, lodging_ids, restaurant_ids = set(), set(), set()

    for p in custom_places:
        types = set(p.get("types", []))
        pid = normalize_id(p)

        if types.intersection(TOURIST_TYPES):
            tourist_ids.add(pid)
        elif "lodging" in types:
            lodging_ids.add(pid)
        elif "restaurant" in types:
            restaurant_ids.add(pid)
        else:
            tourist_ids.add(pid)  # fallback

    # convert ids back to objects
    id_map = { normalize_id(p): p for p in custom_places }

    tourist = [id_map[i] for i in tourist_ids]
    lodging = [id_map[i] for i in lodging_ids]
    restaurants = [id_map[i] for i in restaurant_ids]

    # simplify for AI
    tourist_s   = [_simplify_place_for_ai(p) for p in tourist]
    lodging_s   = [_simplify_place_for_ai(p) for p in lodging]
    restaurants_s = [_simplify_place_for_ai(p) for p in restaurants]

    return {
        "tourist": tourist_s,
        "lodging": lodging_s,
        "restaurants": restaurants_s
    }


def _build_places_plan(tourist_s, lodging_s, restaurants_s, days):
    plan = []
    t_idx = 0

    for d in range(days):
        attractions = tourist_s[t_idx:t_idx+3]
        t_idx += 3

        plan.append({
            "day": d + 1,
            "attractions": attractions,
            "restaurants": {
                "breakfast": restaurants_s[:3],
                "lunch": restaurants_s[:3],
                "dinner": restaurants_s[:3]
            },
            "lodging_options": lodging_s[:1] if d == 0 else []
        })

    return plan


async def _call_ai(payload: dict):
    gemini = GeminiItineraryService()
    try:
        return await gemini.generate_itinerary(payload)
    except Exception as e:
        return {"error": f"AI generation failed: {str(e)}"}
    

async def _helper_custom_based(destination, days, preferences, budget, group_size, travel_style, places_plan, weather_info):
    # segregate + simplify
    # seg = _segregate_and_simplify_places(custom_places)
    # places_plan = _build_places_plan(seg["tourist"], seg["lodging"], seg["restaurants"], days)

    payload = {
        "destination": destination,
        "duration_days": days,
        "preferences": preferences,
        "budget": budget,
        "group_size": group_size,
        "travel_style": travel_style,
        "places_plan": places_plan,
        "weather": weather_info,
        "mode": "custom"
    }

    return await _call_ai(payload)


async def _helper_ai_based(destination, days, preferences, budget, group_size, travel_style):

    # ----------------------- Load preference-based places -----------------------
    preferences_list = [p.strip() for p in preferences if p.strip()]

    cache_key = build_cache_key(destination, preferences_list, travel_style)
    trip_places = load_trip_response(cache_key)


    from places.views import get_preference_based_places
    if not trip_places:
        prefs_string = ",".join(preferences_list)
        trip_places = get_preference_based_places(
                        None,
                        destination,
                        prefs_string,
                        travel_style
                    )

        trip_places = load_trip_response(cache_key) or trip_places

    reference_places = trip_places.get("reference_places", {}) if isinstance(trip_places, dict) else {}
    coords = trip_places.get("coordinates", {}) if isinstance(trip_places, dict) else {}

    # ----------------------- Weather -----------------------
    lat = coords.get("lat")
    lng = coords.get("lng")

    if not lat or not lng:
        lat, lng, _ = get_coordinates(destination)

    try:
        weather_info = weather.get_forecast_weather(lat, lng, days)
    except:
        weather_info = None

    # ----------------------- Build daywise plan -----------------------
    places_plan = build_daywise_place_plan(
        reference_places=reference_places,
        preferences_list=preferences_list,
        days=days,
    )

    # ----------------------- Prepare final payload -----------------------
    payload = {
        "destination": destination,
        "duration_days": days,
        "preferences": preferences_list,
        "mode": "ai",
        "places_plan": places_plan,
        "weather": weather_info,
        "budget": budget,
        "group_size": group_size,
        "travel_style": travel_style,
    }

    return await _call_ai(payload)
