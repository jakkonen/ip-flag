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
- provider health/error details
- copy-all diagnostics
- local-only IP check history with timestamps
- history of IPv4 and IPv6 address changes
- history of country changes for each address family
- summary of check frequency and successful/failed checks
- configurable automatic check interval
- check on browser startup and extension service-worker startup
- check when the popup opens only if the current result is stale
- manual check from the popup at any time
- scheduled checks through browser alarms; default interval: 5 minutes
- interval options: 30 seconds, 1, 5, 15, and 30 minutes, or manual-only
- configurable history retention and clear-history control
- opt-in browser notifications for IP address changes
- opt-in browser notifications for country changes

History and notification settings must stay local to the browser. They must not add analytics, a developer backend, or any request beyond the existing IP and GeoIP checks.

New-tab checks remain opt-in and use the current-state cache to avoid unnecessary requests. Do not use navigation or active-tab changes as check triggers. A VPN or operating-system network change has no reliable shared WebExtensions event, so the next scheduled check should detect it.

## Later, only if justified

- Optional local GeoIP database: bundle periodically updated IPv4/IPv6 country and ASN ranges so that GeoIP lookups do not send a public IP to an external provider. Keep external requests only for public IP detection; evaluate database size, update process, and license attribution before implementation.
- DNS leak checks
- WebRTC leak checks
- expected-country alert

The product should remain an egress visibility tool rather than becoming a generic network suite.
