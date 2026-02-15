import { MetadataRoute } from "next";
import { getSiteContent } from "@/lib/content";
import { getPublicSiteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

const baseUrl = getPublicSiteUrl();

function withTrailingSlash(url: string) {
  return url.endsWith("/") ? url : `${url}/`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getSiteContent();
  const hasShutters = content.categories.some((category) => category.slug === "shutters");

  const staticRoutes = [
    "",
    "/windows",
    "/windows/pvc",
    "/windows/wood",
    "/windows/aluminum",
    ...(hasShutters ? ["/shutters"] : []),
    "/doors",
    "/impressum",
    "/datenschutz",
    "/cookies",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of content.locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: withTrailingSlash(`${baseUrl}/${locale}${route}`),
        lastModified: content.updatedAt,
        changeFrequency: "weekly",
        priority: route === "" ? 1 : 0.8,
      });
    }

    for (const product of content.products) {
      entries.push({
        url: withTrailingSlash(`${baseUrl}/${locale}/products/${product.slug}`),
        lastModified: content.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
