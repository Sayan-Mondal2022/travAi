import WhyChooseCard from "@/components/WhyChooseCard";

export default function Describe() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-center mb-10">
        Why Choose Our Platform?
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <WhyChooseCard
          image="/images/ai-chatbot.jpg"
          title="Smart AI Travel Buddy"
          description="Get instant travel advice, local recommendations, translations, and real-time support with our AI-powered assistant."
        />
        <WhyChooseCard
          image="/images/itinerary.jpg"
          title="Dynamic Itinerary"
          description="Your trip plan adapts in real-time based on location, weather, and time spent—so you enjoy a flexible journey."
        />
        <WhyChooseCard
          image="/images/scenic-routes.jpg"
          title="Scenic Routes, Not Just Shortcuts"
          description="Choose between fastest or most scenic routes—ghat roads, coastal drives, and forest trails for memorable journeys."
        />
      </div>
    </section>
  );
}
