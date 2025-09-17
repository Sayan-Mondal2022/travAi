import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Describe from "./pages/Describe";
import Places from "./pages/Places";

export default function Home() {
  return (
    <>
      <Navbar/>
      <Hero/>
      <Describe/>
      <Places/>
    </>
  );
}
