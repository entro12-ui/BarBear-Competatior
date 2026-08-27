import { PageLoader } from "@/components/ui/page-loader";

export default function CompetitorsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5c1520] via-[#2a0c12] to-[#0a0a0a] pt-24">
      <PageLoader dark label="Loading styles…" />
    </div>
  );
}
