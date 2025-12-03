import os
import random
import requests
import logging
from django.http import JsonResponse
from django.conf import settings
from datetime import datetime
from dotenv import load_dotenv
import googlemaps
from places.services.itinerary import GeminiItineraryService
from places.services.get_weather import WeatherService
from places.services.get_places import get_places_data
from ninja import Router, Body
from typing import Dict, Any, List
from places.services.place_queries import (
    generate_tourist_queries, 
    generate_restaurant_queries, 
    generate_lodging_queries
)

# Ninja Routers
tour_router = Router()

# Load environment variables from .env file
load_dotenv()
logger = logging.getLogger(__name__)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)
weather = WeatherService(api_key=GOOGLE_API_KEY)

weather_data = {}

# ===== GLOBAL HASHSETS TO STORE UNIQUE PLACE IDs =====
PREF_TOURIST_SET = set()
PREF_LODGING_SET = set()
PREF_RESTAURANT_SET = set()

# Even this function will not be used
def get_places_by_type(place_type: str, lat: float, lng: float):
    URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "location": f"{lat},{lng}",
        "radius": 15000,
        "type": place_type,
        "key": GOOGLE_API_KEY
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
                        image_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photo_reference}&key={GOOGLE_API_KEY}"
                        image_urls.append(image_url)
            
            places.append({
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
                "location": place.get("geometry", {}).get("location", {}),
                "place_id": place_id,
                "types": place.get("types", []),
                "images": image_urls,  # Add image URLs here
                "photo_references": [photo.get("photo_reference") for photo in photos]  # Optional: keep references
            })
        return places
    
    except Exception as e:
        print(f"Error fetching {place_type} places: {e}")
        return []


def get_coordinates(destination: str):
    try:
        geocode_result = gmaps.geocode(destination)
        if not geocode_result:
            return None, None, f"Could not find location: {destination}"
        location = geocode_result[0]['geometry']['location']
        formatted_address = geocode_result[0].get('formatted_address', destination)

        latitude = location['lat']
        longitude = location['lng']

        weather_data = weather.get_forecast_weather(latitude, longitude)

        return latitude, longitude, formatted_address
    except Exception as e:
        print(f"Geocoding error for {destination}: {e}")
        return None, None, f"Geocoding failed: {str(e)}"

# This was the old Places Fetching API
@tour_router.get("/v1/places/{destination}")
def tourist_places(request, destination: str):
    """
    Get all types of places with caching.
    """
    try:
        # Step 1: Check cache
        cached_data = settings.MONGO_DB.cached_places.find_one({"destination": destination})
        if cached_data:
            # Convert ObjectId to string
            cached_data["_id"] = str(cached_data["_id"])
            print("Cached Data is used....")
            return {"source": "cache", **cached_data}

        # Step 2: Fetch from Google API
        lat, lng, formatted_destination = get_coordinates(destination)
        if lat is None or lng is None:
            return {"error": formatted_destination, "status": 404}

        tourist_places = get_places_by_type("tourist_attraction", lat, lng)
        lodging_places = get_places_by_type("lodging", lat, lng)
        restaurant_places = get_places_by_type("restaurant", lat, lng)

        response_data = {
            "destination": destination,
            "coordinates": {"lat": lat, "lng": lng},
            "tourist_attractions": tourist_places,
            "lodging": lodging_places,
            "restaurants": restaurant_places,
            "last_updated": datetime.now()
        }

        # Step 3: Save to cache
        result = settings.MONGO_DB.cached_places.insert_one(response_data)
        response_data["_id"] = str(result.inserted_id)

        return {"source": "api", **response_data}

    except Exception as e:
        return {"error": f"Internal server error: {str(e)}", "status": 500}
    

