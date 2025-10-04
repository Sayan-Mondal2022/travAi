import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
// import HalfGlobe from "@/components/HalfGlobe";  // removed
import Describe from "./pages/Describe";
import Places from "./pages/Places";
import Footer from "./pages/Footer"

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      {/* <HalfGlobe /> removed */}
      <Describe />
      <Places />
      <Footer />
    </>
  );
}

