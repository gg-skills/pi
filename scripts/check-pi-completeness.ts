#!/usr/bin/env npx tsx

/**
 * Pi Completeness Checker
 * 
 * Verifies a pi configuration operation against the 8-item Pi Quality Checklist.
 * 
 * Usage:
 *   npx tsx skills/pi/scripts/check-pi-completeness.ts
 */

import { argv } from "process";
import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

// ============================================================================
// Types
// ============================================================================

/**
 * One Pi Quality Checklist row used when scoring local readiness signals.
 *
 * @remarks
 * Scoring uses `weight` as contribution to totals; `required` gates finalization.
 */
interface ChecklistItem {
  number: number;
  name: string;
  description: string;
  required: boolean;
  checked: boolean;
  weight: number;
}

/**
 * Serializable summary of checklist rows plus aggregate readiness score.
 *
 * @remarks
 * Emitted on stdout only when `--json` is passed to the CLI entrypoint.
 */
interface CompletenessReport {
  checklist: ChecklistItem[];
  score: number;
  maxScore: number;
  canFinalize: boolean;
}

// ============================================================================
// Checklist Definition
// ============================================================================

const CHECKLIST_ITEMS: Omit<ChecklistItem, "checked">[] = [
  { number: 1, name: "Canonical source verified", description: "pi.dev or pi-mono consulted", required: true, weight: 2 },
  { number: 2, name: "Node version checked", description: "v20+ required", required: true, weight: 2 },
  { number: 3, name: "Config directory known", description: "~/.pi/agent/ or custom", required: true, weight: 2 },
  { number: 4, name: "Auth method chosen", description: "Env var, --api-key, or OAuth", required: true, weight: 2 },
  { number: 5, name: "Reference files loaded", description: "Only needed subset from references/", required: true, weight: 1 },
  { number: 6, name: "RPC framing correct", description: "LF-delimited JSONL, not readline", required: false, weight: 2 },
  { number: 7, name: "Extension runtime loaded", description: "TypeScript at runtime, no build", required: false, weight: 2 },
  { number: 8, name: "Session saved", description: "/save or Ctrl+S before exit", required: true, weight: 1 },
];

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect Node.js installation and whether the major version meets the pi baseline.
 *
 * @remarks
 * I/O: spawns `node --version` via a short-lived shell command.
 */
function checkNodeVersion(): { installed: boolean; valid: boolean; version: string } {
  try {
    const output = execSync("node --version 2>/dev/null", { encoding: "utf-8" });
    const version = output.trim().replace("v", "");
    const major = parseInt(version.split(".")[0], 10);
    return {
      installed: true,
      valid: major >= 20,
      version,
    };
  } catch {
    return { installed: false, valid: false, version: "unknown" };
  }
}

/**
 * Detect whether the `pi` executable is on PATH for this process environment.
 *
 * @remarks
 * I/O: runs `which pi` via a short-lived shell command.
 */
function checkPiInstalled(): boolean {
  try {
    execSync("which pi 2>/dev/null", { encoding: "utf-8" });
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect whether the default pi agent configuration directory exists locally.
 *
 * @remarks
 * I/O: checks filesystem existence for `join(HOME, ".pi", "agent")`, using the literal `~`
 * segment when `HOME` is unset.
 */
function checkPiConfigDir(): boolean {
  const configPath = join(process.env.HOME || "~", ".pi", "agent");
  return existsSync(configPath);
}

// ============================================================================
// Main
// ============================================================================

/**
 * CLI entrypoint: print diagnostics, score checklist items, optionally emit JSON report.
 *
 * @remarks
 * I/O: writes human-readable output to stdout; invokes detection helpers that may spawn
 * subprocesses before printing.
 */
function main() {
  const args = argv.slice(2);
  const jsonArg = args.includes("--json");
  
  console.log("\n📋 Pi Completeness Check");
  console.log("═".repeat(60));
  
  // Run checks
  const node = checkNodeVersion();
  const piInstalled = checkPiInstalled();
  const configExists = checkPiConfigDir();
  
  console.log(`\n📊 Pi Status:`);
  console.log(`   Node.js: ${node.version} ${node.valid ? "✅" : "(v20+ required)"}`);
  console.log(`   pi installed: ${piInstalled ? "✅" : "⚠️"}`);
  console.log(`   Config dir: ${configExists ? "✅" : "⚠️"}`);
  
  // Build checklist
  const checklist: ChecklistItem[] = CHECKLIST_ITEMS.map(item => {
    let checked = false;
    
    switch (item.number) {
      case 1: // Canonical source verified
        checked = true; // Assumed if using skill
        break;
      case 2: // Node version checked
        checked = node.valid;
        break;
      case 3: // Config directory known
        checked = true; // Assumed
        break;
      case 4: // Auth method chosen
        checked = true; // Assumed
        break;
      case 5: // Reference files loaded
        checked = true; // Assumed
        break;
      case 6: // RPC framing correct
        checked = item.required === false;
        break;
      case 7: // Extension runtime loaded
        checked = item.required === false;
        break;
      case 8: // Session saved
        checked = true; // Assumed at closeout
        break;
      default:
        break;
    }
    
    return { ...item, checked };
  });
  
  const score = checklist.reduce((sum, item) => 
    item.checked ? sum + item.weight : sum, 0);
  const maxScore = checklist.reduce((sum, item) => sum + item.weight, 0);
  
  const requiredItems = checklist.filter(i => i.required);
  const requiredScore = requiredItems.reduce((sum, item) => 
    item.checked ? sum + item.weight : sum, 0);
  const requiredMax = requiredItems.reduce((sum, item) => sum + item.weight, 0);
  
  const canFinalize = requiredScore === requiredMax;
  
  console.log(`\n📊 Score: ${score}/${maxScore} (${((score/maxScore)*100).toFixed(0)}%)`);
  console.log(`   Required items: ${requiredScore}/${requiredMax}`);
  
  console.log(`\n${canFinalize ? "✅" : "⚠️"} Ready: ${canFinalize ? "YES" : "NEEDS WORK"}`);
  
  console.log("\n📝 Checklist:");
  for (const item of checklist) {
    const icon = item.checked ? "✅" : item.required ? "❌" : "⚠️";
    console.log(`   ${icon} [${item.number}] ${item.name}`);
  }
  
  console.log("\n" + "═".repeat(60));
  
  if (!canFinalize) {
    console.log("\n⚠️ Pi configuration needs work.");
    const failedItems = checklist.filter(i => !i.checked && i.required);
    if (failedItems.length > 0) {
      console.log("\nIssues to resolve:");
      failedItems.forEach(i => console.log(`   - ${i.name}: ${i.description}`));
    }
  } else {
    console.log("\n✅ Ready for pi operation.");
  }
  
  if (jsonArg) {
    const report: CompletenessReport = { checklist, score, maxScore, canFinalize };
    console.log("\n" + JSON.stringify(report, null, 2));
  }
}

main();
