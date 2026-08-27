import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** Use fill layout (parent must be position:relative) */
  fill?: boolean;
  width?: number;
  height?: number;
};

function isApiMedia(src: string) {
  return src.includes("/api/media/");
}

/**
 * Competitor photos from /api/media must skip Next image optimization
 * (optimizer often fails and shows only alt text on list pages).
 */
export function CompetitorPhoto({
  src,
  alt,
  className,
  sizes = "160px",
  priority = false,
  fill = true,
  width,
  height,
}: Props) {
  if (!src) return null;

  if (isApiMedia(src)) {
    if (fill) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={cn("absolute inset-0 h-full w-full object-cover", className)}
        />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={cn("object-cover", className)}
      />
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        sizes={sizes}
        priority={priority}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 160}
      height={height ?? 160}
      className={cn("object-cover", className)}
      sizes={sizes}
      priority={priority}
    />
  );
}
