/** Compress an image in the browser before upload (avoids Render connection drops). */
export async function compressImageFile(
  file: File,
  options?: { maxWidth?: number; maxBytes?: number; quality?: number }
): Promise<File> {
  const maxWidth = options?.maxWidth ?? 1200;
  const maxBytes = options?.maxBytes ?? 900_000;
  const quality = options?.quality ?? 0.82;

  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Already small enough
  if (file.size <= maxBytes && file.type !== "image/png") {
    return file;
  }

  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let q = quality;
  let blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", q)
  );

  while (blob && blob.size > maxBytes && q > 0.45) {
    q -= 0.1;
    blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", q)
    );
  }

  if (!blob) return file;

  const name = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
}
