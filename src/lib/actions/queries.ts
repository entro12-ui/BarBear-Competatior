"use server";

import { getAdminSession } from "@/lib/auth";
import { isDatabaseConfigured, query, queryOne } from "@/lib/db";
import type {
  Competition,
  CompetitorImage,
  CompetitorWithImages,
  CompetitionResult,
  DashboardStats,
  VoteWithRelations,
} from "@/types/database";

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function notConfigured(): ActionResult<never> {
  return {
    success: false,
    error: "Database is not configured. Set DATABASE_URL in .env.local.",
  };
}

/** Exclude profile_photo_bytes — photos are served only via /api/media/[id]. */
const COMPETITOR_COLUMNS = `
  id, competition_id, full_name, barber_name, profile_photo_url,
  profile_photo_mime, short_bio, description, phone, competition_number,
  status, instagram_url, tiktok_url, facebook_url, youtube_url, telegram_url,
  website_url, created_at, updated_at
`;

async function attachImages(
  competitors: CompetitorWithImages[]
): Promise<CompetitorWithImages[]> {
  if (competitors.length === 0) return [];

  const ids = competitors.map((c) => c.id);
  const images = await query<CompetitorImage>(
    `select * from competitor_images
     where competitor_id = any($1::uuid[])
     order by sort_order asc`,
    [ids]
  );

  const byCompetitor = new Map<string, CompetitorImage[]>();
  for (const image of images.rows) {
    const list = byCompetitor.get(image.competitor_id) ?? [];
    list.push(image);
    byCompetitor.set(image.competitor_id, list);
  }

  return competitors.map((competitor) => ({
    ...competitor,
    images: byCompetitor.get(competitor.id) ?? [],
  }));
}

export async function getActiveCompetition(): Promise<Competition | null> {
  if (!isDatabaseConfigured()) return null;
  return queryOne<Competition>(
    `select * from competitions
     where status = 'active'
     order by start_date desc nulls last
     limit 1`
  );
}

export async function getFeaturedCompetition(): Promise<Competition | null> {
  if (!isDatabaseConfigured()) return null;
  const active = await getActiveCompetition();
  if (active) return active;

  return queryOne<Competition>(
    `select * from competitions
     where status in ('upcoming', 'closed', 'completed')
     order by start_date desc nulls last
     limit 1`
  );
}

export async function getCompetitionById(
  id: string
): Promise<Competition | null> {
  if (!isDatabaseConfigured()) return null;
  return queryOne<Competition>(`select * from competitions where id = $1`, [
    id,
  ]);
}

export async function getCompetitionBySlug(
  slug: string
): Promise<Competition | null> {
  if (!isDatabaseConfigured()) return null;
  return queryOne<Competition>(`select * from competitions where slug = $1`, [
    slug,
  ]);
}

export async function getCompetitions(): Promise<Competition[]> {
  if (!isDatabaseConfigured()) return [];
  const result = await query<Competition>(
    `select * from competitions order by created_at desc`
  );
  return result.rows;
}

export async function getCompetitors(
  competitionId: string,
  options?: { includeDrafts?: boolean }
): Promise<CompetitorWithImages[]> {
  if (!isDatabaseConfigured()) return [];

  const result = options?.includeDrafts
    ? await query<CompetitorWithImages>(
        `select ${COMPETITOR_COLUMNS} from competitors
         where competition_id = $1
         order by competition_number asc`,
        [competitionId]
      )
    : await query<CompetitorWithImages>(
        `select ${COMPETITOR_COLUMNS} from competitors
         where competition_id = $1 and status = 'published'
         order by competition_number asc`,
        [competitionId]
      );

  return attachImages(result.rows);
}

export async function getCompetitorById(
  id: string
): Promise<CompetitorWithImages | null> {
  if (!isDatabaseConfigured()) return null;

  const competitor = await queryOne<CompetitorWithImages>(
    `select ${COMPETITOR_COLUMNS} from competitors where id = $1`,
    [id]
  );
  if (!competitor) return null;

  const [withImages] = await attachImages([competitor]);
  const competition = await getCompetitionById(competitor.competition_id);

  return {
    ...withImages,
    competition,
  };
}

export async function getCompetitorCount(
  competitionId: string
): Promise<number> {
  if (!isDatabaseConfigured()) return 0;
  const row = await queryOne<{ count: string }>(
    `select count(*)::text as count from competitors
     where competition_id = $1 and status = 'published'`,
    [competitionId]
  );
  return Number(row?.count ?? 0);
}

export async function checkEmailVoteStatus(
  competitionId: string,
  email: string
): Promise<{ hasVoted: boolean }> {
  if (!isDatabaseConfigured()) return { hasVoted: false };
  const row = await queryOne<{ id: string }>(
    `select id from votes
     where competition_id = $1 and voter_email = lower(trim($2))
     limit 1`,
    [competitionId, email]
  );
  return { hasVoted: Boolean(row) };
}

export async function checkPhoneVoteStatus(
  competitionId: string,
  phone: string
): Promise<{ hasVoted: boolean }> {
  if (!isDatabaseConfigured()) return { hasVoted: false };
  const row = await queryOne<{ id: string }>(
    `select id from votes
     where competition_id = $1 and voter_phone = $2
     limit 1`,
    [competitionId, phone]
  );
  return { hasVoted: Boolean(row) };
}

