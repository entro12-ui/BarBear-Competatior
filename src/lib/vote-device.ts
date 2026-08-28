import { query } from "@/lib/db";

export const DEVICE_ID_COOKIE = "barbear_device_id";

let ensured = false;

/** Adds device_id column + unique index for existing production databases. */
export async function ensureVoteDeviceColumn(): Promise<void> {
  if (ensured) return;

  await query(`
    alter table votes
      add column if not exists device_id text
  `);
  await query(`
    create unique index if not exists idx_votes_competition_device
      on votes (competition_id, device_id)
      where device_id is not null
  `);

  ensured = true;
}
