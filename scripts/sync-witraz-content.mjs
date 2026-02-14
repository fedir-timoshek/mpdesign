import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const contentFile = path.resolve(projectRoot, "src/data/content.local.json");
const reportFile = path.resolve(projectRoot, "docs/witraz-catalog-audit-latest.md");

const sourceDefinitions = {
  fr: {
    prefix: "/fr/produits",
    starts: [
      "https://www.witraz.eu/fr/produits/fenetres-pvc",
      "https://www.witraz.eu/fr/produits/fenetres-en-bois",
      "https://www.witraz.eu/fr/produits/fenetres-en-aluminium",
      "https://www.witraz.eu/fr/produits/portes",
    ],
    relatedPath: "/fr/connexe?sim=",
    manual: [
      "https://www.witraz.eu/fr/produits/fenetres-pvc/fenetres-koemmerling/kommerling-88,650",
    ],
  },
  de: {
    prefix: "/de/produkte",
    starts: [
      "https://www.witraz.eu/de/produkte/kunststofffenster",
      "https://www.witraz.eu/de/produkte/holzfenster",
      "https://www.witraz.eu/de/produkte/aluminium-fenster",
      "https://www.witraz.eu/de/produkte/tur",
    ],
    relatedPath: "/de/verbunden?sim=",
    manual: [],
  },
  pl: {
    prefix: "/produkty",
    starts: [
      "https://www.witraz.eu/produkty/okna-pvc",
      "https://www.witraz.eu/produkty/okna-drewniane",
      "https://www.witraz.eu/produkty/okna-aluminiowe",
      "https://www.witraz.eu/produkty/drzwi",
      "https://www.witraz.eu/produkty/rolety-zewnetrzne",
    ],
    relatedPath: "/connexe?sim=",
    manual: [],
  },
};

const sourcePriority = ["fr", "de", "pl"];
const categoryOrder = [
  "windows-pvc",
  "windows-wood",
  "windows-aluminum",
  "shutters",
  "doors",
];

const categoryMeta = {
  "windows-pvc": {
    group: "windows",
    title: {
      fr: "Fenetres PVC",
      de: "Kunststofffenster",
    },
    subtitle: {
      fr: "Isolation, etancheite et design contemporain",
      de: "Daemmung, Dichtigkeit und modernes Design",
    },
    description: {
      fr: "Systèmes PVC Witraż pour renovation, construction neuve et grands formats.",
      de: "Witraż PVC-Systeme fuer Renovierung, Neubau und grossformatige Elemente.",
    },
  },
  "windows-wood": {
    group: "windows",
    title: {
      fr: "Fenetres Bois",
      de: "Holzfenster",
    },
    subtitle: {
      fr: "Bois premium, confort naturel et performance thermique",
      de: "Premium-Holz, natuerlicher Komfort und starke Waermedaemmung",
    },
    description: {
      fr: "Collections bois, bois-aluminium et solutions speciales du catalogue fournisseur.",
      de: "Holz-, Holz-Aluminium- und Sonderloesungen aus dem Lieferantenkatalog.",
    },
  },
  "windows-aluminum": {
    group: "windows",
    title: {
      fr: "Fenetres Aluminium",
      de: "Aluminiumfenster",
    },
    subtitle: {
      fr: "Lignes architecturales et structures grand format",
      de: "Architekturlinien und grossformatige Konstruktionen",
    },
    description: {
      fr: "Systèmes aluminium Procural pour fenetres, portes et coulissants.",
      de: "Procural-Aluminiumsysteme fuer Fenster, Tueren und Schiebeelemente.",
    },
  },
  shutters: {
    group: "shutters",
    title: {
      fr: "Volets Roulants",
      de: "Rolllaeden",
    },
    subtitle: {
      fr: "Protection solaire et securite exterieure",
      de: "Sonnenschutz und Aussen-Sicherheit",
    },
    description: {
      fr: "Gamme complete de volets roulants externes selon le catalogue fournisseur.",
      de: "Vollstaendige Kollektion externer Rolllaeden gemaess Lieferantenkatalog.",
    },
  },
  doors: {
    group: "doors",
    title: {
      fr: "Portes",
      de: "Tueren",
    },
    subtitle: {
      fr: "Portes d'entree bois et PVC",
      de: "Eingangstueren aus Holz und PVC",
    },
    description: {
      fr: "Collection complete de portes d'entree du catalogue fournisseur Witraż.",
      de: "Vollstaendige Eingangstueren-Kollektion aus dem Witraż Lieferantenkatalog.",
    },
  },
};

const slugAliases = {
  "vekamotion-82-1": "vekamotion-82",
  "fenetre-mixtes-bois-aluminium-duo-classic": "duo-regular",
  "fenetre-mixtes-bois-aluminium-duo-contour": "duo-modern",
  "profile-de-renovation": "renovation",
  "la-fenetre-pivotante": "pivot",
  "hs-witraz-slide": "hs-slide",
  "modern-1": "door-wood-modern",
  elegance: "door-wood-elegance",
  classique: "door-wood-classique",
  vintage: "door-wood-vintage",
  "ideal-door": "door-pvc-prestige",
  "passive-door": "door-pvc-modern",
  "perfect-door": "door-pvc-classic",
  "pe-50": "pe50",
  "pt-50": "pe50",
  "pe-68-pe-68-hi": "pe68",
  "pe-78-n-pe-78-n-hi": "pe78n",
  "pe-78-ei": "pe78ei",
  "sl-1600-tt": "sl1600",
  "okno-drewniano-aluminiowe-duo-classic": "duo-regular",
  "okno-drewniano-aluminiowe-duo-contour": "duo-modern",
  "okno-drewniano-aluminiowe-duo-quadro": "duo-quadro",
  "das-schwingfenster": "pivot",
  "renovierungs-profil": "renovation",
  "profil-renowacyjny": "renovation",
  "sash-56-68-les-poids-et-les-ressorts": "sash",
  "sash-56-68-gegengewichte-und-federn": "sash",
  "sash-56-68-ciezarki-i-sprezyny": "sash",
  "casement-56-68": "casement",
  "psk-turen-von-witaz": "witraz-skb",
  nowoczesnosc: "door-wood-modern",
  stylowa: "door-wood-elegance",
  klasyczna: "door-wood-classique",
  htr: "htr",
  artistic: "door-wood-artistic",
  classic: "door-wood-classic",
  moderne: "door-wood-moderne",
};

