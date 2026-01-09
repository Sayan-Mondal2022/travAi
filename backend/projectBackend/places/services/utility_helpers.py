import googlemaps
import requests
import os
from dotenv import load_dotenv
from typing import Dict, Any, List

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
gmaps = googlemaps.Client(key=GOOGLE_API_KEY)

def get_coordinates(destination: str):
    """
    Geocode a destination string to (lat, lng, formatted_address).
    """
    try:
        geocode_result = gmaps.geocode(destination)
        if not geocode_result:
            return None, None, f"Could not find location: {destination}"
        location = geocode_result[0]["geometry"]["location"]
        formatted_address = geocode_result[0].get("formatted_address", destination)

        latitude = location["lat"]
        longitude = location["lng"]

        return latitude, longitude, formatted_address
    except Exception as e:
        print(f"Geocoding error for {destination}: {e}")
        return None, None, f"Geocoding failed: {str(e)}"


def safe_str(value):
    """Convert any type (dict, list, None, int, etc.) safely to lowercaseable string."""
    if isinstance(value, dict):
        return " ".join([safe_str(v) for v in value.values()])
    if isinstance(value, list):
        return " ".join([safe_str(v) for v in value])
    if value is None:
        return ""
    return str(value)


def group_places_by_preference(places: List[Dict[str, Any]], preferences_list: List[str]) -> Dict[str, List[Dict[str, Any]]]:
    """
    Groups places based on whether the place-related text contains a given preference term.
    
    HANDLES EMPTY PREFERENCES: If no preferences provided, returns all places under "General" category.
    
    Returns:
        {
          "<preference1>": [...],
          "<preference2>": [...],
          "_others": [...],
          # OR if no preferences:
          "General": [all places]
        }
    """
    # ✅ FIX: Handle empty preferences case
    if not preferences_list or len(preferences_list) == 0:
        return {
            "General": places,
            "_others": []
        }
    
    # Original logic for preference-based grouping
    grouped: Dict[str, List[Dict[str, Any]]] = {pref: [] for pref in preferences_list}
    grouped["_others"] = []

    for place in places:
        combined_text = (
            safe_str(place.get("name"))
            + " "
            + safe_str(place.get("types"))
            + " "
            + safe_str(place.get("editorialSummary.text"))
            + " "
            + safe_str(place.get("reviewSummary.text"))
            + " "
            + safe_str(place.get("formattedAddress"))
        ).lower()

        matched = False
        for pref in preferences_list:
            if pref.lower() in combined_text:
                grouped[pref].append(place)
                matched = True
                break

        if not matched:
            grouped["_others"].append(place)

    return grouped


def filter_new_places(data: List[Dict[str, Any]], container_set: set[str]) -> List[Dict[str, Any]]:
    """
    Filter out places that have already been seen in container_set.
    Works with either 'id' or 'place_id' keys.
    """
    filtered = []
    for place in data:
        pid = place.get("id") or place.get("place_id")
        if pid and pid not in container_set:
            container_set.add(pid)
            filtered.append(place)
    return filtered


def filter_textSearch_place_data(raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
    filtered_places = []

    for place in raw_data.get("places", []):
        filtered_place = {
            "name": place.get("name"),
            "id": place.get("id"),
            "types": place.get("types"),
            "displayName": place.get("displayName", {}).get("text"),
            "internationalPhoneNumber": place.get("internationalPhoneNumber"),
            "formattedAddress": place.get("formattedAddress"),
            "editorialSummary.text": place.get("editorialSummary", {}).get("text"),
            "addressDescriptor.landmarks": place.get("addressDescriptor", {}).get("landmarks"),
            "googleMapsLinks.directionsUri": place.get("googleMapsLinks", {}).get("directionsUri"),
            "googleMapsLinks.placeUri": place.get("googleMapsLinks", {}).get("placeUri"),
            "googleMapsLinks.reviewsUri": place.get("googleMapsLinks", {}).get("reviewsUri"),
            "googleMapsLinks.photosUri": place.get("googleMapsLinks", {}).get("photosUri"),
            "reviewSummary.text": place.get("reviewSummary", {}).get("text"),
            # ADD THESE IMPORTANT FIELDS:
            "rating": place.get("rating"),  # Overall rating (0-5)
            "userRatingCount": place.get("userRatingCount"),  # Number of reviews
            "priceLevel": place.get("priceLevel"),  # Price range indicator (0-4)
            "websiteUri": place.get("websiteUri"),  # Official website
            "location": place.get("location"),  # Coordinates (lat, lng)
            "currentOpeningHours": place.get("currentOpeningHours", {}).get("weekdayDescriptions"),
            "photos": [photo.get("name") for photo in place.get("photos", [])[:3]],  # First 3 photos
        }
        filtered_places.append(filtered_place)

    return filtered_places

# This function is used to call the Google Places Text Search API
def fetch_places_data(api_key: str, query: str) -> Dict[str, Any]:
    """
    Calls the Google Places Text Search API.
    """
    url = "https://places.googleapis.com/v1/places:searchText"

    headers = {
        "X-Goog-Api-Key": api_key,
        "Content-Type": "application/json",
        "X-Goog-FieldMask": "*",
    }

    body = {"textQuery": query}

    try:
        response = requests.post(url, headers=headers, json=body, timeout=10)
        response.raise_for_status()
        return response.json()

    except requests.RequestException as e:
        print(f"❌ Places API request failed: {e}")
        return None