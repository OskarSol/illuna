# Adaptive UI Patterns

## Overview

Adaptive UI Patterns describe how an application can change its interface based on user intent, preferences, context, and behavior.

In Illuna, the user interface is not treated as a fixed surface.

It becomes a responsive layer that can adjust within clear product and design boundaries.

Adaptive UI does not mean randomly generated UI.

It means controlled variation.

The application may adapt:

* tone,
* layout,
* density,
* color mood,
* animation level,
* feature visibility,
* workflow guidance,
* and content presentation.

The goal is to make the app feel more useful, more personal, and easier to interact with.

---

## Core Principle

Adaptive UI should support the user’s goal.

It should not adapt just to look clever.

A UI change is only valuable if it improves:

* clarity,
* usability,
* focus,
* accessibility,
* emotional fit,
* task completion,
* or user confidence.

```text
User Intent
    ↓
Personalization Decision
    ↓
Design Constraints
    ↓
Adaptive UI Pattern
    ↓
Rendered Experience
```

Adaptive UI is product design with controlled flexibility.

Not chaos with rounded corners.

---

## What Adaptive UI Is

Adaptive UI means the interface can respond to user signals.

Examples:

```text
"Make this simpler."
```

The app may reduce visual complexity, hide secondary details, and switch to a guided layout.

```text
"Use a more professional style."
```

The app may adjust tone, color mood, spacing, and content wording.

```text
"Show me only what matters today."
```

The app may prioritize urgent tasks and hide long-term planning sections.

```text
"This feels too playful."
```

The app may reduce animations and switch to a calmer visual style.

---

## What Adaptive UI Is Not

Adaptive UI is not:

* uncontrolled AI-generated layouts,
* random theme generation,
* moving buttons unpredictably,
* hiding important information,
* replacing product strategy with prompts,
* or changing critical workflows without user control.

Adaptive UI should be flexible, but stable.

Users should never feel like the app changed into a different product overnight.

A personalized app should feel helpful.

Not like the settings menu escaped and started a new life.

---

## Pattern Categories

Illuna groups adaptive UI patterns into six categories:

```text
1. Tone Adaptation
2. Visual Theme Adaptation
3. Content Density Adaptation
4. Layout Adaptation
5. Workflow Guidance Adaptation
6. Feature Visibility Adaptation
```

Each category can be implemented independently.

An MVP may start with only one or two.

---

# 1. Tone Adaptation

Tone Adaptation changes how the app communicates.

It affects text, labels, hints, explanations, summaries, errors, and guidance.

## Use Cases

Tone adaptation is useful when users say:

```text
"Use a more casual tone."
```

```text
"Make this sound more professional."
```

```text
"Explain it like I am a beginner."
```

```text
"Be more direct."
```

```text
"Make it friendlier."
```

## Possible Tone Profiles

```json
{
  "tone_profiles": [
    "neutral",
    "friendly",
    "professional",
    "playful",
    "technical",
    "beginner_friendly",
    "direct",
    "motivational"
  ]
}
```

## Example

User:

```text
"Make the app sound less corporate and more friendly."
```

Before:

```text
Your task list has been generated based on available garden maintenance data.
```

After:

```text
Here’s your garden plan for today — nice and simple.
```

## Implementation Idea

```json
{
  "adaptation_type": "tone",
  "target": "assistant_response",
  "profile": "friendly",
  "scope": "app",
  "store_as_preference": true
}
```

## Design Rule

Tone should adapt within product boundaries.

A finance app can be friendlier without sounding like a pirate. Unless the product is called “Budget Buccaneer”, in which case: carry on.

---

# 2. Visual Theme Adaptation

Visual Theme Adaptation changes the emotional and visual mood of the app.

It may affect:

* color palette,
* background treatment,
* illustration style,
* icon style,
* shadows,
* border radius,
* contrast,
* and motion style.

## Use Cases

Visual theme adaptation is useful when users say:

```text
"Make it brighter."
```

