import { ContactConfig, LegalPage, Locale } from "@/types/content";

export const locales: Locale[] = ["fr", "de"];

export const defaultLocale: Locale = "fr";

export const localizedNavigation = {
  fr: {
    home: "Accueil",
    pvc: "Fenetres PVC",
    wood: "Fenetres Bois",
    aluminum: "Fenetres Aluminium",
    shutters: "Volets Roulants",
    doors: "Portes",
    contact: "Contact",
    catalog: "Catalogue",
    quote: "Demander un devis",
  },
  de: {
    home: "Startseite",
    pvc: "Kunststofffenster",
    wood: "Holzfenster",
    aluminum: "Aluminiumfenster",
    shutters: "Rolllaeden",
    doors: "Tueren",
    contact: "Kontakt",
    catalog: "Katalog",
    quote: "Angebot anfragen",
  },
} as const;

export const localizedLandingBlocks = {
  fr: {
    trustTitle: "Pourquoi MPDESIGN",
    trustSubtitle:
      "Un partenaire unique pour le conseil, la selection des profils, l'installation et le suivi en Suisse.",
    trustItems: [
      {
        title: "Architecture premium",
        description:
          "Des solutions fenetres et portes alignees avec les standards esthetiques et energetiques suisses.",
      },
      {
        title: "Pilotage de projet",
        description:
          "Un interlocuteur unique de la prise de mesures jusqu'a la reception finale du chantier.",
      },
      {
        title: "Installation certifiee",
        description:
          "Equipes qualifiees, planning clair, mise en oeuvre propre et support apres livraison.",
      },
    ],
    processTitle: "Comment nous travaillons",
    processSteps: [
      {
        title: "1. Audit sur site",
        description: "Analyse technique, priorites du projet et plan budgetaire initial.",
      },
      {
        title: "2. Offre personnalisee",
        description:
          "Selection des references, details techniques et proposition commerciale claire.",
      },
      {
        title: "3. Pose & suivi",
        description:
          "Installation planifiee, controle qualite final et accompagnement apres intervention.",
      },
    ],
    leadTitle: "Parlons de votre projet",
    leadDescription:
      "Recevez une proposition adaptee a votre maison avec delais, options techniques et budget.",
  },
  de: {
    trustTitle: "Warum MPDESIGN",
    trustSubtitle:
      "Ein Partner fuer Beratung, Profilauswahl, Montage und laufende Betreuung in der Schweiz.",
    trustItems: [
      {
        title: "Premium-Architektur",
        description:
          "Fenster- und Tuerloesungen passend zu Schweizer Design- und Energiestandards.",
      },
      {
        title: "Projektsteuerung",
        description: "Ein Ansprechpartner vom Aufmass bis zur finalen Abnahme vor Ort.",
      },
      {
        title: "Zertifizierte Montage",
        description:
          "Qualifizierte Teams, klare Termine, saubere Umsetzung und Betreuung nach Abschluss.",
      },
    ],
    processTitle: "So arbeiten wir",
    processSteps: [
      {
        title: "1. Vor-Ort Analyse",
        description: "Technische Pruefung, Projektziele und erster Budgetrahmen.",
      },
      {
        title: "2. Individuelles Angebot",
        description:
          "Produktempfehlung, technische Details und transparente Angebotsstruktur.",
      },
      {
        title: "3. Montage & Betreuung",
        description:
          "Geplante Montage, finaler Qualitaetscheck und Begleitung nach Fertigstellung.",
      },
    ],
    leadTitle: "Starten wir Ihr Projekt",
    leadDescription:
      "Erhalten Sie ein Angebot mit Zeitplan, technischen Optionen und passender Budgetloesung.",
  },
} as const;

export const localizedCategoryInfo = {
  fr: {
    headingPrefix: "Collection",
    cardAction: "Voir la fiche",
    specsTitle: "Caracteristiques techniques",
    featuresTitle: "Atouts produit",
  },
  de: {
    headingPrefix: "Kollektion",
    cardAction: "Zur Produktseite",
    specsTitle: "Technische Daten",
    featuresTitle: "Produktvorteile",
  },
} as const;

