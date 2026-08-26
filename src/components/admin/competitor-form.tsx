"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  createCompetitor,
  updateCompetitor,
  uploadCompetitorImage,
} from "@/lib/actions/admin";
import {
  competitorFormSchema,
  type CompetitorFormValues,
} from "@/lib/validations";
import type { Competition, CompetitorWithImages } from "@/types/database";
import { Button } from "@/components/ui/button";
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
  competitions: Competition[];
  competitor?: CompetitorWithImages;
};

export function CompetitorForm({ competitions, competitor }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    competitor?.profile_photo_url ?? null
  );

  const form = useForm<CompetitorFormValues>({
    resolver: zodResolver(competitorFormSchema),
    defaultValues: {
      competition_id:
        competitor?.competition_id ?? competitions[0]?.id ?? "",
      full_name: competitor?.full_name ?? "",
      barber_name: competitor?.barber_name ?? "",
      competition_number: competitor?.competition_number ?? 1,
      short_bio: competitor?.short_bio ?? "",
      description: competitor?.description ?? "",
      phone: competitor?.phone ?? "",
      status: competitor?.status ?? "published",
      instagram_url: competitor?.instagram_url ?? "",
      tiktok_url: competitor?.tiktok_url ?? "",
      facebook_url: competitor?.facebook_url ?? "",
      youtube_url: competitor?.youtube_url ?? "",
      telegram_url: competitor?.telegram_url ?? "",
      website_url: competitor?.website_url ?? "",
    },
  });

  const currentStatus = form.watch("status");
  const previewNote = useMemo(
    () =>
      currentStatus !== "published"
        ? "Status is not Published — this competitor will stay hidden on the public site."
        : "Published competitors appear on the public gallery and detail pages.",
    [currentStatus]
  );

  function onPhotoChange(file: File | null) {
    setPhotoFile(file);
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
    } else if (competitor?.profile_photo_url) {
      setProfilePreview(competitor.profile_photo_url);
    } else {
      setProfilePreview(null);
    }
  }

  function onSubmit(values: CompetitorFormValues) {
    startTransition(async () => {
      if (competitor) {
        const result = await updateCompetitor(competitor.id, values);
        if (!result.success) {
          toast.error(result.error);
          return;
        }

        if (photoFile) {
          setUploading(true);
          const formData = new FormData();
          formData.append("file", photoFile);
          const upload = await uploadCompetitorImage({
            competitorId: competitor.id,
            imageType: "profile",
            formData,
          });
          setUploading(false);
          if (!upload.success) {
            toast.error(upload.error);
            return;
          }
          setProfilePreview(upload.data.url);
          setPhotoFile(null);
        }

        toast.success("Competitor updated");
        router.push("/admin/competitors");
      } else {
        if (!photoFile) {
          toast.error("Please upload a photo for this competitor.");
          return;
        }

        const formData = new FormData();
        formData.append("file", photoFile);
        const result = await createCompetitor(values, formData);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        toast.success("Competitor created");
        router.push("/admin/competitors");
      }
      router.refresh();
    });
  }

  return (
    <form className="mx-auto max-w-2xl space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2 rounded-lg border border-border bg-card/80 p-5">
        <Label htmlFor="photo">Photo</Label>
        <Input
          id="photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={uploading || pending}
          onChange={(e) => onPhotoChange(e.target.files?.[0] ?? null)}
        />
        <p className="text-xs text-muted-foreground">
          One photo shown to voters on the list and profile. JPG, PNG, or WEBP — max 5MB.
          {!competitor ? " Required when creating." : ""}
        </p>
        {profilePreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profilePreview}
            alt="Competitor photo"
            className="mt-3 h-40 w-40 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label>Competition</Label>
        <Select
          value={form.watch("competition_id")}
          onValueChange={(value) => {
            if (value) form.setValue("competition_id", value);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select competition" />
          </SelectTrigger>
          <SelectContent>
            {competitions.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input id="full_name" {...form.register("full_name")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barber_name">Barber Name</Label>
          <Input id="barber_name" {...form.register("barber_name")} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="competition_number">Competition Number</Label>
          <Input
            id="competition_number"
            type="number"
            {...form.register("competition_number", { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.watch("status")}
            onValueChange={(value) => {
              if (value) {
                form.setValue(
                  "status",
                  value as CompetitorFormValues["status"]
                );
              }
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["draft", "published", "hidden"].map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{previewNote}</p>
      <div className="space-y-2">
        <Label htmlFor="short_bio">Short Bio</Label>
        <Input id="short_bio" {...form.register("short_bio")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Detailed Description</Label>
        <Textarea id="description" rows={5} {...form.register("description")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (admin only)</Label>
        <Input id="phone" {...form.register("phone")} />
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="font-display text-xl">Social media links</h3>
        <p className="text-xs text-muted-foreground">
          Optional. Shown on the public competitor profile.
        </p>
        {(
          [
            ["instagram_url", "Instagram URL"],
            ["tiktok_url", "TikTok URL"],
            ["facebook_url", "Facebook URL"],
            ["youtube_url", "YouTube URL"],
            ["telegram_url", "Telegram URL"],
            ["website_url", "Website URL"],
          ] as const
        ).map(([name, label]) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              placeholder="https://"
              {...form.register(name)}
            />
            {form.formState.errors[name] && (
              <p className="text-sm text-destructive">
                {form.formState.errors[name]?.message}
              </p>
            )}
          </div>
        ))}
      </div>

      <Button type="submit" disabled={pending || uploading} className="bg-ink text-stone">
        {pending || uploading
          ? "Saving..."
          : competitor
            ? "Update competitor"
            : "Create competitor"}
      </Button>
    </form>
  );
}
