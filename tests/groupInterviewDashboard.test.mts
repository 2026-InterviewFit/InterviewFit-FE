import assert from "node:assert/strict";
import test from "node:test";

import { getGroupQuestionIndices } from "../lib/groupInterviewDashboard.ts";

test("실제 답변의 질문 인덱스만 중복 없이 정렬한다", () => {
  assert.deepEqual(getGroupQuestionIndices([2, 0, 1, 1, 0]), [0, 1, 2]);
});

test("잘못된 질문 인덱스는 탭 목록에서 제외한다", () => {
  assert.deepEqual(getGroupQuestionIndices([-1, 0, 1.5, Number.NaN]), [0]);
});