export async function checkDeviceVoteStatus(
  competitionId: string,
  deviceId: string
): Promise<{ hasVoted: boolean }> {
  if (!isDatabaseConfigured()) return { hasVoted: false };
  const row = await queryOne<{ id: string }>(
    `select id from votes
     where competition_id = $1 and device_id = $2
     limit 1`,
    [competitionId, deviceId]
  );
  return { hasVoted: Boolean(row) };
}

export async function getCompetitionResults(
  competitionId: string,
  options?: { requirePublic?: boolean }
): Promise<CompetitionResult[]> {
  if (!isDatabaseConfigured()) return [];

  if (options?.requirePublic) {
    const competition = await getCompetitionById(competitionId);
    if (!competition?.public_results) return [];
  }

  const competitors = await query<{
    id: string;
    competition_id: string;
    full_name: string;
    barber_name: string;
    competition_number: string;
    profile_photo_url: string | null;
  }>(
    `select id, competition_id, full_name, barber_name, competition_number, profile_photo_url
     from competitors
     where competition_id = $1 and status = 'published'
     order by competition_number asc`,
    [competitionId]
  );

  const votes = await query<{ competitor_id: string }>(
    `select competitor_id from votes where competition_id = $1`,
    [competitionId]
  );

  const counts = new Map<string, number>();
  for (const vote of votes.rows) {
    counts.set(vote.competitor_id, (counts.get(vote.competitor_id) ?? 0) + 1);
  }

  const total = votes.rows.length;

  return competitors.rows
    .map((c) => {
      const totalVotes = counts.get(c.id) ?? 0;
      return {
        competition_id: c.competition_id,
        competitor_id: c.id,
        full_name: c.full_name,
        barber_name: c.barber_name,
        competition_number: c.competition_number,
        profile_photo_url: c.profile_photo_url,
        total_votes: totalVotes,
        vote_percentage:
          total === 0 ? 0 : Math.round((totalVotes / total) * 10000) / 100,
      };
    })
    .sort((a, b) => b.total_votes - a.total_votes);
}

export async function getAdminDashboardStats(
  competitionId?: string
): Promise<DashboardStats> {
  const empty: DashboardStats = {
    totalCompetitors: 0,
    totalVotes: 0,
    uniqueVoters: 0,
    competitionStatus: null,
    leadingCompetitor: null,
  };

  if (!isDatabaseConfigured()) return empty;

  const competition = competitionId
    ? await getCompetitionById(competitionId)
    : await queryOne<Competition>(
        `select * from competitions order by created_at desc limit 1`
      );

  if (!competition) return empty;

  const [competitorCount, voteStats, results] = await Promise.all([
    queryOne<{ count: string }>(
      `select count(*)::text as count from competitors where competition_id = $1`,
      [competition.id]
    ),
    queryOne<{ total: string; unique_voters: string }>(
      `select count(*)::text as total,
              count(distinct voter_phone)::text as unique_voters
       from votes where competition_id = $1`,
      [competition.id]
    ),
    getCompetitionResults(competition.id),
  ]);

  const leading = results[0]
    ? {
        id: results[0].competitor_id,
        full_name: results[0].full_name,
        barber_name: results[0].barber_name,
        total_votes: results[0].total_votes,
      }
    : null;

  return {
    totalCompetitors: Number(competitorCount?.count ?? 0),
    totalVotes: Number(voteStats?.total ?? 0),
    uniqueVoters: Number(voteStats?.unique_voters ?? 0),
    competitionStatus: competition.status,
    leadingCompetitor: leading,
  };
}

export async function getAdminVotes(params: {
  competitionId?: string;
  competitorId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ votes: VoteWithRelations[]; total: number }> {
  if (!isDatabaseConfigured()) return { votes: [], total: 0 };

  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  const filters: string[] = [];
  const values: unknown[] = [];

  if (params.competitionId) {
    values.push(params.competitionId);
    filters.push(`v.competition_id = $${values.length}`);
  }
  if (params.competitorId) {
    values.push(params.competitorId);
    filters.push(`v.competitor_id = $${values.length}`);
  }
  if (params.search?.trim()) {
    values.push(`%${params.search.trim()}%`);
    filters.push(
      `(v.voter_name ilike $${values.length} or v.voter_phone ilike $${values.length})`
    );
  }

  const where = filters.length ? `where ${filters.join(" and ")}` : "";

  const countRow = await queryOne<{ count: string }>(
    `select count(*)::text as count from votes v ${where}`,
    values
  );

  values.push(pageSize, offset);
  const result = await query<VoteWithRelations>(
    `select
       v.*,
       json_build_object(
         'id', c.id,
         'full_name', c.full_name,
         'barber_name', c.barber_name,
         'competition_number', c.competition_number
       ) as competitor,
       json_build_object(
         'id', comp.id,
         'name', comp.name
       ) as competition
     from votes v
     left join competitors c on c.id = v.competitor_id
     left join competitions comp on comp.id = v.competition_id
     ${where}
     order by v.created_at desc
     limit $${values.length - 1} offset $${values.length}`,
    values
  );

  return {
    votes: result.rows,
    total: Number(countRow?.count ?? 0),
  };
}

export async function requireAdmin(): Promise<
  ActionResult<{ userId: string }>
> {
  if (!isDatabaseConfigured()) return notConfigured();
  const session = await getAdminSession();
  if (!session) {
    return { success: false, error: "Unauthorized" };
  }
  return { success: true, data: { userId: session.id } };
}
