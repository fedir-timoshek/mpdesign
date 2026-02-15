import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const contentFile = path.resolve(projectRoot, "src/data/content.local.json");
const reportFile = path.resolve(projectRoot, "docs/witraz-image-localization-latest.md");
const outputDir = path.resolve(projectRoot, "public/assets/supplier");

const supplierHost = "https://www.witraz.eu";
const proxyHost = "https://wsrv.nl/";
const requestTimeoutMs = 15000;
const maxRequestRetries = 2;
const retryBackoffMs = 500;
const userAgent = "Mozilla/5.0 (Codex Image Localizer)";
const probeUrl = `${supplierHost}/fr/produits/fenetres-pvc`;

function sha1Short(value) {
  return crypto.createHash("sha1").update(value).digest("hex").slice(0, 10);
}

function isSupplierUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const parsed = new URL(value);
    return parsed.origin === supplierHost;
  } catch {
    return false;
  }
}

function sanitizeSegment(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function extensionFromContentType(contentType = "") {
  const normalized = contentType.toLowerCase();
  if (normalized.includes("image/jpeg")) {
    return ".jpg";
  }
  if (normalized.includes("image/png")) {
    return ".png";
  }
  if (normalized.includes("image/webp")) {
    return ".webp";
  }
  if (normalized.includes("image/avif")) {
    return ".avif";
  }
  if (normalized.includes("image/svg")) {
    return ".svg";
  }
  if (normalized.includes("image/gif")) {
    return ".gif";
  }
  return ".jpg";
}

function buildLocalFilename(url, contentType) {
  const parsed = new URL(url);
  const base = path.basename(parsed.pathname);
  const sourceExt = path.extname(base).toLowerCase();
  const stemRaw = sourceExt ? base.slice(0, -sourceExt.length) : base;
  const stem = sanitizeSegment(stemRaw || "image");
  const hash = sha1Short(url);

  let extension = sourceExt;
  if (!extension || extension.length > 6) {
    extension = extensionFromContentType(contentType);
  }

  return `${stem || "image"}-${hash}${extension}`;
}

function buildExistingFileIndex() {
  const index = new Map();

  if (!fs.existsSync(outputDir)) {
    return index;
  }

  for (const entry of fs.readdirSync(outputDir)) {
    const match = entry.match(/-([0-9a-f]{10})\.[a-z0-9]+$/i);
    if (!match) {
      continue;
    }

    index.set(match[1], entry);
  }

  return index;
}

async function fetchBinary(url) {
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

      const contentType = response.headers.get("content-type") || "";
      const arrayBuffer = await response.arrayBuffer();
      return {
        contentType,
        buffer: Buffer.from(arrayBuffer),
      };
    } catch {
      if (attempt === maxRequestRetries) {
        return null;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, retryBackoffMs * (attempt + 1)),
      );
    } finally {
      clearTimeout(timer);
    }
  }

  return null;
}

