// components/WhyChooseCard.jsx
import Image from "next/image";

export default function WhyChooseCard({ image, title, description, reverse = false }) {
  return (
    <div
      className={`flex flex-col md:flex-row items-center gap-8 p-6 rounded-2xl shadow-lg bg-white ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Image Section */}
      <div className="w-full md:w-1/2">
        <Image
          src={image}
          alt={title}
          width={500}
          height={300}
          className="rounded-xl object-cover"
        />
      </div>

      {/* Text Section */}
      <div className="w-full md:w-1/2 text-center md:text-left">
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
