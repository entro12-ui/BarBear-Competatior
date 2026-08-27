import Image from "next/image";
import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/layout/site-chrome";
import { getCompetitorById } from "@/lib/actions/queries";
import { formatCompetitionNumber } from "@/lib/utils/format";

type Props = {
  searchParams: Promise<{ competitor?: string }>;
};

export const metadata = {
  title: "Vote Confirmed",
};

export default async function VoteSuccessPage({ searchParams }: Props) {
  const { competitor: competitorId } = await searchParams;
  const competitor = competitorId
    ? await getCompetitorById(competitorId)
    : null;

  const photo =
    competitor?.profile_photo_url ||
    competitor?.images?.find((img) => img.image_type === "profile")?.image_url ||
    competitor?.images?.[0]?.image_url ||
    null;

  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-28">
        <div className="w-full max-w-lg border border-emerald-200 bg-emerald-50/90 p-8 text-center shadow-[0_24px_60px_-40px_rgba(6,95,70,0.45)]">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-600 text-2xl font-bold text-white">
            ✓
          </div>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
            Success
          </p>
          <h1 className="mt-3 font-display text-4xl text-emerald-950">
            Your vote is locked in
          </h1>

          {competitor ? (
            <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-200 bg-white text-left">
              <div className="flex items-center gap-4 p-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-emerald-100">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={competitor.full_name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-semibold text-emerald-700">
                      {formatCompetitionNumber(competitor.competition_number)}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    You voted for
                  </p>
                  <p className="mt-1 truncate text-lg font-semibold text-emerald-950">
                    {formatCompetitionNumber(competitor.competition_number)}{" "}
                    {competitor.full_name}
                  </p>
                  {competitor.barber_name && (
                    <p className="mt-0.5 truncate text-sm text-emerald-800/70">
                      Barber: {competitor.barber_name}
                    </p>
                  )}
                </div>
              </div>
              <div className="border-t border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Vote confirmed successfully for this competitor.
              </div>
            </div>
          ) : (
            <p className="mt-4 text-emerald-900/70">Thank you for voting.</p>
          )}

          <p className="mt-5 text-sm text-emerald-900/65">
            Each number can vote only once in this competition.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/competitors"
              className="bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Browse styles
            </Link>
            <Link
              href="/"
              className="border border-emerald-300 px-5 py-3 text-sm text-emerald-900 hover:border-emerald-500 hover:bg-emerald-100/60"
            >
              Back home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
