import os
import requests
from dotenv import load_dotenv
from django.conf import settings
from .schemas import TripDetailsSchema
from ninja import Router
from ninja import Body
import googlemaps
from datetime import datetime, date
from bson import ObjectId
from django.http import JsonResponse
import logging
import sys
import os

# Add the parent directory to Python path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

# Now you can import directly
from ML_models.services.ai_service import AIItineraryService
from ML_models.services.data_enrichment import DataEnrichmentService

logger = logging.getLogger(__name__)
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
    

@tour_router.post("/itinerary/generate/")
async def generate_itinerary(request, payload: dict = Body(...)):
    """
    Generate itinerary using AI service with optional custom places
    """
    try:
        # Log incoming data for debugging
        # print("Received Payload:", payload)

        # Extract request data
        destination = payload.get('destination')
        days = int(payload.get('days', 0))
        preferences = payload.get('preferences', [])
        mode = payload.get('mode', 'ai')
        custom_places = payload.get('places', [])

        # --- Validate required fields ---
        if not destination:
            return {"success": False, "error": "Destination is required."}

        if days < 1:
            return {"success": False, "error": "Valid number of days is required."}

        # --- Prepare request data for AI service ---
        request_data = {
            "destination": destination,
            "duration": days,
            "preferences": preferences,
            "mode": mode,
        }
        print(request_data)

        # For custom mode, include selected places
        if mode == "custom" and custom_places:
            request_data["places"] = custom_places

        # Add optional trip details
        optional_fields = ["budget", "group_size", "travel_style", "start_date", "end_date"]
        for field in optional_fields:
            if field in payload:
                request_data[field] = payload[field]

        # --- Initialize AI services ---
        ai_service = AIItineraryService()
        data_enrichment = DataEnrichmentService()

        logger.info(f"Generating itinerary for {destination}, {days} days, mode: {mode}")

        # --- Generate itinerary ---
        base_itinerary = await ai_service.generate_itinerary(request_data)
        print("Base plan:",base_itinerary)
        enriched_itinerary = await data_enrichment.enrich_itinerary(base_itinerary, destination)

        # --- Save itinerary ---
        itinerary_doc = {
            "destination": destination,
            "days": days,
            "mode": mode,
            "preferences": preferences,
            "custom_places": custom_places if mode == "custom" else [],
            "itinerary": enriched_itinerary,
            "generated_at": datetime.now(),
            "user_id": getattr(request, "user_id", None),
        }

        result = settings.MONGO_DB.itineraries.insert_one(itinerary_doc)
        itinerary_doc["_id"] = str(result.inserted_id)

        logger.info(f"Successfully generated itinerary for {destination}")

        # --- Return response ---
        print("Itinerary:",enriched_itinerary)
        return {
            "success": True,
            "itinerary": enriched_itinerary,
            "itinerary_id": str(result.inserted_id),
            "metadata": {
                "destination": destination,
                "days": days,
                "mode": mode,
                "generated_at": datetime.now().isoformat(),
            },
        }

    except Exception as e:
        logger.error(f"Itinerary generation failed: {str(e)}")
        return {"success": False, "error": f"Failed to generate itinerary: {str(e)}"}
    

@tour_router.get("/itinerary/{itinerary_id}")
def get_itinerary(request, itinerary_id: str):
    """
    Retrieve a specific itinerary by ID
    """
    try:
        itinerary = settings.MONGO_DB.itineraries.find_one(
            {"_id": ObjectId(itinerary_id)}
        )
        
        if not itinerary:
            return JsonResponse(
                {"error": "Itinerary not found"}, 
                status=404
            )
        
        itinerary['_id'] = str(itinerary['_id'])
        if isinstance(itinerary.get('generated_at'), datetime):
            itinerary['generated_at'] = itinerary['generated_at'].isoformat()
        
        return {"itinerary": itinerary}
        
    except Exception as e:
        logger.error(f"Failed to retrieve itinerary: {str(e)}")
        return JsonResponse(
            {"error": "Failed to retrieve itinerary"}, 
            status=500
        )

