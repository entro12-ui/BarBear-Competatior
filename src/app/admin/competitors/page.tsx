import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { DeleteCompetitorButton } from "@/components/admin/delete-competitor-button";
import { CompetitorPhoto } from "@/components/competitors/competitor-photo";
import {
  getCompetitions,
  getCompetitors,
} from "@/lib/actions/queries";
import { formatCompetitionNumber } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminCompetitorsPage() {
  const competitions = await getCompetitions();

  const competitors = (
    await Promise.all(
      competitions.map(async (competition) => {
        const rows = await getCompetitors(competition.id, {
          includeDrafts: true,
        });
        return rows.map((competitor) => ({
          ...competitor,
          competitionName: competition.name,
        }));
      })
    )
  )
    .flat()
    .sort((a, b) => {
      if (a.competitionName !== b.competitionName) {
        return a.competitionName.localeCompare(b.competitionName);
      }
      return String(a.competition_number).localeCompare(
        String(b.competition_number),
        undefined,
        { numeric: true, sensitivity: "base" }
      );
    });

  return (
    <AdminShell title="Competitors">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">
          {competitors.length === 0
            ? competitions.length === 0
              ? "Create a competition first, then add competitors."
              : "No competitors yet. Add one to get started."
            : `${competitors.length} competitor${competitors.length === 1 ? "" : "s"} — edit or delete below.`}
        </p>
        <Link
          href="/admin/competitors/new"
          className={cn(buttonVariants(), "bg-ink text-stone hover:bg-brass")}
        >
          New competitor
        </Link>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Barber</th>
              <th className="px-4 py-3">Competition</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((competitor) => (
              <tr key={competitor.id} className="border-b border-border/70">
                <td className="px-4 py-3">
                  <div className="relative size-12 overflow-hidden rounded-md bg-muted">
                    {competitor.profile_photo_url ? (
                      <CompetitorPhoto
                        src={competitor.profile_photo_url}
                        alt={competitor.full_name}
                        sizes="48px"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                        N/A
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCompetitionNumber(competitor.competition_number)}
                </td>
                <td className="px-4 py-3 font-medium">{competitor.full_name}</td>
                <td className="px-4 py-3">{competitor.barber_name}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {competitor.competitionName}
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{competitor.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/competitors/${competitor.id}/edit`}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" })
                      )}
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
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No competitors yet.{" "}
                  <Link
                    href="/admin/competitors/new"
                    className="text-brass underline"
                  >
                    Add the first one
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
