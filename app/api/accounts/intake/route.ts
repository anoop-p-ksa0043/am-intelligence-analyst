import { NextResponse } from "next/server";
import { intakeAccount } from "@/lib/services";

export async function POST(request: Request) {
  const payload = await request.json();
  const result = await intakeAccount(payload);
  return NextResponse.json(result);
}
