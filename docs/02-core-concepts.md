# 02 · Core Concepts

## From Static Apps to Adaptive Experiences

Most applications today are static by default.

They may offer settings, themes, filters, dashboards, or notifications — but the core experience usually remains the same for every user.

Illuna is based on a different model:

> Applications should be able to understand user intent, interpret context, remember meaningful preferences, and adapt their behavior over time.

The next step after AI assistants is not just smarter chat.

It is context-aware software.

AI assistants have shown users that software can understand context, remember preferences, and respond in a way that feels personal. Illuna brings this expectation into the application layer — so every app can feel personal without every developer rebuilding personalization from scratch.

An adaptive app is not only an app with AI inside.

It is an app where AI becomes part of the interaction model, personalization layer, context layer, and product logic.

---

## The Illuna Model

Illuna describes adaptive applications through a simple flow:

![Illuna Model](assets/illuna_user_flow_in_detail.png)

This flow turns natural language into structured product behavior.

The user does not need to configure the app manually. They can express what they want, how they feel, what context matters, or how the app should behave — and the system translates this into controlled adaptation.

---

## Concept Architecture (visual)

![Illuna Concept Architecture](assets/illuna_adaptive_flow.png)

The diagram summarizes the same flow: user message → intent understanding → context interpretation → user context layer → personalization decision → app adaptation, with a feedback loop for continuous learning.

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
"I am new to this and only have 10 minutes."
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

Intent understanding helps the system decide whether the message is:

* a general question,
* a preference update,
* a design request,
* a feature request,
* a workflow instruction,
* a system-level action,
* a context update,
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
* previous user preferences,
* device type,
* accessibility settings,
* recent interaction history,
* and domain-specific context.

Without context, adaptation can become noisy or incorrect.

Context interpretation answers:

> What does this message mean in this situation?

---

## 4. User Context Layer

The User Context Layer is the part of Illuna that connects memory, user preferences, app state, and product rules.

It helps the application understand not only what the user says now, but what is relevant about the user’s current and previous interactions.

The next step after AI assistants is not just smarter chat.

It is context-aware software.

Illuna brings memory, user context, and adaptive behavior into the application layer — so every app can feel personal without every developer rebuilding personalization from scratch.

The goal is not to make every app a chatbot.

The goal is to help every app understand the user better and adapt the product experience accordingly.

The User Context Layer may include:

* explicit preferences,
* inferred preference signals,
* skill level,
* preferred tone,
* explanation depth,
* workflow habits,
* accessibility needs,
* recurring goals,
* recent interaction history,
* current screen or workflow,
* and app-specific context.

The User Context Layer does not blindly remember everything.

It only stores and uses context when it is useful, allowed, explainable, and aligned with product rules.

A user context record may look like this:

```json
{
  "skill_level": {
    "value": "beginner",
    "scope": "GardenMate",
    "strength": "explicit"
  },
  "available_time": {
    "value": "20_minutes_per_week",
    "scope": "garden_planning",
    "strength": "explicit"
  },
  "language_preference": {
    "value": "simple_non_technical",
    "scope": "plant_care_guidance",
    "strength": "explicit"
  }
}
```

This context can help the application adapt future experiences:

* show weekly priorities instead of long task lists,
* explain terms in simpler language,
* reduce advanced controls,
* prioritize relevant next actions,
* and use a tone that matches the user’s needs.

The user does not need to repeat the same context every time.

### User Context Is Not Just Memory

Memory alone is not enough.

A stored preference only becomes useful when the application knows how to apply it in the right context.

For example:

```text
"I prefer short explanations."
```

This may affect assistant responses, onboarding text, help content, and workflow guidance.

But it should not necessarily shorten legal notices, safety warnings, or critical product information.

That is why Illuna treats user context as more than a memory store.

It combines:

```text
User Preferences
        +
Current App Context
        +
Product Rules
        +
Adaptation Boundaries
        ↓
Context-Aware Product Behavior
```

The app does not just remember.

It decides when memory is relevant.

### Temporary vs Durable Context

Not every signal should become permanent.

A user may say:

```text
"Make this shorter."
```

That may only apply to the current answer.

Another user may say:

```text
"From now on, keep explanations short and practical."
```

That may become a durable preference.

The User Context Layer should distinguish between:

| Context Type | Meaning                                        | Example                                |
| ------------ | ---------------------------------------------- | -------------------------------------- |
| Temporary    | Applies only now                               | “Make this answer shorter.”            |
| Session      | Applies during the current session             | “For now, guide me step by step.”      |
| Scoped       | Applies to a specific app, workflow, or screen | “Use expert mode for plant diagnosis.” |
| Durable      | Applies across future interactions             | “I usually prefer short explanations.” |
| Explicit     | Strong direct preference                       | “Always show me the expert view.”      |

This keeps personalization helpful, scoped, and predictable.

---

## 5. Personalization Decision

After intent, context, and user context are understood, the system decides what to do.

The personalization layer determines whether to:

* adapt immediately,
* ask for clarification,
* store a preference,
* update user context,
* request confirmation,
* reject an unsupported change,
* or respond without adaptation.

Example decision:

```json
{
  "decision": "adapt",
  "adaptation_type": "visual_theme",
  "target": "theme_profile",
  "changes": {
    "color_palette": "light_natural",
    "animation_level": "medium",
    "mood": "spring"
  },
  "store_as_preference": true,
  "requires_confirmation": false,
  "reason": "User explicitly requested a lighter and more natural visual style."
}
```

This keeps adaptation predictable and policy-driven.

The personalization layer must respect product rules.

A user preference is not automatically a command.

For example:

```text
"Hide all warnings from now on."
```

The system may understand the request, but product rules should reject it.

Confidence is not permission.

---

## 6. App Adaptation

The application translates the decision into concrete behavior.

The app may adapt:

* theme and color mood,
* layout density,
* tone and wording,
* feature visibility,
* workflow guidance,
* content prioritization,
* explanation depth,
* or interaction style.

Example output:

```json
{
  "theme": {
    "background": "light",
    "primary_mood": "natural",
    "animation": "soft",
    "density": "comfortable"
  },
  "guidance": {
    "level": "beginner",
    "explanation_depth": "simple",
    "task_view": "weekly_priorities"
  }
}
```

The result should feel intentional, understandable, and reversible.

The application does not adapt randomly.

It adapts because user intent, context, user preferences, and product rules support the change.

---

## Core Principle

The most important idea behind Illuna is this:

> The user should not have to adapt to the app.
> The app should adapt to the user.

But adaptation must be structured.

It must be safe, explainable, reversible, and useful.

Illuna exists to explore exactly that balance.

The deeper value is not smarter chat.

The deeper value is context-aware application behavior.
