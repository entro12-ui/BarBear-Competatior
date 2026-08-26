import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { CompetitorForm } from "@/components/admin/competitor-form";
import {
  getCompetitions,
  getCompetitorById,
} from "@/lib/actions/queries";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditCompetitorPage({ params }: Props) {
  const { id } = await params;
  const [competitor, competitions] = await Promise.all([
    getCompetitorById(id),
    getCompetitions(),
  ]);

  if (!competitor) notFound();

  return (
    <AdminShell title="Edit competitor">
      <CompetitorForm competitions={competitions} competitor={competitor} />
    </AdminShell>
  );
}
