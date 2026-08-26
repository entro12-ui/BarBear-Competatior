import { AdminShell } from "@/components/admin/admin-shell";
import { CompetitorForm } from "@/components/admin/competitor-form";
import { getCompetitions } from "@/lib/actions/queries";

export default async function NewCompetitorPage() {
  const competitions = await getCompetitions();

  return (
    <AdminShell title="New competitor">
      {competitions.length === 0 ? (
        <p className="text-muted-foreground">
          Create a competition before adding competitors.
        </p>
      ) : (
        <CompetitorForm competitions={competitions} />
      )}
    </AdminShell>
  );
}
