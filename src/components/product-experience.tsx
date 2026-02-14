"use client";

import { CSSProperties, KeyboardEvent, TouchEvent, useMemo, useRef, useState } from "react";
import { trackCtaEvent } from "@/lib/analytics";
import {
  Locale,
  ProductColorOption,
  ProductDocument,
  ProductMedia,
} from "@/types/content";
import { localizedProductExperience } from "@/lib/site-config";

type Props = {
  locale: Locale;
  gallery: ProductMedia[];
  colorPalette?: ProductColorOption[] | undefined;
  documents?: ProductDocument[] | undefined;
};

export function ProductExperience({ locale, gallery, colorPalette, documents }: Props) {
  const labels = localizedProductExperience[locale];
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const safeGallery = gallery.length > 0 ? gallery : [];
  const activeImage = safeGallery[activeImageIndex] ?? safeGallery[0];
  const totalImages = safeGallery.length;
  const hasPalette = Boolean(colorPalette?.length);
  const activeColor = hasPalette ? colorPalette?.[activeColorIndex] : undefined;
  const safeDocuments = useMemo(() => documents?.slice(0, 8) ?? [], [documents]);
  const accentPreview = activeColor?.preview ?? "#3b4250";

  const setImageIndex = (nextIndex: number) => {
    if (totalImages === 0) {
      return;
    }

    const normalized = (nextIndex + totalImages) % totalImages;
    setActiveImageIndex(normalized);
  };

  const showPreviousImage = () => setImageIndex(activeImageIndex - 1);
  const showNextImage = () => setImageIndex(activeImageIndex + 1);

  const handleGalleryKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPreviousImage();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      showNextImage();
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 36) {
      return;
    }

    if (delta > 0) {
      showPreviousImage();
      return;
    }

    showNextImage();
  };

  const experienceStyle = {
    "--experience-accent": accentPreview,
  } as CSSProperties;

  return (
    <div className="product-experience" style={experienceStyle}>
      <div className="product-gallery">
        <p className="eyebrow">{labels.galleryTitle}</p>
        <div className="product-main-image-shell">
          <div
            className="product-main-image"
            tabIndex={totalImages > 1 ? 0 : -1}
            onKeyDown={handleGalleryKeyDown}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            data-testid="product-main-image"
          >
            {activeImage ? (
              <img
                key={`${activeImage.src}-${activeImageIndex}`}
                src={activeImage.src}
                alt={activeImage.alt[locale]}
              />
            ) : (
              <div className="product-image-fallback">No media</div>
            )}
          </div>

          {totalImages > 1 ? (
            <div className="gallery-controls">
              <button
                type="button"
                className="gallery-nav-button"
                aria-label={labels.prevImage}
                onClick={showPreviousImage}
                data-testid="gallery-prev"
              >
                <span aria-hidden="true">←</span>
              </button>
              <p className="gallery-counter" aria-live="polite" data-testid="gallery-counter">
                {labels.galleryCounterLabel} {activeImageIndex + 1} / {totalImages}
              </p>
              <button
                type="button"
                className="gallery-nav-button"
                aria-label={labels.nextImage}
                onClick={showNextImage}
                data-testid="gallery-next"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : null}
        </div>

        <div className="product-thumbs">
          {safeGallery.slice(0, 16).map((media, index) => (
            <button
              key={`${media.src}-${index}`}
              className={`thumb-button ${index === activeImageIndex ? "is-active" : ""}`}
              onClick={() => setActiveImageIndex(index)}
              type="button"
              aria-label={media.alt[locale]}
              aria-pressed={index === activeImageIndex}
              data-testid={`thumb-${index}`}
            >
              <img src={media.src} alt={media.alt[locale]} loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      <div className="product-experience-side">
        <section className="palette-box">
          <p className="eyebrow">{labels.paletteTitle}</p>
          <p className="palette-hint">{labels.paletteHint}</p>

          {hasPalette ? (
            <>
              <div className="palette-grid">
                {colorPalette?.map((color, index) => (
                  <button
                    key={color.key}
                    type="button"
                    className={`palette-chip ${index === activeColorIndex ? "is-active" : ""}`}
                    onClick={() => setActiveColorIndex(index)}
                    aria-label={color.name[locale]}
                    aria-pressed={index === activeColorIndex}
                    data-testid={`palette-chip-${index}`}
                  >
                    <span style={{ background: color.preview }} />
                    <strong>{color.name[locale]}</strong>
                  </button>
                ))}
              </div>

              {activeColor ? (
                <div className="palette-preview" data-testid="palette-preview">
                  <div className="frame-preview" style={{ background: activeColor.preview }} />
                  <div>
                    <p className="palette-selected-label">{labels.selectedColorLabel}</p>
                    <h3 data-testid="active-color-name">{activeColor.name[locale]}</h3>
                    {activeColor.note ? <p>{activeColor.note[locale]}</p> : null}
                    <a
                      href="#lead-form"
                      className="btn btn-primary palette-cta"
                      data-testid="palette-cta"
                      onClick={() =>
                        trackCtaEvent({
                          channel: "form",
                          placement: "product_palette",
                          locale,
                        })
                      }
                    >
                      {labels.selectedColorCta}
                    </a>
                  </div>
                </div>
              ) : null}
            </>
          ) : (
            <p className="palette-empty">{labels.docsEmpty}</p>
          )}
        </section>

        <section className="docs-box">
          <p className="eyebrow">{labels.docsTitle}</p>
          {safeDocuments.length > 0 ? (
            <ul>
              {safeDocuments.map((document) => (
                <li key={`${document.href}-${document.kind}`}>
                  <a href={document.href} target="_blank" rel="noreferrer" className="docs-link">
                    {document.label[locale]}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>{labels.docsEmpty}</p>
          )}
        </section>
      </div>
    </div>
  );
}
