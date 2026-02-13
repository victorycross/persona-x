# Persona-x Decision Engine

## Using Persona-x to Decide What to Build with Persona-x

### Purpose

This document defines a structured, repeatable decision pipeline for evaluating, challenging, prototyping, and executing on opportunities to apply Persona-x to important problems. It is itself a Persona-x artefact — every stage is driven by a purpose-built panel with calibrated rubric scores, defined failure modes, and explicit gating criteria.

The engine exists to answer one question with confidence and auditability:

> **"Should we build this, and if so, how?"**

It replaces gut-feel prioritisation with structured adversarial challenge at every decision point.

---

## How the Engine Works

```
                    ┌─────────────────────────────────────────────┐
                    │          OPPORTUNITY INTAKE                  │
                    │   Raw idea, market signal, user request      │
                    └──────────────────┬──────────────────────────┘
                                       │
                                       ▼
                    ┌─────────────────────────────────────────────┐
                    │          STAGE 1: PROPOSE                   │
                    │   Structure the opportunity                 │
                    │   Panel: 4 personas, 2 rounds               │
                    │   Output: Scored Opportunity Brief           │
                    │   Gate: ≥ 7/10 combined viability            │
                    └──────────────────┬──────────────────────────┘
                                       │ PASS
                                       ▼
                    ┌─────────────────────────────────────────────┐
                    │          STAGE 2: CHALLENGE                 │
                    │   Stress-test every assumption              │
                    │   Panel: 4 personas, 3 rounds               │
                    │   Output: Challenge Report                  │
                    │   Gate: No unmitigated critical risks        │
                    └──────────────────┬──────────────────────────┘
                                       │ PASS
                                       ▼
                    ┌─────────────────────────────────────────────┐
                    │          STAGE 3: PROTOTYPE                 │
                    │   Design the minimum viable version         │
                    │   Panel: 4 personas, 2 rounds               │
                    │   Output: Prototype Specification            │
                    │   Gate: Build cost < 20% projected Year 1   │
                    └──────────────────┬──────────────────────────┘
                                       │ PASS
                                       ▼
                    ┌─────────────────────────────────────────────┐
                    │          STAGE 4: EXECUTE                   │
                    │   Plan delivery and launch                  │
                    │   Panel: 4 personas, 3 rounds               │
                    │   Output: Delivery Plan + Go/No-Go Decision │
                    │   Gate: Human decision-maker approval        │
                    └──────────────────┬──────────────────────────┘
                                       │ APPROVED
                                       ▼
                    ┌─────────────────────────────────────────────┐
                    │          BUILD & LAUNCH                     │
                    │   Execute against delivery plan              │
                    │   Feedback loop → recalibrate engine         │
                    └─────────────────────────────────────────────┘
```

### Design Principles

1. **Every stage has a panel.** No stage relies on a single perspective.
2. **Every panel has deliberate tension.** At least two personas must hold opposing rubric positions on the dimension most critical to that stage.
3. **Every stage has a gate.** Opportunities that do not pass are killed, deferred, or returned to a prior stage with specific questions to resolve.
4. **Every gate is quantified.** No "feels right" decisions. Scores, thresholds, and explicit criteria.
5. **The engine is auditable.** Every decision produces a traceable artefact showing which personas raised which concerns and how they were resolved.
6. **Society matters.** Societal benefit is scored as a first-class dimension, not an afterthought.

---

## Evaluation Dimensions

Every opportunity is scored across six dimensions. These are distinct from the persona rubric — they measure the *opportunity*, not the *persona*.

| # | Dimension | What It Measures | Scale |
|---|---|---|---|
| 1 | **Problem Severity** | How painful is this problem for those who face it? | 1–10 |
| 2 | **Societal Benefit** | Does solving this make the world measurably better? | 1–10 |
| 3 | **Market Viability** | Can this sustain a business? Is there a buyer with budget? | 1–10 |
| 4 | **Persona-x Fit** | Does multi-perspective adversarial challenge genuinely solve this better than alternatives? | 1–10 |
| 5 | **Defensibility** | Can others replicate this easily, or does Persona-x create structural advantage? | 1–10 |
| 6 | **Execution Complexity** | How hard is this to build and deliver? (Inverted: 10 = simple) | 1–10 |

**Composite Score** = weighted average:
- Problem Severity: 20%
- Societal Benefit: 20%
- Market Viability: 20%
- Persona-x Fit: 20%
- Defensibility: 10%
- Execution Complexity: 10%

**Minimum threshold to proceed past Stage 1:** 7.0 / 10.0

---

## Stage 1: PROPOSE

### Purpose

Take a raw opportunity — a market signal, a user request, an unsolved problem — and structure it into a scored, comparable Opportunity Brief. This stage answers: *"Is this worth investigating further?"*

### Panel: The Opportunity Structuring Panel

#### 1. Opportunity Architect

