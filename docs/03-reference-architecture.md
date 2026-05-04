# 03 · Reference Architecture


## Overview

Illuna is a reference architecture for building adaptive, AI-personalized applications.

The architecture describes how natural language input can be transformed into structured intent, personalization decisions, and controlled application behavior.

At a high level, Illuna consists of six layers:

```text
┌──────────────────────────────────────────────┐
│               User Experience                │
│     Chat UI · App UI · Feedback Controls     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              Interaction Layer               │
│      Message Handling · Session Context      │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              Intelligence Layer              │
│ Intent Classification · Context Reasoning    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│            Personalization Layer             │
│ Preference Memory · Adaptation Decisions     │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│               Adaptation Layer               │
│     UI Changes · Workflow Changes · Rules    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│              Application Layer               │
│      Product Logic · Domain Data · APIs      │
└──────────────────────────────────────────────┘
```

Each layer has a clear responsibility.

The goal is to avoid building a chaotic AI assistant inside an application.

Illuna treats AI as a structured product capability, not as a random text box with ambition.

---

## Architecture Goals

The reference architecture is designed around the following goals:

* transform natural language into structured application behavior,
* keep adaptive behavior explainable,
* separate AI reasoning from product execution,
* allow developers to define clear boundaries,
* make personalization reversible and observable,
* support multiple applications using a shared framework,
* and provide a foundation for future framework-as-a-service integration.

The architecture is intentionally modular.

Applications can adopt the full model or start with a smaller subset.

---

## Core Components

The Illuna architecture contains the following core components:

```text
User
 │
 ▼
Chat / App Interface
 │
 ▼
Interaction Gateway
 │
 ▼
Intent Classifier
 │
 ▼
Context Engine
 │
 ▼
Personalization Engine
 │
 ▼
Adaptation Engine
 │
 ▼
Application Runtime
 │
 ▼
Domain Services / Data Sources
```

---

## 1. Chat / App Interface

The interface is where the user interacts with the adaptive application.

This may include:

* a chat input,
* standard app screens,
* buttons and forms,
* feedback controls,
* settings,
* generated UI elements,
* or guided workflows.

Illuna does not require the entire application to be chat-only.

Instead, chat acts as an additional interaction layer that allows the user to express intent naturally.

The interface should support both:

* direct interaction with app features,
* and conversational adaptation of the experience.

### Responsibilities

The Chat / App Interface is responsible for:

* capturing user input,
* displaying responses,
* showing adapted UI states,
* allowing users to confirm or undo changes,
* exposing personalization controls,
* and communicating state changes clearly.

### Example

A user says:

```text
"Make the dashboard simpler and show me only the most important tasks."
```

The interface sends the message together with current screen context to the interaction layer.

---

## 2. Interaction Gateway

The Interaction Gateway receives user messages and prepares them for processing.

It acts as the entry point into the Illuna intelligence pipeline.

### Responsibilities

The Interaction Gateway is responsible for:

* normalizing incoming messages,
* attaching session metadata,
* attaching current app state,
* enforcing basic request limits,
* routing the message to the correct processing pipeline,
* and collecting the response from downstream components.

### Example Payload

```json
{
  "message": "Make the dashboard simpler and show me only the most important tasks.",
  "session": {
    "id": "session_123",
    "locale": "en-US",
    "device": "desktop"
  },
  "app_state": {
    "app": "GardenMate",
    "screen": "dashboard",
    "active_workflow": "weekly_garden_plan"
  }
}
```

The gateway should remain simple.

Its job is not to make deep AI decisions.

Its job is to provide clean input to the system.

---

## 3. Intent Classifier

The Intent Classifier converts natural language into structured intent.

It identifies what the user wants and whether the message contains a personalization signal.

### Responsibilities

The Intent Classifier is responsible for detecting:

* general questions,
* preference updates,
* design requests,
* workflow requests,
* system-level actions,
* feedback,
* unknown or ambiguous requests.

### Example Output

```json
{
  "intent": "preference_update",
  "entities": {
    "topic": "dashboard_complexity",
    "requested_change": "simplify",
    "language": "English"
  },
  "tone": "direct",
  "context": "user wants to reduce dashboard complexity",
  "confidence": 0.92
}
```

### Design Principle

Intent classification should be structured and predictable.

It should not directly modify the application.

It produces a decision input, not a product change.

That separation matters.

Otherwise every misunderstood sentence becomes a tiny UX goblin.

---

## 4. Context Engine

The Context Engine enriches the classified intent with relevant application and user context.

Intent without context is often incomplete.

For example, the message:

```text
"Make it lighter."
```

could refer to visual design, writing style, task load, or content density.

The Context Engine helps resolve this ambiguity.

### Responsibilities

The Context Engine may use:

* current screen,
* active workflow,
* previous user messages,
* stored preferences,
* app-specific rules,
* user role,
* device type,
* locale,
* domain data,
* and product boundaries.

### Example Output

```json
{
  "resolved_context": {
    "target": "dashboard",
    "likely_dimension": "content_density",
    "current_density": "high",
    "allowed_modes": ["compact", "balanced", "guided"]
  },
  "confidence": 0.86
}
```

