# Dashboard Policy Examples

These examples show how a dashboard can store simple command toggles while the bot runtime reads full command policies.

The examples are framework-neutral. Replace IDs with values from your own guild and keep private guild data out of committed fixtures.

## Minimal Command Catalog Fixture

```json
[
  {
    "name": "ban",
    "category": "moderation",
    "summary": "Ban a member.",
    "moduleIds": ["moderation"],
    "permissionKey": "moderation.ban"
  },
  {
    "name": "warn",
    "category": "moderation",
    "summary": "Warn a member.",
    "moduleIds": ["moderation"],
    "permissionKey": "moderation.warn"
  },
  {
    "name": "spotify",
    "category": "music",
    "summary": "Spotify-style playback and liked tracks.",
    "moduleIds": ["music"]
  }
]
```

## Dashboard Input

Simple dashboards can store root command toggles in `commandControls` and advanced settings in `commandPolicies`.

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
      "allowedRoleIds": ["role-staff"],
      "deniedRoleIds": ["role-muted"],
      "allowedChannelIds": ["channel-mod-log"],
      "deniedChannelIds": ["channel-general"]
    },
    "warn": {
      "enabled": false,
      "allowedRoleIds": [],
      "deniedRoleIds": [],
      "allowedChannelIds": [],
      "deniedChannelIds": []
    },
    "spotify.play": {
      "enabled": false,
      "allowedRoleIds": ["role-dj"],
      "deniedRoleIds": [],
      "allowedChannelIds": ["channel-music"],
      "deniedChannelIds": []
    }
  }
}
```

## Policy Output

`resolveCommandPoliciesFromDashboardConfig(config)` keeps root command toggles and detailed policy targets aligned.

```json
{
  "ban": {
    "enabled": true,
    "allowedRoleIds": ["role-staff"],
    "deniedRoleIds": ["role-muted"],
    "allowedChannelIds": ["channel-mod-log"],
    "deniedChannelIds": ["channel-general"]
  },
  "warn": {
    "enabled": false,
    "allowedRoleIds": [],
    "deniedRoleIds": [],
    "allowedChannelIds": [],
    "deniedChannelIds": []
  },
  "spotify": {
    "enabled": true,
    "allowedRoleIds": [],
    "deniedRoleIds": [],
    "allowedChannelIds": [],
    "deniedChannelIds": []
  },
  "spotify.play": {
    "enabled": false,
    "allowedRoleIds": ["role-dj"],
    "deniedRoleIds": [],
    "allowedChannelIds": ["channel-music"],
    "deniedChannelIds": []
  }
}
```

## Runtime Checks

Use `evaluateCommandPolicy(policy, context)` at command execution time:

| Command target | Context | Expected result |
| --- | --- | --- |
| `ban` | `roleIds: ["role-staff"]`, `channelId: "channel-mod-log"` | `allowed` |
| `ban` | no staff role | `role_not_allowed` |
| `ban` | `channelId: "channel-general"` | `channel_denied` |
| `warn` | any role/channel | `disabled` |
| `spotify.play` | any role/channel | `disabled` |

Root command toggles only mirror root command policies. Subcommand targets such as `spotify.play` stay independent so a dashboard can keep `/spotify` visible while disabling one action.
