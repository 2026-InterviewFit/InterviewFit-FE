"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes"; 
import Sidebar from "@/components/dashboard/Sidebar";
import Topbar from "@/components/dashboard/Topbar";
import { User, Monitor, Mic, Moon, Menu, X, Camera, Briefcase, RefreshCcw } from "lucide-react";

const JOB_CATEGORIES = [
  { label: "IT/개발", jobs: ["프론트엔드", "백엔드", "AI", "데이터분석"] },
  { label: "비즈니스", jobs: ["마케팅", "인사", "재무·회계"] },
  { label: "디자인", jobs: ["UX/UI 디자이너", "영상 제작", "그래픽 디자이너"] },
];

export default function SettingsPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  
  const [jobCategory, setJobCategory] = useState("IT/개발");
  const [jobName, setJobName] = useState("프론트엔드");
  
  // 💡 [추가] 저장 상태를 알려주는 메시지 상태
  const [saveMessage, setSaveMessage] = useState("");
  
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const savedCat = localStorage.getItem("userCategory");
    const savedJob = localStorage.getItem("userJob");
    if (savedCat) setJobCategory(savedCat);
    if (savedJob) setJobName(savedJob);
  }, []);

  const isDark = mounted && theme === "dark";

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cat = e.target.value;
    setJobCategory(cat);
    const firstJob = JOB_CATEGORIES.find(c => c.label === cat)?.jobs[0] || "";
    setJobName(firstJob);
  };

  const handleJobChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setJobName(e.target.value);
  };

  // 💡 [추가] 사용자가 직접 저장 버튼을 눌렀을 때만 로컬스토리지에 반영
  const handleSaveJobSettings = () => {
    localStorage.setItem("userCategory", jobCategory);
    localStorage.setItem("userJob", jobName);
    
    // 저장 완료 피드백을 2.5초간 보여줍니다.
    setSaveMessage("저장 완료!");
    setTimeout(() => {
      setSaveMessage("");
    }, 2500);
  };

  // 💡 [추가] 시연을 위한 완벽 초기화 기능 (최초 팝업 다시 띄우기)
  const handleResetPopup = () => {
    if (window.confirm("직무 설정을 초기화하시겠습니까?\n다음 면접 연습 시작 시 최초 직무 선택 팝업이 다시 나타납니다.")) {
      localStorage.removeItem("userCategory");
      localStorage.removeItem("userJob");
      alert("초기화되었습니다. 연습 스튜디오 입장 시 팝업이 나타납니다.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg font-sans text-ink relative transition-colors duration-300">
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 transform bg-white dark:bg-[#111827] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:shrink-0
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onMenuClick={() => setIsMobileSidebarOpen(false)} />
        <button 
          className="absolute top-6 right-4 lg:hidden rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setIsMobileSidebarOpen(false)}
        >
          <X className="h-5 w-5 text-muted" />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto w-full">
        <div className="flex items-center px-6 pt-6 lg:px-10 lg:pt-8 w-full">
          <button 
            className="mr-4 lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="h-6 w-6 text-navy" />
          </button>
          <div className="flex-1">
            <Topbar />
          </div>
        </div>

        <main className="px-6 pb-12 pt-6 lg:px-10 lg:pt-10 flex flex-col w-full h-full max-w-4xl mx-auto">
          <div className="flex flex-col gap-8 animate-in fade-in duration-300">
            
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-navy">설정</h2>
              <p className="mt-2 text-sm text-muted">계정 정보 및 기기, 디스플레이 환경을 설정합니다.</p>
            </div>

            <div className="flex flex-col gap-6">
              
              {/* 계정 관리 */}
              <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><User className="h-5 w-5" /></div>
                  <h3 className="text-lg font-bold text-navy">계정 관리</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-line/50">
                    <div>
                      <p className="font-medium text-ink">연결된 계정</p>
                      <p className="text-xs text-muted mt-1">카카오 소셜 로그인 연동 중</p>
                    </div>
                    <span className="px-3 py-1 bg-[#FEE500] text-[#191600] text-xs font-bold rounded-full">Kakao</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-line/50">
                    <div>
                      <p className="font-medium text-ink">이름</p>
                    </div>
                    <p className="text-sm font-bold text-navy">김은재</p>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <p className="font-medium text-ink">계정 탈퇴</p>
                    <button className="text-xs font-medium text-red-500 hover:text-red-600">탈퇴하기</button>
                  </div>
                </div>
              </div>

              {/* ── [수정] 면접 직무 설정 (저장 및 초기화 버튼 추가) ── */}
              <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-navy">면접 직무 설정</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-line/50">
                    <div>
                      <p className="font-medium text-ink">대분류 카테고리</p>
                      <p className="text-xs text-muted mt-1">모의면접의 기본 직군입니다.</p>
                    </div>
                    <select
                      value={jobCategory}
                      onChange={handleCategoryChange}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                      {JOB_CATEGORIES.map(cat => (
                        <option key={cat.label} value={cat.label}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-between items-center py-3 border-b border-line/50">
                    <div>
                      <p className="font-medium text-ink">세부 희망 직무</p>
                      <p className="text-xs text-muted mt-1">질문 생성에 참고될 직무입니다.</p>
                    </div>
                    <select
                      value={jobName}
                      onChange={handleJobChange}
                      className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                    >
                      {JOB_CATEGORIES.find(c => c.label === jobCategory)?.jobs.map(job => (
                        <option key={job} value={job}>{job}</option>
                      ))}
                    </select>
                  </div>

                  {/* 💡 [추가] 설정 저장 및 초기화 액션 영역 */}
                  <div className="flex justify-between items-center pt-4">
                    <button 
                      onClick={handleResetPopup}
                      className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-500 transition-colors"
                    >
                      <RefreshCcw className="h-3 w-3" />
                      최초 팝업 다시 보기 (초기화)
                    </button>
                    
                    <div className="flex items-center gap-4">
                      {saveMessage && (
                        <span className="text-sm font-bold text-emerald-500 animate-in fade-in duration-300">
                          {saveMessage}
                        </span>
                      )}
                      <button 
                        onClick={handleSaveJobSettings}
                        className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-navy-dark transition-colors"
                      >
                        변경사항 저장
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 기기 및 하드웨어 설정 */}
              <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Monitor className="h-5 w-5" /></div>
                  <h3 className="text-lg font-bold text-navy">기기 및 권한 설정</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-line/50">
                    <div className="flex items-center gap-3">
                      <Camera className="h-5 w-5 text-muted" />
                      <div>
                        <p className="font-medium text-ink">웹캠(카메라) 권한</p>
                        <p className="text-xs text-muted mt-1">면접 분석을 위한 필수 권한입니다.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setCameraEnabled(!cameraEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${cameraEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${cameraEnabled ? "left-6.5 translate-x-[2px]" : "left-0.5"}`} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <div className="flex items-center gap-3">
                      <Mic className="h-5 w-5 text-muted" />
                      <div>
                        <p className="font-medium text-ink">마이크 권한</p>
                        <p className="text-xs text-muted mt-1">음성 분석 및 속도 측정을 위해 필요합니다.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setMicEnabled(!micEnabled)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${micEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${micEnabled ? "left-6.5 translate-x-[2px]" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* 디스플레이 설정 */}
              <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg"><Moon className="h-5 w-5" /></div>
                  <h3 className="text-lg font-bold text-navy dark:text-white">테마 설정</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3">
                    <div>
                      <p className="font-medium text-ink dark:text-white">🦉 심야/새벽 집중 모드</p>
                      <p className="text-xs text-muted dark:text-gray-400 mt-1">늦은 시간 눈의 피로를 덜어주는 다크 테마를 적용합니다.</p>
                    </div>
                    <button 
                      onClick={() => setTheme(isDark ? "light" : "dark")}
                      className={`w-12 h-6 rounded-full transition-colors relative ${isDark ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-600"}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isDark ? "left-6.5 translate-x-[2px]" : "left-0.5"}`} />
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}