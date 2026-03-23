import { AppShell } from "@/components/console/app-shell";
import { AccountsBoard } from "@/components/console/accounts-board";
import { getAccountsBoardView } from "@/lib/console-data";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const view = await getAccountsBoardView();

  return (
    <AppShell
      pageLabel="Accounts Board"
      title="Portfolio Overview"
    >
      <AccountsBoard initialView={view} />
    </AppShell>
  );
}
