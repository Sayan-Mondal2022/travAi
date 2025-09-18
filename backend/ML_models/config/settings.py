import os
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# API Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY')
WEATHER_API_KEY = os.getenv('WEATHER_API_KEY')

# AI Model Settings
AI_MODELS = {
    'primary': 'gpt-4',
    'fallback': 'gpt-3.5-turbo',
    'temperature': 0.7,
    'max_tokens': 3000
}

# Cache Settings
CACHE_SETTINGS = {
    'enabled': True,
    'ttl': 3600,  # 1 hour
    'max_size': 1000
}

# Data Paths
DATA_DIR = BASE_DIR / 'data'
DESTINATIONS_FILE = DATA_DIR / 'destinations.json'
ACTIVITIES_FILE = DATA_DIR / 'activities_database.json'
PROMPTS_DIR = DATA_DIR / 'prompts'

# Validation Settings
VALIDATION_RULES = {
    'min_budget': 100,
    'max_budget': 50000,
    'min_duration': 1,
    'max_duration': 30,
    'max_group_size': 20
}

# External API Settings
EXTERNAL_APIS = {
    'google_places': {
        'base_url': 'https://maps.googleapis.com/maps/api/place',
        'timeout': 10,
        'retry_count': 3
    },
    'weather': {
        'base_url': 'https://api.openweathermap.org/data/2.5',
        'timeout': 10,
        'retry_count': 3
    }
}
