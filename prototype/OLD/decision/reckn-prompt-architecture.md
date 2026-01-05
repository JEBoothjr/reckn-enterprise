# Reckn AI Evaluation Prompt Architecture

## Overview

Single-pass system for extracting PERT estimates. AI evaluates all three dimensions for each criterion using the provided documents.

---

## 1. Configuration Schema

```json
{
  "use_case": "hiring_screening",
  
  "scales": {
    "probability": [0.1, 0.2, 0.5, 1, 3, 6, 10],
    "impact": [1, 3, 7, 15, 40, 100],
    "frequency": [0.5, 1, 2, 3, 6, 10],
    "confidence": [0.07, 0.14, 0.21, 0.28, 0.35, 0.42]
  },
  
  "criteria": [
    {
      "id": "stack_knowledge",
      "name": "Stack Knowledge",
      "description": "Proficiency in React, Node.js, and PostgreSQL",
      "weight": 0.45,
      "probability": {
        "optimistic": null,
        "mostLikely": null,
        "pessimistic": null,
        "confidence": null
      },
      "impact": {
        "optimistic": null,
        "mostLikely": null,
        "pessimistic": null,
        "confidence": null
      },
      "frequency": {
        "optimistic": null,
        "mostLikely": null,
        "pessimistic": null,
        "confidence": null
      }
    },
    {
      "id": "system_design",
      "name": "System Design",
      "description": "Ability to architect scalable distributed systems",
      "weight": 0.35,
      "probability": {
        "optimistic": null,
        "mostLikely": null,
        "pessimistic": null,
        "confidence": null
      },
      "impact": {
        "optimistic": null,
        "mostLikely": null,
        "pessimistic": null,
        "confidence": null
      },
      "frequency": {
        "optimistic": null,
        "mostLikely": null,
        "pessimistic": null,
        "confidence": null
      }
    }
  ]
}
```

Anchors are passed separately to the prompt, configured per use case.

---

## 2. Prompt Template

```
You are an evaluation engine. Your task is to assess each criterion across three dimensions using the provided documents.

## Context

Use Case: {{use_case}}

## Criteria to Evaluate

{{#each criteria}}
- **{{name}}**: {{description}}
{{/each}}

## Dimensions

For EACH criterion, assess all three dimensions: Probability, Impact, and Frequency.
For EACH dimension, provide four values: Optimistic, Most Likely, Pessimistic, and Confidence.

---

### Probability

The likelihood the candidate fails to meet this criterion.

Use the **Candidate Document** to assess this dimension.

Scale for Optimistic, Most Likely, Pessimistic (select ONE value each):
{{#each scales.probability.anchors}}
- {{@key}}: {{this}}
{{/each}}

---

### Impact

How damaging is failure on this criterion to success in the role.

Use the **Role Document** to assess this dimension.

Scale for Optimistic, Most Likely, Pessimistic (select ONE value each):
{{#each scales.impact.anchors}}
- {{@key}}: {{this}}
{{/each}}

---

### Frequency

How often this criterion is exercised in the role.

Use the **Role Document** to assess this dimension.

Scale for Optimistic, Most Likely, Pessimistic (select ONE value each):
{{#each scales.frequency.anchors}}
- {{@key}}: {{this}}
{{/each}}

---

### Confidence (applies to all dimensions)

For EACH dimension, select ONE confidence value:
{{#each scales.confidence.anchors}}
- {{@key}}: {{this}}
{{/each}}

---

## Documents

### Role Document

<role_document>
{{role_document}}
</role_document>

### Candidate Document

<candidate_document>
{{candidate_document}}
</candidate_document>

---

## Instructions

For EACH criterion, assess all three dimensions: Probability, Impact, and Frequency.

For EACH dimension, provide four values:
- **Optimistic**: Best reasonable case given the relevant document
- **Most Likely**: Most probable interpretation given the relevant document
- **Pessimistic**: Worst reasonable case given the relevant document
- **Confidence**: How much the document leaves to inference (lower value = more evidence, higher value = more inference)

You MUST select values from the provided scales. Do not interpolate.

Base your assessment ONLY on what the documents state or clearly imply. If a document is silent on a criterion, assign a high confidence value (0.35-0.42) and use the middle of the scale for estimates.

---

## Output Format

Respond with valid JSON only. No commentary.

{
  "criteria": [
    {
      "id": "criterion_id",
      "name": "Criterion Name",
      "probability": {
        "optimistic": <scale_value>,
        "mostLikely": <scale_value>,
        "pessimistic": <scale_value>,
        "confidence": <confidence_value>,
        "reasoning": "One sentence citing evidence from candidate document"
      },
      "impact": {
        "optimistic": <scale_value>,
        "mostLikely": <scale_value>,
        "pessimistic": <scale_value>,
        "confidence": <confidence_value>,
        "reasoning": "One sentence citing evidence from role document"
      },
      "frequency": {
        "optimistic": <scale_value>,
        "mostLikely": <scale_value>,
        "pessimistic": <scale_value>,
        "confidence": <confidence_value>,
        "reasoning": "One sentence citing evidence from role document"
      }
    }
  ]
}
```

