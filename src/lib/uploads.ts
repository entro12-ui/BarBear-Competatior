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
  const relativeDir = path.join("uploads", folder);
  const absoluteDir = path.join(process.cwd(), "public", relativeDir);

  await mkdir(absoluteDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(absoluteDir, filename), buffer);

  return { url: `/${relativeDir}/${filename}`.replace(/\\/g, "/") };
}
