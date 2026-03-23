import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "@/lib/services";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const snapshot = await getDashboardSnapshot(id);

  if (!snapshot) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(snapshot);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await db.account.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }
}
