import localBundle from "@/data/content.local.json";
import {
  defaultLocale,
  contactConfig,
  legalPages,
  locales,
  seoDefaults,
} from "@/lib/site-config";
import {
  Category,
  CategorySlug,
  LeadResponse,
  LocalContentBundle,
  Locale,
  Product,
  SiteContent,
} from "@/types/content";

const typedLocalBundle = localBundle as LocalContentBundle;

const remoteContentUrl = process.env.CONTENT_API_URL;

function normalizeLocalizedValue(value: Record<string, string>, fieldPath: string) {
  const fr = value.fr?.trim();
  const de = value.de?.trim();

  if (!fr) {
    throw new Error(`[content] Missing fr translation for ${fieldPath}.`);
  }

  if (!de) {
    throw new Error(`[content] Missing de translation for ${fieldPath}.`);
  }

  return {
    fr,
    de,
  } as const;
}

function normalizeProducts(products: Product[]) {
  return products.map((product) => ({
    ...product,
    title: normalizeLocalizedValue(product.title, `${product.slug}.title`),
    subtitle: normalizeLocalizedValue(product.subtitle, `${product.slug}.subtitle`),
    summary: normalizeLocalizedValue(product.summary, `${product.slug}.summary`),
    ctaLabel: normalizeLocalizedValue(product.ctaLabel, `${product.slug}.ctaLabel`),
    heroImage: {
      ...product.heroImage,
      alt: normalizeLocalizedValue(
        product.heroImage.alt,
        `${product.slug}.heroImage.alt`,
      ),
    },
    gallery: product.gallery.map((media, index) => ({
      ...media,
      alt: normalizeLocalizedValue(media.alt, `${product.slug}.gallery[${index}].alt`),
    })),
    features: {
      fr: product.features.fr?.length
        ? product.features.fr
        : (() => {
            throw new Error(`[content] Missing fr features for ${product.slug}.`);
          })(),
      de: product.features.de?.length
        ? product.features.de
        : (() => {
            throw new Error(`[content] Missing de features for ${product.slug}.`);
          })(),
    },
    specs: product.specs.map((spec, index) => ({
      label: normalizeLocalizedValue(spec.label, `${product.slug}.specs[${index}].label`),
      value: normalizeLocalizedValue(spec.value, `${product.slug}.specs[${index}].value`),
    })),
    colorPalette: product.colorPalette?.map((option, index) => ({
      ...option,
      name: normalizeLocalizedValue(
        option.name,
        `${product.slug}.colorPalette[${index}].name`,
      ),
      note: option.note
        ? normalizeLocalizedValue(
            option.note,
            `${product.slug}.colorPalette[${index}].note`,
          )
        : undefined,
    })),
    documents: product.documents?.map((document, index) => ({
      ...document,
      label: normalizeLocalizedValue(
        document.label,
        `${product.slug}.documents[${index}].label`,
      ),
    })),
  }));
}

function normalizeCategories(categories: Category[]) {
  return categories.map((category) => ({
    ...category,
    title: normalizeLocalizedValue(category.title, `${category.slug}.title`),
    subtitle: normalizeLocalizedValue(category.subtitle, `${category.slug}.subtitle`),
    description: normalizeLocalizedValue(
      category.description,
      `${category.slug}.description`,
    ),
    heroImage: {
      ...category.heroImage,
      alt: normalizeLocalizedValue(
        category.heroImage.alt,
        `${category.slug}.heroImage.alt`,
      ),
    },
  }));
}

async function loadRemoteBundle(): Promise<LocalContentBundle | null> {
  if (!remoteContentUrl) {
    return null;
  }

  try {
    const response = await fetch(remoteContentUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      console.warn(
        `[content] Remote content unavailable (${response.status}), fallback to local.`,
      );
      return null;
    }

    const payload = (await response.json()) as LocalContentBundle;

    if (
      !payload ||
      !Array.isArray(payload.products) ||
      !Array.isArray(payload.categories)
    ) {
      console.warn("[content] Remote content payload invalid, fallback to local.");
      return null;
    }

    return payload;
  } catch (error) {
    console.warn("[content] Failed to load remote content, fallback to local.", error);
    return null;
  }
}

export async function getSiteContent(): Promise<SiteContent> {
  const remoteBundle = await loadRemoteBundle();
  const source = remoteBundle ?? typedLocalBundle;

  return {
    locales,
    defaultLocale,
    updatedAt: source.updatedAt,
    categories: normalizeCategories(source.categories),
    products: normalizeProducts(source.products),
    landing: {
      hero: {
        title: normalizeLocalizedValue(source.landing.hero.title, "landing.hero.title"),
        description: normalizeLocalizedValue(
          source.landing.hero.description,
          "landing.hero.description",
        ),
        primaryCta: normalizeLocalizedValue(
          source.landing.hero.primaryCta,
          "landing.hero.primaryCta",
        ),
        secondaryCta: normalizeLocalizedValue(
          source.landing.hero.secondaryCta,
          "landing.hero.secondaryCta",
        ),
      },
    },
    contacts: contactConfig,
    legal: legalPages,
  };
}

export function getCategoryPath(slug: CategorySlug, locale: Locale) {
  switch (slug) {
    case "windows-pvc":
      return `/${locale}/windows/pvc`;
    case "windows-wood":
      return `/${locale}/windows/wood`;
    case "windows-aluminum":
      return `/${locale}/windows/aluminum`;
    case "doors":
      return `/${locale}/doors`;
    case "shutters":
      return `/${locale}/shutters`;
    default:
      return `/${locale}`;
  }
}

export function getProductsByCategory(products: Product[], slug: CategorySlug) {
  return products.filter((product) => product.category === slug);
}

export function getCategoryByMaterial(material: string): CategorySlug | null {
  switch (material) {
    case "pvc":
      return "windows-pvc";
    case "wood":
      return "windows-wood";
    case "aluminum":
      return "windows-aluminum";
    default:
      return null;
  }
}

export function getSeoForPage(locale: Locale, title?: string, description?: string) {
  const defaults = seoDefaults[locale];
  return {
    title: title ? `${title} | MPDESIGN` : defaults.title,
    description: description || defaults.description,
  };
}

export async function submitLeadForm(
  payload: Record<string, unknown>,
): Promise<LeadResponse> {
  const endpoint = process.env.NEXT_PUBLIC_LEAD_ENDPOINT;

  if (!endpoint) {
    return {
      ok: false,
      errorCode: "missing_endpoint",
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        ok: false,
        errorCode: `http_${response.status}`,
      };
    }

    return (await response.json()) as LeadResponse;
  } catch {
    return {
      ok: false,
      errorCode: "network_error",
    };
  }
}
