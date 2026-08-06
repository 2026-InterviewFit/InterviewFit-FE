import { create } from "zustand";
import type {
  DocumentAnalysisStatus,
  Slide,
  DocumentSummary,
  PtQuestion,
  PtInterviewMeta,
} from "@/types/ptInterview";
import {
  MOCK_SLIDES,
  MOCK_DOC_SUMMARY,
  MOCK_PT_QUESTIONS,
} from "@/lib/ptInterviewData";

interface CreateForm {
  job: string;
  topic: string;
  instruction: string;
  prepMinutes: number;
  limitMinutes: number;
  file: File | null;
}

interface PtState {
  form: CreateForm;
  meta: PtInterviewMeta | null;

  analysisStatus: DocumentAnalysisStatus;
  analysisProgress: number; // 0~100
  slides: Slide[];
  docSummary: DocumentSummary | null;

  currentSlideIdx: number;

  questions: PtQuestion[];
  currentQuestionIdx: number;
}

interface PtActions {
  setForm: (patch: Partial<CreateForm>) => void;
  resetForm: () => void;
  createInterview: () => string;
  runDocumentAnalysis: () => void;
  loadFallbackDocument: () => void;
  setCurrentSlideIdx: (i: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  loadQuestions: () => void;
  setCurrentQuestionIdx: (v: number | ((p: number) => number)) => void;
  reset: () => void;
}

const initialForm: CreateForm = {
  job: "백엔드",
  topic: "",
  instruction: "",
  prepMinutes: 3,
  limitMinutes: 5,
  file: null,
};

const initialState: PtState = {
  form: initialForm,
  meta: null,
  analysisStatus: "UPLOADED",
  analysisProgress: 0,
  slides: [],
  docSummary: null,
  currentSlideIdx: 0,
  questions: [],
  currentQuestionIdx: 0,
};

// 분석 시뮬레이션 타이머 (모듈 스코프에 두어 중복 실행 방지)
let analysisTimer: ReturnType<typeof setInterval> | null = null;

export const usePtInterviewStore = create<PtState & PtActions>((set, get) => ({
  ...initialState,

  setForm: (patch) => set((s) => ({ form: { ...s.form, ...patch } })),
  resetForm: () => set({ form: initialForm }),

  createInterview: () => {
    const { form } = get();
    const id = `pt_${Date.now()}`;
    const file = form.file;

    const meta: PtInterviewMeta = {
      ptInterviewId: id,
      job: form.job,
      topic: form.topic,
      instruction: form.instruction,
      prepSeconds: form.prepMinutes * 60,
      limitSeconds: form.limitMinutes * 60,
      fileName: file?.name ?? "발표자료.pdf",
      fileSize: file?.size ?? 0,
      fileType: file?.type ?? "application/pdf",
      status: "UPLOADED",
    };

    set({
      meta,
      analysisStatus: "UPLOADED",
      analysisProgress: 0,
      slides: [],
      docSummary: null,
      currentSlideIdx: 0,
    });
    return id;
  },

  // 문서 분석 진행 시뮬레이션: UPLOADED → EXTRACTING → ANALYZING → DONE
  runDocumentAnalysis: () => {
    if (analysisTimer) clearInterval(analysisTimer);
    set({ analysisStatus: "EXTRACTING", analysisProgress: 8 });

    analysisTimer = setInterval(() => {
      const { analysisProgress } = get();
      const next = Math.min(analysisProgress + Math.floor(Math.random() * 9) + 4, 100);

      let status: DocumentAnalysisStatus = "EXTRACTING";
      if (next >= 40 && next < 92) status = "ANALYZING";

      if (next >= 100) {
        if (analysisTimer) clearInterval(analysisTimer);
        analysisTimer = null;
        set((s) => ({
          analysisProgress: 100,
          analysisStatus: "DONE",
          slides: MOCK_SLIDES,
          docSummary: MOCK_DOC_SUMMARY,
          meta: s.meta ? { ...s.meta, status: "DONE" } : s.meta,
        }));
        return;
      }
      set({ analysisProgress: next, analysisStatus: status });
    }, 700);
  },

  // 직접 URL 진입/새로고침으로 store가 빈 경우 데모용 데이터 주입
  loadFallbackDocument: () => {
    if (get().slides.length === 0) {
      set({
        slides: MOCK_SLIDES,
        docSummary: MOCK_DOC_SUMMARY,
        analysisStatus: "DONE",
        analysisProgress: 100,
      });
    }
  },

  setCurrentSlideIdx: (i) => set({ currentSlideIdx: i }),
  nextSlide: () =>
    set((s) => ({
      currentSlideIdx: Math.min(s.currentSlideIdx + 1, Math.max(s.slides.length - 1, 0)),
    })),
  prevSlide: () =>
    set((s) => ({ currentSlideIdx: Math.max(s.currentSlideIdx - 1, 0) })),

  loadQuestions: () => {
    if (get().questions.length === 0) {
      set({ questions: MOCK_PT_QUESTIONS, currentQuestionIdx: 0 });
    }
  },
  setCurrentQuestionIdx: (v) =>
    set((s) => ({
      currentQuestionIdx: typeof v === "function" ? v(s.currentQuestionIdx) : v,
    })),

  reset: () => {
    if (analysisTimer) clearInterval(analysisTimer);
    analysisTimer = null;
    set(initialState);
  },
}));