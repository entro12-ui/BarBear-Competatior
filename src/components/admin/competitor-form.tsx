"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { createCompetitor, updateCompetitor } from "@/lib/actions/admin";
import type { ActionResult } from "@/lib/actions/queries";
import { compressImageFile } from "@/lib/utils/compress-image";
import type { Competition, CompetitorWithImages } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  competitions: Competition[];
  competitor?: CompetitorWithImages;
};

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="bg-ink text-stone">
      {pending
        ? "Saving..."
        : isEdit
          ? "Update competitor"
          : "Create competitor"}
    </Button>
  );
}

export function CompetitorForm({ competitions, competitor }: Props) {
  const isEdit = Boolean(competitor);
  const [preview, setPreview] = useState<string | null>(
    competitor?.profile_photo_url ?? null
  );
  const [clientError, setClientError] = useState<string | null>(null);

  const boundUpdate = updateCompetitor.bind(null, competitor?.id ?? "");

  async function formAction(
    prev: ActionResult | null,
    formData: FormData
  ): Promise<ActionResult> {
    setClientError(null);
    const photo = formData.get("photo");

    if (photo instanceof File && photo.size > 0) {
      try {
        const compressed = await compressImageFile(photo);
        formData.set("photo", compressed);
      } catch {
        formData.set("photo", photo);
      }
    } else if (!isEdit) {
      return { success: false, error: "Please upload a photo for this competitor." };
    }

    try {
      return await (isEdit ? boundUpdate : createCompetitor)(prev, formData);
    } catch (error) {
      console.error(error);
      const message =
        "Upload failed (connection closed). Use a smaller JPG photo and try again.";
      setClientError(message);
      return { success: false, error: message };
    }
  }

  const [state, action] = useActionState(formAction, null as ActionResult | null);
  const error =
    clientError || (state && !state.success ? state.error : null);

  return (
    <form action={action} className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-2 rounded-lg border border-border bg-card/80 p-5">
        <Label htmlFor="photo">Photo</Label>
        <Input
          id="photo"
          name="photo"
          type="file"
          accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.bmp,.heic,.heif,.avif"
          required={!isEdit}
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPreview(
              file
                ? URL.createObjectURL(file)
                : competitor?.profile_photo_url ?? null
            );
          }}
        />
        <p className="text-xs text-muted-foreground">
          Any photo type works (JPG, PNG, WEBP, GIF, HEIC, and more). Max 5MB —
          we compress before upload.
          {!isEdit
            ? " Required."
            : " Choose a new file to replace the current photo."}
        </p>
        {preview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Competitor photo"
            className="mt-3 h-40 w-40 rounded-lg object-cover"
          />
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="competition_id">Competition</Label>
        <select
          id="competition_id"
          name="competition_id"
          required
          defaultValue={competitor?.competition_id ?? competitions[0]?.id ?? ""}
          className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
        >
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            required
            defaultValue={competitor?.full_name ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="barber_name">Barber Name</Label>
          <Input
            id="barber_name"
            name="barber_name"
            required
            defaultValue={competitor?.barber_name ?? ""}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="competition_number">Competition Number / Code</Label>
          <Input
            id="competition_number"
            name="competition_number"
            type="text"
            required
            placeholder="e.g. 12, B001, #05, A-01"
            defaultValue={competitor?.competition_number ?? ""}
          />
          <p className="text-xs text-muted-foreground">
            Number or code with letters/symbols (B001, #12, A-01…).
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={competitor?.status ?? "published"}
            className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm"
          >
            <option value="published">published</option>
            <option value="draft">draft</option>
            <option value="hidden">hidden</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="short_bio">Short Bio</Label>
        <Input
          id="short_bio"
          name="short_bio"
          defaultValue={competitor?.short_bio ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Detailed Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={competitor?.description ?? ""}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone (admin only)</Label>
        <Input
          id="phone"
          name="phone"
          defaultValue={competitor?.phone ?? ""}
        />
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="font-display text-xl">Social media links</h3>
        <p className="text-xs text-muted-foreground">
          Optional. Use full links starting with https://
        </p>
        {(
          [
            ["instagram_url", "Instagram URL", competitor?.instagram_url],
            ["tiktok_url", "TikTok URL", competitor?.tiktok_url],
            ["facebook_url", "Facebook URL", competitor?.facebook_url],
            ["youtube_url", "YouTube URL", competitor?.youtube_url],
            ["telegram_url", "Telegram URL", competitor?.telegram_url],
            ["website_url", "Website URL", competitor?.website_url],
          ] as const
        ).map(([name, label, value]) => (
          <div key={name} className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
              id={name}
              name={name}
              placeholder="https://"
              defaultValue={value ?? ""}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <SubmitButton isEdit={isEdit} />
    </form>
  );
}
