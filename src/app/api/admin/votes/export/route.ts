import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatCompetitionNumber } from "@/lib/utils/format";

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get("competitionId");
  const competitorId = searchParams.get("competitorId");

  const filters: string[] = [];
  const values: unknown[] = [];

  if (competitionId) {
    values.push(competitionId);
    filters.push(`v.competition_id = $${values.length}`);
  }
  if (competitorId) {
    values.push(competitorId);
    filters.push(`v.competitor_id = $${values.length}`);
  }

  const where = filters.length ? `where ${filters.join(" and ")}` : "";

  const result = await query<{
    voter_name: string;
    voter_phone: string;
    created_at: string;
    competitor_full_name: string | null;
    competitor_barber_name: string | null;
    competitor_number: number | null;
    competition_name: string | null;
  }>(
    `select
       v.voter_name,
       v.voter_phone,
       v.created_at,
       c.full_name as competitor_full_name,
       c.barber_name as competitor_barber_name,
       c.competition_number as competitor_number,
       comp.name as competition_name
     from votes v
     left join competitors c on c.id = v.competitor_id
     left join competitions comp on comp.id = v.competition_id
     ${where}
     order by v.created_at desc`,
    values
  );

  const header = [
    "Voter Name",
    "Number",
    "Selected Competitor",
    "Barber Name",
    "Competition",
    "Vote Date",
  ];

  const rows = result.rows.map((vote) =>
    [
      vote.voter_name,
      vote.voter_phone,
      vote.competitor_number != null && vote.competitor_full_name
        ? `${formatCompetitionNumber(vote.competitor_number)} ${vote.competitor_full_name}`
        : "",
      vote.competitor_barber_name ?? "",
      vote.competition_name ?? "",
      vote.created_at,
    ]
      .map((value) => `"${String(value).replace(/"/g, '""')}"`)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="votes-export.csv"',
    },
  });
}
