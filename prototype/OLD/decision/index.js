const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic();

/**
 * Reckn AI Evaluator
 *
 * Takes configuration + candidate document, calls Claude API,
 * returns structured output for the Reckn engine.
 */

const DEFAULT_SCALES = {
  probability: [0.1, 0.2, 0.5, 1, 3, 6, 10],
  impact: [1, 3, 7, 15, 40, 100],
  frequency: [0.5, 1, 2, 3, 6, 10],
  confidence: [0.07, 0.14, 0.21, 0.28, 0.35, 0.42],
};

/**
 * Build the prompt from configuration and candidate document
 */
function buildPrompt(config) {
  const { useCase, criteria, anchors, candidateDocument } = config;

  const criteriaList = criteria
    .map((c) => `- **${c.name}**: ${c.description}`)
    .join("\n");

  const probabilityAnchors = Object.entries(anchors.probability)
    .map(([value, desc]) => `- ${value}: ${desc}`)
    .join("\n");

  const impactAnchors = Object.entries(anchors.impact)
    .map(([value, desc]) => `- ${value}: ${desc}`)
    .join("\n");

  const frequencyAnchors = Object.entries(anchors.frequency)
    .map(([value, desc]) => `- ${value}: ${desc}`)
    .join("\n");

  const confidenceAnchors = Object.entries(anchors.confidence)
    .map(([value, desc]) => `- ${value}: ${desc}`)
    .join("\n");

  return `You are an evaluation engine. Your task is to assess the risk of a candidate failing to meet each criterion based on their resume.

## Context

Use Case: ${useCase}

## Criteria to Evaluate

${criteriaList}

## Dimensions

For EACH criterion, assess all three dimensions: Probability, Impact, and Frequency.
For EACH dimension, provide four values: Optimistic, Most Likely, Pessimistic, and Confidence.

All dimensions are derived from the Candidate Document.

---

### Probability

The likelihood the candidate lacks this criterion based on evidence in their resume.

Scale for Optimistic, Most Likely, Pessimistic (select ONE value each):
${probabilityAnchors}

---

### Impact

The severity of the demonstrated gap. How significant is the absence or weakness of this criterion in the candidate's background?

Scale for Optimistic, Most Likely, Pessimistic (select ONE value each):
${impactAnchors}

---

### Frequency

How consistently this criterion appears (or is absent) across the candidate's experience. A criterion that never appears is higher risk than one that appears occasionally.

Scale for Optimistic, Most Likely, Pessimistic (select ONE value each):
${frequencyAnchors}

---

### Confidence (applies to all dimensions)

For EACH dimension, select ONE confidence value:
${confidenceAnchors}

---

## Candidate Document

<candidate_document>
${candidateDocument}
</candidate_document>

---

## Instructions

For EACH criterion, assess all three dimensions: Probability, Impact, and Frequency.

For EACH dimension, provide four values:
- **Optimistic**: Best reasonable interpretation of the candidate's background
- **Most Likely**: Most probable assessment given stated experience
- **Pessimistic**: Worst reasonable interpretation where evidence is missing or ambiguous
- **Confidence**: How much the resume leaves to inference (lower value = more evidence, higher value = more inference)

You MUST select values from the provided scales. Do not interpolate.

Base your assessment ONLY on what the resume states or clearly implies. If the resume is silent on a criterion, that is itself a signal—assess the risk accordingly.

---

## Output Format

Respond with valid JSON only. No commentary, no markdown code fences.

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
        "reasoning": "One sentence citing evidence from resume"
      },
      "impact": {
        "optimistic": <scale_value>,
        "mostLikely": <scale_value>,
        "pessimistic": <scale_value>,
        "confidence": <confidence_value>,
        "reasoning": "One sentence citing evidence from resume"
      },
      "frequency": {
        "optimistic": <scale_value>,
        "mostLikely": <scale_value>,
        "pessimistic": <scale_value>,
        "confidence": <confidence_value>,
        "reasoning": "One sentence citing evidence from resume"
      }
    }
  ]
}`;
}

/**
 * Validate that output values are within allowed scales
 */
function validateOutput(output, scales = DEFAULT_SCALES) {
  const errors = [];

  for (const criterion of output.criteria) {
    for (const dimension of ["probability", "impact", "frequency"]) {
      const dim = criterion[dimension];
      const scale = scales[dimension];

      for (const field of ["optimistic", "mostLikely", "pessimistic"]) {
        if (!scale.includes(dim[field])) {
          errors.push(
            `${criterion.id}.${dimension}.${field}: ${dim[field]} not in scale [${scale.join(", ")}]`
          );
        }
      }

      if (!scales.confidence.includes(dim.confidence)) {
        errors.push(
          `${criterion.id}.${dimension}.confidence: ${dim.confidence} not in scale [${scales.confidence.join(", ")}]`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Call Claude API and get structured evaluation
 */
async function evaluate(config) {
  const prompt = buildPrompt(config);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.content[0].text;

  // Parse JSON response
  let output;
  try {
    output = JSON.parse(text);
  } catch (e) {
    // Try to extract JSON from response if wrapped in markdown
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      output = JSON.parse(match[0]);
    } else {
      throw new Error(`Failed to parse JSON response: ${text}`);
    }
  }

  // Validate output
  const validation = validateOutput(output);
  if (!validation.valid) {
    console.warn("Validation warnings:", validation.errors);
  }

  // Merge weights from input criteria
  const criteriaWithWeights = output.criteria.map((c) => {
    const inputCriterion = config.criteria.find((ic) => ic.id === c.id);
    return {
      ...c,
      weight: inputCriterion?.weight ?? null,
    };
  });

  return {
    evaluationId: crypto.randomUUID(),
    useCase: config.useCase,
    timestamp: new Date().toISOString(),
    sources: {
      candidateDocument: config.candidateDocumentName || "Candidate Document",
    },
    criteria: criteriaWithWeights,
    validation,
  };
}

module.exports = {
  evaluate,
  buildPrompt,
  validateOutput,
  DEFAULT_SCALES,
};
