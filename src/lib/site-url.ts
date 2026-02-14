const fallbackSiteUrl = "https://mpdesign.invalid";

function normalizeSiteUrl(value: string | undefined) {
  if (!value) {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.origin;
  } catch {
    return "";
  }
}

export function getPublicSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) || fallbackSiteUrl;
}

