import { NextResponse } from "next/server";
import { getWorkbenchView } from "@/lib/console-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;
  const view = await getWorkbenchView(accountId);

  if (!view) {
    return NextResponse.json({ message: "Workbench account not found" }, { status: 404 });
  }

  return NextResponse.json(view);
}
