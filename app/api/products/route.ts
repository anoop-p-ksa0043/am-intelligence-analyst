import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const products = await db.product.findMany({
    where: { deprecatedAt: null },
    orderBy: [{ classification: "asc" }, { name: "asc" }]
  });
  return NextResponse.json(products);
}