export const localizedProductExperience = {
  fr: {
    galleryTitle: "Galerie produit",
    galleryCounterLabel: "Vue",
    prevImage: "Image precedente",
    nextImage: "Image suivante",
    paletteTitle: "Palette & finitions",
    paletteHint: "Touchez une teinte pour voir le rendu.",
    paletteEmpty: "Nuancier disponible sur demande.",
    selectedColorLabel: "Teinte selectionnee",
    selectedColorCta: "Demander cette finition",
    docsTitle: "Documents techniques",
    docsEmpty: "Documents a venir.",
  },
  de: {
    galleryTitle: "Produktgalerie",
    galleryCounterLabel: "Ansicht",
    prevImage: "Vorheriges Bild",
    nextImage: "Naechstes Bild",
    paletteTitle: "Farben & Oberflaechen",
    paletteHint: "Farbe auswaehlen und Vorschau ansehen.",
    paletteEmpty: "Farbfaecher auf Anfrage verfuegbar.",
    selectedColorLabel: "Ausgewaehlte Farbe",
    selectedColorCta: "Diese Ausfuehrung anfragen",
    docsTitle: "Technische Dokumente",
    docsEmpty: "Dokumente folgen.",
  },
} as const;

export const contactConfig: ContactConfig = {
  phoneDisplay: "+41 76 304 81 12",
  phoneHref: "tel:+41763048112",
  email: "lior.solomonchuk@gmail.com",
  whatsappHref: "https://wa.me/41763048112",
  whatsappDisplay: "+41 76 304 81 12",
  serviceArea: {
    fr: "Intervention dans toute la Suisse",
    de: "Einsatz in der gesamten Schweiz",
  },
};

export const localizedLeadForm = {
  fr: {
    formTitle: "Obtenir une estimation",
    fields: {
      name: "Nom complet",
      phone: "Telephone",
      email: "Email",
      message: "Votre projet",
      consent: "J'accepte d'etre contacte par MPDESIGN concernant ma demande.",
      submit: "Envoyer la demande",
      sending: "Envoi en cours...",
    },
    placeholders: {
      name: "Jean Dupont",
      phone: "+41 ...",
      email: "jean@example.com",
      message: "Type de projet, ville, delai souhaite et toute information utile.",
    },
    result: {
      success:
        "Merci, votre demande a bien ete envoyee. Nous revenons vers vous rapidement.",
      error:
        "Impossible d'envoyer la demande pour le moment. Utilisez WhatsApp ou telephone en attendant.",
      consentRequired: "Merci de confirmer votre consentement.",
      requiredFields: "Merci de renseigner votre nom, email et message.",
    },
  },
  de: {
    formTitle: "Angebot anfordern",
    fields: {
      name: "Vollstaendiger Name",
      phone: "Telefon",
      email: "E-Mail",
      message: "Ihr Projekt",
      consent: "Ich stimme zu, von MPDESIGN zu meiner Anfrage kontaktiert zu werden.",
      submit: "Anfrage senden",
      sending: "Wird gesendet...",
    },
    placeholders: {
      name: "Max Mustermann",
      phone: "+41 ...",
      email: "max@example.com",
      message: "Projektart, Ort, gewuenschter Termin und weitere wichtige Informationen.",
    },
    result: {
      success: "Danke, Ihre Anfrage wurde erfolgreich gesendet. Wir melden uns zeitnah.",
      error:
        "Die Anfrage konnte aktuell nicht gesendet werden. Bitte nutzen Sie WhatsApp oder Telefon.",
      consentRequired: "Bitte bestaetigen Sie Ihre Einwilligung.",
      requiredFields: "Bitte Name, E-Mail und Nachricht ausfuellen.",
    },
  },
} as const;

export const localizedFooter = {
  fr: {
    legal: "Mentions legales",
    privacy: "Protection des donnees",
    cookies: "Cookies",
    rights: "Tous droits reserves.",
    partner: "Partenaire officiel Witraz en Suisse.",
  },
  de: {
    legal: "Impressum",
    privacy: "Datenschutz",
    cookies: "Cookies",
    rights: "Alle Rechte vorbehalten.",
    partner: "Offizieller Witraz-Partner in der Schweiz.",
  },
} as const;

