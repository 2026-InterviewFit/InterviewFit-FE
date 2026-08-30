import { BrainCircuit, CheckCircle2, TriangleAlert } from "lucide-react";
import { externalAiAnalysisView } from "@/lib/externalAiAnalysis";
import type { ExternalAiAnalysis } from "@/types";

interface ExternalAiAnalysisCardProps {
  analysis?: ExternalAiAnalysis | null;
}

export default function ExternalAiAnalysisCard({ analysis }: ExternalAiAnalysisCardProps) {
  if (!analysis) return null;

  const view = externalAiAnalysisView(analysis);

  return (
    <section className="flex w-full flex-col gap-5 rounded-[24px] border border-indigo-100 bg-white p-6 shadow-sm dark:border-indigo-900/40 dark:bg-[#1e293b]">
      <div className="flex items-center gap-2">
        <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
          <BrainCircuit className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-base font-bold text-navy dark:text-white">학습 AI 추가 분석</h4>
          <p className="mt-0.5 text-xs text-muted">기존 AI 평가와 별도로 제공되는 분석입니다.</p>
        </div>
      </div>

      <div>
        <h5 className="mb-3 text-sm font-bold text-navy dark:text-white">STAR 분석</h5>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {view.star.map((item) => (
            <div key={item.key} className="rounded-xl border border-black/5 bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-800/50">
              <p className="text-xs font-bold text-indigo-600 dark:text-indigo-300">{item.label}</p>
              <p className="mt-2 text-sm font-medium leading-relaxed text-ink dark:text-slate-300">
                {item.value ?? "분석 결과가 없습니다."}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AnalysisList
          title="강점"
          items={view.strengths}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          emptyText="분석된 강점이 없습니다."
        />
        <AnalysisList
          title="개선점"
          items={view.improvements}
          icon={<TriangleAlert className="h-4 w-4 text-amber-500" />}
          emptyText="분석된 개선점이 없습니다."
        />
      </div>
    </section>
  );
}

function AnalysisList({
  title,
  items,
  icon,
  emptyText,
}: {
  title: string;
  items: string[];
  icon: React.ReactNode;
  emptyText: string;
}) {
  return (
    <div className="rounded-xl border border-black/5 bg-slate-50 p-4 dark:border-white/5 dark:bg-slate-800/50">
      <h5 className="flex items-center gap-2 text-sm font-bold text-navy dark:text-white">{icon}{title}</h5>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-relaxed text-ink dark:text-slate-300">
              <span aria-hidden="true">•</span><span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted">{emptyText}</p>
      )}
    </div>
  );
}
