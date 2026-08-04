// app/page.tsx
import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/landing/Hero";
import IntroSection from "@/components/landing/IntroSection";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full font-sans bg-bg transition-colors duration-300">
      <Navbar />

      <div className="flex flex-col w-full relative">
        <Hero />
        <IntroSection />
      </div>

      <Footer />
    </main>
  );
}