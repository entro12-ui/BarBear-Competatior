import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  getAdminDashboardStats,
  getCompetitions,
} from "@/lib/actions/queries";
import { Badge } from "@/components/ui/badge";

export default async function AdminDashboardPage() {
  const competitions = await getCompetitions();
  const primary = competitions[0];
  const stats = await getAdminDashboardStats(primary?.id);

  const cards = [
    { label: "Total Competitors", value: stats.totalCompetitors },
    { label: "Total Votes", value: stats.totalVotes },
    { label: "Unique Voters", value: stats.uniqueVoters },
    {
      label: "Competition Status",
      value: stats.competitionStatus ?? "—",
    },
  ];

  return (
    <AdminShell title="Dashboard">
      {!primary ? (
        <div className="border border-dashed border-border p-8">
          <p className="font-display text-2xl">No competitions yet</p>
          <Link
            href="/admin/competitions/new"
            className="mt-4 inline-block text-brass"
          >
            Create your first competition
          </Link>
        </div>
      ) : (
        <>
          <p className="mb-6 text-muted-foreground">
            Showing stats for <strong>{primary.name}</strong>
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.label}
                className="border border-border bg-card p-5"
              >
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-3 font-display text-3xl capitalize">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Current leading competitor
            </p>
            {stats.leadingCompetitor ? (
              <div className="mt-3 flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-3xl">
                    {stats.leadingCompetitor.full_name}
                  </p>
                  <p className="text-brass">
                    {stats.leadingCompetitor.barber_name}
                  </p>
                </div>
                <Badge variant="secondary">
                  {stats.leadingCompetitor.total_votes} votes
                </Badge>
              </div>
            ) : (
              <p className="mt-3 text-muted-foreground">No votes yet.</p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/admin/competitors/new"
              className="bg-ink px-4 py-2 text-sm text-stone"
            >
              Add competitor
            </Link>
            <Link
              href="/admin/votes"
              className="border border-border px-4 py-2 text-sm"
            >
              View votes
            </Link>
            <Link
              href="/admin/results"
              className="border border-border px-4 py-2 text-sm"
            >
              View results
            </Link>
          </div>
        </>
      )}
    </AdminShell>
  );
}