---

## 3. Output Schema (For Engine Consumption)

```json
{
  "evaluation_id": "uuid",
  "use_case": "hiring_screening",
  "timestamp": "ISO8601",
  
  "sources": {
    "role_document": "Senior Software Engineer - JD",
    "candidate_document": "john_doe_resume.pdf"
  },
  
  "criteria": [
    {
      "id": "stack_knowledge",
      "name": "Stack Knowledge",
      "weight": 0.45,
      "probability": {
        "optimistic": 0.2,
        "mostLikely": 0.5,
        "pessimistic": 1,
        "confidence": 0.14,
        "reasoning": "Resume lists 4 years React, 3 years Node.js, PostgreSQL mentioned in two projects"
      },
      "impact": {
        "optimistic": 15,
        "mostLikely": 40,
        "pessimistic": 40,
        "confidence": 0.07,
        "reasoning": "JD explicitly states 'must have' and lists stack in first three requirements"
      },
      "frequency": {
        "optimistic": 6,
        "mostLikely": 10,
        "pessimistic": 10,
        "confidence": 0.07,
        "reasoning": "JD describes daily coding in this stack as primary responsibility"
      }
    }
  ]
}
```

---

## 4. Alternate Configuration Example (Job Fit for Candidate)

```json
{
  "use_case": "job_fit_search",
  
  "scales": {
    "probability": [0.1, 0.2, 0.5, 1, 3, 6, 10],
    "impact": [1, 3, 7, 15, 40, 100],
    "frequency": [0.5, 1, 2, 3, 6, 10],
    "confidence": [0.07, 0.14, 0.21, 0.28, 0.35, 0.42]
  },
  
  "criteria": [
    {
      "id": "remote_work",
      "name": "Remote Work",
      "description": "Ability to work remotely full-time",
      "weight": 0.40,
      "probability": {
        "optimistic": null,
        "mostLikely": null,
        "pessimistic": null,
        "confidence": null
      },
      "impact": {
        "optimistic": null,
        "mostLikely": null,
        "pessimistic": null,
        "confidence": null
      },
      "frequency": {
        "optimistic": null,
        "mostLikely": null,
        "pessimistic": null,
        "confidence": null
      }
    }
  ]
}
```

Anchors for job fit use case would be passed separately, e.g.:

```json
{
  "probability": {
    "0.1": "Almost certainly matches my needs",
    "0.2": "Very likely matches my needs",
    "0.5": "Likely matches my needs",
    "1": "Uncertain / mixed signals",
    "3": "Likely does not match my needs",
    "6": "Very likely does not match my needs",
    "10": "Almost certainly does not match my needs"
  }
}
```

---

## 5. Implementation Notes

### Model Selection
- Claude or GPT-4 recommended for nuanced inference
- Structured output mode preferred where available
- Temperature: 0 for consistency

### Validation
- Validate all returned values against allowed scales
- Reject and retry if values are interpolated
- Log reasoning for audit trail

### Edge Cases
- Empty/sparse documents: AI should assign high confidence values (0.35-0.42) to reflect that inference is required
- Conflicting signals: Widen the optimistic/pessimistic spread
- Ambiguous criteria: Prompt should handle via reasoning field

### Token Efficiency
- For many criteria (10+), consider batching into groups of 5
