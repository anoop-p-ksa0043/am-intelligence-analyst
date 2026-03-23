// @deprecated support-only — no in-app links; route returns notFound()
import { Workbench } from "@/components/workbench";
import {
  getDashboardSnapshot,
  getFoundationOverview,
  listWorkbenchAccounts
} from "@/lib/services";

export async function LegacyWorkbenchPage() {
  const accounts = await listWorkbenchAccounts();
  const snapshot =
    (await getDashboardSnapshot(accounts[0]?.id ?? "acc-northstar")) ??
    (() => {
      throw new Error("Missing dashboard seed data");
    })();
  const overview = await getFoundationOverview();

  return <Workbench initialSnapshot={snapshot} accounts={accounts} overview={overview} />;
}
