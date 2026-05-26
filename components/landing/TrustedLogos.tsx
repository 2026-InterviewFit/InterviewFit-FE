const LOGOS = ["Logo 1", "Logo 2", "Logo 3", "Logo 4"];

export default function TrustedLogos() {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-8 py-16">
      <p className="mb-8 text-center text-xs font-medium uppercase tracking-widest text-muted">
        Trusted by
      </p>
      <div className="flex items-center justify-center gap-16 opacity-60">
        {LOGOS.map((logo) => (
          <div
            key={logo}
            className="text-sm font-medium text-muted"
          >
            {logo}
          </div>
        ))}
      </div>
    </section>
  );
}