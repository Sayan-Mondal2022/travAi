# places/services/place_queries.py
import json
import os
from typing import List

def get_queries_file_path():
    """Get the absolute path to the queries JSON file"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(current_dir))
    return os.path.join(project_root, 'config', 'preference_queries.json')

def load_preference_queries():
    """Load queries from JSON file with proper error handling"""
    try:
        file_path = get_queries_file_path()
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Warning: Preference queries file not found at {file_path}")
        return get_fallback_queries()
    except json.JSONDecodeError as e:
        print(f"Warning: Invalid JSON in queries file: {e}")
        return get_fallback_queries()
    except Exception as e:
        print(f"Warning: Error loading queries: {e}")
        return get_fallback_queries()

def get_fallback_queries():
    """Provide fallback queries if JSON file is unavailable"""
    return {
        "Adventure": ["adventure activities", "outdoor adventures", "adventure sports"],
        "Relaxation": ["spa centers", "peaceful spots", "relaxation venues"],
        "Culture": ["cultural sites", "museums", "heritage locations"],
        "Food & Cuisine": ["local restaurants", "food spots", "dining places"],
        "Nature": ["nature parks", "scenic spots", "natural attractions"]
    }

def generate_tourist_queries(travel_preferences: List[str], experience_type: str):
    """Generate search queries for tourist attractions with preference metadata."""
    preference_queries = load_preference_queries()
    output = []

    for preference in travel_preferences:
        pref_key = preference.strip().title()

        if pref_key in preference_queries:
            for q in preference_queries[pref_key]:
                output.append({"preference": pref_key, "query": q})
        else:
            # fallback if preference is not in the file
            fallback_q = f"{preference.lower()} attractions"
            output.append({"preference": pref_key, "query": fallback_q})

    # Remove duplicates
    unique_list = []
    seen = set()
    for item in output:
        key = (item["preference"], item["query"])
        if key not in seen:
            seen.add(key)
            unique_list.append(item)

    return unique_list[:8]

def generate_restaurant_queries(experience_type: str, travel_preferences: List[str]):
    """Generate restaurant queries with metadata."""
    output = []

    # Normalize experience type
    if isinstance(experience_type, list):
        experience_type = experience_type[0] if experience_type else "moderate"
    exp = str(experience_type).lower()

    # Experience-based queries (PRIMARY)
    experience_restaurant_queries = {
        "budget": [
            "budget restaurants", "cheap eats", "affordable dining",
            "street food", "local cheap restaurants", "fast food restaurants"
        ],
        "moderate": [
            "good restaurants", "popular dining spots", "local cuisine restaurants",
            "mid-range restaurants", "family restaurants", "casual dining"
        ],
        "luxury": [
            "fine dining restaurants", "luxury dining", "premium restaurants",
            "gourmet restaurants", "award-winning restaurants", "upscale restaurants"
        ]
    }

    # Use experience_type as metadata
    base_queries = experience_restaurant_queries.get(exp, experience_restaurant_queries["moderate"])
    for q in base_queries:
        output.append({"preference": exp.title(), "query": q})

    # PREFERENCE-BASED secondary enhancements
    cuisine_mapping = {
        "Food & Cuisine": ["local cuisine restaurants", "food tours", "culinary experiences"],
        "Local Experiences": ["authentic local restaurants", "traditional dining"],
        "Romantic": ["romantic restaurants", "candlelight dining", "intimate cafes"],
        "Adventure": ["unique dining experiences", "adventure-themed restaurants"],
        "Culture": ["traditional cultural restaurants", "ethnic cuisine"],
        "Nature": ["restaurants with scenic views", "garden restaurants"],
        "Budget Travel": ["budget restaurants", "affordable dining"]
    }

    for preference in travel_preferences:
        pref_key = preference.strip().title()
        if pref_key in cuisine_mapping:
            for q in cuisine_mapping[pref_key]:
                output.append({"preference": pref_key, "query": q})

    # Deduplicate
    unique_list = []
    seen = set()
    for item in output:
        key = (item["preference"], item["query"])
        if key not in seen:
            seen.add(key)
            unique_list.append(item)

    return unique_list[:5]


def generate_lodging_queries(experience_type: str, travel_preferences: List[str]):
    """Generate lodging queries with metadata."""
    output = []

    # Normalize experience type
    if isinstance(experience_type, list):
        experience_type = experience_type[0] if experience_type else "moderate"
    exp = str(experience_type).lower()

    # Primary lodging queries
    experience_lodging_queries = {
        "budget": ["budget hotels", "hostels", "affordable accommodation", "cheap hotels", "budget stays"],
        "moderate": ["comfortable hotels", "good hotels", "mid-range accommodation", "standard hotels"],
        "luxury": ["luxury hotels", "5-star hotels", "premium resorts", "boutique hotels", "deluxe accommodation"]
    }

    base_queries = experience_lodging_queries.get(exp, experience_lodging_queries["moderate"])
    for q in base_queries:
        output.append({"preference": exp.title(), "query": q})

    # Secondary preference additions
    for preference in travel_preferences:
        pref_key = preference.strip().title()
        if pref_key == "Eco-Friendly Travel":
            output.append({"preference": pref_key, "query": "eco hotels"})
            output.append({"preference": pref_key, "query": "sustainable accommodation"})
        elif pref_key == "Relaxation":
            output.append({"preference": pref_key, "query": "spa resorts"})
            output.append({"preference": pref_key, "query": "wellness hotels"})

    # Deduplicate
    unique_list = []
    seen = set()
    for item in output:
        key = (item["preference"], item["query"])
        if key not in seen:
            seen.add(key)
            unique_list.append(item)

    return unique_list[:5]
   