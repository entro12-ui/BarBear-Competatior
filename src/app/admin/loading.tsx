import { PageLoader } from "@/components/ui/page-loader";

export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-[#f4efe6] px-6 py-16">
      <PageLoader label="Loading admin…" />
    </div>
  );
}
