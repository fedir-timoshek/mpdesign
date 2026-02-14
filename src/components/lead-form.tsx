"use client";

import { FormEvent, useMemo, useState } from "react";
import { trackCtaEvent } from "@/lib/analytics";
import { contactConfig, localizedLeadForm } from "@/lib/site-config";
import { Locale } from "@/types/content";

type Props = {
  locale: Locale;
  sourcePage: string;
  productSlug?: string;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
  honeypot: string;
};

type SubmitState = "idle" | "loading" | "success" | "error";

export function LeadForm({ locale, sourcePage, productSlug }: Props) {
  const copy = localizedLeadForm[locale];
  const [state, setState] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    message: "",
    consent: false,
    honeypot: "",
  });
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [feedback, setFeedback] = useState<string>("");

  const endpoint = useMemo(() => process.env.NEXT_PUBLIC_LEAD_ENDPOINT, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    trackCtaEvent({
      channel: "form",
      placement: "lead_form",
      locale,
      sourcePage,
      productSlug,
      status: "attempt",
    });

    if (!state.name.trim() || !state.email.trim() || !state.message.trim()) {
      setSubmitState("error");
      setFeedback(copy.result.requiredFields);
      trackCtaEvent({
        channel: "form",
        placement: "lead_form",
        locale,
        sourcePage,
        productSlug,
        status: "error",
        reason: "required_fields",
      });
      return;
    }

    if (!state.consent) {
      setSubmitState("error");
      setFeedback(copy.result.consentRequired);
      trackCtaEvent({
        channel: "form",
        placement: "lead_form",
        locale,
        sourcePage,
        productSlug,
        status: "error",
        reason: "consent_required",
      });
      return;
    }

    if (!endpoint) {
      setSubmitState("error");
      setFeedback(copy.result.error);
      trackCtaEvent({
        channel: "form",
        placement: "lead_form",
        locale,
        sourcePage,
        productSlug,
        status: "error",
        reason: "missing_endpoint",
      });
      return;
    }

    setSubmitState("loading");
    setFeedback("");

    const payload = {
      locale,
      sourcePage,
      productSlug,
      name: state.name.trim(),
      phone: state.phone.trim(),
      email: state.email.trim(),
      message: state.message.trim(),
      consent: state.consent,
      honeypot: state.honeypot,
    };

    try {
      // Google Apps Script Web App does not support CORS preflight (OPTIONS).
      // Sending JSON as text avoids preflight and still lets the backend parse JSON.
      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const body = (await response.json()) as { ok?: boolean };
      if (!body.ok) {
        throw new Error("lead_not_ok");
      }

      setSubmitState("success");
      setFeedback(copy.result.success);
      trackCtaEvent({
        channel: "form",
        placement: "lead_form",
        locale,
        sourcePage,
        productSlug,
        status: "success",
      });
      setState({
        name: "",
        phone: "",
        email: "",
        message: "",
        consent: false,
        honeypot: "",
      });
    } catch {
      setSubmitState("error");
      setFeedback(copy.result.error);
      trackCtaEvent({
        channel: "form",
        placement: "lead_form",
        locale,
        sourcePage,
        productSlug,
        status: "error",
        reason: "network_or_backend",
      });
    }
  }

  return (
    <form id="lead-form" className="lead-form" onSubmit={onSubmit} noValidate>
      <h3>{copy.formTitle}</h3>

      <div className="field-grid">
        <label>
          <span>{copy.fields.name} *</span>
          <input
            type="text"
            name="name"
            value={state.name}
            placeholder={copy.placeholders.name}
            autoComplete="name"
            onChange={(event) =>
              setState((prev) => ({ ...prev, name: event.currentTarget.value }))
            }
            required
          />
        </label>

        <label>
          <span>{copy.fields.phone}</span>
          <input
            type="tel"
            name="phone"
            value={state.phone}
            placeholder={copy.placeholders.phone}
            autoComplete="tel"
            onChange={(event) =>
              setState((prev) => ({ ...prev, phone: event.currentTarget.value }))
            }
          />
        </label>
      </div>

      <label>
        <span>{copy.fields.email} *</span>
        <input
          type="email"
          name="email"
          value={state.email}
          placeholder={copy.placeholders.email}
          autoComplete="email"
          onChange={(event) =>
            setState((prev) => ({ ...prev, email: event.currentTarget.value }))
          }
          required
        />
      </label>

      <label>
        <span>{copy.fields.message} *</span>
        <textarea
          name="message"
          value={state.message}
          placeholder={copy.placeholders.message}
          rows={5}
          onChange={(event) =>
            setState((prev) => ({ ...prev, message: event.currentTarget.value }))
          }
          required
        />
      </label>

      <label className="consent-checkbox">
        <input
          type="checkbox"
          checked={state.consent}
          onChange={(event) =>
            setState((prev) => ({ ...prev, consent: event.currentTarget.checked }))
          }
        />
        <span>{copy.fields.consent}</span>
      </label>

      <label className="honeypot-field" aria-hidden>
        <span>Do not fill</span>
        <input
          tabIndex={-1}
          autoComplete="off"
          value={state.honeypot}
          onChange={(event) =>
            setState((prev) => ({ ...prev, honeypot: event.currentTarget.value }))
          }
        />
      </label>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={submitState === "loading"}
      >
        {submitState === "loading" ? copy.fields.sending : copy.fields.submit}
      </button>

      {feedback ? (
        <p
          className={`form-feedback ${submitState === "success" ? "is-success" : "is-error"}`}
        >
          {feedback}
        </p>
      ) : null}

      <p className="form-fallback">
        WhatsApp:{" "}
        <a
          href={contactConfig.whatsappHref}
          onClick={() =>
            trackCtaEvent({
              channel: "whatsapp",
              placement: "lead_form",
              locale,
              sourcePage,
              productSlug,
            })
          }
        >
          {contactConfig.whatsappDisplay}
        </a>{" "}
        · Tel:{" "}
        <a
          href={contactConfig.phoneHref}
          onClick={() =>
            trackCtaEvent({
              channel: "call",
              placement: "lead_form",
              locale,
              sourcePage,
              productSlug,
            })
          }
        >
          {contactConfig.phoneDisplay}
        </a>
      </p>
    </form>
  );
}
