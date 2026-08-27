export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Keep digits and a leading +, strip spaces/dashes for unique vote checks. */
export function normalizePhone(phone: string): string {
  const trimmed = phone.trim();
  const hasPlus = trimmed.startsWith("+");
  const digits = trimmed.replace(/\D/g, "");
  return hasPlus ? `+${digits}` : digits;
}

export function formatCompetitionNumber(num: string | number | null | undefined): string {
  const value = String(num ?? "").trim();
  if (!value) return "#—";
  // Pure digits → #01 style
  if (/^\d+$/.test(value)) {
    return `#${value.padStart(2, "0")}`;
  }
  // Codes like B001, #12, A-01 — show as entered
  return value;
}

/** Sort helper for codes like 12, B001, A-10 */
export function compareCompetitionNumbers(
  a: string | number,
  b: string | number
): number {
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "TBA";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Africa/Addis_Ababa",
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Africa/Addis_Ababa",
  }).format(new Date(value));
}

export function getMainImageUrl(
  images: { image_type: string; image_url: string }[],
  profilePhotoUrl?: string | null
): string | null {
  if (profilePhotoUrl) return profilePhotoUrl;
  const front = images.find((img) => img.image_type === "front");
  if (front) return front.image_url;
  return images[0]?.image_url ?? null;
}

/** Prefer admin profile photo for voter list/profile cards. */
export function getProfileImageUrl(
  profilePhotoUrl?: string | null,
  images: { image_type: string; image_url: string }[] = []
): string | null {
  return getMainImageUrl(images, profilePhotoUrl);
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Voting is open when status is active and now is within start/end window. */
export function isVotingOpen(competition: {
  status: string;
  start_date?: string | null;
  end_date?: string | null;
} | null | undefined): boolean {
  if (!competition || competition.status !== "active") return false;

  const now = Date.now();
  if (competition.start_date) {
    const start = new Date(competition.start_date).getTime();
    if (!Number.isNaN(start) && now < start) return false;
  }
  if (competition.end_date) {
    const end = new Date(competition.end_date).getTime();
    if (!Number.isNaN(end) && now > end) return false;
  }
  return true;
}
