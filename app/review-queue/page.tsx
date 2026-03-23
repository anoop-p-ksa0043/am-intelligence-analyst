import { AppShell } from "@/components/console/app-shell";
import { ReviewQueue } from "@/components/console/review-queue";
import { getReviewQueueView } from "@/lib/console-data";

export const dynamic = "force-dynamic";

export default async function ReviewQueuePage() {
  const view = await getReviewQueueView();

  return (
    <AppShell
      pageLabel="Review Queue"
      title="Analyst Workspace"
    >
      <ReviewQueue initialView={view} />
    </AppShell>
  );
}
