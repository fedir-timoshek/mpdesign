# UX Quality Runbook (Product Experience)

## Goal
Verify that product interaction details (gallery, palette, CTA flow) feel reliable on desktop and mobile.

## Command

```bash
npm run test:e2e:ux
```

## What Is Covered

- Gallery responds to keyboard arrows on desktop.
- Color palette selection updates active color state.
- Palette CTA scrolls user to lead form.
- Mobile swipe changes gallery image.
- Mobile sticky CTA is visible and usable in one tap (`WhatsApp`, `Call`, `Offer`).

## Release Rule

- `test:e2e:ux` must be green before production tag.
- If it fails, fix UX interaction first and rerun full `npm run release:check`.