```text
"I want a calmer design."
```

```text
"Make it feel more like spring."
```

```text
"Use a more elegant style."
```

```text
"This looks too dark."
```

## Theme Profiles

Instead of generating arbitrary colors, Illuna should use predefined theme profiles.

```json
{
  "theme_profiles": {
    "minimal_light": {
      "mood": "clean",
      "brightness": "high",
      "animation_level": "low"
    },
    "natural_garden": {
      "mood": "organic",
      "brightness": "medium_high",
      "animation_level": "medium"
    },
    "calm_focus": {
      "mood": "calm",
      "brightness": "medium",
      "animation_level": "low"
    },
    "professional_dark": {
      "mood": "serious",
      "brightness": "low",
      "animation_level": "none"
    }
  }
}
```

## Example

User:

```text
"Make it look more like a garden, brighter and with soft animations."
```

Adaptation:

```json
{
  "adaptation_type": "visual_theme",
  "target": "app_theme",
  "selected_profile": "natural_garden",
  "changes": {
    "brightness": "medium_high",
    "animation_level": "medium",
    "illustration_style": "soft_organic"
  }
}
```

## Design Rule

Theme adaptation should use controlled design tokens.

```json
{
  "design_tokens": {
    "color.primary": "#6BA368",
    "color.background": "#F7FAF3",
    "radius.card": "24px",
    "motion.level": "medium"
  }
}
```

The app should not invent a full visual identity for every user message.

That way lies rainbow spreadsheet energy.

---

# 3. Content Density Adaptation

Content Density Adaptation changes how much information is shown.

It can affect:

* response length,
* card detail level,
* dashboard sections,
* explanations,
* metadata,
* charts,
* and helper text.

## Use Cases

Content density adaptation is useful when users say:

```text
"Show me less."
```

```text
"I need more details."
```

```text
"Only show the important stuff."
```

```text
"Explain this deeply."
```

```text
"Make it easier to scan."
```

## Density Profiles

```json
{
  "density_profiles": [
    "minimal",
    "summary",
    "balanced",
    "detailed",
    "expert"
  ]
}
```

## Example

User:

```text
"Only show me what I need to do today."
```

Before:

```text
- Today’s tasks
- Weekly plan
- Plant history
- Soil recommendations
- Weather summary
- Seasonal notes
- Long-term garden ideas
```

After:

```text
- Water hydrangeas
- Check new lawn patches
- Move potted oleander if night frost is expected
```

## Implementation Idea

```json
{
  "adaptation_type": "content_density",
  "target": "dashboard",
  "profile": "summary",
  "visible_sections": [
    "today_tasks",
    "urgent_alerts"
  ],
  "hidden_sections": [
    "history",
    "advanced_metrics",
    "long_term_notes"
  ]
}
```

## Design Rule

Do not hide critical information.

Low density should mean less noise, not less truth.

---

# 4. Layout Adaptation

Layout Adaptation changes how information is arranged.

It may affect:

* section order,
* card grouping,
* navigation emphasis,
* dashboard composition,
* responsive layout,
* and interaction mode.

## Use Cases

Layout adaptation is useful when users say:

```text
"Put the important tasks first."
```

```text
"Make this easier to scan."
```

```text
"I want a checklist view."
```

```text
"Show this as cards instead."
```

```text
"Move reminders to the top."
```

## Layout Modes

```json
{
  "layout_modes": [
    "default",
    "focus",
    "checklist",
    "dashboard",
    "cards",
    "timeline",
    "expert"
  ]
}
```

## Example

User:

```text
"Turn this into a checklist."
```

Adaptation:

```json
{
  "adaptation_type": "layout",
  "target": "weekly_plan",
  "layout_mode": "checklist",
  "changes": {
    "group_by": "day",
    "show_completion_state": true,
    "hide_secondary_descriptions": true
  }
}
```

## Design Rule

Layout adaptation should preserve orientation.

