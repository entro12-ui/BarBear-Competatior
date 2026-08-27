import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareCompetitorButton } from "@/components/competitors/share-button";
import { SiteHeader } from "@/components/layout/site-chrome";
import {
  getCompetitionResults,
  getCompetitorById,
} from "@/lib/actions/queries";
import {
  formatCompetitionNumber,
  getProfileImageUrl,
  isVotingOpen,
} from "@/lib/utils/format";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const competitor = await getCompetitorById(id);
  if (!competitor) return { title: "Competitor" };
  return { title: competitor.full_name };
}

export default async function CompetitorDetailPage({ params }: Props) {
  const { id } = await params;
  const competitor = await getCompetitorById(id);
  if (!competitor) notFound();

  const competition = competitor.competition;
  const votingOpen = isVotingOpen(competition);
  const results = await getCompetitionResults(competitor.competition_id);
  const rankIndex = results.findIndex((r) => r.competitor_id === competitor.id);
  const rank = rankIndex >= 0 ? rankIndex + 1 : undefined;
  const voteCount =
    rankIndex >= 0 ? results[rankIndex]?.total_votes ?? 0 : 0;

  const profileImage = getProfileImageUrl(
    competitor.profile_photo_url,
    competitor.images ?? []
  );

  const shareUrl = `/competitors/${competitor.id}`;
  const shareText = `Vote for ${formatCompetitionNumber(competitor.competition_number)} ${competitor.full_name}`;

  const socialLinks = [
    { label: "Instagram", href: competitor.instagram_url },
    { label: "TikTok", href: competitor.tiktok_url },
    { label: "Facebook", href: competitor.facebook_url },
    { label: "YouTube", href: competitor.youtube_url },
    { label: "Telegram", href: competitor.telegram_url },
    { label: "Website", href: competitor.website_url },
  ].filter((link): link is { label: string; href: string } =>
    Boolean(link.href)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5c1520] via-[#2a0c12] to-[#0a0a0a] text-white">
      <SiteHeader variant="dark" />

      <main className="mx-auto flex min-h-screen max-w-lg flex-col px-4 pb-32 pt-24">
        <div className="mb-4 flex items-center gap-3">
          <Link
            href="/competitors"
            className="text-2xl leading-none text-white/80"
            aria-label="Back"
          >
            ←
          </Link>
          <h1 className="flex-1 text-center text-lg font-semibold">
            {formatCompetitionNumber(competitor.competition_number)}
          </h1>
          <span className="w-6" />
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl">
          <div className="relative aspect-[3/4] bg-neutral-900">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={competitor.full_name}
                fill
                className="object-cover"
                sizes="(max-width: 512px) 100vw, 512px"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/40">
                No profile photo
              </div>
            )}
          </div>

          <div className="relative space-y-3 p-5">
            {typeof rank === "number" && (
              <div className="absolute right-5 top-5 flex size-12 items-center justify-center rounded-full border border-[#c4a35a]/60 text-lg font-bold text-[#e8c878]">
                {rank}
              </div>
            )}

            <p className="pr-14 text-sm font-semibold text-white/70">
              {formatCompetitionNumber(competitor.competition_number)}
            </p>

            <dl className="space-y-2 pr-14 text-sm">
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <dt className="text-white/45">NAME</dt>
                <dd className="font-medium">{competitor.full_name}</dd>
              </div>
              <div className="grid grid-cols-[7rem_1fr] gap-2">
                <dt className="text-white/45">BARBER</dt>
                <dd className="font-medium">{competitor.barber_name}</dd>
              </div>
              {competitor.short_bio ? (
                <div className="grid grid-cols-[7rem_1fr] gap-2">
                  <dt className="text-white/45">BIO</dt>
                  <dd className="font-medium leading-snug">
                    {competitor.short_bio}
                  </dd>
                </div>
              ) : null}
              {competitor.description ? (
                <div className="grid grid-cols-[7rem_1fr] gap-2">
                  <dt className="text-white/45">DETAILS</dt>
                  <dd className="whitespace-pre-line font-medium leading-snug text-white/85">
                    {competitor.description}
                  </dd>
                </div>
              ) : null}
            </dl>

            {socialLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
                {socialLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-white/20 px-3 py-1.5 text-xs font-medium text-white/90 transition hover:border-[#e8c878] hover:text-[#e8c878]"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <ShareCompetitorButton
                title={`${competitor.full_name} · Barbear`}
                text={shareText}
                url={shareUrl}
              />
            </div>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-lg flex-col gap-2 px-4 py-3">
          <div className="flex items-center gap-3">
            <p className="min-w-0 flex-1 text-lg font-semibold tabular-nums">
              {voteCount.toLocaleString()}
              <span className="ml-2 text-xs font-normal text-white/50">
                votes
              </span>
            </p>
            {votingOpen ? (
              <Link
                href={`/vote?competitor=${competitor.id}`}
                className="shrink-0 rounded-full bg-gradient-to-r from-[#9b1c2e] to-[#d94a2a] px-8 py-3 text-sm font-bold tracking-wide text-white shadow-lg"
              >
                Voting
              </Link>
            ) : (
              <span className="text-sm text-white/40">Closed</span>
            )}
          </div>
          <p className="text-center text-[11px] text-white/45">
            One vote per number
          </p>
        </div>
      </div>
    </div>
  );
}
