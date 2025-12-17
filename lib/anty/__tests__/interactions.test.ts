/**
 * Test file for interaction system
 * Verifies all 7 actions work correctly with the stat system
 */

import {
  ACTIONS,
  executeAction,
  getActionCooldown,
  isActionReady,
  getAllActionsStatus,
  isActionError,
  getRecommendedActions,
  getActionImpact,
  type ActionName,
} from "../interactions";
import { INITIAL_STATS, type AntyStats } from "../stat-system";

// Test helper: Create fresh stats
function createTestStats(): AntyStats {
  return { ...INITIAL_STATS };
}

// Test helper: Create empty action times
function createEmptyActionTimes(): Record<string, string> {
  return {};
}

// Test 1: All 7 actions are defined
console.log("Test 1: Checking all 7 actions are defined...");
const actionNames: ActionName[] = [
  "feed",
  "play",
  "rest",
  "optimize",
  "query",
  "reindex",
  "train",
];
actionNames.forEach((name) => {
  if (!ACTIONS[name]) {
    throw new Error(`Action ${name} is not defined!`);
  }
});
console.log("✓ All 7 actions are defined");

// Test 2: Execute feed action
console.log("\nTest 2: Executing feed action...");
const stats1 = createTestStats();
const actionTimes1 = createEmptyActionTimes();
const result1 = executeAction("feed", stats1, actionTimes1);

if (isActionError(result1)) {
  throw new Error(`Feed action failed: ${result1.error}`);
}

console.log(`Initial energy: ${stats1.energy}`);
console.log(`After feed energy: ${result1.stats.energy}`);
console.log(`Energy change: +${result1.stats.energy - stats1.energy}`);
console.log(`Message: ${result1.message}`);

if (result1.stats.energy !== stats1.energy + 20) {
  throw new Error("Energy change incorrect for feed action");
}
console.log("✓ Feed action works correctly");

// Test 3: Cooldown system
console.log("\nTest 3: Testing cooldown system...");
const stats2 = createTestStats();
const actionTimes2 = createEmptyActionTimes();

// Execute play action
const playResult1 = executeAction("play", stats2, actionTimes2);
if (isActionError(playResult1)) {
  throw new Error(`Play action failed: ${playResult1.error}`);
}

// Update action times
actionTimes2["play"] = playResult1.cooldownUntil;

// Try to execute again immediately
const playResult2 = executeAction("play", playResult1.stats, actionTimes2);
if (!isActionError(playResult2)) {
  throw new Error("Cooldown should prevent immediate re-execution");
}

console.log(`Cooldown error: ${playResult2.error}`);
console.log(`Cooldown remaining: ${playResult2.cooldownRemaining}s`);
console.log("✓ Cooldown system works correctly");

// Test 4: Action ready check
console.log("\nTest 4: Testing action ready check...");
if (isActionReady("play", actionTimes2)) {
  throw new Error("Action should not be ready during cooldown");
}
console.log("✓ Action ready check works correctly");

// Test 5: Get all actions status
console.log("\nTest 5: Testing getAllActionsStatus...");
const allStatus = getAllActionsStatus(actionTimes2);
if (allStatus.length !== 7) {
  throw new Error("Should return status for all 7 actions");
}

const playStatus = allStatus.find((s) => s.action === "play");
if (!playStatus || playStatus.isReady) {
  throw new Error("Play action should not be ready");
}

const feedStatus = allStatus.find((s) => s.action === "feed");
if (!feedStatus || !feedStatus.isReady) {
  throw new Error("Feed action should be ready");
}

console.log("✓ getAllActionsStatus works correctly");

// Test 6: Recommended actions
console.log("\nTest 6: Testing recommended actions...");
const lowStats: AntyStats = {
  energy: 30,
  happiness: 30,
  knowledge: 30,
  indexHealth: 30,
};

const recommendations = getRecommendedActions(lowStats);
console.log(`Recommendations for low stats: ${recommendations.join(", ")}`);

if (recommendations.length === 0) {
  throw new Error("Should recommend actions for low stats");
}
console.log("✓ Recommended actions work correctly");

// Test 7: Action impact calculation
console.log("\nTest 7: Testing action impact calculation...");
const feedImpact = getActionImpact("feed");
const expectedFeedImpact = 20 + 10 + 5; // energy + happiness + indexHealth

if (feedImpact !== expectedFeedImpact) {
  throw new Error(
    `Feed impact should be ${expectedFeedImpact}, got ${feedImpact}`
  );
}
console.log(`Feed action impact: ${feedImpact}`);
console.log("✓ Action impact calculation works correctly");

// Test 8: Stat clamping (values don't exceed 100)
console.log("\nTest 8: Testing stat clamping...");
const highStats: AntyStats = {
  energy: 95,
  happiness: 95,
  knowledge: 95,
  indexHealth: 95,
};

const feedResult = executeAction("feed", highStats, createEmptyActionTimes());
if (isActionError(feedResult)) {
  throw new Error(`Feed action failed: ${feedResult.error}`);
}

if (
  feedResult.stats.energy > 100 ||
  feedResult.stats.happiness > 100 ||
  feedResult.stats.indexHealth > 100
) {
  throw new Error("Stats should be clamped to 100 max");
}

console.log(`Clamped energy: ${feedResult.stats.energy}`);
console.log("✓ Stat clamping works correctly");

// Test 9: All actions have proper configuration
console.log("\nTest 9: Verifying all action configurations...");
actionNames.forEach((name) => {
  const action = ACTIONS[name];
  if (!action.label || action.label.length === 0) {
    throw new Error(`Action ${name} missing label`);
  }
  if (!action.description || action.description.length === 0) {
    throw new Error(`Action ${name} missing description`);
  }
  if (!action.emoji || action.emoji.length === 0) {
    throw new Error(`Action ${name} missing emoji`);
  }
  if (action.cooldownSeconds <= 0) {
    throw new Error(`Action ${name} has invalid cooldown`);
  }
  if (!action.statChanges || Object.keys(action.statChanges).length === 0) {
    throw new Error(`Action ${name} missing stat changes`);
  }
});
console.log("✓ All action configurations are valid");

console.log("\n✓✓✓ All tests passed! ✓✓✓");
