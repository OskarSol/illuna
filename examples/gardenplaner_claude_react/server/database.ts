import Database from 'better-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DB_PATH = path.join(__dirname, '..', 'data', 'garden.db')

export const db = new Database(DB_PATH)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    username    TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    created_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS plants (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    emoji       TEXT NOT NULL,
    location    TEXT NOT NULL DEFAULT '',
    notes       TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plant_id    TEXT REFERENCES plants(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    task_type   TEXT NOT NULL,
    due_date    TEXT NOT NULL,
    completed   INTEGER NOT NULL DEFAULT 0,
    notes       TEXT,
    recurring   TEXT,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS app_settings (
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key         TEXT NOT NULL,
    value       TEXT NOT NULL,
    value_type  TEXT NOT NULL DEFAULT 'string',
    updated_at  TEXT NOT NULL,
    PRIMARY KEY (user_id, key)
  );

  CREATE TABLE IF NOT EXISTS ui_profiles (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    is_active   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ui_tokens (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id  TEXT NOT NULL REFERENCES ui_profiles(id) ON DELETE CASCADE,
    token_path  TEXT NOT NULL,
    value       TEXT NOT NULL,
    value_type  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    UNIQUE(user_id, profile_id, token_path)
  );

  CREATE TABLE IF NOT EXISTS ui_component_overrides (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id    TEXT NOT NULL REFERENCES ui_profiles(id) ON DELETE CASCADE,
    component_key TEXT NOT NULL,
    prop_path     TEXT NOT NULL,
    value         TEXT NOT NULL,
    value_type    TEXT NOT NULL,
    updated_at    TEXT NOT NULL,
    UNIQUE(user_id, profile_id, component_key, prop_path)
  );

  CREATE TABLE IF NOT EXISTS ui_elements (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id    TEXT NOT NULL REFERENCES ui_profiles(id) ON DELETE CASCADE,
    element_key   TEXT NOT NULL,
    label         TEXT NOT NULL,
    description   TEXT NOT NULL DEFAULT '',
    value         TEXT NOT NULL,
    default_value TEXT NOT NULL,
    value_type    TEXT NOT NULL,
    category      TEXT NOT NULL,
    updated_at    TEXT NOT NULL,
    UNIQUE(user_id, profile_id, element_key)
  );
`)
