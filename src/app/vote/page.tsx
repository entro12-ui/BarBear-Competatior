import { notFound, redirect } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-chrome";
import { VoteForm } from "@/components/voting/vote-form";
import {
  getCompetitionById,
  getCompetitorById,
} from "@/lib/actions/queries";
import { isVotingOpen } from "@/lib/utils/format";

type Props = {
  searchParams: Promise<{ competitor?: string }>;
};

export const metadata = {
  title: "Cast Your Vote",
};

export default async function VotePage({ searchParams }: Props) {
  const { competitor: competitorId } = await searchParams;
  if (!competitorId) {
    redirect("/competitors");
  }

  const competitor = await getCompetitorById(competitorId);
  if (!competitor) notFound();

  const competition =
    competitor.competition ??
    (await getCompetitionById(competitor.competition_id));

  if (!competition) notFound();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <SiteHeader variant="dark" />
      <main className="mx-auto flex max-w-lg items-start justify-center px-4 pb-16 pt-24">
        <div className="w-full">
          <VoteForm
            competitor={competitor}
            competitionId={competition.id}
            competitionName={competition.name}
            votingOpen={isVotingOpen(competition)}
          />
        </div>
      </main>
    </div>
  );
}
