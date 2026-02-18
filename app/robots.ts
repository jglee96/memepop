import type { MetadataRoute } from "next";

import { SITE_URL } from "@/shared/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/memes", "/m/"],
      disallow: ["/api/"]
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
