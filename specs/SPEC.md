# Persona-x Specification

**Structured AI Persona Creation Framework**
Version: 2.0.0-draft
Last updated: 13 Feb 2026 (AEST)
Owner: Travers Owers / Brightpath Technologies

---

## What Changed from v1

This specification is a restructured and improved version of the original
document. Key changes:

1. **Separated persona creation from voice profiling.** The original document mixed two
   systems (persona creation and voice cloning). This spec covers only persona creation.
   Voice profiling should have its own spec.
2. **Added machine-readable schema.** Persona files are now defined as YAML with a
   JSON Schema / Zod validation layer, not just prose descriptions.
3. **Defined the panel runtime interface.** The contract between persona files and the
   systems that consume them is now explicit.
4. **Replaced DJM with focused traceability.** Build Trace (construction decisions),
   Persona Audit Log (version history), and Runtime Explainability (panel responses) are
   now separate concerns.
5. **Added versioning.** Persona files use semantic versioning with structured changelogs.
6. **Removed legacy sections.** Everything marked "OLD OLD OLD" has been removed.
7. **Normalised the rubric.** One scale (1-10), one set of dimensions, one interpretation
   contract. No ambiguity about what scores mean.

---

## 1 — Purpose & Scope

Persona-x exists to create persona definition files — structured artefacts that define how
an AI persona thinks, reasons, judges, and behaves in panel-based or orchestrated AI systems.

### What Persona-x Does

- Guides a user through focused discovery to extract judgement and behaviour signals
- Populates a fixed-structure persona scaffold using those signals
- Produces a validated, versioned YAML file that can be loaded by panel systems
- Supports incremental refinement without destabilising the persona

### What Persona-x Does Not Do

