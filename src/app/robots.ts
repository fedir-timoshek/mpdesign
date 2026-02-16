import { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

const baseUrl = getPublicSiteUrl();
const deployEnv = process.env.SITE_DEPLOY_ENV || "staging";

export default function robots(): MetadataRoute.Robots {
  if (deployEnv === "staging") {
    // Keep staging out of search engines even if the subdomain is publicly reachable.
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

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
