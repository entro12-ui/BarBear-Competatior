"use client";

import { useState } from "react";
import { toast } from "sonner";

type Props = {
  title: string;
  text: string;
  /** Absolute URL or path starting with / */
  url: string;
};

function resolveUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);
      // Prefer current host when env points at localhost but user is on LAN
      if (
        typeof window !== "undefined" &&
        (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") &&
        window.location.hostname !== parsed.hostname
      ) {
        return `${window.location.origin}${parsed.pathname}${parsed.search}`;
      }
    } catch {
      /* keep as-is */
    }
    return url;
  }
  if (typeof window !== "undefined") {
    return `${window.location.origin}${url.startsWith("/") ? url : `/${url}`}`;
  }
  return url;
}

async function copyToClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    /* fall through */
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, value.length);
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function ShareCompetitorButton({ title, text, url }: Props) {
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    setBusy(true);
    const link = resolveUrl(url);

    try {
      // Native share sheet (phones) — skip if it would copy a bad localhost link
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        (!navigator.canShare || navigator.canShare({ title, text, url: link }))
      ) {
        try {
          await navigator.share({ title, text, url: link });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          // Fall through to copy
        }
      }

      const copied = await copyToClipboard(link);
      if (copied) {
        toast.success("Link copied. Share it so others can vote.");
        return;
      }

      // Last resort: show the link so the user can copy manually
      window.prompt("Copy this link to share:", link);
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
      {busy ? "Sharing..." : "Share"}
    </button>
  );
}
