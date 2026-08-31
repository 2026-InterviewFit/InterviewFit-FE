import type {
  AnswerReport,
  EyeReport,
  GazeReport,
  PoseReport,
  SpeechReport,
} from "@/types";
import type { GroupInterviewAnswerAnalysis } from "@/types/groupInterview";

type JsonObject = Record<string, unknown>;

interface PoseSample {
  timestamp: number;
  shoulderStatus: string;
  faceStatus: string;
}

const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function parseObject(value: string | null): JsonObject | null {
  if (!value) return null;
  try {
    let parsed: unknown = JSON.parse(value);
    // 일부 분석 서버 응답은 JSON 문자열을 한 번 더 직렬화해 전달한다.
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    if (!isObject(parsed)) return null;
    const nested = parsed.result ?? parsed.data;
    return isObject(nested) ? { ...parsed, ...nested } : parsed;
  } catch {
    return null;
  }
}

function parsePoseResult(value: string | null): JsonObject | unknown[] | null {
  if (!value) return null;
  try {
    let parsed: unknown = JSON.parse(value);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    if (Array.isArray(parsed)) return parsed;
    if (!isObject(parsed)) return null;
    const nested = parsed.result ?? parsed.data;
    if (Array.isArray(nested)) return nested;
    return isObject(nested) ? { ...parsed, ...nested } : parsed;
  } catch {
    return null;
  }
}

const pick = (value: JsonObject | null, ...keys: string[]) => {
  for (const key of keys) {
    const candidate = value?.[key];
    if (candidate !== undefined && candidate !== null) return candidate;
  }
  return undefined;
};

const numberValue = (value: unknown, fallback = Number.NaN) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const stringValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

function toSpeechReport(
  analysis: GroupInterviewAnswerAnalysis,
  speech: JsonObject | null,
  ai: JsonObject | null,
): SpeechReport | null {
  if (
    !analysis.speechText
    && !speech
    && !ai
    && !analysis.externalAiAnalysis
    && analysis.speechScore == null
    && analysis.speechScoreStatus == null
    && analysis.speechScoreReason == null
  ) return null;

  const speechPace = pick(speech, "speech_pace_analysis", "speechPaceAnalysis");
  const silence = pick(speech, "silence_analysis", "silenceAnalysis");
  const fillerWords = pick(speech, "filler_word_analysis", "fillerWordAnalysis");
  const speechAi = pick(speech, "ai_evaluation", "aiEvaluation");
  const speechPaceObject = isObject(speechPace) ? speechPace : null;
  const silenceObject = isObject(silence) ? silence : null;
  const fillerWordsObject = isObject(fillerWords) ? fillerWords : null;
  const speechAiObject = isObject(speechAi) ? speechAi : null;
  // Spring의 별도 aiEvaluationJson을 우선하고, 없는 필드만 speechResultJson의 ai_evaluation으로 보완한다.
  const effectiveAi = speechAiObject || ai ? { ...speechAiObject, ...ai } : null;
  const aiWithoutModelAnswer = effectiveAi
    ? Object.fromEntries(Object.entries(effectiveAi).filter(([key]) => !["modelAnswer", "model_answer"].includes(key)))
    : null;
  const storedSpeechText = analysis.speechText?.trim();

  return {
    reportId: analysis.analysisId,
    textScript: storedSpeechText
      ? analysis.speechText as string
      : stringValue(pick(speech, "textScript", "text_script", "transcript")),
    totalFillerCount: numberValue(
      pick(fillerWordsObject, "total_count", "totalCount")
        ?? pick(speech, "totalFillerCount", "total_filler_count", "fillerCount", "filler_count"),
    ),
    fillerDetailsJson: JSON.stringify(pick(speech, "fillerDetails", "filler_details") ?? []),
    repeatedExpressionsJson: JSON.stringify(pick(speech, "repeatedExpressions", "repeated_expressions") ?? []),
    paceEvaluation: stringValue(pick(speech, "paceEvaluation", "pace_evaluation")),
    paceFeedback: stringValue(pick(speech, "paceFeedback", "pace_feedback", "feedback")),
    charactersPerSecond: numberValue(
      pick(speechPaceObject, "characters_per_second", "charactersPerSecond")
        ?? pick(speech, "charactersPerSecond", "characters_per_second", "cps"),
    ),
    totalSilenceSeconds: numberValue(
      pick(silenceObject, "total_silence_seconds", "totalSilenceSeconds")
        ?? pick(speech, "totalSilenceSeconds", "total_silence_seconds", "silenceSeconds", "silence_seconds"),
    ),
    pauseRatePercent: numberValue(
      pick(silenceObject, "pause_rate_percent", "pauseRatePercent")
        ?? pick(speech, "pauseRatePercent", "pause_rate_percent"),
    ),
    criticalSilenceCount: numberValue(
      pick(silenceObject, "critical_silence_count", "criticalSilenceCount")
        ?? pick(speech, "criticalSilenceCount", "critical_silence_count"),
    ),
    volumeDbMean: numberValue(pick(speech, "volumeDbMean", "volume_db_mean"), Number.NaN),
    volumeDbStd: numberValue(pick(speech, "volumeDbStd", "volume_db_std"), Number.NaN),
    speechScore: analysis.speechScore,
    speechScoreStatus: analysis.speechScoreStatus,
    speechScoreReason: analysis.speechScoreReason,
    aiEvaluationJson: aiWithoutModelAnswer ? JSON.stringify(aiWithoutModelAnswer) : undefined,
    modelAnswer: stringValue(pick(effectiveAi, "modelAnswer", "model_answer")),
    externalAiAnalysis: analysis.externalAiAnalysis ?? null,
  };
}

