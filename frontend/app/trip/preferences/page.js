// app/trip/preferences/page.js
// Should add few more features like Budget Preference, Scenic Views (Choosing the route)

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Cloud, Route, DollarSign, Bike, Car, Plane, Train } from 'lucide-react';
import { apiPost } from '@/lib/api';

const WEATHER_OPTIONS = [
  { id: 'warm', label: 'Warm & Sunny', emoji: '☀️' },
  { id: 'cool', label: 'Cool & Breezy', emoji: '🌤️' },
  { id: 'cold', label: 'Cold & Snowy', emoji: '❄️' },
  { id: 'any', label: 'Any Weather', emoji: '🌈' },
];

const TRANSPORT_OPTIONS = [
  { id: 'flight', label: 'Flight', icon: Plane, color: 'text-red-500' },
  { id: 'train', label: 'Train', icon: Train, color: 'text-green-500' },
  { id: 'car', label: 'Car', icon: Car, color: 'text-blue-500' },
  { id: 'bike', label: 'Bike', icon: Bike, color: 'text-purple-500' },
  { id: 'mixed', label: 'Mixed', emoji: '🚗✈️', color: 'text-orange-500' },
];

const TRAVEL_PREFERENCES = [
  'Adventure', 'Relaxation', 'Cultural', 'Food', 'Shopping',
  'Nature', 'Historical', 'Nightlife', 'Local Experiences'
];

export default function PreferencesStep() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    weather_preference: '',
    mode_of_transport: '',
    travel_preferences: [],
    budget: 2000
  });

  // This hook loads data when the component first mounts
  useEffect(() => {
    const savedData = localStorage.getItem('tripData');
    if (savedData) {
      setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));
    }
  }, []);

  // ✅ ADD THIS NEW HOOK
  // This hook saves the current page's data to localStorage whenever it changes
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('tripData') || '{}');
    const updatedTripData = { ...savedData, ...formData };
    localStorage.setItem('tripData', JSON.stringify(updatedTripData));
  }, [formData]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get all data from localStorage and combine with current form data
    const savedData = JSON.parse(localStorage.getItem('tripData') || '{}');
    const allData = { ...savedData, ...formData };
    
    console.log('Data being sent to the backend:', allData);
    try {
      // Use the apiPost function from your api.js
      const result = await apiPost('/api/trip/add-trip/', allData);
      
      // Store the trip data for use in itinerary
      localStorage.setItem('currentTrip', JSON.stringify(result.data));
      router.push(`/trip/itinerary`);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to create trip. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        travel_preferences: checked
          ? [...prev.travel_preferences, value]
          : prev.travel_preferences.filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Cloud className="w-8 h-8 text-orange-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Final Preferences
        </h1>
        <p className="text-gray-600">Customize your perfect trip</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Weather Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <Cloud className="w-5 h-5 inline mr-2 text-blue-500" />
            Preferred Weather?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {WEATHER_OPTIONS.map(weather => (
              <label
                key={weather.id}
                className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                  formData.weather_preference === weather.id
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="radio"
                  name="weather_preference"
                  value={weather.id}
                  checked={formData.weather_preference === weather.id}
                  onChange={handleInputChange}
                  required
                  className="sr-only"
                />
                <span className="text-2xl mb-2">{weather.emoji}</span>
                <span className="text-sm text-gray-900 text-center">{weather.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Transport Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <Route className="w-5 h-5 inline mr-2 text-green-500" />
            How do you want to travel?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {TRANSPORT_OPTIONS.map(transport => {
              const IconComponent = transport.icon;
              return (
                <label
                  key={transport.id}
                  className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    formData.mode_of_transport === transport.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="mode_of_transport"
                    value={transport.id}
                    checked={formData.mode_of_transport === transport.id}
                    onChange={handleInputChange}
                    required
                    className="sr-only"
                  />
                  {transport.icon ? (
                    <IconComponent className={`w-8 h-8 mb-2 ${transport.color}`} />
                  ) : (
                    <span className="text-2xl mb-2">{transport.emoji}</span>
                  )}
                  <span className="text-sm text-gray-900">{transport.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Travel Preferences */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            🌟 What are you interested in?
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {TRAVEL_PREFERENCES.map(pref => (
              <label key={pref} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  name="travel_preferences"
                  value={pref}
                  checked={formData.travel_preferences.includes(pref)}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 mr-2"
                />
                <span className="text-sm text-gray-700">{pref}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="bg-blue-50 rounded-xl p-6">
          <label className="block text-sm font-medium text-blue-700 mb-4">
            <DollarSign className="w-5 h-5 inline mr-2" />
            What&apos;s your budget? (USD)
          </label>
          <div className="space-y-4">
            <input
              type="range"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              min="500"
              max="10000"
              step="500"
              className="w-full"
            />
            <div className="text-center">
              <span className="text-3xl font-bold text-blue-600">
                ${Number(formData.budget).toLocaleString()}
              </span>
              <div className="flex justify-between text-xs text-blue-500 mt-2">
                <span>$500</span>
                <span>$10,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex space-x-4 pt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-xl hover:bg-gray-300"
          >
            ← Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-orange-600 text-white py-3 px-6 rounded-xl hover:bg-orange-700 font-semibold"
          >
            🎉 Create My Trip!
          </button>
        </div>
      </form>
    </div>
  );
}