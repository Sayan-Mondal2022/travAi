import os
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


@tour_router.get("/places/{destination}")
def tourist_places(request, destination: str):
    places = get_tourist_places(destination)
    return {"destination": destination, "places": places}
