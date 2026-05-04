# Personalization Engine

## Overview

The Personalization Engine is the decision-making layer of Illuna.

It decides whether a user message should result in an application adaptation, a preference update, a clarification question, or no action.

While Intent Classification answers the question:

> What does the user likely mean?

The Personalization Engine answers:

> What should the application do with that meaning?

This distinction is important.

The classifier interprets language. The Personalization Engine makes controlled product decisions.

---

## Why the Personalization Engine Matters

Adaptive applications should feel responsive, but not unpredictable.

If every user message directly changed the app, the experience would quickly become chaotic.

For example, a user might say:

```text
"This is a bit too much."
```

This could mean:

* too much text,
* too much visual clutter,
* too many notifications,
* too much complexity,
* too much animation,
* or simply frustration in the moment.

The Personalization Engine decides whether this signal is strong enough to adapt the app, ask a clarification question, or only adjust the current response.

Its purpose is to make personalization useful, safe, and explainable.

---

## Core Responsibility

The Personalization Engine receives structured input from upstream components and produces a clear decision.

```text
Intent Classification
        +
Context Resolution
        +
Preference Memory
        +
Product Rules
        ↓
Personalization Engine
        ↓
Personalization Decision
```

It acts as the policy and decision layer for adaptive behavior.

Not every signal becomes a preference. Not every preference becomes a UI change. Not every UI change should be permanent.

The engine exists to keep that logic under control.

---

## Inputs

The Personalization Engine typically receives the following inputs:

```json
{
  "message": "Make the app brighter and more playful.",
  "intent_result": {
    "intent": "preference_update",
    "entities": {
      "topic": "visual_style",
      "target": "app_theme",
      "requested_change": "brighter and more playful",
      "style": "playful",
      "language": "English"
    },
    "tone": "friendly",
    "context": "user requests visual theme personalization",
    "confidence": 0.95
  },
  "resolved_context": {
    "app": "GardenMate",
    "screen": "home",
    "target": "theme",
    "current_theme": "neutral_light",
    "available_theme_profiles": [
      "minimal_light",
      "natural_garden",
      "playful_spring"
    ]
  },
  "existing_preferences": {
    "theme_mood": "natural",
    "animation_level": "low",
    "content_density": "balanced"
  },
  "product_rules": {
    "allow_theme_adaptation": true,
    "allow_animation_adaptation": true,
    "requires_confirmation_for_persistent_changes": false
  }
}
```

The engine should not rely on raw user text alone.

It should make decisions based on structured input and known product boundaries.

---

## Outputs

The Personalization Engine returns a structured decision.

```json
{
  "decision": "adapt",
  "adaptation_type": "visual_theme",
  "target": "theme",
  "selected_profile": "playful_spring",
  "store_as_preference": true,
  "requires_confirmation": false,
  "reason": "User explicitly requested a brighter and more playful visual style with high confidence."
}
```

This decision can then be passed to the Adaptation Engine.

The output should be explicit, machine-readable, and easy to log.

---

## Decision Types

The Personalization Engine should support a small set of clear decision types.

```text
adapt
answer_only
ask_clarifying_question
require_confirmation
store_preference_only
reject
no_action
```

---

## 1. `adapt`

The app should apply a change to the current experience.

This is used when:

* the user intent is clear,
* confidence is high,
* the target is known,
* the requested change is allowed,
* and the adaptation creates meaningful value.

### Example

User:

```text
"Make the dashboard simpler and show me only the most important tasks."
```

Decision:

```json
{
  "decision": "adapt",
  "adaptation_type": "workflow_view",
  "target": "dashboard",
  "store_as_preference": true,
  "requires_confirmation": false,
  "reason": "User requested reduced dashboard complexity with high confidence."
}
```

---

## 2. `answer_only`

The app should respond without adapting or storing preferences.

This is used when the user asks a general question or needs information only.

### Example

User:

```text
"What can you do?"
```

Decision:

```json
{
  "decision": "answer_only",
  "adaptation_type": null,
  "target": null,
  "store_as_preference": false,
  "requires_confirmation": false,
  "reason": "User asked a general question about app capabilities."
}
```

---

## 3. `ask_clarifying_question`

The app should ask for clarification before adapting.

This is used when:

* the request is ambiguous,
* confidence is medium or low,
* the target is unclear,
* or multiple interpretations are possible.

### Example

User:

```text
"Make it lighter."
```

Decision:

```json
{
  "decision": "ask_clarifying_question",
  "adaptation_type": null,
  "target": null,
  "store_as_preference": false,
  "requires_confirmation": false,
  "clarification_question": "Do you mean the visual design, the tone of the text, or the amount of detail?",
  "reason": "The requested change is ambiguous."
}
```