Important navigation, critical actions, and primary workflows should remain predictable.

Users should not need a treasure map after every personalization event.

---

# 5. Workflow Guidance Adaptation

Workflow Guidance Adaptation changes how much support the user receives while completing a task.

It may affect:

* number of visible steps,
* helper text,
* examples,
* confirmations,
* recommendations,
* automation level,
* and expert shortcuts.

## Use Cases

Workflow guidance adaptation is useful when users say:

```text
"Guide me step by step."
```

```text
"I know what I’m doing, make it faster."
```

```text
"Explain each step."
```

```text
"Just give me the result."
```

```text
"Show me why you recommend this."
```

## Guidance Modes

```json
{
  "guidance_modes": [
    "guided",
    "checklist",
    "balanced",
    "expert",
    "autopilot_suggestion"
  ]
}
```

## Example

User:

```text
"Help me plan the garden week, but guide me step by step."
```

Adaptation:

```json
{
  "adaptation_type": "workflow_guidance",
  "target": "weekly_garden_planning",
  "mode": "guided",
  "changes": {
    "show_step_numbers": true,
    "include_explanations": true,
    "require_confirmation_between_steps": true
  }
}
```

## Design Rule

Guidance should reduce cognitive load.

It should not create a wizard flow with 19 steps and the emotional warmth of a tax form.

---

# 6. Feature Visibility Adaptation

Feature Visibility Adaptation changes which features are emphasized, hidden, grouped, or suggested.

It may affect:

* dashboard shortcuts,
* advanced options,
* navigation items,
* recommended actions,
* tool availability,
* and contextual suggestions.

## Use Cases

Feature visibility adaptation is useful when users say:

```text
"Hide advanced options."
```

```text
"Show me more expert tools."
```

```text
"Put watering reminders on the home screen."
```

```text
"I mostly care about lawn care."
```

```text
"Can you make plant diagnosis easier to access?"
```

## Visibility Modes

```json
{
  "feature_visibility_modes": [
    "basic_first",
    "balanced",
    "expert",
    "task_focused",
    "recommended"
  ]
}
```

## Example

User:

```text
"I mostly care about lawn care right now."
```

Adaptation:

```json
{
  "adaptation_type": "feature_visibility",
  "target": "home_dashboard",
  "changes": {
    "pinned_features": [
      "lawn_tasks",
      "watering_schedule",
      "weather_alerts"
    ],
    "secondary_features": [
      "ornamental_plants",
      "long_term_planning"
    ]
  },
  "store_as_preference": false
}
```

## Design Rule

Feature visibility should not remove access entirely unless explicitly requested.

Prefer:

```text
de-emphasize
```

over:

```text
delete from existence
```

The app should tidy the room, not brick up the door.

---

## Adaptive UI State

Adaptive UI should be represented as structured state.

Example:

```json
{
  "adaptive_ui_state": {
    "tone_profile": "friendly",
    "theme_profile": "natural_garden",
    "density_profile": "balanced",
    "layout_mode": "dashboard",
    "guidance_mode": "checklist",
    "feature_visibility": "task_focused"
  }
}
```

This state can be stored per user, session, app, or workflow.

---

## Design Tokens

Adaptive UI should be built on design tokens.

Design tokens allow the app to adapt safely without generating arbitrary CSS.

Example:

```json
{
  "tokens": {
    "color.background": "var(--color-background-natural)",
    "color.primary": "var(--color-primary-leaf)",
    "color.accent": "var(--color-accent-sun)",
    "space.card": "var(--space-comfortable)",
    "radius.card": "var(--radius-soft)",
    "motion.duration": "var(--motion-medium)"
  }
}
```

Instead of saying:

```text
Generate a new theme.
```

Illuna should say:

```text
Select an approved theme profile and apply its tokens.
```

This keeps adaptation consistent with the product design system.

---

## Adaptation Targets

Applications should explicitly define what can be adapted.

Example:

