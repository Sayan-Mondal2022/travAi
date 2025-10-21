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
            generation_config={"response_mime_type": "application/json"}
        )
    
    async def generate_itinerary(self, request_data):
        try:
            prompt = self._build_itinerary_prompt(request_data)
            response = await self.model.generate_content_async(prompt)
            return json.loads(response.text)

        except Exception as e:
            logger.error(f"Gemini itinerary generation failed: {str(e)}")
            raise Exception(f"AI service failed: {str(e)}")
    
    def _build_itinerary_prompt(self, request_data):
        """Build a detailed prompt for Gemini"""
        
        destination = request_data.get('destination', 'an amazing place')
        days = request_data.get('duration', 3)
        preferences = request_data.get('preferences', [])
        budget = request_data.get('budget', 'moderate')
        group_size = request_data.get('group_size', 2)
        travel_style = request_data.get('travel_style', 'balanced')
        mode = request_data.get('mode', 'ai')
        custom_places = request_data.get('places', [])

        base_prompt = f"""
        Create a detailed {days}-day travel itinerary for {destination} for {group_size} people.
        
        Travel Style: {travel_style}
        Budget: {budget}
        Preferences: {', '.join(preferences) if preferences else 'General travel'}
        
        Please structure the itinerary with:
        1. Daily schedule with time slots (Morning, Afternoon, Evening)
        2. Specific attractions/activities for each time slot
        3. Travel tips and recommendations
        4. Estimated costs where relevant
        5. Local cuisine suggestions
        6. Transportation options between locations
        
        Format the response as a structured JSON-like format that can be easily parsed.
        """
        
        if mode == "custom" and custom_places:
            base_prompt += f"""
            
            Please incorporate these specific places into the itinerary:
            {', '.join([place.get('name', '') for place in custom_places])}
            
            Ensure these places are properly distributed across the {days} days.
            """
        
        return base_prompt
    
    def _parse_itinerary_response(self, response_text, days):
        """Parse Gemini response into structured itinerary format"""
        try:
            itinerary = {"summary": "Generated Itinerary", "days": []}
            lines = response_text.splitlines()
            current_day = None
            
            for line in lines:
                line = line.strip()
                if line.lower().startswith('day') or line.lower().startswith('day'):
                    if current_day:
                        itinerary["days"].append(current_day)
                    current_day = {
                        "day": len(itinerary["days"]) + 1,
                        "activities": [],
                        "description": line
                    }
                elif line and current_day:
                    current_day["activities"].append({
                        "description": line,
                        "time": "To be determined"
                    })
            
            if current_day and len(itinerary["days"]) < days:
                itinerary["days"].append(current_day)
            
            # Fill in any missing days
            while len(itinerary["days"]) < days:
                itinerary["days"].append({
                    "day": len(itinerary["days"]) + 1,
                    "activities": [{"description": "Free time / Flexible activities", "time": "All day"}],
                    "description": f"Day {len(itinerary['days']) + 1} - Flexible planning"
                })
            
            return itinerary
            
        except Exception as e:
            logger.error(f"Failed to parse Gemini response: {str(e)}")
            # Return a fallback itinerary structure
            return self._create_fallback_itinerary(days)
    
    def _create_fallback_itinerary(self, days):
        """Create a basic fallback itinerary when parsing fails"""
        itinerary = {
            "summary": f"{days}-day basic itinerary",
            "days": []
        }
        
        for day in range(1, days + 1):
            itinerary["days"].append({
                "day": day,
                "description": f"Day {day} - Exploration",
                "activities": [
                    {"time": "Morning", "description": "Breakfast and morning activities"},
                    {"time": "Afternoon", "description": "Lunch and afternoon exploration"},
                    {"time": "Evening", "description": "Dinner and evening activities"}
                ]
            })
        
        return itinerary
    
    async def refine_itinerary(self, original_itinerary, feedback):
        """Refine existing itinerary based on user feedback using Gemini"""
        try:
            prompt = f"""
            Please refine the following travel itinerary based on this feedback: "{feedback}"
            
            Original Itinerary:
            {original_itinerary}
            
            Please provide an improved version that addresses the feedback while maintaining
            the overall structure and key activities. Keep the same number of days and
            maintain a practical, realistic schedule.
            """
            
            response = self.model.generate_content(prompt)
            refined_itinerary = self._parse_itinerary_response(response.text, len(original_itinerary.get('days', [])))
            
            return refined_itinerary
            
        except Exception as e:
            logger.error(f"Gemini itinerary refinement failed: {str(e)}")
            raise Exception(f"Failed to refine itinerary: {str(e)}")
    
    async def generate_alternatives(self, base_itinerary, alternative_type):
        """Generate alternative itinerary versions using Gemini"""
        try:
            type_descriptions = {
                'budget': 'cost-effective and affordable options',
                'luxury': 'premium and luxury experiences',
                'adventure': 'adventure and outdoor activities',
                'cultural': 'cultural and historical experiences',
                'family': 'family-friendly activities',
                'romantic': 'romantic and couple-focused experiences'
            }
            
            description = type_descriptions.get(alternative_type, 'alternative experiences')
            
            prompt = f"""
            Create a {alternative_type}-focused alternative version of this itinerary.
            
            Original Itinerary:
            {base_itinerary}
            
            Focus on: {description}
            Maintain the same destination and number of days, but adjust activities and
            recommendations to better suit this travel style.
            """
            
            response = self.model.generate_content(prompt)
            alternative_itinerary = self._parse_itinerary_response(response.text, len(base_itinerary.get('days', [])))
            
            return alternative_itinerary
            
        except Exception as e:
            logger.error(f"Gemini alternative itinerary generation failed: {str(e)}")
            raise Exception(f"Failed to generate alternative itinerary: {str(e)}")


