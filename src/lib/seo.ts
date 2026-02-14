import { isLocale } from "@/lib/routing";
import { Locale } from "@/types/content";

type BuildPath = (locale: Locale) => string;

export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : "fr";
}

export function buildLocaleAlternates(locale: Locale, buildPath: BuildPath) {
  return {
    canonical: buildPath(locale),
    languages: {
      fr: buildPath("fr"),
      de: buildPath("de"),
    },
  };
}

