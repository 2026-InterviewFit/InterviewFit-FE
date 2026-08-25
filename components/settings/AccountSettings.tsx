import { User } from "lucide-react";

export default function AccountSettings() {
  return (
    <div className="rounded-[24px] bg-white dark:bg-[#1e293b] p-8 shadow-sm border border-black/[0.02] dark:border-white/[0.05] transition-colors duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
          <User className="h-5 w-5" />
        </div>
        <h3 className="text-lg font-bold text-navy dark:text-white">계정 관리</h3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-line/50 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">연결된 계정</p>
            <p className="text-xs text-muted dark:text-gray-400 mt-1">카카오 소셜 로그인 연동 중</p>
          </div>
          <span className="px-3 py-1 bg-[#FEE500] text-[#191600] text-xs font-bold rounded-full">Kakao</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-line/50 dark:border-white/10">
          <div>
            <p className="font-medium text-ink dark:text-white">이름</p>
          </div>
          <p className="text-sm font-bold text-navy dark:text-white">김은재</p>
        </div>
        <div className="flex justify-between items-center py-3">
          <p className="font-medium text-ink dark:text-white">계정 탈퇴</p>
          <button className="text-xs font-medium text-red-500 hover:text-red-600 transition-colors">탈퇴하기</button>
        </div>
      </div>
    </div>
  );
}