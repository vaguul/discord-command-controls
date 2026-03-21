# discord-command-controls

![CI](https://github.com/vuguul/discord-command-controls/actions/workflows/ci.yml/badge.svg)
![MIT License](https://img.shields.io/badge/license-MIT-8fe3c7)

Reusable command catalog and policy helpers for Discord bots and admin dashboards.

This package extracts the command enable/disable and allow/deny policy logic into a small standalone TypeScript module so a bot runtime and a dashboard can share the same rules.

## What it gives you

- command catalog metadata
- per-command enable/disable switches
- role allow/deny lists
- channel allow/deny lists
- helpers to round-trip policy state through dashboard config JSON

## Install

```bash
npm install
```

## Test

```bash
npm test
npm run typecheck
```

## Why this exists

The goal is to keep Discord command governance in one place instead of duplicating logic between the bot runtime and the admin UI.

## Author

Built and published by [vuguul](https://github.com/vuguul).

## License

MIT
