import { NextResponse } from "next/server";
import { getRecommendationsForAccount } from "@/lib/services";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({
    accountId: id,
    recommendations: await getRecommendationsForAccount(id)
  });
}
