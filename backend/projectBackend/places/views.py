import os
import requests
from dotenv import load_dotenv
from django.shortcuts import render, redirect
from ninja import Router
from .schemas import TripDetailsSchema
from django.conf import settings
import googlemaps

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


# This was using the googlemaps Package.
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
            "location": place["geometry"]["location"]
        })

    return places


# This is using the URLs for getting a better accessibility to the APIs.
def get_places_by_type(place_type: str, lat: float, lng: float):
    """
        Get places by type using coordinates (more efficient)
        Gives more accurate results

        place_type -> Denotes the type of place it is called for can be ('Tourist attractions', 'Lodging', 'Restaurants')
        lat -> Latitude
        lng -> Longitude
    """

    URL = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    
    params = {
        "location": f"{lat},{lng}",
        "radius": 15000,  # 15km radius
        "type": place_type,
        "key": GOOGLE_API_KEY
    }

    try:
        response = requests.get(URL, params=params)
        data = response.json()
        
        places = []
        for place in data.get("results", [])[:15]:  # Limit to 15 places
            places.append({
                "name": place.get("name"),
                "address": place.get("vicinity"),
                "rating": place.get("rating"),
                "user_ratings_total": place.get("user_ratings_total"),
                "location": place.get("geometry", {}).get("location", {}),
                "place_id": place.get("place_id"),
                "types": place.get("types", [])
            })
        
        return places
    except Exception as e:
        print(f"Error fetching {place_type} places: {e}")
        return []


# To Get coordinates for a destination with error handling
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


# API to make the call.
@tour_router.get("/places/{destination}")
def tourist_places(request, destination: str):
    """
        Get all types of places with detailed information
    """
    
    try:
        # Get coordinates once and reuse them
        lat, lng, formatted_destination = get_coordinates(destination)
        
        if lat is None or lng is None:
            return {
                "error": formatted_destination,  # This contains the error message
                "status": 404
            }
        
        # Use the coordinates to fetch all place types
        tourist_places = get_places_by_type("tourist_attraction", lat, lng)
        lodging_places = get_places_by_type("lodging", lat, lng)
        restaurant_places = get_places_by_type("restaurant", lat, lng)
        
        print(f"Found {len(tourist_places)} tourist places")
        print(f"Found {len(lodging_places)} lodging places")
        print(f"Found {len(restaurant_places)} restaurant places")

        return {
            "destination": formatted_destination,
            "coordinates": {"lat": lat, "lng": lng},
            "tourist_attractions": tourist_places,
            "lodging": lodging_places,
            "restaurants": restaurant_places
        }
        
    except Exception as e:
        return {"error": f"Internal server error: {str(e)}", "status": 500}
