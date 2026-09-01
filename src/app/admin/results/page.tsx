import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ResultsChart } from "@/components/admin/results-chart";
import { Badge } from "@/components/ui/badge";
import {
  getAdminVotes,
  getCompetitionResults,
  getCompetitionVoteTotal,
  getCompetitions,
  getPrimaryCompetition,
} from "@/lib/actions/queries";
import { formatCompetitionNumber } from "@/lib/utils/format";

type Props = {
  searchParams: Promise<{ competition?: string }>;
};

export default async function AdminResultsPage({ searchParams }: Props) {
  const { competition: competitionIdParam } = await searchParams;
  const competitions = await getCompetitions();
  const fallback = await getPrimaryCompetition();
  const competition =
    competitions.find((c) => c.id === competitionIdParam) ?? fallback;

  const [results, totalVotes, recentVotes] = competition
    ? await Promise.all([
        getCompetitionResults(competition.id, { includeAllStatuses: true }),
        getCompetitionVoteTotal(competition.id),
        getAdminVotes({ competitionId: competition.id, page: 1, pageSize: 50 }),
      ])
    : [[], 0, { votes: [], total: 0 }];

  const listedVotes = results.reduce((sum, row) => sum + row.total_votes, 0);

  return (
    <AdminShell title="Results">
      {!competition ? (
        <p className="text-muted-foreground">No competition selected.</p>
      ) : (
        <div className="space-y-8">
          {competitions.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {competitions.map((c) => (
                <Link
                  key={c.id}
                  href={`/admin/results?competition=${c.id}`}
                  className={
                    c.id === competition.id
                      ? "bg-ink px-3 py-1.5 text-sm text-stone"
                      : "border border-border px-3 py-1.5 text-sm hover:border-brass"
                  }
                >
                  {c.name}
                </Link>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{competition.name}</p>
              <p className="font-display text-3xl">
                {totalVotes.toLocaleString()} total votes
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {listedVotes.toLocaleString()} shown in leaderboard ·{" "}
                {recentVotes.total.toLocaleString()} records in database
              </p>
            </div>
          </div>

          <ResultsChart results={results} />

          <div className="overflow-x-auto border border-border bg-card">
            <div className="border-b border-border bg-muted/50 px-4 py-3">
              <h2 className="font-display text-xl">Leaderboard</h2>
              <p className="text-xs text-muted-foreground">
                Sorted by most votes (highest first)
              </p>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Competitor</th>
                  <th className="px-4 py-3">Barber Name</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total Votes</th>
                  <th className="px-4 py-3">Vote Percentage</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={row.competitor_id} className="border-b border-border/70">
                    <td className="px-4 py-3 font-display text-xl text-brass">
                      #{index + 1}
                    </td>
                    <td className="px-4 py-3">
                      {formatCompetitionNumber(row.competition_number)}{" "}
                      {row.full_name}
                    </td>
                    <td className="px-4 py-3">{row.barber_name}</td>
                    <td className="px-4 py-3">
                      {row.status && row.status !== "published" ? (
                        <Badge variant="secondary">{row.status}</Badge>
                      ) : (
                        <Badge variant="outline">published</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.total_votes.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {row.vote_percentage}%
                    </td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No published competitors yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto border border-border bg-card">
            <div className="border-b border-border bg-muted/50 px-4 py-3">
              <h2 className="font-display text-xl">Recent votes</h2>
              <p className="text-xs text-muted-foreground">
                Newest first (latest 50)
              </p>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Voter</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Voted for</th>
                </tr>
              </thead>
              <tbody>
                {recentVotes.votes.map((vote) => (
                  <tr key={vote.id} className="border-b border-border/70">
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {new Date(vote.created_at).toLocaleString("en-ET", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">{vote.voter_name}</td>
                    <td className="px-4 py-3">{vote.voter_phone}</td>
                    <td className="px-4 py-3">
                      {vote.competitor
                        ? `${formatCompetitionNumber(vote.competitor.competition_number)} ${vote.competitor.full_name}`
                        : "—"}
                    </td>
                  </tr>
                ))}
                {recentVotes.votes.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No votes yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
