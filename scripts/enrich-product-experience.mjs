import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const contentFile = path.resolve(projectRoot, "src/data/content.local.json");

const paletteByFamily = {
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
      preview: "linear-gradient(135deg, #9b6c3f 0%, #bd8a52 45%, #8a5f38 100%)",
      note: {
        fr: "Decor bois chaleureux pour facades classiques.",
        de: "Warme Holzoptik fuer klassische Fassaden.",
      },
    },
    {
      key: "pvc-ral",
      name: { fr: "RAL Personnalise", de: "RAL Individuell" },
      preview: "linear-gradient(120deg, #67707f 0%, #a3adb8 45%, #404954 100%)",
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
      preview: "linear-gradient(135deg, #8c643d 0%, #b48353 45%, #7a5533 100%)",
      note: {
        fr: "Bois naturel satine avec veinage visible.",
        de: "Natuerliches Holz mit sichtbarer Maserung.",
      },
    },
    {
      key: "wood-meranti",
      name: { fr: "Meranti", de: "Meranti" },
      preview: "linear-gradient(135deg, #7e3f30 0%, #9e5544 48%, #6d3226 100%)",
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
      preview: "linear-gradient(120deg, #66717b 0%, #95a1ad 45%, #3e4a54 100%)",
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
      key: "alu-ral",
      name: { fr: "Palette RAL Complete", de: "Komplette RAL-Palette" },
      preview: "linear-gradient(120deg, #3f4b5a 0%, #9aa5b1 35%, #2b3340 70%, #c8b083 100%)",
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
      key: "shutter-custom",
      name: { fr: "Couleur Sur Demande", de: "Sonderfarbe" },
      preview: "linear-gradient(120deg, #5f6877 0%, #a2adb9 45%, #424b58 100%)",
      note: {
        fr: "Nuancier fournisseur complet disponible.",
        de: "Vollstaendiger Lieferantenfarbfaecher verfuegbar.",
      },
    },
  ],
  general: [
    {
      key: "general-custom",
      name: { fr: "Palette Projet", de: "Projektpalette" },
      preview: "linear-gradient(120deg, #5f6877 0%, #a2adb9 45%, #424b58 100%)",
      note: {
        fr: "Palette adaptee selon votre projet.",
        de: "Palette passend zu Ihrem Projekt.",
      },
    },
  ],
};

function paletteForFamily(family) {
  return paletteByFamily[family] || paletteByFamily.general;
}

function main() {
  const content = JSON.parse(fs.readFileSync(contentFile, "utf8"));

  let updatedProducts = 0;

  for (const product of content.products || []) {
    if (Array.isArray(product.colorPalette) && product.colorPalette.length > 0) {
      continue;
    }

    product.colorPalette = paletteForFamily(product.family);
    updatedProducts += 1;
  }

  content.updatedAt = new Date().toISOString();
  fs.writeFileSync(contentFile, `${JSON.stringify(content, null, 2)}\n`, "utf8");

  console.warn(`Products enriched with palette: ${updatedProducts}`);
}

main();
