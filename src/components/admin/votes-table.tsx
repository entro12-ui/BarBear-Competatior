"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { formatCompetitionNumber, formatDateTime } from "@/lib/utils/format";
import type { Competitor, VoteWithRelations } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  votes: VoteWithRelations[];
  total: number;
  competitors: Competitor[];
  competitionId?: string;
  page: number;
  pageSize: number;
};

export function VotesTable({
  votes,
  total,
  competitors,
  competitionId,
  page,
  pageSize,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    if (competitionId) params.set("competitionId", competitionId);
    const competitorId = searchParams.get("competitorId");
    if (competitorId) params.set("competitorId", competitorId);
    return `/api/admin/votes/export?${params.toString()}`;
  }, [competitionId, searchParams]);

  function updateQuery(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });
    router.push(`/admin/votes?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm">Search</label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name or number"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            updateQuery({ search: search || null, page: "1" })
          }
        >
          Apply
        </Button>
        <div className="w-full space-y-2 md:w-56">
          <label className="text-sm">Competitor</label>
          <Select
            value={searchParams.get("competitorId") ?? "all"}
            onValueChange={(value) => {
              if (!value) return;
              updateQuery({
                competitorId: value === "all" ? null : value,
                page: "1",
              });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="All competitors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All competitors</SelectItem>
              {competitors.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {formatCompetitionNumber(c.competition_number)} {c.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <a
          href={exportHref}
          className="inline-flex h-8 items-center justify-center rounded-lg bg-ink px-3 text-sm text-stone hover:bg-brass"
        >
          Export CSV
        </a>
      </div>

      <div className="overflow-x-auto border border-border bg-card">
        <div className="border-b border-border bg-muted/50 px-4 py-3">
          <p className="text-xs text-muted-foreground">
            Sorted by vote date — newest first
          </p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-4 py-3">Vote Date</th>
              <th className="px-4 py-3">Voter Name</th>
              <th className="px-4 py-3">Number</th>
              <th className="px-4 py-3">Selected Competitor</th>
              <th className="px-4 py-3">Competition</th>
            </tr>
          </thead>
          <tbody>
            {votes.map((vote) => (
              <tr key={vote.id} className="border-b border-border/70">
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                  {formatDateTime(vote.created_at)}
                </td>
                <td className="px-4 py-3">{vote.voter_name}</td>
                <td className="px-4 py-3">{vote.voter_phone}</td>
                <td className="px-4 py-3">
                  {vote.competitor
                    ? `${formatCompetitionNumber(vote.competitor.competition_number)} ${vote.competitor.full_name}`
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {vote.competition?.name ?? "—"}
                </td>
              </tr>
            ))}
            {votes.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  No votes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <p className="text-muted-foreground">
          {total} total votes · Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          {page > 1 ? (
            <Link
              href={`/admin/votes?${new URLSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                page: String(page - 1),
              }).toString()}`}
              className="border border-border px-3 py-1.5 text-sm"
            >
              Previous
            </Link>
          ) : (
            <span className="border border-border px-3 py-1.5 text-sm opacity-40">
              Previous
            </span>
          )}
          {page < totalPages ? (
            <Link
              href={`/admin/votes?${new URLSearchParams({
                ...Object.fromEntries(searchParams.entries()),
                page: String(page + 1),
              }).toString()}`}
              className="border border-border px-3 py-1.5 text-sm"
            >
              Next
            </Link>
          ) : (
            <span className="border border-border px-3 py-1.5 text-sm opacity-40">
              Next
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
