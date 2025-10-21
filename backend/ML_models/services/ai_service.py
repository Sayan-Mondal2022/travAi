import google.generativeai as genai
from google.api_core import exceptions as google_exceptions
import json
import logging
from typing import Dict, Any, Optional
from ..config.settings import AI_MODELS
from ..config.api_keys import APIKeyManager
from .prompt_builder import PromptBuilder
from .response_parser import ResponseParser
from .cache_manager import CacheManager

logger = logging.getLogger(__name__)

class AIItineraryService:
    """Service for generating itineraries using Google Gemini"""
    
    def __init__(self):
        self.api_keys = APIKeyManager()
        self.prompt_builder = PromptBuilder()
        self.response_parser = ResponseParser()
        self.cache_manager = CacheManager()

        print("Initializing Google Gemini client")
        
        # Initialize Google Gemini client
        if self.api_keys.is_service_available('google'):
            genai.configure(
                api_key=self.api_keys.get_key('google')
            )
        else:
            raise ValueError("Google Gemini API key not found")
    
    async def generate_itinerary(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a complete itinerary based on user preferences
        
        Args:
            request_data: Dictionary containing trip details
            
        Returns:
            Dictionary containing the generated itinerary
        """
        try:
            # Check cache first
            cache_key = self.cache_manager.generate_key(request_data)
            cached_result = self.cache_manager.get(cache_key)
            
            if cached_result:
                logger.info(f"Returning cached result for key: {cache_key}")
                return cached_result
            
            # Build prompt
            prompt = self.prompt_builder.build_itinerary_prompt(request_data)
            system_prompt = self.prompt_builder.get_system_prompt()
            
            # Generate with AI
            response_text = await self._call_gemini(system_prompt, prompt)
            
            # Parse and validate response
            # Gemini response is a JSON string, so we parse it here.
            parsed_itinerary = self.response_parser.parse_itinerary_response(response_text)
            
            # Cache the result
            self.cache_manager.set(cache_key, parsed_itinerary)
            
            logger.info("Successfully generated itinerary")
            return parsed_itinerary
            
        except Exception as e:
            logger.error(f"Failed to generate itinerary: {str(e)}")
            raise Exception(f"Itinerary generation failed: {str(e)}")
    
    async def refine_itinerary(self, 
                             original_itinerary: Dict[str, Any], 
                             feedback: str) -> Dict[str, Any]:
        """
        Refine an existing itinerary based on user feedback
        
        Args:
            original_itinerary: The original itinerary data
            feedback: User feedback for refinement
            
        Returns:
            Dictionary containing the refined itinerary
        """
        try:
            prompt = self.prompt_builder.build_refinement_prompt(
                original_itinerary, feedback
            )
            system_prompt = self.prompt_builder.get_refinement_system_prompt()
            
            response_text = await self._call_gemini(system_prompt, prompt)
            refined_itinerary = self.response_parser.parse_itinerary_response(response_text)
            
            logger.info("Successfully refined itinerary")
            return refined_itinerary
            
        except Exception as e:
            logger.error(f"Failed to refine itinerary: {str(e)}")
            raise Exception(f"Itinerary refinement failed: {str(e)}")
    
    async def generate_alternatives(self, 
                                  base_itinerary: Dict[str, Any],
                                  alternative_type: str = "budget") -> Dict[str, Any]:
        """
        Generate alternative versions of an itinerary
        
        Args:
            base_itinerary: Base itinerary to create alternatives from
            alternative_type: Type of alternative (budget, luxury, adventure, etc.)
            
        Returns:
            Dictionary containing alternative itinerary
        """
        try:
            prompt = self.prompt_builder.build_alternative_prompt(
                base_itinerary, alternative_type
            )
            system_prompt = self.prompt_builder.get_system_prompt()
            
            response_text = await self._call_gemini(system_prompt, prompt)
            alternative_itinerary = self.response_parser.parse_itinerary_response(response_text)
            
            logger.info(f"Successfully generated {alternative_type} alternative")
            return alternative_itinerary
            
        except Exception as e:
            logger.error(f"Failed to generate alternative: {str(e)}")
            raise Exception(f"Alternative generation failed: {str(e)}")
    
    async def _call_gemini(self, system_prompt: str, user_prompt: str) -> str:
        """Make API call to Google Gemini"""
        try:
            model = genai.GenerativeModel(
                model_name=AI_MODELS['primary'],
                system_instruction=system_prompt,
                generation_config={
                    "temperature": AI_MODELS['temperature'],
                    "max_output_tokens": AI_MODELS['max_tokens'],
                    "response_mime_type": "application/json",
                }
            )
            response = await model.generate_content_async(user_prompt)
            return response.text
            
        except google_exceptions.ResourceExhausted:
            logger.warning("Rate limit hit, trying fallback model")
            fallback_model = genai.GenerativeModel(
                model_name=AI_MODELS['fallback'],
                system_instruction=system_prompt,
                generation_config={
                    "temperature": AI_MODELS['temperature'],
                    "max_output_tokens": AI_MODELS['max_tokens'] - 500,  # Reduce tokens for fallback
                    "response_mime_type": "application/json",
                }
            )
            response = await fallback_model.generate_content_async(user_prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"Google Gemini API call failed: {str(e)}")
            raise
    
    def estimate_cost(self, request_data: Dict[str, Any]) -> float:
        """Estimate the cost of generating an itinerary"""
        # This estimation is abstract and doesn't need to change, 
        # but you might adjust the base cost based on Gemini's pricing.
        base_cost = 0.01  # Base cost in USD
        
        duration = request_data.get('duration', 3)
        complexity_multiplier = 1 + (duration / 10)
        
        return base_cost * complexity_multiplier
