import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const contentFile = path.resolve(projectRoot, "src/data/content.local.json");
const reportFile = path.resolve(projectRoot, "docs/content-integrity-latest.md");

const args = new Set(process.argv.slice(2));
const strictPlaceholders = args.has("--strict-placeholders");
const strictPalette = args.has("--strict-palette");

const placeholderRe =
  /\b(a\s*confirmer|a\s*confirmer\.?|zu\s*bestaetigen|zu\s*bestätigen|to\s*confirm|tbd|n\/a|not\s*available)\b/i;
const unexpectedLocaleNoiseRe = /[ąćęłńśźż]/i;

function hasLocaleValue(value, locale) {
  return Boolean(value?.[locale] && String(value[locale]).trim().length > 0);
}

function isPlaceholder(value) {
  return placeholderRe.test(String(value || "").trim());
}

function hasUnexpectedLocaleNoise(value) {
  return unexpectedLocaleNoiseRe.test(String(value || ""));
}

function isLikelyValidColorPreview(value) {
  const text = String(value || "").trim();
  if (!text) {
    return false;
  }

  if (text.startsWith("#")) {
    return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(text);
  }

  return text.includes("gradient(") || text.startsWith("rgb(") || text.startsWith("hsl(");
}

function expectedPaletteMin(category) {
  if (category === "windows-pvc" || category === "windows-wood" || category === "windows-aluminum") {
    return 4;
  }
  if (category === "doors") {
    return 4;
  }
  if (category === "shutters") {
    return 3;
  }
  return 1;
}

function createIssueBuckets() {
  return {
    errors: [],
    warnings: [],
  };
}

function addWarningOrError(buckets, code, message) {
  const strict =
    (code === "placeholder" && strictPlaceholders) ||
    (code === "palette-coverage" && strictPalette);

  if (strict) {
    buckets.errors.push(`${message} (strict:${code})`);
    return;
  }

  buckets.warnings.push(message);
}

