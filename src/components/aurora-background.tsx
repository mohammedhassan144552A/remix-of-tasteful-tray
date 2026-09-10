/** خلفية "أورورا" — ثلاث هالات ضوئية متحركة خلف المحتوى */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-ink" />
      <div
        className="absolute -top-40 right-[-10%] size-[38rem] rounded-full bg-saffron/20 blur-[120px]"
        style={{ animation: "aurora 18s ease-in-out infinite" }}
      />
      <div
        className="absolute top-1/3 left-[-15%] size-[34rem] rounded-full bg-terracotta/20 blur-[130px]"
        style={{ animation: "aurora 24s ease-in-out infinite reverse" }}
      />
      <div
        className="absolute bottom-[-20%] right-1/4 size-[30rem] rounded-full bg-mint/12 blur-[140px]"
        style={{ animation: "aurora 30s ease-in-out infinite" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent,var(--ink)_75%)]" />
    </div>
  );
}
