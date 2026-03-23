import { notFound } from "next/navigation";
import { AppShell } from "@/components/console/app-shell";
import { RecommendationDetail } from "@/components/console/recommendation-detail";
import { getRecommendationDetailView } from "@/lib/console-data";

export default async function RecommendationPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = await getRecommendationDetailView(id);

  if (!view) {
    notFound();
  }

  return (
    <AppShell
      pageLabel="Recommendation Detail"
      title={view.product.name}
    >
      <RecommendationDetail initialView={view} />
    </AppShell>
  );
}
