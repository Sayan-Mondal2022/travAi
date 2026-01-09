from typing import Dict, Any, List  

# ======================================================================
# AI ITINERARY HELPERS
# ======================================================================

def _extract_text(obj):
    if isinstance(obj, dict) and "text" in obj:
        return obj["text"]
    return obj if isinstance(obj, str) else None


def _simplify_place_for_ai(place: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize place structure for Gemini (attractions / restaurants / lodging).
    Works for both:
    - flattened fields from filter_textSearch_place_data
    - nested fields from get_places_data
    """

    # Name
    name = (
        _extract_text(place.get("displayName"))
        or place.get("displayName")
        or place.get("name")
    )

    # Editorial / review summary
    editorial = (
        place.get("editorialSummary.text")
        or _extract_text(place.get("editorialSummary"))
    )
    review = (
        place.get("reviewSummary.text")
        or _extract_text(place.get("reviewSummary"))
    )

    # Address
    formatted_address = place.get("formattedAddress")
    if isinstance(formatted_address, dict):
        formatted_address = _extract_text(formatted_address)

    # Landmarks: support both nested and flattened forms
    landmarks_raw = []

    if isinstance(place.get("addressDescriptor"), dict):
        ld = place.get("addressDescriptor", {}).get("landmarks")
        if isinstance(ld, list):
            landmarks_raw = ld

    if not landmarks_raw and isinstance(place.get("addressDescriptor.landmarks"), list):
        landmarks_raw = place.get("addressDescriptor.landmarks")

    simplified_landmarks = []
    for lm in landmarks_raw:
        lm_name = _extract_text(lm.get("displayName")) or lm.get("name")
        simplified_landmarks.append(
            {
                "display_name": lm_name,
                "distance_meters": lm.get("straightLineDistanceMeters"),
            }
        )

    # Location: normalize to {lat, lng}
    loc = place.get("location") or place.get("geometry", {}).get("location")
    lat = lng = None
    if isinstance(loc, dict):
        lat = loc.get("lat") or loc.get("latitude")
        lng = loc.get("lng") or loc.get("longitude")

    # Google Maps links: support both nested and flattened forms
    gm_links = place.get("googleMapsLinks") or {}
    google_maps_url = (
        gm_links.get("placeUri")
        or place.get("googleMapsLinks.placeUri")
        or place.get("googleMapsUri")
    )
    directions_url = (
        gm_links.get("directionsUri")
        or place.get("googleMapsLinks.directionsUri")
    )

    return {
        "id": place.get("id"),
        "name": name,
        "types": place.get("types") or [],
        "formatted_address": formatted_address,
        "rating": place.get("rating"),
        "user_rating_count": place.get("userRatingCount"),
        "price_level": place.get("priceLevel"),

        # Always plain strings
        "editorial_summary": editorial,
        "review_summary": review,

        # Landmarks (normalized)
        "landmarks": simplified_landmarks,

        # Location for map
        "location": {"lat": lat, "lng": lng} if lat is not None and lng is not None else None,

        # Links
        "google_maps_url": google_maps_url,
        "directions_url": directions_url,

        "photos": place.get("photos") or [],
    }


def _flatten_grouped_places(
    grouped: Dict[str, List[Dict[str, Any]]],
    preferences_list: List[str],
) -> List[Dict[str, Any]]:
    """
    Flattens grouped places structure respecting preference order.
    
    grouped structure: { "Relaxation": [...], "Adventure": [...], "_others": [...] }
    OR for no preferences: { "General": [...], "_others": [...] }
    
    Flattens in pref-order, then _others.
    """
    result: List[Dict[str, Any]] = []
    seen_ids: set[str] = set()

    # ✅ FIX: Handle "General" category when no preferences provided
    if not preferences_list or len(preferences_list) == 0:
        # Use "General" category if it exists
        for p in grouped.get("General", []):
            pid = p.get("id")
            if pid and pid not in seen_ids:
                seen_ids.add(pid)
                result.append(p)
        
        # Then add _others
        for p in grouped.get("_others", []):
            pid = p.get("id")
            if pid and pid not in seen_ids:
                seen_ids.add(pid)
                result.append(p)
        
        return result

    # Original logic: Respect preference order
    for pref in preferences_list:
        for p in grouped.get(pref, []):
            pid = p.get("id")
            if pid and pid not in seen_ids:
                seen_ids.add(pid)
                result.append(p)

    # Then others
    for p in grouped.get("_others", []):
        pid = p.get("id")
        if pid and pid not in seen_ids:
            seen_ids.add(pid)
            result.append(p)

    return result


def build_daywise_place_plan(
    reference_places: Dict[str, Any],
    preferences_list: List[str],
    days: int,
) -> List[Dict[str, Any]]:
    """
    Build a structured plan for each day:
    - 5 tourist attractions / day
    - 1–3 restaurants for breakfast/lunch/dinner per day
    - 3–5 lodging options for Day 1 only
    """
    ta_grouped = reference_places.get("tourist_attractions", {}) or {}
    rest_grouped = reference_places.get("restaurants", {}) or {}
    lodg_grouped = reference_places.get("lodging", {}) or {}

    ta_flat = _flatten_grouped_places(ta_grouped, preferences_list)
    rest_flat = _flatten_grouped_places(rest_grouped, preferences_list)
    lodg_flat = _flatten_grouped_places(lodg_grouped, preferences_list)

    # Sort by rating desc where available
    def sort_by_rating(lst: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return sorted(
            lst,
            key=lambda x: (x.get("rating") is not None, x.get("rating") or 0),
            reverse=True,
        )

    ta_flat = sort_by_rating(ta_flat)
    rest_flat = sort_by_rating(rest_flat)
    lodg_flat = sort_by_rating(lodg_flat)

    # Simplify for AI
    ta_simpl = [_simplify_place_for_ai(p) for p in ta_flat]
    rest_simpl = [_simplify_place_for_ai(p) for p in rest_flat]
    lodg_simpl = [_simplify_place_for_ai(p) for p in lodg_flat]

    day_plans: List[Dict[str, Any]] = []

    for day_idx in range(days):
        day_number = day_idx + 1

        # 5 attractions per day (unique within the day, can repeat across days if needed)
        ta_start = day_idx * 5
        attractions = []
        for i in range(5):
            if not ta_simpl:
                break
            idx = (ta_start + i) % len(ta_simpl)
            attractions.append(ta_simpl[idx])

        # Restaurants: aim for 3 per meal if available (Option A: reuse allowed)
        rest_start = day_idx * 3 if rest_simpl else 0
        slice_block = rest_simpl[rest_start: rest_start + 3] or rest_simpl[:3]

        breakfast_rests = slice_block[:3]
        lunch_rests = slice_block[:3]
        dinner_rests = slice_block[:3]

        restaurants_block = {
            "breakfast": breakfast_rests,
            "lunch": lunch_rests,
            "dinner": dinner_rests,
        }

        # Lodging only for Day 1: 3–5 suggestions
        lodging_options = lodg_simpl[:5] if day_number == 1 else []

        day_plans.append(
            {
                "day": day_number,
                "attractions": attractions,
                "restaurants": restaurants_block,
                "lodging_options": lodging_options,
            }
        )

    return day_plans
