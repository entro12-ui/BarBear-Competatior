"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { adminLogin } from "@/lib/actions/voting";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ActionResult } from "@/lib/actions/queries";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-ink text-stone hover:bg-brass"
    >
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [state, formAction] = useActionState(
    adminLogin,
    null as ActionResult | null
  );

  const unauthorized = searchParams.get("error") === "unauthorized";
  const error =
    state && !state.success
      ? state.error
      : unauthorized
        ? "Admin access required."
        : null;

  return (
    <form action={formAction} method="post" className="space-y-5">
      <input
        type="hidden"
        name="next"
        value={searchParams.get("next") || "/admin/dashboard"}
      />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoComplete="username" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <SubmitButton />
    </form>
  );
}
