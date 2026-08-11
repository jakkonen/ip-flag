# Roadmap

## 0.1 — Egress visibility MVP

- IPv4 and IPv6 public addresses
- country flag in toolbar
- IPv4/IPv6 country mismatch warning
- ASN / organization
- local cache
- round / rectangular flag styles
- Firefox + Chromium builds

## 0.2 — Resilience and history

- optional fallback IP providers
- recent IP history stored locally
- provider health/error details
- copy-all diagnostics

## Later, only if justified

- Optional local GeoIP database: bundle periodically updated IPv4/IPv6 country and ASN ranges so that GeoIP lookups do not send a public IP to an external provider. Keep external requests only for public IP detection; evaluate database size, update process, and license attribution before implementation.
- DNS leak checks
- WebRTC leak checks
- expected-country alert

The product should remain an egress visibility tool rather than becoming a generic network suite.
