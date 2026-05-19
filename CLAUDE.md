# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**Illuna** is an open concept and reference architecture for **adaptive, AI-personalized applications**. The repository contains:

- **Conceptual documentation** (docs/): Vision, core concepts, reference architecture, intent classification, personalization model, adaptive UI patterns, roadmap, and cross-domain examples
- **Working example**: `examples/gardenplaner_claude_react/` — A full-stack garden planning app (React frontend + Express backend) demonstrating Illuna principles in practice
- **LICENSE**: Apache 2.0 (branding/Illuna name not covered)

This is **not** the proprietary production framework. The core, advanced system prompts, and commercial backend services are proprietary.

---

## Quick Reference: Example Project Commands

The main example project is in `examples/gardenplaner_claude_react/`.

### Setup & Development

```bash
# Install dependencies
npm install

# Development: Run frontend + backend in parallel
npm run dev
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001

# Development: Run only backend (API server)
npm run server:dev

# Development: Run only frontend (Vite dev server)
npm run client:dev
```

### Build & Production

```bash
# Type-check and build for production (outputs to dist/)
npm run build

# Preview built frontend locally
npm run preview

# Start only the API server (also serves built frontend)
npm start
```

### Linting

```bash
# Run ESLint on all TypeScript/TSX files
npm lint
```

### Configuration

Environment variables must be set in `.env` (copy from `.env.example`):

