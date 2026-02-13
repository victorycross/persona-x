# Persona-x — Executive Overview

**How structured AI personas improve the quality of AI-assisted decisions**

Version 1.0 | 13 February 2026

---

## The Problem

When organisations use AI to support decisions — reviewing proposals, stress-testing
strategies, evaluating risk — they typically interact with a single AI assistant that
has no defined perspective. It responds to whatever it is asked, with whatever tone
seems appropriate, drawing on whatever reasoning feels relevant at the time. There is
no way to know what judgement lens was applied, whether important failure modes were
checked, or whether the same question asked tomorrow would produce a meaningfully
consistent response.

This creates three risks:

1. **Blind spots go undetected.** A single AI perspective cannot systematically
   challenge itself. If no one asks about downside risk, it is never raised.

2. **Judgement is invisible.** When an AI provides advice, the reasoning posture
   behind it — how cautious it was, what evidence it required, what it chose to
   ignore — is not stated or inspectable.

3. **Consistency is accidental.** Without a defined profile, the AI's behaviour
   shifts based on phrasing, context, and prompt design. Different users get
   different levels of rigour from the same system.

---

## The Solution

Persona-x solves this by introducing **structured AI personas** — explicitly defined
judgement profiles that shape how an AI thinks, reasons, challenges, and behaves during
a discussion.

Instead of asking one AI for a generic answer, you assemble a **panel** of personas,
each designed to contribute a specific perspective:

- A **risk analyst** who challenges assumptions and demands evidence
- A **delivery lead** who pushes for pragmatic progress
- A **compliance reviewer** who flags governance boundaries
- An **integrator** who synthesises perspectives and surfaces trade-offs

Each persona is not a character or a role-play exercise. It is a **governed design
artefact** — a structured file that defines, in quantifiable terms, how that persona
approaches any topic it is given.

---

## How It Works

The system operates in three stages: **Create**, **Store**, and **Run**.

### Stage 1 — Create a Persona

A guided creation engine walks the user through a focused set of questions designed to
extract judgement and behaviour signals. The questions are deliberately minimal — framed
as decisions, comparisons, and spectrum choices rather than long interviews.

From these signals, the engine builds a persona file with the following structure:

| Component | What It Captures |
|---|---|
| **Purpose** | Why this persona exists and when it should be used |
| **Panel role** | The specific function it performs in a group discussion |
| **Judgement profile** | Six quantified dimensions that define its reasoning posture |
| **Reasoning tendencies** | What it assumes, what it notices, what it questions |
| **Interaction style** | How it engages — questions vs assertions, gentle vs strong |
| **Boundaries** | What it will not do, will not claim, and where it defers |

The process takes minutes, not hours. Where the user provides limited input, the
system infers conservatively to maintain momentum, but it never invents boundaries
or authority.

### Stage 2 — Store and Version

Each persona is stored as a structured YAML file that is:

- **Human-readable** — anyone can open it and understand what the persona does
- **Machine-validatable** — the system enforces that all required fields are present
  and internally consistent
- **Version-controlled** — every change produces a new version with an explicit
  changelog, so the evolution of a persona is traceable
- **Comparable** — because every persona uses the same structure and scales, you can
  place two personas side by side and immediately see how they differ

### Stage 3 — Run in a Panel

When a discussion topic is presented, the system:

1. **Selects** which personas to include based on their defined invocation rules
2. **Orders** their contributions based on intervention frequency (personas that
   challenge more speak earlier)
3. **Generates** a tailored instruction set for the AI from each persona's profile,
   translating rubric scores into concrete behavioural rules
4. **Enforces** boundaries — a persona defined to stay out of commercial strategy
   will not be drawn into it, regardless of how the question is framed

The result is a structured, multi-perspective discussion where each contribution is
shaped by a defined and auditable judgement profile.

---

## The Judgement Profile

At the core of every persona is a **six-dimension rubric** scored on a 1–10 scale.
These dimensions are fixed across all personas, which is what makes them comparable:

| Dimension | What It Measures | Low Score (1–3) | High Score (8–10) |
|---|---|---|---|
| **Risk Appetite** | Willingness to accept uncertainty | Cautious, requires mitigation | Bold, comfortable with downside |
| **Evidence Threshold** | Proof needed before accepting a claim | Trusts judgement and signals | Demands documented evidence |
| **Ambiguity Tolerance** | Comfort with incomplete information | Needs clarity before acting | Works with what is available |
| **Intervention Frequency** | How often it steps into discussion | Speaks only when material | Challenges and redirects often |
| **Escalation Bias** | Tendency to escalate vs handle locally | Resolves issues directly | Escalates quickly to authority |
| **Delivery vs Rigour** | Speed versus thoroughness | Favours rigour over speed | Favours delivery over precision |

