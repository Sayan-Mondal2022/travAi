"use client";
import { useState, useEffect } from "react";

export function PhotoCarousel({ photos }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!photos || photos.length === 0) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % photos.length);
    }, 20000); // Switch photo every 20s

    return () => clearInterval(interval);
  }, [photos]);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
        No Photos
      </div>
    );
  }

  // Secure server-side image fetch
  const convert = (photoName) =>
    `/api/photo?name=${encodeURIComponent(photoName)}`;

  return (
    <div className="w-full h-40 overflow-hidden rounded-lg">
      <img
        src={convert(photos[index])}
        alt="photo"
        className="w-full h-40 object-cover rounded-lg transition-all duration-700"
      />
    </div>
  );
}
