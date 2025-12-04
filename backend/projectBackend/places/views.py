import os
import random
import requests
import logging
from datetime import datetime
from typing import Dict, Any, List

from django.http import JsonResponse
from django.conf import settings
from dotenv import load_dotenv
import googlemaps

from ninja import Router, Body

from places.services.itinerary import GeminiItineraryService
from places.services.get_weather import WeatherService
from places.services.get_places import get_places_data
from places.services.place_queries import (
    generate_tourist_queries,
    generate_restaurant_queries,
    generate_lodging_queries,
)
from places.services.itinerary_helpers import build_daywise_place_plan

# Ninja Routers
tour_router = Router()

# Load environment variables from .env file
load_dotenv()
logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)
weather = WeatherService(api_key=GOOGLE_API_KEY)

weather_data = {}

# ===== GLOBAL HASHSETS TO STORE UNIQUE PLACE IDs (for current request lifetime) =====
PREF_TOURIST_SET: set[str] = set()
PREF_LODGING_SET: set[str] = set()
PREF_RESTAURANT_SET: set[str] = set()


# ======================================================================
# BASIC UTILITIES
# ======================================================================
def get_coordinates(destination: str):
    """
    Geocode a destination string to (lat, lng, formatted_address).
    """
    try:
        geocode_result = gmaps.geocode(destination)
        if not geocode_result:
            return None, None, f"Could not find location: {destination}"
        location = geocode_result[0]["geometry"]["location"]
        formatted_address = geocode_result[0].get("formatted_address", destination)

        latitude = location["lat"]
        longitude = location["lng"]

        return latitude, longitude, formatted_address
    except Exception as e:
        print(f"Geocoding error for {destination}: {e}")
        return None, None, f"Geocoding failed: {str(e)}"


def safe_str(value):
    """Convert any type (dict, list, None, int, etc.) safely to lowercaseable string."""
    if isinstance(value, dict):
        return " ".join([safe_str(v) for v in value.values()])
    if isinstance(value, list):
        return " ".join([safe_str(v) for v in value])
    if value is None:
        return ""
    return str(value)


