"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  IMAGE_TYPE_LABELS,
  STYLE_IMAGE_TYPES,
  type CompetitorImage,
  type ImageType,
} from "@/types/database";

type Props = {
  images: CompetitorImage[];
  competitorName: string;
};

export function StyleGallery({ images, competitorName }: Props) {
  const [active, setActive] = useState<Exclude<ImageType, "profile"> | null>(
    null
  );

  const byType = Object.fromEntries(
    images.map((img) => [img.image_type, img])
  ) as Partial<Record<ImageType, CompetitorImage>>;

  const activeImage = active ? byType[active] : null;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {STYLE_IMAGE_TYPES.map((type, index) => {
          const image = byType[type];
          return (
            <button
              key={type}
              type="button"
              onClick={() => image && setActive(type)}
              disabled={!image}
              className="group relative aspect-[4/5] overflow-hidden border border-border bg-muted text-left transition hover:border-brass disabled:cursor-default"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              {image ? (
                <Image
                  src={image.image_url}
                  alt={`${competitorName} — ${IMAGE_TYPE_LABELS[type]}`}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {IMAGE_TYPE_LABELS[type]} unavailable
                </div>
              )}
              <span className="absolute left-3 top-3 bg-ink/85 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone backdrop-blur-sm">
                {IMAGE_TYPE_LABELS[type]}
              </span>
            </button>
          );
        })}
      </div>

      <Dialog open={Boolean(activeImage)} onOpenChange={() => setActive(null)}>
        <DialogContent className="max-w-4xl border-border bg-card p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="font-display text-2xl">
              {active ? IMAGE_TYPE_LABELS[active] : "Style"}
            </DialogTitle>
          </DialogHeader>
          {activeImage && (
            <div className="relative aspect-[4/5] w-full bg-muted sm:aspect-[16/11]">
              <Image
                src={activeImage.image_url}
                alt={active ? IMAGE_TYPE_LABELS[active] : "Style"}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
