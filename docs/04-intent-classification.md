# 04 · Intent Classification

## Overview

Intent Classification is one of the core building blocks of Illuna.

It converts natural language input into structured intent that an application can understand and act upon.

In traditional applications, user input is usually limited to forms, buttons, menus, and predefined workflows.

In adaptive applications, users can express intent naturally.

They may say:

```text
"Make this easier to understand."
```

```text
"Use a more professional tone."
```

```text
"Show me fewer details."
```

```text
"This design feels too dark. Make it brighter."
```

Illuna uses Intent Classification to transform these messages into structured signals.

Those signals can then be used by downstream components such as the Context Engine, Personalization Engine, and Adaptation Engine.

---

## Objective

Classify user intent as the basis for selecting the right actions and adaptive UI responses.

The classifier should produce structured output that is directly usable by the Personalization Engine.

---

## Core Principle

Intent Classification should produce structured output.

The classifier should not directly change the application.

It should only describe what the user likely means.

```text
User Message
    ↓
Intent Classifier
    ↓
Structured Intent
    ↓
Context Engine
    ↓
Personalization / App Logic
```

The classifier interprets.

It does not execute.

---

## Recommended Intent Taxonomy

The taxonomy should stay consistent with the concepts used in the other Illuna documents.

- `information_request` (user asks for explanation or facts)
- `task_request` (user asks the app to do or prepare something)
- `preference_update` (user expresses durable style or behavior preferences)
- `ui_adaptation_request` (user asks for a UI change such as theme, density, or layout)
- `workflow_guidance_request` (user asks for more or less guidance)
- `feedback_signal` (user evaluates a result: positive, negative, corrective)
- `clarification_response` (user answers a disambiguation question)
- `system_action_request` (user asks for reset, undo, export, or account-level actions)

---

## Minimal Output Schema

```json
{
  "intent": "preference_update",
  "entities": {
    "topic": "visual_style",
    "language": "English"
  },
  "tone": "friendly",
  "context": "user requests visual personalization",
  "confidence": 0.92
}
```

---

## Prompt Template

A simple intent classification prompt may look like this:

```text
You are the Intent Classifier.

Your task is to classify the user's message into a structured intent object.

Return only valid JSON.

Identify:
- the user's main intent,
- relevant entities,
- tone,
- short context,
- and confidence score.

Allowed intents:
- information_request
- task_request
- preference_update
- ui_adaptation_request
- workflow_guidance_request
- feedback_signal
- clarification_response
- system_action_request

Rules:
1. Do not answer the user.
2. Do not execute actions.
3. Do not update preferences.
4. If uncertain, choose the closest intent and lower the confidence score.
5. Keep the output minimal and structured.
6. Return JSON only.
```

---

## TypeScript Interface

A simple TypeScript representation may look like this:

```ts
export type IllunaIntent =
  | "information_request"
  | "task_request"
  | "preference_update"
  | "ui_adaptation_request"
  | "workflow_guidance_request"
  | "feedback_signal"
  | "clarification_response"
  | "system_action_request";

export interface IntentEntities {
  topic: string;
  language: string;
  target?: string;
  requested_change?: string;
  style?: string;
  format?: string;
  sentiment?: "positive" | "negative" | "mixed" | "neutral";
  action?: string;
  timeframe?: string;
  domain_object?: string;
}

export interface IntentClassificationResult {
  intent: IllunaIntent;
  entities: IntentEntities;
  tone: string;
  context: string;
  confidence: number;
}
```

---

## Best Practices

### Keep the taxonomy small at first

Start with a few broad intents.

Expand only when needed.

### Separate classification from execution

The classifier should never directly change the app.

### Use confidence carefully

Low confidence should lead to clarification, not random adaptation.

### Store only durable preferences

Not every message should become memory.

### Make outputs predictable

Downstream systems need structured and stable JSON.

### Test with real user language

Use examples from real product usage, not only synthetic test phrases.
