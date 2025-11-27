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

def generate_tourist_queries(travel_preferences: List[str], experience_type: str) -> List[str]:
    """Generate search queries for tourist attractions based ONLY on travel preferences"""
    preference_queries = load_preference_queries()
    queries = []
    
    # Only use travel_preferences for tourist attractions
    for preference in travel_preferences:
        clean_preference = preference.strip().title()
        if clean_preference in preference_queries:
            queries.extend(preference_queries[clean_preference])
        else:
            queries.append(f"{preference.lower()} attractions")
    
    # Remove duplicates and limit the number of queries
    unique_queries = list(set(queries))
    return unique_queries[:8]  # Return max 8 queries for tourist attractions

def generate_restaurant_queries(experience_type: str, travel_preferences: List[str]) -> List[str]:
    """Generate search queries for restaurants based PRIMARILY on experience type"""
    queries = []

    if isinstance(experience_type, list):
        experience_type = experience_type[0] if experience_type else "moderate"
    experience_type = str(experience_type).lower()
    
    # Experience type based restaurant queries (primary)
    experience_restaurant_queries = {
        "budget": [
            "budget restaurants", 
            "cheap eats", 
            "affordable dining",
            "street food",
            "local cheap restaurants",
            "fast food restaurants"
        ],
        "moderate": [
            "good restaurants",
            "popular dining spots", 
            "local cuisine restaurants",
            "mid-range restaurants",
            "family restaurants",
            "casual dining"
        ],
        "luxury": [
            "fine dining restaurants",
            "luxury dining", 
            "premium restaurants",
            "gourmet restaurants",
            "award-winning restaurants",
            "upscale restaurants"
        ]
    }
    
    if experience_type.lower() in experience_restaurant_queries:
        queries.extend(experience_restaurant_queries[experience_type.lower()])
    else:
        queries.extend(experience_restaurant_queries["moderate"])  # Default to moderate
    
    # Add cuisine/style preferences from travel_preferences
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
        clean_preference = preference.strip().title()
        if clean_preference in cuisine_mapping:
            queries.extend(cuisine_mapping[clean_preference])
    
    return list(set(queries))[:5]  # Return max 5 queries for restaurants

def generate_lodging_queries(experience_type: str, travel_preferences: List[str]) -> List[str]:
    """Generate search queries for lodging based PRIMARILY on experience type"""
    queries = []

    if isinstance(experience_type, list):
        experience_type = experience_type[0] if experience_type else "moderate"
    experience_type = str(experience_type).lower()
    
    # Experience type based lodging queries (primary)
    experience_lodging_queries = {
        "budget": [
            "budget hotels",
            "hostels", 
            "affordable accommodation",
            "cheap hotels",
            "budget stays"
        ],
        "moderate": [
            "comfortable hotels",
            "good hotels", 
            "mid-range accommodation",
            "standard hotels"
        ],
        "luxury": [
            "luxury hotels",
            "5-star hotels", 
            "premium resorts",
            "boutique hotels",
            "deluxe accommodation"
        ]
    }
    
    if experience_type.lower() in experience_lodging_queries:
        queries.extend(experience_lodging_queries[experience_type.lower()])
    else:
        queries.extend(experience_lodging_queries["moderate"])  # Default to moderate
    
    # Only add relevant preferences as secondary
    for preference in travel_preferences:
        clean_preference = preference.strip().title()
        if clean_preference == "Eco-Friendly Travel":
            queries.extend(["eco hotels", "sustainable accommodation"])
        elif clean_preference == "Relaxation":
            queries.extend(["spa resorts", "wellness hotels"])
    
    return list(set(queries))[:5]  # Return max 5 queries for lodging