import { NextResponse } from "next/server";
import { refreshAccount } from "@/lib/services";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await request.json().catch(() => ({}));
  const { id } = await params;
  const result = await refreshAccount(id, payload);

  if (!result) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
