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
