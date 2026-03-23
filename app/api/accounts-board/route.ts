import { NextResponse } from "next/server";
import { getAccountsBoardView } from "@/lib/console-data";

export async function GET() {
  return NextResponse.json(await getAccountsBoardView());
}
