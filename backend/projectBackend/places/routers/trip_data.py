from places.schemas import TripDetailsSchema
from datetime import datetime
import projectBackend.settings as settings
from ninja import Router, Body

# Ninja Routers
trip_router = Router()

# --- Trip Endpoints ---
@trip_router.post("/add-trip/")
def add_trip(request, payload: TripDetailsSchema):
    """
    Saves trip details to the database after converting data types.
    """
    trip_doc = payload.dict()

    # Convert date strings to datetime for MongoDB compatibility
    date_fields = ['start_date', 'end_date', 'to_date']
    
    for field in date_fields:
        if field in trip_doc and trip_doc[field]:
            try:
                # Parse the date string (format: "YYYY-MM-DD")
                date_obj = datetime.strptime(trip_doc[field], "%Y-%m-%d")
                trip_doc[field] = datetime.combine(date_obj, datetime.min.time())
            except (ValueError, TypeError) as e:
                print(f"Warning: Could not parse {field}: {trip_doc[field]}. Error: {e}")
                # Keep the original string if parsing fails

    # Insert into MongoDB
    result = settings.MONGO_DB.trip_details.insert_one(trip_doc)

    # Prepare the document for a clean JSON response
    trip_doc['_id'] = str(result.inserted_id)
    
    # Convert datetime objects back to ISO format strings for response
    for field in date_fields:
        if field in trip_doc and isinstance(trip_doc[field], datetime):
            trip_doc[field] = trip_doc[field].isoformat()

    return {"message": "Trip saved successfully", "data": trip_doc}

@trip_router.get("/trips/")
def list_trips(request):
    """
    Lists all trips, ensuring ObjectId and datetime are JSON serializable.
    """
    trips = []
    for trip in settings.MONGO_DB.trip_details.find({}):
        trip['_id'] = str(trip['_id'])
        if isinstance(trip.get('date'), datetime):
            trip['date'] = trip['date'].isoformat()
        trips.append(trip)
    return {"trips": trips}

