import { getHouses, type House } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import HomeClient from "@/components/HomeClient";

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  let houses: House[] = [];
  try {
    houses = await getHouses();
  } catch {
    // Backend not available yet – show empty state
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <HomeClient houses={houses} />
      </main>
      <Footer />
    </>
  );
}
