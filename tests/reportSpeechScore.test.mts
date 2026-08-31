import assert from "node:assert/strict";
import test from "node:test";

import { calculateInterviewTotalScore, getOverallScore, getSpeechScore } from "../lib/reportUtils.ts";
import type { InterviewReportResponse } from "../types/index.ts";

const reportWithScores = (scores: Array<number | null>) => ({
  answers: scores.map((speechScore, answerOrder) => ({
    answerOrder,
    speech: { speechScore },
  })),
}) as InterviewReportResponse;

test("1:1 종합 발화 점수는 백엔드 speechScore 평균만 사용한다", () => {
  assert.equal(getSpeechScore(reportWithScores([82, 68])), 75);
});

test("실제 0점은 유효한 발화 점수로 평균에 포함한다", () => {
  assert.equal(getSpeechScore(reportWithScores([0, 80])), 40);
});

test("null 점수는 제외하고 유효한 speechScore가 없으면 undefined를 반환한다", () => {
  assert.equal(getSpeechScore(reportWithScores([null, 70])), 70);
  assert.equal(getSpeechScore(reportWithScores([null])), undefined);
});

test("최종 종합점수에 다대일과 동일한 15/20/20/20/25 가중치를 적용한다", () => {
  assert.equal(calculateInterviewTotalScore({
    blinkScore: 80,
    gazeScore: 70,
    poseScore: 60,
    speechScore: 90,
    contentScore: 100,
  }), 81);
});

test("최종 종합점수는 실제 speechScore와 기존 STAR 내용 점수를 분리해 반영한다", () => {
  const report = {
    eye: { score: 80 },
    gaze: { score: 70 },
    pose: { score: 60 },
    answers: [{
      answerOrder: 0,
      speech: {
        speechScore: 90,
        aiEvaluationJson: JSON.stringify({ star_score: { S: 10, T: 10, A: 10, R: 10 } }),
      },
    }],
  } as InterviewReportResponse;

  assert.equal(getOverallScore(report), 81);
});

test("최종 종합점수 필수 분석값이 없으면 0점으로 대체하지 않는다", () => {
  assert.equal(calculateInterviewTotalScore({
    blinkScore: 80,
    gazeScore: 70,
    poseScore: 60,
    speechScore: null,
    contentScore: 100,
  }), undefined);
});