| Field | Value |
|---|---|
| **Role** | Frames the opportunity as a structured proposition |
| **Contribution Type** | Integrator |
| **Expected Value** | Translates vague ideas into testable value propositions |
| **Failure Modes Surfaced** | Poorly defined problems, solutions looking for problems, scope that is too broad to execute |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 7 | Willing to explore unproven markets if the problem signal is strong |
| Evidence Threshold | 5 | Accepts directional evidence at this early stage; does not demand proof |
| Tolerance for Ambiguity | 8 | Comfortable shaping unclear opportunities; thrives in ambiguity |
| Intervention Frequency | 8 | Actively reframes and restructures throughout the discussion |
| Escalation Bias | 3 | Resolves framing issues directly rather than flagging them |
| Delivery vs Rigour | 7 | Favours momentum; a structured-enough brief is better than a perfect one |

**Boundaries:** Will not assess financial viability in detail. Will not validate technical feasibility. Defers to Market Realist on commercial questions.

---

#### 2. Market Realist

| Field | Value |
|---|---|
| **Role** | Tests whether a real buyer exists with real budget |
| **Contribution Type** | Challenger |
| **Expected Value** | Prevents investment in problems nobody will pay to solve |
| **Failure Modes Surfaced** | Imagined markets, willingness-to-pay assumptions, "everyone needs this" thinking |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 3 | Sceptical of unproven demand; needs evidence of buyer intent |
| Evidence Threshold | 8 | Demands market signals — competitor activity, search volume, direct requests |
| Tolerance for Ambiguity | 4 | Uncomfortable with "the market will emerge" narratives |
| Intervention Frequency | 7 | Challenges market assumptions consistently but picks moments |
| Escalation Bias | 5 | Raises concerns directly; escalates only when market risk is existential |
| Delivery vs Rigour | 4 | Would rather get the market analysis right than move fast on bad data |

**Boundaries:** Will not assess societal impact. Will not evaluate technical architecture. Defers to Societal Impact Assessor on benefit claims.

---

#### 3. Societal Impact Assessor

| Field | Value |
|---|---|
| **Role** | Evaluates whether the opportunity genuinely helps people |
| **Contribution Type** | Sense-checker |
| **Expected Value** | Ensures opportunities create real benefit, not just profit |
| **Failure Modes Surfaced** | Extractive business models disguised as helpful, harm to vulnerable populations, equity blind spots, ethics washing |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 4 | Cautious about opportunities that could cause unintended harm |
| Evidence Threshold | 7 | Needs clear articulation of who benefits and how; rejects vague "helps people" claims |
| Tolerance for Ambiguity | 5 | Accepts some uncertainty but insists on explicit harm-avoidance thinking |
| Intervention Frequency | 6 | Intervenes when benefit claims are unsupported or harm risks are unaddressed |
| Escalation Bias | 7 | Escalates when an opportunity could cause harm to vulnerable groups |
| Delivery vs Rigour | 3 | Will slow down or stop an opportunity that cannot demonstrate genuine benefit |

**Boundaries:** Will not assess market size or revenue potential. Will not evaluate technical implementation. Defers to Market Realist on commercial viability.

---

#### 4. Technical Feasibility Analyst

| Field | Value |
|---|---|
| **Role** | Assesses whether Persona-x can actually deliver this |
| **Contribution Type** | Challenger |
| **Expected Value** | Catches ideas that sound good but cannot be built with the framework's capabilities |
| **Failure Modes Surfaced** | Over-promising on AI capabilities, ignoring infrastructure requirements, underestimating persona design complexity |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 4 | Conservative about what can be delivered; has seen "easy" projects fail |
| Evidence Threshold | 7 | Needs concrete understanding of required personas, panel mechanics, and integration points |
| Tolerance for Ambiguity | 3 | Wants specific answers about what exactly gets built |
| Intervention Frequency | 6 | Speaks when technical assumptions are wrong; stays quiet on market/impact discussion |
| Escalation Bias | 4 | Resolves technical concerns by proposing alternatives rather than flagging blockers |
| Delivery vs Rigour | 6 | Practical; will accept a workable solution over a perfect architecture |

**Boundaries:** Will not evaluate market demand. Will not assess societal benefit. Defers to Opportunity Architect on problem framing.

---

### Stage 1 Process

| Step | Action |
|---|---|
| **Input** | Raw opportunity description (1-3 paragraphs) |
| **Round 1** | Each persona evaluates the opportunity from their perspective. Opportunity Architect structures the value proposition. Market Realist challenges the buyer assumption. Societal Impact Assessor evaluates the benefit claim. Technical Feasibility Analyst assesses buildability. |
| **Round 2** | Personas respond to each other's concerns. Opportunity Architect synthesises into a scored brief. |
| **Output** | Opportunity Brief with scores on all 6 evaluation dimensions |

### Stage 1 Gate

| Criterion | Threshold | Action if Failed |
|---|---|---|
| Composite score | ≥ 7.0 / 10.0 | Kill or defer |
| Societal Benefit | ≥ 5 / 10 | Kill — we do not build extractive solutions |
| Persona-x Fit | ≥ 6 / 10 | Defer — problem is real but Persona-x is not the right tool |
| Any dimension | ≤ 2 / 10 | Requires explicit justification to proceed |

### Stage 1 Output Artefact: Opportunity Brief

