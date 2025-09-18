import json
import hashlib
import time
from typing import Dict, Any, Optional
from pathlib import Path
import pickle
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    """Manager for caching AI responses and data"""
    
    def __init__(self, cache_dir: str = None, max_size: int = 1000, ttl: int = 3600):
        self.cache_dir = Path(cache_dir) if cache_dir else Path.cwd() / 'cache'
        self.cache_dir.mkdir(exist_ok=True)
        self.max_size = max_size
        self.ttl = ttl  # Time to live in seconds
        self.memory_cache = {}
        self.cache_stats = {'hits': 0, 'misses': 0}
    
    def generate_key(self, data: Dict[str, Any]) -> str:
        """Generate cache key from request data"""
        # Create a normalized version of the data for consistent hashing
        normalized_data = self._normalize_data(data)
        data_string = json.dumps(normalized_data, sort_keys=True)
        return hashlib.md5(data_string.encode()).hexdigest()
    
    def _normalize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize data for consistent caching"""
        normalized = {}
        
        # Include only cache-relevant fields
        cache_fields = [
            'destination', 'duration', 'budget', 'group_size', 
            'travel_style', 'interests', 'start_date'
        ]
        
        for field in cache_fields:
            if field in data:
                value = data[field]
                if isinstance(value, list):
                    value = sorted(value)  # Sort lists for consistency
                normalized[field] = value
        
        return normalized
    
    def get(self, key: str) -> Optional[Dict[str, Any]]:
        """Retrieve cached data"""
        try:
            # Check memory cache first
            if key in self.memory_cache:
                entry = self.memory_cache[key]
                if not self._is_expired(entry):
                    self.cache_stats['hits'] += 1
                    logger.debug(f"Cache hit (memory): {key}")
                    return entry['data']
                else:
                    del self.memory_cache[key]
            
            # Check file cache
            cache_file = self.cache_dir / f"{key}.pkl"
            if cache_file.exists():
                with open(cache_file, 'rb') as f:
                    entry = pickle.load(f)
                    
                if not self._is_expired(entry):
                    # Load into memory cache
                    self.memory_cache[key] = entry
                    self.cache_stats['hits'] += 1
                    logger.debug(f"Cache hit (file): {key}")
                    return entry['data']
                else:
                    cache_file.unlink()  # Remove expired file
            
            self.cache_stats['misses'] += 1
            logger.debug(f"Cache miss: {key}")
            return None
            
        except Exception as e:
            logger.error(f"Cache retrieval failed for {key}: {str(e)}")
            return None
    
    def set(self, key: str, data: Dict[str, Any]) -> None:
        """Store data in cache"""
        try:
            entry = {
                'data': data,
                'timestamp': time.time(),
                'ttl': self.ttl
            }
            
            # Store in memory cache
            self.memory_cache[key] = entry
            
            # Store in file cache
            cache_file = self.cache_dir / f"{key}.pkl"
            with open(cache_file, 'wb') as f:
                pickle.dump(entry, f)
            
            # Cleanup if cache is too large
            self._cleanup_cache()
            
            logger.debug(f"Cached data: {key}")
            
        except Exception as e:
            logger.error(f"Cache storage failed for {key}: {str(e)}")
    
    def _is_expired(self, entry: Dict[str, Any]) -> bool:
        """Check if cache entry is expired"""
        return (time.time() - entry['timestamp']) > entry['ttl']
    
    def _cleanup_cache(self) -> None:
        """Cleanup old cache entries"""
        # Memory cache cleanup
        if len(self.memory_cache) > self.max_size:
            # Remove oldest entries
            sorted_items = sorted(
                self.memory_cache.items(),
                key=lambda x: x[1]['timestamp']
            )
            
            items_to_remove = len(self.memory_cache) - self.max_size + 10
            for key, _ in sorted_items[:items_to_remove]:
                del self.memory_cache[key]
        
        # File cache cleanup
        try:
            cache_files = list(self.cache_dir.glob("*.pkl"))
            if len(cache_files) > self.max_size:
                # Sort by modification time
                cache_files.sort(key=lambda x: x.stat().st_mtime)
                
                files_to_remove = len(cache_files) - self.max_size + 10
                for cache_file in cache_files[:files_to_remove]:
                    cache_file.unlink()
                    
        except Exception as e:
            logger.error(f"Cache cleanup failed: {str(e)}")
    
    def clear(self) -> None:
        """Clear all cache"""
        self.memory_cache.clear()
        
        try:
            for cache_file in self.cache_dir.glob("*.pkl"):
                cache_file.unlink()
        except Exception as e:
            logger.error(f"Cache clear failed: {str(e)}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.cache_stats['hits'] + self.cache_stats['misses']
        hit_rate = (self.cache_stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'hits': self.cache_stats['hits'],
            'misses': self.cache_stats['misses'],
            'hit_rate': f"{hit_rate:.2f}%",
            'memory_cache_size': len(self.memory_cache),
            'file_cache_size': len(list(self.cache_dir.glob("*.pkl")))
        }