const colorPaletteByFamily = {
  pvc: [
    {
      key: "pvc-white",
      name: { fr: "Blanc Mat", de: "Mattweiss" },
      preview: "#f4f4ef",
      note: {
        fr: "Finition standard moderne et lumineuse.",
        de: "Moderner heller Standardton.",
      },
    },
    {
      key: "pvc-anthracite",
      name: { fr: "Anthracite 7016", de: "Anthrazit 7016" },
      preview: "#3b4250",
      note: {
        fr: "Ton premium populaire en Suisse.",
        de: "Beliebter Premiumton in der Schweiz.",
      },
    },
    {
      key: "pvc-oak",
      name: { fr: "Chene Dore", de: "Golden Oak" },
      preview:
        "linear-gradient(135deg, #9b6c3f 0%, #bd8a52 45%, #8a5f38 100%)",
      note: {
        fr: "Decor bois chaleureux pour facades classiques.",
        de: "Warme Holzoptik fuer klassische Fassaden.",
      },
    },
    {
      key: "pvc-walnut",
      name: { fr: "Noyer", de: "Nussbaum" },
      preview:
        "linear-gradient(135deg, #5f3f2a 0%, #7a5338 50%, #4d311f 100%)",
      note: {
        fr: "Aspect bois profond et elegant.",
        de: "Tiefes und elegantes Holzbild.",
      },
    },
    {
      key: "pvc-ral",
      name: { fr: "RAL Personnalise", de: "RAL Individuell" },
      preview:
        "linear-gradient(120deg, #67707f 0%, #a3adb8 45%, #404954 100%)",
      note: {
        fr: "Toute teinte RAL selon projet.",
        de: "Jeder RAL-Ton je nach Projekt.",
      },
    },
  ],
  wood: [
    {
      key: "wood-natural",
      name: { fr: "Chene Naturel", de: "Natuerliche Eiche" },
      preview:
        "linear-gradient(135deg, #8c643d 0%, #b48353 45%, #7a5533 100%)",
      note: {
        fr: "Bois naturel satine avec veinage visible.",
        de: "Natuerliches Holz mit sichtbarer Maserung.",
      },
    },
    {
      key: "wood-pine",
      name: { fr: "Pin Clair", de: "Kiefer Hell" },
      preview:
        "linear-gradient(135deg, #d0ad7b 0%, #e0c092 45%, #ba965f 100%)",
      note: {
        fr: "Ambiance scandinave, ton doux.",
        de: "Skandinavische Stimmung mit weichem Farbton.",
      },
    },
    {
      key: "wood-meranti",
      name: { fr: "Meranti", de: "Meranti" },
      preview:
        "linear-gradient(135deg, #7e3f30 0%, #9e5544 48%, #6d3226 100%)",
      note: {
        fr: "Teinte chaude et prestige.",
        de: "Warmer Premium-Farbton.",
      },
    },
    {
      key: "wood-white",
      name: { fr: "Laque Blanche", de: "Weiss Lackiert" },
      preview: "#edece6",
      note: {
        fr: "Look epure pour architecture contemporaine.",
        de: "Klare Optik fuer moderne Architektur.",
      },
    },
    {
      key: "wood-ral",
      name: { fr: "Teinte Sur-Mesure", de: "Sonderfarbton" },
      preview:
        "linear-gradient(120deg, #66717b 0%, #95a1ad 45%, #3e4a54 100%)",
      note: {
        fr: "Large nuancier sur demande.",
        de: "Grosse Farbauswahl auf Anfrage.",
      },
    },
  ],
  aluminum: [
    {
      key: "alu-7016",
      name: { fr: "RAL 7016", de: "RAL 7016" },
      preview: "#3b4452",
      note: {
        fr: "Anthracite architectural tres demande.",
        de: "Sehr gefragter Architekturton Anthrazit.",
      },
    },
    {
      key: "alu-9005",
      name: { fr: "RAL 9005", de: "RAL 9005" },
      preview: "#141518",
      note: {
        fr: "Noir profond pour design minimaliste.",
        de: "Tiefschwarz fuer minimalistisches Design.",
      },
    },
    {
      key: "alu-9016",
      name: { fr: "RAL 9016", de: "RAL 9016" },
      preview: "#f3f4f2",
      note: {
        fr: "Blanc lumineux intemporel.",
        de: "Zeitloses helles Weiss.",
      },
    },
    {
      key: "alu-8019",
      name: { fr: "RAL 8019", de: "RAL 8019" },
      preview: "#463d3a",
      note: {
        fr: "Brun profond haut de gamme.",
        de: "Hochwertiger dunkler Braunton.",
      },
    },
    {
      key: "alu-ral",
      name: { fr: "Palette RAL Complete", de: "Komplette RAL-Palette" },
      preview:
        "linear-gradient(120deg, #3f4b5a 0%, #9aa5b1 35%, #2b3340 70%, #c8b083 100%)",
      note: {
        fr: "Personnalisation complete des finitions.",
        de: "Volle Individualisierung der Oberflaechen.",
      },
    },
  ],
  shutter: [
    {
      key: "shutter-white",
      name: { fr: "Blanc", de: "Weiss" },
      preview: "#f4f4ef",
      note: {
        fr: "Aspect propre et discret.",
        de: "Saubere und dezente Optik.",
      },
    },
    {
      key: "shutter-anthracite",
      name: { fr: "Anthracite", de: "Anthrazit" },
      preview: "#3f4653",
      note: {
        fr: "Contraste moderne facade + menuiserie.",
        de: "Moderner Kontrast fuer Fassade und Fenster.",
      },
    },
    {
      key: "shutter-silver",
      name: { fr: "Argent", de: "Silber" },
      preview: "#c9ced5",
      note: {
        fr: "Finition technique hautement polyvalente.",
        de: "Technische universelle Oberflaeche.",
      },
    },
    {
      key: "shutter-custom",
      name: { fr: "Couleur Sur Demande", de: "Sonderfarbe" },
      preview:
        "linear-gradient(120deg, #5f6877 0%, #a2adb9 45%, #424b58 100%)",
      note: {
        fr: "Nuancier fournisseur complet disponible.",
        de: "Vollstaendiger Lieferantenfarbfaecher verfuegbar.",
      },
    },
  ],
};

