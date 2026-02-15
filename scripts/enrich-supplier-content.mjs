import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const contentFile = path.resolve(projectRoot, "src/data/content.local.json");
const reportFile = path.resolve(projectRoot, "docs/witraz-enrichment-latest.md");

const jinaBase = "https://r.jina.ai/http://";
const requestTimeoutMs = 6000;
const maxRequestRetries = 0;
const retryBackoffMs = 700;
const userAgent = "Mozilla/5.0 (Codex Supplier Enricher)";

const polishCharMap = new Map([
  ["ą", "a"],
  ["ć", "c"],
  ["ę", "e"],
  ["ł", "l"],
  ["ń", "n"],
  ["ó", "o"],
  ["ś", "s"],
  ["ź", "z"],
  ["ż", "z"],
  ["Ą", "A"],
  ["Ć", "C"],
  ["Ę", "E"],
  ["Ł", "L"],
  ["Ń", "N"],
  ["Ó", "O"],
  ["Ś", "S"],
  ["Ź", "Z"],
  ["Ż", "Z"],
]);

function stripPolishChars(value) {
  return String(value || "")
    .split("")
    .map((ch) => polishCharMap.get(ch) ?? ch)
    .join("");
}

function detectSourceLocale(sourcePath) {
  if (sourcePath.includes("/fr/")) {
    return "fr";
  }
  if (sourcePath.includes("/de/")) {
    return "de";
  }
  return "pl";
}

