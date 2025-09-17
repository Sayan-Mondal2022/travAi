// app/trip/group-details/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Users, Baby, Dog } from 'lucide-react';

export default function GroupDetailsStep() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    people_count: 1,
    has_elderly: false,
    has_children: false,
    has_pets: false,
    children_count: 0,
    pets_count: 0
  });

  useEffect(() => {
    // Load previous data
    const savedData = localStorage.getItem('tripData');
    if (savedData) {
      setFormData(prev => ({ ...prev, ...JSON.parse(savedData) }));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save data
    const allData = { ...JSON.parse(localStorage.getItem('tripData')), ...formData };
    localStorage.setItem('tripData', JSON.stringify(allData));
    router.push('/trip/preferences');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : Number(value)
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tell us about your group
        </h1>
        <p className="text-gray-600">Help us customize your experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* People Count */}
        <div className="bg-gray-50 rounded-xl p-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            <User className="w-5 h-5 inline mr-2 text-blue-500" />
            How many people total?
          </label>
          <div className="flex items-center justify-center space-x-4">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, people_count: Math.max(1, prev.people_count - 1) }))}
              className="w-12 h-12 bg-gray-200 rounded-full text-2xl font-bold hover:bg-gray-300"
            >
              -
            </button>
            <span className="text-4xl font-bold text-blue-600 min-w-[3rem] text-center">
              {formData.people_count}
            </span>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, people_count: prev.people_count + 1 }))}
              className="w-12 h-12 bg-gray-200 rounded-full text-2xl font-bold hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>

        {/* Special Considerations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer">
            <input
              type="checkbox"
              name="has_elderly"
              checked={formData.has_elderly}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 mr-3"
            />
            <div>
              <span className="block font-medium text-gray-900">Elderly people</span>
              <span className="text-sm text-gray-500">65+ years old</span>
            </div>
          </label>

          <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer">
            <input
              type="checkbox"
              name="has_children"
              checked={formData.has_children}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 mr-3"
            />
            <div>
              <span className="block font-medium text-gray-900">Children</span>
              <span className="text-sm text-gray-500">Under 12 years</span>
            </div>
          </label>

          <label className="flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer">
            <input
              type="checkbox"
              name="has_pets"
              checked={formData.has_pets}
              onChange={handleInputChange}
              className="w-5 h-5 text-blue-600 mr-3"
            />
            <div>
              <span className="block font-medium text-gray-900">Pets</span>
              <span className="text-sm text-gray-500">Bringing furry friends</span>
            </div>
          </label>
        </div>

        {/* Conditional Fields */}
        {formData.has_children && (
          <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
            <label className="block text-sm font-medium text-yellow-700 mb-3">
              <Baby className="w-5 h-5 inline mr-2" />
              How many children?
            </label>
            <input
              type="number"
              name="children_count"
              value={formData.children_count}
              onChange={handleInputChange}
              min="0"
              max="10"
              className="w-full px-4 py-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        )}

        {formData.has_pets && (
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <label className="block text-sm font-medium text-green-700 mb-3">
              <Dog className="w-5 h-5 inline mr-2" />
              How many pets?
            </label>
            <input
              type="number"
              name="pets_count"
              value={formData.pets_count}
              onChange={handleInputChange}
              min="0"
              max="5"
              className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>
        )}

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
            className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-xl hover:bg-purple-700"
          >
            Next → Preferences
          </button>
        </div>
      </form>
    </div>
  );
}