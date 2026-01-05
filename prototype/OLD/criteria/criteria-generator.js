const Anthropic = require("@anthropic-ai/sdk/index.mjs");

const client = new Anthropic();

/**
 * Reckn Criteria Generator
 *
 * Takes a job description, extracts weighted criteria
 * for use in candidate evaluation.
 */

/**
 * Build the prompt for criteria generation
 */
function buildPrompt(config) {
  const { jobDescription, maxCriteria = 7 } = config;

  return `You are a criteria extraction engine. Your task is to analyze a job description and extract the key criteria a candidate must meet, along with relative weights.

## Job Description

<job_description>
${jobDescription}
</job_description>

## Instructions

Extract ${maxCriteria} or fewer criteria from the job description. Focus on:
- Skills and competencies explicitly required
- Experience levels and types needed
- Leadership or management expectations
- Technical proficiencies
- Soft skills emphasized

For each criterion:
1. **id**: A short snake_case identifier
2. **name**: A clear, concise name (2-4 words)
3. **description**: A detailed description capturing what the JD requires. Include specific requirements, years of experience, technologies, or qualifications mentioned. This description must be detailed enough to evaluate a resume without referring back to the JD.
4. **weight**: A value between 0 and 1 representing relative importance

## Weighting Rules

- Weights must sum to 1.0
- Weight based on emphasis in the JD: requirements listed first, repeated, or marked "must have" get higher weight
- Differentiate clearly: don't give everything equal weight
- Core role functions > nice-to-haves

## Output Format

Respond with valid JSON only. No commentary, no markdown code fences.

{
  "criteria": [
    {
      "id": "example_criterion",
      "name": "Example Criterion",
      "description": "Detailed description capturing the specific requirements from the JD...",
      "weight": 0.25
    }
  ],
  "reasoning": "Brief explanation of how weights were assigned based on JD emphasis"
}`;
}

/**
 * Validate criteria output
 */
function validateCriteria(output) {
  const errors = [];

  if (!output.criteria || !Array.isArray(output.criteria)) {
    errors.push("Missing or invalid criteria array");
    return { valid: false, errors };
  }

  let totalWeight = 0;

  for (const criterion of output.criteria) {
    if (!criterion.id) errors.push("Criterion missing id");
    if (!criterion.name) errors.push("Criterion missing name");
    if (!criterion.description) errors.push("Criterion missing description");
    if (typeof criterion.weight !== "number") {
      errors.push(`Criterion ${criterion.id} missing weight`);
    } else if (criterion.weight < 0 || criterion.weight > 1) {
      errors.push(`Criterion ${criterion.id} weight out of range: ${criterion.weight}`);
    } else {
      totalWeight += criterion.weight;
    }
  }

  // Allow small floating point variance
  if (Math.abs(totalWeight - 1.0) > 0.01) {
    errors.push(`Weights sum to ${totalWeight.toFixed(3)}, expected 1.0`);
  }

  return {
    valid: errors.length === 0,
    errors,
    totalWeight,
  };
}

/**
 * Generate criteria from job description
 */
async function generateCriteria(config) {
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
  const validation = validateCriteria(output);
  if (!validation.valid) {
    console.warn("Validation warnings:", validation.errors);
  }

  // Add null dimension values for engine compatibility
  const criteriaWithDimensions = output.criteria.map((c) => ({
    ...c,
    probability: {
      optimistic: null,
      mostLikely: null,
      pessimistic: null,
      confidence: null,
    },
    impact: {
      optimistic: null,
      mostLikely: null,
      pessimistic: null,
      confidence: null,
    },
    frequency: {
      optimistic: null,
      mostLikely: null,
      pessimistic: null,
      confidence: null,
    },
  }));

  return {
    generationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    criteria: criteriaWithDimensions,
    reasoning: output.reasoning,
    validation,
  };
}

module.exports = {
  generateCriteria,
  buildPrompt,
  validateCriteria,
};
