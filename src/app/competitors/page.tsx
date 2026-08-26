import Link from "next/link";
import { CompetitorCard } from "@/components/competitors/competitor-card";
import { SiteHeader } from "@/components/layout/site-chrome";
import {
  getCompetitionResults,
  getCompetitors,
  getFeaturedCompetition,
} from "@/lib/actions/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Vote",
};

export default async function CompetitorsPage() {
  const competition = await getFeaturedCompetition();
  const competitors = competition
    ? await getCompetitors(competition.id)
    : [];
  const results = competition
    ? await getCompetitionResults(competition.id)
    : [];

  const voteMap = new Map(
    results.map((row, index) => [
      row.competitor_id,
      { votes: row.total_votes, rank: index + 1 },
    ])
  );

  const ranked = [...competitors].sort((a, b) => {
    const av = voteMap.get(a.id)?.votes ?? 0;
    const bv = voteMap.get(b.id)?.votes ?? 0;
    if (bv !== av) return bv - av;
    return a.competition_number - b.competition_number;
  });

  const votingOpen = competition?.status === "active";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader variant="dark" />
      <main className="mx-auto max-w-lg px-4 pb-24 pt-24">
        <div className="mb-6 rounded-xl bg-[#7a1f2b] px-4 py-3 text-center text-sm leading-snug text-white/95">
          One vote per phone number. Choose your favorite style.
        </div>

        {!competition || ranked.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-8 text-center">
            <p className="text-lg">No competitors yet</p>
            <Link href="/" className="mt-4 inline-block text-[#e8c878]">
              Back home
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {ranked.map((competitor) => {
              const stats = voteMap.get(competitor.id);
              return (
                <CompetitorCard
                  key={competitor.id}
                  competitor={competitor}
                  rank={stats?.rank}
                  voteCount={stats?.votes ?? 0}
                  votingOpen={votingOpen}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
