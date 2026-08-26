import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getCompetitorById } from "@/lib/actions/queries";
import { formatCompetitionNumber } from "@/lib/utils/format";

type Props = {
  searchParams: Promise<{ competitor?: string }>;
};

export const metadata = {
  title: "Vote Confirmed",
};

export default async function VoteSuccessPage({ searchParams }: Props) {
  const { competitor: competitorId } = await searchParams;
  const competitor = competitorId
    ? await getCompetitorById(competitorId)
    : null;

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-28">
        <div className="max-w-lg border border-border bg-card/90 p-8 text-center shadow-[0_24px_60px_-40px_rgba(28,24,20,0.55)]">
          <p className="text-xs uppercase tracking-[0.28em] text-brass">
            Success
          </p>
          <h1 className="mt-3 font-display text-4xl">Your vote is locked in</h1>
          <p className="mt-4 text-muted-foreground">
            Thank you for voting
            {competitor
              ? ` for ${formatCompetitionNumber(competitor.competition_number)} ${competitor.full_name}`
              : ""}
            . Each number can vote only once in this competition.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/competitors"
              className="bg-ink px-5 py-3 text-sm text-stone hover:bg-brass"
            >
              Browse styles
            </Link>
            <Link
              href="/"
              className="border border-border px-5 py-3 text-sm hover:border-brass"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
