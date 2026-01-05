# Reckn AI Evaluator - Project Context

## Overview

Reckn is a decision-making engine that uses PERT methodology with three-point estimation. This prototype extends it to automated hiring screening.

## How Reckn Works

1. User defines criteria (factors) for a decision
2. Criteria are weighted via pairwise comparison (0-1 float, sum to 1.0)
3. Each criterion is evaluated on three dimensions:
   - **Probability**: Likelihood of risk
   - **Impact**: Severity if risk occurs  
   - **Frequency**: How often the risk applies
4. Each dimension has four values:
   - **Optimistic**: Best case
   - **Most Likely**: Probable case
   - **Pessimistic**: Worst case
   - **Confidence**: How much evidence exists (lower = more evidence)
5. Engine uses PERT/Statistical PERT to calculate final 0-5 risk score

## Scales (Fixed)

```javascript
probability: [0.1, 0.2, 0.5, 1, 3, 6, 10]
impact: [1, 3, 7, 15, 40, 100]
frequency: [0.5, 1, 2, 3, 6, 10]
confidence: [0.07, 0.14, 0.21, 0.28, 0.35, 0.42]
```

## Risk Framing

- **Low values = low risk** (candidate likely meets criterion)
- **High values = high risk** (candidate likely doesn't meet criterion)
- All three dimensions are derived from the resume, not the job description
- Weight (from pairwise comparison) determines how much each criterion matters

## Hiring Use Case Flow

```
Step 1: JD → generate-criteria.js → criteria.json (with weights)
Step 2: Resume + criteria.json → evaluate.js → evaluation.json (with PIF scores)
Step 3: evaluation.json → Reckn Engine → Final 0-5 risk score
```

## Key Architecture Decisions

1. **JD is only used for criteria generation** - not needed at evaluation time
2. **All PIF dimensions come from resume** - originally I built it wrong with Impact/Frequency from JD
3. **Weights pass through** - AI doesn't set weights, they come from criteria.json
4. **Citation requirement** - Claude must quote exact resume text to prevent hallucinated assessments
5. **Exact IDs required** - Claude must use the exact criterion ID from criteria.json

## Current Files

### generate-criteria.js
- CLI: `node generate-criteria.js --jd <path> --key <api-key> [--out <path>] [--max <number>]`
- Takes JD, outputs criteria.json with weighted criteria
- Validates weights sum to 1.0

### evaluate.js  
- CLI: `node evaluate.js --resume <path> --criteria <path> --key <api-key> [--out <path>]`
- Takes resume + criteria, outputs evaluation.json with PIF scores
- Merges weights from criteria into output
- **Prompt is currently hardcoded in buildPrompt() function**

## Output Schema (for Reckn engine)

```json
{
  "evaluationId": "uuid",
  "timestamp": "ISO8601",
  "sources": {
    "resume": "path",
    "criteria": "path"
  },
  "criteria": [
    {
      "id": "engineering_leadership_experience",
      "name": "Engineering Leadership Experience",
      "weight": 0.25,
      "probability": {
        "optimistic": 0.1,
        "mostLikely": 0.2,
        "pessimistic": 0.5,
        "confidence": 0.21,
        "reasoning": "Quote: '[text from resume]' - explanation"
      },
      "impact": { ... },
      "frequency": { ... }
    }
  ]
}
```

## Anchors (Configurable per use case)

Anchors are the human-readable descriptions for each scale value. They vary by use case:

### Hiring Screening Anchors
```javascript
const DEFAULT_ANCHORS = {
  probability: {
    0.1: "Almost certainly meets criterion",
    0.2: "Very likely meets criterion",
    0.5: "Likely meets criterion",
    1: "Uncertain / mixed signals",
    3: "Likely does not meet criterion",
    6: "Very likely does not meet criterion",
    10: "Almost certainly does not meet criterion",
  },
  impact: {
    1: "Trivial gap, negligible weakness",
    3: "Minor gap, small weakness",
    7: "Moderate gap, notable weakness",
    15: "Significant gap, concerning weakness",
    40: "Major gap, serious weakness",
    100: "Complete gap, no evidence at all",
  },
  frequency: {
    0.5: "Core theme across all experience",
    1: "Demonstrated consistently throughout career",
    2: "Demonstrated in multiple roles",
    3: "Demonstrated in some roles",
    6: "Demonstrated rarely or once",
    10: "Never demonstrated in experience",
  },
  confidence: {
    0.07: "Explicit, unambiguous evidence",
    0.14: "Strong evidence with minor inference",
    0.21: "Good evidence, some gaps",
    0.28: "Partial evidence, notable inference",
    0.35: "Limited evidence, significant inference",
    0.42: "Minimal evidence, mostly inference",
  },
};
```

## Critical Prompt Requirements

1. **Citation requirement**: Claude must quote exact text from resume before scoring
2. **Exact IDs**: Claude must use criterion IDs exactly as provided
3. **Scale enforcement**: Values must come from scale, no interpolation
4. **JSON only**: No markdown, no commentary

## Current Task

**Extract the prompt from evaluate.js into a separate dynamic file.**

The prompt is currently hardcoded in the `buildPrompt()` function. It should be:
- In a separate file (e.g., `prompts/evaluate.txt` or `prompts/evaluate.js`)
- Dynamically loaded
- Easy to modify without changing code
- Potentially configurable per use case

## Future Considerations

1. **Candidate-facing flip**: Same engine can evaluate jobs against a candidate's criteria
2. **Non-determinism**: Temperature 0 helps but doesn't eliminate variance
3. **Enterprise features**: Audit trails, explainability, compliance (NYC Local Law 144, EU AI Act)
4. **Other verticals**: Vendor selection, investment screening, procurement

## Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.39.0"
}
```

## Usage

```bash
npm install

# Generate criteria from JD
node generate-criteria.js --jd ./samples/job-description.txt --key sk-ant-xxx

# Evaluate resume against criteria
node evaluate.js --resume ./samples/resume.txt --criteria ./criteria.json --key sk-ant-xxx
```