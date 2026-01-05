# Reck.app MVP Requirements

**Document Version:** 1.0  
**Date:** January 4, 2026  
**Timeline:** 7 days to launch

---

## 1. Product Definition

### What We're Building

A single-page web application that accepts a resume and job description, evaluates the resume against AI-generated criteria using the Reckn engine, and delivers a PDF report with diagnostic feedback and improvement suggestions.

### What We're NOT Building (Yet)

- User accounts
- Saved history
- Multiple verticals (YC applications, home buying, etc.)
- Revision tracking
- Comparison reports
- Mobile app integration
- Admin dashboard

---

## 2. User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE                            │
│                                                                 │
│  [Headline + Value Prop]                                        │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │                     │  │                     │              │
│  │   Paste Resume      │  │  Paste Job Desc     │              │
│  │                     │  │                     │              │
│  │                     │  │                     │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
│  Price: $19                        [Analyze My Resume]          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       STRIPE CHECKOUT                           │
│                                                                 │
│  - Email collection                                             │
│  - Payment processing                                           │
│  - Redirect on success                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PROCESSING PAGE                           │
│                                                                 │
│  "Analyzing your resume..."                                     │
│                                                                 │
│  [Progress indicator]                                           │
│                                                                 │
│  - Generating criteria from job description                     │
│  - Evaluating resume against criteria                           │
│  - Calculating risk scores                                      │
│  - Building your report                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        RESULTS PAGE                             │
│                                                                 │
│  "Your report is ready"                                         │
│                                                                 │
│  [Download PDF]                                                 │
│                                                                 │
│  "A copy has also been sent to your email."                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Page Requirements

### 3.1 Landing Page

**URL:** `https://reck.app`

**Components:**

| Element | Requirement |
|---------|-------------|
| Headline | "Know what matters. Know how to improve." |
| Subhead | One sentence explaining what happens: paste resume + JD, get diagnostic report |
| Resume input | Textarea, placeholder text, minimum 100 characters validation |
| Job description input | Textarea, placeholder text, minimum 100 characters validation |
| Price display | "$19" — visible before submission |
| CTA button | "Analyze My Resume" — disabled until both fields have content |
| Social proof | Optional for MVP, but leave space for testimonials |
| FAQ | 3-5 questions: What do I get? How long does it take? Is my data secure? |
| Footer | Basic links: Privacy, Terms, Contact |

**Validation:**

- Both fields required
- Minimum character count to prevent empty/junk submissions
- Client-side validation before triggering Stripe

**State Management:**

- Store resume + JD in sessionStorage before redirect to Stripe
- Retrieve after successful payment via webhook

---

### 3.2 Processing Page

**URL:** `https://reck.app/processing?session_id={stripe_session_id}`

**Components:**

| Element | Requirement |
|---------|-------------|
| Status heading | "Analyzing your resume..." |
| Progress steps | Visual indication of pipeline stages |
| Estimated time | "This usually takes 30-60 seconds" |
| Error state | If processing fails, show message + support email |

**Behavior:**

- Poll backend every 2-3 seconds for job status
- Or use WebSocket for real-time updates (optional for MVP)
- Redirect to results page when complete

---

### 3.3 Results Page

**URL:** `https://reck.app/report/{report_id}`

**Components:**

| Element | Requirement |
|---------|-------------|
| Success message | "Your report is ready" |
| Download button | Direct link to PDF |
| Email confirmation | "A copy has been sent to {email}" |
| CTA for another analysis | "Analyze another resume" — links back to landing |

**Security:**

- Report URL should be unguessable (UUID)
- Report available for 7 days (or permanent — decide)
- No authentication required (link is the access)

---

## 4. Backend Requirements

### 4.1 API Endpoints

#### `POST /api/checkout`

Creates Stripe checkout session.

**Request:**
```json
{
  "resume": "string (plaintext)",
  "jobDescription": "string (plaintext)"
}
```

**Response:**
```json
{
  "checkoutUrl": "https://checkout.stripe.com/..."
}
```

**Behavior:**
- Validate inputs
- Store resume + JD temporarily (keyed by generated job ID)
- Create Stripe checkout session with job ID in metadata
- Return checkout URL

---

#### `POST /api/webhook/stripe`

Handles Stripe webhook for successful payment.

