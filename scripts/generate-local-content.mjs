import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const draftRoot = process.env.DRAFT_ROOT
  ? path.resolve(process.env.DRAFT_ROOT)
  : path.resolve(projectRoot, "../черновик:макет");

const outputFile = path.resolve(projectRoot, "src/data/content.local.json");

const categoryDefinitions = {
  "windows-pvc": {
    slug: "windows-pvc",
    group: "windows",
    sourceFolder: "PVH",
    listingPage: "pvh-windows.html",
    title: {
      fr: "Fenetres PVC",
      de: "Kunststofffenster",
    },
    subtitle: {
      fr: "Performance thermique et design contemporain",
      de: "Waermedaemmung und modernes Design",
    },
    description: {
      fr: "Collection PVC complete avec options standard, renovation et coulissant.",
      de: "Vollstaendige PVC-Kollektion mit Standard-, Renovierungs- und Schiebesystemen.",
    },
  },
  "windows-wood": {
    slug: "windows-wood",
    group: "windows",
    sourceFolder: "WOOD",
    listingPage: "wooden-windows.html",
    title: {
      fr: "Fenetres Bois",
      de: "Holzfenster",
    },
    subtitle: {
      fr: "Elegance naturelle et isolation premium",
      de: "Natuerliche Eleganz und Premium-Daemmung",
    },
    description: {
      fr: "Gamme bois complete avec profils classiques, modernes et solutions coulissantes.",
      de: "Komplette Holzreihe mit klassischen, modernen und Schiebe-Loesungen.",
    },
  },
  "windows-aluminum": {
    slug: "windows-aluminum",
    group: "windows",
    sourceFolder: "ALU",
    listingPage: "aluminum-windows.html",
    title: {
      fr: "Fenetres Aluminium",
      de: "Aluminiumfenster",
    },
    subtitle: {
      fr: "Lignes architecturales et haute durabilite",
      de: "Architektonische Linien und hohe Langlebigkeit",
    },
    description: {
      fr: "Systemes aluminium pour maisons modernes, grandes ouvertures et securite renforcee.",
      de: "Aluminium-Systeme fuer moderne Haeuser, grosse Oeffnungen und erhoehte Sicherheit.",
    },
  },
  doors: {
    slug: "doors",
    group: "doors",
    sourceFolder: "DOORS",
    listingPage: "doors.html",
    title: {
      fr: "Portes",
      de: "Tueren",
    },
    subtitle: {
      fr: "Collection entree bois et PVC",
      de: "Eingangskollektion aus Holz und PVC",
    },
    description: {
      fr: "Portes d'entree premium en finition bois ou PVC avec securite multipoint.",
      de: "Premium-Eingangstueren in Holz- oder PVC-Ausfuehrung mit Mehrfachverriegelung.",
    },
  },
};

const folderToCategory = {
  PVH: "windows-pvc",
  WOOD: "windows-wood",
  ALU: "windows-aluminum",
  DOORS: "doors",
};

const categoryOrder = ["windows-pvc", "windows-wood", "windows-aluminum", "doors"];

