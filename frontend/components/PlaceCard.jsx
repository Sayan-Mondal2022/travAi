// components/PlaceCard.jsx
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

export default function PlaceCard({ image, name, description, rating, duration }) {
  // Create a URL-friendly slug from the name
  const slug = name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  return (
    <Link href={`/itinerary/${slug}`} passHref>
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group">
        {/* Image */}
        <div className="relative w-full h-48">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h2>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {description}
          </p>

          {/* Ratings + Duration */}
          <div className="flex items-center justify-between">
            {/* Rating */}
            <div className="flex items-center gap-1 text-yellow-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  fill={i < rating ? "currentColor" : "none"}
                  stroke="currentColor"
                />
              ))}
              <span className="ml-1 text-gray-700 text-sm">{rating}/5</span>
            </div>

            {/* Duration */}
            <span className="text-sm font-medium text-gray-700">
              {duration.days}D / {duration.nights}N
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}