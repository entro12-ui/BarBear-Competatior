import { AdminShell } from "@/components/admin/admin-shell";
import { ResultsChart } from "@/components/admin/results-chart";
import {
  getCompetitionResults,
  getCompetitions,
} from "@/lib/actions/queries";
import { formatCompetitionNumber } from "@/lib/utils/format";

export default async function AdminResultsPage() {
  const competitions = await getCompetitions();
  const primary = competitions[0];
  const results = primary
    ? await getCompetitionResults(primary.id)
    : [];
  const totalVotes = results.reduce((sum, row) => sum + row.total_votes, 0);

  return (
    <AdminShell title="Results">
      {!primary ? (
        <p className="text-muted-foreground">No competition selected.</p>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">{primary.name}</p>
              <p className="font-display text-3xl">{totalVotes} total votes</p>
            </div>
          </div>

          <ResultsChart results={results} />

          <div className="overflow-x-auto border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Competitor</th>
                  <th className="px-4 py-3">Barber Name</th>
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
                    <td className="px-4 py-3">{row.total_votes}</td>
                    <td className="px-4 py-3">{row.vote_percentage}%</td>
                  </tr>
                ))}
                {results.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No published competitors yet.
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