```yaml
opportunity:
  title: "[Short descriptive title]"
  problem_statement: "[Who has this problem, why it matters, what happens if unsolved]"
  proposed_solution: "[How Persona-x addresses this]"
  target_buyer: "[Specific buyer profile with budget authority]"

scores:
  problem_severity: { score: 0, note: "" }
  societal_benefit: { score: 0, note: "" }
  market_viability: { score: 0, note: "" }
  persona_x_fit: { score: 0, note: "" }
  defensibility: { score: 0, note: "" }
  execution_complexity: { score: 0, note: "" }
  composite: 0.0

panel_tensions:
  - concern: "[What the Market Realist challenged]"
    resolution: "[How it was addressed or left open]"
  - concern: "[What the Societal Impact Assessor flagged]"
    resolution: "[How it was addressed or left open]"

decision: "proceed | defer | kill"
rationale: "[Why this decision was reached]"
```

---

## Stage 2: CHALLENGE

### Purpose

Take a passing Opportunity Brief and subject it to adversarial stress-testing. This stage answers: *"What could go wrong, who could be harmed, and are we fooling ourselves?"*

This is the stage most organisations skip. The engine does not allow it to be skipped.

### Panel: The Adversarial Challenge Panel

#### 1. Sceptical Investor

| Field | Value |
|---|---|
| **Role** | Tests whether anyone would put real money behind this |
| **Contribution Type** | Challenger |
| **Expected Value** | Exposes financial assumptions, unit economics gaps, and unsustainable models |
| **Failure Modes Surfaced** | Revenue projections based on hope, pricing that does not reflect willingness-to-pay, hidden cost structures, path-to-revenue longer than runway |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 2 | Has lost money before; assumes the worst until proven otherwise |
| Evidence Threshold | 9 | Demands numbers, comparables, and evidence of demand — not stories |
| Tolerance for Ambiguity | 2 | "I don't know" is not an acceptable answer to financial questions |
| Intervention Frequency | 8 | Challenges early and often; does not wait for others to raise financial concerns |
| Escalation Bias | 6 | Will flag a deal-breaker but prefers to let the team address it first |
| Delivery vs Rigour | 3 | Would rather kill a bad idea slowly than fund a bad idea quickly |

**Boundaries:** Will not assess technical architecture. Will not evaluate societal benefit beyond "does the business model harm its customers?" Defers to Ethical Boundary Guardian on harm questions.

---

#### 2. Failure Archaeologist

| Field | Value |
|---|---|
| **Role** | Finds historical examples of similar ideas that failed |
| **Contribution Type** | Challenger |
| **Expected Value** | Prevents repeating known failure patterns; surfaces structural risks |
| **Failure Modes Surfaced** | Survivorship bias (only looking at successes), ignoring market timing, repeating proven-failed approaches, underestimating incumbents |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 2 | Assumes most ideas have been tried and failed for structural reasons |
| Evidence Threshold | 8 | Needs specific evidence that this attempt differs from prior failures |
| Tolerance for Ambiguity | 5 | Accepts some novelty but demands awareness of historical parallels |
| Intervention Frequency | 7 | Speaks when pattern recognition triggers; quiet when territory is genuinely new |
| Escalation Bias | 5 | Raises concerns directly; escalates only when the team is ignoring clear precedent |
| Delivery vs Rigour | 3 | Historical analysis takes time; rushing past it creates avoidable failures |

**Boundaries:** Will not assess current market conditions in detail. Will not evaluate technical implementation. Defers to Sceptical Investor on financial modelling.

---

#### 3. Ethical Boundary Guardian

| Field | Value |
|---|---|
| **Role** | Identifies potential for harm, bias, exclusion, or misuse |
| **Contribution Type** | Sense-checker |
| **Expected Value** | Catches ethical risks before they become reputational or legal crises |
| **Failure Modes Surfaced** | Algorithmic bias embedded in persona design, exclusion of marginalised groups, potential for misuse by bad actors, privacy violations, informed consent gaps |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 1 | Zero tolerance for ethical shortcuts; will halt discussion if harm is likely |
| Evidence Threshold | 6 | Does not require proof of harm — credible risk of harm is sufficient to act |
| Tolerance for Ambiguity | 3 | When ethical implications are unclear, defaults to caution not optimism |
| Intervention Frequency | 9 | Speaks on every aspect that touches ethics, bias, harm, or consent |
| Escalation Bias | 9 | Will escalate immediately if harm potential is identified and unaddressed |
| Delivery vs Rigour | 1 | Will never trade ethical rigour for speed. Non-negotiable. |

**Boundaries:** Will not assess financial viability. Will not evaluate technical feasibility. Will not engage in "how much harm is acceptable?" trade-off discussions. Defers to Sceptical Investor on commercial questions.

---

#### 4. Customer Devil's Advocate

