import os
import requests
from dotenv import load_dotenv
from django.conf import settings
from .schemas import TripDetailsSchema
from ninja import Router
import googlemaps
from datetime import datetime, date
from bson import ObjectId
# from ML_models.models import itinerary_model

trip_router = Router()
tour_router = Router()

# Load environment variables from .env file
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)


# --- Trip Endpoints ---
@trip_router.post("/add-trip/")
def add_trip(request, payload: TripDetailsSchema):
    """
    Saves trip details to the database after converting data types.
    """
    trip_doc = payload.dict()

    # Convert date to datetime for MongoDB compatibility
    if 'date' in trip_doc and isinstance(trip_doc['date'], date):
        trip_doc['date'] = datetime.combine(trip_doc['date'], datetime.min.time())

    result = settings.MONGO_DB.trip_details.insert_one(trip_doc)

    # Prepare the document for a clean JSON response
    trip_doc['_id'] = str(result.inserted_id)
    trip_doc['date'] = trip_doc['date'].isoformat()

    return {"message": "Trip saved successfully", "data": trip_doc}


@trip_router.get("/trips/")
def list_trips(request):
    """
    Lists all trips, ensuring ObjectId and datetime are JSON serializable.
    """
    trips = []
    for trip in settings.MONGO_DB.trip_details.find({}):
        trip['_id'] = str(trip['_id'])
        if isinstance(trip.get('date'), datetime):
            trip['date'] = trip['date'].isoformat()
        trips.append(trip)
    return {"trips": trips}


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
        return location["lat"], location["lng"], formatted_address
    except Exception as e:
        print(f"Geocoding error for {destination}: {e}")
        return None, None, f"Geocoding failed: {str(e)}"

"""
    The Places that were fetched, is not having a time or opening hours
"""
def filter_places(places, start_time, end_time, min_rating):
    """
    Filters places based on operating hours and average review rating.
    NOTE: This function assumes a very specific input data structure.
    """
    # These become datetime objects with a date of 1900-01-01
    start = datetime.strptime(start_time, "%H:%M")
    end = datetime.strptime(end_time, "%H:%M")
    
    # FIX 1: Get the current datetime correctly
    current_time = datetime.now()

    filtered = []
    for place in places:
        # --- Check operating hours ---
        # This part remains risky and depends heavily on the input format
        try:
            hours = place.get("operating_hours", ["00:00", "23:59"])
            open_time = datetime.strptime(hours[0], "%H:%M")
            close_time = datetime.strptime(hours[1], "%H:%M")
            
            # Make current_time comparable by setting the date to 1900-01-01
            current_time_only = current_time.replace(year=1900, month=1, day=1, microsecond=0)
            is_open_now = open_time <= current_time_only <= close_time
        except (ValueError, TypeError):
            # If operating_hours format is wrong, assume it's open to be safe
            is_open_now = True

        # --- Check reviews in time window ---
        reviews = place.get("reviews", [])
        relevant_reviews = []
        for review in reviews:
            try:
                review_time = datetime.fromisoformat(review.get("timestamp"))
                # FIX 2: Compare only the .time() parts of the datetime objects
                if start.time() <= review_time.time() <= end.time():
                    relevant_reviews.append(review)
            except (ValueError, TypeError, AttributeError):
                # Ignore reviews with bad timestamps
                continue
        
        if relevant_reviews:
            average_rating = sum(r.get("rating", 0) for r in relevant_reviews) / len(relevant_reviews)
        else:
            # If no relevant reviews, use the place's overall rating as a fallback
            average_rating = place.get("rating", 0)
        
        if is_open_now and average_rating >= min_rating:
            filtered.append(place)

    return filtered


@tour_router.get("/places/{destination}")
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
    

@tour_router.get("/itinerary/generate/")
def generate_itinerary(request):
    pass