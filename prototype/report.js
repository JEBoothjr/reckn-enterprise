const fs = require("fs");

/**
 * Report Generator CLI
 *
 * Usage: node report.js --criteria <path> --evaluation <path> --decision <path> [--out <path>]
 */

const BAND_LABELS = {
  1: "Very Low Risk",
  2: "Low Risk",
  3: "Moderate Risk",
  4: "High Risk",
  5: "Very High Risk",
};

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

function generateMarkdown(criteria, evaluation, decision) {
  const lines = [];

  // Header
  lines.push("# Candidate Evaluation Report");
  lines.push("");
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push(`**Evaluation ID:** ${evaluation.evaluationId}`);
  lines.push(`**Engine:** ${decision.engine}`);
  lines.push("");

  // Final Score
  lines.push("## Final Score");
  lines.push("");
  const score = decision.score;
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| **Risk Band** | ${score.band} - ${BAND_LABELS[score.band]} |`);
  lines.push(`| **Raw Score** | ${score.value.toFixed(2)} |`);
  lines.push(`| **Position in Band** | ${(score.position * 100).toFixed(0)}% |`);
  lines.push("");

  // Criteria Summary
  lines.push("## Criteria Summary");
  lines.push("");
  lines.push("| Criterion | Weight | Risk Score |");
  lines.push("|-----------|--------|------------|");

  for (const d of decision.data) {
    const evalCriterion = evaluation.criteria.find((c) => c.id === d.factor);
    const name = evalCriterion?.name || d.factor;
    const weightPct = (d.weight * 100).toFixed(0);
    lines.push(`| ${name} | ${weightPct}% | ${d.weighted_score.toFixed(2)} |`);
  }
  lines.push("");

  // Detailed Breakdown
  lines.push("## Detailed Breakdown");
  lines.push("");

  for (const evalCriterion of evaluation.criteria) {
    const criterionDef = criteria.criteria.find((c) => c.id === evalCriterion.id);
    const decisionData = decision.data.find((d) => d.factor === evalCriterion.id);

    lines.push(`### ${evalCriterion.name}`);
    lines.push("");
    lines.push(`**Weight:** ${(evalCriterion.weight * 100).toFixed(0)}%`);
    lines.push("");
    if (criterionDef) {
      lines.push(`**Definition:** ${criterionDef.description}`);
      lines.push("");
    }

    // PIF Table
    lines.push("| Dimension | Optimistic | Most Likely | Pessimistic | Confidence |");
    lines.push("|-----------|------------|-------------|-------------|------------|");
    lines.push(
      `| Probability | ${evalCriterion.probability.optimistic} | ${evalCriterion.probability.mostLikely} | ${evalCriterion.probability.pessimistic} | ${evalCriterion.probability.confidence} |`
    );
    lines.push(
      `| Impact | ${evalCriterion.impact.optimistic} | ${evalCriterion.impact.mostLikely} | ${evalCriterion.impact.pessimistic} | ${evalCriterion.impact.confidence} |`
    );
    lines.push(
      `| Frequency | ${evalCriterion.frequency.optimistic} | ${evalCriterion.frequency.mostLikely} | ${evalCriterion.frequency.pessimistic} | ${evalCriterion.frequency.confidence} |`
    );
    lines.push("");

    if (decisionData) {
      lines.push(`**Computed Risk:** ${decisionData.raw_score.toFixed(2)} (weighted: ${decisionData.weighted_score.toFixed(2)})`);
      lines.push("");
    }

    // Reasoning
    lines.push("**Reasoning:**");
    lines.push("");
    lines.push(`- **Probability:** ${evalCriterion.probability.reasoning}`);
    lines.push(`- **Impact:** ${evalCriterion.impact.reasoning}`);
    lines.push(`- **Frequency:** ${evalCriterion.frequency.reasoning}`);
    lines.push("");

    // Suggestions (if available)
    const hasSuggestions = evalCriterion.probability.suggestion || evalCriterion.impact.suggestion || evalCriterion.frequency.suggestion;
    if (hasSuggestions) {
      lines.push("**Suggestions for Improvement:**");
      lines.push("");
      if (evalCriterion.probability.suggestion) {
        lines.push(`- **Probability:** ${evalCriterion.probability.suggestion}`);
      }
      if (evalCriterion.impact.suggestion) {
        lines.push(`- **Impact:** ${evalCriterion.impact.suggestion}`);
      }
      if (evalCriterion.frequency.suggestion) {
        lines.push(`- **Frequency:** ${evalCriterion.frequency.suggestion}`);
      }
      lines.push("");
    }

    lines.push("---");
    lines.push("");
  }

  // Criteria Generation Reasoning
  if (criteria.reasoning) {
    lines.push("## Criteria Weighting Rationale");
    lines.push("");
    lines.push(criteria.reasoning);
    lines.push("");
  }

  return lines.join("\n");
}

function main() {
  const args = parseArgs();

  if (!args.criteria || !args.evaluation || !args.decision) {
    console.error("Usage: node report.js --criteria <path> --evaluation <path> --decision <path> [--out <path>]");
    process.exit(1);
  }

  const criteria = JSON.parse(fs.readFileSync(args.criteria, "utf-8"));
  const evaluation = JSON.parse(fs.readFileSync(args.evaluation, "utf-8"));
  const decision = JSON.parse(fs.readFileSync(args.decision, "utf-8"));

  const markdown = generateMarkdown(criteria, evaluation, decision);
  const outPath = args.out || "report.md";

  fs.writeFileSync(outPath, markdown);
  console.log(`Report written to: ${outPath}`);
}

main();