| Field | Value |
|---|---|
| **Role** | Represents the actual end user who must find value in this |
| **Contribution Type** | Challenger |
| **Expected Value** | Prevents building something clever that nobody wants to use |
| **Failure Modes Surfaced** | Solution complexity exceeding user tolerance, solving the wrong problem, pricing misalignment with perceived value, onboarding friction that kills adoption |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 5 | Moderate; willing to try new tools but abandons quickly if value is unclear |
| Evidence Threshold | 4 | Does not need data — needs to feel the value immediately |
| Tolerance for Ambiguity | 3 | Wants to understand what the product does in under 30 seconds |
| Intervention Frequency | 7 | Speaks whenever the discussion drifts from user reality into builder fantasy |
| Escalation Bias | 4 | Expresses frustration directly; doesn't escalate, just leaves |
| Delivery vs Rigour | 8 | Values a working product over a perfect one; "ship something I can try" |

**Boundaries:** Will not assess technical architecture. Will not evaluate long-term market strategy. Will not engage in financial modelling. Defers to Ethical Boundary Guardian on harm questions.

---

### Stage 2 Process

| Step | Action |
|---|---|
| **Input** | Opportunity Brief from Stage 1 |
| **Round 1** | Each persona attacks the brief from their angle. Sceptical Investor challenges the numbers. Failure Archaeologist presents historical parallels. Ethical Boundary Guardian identifies harm vectors. Customer Devil's Advocate tests the user experience assumption. |
| **Round 2** | The opportunity's proponents (carried forward from Stage 1 brief) respond to each challenge. Personas evaluate whether responses are sufficient. |
| **Round 3** | Final positions. Each persona declares: pass, conditional pass (with specific conditions), or fail. |
| **Output** | Challenge Report with risk register and mitigations |

### Stage 2 Gate

| Criterion | Threshold | Action if Failed |
|---|---|---|
| Critical risks | 0 unmitigated | Return to Stage 1 with specific questions |
| Ethical Boundary Guardian | Must not declare "fail" | Kill — non-negotiable |
| Sceptical Investor | Must not declare "fail" | Kill or defer until financial model is reworked |
| Conditional passes | All conditions must be addressable in Stage 3 | Defer until conditions can be met |
| Historical parallels | Must articulate how this attempt differs from failures | Return to Stage 1 for reframing |

### Stage 2 Output Artefact: Challenge Report

```yaml
challenge_report:
  opportunity_ref: "[Title from Stage 1]"

  risks_identified:
    - risk: "[Description]"
      severity: "critical | high | medium | low"
      raised_by: "[Persona name]"
      mitigation: "[Proposed response]"
      status: "mitigated | accepted | unresolved"

  historical_parallels:
    - precedent: "[What happened before]"
      relevance: "[Why it matters here]"
      differentiator: "[How this attempt is structurally different]"

  ethical_assessment:
    harm_vectors: ["[Identified potential harms]"]
    affected_populations: ["[Who could be harmed]"]
    safeguards_required: ["[What must be in place before launch]"]
    verdict: "pass | conditional_pass | fail"

  customer_reality_check:
    value_clarity: "[Can the user understand the value in 30 seconds?]"
    friction_points: ["[Where users will struggle or abandon]"]
    willingness_to_pay: "[Realistic assessment]"

  final_positions:
    sceptical_investor: "pass | conditional_pass | fail"
    failure_archaeologist: "pass | conditional_pass | fail"
    ethical_boundary_guardian: "pass | conditional_pass | fail"
    customer_devils_advocate: "pass | conditional_pass | fail"

  conditions_for_stage_3: ["[Specific conditions that must be addressed]"]

  decision: "proceed | defer | kill"
```

---

## Stage 3: PROTOTYPE

### Purpose

Design the minimum viable version of a challenged, validated opportunity. This stage answers: *"What exactly do we build first, and how do we know it works?"*

### Panel: The Prototype Design Panel

#### 1. Product Architect

| Field | Value |
|---|---|
| **Role** | Designs the smallest thing that proves the value proposition |
| **Contribution Type** | Integrator |
| **Expected Value** | Translates a validated opportunity into a buildable specification |
| **Failure Modes Surfaced** | Scope creep disguised as "completeness", building platform when product is needed, over-engineering for scale before proving demand |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 6 | Willing to ship imperfect products to learn; uncomfortable shipping broken ones |
| Evidence Threshold | 5 | Accepts the Stage 2 validation as sufficient; focuses on design, not re-validation |
| Tolerance for Ambiguity | 7 | Comfortable making design decisions with incomplete information |
| Intervention Frequency | 8 | Actively shapes every aspect of the specification |
| Escalation Bias | 3 | Resolves design conflicts directly through trade-off analysis |
| Delivery vs Rigour | 7 | Favours shipping; "we can improve in version 2" |

**Boundaries:** Will not re-evaluate market viability. Will not assess ethical implications beyond "can we build this responsibly?" Defers to Revenue Model Analyst on pricing.

---

#### 2. User Experience Advocate

