import { NextResponse } from "next/server";
import { reviewRecommendation } from "@/lib/services";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const payload = await request.json();
  const { id } = await params;
  const result = await reviewRecommendation(id, payload);

  if (!result) {
    return NextResponse.json({ message: "Recommendation not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