def group_places_by_preference(places: List[Dict[str, Any]], preferences_list: List[str]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Groups places based on whether the place-related text contains a given preference term.
    Returns:
        {
          "<preference1>": [...],
          "<preference2>": [...],
          "_others": [...]
        }
    """
    grouped: Dict[str, List[Dict[str, Any]]] = {pref: [] for pref in preferences_list}
    grouped["_others"] = []

    for place in places:
        combined_text = (
            safe_str(place.get("name"))
            + " "
            + safe_str(place.get("types"))
            + " "
            + safe_str(place.get("editorialSummary.text"))
            + " "
            + safe_str(place.get("reviewSummary.text"))
            + " "
            + safe_str(place.get("formattedAddress"))
        ).lower()

        matched = False
        for pref in preferences_list:
            if pref.lower() in combined_text:
                grouped[pref].append(place)
                matched = True
                break

        if not matched:
            grouped["_others"].append(place)

    return grouped


def filter_new_places(data: List[Dict[str, Any]], container_set: set[str]) -> List[Dict[str, Any]]:
    """
    Filter out places that have already been seen in container_set.
    Works with either 'id' or 'place_id' keys.
    """
    filtered = []
    for place in data:
        pid = place.get("id") or place.get("place_id")
        if pid and pid not in container_set:
            container_set.add(pid)
            filtered.append(place)
    return filtered


def filter_textSearch_place_data(raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    filtered_places = []

    for place in raw_data.get("places", []):
        filtered_place = {
            "name": place.get("name"),
            "id": place.get("id"),
            "types": place.get("types"),
            "displayName": place.get("displayName", {}).get("text"),
            "internationalPhoneNumber": place.get("internationalPhoneNumber"),
            "formattedAddress": place.get("formattedAddress"),
            "editorialSummary.text": place.get("editorialSummary", {}).get("text"),
            "addressDescriptor.landmarks": place.get("addressDescriptor", {}).get("landmarks"),
            "googleMapsLinks.directionsUri": place.get("googleMapsLinks", {}).get("directionsUri"),
            "googleMapsLinks.placeUri": place.get("googleMapsLinks", {}).get("placeUri"),
            "googleMapsLinks.reviewsUri": place.get("googleMapsLinks", {}).get("reviewsUri"),
            "googleMapsLinks.photosUri": place.get("googleMapsLinks", {}).get("photosUri"),
            "reviewSummary.text": place.get("reviewSummary", {}).get("text"),
            # ADD THESE IMPORTANT FIELDS:
            "rating": place.get("rating"),  # Overall rating (0-5)
            "userRatingCount": place.get("userRatingCount"),  # Number of reviews
            "priceLevel": place.get("priceLevel"),  # Price range indicator (0-4)
            "websiteUri": place.get("websiteUri"),  # Official website
            "location": place.get("location"),  # Coordinates (lat, lng)
            "currentOpeningHours": place.get("currentOpeningHours", {}).get("weekdayDescriptions"),
            "photos": [photo.get("name") for photo in place.get("photos", [])[:3]],  # First 3 photos
        }
        filtered_places.append(filtered_place)

    return filtered_places

def fetch_places_data(api_key: str, query: str) -> Dict[str, Any]:
    """
    Calls the Google Places Text Search API.
    """
    url = "https://places.googleapis.com/v1/places:searchText"

    headers = {
        "X-Goog-Api-Key": api_key,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "*",
    }

    body = {"textQuery": query}

    try:
        response = requests.post(url, headers=headers, json=body, timeout=10)
        response.raise_for_status()
        return response.json()

    except requests.RequestException as e:
        print(f"❌ Places API request failed: {e}")
        return None


# ======================================================================
# DB HELPERS — STORE FULL RESPONSE PER SEARCH
# ======================================================================
def build_cache_key(destination: str, preferences_list: List[str], experience_type: str) -> str:
    """
    Build a deterministic cache key based on destination + experience + preferences.
    """
    norm_dest = destination.strip().lower()
    norm_exp = str(experience_type).strip().lower()
    norm_prefs = sorted([p.strip().lower() for p in preferences_list]) if preferences_list else []
    return f"{norm_dest}__{norm_exp}__{'|'.join(norm_prefs)}"


def save_trip_response(cache_key: str, response_data: Dict[str, Any]) -> None:
    """
    Save or update the full response for a given cache_key.
    Stored in: settings.MONGO_DB.trip_places_cache
    """
    doc = dict(response_data)
    doc["_id"] = cache_key
    doc["cache_key"] = cache_key
    doc["last_updated"] = datetime.now().isoformat()

    settings.MONGO_DB.trip_places_cache.update_one(
        {"_id": cache_key},
        {"$set": doc},
        upsert=True,
    )


def load_trip_response(cache_key: str) -> Dict[str, Any] | None:
    """
    Load a previously saved response for this cache_key, if available.
    """
    doc = settings.MONGO_DB.trip_places_cache.find_one({"_id": cache_key})
    if doc:
        doc["_id"] = str(doc["_id"])
        return doc
    return None


# ======================================================================
# OLD NEARBY PLACES API (FALLBACK ONLY)
# ======================================================================
def get_places_by_type(place_type: str, lat: float, lng: float):
    """
    Old NearbySearch API used by /v1/places/{destination} as a final fallback.
    """
    URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": 15000,
        "type": place_type,
        "key": GOOGLE_API_KEY,
    }
    try:
        response = requests.get(URL, params=params)
        data = response.json()
        places = []

        for place in data.get("results", [])[:15]:
            place_id = place.get("place_id")
            photos = place.get("photos", [])

            # Get image URLs if available
            image_urls = []
            if photos:
                for photo in photos[:3]:  # Get up to 3 images per place
                    photo_reference = photo.get("photo_reference")
                    if photo_reference:
                        image_url = (
                            f"https://maps.googleapis.com/maps/api/place/photo"
                            f"?maxwidth=400&photoreference={photo_reference}&key={GOOGLE_API_KEY}"
                        )
                        image_urls.append(image_url)

            places.append(
                {
                    "name": place.get("name"),
                    "address": place.get("vicinity"),
                    "rating": place.get("rating"),
                    "user_ratings_total": place.get("user_ratings_total"),
                    "location": place.get("geometry", {}).get("location", {}),
                    "place_id": place_id,
                    "types": place.get("types", []),
                    "images": image_urls,
                    "photo_references": [photo.get("photo_reference") for photo in photos],
                }
            )
        return places

    except Exception as e:
        print(f"Error fetching {place_type} places: {e}")
        return []


@tour_router.get("/v1/places/{destination}")
def tourist_places(request, destination: str):
    """
    Old fallback API: returns plain lists of tourist_attractions / lodging / restaurants.
    Used only when newer flows fail completely.
    """
    try:
        # Step 1: Check cache
        cached_data = settings.MONGO_DB.cached_places.find_one({"destination": destination})
        if cached_data:
            cached_data["_id"] = str(cached_data["_id"])
            print("Cached Data is used....")
            return {"source": "cache", **cached_data}

        # Step 2: Fetch from Google API
        lat, lng, formatted_destination = get_coordinates(destination)
        if lat is None or lng is None:
            return {"error": formatted_destination, "status": 404}

        tourist_places_list = get_places_by_type("tourist_attraction", lat, lng)
        lodging_places = get_places_by_type("lodging", lat, lng)
        restaurant_places = get_places_by_type("restaurant", lat, lng)

        response_data = {
            "destination": formatted_destination,
            "coordinates": {"lat": lat, "lng": lng},
            "tourist_attractions": tourist_places_list,
            "lodging": lodging_places,
            "restaurants": restaurant_places,
            "last_updated": datetime.now().isoformat(),
        }

        # Step 3: Save to cache
        result = settings.MONGO_DB.cached_places.insert_one(response_data)
        response_data["_id"] = str(result.inserted_id)

        return {"source": "api", **response_data}

    except Exception as e:
        return {"error": f"Internal server error: {str(e)}", "status": 500}

# ======================================================================
# ITINERARY GENERATION (AI MODE WITH PLACES + WEATHER)
# ======================================================================
@tour_router.post("/itinerary/generate/")
async def generate_itinerary(request, payload: dict = Body(...)):
    """
    Generate itinerary using Google Gemini API with:
      - reference_places from preference-based search
      - weather forecast (duration-aware)
      - strict rules for attractions, restaurants, lodging
    """
    try:
        destination = payload.get("destination")
        days = int(payload.get("days") or payload.get("duration_days") or 0)
        preferences = payload.get("preferences", []) or []
        mode = payload.get("mode", "ai")
        custom_places = payload.get("places", [])
        experience_type = payload.get("experience_type", "moderate")

        if not destination:
            return {"success": False, "error": "Destination is required."}

        if days <= 0:
            days = 1
        days = min(6, days)

        # ================== LOAD / FETCH PLACES CONTEXT ==================
        preferences_list = [p.strip() for p in preferences] if preferences else []

        # Try trip_places_cache first
        cache_key = build_cache_key(destination, preferences_list, experience_type)
        trip_places = load_trip_response(cache_key)

        if not trip_places:
            # Fallback: call main preference-based API internally to populate cache
            prefs_string = ",".join(preferences_list)
            trip_places = get_preference_based_places(
                request, destination, prefs_string, experience_type
            )
            # If that endpoint returned wrapped structure, unwrap if needed
            if trip_places and isinstance(trip_places, dict) and "reference_places" not in trip_places:
                # It may have {"source": "...", ...}
                pass

            # Reload from cache in case it wrote via save_trip_response
            trip_places = load_trip_response(cache_key) or trip_places

        reference_places = trip_places.get("reference_places", {}) if isinstance(trip_places, dict) else {}
        coords = trip_places.get("coordinates", {}) if isinstance(trip_places, dict) else {}

        # ================== WEATHER (DURATION-AWARE) ==================
        weather_info = trip_places.get("weather") if isinstance(trip_places, dict) else None
        try:
            lat = coords.get("lat")
            lng = coords.get("lng")
            if lat is None or lng is None:
                lat, lng, _ = get_coordinates(destination)
            if lat is not None and lng is not None:
                # 3rd param = duration_days as you requested
                weather_info = weather.get_forecast_weather(lat, lng, days)
        except Exception as we:
            print(f"Weather fetch (duration-aware) failed: {we}")

        # ================== BUILD DAYWISE PLACE PLAN ==================
        daywise_place_plan = []
        if mode == "ai":
            daywise_place_plan = build_daywise_place_plan(
                reference_places=reference_places,
                preferences_list=preferences_list,
                days=days,
            )

        # ================== PREPARE REQUEST DATA FOR GEMINI ==================
        request_data = {
            "destination": destination,
            "duration_days": days,
            "preferences": preferences_list,
            "mode": mode,
            "places_plan": daywise_place_plan,
            "weather": weather_info,
            "budget": payload.get("budget", "moderate"),
            "group_size": payload.get("group_size") or payload.get("people_count", 1),
            "travel_style": payload.get("travel_style") or experience_type,
        }

        if mode == "custom" and custom_places:
            request_data["places"] = custom_places

        gemini_service = GeminiItineraryService()

        logger.info(
            f"Generating itinerary for {destination}, {days} days, mode: {mode}"
        )
        base_itinerary = await gemini_service.generate_itinerary(request_data)

        # Store metadata (we are not storing full AI JSON to Mongo for now)
        itinerary_doc = {
            "destination": destination,
            "days": days,
            "mode": mode,
            "preferences": preferences_list,
            "itinerary": "ai_generated",
            "generated_at": datetime.now(),
            "user_id": getattr(request, "user_id", None),
        }

        result = settings.MONGO_DB.itineraries.insert_one(itinerary_doc)

        logger.info(f"Successfully generated itinerary for {destination}")

        return JsonResponse(
            {
                "success": True,
                "itinerary": base_itinerary,
                "itinerary_id": str(result.inserted_id),
            }
        )

    except Exception as e:
        logger.error(f"Itinerary generation failed: {str(e)}")
        return {"success": False, "error": f"Failed to generate itinerary: {str(e)}"}


# ======================================================================
# NEW NEARBY PLACES API (SECONDARY)
# ======================================================================
@tour_router.get("/places/{destination}")
def get_places_new(request, destination: str):
    """
    Secondary API using NEW Places API (NearbySearch via get_places_data).
    Plain output (flat lists). Also used internally as part of fallback flow.
    """

    try:
        # 1. Check cache
        cached = settings.MONGO_DB.new_places_cache.find_one({"destination": destination})
        if cached:
            cached["_id"] = str(cached["_id"])
            return {"source": "cache", **cached}

        # 2. Geocode destination
        lat, lng, formatted = get_coordinates(destination)
        if lat is None:
            return {"error": formatted, "status": 404}

        # 3. Fetch using get_places_data
        tourist_attractions = get_places_data(GOOGLE_API_KEY, lat, lng, ["tourist_attraction"])
        lodging = get_places_data(GOOGLE_API_KEY, lat, lng, ["lodging"])
        restaurants = get_places_data(GOOGLE_API_KEY, lat, lng, ["restaurant"])

        # 4. Filter duplicates vs global sets (if any from main API)
        ta_filtered = filter_new_places(tourist_attractions, PREF_TOURIST_SET)
        lodging_filtered = filter_new_places(lodging, PREF_LODGING_SET)
        restaurants_filtered = filter_new_places(restaurants, PREF_RESTAURANT_SET)

        response = {
            "destination": formatted,
            "coordinates": {"lat": lat, "lng": lng},
            "tourist_attractions": ta_filtered,
            "lodging": lodging_filtered,
            "restaurants": restaurants_filtered,
            "last_updated": datetime.now().isoformat(),
        }

        inserted = settings.MONGO_DB.new_places_cache.insert_one(response)
        response["_id"] = str(inserted.inserted_id)

        return {"source": "api", **response}

    except Exception as e:
        print(f"Error in get_places_new: {e}")
        return {"error": f"Internal server error: {str(e)}", "status": 500}


def fetch_nearby_grouped(lat: float, lng: float, formatted_destination: str, preferences_list: List[str]):
    """
    Helper used by main API: fetch nearby places via get_places_data, dedupe using global sets,
    and return grouped-by-preference structure.
    """
    tourist_attractions = get_places_data(GOOGLE_API_KEY, lat, lng, ["tourist_attraction"])
    lodging = get_places_data(GOOGLE_API_KEY, lat, lng, ["lodging"])
    restaurants = get_places_data(GOOGLE_API_KEY, lat, lng, ["restaurant"])

    ta_filtered = filter_new_places(tourist_attractions, PREF_TOURIST_SET)
    lodging_filtered = filter_new_places(lodging, PREF_LODGING_SET)
    restaurants_filtered = filter_new_places(restaurants, PREF_RESTAURANT_SET)

    grouped = {
        "tourist_attractions": group_places_by_preference(ta_filtered, preferences_list),
        "lodging": group_places_by_preference(lodging_filtered, preferences_list),
        "restaurants": group_places_by_preference(restaurants_filtered, preferences_list),
    }

    return grouped


# ======================================================================
# MAIN PREFERENCE-BASED API
# ======================================================================
@tour_router.get("/preference-places/{destination}")
def get_preference_based_places(request, destination: str, travel_preferences: str, experience_type: str):
    """
    MAIN API:
    - Uses TextSearch with preference-based query generation.
    - Randomly selects ONE query per category (tourist / restaurant / lodging).
    - Groups results by preference (reference_places).
    - Also calls secondary API logic (NearbySearch) to get recommended_places.
    - Caches full combined response in trip_places_cache keyed by cache_key.
    - Fallback order: main -> secondary -> old v1.
    """
    # Parse preferences
    preferences_list = [p.strip() for p in travel_preferences.split(",")] if travel_preferences else []

    # Build cache key and try DB first
    cache_key = build_cache_key(destination, preferences_list, experience_type)
    cached_full = load_trip_response(cache_key)
    if cached_full:
        print("Using full trip cache for:", cache_key)
        return {"source": "db", **cached_full}

    # Reset global sets for this request
    PREF_TOURIST_SET.clear()
    PREF_LODGING_SET.clear()
    PREF_RESTAURANT_SET.clear()

    try:
        # Geocode
        lat, lng, formatted_destination = get_coordinates(destination)
        if lat is None:
            return {"error": formatted_destination, "status": 404}

        # Weather info for the point
        weather_info = weather.get_forecast_weather(lat, lng)

        # Generate queries (using updated signatures)
        tourist_queries = generate_tourist_queries(preferences_list, experience_type)
        restaurant_queries = generate_restaurant_queries(experience_type, preferences_list)
        lodging_queries = generate_lodging_queries(experience_type, preferences_list)

        tourist_attractions: List[Dict[str, Any]] = []
        restaurants: List[Dict[str, Any]] = []
        lodging: List[Dict[str, Any]] = []

        # ===== TOURIST ATTRACTIONS (Random Query Selection) =====
        if tourist_queries:
            chosen = random.choice(tourist_queries)
            chosen_pref = chosen["preference"]
            chosen_query = chosen["query"]

            raw = fetch_places_data(GOOGLE_API_KEY, f"{chosen_query} in {destination}")
            if raw:
                places = filter_textSearch_place_data(raw)
                for p in places:
                    p["preference_tag"] = chosen_pref
                tourist_attractions.extend(places)

        # ===== RESTAURANTS (Random Query Selection) =====
        if restaurant_queries:
            chosen = random.choice(restaurant_queries)
            chosen_pref = chosen["preference"]
            chosen_query = chosen["query"]

            raw = fetch_places_data(GOOGLE_API_KEY, f"{chosen_query} in {destination}")
            if raw:
                places = filter_textSearch_place_data(raw)
                for p in places:
                    p["preference_tag"] = chosen_pref
                restaurants.extend(places)

        # ===== LODGING (Random Query Selection) =====
        if lodging_queries:
            chosen = random.choice(lodging_queries)
            chosen_pref = chosen["preference"]
            chosen_query = chosen["query"]

            raw = fetch_places_data(GOOGLE_API_KEY, f"{chosen_query} in {destination}")
            if raw:
                places = filter_textSearch_place_data(raw)
                for p in places:
                    p["preference_tag"] = chosen_pref
                lodging.extend(places)

        # Remove duplicates using global sets
        def remove_duplicates(data, limit=20, container_set=None):
            results = []
            count = 0
            if container_set is None:
                container_set = set()

            for place in data:
                pid = place.get("id")
                if not pid:
                    continue

                if pid not in container_set:
                    container_set.add(pid)
                    results.append(place)
                    count += 1

                if count >= limit:
                    break

            return results

        tourist_attractions = remove_duplicates(tourist_attractions, limit=30, container_set=PREF_TOURIST_SET)
        restaurants = remove_duplicates(restaurants, limit=30, container_set=PREF_RESTAURANT_SET)
        lodging = remove_duplicates(lodging, limit=30, container_set=PREF_LODGING_SET)

        # Build REFERENCE places (grouped by preference)
        reference_places = {
            "tourist_attractions": group_places_by_preference(tourist_attractions, preferences_list),
            "restaurants": group_places_by_preference(restaurants, preferences_list),
            "lodging": group_places_by_preference(lodging, preferences_list),
        }

        # Now call secondary logic (NearbySearch) for RECOMMENDED places
        try:
            recommended_places = fetch_nearby_grouped(lat, lng, formatted_destination, preferences_list)
            secondary_source = "secondary"
        except Exception as e2:
            print(f"Secondary fetch_nearby_grouped failed: {e2}")
            # If secondary fails, recommended is empty but structure preserved
            recommended_places = {
                "tourist_attractions": {"_others": []},
                "restaurants": {"_others": []},
                "lodging": {"_others": []},
            }
            secondary_source = "secondary_failed"

        # Prepare final response structure
        response_data = {
            "cache_key": cache_key,
            "destination": formatted_destination,
            "coordinates": {"lat": lat, "lng": lng},
            "travel_preferences": preferences_list,
            "experience_type": experience_type,
            "generated_queries": {
                "tourist_attractions": tourist_queries,
                "restaurants": restaurant_queries,
                "lodging": lodging_queries,
            },
            "reference_places": reference_places,
            "recommended_places": recommended_places,
            "weather": weather_info,
            "secondary_source": secondary_source,
        }

        # Store full response in DB
        save_trip_response(cache_key, response_data)

        print(
            f"Fetched {len(tourist_attractions)} attractions, "
            f"{len(restaurants)} restaurants, {len(lodging)} lodging"
        )

        return {"source": "api", **response_data}

    except Exception as e_main:
        print(f"Error in main preference-based flow: {str(e_main)}")

        # ===================== FALLBACK 1: Secondary API ONLY =====================
        try:
            lat, lng, formatted_destination = get_coordinates(destination)
            if lat is None:
                raise RuntimeError("Geocoding failed in secondary fallback.")

            weather_info = weather.get_forecast_weather(lat, lng)

            preferences_list_fallback = preferences_list or []

            recommended_places = fetch_nearby_grouped(lat, lng, formatted_destination, preferences_list_fallback)
            reference_places = recommended_places  # Use same as reference if main failed

            response_data = {
                "cache_key": cache_key,
                "destination": formatted_destination,
                "coordinates": {"lat": lat, "lng": lng},
                "travel_preferences": preferences_list_fallback,
                "experience_type": experience_type,
                "generated_queries": {},
                "reference_places": reference_places,
                "recommended_places": recommended_places,
                "weather": weather_info,
                "secondary_source": "secondary_only",
            }

            save_trip_response(cache_key, response_data)
            return {"source": "fallback_secondary", **response_data}

        except Exception as e_sec:
            print(f"Secondary-only fallback failed: {e_sec}")

            # ===================== FALLBACK 2: OLD V1 API =====================
            v1 = tourist_places(request, destination)
            if "error" in v1:
                return v1

            coords = v1.get("coordinates", {})
            ref_places = {
                "tourist_attractions": {"_others": v1.get("tourist_attractions", [])},
                "restaurants": {"_others": v1.get("restaurants", [])},
                "lodging": {"_others": v1.get("lodging", [])},
            }
            recommended_places = {
                "tourist_attractions": {"_others": []},
                "restaurants": {"_others": []},
                "lodging": {"_others": []},
            }

            response_data = {
                "cache_key": cache_key,
                "destination": v1.get("destination", destination),
                "coordinates": coords,
                "travel_preferences": preferences_list,
                "experience_type": experience_type,
                "generated_queries": {},
                "reference_places": ref_places,
                "recommended_places": recommended_places,
                "weather": None,
                "secondary_source": "v1_fallback",
            }

            save_trip_response(cache_key, response_data)
            return {"source": "fallback_v1", **response_data}


# ======================================================================
# TRIP-BASED REUSE ENDPOINT
# ======================================================================
@tour_router.get("/trip-places/{trip_id}")
def get_places_for_trip(request, trip_id: str):
    """
    Reuse trip details stored in Mongo and call main preference-based logic.
    """
    try:
        from bson import ObjectId

        trip = settings.MONGO_DB.trip_details.find_one({"_id": ObjectId(trip_id)})
        if not trip:
            return {"error": "Trip not found", "status": 404}

        destination = trip.get("to_location")
        prefs = trip.get("travel_preferences", [])
        experience = trip.get("experience_type", "moderate")

        if not destination:
            return {"error": "Destination missing in trip data", "status": 400}

        preferences_string = ",".join(prefs)

        return get_preference_based_places(
            request,
            destination,
            preferences_string,
            experience,
        )

    except Exception as e:
        print(f"Error in get_places_for_trip: {str(e)}")
        return {"error": f"Internal server error: {str(e)}", "status": 500}
