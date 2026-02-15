type CtaChannel = "whatsapp" | "call" | "form";
type CtaPlacement =
  | "mobile_sticky"
  | "lead_form"
  | "product_palette"
  | "header_quote"
  | "header_contact"
  | "product_hero";

type CtaPayload = {
  channel: CtaChannel;
  placement: CtaPlacement;
  locale: "fr" | "de";
  sourcePage?: string | undefined;
  productSlug?: string | undefined;
  status?: "attempt" | "success" | "error" | undefined;
  reason?: string | undefined;
};

type WindowWithAnalytics = Window & {
  cloudflare?: {
    insights?: {
      track?: (event: string, payload: Record<string, unknown>) => void;
    };
  };
  sa_event?: (event: string, payload?: Record<string, unknown>) => void;
  dataLayer?: Record<string, unknown>[];
};

export function trackCtaEvent(payload: CtaPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const eventPayload = {
    ...payload,
    event: "cta_click",
    timestamp: new Date().toISOString(),
  };

  const targetWindow = window as WindowWithAnalytics;

  try {
    if (typeof targetWindow.cloudflare?.insights?.track === "function") {
      targetWindow.cloudflare.insights.track("cta_click", eventPayload);
      return;
    }
  } catch {
    // fall through to secondary providers
  }

  try {
    if (typeof targetWindow.sa_event === "function") {
      targetWindow.sa_event("cta_click", eventPayload);
      return;
    }
  } catch {
    // fall through to dataLayer fallback
  }

  if (!Array.isArray(targetWindow.dataLayer)) {
    targetWindow.dataLayer = [];
  }
  targetWindow.dataLayer.push(eventPayload);
}
