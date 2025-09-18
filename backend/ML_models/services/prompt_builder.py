
from typing import Dict, Any, List
from pathlib import Path
from ..config.settings import PROMPTS_DIR
import json

class PromptBuilder:
    """Builder for creating structured prompts for AI"""
    
    def __init__(self):
        self.prompts_dir = PROMPTS_DIR
        self._load_prompt_templates()
    
    def _load_prompt_templates(self):
        """Load prompt templates from files"""
        try:
            # Load base prompts
            with open(self.prompts_dir / 'base_prompt.txt', 'r') as f:
                self.base_prompt = f.read()
            
            with open(self.prompts_dir / 'refinement_prompt.txt', 'r') as f:
                self.refinement_prompt = f.read()
                
        except FileNotFoundError:
            # Fallback to hardcoded prompts
            self._create_default_prompts()
    
    def _create_default_prompts(self):
        """Create default prompt templates"""
        self.base_prompt = """
        You are a professional travel planner AI assistant. Create a detailed, practical itinerary 
        that is culturally aware, budget-conscious, and tailored to user preferences.
        
        IMPORTANT: Always respond with valid JSON format containing structured itinerary data.
        Include realistic time estimates, practical transportation suggestions, and consider 
        factors like opening hours, seasonal availability, and local customs.
        """
        
        self.refinement_prompt = """
        You are refining an existing travel itinerary based on user feedback. 
        Maintain the overall structure and budget while incorporating the requested changes.
        
        IMPORTANT: Return the complete updated itinerary as valid JSON.
        """
    
    def build_itinerary_prompt(self, request_data: Dict[str, Any]) -> str:
        """
        Build comprehensive prompt for itinerary generation
        
        Args:
            request_data: User request data
            
        Returns:
            Complete prompt string
        """
        destination = request_data.get('destination', '')
        duration = request_data.get('duration', 3)
        budget = request_data.get('budget', 1000)
        group_size = request_data.get('group_size', 2)
        interests = request_data.get('interests', [])
        travel_style = request_data.get('travel_style', 'mid_range')
        start_date = request_data.get('start_date', '')
        end_date = request_data.get('end_date', '')
        
        # Build interests string
        interests_str = ', '.join(interests) if interests else 'general tourism'
        
        # Build cultural considerations
        cultural_notes = self._get_cultural_considerations(destination)
        
        # Build seasonal considerations
        seasonal_notes = self._get_seasonal_considerations(destination, start_date)
        
        prompt = f"""
        Generate a detailed {duration}-day itinerary for {destination}.
        
        **Trip Details:**
        - Destination: {destination}
        - Duration: {duration} days
        - Dates: {start_date} to {end_date}
        - Budget: ${budget} USD total
        - Group Size: {group_size} people
        - Travel Style: {travel_style}
        - Interests: {interests_str}
        
        **Requirements:**
        1. Create day-by-day schedule with specific times (use 24-hour format)
        2. Include a mix of must-see attractions and local hidden gems
        3. Suggest specific restaurants for breakfast, lunch, and dinner
        4. Add transportation details between locations
        5. Provide realistic cost estimates for each activity
        6. Include backup indoor activities for bad weather
        7. Consider local events during the travel dates
        8. Respect cultural norms: {cultural_notes}
        9. Seasonal considerations: {seasonal_notes}
        10. Ensure activities match the specified travel style and budget
        
        **Budget Distribution:**
        - Accommodation: 40% (${budget * 0.4:.0f})
        - Food: 30% (${budget * 0.3:.0f})
        - Activities: 20% (${budget * 0.2:.0f})
        - Transportation: 10% (${budget * 0.1:.0f})
        
        **JSON Structure Required:**
        {{
            "trip_overview": {{
                "title": "string",
                "destination": "string",
                "duration": number,
                "total_budget": number,
                "best_time_to_visit": "string",
                "currency": "string",
                "timezone": "string"
            }},
            "daily_schedule": [
                {{
                    "day": number,
                    "date": "YYYY-MM-DD",
                    "theme": "string",
                    "activities": [
                        {{
                            "time": "HH:MM",
                            "title": "string",
                            "type": "string",
                            "duration": "string",
                            "description": "string",
                            "location": "string",
                            "estimated_cost": number,
                            "tips": "string",
                            "booking_required": boolean,
                            "alternatives": ["string"]
                        }}
                    ],
                    "meals": {{
                        "breakfast": {{"name": "string", "location": "string", "cost": number}},
                        "lunch": {{"name": "string", "location": "string", "cost": number}},
                        "dinner": {{"name": "string", "location": "string", "cost": number}}
                    }},
                    "transportation": {{
                        "method": "string",
                        "cost": number,
                        "notes": "string"
                    }},
                    "accommodation": {{
                        "name": "string",
                        "type": "string",
                        "cost_per_night": number,
                        "location": "string"
                    }}
                }}
            ],
            "budget_breakdown": {{
                "accommodation": {{"total": number, "per_night": number}},
                "food": {{"total": number, "per_day": number}},
                "activities": {{"total": number, "per_day": number}},
                "transportation": {{"total": number, "breakdown": {{}}}},
                "miscellaneous": {{"total": number}}
            }},
            "travel_tips": [
                {{"category": "string", "tip": "string"}}
            ],
            "packing_suggestions": {{
                "essentials": ["string"],
                "weather_specific": ["string"],
                "cultural_considerations": ["string"]
            }},
            "emergency_info": {{
                "emergency_numbers": {{}},
                "hospitals": ["string"],
                "embassies": ["string"]
            }}
        }}
        
        Generate a comprehensive, practical itinerary that maximizes the travel experience within the given constraints.
        """
        
        return prompt.strip()
    
    def build_refinement_prompt(self, 
                               original_itinerary: Dict[str, Any], 
                               feedback: str) -> str:
        """
        Build prompt for refining existing itinerary
        
        Args:
            original_itinerary: Original itinerary data
            feedback: User feedback
            
        Returns:
            Refinement prompt
        """
        prompt = f"""
        **Original Itinerary:**
        {json.dumps(original_itinerary, indent=2)}
        
        **User Feedback:**
        {feedback}
        
        **Instructions:**
        Please modify the itinerary based on the user's feedback while maintaining:
        1. The overall budget constraints
        2. The destination and duration
        3. Logical flow and timing
        4. Cultural and practical considerations
        
        **Changes to implement:**
        - Address all points mentioned in the feedback
        - Maintain or improve the overall experience
        - Keep the same JSON structure
        - Update relevant sections only
        - Recalculate costs if activities change
        
        Return the complete updated itinerary as valid JSON with the same structure as the original.
        """
        
        return prompt.strip()
    
    def build_alternative_prompt(self, 
                                base_itinerary: Dict[str, Any], 
                                alternative_type: str) -> str:
        """
        Build prompt for generating alternative itinerary versions
        
        Args:
            base_itinerary: Base itinerary
            alternative_type: Type of alternative (budget, luxury, adventure, etc.)
            
        Returns:
            Alternative generation prompt
        """
        type_instructions = {
            'budget': 'Focus on free activities, local food, budget accommodation, and public transport',
            'luxury': 'Include high-end restaurants, luxury hotels, private tours, and premium experiences',
            'adventure': 'Emphasize outdoor activities, extreme sports, hiking, and thrilling experiences',
            'cultural': 'Focus on museums, historical sites, local traditions, and authentic cultural experiences',
            'family': 'Include family-friendly activities, kid-safe venues, and educational experiences',
            'romantic': 'Emphasize couples activities, romantic dining, and intimate experiences'
        }
        
        instruction = type_instructions.get(alternative_type, 'Create a different perspective on the trip')
        
        prompt = f"""
        **Base Itinerary:**
        {json.dumps(base_itinerary, indent=2)}
        
        **Alternative Type:** {alternative_type.title()}
        
        **Instructions:**
        Create an alternative version of this itinerary with the following focus:
        {instruction}
        
        **Requirements:**
        1. Maintain the same destination and duration
        2. Keep the same date structure
        3. Adjust budget and activities according to the alternative type
        4. Provide realistic alternatives for each day
        5. Update budget breakdown to reflect new activity costs
        6. Maintain logical flow and timing
        
        Return a complete alternative itinerary with the same JSON structure.
        """
        
        return prompt.strip()
    
    def get_system_prompt(self) -> str:
        """Get system prompt for general itinerary generation"""
        return """You are a professional travel planner AI with extensive knowledge of destinations worldwide. 
        You create detailed, practical, and culturally-aware travel itineraries that maximize traveler satisfaction 
        while respecting budget constraints and local customs.
        
        Key principles:
        - Always provide realistic and achievable itineraries
        - Consider opening hours, travel times, and seasonal factors
        - Include diverse experiences from must-see attractions to local gems
        - Provide practical tips and alternatives
        - Respect cultural norms and local etiquette
        - Always respond with valid, well-structured JSON
        
        Your itineraries should feel authentic, well-researched, and personally tailored to each traveler's preferences."""
    
    def get_refinement_system_prompt(self) -> str:
        """Get system prompt for itinerary refinement"""
        return """You are a travel planning expert focused on refining and improving existing itineraries 
        based on user feedback. You excel at making targeted improvements while maintaining the overall 
        coherence and practicality of the travel plan.
        
        When refining itineraries:
        - Listen carefully to user feedback and implement requested changes
        - Maintain budget constraints unless specifically asked to modify them
        - Preserve the logical flow and timing of activities
        - Update related sections when making changes (e.g., if changing activities, update costs)
        - Always return complete, valid JSON responses"""
    
    def _get_cultural_considerations(self, destination: str) -> str:
        """Get cultural considerations for destination"""
        cultural_db = {
            'japan': 'Remove shoes indoors, bow as greeting, quiet on public transport, no tipping',
            'india': 'Dress modestly, remove shoes in temples, use right hand for eating, bargaining expected',
            'UAE': 'Modest dress required, no public alcohol consumption, respect for Islamic customs',
            'france': 'Formal greetings, dining etiquette important, shops close for lunch',
            'thailand': 'Buddhist temple etiquette, modest dress, no touching heads, wai greeting',
            'china': 'Business card etiquette, no tipping, respect for hierarchy, face-saving important'
        }
        
        dest_lower = destination.lower()
        for country, considerations in cultural_db.items():
            if country in dest_lower:
                return considerations
        
        return 'Research local customs and dress codes before visiting'
    
    def _get_seasonal_considerations(self, destination: str, start_date: str) -> str:
        """Get seasonal considerations for destination and dates"""
        if not start_date:
            return 'Check seasonal weather and events for optimal planning'
        
        try:
            from datetime import datetime
            date_obj = datetime.strptime(start_date, '%Y-%m-%d')
            month = date_obj.month
            
            seasonal_notes = {
                'summer': 'Hot weather - plan indoor activities during peak hours, bring sun protection',
                'winter': 'Cold weather - include indoor alternatives, check for seasonal closures',
                'spring': 'Pleasant weather - good for outdoor activities, possible rain showers',
                'fall': 'Mild weather - ideal for sightseeing, check for seasonal events'
            }
            
            if month in [6, 7, 8]:  # Summer
                return seasonal_notes['summer']
            elif month in [12, 1, 2]:  # Winter
                return seasonal_notes['winter']
            elif month in [3, 4, 5]:  # Spring
                return seasonal_notes['spring']
            else:  # Fall
                return seasonal_notes['fall']
                
        except:
            return 'Consider seasonal weather patterns and local events'