```json
{
  "adaptation_targets": {
    "assistant_response": [
      "tone_profile",
      "response_length",
      "explanation_style"
    ],
    "app_theme": [
      "theme_profile",
      "animation_level",
      "density"
    ],
    "home_dashboard": [
      "visible_sections",
      "section_order",
      "pinned_features"
    ],
    "workflow_view": [
      "guidance_mode",
      "layout_mode",
      "detail_level"
    ]
  }
}
```

If a target is not defined, the system should not adapt it.

This prevents the AI layer from improvising product behavior.

Improvisation is good in jazz.

Less good in account settings.

---

## Adaptation Events

Every UI adaptation should create an event.

Example:

```json
{
  "event_type": "ui_adaptation_applied",
  "user_id": "user_123",
  "app": "GardenMate",
  "target": "app_theme",
  "adaptation_type": "visual_theme",
  "previous_state": {
    "theme_profile": "minimal_light"
  },
  "new_state": {
    "theme_profile": "natural_garden"
  },
  "source": {
    "intent": "preference_update",
    "confidence": 0.94
  },
  "undo_available": true,
  "timestamp": "2026-01-15T10:30:00Z"
}
```

Adaptation events are useful for:

* debugging,
* analytics,
* undo behavior,
* product learning,
* and user trust.

---

## Undo and Reset

Adaptive UI must be reversible.

Users should be able to undo a recent adaptation or reset personalization completely.

### Undo Example

```json
{
  "action": "undo_last_adaptation",
  "target": "app_theme",
  "restore_state": {
    "theme_profile": "minimal_light"
  }
}
```

### Reset Example

```json
{
  "action": "reset_adaptive_ui",
  "scope": "app",
  "app": "GardenMate"
}
```

## Design Rule

Every meaningful adaptation should answer this question:

> Can the user get back to where they were?

If the answer is no, the change should probably require confirmation.

---

## Temporary vs Persistent UI Adaptation

Not every adaptation should be stored.

### Temporary

User:

```text
"Show this as a checklist."
```

This may apply only to the current view.

### Persistent

User:

```text
"Always show my weekly plan as a checklist."
```

This may update preference memory.

### Example

```json
{
  "adaptation_type": "layout",
  "target": "weekly_plan",
  "layout_mode": "checklist",
  "scope": "workflow",
  "persistence": "durable"
}
```

The word `always` is a strong signal for durable preference.

---

## Confirmation Patterns

Some adaptations should happen immediately.

Others should ask first.

### No Confirmation Needed

Usually safe:

* change tone for the current response,
* switch to a predefined theme,
* reduce content density temporarily,
* reorder non-critical cards,
* show a checklist view.

### Confirmation Recommended

Usually better to confirm:

* persistent feature hiding,
* resetting preferences,
* deleting personalization data,
* changing notification behavior,
* disabling guidance,
* applying a strong preference globally.

### Example Confirmation

```text
Should I always use this checklist view for your weekly garden plans?
```

Confirmation should be short and specific.

The user should understand what will change.

---

## Accessibility

Adaptive UI must respect accessibility.

Personalization must not reduce usability.

Important rules:

* maintain sufficient color contrast,
* respect reduced motion settings,
* avoid hiding labels behind icons only,
* preserve keyboard navigation,
* support screen readers,
* avoid overly small text,
* avoid animation-heavy defaults,
* and keep critical actions visible.

### Example

If a user requests:

```text
"Make everything softer and lower contrast."
```

The system may respond with a safe adaptation:

```json
{
  "decision": "adapt",
  "changes": {
    "theme_profile": "calm_focus",
    "contrast": "accessible_minimum"
  },
  "reason": "The theme was adapted while preserving accessibility contrast requirements."
}
```

Accessibility is a product boundary.

Not a nice-to-have decoration.

---

## Safety and Product Boundaries

Adaptive UI should never:

* hide safety warnings,
* hide legal or compliance information,
* bypass permissions,
* obscure destructive actions,
* misrepresent product capability,
* remove required consent,
* or manipulate users into choices.

