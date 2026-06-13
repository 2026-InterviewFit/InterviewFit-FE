interface TopbarProps {
  userName?: string;
}

export default function Topbar({ userName = "김은재" }: TopbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted dark:text-gray-400">
          환영합니다
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-navy dark:text-white">
          대시보드
        </h2>
      </div>

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-navy dark:bg-blue-600 text-sm font-bold text-white">
        {userName.charAt(0)}
      </div>
    </div>
  );
}