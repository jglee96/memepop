import type { MetadataRoute } from "next";

import { getAllMemes } from "@/entities/meme";
import { SITE_URL } from "@/shared/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const memeUrls: MetadataRoute.Sitemap = getAllMemes().map((meme) => ({
    url: `${SITE_URL}${meme.seo.canonicalPath}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8
  }));

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    {
      url: `${SITE_URL}/memes`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7
    },
    ...memeUrls
  ];
}
