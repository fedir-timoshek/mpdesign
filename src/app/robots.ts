import { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

const baseUrl = getPublicSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
