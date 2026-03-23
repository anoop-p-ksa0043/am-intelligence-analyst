import { NextResponse } from "next/server";
import { analyzeCandidateAccount } from "@/lib/services";

export async function POST(request: Request) {
  const payload = await request.json();
  const snapshot = await analyzeCandidateAccount(payload.account);

  if (!snapshot) {
    return NextResponse.json({ message: "Candidate analysis failed" }, { status: 400 });
  }

  return NextResponse.json(snapshot);
}