@tour_router.post("/itinerary/{itinerary_id}/refine/")
async def refine_itinerary(request, itinerary_id: str, payload: dict):
    """
    Refine an existing itinerary based on user feedback
    """
    try:
        feedback = payload.get('feedback')
        if not feedback:
            return JsonResponse(
                {"error": "Feedback is required for refinement"}, 
                status=400
            )

        # Get original itinerary
        original_itinerary = settings.MONGO_DB.itineraries.find_one(
            {"_id": ObjectId(itinerary_id)}
        )
        
        if not original_itinerary:
            return JsonResponse(
                {"error": "Original itinerary not found"}, 
                status=404
            )

        # Initialize AI service
        ai_service = AIItineraryService()
        
        # Refine itinerary
        refined_itinerary = await ai_service.refine_itinerary(
            original_itinerary['itinerary'],
            feedback
        )

        # Save refined version
        refined_doc = {
            'original_itinerary_id': itinerary_id,
            'destination': original_itinerary['destination'],
            'days': original_itinerary['days'],
            'feedback': feedback,
            'itinerary': refined_itinerary,
            'refined_at': datetime.now(),
            'user_id': getattr(request, 'user_id', None)
        }

        result = settings.MONGO_DB.refined_itineraries.insert_one(refined_doc)
        refined_doc['_id'] = str(result.inserted_id)

        return {
            "success": True,
            "refined_itinerary": refined_itinerary,
            "refined_itinerary_id": str(result.inserted_id)
        }

    except Exception as e:
        logger.error(f"Itinerary refinement failed: {str(e)}")
        return JsonResponse(
            {"error": f"Failed to refine itinerary: {str(e)}"}, 
            status=500
        )

@tour_router.post("/itinerary/{itinerary_id}/alternative/")
async def generate_alternative(request, itinerary_id: str, payload: dict):
    """
    Generate alternative version of an itinerary
    """
    try:
        alternative_type = payload.get('type', 'budget')
        valid_types = ['budget', 'luxury', 'adventure', 'cultural', 'family', 'romantic']
        
        if alternative_type not in valid_types:
            return JsonResponse(
                {"error": f"Invalid alternative type. Must be one of: {valid_types}"}, 
                status=400
            )

        # Get base itinerary
        base_itinerary = settings.MONGO_DB.itineraries.find_one(
            {"_id": ObjectId(itinerary_id)}
        )
        
        if not base_itinerary:
            return JsonResponse(
                {"error": "Base itinerary not found"}, 
                status=404
            )

        # Initialize AI service
        ai_service = AIItineraryService()
        
        # Generate alternative
        alternative_itinerary = await ai_service.generate_alternatives(
            base_itinerary['itinerary'],
            alternative_type
        )

        # Save alternative version
        alternative_doc = {
            'original_itinerary_id': itinerary_id,
            'alternative_type': alternative_type,
            'destination': base_itinerary['destination'],
            'days': base_itinerary['days'],
            'itinerary': alternative_itinerary,
            'generated_at': datetime.now(),
            'user_id': getattr(request, 'user_id', None)
        }

        result = settings.MONGO_DB.alternative_itineraries.insert_one(alternative_doc)
        alternative_doc['_id'] = str(result.inserted_id)

        return {
            "success": True,
            "alternative_itinerary": alternative_itinerary,
            "alternative_itinerary_id": str(result.inserted_id),
            "type": alternative_type
        }

    except Exception as e:
        logger.error(f"Alternative itinerary generation failed: {str(e)}")
        return JsonResponse(
            {"error": f"Failed to generate alternative itinerary: {str(e)}"}, 
            status=500
        )

@tour_router.get("/itinerary/user/{user_id}")
def get_user_itineraries(request, user_id: str):
    """
    Get all itineraries for a specific user
    """
    try:
        itineraries = []
        
        # Get original itineraries
        for itinerary in settings.MONGO_DB.itineraries.find({"user_id": user_id}):
            itinerary['_id'] = str(itinerary['_id'])
            if isinstance(itinerary.get('generated_at'), datetime):
                itinerary['generated_at'] = itinerary['generated_at'].isoformat()
            itineraries.append({
                **itinerary,
                'type': 'original'
            })

        # Get refined itineraries
        for itinerary in settings.MONGO_DB.refined_itineraries.find({"user_id": user_id}):
            itinerary['_id'] = str(itinerary['_id'])
            if isinstance(itinerary.get('refined_at'), datetime):
                itinerary['refined_at'] = itinerary['refined_at'].isoformat()
            itineraries.append({
                **itinerary,
                'type': 'refined'
            })

        # Get alternative itineraries
        for itinerary in settings.MONGO_DB.alternative_itineraries.find({"user_id": user_id}):
            itinerary['_id'] = str(itinerary['_id'])
            if isinstance(itinerary.get('generated_at'), datetime):
                itinerary['generated_at'] = itinerary['generated_at'].isoformat()
            itineraries.append({
                **itinerary,
                'type': 'alternative'
            })

        # Sort by date (most recent first)
        itineraries.sort(key=lambda x: x.get('generated_at') or x.get('refined_at'), reverse=True)

        return {"itineraries": itineraries}

    except Exception as e:
        logger.error(f"Failed to retrieve user itineraries: {str(e)}")
        return JsonResponse(
            {"error": "Failed to retrieve itineraries"}, 
            status=500
        )

@tour_router.get("/test/")
def test_endpoint(request):
    return {"message": "Tour router is working!"}

@tour_router.get("/itinerary/test/")
def test_itinerary(request):
    return {"message": "Itinerary endpoint is accessible"}