const host = "https://www.witraz.eu";
const supportedCategorySlugs = new Set(Object.keys(categoryMeta));
const htmlCache = new Map();
const translationCache = new Map();
const userAgent = "Mozilla/5.0 (Codex Catalog Sync)";
const requestTimeoutMs = 15000;
const maxRequestRetries = 2;
const retryBackoffMs = 500;
const supplierProbeUrl = `${host}/fr/produits/fenetres-pvc`;

function decodeEntities(value = "") {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&eacute;/gi, "é")
    .replace(/&egrave;/gi, "è")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&agrave;/gi, "à")
    .replace(/&uuml;/gi, "ü")
    .replace(/&ouml;/gi, "ö")
    .replace(/&auml;/gi, "ä")
    .replace(/&szlig;/gi, "ß")
    .replace(/&ndash;/gi, "-")
    .replace(/&mdash;/gi, "-")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-fA-F]+);/g, (_, code) =>
      String.fromCharCode(Number.parseInt(code, 16)),
    );
}

function cleanText(value = "") {
  return decodeEntities(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeUrl(value) {
  return value.replace(/\/$/, "");
}

function normalizeLink(href) {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("javascript:")
  ) {
    return "";
  }

  try {
    const parsed = new URL(href, host);
    if (parsed.origin !== host) {
      return "";
    }

    parsed.hash = "";
    parsed.search = "";
    return normalizeUrl(parsed.toString());
  } catch {
    return "";
  }
}

function slugify(value) {
  return decodeEntities(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function extractRawSlug(url) {
  const pathName = new URL(url).pathname;
  const chunk = pathName.split("/").pop() || "";
  return chunk.replace(/,\d+$/, "");
}

function extractProductIdFromUrl(url) {
  const chunk = new URL(url).pathname.split("/").pop() || "";
  const id = chunk.match(/,(\d+)$/);
  return id?.[1] || "";
}

function inferCategoryFromPath(pathName) {
  const lower = pathName.toLowerCase();

  if (
    lower.includes("/fenetres-pvc") ||
    lower.includes("/kunststofffenster") ||
    lower.includes("/okna-pvc")
  ) {
    return { category: "windows-pvc", family: "pvc" };
  }

  if (
    lower.includes("/fenetres-en-bois") ||
    lower.includes("/holzfenster") ||
    lower.includes("/okna-drewniane")
  ) {
    return { category: "windows-wood", family: "wood" };
  }

  if (
    lower.includes("/fenetres-en-aluminium") ||
    lower.includes("/aluminium-fenster") ||
    lower.includes("/okna-aluminiowe")
  ) {
    return { category: "windows-aluminum", family: "aluminum" };
  }

  if (
    lower.includes("/volets") ||
    lower.includes("/rollladen") ||
    lower.includes("/rolety-zewnetrzne")
  ) {
    return { category: "shutters", family: "shutter" };
  }

  if (lower.includes("/portes") || lower.includes("/tur") || lower.includes("/drzwi")) {
    if (lower.includes("/bois") || lower.includes("/holz") || lower.includes("/drewno")) {
      return { category: "doors", family: "wood" };
    }

    if (lower.includes("/pvc") || lower.includes("/kunststoff")) {
      return { category: "doors", family: "pvc" };
    }

    return { category: "doors", family: "general" };
  }

  return null;
}

function detectDocumentKind(label = "", href = "") {
  const source = `${label} ${href}`.toLowerCase();

  if (
    source.includes("palette") ||
    source.includes("wzornik") ||
    source.includes("farb") ||
    source.includes("color") ||
    source.includes("couleur")
  ) {
    return "palette";
  }

  if (source.includes("garantie") || source.includes("gwaranc") || source.includes("warranty")) {
    return "warranty";
  }

  if (source.includes("catalog") || source.includes("katalog") || source.includes("brochure")) {
    return "catalog";
  }

  if (source.includes("technical") || source.includes("techn") || source.includes("fiche")) {
    return "technical";
  }

  return "other";
}

function pickRicherSource(incoming, current) {
  if (!current) {
    return incoming;
  }

  const incomingScore =
    incoming.summary.length + incoming.features.length * 25 + incoming.specs.length * 35;
  const currentScore =
    current.summary.length + current.features.length * 25 + current.specs.length * 35;

  return incomingScore >= currentScore ? incoming : current;
}

function ensureRecord(records, slug) {
  if (!records.has(slug)) {
    records.set(slug, {
      slug,
      productIds: new Set(),
      category: null,
      family: null,
      sourceUrls: [],
      media: [],
      documents: [],
      sourceByLocale: {
        fr: null,
        de: null,
        pl: null,
      },
    });
  }

  return records.get(slug);
}

function resolveRecordSlug(records, preferredSlug, productId) {
  if (!records.has(preferredSlug)) {
    return preferredSlug;
  }

  const existing = records.get(preferredSlug);
  if (!productId || existing.productIds.size === 0 || existing.productIds.has(productId)) {
    return preferredSlug;
  }

  return `${preferredSlug}-${productId}`;
}

function mergeMedia(existing, incoming) {
  const seen = new Set(existing.map((item) => item.src));
  const merged = [...existing];

  for (const media of incoming) {
    if (!media.src || seen.has(media.src)) {
      continue;
    }

    seen.add(media.src);
    merged.push(media);
  }

  return merged;
}

function mergeDocuments(existing, incoming) {
  const map = new Map();

  for (const document of existing) {
    map.set(document.href, document);
  }

  for (const document of incoming) {
    if (!map.has(document.href)) {
      map.set(document.href, document);
      continue;
    }

    const current = map.get(document.href);
    if (current.kind !== "palette" && document.kind === "palette") {
      current.kind = "palette";
    }

    if (document.label && !current.label) {
      current.label = document.label;
    }
  }

  return [...map.values()];
}

function normalizeTitleCandidate(value = "") {
  const cleaned = cleanText(value)
    .replace(/\s*-\s*Witraż[\s\S]*$/i, "")
    .replace(/^Collection\s+/i, "")
    .replace(/^(?:Découvrez|Entdecken Sie|Poznaj)\s+/i, "")
    .replace(/\.+$/, "")
    .trim();

  if (!cleaned) {
    return "";
  }

  const lowered = cleaned.toLowerCase();
  if (
    lowered === "site_name" ||
    lowered.includes("produits") ||
    lowered.includes("produkte") ||
    lowered.includes("produkt") ||
    lowered === "witraż les fenêtres" ||
    lowered === "witraz les fenetres" ||
    lowered === "witraż windows" ||
    lowered === "witraz windows" ||
    lowered === "witraż okna" ||
    lowered === "witraz okna"
  ) {
    return "";
  }

  return cleaned;
}

function isUsableParagraph(value = "") {
  const lower = value.toLowerCase();
  if (!lower) {
    return false;
  }

  if (
    lower.includes("telecharger") ||
    lower.includes("download") ||
    lower.includes("pobierz") ||
    lower.includes("offre complète")
  ) {
    return false;
  }

  return true;
}

function extractProductMedia(html, title) {
  const candidates = [];

  const leadImage =
    (html.match(/<div class="lead"[\s\S]*?<img[^>]*src="([^"]+)"/i) || [])[1] || "";
  if (leadImage) {
    candidates.push(leadImage);
  }

  const mainImage = (html.match(/<img[^>]*class="main-image"[^>]*src="([^"]+)"/i) || [])[1] || "";
  if (mainImage) {
    candidates.push(mainImage);
  }

  for (const match of html.matchAll(/data-preview="([^"]+)"/gi)) {
    candidates.push(match[1]);
  }

  const seen = new Set();
  const gallery = [];

  for (const candidate of candidates) {
    const normalized = normalizeLink(candidate);
    if (!normalized || seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    gallery.push({
      src: normalized,
      alt: {
        fr: title,
        de: title,
      },
    });
  }

  return gallery.slice(0, 24);
}

function extractProductDocuments(html) {
  const docs = [];
  const seen = new Set();

  const additionalSection = (html.match(/<div class="additional-description"[\s\S]*?<\/div>\s*<\/div>/i) || [])[0] || "";
  const targetChunk = additionalSection || html;

  for (const match of targetChunk.matchAll(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = normalizeLink(match[1]);
    if (!href || seen.has(href)) {
      continue;
    }

    if (!/\.pdf($|\?)/i.test(href) && !href.includes("/files=") && !href.includes("/ftp/")) {
      continue;
    }

    seen.add(href);
    const label = cleanText(match[2] || "") || "Document";
    docs.push({
      href,
      label,
      kind: detectDocumentKind(label, href),
    });
  }

  return docs.slice(0, 12);
}

function extractSpecs(html) {
  const rightBlock =
    (html.match(/<div class="right">([\s\S]*?)<\/div>\s*<div class="arrow"/i) || [])[1] || "";

  const specs = [];

  for (const match of rightBlock.matchAll(/<div class="item">([\s\S]*?)<\/div>\s*<\/div>/gi)) {
    const block = match[1] || "";
    const label = cleanText(
      (block.match(/<div class="item-description">([\s\S]*?)<\/div>/i) || [])[1] || "",
    );

    const value = cleanText(
      block.replace(/<div class="item-description">[\s\S]*?<\/div>/i, " "),
    );

    if (!label && !value) {
      continue;
    }

    specs.push({
      label: label || "Specification",
      value: value || "A confirmer",
    });
  }

  return specs.slice(0, 10);
}

function extractFeatures(html) {
  const leftBlock =
    (html.match(
      /<div class="specification[^"]*">[\s\S]*?<div class="left">([\s\S]*?)<\/div>\s*<div class="center-block">/i,
    ) || [])[1] || "";

  const features = [];
  for (const match of leftBlock.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
    const value = cleanText(match[1]);
    if (value && isUsableParagraph(value)) {
      features.push(value);
    }
  }

  return features.slice(0, 14);
}

function extractProductData(html, url) {
  const hasProductWindow = /<div class="window"[^>]*data-id="\d+"/i.test(html);
  if (!hasProductWindow) {
    return {
      hasProductWindow,
      productId: "",
      title: "",
      subtitle: "",
      summary: "",
      features: [],
      specs: [],
      media: [],
      documents: [],
      pathName: new URL(url).pathname,
    };
  }

  const productId =
    (html.match(/<div class="window"[^>]*data-id="(\d+)"/i) || [])[1] ||
    extractProductIdFromUrl(url);

  const pageTitle = normalizeTitleCandidate((html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || "");
  const h2Candidate = normalizeTitleCandidate(
    (html.match(
      /<div class="specification[^"]*"[\s\S]*?<h2[^>]*>[\s\S]*?<strong>([\s\S]*?)<\/strong>/i,
    ) || [])[1] || "",
  );
  const h1Candidate = normalizeTitleCandidate(
    (html.match(/<div class="lead">[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "",
  );

  const title = pageTitle || h2Candidate || h1Candidate || `Witraz-${productId}`;

  const leadText = cleanText(
    (html.match(/<div class="lead">[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1] || "",
  );

  const leftBlock =
    (html.match(
      /<div class="specification[^"]*">[\s\S]*?<div class="left">([\s\S]*?)<\/div>\s*<div class="center-block">/i,
    ) || [])[1] || "";

  const paragraphs = Array.from(leftBlock.matchAll(/<p>([\s\S]*?)<\/p>/gi))
    .map((match) => cleanText(match[1]))
    .filter((paragraph) => isUsableParagraph(paragraph));

  const summary = paragraphs.slice(0, 2).join(" ").trim();
  const subtitle = normalizeTitleCandidate(leadText) || paragraphs[0] || title;

  return {
    hasProductWindow,
    productId,
    title,
    subtitle,
    summary,
    features: extractFeatures(html),
    specs: extractSpecs(html),
    media: extractProductMedia(html, title),
    documents: extractProductDocuments(html),
    pathName: new URL(url).pathname,
  };
}

async function fetchHtml(url) {
  if (htmlCache.has(url)) {
    return htmlCache.get(url);
  }

  for (let attempt = 0; attempt <= maxRequestRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": userAgent,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`http_${response.status}`);
      }

      const html = await response.text();
      htmlCache.set(url, html);
      return html;
    } catch {
      if (attempt === maxRequestRetries) {
        htmlCache.set(url, "");
        return "";
      }
      await new Promise((resolve) =>
        setTimeout(resolve, retryBackoffMs * (attempt + 1)),
      );
    } finally {
      clearTimeout(timer);
    }
  }

  htmlCache.set(url, "");
  return "";
}

async function ensureSupplierReachable() {
  const html = await fetchHtml(supplierProbeUrl);
  if (!html || html.length < 200) {
    throw new Error(
      `Supplier is unreachable from this environment (${supplierProbeUrl}).`,
    );
  }
}

function extractProductLinks(html, source) {
  const links = new Set();
  const prefix = sourceDefinitions[source].prefix;

  for (const match of html.matchAll(/href="([^"]+)"/g)) {
    const link = normalizeLink(match[1]);
    if (!link) {
      continue;
    }

    const pathName = new URL(link).pathname;
    if (!pathName.startsWith(prefix)) {
      continue;
    }

    if (/\,\d+$/.test(pathName)) {
      links.add(link);
    }
  }

  return links;
}

async function crawlSourceLinks(source) {
  const definition = sourceDefinitions[source];
  const visited = new Set();
  const queue = [...definition.starts];
  const productLinks = new Set(definition.manual.map((url) => normalizeUrl(url)));

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    const html = await fetchHtml(current);
    if (!html) {
      continue;
    }

    for (const match of html.matchAll(/href="([^"]+)"/g)) {
      const link = normalizeLink(match[1]);
      if (!link) {
        continue;
      }

      const pathName = new URL(link).pathname;
      if (!pathName.startsWith(definition.prefix)) {
        continue;
      }

      if (/\,\d+$/.test(pathName)) {
        productLinks.add(link);
      } else if (pathName.split("/").length <= 8 && !visited.has(link)) {
        queue.push(link);
      }
    }

    if (visited.size % 20 === 0) {
      console.warn(
        `[sync] ${source.toUpperCase()} navigation pages: ${visited.size}, product urls: ${productLinks.size}`,
      );
    }
  }

  const relatedQueue = [...productLinks];
  const processedRelatedIds = new Set();
  let safety = 0;

  while (relatedQueue.length > 0 && safety < 2000) {
    safety += 1;
    const productUrl = relatedQueue.shift();
    const productHtml = await fetchHtml(productUrl);
    if (!productHtml) {
      continue;
    }

    const productId =
      (productHtml.match(/<div class="window"[^>]*data-id="(\d+)"/i) || [])[1] ||
      extractProductIdFromUrl(productUrl);

    if (!productId || processedRelatedIds.has(productId)) {
      continue;
    }

    processedRelatedIds.add(productId);

    const relatedUrl = `${host}${definition.relatedPath}${productId}`;
    const relatedHtml = await fetchHtml(relatedUrl);
    if (!relatedHtml) {
      continue;
    }

    const relatedLinks = extractProductLinks(relatedHtml, source);
    for (const related of relatedLinks) {
      if (!productLinks.has(related)) {
        productLinks.add(related);
        relatedQueue.push(related);
      }
    }

    if (safety % 40 === 0) {
      console.warn(
        `[sync] ${source.toUpperCase()} related crawl: ${safety} processed, product urls: ${productLinks.size}`,
      );
    }
  }

  return [...productLinks].sort();
}

function mapRawSlugToLocalSlug(rawSlug, inferred) {
  if (slugAliases[rawSlug]) {
    return slugAliases[rawSlug];
  }

  const cleanRaw = slugify(rawSlug);
  if (!cleanRaw) {
    return `witraz-${Date.now()}`;
  }

  if (inferred.category === "doors" && !cleanRaw.startsWith("door-")) {
    return `door-${inferred.family}-${cleanRaw}`;
  }

  if (inferred.category === "shutters" && !cleanRaw.startsWith("shutter-")) {
    return `shutter-${cleanRaw}`;
  }

  return cleanRaw;
}

async function translateChunk(text, fromLang, toLang) {
  const key = `${fromLang}->${toLang}:${text}`;
  if (translationCache.has(key)) {
    return translationCache.get(key);
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(
    text,
  )}`;

  for (let attempt = 0; attempt <= maxRequestRetries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), requestTimeoutMs);

    try {
      const response = await fetch(url, {
        headers: {
          "user-agent": userAgent,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`http_${response.status}`);
      }

      const payload = await response.json();
      const translated = Array.isArray(payload?.[0])
        ? payload[0]
            .map((item) => (Array.isArray(item) ? item[0] : ""))
            .join("")
            .trim()
        : "";

      translationCache.set(key, translated || "");
      return translated || "";
    } catch {
      if (attempt === maxRequestRetries) {
        translationCache.set(key, "");
        return "";
      }
      await new Promise((resolve) =>
        setTimeout(resolve, retryBackoffMs * (attempt + 1)),
      );
    } finally {
      clearTimeout(timer);
    }
  }

  translationCache.set(key, "");
  return "";
}

async function translateText(text, fromLang, toLang) {
  const normalized = text.trim();
  if (!normalized) {
    return "";
  }

  if (fromLang === toLang) {
    return normalized;
  }

  if (normalized.length < 1200) {
    const translated = await translateChunk(normalized, fromLang, toLang);
    return translated || normalized;
  }

  const parts = normalized.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length <= 1) {
    const translated = await translateChunk(normalized.slice(0, 1000), fromLang, toLang);
    return translated || normalized;
  }

  const out = [];
  for (const part of parts) {
    const translated = await translateChunk(part, fromLang, toLang);
    out.push(translated || part);
  }

  return out.join(" ").trim();
}

function languageCodeForSource(source) {
  if (source === "fr") {
    return "fr";
  }

  if (source === "de") {
    return "de";
  }

  return "pl";
}

async function localizeField(record, field, targetLocale) {
  const direct = record.sourceByLocale[targetLocale]?.[field]?.trim();
  if (direct) {
    return direct;
  }

  const donors = targetLocale === "fr" ? ["de", "pl"] : ["fr", "pl"];
  for (const donor of donors) {
    const sourceValue = record.sourceByLocale[donor]?.[field]?.trim();
    if (!sourceValue) {
      continue;
    }

    const translated = await translateText(
      sourceValue,
      languageCodeForSource(donor),
      targetLocale,
    );

    if (translated.trim()) {
      return translated.trim();
    }
  }

  return "";
}

async function localizeArrayValue(record, field, index, targetLocale) {
  const direct = record.sourceByLocale[targetLocale]?.[field]?.[index]?.trim();
  if (direct) {
    return direct;
  }

  const donors = targetLocale === "fr" ? ["de", "pl"] : ["fr", "pl"];
  for (const donor of donors) {
    const sourceValue = record.sourceByLocale[donor]?.[field]?.[index]?.trim();
    if (!sourceValue) {
      continue;
    }

    const translated = await translateText(
      sourceValue,
      languageCodeForSource(donor),
      targetLocale,
    );

    if (translated.trim()) {
      return translated.trim();
    }
  }

  return "";
}

async function localizeSpecs(record) {
  const frSpecs = record.sourceByLocale.fr?.specs || [];
  const deSpecs = record.sourceByLocale.de?.specs || [];
  const plSpecs = record.sourceByLocale.pl?.specs || [];
  const count = Math.max(frSpecs.length, deSpecs.length, plSpecs.length);

  const output = [];

  for (let index = 0; index < count; index += 1) {
    const frLabel =
      frSpecs[index]?.label ||
      (await localizeArrayValue(record, "specLabels", index, "fr")) ||
      "Specification";
    const deLabel =
      deSpecs[index]?.label ||
      (await localizeArrayValue(record, "specLabels", index, "de")) ||
      "Spezifikation";

    const frValue =
      frSpecs[index]?.value ||
      (await localizeArrayValue(record, "specValues", index, "fr")) ||
      "A confirmer";
    const deValue =
      deSpecs[index]?.value ||
      (await localizeArrayValue(record, "specValues", index, "de")) ||
      "Zu bestaetigen";

    output.push({
      label: {
        fr: frLabel,
        de: deLabel,
      },
      value: {
        fr: frValue,
        de: deValue,
      },
    });
  }

  return output;
}

async function localizeFeatures(record) {
  const frFeatures = record.sourceByLocale.fr?.features || [];
  const deFeatures = record.sourceByLocale.de?.features || [];
  const plFeatures = record.sourceByLocale.pl?.features || [];
  const count = Math.max(frFeatures.length, deFeatures.length, plFeatures.length);

  const fr = [];
  const de = [];

  for (let index = 0; index < count; index += 1) {
    const frValue =
      frFeatures[index] ||
      (await localizeArrayValue(record, "features", index, "fr")) ||
      "Configuration technique a confirmer.";

    const deValue =
      deFeatures[index] ||
      (await localizeArrayValue(record, "features", index, "de")) ||
      "Technische Konfiguration zu bestaetigen.";

    fr.push(frValue);
    de.push(deValue);
  }

  return {
    fr: fr.slice(0, 14),
    de: de.slice(0, 14),
  };
}

async function localizeDocuments(record) {
  const byHref = new Map();

  for (const source of sourcePriority) {
    const docs = record.sourceByLocale[source]?.documents || [];
    for (const doc of docs) {
      if (!byHref.has(doc.href)) {
        byHref.set(doc.href, {
          href: doc.href,
          kind: doc.kind,
          labels: {
            fr: source === "fr" ? doc.label : "",
            de: source === "de" ? doc.label : "",
            pl: source === "pl" ? doc.label : "",
          },
        });
      } else {
        const current = byHref.get(doc.href);
        if (current.kind !== "palette" && doc.kind === "palette") {
          current.kind = "palette";
        }
        current.labels[source] = current.labels[source] || doc.label;
      }
    }
  }

  const output = [];
  for (const entry of byHref.values()) {
    let fr = entry.labels.fr;
    let de = entry.labels.de;

    if (!fr && entry.labels.de) {
      fr = await translateText(entry.labels.de, "de", "fr");
    }
    if (!fr && entry.labels.pl) {
      fr = await translateText(entry.labels.pl, "pl", "fr");
    }

    if (!de && entry.labels.fr) {
      de = await translateText(entry.labels.fr, "fr", "de");
    }
    if (!de && entry.labels.pl) {
      de = await translateText(entry.labels.pl, "pl", "de");
    }

    output.push({
      label: {
        fr: fr || "Document technique",
        de: de || "Technisches Dokument",
      },
      href: entry.href,
      kind: entry.kind,
    });
  }

  return output.slice(0, 12);
}

function buildColorPalette(family, documents) {
  const base = colorPaletteByFamily[family] || colorPaletteByFamily.pvc;
  const hasPaletteDoc = documents.some((doc) => doc.kind === "palette");

  return base.map((option) => ({
    ...option,
    note: hasPaletteDoc
      ? {
          fr: `${option.note.fr} Nuancier complet dans les documents techniques.`,
          de: `${option.note.de} Vollstaendiger Farbfaecher in den technischen Dokumenten.`,
        }
      : option.note,
  }));
}

async function buildLocalizedProduct(record, existingProduct) {
  const titleFr = await localizeField(record, "title", "fr");
  const titleDe = await localizeField(record, "title", "de");
  const subtitleFr = await localizeField(record, "subtitle", "fr");
  const subtitleDe = await localizeField(record, "subtitle", "de");
  const summaryFr = await localizeField(record, "summary", "fr");
  const summaryDe = await localizeField(record, "summary", "de");

  const localizedFeatures = await localizeFeatures(record);
  const localizedSpecs = await localizeSpecs(record);
  const localizedDocs = await localizeDocuments(record);

  const gallery =
    record.media.length > 0
      ? record.media
      : existingProduct?.gallery?.length
        ? existingProduct.gallery
        : [
            {
              src: "/assets/images/pwh-win/V82powertherm.png",
              alt: {
                fr: titleFr || titleDe || record.slug,
                de: titleDe || titleFr || record.slug,
              },
            },
          ];

  const family = record.family || existingProduct?.family || "general";

  return {
    slug: record.slug,
    sourcePath: record.sourceUrls[0] || existingProduct?.sourcePath || "supplier-sync",
    category: record.category || existingProduct?.category || "windows-pvc",
    family,
    title: {
      fr: titleFr || existingProduct?.title?.fr || record.slug,
      de: titleDe || existingProduct?.title?.de || titleFr || record.slug,
    },
    subtitle: {
      fr:
        subtitleFr ||
        existingProduct?.subtitle?.fr ||
        `${titleFr || record.slug} - details techniques.`,
      de:
        subtitleDe ||
        existingProduct?.subtitle?.de ||
        `${titleDe || titleFr || record.slug} - technische Details.`,
    },
    summary: {
      fr:
        summaryFr ||
        existingProduct?.summary?.fr ||
        `${titleFr || record.slug} - description en cours de validation.`,
      de:
        summaryDe ||
        existingProduct?.summary?.de ||
        `${titleDe || titleFr || record.slug} - Beschreibung wird validiert.`,
    },
    heroImage: gallery[0],
    gallery: gallery.slice(0, 24),
    features: localizedFeatures,
    specs: localizedSpecs,
    documents: localizedDocs,
    colorPalette: buildColorPalette(family, localizedDocs),
    ctaLabel: {
      fr: "Demander un devis",
      de: "Angebot anfragen",
    },
  };
}

function buildCategories(products, existingCategories) {
  const existingMap = new Map(existingCategories.map((item) => [item.slug, item]));
  const result = [];

  for (const slug of categoryOrder) {
    const productsInCategory = products.filter((product) => product.category === slug);
    if (productsInCategory.length === 0) {
      continue;
    }

    const meta = categoryMeta[slug];
    const existing = existingMap.get(slug);
    const heroImage = productsInCategory[0].heroImage || existing?.heroImage;

    result.push({
      slug,
      group: meta.group,
      title: meta.title,
      subtitle: meta.subtitle,
      description: meta.description,
      heroImage,
    });
  }

  return result;
}

function diffProduct(before, after) {
  const changes = [];
  if (before.title.fr !== after.title.fr) {
    changes.push("title.fr");
  }
  if (before.title.de !== after.title.de) {
    changes.push("title.de");
  }
  if (before.subtitle.fr !== after.subtitle.fr) {
    changes.push("subtitle.fr");
  }
  if (before.subtitle.de !== after.subtitle.de) {
    changes.push("subtitle.de");
  }
  if (before.summary.fr !== after.summary.fr) {
    changes.push("summary.fr");
  }
  if (before.summary.de !== after.summary.de) {
    changes.push("summary.de");
  }
  if (JSON.stringify(before.features) !== JSON.stringify(after.features)) {
    changes.push("features");
  }
  if (JSON.stringify(before.specs) !== JSON.stringify(after.specs)) {
    changes.push("specs");
  }
  if (JSON.stringify(before.gallery) !== JSON.stringify(after.gallery)) {
    changes.push("gallery");
  }
  if (JSON.stringify(before.documents || []) !== JSON.stringify(after.documents || [])) {
    changes.push("documents");
  }
  if (JSON.stringify(before.colorPalette || []) !== JSON.stringify(after.colorPalette || [])) {
    changes.push("colorPalette");
  }
  if (before.category !== after.category) {
    changes.push("category");
  }
  if (before.family !== after.family) {
    changes.push("family");
  }

  return changes;
}

function writeAuditReport({
  sourceLinks,
  content,
  createdRows,
  updatedRows,
  ignoredRows,
  missingFr,
  missingDe,
}) {
  const lines = [];
  lines.push("# Witraz Catalog Audit (Auto-generated)");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Local catalog products: ${content.products.length}`);
  lines.push(`Source links FR: ${sourceLinks.fr.length}`);
  lines.push(`Source links DE: ${sourceLinks.de.length}`);
  lines.push(`Source links PL: ${sourceLinks.pl.length}`);
  lines.push(`Created products: ${createdRows.length}`);
  lines.push(`Updated products: ${updatedRows.length}`);
  lines.push(`Ignored supplier rows: ${ignoredRows.length}`);
  lines.push(`Missing FR source pages for local products: ${missingFr.length}`);
  lines.push(`Missing DE source pages for local products: ${missingDe.length}`);
  lines.push("");

  lines.push("## Created");
  lines.push("");
  if (createdRows.length === 0) {
    lines.push("- none");
  } else {
    for (const row of createdRows) {
      lines.push(`- ${row.slug}: ${row.reason}`);
    }
  }
  lines.push("");

  lines.push("## Updated");
  lines.push("");
  if (updatedRows.length === 0) {
    lines.push("- none");
  } else {
    for (const row of updatedRows) {
      lines.push(`- ${row.slug}: ${row.changes.join(", ")}`);
    }
  }
  lines.push("");

  lines.push("## Missing Locale Sources");
  lines.push("");
  for (const slug of missingFr) {
    lines.push(`- ${slug}: FR source not found`);
  }
  for (const slug of missingDe) {
    lines.push(`- ${slug}: DE source not found`);
  }
  if (missingFr.length === 0 && missingDe.length === 0) {
    lines.push("- none");
  }
  lines.push("");

  lines.push("## Ignored Supplier Rows");
  lines.push("");
  if (ignoredRows.length === 0) {
    lines.push("- none");
  } else {
    for (const row of ignoredRows) {
      lines.push(`- [${row.source}] ${row.url} (${row.reason})`);
    }
  }
  lines.push("");

  lines.push("## Catalog Counts");
  lines.push("");
  const grouped = new Map();
  for (const product of content.products) {
    grouped.set(product.category, (grouped.get(product.category) || 0) + 1);
  }
  for (const slug of categoryOrder) {
    if (grouped.has(slug)) {
      lines.push(`- ${slug}: ${grouped.get(slug)}`);
    }
  }
  lines.push("");

  fs.writeFileSync(reportFile, lines.join("\n"), "utf8");
}

function attachSyntheticArrays(record) {
  for (const source of sourcePriority) {
    const block = record.sourceByLocale[source];
    if (!block) {
      continue;
    }

    block.specLabels = block.specs.map((item) => item.label);
    block.specValues = block.specs.map((item) => item.value);
  }
}

async function main() {
  await ensureSupplierReachable();

  const content = JSON.parse(fs.readFileSync(contentFile, "utf8"));
  const existingProducts = content.products;
  const existingBySlug = new Map(existingProducts.map((product) => [product.slug, product]));
  const recordSlugByProductId = new Map();

  const sourceLinks = {
    fr: await crawlSourceLinks("fr"),
    de: await crawlSourceLinks("de"),
    pl: await crawlSourceLinks("pl"),
  };

  const records = new Map();
  const ignoredRows = [];

  for (const source of sourcePriority) {
    let processedInSource = 0;
    for (const url of sourceLinks[source]) {
      const html = await fetchHtml(url);
      if (!html) {
        ignoredRows.push({ source, url, reason: "fetch_failed" });
        continue;
      }

      const parsed = extractProductData(html, url);
      if (!parsed.hasProductWindow) {
        ignoredRows.push({ source, url, reason: "no_product_window" });
        continue;
      }

      const inferred = inferCategoryFromPath(parsed.pathName);
      if (!inferred || !supportedCategorySlugs.has(inferred.category)) {
        ignoredRows.push({ source, url, reason: "category_out_of_scope" });
        continue;
      }

      const rawSlug = extractRawSlug(url);
      const mappedSlug = mapRawSlugToLocalSlug(rawSlug, inferred);
      let localSlug = mappedSlug;

      if (parsed.productId && recordSlugByProductId.has(parsed.productId)) {
        localSlug = recordSlugByProductId.get(parsed.productId);
      } else {
        localSlug = resolveRecordSlug(records, mappedSlug, parsed.productId);
        if (parsed.productId) {
          recordSlugByProductId.set(parsed.productId, localSlug);
        }
      }

      const record = ensureRecord(records, localSlug);
      if (parsed.productId) {
        record.productIds.add(parsed.productId);
      }

      record.category = record.category || inferred.category;
      record.family = record.family || inferred.family;
      record.sourceUrls.push(url);
      record.media = mergeMedia(record.media, parsed.media);
      record.documents = mergeDocuments(record.documents, parsed.documents);

      const sourceBlock = {
        id: parsed.productId,
        rawSlug,
        url,
        title: parsed.title,
        subtitle: parsed.subtitle,
        summary: parsed.summary,
        features: parsed.features,
        specs: parsed.specs,
        documents: parsed.documents,
      };

      record.sourceByLocale[source] = pickRicherSource(sourceBlock, record.sourceByLocale[source]);
      processedInSource += 1;

      if (processedInSource % 20 === 0) {
        console.warn(
          `[sync] parsed ${processedInSource}/${sourceLinks[source].length} pages for ${source.toUpperCase()}`,
        );
      }
    }
  }

  for (const record of records.values()) {
    attachSyntheticArrays(record);
  }

  const updatedRows = [];
  const createdRows = [];

  const finalProducts = [];

  for (const existing of existingProducts) {
    const record = records.get(existing.slug);
    if (!record) {
      finalProducts.push(existing);
      continue;
    }

    const localizedProduct = await buildLocalizedProduct(record, existing);
    const changes = diffProduct(existing, localizedProduct);

    if (changes.length > 0) {
      updatedRows.push({
        slug: existing.slug,
        changes,
      });
    }

    finalProducts.push(localizedProduct);
  }

  for (const [slug, record] of records.entries()) {
    if (existingBySlug.has(slug)) {
      continue;
    }

    const localizedProduct = await buildLocalizedProduct(record);
    finalProducts.push(localizedProduct);
    createdRows.push({
      slug,
      reason: `new supplier product (FR:${record.sourceByLocale.fr ? "yes" : "no"}, DE:${record.sourceByLocale.de ? "yes" : "no"}, PL:${record.sourceByLocale.pl ? "yes" : "no"})`,
    });
  }

  finalProducts.sort((a, b) => {
    const categoryDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    if (categoryDiff !== 0) {
      return categoryDiff;
    }

    return a.title.fr.localeCompare(b.title.fr);
  });

  content.products = finalProducts;
  content.categories = buildCategories(finalProducts, content.categories || []);
  content.updatedAt = new Date().toISOString();

  const missingFr = [];
  const missingDe = [];

  for (const product of finalProducts) {
    const record = records.get(product.slug);
    if (!record?.sourceByLocale.fr) {
      missingFr.push(product.slug);
    }
    if (!record?.sourceByLocale.de) {
      missingDe.push(product.slug);
    }
  }

  fs.writeFileSync(contentFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");

  writeAuditReport({
    sourceLinks,
    content,
    createdRows,
    updatedRows,
    ignoredRows,
    missingFr,
    missingDe,
  });

  console.warn(`Source FR links: ${sourceLinks.fr.length}`);
  console.warn(`Source DE links: ${sourceLinks.de.length}`);
  console.warn(`Source PL links: ${sourceLinks.pl.length}`);
  console.warn(`Created products: ${createdRows.length}`);
  console.warn(`Updated products: ${updatedRows.length}`);
  console.warn(`Ignored rows: ${ignoredRows.length}`);
  console.warn(`Missing FR sources: ${missingFr.length}`);
  console.warn(`Missing DE sources: ${missingDe.length}`);
  console.warn(`Catalog size now: ${content.products.length}`);
  console.warn(`Audit report: ${path.relative(projectRoot, reportFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
