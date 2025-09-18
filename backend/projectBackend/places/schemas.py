# Make sure you have the necessary imports
from ninja import Schema
from datetime import date
from typing import List

class TripDetailsSchema(Schema):
    # Existing and matching fields
    from_location: str
    to_location: str
    date: date
    duration_days: int
    people_count: int
    budget: float
    travel_preferences: List[str]
    mode_of_transport: str
    weather_preference: str
    
    # New and updated fields from your JSON
    travel_type: str
    has_elderly: bool
    has_children: bool
    has_pets: bool
    children_count: int
    pets_count: int