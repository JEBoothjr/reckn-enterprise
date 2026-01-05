const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");
const path = require("path");

/**
 * Criteria Generator CLI
 *
 * Usage: node generate-criteria.js --source <path> --prompt <path> --key <api-key> [--out <path>] [--max <number>]
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

function buildPrompt(templatePath, source, maxCriteria) {
  const template = fs.readFileSync(templatePath, "utf-8");

  return template
    .replace("{{source}}", source)
    .replace("{{maxCriteria}}", maxCriteria);
}

async function main() {
  const args = parseArgs();

  // Validate required args
  if (!args.source) {
    console.error("Error: --source <path> is required");
    process.exit(1);
  }
  if (!args.prompt) {
    console.error("Error: --prompt <path> is required");
    process.exit(1);
  }
  if (!args.key) {
    console.error("Error: --key <api-key> is required");
    process.exit(1);
  }

  const sourcePath = args.source;
  const promptPath = args.prompt;
  const apiKey = args.key;
  const outPath = args.out || "criteria.json";
  const maxCriteria = parseInt(args.max) || 7;

  // Read files
  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: File not found: ${sourcePath}`);
    process.exit(1);
  }
  if (!fs.existsSync(promptPath)) {
    console.error(`Error: File not found: ${promptPath}`);
    process.exit(1);
  }
  const source = fs.readFileSync(sourcePath, "utf-8");

  console.log(`Reading source from: ${sourcePath}`);
  console.log(`Prompt: ${promptPath}`);
  console.log(`Max criteria: ${maxCriteria}`);
  console.log(`Output: ${outPath}`);
  console.log("\nGenerating criteria...\n");

  // Call Claude
  const client = new Anthropic({ apiKey });
  const prompt = buildPrompt(promptPath, source, maxCriteria);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].text;

  // Parse JSON
  let output;
  try {
    output = JSON.parse(text);
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      output = JSON.parse(match[0]);
    } else {
      console.error("Failed to parse response:", text);
      process.exit(1);
    }
  }

  // Validate weights
  const totalWeight = output.criteria.reduce((sum, c) => sum + c.weight, 0);
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    console.warn(`Warning: Weights sum to ${totalWeight.toFixed(3)}, expected 1.0`);
  }

  // Write output
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  console.log(`Generated ${output.criteria.length} criteria:\n`);
  output.criteria.forEach((c) => {
    console.log(`  ${c.name} (${(c.weight * 100).toFixed(0)}%)`);
  });
  console.log(`\nReasoning: ${output.reasoning}`);
  console.log(`\nWritten to: ${outPath}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
