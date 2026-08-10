# IP Flag Privacy Policy

Effective date: August 11, 2026.

[Suomi](privacy-fi.html) · [Русский](privacy-ru.html)

IP Flag is a browser extension that locally shows how the browser appears on the internet: its public IPv4/IPv6 addresses, egress country, and network organization.

## Data processed

The extension contacts external services to determine the browser's public IPv4 and IPv6 addresses. It then sends those addresses to a GeoIP service to determine the country and network organization.

The current version uses these services:

- `api.ipify.org` for public IPv4;
- `api6.ipify.org` for public IPv6;
- `api.ipapi.is` for country, ASN, and network organization.

## Data not collected

IP Flag does not request or access browsing history, visited URLs, page content, cookies, search queries, passwords, account data, or the device's precise location.

The extension does not use analytics, advertising, telemetry, cloud synchronization, or a developer-operated backend.

## Local storage

The current network state, selected flag style, and a small GeoIP cache are stored only in the browser's local extension storage. The GeoIP cache is retained for up to 24 hours and contains no more than 50 IP addresses.

## Data transfer

A public IP address is sent to the services listed above only to provide the extension's core functionality. Transfers use HTTPS.

## Changes to this policy

This page will be updated together with a new extension version if data handling changes materially.
