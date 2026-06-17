"use client";

import { useState } from "react";
import { Monitor, Camera, Mic } from "lucide-react";

export default function DeviceSettings() {
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  return (
    <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
          <Monitor className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-navy dark:text-white">기기 및 권한 설정</h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-line/50 dark:border-white/10">
          <div className="flex items-center gap-3">
            <Camera className="h-5 w-5 text-muted dark:text-gray-400" />
            <div>
              <p className="font-medium text-ink dark:text-white">웹캠(카메라) 권한</p>
              <p className="text-xs text-muted dark:text-gray-400 mt-1">면접 분석을 위한 필수 권한입니다.</p>
            </div>
          </div>
          <button onClick={() => setCameraEnabled(!cameraEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${cameraEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${cameraEnabled ? "left-6.5 translate-x-[2px]" : "left-0.5"}`} />
          </button>
        </div>
        <div className="flex justify-between items-center py-3">
          <div className="flex items-center gap-3">
            <Mic className="h-5 w-5 text-muted dark:text-gray-400" />
            <div>
              <p className="font-medium text-ink dark:text-white">마이크 권한</p>
              <p className="text-xs text-muted dark:text-gray-400 mt-1">음성 분석 및 속도 측정을 위해 필요합니다.</p>
            </div>
          </div>
          <button onClick={() => setMicEnabled(!micEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${micEnabled ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${micEnabled ? "left-6.5 translate-x-[2px]" : "left-0.5"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}