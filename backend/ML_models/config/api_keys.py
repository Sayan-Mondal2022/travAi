import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables from .env file
load_dotenv()   # Needed to load the ENVs

class APIKeyManager:
    """Manage API keys and credentials"""
    
    def __init__(self):
        self.keys = {
            # Use GOOGLE_GEMINI_API
            'openai': os.getenv('OPENAI_API_KEY'),
            'google_maps': os.getenv('GOOGLE_MAPS_API_KEY'),

            # Weather API will be the same as GOOGLE_API, I think we can use the same.
            # USE GOOGLE_WEATHER for fetching the weather details
            'weather': os.getenv('WEATHER_API_KEY')
        }
    
    def get_key(self, service: str) -> Optional[str]:
        """Get API key for a service"""
        return self.keys.get(service)
    
    def validate_keys(self) -> dict:
        """Validate all required API keys are present"""
        validation = {}
        for service, key in self.keys.items():
            validation[service] = key is not None and len(key) > 0
        return validation
    
    def is_service_available(self, service: str) -> bool:
        """Check if a service is available"""
        key = self.get_key(service)
        return key is not None and len(key) > 0