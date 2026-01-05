What the criteria generator does:

Takes JD
Extracts up to N criteria (default 7)
Assigns weights based on JD emphasis (must sum to 1.0)
Outputs descriptions detailed enough to evaluate without the JD
Validates weights sum correctly
Adds null dimension placeholders for engine compatibility


ANTHROPIC_API_KEY=$CLAUDE_API nnpm run generate


ANTHROPIC_API_KEY=$CLAUDE_API npm run pipeline

