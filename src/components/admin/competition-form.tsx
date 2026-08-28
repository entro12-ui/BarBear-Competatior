"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createCompetition,
  updateCompetition,
} from "@/lib/actions/admin";
import { slugify } from "@/lib/utils/format";
import {
  competitionFormSchema,
  type CompetitionFormValues,
} from "@/lib/validations";
import type { Competition } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  competition?: Competition;
};

export function CompetitionForm({ competition }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [publicResults, setPublicResults] = useState(
    competition?.public_results ?? false
  );

  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionFormSchema),
    defaultValues: {
      name: competition?.name ?? "",
      slug: competition?.slug ?? "",
      description: competition?.description ?? "",
      rules:
        competition?.rules ??
        "Each person can vote only once.\nOne vote is allowed per email address.\nOne vote is allowed per phone number.\nOne vote is allowed per device.\nYou must select only one competitor.\nMultiple votes using the same email, phone, or device are not allowed.\nAdmin can close voting when the competition ends.",
      location: competition?.location ?? "",
      start_date: competition?.start_date?.slice(0, 16) ?? "",
      end_date: competition?.end_date?.slice(0, 16) ?? "",
      status: competition?.status ?? "draft",
      public_results: competition?.public_results ?? false,
    },
  });

  function onSubmit(values: CompetitionFormValues) {
    startTransition(async () => {
      const payload = { ...values, public_results: publicResults };
      const result = competition
        ? await updateCompetition(competition.id, payload)
        : await createCompetition(payload);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(competition ? "Competition updated" : "Competition created");
      router.push("/admin/competitions");
      router.refresh();
    });
  }

  return (
    <form className="max-w-2xl space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...form.register("name")}
          onBlur={(e) => {
            if (!form.getValues("slug")) {
              form.setValue("slug", slugify(e.target.value));
            }
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input id="slug" {...form.register("slug")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" rows={4} {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="rules">Rules</Label>
        <Textarea id="rules" rows={5} {...form.register("rules")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <Input id="location" {...form.register("location")} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start date</Label>
          <Input
            id="start_date"
            type="datetime-local"
            {...form.register("start_date")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End date</Label>
          <Input
            id="end_date"
            type="datetime-local"
            {...form.register("end_date")}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={form.watch("status")}
          onValueChange={(value) => {
            if (value) {
              form.setValue(
                "status",
                value as CompetitionFormValues["status"]
              );
            }
          }}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["draft", "upcoming", "active", "closed", "completed"].map(
              (status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={publicResults}
          onCheckedChange={(checked) => setPublicResults(Boolean(checked))}
        />
        Show results publicly
      </label>
      <Button type="submit" disabled={pending} className="bg-ink text-stone">
        {pending ? "Saving..." : competition ? "Update competition" : "Create competition"}
      </Button>
    </form>
  );
}
