import requests

GOOGLE_PLACES_URL = "https://places.googleapis.com/v1/places:searchNearby"
def fetch_places(api_key: str, latitude: float, longitude: float, included_types: list, radius: float = 1500):
    """
    Calls Google Places Nearby Search API (v1) and returns JSON.
    """

    payload = {
        "includedTypes": included_types,
        "maxResultCount": 20,
        "locationRestriction": {
            "circle": {
                "center": {"latitude": latitude, "longitude": longitude},
                "radius": radius,
            }
        },
    }

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "places.displayName,"
            "places.name,"
            "places.id,"
            "places.internationalPhoneNumber,"
            "places.formattedAddress,"
            "places.types,"
            "places.rating,"
            "places.googleMapsLinks.placeUri,"
            "places.googleMapsLinks.directionsUri,"
            "places.reviewSummary.text.text,"
            "places.reviewSummary.disclosureText.text,"
            "places.reviewSummary.reviewsUri"
        )
    }

    try:
        res = requests.post(GOOGLE_PLACES_URL, json=payload, headers=headers, timeout=10)
        res.raise_for_status()
        return res.json()
    except Exception as e:
        print("❌ Nearby Search API error:", e)
        return {"places": []}


def extract_places_data(data: dict) -> list:
    """
    Extracts required fields from a Places API JSON response.
    Works for large JSON with multiple place entries.

    Returns a list of dictionaries.
    """

    places = data.get("places", [])  # In case root has "places" list
    results = []

    for p in places:
        place_data = {
            "displayName": p.get("displayName", {}).get("text"),
            "name": p.get("name"),
            "id": p.get("id"),
            "internationalPhoneNumber": p.get("internationalPhoneNumber", None),
            "formattedAddress": p.get("formattedAddress"),
            "types": p.get("types", []),
            "rating": p.get("rating"),

            # googleMapsLinks
            "placeUri": p.get("googleMapsUri") or p.get("googleMapsLinks", {}).get("placeUri"),
            "directionsUri": p.get("googleMapsLinks", {}).get("directionsUri"),

            # reviewSummary
            "reviewSummary_text": p.get("reviewSummary", {}).get("text", {}).get("text"),
            "reviewSummary_disclosureText": p.get("reviewSummary", {})
                .get("disclosureText", {})
                .get("text"),
            "reviewSummary_reviewsUri": p.get("reviewSummary", {}).get("reviewsUri"),
        }

        results.append(place_data)

    return results

def get_places_data(api_key, lat, lng, included_types):
    """
    Fetches raw API → extract required fields → returns cleaned data list.
    """
    raw = fetch_places(api_key, lat, lng, included_types)
    cleaned = extract_places_data(raw)
    return cleaned

