import Navbar from "@/components/shared/Navbar";
import Hero from "@/components/landing/Hero";
import IntroSection from "@/components/landing/IntroSection";
// ❌ StatsBanner import 삭제 완료!
import BoardSection from "@/components/landing/BoardingSection";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <main className="min-h-screen w-full font-sans bg-white">
      <Navbar />

      <div className="flex flex-col w-full">
        <Hero />
        <IntroSection />
        {/* ❌ <StatsBanner /> 삭제 완료! */}
        
        {/* BoardSection(공지사항) 위아래에 숨통 트이는 여백(py-24) 추가 */}
        <div className="py-24 w-full bg-white">
          <BoardSection />
        </div>
      </div>

      <Footer />
    </main>
  );
}