| Variable | Required | Purpose |
|----------|----------|---------|
| `APP_ENCRYPTION_KEY` | Yes | 64 hex characters (32 bytes) – encrypts sensitive settings. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_SECRET` | Recommended | Secret for JWT tokens; must be set in production |
| `PORT` | No | Backend server port (default: 3001) |

---

## Architecture: Full-Stack Example

The example project demonstrates **core Illuna concepts** across three layers:

### 1. Frontend (React + Zustand)

**Location**: `examples/gardenplaner_claude_react/src/`

- **App.tsx**: Main app shell — tabs (plants, tasks, calendar, settings, database), layout
- **store.ts**: Zustand store for garden data (plants, tasks) + CRUD operations
- **uiStore.ts**: Zustand store for adaptive UI state — tokens, elements, skill levels, polling
  - **Tokens**: Design tokens (colors, fonts, spacing, backgrounds) applied as CSS custom properties
  - **Elements**: UI element visibility and customization per skill level (beginner/expert)
  - **Skill Level**: User preference stored in DB, affects visibility of advanced controls
  - **Polling**: Periodically fetches active profile to reflect server-side UI changes in real-time
- **contexts/AuthContext.tsx**: Manages authentication state (login, logout, session)
- **api/client.ts**: Fetch wrapper with error handling, automatic 401 logout
- **components/**: Feature modules (PlantManager, TaskList, ChatWidget, SettingsPanel, LoginPage, etc.)

**Key Pattern**: Zustand stores sync with Express backend via fetch API. Store methods call `/api/*` endpoints, which update database and often trigger UI personalization changes.

### 2. Backend (Express + TypeScript)

**Location**: `examples/gardenplaner_claude_react/server/`

- **index.ts**: Express app setup — CORS, middleware, route mounting, port config
- **database.ts**: better-sqlite3 connection, schema initialization (users, plants, tasks, app_settings, ui_profiles, ui_tokens, ui_elements, ui_component_overrides)
- **auth.ts**: Password hashing (bcryptjs), JWT token generation
- **encryption.ts**: AES encryption for sensitive settings (e.g., API keys stored in app_settings)
- **routes/**:
  - **auth.ts**: Login, logout, user creation
  - **plants.ts**: CRUD for plants (associated per user)
  - **tasks.ts**: CRUD for tasks with recurring rules
  - **settings.ts**: User-level settings (encrypted key-value pairs)
  - **ui.ts**: Adaptive UI endpoints — active profile, token values, element visibility per skill level
- **middleware/requireAuth.ts**: Validates JWT, extracts user_id from token
- **seed.ts**: Utility to populate test data

**Key Pattern**: Each user is isolated. Routes use middleware to extract `userId` from JWT. All queries are scoped to `user_id`. UI personalization is stored in `ui_profiles`, `ui_tokens`, `ui_elements`, and `ui_component_overrides` tables.

### 3. Data Model

**Multi-user, per-user isolation**:

- **users**: id (UUID), username, password (bcrypt hash)
- **plants**: id, user_id, name, emoji, location, notes, timestamps
- **tasks**: id, user_id, plant_id, title, task_type, due_date, completed, recurring rule, timestamps
- **app_settings**: user_id, key, value (encrypted), value_type, timestamps
- **ui_profiles**: id, user_id, name, is_active, timestamps
- **ui_tokens**: user_id, profile_id, token_path (e.g., "color.primary"), value, value_type
- **ui_elements**: user_id, profile_id, element_key (e.g., "visibility.advancedMode"), value, skill_level, timestamps
- **ui_component_overrides**: user_id, profile_id, component_key, prop_path, value, value_type

**Design Patterns**:
- Foreign keys with `ON DELETE CASCADE` for user cleanup
- WAL (write-ahead logging) and foreign keys pragmas enabled
- Encryption for app_settings to protect sensitive data
- Skill level (`beginner` / `expert` / `all`) gates feature visibility

---

## Understanding Illuna Concepts

### Five Core Ideas (from docs)

1. **Adaptive Interaction, Not Chat-Only**: Chat is one interaction layer; the app can shift between chat-first, UI-first, voice-assisted, form-based, or guided step-by-step based on context and user preference.

2. **Controlled Adaptation, Not Design Replacement**: Product teams define what is adaptable (tone, explanation depth, guidance, content density, visual emphasis, accessibility, interaction style, workflow). Illuna operates within locked product rules.

3. **Intent Understanding**: User input → structured intent (what the user wants, tone, context, confidence). Not every message is treated as a chat request; the system recognizes preference updates, design requests, workflow instructions, etc.

4. **Adaptive Experience**: Intent is translated into controlled UI/UX changes. The same app behaves differently for a beginner (step-by-step, simple language) vs. an expert (dense, advanced controls).

5. **User Context & Continuous Personalization**: Meaningful signals (tone preference, skill level, explanation depth, workflow habits) become part of a persistent user context layer. Adaptation is transparent, reversible, and bounded by product rules.

### Example Flow (GardenMate)

User says: *"I'm new to gardening, only have 20 minutes per week, don't understand plant terms."*

The system should:
- **Intent**: Detect this as a skill-level + time-availability signal
- **Context**: Associate user with "beginner" skill level
- **Personalization**: Adapt the experience → simpler language, weekly priorities, fewer advanced controls, step-by-step guidance, visual explanations, supportive tone
- **Memory**: Store "beginner" preference; next login remembers this

Same app. Same product rules. Different adaptive behavior.

### Key Documentation Files

- **docs/01-vision.md**: Philosophy and problem statement
- **docs/02-core-concepts.md**: The Illuna model (user message → intent → context → personalization → adaptation → feedback loop)
- **docs/03-reference-architecture.md**: Nine structured components and responsibilities
- **docs/04-intent-classification.md**: Intent taxonomy and parsing patterns
- **docs/05-personalization-engine.md**: Personalization decision model
- **docs/06-adaptive-ui-patterns.md**: UI adaptation strategies and guardrails
- **docs/07-roadmap.md**: Phased development roadmap
- **docs/08-examples-and-implementation.md**: Cross-domain scenarios and implementation walkthrough

---

## Tech Stack

**Frontend**:
- React 19.2.5 (with React Refresh)
- TypeScript ~6.0
- Vite 8 (dev server and build tool)
- Tailwind CSS 4.2.4 (via @tailwindcss/vite)
- Zustand 5.0 (state management)
- date-fns (date utilities)
- Lucide React (icons)
- Dexie (IndexedDB wrapper, if used locally)

**Backend**:
- Node.js (18+)
- Express 5.2.1
- TypeScript (compiled)
- better-sqlite3 (embedded SQL database)
- bcryptjs (password hashing)
- jsonwebtoken (JWT auth)
- cookie-parser, cors, express-rate-limit (middleware)

**Build & Dev**:
- tsx (TypeScript executor for Node)
- concurrently (run frontend + backend in parallel)
- ESLint 10 + TypeScript ESLint (linting)

**Development Database**: SQLite with WAL mode, stored in `data/garden.db`

---

## Linting & Code Style

- **ESLint**: Covers TypeScript and React best practices (hooks, refresh, recommended rules)
- **No formatter configured**: Code style is enforced by linting rules
- **Run**: `npm run lint`

---

## Example Project: Existing CLAUDE.md

The example project has its own `examples/gardenplaner_claude_react/CLAUDE.md` with coding guidelines (simplicity, surgical changes, goal-driven execution) that apply when working inside that sub-project.