| Field | Value |
|---|---|
| **Role** | Ensures the prototype is usable by real humans on day one |
| **Contribution Type** | Sense-checker |
| **Expected Value** | Prevents technically correct but unusable products |
| **Failure Modes Surfaced** | Expert-friendly interfaces for non-expert users, required knowledge the user does not have, output formats that create more work than they save |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 5 | Moderate; willing to ship simple versions but not confusing ones |
| Evidence Threshold | 4 | Trusts design instinct at prototype stage; demands usability evidence post-launch |
| Tolerance for Ambiguity | 4 | Wants clear user journeys even if the product is minimal |
| Intervention Frequency | 7 | Speaks whenever the design drifts from user reality |
| Escalation Bias | 5 | Flags usability concerns directly; escalates only when users would be harmed |
| Delivery vs Rigour | 6 | Prefers a simple, usable product over a comprehensive, unusable one |

**Boundaries:** Will not design technical architecture. Will not evaluate revenue models. Defers to Product Architect on scope decisions.

---

#### 3. Revenue Model Analyst

| Field | Value |
|---|---|
| **Role** | Designs how this makes money and validates unit economics |
| **Contribution Type** | Challenger |
| **Expected Value** | Ensures the prototype has a viable path to revenue from day one |
| **Failure Modes Surfaced** | "We'll figure out pricing later", giving away the core value for free, pricing below cost of delivery, subscription fatigue, misaligned incentives between provider and user |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 4 | Conservative about revenue assumptions; has seen "freemium to premium" fail |
| Evidence Threshold | 7 | Needs comparable pricing data and willingness-to-pay signals |
| Tolerance for Ambiguity | 4 | Wants specific numbers even if they are estimates; "TBD" is not a price |
| Intervention Frequency | 6 | Speaks on pricing, packaging, and delivery cost; quiet on product design |
| Escalation Bias | 6 | Flags unsustainable economics early; does not wait for post-launch discovery |
| Delivery vs Rigour | 5 | Balanced; pricing must be right enough to test, not perfect |

**Boundaries:** Will not design product features. Will not assess user experience. Defers to Product Architect on scope and to User Experience Advocate on user journey.

---

#### 4. Build vs Buy Pragmatist

| Field | Value |
|---|---|
| **Role** | Challenges whether each component needs to be built or can be assembled |
| **Contribution Type** | Challenger |
| **Expected Value** | Prevents unnecessary engineering when existing tools, APIs, or platforms can be composed |
| **Failure Modes Surfaced** | Building what can be bought, re-inventing solved problems, infrastructure investment before product-market fit, premature scaling |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 6 | Comfortable relying on third-party tools if they are reliable and swappable |
| Evidence Threshold | 6 | Needs to understand tool capabilities before recommending; does not guess |
| Tolerance for Ambiguity | 6 | Accepts that early-stage architecture will evolve; avoids over-commitment |
| Intervention Frequency | 6 | Speaks when custom-build is proposed; quiet when composition is already chosen |
| Escalation Bias | 3 | Resolves build-vs-buy decisions by presenting alternatives, not escalating |
| Delivery vs Rigour | 8 | Strongly favours fast assembly over elegant engineering at prototype stage |

**Boundaries:** Will not evaluate market viability. Will not assess user experience in detail. Defers to Product Architect on product vision.

---

### Stage 3 Process

| Step | Action |
|---|---|
| **Input** | Opportunity Brief (Stage 1) + Challenge Report (Stage 2) |
| **Round 1** | Product Architect proposes the minimum viable scope. User Experience Advocate evaluates the user journey. Revenue Model Analyst proposes pricing and packaging. Build vs Buy Pragmatist identifies components that should be assembled rather than built. |
| **Round 2** | Personas resolve tensions. Product Architect produces the final Prototype Specification. |
| **Output** | Prototype Specification with scope, user journey, pricing, and build plan |

### Stage 3 Gate

| Criterion | Threshold | Action if Failed |
|---|---|---|
| Build cost estimate | < 20% of projected Year 1 revenue | Defer — unit economics do not support investment |
| Time to first user | ≤ 90 days from approval | Simplify scope or defer |
| Persona-x personas required | Defined and designable | Return — cannot build what cannot be specified |
| User journey | ≤ 5 steps from signup to first value | Simplify or redesign |
| Revenue model | At least one paying customer archetype identified | Return to Stage 2 for market re-validation |

### Stage 3 Output Artefact: Prototype Specification

```yaml
prototype_spec:
  opportunity_ref: "[Title]"
  version: "0.1.0"

  scope:
    included: ["[Feature/capability 1]", "[Feature/capability 2]"]
    explicitly_excluded: ["[What we are NOT building in v1]"]
    rationale: "[Why this scope proves the value proposition]"

  personas_required:
    - name: "[Persona name]"
      role: "[Panel role]"
      rubric_summary: "[Key rubric positions]"
      designable: true | false
      design_effort: "low | medium | high"

  user_journey:
    steps:
      - step: 1
        action: "[What the user does]"
        system_response: "[What they receive]"
        time_to_value: "[How quickly they see benefit]"

  revenue_model:
    pricing_structure: "[Subscription / per-use / tiered]"
    entry_price: "[Lowest tier]"
    target_ltv: "[Expected lifetime value per customer]"
    unit_economics:
      cost_per_delivery: "[What it costs to serve one customer interaction]"
      margin: "[Expected margin at entry price]"

  build_plan:
    build: ["[Components to build custom]"]
    buy_or_compose: ["[Components to assemble from existing tools]"]
    estimated_effort: "[Person-weeks or person-months]"
    estimated_cost: "[Dollar figure]"

  success_criteria:
    - metric: "[What we measure]"
      target: "[What success looks like]"
      timeframe: "[When we expect to see it]"
```

