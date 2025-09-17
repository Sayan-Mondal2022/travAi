import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Describe from "./pages/Describe";
import Places from "./pages/Places";
import Footer from "./pages/Footer";

export default function Home() {
  return (
    <>
      <Navbar/>
      <Hero/>
      <Describe/>
      <Places/>
      <Footer/>
    </>
  );
}
