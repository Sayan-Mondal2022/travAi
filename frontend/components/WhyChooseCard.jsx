// components/WhyChooseCard.jsx
export default function WhyChooseCard({ title, description, reverse = false }) {
  return (
    <div
      className={`flex flex-col md:flex-row items-center gap-8 p-6 rounded-2xl shadow-lg bg-white ${
        reverse ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Text Section */}
      <div className="w-full text-center md:text-left">
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}
