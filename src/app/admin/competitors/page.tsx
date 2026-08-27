import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getCompetitions,
  getCompetitors,
} from "@/lib/actions/queries";
import { formatCompetitionNumber } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { DeleteCompetitorButton } from "@/components/admin/delete-competitor-button";

export default async function AdminCompetitorsPage() {
  const competitions = await getCompetitions();
  const primary = competitions[0];
  const competitors = primary
    ? await getCompetitors(primary.id, { includeDrafts: true })
    : [];

  return (
    <AdminShell title="Competitors">
      <div className="mb-6 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {primary
            ? `Managing competitors for ${primary.name}`
            : "Create a competition first."}
        </p>
        <Link
          href="/admin/competitors/new"
          className="bg-ink px-4 py-2 text-sm text-stone"
        >
          New competitor
        </Link>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Barber</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {competitors.map((competitor) => (
              <tr key={competitor.id} className="border-b border-border/70">
                <td className="px-4 py-3">
                  {formatCompetitionNumber(competitor.competition_number)}
                </td>
                <td className="px-4 py-3 font-medium">{competitor.full_name}</td>
                <td className="px-4 py-3">{competitor.barber_name}</td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{competitor.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  {competitor.profile_photo_url ? "Yes" : "No"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-3">
                    <Link
                      href={`/admin/competitors/${competitor.id}/edit`}
                      className="text-brass"
                    >
                      Edit
                    </Link>
                    <DeleteCompetitorButton id={competitor.id} />
                  </div>
                </td>
              </tr>
            ))}
            {competitors.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No competitors yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