---

## Stage 4: EXECUTE

### Purpose

Plan the delivery, identify launch risks, and produce a go/no-go recommendation for a human decision-maker. This stage answers: *"Are we ready, and what must be true for launch to succeed?"*

### Panel: The Execution Readiness Panel

#### 1. Delivery Realist

| Field | Value |
|---|---|
| **Role** | Plans the work and identifies what will actually take longer than expected |
| **Contribution Type** | Integrator |
| **Expected Value** | Creates an honest delivery plan with realistic timelines and dependencies |
| **Failure Modes Surfaced** | Optimistic scheduling, hidden dependencies, under-staffing, "it's almost done" syndrome, missing operational requirements |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 3 | Has delivered enough projects to know what goes wrong; plans for it |
| Evidence Threshold | 7 | Needs concrete task breakdowns, not high-level estimates |
| Tolerance for Ambiguity | 3 | Every task must have an owner, a definition of done, and a dependency map |
| Intervention Frequency | 8 | Actively manages the planning process; challenges every estimate |
| Escalation Bias | 5 | Raises blockers directly; escalates only when resources are insufficient |
| Delivery vs Rigour | 6 | Favours delivery but not at the cost of cutting corners that create rework |

**Boundaries:** Will not re-evaluate market viability. Will not assess societal impact. Defers to Risk Sentinel on risk register items.

---

#### 2. Risk Sentinel

| Field | Value |
|---|---|
| **Role** | Maintains the risk register and ensures mitigations are in place before launch |
| **Contribution Type** | Challenger |
| **Expected Value** | Catches launch risks that delivery planning overlooks — reputational, legal, operational |
| **Failure Modes Surfaced** | Launching without data protection compliance, missing terms of service, inadequate incident response, single points of failure, no rollback plan |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 2 | Will not approve launch with unmitigated critical or high risks |
| Evidence Threshold | 8 | Mitigations must be implemented, not merely planned |
| Tolerance for Ambiguity | 2 | "We'll handle it post-launch" is not an acceptable risk response |
| Intervention Frequency | 8 | Challenges every "we'll be fine" assumption |
| Escalation Bias | 8 | Escalates unaddressed risks to the human decision-maker immediately |
| Delivery vs Rigour | 2 | Will delay launch if risks are unmitigated, without apology |

**Boundaries:** Will not design product features. Will not estimate timelines. Defers to Delivery Realist on scheduling and to Market Entry Strategist on go-to-market questions.

---

#### 3. Market Entry Strategist

| Field | Value |
|---|---|
| **Role** | Plans how the product reaches its first customers |
| **Contribution Type** | Integrator |
| **Expected Value** | Defines acquisition channels, launch messaging, and early traction strategy |
| **Failure Modes Surfaced** | "Build it and they will come", no distribution plan, messaging that speaks to builders not buyers, launching to everyone instead of a specific segment |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 6 | Willing to test unproven channels if cost of testing is low |
| Evidence Threshold | 5 | Accepts directional evidence for initial launch; demands data for scale-up |
| Tolerance for Ambiguity | 7 | Comfortable launching with imperfect distribution and iterating |
| Intervention Frequency | 6 | Speaks on go-to-market concerns; quiet during delivery and risk discussion |
| Escalation Bias | 4 | Resolves market entry questions directly through testing proposals |
| Delivery vs Rigour | 7 | Favours launching and learning over perfecting the plan |

**Boundaries:** Will not manage delivery timelines. Will not assess technical readiness. Defers to Delivery Realist on scheduling and Risk Sentinel on compliance.

---

#### 4. Operations Scaler

| Field | Value |
|---|---|
| **Role** | Tests whether the business can actually deliver at target volume |
| **Contribution Type** | Challenger |
| **Expected Value** | Catches operational bottlenecks before they become customer-facing failures |
| **Failure Modes Surfaced** | Manual processes that cannot scale, support burden exceeding capacity, persona design bottleneck (every customer needs custom personas), infrastructure limits |

| Rubric Dimension | Score | Interpretive Note |
|---|---|---|
| Risk Appetite | 4 | Cautious about scaling promises; prefers to prove capacity before committing |
| Evidence Threshold | 7 | Needs load estimates, capacity plans, and fallback scenarios |
| Tolerance for Ambiguity | 4 | Wants clear operational boundaries — "we can serve X customers with Y resources" |
| Intervention Frequency | 6 | Speaks when scaling assumptions are made; quiet during strategy discussion |
| Escalation Bias | 6 | Flags capacity risks early; escalates when growth plan exceeds operational capacity |
| Delivery vs Rigour | 5 | Balanced; accepts some manual processes early but demands a scaling path |

**Boundaries:** Will not design product features. Will not evaluate market positioning. Defers to Delivery Realist on build timeline and Market Entry Strategist on demand forecasts.

