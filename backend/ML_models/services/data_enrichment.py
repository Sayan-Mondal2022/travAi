import googlemaps
import requests
import asyncio
from typing import Dict, List, Any, Optional
from ..config.api_keys import APIKeyManager
from ..config.settings import EXTERNAL_APIS
import logging

logger = logging.getLogger(__name__)

class DataEnrichmentService:
    """Service for enriching itinerary data with real-time information"""
    
    def __init__(self):
        self.api_keys = APIKeyManager()
        
        # Initialize Google Maps client
        if self.api_keys.is_service_available('google_maps'):
            self.gmaps = googlemaps.Client(
                key=self.api_keys.get_key('google_maps')
            )
        else:
            self.gmaps = None
            logger.warning("Google Maps API not available")
    
    async def enrich_itinerary(self, 
                             itinerary: Dict[str, Any], 
                             destination: str) -> Dict[str, Any]:
        """
        Enrich itinerary with real-time data
        
        Args:
            itinerary: Base itinerary data
            destination: Destination name
            
        Returns:
            Enriched itinerary with additional data
        """
        enriched = itinerary.copy()
        
        try:
            # Get destination coordinates
            dest_coords = await self._get_destination_coordinates(destination)
            enriched['destination_coordinates'] = dest_coords
            
            # Enrich activities
            if 'daily_schedule' in enriched:
                for day_idx, day in enumerate(enriched['daily_schedule']):
                    if 'activities' in day:
                        enriched_activities = []
                        for activity in day['activities']:
                            enriched_activity = await self._enrich_activity(
                                activity, destination
                            )
                            enriched_activities.append(enriched_activity)
                        day['activities'] = enriched_activities
            
            # Add weather forecast
            if dest_coords['lat'] != 0 and dest_coords['lng'] != 0:
                weather = await self._get_weather_forecast(
                    dest_coords, 
                    len(enriched.get('daily_schedule', []))
                )
                enriched['weather_forecast'] = weather
            
            # Add local events
            local_events = await self._get_local_events(destination)
            enriched['local_events'] = local_events
            
            # Calculate travel times
            enriched = await self._add_travel_times(enriched)
            
            logger.info("Successfully enriched itinerary data")
            return enriched
            
        except Exception as e:
            logger.error(f"Data enrichment failed: {str(e)}")
            return itinerary  # Return original if enrichment fails
    
    async def _get_destination_coordinates(self, destination: str) -> Dict[str, float]:
        """Get latitude and longitude for destination"""
        if not self.gmaps:
            return {'lat': 0, 'lng': 0}
        
        try:
            geocode_result = self.gmaps.geocode(destination)
            if geocode_result:
                location = geocode_result[0]['geometry']['location']
                return {
                    'lat': location['lat'], 
                    'lng': location['lng'],
                    'formatted_address': geocode_result[0]['formatted_address']
                }
        except Exception as e:
            logger.error(f"Geocoding failed: {str(e)}")
        
        return {'lat': 0, 'lng': 0}
    
    async def _enrich_activity(self, 
                              activity: Dict[str, Any], 
                              destination: str) -> Dict[str, Any]:
        """Enrich a single activity with place details"""
        if not self.gmaps:
            return activity
        
        enriched_activity = activity.copy()
        
        try:
            # Search for the place
            search_query = f"{activity.get('title', '')} {destination}"
            places_result = self.gmaps.places(query=search_query)
            
            if places_result['results']:
                place = places_result['results'][0]
                place_id = place['place_id']
                
                # Get detailed information
                details = self.gmaps.place(
                    place_id=place_id,
                    fields=[
                        'place_id', 'name', 'rating', 'user_ratings_total',
                        'formatted_address', 'formatted_phone_number', 
                        'website', 'opening_hours', 'geometry', 'price_level',
                        'photos', 'reviews'
                    ]
                )['result']
                
                # Add enriched data
                enriched_activity.update({
                    'place_id': details.get('place_id'),
                    'rating': details.get('rating'),
                    'reviews_count': details.get('user_ratings_total'),
                    'address': details.get('formatted_address'),
                    'phone': details.get('formatted_phone_number'),
                    'website': details.get('website'),
                    'price_level': details.get('price_level'),
                    'coordinates': {
                        'lat': details.get('geometry', {}).get('location', {}).get('lat'),
                        'lng': details.get('geometry', {}).get('location', {}).get('lng')
                    }
                })
                
                # Add opening hours
                if 'opening_hours' in details:
                    enriched_activity['opening_hours'] = details['opening_hours'].get('weekday_text', [])
                
                # Add photos
                if 'photos' in details:
                    photo_refs = [photo['photo_reference'] for photo in details['photos'][:3]]
                    enriched_activity['photo_references'] = photo_refs
                
                # Add sample reviews
                if 'reviews' in details:
                    reviews = details['reviews'][:2]  # Get top 2 reviews
                    enriched_activity['sample_reviews'] = [
                        {
                            'text': review.get('text', ''),
                            'rating': review.get('rating'),
                            'author': review.get('author_name', '')
                        } for review in reviews
                    ]
        
        except Exception as e:
            logger.error(f"Activity enrichment failed for {activity.get('title', 'Unknown')}: {str(e)}")
        
        return enriched_activity
    
    async def _get_weather_forecast(self, 
                                  coordinates: Dict[str, float], 
                                  days: int) -> List[Dict[str, Any]]:
        """Get weather forecast for destination"""
        if not self.api_keys.is_service_available('weather'):
            return []
        
        try:
            url = f"{EXTERNAL_APIS['weather']['base_url']}/forecast"
            params = {
                'lat': coordinates['lat'],
                'lon': coordinates['lng'],
                'appid': self.api_keys.get_key('weather'),
                'units': 'metric',
                'cnt': min(days * 8, 40)  # 8 forecasts per day, max 40
            }
            
            async with asyncio.create_task(
                self._make_request(url, params)
            ) as response:
                data = await response.json()
                
                # Process forecast data
                forecast = []
                daily_forecasts = {}
                
                for item in data.get('list', []):
                    date = item['dt_txt'][:10]  # Extract date
                    
                    if date not in daily_forecasts:
                        daily_forecasts[date] = {
                            'date': date,
                            'temperature': {
                                'min': item['main']['temp'],
                                'max': item['main']['temp']
                            },
                            'description': item['weather'][0]['description'],
                            'humidity': item['main']['humidity'],
                            'wind_speed': item['wind']['speed'],
                            'icon': item['weather'][0]['icon']
                        }
                    else:
                        # Update min/max temperatures
                        daily_forecasts[date]['temperature']['min'] = min(
                            daily_forecasts[date]['temperature']['min'],
                            item['main']['temp']
                        )
                        daily_forecasts[date]['temperature']['max'] = max(
                            daily_forecasts[date]['temperature']['max'],
                            item['main']['temp']
                        )
                
                return list(daily_forecasts.values())[:days]
                
        except Exception as e:
            logger.error(f"Weather forecast failed: {str(e)}")
            return []
    
    async def _get_local_events(self, destination: str) -> List[Dict[str, Any]]:
        """Get local events happening in the destination"""
        # This would integrate with event APIs like Eventbrite, Meetup, etc.
        # For now, returning empty list as placeholder
        return []
    
    async def _add_travel_times(self, itinerary: Dict[str, Any]) -> Dict[str, Any]:
        """Add travel times between activities"""
        if not self.gmaps or 'daily_schedule' not in itinerary:
            return itinerary
        
        for day in itinerary['daily_schedule']:
            activities = day.get('activities', [])
            
            for i in range(len(activities) - 1):
                current_activity = activities[i]
                next_activity = activities[i + 1]
                
                current_coords = current_activity.get('coordinates')
                next_coords = next_activity.get('coordinates')
                
                if current_coords and next_coords:
                    try:
                        # Calculate travel time
                        directions = self.gmaps.directions(
                            origin=(current_coords['lat'], current_coords['lng']),
                            destination=(next_coords['lat'], next_coords['lng']),
                            mode="walking",
                            departure_time="now"
                        )
                        
                        if directions:
                            leg = directions[0]['legs'][0]
                            current_activity['travel_to_next'] = {
                                'duration': leg['duration']['text'],
                                'duration_seconds': leg['duration']['value'],
                                'distance': leg['distance']['text'],
                                'mode': 'walking'
                            }
                    
                    except Exception as e:
                        logger.error(f"Travel time calculation failed: {str(e)}")
                        current_activity['travel_to_next'] = {
                            'duration': '15 mins',
                            'duration_seconds': 900,
                            'mode': 'walking'
                        }
        
        return itinerary
    
    async def _make_request(self, url: str, params: Dict[str, Any]) -> Any:
        """Make async HTTP request"""
        # This is a placeholder for async HTTP requests
        # In a real implementation, you'd use aiohttp or similar
        import time
        await asyncio.sleep(0.1)  # Simulate network delay
        return {"list": []}  # Placeholder response