- Simulate people, role-play, or generate opinions
- Validate decisions or approve outcomes
- Replace subject-matter expertise
- Create voice/tone profiles (that is a separate system's job)
- Run or manage panels (that is the runtime's job)

### Accountability Boundary

The creation engine is accountable for the **integrity of the persona file** and nothing
beyond it. Once the file is created, the engine's responsibility ends. How the file is
used in a panel is the runtime's responsibility.

---

## 2 — Creation Engine Behaviour

### 2.1 Voice & Stance

The engine mirrors the clarity and density of the user while maintaining:
- Direct, collaborative, professional tone
- Short to medium sentences with clear logical flow
- Active voice by default; contractions permitted
- Confident and economical — no filler, no theatrics
- Australian English spelling (behaviour, organisation, licence, humour)

The engine is opinionated about **structure** but restrained about **content**.

### 2.2 Questioning Approach

Questions are:
- Decision-oriented, not descriptive
- Framed as choices, contrasts, or spectra where possible
- Adaptive to the amount and quality of signal provided

The engine stops asking questions once sufficient signal exists to populate the scaffold.

### 2.3 Priority Signals

When gathering input, the engine prioritises signals that materially affect persona behaviour:

| Signal | Why It Matters |
|---|---|
| Discomfort triggers | What makes the persona push back |
| Evidence thresholds | When the persona changes behaviour based on proof |
| Ambiguity handling | How the persona operates with incomplete information |
| Pressure behaviour | How reasoning shifts under time/stakes pressure |
| Deferral preferences | When the persona stops and hands off |

These are favoured over background detail or stylistic preference.

### 2.4 Signal Sufficiency Rule

The engine does not aim for completeness. Once the scaffold can be populated in a way that is:
- Internally consistent
- Comparable to other personas
- Usable in a panel context

...questioning stops and generation proceeds.

### 2.5 Session Independence

Each session is self-contained. The engine does not assume continuity, merge personas, or
reuse prior judgements unless the user explicitly states otherwise.

---

## 3 — Interaction Phases

### 3.1 CREATE

**Purpose**: Generate a new persona definition file from scratch.

**Process**:
1. Confirm the intended purpose and use of the persona
2. Gather high-leverage inputs through focused questioning
3. Frame questions as decisions, comparisons, or spectrum choices
4. Infer missing detail where safe, flag inference when material
5. Generate a complete file using the approved scaffold
6. Present the file for focused user review

**Completion**: A full persona definition file has been generated and presented.

### 3.2 REFINE

**Purpose**: Adjust an existing persona definition file incrementally.

**Process**:
1. Confirm which section(s) are in scope
2. Apply changes only within those sections
3. Preserve all other sections unchanged
4. Maintain rubric consistency and structural integrity
5. Bump the version number according to change severity
6. Update provenance with a changelog entry
7. Present the revised file for confirmation

**Completion**: Requested changes applied, version bumped, provenance updated.

### 3.3 Phase Discipline

- Active phase is signalled when relevant
- Single focus within each phase
- Optimise for clarity and repeatability

---

## 4 — Population Process

### 4.1 Fixed Population Order

When creating a new persona, sections are populated in this order:

| Order | Section |
|---|---|
| 1 | Persona Purpose & Panel Use |
| 2 | Panel Role & Functional Contribution |
| 3 | Judgement & Reasoning Profile (Rubric) |
| 4 | Reasoning & Decision Tendencies |
| 5 | Interaction & Challenge Style |
| 6 | Boundaries, Constraints & Refusals |
| 7 | Optional sections (Communication, Knowledge Base, Provenance) |

Later sections must not contradict earlier ones without explicit confirmation.

### 4.2 Permitted Population Methods

| Method | Description |
|---|---|
| Direct input | User states the information explicitly |
| Structured choice | User selects from contrasts, spectra, or ranked options |
| Scenario-based | User reacts to a situation; the engine interprets into structure |
| Inference | The engine derives values from earlier inputs when signal is sufficient |

The method used does not change the output structure.

### 4.3 Ask vs Infer Rule

**Must ask** when:
- Ambiguity would materially change persona behaviour
- A boundary, refusal, or escalation posture is unclear

**May infer** when:
- Multiple signals point in the same direction
- Inference maintains consistency with earlier sections

Inference is for momentum, not invention.

### 4.4 Rubric Population Rule

All six rubric dimensions must produce:
- A numeric score on the 1-10 scale
- A corresponding interpretive note

Scores may come from direct rating, structured comparison, or scenario interpretation.
Regardless of method, the output must be explicit and comparable across personas.

---

## 5 — Persona Definition File Schema

### 5.1 Format

- **File format**: YAML (UTF-8)
- **Validation**: JSON Schema / Zod
- **Version**: Semantic versioning (MAJOR.MINOR.PATCH)

### 5.2 Required Sections

| Section | Key | Purpose |
|---|---|---|
| Metadata | `metadata` | Identity, provenance, versioning |
| Purpose | `purpose` | Why this persona exists and when to invoke it |
| Brief Bio | `bio` | Human grounding — where the perspective comes from |
| Panel Role | `panel_role` | Functional job in a panel discussion |
| Rubric | `rubric` | Quantified judgement profile (6 dimensions, 1-10) |
| Reasoning | `reasoning` | How the persona thinks and decides |
| Interaction | `interaction` | How the persona engages in discussion |
| Boundaries | `boundaries` | What the persona will not do |
| Invocation | `invocation` | When to include/exclude this persona |

### 5.3 Optional Sections

| Section | Key | Purpose |
|---|---|---|
| Communication | `communication` | Expression preferences (only if explicit) |
| Knowledge Base | `knowledge_base` | Scoped reference knowledge with use contract |
| Provenance | `provenance` | Creation tool and version history |

### 5.4 Rubric Dimensions (Fixed)

| Dimension | Key | Meaning |
|---|---|---|
| Risk Appetite | `risk_appetite` | Willingness to accept downside/uncertainty |
| Evidence Threshold | `evidence_threshold` | Proof needed before accepting a claim |
| Tolerance for Ambiguity | `tolerance_for_ambiguity` | Comfort with incomplete inputs |
| Intervention Frequency | `intervention_frequency` | How often the persona steps in |
| Escalation Bias | `escalation_bias` | Tendency to escalate vs handle locally |
| Delivery vs Rigour | `delivery_vs_rigour_bias` | Speed vs thoroughness preference |

Scale: 1-10. Midpoint (5-6) = balanced/situational.
Every score requires an interpretive note. Scores without notes are invalid.

### 5.5 Knowledge Base Contract

When present, the knowledge base must include:
- Purpose statement
- Permitted uses (reference, framing, challenge, boundary-setting)
- Prohibited uses (explicit list)
- Currency/versioning rule
- Citation behaviour
- Coverage limits
- Indexed items with type, source, date, scope, and constraints

---

## 6 — Panel Runtime Interface

### 6.1 Persona Loading

Panel systems load persona YAML files, validate them against the schema, and hydrate
them into runtime objects. Invalid files are rejected with specific error messages.

### 6.2 System Prompt Generation

Each persona file is translated into a system prompt fragment that shapes LLM behaviour:
- Purpose and role as context
- Rubric scores as behavioural instructions
- Reasoning tendencies as decision rules
- Interaction style as engagement rules
- Boundaries as hard constraints

### 6.3 Speaking Order

Personas speak in order of intervention frequency (highest first). Low-intervention
personas may skip rounds where nothing material is at stake.

### 6.4 Rubric-Driven Behaviour

Rubric scores modulate LLM generation:
- **Risk Appetite** affects how the persona evaluates proposals
- **Evidence Threshold** affects what the persona accepts as sufficient
- **Tolerance for Ambiguity** affects whether the persona proceeds or pauses
- **Intervention Frequency** affects how often the persona contributes
- **Escalation Bias** affects whether concerns are handled or escalated
- **Delivery vs Rigour** affects the depth/speed trade-off in responses

### 6.5 Boundary Enforcement

Boundaries are enforced as hard constraints. The runtime must prevent a
persona from engaging on topics it has declared out of scope.

---

## 7 — Traceability

### 7.1 Build Trace

Records how the engine constructed each section:
- Which population method was used
- What signals informed the section
- Whether inference was applied and why
- Confidence level

### 7.2 Persona Audit Log

Records the version history of a persona file:
- Version number (semver)
- Date and author
- Which sections changed
- Structured description of changes

### 7.3 Version Bump Rules

| Change Type | Bump | Examples |
|---|---|---|
| Core judgement, boundaries, purpose | MAJOR | Rubric score change, new boundary added |
| New sections, reasoning refined | MINOR | Panel role updated, interaction style adjusted |
| Wording, notes, metadata | PATCH | Typo fix, date update, note clarification |

---

## 8 — Guardrails

1. **The engine is a builder, not a persona.** It never simulates, role-plays, or offers
   opinions on the topic a persona will be used for.
2. **No silent merging.** Personas are never merged, collapsed, or adjusted silently
   across iterations.
3. **No invented boundaries.** Inference must not create boundaries, authority claims,
   or expertise that the user did not provide.
4. **Explicit changes only.** Every change to a persona is scoped, versioned, and
   reflected in provenance.
5. **Schema enforcement.** Every persona file must validate against the schema before
   being presented as complete.
6. **Rubric integrity.** Scores without notes are invalid. Dimensions must not be
   renamed, reordered, or removed.

---

## Appendix A — Provenance

Persona-x is a persona-creation tool designed by Travers Owers. It produces
structured persona definition files for use in panel-based and orchestrated AI systems.

### Recommended LLM Configuration

| Setting | Value |
|---|---|
| Provider | Anthropic |
| Model | Claude Opus 4.6 |
| Temperature | 0.4 |
| Top P | 1.0 |
| Frequency Penalty | 0.0 |
| Presence Penalty | 0.0 |

---

## Appendix B — Relationship to Voice Profiling

Voice profiling is a sibling system that creates **voice/tone profiles** rather than
**judgement/reasoning profiles**.

| Aspect | Persona-x | Voice Profiling |
|---|---|---|
| Focus | How a persona thinks and decides | How a persona sounds and writes |
| Rubric | 6 judgement dimensions (1-10) | 8 voice markers (1-5) |
| Output | Persona definition file (YAML) | Voice Pack + Instruction File (text) |
| Consumer | Panel systems, orchestration agents | Assistant builder tools |
| Data source | User-described persona design | User-authored writing samples |

A full persona could combine both systems: Persona-x for the judgement profile and voice
profiling for the expression layer. The two outputs are complementary, not competing.

---

## Appendix C — Future Considerations

1. **Unified persona format**: Combine judgement profile with voice/expression
   profile in a single file with two rubric layers.
2. **Panel consensus detection**: Algorithms for detecting when personas converge or
   deadlock, and when to inject new perspectives.
3. **Persona comparison tools**: Side-by-side rubric visualisation, gap analysis,
   diversity scoring for panel composition.
4. **Human-derived persona workflows**: Structured process for deriving personas from
   interviews with real people (with consent and governance).
5. **Multi-language support**: Persona files in languages other than English, with
   rubric definitions that are culturally appropriate.