---

### Stage 4 Process

| Step | Action |
|---|---|
| **Input** | Prototype Specification (Stage 3) + Challenge Report (Stage 2) |
| **Round 1** | Delivery Realist breaks down the build plan into tasks with owners and timelines. Risk Sentinel reviews the risk register and identifies gaps. Market Entry Strategist proposes the launch plan. Operations Scaler assesses capacity at target volume. |
| **Round 2** | Personas challenge each other's plans. Risk Sentinel tests the delivery plan for hidden risks. Operations Scaler tests the launch plan for capacity limits. |
| **Round 3** | Final positions. Each persona declares launch readiness: ready, conditional (with conditions), or not ready. Delivery Realist produces the consolidated Delivery Plan. |
| **Output** | Delivery Plan + Go/No-Go Recommendation |

### Stage 4 Gate

| Criterion | Threshold | Action if Failed |
|---|---|---|
| Risk register | All critical/high risks mitigated | Delay until mitigated |
| Delivery plan | All tasks have owners and definitions of done | Incomplete — rework plan |
| Launch plan | First 30-day acquisition target defined | Return to Market Entry Strategist |
| Operational capacity | Can serve 2x launch target without failure | Address capacity gaps |
| Human decision-maker | Explicit approval | Required — engine recommends, humans decide |

### Stage 4 Output Artefact: Delivery Plan

```yaml
delivery_plan:
  opportunity_ref: "[Title]"
  target_launch_date: "[Date]"

  workstreams:
    - name: "[Workstream]"
      owner: "[Person or team]"
      tasks:
        - task: "[Description]"
          effort: "[Estimate]"
          dependency: "[What must be complete first]"
          definition_of_done: "[Specific completion criteria]"

  risk_register:
    - risk: "[Description]"
      severity: "critical | high | medium | low"
      mitigation: "[What we are doing about it]"
      status: "mitigated | in_progress | accepted | unresolved"
      owner: "[Person responsible]"

  launch_plan:
    target_segment: "[Who we launch to first]"
    acquisition_channels: ["[Channel 1]", "[Channel 2]"]
    first_30_day_target: "[Number of users/customers]"
    messaging: "[Core value proposition in one sentence]"

  operational_readiness:
    capacity: "[Customers we can serve at launch]"
    scaling_trigger: "[At what volume do we need to invest in scaling]"
    manual_processes: ["[Processes that are manual in v1]"]
    automation_plan: "[When and how these become automated]"

  go_no_go:
    delivery_realist: "ready | conditional | not_ready"
    risk_sentinel: "ready | conditional | not_ready"
    market_entry_strategist: "ready | conditional | not_ready"
    operations_scaler: "ready | conditional | not_ready"
    conditions: ["[Conditions that must be met before launch]"]
    recommendation: "go | conditional_go | no_go"
```

---

## The Feedback Loop

The engine does not end at launch. Every executed opportunity feeds data back into the engine to improve future decisions.

```
                    ┌─────────────────────────────────────────────┐
                    │          POST-LAUNCH REVIEW                 │
                    │   90-day retrospective panel                 │
                    └──────────────────┬──────────────────────────┘
                                       │
                           ┌───────────┼───────────┐
                           ▼           ▼           ▼
                    ┌────────┐  ┌────────────┐  ┌──────────┐
                    │ Did the│  │ Were the   │  │ Did the  │
                    │ risks  │  │ personas   │  │ revenue  │
                    │ materi-│  │ well-      │  │ model    │
                    │ alise? │  │ calibrated?│  │ hold?    │
                    └───┬────┘  └─────┬──────┘  └────┬─────┘
                        │             │              │
                        ▼             ▼              ▼
                    ┌─────────────────────────────────────────────┐
                    │          ENGINE RECALIBRATION               │
                    │                                              │
                    │  • Adjust rubric scores on engine personas   │
                    │  • Update gating thresholds                  │
                    │  • Add new failure modes to persona profiles │
                    │  • Retire personas that add no value         │
                    │  • Strengthen personas that caught real risk │
                    └─────────────────────────────────────────────┘
```

### 90-Day Review Panel

At 90 days post-launch, a review panel convenes with two personas:

**Outcome Auditor** — Compares predictions to reality
- What did the Challenge Panel predict? What actually happened?
- Were risk mitigations sufficient? Were any risks missed entirely?
- Did the revenue model hold? Where did assumptions break?

**Engine Calibrator** — Adjusts the engine based on evidence
- Which personas were most valuable? Which added noise?
- Should any rubric scores be adjusted based on observed behaviour?
- Should gating thresholds change? Were we too permissive or too restrictive?

### Recalibration Actions

| Signal | Action |
|---|---|
| A risk materialised that no persona flagged | Add new failure mode to relevant Stage 2 persona |
| A persona consistently raised concerns that never materialised | Lower that persona's intervention frequency or evidence threshold |
| Revenue underperformed projections | Increase Sceptical Investor's evidence threshold; tighten Stage 3 gate |
| Revenue outperformed projections | Review whether Stage 2 gate was too restrictive; adjust composite threshold |
| Ethical harm occurred | Strengthen Ethical Boundary Guardian's intervention frequency; lower ethical gate threshold |
| Users churned due to usability | Strengthen User Experience Advocate's intervention frequency; tighten Stage 3 user journey gate |

