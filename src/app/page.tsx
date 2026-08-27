import Link from "next/link";
import {
  CompetitionInfo,
  HeroSection,
  VotingRules,
} from "@/components/competition/landing-sections";
import { CompetitorCard } from "@/components/competitors/competitor-card";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import {
  getCompetitionResults,
  getCompetitorCount,
  getCompetitors,
  getFeaturedCompetition,
} from "@/lib/actions/queries";
import { isDatabaseConfigured } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  if (!isDatabaseConfigured()) {
    return (
      <>
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-6 py-32">
          <div className="max-w-xl border border-border bg-card/80 p-8 text-center">
            <h1 className="font-display text-4xl">Barbear</h1>
            <p className="mt-4 text-muted-foreground">
              Connect local PostgreSQL using <code>.env.example</code>, run{" "}
              <code>npm run db:setup</code>, then open the admin dashboard.
            </p>
            <Link
              href="/admin/login"
              className="mt-8 inline-block bg-ink px-5 py-3 text-sm text-stone"
            >
              Open Admin
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  let competition = null;
  try {
    competition = await getFeaturedCompetition();
  } catch (error) {
    console.error(error);
    return (
      <>
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-6 py-32">
          <div className="max-w-xl border border-border bg-card/80 p-8 text-center">
            <h1 className="font-display text-4xl">Database offline</h1>
            <p className="mt-4 text-muted-foreground">
              PostgreSQL is not reachable. Start it with{" "}
              <code>npm run db:start</code>, then refresh.
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  if (!competition) {
    return (
      <>
        <SiteHeader />
        <main className="flex flex-1 items-center justify-center px-6 py-32">
          <div className="max-w-xl text-center">
            <h1 className="font-display text-5xl">Barbear</h1>
            <p className="mt-4 text-muted-foreground">
              No public competition yet. An admin needs to create and publish
              one.
            </p>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const [competitorCount, competitors, results] = await Promise.all([
    getCompetitorCount(competition.id),
    getCompetitors(competition.id),
    getCompetitionResults(competition.id),
  ]);

  const voteMap = new Map(
    results.map((row, index) => [
      row.competitor_id,
      { votes: row.total_votes, rank: index + 1 },
    ])
  );

  const preview = [...competitors]
    .sort((a, b) => {
      const av = voteMap.get(a.id)?.votes ?? 0;
      const bv = voteMap.get(b.id)?.votes ?? 0;
      if (bv !== av) return bv - av;
      return a.competition_number - b.competition_number;
    })
    .slice(0, 3);

  return (
    <>
      <SiteHeader variant="dark" />
      <main>
        <HeroSection
          competition={competition}
          competitorCount={competitorCount}
        />
        <CompetitionInfo
          competition={competition}
          competitorCount={competitorCount}
        />
        <VotingRules rules={competition.rules} />

        <section className="bg-[#0a0a0a] px-4 py-16 text-white">
          <div className="mx-auto max-w-lg">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[#e8c878]">
                  People&apos;s choice
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Vote now</h2>
              </div>
              <Link
                href="/competitors"
                className="text-sm text-[#e8c878] underline-offset-4 hover:underline"
              >
                See all
              </Link>
            </div>

            {preview.length === 0 ? (
              <p className="text-white/50">Competitors will appear once published.</p>
            ) : (
              <div className="space-y-3">
                {preview.map((competitor) => {
                  const stats = voteMap.get(competitor.id);
                  return (
                    <CompetitorCard
                      key={competitor.id}
                      competitor={competitor}
                      rank={stats?.rank ?? 1}
                      voteCount={stats?.votes ?? 0}
                      votingOpen={competition.status === "active"}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