function toEyeReport(analysisId: number, value: JsonObject | null): EyeReport | null {
  if (!value) return null;
  return {
    reportId: analysisId,
    blinkCount: numberValue(pick(value, "blinkCount", "blink_count")),
    blinkRate: numberValue(pick(value, "blinkRate", "blink_rate", "blinksPerMinute", "blinks_per_minute")),
    durationSeconds: numberValue(pick(value, "durationSeconds", "duration_seconds")),
    notDetectedCount: numberValue(pick(value, "notDetectedCount", "not_detected_count")),
    notDetectedRatio: numberValue(pick(value, "notDetectedRatio", "not_detected_ratio")),
    score: numberValue(pick(value, "score")),
    grade: stringValue(pick(value, "grade")) || null,
    feedback: stringValue(pick(value, "feedback", "evaluation")),
  };
}

function toGazeReport(analysisId: number, value: JsonObject | null): GazeReport | null {
  if (!value) return null;
  return {
    reportId: analysisId,
    centerRatio: numberValue(pick(value, "centerRatio", "center_ratio")),
    gazeAwayRatio: numberValue(pick(value, "gazeAwayRatio", "gaze_away_ratio")),
    gazeAwayCount: numberValue(pick(value, "gazeAwayCount", "gaze_away_count")),
    score: numberValue(pick(value, "score")),
    evaluation: stringValue(pick(value, "evaluation")),
    feedback: stringValue(pick(value, "feedback")),
    resultJson: value,
  };
}

function poseGrade(score: number): string {
  if (score >= 85) return "EXCELLENT";
  if (score >= 75) return "GOOD";
  if (score >= 65) return "AVERAGE";
  if (score >= 50) return "NEEDS_IMPROVEMENT";
  return "POOR";
}