class DataEnrichmentService:
    """Enhanced data enrichment service"""
    
    async def enrich_itinerary(self, itinerary, destination):
        """Add additional information to itinerary"""
        try:
            # Add destination information
            if 'days' in itinerary:
                for day in itinerary['days']:
                    if 'activities' in day:
                        for activity in day['activities']:
                            # Add basic enrichment - you can expand this
                            if 'description' in activity:
                                activity['enriched'] = True
                                activity['destination'] = destination
            
            # Add general metadata
            itinerary['enriched_at'] = datetime.now().isoformat()
            itinerary['data_source'] = 'Gemini AI + Google Places'
            
            return itinerary
            
        except Exception as e:
            logger.error(f"Itinerary enrichment failed: {str(e)}")
            return itinerary  # Return original if enrichment fails


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
        # gemini_service = GeminiItineraryService()
        # data_enrichment = DataEnrichmentService()

        logger.info(f"Generating itinerary for {destination}, {days} days, mode: {mode}")

        # --- Generate itinerary using Gemini ---
        # base_itinerary = await gemini_service.generate_itinerary(request_data)
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
        # print("Itinerary:", enriched_itinerary)
       
        enriched_itinerary = {
                            "itinerary": [
                                {
                                "day": "0 (Full Day in Manali)",
                                "theme": "Exploring Manali's Culture and Nature",
                                "budget_estimate_for_2_people_day": {
                                    "food": "INR 1500-2500",
                                    "transportation": "INR 500-1000",
                                    "activities_entry_fees": "INR 100-300",
                                    "miscellaneous_shopping": "INR 500-1000",
                                    "total_range": "INR 2600-4800"
                                },
                                "schedule": [
                                    {
                                    "time_slot": "Morning (8:00 AM - 1:00 PM)",
                                    "activities": [
                                        {
                                        "name": "Breakfast at a local cafe",
                                        "description": "Start your day with a hearty breakfast. Options include pancakes, Israeli breakfast, or traditional Indian breakfast.",
                                        "cuisine_suggestion": "Pancakes, Aloo Paratha, Omelette with coffee/tea. Try 'German Bakery' or 'Cafe 1947' in Old Manali.",
                                        "estimated_cost_for_2": "INR 300-600",
                                        "travel_tips": "Many cafes in Old Manali offer great breakfast options with scenic views. Wake up early to enjoy the peaceful morning before the crowds."
                                        },
                                        {
                                        "name": "Hadimba Devi Temple",
                                        "description": "Visit the unique 16th-century wooden temple dedicated to Hadimba Devi, built in a pagoda style amidst a cedar forest (Dhungri Van Vihar).",
                                        "estimated_cost_for_2": "Free (small fee for photography if applicable, approx. INR 50)",
                                        "transportation": "Auto-rickshaw from town/Old Manali (approx. INR 100-200), or a pleasant 20-30 minute walk from the Mall Road.",
                                        "travel_tips": "Allocate 1-1.5 hours. Enjoy the peaceful surroundings. Consider a yak photo opportunity if interested (negotiate price). Be respectful of local customs inside the temple."
                                        },
                                        {
                                        "name": "Manu Temple & Old Manali Exploration",
                                        "description": "Hike up to the ancient Manu Temple, dedicated to Sage Manu. Afterward, explore the charming lanes of Old Manali, known for its bohemian vibe, cafes, and handicrafts.",
                                        "estimated_cost_for_2": "Free (shopping extra)",
                                        "transportation": "Walk from Hadimba Temple area (approx. 15-20 min uphill) or a short auto-rickshaw ride. Old Manali itself is best explored on foot.",
                                        "travel_tips": "Wear comfortable shoes. Browse the unique shops for souvenirs like dreamcatchers, woolen clothes, and local jewelry. Many cafes here offer good ambiance and views."
                                        }
                                    ]
                                    },
                                    {
                                    "time_slot": "Afternoon (1:00 PM - 6:00 PM)",
                                    "activities": [
                                        {
                                        "name": "Lunch in Old Manali",
                                        "description": "Enjoy lunch at one of Old Manali's popular cafes offering international and local cuisine.",
                                        "cuisine_suggestion": "Fresh Trout Fish, Thukpa (noodle soup), Momos, Israeli food (like Shakshuka), or Italian pasta/pizza.",
                                        "estimated_cost_for_2": "INR 600-1000",
                                        "travel_tips": "Look for cafes with riverside seating or mountain views for a relaxed experience. Ask for locally sourced ingredients."
                                        },
                                        {
                                        "name": "Vashisht Village & Hot Water Springs",
                                        "description": "Visit Vashisht village, famous for its ancient temples dedicated to Sage Vashisht and Lord Rama, and its natural hot sulphur springs, believed to have medicinal properties.",
                                        "estimated_cost_for_2": "Free (donation for temple, small fee for public baths if applicable)",
                                        "transportation": "Auto-rickshaw from Old Manali/Mall Road (approx. INR 150-250).",
                                        "travel_tips": "Bring a change of clothes if you plan to take a dip in the hot springs (separate sections for men and women). Be aware of the strong sulphur smell. Explore the narrow lanes of the village."
                                        },
                                        {
                                        "name": "Mall Road Exploration & Shopping",
                                        "description": "Head to Manali's bustling Mall Road for some leisurely walking, souvenir shopping, and soaking in the local atmosphere.",
                                        "estimated_cost_for_2": "Free (shopping extra, budget INR 500-1000 for souvenirs)",
                                        "transportation": "Auto-rickshaw/walk from Vashisht, or walk if your accommodation is nearby the Mall Road.",
                                        "travel_tips": "Good place to buy Kullu shawls, caps, local handicrafts, dry fruits, and Himachali traditional clothing. Be prepared for crowds, especially in peak season. Bargaining is common at small shops."
                                        }
                                    ]
                                    },
                                    {
                                    "time_slot": "Evening (6:00 PM onwards)",
                                    "activities": [
                                        {
                                        "name": "Dinner",
                                        "description": "Savor a delicious dinner at a restaurant on Mall Road or a popular eatery.",
                                        "cuisine_suggestion": "Himachali Dham (traditional feast, usually requires pre-order or is served at specific events), Siddu with local curry (Channa Madra), authentic North Indian dishes.",
                                        "estimated_cost_for_2": "INR 600-900",
                                        "travel_tips": "Try local Himachali cuisine for an authentic experience. Look for places popular with locals for the best flavors. Many restaurants offer diverse menus to cater to all tastes."
                                        },
                                        {
                                        "name": "Leisure Time / Cafe Hopping",
                                        "description": "Enjoy a relaxed evening at a cafe, perhaps listening to live music (if available), or simply stargazing if away from the main town lights.",
                                        "estimated_cost_for_2": "INR 200-500 (for drinks/desserts)",
                                        "travel_tips": "Manali has a vibrant cafe culture. Some cafes offer live music, bonfires, or cozy settings perfect for unwinding after a day of exploration. 'Johnson's Cafe' is a popular choice for ambiance."
                                        }
                                    ]
                                    }
                                ],
                                "overall_travel_tips": [
                                    "**Best Time to Visit:** March to June (pleasant) and September to November (post-monsoon, clear skies) offer the best weather for general travel.",
                                    "**Connectivity:** Manali is well-connected by road. The nearest airport is Bhuntar (Kullu), about 50 km away. Regular Volvo buses operate from Delhi and Chandigarh.",
                                    "**Clothing:** Pack layers, even in summer, as evenings can get cool. Warm clothes are essential for winter months (Oct-March).",
                                    "**Altitude Sickness:** Manali is at a moderate altitude (approx. 2,050 meters or 6,726 feet). Stay hydrated, avoid strenuous activities immediately after arrival, and listen to your body.",
                                    "**Local Etiquette:** Respect local customs and traditions, especially when visiting temples. Dress modestly (shoulders and knees covered).",
                                    "**Bargaining:** It's common to bargain at local markets, but always do so respectfully and with a smile.",
                                    "**Stay Hydrated:** Drink plenty of water throughout the day, especially if you plan to walk a lot or engage in physical activities.",
                                    "**Connectivity:** Mobile networks (Jio, Airtel, Vodafone Idea) work well in Manali town, but might be patchy in more remote areas or while trekking.",
                                    "**Cash vs. Card:** While major establishments accept cards, it's always good to carry sufficient cash for smaller shops, auto-rickshaws, and local eateries."
                                ]
                                }
                            ],
                            "enriched_at": "2025-10-21T19:02:20.018109",
                            "data_source": "Gemini AI + Google Places"
                            }

        return JsonResponse({
            "success": True,
            "itinerary": enriched_itinerary,
            "itinerary_id": str(result.inserted_id),
        })

    except Exception as e:
        logger.error(f"Itinerary generation failed: {str(e)}")
        return {"success": False, "error": f"Failed to generate itinerary: {str(e)}"}
    