The Context Engine should not invent context.

It should work with known app state and clearly defined rules.

If context is unclear, the system should ask a clarifying question.

---

## 5. Personalization Engine

The Personalization Engine decides whether and how the application should adapt.

It combines:

* intent,
* context,
* preference memory,
* product rules,
* confidence scores,
* and safety boundaries.

### Responsibilities

The Personalization Engine is responsible for:

* deciding whether an adaptation should happen,
* deciding whether confirmation is required,
* updating preference memory,
* creating adaptation plans,
* rejecting unsafe or invalid changes,
* and producing a structured decision.

### Example Decision

```json
{
  "decision": "adapt",
  "adaptation_type": "workflow_view",
  "target": "dashboard",
  "requires_confirmation": false,
  "store_as_preference": true,
  "reason": "User requested reduced dashboard complexity with high confidence."
}
```

### Possible Decisions

The engine may return:

```text
adapt
ask_clarifying_question
answer_only
reject
require_confirmation
store_preference_only
```

This keeps behavior explicit.

The app does not adapt just because an AI model felt inspired after three tokens and a coffee.

---

## 6. Preference Memory

Preference Memory stores durable user preferences.

It allows the application to personalize future interactions.

### Examples

```json
{
  "user_id": "user_123",
  "preferences": {
    "tone": "friendly and concise",
    "content_density": "balanced",
    "theme_mood": "light_natural",
    "animation_level": "medium",
    "explanation_style": "practical_first"
  }
}
```

### Responsibilities

Preference Memory should support:

* reading preferences,
* updating preferences,
* scoping preferences per app,
* scoping preferences per domain,
* reverting changes,
* explaining stored preferences,
* and deleting personalization data.

### Important Principle

Preference Memory should be user-controlled.

Users should be able to inspect and reset what the application remembers.

Adaptive should never become suspiciously clingy software.

---

## 7. Adaptation Engine

The Adaptation Engine translates personalization decisions into concrete application changes.

It does not decide whether adaptation is appropriate.

It executes approved adaptation plans.

### Responsibilities

The Adaptation Engine may produce changes for:

* UI themes,
* layout density,
* language style,
* visible features,
* workflow steps,
* notification behavior,
* generated content,
* or app-specific modules.

### Example Adaptation Plan

```json
{
  "target": "dashboard",
  "changes": {
    "content_density": "balanced",
    "visible_sections": [
      "today_tasks",
      "urgent_plant_alerts",
      "weekly_progress"
    ],
    "hidden_sections": [
      "advanced_metrics",
      "historical_details"
    ]
  },
  "undo_available": true
}
```

### Design Principle

The Adaptation Engine should operate through predefined adaptation targets.

It should not freely rewrite the product.

Developers define what can be adapted.

The engine only applies changes within those boundaries.

---

## 8. Application Runtime

The Application Runtime is the actual product experience.

It renders screens, executes workflows, calls APIs, and manages domain logic.

In Illuna, the Application Runtime exposes controlled adaptation targets.

### Examples

An app may expose:

```json
{
  "adaptation_targets": {
    "theme": ["color_palette", "density", "animation_level"],
    "dashboard": ["visible_sections", "sort_order", "detail_level"],
    "assistant": ["tone", "response_length", "explanation_style"],
    "workflow": ["mode", "step_visibility", "guidance_level"]
  }
}
```

The runtime remains responsible for business logic.

The AI layer should not bypass product rules.

If the app says a feature is not available, the AI layer should not pretend it found a secret door behind the couch.

---

## 9. Domain Services and Data Sources

Domain Services provide application-specific capabilities.

In GardenMate, this could include:

* plant profiles,
* watering recommendations,
* garden tasks,
* weather context,
* user garden data,
* seasonal planning,
* reminders,
* and care history.

In another application, domain services may be completely different.

Illuna does not define the domain.

It defines how personalization can interact with the domain.

### Responsibilities

Domain Services are responsible for:

* providing trusted domain data,
* executing business operations,
* enforcing domain rules,
* validating changes,
* and exposing safe APIs to the application runtime.

---

## Data Flow

A typical Illuna interaction follows this flow:

```text
1. User sends a natural language message.
2. Interface forwards message and app state.
3. Interaction Gateway normalizes the request.
4. Intent Classifier identifies structured intent.
5. Context Engine resolves relevant app context.
6. Personalization Engine decides what should happen.
7. Preference Memory is read or updated.
8. Adaptation Engine creates an adaptation plan.
9. Application Runtime applies allowed changes.
10. User receives adapted experience and can give feedback.
```

---

## Summary

The Illuna reference architecture separates adaptive applications into clear layers:

* User Experience
* Interaction Gateway
* Intent Classification
* Context Engine
* Personalization Engine
* Preference Memory
* Adaptation Engine
* Application Runtime
* Domain Services

This separation keeps the system understandable, testable, and safe.

Illuna is not about adding AI decoration to an app.

It is about building applications that can understand, adapt, and evolve — without losing product control.

---
