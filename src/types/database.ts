export type UserRole = "admin" | "user";

export type CompetitionStatus =
  | "draft"
  | "upcoming"
  | "active"
  | "closed"
  | "completed";

export type CompetitorStatus = "draft" | "published" | "hidden";

export type ImageType = "front" | "back" | "left" | "right" | "profile";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Competition {
  id: string;
  name: string;
  slug: string;
  description: string;
  rules: string;
  location: string | null;
  logo_url: string | null;
  start_date: string | null;
  end_date: string | null;
  status: CompetitionStatus;
  public_results: boolean;
  created_at: string;
  updated_at: string;
}

export interface Competitor {
  id: string;
  competition_id: string;
  full_name: string;
  barber_name: string;
  profile_photo_url: string | null;
  short_bio: string;
  description: string;
  phone: string | null;
  competition_number: string;
  status: CompetitorStatus;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  telegram_url: string | null;
  website_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompetitorImage {
  id: string;
  competitor_id: string;
  image_url: string;
  image_type: ImageType;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Vote {
  id: string;
  competition_id: string;
  competitor_id: string;
  voter_name: string;
  voter_email: string;
  voter_phone: string;
  device_id: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface VoteChallenge {
  id: string;
  competition_id: string;
  competitor_id: string;
  voter_name: string;
  voter_email: string;
  voter_phone: string;
  code_hash: string;
  attempts: number;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
}

export interface CompetitorWithImages extends Competitor {
  images: CompetitorImage[];
  competition?: Competition | null;
}

export interface CompetitionResult {
  competition_id: string;
  competitor_id: string;
  full_name: string;
  barber_name: string;
  competition_number: string;
  profile_photo_url: string | null;
  total_votes: number;
  vote_percentage: number;
  status?: CompetitorStatus;
}

export interface DashboardStats {
  totalCompetitors: number;
  totalVotes: number;
  uniqueVoters: number;
  competitionStatus: CompetitionStatus | null;
  leadingCompetitor: {
    id: string;
    full_name: string;
    barber_name: string;
    total_votes: number;
  } | null;
}

export interface VoteWithRelations extends Vote {
  competitor: Pick<
    Competitor,
    "id" | "full_name" | "barber_name" | "competition_number"
  > | null;
  competition: Pick<Competition, "id" | "name"> | null;
}

export const IMAGE_TYPE_LABELS: Record<
  Exclude<ImageType, "profile">,
  string
> = {
  front: "Front View",
  back: "Back View",
  left: "Left View",
  right: "Right View",
};

export const STYLE_IMAGE_TYPES: Exclude<ImageType, "profile">[] = [
  "front",
  "back",
  "left",
  "right",
];
