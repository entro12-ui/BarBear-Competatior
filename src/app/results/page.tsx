import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import {
  getCompetitionResults,
  getFeaturedCompetition,
} from "@/lib/actions/queries";
import { formatCompetitionNumber } from "@/lib/utils/format";

export const metadata = {
  title: "Results",
};

export default async function PublicResultsPage() {
  const competition = await getFeaturedCompetition();
  const results =
    competition && competition.public_results
      ? await getCompetitionResults(competition.id, { requirePublic: true })
      : [];

  return (
    <>
      <SiteHeader />
      <main className="flex-1 px-6 pb-20 pt-28 md:px-10">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs uppercase tracking-[0.28em] text-brass">
            Leaderboard
          </p>
          <h1 className="mt-3 font-display text-5xl">Results</h1>

          {!competition?.public_results ? (
            <p className="mt-8 text-muted-foreground">
              Public results are not available yet.
            </p>
          ) : (
            <div className="mt-10 space-y-3">
              {results.map((row, index) => (
                <div
                  key={row.competitor_id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border border-border bg-card/80 px-4 py-4"
                >
                  <span className="font-display text-2xl text-brass">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="font-medium">
                      {formatCompetitionNumber(row.competition_number)}{" "}
                      {row.full_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {row.barber_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-2xl">{row.total_votes}</p>
                    <p className="text-xs text-muted-foreground">
                      {row.vote_percentage}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link href="/" className="mt-10 inline-block text-brass">
            Back home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
