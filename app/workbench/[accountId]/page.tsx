import { notFound } from "next/navigation";
import { AppShell } from "@/components/console/app-shell";
import { IntelligenceWorkbench } from "@/components/console/intelligence-workbench";
import { getWorkbenchView } from "@/lib/console-data";

export default async function WorkbenchPage({
  params
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;
  const view = await getWorkbenchView(accountId);

  if (!view) {
    notFound();
  }

  return (
    <AppShell
      pageLabel="Intelligence Workbench"
      title={view.snapshot.account.canonicalName}
    >
      <IntelligenceWorkbench initialView={view} />
    </AppShell>
  );
}
