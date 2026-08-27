import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

/** Absolute directory where uploaded files are stored. */
export function getUploadRoot(): string {
  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.env.UPLOAD_DIR);
  }
  return path.join(process.cwd(), "public", "uploads");
}

/**
 * Public URL path for a stored file.
 * Custom UPLOAD_DIR is served via /api/uploads (Render disk).
 * Local default still uses /uploads from public/.
 */
export function getPublicUploadPath(folder: string, filename: string): string {
  const relative = `${folder}/${filename}`.replace(/\\/g, "/");
  if (process.env.UPLOAD_DIR) {
    return `/api/uploads/${relative}`;
  }
  return `/uploads/${relative}`;
}

export async function saveUploadedImage(
  file: File,
  folder: string
): Promise<{ url: string }> {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error("Only JPG, PNG, and WEBP images are allowed.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("Image must be 5MB or smaller.");
  }

  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const absoluteDir = path.join(/*turbopackIgnore: true*/ getUploadRoot(), folder);

  await mkdir(absoluteDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(
    path.join(/*turbopackIgnore: true*/ absoluteDir, filename),
    buffer
  );

  return { url: getPublicUploadPath(folder, filename) };
}