**Behavior:**
- Verify Stripe signature
- Extract job ID from session metadata
- Retrieve stored resume + JD
- Queue evaluation job
- Store customer email for delivery

---

#### `GET /api/status/{job_id}`

Returns processing status.

**Response:**
```json
{
  "status": "pending | processing | complete | failed",
  "step": "criteria | evaluation | scoring | report",
  "reportId": "string (when complete)"
}
```

---

#### `GET /api/report/{report_id}`

Returns report PDF.

**Response:**
- Content-Type: application/pdf
- Content-Disposition: attachment; filename="reck-report.pdf"

---

### 4.2 Processing Pipeline

```
Input (resume + JD)
       │
       ▼
┌─────────────────────────────────────────┐
│  STEP 1: Generate Criteria              │
│                                         │
│  - Send JD to AI                        │
│  - Extract 5-8 evaluation criteria      │
│  - Generate weights via pairwise logic  │
│  - Define PIFC parameters per criterion │
│                                         │
│  Output: criteria.json                  │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  STEP 2: Evaluate Resume                │
│                                         │
│  - For each criterion:                  │
│    - Send resume + criterion to AI      │
│    - Get P, I, F, C scores              │
│    - Get reasoning (quotes + analysis)  │
│    - Get improvement suggestions        │
│                                         │
│  Output: evaluation.json                │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  STEP 3: Calculate Scores               │
│                                         │
│  - Run Reckn engine                     │
│  - PERT calculation per criterion       │
│  - Weighted aggregation                 │
│  - Final risk score (0-5)               │
│                                         │
│  Output: decision.json                  │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  STEP 4: Generate Report                │
│                                         │
│  - Compile markdown report              │
│  - Convert to styled PDF                │
│  - Store in S3 or equivalent            │
│                                         │
│  Output: report.pdf                     │
└─────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  STEP 5: Deliver                        │
│                                         │
│  - Email PDF to customer                │
│  - Update job status to complete        │
│  - Make report available via URL        │
│                                         │
└─────────────────────────────────────────┘
```

---

### 4.3 AI Prompts Required

#### Prompt 1: Criteria Generation

**Input:** Job description  
**Output:** JSON array of criteria with:
- name
- definition
- weight (or pairwise comparison inputs)
- PIFC calibration (what P, I, F mean in this context)

**Prompt structure:**
```
You are analyzing a job description to extract evaluation criteria.

Job Description:
{job_description}

Extract 5-8 specific, measurable criteria that a candidate must demonstrate.
For each criterion, provide:
1. Name (short)
2. Definition (what evidence would prove this)
3. Relative importance (for weighting)

Return as JSON.
```

---

#### Prompt 2: Resume Evaluation

**Input:** Resume + single criterion  
**Output:** PIFC scores + reasoning + suggestions

**Prompt structure:**
```
You are evaluating a resume against a specific criterion.

Criterion: {criterion_name}
Definition: {criterion_definition}

Resume:
{resume}

Evaluate this resume and provide:

1. Probability (how likely the candidate meets this criterion)
   - Optimistic: [select from 0.1, 0.2, 0.5, 1, 3, 6, 10]
   - Most Likely: [select from 0.1, 0.2, 0.5, 1, 3, 6, 10]
   - Pessimistic: [select from 0.1, 0.2, 0.5, 1, 3, 6, 10]
   - Confidence: [select from 0.07, 0.14, 0.21, 0.28, 0.35, 0.42]

2. Impact (how significant is this criterion for the role)
   - Optimistic: [select from 1, 3, 7, 15, 40, 100]
   - Most Likely: [select from 1, 3, 7, 15, 40, 100]
   - Pessimistic: [select from 1, 3, 7, 15, 40, 100]
   - Confidence: [select from 0.07, 0.14, 0.21, 0.28, 0.35, 0.42]

3. Frequency (how often this criterion matters in the role)
   - Optimistic: [select from 0.5, 1, 2, 3, 6, 10]
   - Most Likely: [select from 0.5, 1, 2, 3, 6, 10]
   - Pessimistic: [select from 0.5, 1, 2, 3, 6, 10]
   - Confidence: [select from 0.07, 0.14, 0.21, 0.28, 0.35, 0.42]

4. Reasoning for each dimension (cite specific quotes from resume)

5. Suggestions for improvement (specific, actionable)

Return as JSON.
```

