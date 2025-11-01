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