import { NextResponse } from "next/server";
import { getRecommendationDetailView } from "@/lib/console-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const view = await getRecommendationDetailView(id);

  if (!view) {
    return NextResponse.json({ message: "Recommendation not found" }, { status: 404 });
  }

  return NextResponse.json(view);
}
