import os
import requests
from dotenv import load_dotenv
from django.conf import settings
from .schemas import TripDetailsSchema
from ninja import Router, Body
import googlemaps
from datetime import datetime, date
import logging
import sys
import os
import json
import google.generativeai as genai
from django.http import JsonResponse

# Add the parent directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

logger = logging.getLogger(__name__)
trip_router = Router()
tour_router = Router()

# Load environment variables from .env file
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)

class GeminiItineraryService:
    def __init__(self):
        genai.configure(api_key=GOOGLE_GEMINI_API_KEY)
        self.model = genai.GenerativeModel(
            'gemini-2.5-flash',
            generation_config={
                "response_mime_type": "application/json",
                "temperature": 0.2}
        )
    
    async def generate_itinerary(self, request_data):
        try:
            prompt = self._build_itinerary_prompt(request_data)
            response = await self.model.generate_content_async(prompt)
            raw_text = response.text.strip()
            
            # Extract JSON substring safely
            json_start = raw_text.find('{')
            json_end = raw_text.rfind('}') + 1
            json_text = raw_text[json_start:json_end]
            
            return json.loads(json_text)

        except Exception as e:
            logger.error(f"Gemini itinerary generation failed: {str(e)}")
            raise Exception(f"AI service failed: {str(e)}")
    
    def _build_itinerary_prompt(self, request_data):
        """Build a detailed prompt for Gemini"""
        
        destination = request_data.get('destination', 'an amazing place')
        days = request_data.get('duration_days', 3)
        preferences = request_data.get('preferences', [])
        budget = request_data.get('budget', 'moderate')
        group_size = request_data.get('group_size', 2)
        travel_style = request_data.get('travel_style', 'balanced')
        mode = request_data.get('mode', 'ai')
        custom_places = request_data.get('places', [])

        base_prompt = f"""
            You are a travel planner AI. Generate a detailed {days}-day itinerary for {destination} for {group_size} people.

            Travel Style: {travel_style}
            Budget: {budget}
            Preferences: {', '.join(preferences) if preferences else 'General travel'}

            ### Instructions:
            - Return the response strictly as **valid JSON**.
            - Do **not** include any natural language outside the JSON.
            - Ensure JSON keys and structure are **exactly** as shown below.
            - All costs should be approximate ranges (in INR).
            - Each day must include morning, afternoon, and evening plans.

            ### Output JSON Schema Example:
            {{
            "itinerary": [
                {{
                "day": "1",
                "theme": "Exploring {destination}'s Highlights",
                "budget": {{
                    "food": "INR 1500-2500",
                    "transportation": "INR 500-800",
                    "activities": "INR 1000-1500",
                    "total": "INR 3000-4500"
                }},
                "schedule": {{
                    "morning": ["Activity 1", "Activity 2"],
                    "afternoon": ["Activity 3", "Activity 4"],
                    "evening": ["Activity 5"]
                }},
                "local_cuisine_recommendations": ["Dish 1", "Dish 2"],
                "travel_tips": ["Tip 1", "Tip 2"]
                }}
            ],
            "overall_summary": "A short summary of the trip."
            }}

            If mode = "custom" and custom_places are given, integrate these places evenly throughout the itinerary:
            {', '.join([place.get('name', '') for place in custom_places]) if custom_places else 'No custom places'}

            Now, generate the itinerary in **this exact JSON format** only.
            """

        
        return base_prompt
    
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
    