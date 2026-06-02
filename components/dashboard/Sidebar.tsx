export default function Sidebar() {
  return (
    <aside className="flex w-[240px] flex-col border-r border-black/5 bg-white px-6 py-8">

      <h1 className="text-2xl font-semibold tracking-tight">
        InterviewFit
      </h1>

      <nav className="mt-10 flex flex-col gap-2">

        <button className="rounded-xl bg-black px-4 py-3 text-left text-sm font-medium text-white">
          대시보드
        </button>

        <button className="rounded-xl px-4 py-3 text-left text-sm font-medium text-black/70 transition-colors hover:bg-black/5">
          면접 연습
        </button>

        <button className="rounded-xl px-4 py-3 text-left text-sm font-medium text-black/70 transition-colors hover:bg-black/5">
          분석 리포트
        </button>

        <button className="rounded-xl px-4 py-3 text-left text-sm font-medium text-black/70 transition-colors hover:bg-black/5">
          설정
        </button>

      </nav>
    </aside>
  );
}