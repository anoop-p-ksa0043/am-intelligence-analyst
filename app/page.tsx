import { redirect } from "next/navigation";
import { LegacyWorkbenchPage } from "@/components/legacy-workbench-page";
import { resolveUiMode } from "@/lib/feature-flags";
import { auth } from "@/auth";

export default async function HomePage({
  searchParams
}: {
  searchParams: Promise<{ ui?: string | string[] }>;
}) {
  const { ui } = await searchParams;
  const mode = resolveUiMode(ui);

  if (mode === "revamp") {
    const session = await auth();
    if (!session) {
      redirect("/login");
    } else {
      redirect("/accounts");
    }
  }

  return <LegacyWorkbenchPage />;
}
