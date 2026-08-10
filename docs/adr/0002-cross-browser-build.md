# ADR-0002: One repository, two browser targets

Status: Accepted

## Decision

Keep one shared TypeScript codebase and produce two packages:

- `dist/firefox`
- `dist/chromium`

Chromium covers Chrome, Brave, Edge, Vivaldi, and compatible browsers.

Browser-specific differences are isolated in `manifests/`.

## Rationale

Firefox Manifest V3 uses background scripts/event pages, while Chromium Manifest V3 uses an extension service worker. The application logic remains shared.
