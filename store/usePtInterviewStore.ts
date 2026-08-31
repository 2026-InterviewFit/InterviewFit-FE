import { create } from "zustand";

import type {
  DocumentAnalysisStatus,
  Slide,
  DocumentSummary,
  PtQuestion,
  PtInterviewMeta,
} from "@/types/ptInterview";

import {
  createPtInterview,
  uploadPtDocument,
  getPtDocument,
} from "@/lib/api";

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
  analysisProgress: number;

  slides: Slide[];
  docSummary: DocumentSummary | null;

  currentSlideIdx: number;

  questions: PtQuestion[];
  currentQuestionIdx: number;

  isCreating: boolean;
  isUploading: boolean;
  isLoadingDocument: boolean;

  error: string | null;
}

interface PtActions {
  setForm: (patch: Partial<CreateForm>) => void;
  resetForm: () => void;

  createInterview: (interviewId: number) => Promise<number>;
  uploadDocument: (ptInterviewId: number) => Promise<void>;
  fetchDocument: (ptInterviewId: number) => Promise<void>;

  setCurrentSlideIdx: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;

  setQuestions: (questions: PtQuestion[]) => void;
  setCurrentQuestionIdx: (
    value: number | ((previous: number) => number)
  ) => void;

  clearError: () => void;
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

  isCreating: false,
  isUploading: false,
  isLoadingDocument: false,

  error: null,
};

function normalizeAnalysisStatus(
  status?: string | null
): DocumentAnalysisStatus {
  switch (status?.toUpperCase()) {
    case "UPLOADED":
      return "UPLOADED";

    case "EXTRACTING":
    case "PROCESSING":
      return "EXTRACTING";

    case "ANALYZING":
      return "ANALYZING";

    case "DONE":
    case "COMPLETED":
    case "SUCCESS":
      return "DONE";

    case "FAILED":
    case "ERROR":
      return "FAILED";

    default:
      return "UPLOADED";
  }
}

function getAnalysisProgress(status: DocumentAnalysisStatus): number {
  switch (status) {
    case "UPLOADED":
      return 10;

    case "EXTRACTING":
      return 40;

    case "ANALYZING":
      return 75;

    case "DONE":
      return 100;

    case "FAILED":
      return 0;
  }
}

function getErrorMessage(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
}

