import Image from "next/image";
import Link from "next/link";
import {
  formatCompetitionNumber,
  getProfileImageUrl,
} from "@/lib/utils/format";
import type { CompetitorWithImages } from "@/types/database";

type Props = {
  competitor: CompetitorWithImages;
  rank?: number;
  voteCount?: number;
  votingOpen?: boolean;
};

export function CompetitorCard({
  competitor,
  rank,
  voteCount = 0,
  votingOpen = true,
}: Props) {
  const imageUrl = getProfileImageUrl(
    competitor.profile_photo_url,
    competitor.images ?? []
  );

  return (
    <article className="relative flex overflow-hidden rounded-2xl border border-white/10 bg-[#141414] text-white shadow-[0_12px_40px_-20px_rgba(0,0,0,0.7)]">
      <Link
        href={`/competitors/${competitor.id}`}
        className="absolute inset-0 z-0"
        aria-label={`Open ${competitor.full_name} profile`}
      />

      <div className="relative z-[1] pointer-events-none flex w-full">
        <div className="relative w-[38%] min-w-[120px] shrink-0 self-stretch bg-neutral-800 sm:w-40">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={competitor.full_name}
              fill
              className="object-cover"
              sizes="160px"
            />
          ) : (
            <div className="flex h-full min-h-[140px] items-center justify-center px-2 text-center text-xs text-white/40">
              No photo
            </div>
          )}
        </div>

        <div className="relative flex flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
          <div className="pr-10">
            <p className="text-sm font-semibold text-white">
              {formatCompetitionNumber(competitor.competition_number)}
            </p>
            <h3 className="mt-1 text-base font-medium leading-snug text-white/90 sm:text-lg">
              {competitor.full_name}
            </h3>
            <p className="mt-3 text-lg font-semibold tabular-nums text-white">
              {voteCount.toLocaleString()}
              <span className="ml-1 text-xs font-normal text-white/45">
                votes
              </span>
            </p>
          </div>

          {typeof rank === "number" && (
            <div
              className="absolute right-3 top-3 flex size-10 items-center justify-center rounded-full border border-[#c4a35a]/50 bg-[#1a1a1a] text-sm font-bold text-[#e8c878]"
              aria-label={`Rank ${rank}`}
            >
              {rank}
            </div>
          )}

          {votingOpen ? (
            <Link
              href={`/vote?competitor=${competitor.id}`}
              className="pointer-events-auto relative z-[2] ml-auto inline-flex items-center justify-center rounded-lg bg-white px-6 py-2 text-sm font-semibold text-black transition hover:bg-[#e8c878]"
            >
              Vote
            </Link>
          ) : (
            <span className="ml-auto text-xs text-white/40">Voting closed</span>
          )}
        </div>
      </div>
    </article>
  );
}
