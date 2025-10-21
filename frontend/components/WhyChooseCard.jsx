// components/WhyChooseCard.jsx
"use client";

import { motion } from "framer-motion";

export default function WhyChooseCard({ title, description, image, reverse = false }) {
  return (
    <motion.div
      className={`flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl shadow-lg bg-white border border-gray-200 
        ${reverse ? "md:flex-row-reverse" : ""}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Image Section */}
      <div className="w-full md:w-1/2 h-64 flex-shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover rounded-3xl hover:scale-105 transition-transform duration-300 cursor-pointer"
        />
      </div>

      {/* Text Section */}
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-gray-600 text-lg">{description}</p>
      </div>
    </motion.div>
  );
}
