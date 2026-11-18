# Greeting Log Database Design (Engine-Neutral)

## 1. Status and Scope

| Field | Details |
|---|---|
| Document Status | Design only. Hypothetical. Not implemented. |
| Database System | Unknown. Not documented anywhere in this repository. |
| Database Version | Unknown |
| Migration Tool | Unknown |
| ORM / Query Builder | Unknown |
| Database Hosting | Unknown |

- This document describes a hypothetical `greeting_log` table that could record calls to `greet(name)` in `examples/backend-capability-test/src/greeting.js`.
- `greet(name)` is currently a pure function with no persistence. Nothing in this document exists in code.
- No dialect is assumed. No SQL, migration file or ORM model is provided, because none could be verified without an engine.
- No database was started, connected to or queried. No migration was run. Every migration check is NOT RUN because no local or disposable database exists.
- The Markdown structure follows `templates/project-documentation/DATABASE_SCHEMA.md`.

## 2. Entity

One entity: `greeting_log`. Each row records one successful greeting.

- Source of the length limit: `greeting.js` trims the name and accepts 1 to 50 characters.
- Rejected inputs (non-string, empty, too long) are not logged in this design. Logging them is an open decision (section 9).

## 3. Columns (Logical Types)

| Column | Logical Type | Nullable | Default | Description |
|---|---|---|---|---|
| id | Unique identifier (UUID-like or auto-increment, to be decided) | No | Generated | Primary key |
| greeted_name | Bounded text, max 50 characters | No | None | Trimmed name that was greeted |
| created_at | Timestamp with time zone (UTC) | No | Current time | When the greeting was produced |

- Physical type names, character-versus-byte length semantics and collation are to be decided with the engine.
- The name is treated as potentially personal data. Seed and test rows must use fake names only.

## 4. Constraints

| Name (Logical) | Type | Rule |
|---|---|---|
| greeting_log_pk | Primary key | `id` is unique and not null |
| greeting_log_name_not_empty | Check | `greeted_name` has at least 1 character after trimming |
| greeting_log_name_max_length | Check | `greeted_name` has at most 50 characters |
| greeting_log_required | Not null | `id`, `greeted_name`, `created_at` are required |

- There are no foreign keys, because this is a single table.
- There is no unique constraint on `greeted_name`, because the same name may be greeted many times.
- Whether the engine enforces check constraints must be verified. This is Unknown.

## 5. Indexes

| Name (Logical) | Columns | Purpose |
|---|---|---|
| greeting_log_created_at_idx | created_at | Time-range queries and retention clean-up |

- No index on `greeted_name` until a real query needs one.
- The primary key index is implied.
- Index choices must be confirmed against real queries and the chosen engine.

## 6. Migration Plan (Not Run)

Ordering: one new migration that creates the table, its constraints and the index. Names follow the future tool's convention. This is Unknown.

1. Create `greeting_log` with the columns and constraints from sections 3 and 4.
2. Create the `created_at` index from section 5.
3. Optional: load fake seed rows (section 8).

Properties:
- Additive only. No existing table or data is changed.
- Locking: a new empty table needs no lock on existing objects. Engine-specific behaviour is Unknown.
- Applying the migration requires a local or disposable database. None exists, so it is NOT RUN.

## 7. Rollback Plan (Not Run)

1. Drop the `created_at` index.
2. Drop the `greeting_log` table.

Data impact and reversibility:
- Rolling back before any real data exists loses nothing.
- Once real rows exist, a rollback destroys them and cannot restore them. A backup or export must come first, with approval through the lead.
- Dropping a table is a destructive operation. In a real task it needs explicit user approval passed through the lead.
- A full check needs three runs on a disposable database: apply, roll back, apply again. All are NOT RUN here.

## 8. Seed Data

- Fake names only, for example "Test Person One". No real personal data.
- Seed rows are optional and for local or disposable databases only.

## 9. Decisions Needed From the Lead

| Decision | Options / Notes |
|---|---|
| Database engine and version | Unknown. Required before any SQL is written. |
| Migration tool and naming convention | Unknown. Depends on the engine and the backend language. |
| Local or disposable database for verification | None exists. Needed to run apply, rollback and re-apply. |
| Identifier strategy | UUID-like or auto-increment |
| Log rejected inputs | Yes or no. If yes, add a status column and relax the name checks. |
| Retention period | How long rows are kept, and whether they are deleted or archived |
| Personal data handling | Whether names count as personal data, and any masking or access rules |
| Data-access owner | backend-developer writes the access code after the schema is agreed |
| Owned paths for a real task | The lead must list them before any real migration file is written |

## 10. Destructive Operations Needing Approval (Real Task)

- Dropping tables or columns.
- Truncating tables.
- Deleting rows without a narrow condition.
- Type changes that lose data.
- Any migration that rewrites existing data.
- Any run against a shared, staging or production database. This is never allowed for me.

## 11. Verification and Evidence

| Check | Status |
|---|---|
| Apply migration | NOT RUN. No migration exists and no disposable database exists. |
| Roll back migration | NOT RUN. Same reason. |
| Re-apply migration | NOT RUN. Same reason. |
| Constraint and index behaviour | NOT RUN. Same reason. |
| Database tests | NOT RUN. None exist. |

---

*Document Status: Design only, engine-neutral*
*Last Updated: 2026-11-18*