function readFile(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function cleanText(value) {
  return decodeEntities(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[\u200B\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUnits(value) {
  return value
    .replace(/мм/gi, "mm")
    .replace(/см/gi, "cm")
    .replace(/м²/gi, "m²")
    .replace(/м3/gi, "m3")
    .replace(/Вт/gi, "W")
    .replace(/кВт/gi, "kW")
    .replace(/°С/gi, "°C")
    .replace(/кг/gi, "kg");
}

function hasCyrillic(text) {
  return /[А-Яа-яЁё]/.test(text);
}

function sanitizeLocalizedValue(localizedValue, fallbackFr, fallbackDe) {
  const normalizedFr = normalizeUnits(localizedValue.fr || "");
  const normalizedDe = normalizeUnits(localizedValue.de || "");
  const fr = !hasCyrillic(normalizedFr) ? normalizedFr : "";
  const de = !hasCyrillic(normalizedDe) ? normalizedDe : "";

  return {
    fr: (fr || fallbackFr).trim(),
    de: (de || fr || fallbackDe || fallbackFr).trim(),
  };
}

function sanitizeArrayItems(items, fallbackValue) {
  const filtered = items
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && !hasCyrillic(item));

  if (filtered.length > 0) {
    return filtered;
  }

  return [fallbackValue];
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&eacute;/gi, "e")
    .replace(/&egrave;/gi, "e")
    .replace(/&ecirc;/gi, "e")
    .replace(/&uuml;/gi, "u")
    .replace(/&ouml;/gi, "o")
    .replace(/&auml;/gi, "a")
    .replace(/&szlig;/gi, "ss");
}

function extractLocalizedText(htmlChunk, locale) {
  const regex = new RegExp(
    `<span[^>]*data-lang-${locale}[^>]*>([\\s\\S]*?)<\\/span>`,
    "gi",
  );
  const chunks = [];
  let match;
  while ((match = regex.exec(htmlChunk)) !== null) {
    const text = cleanText(match[1]);
    if (text) {
      chunks.push(text);
    }
  }
  return chunks.join(" ").trim();
}

function normalizeImageSrc(src, folder) {
  if (!src) {
    return "";
  }

  if (/^https?:\/\//i.test(src)) {
    return src;
  }

  const normalized = src
    .replace(/^\.\.\//, "")
    .replace(/^\.\//, "")
    .replace(/^\//, "");

  if (normalized.startsWith("images/")) {
    return `/assets/${encodeURI(normalized)}`;
  }

  if (normalized.startsWith(`${folder}/`)) {
    return `/assets/${encodeURI(normalized)}`;
  }

  return `/assets/images/${encodeURI(normalized)}`;
}

function removeTitleNoise(rawTitle) {
  return rawTitle
    .replace(/\s*-\s*Witraz[\s\S]*$/i, "")
    .replace(/\s*\/\s*Schweiz$/i, "")
    .trim();
}

function extractListingOrder(listingPage) {
  const html = readFile(path.join(draftRoot, listingPage));
  const links = [];

  for (const match of html.matchAll(
    /href="(?:PVH|WOOD|ALU|DOORS)\/product-([^"]+)\.html"/gi,
  )) {
    if (!links.includes(match[1])) {
      links.push(match[1]);
    }
  }

  return links;
}

function extractSpecCards(html, categoryKey, fallbackTitle) {
  const specCards = [];
  const pairMatches = html.matchAll(
    /<div class="spec-label">([\s\S]*?)<\/div>\s*<div class="spec-value">([\s\S]*?)<\/div>/gi,
  );

  for (const pairMatch of pairMatches) {
    const labelChunk = pairMatch[1] || "";
    const valueChunk = pairMatch[2] || "";

    const frLabel = extractLocalizedText(labelChunk, "fr") || cleanText(labelChunk);
    const deLabel =
      extractLocalizedText(labelChunk, "de") || cleanText(labelChunk) || frLabel;

    const frValue =
      extractLocalizedText(valueChunk, "fr") || normalizeUnits(cleanText(valueChunk));
    const deValue =
      extractLocalizedText(valueChunk, "de") ||
      normalizeUnits(cleanText(valueChunk)) ||
      frValue;

    if (frLabel || frValue || deLabel || deValue) {
      specCards.push({
        label: {
          fr: frLabel || fallbackTitle,
          de: deLabel || frLabel || fallbackTitle,
        },
        value: {
          fr: frValue || "A confirmer",
          de: deValue || frValue || "Zu bestaetigen",
        },
      });
    }
  }

  if (specCards.length > 0) {
    return specCards.slice(0, 8);
  }

  const defaults = {
    "windows-pvc": [
      {
        label: { fr: "Isolation Uw", de: "Daemmung Uw" },
        value: { fr: "Jusqu'a 0.74 W/(m2K)", de: "Bis 0.74 W/(m2K)" },
      },
      {
        label: { fr: "Profil", de: "Profil" },
        value: { fr: "PVC multi-chambres", de: "PVC Mehrkammer" },
      },
    ],
    "windows-wood": [
      {
        label: { fr: "Materiau", de: "Material" },
        value: { fr: "Bois lamelle-colle", de: "Leimholz" },
      },
      {
        label: { fr: "Performance", de: "Leistung" },
        value: { fr: "Isolation premium", de: "Premium-Daemmung" },
      },
    ],
    "windows-aluminum": [
      {
        label: { fr: "Structure", de: "Struktur" },
        value: { fr: "Aluminium renforce", de: "Verstaerktes Aluminium" },
      },
      {
        label: { fr: "Usage", de: "Einsatz" },
        value: { fr: "Grandes ouvertures", de: "Grosse Oeffnungen" },
      },
    ],
    doors: [
      {
        label: { fr: "Securite", de: "Sicherheit" },
        value: { fr: "Serrure multipoint", de: "Mehrfachverriegelung" },
      },
      {
        label: { fr: "Finition", de: "Oberflaeche" },
        value: { fr: "Bois ou PVC", de: "Holz oder PVC" },
      },
    ],
  };

  return defaults[categoryKey] ?? [];
}

function extractFeatures(html, title) {
  const ulChunk =
    (html.match(/<ul class="features-list">([\s\S]*?)<\/ul>/i) || [])[1] || "";
  if (!ulChunk) {
    return {
      fr: ["Configuration personnalisee selon votre projet."],
      de: ["Individuelle Konfiguration fuer Ihr Projekt."],
    };
  }

  const fr = [];
  const de = [];

  for (const liMatch of ulChunk.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)) {
    const li = liMatch[1];
    const frItem = extractLocalizedText(li, "fr") || cleanText(li);
    const deItem = extractLocalizedText(li, "de") || cleanText(li) || frItem;

    if (frItem) {
      fr.push(frItem);
    }

    if (deItem) {
      de.push(deItem);
    }
  }

  return {
    fr: fr.length > 0 ? fr : [`Caracteristiques techniques de ${title}.`],
    de: de.length > 0 ? de : [`Technische Merkmale von ${title}.`],
  };
}

function extractSummary(html, title, categoryKey) {
  const leadChunk = (html.match(/<p class="product-lead"[\s\S]*?<\/p>/i) || [])[0] || "";
  const subtitleChunks = Array.from(
    html.matchAll(/<p class="product-subtitle"[\s\S]*?<\/p>/gi),
  ).map((item) => item[0]);

  const frLead = extractLocalizedText(leadChunk, "fr") || cleanText(leadChunk);
  const deLead = extractLocalizedText(leadChunk, "de") || cleanText(leadChunk) || frLead;

  const frSubtitle = subtitleChunks
    .map((chunk) => extractLocalizedText(chunk, "fr") || cleanText(chunk))
    .find(Boolean);
  const deSubtitle = subtitleChunks
    .map((chunk) => extractLocalizedText(chunk, "de") || cleanText(chunk))
    .find(Boolean);

  const fallbackSummaryByCategory = {
    "windows-pvc": {
      fr: `${title} combine isolation thermique, confort acoustique et design moderne pour les projets en Suisse.`,
      de: `${title} kombiniert Waermedaemmung, akustischen Komfort und modernes Design fuer Projekte in der Schweiz.`,
    },
    "windows-wood": {
      fr: `${title} valorise l'architecture avec un rendu naturel et des performances energetiques premium.`,
      de: `${title} wertet Architektur mit natuerlicher Anmutung und Premium-Energieleistung auf.`,
    },
    "windows-aluminum": {
      fr: `${title} est concu pour les ouvertures architecturales exigeantes et la durabilite long terme.`,
      de: `${title} ist fuer anspruchsvolle Architektur-Oeffnungen und langfristige Haltbarkeit ausgelegt.`,
    },
    doors: {
      fr: `${title} offre une entree securisee avec une finition haut de gamme adaptee a votre style.`,
      de: `${title} bietet einen sicheren Eingang mit hochwertiger Oberflaeche passend zu Ihrem Stil.`,
    },
  };

  const fallback = fallbackSummaryByCategory[categoryKey];

  return {
    subtitle: {
      fr: frSubtitle || fallback?.fr || "Produit premium",
      de: deSubtitle || fallback?.de || "Premium-Produkt",
    },
    summary: {
      fr: frLead || fallback?.fr || "Description a confirmer.",
      de: deLead || fallback?.de || "Beschreibung zu bestaetigen.",
    },
  };
}

function parseProductFile(categoryKey, folder, fileName) {
  const filePath = path.join(draftRoot, folder, fileName);
  const html = readFile(filePath);
  const slug = fileName.replace(/^product-/, "").replace(/\.html$/, "");
  const rawTitle = (html.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] || slug;
  const title = removeTitleNoise(cleanText(rawTitle)) || slug;

  const mainImageSrc = (html.match(/id="mainImage"[^>]*src="([^"]+)"/i) || [])[1] || "";
  const thumbnailMatches = Array.from(
    html.matchAll(/<img[^>]*src="([^"]+)"[^>]*>/gi),
  ).map((m) => m[1]);

  const gallery = [];
  const seen = new Set();

  const imageCandidates = [mainImageSrc, ...thumbnailMatches].filter(Boolean);
  for (const candidate of imageCandidates) {
    const normalized = normalizeImageSrc(candidate, folder);
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

  const { subtitle, summary } = extractSummary(html, title, categoryKey);
  const features = extractFeatures(html, title);
  const specs = extractSpecCards(html, categoryKey, title);

  const family = slug.includes("door-wood")
    ? "wood"
    : slug.includes("door-pvc")
      ? "pvc"
      : folder === "PVH"
        ? "pvc"
        : folder === "WOOD"
          ? "wood"
          : folder === "ALU"
            ? "aluminum"
            : folder === "DOORS"
              ? "wood"
              : "general";

  const fallbackByCategory = {
    "windows-pvc": {
      fr: `${title} pour projets PVC haute performance en Suisse.`,
      de: `${title} fuer leistungsstarke PVC-Projekte in der Schweiz.`,
    },
    "windows-wood": {
      fr: `${title} avec finition bois premium et isolation renforcee.`,
      de: `${title} mit Premium-Holzoptik und verstaerkter Daemmung.`,
    },
    "windows-aluminum": {
      fr: `${title} pour architecture moderne et grandes ouvertures.`,
      de: `${title} fuer moderne Architektur und grosse Oeffnungen.`,
    },
    doors: {
      fr: `${title} pour une entree securisee et elegante.`,
      de: `${title} fuer einen sicheren und eleganten Eingangsbereich.`,
    },
  };

  const fallback = fallbackByCategory[categoryKey];

  const safeTitle = sanitizeLocalizedValue(
    {
      fr: title,
      de: title,
    },
    title,
    title,
  );
  const safeSubtitle = sanitizeLocalizedValue(subtitle, fallback.fr, fallback.de);
  const safeSummary = sanitizeLocalizedValue(summary, fallback.fr, fallback.de);

  const safeFeatures = {
    fr: sanitizeArrayItems(
      features.fr,
      `Configuration technique personnalisee pour ${safeTitle.fr}.`,
    ),
    de: sanitizeArrayItems(features.de, `Technische Konfiguration fuer ${safeTitle.de}.`),
  };

  const safeSpecs = specs.map((spec) => ({
    label: sanitizeLocalizedValue(spec.label, "Specification", "Spezifikation"),
    value: sanitizeLocalizedValue(spec.value, fallback.fr, fallback.de),
  }));

  return {
    slug,
    sourcePath: path.relative(draftRoot, filePath),
    category: categoryKey,
    family,
    title: safeTitle,
    subtitle: safeSubtitle,
    summary: safeSummary,
    heroImage: gallery[0] || {
      src: "/assets/images/pwh-win/V82powertherm.png",
      alt: { fr: title, de: title },
    },
    gallery: gallery.slice(0, 40),
    features: safeFeatures,
    specs: safeSpecs,
    ctaLabel: {
      fr: "Demander un devis",
      de: "Angebot anfragen",
    },
  };
}

function buildProducts() {
  const listingOrder = {};
  for (const [categoryKey, definition] of Object.entries(categoryDefinitions)) {
    listingOrder[categoryKey] = extractListingOrder(definition.listingPage);
  }

  const products = [];

  for (const [folder, categoryKey] of Object.entries(folderToCategory)) {
    const folderPath = path.join(draftRoot, folder);
    const files = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith(".html") && file.startsWith("product-"))
      .sort((a, b) => a.localeCompare(b));

    for (const fileName of files) {
      products.push(parseProductFile(categoryKey, folder, fileName));
    }
  }

  const orderMap = new Map();
  for (const [categoryKey, slugs] of Object.entries(listingOrder)) {
    slugs.forEach((slug, index) => {
      orderMap.set(`${categoryKey}:${slug}`, index);
    });
  }

  return products.sort((a, b) => {
    const categoryDiff =
      categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
    if (categoryDiff !== 0) {
      return categoryDiff;
    }

    const aOrder = orderMap.get(`${a.category}:${a.slug}`);
    const bOrder = orderMap.get(`${b.category}:${b.slug}`);

    if (aOrder !== undefined && bOrder !== undefined) {
      return aOrder - bOrder;
    }

    if (aOrder !== undefined) {
      return -1;
    }

    if (bOrder !== undefined) {
      return 1;
    }

    return a.slug.localeCompare(b.slug);
  });
}

function buildCategories(products) {
  return categoryOrder.map((categoryKey) => {
    const definition = categoryDefinitions[categoryKey];
    const heroProduct = products.find((product) => product.category === categoryKey);

    return {
      slug: definition.slug,
      group: definition.group,
      title: definition.title,
      subtitle: definition.subtitle,
      description: definition.description,
      heroImage: heroProduct?.heroImage || {
        src: "/assets/images/pwh-win/V82powertherm.png",
        alt: {
          fr: definition.title.fr,
          de: definition.title.de,
        },
      },
    };
  });
}

function buildLocalContent() {
  const products = buildProducts();
  const categories = buildCategories(products);

  return {
    updatedAt: new Date().toISOString(),
    products,
    categories,
    landing: {
      hero: {
        title: {
          fr: "MPDESIGN - Fenetres et portes premium en Suisse",
          de: "MPDESIGN - Premium Fenster und Tueren in der Schweiz",
        },
        description: {
          fr: "Nous concevons des projets d'ouvertures complets avec conseil, prise de mesures, installation et suivi.",
          de: "Wir realisieren komplette Oeffnungsprojekte mit Beratung, Aufmass, Montage und Betreuung.",
        },
        primaryCta: {
          fr: "Demander une consultation",
          de: "Beratung anfragen",
        },
        secondaryCta: {
          fr: "Voir le catalogue",
          de: "Katalog ansehen",
        },
      },
    },
  };
}

if (!fs.existsSync(draftRoot)) {
  throw new Error(`Draft root not found: ${draftRoot}`);
}

const payload = buildLocalContent();
fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2) + "\n", "utf8");

console.warn(`Generated ${payload.products.length} products into ${outputFile}`);
