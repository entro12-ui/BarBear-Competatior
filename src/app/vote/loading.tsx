import { PageLoader } from "@/components/ui/page-loader";

export default function VoteLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-24">
      <PageLoader dark label="Opening vote…" />
    </div>
  );
}
