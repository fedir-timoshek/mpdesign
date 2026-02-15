import { isLocale } from "@/lib/routing";
import { Locale } from "@/types/content";

type BuildPath = (locale: Locale) => string;

export const defaultOpenGraphImage = "/brand/logo.jpg";

function withTrailingSlash(value: string) {
  const text = String(value || "").trim();
  if (!text) {
    return "/";
  }
  return text.endsWith("/") ? text : `${text}/`;
}

export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : "fr";
}

export function buildLocaleAlternates(locale: Locale, buildPath: BuildPath) {
  return {
    canonical: withTrailingSlash(buildPath(locale)),
    languages: {
      fr: withTrailingSlash(buildPath("fr")),
      de: withTrailingSlash(buildPath("de")),
    },
  };
}

export function buildSocialMetadata(
  locale: Locale,
  title: string,
  description: string,
  imageSrc?: string,
) {
  const ogLocale = locale === "fr" ? "fr_CH" : "de_CH";
  const image = imageSrc || defaultOpenGraphImage;

  return {
    openGraph: {
      title,
      description,
      type: "website" as const,
      locale: ogLocale,
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image" as const,
      title,
      description,
      images: [image],
    },
  };
}
