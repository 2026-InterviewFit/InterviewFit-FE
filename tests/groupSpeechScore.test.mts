import assert from "node:assert/strict";
import test from "node:test";

import { getSpeechScoreDisplay } from "../lib/groupSpeechScore.ts";

test("발화 점수 82를 82점으로 표시한다", () => {
  assert.deepEqual(getSpeechScoreDisplay(82, "SCORED", null), {
    label: "82점",
    isInsufficient: false,
    reason: null,
  });
});

test("실제 점수 0을 데이터 부족과 구분해 0점으로 표시한다", () => {
  assert.equal(getSpeechScoreDisplay(0, "SCORED", null).label, "0점");
});

test("점수가 null이고 데이터가 부족하면 사유를 함께 제공한다", () => {
  assert.deepEqual(
    getSpeechScoreDisplay(null, "INSUFFICIENT_DATA", "발화 데이터가 부족하여 점수를 산출할 수 없습니다."),
    {
      label: "분석 데이터 부족",
      isInsufficient: true,
      reason: "발화 데이터가 부족하여 점수를 산출할 수 없습니다.",
    },
  );
});

test("점수가 null이면 상태가 없어도 데이터 부족으로 표시한다", () => {
  assert.equal(getSpeechScoreDisplay(null, null, null).label, "분석 데이터 부족");
});
