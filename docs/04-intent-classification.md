# 04-intent-classification.md

# Intent Classification

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

## Why Intent Classification Matters

Adaptive applications need to understand more than the literal text of a message.

They need to understand what kind of action the message represents.

A user message may be:

* a question,
* a command,
* feedback,
* a preference update,
* a request for visual adaptation,
* a workflow instruction,
* a system-level action,
* or an ambiguous signal.

Without intent classification, every message becomes just text.

With intent classification, every message becomes a possible product signal.

The goal is not only to answer the user.

The goal is to understand whether the app should adapt.

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

This separation is important.

The classifier interprets.

It does not execute.

Otherwise, every misunderstood sentence gets promoted to product manager. And nobody wants that. Not even the sentence.

---

## Intent Output Schema

A simple Illuna intent output may look like this:

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

## Minimal Intent Taxonomy

```text
general_qa
preference_update
workflow_request
feature_request
feedback
system_meta
other
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
- general_qa
- preference_update
- workflow_request
- feature_request
- feedback
- system_meta
- other

Rules:
1. Do not answer the user.
2. Do not execute actions.
3. Do not update preferences.
4. If uncertain, choose the closest intent and lower the confidence score.
5. Keep the output minimal and structured.
6. Return JSON only.

Output schema:

{
  "intent": "string",
  "entities": {
    "topic": "string",
    "language": "string"
  },
  "tone": "string",
  "context": "string",
  "confidence": 0.0
}
```

---

## TypeScript Interface

A simple TypeScript representation may look like this:

```ts
export type IllunaIntent =
  | "general_qa"
  | "preference_update"
  | "workflow_request"
  | "feature_request"
  | "feedback"
  | "system_meta"
  | "other";

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

Users rarely speak like documentation.

They say things like:

```text
"Can this be less corporate and more cozy?"
```

And the system needs to survive that beautifully chaotic little gift.

---

## Summary

Intent Classification turns natural language into structured product signals.

It helps Illuna understand whether a user message is:

* a question,
* a preference,
* a workflow request,
* feedback,
* a feature idea,
* a system action,
* or something unclear.

The classifier does not execute changes.

It creates structured input for the rest of the Illuna pipeline.

This makes adaptive behavior more reliable, testable, and safe.

In Illuna, Intent Classification is the first step from conversation to application behavior.

---
