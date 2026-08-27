"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { submitVote } from "@/lib/actions/voting";
import {
  voteRequestSchema,
  type VoteRequestValues,
} from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCompetitionNumber } from "@/lib/utils/format";
import type { Competitor } from "@/types/database";

type Props = {
  competitor: Competitor;
  competitionId: string;
  competitionName: string;
  votingOpen: boolean;
};

export function VoteForm({
  competitor,
  competitionId,
  competitionName,
  votingOpen,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const form = useForm<VoteRequestValues>({
    resolver: zodResolver(voteRequestSchema),
    defaultValues: {
      competition_id: competitionId,
      competitor_id: competitor.id,
      voter_name: "",
      voter_phone: "",
    },
  });

  if (!votingOpen) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#141414] p-6">
        <h2 className="text-2xl font-semibold">Voting closed</h2>
        <p className="mt-2 text-white/60">
          Public voting ended on Sunday, August 30, 2026 at 6:00 PM (Addis
          Ababa). No more votes can be submitted.
        </p>
        <p className="mt-4 text-sm text-[#e8c878]">
          The final will be held by judges at Vamdas Cinema, Megenagna.
        </p>
      </div>
    );
  }

  function onSubmit(values: VoteRequestValues) {
    startTransition(async () => {
      const result = await submitVote(values);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success(
        `Vote successful for ${formatCompetitionNumber(competitor.competition_number)} ${competitor.full_name}`
      );
      router.push(`/vote/success?competitor=${competitor.id}`);
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#141414] p-6 text-white">
      <p className="text-xs uppercase tracking-[0.2em] text-[#e8c878]">Vote</p>
      <h1 className="mt-2 text-2xl font-semibold">{competitionName}</h1>

      <div className="mt-5 rounded-xl border border-white/10 bg-black/40 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">
          Selected
        </p>
        <p className="mt-1 text-xl font-semibold">
          {formatCompetitionNumber(competitor.competition_number)}{" "}
          {competitor.full_name}
        </p>
      </div>

      <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="voter_name" className="text-white/80">
            Full Name
          </Label>
          <Input
            id="voter_name"
            className="border-white/15 bg-black/40 text-white"
            placeholder="Your full name"
            {...form.register("voter_name")}
          />
          {form.formState.errors.voter_name && (
            <p className="text-sm text-red-400">
              {form.formState.errors.voter_name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="voter_phone" className="text-white/80">
            Phone Number
          </Label>
          <Input
            id="voter_phone"
            type="tel"
            className="border-white/15 bg-black/40 text-white"
            placeholder="+251 9xx xxx xxx"
            {...form.register("voter_phone")}
          />
          {form.formState.errors.voter_phone && (
            <p className="text-sm text-red-400">
              {form.formState.errors.voter_phone.message}
            </p>
          )}
          <p className="text-xs text-white/45">One vote per phone number.</p>
        </div>

        <Button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-gradient-to-r from-[#9b1c2e] to-[#d94a2a] text-white hover:opacity-90"
          size="lg"
        >
          {pending ? "Submitting..." : "Submit vote"}
        </Button>
      </form>
    </div>
  );
}
