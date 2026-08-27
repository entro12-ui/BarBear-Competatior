import { query, queryOne } from "@/lib/db";

function isAllowedImage(mime: string, fileName?: string): boolean {
  const type = (mime || "").toLowerCase().trim();
  if (type.startsWith("image/") && type !== "image/svg+xml") {
    return true;
  }
  // Some phones send an empty MIME — allow by extension
  const ext = fileName?.split(".").pop()?.toLowerCase();
  return Boolean(
    ext &&
      ["jpg", "jpeg", "png", "webp", "gif", "bmp", "avif", "heic", "heif", "tif", "tiff"].includes(
        ext
      )
  );
}

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
  // Allow codes like B001 / #12 (migrate from integer if needed)
  await query(`
    do $$
    begin
      if exists (
        select 1
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'competitors'
          and column_name = 'competition_number'
          and data_type = 'integer'
      ) then
        alter table public.competitors
          alter column competition_number type text
          using competition_number::text;
      end if;
    end $$;
  `);
  columnsReady = true;
}

/**
 * Store competitor photo in Postgres (works on Render without a disk).
 * Public URL: /api/media/{competitorId}
 */
export async function saveCompetitorProfilePhoto(
  competitorId: string,
  file: Blob,
  fileName?: string
): Promise<{ url: string }> {
  const name =
    fileName ||
    (file instanceof File ? file.name : undefined) ||
    "photo.jpg";
  const mime = (file.type || guessMimeFromName(name) || "image/jpeg").toLowerCase();

  if (!isAllowedImage(mime, name)) {
    throw new Error("Please upload an image file (JPG, PNG, WEBP, GIF, HEIC, etc.).");
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
    [buffer, mime.startsWith("image/") ? mime : "image/jpeg", url, competitorId]
  );

  return { url };
}

function guessMimeFromName(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    avif: "image/avif",
    heic: "image/heic",
    heif: "image/heif",
    tif: "image/tiff",
    tiff: "image/tiff",
  };
  return ext ? map[ext] ?? null : null;
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
  return saveCompetitorProfilePhoto(folder, file, file.name);
}
