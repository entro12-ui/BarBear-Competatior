import Image from "next/image";
import Link from "next/link";

type Props = {
  variant?: "light" | "dark";
};

export function SiteHeader({ variant = "light" }: Props) {
  const dark = variant === "dark";

  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <Link href="/" className="group flex items-center gap-3">
          <span className="relative size-10 overflow-hidden sm:size-11">
            <Image
              src="/eboa-logo.png"
              alt="EBOA"
              fill
              className="object-contain"
              sizes="44px"
            />
          </span>
          <span
            className={`text-2xl font-semibold tracking-tight md:text-3xl ${
              dark
                ? "text-white group-hover:text-[#f5c518]"
                : "font-display text-ink transition-colors group-hover:text-brass md:text-4xl"
            }`}
          >
            EBOA
          </span>
        </Link>
        <nav
          className={`flex items-center gap-5 text-sm font-medium ${
            dark ? "text-white/80" : "text-ink/80"
          }`}
        >
          <Link
            href="/competitors"
            className={dark ? "hover:text-[#f5c518]" : "hover:text-brass"}
          >
            Vote
          </Link>
          {!dark && (
            <Link href="/#rules" className="hidden hover:text-brass sm:inline">
              Rules
            </Link>
          )}
          <Link
            href="/competitors"
            className={
              dark
                ? "rounded-lg bg-[#f5c518] px-4 py-2 font-semibold text-[#1a0f0a]"
                : "rounded-sm bg-ink px-4 py-2 text-stone transition-transform hover:-translate-y-0.5 hover:bg-brass"
            }
          >
            Vote Now
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-ink text-stone">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 md:flex-row md:items-end md:justify-between md:px-10">
        <div className="flex items-center gap-4">
          <span className="relative size-12 overflow-hidden">
            <Image
              src="/eboa-logo.png"
              alt="EBOA"
              fill
              className="object-contain"
              sizes="48px"
            />
          </span>
          <div>
            <p className="font-display text-3xl">EBOA</p>
            <p className="mt-1 max-w-md text-sm text-stone/70">
              Ethiopian Barbers and Owners Association · Addis Ababa
            </p>
          </div>
        </div>
        <p className="text-xs uppercase tracking-[0.22em] text-stone/50">
          © {new Date().getFullYear()} EBOA Competition
        </p>
      </div>
    </footer>
  );
}
