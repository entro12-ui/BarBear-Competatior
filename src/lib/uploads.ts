import { query, queryOne } from "@/lib/db";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

let columnsReady = false;

/** Ensure photo byte columns exist (Render + local). */
export async function ensurePhotoColumns(): Promise<void> {
  if (columnsReady) return;
  await query(`
    alter table competitors
      add column if not exists profile_photo_bytes bytea,
      add column if not exists profile_photo_mime text
  `);
  columnsReady = true;
}

/**
 * Store competitor photo in Postgres (works on Render without a disk).
 * Public URL: /api/media/{competitorId}
 */
export async function saveCompetitorProfilePhoto(
  competitorId: string,
  file: Blob
): Promise<{ url: string }> {
  const mime = file.type || "image/jpeg";
  if (!ALLOWED_MIME.has(mime)) {
    throw new Error("Only JPG, PNG, and WEBP images are allowed.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be 5MB or smaller. Try a smaller photo.");
  }

  await ensurePhotoColumns();

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = `/api/media/${competitorId}`;

  await query(
    `update competitors
     set profile_photo_bytes = $1,
         profile_photo_mime = $2,
         profile_photo_url = $3,
         updated_at = now()
     where id = $4`,
    [buffer, mime, url, competitorId]
  );

  return { url };
}

export async function getCompetitorPhoto(
  competitorId: string
): Promise<{ bytes: Buffer; mime: string } | null> {
  await ensurePhotoColumns();
  const row = await queryOne<{
    profile_photo_bytes: Buffer | null;
    profile_photo_mime: string | null;
  }>(
    `select profile_photo_bytes, profile_photo_mime
     from competitors where id = $1`,
    [competitorId]
  );

  if (!row?.profile_photo_bytes) return null;

  return {
    bytes: Buffer.isBuffer(row.profile_photo_bytes)
      ? row.profile_photo_bytes
      : Buffer.from(row.profile_photo_bytes),
    mime: row.profile_photo_mime || "image/jpeg",
  };
}

/** @deprecated Prefer saveCompetitorProfilePhoto — kept for any filesystem callers */
export async function saveUploadedImage(
  file: File,
  folder: string
): Promise<{ url: string }> {
  return saveCompetitorProfilePhoto(folder, file);
}