Every score is accompanied by an **interpretive note** explaining how it shows up in
practice. A score of 8 on Evidence Threshold is not just a number — the note might
say: *"Will not accept 'trust me' as sufficient basis for material decisions."*

This combination of quantified score and human-readable note ensures that the rubric is
both machine-processable and meaningful to people reviewing the persona.

---

## A Concrete Example

Here is the rubric for a **Risk-Aware Analyst** persona:

```
Risk Appetite           ███░░░░░░░  3/10
Evidence Threshold      ████████░░  8/10
Ambiguity Tolerance     ████░░░░░░  4/10
Intervention Frequency  ███████░░░  7/10
Escalation Bias         ██████░░░░  6/10
Delivery vs Rigour      ███░░░░░░░  3/10
```

This tells you immediately: this persona is cautious, demands strong evidence, is
uncomfortable with ambiguity, intervenes regularly, escalates when the stakes are
high, and will always choose thoroughness over speed.

When placed in a panel alongside a delivery-focused persona (high risk appetite, low
evidence threshold, high delivery bias), the two perspectives create a structured
tension that surfaces trade-offs a single AI would never raise on its own.

---

## Why This Matters

### For decision quality

Multi-perspective review catches blind spots that a single AI misses. When a risk
persona, a delivery persona, and a compliance persona each respond to the same
proposal, the gaps between their responses reveal where the real tensions lie.

### For governance and audit

Every persona is a defined artefact with a version history. You can demonstrate what
judgement lens was applied to a decision, when it was last updated, and how it has
evolved. This is audit-ready by design.

### For consistency

Because personas are structured files — not prompt engineering tricks — they produce
consistent behaviour across sessions, users, and time. The same persona asked the same
question by different people will respond with the same reasoning posture.

### For speed

Creating a persona takes minutes. The guided process extracts high-leverage signals
without long interviews. Once created, a persona can be reused across any number of
panel sessions without rebuilding.

### For transparency

The rubric makes the AI's reasoning posture visible. Instead of wondering why the AI
said what it said, you can inspect the judgement profile that shaped the response.
This is fundamentally different from a black-box AI interaction.

---

## What This Is Not

- **Not role-play.** Personas are not characters pretending to be people. They are
  structured reasoning profiles that shape AI behaviour in defined, auditable ways.

- **Not a replacement for expertise.** A persona modelled on a risk analyst's
  reasoning posture does not replace a risk analyst. It surfaces the questions a
  risk analyst would ask, so they are not missed when a human expert is unavailable.

- **Not fixed forever.** Personas are versioned. As understanding evolves, personas
  are refined — with every change tracked and justified.

- **Not a single-vendor solution.** The persona file format is an open YAML schema.
  Any AI system that can read structured data and generate system prompts can consume
  these files.

---

## Architecture at a Glance

```
                    ┌──────────────────┐
                    │   User / Team    │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Creation Engine │
                    │  (CREATE/REFINE) │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │  Persona Files   │
                    │  (Validated YAML)│
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───┐  ┌──────▼─────┐  ┌─────▼──────┐
     │  Persona A │  │  Persona B │  │  Persona C │
     │  (Risk)    │  │  (Delivery)│  │ (Compliance│
     └────────┬───┘  └──────┬─────┘  └─────┬──────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Panel Runtime   │
                    │  (Discussion)    │
                    └──────────────────┘
```

1. A user creates personas through a guided process
2. Each persona becomes a validated, versioned file
3. Multiple personas are loaded into a panel session
4. The runtime translates each persona's profile into AI instructions
5. The AI generates responses shaped by each persona's defined judgement profile
6. The result is a multi-perspective discussion with traceable, auditable reasoning

---

## Current State and Next Steps

### Delivered (Prototype)

- Complete persona file schema with validation
- Six-dimension rubric with coherence checking
- Guided creation engine with signal extraction and fixed population order
- CLI tools for creating, refining, and validating personas
- Panel runtime with persona loading, speaking order, and prompt generation
- Example persona (Risk-Aware Analyst) demonstrating the full format
- Clear separation between persona creation and voice profiling

### Recommended Next Steps

| Priority | Action | Value |
|---|---|---|
| 1 | **Connect to live LLM** | Enables interactive CREATE flow and actual panel discussions |
| 2 | **Build 3–5 standard personas** | Creates a reusable library covering common panel roles |
| 3 | **Add a web interface** | Makes persona creation accessible to non-technical users |
| 4 | **Panel consensus detection** | Identifies when personas converge, disagree, or deadlock |
| 5 | **Comparison and diversity tools** | Visualise rubric differences across a panel to ensure adequate coverage |

---

*Persona-x is a Brightpath Technologies project.*