export const usePtInterviewStore = create<PtState & PtActions>(
  (set, get) => ({
    ...initialState,

    setForm: (patch) =>
      set((state) => ({
        form: {
          ...state.form,
          ...patch,
        },
      })),

    resetForm: () =>
      set({
        form: {
          ...initialForm,
        },
      }),

    createInterview: async (interviewId) => {
      const { form } = get();

      if (!interviewId || interviewId <= 0) {
        throw new Error("유효한 면접 ID가 필요합니다.");
      }

      if (!form.topic.trim()) {
        throw new Error("발표 주제를 입력해 주세요.");
      }

      if (!form.file) {
        throw new Error("발표 자료를 선택해 주세요.");
      }

      set({
        isCreating: true,
        error: null,
      });

      try {
        const response = await createPtInterview({
          interviewId,
          topic: form.topic.trim(),
          instruction: form.instruction.trim(),
          preparationSeconds: form.prepMinutes * 60,
          presentationSeconds: form.limitMinutes * 60,
        });

        const status = normalizeAnalysisStatus(response.status);

        const meta: PtInterviewMeta = {
          ptInterviewId: response.id,
          job: form.job,
          topic: response.topic,
          instruction: response.instruction,
          prepSeconds: response.preparationSeconds,
          limitSeconds: response.presentationSeconds,
          fileName: form.file.name,
          fileSize: form.file.size,
          fileType: form.file.type,
          status,
        };

        set({
          meta,
          analysisStatus: status,
          analysisProgress: 0,
          slides: [],
          docSummary: null,
          currentSlideIdx: 0,
          questions: [],
          currentQuestionIdx: 0,
        });

        return response.id;
      } catch (error) {
        const message = getErrorMessage(
          error,
          "PT 면접 생성에 실패했습니다."
        );

        set({ error: message });
        throw error;
      } finally {
        set({ isCreating: false });
      }
    },

    uploadDocument: async (ptInterviewId) => {
      const { form } = get();

      if (!ptInterviewId || ptInterviewId <= 0) {
        throw new Error("유효한 PT 면접 ID가 필요합니다.");
      }

      if (!form.file) {
        throw new Error("업로드할 발표 자료가 없습니다.");
      }

      set({
        isUploading: true,
        error: null,
        analysisStatus: "UPLOADED",
        analysisProgress: 10,
      });

      try {
        const response = await uploadPtDocument(
          ptInterviewId,
          form.file
        );

        const status = normalizeAnalysisStatus(
          response.analysisStatus
        );

        set((state) => ({
          analysisStatus: status,
          analysisProgress: getAnalysisProgress(status),

          meta: state.meta
            ? {
                ...state.meta,
                ptInterviewId: response.ptInterviewId,
                fileName: response.originalFileName,
                fileSize: form.file?.size ?? state.meta.fileSize,
                fileType: form.file?.type ?? state.meta.fileType,
                status,
              }
            : null,
        }));
      } catch (error) {
        const message = getErrorMessage(
          error,
          "PT 발표 자료 업로드에 실패했습니다."
        );

        set({
          error: message,
          analysisStatus: "FAILED",
          analysisProgress: 0,
        });

        throw error;
      } finally {
        set({ isUploading: false });
      }
    },

    fetchDocument: async (ptInterviewId) => {
      if (!ptInterviewId || ptInterviewId <= 0) {
        throw new Error("유효한 PT 면접 ID가 필요합니다.");
      }

      set({
        isLoadingDocument: true,
        error: null,
      });

      try {
        const response = await getPtDocument(ptInterviewId);

        const status = normalizeAnalysisStatus(
          response.analysisStatus
        );

        const slides: Slide[] = response.slides.map((slide) => ({
          slideNumber: slide.slideNumber,

          thumbnailUrl: slide.imageObjectKey
            ? `http://localhost:8080/api/pt-interviews/${ptInterviewId}/slides/${slide.slideNumber}/image`
            : undefined,

          title: slide.title ?? "",
          body: slide.extractedText ?? "",
          aiSummary: slide.summary ?? "",
        }));

        set((state) => ({
          analysisStatus: status,
          analysisProgress: getAnalysisProgress(status),
          slides,
          docSummary: null,
          currentSlideIdx: 0,

          meta: state.meta
            ? {
                ...state.meta,
                ptInterviewId: response.ptInterviewId,
                fileName: response.originalFileName,
                fileSize: response.fileSize,
                fileType: response.contentType,
                status,
              }
            : null,
        }));
      } catch (error) {
        const message = getErrorMessage(
          error,
          "PT 발표 자료 조회에 실패했습니다."
        );

        set({
          error: message,
          analysisStatus: "FAILED",
          analysisProgress: 0,
        });

        throw error;
      } finally {
        set({ isLoadingDocument: false });
      }
    },

    setCurrentSlideIdx: (index) =>
      set((state) => ({
        currentSlideIdx: Math.max(
          0,
          Math.min(index, Math.max(state.slides.length - 1, 0))
        ),
      })),

    nextSlide: () =>
      set((state) => ({
        currentSlideIdx: Math.min(
          state.currentSlideIdx + 1,
          Math.max(state.slides.length - 1, 0)
        ),
      })),

    prevSlide: () =>
      set((state) => ({
        currentSlideIdx: Math.max(state.currentSlideIdx - 1, 0),
      })),

    setQuestions: (questions) =>
      set({
        questions,
        currentQuestionIdx: 0,
      }),

    setCurrentQuestionIdx: (value) =>
      set((state) => ({
        currentQuestionIdx:
          typeof value === "function"
            ? value(state.currentQuestionIdx)
            : value,
      })),

    clearError: () => set({ error: null }),

    reset: () =>
      set({
        ...initialState,
        form: {
          ...initialForm,
        },
      }),
  })
);