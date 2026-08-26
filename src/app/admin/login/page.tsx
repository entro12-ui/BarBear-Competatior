"use client";

import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#1c1814] px-6">
      <div className="w-full max-w-md border border-stone/15 bg-[#f7f3ec] p-8">
        <p className="text-xs uppercase tracking-[0.28em] text-brass">Admin</p>
        <h1 className="mt-2 font-display text-4xl">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Secure access to competition management.
        </p>
        <div className="mt-8">
          <Suspense fallback={<p>Loading...</p>}>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