function writeReport({ totals, errors, warnings, strictModes }) {
  const lines = [];
  lines.push("# Content Integrity Report");
  lines.push("");
  lines.push(`Strict placeholders: ${strictModes.placeholders ? "on" : "off"}`);
  lines.push(`Strict palette coverage: ${strictModes.palette ? "on" : "off"}`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Products: ${totals.products}`);
  lines.push(`- Errors: ${errors.length}`);
  lines.push(`- Warnings: ${warnings.length}`);
  lines.push("");

  lines.push("## Errors");
  lines.push("");
  if (errors.length === 0) {
    lines.push("- none");
  } else {
    for (const issue of errors.slice(0, 400)) {
      lines.push(`- ${issue}`);
    }
    if (errors.length > 400) {
      lines.push(`- ...and ${errors.length - 400} more`);
    }
  }

  lines.push("");
  lines.push("## Warnings");
  lines.push("");
  if (warnings.length === 0) {
    lines.push("- none");
  } else {
    for (const issue of warnings.slice(0, 400)) {
      lines.push(`- ${issue}`);
    }
    if (warnings.length > 400) {
      lines.push(`- ...and ${warnings.length - 400} more`);
    }
  }
  lines.push("");

  fs.writeFileSync(reportFile, `${lines.join("\n")}\n`, "utf8");
}

function main() {
  const content = JSON.parse(fs.readFileSync(contentFile, "utf8"));
  const categorySet = new Set((content.categories || []).map((item) => item.slug));
  const buckets = createIssueBuckets();

  let productCount = 0;

  for (const product of content.products || []) {
    productCount += 1;
    const id = `product:${product.slug}`;

    if (!categorySet.has(product.category)) {
      buckets.errors.push(`${id} references missing category '${product.category}'`);
    }

    for (const field of ["title", "subtitle", "summary", "ctaLabel"]) {
      if (!hasLocaleValue(product[field], "fr") || !hasLocaleValue(product[field], "de")) {
        buckets.errors.push(`${id} missing fr/de for ${field}`);
      }

      if (hasUnexpectedLocaleNoise(product[field]?.fr)) {
        buckets.warnings.push(`${id} ${field}.fr contains non FR/DE locale noise`);
      }
      if (hasUnexpectedLocaleNoise(product[field]?.de)) {
        buckets.warnings.push(`${id} ${field}.de contains non FR/DE locale noise`);
      }
    }

    if (isPlaceholder(product.summary?.fr) || isPlaceholder(product.summary?.de)) {
      addWarningOrError(
        buckets,
        "placeholder",
        `${id} summary includes placeholder-like value`,
      );
    }

    if (!Array.isArray(product.features?.fr) || product.features.fr.length === 0) {
      buckets.errors.push(`${id} has empty fr features`);
    }
    if (!Array.isArray(product.features?.de) || product.features.de.length === 0) {
      buckets.errors.push(`${id} has empty de features`);
    }

    for (const [index, feature] of (product.features?.fr || []).entries()) {
      if (isPlaceholder(feature)) {
        addWarningOrError(
          buckets,
          "placeholder",
          `${id} features.fr[${index}] contains placeholder`,
        );
      }
      if (hasUnexpectedLocaleNoise(feature)) {
        buckets.warnings.push(`${id} features.fr[${index}] contains non FR/DE locale noise`);
      }
    }

    for (const [index, feature] of (product.features?.de || []).entries()) {
      if (isPlaceholder(feature)) {
        addWarningOrError(
          buckets,
          "placeholder",
          `${id} features.de[${index}] contains placeholder`,
        );
      }
      if (hasUnexpectedLocaleNoise(feature)) {
        buckets.warnings.push(`${id} features.de[${index}] contains non FR/DE locale noise`);
      }
    }

    if (!Array.isArray(product.specs) || product.specs.length === 0) {
      buckets.errors.push(`${id} has no specs`);
    } else {
      for (const [index, spec] of product.specs.entries()) {
        if (!hasLocaleValue(spec.label, "fr") || !hasLocaleValue(spec.label, "de")) {
          buckets.errors.push(`${id} spec[${index}] missing fr/de label`);
        }
        if (!hasLocaleValue(spec.value, "fr") || !hasLocaleValue(spec.value, "de")) {
          buckets.errors.push(`${id} spec[${index}] missing fr/de value`);
        }

        if (isPlaceholder(spec.value?.fr) || isPlaceholder(spec.value?.de)) {
          addWarningOrError(
            buckets,
            "placeholder",
            `${id} spec[${index}] value uses placeholder`,
          );
        }

        if (hasUnexpectedLocaleNoise(spec.value?.fr)) {
          buckets.warnings.push(`${id} spec[${index}].value.fr contains non FR/DE locale noise`);
        }
        if (hasUnexpectedLocaleNoise(spec.value?.de)) {
          buckets.warnings.push(`${id} spec[${index}].value.de contains non FR/DE locale noise`);
        }
      }
    }

    if (!Array.isArray(product.colorPalette) || product.colorPalette.length === 0) {
      buckets.errors.push(`${id} has empty colorPalette`);
    } else {
      const expectedMin = expectedPaletteMin(product.category);
      if (product.colorPalette.length < expectedMin) {
        addWarningOrError(
          buckets,
          "palette-coverage",
          `${id} has ${product.colorPalette.length} palette options, expected >= ${expectedMin}`,
        );
      }

      for (const [index, option] of product.colorPalette.entries()) {
        if (!hasLocaleValue(option.name, "fr") || !hasLocaleValue(option.name, "de")) {
          buckets.errors.push(`${id} colorPalette[${index}] missing fr/de name`);
        }

        if (option.note) {
          if (!hasLocaleValue(option.note, "fr") || !hasLocaleValue(option.note, "de")) {
            buckets.errors.push(`${id} colorPalette[${index}] missing fr/de note`);
          }
        }

        if (!isLikelyValidColorPreview(option.preview)) {
          buckets.errors.push(`${id} colorPalette[${index}] has invalid preview '${option.preview}'`);
        }
      }
    }

    const mediaEntries = [product.heroImage, ...(product.gallery || [])];
    for (const [index, media] of mediaEntries.entries()) {
      if (!media?.src) {
        buckets.errors.push(`${id} media[${index}] missing src`);
      }

      if (/^https?:\/\//i.test(media?.src || "")) {
        buckets.errors.push(`${id} media[${index}] is still remote (${media.src})`);
      }

      if (!hasLocaleValue(media?.alt, "fr") || !hasLocaleValue(media?.alt, "de")) {
        buckets.errors.push(`${id} media[${index}] missing fr/de alt`);
      }
    }

    for (const [index, doc] of (product.documents || []).entries()) {
      if (!hasLocaleValue(doc.label, "fr") || !hasLocaleValue(doc.label, "de")) {
        buckets.errors.push(`${id} documents[${index}] missing fr/de label`);
      }
    }
  }

  writeReport({
    totals: {
      products: productCount,
    },
    errors: buckets.errors,
    warnings: buckets.warnings,
    strictModes: {
      placeholders: strictPlaceholders,
      palette: strictPalette,
    },
  });

  if (buckets.errors.length > 0) {
    console.error(
      `Integrity audit failed with ${buckets.errors.length} error(s) and ${buckets.warnings.length} warning(s).`,
    );
    for (const issue of buckets.errors.slice(0, 200)) {
      console.error(`- ${issue}`);
    }
    if (buckets.errors.length > 200) {
      console.error(`- ...and ${buckets.errors.length - 200} more`);
    }
    console.error(`Report: ${path.relative(projectRoot, reportFile)}`);
    process.exitCode = 1;
    return;
  }

  if (buckets.warnings.length > 0) {
    console.warn(
      `Integrity audit passed with warnings (${buckets.warnings.length}).`,
    );
    for (const issue of buckets.warnings.slice(0, 80)) {
      console.warn(`- ${issue}`);
    }
    if (buckets.warnings.length > 80) {
      console.warn(`- ...and ${buckets.warnings.length - 80} more`);
    }
    console.warn(`Report: ${path.relative(projectRoot, reportFile)}`);
    return;
  }

  console.warn(`Integrity audit passed. Products: ${productCount}`);
  console.warn(`Report: ${path.relative(projectRoot, reportFile)}`);
}

main();
