"use client";

import { useState } from "react";
import { toast } from "sonner";

type Props = {
  title: string;
  text: string;
  url: string;
};

export function ShareCompetitorButton({ title, text, url }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    setBusy(true);
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success("Link copied. Share it so others can vote.");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied. Share it so others can vote.");
      } catch {
        toast.error("Could not share. Copy the page URL manually.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#e8c878] disabled:opacity-60"
    >
      <span aria-hidden>↗</span>
      Share
    </button>
  );
}
