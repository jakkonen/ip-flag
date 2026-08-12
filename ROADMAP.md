# Roadmap

## 0.1 — Egress visibility MVP — готово

- [x] IPv4 and IPv6 public addresses
- [x] country flag in toolbar
- [x] IPv4/IPv6 country mismatch warning
- [x] ASN / organization
- [x] local current-state and GeoIP cache
- [x] round / rectangular flag styles
- [x] Firefox + Chromium builds

## 0.2 — История и автоматические проверки — готово

- [x] local-only IP check history with timestamps, check trigger, and GeoIP cache/request source
- [x] history of IPv4 and IPv6 address changes
- [x] history of country changes for each address family
- [x] configurable automatic check interval: 30 seconds, 1, 5, 15, or 30 minutes
- [x] check on browser startup, popup open, and optional new-tab creation
- [x] manual check from the popup at any time
- [x] scheduled checks through browser alarms; default interval: 5 minutes
- [x] clear-history control; unavailable public IP checks are deliberately not recorded
- [x] opt-in browser notifications for IP address and country changes
- [x] `NEW` toolbar badge, tooltip, and popup notice for unacknowledged changes
- [x] three-day local GeoIP cache with a clear-location-cache control
- [x] optional city and region lookup through `ipwho.is`, disabled by default

History and notification settings must stay local to the browser. They must not add analytics, a developer backend, or any request beyond the existing IP and GeoIP checks.

New-tab checks remain opt-in. Do not use navigation or active-tab changes as check triggers. A VPN or operating-system network change has no reliable shared WebExtensions event, so the next scheduled check should detect it.

## 0.3 — Следующие улучшения

- optional fallback IP providers
- provider health/error details
- copy-all diagnostics
- summary of check frequency and successful/failed checks
- configurable history retention
- manual-only automatic-check setting

## Позднее, только при обоснованной необходимости

- Optional local GeoIP database: bundle periodically updated IPv4/IPv6 country and ASN ranges so that GeoIP lookups do not send a public IP to an external provider. Keep external requests only for public IP detection; evaluate database size, update process, and license attribution before implementation.
- DNS leak checks
- WebRTC leak checks
- expected-country alert

The product should remain an egress visibility tool rather than becoming a generic network suite.
