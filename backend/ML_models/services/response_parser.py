import json
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ResponseParser:
    """
    Parser for AI responses and data validation.
    Optimized for reliable JSON output from models like Google Gemini.
    """
    
    def __init__(self):
        # These fields can be used to validate the content of the parsed JSON
        self.required_fields = {
            'trip_overview': ['title', 'destination', 'duration'],
            'daily_schedule': ['day', 'activities'],
            'budget_breakdown': ['accommodation', 'food', 'activities', 'transportation']
        }
    
    def parse_itinerary_response(self, ai_response_json: str) -> Dict[str, Any]:
        """
        Parse and validate an AI-generated itinerary response, expecting a raw JSON string.
        
        Args:
            ai_response_json: Raw JSON string from the AI model.
            
        Returns:
            Parsed and validated itinerary dictionary.
        """
        try:
            # Since we expect a clean JSON string, we can parse it directly.
            itinerary = json.loads(ai_response_json)
            
            # Validate the structure, filling in any missing essential keys.
            validated_itinerary = self._validate_itinerary_structure(itinerary)
            
            # Clean, format, and add calculated fields to the data.
            formatted_itinerary = self._format_itinerary_data(validated_itinerary)
            
            # Add metadata about the generation process.
            formatted_itinerary['metadata'] = {
                'generated_at': datetime.now().isoformat(),
                'version': '1.1', # Updated version for new parser
                'confidence_score': self._calculate_confidence_score(formatted_itinerary)
            }
            
            logger.info("Successfully parsed and validated itinerary response from JSON.")
            return formatted_itinerary
            
        except json.JSONDecodeError as e:
            # This is now an exceptional case, indicating a problem with the AI model's output
            # despite requesting JSON.
            logger.error(f"JSON parsing failed even with JSON mode enabled: {str(e)}")
            logger.error(f"Malformed response string: {ai_response_json[:500]}") # Log the problematic response
            raise ValueError(f"Failed to parse AI response: Invalid JSON received.")
            
        except Exception as e:
            logger.error(f"An unexpected error occurred during response parsing: {str(e)}")
            raise ValueError(f"Failed to parse AI response: {str(e)}")

    def _validate_itinerary_structure(self, itinerary: Dict[str, Any]) -> Dict[str, Any]:
        """Validate the itinerary has the required structure and provide defaults."""
        validated = itinerary.copy()
        
        # Ensure required top-level fields exist, providing sensible defaults if not.
        if 'trip_overview' not in validated:
            validated['trip_overview'] = {
                'title': 'Generated Trip',
                'destination': 'Unknown',
                'duration': len(validated.get('daily_schedule', []))
            }
        
        if 'daily_schedule' not in validated:
            validated['daily_schedule'] = []
        
        if 'budget_breakdown' not in validated:
            validated['budget_breakdown'] = {
                'accommodation': {'total': 0}, 'food': {'total': 0},
                'activities': {'total': 0}, 'transportation': {'total': 0}
            }
        
        # Validate the structure of each day in the schedule.
        for day_idx, day in enumerate(validated['daily_schedule']):
            if not isinstance(day, dict): continue # Skip malformed day entries
            if 'day' not in day:
                day['day'] = day_idx + 1
            if 'activities' not in day or not isinstance(day['activities'], list):
                day['activities'] = []
            
            # Validate each activity within the day.
            for activity in day['activities']:
                if isinstance(activity, dict):
                    self._validate_activity(activity)
        
        return validated
    
    def _validate_activity(self, activity: Dict[str, Any]) -> None:
        """Validate an individual activity's structure and format its fields."""
        # Ensure required fields exist in each activity.
        if 'title' not in activity: activity['title'] = 'Activity'
        if 'type' not in activity: activity['type'] = 'sightseeing'
        if 'time' not in activity: activity['time'] = '09:00'
        
        # Validate and normalize the time format to HH:MM.
        activity['time'] = self._validate_time_format(str(activity.get('time', '09:00')))
        
        # Ensure numeric fields are correctly typed.
        for field in ['estimated_cost', 'duration_minutes']:
            if field in activity:
                try:
                    activity[field] = float(activity[field])
                except (ValueError, TypeError):
                    activity[field] = 0.0
    
    def _validate_time_format(self, time_str: str) -> str:
        """Validate and format a time string into a consistent HH:MM format."""
        # This function provides robustness in case the AI deviates from the requested time format.
        try:
            # Simple regex for HH:MM format
            match = re.match(r'^\s*(\d{1,2})\s*:\s*(\d{2})\s*', time_str)
            if match:
                hour, minute = int(match.group(1)), int(match.group(2))
                return f"{hour:02d}:{minute:02d}"
            
            # Fallback for other potential formats if needed, otherwise return a default
            return '09:00'
        except:
            return '09:00'
    
    def _format_itinerary_data(self, itinerary: Dict[str, Any]) -> Dict[str, Any]:
        """Format and clean itinerary data, adding calculated fields."""
        formatted = itinerary.copy()
        
        # Ensure budget breakdown has a consistent structure and totals.
        if 'budget_breakdown' in formatted:
            formatted['budget_breakdown'] = self._format_budget_breakdown(formatted['budget_breakdown'])
        
        # Sort the daily schedule and the activities within each day.
        if 'daily_schedule' in formatted:
            formatted['daily_schedule'].sort(key=lambda x: x.get('day', 0))
            for day in formatted['daily_schedule']:
                if day.get('activities'):
                    day['activities'].sort(key=lambda x: x.get('time', '00:00'))
        
        # Add summary statistics to the itinerary.
        return self._add_calculated_fields(formatted)
    
    def _format_budget_breakdown(self, budget: Dict[str, Any]) -> Dict[str, Any]:
        """Format budget breakdown with a consistent structure and grand total."""
        formatted_budget = {}
        categories = ['accommodation', 'food', 'activities', 'transportation', 'miscellaneous']
        
        for category in categories:
            value = budget.get(category, {'total': 0.0})
            if isinstance(value, dict) and 'total' in value:
                formatted_budget[category] = {'total': float(value['total'])}
            elif isinstance(value, (int, float)):
                 formatted_budget[category] = {'total': float(value)}
            else:
                 formatted_budget[category] = {'total': 0.0}

        # Calculate the grand total.
        grand_total = sum(cat.get('total', 0) for cat in formatted_budget.values())
        formatted_budget['grand_total'] = grand_total
        
        return formatted_budget
    
    def _add_calculated_fields(self, itinerary: Dict[str, Any]) -> Dict[str, Any]:
        """Add calculated summary fields to the itinerary at the trip and day levels."""
        total_activities, total_estimated_cost = 0, 0
        activity_types = set()
        
        for day in itinerary.get('daily_schedule', []):
            day_cost = sum(act.get('estimated_cost', 0) for act in day.get('activities', []))
            day_activities = len(day.get('activities', []))
            day_activity_types = {act.get('type', 'unknown') for act in day.get('activities', [])}
            
            day['summary'] = {
                'total_activities': day_activities,
                'estimated_cost': day_cost,
                'activity_types': list(day_activity_types)
            }
            total_activities += day_activities
            total_estimated_cost += day_cost
            activity_types.update(day_activity_types)
            
        itinerary.setdefault('trip_overview', {})['statistics'] = {
            'total_activities': total_activities,
            'total_estimated_cost': total_estimated_cost,
            'unique_activity_types': len(activity_types),
            'activity_types': list(activity_types)
        }
        
        return itinerary
    
    def _calculate_confidence_score(self, itinerary: Dict[str, Any]) -> float:
        """Calculate a confidence score based on the completeness and quality of the itinerary."""
        score, max_score = 0.0, 100.0
        
        # Completeness of required sections
        if itinerary.get('trip_overview'): score += 15
        if itinerary.get('daily_schedule'): score += 15
        if itinerary.get('budget_breakdown', {}).get('grand_total', 0) > 0: score += 15

        # Quality of daily schedule
        days = itinerary.get('daily_schedule', [])
        if days:
            avg_activities = sum(len(d.get('activities', [])) for d in days) / len(days) if days else 0
            score += min(avg_activities * 10, 30) # Up to 30 points for activity density

        # Presence of extra details
        if itinerary.get('travel_tips'): score += 5
        if itinerary.get('packing_suggestions'): score += 5
        if itinerary.get('emergency_info'): score += 5
        
        return round(min(score, max_score), 2)
