import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { CompetitionForm } from "@/components/admin/competition-form";
import { getCompetitionById } from "@/lib/actions/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCompetitionPage({ params }: Props) {
  const { id } = await params;
  const competition = await getCompetitionById(id);
  if (!competition) notFound();

  return (
    <AdminShell title="Edit competition">
      <CompetitionForm competition={competition} />
    </AdminShell>
  );
}
