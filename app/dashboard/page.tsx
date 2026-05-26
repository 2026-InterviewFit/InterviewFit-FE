import Navbar from "@/components/shared/Navbar";

const MOCK_PRACTICES = [
  {
    title: "자기소개 연습",
    date: "2일 전",
    score: 82,
  },
  {
    title: "지원동기 연습",
    date: "4일 전",
    score: 76,
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-bg">
      <Navbar variant="app" />

      <section className="mx-auto max-w-[1280px] px-8 py-14">
        <div>
          <p className="text-sm text-muted">
            INTERVIEW DASHBOARD
          </p>

          <h1 className="mt-3 font-serif text-6xl leading-tight tracking-tight text-ink">
            안녕하세요, 은재님 👋
          </h1>

          <p className="mt-4 max-w-xl text-base text-muted">
            오늘도 면접 감각을 끌어올려볼까요?
          </p>
        </div>

        <div className="mt-12 overflow-hidden rounded-[32px] border border-white/10 bg-navy-dark shadow-2xl">
          <div className="bg-gradient-to-br from-[#3a4d7a] via-[#1f2c46] to-[#0f1729] px-10 py-12">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Today&apos;s Practice
                </p>

                <h2 className="mt-4 font-serif text-5xl text-white">
                  면접 연습 시작하기
                </h2>

                <p className="mt-4 text-white/60">
                  2-3분이면 충분해요.
                </p>
              </div>

              <button className="rounded-full bg-white px-8 py-4 text-sm font-medium text-navy transition-transform hover:scale-[1.03]">
                시작하기 →
              </button>
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-5">
          <div className="rounded-[28px] border border-line bg-white p-8">
            <p className="text-sm text-muted">
              이번 주 연습
            </p>

            <div className="mt-4 font-serif text-5xl">
              5회
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-white p-8">
            <p className="text-sm text-muted">
              평균 시선 점수
            </p>

            <div className="mt-4 font-serif text-5xl">
              82
            </div>
          </div>

          <div className="rounded-[28px] border border-line bg-white p-8">
            <p className="text-sm text-muted">
              톤 안정도
            </p>

            <div className="mt-4 font-serif text-5xl">
              Good
            </div>
          </div>
        </div>

        <section className="mt-14">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-ink">
              최근 연습
            </h3>

            <button className="text-sm text-muted">
              전체보기
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {MOCK_PRACTICES.map((practice) => (
              <div
                key={practice.title}
                className="flex items-center justify-between rounded-[24px] border border-line bg-white px-6 py-5"
              >
                <div>
                  <h4 className="font-medium text-ink">
                    {practice.title}
                  </h4>

                  <p className="mt-1 text-sm text-muted">
                    {practice.date}
                  </p>
                </div>

                <div className="font-serif text-3xl text-navy">
                  {practice.score}
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}