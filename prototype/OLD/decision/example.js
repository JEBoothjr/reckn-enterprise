const { evaluate } = require("./index");

const { computeDecision } = require("./engine.js")

/**
 * Example: Hiring Screening
 */
async function main() {
  const config = {
    useCase: "hiring_screening",

    criteria: [
      {
        id: "stack_knowledge",
        name: "Stack Knowledge",
        description: "Proficiency in React, Node.js, and PostgreSQL",
        weight: 0.45,
      },
      {
        id: "system_design",
        name: "System Design",
        description: "Ability to architect scalable distributed systems",
        weight: 0.35,
      },
      {
        id: "communication",
        name: "Communication",
        description: "Clear written and verbal communication skills",
        weight: 0.20,
      },
    ],

    anchors: {
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
    },

    candidateDocumentName: "john_doe_resume.pdf",
    candidateDocument: `
John Doe
Senior Software Developer

Summary:
Experienced software developer with 6 years of experience building web applications. Passionate about clean code and scalable architecture.

Experience:

Tech Corp (2020 - Present)
Senior Developer
- Built and maintained React-based dashboard serving 50,000 daily users
- Designed microservices architecture handling 1M+ daily transactions
- Led migration from MongoDB to PostgreSQL, improving query performance by 40%
- Mentored team of 3 junior developers

StartupXYZ (2018 - 2020)
Full Stack Developer
- Developed Node.js APIs for mobile and web clients
- Implemented real-time features using WebSockets
- Worked with AWS (EC2, S3, Lambda, RDS)

Skills:
- Languages: JavaScript, TypeScript, Python
- Frontend: React, Redux, Next.js
- Backend: Node.js, Express, NestJS
- Databases: PostgreSQL, MongoDB, Redis
- Cloud: AWS (EC2, S3, Lambda, RDS, CloudFront)
- Tools: Docker, Kubernetes, GitHub Actions

Education:
BS Computer Science, State University (2018)
    `,
  };

  console.log("Evaluating candidate...\n");

  try {
    const result = await evaluate(config);

    console.log("=== EVALUATION RESULT ===\n");
    console.log(JSON.stringify(result, null, 2));

    console.log("=== DECISION RESULT ===\n");
    const decision = computeDecision(result.criteria);

    if (!result.validation.valid) {
      console.log("\n=== VALIDATION ERRORS ===");
      result.validation.errors.forEach((e) => console.log(`- ${e}`));
    }
  } catch (error) {
    console.error("Evaluation failed:", error);
  }
}

main();
