export function PageLoader({
  label = "Loading…",
  dark = false,
}: {
  label?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? "flex min-h-[50vh] flex-col items-center justify-center gap-3 bg-[#0a0a0a] text-white"
          : "flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink"
      }
      role="status"
      aria-live="polite"
    >
      <span
        className={
          dark
            ? "size-8 animate-spin rounded-full border-2 border-white/20 border-t-[#e8c878]"
            : "size-8 animate-spin rounded-full border-2 border-border border-t-brass"
        }
      />
      <p className={dark ? "text-sm text-white/55" : "text-sm text-muted-foreground"}>
        {label}
      </p>
    </div>
  );
}
