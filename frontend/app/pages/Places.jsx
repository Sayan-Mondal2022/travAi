// pages/places.jsx
"use client";

import { useState, useEffect } from "react";
import PlaceCard from "@/components/PlaceCard";
import { motion, AnimatePresence } from "framer-motion";
import { trip_places } from "@/data/places"; // Import from data file

export default function ShowPlaces() {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 3) % trip_places.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [trip_places.length]);

  const visiblePlaces = [
    trip_places[startIndex],
    trip_places[(startIndex + 1) % trip_places.length],
    trip_places[(startIndex + 2) % trip_places.length],
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-center mb-10">Top Destinations</h1>
      <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AnimatePresence>
          {visiblePlaces.map((place, idx) => (
            <motion.div
              key={place.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              whileHover={{ y: -5 }}
            >
              <PlaceCard {...place} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}