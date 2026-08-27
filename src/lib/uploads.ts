import { access, mkdir, writeFile, constants } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024;

type UploadRoot = {
  root: string;
  /** Serve through /api/uploads when not under public/uploads */
  viaApi: boolean;
};

let cachedRoot: UploadRoot | null = null;

function isUnderPublicUploads(root: string): boolean {
  const publicUploads = path.resolve(process.cwd(), "public", "uploads");
  return path.resolve(root).startsWith(publicUploads);
}

async function canUseDir(dir: string): Promise<boolean> {
  try {
    await mkdir(/*turbopackIgnore: true*/ dir, { recursive: true });
    await access(dir, constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Pick a writable upload directory.
 * Order: UPLOAD_DIR (Render disk) → ./uploads → ./public/uploads
 */
export async function resolveUploadRoot(): Promise<UploadRoot> {
  if (cachedRoot) return cachedRoot;

  const candidates = [
    process.env.UPLOAD_DIR,
    path.join(process.cwd(), "uploads"),
    path.join(process.cwd(), "public", "uploads"),
  ].filter((value): value is string => Boolean(value));

  for (const candidate of candidates) {
    const root = path.resolve(candidate);
    if (await canUseDir(root)) {
      cachedRoot = {
        root,
        viaApi: !isUnderPublicUploads(root),
      };
      return cachedRoot;
    }
  }

  throw new Error(
    "No writable upload directory. Unset UPLOAD_DIR, or attach a Render disk and mount it first."
  );
}

/** Sync helper for the API route (assumes root already created at runtime). */
export function getUploadRoot(): string {
  if (process.env.UPLOAD_DIR) {
    return path.resolve(process.env.UPLOAD_DIR);
  }
  return path.join(process.cwd(), "uploads");
}

export function getPublicUploadPath(
  folder: string,
  filename: string,
  viaApi: boolean
): string {
  const relative = `${folder}/${filename}`.replace(/\\/g, "/");
  if (viaApi) {
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

  const { root, viaApi } = await resolveUploadRoot();
  const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${randomUUID()}.${extension}`;
  const absoluteDir = path.join(/*turbopackIgnore: true*/ root, folder);

  await mkdir(absoluteDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(
    path.join(/*turbopackIgnore: true*/ absoluteDir, filename),
    buffer
  );

  return { url: getPublicUploadPath(folder, filename, viaApi) };
}
