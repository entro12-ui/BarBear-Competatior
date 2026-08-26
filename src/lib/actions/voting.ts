"use server";

import { redirect } from "next/navigation";
import {
  clearAdminSession,
  createAdminSession,
  findAdminByEmail,
  verifyPassword,
} from "@/lib/auth";
import { isDatabaseConfigured, queryOne } from "@/lib/db";
import { normalizePhone } from "@/lib/utils/format";
import { voteRequestSchema } from "@/lib/validations";
import type { ActionResult } from "@/lib/actions/queries";
import { checkPhoneVoteStatus } from "@/lib/actions/queries";
import type { Competition, Vote } from "@/types/database";

export async function submitVote(
  input: unknown
): Promise<ActionResult<{ voteId: string }>> {
  const parsed = voteRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Invalid vote request",
    };
  }

  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database is not configured." };
  }

  const { competition_id, competitor_id, voter_name, voter_phone } =
    parsed.data;
  const phone = normalizePhone(voter_phone);

  if (phone.replace(/\D/g, "").length < 8) {
    return { success: false, error: "Please enter a valid phone number." };
  }

  try {
    const competition = await queryOne<Competition>(
      `select * from competitions where id = $1`,
      [competition_id]
    );

    if (!competition) {
      return { success: false, error: "Competition not found." };
    }

    if (competition.status !== "active") {
      return {
        success: false,
        error: "Voting for this competition has ended.",
      };
    }

    const competitor = await queryOne<{ id: string }>(
      `select id from competitors
       where id = $1 and competition_id = $2 and status = 'published'`,
      [competitor_id, competition_id]
    );

    if (!competitor) {
      return { success: false, error: "Selected competitor is not available." };
    }

    const { hasVoted } = await checkPhoneVoteStatus(competition_id, phone);
    if (hasVoted) {
      return {
        success: false,
        error:
          "This phone number has already been used to vote in this competition. Each person is allowed to vote only once.",
      };
    }

    // Keep email column filled for schema compatibility; uniqueness is by phone.
    const placeholderEmail = `${phone.replace(/\D/g, "")}@phone.local`;

    let vote: Vote | null = null;
    try {
      vote = await queryOne<Vote>(
        `insert into votes (
           competition_id, competitor_id, voter_name, voter_email, voter_phone, email_verified
         ) values ($1, $2, $3, $4, $5, true)
         returning *`,
        [
          competition_id,
          competitor_id,
          voter_name.trim(),
          placeholderEmail,
          phone,
        ]
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (message.includes("votes_competition_id_voter_phone_key")) {
        return {
          success: false,
          error:
            "This phone number has already been used to vote in this competition. Each person is allowed to vote only once.",
        };
      }
      throw error;
    }

    if (!vote) {
      return { success: false, error: "Could not save your vote." };
    }

    return { success: true, data: { voteId: vote.id } };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Could not submit your vote." };
  }
}

export async function adminLogin(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/admin/dashboard");
  const next =
    nextRaw.startsWith("/admin") && !nextRaw.startsWith("//")
      ? nextRaw
      : "/admin/dashboard";

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  if (!isDatabaseConfigured()) {
    return { success: false, error: "Database is not configured." };
  }

  try {
    const admin = await findAdminByEmail(email);
    if (!admin) {
      return { success: false, error: "Invalid email or password." };
    }

    const valid = await verifyPassword(password, admin.password_hash);
    if (!valid) {
      return { success: false, error: "Invalid email or password." };
    }

    await createAdminSession(admin);
  } catch (error) {
    console.error(error);
    return { success: false, error: "Login failed. Check your configuration." };
  }

  redirect(next);
}

export async function adminLogout(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