This prevents accidental adaptation.

Good personalization should feel intelligent, not like the app randomly rearranged the furniture while you were making coffee.

---

## 4. `require_confirmation`

The app should ask the user to confirm before applying a change.

This is used when the change is significant, persistent, sensitive, or potentially disruptive.

### Example

User:

```text
"Always hide advanced settings from now on."
```

Decision:

```json
{
  "decision": "require_confirmation",
  "adaptation_type": "feature_visibility",
  "target": "advanced_settings",
  "store_as_preference": true,
  "requires_confirmation": true,
  "confirmation_message": "Should I always hide advanced settings unless you ask for them?",
  "reason": "The user requested a persistent change to feature visibility."
}
```

Confirmation is useful for durable changes that alter future behavior.

---

## 5. `store_preference_only`

The system should store a preference without changing the current UI immediately.

This is useful when the preference affects future behavior rather than current state.

### Example

User:

```text
"I usually prefer short, practical explanations."
```

Decision:

```json
{
  "decision": "store_preference_only",
  "adaptation_type": "communication_style",
  "target": "assistant_response",
  "store_as_preference": true,
  "requires_confirmation": false,
  "reason": "User expressed a durable communication preference."
}
```

The current response may acknowledge the preference, but no visual or workflow change is required.

---

## 6. `reject`

The requested adaptation should not be performed.

This is used when:

* the request violates product rules,
* the request is unsafe,
* the action is not allowed,
* the user lacks permission,
* or the target does not exist.

### Example

User:

```text
"Show me another user's private data."
```

Decision:

```json
{
  "decision": "reject",
  "adaptation_type": null,
  "target": null,
  "store_as_preference": false,
  "requires_confirmation": false,
  "reason": "The request violates data access rules."
}
```

Adaptive does not mean obedient to everything.

The app should have a spine. Ideally not made of wet spaghetti.

---

## 7. `no_action`

The app should not adapt or respond with a meaningful change.

This is used when the message is too vague, irrelevant, or not actionable.

### Example

User:

```text
"Hmm."
```

Decision:

```json
{
  "decision": "no_action",
  "adaptation_type": null,
  "target": null,
  "store_as_preference": false,
  "requires_confirmation": false,
  "reason": "The message does not contain an actionable request."
}
```

---

## Decision Flow

A simplified decision flow may look like this:

```text
1. Check intent type.
2. Check confidence score.
3. Resolve target.
4. Check product rules.
5. Check existing preferences.
6. Decide whether the change is temporary or persistent.
7. Decide whether confirmation is required.
8. Return a structured decision.
```

---

## Example Decision Logic

```text
if confidence < 0.50:
    decision = "no_action" or "ask_clarifying_question"

if confidence >= 0.50 and confidence < 0.75:
    decision = "ask_clarifying_question"

if intent == "general_qa":
    decision = "answer_only"

if intent == "preference_update":
    check target
    check product rules
    decide adapt vs store_preference_only

if intent == "system_meta":
    require confirmation for sensitive actions

if intent == "feature_request":
    answer with capability status or capture product signal

if requested change is not allowed:
    decision = "reject"
```

This logic can be implemented with rules, model-assisted reasoning, or a hybrid approach.

For early versions, simple rules are often enough.

Do not build a cathedral when you need a shed with working doors.

---

## Personalization Dimensions

The engine may support multiple personalization dimensions.

### 1. Communication Style

Controls how the app speaks.

Examples:

* concise,
* detailed,
* friendly,
* professional,
* playful,
* technical,
* beginner-friendly,
* motivational.

```json
{
  "dimension": "communication_style",
  "allowed_values": [
    "concise",
    "detailed",
    "friendly",
    "professional",
    "playful",
    "technical"
  ]
}
```

---

### 2. Visual Style

Controls how the app looks and feels.

Examples:

* theme mood,
* color palette,
* density,
* animation level,
* illustration style,
* dark or light mode.

```json
{
  "dimension": "visual_style",
  "allowed_values": {
    "theme_mood": ["minimal", "natural", "playful", "professional"],
    "density": ["compact", "balanced", "comfortable"],
    "animation_level": ["none", "low", "medium", "high"]
  }
}
```

---

### 3. Content Density

Controls how much information the user sees.

Examples:

* summary only,
* balanced,
* detailed,
* expert mode.

```json
{
  "dimension": "content_density",
  "allowed_values": [
    "summary",
    "balanced",
    "detailed",
    "expert"
  ]
}
```

