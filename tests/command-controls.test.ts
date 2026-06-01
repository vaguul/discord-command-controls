import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  evaluateCommandPolicy,
  filterSupportedCommandControls,
  filterSupportedCommandPolicies,
  getPolicyTargetsForCommand,
  isCommandEnabled,
  resolveCommandControlsFromDashboardConfig,
  resolveCommandPoliciesFromDashboardConfig,
  writeCommandControlsToDashboardConfig,
  writeCommandPoliciesToDashboardConfig
} from "../src/index.ts";

const dashboardFixture = JSON.parse(readFileSync(new URL("../docs/dashboard-config.fixture.json", import.meta.url), "utf8"));

test("filterSupportedCommandControls defaults unknown commands and keeps catalog commands", () => {
  const controls = filterSupportedCommandControls({
    warn: false,
    imaginary: false
  });

  assert.equal(controls.warn, false);
  assert.equal(controls.ban, true);
  assert.equal("imaginary" in controls, false);
});

test("resolve and write command controls round-trip dashboard config safely", () => {
  const dashboardConfig = {
    someOtherConfig: {
      enabled: true
    },
    commandControls: {
      warn: false
    }
  };

  const resolved = resolveCommandControlsFromDashboardConfig(dashboardConfig);
  assert.equal(resolved.warn, false);
  assert.equal(isCommandEnabled(resolved, "ban"), true);

  const next = writeCommandControlsToDashboardConfig(dashboardConfig, {
    ...resolved,
    ban: false
  }) as unknown as { someOtherConfig: { enabled: boolean }; commandControls: Record<string, boolean> };

  assert.equal(next.someOtherConfig.enabled, true);
  assert.equal(next.commandControls.warn, false);
  assert.equal(next.commandControls.ban, false);
});

test("evaluateCommandPolicy enforces deny and allow lists", () => {
  const policy = resolveCommandPoliciesFromDashboardConfig({
    commandPolicies: {
      ban: {
        enabled: true,
        allowedRoleIds: ["staff"],
        deniedRoleIds: ["muted"],
        allowedChannelIds: ["mod-room"],
        deniedChannelIds: ["general"]
      }
    }
  }).ban;

  assert.equal(
    evaluateCommandPolicy(policy, {
      channelId: "general",
      roleIds: ["staff"]
    }).reason,
    "channel_denied"
  );
  assert.equal(
    evaluateCommandPolicy(policy, {
      channelId: "mod-room",
      roleIds: ["muted", "staff"]
    }).reason,
    "role_denied"
  );
  assert.equal(
    evaluateCommandPolicy(policy, {
      channelId: "mod-room",
      roleIds: []
    }).reason,
    "role_not_allowed"
  );
  assert.equal(
    evaluateCommandPolicy(policy, {
      channelId: "mod-room",
      roleIds: ["staff"]
    }).reason,
    "allowed"
  );
});

test("dashboard role override fixture covers enabled, disabled, and role-required states", () => {
  const policies = resolveCommandPoliciesFromDashboardConfig(dashboardFixture);

  assert.equal(policies.ban.enabled, true);
  assert.deepEqual(policies.ban.allowedRoleIds, ["role-staff"]);
  assert.equal(
    evaluateCommandPolicy(policies.ban, {
      channelId: "channel-mod-log",
      roleIds: []
    }).reason,
    "role_not_allowed"
  );
  assert.equal(
    evaluateCommandPolicy(policies.ban, {
      channelId: "channel-mod-log",
      roleIds: ["role-staff"]
    }).reason,
    "allowed"
  );

  assert.equal(policies.warn.enabled, false);
  assert.equal(
    evaluateCommandPolicy(policies.warn, {
      channelId: "channel-support",
      roleIds: ["role-helper"]
    }).reason,
    "disabled"
  );

  assert.equal(policies["spotify.play"].enabled, false);
  assert.deepEqual(policies["spotify.play"].allowedRoleIds, ["role-dj"]);
});

