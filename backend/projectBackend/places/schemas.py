# schemas.py
from typing import List, Optional
from ninja import Schema

class TripDetailsSchema(Schema):
    # -----------------
    # Location
    # -----------------
    from_location: str
    to_location: str

    # -----------------
    # Dates
    # -----------------
    start_date: str
    end_date: Optional[str] = None   # Optional for one-way trips

    # -----------------
    # Travel & Group
    # -----------------
    trip_type: str                  # oneway / round
    travel_type: str                # solo, duo, family, etc.

    people_count: int
    has_children: bool = False
    has_elderly: bool = False
    has_pets: bool = False

    children_count: int = 0
    elder_count: int = 0
    pets_count: int = 0

    # -----------------
    # Preferences
    # -----------------
    mode_of_transport: str          # flight, train, car, etc.
    experience_type: str            # budget, moderate, luxury
    travel_preferences: List[str] = []

    # -----------------
    # Budget
    # -----------------
    budget: float

    # -----------------
    # Legacy / Optional (REMOVE if unused)
    # -----------------
    to_date: Optional[str] = None
