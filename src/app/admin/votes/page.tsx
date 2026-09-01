import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { VotesTable } from "@/components/admin/votes-table";
import {
  getAdminVotes,
  getCompetitions,
  getCompetitors,
  getPrimaryCompetition,
} from "@/lib/actions/queries";

type Props = {
  searchParams: Promise<{
    search?: string;
    competitorId?: string;
    page?: string;
  }>;
};

export default async function AdminVotesPage({ searchParams }: Props) {
  const params = await searchParams;
  const competitions = await getCompetitions();
  const primary = await getPrimaryCompetition();
  const page = Number(params.page ?? "1") || 1;
  const pageSize = 20;

  const [{ votes, total }, competitors] = await Promise.all([
    getAdminVotes({
      competitionId: primary?.id,
      competitorId: params.competitorId,
      search: params.search,
      page,
      pageSize,
    }),
    primary
      ? getCompetitors(primary.id, { includeDrafts: true })
      : Promise.resolve([]),
  ]);

  return (
    <AdminShell title="Votes">
      <Suspense fallback={<p>Loading votes...</p>}>
        <VotesTable
          votes={votes}
          total={total}
          competitors={competitors}
          competitionId={primary?.id}
          page={page}
          pageSize={pageSize}
        />
      </Suspense>
    </AdminShell>
  );
}
