import requests
import os
from ninja import Router, Body
from django.http import JsonResponse
from dotenv import load_dotenv

load_dotenv()
routes_router = Router()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

def validate_place(place_name: str):
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        "address": place_name,
        "key": GOOGLE_API_KEY
    }

    res = requests.get(url, params=params).json()

    if res["status"] != "OK":
        return None, f"Invalid place: {place_name}"

    result = res["results"][0]
    formatted_address = result["formatted_address"]
    location = result["geometry"]["location"]   # { lat: , lng: }

    return {
        "label": formatted_address,
        "lat": location["lat"],
        "lng": location["lng"]
    }, None

@routes_router.post("/distance/")
def get_route_distance(request, payload: dict = Body(...)):
    origin = payload.get("origin")
    destination = payload.get("destination")

    if not origin or not destination:
        return JsonResponse({"error": "origin and destination required"}, status=400)

    # Validate origin
    start_info, err1 = validate_place(origin)
    if err1:
        return JsonResponse({"error": err1}, status=400)

    # Validate destination
    end_info, err2 = validate_place(destination)
    if err2:
        return JsonResponse({"error": err2}, status=400)

    # Call Routes API
    url = "https://routes.googleapis.com/directions/v2:computeRoutes"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.duration"
    }

    body = {
        "origin": { "address": start_info["label"] },
        "destination": { "address": end_info["label"] }
    }

    response = requests.post(url, json=body, headers=headers).json()

    if "routes" not in response:
        return JsonResponse({"error": "Could not compute route", "details": response}, status=500)

    route = response["routes"][0]
    distance_m = route["distanceMeters"]
    duration_s = route["duration"]

    seconds = int(duration_s.replace("s", ""))
    hours = seconds // 3600
    minutes = (seconds % 3600) // 60

    data = {
        "origin": start_info["label"],
        "destination": end_info["label"],
        "distance_meters": distance_m,
        "distance_km": round(distance_m / 1000, 2),
        "duration_text": f"{hours} hr {minutes} min",
        "duration_seconds": seconds
    }

    return JsonResponse(data)
