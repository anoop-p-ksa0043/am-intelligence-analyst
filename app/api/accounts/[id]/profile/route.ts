import { NextResponse } from "next/server";
import { updateAccountProfile } from "@/lib/services";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await request.json();
  const { id } = await params;
  const snapshot = await updateAccountProfile(id, payload);

  if (!snapshot) {
    return NextResponse.json({ message: "Account not found" }, { status: 404 });
  }

  return NextResponse.json(snapshot);
}