---

## 5. Infrastructure Requirements

### 5.1 Services Needed

| Service | Purpose | Provider Options |
|---------|---------|------------------|
| Frontend hosting | Static site | Vercel, Cloudflare Pages, S3+CloudFront |
| Backend API | Node.js/TypeScript | Existing AWS setup |
| Database | Job queue, report storage | Existing RDS Postgres |
| File storage | PDF reports | S3 |
| Payment processing | Checkout + webhooks | Stripe |
| Email delivery | Report delivery | SES, SendGrid, Resend |
| AI | Criteria generation, evaluation | OpenAI, Anthropic |

---

### 5.2 Database Schema (Minimal)

```sql
CREATE TABLE evaluation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id VARCHAR(255),
  customer_email VARCHAR(255),
  resume TEXT,
  job_description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  current_step VARCHAR(50),
  criteria_json JSONB,
  evaluation_json JSONB,
  decision_json JSONB,
  report_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_jobs_stripe_session ON evaluation_jobs(stripe_session_id);
CREATE INDEX idx_jobs_status ON evaluation_jobs(status);
```

---

### 5.3 Environment Variables

```
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=

# AI
OPENAI_API_KEY= (or ANTHROPIC_API_KEY)

# AWS
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=
S3_BUCKET_NAME=

# Email
EMAIL_FROM=
SES_REGION= (or SENDGRID_API_KEY)

# App
APP_URL=https://reck.app
DATABASE_URL=
```

---

## 6. PDF Report Specification

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  RECK.APP LOGO                                    Date: Jan 4   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  RESUME EVALUATION REPORT                                       │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  OVERALL SCORE                                                  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Risk Band: 3 - MODERATE                                │   │
│  │  Position in Band: 68%                                  │   │
│  │                                                         │   │
│  │  What this means: [plain language interpretation]       │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  CRITERIA SUMMARY                                               │
│                                                                 │
│  [Table: Criterion | Weight | Score | Status]                   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  DETAILED BREAKDOWN                                             │
│                                                                 │
│  For each criterion:                                            │
│    - Name + Weight                                              │
│    - Definition                                                 │
│    - PIFC table                                                 │
│    - Computed risk score                                        │
│    - Reasoning (with quotes)                                    │
│    - Suggestions for improvement                                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  NEXT STEPS                                                     │
│                                                                 │
│  1. Focus on highest-risk criteria first                        │
│  2. Update resume with suggested improvements                   │
│  3. Re-analyze to measure improvement                           │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Generated by Reck.app | https://reck.app                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### PDF Generation Options

| Library | Pros | Cons |
|---------|------|------|
| Puppeteer | Full HTML/CSS control, exactly matches web rendering | Heavy, slower |
| PDFKit | Lightweight, fast | Manual layout, less flexible styling |
| react-pdf | Good for React-based reports | Learning curve |
| WeasyPrint | CSS-based, good typography | Python dependency |

**Recommendation:** Puppeteer for MVP. Render HTML template, capture as PDF. You can optimize later.

---

## 7. Stripe Integration

### Checkout Flow

1. User clicks "Analyze My Resume"
2. Frontend calls `POST /api/checkout` with resume + JD
3. Backend stores data, creates Stripe Checkout Session
4. User redirects to Stripe-hosted checkout
5. User completes payment
6. Stripe redirects to `https://reck.app/processing?session_id={id}`
7. Stripe sends webhook to `POST /api/webhook/stripe`
8. Backend starts processing pipeline

### Stripe Configuration

```javascript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price: process.env.STRIPE_PRICE_ID,
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${process.env.APP_URL}/processing?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.APP_URL}?canceled=true`,
  metadata: {
    job_id: jobId
  },
  customer_email: undefined, // Let Stripe collect it
});
```

### Webhook Handling

```javascript
app.post('/api/webhook/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const jobId = session.metadata.job_id;
    const email = session.customer_details.email;
    
    // Update job with email, trigger processing
    await startEvaluationPipeline(jobId, email);
  }

  res.json({ received: true });
});
```

---

## 8. Email Delivery

### Transactional Email: Report Delivery

**Subject:** Your Reck.app Resume Analysis is Ready

**Body:**
```
Hi,

Your resume analysis is complete.

