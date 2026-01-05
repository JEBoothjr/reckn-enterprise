#!/bin/bash
set -e

OUT_DIR="${1:-./results}"
mkdir -p "$OUT_DIR"

# RESUME
# node generate-criteria.js --source ./sources/job-description.txt --prompt ./prompts/job-description-criteria-prompt.md --key "$CLAUDE_API" --out "$OUT_DIR/criteria.json" --max 7

# # node evaluate.js --source ./sources/resume.txt --criteria "$OUT_DIR/criteria.json" --prompt ./prompts/evaluate-resume-prompt.md --pifc ./pifc/resume_pifc.json --key "$CLAUDE_API" --out "$OUT_DIR/evaluation.json"
# node evaluate.js --source ./sources/resume.txt --criteria "$OUT_DIR/criteria.json" --prompt ./prompts/evaluate-resume-to-improve-prompt.md --pifc ./pifc/resume_pifc.json --key "$CLAUDE_API" --out "$OUT_DIR/evaluation.json"

# node decision.js --evaluation "$OUT_DIR/evaluation.json" --config "./engine/resume-config.json" --out "$OUT_DIR/decision.json"

# node report.js --criteria "$OUT_DIR/criteria.json" --evaluation "$OUT_DIR/evaluation.json" --decision "$OUT_DIR/decision.json" --out "$OUT_DIR/report.md"

# CO-FOUNDER

node evaluate.js --source "$OUT_DIR/profile.txt" --criteria "./sources/cofounder_criteria.json" --prompt ./prompts/evaluate-cofounder-prompt.md --pifc ./pifc/cofounder_pifc.json --key "$CLAUDE_API" --out "$OUT_DIR/evaluation.json"

node decision.js --evaluation "$OUT_DIR/evaluation.json"  --config "./engine/yc-config.json" --out "$OUT_DIR/decision.json"

node report.js --criteria "./sources/cofounder_criteria.json" --evaluation "$OUT_DIR/evaluation.json" --decision "$OUT_DIR/decision.json" --out "$OUT_DIR/report.md"