import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/landing/Hero";
import HeroCard from "@/components/landing/HeroCard";
import TrustedLogos from "@/components/landing/TrustedLogos";

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-bg">
      <Navbar variant="default" />
      <Hero />
      <HeroCard />
      <TrustedLogos />
    </main>
  );
}