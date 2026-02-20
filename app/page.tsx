import type { Metadata } from "next";

import { getAllMemes } from "@/entities/meme";
import { absoluteUrl } from "@/shared/config";
import { getMemeLikeCounts } from "@/shared/lib/memeLikeStore";
import { HomeLanding } from "@/widgets/home-landing";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/")
  }
};

export const dynamic = "force-dynamic";

export default async function HomePage(): Promise<React.JSX.Element> {
  const recentMemes = getAllMemes().slice(0, 3);
  const likeCounts = await getMemeLikeCounts(recentMemes.map((meme) => meme.slug));

  return <HomeLanding memes={recentMemes} likeCounts={likeCounts} />;
}
