import os
import logging
import google.generativeai as genai
from dotenv import load_dotenv
import json

load_dotenv()
logger = logging.getLogger(__name__)

GOOGLE_GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

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
        """Build a detailed prompt for Gemini using places + weather."""
        destination = request_data.get("destination", "an amazing place")
        days = request_data.get("duration_days", 3)
        preferences = request_data.get("preferences", [])
        budget = request_data.get("budget", "moderate")
        group_size = request_data.get("group_size", 1)
        travel_style = request_data.get("travel_style", "balanced")
        mode = request_data.get("mode", "ai")

        places_plan = request_data.get("places_plan", [])
        weather_info = request_data.get("weather")

        places_json = json.dumps(places_plan, ensure_ascii=False)
        weather_json = json.dumps(weather_info, ensure_ascii=False)

        base_prompt = f"""
You are a senior travel planner AI. Generate a detailed {days}-day itinerary for {destination} for {group_size} people.

Travel Style: {travel_style}
Budget: {budget}
Preferences: {', '.join(preferences) if preferences else 'General travel'}

You are given:
1. "places_plan": a structured list of attractions, restaurants, and lodging for each day.
2. "weather": forecast details for the destination for the upcoming days.

Use ONLY these places for the main itinerary (do not invent new hotels or key attractions).
You may invent minor filler details (like "walk around the neighborhood") but main POIs, restaurants, lodging must come from places_plan.

### places_plan (INPUT DATA)
{places_json}

### weather (INPUT DATA)
{weather_json}

### HARD RULES

1. DAYS & UNIQUENESS
   - You MUST generate exactly {days} days in "itinerary".
   - For each day:
     - Use EXACTLY the 5 "attractions" given in that day's "attractions" list as the key tourist spots.
     - Each of those 5 attractions must appear exactly once that day in the schedule (morning/afternoon/evening combined).
   - Do not reuse the same attraction more than once within the same day.

2. RESTAURANTS (BREAKS + FOOD SECTION)
   - For each day you are given restaurants in:
       "restaurants": {{
         "breakfast": [...],
         "lunch": [...],
         "dinner": [...]
       }}
   - In the SCHEDULE:
       - Use breakfast/lunch/dinner as clickable breaks, NOT full restaurant names.
       - Represent them as schedule entries with:
         - category = "meal_break"
         - place_name = "Breakfast Break" / "Lunch Break" / "Dinner Break"
         - meal_type = "breakfast" / "lunch" / "dinner"
       - Insert:
         - 1 breakfast break in the morning block,
         - 1 lunch break in the afternoon block,
         - 1 dinner break in the evening block.
   - In the FOOD SECTION (per day):
       - Output a "food_recommendations" object:
         "food_recommendations": {{
            "breakfast": [ <list of 1-3 restaurants> ],
            "lunch": [ ... ],
            "dinner": [ ... ]
         }}
       - Each restaurant object must come from that day's "restaurants" list.
       - For each restaurant object, include:
         - name
         - types
         - rating
         - user_rating_count
         - formatted_address
         - editorial_summary
         - review_summary
         - landmarks (from input)
         - google_maps_url
         - directions_url

3. LODGING (ONLY DAY 1)
   - For DAY 1 only, you are given "lodging_options" (3–5 items).
   - In the schedule you may mention "check-in" / "return to hotel" generically.
   - In the JSON, include:
     "lodging_options": [ ... ]
   - Each lodging option object must contain:
     - name
     - types
     - rating
     - user_rating_count
     - formatted_address
     - editorial_summary
     - review_summary
     - landmarks
     - google_maps_url
     - directions_url

4. LANDMARKS, TYPES & SUMMARIES
   - For EACH main attraction in the schedule (non-meal_break entries):
     - Copy relevant details from places_plan into the schedule items:
       - types
       - landmarks (as a short list)
       - editorial_summary
       - review_summary
       - rating
       - google_maps_url (if available)
   - Do NOT invent random landmarks; re-use from input.

5. WEATHER-BASED CLOTHING & PACKING SUGGESTIONS
   - Use the forecast data to infer:
     - heat / humidity
     - rain chances
     - any extreme conditions
   - At the end of the JSON, include:
     "packing_suggestions": {{
        "summary": "Overall packing overview in 2-4 sentences.",
        "recommended_items": [
            "Light cotton t-shirts",
            "Comfortable walking shoes",
            "Compact umbrella"
        ],
        "clothing": [
            "Example: breathable summer clothes, quick-dry shorts, light rain jacket"
        ],
        "per_day_highlights": [
            {{
                "day": 1,
                "expected_weather": "Warm, humid with chance of showers in the evening",
                "notes": [
                    "Carry a light rain jacket or umbrella in the afternoon.",
                    "Wear breathable clothes and sunscreen."
                ]
            }}
        ]
   }}

6. OUTPUT SCHEMA (STRICT)

Return JSON ONLY in this schema:

{{
  "itinerary": [
    {{
      "day": 1,
      "title": "Short title for the day",
      "theme": "A one-line theme for the day",
      "budget": {{
        "food": "INR 1500-2500",
        "transportation": "INR 500-800",
        "activities": "INR 1000-1500",
        "total": "INR 3000-4500"
      }},
      "schedule": {{
        "morning": [
          {{
            "time_block": "08:00 - 10:00",
            "category": "attraction" | "meal_break" | "other",
            "meal_type": "breakfast" | "lunch" | "dinner" | null,
            "place_name": "Name or 'Breakfast Break' etc.",
            "summary": "What the traveler does here.",
            "types": ["tourist_attraction", "point_of_interest"],
            "landmarks": [
              {{"display_name": "Nearby landmark", "distance_meters": 120}}
            ],
            "editorial_summary": "Short editorial summary if available.",
            "review_summary": "Short user review summary if available.",
            "rating": 4.5,
            "google_maps_url": "https://...",
            "directions_url": "https://..."
          }}
        ],
        "afternoon": [ ... ],
        "evening": [ ... ]
      }},
      "food_recommendations": {{
        "breakfast": [ {{ ...restaurant fields as described above... }} ],
        "lunch": [ ... ],
        "dinner": [ ... ]
      }},
      "lodging_options": [ {{ ...lodging fields as above (only for day 1, [] for others) }} ]
    }}
  ],
  "packing_suggestions": {{
    "summary": "Overall packing summary.",
    "recommended_items": ["...", "..."],
    "clothing": ["...", "..."],
    "per_day_highlights": [
      {{
        "day": 1,
        "expected_weather": "...",
        "notes": ["...", "..."]
      }}
    ]
  }},
  "overall_summary": "Short 2-3 sentence summary of the whole trip."
}}

IMPORTANT:
- Output MUST be valid JSON.
- Do NOT include any text outside this JSON.
"""
        return base_prompt