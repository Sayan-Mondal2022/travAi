# schemas.py
from typing import List, Optional
from ninja import Schema

class TripDetailsSchema(Schema):
    # Location fields
    from_location: str
    to_location: str
    
    # Date fields
    start_date: str
    end_date: str
    duration_days: int
    
    # Travel type
    travel_type: str
    
    # Group details - make elder_count optional
    people_count: int
    has_elderly: bool
    has_children: bool
    has_pets: bool
    children_count: int
    elder_count: int  # Make it optional with default
    pets_count: int
    
    # Preferences
    weather_preference: str
    mode_of_transport: str
    experience_type: str
    travel_preferences: List[str]
    
    # Budget
    budget: float
    
    # Optional field
    to_date: Optional[str] = None