import assert from "node:assert/strict";
import test from "node:test";

import {
  formatGroupComparisonScore,
  getGroupAnswerVideoState,
  getGroupQuestionIndices,
} from "../lib/groupInterviewDashboard.ts";

test("실제 답변의 질문 인덱스만 중복 없이 정렬한다", () => {
  assert.deepEqual(getGroupQuestionIndices([2, 0, 1, 1, 0]), [0, 1, 2]);
});

test("잘못된 질문 인덱스는 탭 목록에서 제외한다", () => {
  assert.deepEqual(getGroupQuestionIndices([-1, 0, 1.5, Number.NaN]), [0]);
});

test("업로드된 본인 답변만 영상 다시보기를 제공한다", () => {
  assert.equal(getGroupAnswerVideoState(true, "COMPLETED"), "AVAILABLE");
  assert.equal(getGroupAnswerVideoState(false, "COMPLETED"), "HIDDEN");
  assert.equal(getGroupAnswerVideoState(true, "SKIPPED"), "HIDDEN");
});

test("녹화 실패 답변은 영상 대신 실패 안내를 제공한다", () => {
  assert.equal(getGroupAnswerVideoState(false, "RECORDING_FAILED"), "RECORDING_FAILED");
});

test("내 분석과 참가자 비교에서 동일한 종합점수 표시 형식을 사용한다", () => {
  assert.equal(formatGroupComparisonScore(82), "82점");
  assert.equal(formatGroupComparisonScore(82.25), "82.3점");
  assert.equal(formatGroupComparisonScore(0), "0점");
  assert.equal(formatGroupComparisonScore(null), "분석 데이터 없음");
});
