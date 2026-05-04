# 04 · Intent Classification

## Objective
Classify user intent as the basis for selecting the right actions and adaptive UI responses.

The classifier should produce structured output that is directly usable by the Personalization Engine.

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

## Minimal Output Schema
```json
{
  "intent": "preference_update",
  "entities": {
    "topic": "visual_style",
    "target": "app_theme",
    "requested_change": "brighter"
  },
  "tone": "friendly",
  "confidence": 0.91,
  "requires_clarification": false
}
```

## Quality Criteria
- Precision and recall per intent category
- Confidence thresholds with explicit fallback strategies
- Transparency when classification is uncertain
- Consistent entity extraction for adaptation targets
- Stable behavior across multilingual phrasing
