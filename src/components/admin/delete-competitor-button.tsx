"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteCompetitor } from "@/lib/actions/admin";

export function DeleteCompetitorButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      className="text-destructive"
      onClick={() => {
        if (!confirm("Delete this competitor and all related images/votes?")) {
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
      Delete
    </button>
  );
}
