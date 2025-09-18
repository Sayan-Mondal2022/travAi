import json
import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class ResponseParser:
    """Parser for AI responses and data validation"""
    
    def __init__(self):
        self.required_fields = {
            'trip_overview': ['title', 'destination', 'duration'],
            'daily_schedule': ['day', 'activities'],
            'budget_breakdown': ['accommodation', 'food', 'activities', 'transportation']
        }
    
    def parse_itinerary_response(self, ai_response: str) -> Dict[str, Any]:
        """
        Parse and validate AI-generated itinerary response
        
        Args:
            ai_response: Raw AI response string
            
        Returns:
            Parsed and validated itinerary dictionary
        """
        try:
            # Extract JSON from response if wrapped in markdown or other text
            cleaned_response = self._extract_json(ai_response)
            
            # Parse JSON
            itinerary = json.loads(cleaned_response)
            
            # Validate structure
            validated_itinerary = self._validate_itinerary_structure(itinerary)
            
            # Clean and format data
            formatted_itinerary = self._format_itinerary_data(validated_itinerary)
            
            # Add metadata
            formatted_itinerary['metadata'] = {
                'generated_at': datetime.now().isoformat(),
                'version': '1.0',
                'confidence_score': self._calculate_confidence_score(formatted_itinerary)
            }
            
            logger.info("Successfully parsed and validated itinerary response")
            return formatted_itinerary
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing failed: {str(e)}")
            # Try to recover with regex
            return self._fallback_parse(ai_response)
            
        except Exception as e:
            logger.error(f"Response parsing failed: {str(e)}")
            raise ValueError(f"Failed to parse AI response: {str(e)}")
    
    def _extract_json(self, response: str) -> str:
        """Extract JSON content from response"""
        # Remove markdown code blocks
        response = re.sub(r'```json\s*', '', response)
        response = re.sub(r'```\s*, '', response)
        
        # Find JSON content between braces
        json_match = re.search(r'\{.*\}', response, re.DOTALL)
        if json_match:
            return json_match.group()
        
        return response.strip()
    
    def _validate_itinerary_structure(self, itinerary: Dict[str, Any]) -> Dict[str, Any]:
        """Validate itinerary has required structure"""
        validated = itinerary.copy()
        
        # Ensure required top-level fields exist
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
                'accommodation': {'total': 0},
                'food': {'total': 0},
                'activities': {'total': 0},
                'transportation': {'total': 0}
            }
        
        # Validate daily schedule
        for day_idx, day in enumerate(validated['daily_schedule']):
            if 'day' not in day:
                day['day'] = day_idx + 1
            
            if 'activities' not in day:
                day['activities'] = []
            
            # Validate activities
            for activity in day['activities']:
                self._validate_activity(activity)
        
        return validated
    
    def _validate_activity(self, activity: Dict[str, Any]) -> None:
        """Validate individual activity structure"""
        required_activity_fields = ['title', 'type', 'time']
        
        for field in required_activity_fields:
            if field not in activity:
                if field == 'title':
                    activity['title'] = 'Activity'
                elif field == 'type':
                    activity['type'] = 'sightseeing'
                elif field == 'time':
                    activity['time'] = '09:00'
        
        # Validate time format
        if 'time' in activity:
            activity['time'] = self._validate_time_format(activity['time'])
        
        # Ensure numeric fields are numbers
        numeric_fields = ['estimated_cost', 'duration_minutes']
        for field in numeric_fields:
            if field in activity and not isinstance(activity[field], (int, float)):
                try:
                    activity[field] = float(activity[field])
                except (ValueError, TypeError):
                    activity[field] = 0
    
    def _validate_time_format(self, time_str: str) -> str:
        """Validate and format time string"""
        try:
            # Handle various time formats
            time_patterns = [
                r'^(\d{1,2}):(\d{2}),  # HH:MM or H:MM
                r'^(\d{1,2}):(\d{2})\s*(AM|PM),  # 12-hour format
                r'^(\d{1,2})\s*(AM|PM)  # Hour only with AM/PM
            ]
            
            for pattern in time_patterns:
                match = re.match(pattern, time_str.upper().strip())
                if match:
                    hour = int(match.group(1))
                    minute = int(match.group(2)) if len(match.groups()) > 1 else 0
                    
                    # Convert to 24-hour format
                    if len(match.groups()) >= 3 and match.group(3):  # AM/PM format
                        ampm = match.group(3)
                        if ampm == 'PM' and hour != 12:
                            hour += 12
                        elif ampm == 'AM' and hour == 12:
                            hour = 0
                    
                    return f"{hour:02d}:{minute:02d}"
            
            # If no pattern matches, return as-is or default
            return time_str if ':' in time_str else '09:00'
            
        except:
            return '09:00'
    
    def _format_itinerary_data(self, itinerary: Dict[str, Any]) -> Dict[str, Any]:
        """Format and clean itinerary data"""
        formatted = itinerary.copy()
        
        # Format budget breakdown
        if 'budget_breakdown' in formatted:
            formatted['budget_breakdown'] = self._format_budget_breakdown(
                formatted['budget_breakdown']
            )
        
        # Sort daily schedule
        if 'daily_schedule' in formatted:
            formatted['daily_schedule'].sort(key=lambda x: x.get('day', 0))
            
            # Sort activities by time
            for day in formatted['daily_schedule']:
                if 'activities' in day:
                    day['activities'].sort(key=lambda x: x.get('time', '00:00'))
        
        # Add calculated fields
        formatted = self._add_calculated_fields(formatted)
        
        return formatted
    
    def _format_budget_breakdown(self, budget: Dict[str, Any]) -> Dict[str, Any]:
        """Format budget breakdown with consistent structure"""
        formatted_budget = {}
        
        categories = ['accommodation', 'food', 'activities', 'transportation', 'miscellaneous']
        
        for category in categories:
            if category in budget:
                if isinstance(budget[category], dict):
                    formatted_budget[category] = budget[category]
                else:
                    formatted_budget[category] = {'total': float(budget[category])}
            else:
                formatted_budget[category] = {'total': 0.0}
        
        # Calculate grand total
        grand_total = sum(
            cat.get('total', 0) for cat in formatted_budget.values()
        )
        formatted_budget['grand_total'] = grand_total
        
        return formatted_budget
    
    def _add_calculated_fields(self, itinerary: Dict[str, Any]) -> Dict[str, Any]:
        """Add calculated fields to itinerary"""
        if 'daily_schedule' not in itinerary:
            return itinerary
        
        total_activities = 0
        total_estimated_cost = 0
        activity_types = set()
        
        for day in itinerary['daily_schedule']:
            day_cost = 0
            day_activities = len(day.get('activities', []))
            total_activities += day_activities
            
            for activity in day.get('activities', []):
                # Add to totals
                cost = activity.get('estimated_cost', 0)
                if isinstance(cost, (int, float)):
                    day_cost += cost
                    total_estimated_cost += cost
                
                # Track activity types
                activity_type = activity.get('type', 'unknown')
                activity_types.add(activity_type)
            
            # Add day summary
            day['summary'] = {
                'total_activities': day_activities,
                'estimated_cost': day_cost,
                'activity_types': list(set(act.get('type', 'unknown') for act in day.get('activities', [])))
            }
        
        # Add trip summary
        if 'trip_overview' not in itinerary:
            itinerary['trip_overview'] = {}
        
        itinerary['trip_overview']['statistics'] = {
            'total_activities': total_activities,
            'total_estimated_cost': total_estimated_cost,
            'unique_activity_types': len(activity_types),
            'activity_types': list(activity_types)
        }
        
        return itinerary
    
    def _calculate_confidence_score(self, itinerary: Dict[str, Any]) -> float:
        """Calculate confidence score for itinerary quality"""
        score = 0.0
        max_score = 100.0
        
        # Check completeness (40 points)
        required_sections = ['trip_overview', 'daily_schedule', 'budget_breakdown']
        for section in required_sections:
            if section in itinerary and itinerary[section]:
                score += 13.33
        
        # Check daily schedule quality (30 points)
        if 'daily_schedule' in itinerary:
            days = itinerary['daily_schedule']
            if days:
                avg_activities_per_day = sum(len(day.get('activities', [])) for day in days) / len(days)
                if avg_activities_per_day >= 3:
                    score += 15
                elif avg_activities_per_day >= 2:
                    score += 10
                elif avg_activities_per_day >= 1:
                    score += 5
                
                # Check time formatting
                time_formatted_correctly = 0
                total_activities = 0
                for day in days:
                    for activity in day.get('activities', []):
                        total_activities += 1
                        time_str = activity.get('time', '')
                        if re.match(r'^\d{2}:\d{2}, time_str):
                            time_formatted_correctly += 1
                
                if total_activities > 0:
                    time_score = (time_formatted_correctly / total_activities) * 15
                    score += time_score
        
        # Check budget breakdown (20 points)
        if 'budget_breakdown' in itinerary:
            budget = itinerary['budget_breakdown']
            if isinstance(budget, dict) and len(budget) >= 4:
                score += 20
        
        # Check additional details (10 points)
        bonus_sections = ['travel_tips', 'packing_suggestions', 'emergency_info']
        for section in bonus_sections:
            if section in itinerary and itinerary[section]:
                score += 3.33
        
        return min(score, max_score)
    
    def _fallback_parse(self, response: str) -> Dict[str, Any]:
        """Fallback parser for malformed JSON"""
        logger.warning("Using fallback parser for malformed response")
        
        fallback_itinerary = {
            'trip_overview': {
                'title': 'Generated Trip',
                'destination': 'Unknown',
                'duration': 3
            },
            'daily_schedule': [
                {
                    'day': 1,
                    'activities': [
                        {
                            'time': '09:00',
                            'title': 'Arrival and Check-in',
                            'type': 'accommodation',
                            'description': 'Check into accommodation and explore nearby area',
                            'estimated_cost': 0
                        }
                    ]
                }
            ],
            'budget_breakdown': {
                'accommodation': {'total': 0},
                'food': {'total': 0},
                'activities': {'total': 0},
                'transportation': {'total': 0}
            },
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'version': '1.0',
                'confidence_score': 10.0,
                'fallback_used': True
            }
        }
        
        return fallback_itinerary

