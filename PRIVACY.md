# Privacy Policy

IP Flag is designed to provide local visibility into the public network egress of the browser.

## Data the extension accesses

The extension determines the browser's public IPv4 and IPv6 addresses by contacting IP-check services. It then sends those public IP addresses to a GeoIP service to obtain country and network metadata.

## Data the extension does not access

IP Flag does not request or collect browsing history, visited URLs, page contents, cookies, search queries, passwords, account data, or precise device geolocation.

## Storage

Current network state, user flag-style preference, and a small GeoIP cache are stored locally using the browser extension storage API. No developer-operated backend is used.

## Analytics

The extension contains no analytics or advertising SDK.

## External services

The extension uses ipify to determine public IPv4/IPv6 and ipapi.is to obtain country/ASN/company metadata for those addresses. If the optional city lookup is enabled by the user, the same public IP address is also sent to ipwho.is to obtain a region and city. Requests are made only for the extension's stated network-egress functionality.
