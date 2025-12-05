from typing import Dict, Any, List
from django.conf import settings
from datetime import datetime

def build_cache_key(destination: str, preferences_list: List[str], experience_type: str) -> str:
    """
    Build a deterministic cache key based on destination + experience + preferences.
    """
    norm_dest = destination.strip().lower()
    norm_exp = str(experience_type).strip().lower()
    norm_prefs = sorted([p.strip().lower() for p in preferences_list]) if preferences_list else []
    return f"{norm_dest}__{norm_exp}__{'|'.join(norm_prefs)}"


def save_trip_response(cache_key: str, response_data: Dict[str, Any]) -> None:
    """
    Save or update the full response for a given cache_key.
    Stored in: settings.MONGO_DB.trip_places_cache
    """
    doc = dict(response_data)
    doc["_id"] = cache_key
    doc["cache_key"] = cache_key
    doc["last_updated"] = datetime.now().isoformat()

    settings.MONGO_DB.trip_places_cache.update_one(
        {"_id": cache_key},
        {"$set": doc},
        upsert=True,
    )


def load_trip_response(cache_key: str) -> Dict[str, Any] | None:
    """
    Load a previously saved response for this cache_key, if available.
    """
    doc = settings.MONGO_DB.trip_places_cache.find_one({"_id": cache_key})
    if doc:
        doc["_id"] = str(doc["_id"])
        return doc
    return None