function buildProxyUrl(url) {
  const withoutProtocol = url.replace(/^https?:\/\//i, "");
  const params = new URLSearchParams({
    url: withoutProtocol,
  });
  return `${proxyHost}?${params.toString()}`;
}

async function canReachSupplier() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(probeUrl, {
      method: "GET",
      headers: {
        "user-agent": userAgent,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      return false;
    }
    return true;
  } catch (error) {
    console.warn(
      `Supplier direct probe failed (${probeUrl}): ${error instanceof Error ? error.message : "Unknown error"}`,
    );
    return false;
  } finally {
    clearTimeout(timer);
  }
}

function collectImageTargets(content) {
  const targetsByUrl = new Map();

  const addTarget = (mediaObject) => {
    if (!mediaObject || typeof mediaObject.src !== "string") {
      return;
    }

    if (!isSupplierUrl(mediaObject.src)) {
      return;
    }

    if (!targetsByUrl.has(mediaObject.src)) {
      targetsByUrl.set(mediaObject.src, []);
    }

    targetsByUrl.get(mediaObject.src).push(mediaObject);
  };

  for (const category of content.categories || []) {
    addTarget(category.heroImage);
  }

  for (const product of content.products || []) {
    addTarget(product.heroImage);
    for (const media of product.gallery || []) {
      addTarget(media);
    }
  }

  return targetsByUrl;
}

function writeReport({
  localizedCount,
  downloadedCount,
  skippedCount,
  failed,
  usedProxyCount,
  supplierReachable,
  cacheHitCount,
}) {
  const lines = [];
  lines.push("# Witraz Image Localization Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Supplier direct reachable: ${supplierReachable ? "yes" : "no"}`);
  lines.push(`Downloaded via proxy: ${usedProxyCount}`);
  lines.push(`Downloaded files: ${downloadedCount}`);
  lines.push(`Cache hits: ${cacheHitCount}`);
  lines.push(`Localized image references: ${localizedCount}`);
  lines.push(`Skipped (already local or cached): ${skippedCount}`);
  lines.push(`Failed downloads: ${failed.length}`);
  lines.push("");
  lines.push("## Failed URLs");
  lines.push("");

  if (failed.length === 0) {
    lines.push("- none");
  } else {
    for (const entry of failed) {
      lines.push(`- ${entry}`);
    }
  }

  lines.push("");
  fs.writeFileSync(reportFile, lines.join("\n"), "utf8");
}

async function main() {
  const supplierReachable = await canReachSupplier();
  fs.mkdirSync(outputDir, { recursive: true });
  const existingIndex = buildExistingFileIndex();

  const content = JSON.parse(fs.readFileSync(contentFile, "utf8"));
  const targetsByUrl = collectImageTargets(content);

  const urlToLocalPath = new Map();
  const failed = [];
  let downloadedCount = 0;
  let localizedCount = 0;
  let usedProxyCount = 0;
  let cacheHitCount = 0;

  for (const [remoteUrl, objects] of targetsByUrl.entries()) {
    if (!urlToLocalPath.has(remoteUrl)) {
      const hash = sha1Short(remoteUrl);
      const cachedFilename = existingIndex.get(hash);
      if (cachedFilename) {
        urlToLocalPath.set(remoteUrl, `/assets/supplier/${cachedFilename}`);
        cacheHitCount += 1;
      } else {
        let fetched = null;
        if (supplierReachable) {
          fetched = await fetchBinary(remoteUrl);
        }

        if (!fetched) {
          fetched = await fetchBinary(buildProxyUrl(remoteUrl));
          if (fetched) {
            usedProxyCount += 1;
          }
        }

        if (!fetched) {
          failed.push(remoteUrl);
          continue;
        }

        const filename = buildLocalFilename(remoteUrl, fetched.contentType);
        existingIndex.set(hash, filename);
        const targetPath = path.resolve(outputDir, filename);
        const publicPath = `/assets/supplier/${filename}`;

        if (!fs.existsSync(targetPath)) {
          fs.writeFileSync(targetPath, fetched.buffer);
          downloadedCount += 1;
        }

        urlToLocalPath.set(remoteUrl, publicPath);
      }
    }

    const localPath = urlToLocalPath.get(remoteUrl);
    if (!localPath) {
      continue;
    }

    for (const media of objects) {
      media.src = localPath;
      localizedCount += 1;
    }
  }

  const skippedCount = targetsByUrl.size - downloadedCount - failed.length;

  content.updatedAt = new Date().toISOString();
  fs.writeFileSync(contentFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");

  writeReport({
    localizedCount,
    downloadedCount,
    skippedCount,
    failed,
    usedProxyCount,
    supplierReachable,
    cacheHitCount,
  });

  console.warn(`Supplier image URLs found: ${targetsByUrl.size}`);
  console.warn(`Supplier direct reachable: ${supplierReachable ? "yes" : "no"}`);
  console.warn(`Downloaded via proxy: ${usedProxyCount}`);
  console.warn(`Downloaded images: ${downloadedCount}`);
  console.warn(`Cache hits: ${cacheHitCount}`);
  console.warn(`Localized image references: ${localizedCount}`);
  console.warn(`Failed downloads: ${failed.length}`);
  console.warn(`Report: ${path.relative(projectRoot, reportFile)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
