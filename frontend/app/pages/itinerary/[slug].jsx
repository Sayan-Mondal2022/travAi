// pages/itinerary/[slug].jsx
import { useRouter } from 'next/router';
import { trip_places } from '@/data/places';
import { ArrowLeft, MapPin, Calendar, DollarSign, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ItineraryPage() {
  const router = useRouter();
  const { slug } = router.query;

  // Find the place that matches the slug
  const place = trip_places.find(p => 
    p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug
  );

  if (!place) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Package Not Found</h1>
          <Link href="/places" className="text-blue-600 hover:underline">
            ← Back to Packages
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/places" className="inline-flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft size={20} className="mr-2" />
            Back to Packages
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={place.image}
          alt={place.name}
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">{place.name}</h1>
            <p className="text-xl">{place.description}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Package Details */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <Calendar className="mx-auto mb-4 text-blue-600" size={32} />
            <h3 className="font-semibold mb-2">Duration</h3>
            <p className="text-2xl font-bold">{place.duration.days} Days / {place.duration.nights} Nights</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <DollarSign className="mx-auto mb-4 text-green-600" size={32} />
            <h3 className="font-semibold mb-2">Price</h3>
            <p className="text-2xl font-bold">{place.price}</p>
            <p className="text-sm text-gray-600">per person</p>
          </div>
          
          <div className="text-center p-6 bg-white rounded-lg shadow">
            <MapPin className="mx-auto mb-4 text-red-600" size={32} />
            <h3 className="font-semibold mb-2">Rating</h3>
            <p className="text-2xl font-bold">{place.rating}/5</p>
            <p className="text-sm text-gray-600">Customer Reviews</p>
          </div>
        </div>

        {/* Itinerary */}
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Detailed Itinerary</h2>
          <div className="space-y-4">
            {place.itinerary.map((day, index) => (
              <div key={index} className="flex items-start">
                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-700">{day}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">What's Included</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {place.includes.map((item, index) => (
              <div key={index} className="flex items-center">
                <CheckCircle className="text-green-500 mr-3" size={20} />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-full text-lg transition-colors">
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}