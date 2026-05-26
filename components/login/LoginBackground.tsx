export default function LoginBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 부드러운 컬러 블롭 — 너무 진하지 않게 */}
      <div className="absolute -top-32 -left-32 h-[520px] w-[520px] rounded-full bg-navy/[0.08] blur-3xl" />
      <div className="absolute -bottom-40 -right-32 h-[600px] w-[600px] rounded-full bg-[#3a4d7a]/15 blur-3xl" />
      <div className="absolute top-1/4 right-1/3 h-[420px] w-[420px] rounded-full bg-[#5a6f9e]/10 blur-3xl" />

      {/* 미세한 도트 패턴 — 거의 안 보일 정도로만 깔아서 깊이감 */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #1f2c46 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  );
}