[Download Your Report]

Key findings:
- Overall risk score: {score} ({band})
- Strongest area: {top_criterion}
- Area to improve: {weakest_criterion}

Want to improve your score? Update your resume based on the suggestions 
in your report, then analyze again at https://reck.app

Questions? Reply to this email.

— Reck.app
```

**Attachment:** PDF report

---

## 9. Timeline

### Day 1: Foundation
- [ ] Set up Reck.app domain + hosting
- [ ] Create landing page (HTML/CSS, two inputs, button)
- [ ] Set up Stripe account + product/price
- [ ] Create checkout endpoint

### Day 2: Payment Flow
- [ ] Stripe Checkout integration
- [ ] Webhook endpoint
- [ ] Processing page (polling or static)
- [ ] Test full payment flow with test keys

### Day 3: Pipeline
- [ ] Criteria generation prompt + endpoint
- [ ] Resume evaluation prompt + endpoint
- [ ] Integrate with Reckn engine
- [ ] Test end-to-end with sample resume/JD

### Day 4: PDF Generation
- [ ] Design PDF template (HTML)
- [ ] Puppeteer integration
- [ ] S3 upload
- [ ] Download endpoint

### Day 5: Email + Polish
- [ ] Email delivery (SES or SendGrid)
- [ ] Results page with download link
- [ ] Error handling throughout
- [ ] Loading states, edge cases

### Day 6: Testing
- [ ] Full flow testing (payment → report)
- [ ] Test with real resumes/JDs (yours + others)
- [ ] Mobile responsiveness check
- [ ] Stripe live mode configuration

### Day 7: Launch
- [ ] DNS configuration
- [ ] Switch to Stripe live keys
- [ ] Final smoke test
- [ ] Soft launch (share with small audience)

---

## 10. Success Metrics (Week 1-4)

| Metric | Target |
|--------|--------|
| Visitors | Track (no target yet) |
| Checkout initiated | Track conversion from landing |
| Payments completed | Track conversion from checkout |
| Reports delivered | 100% of payments |
| Time to report | < 90 seconds |
| Support requests | Track and categorize |
| Repeat purchases | Track (indicates value) |

---

## 11. Open Questions to Resolve

1. **Pricing:** $19 per report, or different amount?
2. **Report expiration:** Do PDF links expire? 7 days? Never?
3. **Refund policy:** What if someone is unsatisfied?
4. **Rate limiting:** Any limits per IP/email to prevent abuse?
5. **Data retention:** How long do you keep resume/JD data?
6. **Privacy policy:** Need one before accepting payments
7. **Terms of service:** Need one before accepting payments

---

## 12. Post-MVP Roadmap (Not Now)

These are explicitly out of scope for the 7-day MVP but worth tracking:

- User accounts + saved history
- Revision comparison (before/after)
- Multiple verticals (YC, home buying, pitch decks)
- Bulk pricing (5-pack, 10-pack)
- API access for integrations
- White-label for career coaches
- Affiliate program

---

## 13. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| AI generates bad criteria | Test extensively, have fallback templates |
| AI costs too high | Monitor usage, set budget alerts |
| Slow processing time | Show progress, set expectations, optimize prompts |
| Stripe webhook fails | Implement retry logic, manual recovery process |
| PDF generation fails | Fallback to markdown email if needed |
| Low conversion | Iterate on copy, consider lower price point or free sample |

---

## Appendix: Sample Criteria Generation Output

```json
{
  "criteria": [
    {
      "name": "Engineering Leadership Experience",
      "weight": 0.25,
      "definition": "10+ years of engineering experience with 3+ years in engineering leadership roles, specifically managing managers and multiple teams.",
      "pifc_context": {
        "probability": "Likelihood candidate has this experience based on resume evidence",
        "impact": "How critical this criterion is for success in the role",
        "frequency": "How often this skill will be required day-to-day"
      }
    },
    {
      "name": "Technical Architecture Expertise",
      "weight": 0.20,
      "definition": "Deep technical expertise in backend system design or frontend component architecture. Hands-on technical leader capable of driving architectural decisions."
    }
  ],
  "weighting_rationale": "Weights prioritize core leadership requirements (25%) and technical expertise (20%) as these are repeatedly emphasized in the job description."
}
```

---

*End of document.*
