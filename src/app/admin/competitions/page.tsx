import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { getCompetitions } from "@/lib/actions/queries";
import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

export default async function AdminCompetitionsPage() {
  const competitions = await getCompetitions();

  return (
    <AdminShell title="Competitions">
      <div className="mb-6 flex justify-end">
        <Link
          href="/admin/competitions/new"
          className="bg-ink px-4 py-2 text-sm text-stone"
        >
          New competition
        </Link>
      </div>
      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Dates</th>
              <th className="px-4 py-3">Public results</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {competitions.map((competition) => (
              <tr key={competition.id} className="border-b border-border/70">
                <td className="px-4 py-3 font-medium">{competition.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{competition.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {formatDate(competition.start_date)} →{" "}
                  {formatDate(competition.end_date)}
                </td>
                <td className="px-4 py-3">
                  {competition.public_results ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/competitions/${competition.id}/edit`}
                    className="text-brass"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {competitions.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No competitions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
