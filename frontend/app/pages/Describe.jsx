//app/pages/Describe.jsx
import WhyChooseCard from "@/components/WhyChooseCard";

const whyChooseData = [
  {
    title: "Seamless Travel Planning",
    description:
      "Say goodbye to endless tabs and scattered notes. Our platform brings everything you need into one place—search destinations, explore attractions, and build your entire trip plan effortlessly. With real-time weather, maps, and transport details, planning becomes as exciting as the journey itself.",
    image: "/images/travel.jpg",
  },
  {
    title: "Smart Budgeting",
    description:
      "Travel without the stress of overspending. Set your budget once, and our system helps you allocate expenses for accommodation, food, activities, and shopping. Get instant insights, cost comparisons, and money-saving recommendations so you enjoy more while spending less.",
    image: "/images/budget.jpg",
  },
  {
    title: "Personalized Itineraries",
    description:
      "No more cookie-cutter travel plans. Our AI curates day-by-day itineraries tailored to your preferences—whether you’re into history, adventure, food, or relaxation. Adjust on the go with smart suggestions for nearby spots, hidden gems, and experiences that truly match your vibe.",
    image: "/images/itinerary.jpg",
  },
];


export default function WhyChooseSection() {
  return (
    <>
    <section className="max-w-7xl mx-auto px-6 py-12 space-y-12">
      <h1 className="text-3xl font-bold text-center mb-10">
        Why Choose Our Platform?
     </h1>

      {whyChooseData.map((item, idx) => (
        <WhyChooseCard
          key={idx}
          {...item}
          reverse={idx % 2 !== 0} // 👈 automatically alternates layout
        />
      ))}
    </section>
    </>
  );
}