# Reckn MVP — One-Week Execution Plan

> **Purpose**: Define the *minimum viable product* required to validate Reckn as a paid, artifact-alignment engine.
> **Non-goal**: This is not a roadmap, not a vision doc, and not a feature backlog. This is a falsification-focused build plan.

---

## 1. MVP Definition (Hard Boundary)

### MVP Statement

> **A user submits a single artifact against a predefined vertical template, pays once, and receives a defensible evaluation report they would reasonably pay for.**

If a requirement does not directly support this statement, it is out of scope.

### Explicitly Out of Scope (Week 1)

* User accounts / authentication
* Saved history or projects
* Dashboards or analytics
* Custom criteria editing
* Side-by-side comparisons
* Collaboration or sharing
* Subscriptions or plans
* Notifications or emails (beyond receipt)

---

## 2. Supported Use Case (MVP Scope)

### Primary Vertical (Required)

**Resume vs Job Description**

* Artifact: Resume (text or PDF)
* Context: Job description provided by user
* Evaluator model: Hiring manager / technical leadership role
* Outcome: Risk-based evaluation of how well the resume communicates evidence for the job’s stated expectations

### Secondary Vertical (Optional, Only if Time Allows)

**YC Application Draft**

Only include if the primary vertical is fully complete and stable.

---

## 3. User Flow (End-to-End)

### Step 1: Artifact Input

* User pastes text **or** uploads a document (PDF/DOC/TXT)
* For resumes:

  * Resume content (required)
  * Job description content (required)

No formatting controls. No previews beyond basic text confirmation.

---

### Step 2: Vertical Selection

* Single dropdown or radio selector
* Default selected: *Resume Evaluation*
* No customization of criteria or weights in MVP

---

### Step 3: Pre-Payment Confirmation

User must see:

* What will be evaluated (artifact type)
* What they will receive (evaluation report)
* Price (single fixed price)

**No evaluation runs before payment.**

---

### Step 4: Payment

* One-time payment
* No coupons, no plans, no upsells in MVP
* Payment success triggers evaluation pipeline

---

### Step 5: Evaluation Pipeline Execution

Pipeline (already conceptually defined):

```
Artifact + Template
→ Evidence Extraction
→ Criterion-level PIFC Scoring
→ Risk Aggregation Engine
→ Report Generation
```

**Hard requirement:**
Every score must map to either:

* Quoted evidence, or
* Explicitly stated “insufficient evidence”

---

### Step 6: Report Delivery

* Report rendered as:

  * Markdown (acceptable for MVP)
  * PDF (preferred if trivial to generate)
* Immediate download
* No storage guarantee

---

## 4. Evaluation Model Requirements

### Criteria System

For the Resume vertical:

* Fixed, predefined criteria set
* Fixed weighting (sums to 1.0)
* Each criterion includes:

  * Name
  * Definition (what is being evaluated)
  * Failure semantics (what risk looks like)

No user editing of criteria in MVP.

---

### PIFC Dimensions

Each criterion is scored on:

* **Probability** – likelihood the risk manifests given the artifact
* **Impact** – severity if the risk manifests
* **Frequency** – how often the risk condition appears or is implied
* **Confidence** – certainty of the assessment

PIFC scales are **vertical-specific and fixed**.

---

### Engine Requirements

* Deterministic aggregation
* Produces:

  * Per-criterion risk score
  * Weighted contribution
  * Final risk band (1–5)

No stochastic variability exposed to user.

---

## 5. Report Requirements (MVP Cut)

### Required Sections

1. **Final Risk Summary**

   * Risk band (1–5)
   * Short explanation of what the band means

2. **Criteria Summary Table**

   * Criterion name
   * Weight
   * Risk contribution

3. **Per-Criterion Detail**
   For each criterion:

   * Definition
   * Risk score
   * Reasoning

     * Quoted evidence or explicit gaps
   * Suggestions for improvement

---

### Explicitly Optional / Cut for MVP

* Raw math breakdown
* Engine versioning
* Position-within-band percentages
* Full PIFC tables
* Visual charts

Depth can exist internally, but does not need to be user-visible in week one.

---

## 6. Pricing (MVP Constraint)

### Pricing Model

* **$25 per evaluation**
* One artifact = one payment = one report

No free tier. No trials. No credits.

### Rationale

* Competes with human review, not AI tools
* Prices risk reduction, not usage
* Enables fast falsification

---

## 7. Trust & Safety Constraints (Conceptual)

The system must adhere to these invariants:

* Evaluates **artifacts**, not people
* Assesses **communication of evidence**, not truth of claims
* Makes **no hiring, acceptance, or rejection decisions**
* Produces advisory output only

These are product constraints, not marketing claims.

---

## 8. Success Criteria (One-Week Test)

The MVP is considered successful if **any one** of the following occurs:

* A user pays without requesting a refund
* A user re-runs after making changes
* A user states the report explained a rejection or weakness clearly
* A user applies it to a second artifact voluntarily

If none occur, reassess positioning — not features.

---

## 9. Build Prioritization Order

1. Resume vertical template (criteria + weights)
2. Evidence extraction + scoring reliability
3. Report clarity and actionability
4. Payment flow
5. Minimal UI

Everything else is optional.

---

## 10. Final Constraint

This MVP must feel:

* Serious
* Precise
* Slightly uncomfortable

If it feels friendly, magical, or reassuring, it is too soft.

---

**End of MVP Plan**