---

### 4. Workflow Guidance

Controls how much support the user receives in a process.

Examples:

* step-by-step,
* checklist,
* autonomous suggestions,
* expert shortcuts.

```json
{
  "dimension": "workflow_guidance",
  "allowed_values": [
    "guided",
    "checklist",
    "minimal",
    "expert"
  ]
}
```

---

### 5. Feature Visibility

Controls which features are highlighted, hidden, grouped, or suggested.

Examples:

* show basic features first,
* hide advanced options,
* pin frequent actions,
* recommend next actions.

```json
{
  "dimension": "feature_visibility",
  "allowed_values": [
    "basic_first",
    "advanced_visible",
    "minimal",
    "recommended"
  ]
}
```

---

## Preference Strength

Not every preference has the same weight.

The engine should distinguish between temporary signals and durable preferences.

### Preference Levels

```text
temporary
session
durable
explicit
```

### Example

```json
{
  "preference": "response_length",
  "value": "concise",
  "strength": "explicit",
  "source": "user_message",
  "created_at": "2026-01-15T10:30:00Z"
}
```

### Suggested Interpretation

| Level       | Meaning                              | Example                                |
| ----------- | ------------------------------------ | -------------------------------------- |
| `temporary` | Applies only to the current response | "Make this answer shorter."            |
| `session`   | Applies during the current session   | "For now, guide me step by step."      |
| `durable`   | May apply in future sessions         | "I usually prefer short explanations." |
| `explicit`  | Strong direct preference             | "Always use concise answers."          |

The stronger and more durable a preference is, the more carefully it should be stored and explained.

---

## Temporary vs Persistent Adaptation

The engine must decide whether an adaptation should be temporary or persistent.

### Temporary Adaptation

Used for local, immediate changes.

Example:

```text
"Make this explanation shorter."
```

This should affect the current output, not necessarily future behavior.

### Persistent Adaptation

Used for durable preferences.

Example:

```text
"From now on, keep explanations short."
```

This may update Preference Memory.

### Decision Example

```json
{
  "decision": "store_preference_only",
  "target": "assistant_response",
  "preference": {
    "key": "response_length",
    "value": "concise",
    "strength": "explicit",
    "scope": "global"
  },
  "reason": "User explicitly requested a future communication preference."
}
```

---

## Scoping Preferences

Preferences should be scoped.

A preference may apply globally, to one app, to one workflow, or to one domain.

### Scope Levels

```text
global
app
workflow
screen
domain_object
session
```

### Example

```json
{
  "preference": {
    "key": "theme_mood",
    "value": "natural_garden",
    "scope": "app",
    "app": "GardenMate"
  }
}
```

Another example:

```json
{
  "preference": {
    "key": "detail_level",
    "value": "expert",
    "scope": "workflow",
    "workflow": "plant_diagnosis"
  }
}
```

Scoping prevents one preference from spreading too far.

A user who wants detailed plant diagnostics does not necessarily want a 900-word explanation for every button label.

---

## Conflict Handling

Preferences may conflict.

Example:

```json
{
  "existing_preference": {
    "key": "content_density",
    "value": "detailed"
  },
  "new_signal": {
    "key": "content_density",
    "value": "summary"
  }
}
```

The engine should decide whether to:

* override the old preference,
* create a scoped exception,
* ask for clarification,
* apply temporarily,
* or keep the existing preference.

### Example Decision

```json
{
  "decision": "require_confirmation",
  "target": "content_density",
  "confirmation_message": "You previously preferred detailed explanations. Should I switch to shorter summaries from now on?",
  "reason": "New preference conflicts with an existing durable preference."
}
```

---

## Product Rules

Product Rules define what the Personalization Engine is allowed to do.

They may be configured per application.

### Example

```json
{
  "product_rules": {
    "theme": {
      "allow_adaptation": true,
      "allowed_profiles": [
        "minimal_light",
        "natural_garden",
        "playful_spring"
      ],
      "requires_confirmation": false
    },
    "feature_visibility": {
      "allow_adaptation": true,
      "requires_confirmation": true
    },
    "data_access": {
      "allow_cross_user_data": false
    }
  }
}
```

The engine must respect these rules.

No matter how confidently the model interprets a request, product rules remain the source of truth.

Confidence is not permission.

That sentence should probably be printed on a mug for every AI product team.

---

## Safety Boundaries

The Personalization Engine should reject or escalate requests that cross safety boundaries.

Examples:

* accessing private data,
* disabling security features,
* hiding important warnings,
* bypassing permissions,
* storing sensitive information unnecessarily,
* making unsupported domain decisions,
* or changing legally relevant content.

### Example

User:

```text
"Hide all safety warnings from now on."
```

Decision:

```json
{
  "decision": "reject",
  "target": "safety_warnings",
  "store_as_preference": false,
  "requires_confirmation": false,
  "reason": "Safety warnings cannot be hidden by personalization."
}
```

Personalization must never weaken safety-critical behavior.

---

## Memory Update Model

When the engine decides to store a preference, it should create a memory update event.

### Example

```json
{
  "event_type": "preference_update",
  "user_id": "user_123",
  "scope": "app",
  "app": "GardenMate",
  "preference": {
    "key": "theme_mood",
    "value": "natural_garden",
    "strength": "explicit"
  },
  "source": {
    "type": "user_message",
    "message_id": "msg_456"
  },
  "timestamp": "2026-01-15T10:30:00Z"
}
```

Memory update events should be logged and reversible.

---

## Decision Record

Every personalization decision should be observable.

A decision record may look like this:

```json
{
  "event_type": "personalization_decision",
  "decision": "adapt",
  "intent": "preference_update",
  "target": "theme",
  "confidence": 0.95,
  "store_as_preference": true,
  "requires_confirmation": false,
  "reason": "User explicitly requested brighter visual style.",
  "timestamp": "2026-01-15T10:30:00Z"
}
```

This supports debugging, analytics, and trust.

If the app changes, developers should be able to answer:

> Why did it change?

Without observability, adaptive behavior becomes a haunted house with JSON.

---

## Example End-to-End Decision

### User Message

```text
"From now on, please keep things short and practical."
```

### Intent Result

```json
{
  "intent": "preference_update",
  "entities": {
    "topic": "communication_style",
    "requested_change": "short and practical",
    "language": "English"
  },
  "tone": "polite",
  "context": "user requests durable response style preference",
  "confidence": 0.96
}
```

### Existing Preferences

```json
{
  "response_length": "balanced",
  "explanation_style": "detailed"
}
```

### Product Rules

```json
{
  "communication_style": {
    "allow_adaptation": true,
    "requires_confirmation": false
  }
}
```

### Personalization Decision

```json
{
  "decision": "store_preference_only",
  "adaptation_type": "communication_style",
  "target": "assistant_response",
  "store_as_preference": true,
  "requires_confirmation": false,
  "preference": {
    "response_length": "concise",
    "explanation_style": "practical_first",
    "strength": "explicit",
    "scope": "global"
  },
  "reason": "User explicitly requested future responses to be short and practical."
}
```

### Result

The app stores the new preference and applies it to future responses.

---

## Example: Visual Adaptation

### User Message

```text
"Make the app feel more calm and less playful."
```

### Personalization Decision

```json
{
  "decision": "adapt",
  "adaptation_type": "visual_theme",
  "target": "theme",
  "selected_profile": "calm_minimal",
  "store_as_preference": true,
  "requires_confirmation": false,
  "reason": "User requested a calm visual style and the app supports theme adaptation."
}
```

### Adaptation Engine Input

```json
{
  "target": "theme",
  "profile": "calm_minimal",
  "constraints": {
    "allowed_properties": [
      "color_palette",
      "spacing",
      "animation_level",
      "illustration_style"
    ]
  }
}
```

The Personalization Engine decides.

The Adaptation Engine applies.

That separation keeps the system clean.

---

## Example: Conflict Resolution

### Existing Preference

```json
{
  "key": "animation_level",
  "value": "low",
  "strength": "explicit"
}
```

### New User Message

```text
"Make the app more animated and lively."
```

### Decision

```json
{
  "decision": "require_confirmation",
  "adaptation_type": "visual_style",
  "target": "animation_level",
  "requires_confirmation": true,
  "confirmation_message": "You previously preferred fewer animations. Should I switch to a more lively animation style from now on?",
  "reason": "The new request conflicts with an existing explicit preference."
}
```

The app can still adapt, but the user stays in control.

---

## Implementation Approaches

The Personalization Engine can be implemented in different ways.

### Rule-Based

A deterministic rule engine maps intents and entities to decisions.

Best for:

* MVPs,
* predictable behavior,
* simple personalization,
* early product validation.

### Model-Assisted

An LLM helps interpret complex context and recommend decisions.

Best for:

* ambiguous language,
* richer personalization,
* complex domain signals.

### Hybrid

Rules enforce boundaries. The model assists within those boundaries.

Best for:

* production systems,
* safety-sensitive products,
* scalable adaptive behavior.

