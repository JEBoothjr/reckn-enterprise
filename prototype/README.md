# Reckn Prototype

A decision engine that uses PERT methodology to evaluate anything against weighted criteria.

## What Is This?

Reckn helps you make better decisions by forcing you to be specific about what matters.

Instead of gut feelings, you define criteria ("what do I actually care about?"), weight them ("how much does each thing matter?"), and then evaluate candidates against those criteria with evidence.

The result is a risk score from 1-5. Low score = good fit. High score = concerns.

### Example: Hiring

You have a job to fill. Instead of reading resumes and going with your gut:

1. You define what matters for this role (e.g., "can lead a team", "has shipped products", "knows our tech stack")
2. You weight each criterion (leadership 30%, shipping 25%, tech 20%, etc.)
3. AI reads the resume and scores each criterion based on actual evidence it finds
4. You get a report showing where the candidate is strong, where they're weak, and why

### Example: Finding a Cofounder

You're looking for a cofounder. Instead of vibes:

1. You define what you need (trust, shared vision, can sell, figures things out, etc.)
2. You weight them based on what matters most to you
3. You feed in their LinkedIn/bio/notes from conversations
4. You get a structured assessment of fit with reasoning

### Why This Works

- **Forces specificity**: You can't evaluate against vague criteria
- **Reduces bias**: AI looks at evidence, not gut feelings
- **Shows reasoning**: Every score comes with quoted evidence
- **Separable concerns**: Weights are yours, scoring is AI's job

---

## How It Works (Technical)

1. **Define criteria** with weights (sum to 1.0)
2. **Evaluate a source** (resume, profile, etc.) against each criterion
3. **Score each criterion** on three dimensions: Probability, Impact, Frequency
4. **Compute a decision** using the Reckn engine (0-5 risk band)
5. **Generate a report** in markdown

## Pipeline

```
Source + Criteria → evaluate.js → evaluation.json → decision.js → decision.json → report.js → report.md
```

## Setup

```bash
npm install
export CLAUDE_API="sk-ant-..."
```

## Quick Start

```bash
./run.sh ./results/my-eval
```

This runs the full pipeline and outputs to `./results/my-eval/`.

## Scripts

### generate-criteria.js

Generate weighted criteria from a source document (e.g., job description).

```bash
node generate-criteria.js \
  --source <path> \
  --prompt <path> \
  --key "$CLAUDE_API" \
  --out <path> \
  --max <number>
```

| Argument | Required | Description |
|----------|----------|-------------|
| --source | Yes | Source document (job description, etc.) |
| --prompt | Yes | Prompt template file |
| --key | Yes | Anthropic API key |
| --out | No | Output path (default: criteria.json) |
| --max | No | Max criteria (default: 7) |

### evaluate.js

Evaluate a source against criteria using AI.

```bash
node evaluate.js \
  --source <path> \
  --criteria <path> \
  --prompt <path> \
  --pifc <path> \
  --key "$CLAUDE_API" \
  --out <path>
```

| Argument | Required | Description |
|----------|----------|-------------|
| --source | Yes | Source to evaluate (resume, profile, etc.) |
| --criteria | Yes | Criteria JSON file |
| --prompt | Yes | Prompt template file |
| --pifc | Yes | PIFC values/anchors file |
| --key | Yes | Anthropic API key |
| --out | No | Output path (default: evaluation.json) |

### decision.js

Compute final risk score from evaluation.

```bash
node decision.js \
  --evaluation <path> \
  --out <path>
```

### report.js

Generate markdown report from all outputs.

```bash
node report.js \
  --criteria <path> \
  --evaluation <path> \
  --decision <path> \
  --out <path>
```

## File Structure

```
prototype/
├── sources/              # Input documents
│   ├── job-description.txt
│   ├── resume.txt
│   └── cofounder_criteria.json
├── prompts/              # Prompt templates
│   ├── evaluate-resume-prompt.md
│   ├── evaluate-cofounder-prompt.md
│   └── job-description-criteria-prompt.md
├── pifc/                 # PIFC value anchors
│   ├── resume_pifc.json
│   └── cofounder_pifc.json
├── results/              # Output directory
└── run.sh                # Pipeline script
```

## Use Cases

### Resume Evaluation

Evaluate a candidate's resume against job criteria:

```bash
node generate-criteria.js --source ./sources/job-description.txt --prompt ./prompts/job-description-criteria-prompt.md --key "$CLAUDE_API" --out ./results/criteria.json

node evaluate.js --source ./sources/resume.txt --criteria ./results/criteria.json --prompt ./prompts/evaluate-resume-prompt.md --pifc ./pifc/resume_pifc.json --key "$CLAUDE_API" --out ./results/evaluation.json

node decision.js --evaluation ./results/evaluation.json --out ./results/decision.json

node report.js --criteria ./results/criteria.json --evaluation ./results/evaluation.json --decision ./results/decision.json --out ./results/report.md
```

### Cofounder Evaluation

Evaluate a potential cofounder against predefined criteria:

```bash
node evaluate.js --source ./results/profile.txt --criteria ./sources/cofounder_criteria.json --prompt ./prompts/evaluate-cofounder-prompt.md --pifc ./pifc/cofounder_pifc.json --key "$CLAUDE_API" --out ./results/evaluation.json

node decision.js --evaluation ./results/evaluation.json --out ./results/decision.json

node report.js --criteria ./sources/cofounder_criteria.json --evaluation ./results/evaluation.json --decision ./results/decision.json --out ./results/report.md
```

## PIFC Dimensions

Each criterion is scored on three dimensions:

- **Probability**: Likelihood of a gap (0.1 = low risk, 10 = high risk)
- **Impact**: Severity if gap exists (1 = minor, 100 = critical)
- **Frequency**: How consistently demonstrated (0.5 = always, 10 = never)

Each dimension has four values:
- **Optimistic**: Best case interpretation
- **Most Likely**: Probable assessment
- **Pessimistic**: Worst case interpretation
- **Confidence**: How much is inference vs evidence (0.07 = solid evidence, 0.42 = mostly guessing)

## Output: Risk Bands

The engine produces a 1-5 risk band:

| Band | Label | Meaning |
|------|-------|---------|
| 1 | Very Low Risk | Strong fit |
| 2 | Low Risk | Good fit |
| 3 | Moderate Risk | Some concerns |
| 4 | High Risk | Significant concerns |
| 5 | Very High Risk | Poor fit |
