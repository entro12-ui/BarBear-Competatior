"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteCompetitor } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function DeleteCompetitorButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      className="border-destructive/40 text-destructive hover:bg-destructive/10"
      onClick={() => {
        if (
          !confirm(
            "Delete this competitor? Their photo and votes will be removed."
          )
        ) {
          return;
        }
        startTransition(async () => {
          const result = await deleteCompetitor(id);
          if (!result.success) {
            toast.error(result.error);
            return;
          }
          toast.success("Competitor deleted");
          router.refresh();
        });
      }}
    >
      {pending ? "Deleting..." : "Delete"}
    </Button>
  );
}