@tour_router.post("/itinerary/generate/")
async def generate_itinerary(request, payload: dict = Body(...)):
    """
    Generate itinerary using Google Gemini API with optional custom places
    """
    try:
        # Extract request data
        destination = payload.get('destination')
        days = int(payload.get('days', 0))
        preferences = payload.get('preferences', [])
        mode = payload.get('mode', 'ai')
        custom_places = payload.get('places', [])

        # --- Validate required fields ---
        if not destination:
            return {"success": False, "error": "Destination is required."}

        # --- Prepare request data for Gemini service ---
        request_data = {
            "destination": destination,
            "duration": days,
            "preferences": preferences,
            "mode": mode,
        }
        print("Request Data:", request_data)

        # For custom mode, include selected places
        if mode == "custom" and custom_places:
            request_data["places"] = custom_places

        # Add optional trip details
        optional_fields = ["budget", "group_size", "travel_style", "start_date", "end_date"]
        for field in optional_fields:
            if field in payload:
                request_data[field] = payload[field]

        # --- Initialize services ---
        gemini_service = GeminiItineraryService()
        # data_enrichment = DataEnrichmentService()

        logger.info(f"Generating itinerary for {destination}, {days} days, mode: {mode}")

        # --- Generate itinerary using Gemini ---
        base_itinerary = await gemini_service.generate_itinerary(request_data)
        # print("Base plan:", base_itinerary)
        # enriched_itinerary = await data_enrichment.enrich_itinerary(base_itinerary, destination)

        # --- Save itinerary ---
        itinerary_doc = {
            "destination": destination,
            "days": days,
            "mode": payload.get('mode', 'ai'),
            "preferences": payload.get('preferences', []),
            "itinerary": 'enriched_itinerary',
            "generated_at": datetime.now(),
            "user_id": getattr(request, "user_id", None),
        }

        result = settings.MONGO_DB.itineraries.insert_one(itinerary_doc)
        itinerary_doc["_id"] = str(result.inserted_id)

        logger.info(f"Successfully generated itinerary for {destination}")

        # --- Return response ---
        print("Itinerary:", base_itinerary)
       

        return JsonResponse({
            "success": True,
            "itinerary": base_itinerary,
            "itinerary_id": str(result.inserted_id),
        })

    except Exception as e:
        logger.error(f"Itinerary generation failed: {str(e)}")
        return {"success": False, "error": f"Failed to generate itinerary: {str(e)}"}

def filter_new_places(data, container_set):
    print(data, "\n")
    filtered = []
    for place in data:
        pid = place.get("id")
        if pid and pid not in container_set:
            filtered.append(place)
    return filtered


@tour_router.get("/places/{destination}")
def get_places_new(request, destination: str):
    """
    Fetches tourist_attractions, lodging, restaurants using NEW Places API.
    Caches results in Mongo similar to your existing endpoint.
    """

    # 1. Check cache
    cached = settings.MONGO_DB.new_places_cache.find_one({"destination": destination})
    if cached:
        cached["_id"] = str(cached["_id"])
        return {"source": "cache", **cached}

    # 2. Geocode destination
    lat, lng, formatted = get_coordinates(destination)
    if lat is None:
        return {"error": formatted, "status": 404}

    tourist_attractions = get_places_data(GOOGLE_API_KEY, lat, lng, ["tourist_attraction"])
    lodging = get_places_data(GOOGLE_API_KEY, lat, lng, ["lodging"])
    restaurants = get_places_data(GOOGLE_API_KEY, lat, lng, ["restaurant"])

    # ===== FILTER OUT PLACES ALREADY FETCHED BY MAIN API =====
    tourist_attractions = filter_new_places(tourist_attractions, PREF_TOURIST_SET)
    lodging = filter_new_places(lodging, PREF_LODGING_SET)
    restaurants = filter_new_places(restaurants, PREF_RESTAURANT_SET)

    response = {
        "destination": formatted,
        "coordinates": {"lat": lat, "lng": lng},

        # Only NEW places (excluding preference-based results)
        "tourist_attractions": tourist_attractions,
        "lodging": lodging,
        "restaurants": restaurants,
    }


    # 4. Save to cache
    inserted = settings.MONGO_DB.new_places_cache.insert_one(response)
    response["_id"] = str(inserted.inserted_id)

    return {"source": "api", **response}