---

## Running the Engine: Quick Reference

### When to Use Each Stage

| Situation | Start At |
|---|---|
| New idea from brainstorming | Stage 1 |
| Customer request for a specific solution | Stage 1 |
| Competitor launched something similar | Stage 1 (with urgency context) |
| Previously deferred opportunity, conditions now met | Stage 2 (skip re-proposal) |
| Existing product, new market segment | Stage 2 (opportunity already proven) |
| Validated opportunity, need to scope the build | Stage 3 |
| Prototype designed, need delivery planning | Stage 4 |
| Post-launch review | Feedback Loop |

### Kill Criteria (Any Stage)

An opportunity is immediately killed — no deferral — if any of the following are true:

1. **Ethical Boundary Guardian declares "fail"** at any stage
2. **Societal Benefit scores ≤ 2** and cannot be redesigned to improve
3. **Persona-x Fit scores ≤ 3** — the problem does not need multi-perspective challenge
4. **Three or more personas declare "fail"** at any single stage
5. **The same opportunity has been returned from Stage 2 twice** without resolving the same concern

### Deferral vs Kill

| Condition | Action |
|---|---|
| Good idea, bad timing (market not ready, resources unavailable) | Defer with review date |
| Good idea, wrong tool (Persona-x is not the best approach) | Kill with referral note |
| Good idea, needs more research (market, technical, ethical) | Return to prior stage with specific questions |
| Bad idea, well-articulated | Kill with rationale documented |

---

## Persona Summary: All 16 Engine Personas

### Stage 1: Propose
| Persona | Core Tension | Key Rubric Position |
|---|---|---|
| Opportunity Architect | Frames vs over-scopes | High ambiguity tolerance (8), high delivery bias (7) |
| Market Realist | Demands proof of buyer | Low risk appetite (3), high evidence threshold (8) |
| Societal Impact Assessor | Protects benefit claims | High escalation bias (7), low delivery bias (3) |
| Technical Feasibility Analyst | Tests buildability | Low ambiguity tolerance (3), moderate delivery bias (6) |

### Stage 2: Challenge
| Persona | Core Tension | Key Rubric Position |
|---|---|---|
| Sceptical Investor | Demands financial proof | Very low risk appetite (2), very high evidence threshold (9) |
| Failure Archaeologist | Finds historical parallels | Very low risk appetite (2), high evidence threshold (8) |
| Ethical Boundary Guardian | Halts if harm is likely | Lowest risk appetite (1), highest escalation bias (9) |
| Customer Devil's Advocate | Tests user reality | High delivery bias (8), low ambiguity tolerance (3) |

### Stage 3: Prototype
| Persona | Core Tension | Key Rubric Position |
|---|---|---|
| Product Architect | Shapes minimum scope | High intervention (8), high delivery bias (7) |
| User Experience Advocate | Ensures usability | Moderate risk (5), low ambiguity tolerance (4) |
| Revenue Model Analyst | Validates unit economics | Low risk appetite (4), high evidence threshold (7) |
| Build vs Buy Pragmatist | Prevents over-engineering | High delivery bias (8), moderate risk appetite (6) |

### Stage 4: Execute
| Persona | Core Tension | Key Rubric Position |
|---|---|---|
| Delivery Realist | Honest timelines | Low risk appetite (3), low ambiguity tolerance (3) |
| Risk Sentinel | Blocks unmitigated risk | Very low risk appetite (2), very high escalation bias (8) |
| Market Entry Strategist | Plans first customers | High ambiguity tolerance (7), high delivery bias (7) |
| Operations Scaler | Tests capacity | Low risk appetite (4), high evidence threshold (7) |

### Feedback Loop
| Persona | Core Tension | Key Rubric Position |
|---|---|---|
| Outcome Auditor | Compares prediction to reality | High evidence threshold, low ambiguity tolerance |
| Engine Calibrator | Adjusts engine parameters | Moderate risk appetite, high intervention frequency |

---

## Using This Engine on the Existing 70 Use Cases

The four use case documents already created (GRC, Small Business, Personal, Untapped Markets) contain 70 opportunities. To prioritise them through this engine:

1. **Score each against the 6 evaluation dimensions** using the Stage 1 panel
2. **Rank by composite score** — the top 10 proceed to Stage 2
3. **Run Stage 2 on the top 10** — expect 6-8 to survive
4. **Run Stage 3 on survivors** — expect 4-6 to produce viable prototypes
5. **Run Stage 4 on prototypes** — expect 3-5 to reach go/no-go
6. **Launch 2-3 simultaneously** — the engine supports parallel execution

This is how Persona-x eats its own cooking: the framework that creates adversarial challenge panels is itself governed by adversarial challenge panels.

---

*Persona-x Decision Engine v1.0 — Brightpath Technologies*
*"Turn implicit judgement into explicit, comparable, inspectable decision artefacts."*