export const legalPages: Record<Locale, LegalPage[]> = {
  fr: [
    {
      slug: "impressum",
      title: "Mentions legales",
      intro:
        "Informations legales relatives a l'editeur du site et au contact.",
      sections: [
        {
          heading: "Editeur du site",
          body: "MP Design Sarl, Chemin de la Sauge 6, 2537 Vauffelin, Suisse. CHE-137.134.279.",
        },
        {
          heading: "Contact",
          body: "Email: lior.solomonchuk@gmail.com. Telephone: +41 76 304 81 12.",
        },
      ],
    },
    {
      slug: "datenschutz",
      title: "Protection des donnees",
      intro:
        "Cette page explique quelles donnees nous collectons et comment nous les utilisons pour repondre a vos demandes.",
      sections: [
        {
          heading: "Responsable du traitement",
          body: "MP Design Sarl, Chemin de la Sauge 6, 2537 Vauffelin, Suisse. Contact: lior.solomonchuk@gmail.com.",
        },
        {
          heading: "Donnees collectees",
          body: "Nom, telephone (optionnel), email, message, ainsi que des informations techniques minimales (page source, langue).",
        },
        {
          heading: "Finalite",
          body: "Reponse commerciale, qualification de besoin, suivi projet et obligations legales.",
        },
        {
          heading: "Prestataires",
          body: "Les demandes envoyees via le formulaire sont enregistrees dans Google Sheets (Google Apps Script). Des notifications peuvent etre envoyees via Telegram.",
        },
        {
          heading: "Conservation et droits",
          body: "Nous conservons les donnees le temps necessaire au traitement de votre demande et a nos obligations. Vous pouvez demander l'acces, la rectification ou la suppression via lior.solomonchuk@gmail.com.",
        },
      ],
    },
    {
      slug: "cookies",
      title: "Cookies",
      intro:
        "Informations sur l'utilisation de cookies et de mesure d'audience.",
      sections: [
        {
          heading: "Cookies strictement necessaires",
          body: "Fonctionnement technique du site, securite et preference de langue.",
        },
        {
          heading: "Mesure d'audience",
          body: "Cloudflare Web Analytics pour des statistiques d'audience (sans profilage publicitaire).",
        },
        {
          heading: "Gestion",
          body: "Instructions de configuration navigateur et contact pour toute question.",
        },
      ],
    },
  ],
  de: [
    {
      slug: "impressum",
      title: "Impressum",
      intro:
        "Rechtliche Informationen zum Anbieter und Kontakt.",
      sections: [
        {
          heading: "Anbieter",
          body: "MP Design Sarl, Chemin de la Sauge 6, 2537 Vauffelin, Schweiz. CHE-137.134.279.",
        },
        {
          heading: "Kontakt",
          body: "E-Mail: lior.solomonchuk@gmail.com. Telefon: +41 76 304 81 12.",
        },
      ],
    },
    {
      slug: "datenschutz",
      title: "Datenschutz",
      intro:
        "Diese Seite beschreibt, welche personenbezogenen Daten wir verarbeiten und zu welchen Zwecken.",
      sections: [
        {
          heading: "Verantwortlicher",
          body: "MP Design Sarl, Chemin de la Sauge 6, 2537 Vauffelin, Schweiz. Kontakt: lior.solomonchuk@gmail.com.",
        },
        {
          heading: "Erhobene Daten",
          body: "Name, Telefon (optional), E-Mail, Nachricht sowie minimale technische Metadaten (Quelle, Sprache).",
        },
        {
          heading: "Zwecke",
          body: "Bearbeitung von Anfragen, Projektberatung, Angebotsprozess und gesetzliche Pflichten.",
        },
        {
          heading: "Dienstleister",
          body: "Formularanfragen werden in Google Sheets gespeichert (Google Apps Script). Benachrichtigungen koennen via Telegram gesendet werden.",
        },
        {
          heading: "Speicherung und Rechte",
          body: "Wir speichern Daten nur so lange wie notwendig. Sie koennen Auskunft, Berichtigung oder Loeschung per E-Mail anfordern: lior.solomonchuk@gmail.com.",
        },
      ],
    },
    {
      slug: "cookies",
      title: "Cookies",
      intro:
        "Hinweise zur Verwendung von Cookies und Reichweitenmessung.",
      sections: [
        {
          heading: "Technisch notwendige Cookies",
          body: "Erforderlich fuer Seitensicherheit, Funktion und Sprachpraeferenz.",
        },
        {
          heading: "Reichweitenmessung",
          body: "Cloudflare Web Analytics fuer aggregierte Kennzahlen ohne Werbeprofiling.",
        },
        {
          heading: "Steuerung",
          body: "Hinweise zur Browser-Konfiguration und Kontakt fuer Datenschutzfragen.",
        },
      ],
    },
  ],
};

export const seoDefaults = {
  fr: {
    title: "MPDESIGN - Fenetres et portes premium en Suisse",
    description:
      "Catalogue complet de fenetres PVC, bois, aluminium et portes. Conseil, installation et suivi projet partout en Suisse.",
  },
  de: {
    title: "MPDESIGN - Premium Fenster und Tueren in der Schweiz",
    description:
      "Vollstaendiger Katalog fuer PVC-, Holz-, Aluminiumfenster und Tueren. Beratung, Montage und Betreuung in der ganzen Schweiz.",
  },
};
