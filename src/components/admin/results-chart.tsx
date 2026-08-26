"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCompetitionNumber } from "@/lib/utils/format";
import type { CompetitionResult } from "@/types/database";

export function ResultsChart({ results }: { results: CompetitionResult[] }) {
  const data = results.map((row) => ({
    name: `${formatCompetitionNumber(row.competition_number)} ${row.full_name}`,
    votes: row.total_votes,
    percentage: row.vote_percentage,
  }));

  if (data.length === 0) {
    return (
      <p className="text-muted-foreground">No results to chart yet.</p>
    );
  }

  return (
    <div className="h-80 w-full border border-border bg-card p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cfc5b6" />
          <XAxis
            dataKey="name"
            angle={-20}
            textAnchor="end"
            interval={0}
            height={70}
            tick={{ fontSize: 11 }}
          />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="votes" fill="#9a6b2f" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
