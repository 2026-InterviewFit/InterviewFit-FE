export default function Topbar() {
  return (
    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-neutral-500">
          Welcome back
        </p>

        <h2 className="mt-1 text-4xl font-semibold tracking-tight">
          Dashboard
        </h2>
      </div>

      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
        은
      </div>

    </div>
  );
}