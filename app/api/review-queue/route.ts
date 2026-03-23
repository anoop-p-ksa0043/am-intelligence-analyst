import { NextResponse } from "next/server";
import { getReviewQueueView } from "@/lib/console-data";

export async function GET() {
  return NextResponse.json(await getReviewQueueView());
}