# FILTER FUNCTION (CLEAN + FIXED)
def filter_textSearch_place_data(raw_data: dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Extract specific fields from the raw Google Places JSON response.
    """
    filtered_places = []

    for place in raw_data.get("places", []):
        filtered_place = {
            "name": place.get("name"),
            "id": place.get("id"),
            "types": place.get("types"),
            "internationalPhoneNumber": place.get("internationalPhoneNumber"),
            "formattedAddress": place.get("formattedAddress"),
            "editorialSummary.text": place.get("editorialSummary", {}).get("text"),
            "addressDescriptor.landmarks": place.get("addressDescriptor", {}).get("landmarks"),
            "googleMapsLinks.directionsUri": place.get("googleMapsLinks", {}).get("directionsUri"),
            "googleMapsLinks.placeUri": place.get("googleMapsLinks", {}).get("placeUri"),
            "googleMapsLinks.reviewsUri": place.get("googleMapsLinks", {}).get("reviewsUri"),
            "googleMapsLinks.photosUri": place.get("googleMapsLinks", {}).get("photosUri"),
            "reviewSummary.text": place.get("reviewSummary", {}).get("text"),
        }
        filtered_places.append(filtered_place)

    return filtered_places


# 2. API CALLING FUNCTION
def fetch_places_data(api_key: str, query: str) -> Dict[str, Any]:
    """
    Calls the Google Places Text Search API with a corrected FieldMask.
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


def safe_str(value):
    """Convert any type (dict, list, None, int) safely to string."""
    if isinstance(value, dict):
        return " ".join([safe_str(v) for v in value.values()])
    if isinstance(value, list):
        return " ".join([safe_str(v) for v in value])
    if value is None:
        return ""
    return str(value)
    

def group_places_by_preference(places, preferences_list):
    """
    Groups places based on whether the place-related text contains the preference.
    """
    grouped = {pref: [] for pref in preferences_list}
    grouped["_others"] = []

    for place in places:
        # Combine all relevant text fields safely
        combined_text = (
            safe_str(place.get("name")) + " " +
            safe_str(place.get("types")) + " " +
            safe_str(place.get("editorialSummary.text")) + " " +
            safe_str(place.get("reviewSummary.text")) + " " +
            safe_str(place.get("formattedAddress"))
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


# 3. MAIN ENDPOINT
@tour_router.get("/preference-places/{destination}")
def get_preference_based_places(request, destination: str, travel_preferences: str, experience_type: str):
    """
    Get places based on user travel preferences and experience type.
    """
    try:
        # Parse preferences
        preferences_list = [p.strip() for p in travel_preferences.split(",")] if travel_preferences else []

        # Cache key
        cache_key = f"{destination}_{experience_type}_{hash(frozenset(preferences_list))}"

        # Check cache
        cached = settings.MONGO_DB.preference_places_cache.find_one({"cache_key": cache_key})
        if cached:
            cached["_id"] = str(cached["_id"])
            print("Using cached preference-based places...")
            return {"source": "cache", **cached}

        # Get coordinates
        lat, lng, formatted_destination = get_coordinates(destination)
        if lat is None:
            return {"error": formatted_destination, "status": 404}

        # Generate queries
        tourist_queries = generate_tourist_queries(preferences_list, experience_type)
        restaurant_queries = generate_restaurant_queries(preferences_list, experience_type)
        lodging_queries = generate_lodging_queries(preferences_list, experience_type)

        tourist_attractions = []
        restaurants = []
        lodging = []

        # ===== TOURIST ATTRACTIONS (Random Query Selection) =====
        if tourist_queries:
            chosen = random.choice(tourist_queries)
            chosen_pref = chosen["preference"]
            chosen_query = chosen["query"]

            raw = fetch_places_data(GOOGLE_API_KEY, f"{chosen_query} in {destination}")
            if raw:
                places = filter_textSearch_place_data(raw)

                # Tag all places with the preference that produced it
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


        # Remove duplicates
        def remove_duplicates(data, limit=20, container_set=None):
            results = []
            count = 0

            for place in data:
                pid = place.get("id")
                if not pid:
                    continue

                # If not already seen globally
                if pid not in container_set:
                    container_set.add(pid)
                    results.append(place)
                    count += 1

                if count >= limit:
                    break

            return results

        tourist_attractions = remove_duplicates(
            tourist_attractions, 
            container_set=PREF_TOURIST_SET
        )
        restaurants = remove_duplicates(
            restaurants, 
            container_set=PREF_RESTAURANT_SET
        )
        lodging = remove_duplicates(
            lodging, 
            container_set=PREF_LODGING_SET
        )


        print("This is logging from preference-based places endpoint.")
        print(f"Tourist set {PREF_TOURIST_SET}")
        print(f"Lodging set {PREF_RESTAURANT_SET}")
        print(f"Restaurant set {PREF_RESTAURANT_SET}")

        # Final response
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

            # NEW GROUPED OUTPUT
            "tourist_attractions": group_places_by_preference(tourist_attractions, preferences_list),
            "restaurants": group_places_by_preference(restaurants, preferences_list),
            "lodging": group_places_by_preference(lodging, preferences_list),

            "last_updated": datetime.now().isoformat(),
        }


        # Insert into cache
        result = settings.MONGO_DB.preference_places_cache.insert_one(response_data)
        response_data["_id"] = str(result.inserted_id)

        print(f"Fetched {len(tourist_attractions)} attractions, {len(restaurants)} restaurants, {len(lodging)} lodging")

        return {"source": "api", **response_data}

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": f"Internal server error: {str(e)}", "status": 500}


# 4. SECOND ENDPOINT 
@tour_router.get("/trip-places/{trip_id}")
def get_places_for_trip(request, trip_id: str):
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

        # Reuse logic safely
        return get_preference_based_places(
            request,
            destination,
            preferences_string,
            experience
        )

    except Exception as e:
        print(f"Error: {str(e)}")
        return {"error": f"Internal server error: {str(e)}", "status": 500}
