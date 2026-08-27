"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/lib/actions/queries";
import { requireAdmin } from "@/lib/actions/queries";
import { query, queryOne } from "@/lib/db";
import {
  ensurePhotoColumns,
  getUploadFromFormData,
  saveCompetitorProfilePhoto,
} from "@/lib/uploads";
import {
  competitionFormSchema,
  competitorFormSchema,
} from "@/lib/validations";
import type { ImageType } from "@/types/database";

function revalidatePublic() {
  revalidatePath("/");
  revalidatePath("/competitors");
  revalidatePath("/admin", "layout");
}

export async function createCompetition(
  input: unknown
): Promise<ActionResult<{ id: string }>> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const parsed = competitionFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid competition data",
    };
  }

  const data = parsed.data;
  const row = await queryOne<{ id: string }>(
    `insert into competitions (
       name, slug, description, rules, location, start_date, end_date, status, public_results
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     returning id`,
    [
      data.name,
      data.slug,
      data.description,
      data.rules,
      data.location || null,
      data.start_date || null,
      data.end_date || null,
      data.status,
      data.public_results,
    ]
  );

  if (!row) {
    return { success: false, error: "Failed to create competition" };
  }

  revalidatePublic();
  return { success: true, data: { id: row.id } };
}

export async function updateCompetition(
  id: string,
  input: unknown
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const parsed = competitionFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid competition data",
    };
  }

  const data = parsed.data;
  await query(
    `update competitions set
       name = $1,
       slug = $2,
       description = $3,
       rules = $4,
       location = $5,
       start_date = $6,
       end_date = $7,
       status = $8,
       public_results = $9
     where id = $10`,
    [
      data.name,
      data.slug,
      data.description,
      data.rules,
      data.location || null,
      data.start_date || null,
      data.end_date || null,
      data.status,
      data.public_results,
      id,
    ]
  );

  revalidatePublic();
  return { success: true, data: undefined };
}

export async function deleteCompetition(id: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  await query(`delete from competitions where id = $1`, [id]);
  revalidatePublic();
  return { success: true, data: undefined };
}

export async function createCompetitor(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const upload = getUploadFromFormData(formData, "photo");
  if (!upload) {
    return { success: false, error: "Please upload a photo for this competitor." };
  }

  const parsed = competitorFormSchema.safeParse({
    competition_id: formData.get("competition_id"),
    full_name: formData.get("full_name"),
    barber_name: formData.get("barber_name"),
    competition_number: formData.get("competition_number"),
    short_bio: formData.get("short_bio") ?? "",
    description: formData.get("description") ?? "",
    phone: formData.get("phone") ?? "",
    status: formData.get("status") ?? "published",
    instagram_url: formData.get("instagram_url") ?? "",
    tiktok_url: formData.get("tiktok_url") ?? "",
    facebook_url: formData.get("facebook_url") ?? "",
    youtube_url: formData.get("youtube_url") ?? "",
    telegram_url: formData.get("telegram_url") ?? "",
    website_url: formData.get("website_url") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid competitor data",
    };
  }

  const data = parsed.data;
  try {
    await ensurePhotoColumns();

    const row = await queryOne<{ id: string }>(
      `insert into competitors (
         competition_id, full_name, barber_name, competition_number,
         short_bio, description, phone, status,
         instagram_url, tiktok_url, facebook_url, youtube_url, telegram_url, website_url
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       returning id`,
      [
        data.competition_id,
        data.full_name,
        data.barber_name,
        String(data.competition_number).trim(),
        data.short_bio || "",
        data.description || "",
        data.phone || null,
        data.status,
        data.instagram_url || null,
        data.tiktok_url || null,
        data.facebook_url || null,
        data.youtube_url || null,
        data.telegram_url || null,
        data.website_url || null,
      ]
    );

    if (!row) {
      return { success: false, error: "Failed to create competitor" };
    }

    await saveCompetitorProfilePhoto(row.id, upload.blob, upload.name);

    revalidatePublic();
  } catch (error) {
    console.error("createCompetitor error", error);
    const message = error instanceof Error ? error.message : "Failed to create";
    return { success: false, error: message };
  }

  redirect("/admin/competitors");
}

export async function updateCompetitor(
  id: string,
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const parsed = competitorFormSchema.safeParse({
    competition_id: formData.get("competition_id"),
    full_name: formData.get("full_name"),
    barber_name: formData.get("barber_name"),
    competition_number: formData.get("competition_number"),
    short_bio: formData.get("short_bio") ?? "",
    description: formData.get("description") ?? "",
    phone: formData.get("phone") ?? "",
    status: formData.get("status") ?? "published",
    instagram_url: formData.get("instagram_url") ?? "",
    tiktok_url: formData.get("tiktok_url") ?? "",
    facebook_url: formData.get("facebook_url") ?? "",
    youtube_url: formData.get("youtube_url") ?? "",
    telegram_url: formData.get("telegram_url") ?? "",
    website_url: formData.get("website_url") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid competitor data",
    };
  }

  const data = parsed.data;
  try {
    await ensurePhotoColumns();
    await query(
      `update competitors set
         competition_id = $1,
         full_name = $2,
         barber_name = $3,
         competition_number = $4,
         short_bio = $5,
         description = $6,
         phone = $7,
         status = $8,
         instagram_url = $9,
         tiktok_url = $10,
         facebook_url = $11,
         youtube_url = $12,
         telegram_url = $13,
         website_url = $14
       where id = $15`,
      [
        data.competition_id,
        data.full_name,
        data.barber_name,
        String(data.competition_number).trim(),
        data.short_bio || "",
        data.description || "",
        data.phone || null,
        data.status,
        data.instagram_url || null,
        data.tiktok_url || null,
        data.facebook_url || null,
        data.youtube_url || null,
        data.telegram_url || null,
        data.website_url || null,
        id,
      ]
    );

    const upload = getUploadFromFormData(formData, "photo");
    if (upload) {
      await saveCompetitorProfilePhoto(id, upload.blob, upload.name);
    }
  } catch (error) {
    console.error("updateCompetitor error", error);
    const message = error instanceof Error ? error.message : "Failed to update";
    return { success: false, error: message };
  }

  revalidatePublic();
  revalidatePath(`/competitors/${id}`);
  revalidatePath(`/admin/competitors/${id}/edit`);
  redirect("/admin/competitors");
}

export async function deleteCompetitor(id: string): Promise<ActionResult> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  await query(`delete from competitors where id = $1`, [id]);
  revalidatePublic();
  return { success: true, data: undefined };
}

export async function uploadCompetitorImage(params: {
  competitorId: string;
  imageType: ImageType;
  formData: FormData;
}): Promise<ActionResult<{ url: string }>> {
  const auth = await requireAdmin();
  if (!auth.success) return auth;

  const upload = getUploadFromFormData(params.formData, "file");
  if (!upload) {
    return { success: false, error: "No image file provided." };
  }

  try {
    if (params.imageType === "profile") {
      const { url } = await saveCompetitorProfilePhoto(
        params.competitorId,
        upload.blob,
        upload.name
      );
      revalidatePublic();
      return { success: true, data: { url } };
    }

    return {
      success: false,
      error: "Only profile photos are supported.",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}
