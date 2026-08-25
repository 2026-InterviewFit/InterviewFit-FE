"use client";

export default function CommunityHero() {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative w-full bg-blue-600 pt-40 pb-32 px-6 overflow-hidden">
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg className="relative block w-full h-[100px] text-bg dark:text-navy-dark" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C59.71,118.08,130.83,120.22,190.61,109.11,234.34,101.44,278.43,77.78,321.39,56.44Z" fill="currentColor"></path>
        </svg>
      </div>
      
      <div className="relative z-10 mx-auto max-w-[1280px] text-center flex flex-col items-center">
        <span className="inline-block px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold tracking-widest mb-6 backdrop-blur-md">
          INTERVIEW FIT COMMUNITY
        </span>
        <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
          면접의 모든 것을 공유하는<br />집단지성 공간
        </h1>
        <p className="text-blue-100 text-lg md:text-xl max-w-2xl font-medium mb-10 break-keep">
          실제 면접에 출제된 기출문제를 위키에서 확인하고, 
          상위 1% 합격자들의 마스킹된 스크립트를 통해 나만의 답변을 완성하세요.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button onClick={() => scrollTo('wiki-section')} className="px-8 py-4 rounded-full bg-white text-blue-600 font-bold hover:scale-105 transition-transform shadow-lg cursor-pointer">
            기출문제 위키 탐색하기
          </button>
          <button onClick={() => scrollTo('feed-section')} className="px-8 py-4 rounded-full bg-blue-700 text-white font-bold hover:bg-blue-800 hover:scale-105 transition-all border border-blue-500 shadow-lg cursor-pointer">
            우수 답변 피드 보기
          </button>
        </div>
      </div>
    </section>
  );
}