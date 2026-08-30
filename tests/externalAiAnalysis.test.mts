import assert from "node:assert/strict";
import test from "node:test";
import { externalAiAnalysisView } from "../lib/externalAiAnalysis.ts";

test("STAR, 강점, 개선점을 화면용 데이터로 변환한다", () => {
  const view = externalAiAnalysisView({
    star: {
      situation: "서비스 장애 상황",
      task: "서비스 복구",
      action: "로그 분석",
      result: "서비스 정상화",
    },
    strengths: ["행동이 구체적입니다."],
    improvements: ["성과를 수치로 제시하세요."],
  });

  assert.deepEqual(view.star.map((item) => item.value), [
    "서비스 장애 상황",
    "서비스 복구",
    "로그 분석",
    "서비스 정상화",
  ]);
  assert.deepEqual(view.strengths, ["행동이 구체적입니다."]);
  assert.deepEqual(view.improvements, ["성과를 수치로 제시하세요."]);
});

test("null STAR와 null/빈 배열을 안전하게 처리한다", () => {
  const view = externalAiAnalysisView({
    star: null,
    strengths: null,
    improvements: [],
  });

  assert.deepEqual(view.star.map((item) => item.value), [null, null, null, null]);
  assert.deepEqual(view.strengths, []);
  assert.deepEqual(view.improvements, []);
});

test("빈 문자열은 표시 목록에서 제외한다", () => {
  const view = externalAiAnalysisView({
    star: { situation: " ", task: null, action: "조치", result: null },
    strengths: ["", "  ", "구체적인 조치"],
    improvements: [" ", "수치 보완"],
  });

  assert.equal(view.star[0].value, null);
  assert.equal(view.star[2].value, "조치");
  assert.deepEqual(view.strengths, ["구체적인 조치"]);
  assert.deepEqual(view.improvements, ["수치 보완"]);
});
