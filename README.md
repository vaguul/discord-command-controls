# discord-command-controls

![CI](https://github.com/vaguul/discord-command-controls/actions/workflows/ci.yml/badge.svg)
![MIT License](https://img.shields.io/badge/license-MIT-8fe3c7)

Reusable command catalog and policy helpers for Discord bots and admin dashboards, maintained by Vaguul under the Zemiax personal software studio.

This package extracts the command enable/disable and allow/deny policy logic into a small standalone TypeScript module so a bot runtime and a dashboard can share the same rules.

## What it gives you

- command catalog metadata
- per-command enable/disable switches
- role allow/deny lists
- channel allow/deny lists
- helpers to round-trip policy state through dashboard config JSON

## Dashboard config fixture

Use stable IDs from your own app. Do not paste live Discord tokens, webhook URLs, or private guild IDs into fixtures.

```json
{
  "commandControls": {
    "ban": true,
    "warn": false,
    "spotify": true
  },
  "commandPolicies": {
    "ban": {
      "enabled": true,
      "allowedRoleIds": ["staff-role-id"],
      "deniedRoleIds": ["muted-role-id"],
      "allowedChannelIds": ["mod-channel-id"],
      "deniedChannelIds": ["general-channel-id"]
    },
    "spotify.play": {
      "enabled": false,
      "allowedRoleIds": ["dj-role-id"],
      "deniedRoleIds": [],
      "allowedChannelIds": ["music-channel-id"],
      "deniedChannelIds": []
    }
  }
}
```

`resolveCommandControlsFromDashboardConfig(config)` returns the root command mirrors used by simple dashboards. `resolveCommandPoliciesFromDashboardConfig(config)` returns root and subcommand policy targets for full policy editors.

## Install

```bash
npm install
```

## Test

```bash
npm test
npm run typecheck
npm run validate
```

## Maintainer workflow

- Triage new issues by impact: policy correctness, catalog coverage, dashboard serialization, then documentation.
- Keep `commandCatalog`, `commandPolicyTargets`, README examples, and tests aligned in the same change.
- Cut patch releases for documentation and compatibility fixes, and minor releases for new policy surface.
- Use the roadmap to keep small issues visible for outside contributors.

## Project status

This project is maintained as a small public utility for Discord bot builders who need shared command governance between a runtime and a dashboard. The current focus is correctness, predictable serialization, and easy contribution paths for catalog and policy coverage.

## Maintenance

- Keep command metadata and policy targets in sync.
- Add tests when command policy behavior changes.
- Do not commit Discord tokens, guild IDs from private servers, webhook URLs, or dashboard secrets.

## Why this exists

The goal is to keep Discord command governance in one place instead of duplicating logic between the bot runtime and the admin UI.

## Author

Built and maintained by Vaguul for Zemiax.

## License

MIT
