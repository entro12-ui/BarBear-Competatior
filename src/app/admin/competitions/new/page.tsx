import { AdminShell } from "@/components/admin/admin-shell";
import { CompetitionForm } from "@/components/admin/competition-form";

export default function NewCompetitionPage() {
  return (
    <AdminShell title="New competition">
      <CompetitionForm />
    </AdminShell>
  );
}
