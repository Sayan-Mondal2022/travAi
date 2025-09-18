// app/trip/places/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet } from '@/lib/api'; // Update with correct path
import {
  MapPin,
  Star,
  Clock,
  Check,
  X,
  Navigation,
  Loader
} from 'lucide-react';

export default function PlacesSelectionPage() {
  const router = useRouter();
  const [tripData, setTripData] = useState(null);
  const [placesData, setPlacesData] = useState(null);
  const [selectedPlaces, setSelectedPlaces] = useState([]); // ✅ FIX: Will now store full place objects
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlacesData = async () => {
      try {
        const savedTrip = JSON.parse(localStorage.getItem('currentTrip') || '{}');
        if (!savedTrip || !savedTrip.to_location) {
          throw new Error('No trip data found. Please create a trip first.');
        }
        setTripData(savedTrip);

        const places = await apiGet(`/api/tour/places/${encodeURIComponent(savedTrip.to_location)}`);
        setPlacesData(places);

        const allPlaces = [
          ...(places.tourist_attractions || []),
          ...(places.restaurants || []),
          ...(places.lodging || [])
        ];
        
        // ✅ FIX: Initialize state with the full place objects
        setSelectedPlaces(allPlaces);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacesData();
  }, []);

  // ✅ FIX: The logic is updated to handle objects instead of strings
  const togglePlaceSelection = (placeToToggle) => {
    setSelectedPlaces(prev => {
      const isSelected = prev.some(p => p.name === placeToToggle.name);
      if (isSelected) {
        return prev.filter(p => p.name !== placeToToggle.name);
      } else {
        return [...prev, placeToToggle];
      }
    });
  };

  const selectAll = () => {
    if (!placesData) return;
    const allPlaces = [
      ...(placesData.tourist_attractions || []),
      ...(placesData.restaurants || []),
      ...(placesData.lodging || [])
    ];
    setSelectedPlaces(allPlaces);
  };

  const deselectAll = () => {
    setSelectedPlaces([]);
  };



  const handleGenerateItinerary = async () => {
    setSaving(true);
    try {
      // ✅ FIX: Save the full array of selected place objects
      localStorage.setItem('selectedPlaces', JSON.stringify(selectedPlaces));
      
      router.push('/trip/itinerary');
    } catch (err) {
      setError('Failed to generate itinerary. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto">
             <Loader className="w-6 h-6 mx-auto mt-2 text-orange-600" />
          </div>
          <p className="mt-4 text-gray-600">Discovering amazing places for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Navigation className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/trip/preferences')}
            className="bg-orange-600 text-white py-2 px-6 rounded-xl hover:bg-orange-700 font-semibold"
          >
            Create New Trip
          </button>
        </div>
      </div>
    );
  }
  
  // Helper function to render a place card, reducing repetition
  const PlaceCard = ({ place }) => {
    const isSelected = selectedPlaces.some(p => p.name === place.name);
    return (
      <div 
        // ✅ FIX: Use a more stable key than index
        key={place.name} 
        className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
          isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        // ✅ FIX: Pass the entire place object to the toggle function
        onClick={() => togglePlaceSelection(place)}
      >
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-gray-900 mb-2 pr-2">{place.name}</h3>
          <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
            isSelected ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
          }`}>
            {isSelected ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3">{place.address}</p>
        <div className="flex items-center justify-between">
            <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm">{place.rating || 'N/A'}</span>
                <span className="text-sm text-gray-500 ml-1">
                    ({place.user_ratings_total || 0})
                </span>
            </div>
            {place.opening_hours && <Clock className="w-4 h-4 text-gray-500" />}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Select Places for Your Trip to {tripData.to_location}
              </h1>
              <p className="text-gray-600">
                Choose which places you&apos;d like to include in your itinerary
              </p>
            </div>
            <div className="flex space-x-2 mt-4 md:mt-0">
              <button onClick={selectAll} className="bg-green-100 text-green-800 py-2 px-4 rounded-xl hover:bg-green-200 font-medium text-sm">
                Select All
              </button>
              <button onClick={deselectAll} className="bg-red-100 text-red-800 py-2 px-4 rounded-xl hover:bg-red-200 font-medium text-sm">
                Deselect All
              </button>
            </div>
          </div>
        </div>

        {/* Places Selection */}
        {placesData && (
          <div className="space-y-8">
            {placesData.tourist_attractions?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 text-blue-500 mr-2" />
                  Tourist Attractions ({placesData.tourist_attractions.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {placesData.tourist_attractions.map(place => <PlaceCard key={place.name} place={place} />)}
                </div>
              </div>
            )}

            {placesData.restaurants?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-red-500 mr-2">🍴</span>
                  Restaurants ({placesData.restaurants.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {placesData.restaurants.map(place => <PlaceCard key={place.name} place={place} />)}
                </div>
              </div>
            )}

            {placesData.lodging?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="text-blue-500 mr-2">🏨</span>
                  Accommodations ({placesData.lodging.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {placesData.lodging.map(place => <PlaceCard key={place.name} place={place} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-6 flex justify-between items-center sticky bottom-4">
          <button
            onClick={() => router.push('/trip/preferences')}
            className="bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300 font-semibold"
          >
            ← Back
          </button>
          <button
            onClick={handleGenerateItinerary}
            disabled={selectedPlaces.length === 0 || saving}
            className="bg-orange-600 text-white py-3 px-6 rounded-xl hover:bg-orange-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              `Generate Itinerary (${selectedPlaces.length} selected)`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}