function summarizePoseSamples(analysisId: number, values: unknown[]): PoseReport | null {
  const samplesByTimestamp = new Map<number, PoseSample>();
  values.forEach((value) => {
    if (!isObject(value)) return;
    const timestamp = numberValue(pick(value, "timestamp"));
    const shoulderStatus = stringValue(pick(value, "shoulder_status", "shoulderStatus")).toUpperCase();
    const faceStatus = stringValue(pick(value, "face_status", "faceStatus")).toUpperCase();
    if (!Number.isFinite(timestamp) || (!shoulderStatus && !faceStatus)) return;
    samplesByTimestamp.set(timestamp, { timestamp, shoulderStatus, faceStatus });
  });

  const samples = [...samplesByTimestamp.values()].sort((first, second) => first.timestamp - second.timestamp);
  if (samples.length === 0) return null;

  const positiveIntervals = samples.slice(1)
    .map((sample, index) => sample.timestamp - samples[index].timestamp)
    .filter((interval) => interval > 0)
    .sort((first, second) => first - second);
  const sampleInterval = positiveIntervals.length > 0
    ? positiveIntervals[Math.floor(positiveIntervals.length / 2)]
    : 1;
  const durations = samples.map((sample, index) => (
    index < samples.length - 1
      ? Math.max(0, samples[index + 1].timestamp - sample.timestamp)
      : sampleInterval
  ));

  let badCount = 0;
  let shoulderBadCount = 0;
  let faceBadCount = 0;
  let badDuration = 0;
  let shoulderBadDuration = 0;
  let faceBadDuration = 0;
  let notDetectedDuration = 0;

  samples.forEach((sample, index) => {
    const duration = durations[index];
    const shoulderBad = sample.shoulderStatus === "BAD";
    const faceBad = sample.faceStatus === "BAD";
    const notDetected = sample.shoulderStatus === "NOT_DETECTED" || sample.faceStatus === "NOT_DETECTED";
    if (shoulderBad || faceBad) {
      badCount += 1;
      badDuration += duration;
    }
    if (shoulderBad) {
      shoulderBadCount += 1;
      shoulderBadDuration += duration;
    }
    if (faceBad) {
      faceBadCount += 1;
      faceBadDuration += duration;
    }
    if (notDetected) notDetectedDuration += duration;
  });

  const totalDuration = durations.reduce((sum, duration) => sum + duration, 0);
  const badRatio = totalDuration > 0 ? Math.min(1, badDuration / totalDuration) : 0;
  let score = totalDuration > 0 ? Math.max(0, 100 - Math.trunc(badRatio * 100)) : 0;
  const notDetectedRatio = totalDuration > 0 ? notDetectedDuration / totalDuration : 0;
  if (notDetectedRatio >= 0.3) {
    const penalty = Math.trunc(((notDetectedRatio - 0.3) / 0.7) * 100);
    score = Math.max(0, score - penalty);
  }

  return {
    reportId: analysisId,
    totalDuration,
    badCount,
    badDuration,
    shoulderBadCount,
    faceBadCount,
    shoulderBadDuration,
    faceBadDuration,
    badRatio,
    score,
    grade: poseGrade(score),
  };
}

function toPoseReport(analysisId: number, value: JsonObject | unknown[] | null): PoseReport | null {
  if (!value) return null;
  if (Array.isArray(value)) return summarizePoseSamples(analysisId, value);
  return {
    reportId: analysisId,
    totalDuration: numberValue(pick(value, "totalDuration", "total_duration", "durationSeconds", "duration_seconds")),
    badCount: numberValue(pick(value, "badCount", "bad_count")),
    badDuration: numberValue(pick(value, "badDuration", "bad_duration")),
    shoulderBadCount: numberValue(pick(value, "shoulderBadCount", "shoulder_bad_count")),
    faceBadCount: numberValue(pick(value, "faceBadCount", "face_bad_count")),
    shoulderBadDuration: numberValue(pick(value, "shoulderBadDuration", "shoulder_bad_duration")),
    faceBadDuration: numberValue(pick(value, "faceBadDuration", "face_bad_duration")),
    badRatio: numberValue(pick(value, "badRatio", "bad_ratio")),
    score: numberValue(pick(value, "score")),
    grade: stringValue(pick(value, "grade")) || null,
  };
}

export function toGroupAnswerReport(analysis: GroupInterviewAnswerAnalysis): AnswerReport {
  const speech = parseObject(analysis.speechResultJson);
  const ai = parseObject(analysis.aiEvaluationJson);
  const blinking = parseObject(analysis.eyeBlinkingResultJson);
  const gaze = parseObject(analysis.eyeGazeResultJson);
  const pose = parsePoseResult(analysis.poseResultJson);

  return {
    answerId: analysis.answerId,
    questionId: null,
    questionText: null,
    answerText: analysis.speechText,
    answerOrder: analysis.questionIndex,
    analysisStatus: analysis.status,
    errorMessage: analysis.errorMessage,
    eye: toEyeReport(analysis.analysisId, blinking),
    gaze: toGazeReport(analysis.analysisId, gaze),
    pose: toPoseReport(analysis.analysisId, pose),
    speech: toSpeechReport(analysis, speech, ai),
  };
}
