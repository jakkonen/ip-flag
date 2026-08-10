# ADR-0001: Product scope

Status: Accepted

## Context

IP Flag is intended to answer one question quickly:

> From which country does this browser currently appear to access the Internet?

The primary use case is checking VPN/proxy egress without opening a separate "what is my IP" website.

## Decision

Version 0.1 is an egress visibility tool, not a full VPN diagnostic suite.

MVP includes:

- toolbar country flag;
- public IPv4;
- public IPv6;
- country for each address;
- warning when IPv4 and IPv6 resolve to different countries;
- ASN/organization when available;
- local cache;
- automatic and manual refresh;
- round and rectangular flag styles.

Explicitly out of scope for 0.1:

- DNS leak testing;
- WebRTC leak testing;
- VPN detection/scoring;
- speed tests;
- latency tests;
- maps;
- accounts/cloud sync;
- analytics.

## Consequences

The extension stays small, privacy-oriented, and easy to audit. New diagnostics should be added only when they directly improve egress verification.
