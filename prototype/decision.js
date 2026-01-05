const fs = require("fs");
const path = require("path");

const { computeDecision } = require("./engine/engine.js");

/**
 * Criteria Generator CLI
 *
 * Usage: node decision.js --evaluation <path> [--out <path>]
 */

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace("--", "");
    const value = args[i + 1];
    parsed[key] = value;
  }

  return parsed;
}

async function main() {
    const args = parseArgs();

    // Validate required args
    if (!args.evaluation) {
        console.error("Error: --evaluation <path> is required");
        process.exit(1);
    }

    if (!args.config) {
        console.error("Error: --config <path> is required");
        process.exit(1);
    }
    

    const evaluationPath = args.evaluation;
    const configPath = args.config;
    const outPath = args.out || "decision.json";

    // Read files
    if (!fs.existsSync(evaluationPath)) {
        console.error(`Error: File not found: ${evaluationPath}`);
        process.exit(1);
    }
    
    if (!fs.existsSync(configPath)) {
        console.error(`Error: File not found: ${configPath}`);
        process.exit(1);
    }

    const evaluation = JSON.parse(fs.readFileSync(evaluationPath, "utf-8"));
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));

    const decision = computeDecision(evaluation.criteria, config);
    fs.writeFileSync(outPath, JSON.stringify(decision, null, 2));
  
    console.log(`Written to: ${outPath}`);
    console.log(JSON.stringify(decision, null, 2));
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
