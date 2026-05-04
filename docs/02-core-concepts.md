# 02 · Core Concepts

## Conceptual Architecture

A simplified conceptual model looks like this:

```text
┌────────────────────┐
│    User Input       │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Intent Classifier   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Context Engine      │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Personalization     │
│ Decision Engine     │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Adaptation Layer    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ App Experience      │
└────────────────────┘
```

Each layer has a clear responsibility.

This separation is important because adaptive apps need structure.

Without structure, every chat message becomes a tiny production incident wearing a friendly smile.

---

## Example Flow

User says:

```text
"Can you make the app brighter and a bit more playful? It should feel more like spring."
```

The system interprets:
# Core Concepts

## From Static Apps to Adaptive Experiences

Most applications today are static by default.

They may offer settings, themes, filters, dashboards, or notifications — but the core experience usually remains the same for every user.

Illuna is based on a different model:

> Applications should be able to understand user intent, detect preference signals, and adapt their behavior over time.

An adaptive app is not only an app with AI inside.

It is an app where AI becomes part of the interaction model, personalization layer, and product logic.

---

## The Illuna Model

Illuna describes adaptive applications through a simple flow:

```text
User Message
    ↓
Intent Understanding
    ↓
Context Interpretation
    ↓
Personalization Decision
    ↓
App Adaptation
    ↓
User Feedback
    ↓
Continuous Learning
```

This flow turns natural language into structured product behavior.

The user does not need to configure the app manually. They can express what they want, how they feel, or how the app should behave — and the system translates this into controlled adaptation.

---

## 1. User Message

The user message is the starting point of every adaptive interaction.

It may contain:

* a direct request,
* a question,
* feedback,
* frustration,
* a preference,
* a design instruction,
* a workflow request,
* or a context update.

Examples:

```text
"Make this easier to understand."
```

```text
"I prefer a more professional tone."
```

```text
"Can you show me only the important tasks?"
```

```text
"This design feels too dark. Make it lighter and more natural."
```

In traditional apps, these messages are often ignored, treated as support input, or answered once.

In Illuna, they become product signals.

---

## 2. Intent Understanding

Intent understanding is the process of converting natural language into structured meaning.

The goal is not only to answer the user.

The goal is to understand what kind of product behavior should follow.

A simplified intent classification may look like this:

```json
{
  "intent": "preference_update",
  "entities": {
    "topic": "visual_style",
    "style": "bright, playful, spring-like",
    "language": "English"
  },
  "tone": "friendly",
  "context": "user wants visual personalization",
  "confidence": 0.93
}
```

The personalization engine decides:

```json
{
  "adaptation_type": "visual_theme",
  "target": "theme_profile",
  "changes": {
    "color_palette": "light_natural",
    "animation_level": "medium",
    "mood": "spring"
  },
  "store_as_preference": true
}
```

The app adapts:

```json
{
  "theme": {
    "background": "light",
    "primary_mood": "natural",
    "animation": "soft",
    "density": "comfortable"
  }
}
```

The result:

The user experiences an app that reacts meaningfully to natural language feedback.

Not by generating a random theme.

But by translating intent into controlled product behavior.

---

## Core Principle

The most important idea behind Illuna is this:

> The user should not have to adapt to the app.
> The app should adapt to the user.

But adaptation must be structured.

It must be safe, explainable, reversible, and useful.

Illuna exists to explore exactly that balance.

