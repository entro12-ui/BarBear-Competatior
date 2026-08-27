"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useTransition,
  type ComponentProps,
  type MouseEvent,
} from "react";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Link> & {
  pendingClassName?: string;
};

/**
 * Navigates on click via startTransition so the UI can react immediately
 * (loading.tsx + progress bar) instead of feeling stuck on the current page.
 */
export function InstantLink({
  href,
  className,
  pendingClassName,
  onClick,
  children,
  replace,
  ...props
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();
    const url = typeof href === "string" ? href : href.pathname || "/";
    startTransition(() => {
      if (replace) router.replace(url);
      else router.push(url);
    });
  }

  return (
    <Link
      href={href}
      {...props}
      onClick={handleClick}
      className={cn(className, pending && (pendingClassName ?? "opacity-70"))}
      aria-busy={pending || undefined}
    >
      {children}
    </Link>
  );
}