### Example

User:

```text
"Hide all warnings from now on."
```

Decision:

```json
{
  "decision": "reject",
  "target": "safety_warnings",
  "reason": "Safety warnings cannot be hidden by personalization."
}
```

Personalization should improve the interface.

It should not weaken trust.

---

## MVP Implementation

A minimal Adaptive UI implementation may support only:

```text
tone_profile
theme_profile
density_profile
layout_mode
```

Example state:

```json
{
  "tone_profile": "friendly",
  "theme_profile": "natural_garden",
  "density_profile": "balanced",
  "layout_mode": "dashboard"
}
```

This is enough to demonstrate the core Illuna idea:

> The user can describe how the app should feel and behave, and the app adapts in a controlled way.

Start small.

A working adaptive theme and density model is more valuable than a theoretical spaceship dashboard with 47 personalization dimensions.

---

## Example: GardenMate Adaptive UI

### User Message

```text
"Can you make the app brighter? It should feel more like a garden, maybe with soft animations."
```

### Intent

```json
{
  "intent": "preference_update",
  "entities": {
    "topic": "visual_style",
    "target": "app_theme",
    "requested_change": "brighter, garden-like, soft animations",
    "language": "English"
  },
  "tone": "friendly",
  "context": "user requests visual personalization",
  "confidence": 0.94
}
```

### Personalization Decision

```json
{
  "decision": "adapt",
  "adaptation_type": "visual_theme",
  "target": "app_theme",
  "selected_profile": "natural_garden",
  "store_as_preference": true,
  "requires_confirmation": false
}
```

### Adaptive UI State

```json
{
  "adaptive_ui_state": {
    "theme_profile": "natural_garden",
    "animation_level": "medium",
    "density_profile": "comfortable"
  }
}
```

### Result

The app switches to a brighter, natural theme with soft animations and a more garden-like mood.

The user can continue working and undo the change if needed.

---

## Testing Adaptive UI

Adaptive UI should be tested with both technical and human-centered methods.

### Technical Tests

* Does the correct theme profile apply?
* Are design tokens valid?
* Are unsupported targets rejected?
* Is undo state created?
* Are adaptation events logged?
* Are accessibility rules preserved?

### UX Tests

* Does the adaptation feel helpful?
* Does the user understand what changed?
* Can the user undo it?
* Does the app remain predictable?
* Does adaptation improve task completion?
* Does the app still feel like the same product?

### Regression Tests

Every supported user message should map to expected UI state.

Example:

```json
[
  {
    "input": "Make the app brighter and more natural.",
    "expected_theme_profile": "natural_garden"
  },
  {
    "input": "Show me fewer details.",
    "expected_density_profile": "summary"
  },
  {
    "input": "Guide me step by step.",
    "expected_guidance_mode": "guided"
  }
]
```

---

## Best Practices

### Use predefined profiles

Do not generate arbitrary UI.

### Keep navigation stable

Users should not lose orientation.

### Make changes reversible

Undo and reset are essential.

### Respect accessibility

Personalization must not reduce usability.

### Log adaptation events

Developers should understand why the UI changed.

### Separate decision from rendering

The Personalization Engine decides. The UI renders approved state.

### Start with a small set of patterns

Tone, theme, and density are good MVP candidates.

### Preserve product identity

Adaptive UI should create variation within a brand, not a new brand every Tuesday.

---

## Summary

Adaptive UI Patterns define how Illuna turns personalization decisions into visible and useful interface changes.

The main pattern categories are:

* Tone Adaptation
* Visual Theme Adaptation
* Content Density Adaptation
* Layout Adaptation
* Workflow Guidance Adaptation
* Feature Visibility Adaptation

Adaptive UI should be controlled, reversible, accessible, and product-aware.

The goal is not to generate endless UI variations.

The goal is to make the application feel more aligned with the user while remaining stable, trustworthy, and easy to use.
