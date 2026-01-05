const Anthropic = require("@anthropic-ai/sdk");
const fs = require("fs");

/**
 * Source Evaluator CLI
 *
 * Usage: node evaluate.js --source <path> --criteria <path> --prompt <path> --pifc <path> --key <api-key> [--out <path>]
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

function buildPrompt(templatePath, criteria, source, pifc) {
  const template = fs.readFileSync(templatePath, "utf-8");

  const criteriaList = criteria
    .map((c) => `- **${c.name}** (id: ${c.id}): ${c.description}`)
    .join("\n");

  const probabilityValues = Object.entries(pifc.probability)
    .map(([value, desc]) => `- ${value}: ${desc}`)
    .join("\n");

  const impactValues = Object.entries(pifc.impact)
    .map(([value, desc]) => `- ${value}: ${desc}`)
    .join("\n");

  const frequencyValues = Object.entries(pifc.frequency)
    .map(([value, desc]) => `- ${value}: ${desc}`)
    .join("\n");

  const confidenceValues = Object.entries(pifc.confidence)
    .map(([value, desc]) => `- ${value}: ${desc}`)
    .join("\n");

  return template
    .replace("{{criteriaList}}", criteriaList)
    .replace("{{probabilityValues}}", probabilityValues)
    .replace("{{impactValues}}", impactValues)
    .replace("{{frequencyValues}}", frequencyValues)
    .replace("{{confidenceValues}}", confidenceValues)
    .replace("{{source}}", source);
}

async function main() {
  const args = parseArgs();

  // Validate required args
  if (!args.source) {
    console.error("Error: --source <path> is required");
    process.exit(1);
  }
  if (!args.criteria) {
    console.error("Error: --criteria <path> is required");
    process.exit(1);
  }
  if (!args.prompt) {
    console.error("Error: --prompt <path> is required");
    process.exit(1);
  }
  if (!args.pifc) {
    console.error("Error: --pifc <path> is required");
    process.exit(1);
  }
  if (!args.key) {
    console.error("Error: --key <api-key> is required");
    process.exit(1);
  }

  const sourcePath = args.source;
  const criteriaPath = args.criteria;
  const promptPath = args.prompt;
  const pifcPath = args.pifc;
  const apiKey = args.key;
  const outPath = args.out || "evaluation.json";

  // Read files
  if (!fs.existsSync(sourcePath)) {
    console.error(`Error: File not found: ${sourcePath}`);
    process.exit(1);
  }
  if (!fs.existsSync(criteriaPath)) {
    console.error(`Error: File not found: ${criteriaPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(promptPath)) {
    console.error(`Error: File not found: ${promptPath}`);
    process.exit(1);
  }
  if (!fs.existsSync(pifcPath)) {
    console.error(`Error: File not found: ${pifcPath}`);
    process.exit(1);
  }

  const source = fs.readFileSync(sourcePath, "utf-8");
  const criteriaData = JSON.parse(fs.readFileSync(criteriaPath, "utf-8"));
  const criteria = criteriaData.criteria;
  const pifc = JSON.parse(fs.readFileSync(pifcPath, "utf-8"));

  console.log(`Source: ${sourcePath}`);
  console.log(`Criteria: ${criteriaPath} (${criteria.length} criteria)`);
  console.log(`Prompt: ${promptPath}`);
  console.log(`Values: ${pifcPath}`);
  console.log(`Output: ${outPath}`);
  console.log("\nEvaluating...\n");

  // Call Claude
  const client = new Anthropic({ apiKey });
  const prompt = buildPrompt(promptPath, criteria, source, pifc);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8192,
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

  // Merge weights from criteria
  output.criteria = output.criteria.map((c) => {
    const original = criteria.find((oc) => oc.id === c.id);
    return {
      ...c,
      weight: original?.weight ?? null,
    };
  });

  // Add metadata
  const result = {
    evaluationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    sources: {
      source: sourcePath,
      criteria: criteriaPath,
    },
    criteria: output.criteria,
  };

  // Write output
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));

  console.log("Evaluation complete:\n");
  result.criteria.forEach((c) => {
    console.log(`${c.name} (weight: ${(c.weight * 100).toFixed(0)}%)`);
    console.log(`  Probability: ${c.probability.mostLikely} - ${c.probability.reasoning}`);
    console.log(`  Impact: ${c.impact.mostLikely} - ${c.impact.reasoning}`);
    console.log(`  Frequency: ${c.frequency.mostLikely} - ${c.frequency.reasoning}`);
    console.log("");
  });

  console.log(`Written to: ${outPath}`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
