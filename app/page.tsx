import type { Metadata } from "next";

import { getAllMemes } from "@/entities/meme";
import { absoluteUrl } from "@/shared/config";
import { getMemeLikeCounts } from "@/shared/lib/memeLikeStore";
import { selectFeaturedMemeSlug } from "@/shared/lib/selectFeaturedMemeSlug";
import { HomeLanding } from "@/widgets/home-landing";

export const metadata: Metadata = {
  alternates: {
    canonical: absoluteUrl("/")
  }
};

export const dynamic = "force-dynamic";

export default async function HomePage(): Promise<React.JSX.Element> {
  const memes = getAllMemes();
  const likeCounts = await getMemeLikeCounts(memes.map((meme) => meme.slug));
  const featuredMemeSlug = selectFeaturedMemeSlug(memes, likeCounts);
  const recentMemes = memes.slice(0, 3);

  return <HomeLanding memes={recentMemes} likeCounts={likeCounts} featuredMemeSlug={featuredMemeSlug} />;
}
