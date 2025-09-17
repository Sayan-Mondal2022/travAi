import os
import requests
from dotenv import load_dotenv
from django.conf import settings
from ninja import Router
from .schemas import TripDetailsSchema
import googlemaps
from datetime import datetime

trip_router = Router()
tour_router = Router()

# Load environment variables from .env file
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

gmaps = googlemaps.Client(key=GOOGLE_API_KEY)


@trip_router.post("/add-trip/")
def add_trip(request, payload: TripDetailsSchema):
    trip_doc = payload.dict()
    settings.MONGO_DB.trip_details.insert_one(trip_doc)
    return {"message": "Trip saved successfully", "data": trip_doc}


@trip_router.get("/trips/")
def list_trips(request):
    trips = list(settings.MONGO_DB.trip_details.find({}, {"_id": 0}))
    return {"trips": trips}


def get_tourist_places(destination: str, limit: int = 10):
    places_result = gmaps.places(
        query=f"tourist attractions in {destination}",
        type="tourist_attraction"
    )

    places = []
    for place in places_result.get("results", [])[:limit]:
        places.append({
            "name": place.get("name"),
            "address": place.get("formatted_address"),
            "rating": place.get("rating"),
            "user_ratings_total": place.get("user_ratings_total"),
            "location": place["geometry"]["location"],
            "operating_hours": ["09:00", "18:00"],  # Placeholder if not available
            "reviews": []  # Placeholder if not available
        })

    return places


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
            places.append({
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
                "location": place.get("geometry", {}).get("location", {}),
                "place_id": place.get("place_id"),
                "types": place.get("types", []),
                "operating_hours": ["09:00", "18:00"],  # Placeholder
                "reviews": []  # Placeholder
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
        return location["lat"], location["lng"], formatted_address
    except Exception as e:
        print(f"Geocoding error for {destination}: {e}")
        return None, None, f"Geocoding failed: {str(e)}"


def filter_places(places, start_time, end_time, min_rating):
    """
    Filters places based on operating hours and average review rating.
    :param places: List of place dicts
    :param start_time: 'HH:MM' string
    :param end_time: 'HH:MM' string
    :param min_rating: Minimum acceptable rating (float)
    :return: Filtered list of places
    """
    start = datetime.strptime(start_time, "%H:%M")
    end = datetime.strptime(end_time, "%H:%M")
    current_time = datetime.utcnow()

    filtered = []
    for place in places:
        # Check operating hours
        hours = place.get("operating_hours", ["00:00", "23:59"])
        open_time = datetime.strptime(hours[0], "%H:%M")
        close_time = datetime.strptime(hours[1], "%H:%M")
        current_time_only = current_time.replace(year=1900, month=1, day=1)
        is_open_now = open_time <= current_time_only <= close_time

        # Check reviews in time window
        reviews = place.get("reviews", [])
        relevant_reviews = []
        for review in reviews:
            try:
                review_time = datetime.fromisoformat(review.get("timestamp"))
                if start <= review_time <= end:
                    relevant_reviews.append(review)
            except Exception as e:
                continue
        
        if relevant_reviews:
            average_rating = sum(r.get("rating", 0) for r in relevant_reviews) / len(relevant_reviews)
        else:
            average_rating = 0
        
        if is_open_now and average_rating >= min_rating:
            filtered.append(place)

    return filtered


@tour_router.get("/places/{destination}")
def tourist_places(request, destination: str, start_time: str = "00:00", end_time: str = "23:59", min_rating: float = 0):
    """
    Get all types of places with detailed information and filter them based on time and rating.
    Query parameters:
      - start_time: 'HH:MM'
      - end_time: 'HH:MM'
      - min_rating: float
    """
    try:
        lat, lng, formatted_destination = get_coordinates(destination)
        if lat is None or lng is None:
            return {"error": formatted_destination, "status": 404}

        tourist_places = get_places_by_type("tourist_attraction", lat, lng)
        lodging_places = get_places_by_type("lodging", lat, lng)
        restaurant_places = get_places_by_type("restaurant", lat, lng)

        # Apply filtering
        tourist_places = filter_places(tourist_places, start_time, end_time, min_rating)
        lodging_places = filter_places(lodging_places, start_time, end_time, min_rating)
        restaurant_places = filter_places(restaurant_places, start_time, end_time, min_rating)

        return {
            "destination": formatted_destination,
            "coordinates": {"lat": lat, "lng": lng},
            "tourist_attractions": tourist_places,
            "lodging": lodging_places,
            "restaurants": restaurant_places
        }

    except Exception as e:
        return {"error": f"Internal server error: {str(e)}", "status": 500}
