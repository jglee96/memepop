import type { MetadataRoute } from "next";

import { SITE_URL } from "@/shared/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/memes", "/faq", "/m/"],
      disallow: ["/api/"]
    },
    sitemap: `${SITE_URL}/sitemap.xml`
  };
}