For Illuna, the recommended approach is hybrid:

> Rules define what is allowed.
> AI helps decide what is appropriate.

---

## Minimal MVP Version

A minimal Personalization Engine could be implemented as a simple decision mapper.

```ts
type Decision =
  | "adapt"
  | "answer_only"
  | "ask_clarifying_question"
  | "require_confirmation"
  | "store_preference_only"
  | "reject"
  | "no_action";

interface PersonalizationDecision {
  decision: Decision;
  adaptation_type?: string | null;
  target?: string | null;
  store_as_preference: boolean;
  requires_confirmation: boolean;
  reason: string;
}

function decidePersonalization(input: {
  intent: string;
  confidence: number;
  topic?: string;
  target?: string;
  productRules: Record<string, any>;
}): PersonalizationDecision {
  if (input.confidence < 0.5) {
    return {
      decision: "no_action",
      adaptation_type: null,
      target: null,
      store_as_preference: false,
      requires_confirmation: false,
      reason: "Confidence is too low for adaptation."
    };
  }

  if (input.confidence < 0.75) {
    return {
      decision: "ask_clarifying_question",
      adaptation_type: null,
      target: null,
      store_as_preference: false,
      requires_confirmation: false,
      reason: "Confidence is medium and clarification is required."
    };
  }

  if (input.intent === "general_qa") {
    return {
      decision: "answer_only",
      adaptation_type: null,
      target: null,
      store_as_preference: false,
      requires_confirmation: false,
      reason: "User asked a general question."
    };
  }

  if (input.intent === "preference_update") {
    return {
      decision: "adapt",
      adaptation_type: input.topic ?? "unknown",
      target: input.target ?? "app_experience",
      store_as_preference: true,
      requires_confirmation: false,
      reason: "User provided a high-confidence preference update."
    };
  }

  return {
    decision: "no_action",
    adaptation_type: null,
    target: null,
    store_as_preference: false,
    requires_confirmation: false,
    reason: "No matching decision rule found."
  };
}
```

This is intentionally simple.

An MVP should prove the loop before optimizing the intelligence.

---

## Testing the Personalization Engine

The engine should be tested independently from the LLM.

Suggested test categories:

### Decision Accuracy

Given an intent and context, does the engine choose the expected decision?

### Rule Compliance

Does the engine respect product rules?

### Conflict Handling

Does the engine detect conflicting preferences?

### Memory Safety

Does it avoid storing weak or sensitive signals?

### Confirmation Logic

Does it require confirmation for persistent or disruptive changes?

### Rejection Logic

Does it reject unsupported or unsafe requests?

---

## Test Cases

```json
[
  {
    "name": "High confidence visual preference",
    "input": {
      "intent": "preference_update",
      "confidence": 0.95,
      "topic": "visual_style",
      "target": "theme"
    },
    "expected_decision": "adapt"
  },
  {
    "name": "Ambiguous request",
    "input": {
      "intent": "preference_update",
      "confidence": 0.61,
      "topic": "ambiguous"
    },
    "expected_decision": "ask_clarifying_question"
  },
  {
    "name": "General question",
    "input": {
      "intent": "general_qa",
      "confidence": 0.94,
      "topic": "app_capabilities"
    },
    "expected_decision": "answer_only"
  },
  {
    "name": "Unsafe request",
    "input": {
      "intent": "workflow_request",
      "confidence": 0.97,
      "topic": "private_data_access"
    },
    "expected_decision": "reject"
  }
]
```

---

## Best Practices

### Keep decisions explicit

Every decision should be machine-readable and logged.

### Separate interpretation from action

The classifier interprets. The Personalization Engine decides. The Adaptation Engine applies.

### Prefer small rule sets first

Early versions should be simple and predictable.

### Use confidence carefully

High confidence can support direct adaptation. Low confidence should trigger clarification or no action.

### Respect product boundaries

Product rules are stronger than AI interpretation.

### Make preferences reversible

Users should be able to undo and reset personalization.

### Avoid silent creepiness

Do not store every emotional signal as a durable user preference.

### Explain meaningful changes

When the app adapts significantly, the user should understand what changed.

---

## Summary

The Personalization Engine is the control layer of Illuna.

It turns structured intent and context into clear personalization decisions.

It decides whether the app should:

* adapt,
* answer only,
* ask for clarification,
* store a preference,
* require confirmation,
* reject a request,
* or take no action.

Its role is to make adaptive behavior useful, safe, explainable, and reversible.

Illuna personalization should feel intelligent.

But more importantly, it should feel trustworthy.
