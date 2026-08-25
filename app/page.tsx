import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/landing/Hero";
import IntroSection from "@/components/landing/IntroSection";
import BoardSection from "@/components/landing/BoardingSection";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full font-sans bg-bg transition-colors duration-300">
      <Navbar />

      <div className="flex flex-col w-full">
        <Hero />
        <IntroSection />
        
        {/* 💡 py-24 였던 여백을 py-8 로 줄여서 거리를 좁혔습니다! */}
        <div className="py-8 w-full bg-bg transition-colors duration-300">
          <BoardSection />
        </div>
      </div>

      <Footer />
    </main>
  );
}