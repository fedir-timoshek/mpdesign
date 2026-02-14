export type Locale = "fr" | "de";

export type LocalizedValue = Record<Locale, string>;

export type CategorySlug =
  | "windows-pvc"
  | "windows-wood"
  | "windows-aluminum"
  | "doors"
  | "shutters";

export type ProductFamily = "pvc" | "wood" | "aluminum" | "shutter" | "general";

export interface ProductMedia {
  src: string;
  alt: LocalizedValue;
}

export interface ProductColorOption {
  key: string;
  name: LocalizedValue;
  preview: string;
  note?: LocalizedValue | undefined;
}

export interface ProductDocument {
  label: LocalizedValue;
  href: string;
  kind: "palette" | "catalog" | "warranty" | "technical" | "other";
}

export interface ProductSpec {
  label: LocalizedValue;
  value: LocalizedValue;
}

export interface Product {
  slug: string;
  sourcePath: string;
  category: CategorySlug;
  family: ProductFamily;
  title: LocalizedValue;
  subtitle: LocalizedValue;
  summary: LocalizedValue;
  heroImage: ProductMedia;
  gallery: ProductMedia[];
  features: Record<Locale, string[]>;
  specs: ProductSpec[];
  colorPalette?: ProductColorOption[] | undefined;
  documents?: ProductDocument[] | undefined;
  ctaLabel: LocalizedValue;
}

export interface Category {
  slug: CategorySlug;
  group: "windows" | "doors" | "shutters";
  title: LocalizedValue;
  subtitle: LocalizedValue;
  description: LocalizedValue;
  heroImage: ProductMedia;
}

export interface LandingHero {
  title: LocalizedValue;
  description: LocalizedValue;
  primaryCta: LocalizedValue;
  secondaryCta: LocalizedValue;
}

export interface LandingContent {
  hero: LandingHero;
}

export interface LocalContentBundle {
  updatedAt: string;
  products: Product[];
  categories: Category[];
  landing: LandingContent;
}

export interface SeoFields {
  title: string;
  description: string;
}

export interface PageContent {
  title: string;
  description: string;
}

export interface LegalSection {
  heading: string;
  body: string;
}

export interface LegalPage {
  slug: "impressum" | "datenschutz" | "cookies";
  title: string;
  intro: string;
  sections: LegalSection[];
}

export interface ContactConfig {
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  whatsappHref: string;
  whatsappDisplay: string;
  serviceArea: LocalizedValue;
}

export interface LeadPayload {
  locale: Locale;
  sourcePage: string;
  productSlug?: string | undefined;
  name: string;
  phone?: string | undefined;
  email: string;
  message: string;
  consent: boolean;
  honeypot?: string | undefined;
}

export interface LeadResponse {
  ok: boolean;
  leadId?: string | undefined;
  timestamp?: string | undefined;
  errorCode?: string | undefined;
}

export interface SiteContent {
  locales: Locale[];
  defaultLocale: Locale;
  updatedAt: string;
  categories: Category[];
  products: Product[];
  landing: LandingContent;
  contacts: ContactConfig;
  legal: Record<Locale, LegalPage[]>;
}
