"use client";

import { useState, useEffect } from "react";
import { Briefcase, RefreshCcw } from "lucide-react";

const JOB_CATEGORIES = [
  { label: "IT/개발", jobs: ["프론트엔드", "백엔드", "AI", "데이터분석"] },
  { label: "비즈니스", jobs: ["마케팅", "인사", "재무·회계"] },
  { label: "디자인", jobs: ["UX/UI 디자이너", "영상 제작", "그래픽 디자이너"] },
];

export default function JobSettings() {
  const [jobCategory, setJobCategory] = useState("IT/개발");
  const [jobName, setJobName] = useState("프론트엔드");
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const savedCat = localStorage.getItem("userCategory");
    const savedJob = localStorage.getItem("userJob");
    if (savedCat) setJobCategory(savedCat);
    if (savedJob) setJobName(savedJob);
  }, []);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setJobCategory(cat);
    const firstJob = JOB_CATEGORIES.find(c => c.label === cat)?.jobs[0] || "";
    setJobName(firstJob);
  };

  const handleSaveJobSettings = () => {
    localStorage.setItem("userCategory", jobCategory);
    localStorage.setItem("userJob", jobName);
    setSaveMessage("저장 완료!");
    setTimeout(() => setSaveMessage(""), 2500);
  };

  const handleResetPopup = () => {
    if (window.confirm("직무 설정을 초기화하시겠습니까?\n다음 면접 연습 시작 시 최초 직무 선택 팝업이 다시 나타납니다.")) {
      localStorage.removeItem("userCategory");
      localStorage.removeItem("userJob");
      alert("초기화되었습니다. 연습 스튜디오 입장 시 팝업이 나타납니다.");
    }
  };

  return (
    <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
          <Briefcase className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-navy dark:text-white">면접 직무 설정</h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-line/50 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">대분류 카테고리</p>
            <p className="text-xs text-muted dark:text-gray-400 mt-1">모의면접의 기본 직군입니다.</p>
          </div>
          <select value={jobCategory} onChange={handleCategoryChange} className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            {JOB_CATEGORIES.map(cat => (
              <option key={cat.label} value={cat.label}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center py-3 border-b border-line/50 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">세부 희망 직무</p>
            <p className="text-xs text-muted dark:text-gray-400 mt-1">질문 생성에 참고될 직무입니다.</p>
          </div>
          <select value={jobName} onChange={(e) => setJobName(e.target.value)} className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
            {JOB_CATEGORIES.find(c => c.label === jobCategory)?.jobs.map(job => (
              <option key={job} value={job}>{job}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center pt-4">
          <button onClick={handleResetPopup} className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-500 transition-colors">
            <RefreshCcw className="h-3 w-3" /> 최초 팝업 다시 보기
          </button>
          <div className="flex items-center gap-4">
            {saveMessage && <span className="text-sm font-bold text-emerald-500 animate-in fade-in">{saveMessage}</span>}
            <button onClick={handleSaveJobSettings} className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-navy-dark transition-colors">
              변경사항 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}