function buildJinaUrl(sourcePath) {
  const normalized = sourcePath.startsWith("http") ? sourcePath : `https://${sourcePath}`;
  return `${jinaBase}${normalized}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), requestTimeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJinaMarkdown(sourcePath, cache) {
  if (cache.has(sourcePath)) {
    return cache.get(sourcePath);
  }

  const url = buildJinaUrl(sourcePath);

  for (let attempt = 0; attempt <= maxRequestRetries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, {
        method: "GET",
        headers: {
          "user-agent": userAgent,
          accept: "text/plain,*/*",
        },
      });

      if (!response.ok) {
        throw new Error(`http_${response.status}`);
      }

      const text = await response.text();
      cache.set(sourcePath, text);
      return text;
    } catch {
      if (attempt === maxRequestRetries) {
        cache.set(sourcePath, null);
        return null;
      }

      await sleep(retryBackoffMs * (attempt + 1));
    }
  }

  cache.set(sourcePath, null);
  return null;
}

function stripInlineMarkdown(value) {
  return String(value || "")
    .replace(/\*\*/g, "")
    .replace(/[_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSpecLines(markdown, sourceLocale) {
  const lines = String(markdown || "")
    .split(/\r?\n/)
    .map((line) => line.trim());

  const markers = {
    fr: [/voulez\s*-?\s*vous\s+en\s+savoir\s+plus\s*\?/i],
    de: [/m[oö]chten\s+sie\s+mehr\s+wissen\s*\?/i, /wollen\s+sie\s+mehr\s+wissen\s*\?/i],
    pl: [
      /chcesz\s+dowiedzie[cć]\s+si[eę]\s+wi[eę]cej\s*\?/i,
      /chcesz\s+dowiedziec\s+sie\s+wiecej\s*\?/i,
    ],
  };

  const markerIndex = lines.findIndex((line) => markers[sourceLocale].some((re) => re.test(line)));
  if (markerIndex === -1) {
    return [];
  }

  const collected = [];

  for (let i = markerIndex + 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) {
      continue;
    }

    if (/^descendez\s+/i.test(line)) {
      continue;
    }
    if (/^zjed[zź]\s+/i.test(line)) {
      continue;
    }
    if (/^scrollen\s+/i.test(line)) {
      continue;
    }

    if (line.startsWith("*")) {
      break;
    }
    if (line.startsWith("[")) {
      break;
    }
    if (line.startsWith("![")) {
      break;
    }
    if (/^[-=]{3,}$/.test(line)) {
      break;
    }
    if (/^composer\s+la\s+fen[eê]tre/i.test(line)) {
      break;
    }
    if (/^window\s+configurator/i.test(line)) {
      break;
    }
    if (/^konfigurator/i.test(line)) {
      break;
    }

    const cleaned = stripInlineMarkdown(line);
    if (!cleaned) {
      continue;
    }

    // Skip obvious non-spec headings.
    if (/^une\s+fen[eê]tre$/i.test(cleaned)) {
      continue;
    }

    collected.push(cleaned);

    if (collected.length >= 24) {
      break;
    }
  }

  return collected;
}

function specPairsFromLines(lines) {
  const pairs = [];

  for (let i = 0; i + 1 < lines.length; i += 2) {
    const value = stripInlineMarkdown(lines[i]);
    const label = stripInlineMarkdown(lines[i + 1]);
    if (!value || !label) {
      continue;
    }

    pairs.push({ label, value });
  }

  return pairs.slice(0, 10);
}

const dictionary = {
  fr: {
    label: [
      [/^classe\s+de\s+profil$/i, { fr: "Classe de profil", de: "Profilklasse" }],
      [/^valeur\s+uw$/i, { fr: "Valeur Uw", de: "Uw-Wert" }],
      [/^nombres?\s+de\s+verre\s+en\s+standard$/i, { fr: "Nombres de verre en standard", de: "Standardverglasung" }],
      [/^la\s+profondeur\s+de\s+profiles?$/i, { fr: "La profondeur de profiles", de: "Profiltiefe" }],
      [/^ferrure$/i, { fr: "Ferrure", de: "Beschlag" }],
      [/^extra\s+supplement$/i, { fr: "Extra supplement", de: "Extra-Optionen" }],
    ],
    value: [
      [/^profil\s+classe\s+/i, { fr: "Profil classe ", de: "Profilklasse " }],
      [/^uw\s+de\s+/i, { fr: "Uw de ", de: "Uw ab " }],
      [/^uw\s+/i, { fr: "Uw ", de: "Uw " }],
      [/^vitrages?\s+triples?$/i, { fr: "Vitrages triples", de: "Dreifachverglasung" }],
      [/^vitrages?\s+doubles?$/i, { fr: "Vitrages double", de: "Zweifachverglasung" }],
      [/^vitrages?\s+double$/i, { fr: "Vitrages double", de: "Zweifachverglasung" }],
      [/^la\s+profondeur\s+de\s+profiles?\s*[-:]?\s*/i, { fr: "La profondeur de profiles - ", de: "Profiltiefe - " }],
    ],
  },
  de: {
    label: [
      [/^profilklasse$/i, { fr: "Classe de profil", de: "Profilklasse" }],
      [/^(uw[- ]wert|uw wert)$/i, { fr: "Valeur Uw", de: "Uw-Wert" }],
      [/^standardverglasung$/i, { fr: "Nombres de verre en standard", de: "Standardverglasung" }],
      [/^profiltiefe$/i, { fr: "La profondeur de profiles", de: "Profiltiefe" }],
      [/^beschlag$/i, { fr: "Ferrure", de: "Beschlag" }],
      [/^extra[- ]optionen$/i, { fr: "Extra supplement", de: "Extra-Optionen" }],
    ],
    value: [
      [/^profilklasse\s+/i, { fr: "Profil classe ", de: "Profilklasse " }],
      [/^uw\s+ab\s+/i, { fr: "Uw de ", de: "Uw ab " }],
      [/^uw\s+/i, { fr: "Uw ", de: "Uw " }],
      [/^dreifachverglasung$/i, { fr: "Vitrages triples", de: "Dreifachverglasung" }],
      [/^zweifachverglasung$/i, { fr: "Vitrages double", de: "Zweifachverglasung" }],
      [/^profiltiefe\s*[-:]?\s*/i, { fr: "La profondeur de profiles - ", de: "Profiltiefe - " }],
    ],
  },
  pl: {
    label: [
      [/^klasa\s+profilu$/i, { fr: "Classe de profil", de: "Profilklasse" }],
      [/^(wsp[oó]lczynnik\s+uw|wsp[oó][lł]czynnik\s+uw)$/i, { fr: "Valeur Uw", de: "Uw-Wert" }],
      [/^ilo[sś][cć]\s+szyb\s+w\s+standardzie$/i, { fr: "Nombres de verre en standard", de: "Standardverglasung" }],
      [/^g[lł][eę]boko[sś][cć]\s+profilu$/i, { fr: "La profondeur de profiles", de: "Profiltiefe" }],
      [/^okucie$/i, { fr: "Ferrure", de: "Beschlag" }],
      [/^ekstra\s+dodatki$/i, { fr: "Extra supplement", de: "Extra-Optionen" }],
    ],
    value: [
      [/^profil\s+klasy\s+/i, { fr: "Profil classe ", de: "Profilklasse " }],
      [/^uw\s+od\s+/i, { fr: "Uw de ", de: "Uw ab " }],
      [/^uw\s+/i, { fr: "Uw ", de: "Uw " }],
      [/^dwuszybowy\s+pakiet$/i, { fr: "Vitrages double", de: "Zweifachverglasung" }],
      [/^trzyszybowy\s+pakiet$/i, { fr: "Vitrages triples", de: "Dreifachverglasung" }],
      [/^g[lł][eę]boko[sś][cć]\s+profilu\s*[-:]?\s*/i, { fr: "La profondeur de profiles - ", de: "Profiltiefe - " }],
    ],
  },
};

function localizeLine(kind, sourceLocale, value, targetLocale) {
  const cleaned = stripInlineMarkdown(value);
  const rules = dictionary[sourceLocale]?.[kind] ?? [];

  for (const [re, replacement] of rules) {
    if (re.test(cleaned)) {
      const mapped = replacement[targetLocale];
      if (typeof mapped === "string") {
        // Preserve suffixes for prefix-type replacements.
        if (mapped.endsWith(" ")) {
          return stripPolishChars(cleaned.replace(re, mapped));
        }
        return stripPolishChars(mapped);
      }
    }
  }

  return stripPolishChars(cleaned);
}

function normalizeUnits(value) {
  return String(value || "")
    .replace(/\bw\/m\s*2\s*k\b/gi, "W/m²K")
    .replace(/\bw\/m²\s*k\b/gi, "W/m²K")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function toSpecObjects(pairs, sourceLocale) {
  const specs = [];

  for (const pair of pairs) {
    const frLabel = localizeLine("label", sourceLocale, pair.label, "fr");
    const deLabel = localizeLine("label", sourceLocale, pair.label, "de");
    const frValue = normalizeUnits(localizeLine("value", sourceLocale, pair.value, "fr"));
    const deValue = normalizeUnits(localizeLine("value", sourceLocale, pair.value, "de"));

    specs.push({
      label: { fr: frLabel, de: deLabel },
      value: { fr: frValue, de: deValue },
    });
  }

  return specs;
}

function fallbackSpecs(product) {
  const isWindow = String(product.category || "").startsWith("windows");

  const material =
    product.family === "pvc"
      ? { fr: "PVC", de: "PVC" }
      : product.family === "wood"
        ? { fr: "Bois", de: "Holz" }
        : product.family === "aluminum"
          ? { fr: "Aluminium", de: "Aluminium" }
          : { fr: "Sur demande", de: "Auf Anfrage" };

  if (isWindow) {
    return [
      {
        label: { fr: "Type", de: "Typ" },
        value: { fr: "Fenetre", de: "Fenster" },
      },
      {
        label: { fr: "Materiau", de: "Material" },
        value: material,
      },
      {
        label: { fr: "Configuration", de: "Konfiguration" },
        value: { fr: "Sur mesure", de: "Massanfertigung" },
      },
    ];
  }

  if (product.category === "doors") {
    return [
      {
        label: { fr: "Type", de: "Typ" },
        value: { fr: "Porte d'entree", de: "Eingangstuer" },
      },
      {
        label: { fr: "Materiau", de: "Material" },
        value: material,
      },
      {
        label: { fr: "Fabrication", de: "Fertigung" },
        value: { fr: "Sur mesure", de: "Massanfertigung" },
      },
    ];
  }

  if (product.category === "shutters") {
    return [
      {
        label: { fr: "Type", de: "Typ" },
        value: { fr: "Volet roulant", de: "Rollladen" },
      },
      {
        label: { fr: "Finition", de: "Oberflaeche" },
        value: { fr: "Sur demande", de: "Auf Anfrage" },
      },
      {
        label: { fr: "Installation", de: "Montage" },
        value: { fr: "Sur mesure", de: "Massanfertigung" },
      },
    ];
  }

  return [
    {
      label: { fr: "Configuration", de: "Konfiguration" },
      value: { fr: "Sur mesure", de: "Massanfertigung" },
    },
    {
      label: { fr: "Devis", de: "Angebot" },
      value: { fr: "Sur demande", de: "Auf Anfrage" },
    },
    {
      label: { fr: "Service", de: "Service" },
      value: { fr: "Suisse", de: "Schweiz" },
    },
  ];
}

function fallbackFeaturesFromSummary(summary) {
  const text = stripInlineMarkdown(summary);
  const parts = text
    .split(/[.!?]+/g)
    .map((item) => item.trim())
    .filter((item) => item.length >= 18);

  const features = [];
  for (const part of parts) {
    if (features.length >= 4) {
      break;
    }
    const cleaned = part.replace(/\s{2,}/g, " ");
    if (cleaned) {
      features.push(cleaned);
    }
  }

  if (features.length > 0) {
    return features.slice(0, 6);
  }

  return ["Sur mesure", "Conseil en Suisse", "Demander un devis"];
}

function writeReport(report) {
  const lines = [];
  lines.push("# Witraz Enrichment Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Products processed: ${report.processed}`);
  lines.push(`- Specs enriched: ${report.specsUpdated}`);
  lines.push(`- Specs from supplier: ${report.specsFromSupplier}`);
  lines.push(`- Specs fallback: ${report.specsFallback}`);
  lines.push(`- Features enriched: ${report.featuresUpdated}`);
  lines.push("");
  lines.push("## Specs Fallback Slugs");
  lines.push("");
  if (report.specsFallbackSlugs.length === 0) {
    lines.push("- none");
  } else {
    for (const slug of report.specsFallbackSlugs.slice(0, 200)) {
      lines.push(`- ${slug}`);
    }
  }
  lines.push("");
  fs.writeFileSync(reportFile, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  const content = JSON.parse(fs.readFileSync(contentFile, "utf8"));
  const jinaCache = new Map();

  const report = {
    processed: 0,
    specsUpdated: 0,
    specsFromSupplier: 0,
    specsFallback: 0,
    specsFallbackSlugs: [],
    featuresUpdated: 0,
  };

  for (const product of content.products || []) {
    report.processed += 1;

    const needsSpecs = !Array.isArray(product.specs) || product.specs.length === 0;
    const needsFeatures =
      !Array.isArray(product.features?.fr) ||
      product.features.fr.length === 0 ||
      !Array.isArray(product.features?.de) ||
      product.features.de.length === 0;

    if (!needsSpecs && !needsFeatures) {
      continue;
    }

    const sourceLocale = detectSourceLocale(product.sourcePath || "");
    const shouldFetchSpecs = needsSpecs && product.category !== "doors";
    const markdown = shouldFetchSpecs
      ? await fetchJinaMarkdown(product.sourcePath, jinaCache)
      : null;

    if (needsSpecs) {
      const specLines = markdown ? extractSpecLines(markdown, sourceLocale) : [];
      const pairs = specPairsFromLines(specLines);
      if (pairs.length > 0) {
        product.specs = toSpecObjects(pairs, sourceLocale);
        report.specsUpdated += 1;
        report.specsFromSupplier += 1;
      } else {
        product.specs = fallbackSpecs(product);
        report.specsUpdated += 1;
        report.specsFallback += 1;
        report.specsFallbackSlugs.push(product.slug);
      }
    }

    if (needsFeatures) {
      // We avoid aggressive parsing here. If supplier content doesn't provide a clear list,
      // we convert the existing localized summary into short bullet-like features.
      const currentFr = Array.isArray(product.features?.fr) ? product.features.fr : [];
      const currentDe = Array.isArray(product.features?.de) ? product.features.de : [];
      const frFeatures =
        currentFr.length > 0 ? currentFr : fallbackFeaturesFromSummary(product.summary?.fr || "");
      const deFeatures =
        currentDe.length > 0 ? currentDe : fallbackFeaturesFromSummary(product.summary?.de || "");

      product.features = {
        fr: frFeatures.map(stripPolishChars),
        de: deFeatures.map(stripPolishChars),
      };
      report.featuresUpdated += 1;
    }

    // Be polite to proxy providers.
    if (shouldFetchSpecs) {
      await sleep(60);
    }

    const progress = report.specsUpdated + report.featuresUpdated;
    if (progress > 0 && progress % 25 === 0) {
      console.warn(
        `Enrichment progress: ${progress} updates (specs ${report.specsUpdated}, features ${report.featuresUpdated})`,
      );
      content.updatedAt = new Date().toISOString();
      fs.writeFileSync(contentFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");
    }
  }

  content.updatedAt = new Date().toISOString();
  fs.writeFileSync(contentFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");

  writeReport(report);

  console.warn(`Products processed: ${report.processed}`);
  console.warn(`Specs enriched: ${report.specsUpdated}`);
  console.warn(`Specs from supplier: ${report.specsFromSupplier}`);
  console.warn(`Specs fallback: ${report.specsFallback}`);
  console.warn(`Features enriched: ${report.featuresUpdated}`);
  console.warn(`Report: ${path.relative(projectRoot, reportFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
