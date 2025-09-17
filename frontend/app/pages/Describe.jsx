import WhyChooseCard from "@/components/WhyChooseCard";

export default function Describe(){
    return (
        <section className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold text-center mb-10">
          Why Choose Our Platform?
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <WhyChooseCard
            image="/images/travel.jpg"
            title="Smart Trip Planning"
            description="Plan your trips effortlessly with AI-powered itineraries, saving time and maximizing fun."
          />
          <WhyChooseCard
            image="/images/why-choose.png"
            title="Seamless Experience"
            description="Enjoy a smooth and intuitive interface that helps you focus on your journey, not the hassle."
          />
          <WhyChooseCard
            image="/images/why-choose.png"
            title="Seamless Experience"
            description="Enjoy a smooth and intuitive interface that helps you focus on your journey, not the hassle."
          />
        </div>
      </section>
    )
}