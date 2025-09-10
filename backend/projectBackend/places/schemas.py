from ninja import Schema
from typing import List
from datetime import date

class TripDetailsSchema(Schema):
    from_location: str
    to_location: str
    date: date
    duration_days: int
    theme: List[str]
    people_count: int
    budget: float
    travel_preferences: List[str]
    mode_of_transport: str
    weather_preference: str
