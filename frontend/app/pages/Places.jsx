// app/pages/places.jsx
"use client";

import { useState, useEffect } from "react";
import PlaceCard from "@/components/PlaceCard";
import { motion, AnimatePresence } from "framer-motion";
import { trip_places } from "@/data/places";

export default function ShowPlaces() {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 3) % trip_places.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const visiblePlaces = [
    trip_places[startIndex],
    trip_places[(startIndex + 1) % trip_places.length],
    trip_places[(startIndex + 2) % trip_places.length],
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        ease: "easeOut",
      },
    },
    exit: { opacity: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -40, scale: 0.95, transition: { duration: 0.4 } },
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-center mb-10">Top Destinations</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={startIndex} 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className="contents"
          >
            {visiblePlaces.map((place) => (
              <motion.div
                key={place.id}
                variants={cardVariants}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <PlaceCard {...place} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