---
    "language": "English"
  },
  "tone": "curious",
  "context": "user interacting with an adaptive app",
  "confidence": 0.89
}
```

Intent understanding helps the system decide whether the message is:

* a general question,
* a preference update,
* a design request,
* a feature request,
* a workflow instruction,
* a system-level action,
* or something that requires clarification.

This layer creates the bridge between language and application logic.

---

## 3. Context Interpretation

Intent alone is not enough.

The same message can mean different things depending on context.

For example:

```text
"Make it lighter."
```

This could refer to:

* visual theme,
* tone of voice,
* content density,
* task complexity,
* emotional mood,
* or computational workload.

Context interpretation combines the user message with relevant app state.

This may include:

* current screen,
* active workflow,
* user role,
* previous preferences,
* device type,
* recent actions,
* domain-specific data,
* product constraints,
* and safety boundaries.

The purpose of context interpretation is to avoid random or naive adaptation.

The app should not simply react. It should react appropriately.

---

## 4. Personalization Signals

A personalization signal is any user input or behavior that may indicate how the app should adapt.

Signals can be explicit or implicit.

### Explicit signals

The user directly says what they want.

Examples:

```text
"Use a more casual tone."
```

```text
"Switch to dark mode."
```

```text
"Show me fewer details."
```

```text
"I like this layout."
```

### Implicit signals

The system infers a possible preference from behavior.

Examples:

* the user repeatedly closes detailed explanations,
* the user often asks for summaries,
* the user always switches to a specific view,
* the user corrects the tone several times,
* the user prefers visual output over long text.

Implicit signals should be handled carefully.

They should support adaptation, but not silently override the user’s control.

---

## 5. Preference Memory

Preference memory stores durable personalization information.

It helps the application remember how the user prefers to interact.

Examples:

```json
{
  "tone": "friendly and concise",
  "theme": "light natural garden style",
  "content_density": "medium",
  "preferred_language": "German",
  "explanation_style": "practical examples first"
}
```

Preference memory should be:

* transparent,
* editable,
* scoped,
* privacy-aware,
* and reversible.

A user should always be able to understand what the app remembers and change it.

Personalization should feel helpful, not creepy.

That sentence is technical architecture and good manners in one trench coat.

---

## 6. Adaptation Rules

Adaptation rules define how interpreted intent becomes app behavior.

They prevent the system from making uncontrolled or inconsistent changes.

Example:

```json
{
  "when": {
    "intent": "preference_update",
    "entities.topic": "visual_style"
  },
  "then": {
    "update": "theme_profile",
    "requires_confirmation": false,
    "allowed_properties": [
      "color_palette",
      "animation_level",
      "density",
      "mood"
    ]
  }
}
```

Adaptation rules may control:

* which changes are allowed,
* which changes require confirmation,
* which changes are temporary,
* which changes are stored,
* and which changes are blocked.

This is important because adaptive apps should not become unpredictable apps.

A smart app is nice. A chaotic app with confidence is just Jira with fireworks.

---

## 7. App Adaptation

App adaptation is the visible or functional change caused by the personalization system.

Adaptation may affect different layers.

### Language adaptation

The app changes its wording, tone, or explanation style.

Examples:

* concise,
* playful,
* professional,
* beginner-friendly,
* technical,
* motivational.

### Visual adaptation

The app changes its look and feel.

Examples:

* color palette,
* typography scale,
* spacing,
* animation level,
* icon style,
* light or dark mode.

### Workflow adaptation

The app changes how a task is presented or guided.

Examples:

* fewer steps,
* more explanations,
* suggested next actions,
* checklist mode,
* expert mode,
* guided mode.

### Feature adaptation

The app changes which functions are highlighted or available.

Examples:

* pinning frequently used tools,
* hiding advanced settings,
* recommending relevant modules,
* enabling domain-specific shortcuts.

Adaptation should always support the user’s goal.

It should not be personalization for decoration only.

---

## 8. Product Boundaries

AI-driven adaptation must operate within product boundaries.

Illuna does not assume that an app should do anything a user asks.

Every app needs constraints.

Examples:

* allowed feature areas,
* business rules,
* security rules,
* compliance requirements,
* design system limits,
* data access policies,
* pricing or entitlement rules,
* domain-specific safety checks.

Product boundaries ensure that adaptive behavior remains reliable, testable, and safe.

The app may adapt its behavior, but it should still remain the product it was designed to be.

---

## 9. Feedback Loop

Adaptive apps improve through feedback.

Feedback can be direct:

```text
"That was helpful."
```

```text
"No, make it simpler."
```

```text
"Keep this style."
```

Or indirect:

* repeated usage,
* ignored suggestions,
* manual reversions,
* changed preferences,
* abandoned flows.

The feedback loop helps the system refine future decisions.

However, feedback should not be treated as unlimited permission.

The user remains in control.

---

## 10. Confidence

AI-based interpretation is probabilistic.

That means the system should understand how confident it is before changing app behavior.

For example:

```json
{
  "intent": "preference_update",
  "confidence": 0.94
}
```

A high-confidence result may trigger direct adaptation.

A low-confidence result may trigger clarification:

```text
Did you mean the visual design, the wording, or the amount of detail?
```

Confidence helps balance responsiveness and safety.

The app should feel fast, but not reckless.

---

## 11. Human Control

Adaptive does not mean autonomous without limits.

Users should be able to:

* inspect preferences,
* reset personalization,
* undo changes,
* switch modes,
* disable adaptation,
* and correct the system.

Illuna treats personalization as a collaboration between user and app.

The system may suggest and adapt.

The user remains the final authority.

---

## 12. Developer Control

Developers need clear control over adaptive behavior.

An adaptive framework must be understandable, testable, and observable.

Developers should be able to define:

* available intents,
* allowed adaptations,
* product boundaries,
* UI adaptation targets,
* memory scope,
* safety rules,
* and fallback behavior.

This prevents AI from becoming a black box inside the application.

Illuna should make adaptive behavior easier to build, not harder to reason about.
