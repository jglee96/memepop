import { NextResponse } from "next/server";

import { getAllMemeSlugs } from "@/entities/meme";
import { getMemeLikeCounts } from "@/shared/lib/memeLikeStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const counts = await getMemeLikeCounts(getAllMemeSlugs());

  return NextResponse.json(
    { counts },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
