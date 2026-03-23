import { NextResponse } from "next/server";
import { applyAccountWorkflowAction } from "@/lib/services";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await request.json();
  const { id } = await params;
  const snapshot = await applyAccountWorkflowAction(id, payload.action);

  if (!snapshot) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(snapshot);
}
