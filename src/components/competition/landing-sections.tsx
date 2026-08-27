import Image from "next/image";
import Link from "next/link";
import {
  formatDate,
  formatDateTime,
  isVotingOpen,
} from "@/lib/utils/format";
import type { Competition } from "@/types/database";

type Props = {
  competition: Competition;
  competitorCount: number;
};

export function HeroSection({ competition, competitorCount }: Props) {
  const location = competition.location?.trim() || "Addis Ababa, Ethiopia";
  const open = isVotingOpen(competition);

  return (
    <section className="relative min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/barbear-pic.png"
          alt="Ethiopian barber competition"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0f0a]/92 via-[#1a0f0a]/75 to-[#1a0f0a]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0f0a]/90 via-transparent to-[#1a0f0a]/40" />
      </div>
      <div className="grain absolute inset-0 opacity-[0.1] mix-blend-soft-light" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-6 pb-20 pt-32 md:justify-center md:px-10 md:pb-24">
        <div className="max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-6 flex items-center gap-3">
            <span className="relative size-14 overflow-hidden sm:size-16">
              <Image
                src="/eboa-logo.png"
                alt="EBOA"
                fill
                className="object-contain"
                sizes="64px"
                priority
              />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f5c518]">
                Ethiopian Barbers &amp; Owners Association
              </p>
              <p className="mt-1 text-sm text-stone/65">
                {location} · {formatDate(competition.start_date)}
              </p>
            </div>
          </div>

          <h1 className="mt-2 font-display text-5xl leading-[0.95] text-stone md:text-7xl lg:text-8xl">
            {competition.name}
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-stone/75 md:text-lg">
            {competition.description ||
              "Vote for the most creative and professional hair style from Ethiopian barbers."}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {open ? (
              <Link
                href="/competitors"
                className="bg-[#f5c518] px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#1a0f0a] transition hover:-translate-y-0.5 hover:bg-stone"
              >
                Vote Now
              </Link>
            ) : (
              <span className="bg-stone/20 px-7 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-stone">
                Voting closed
              </span>
            )}
            <p className="text-sm text-stone/60">
              {competitorCount} competing styles
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CompetitionInfo({
  competition,
  competitorCount,
}: Props) {
  const location = competition.location?.trim() || "Addis Ababa, Ethiopia";

  return (
    <section id="info" className="mx-auto max-w-7xl px-6 py-20 md:px-10">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-brass">
            Competition information
          </p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">
            {competition.name}
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {competition.description ||
              "A hair style competition celebrating Ethiopian barber craft in Addis Ababa."}
          </p>
          <p className="mt-4 text-sm font-medium text-[#8b3a1c]">
            Hosted with EBOA · Addis Ababa, Ethiopia
          </p>
        </div>
        <dl className="grid gap-6 border border-border bg-card/70 p-6 sm:grid-cols-2">
          <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Voting starts
            </dt>
            <dd className="mt-2 font-display text-2xl">
              {formatDate(competition.start_date)}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Voting ends
            </dt>
            <dd className="mt-2 font-display text-2xl">
              {formatDateTime(competition.end_date)}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Finals venue
            </dt>
            <dd className="mt-2 font-display text-2xl">{location}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Competitors
            </dt>
            <dd className="mt-2 font-display text-2xl">{competitorCount}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

export function FinalsSection() {
  return (
    <section
      id="finals"
      className="border-y border-[#c9a227]/30 bg-[#f7f0de]"
    >
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8b3a1c]">
          After public voting
        </p>
        <h2 className="mt-3 font-display text-4xl text-[#2a140c] md:text-5xl">
          Final held by judges
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-[#5c4030]">
          Public voting closes on{" "}
          <strong>Sunday, August 30, 2026 at 6:00 PM</strong> (Addis Ababa).
          After that, no more votes will be accepted. The final will be held by
          judges at <strong>Vamdas Cinema, Megenagna</strong>.
        </p>
      </div>
    </section>
  );
}

export function VotingRules({ rules }: { rules: string }) {
  const defaults = [
    "Each person can vote only once.",
    "One vote is allowed per phone number.",
    "You must select only one competitor.",
    "Public voting closes Sunday, August 30, 2026 at 6:00 PM (Addis Ababa).",
    "After voting ends, no more votes are accepted.",
    "The final will be held by judges at Vamdas Cinema, Megenagna.",
  ];

  const lines = rules
    .split("\n")
    .map((line) => line.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);

  const items = lines.length ? lines : defaults;

  return (
    <section id="rules" className="border-y border-border/80 bg-ink text-stone">
      <div className="mx-auto max-w-7xl px-6 py-20 md:px-10">
        <p className="text-xs uppercase tracking-[0.28em] text-brass">
          Voting rules
        </p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">
          Fair. Simple. One voice each.
        </h2>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <li
              key={item}
              className="border border-stone/15 bg-stone/5 px-5 py-4 text-stone/85"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