test("evaluateCommandPolicy keeps deny checks ahead of allow-list checks", () => {
  const policy = {
    enabled: true,
    allowedRoleIds: ["staff"],
    deniedRoleIds: ["muted"],
    allowedChannelIds: ["mod-room"],
    deniedChannelIds: ["general"]
  };

  assert.equal(
    evaluateCommandPolicy(policy, {
      channelId: "general",
      roleIds: []
    }).reason,
    "channel_denied"
  );
  assert.equal(
    evaluateCommandPolicy(policy, {
      channelId: "random",
      roleIds: ["muted", "staff"]
    }).reason,
    "role_denied"
  );
});

test("evaluateCommandPolicy reports channel and role allow-list failures distinctly", () => {
  const policy = {
    enabled: true,
    allowedRoleIds: ["staff"],
    deniedRoleIds: [],
    allowedChannelIds: ["mod-room"],
    deniedChannelIds: []
  };

  assert.equal(
    evaluateCommandPolicy(policy, {
      channelId: "random",
      roleIds: ["staff"]
    }).reason,
    "channel_not_allowed"
  );
  assert.equal(
    evaluateCommandPolicy(policy, {
      channelId: "mod-room",
      roleIds: []
    }).reason,
    "role_not_allowed"
  );
});

test("writeCommandPoliciesToDashboardConfig keeps boolean mirrors for command controls", () => {
  const next = writeCommandPoliciesToDashboardConfig(
    {},
    {
      warn: {
        enabled: false,
        allowedRoleIds: [],
        deniedRoleIds: [],
        allowedChannelIds: [],
        deniedChannelIds: []
      }
    }
  ) as { commandControls: Record<string, boolean>; commandPolicies: Record<string, unknown> };

  assert.equal(next.commandControls.warn, false);
  assert.ok(next.commandPolicies.warn);
});

test("subcommand policies are preserved independently from root command mirrors", () => {
  const next = writeCommandPoliciesToDashboardConfig(
    {},
    {
      spotify: {
        enabled: true,
        allowedRoleIds: [],
        deniedRoleIds: [],
        allowedChannelIds: [],
        deniedChannelIds: []
      },
      "spotify.play": {
        enabled: false,
        allowedRoleIds: ["dj"],
        deniedRoleIds: [],
        allowedChannelIds: ["music-room"],
        deniedChannelIds: []
      }
    }
  ) as { commandControls: Record<string, boolean>; commandPolicies: Record<string, { enabled: boolean; allowedRoleIds: string[]; allowedChannelIds: string[] }> };

  assert.equal(next.commandControls.spotify, true);
  assert.equal(next.commandPolicies["spotify.play"].enabled, false);
  assert.deepEqual(next.commandPolicies["spotify.play"].allowedRoleIds, ["dj"]);
  assert.deepEqual(next.commandPolicies["spotify.play"].allowedChannelIds, ["music-room"]);
});

test("filterSupportedCommandPolicies drops unknown policy targets and normalizes arrays", () => {
  const policies = filterSupportedCommandPolicies({
    ban: {
      enabled: false,
      allowedRoleIds: ["staff", 42] as unknown as string[],
      deniedRoleIds: [null, "muted"] as unknown as string[],
      allowedChannelIds: ["mod-room"],
      deniedChannelIds: ["general", false] as unknown as string[]
    },
    imaginary: {
      enabled: false,
      allowedRoleIds: ["ghost"],
      deniedRoleIds: [],
      allowedChannelIds: [],
      deniedChannelIds: []
    }
  });

  assert.equal(policies.ban.enabled, false);
  assert.deepEqual(policies.ban.allowedRoleIds, ["staff"]);
  assert.deepEqual(policies.ban.deniedRoleIds, ["muted"]);
  assert.deepEqual(policies.ban.allowedChannelIds, ["mod-room"]);
  assert.deepEqual(policies.ban.deniedChannelIds, ["general"]);
  assert.equal("imaginary" in policies, false);
});

test("getPolicyTargetsForCommand returns root and subcommand targets together", () => {
  const targets = getPolicyTargetsForCommand("spotify");
  const keys = targets.map((target) => target.key);

  assert.ok(keys.includes("spotify"));
  assert.ok(keys.includes("spotify.play"));
  assert.ok(keys.includes("spotify.volume"));
});
