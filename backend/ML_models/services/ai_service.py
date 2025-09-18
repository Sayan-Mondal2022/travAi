import openai
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
    """Service for generating itineraries using AI"""
    
    def __init__(self):
        self.api_keys = APIKeyManager()
        self.prompt_builder = PromptBuilder()
        self.response_parser = ResponseParser()
        self.cache_manager = CacheManager()
        
        # Initialize OpenAI client
        if self.api_keys.is_service_available('openai'):
            self.client = openai.OpenAI(
                api_key=self.api_keys.get_key('openai')
            )
        else:
            raise ValueError("OpenAI API key not found")
    
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
            response = await self._call_openai(system_prompt, prompt)
            
            # Parse and validate response
            parsed_itinerary = self.response_parser.parse_itinerary_response(response)
            
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
            
            response = await self._call_openai(system_prompt, prompt)
            refined_itinerary = self.response_parser.parse_itinerary_response(response)
            
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
            
            response = await self._call_openai(system_prompt, prompt)
            alternative_itinerary = self.response_parser.parse_itinerary_response(response)
            
            logger.info(f"Successfully generated {alternative_type} alternative")
            return alternative_itinerary
            
        except Exception as e:
            logger.error(f"Failed to generate alternative: {str(e)}")
            raise Exception(f"Alternative generation failed: {str(e)}")
    
    async def _call_openai(self, system_prompt: str, user_prompt: str) -> str:
        """Make API call to OpenAI"""
        try:
            response = self.client.chat.completions.create(
                model=AI_MODELS['primary'],
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=AI_MODELS['temperature'],
                max_tokens=AI_MODELS['max_tokens'],
                response_format={"type": "json_object"}
            )
            
            return response.choices[0].message.content
            
        except openai.RateLimitError:
            logger.warning("Rate limit hit, trying fallback model")
            response = self.client.chat.completions.create(
                model=AI_MODELS['fallback'],
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=AI_MODELS['temperature'],
                max_tokens=AI_MODELS['max_tokens'] - 500,  # Reduce tokens for fallback
                response_format={"type": "json_object"}
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API call failed: {str(e)}")
            raise
    
    def estimate_cost(self, request_data: Dict[str, Any]) -> float:
        """Estimate the cost of generating an itinerary"""
        # Rough estimation based on prompt length and complexity
        base_cost = 0.01  # Base cost in USD
        
        duration = request_data.get('duration', 3)
        complexity_multiplier = 1 + (duration / 10)
        
        return base_cost * complexity_multiplier