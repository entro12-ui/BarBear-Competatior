import { isDatabaseConfigured } from "@/lib/utils/format";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Lightweight probe for Render — avoids heavy homepage DB work on every check. */
export async function GET() {
  if (!isDatabaseConfigured()) {
    return Response.json({ ok: true, db: "not_configured" });
  }

  try {
    const { queryOne } = await import("@/lib/db");
    await Promise.race([
      queryOne<{ ok: number }>("select 1 as ok"),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("db timeout")), 4000)
      ),
    ]);
    return Response.json({ ok: true, db: "connected" });
  } catch {
    // App process is up; DB may be waking — still return 200 so Render does not restart.
    return Response.json({ ok: true, db: "unreachable" });
  }
}
