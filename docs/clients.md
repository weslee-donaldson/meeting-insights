# Configuring Clients

`config/clients.json` is the source of truth for every client whose meetings this system ingests. It drives:

- **Client detection** — which client a transcript belongs to (via `aliases` + `meeting_names`)
- **Extraction prompts** — the LLM knows who's on the client team vs. your implementation team, who has authority, and what domain terms to normalize
- **Routing** — meetings matching `meeting_names` bypass alias detection
- **Chat context** — the glossary and team rosters are available to the assistant when answering questions

`setup.sh` copies `config/clients.example.json` to `config/clients.json` if it doesn't exist. Edit the generated file before running `pnpm setup`, which seeds it into the database.

---

## Schema

```json
[
  {
    "name": "Acme",
    "is_default": true,
    "aliases": ["Acme", "acme", "Acme Corp"],
    "meeting_names": ["Acme - Weekly Sync", "Acme DSU"],
    "client_team": [
      { "name": "Jane Doe", "email": "jane@acme.com", "role": "CTO", "pronouns": "she/her" }
    ],
    "implementation_team": [
      { "name": "Your Name", "email": "you@yourcompany.com", "role": "Consultant" }
    ],
    "additional_extraction_llm_prompt": "Jane is the final authority on architecture decisions.",
    "glossary": [
      {
        "term": "Acme",
        "variants": ["acme", "ACM"],
        "description": "The client company."
      }
    ]
  }
]
```

### Field reference

| Field | Required | Purpose |
|---|---|---|
| `name` | yes | Display name. Must be unique across the file. |
| `is_default` | yes on exactly one entry | The fallback client when detection can't resolve a match. |
| `aliases` | yes | Strings matched (case-insensitive) against transcript filenames and attendee email domains to auto-detect the client. Include nicknames, codenames, and common misspellings. |
| `meeting_names` | yes | Recurring meeting titles that route to this client regardless of aliases. Use the exact title Krisp produces. |
| `client_team` | yes | The client's staff. Each member: `name`, `email`, `role`. Optional: `pronouns`. Roles feed the extraction prompt — be specific (`CTO`, `Principal Developer`, `Product Owner`). |
| `implementation_team` | yes | Your delivery team. Action items assigned to these people are treated as commitments. Same shape as `client_team`. |
| `additional_extraction_llm_prompt` | yes (can be `""`) | Free-text guidance injected into extraction prompts. Call out authority hierarchy, decision norms, or anything the LLM should weight. |
| `glossary` | yes (can be `[]`) | Domain terms the LLM should normalize. See below. |

### Glossary entries

```json
{
  "term": "CSTAR",
  "variants": ["C*", "C-Star", "Cstar", "sister", "system"],
  "description": "Legacy internal order proxy format. Krisp often transcribes as 'sister'."
}
```

- `term` — canonical spelling. This is what the LLM outputs.
- `variants` — alternate spellings, abbreviations, and common Krisp mis-transcriptions. Krisp frequently garbles jargon; adding the garbled form here is how you recover it.
- `description` — what the term means. Gives the LLM enough context to use the term correctly in summaries and answers.

---

## Workflow

### Adding your first client

1. Open `config/clients.json` (created from the example by `setup.sh`).
2. Replace the `Acme` entry with your real client.
3. Keep `"is_default": true` on one entry.
4. Run `pnpm setup` to seed.
5. Verify via the API (see [Verifying via the API](#verifying-via-the-api) below).

### Adding another client

1. Append a new object to the array. Leave `is_default: false` (or omit).
2. Run `pnpm setup` — it's idempotent and will upsert the new client.
3. Verify via the API (see below).

### Verifying via the API

With the API server running (`pm2 start ecosystem.config.cjs` or `pnpm api:dev`), hit the clients endpoint:

```bash
curl http://localhost:3000/api/clients
```

You should see every client you defined in `config/clients.json`, with matching `name`, `is_default`, `aliases`, and team rosters. If a client is missing, re-run `pnpm setup` and check the output for seed errors. If `is_default` isn't set on exactly one client, detection will fall back unpredictably — fix the config and re-seed.

Fetch a single client by name to inspect the full seeded record:

```bash
curl http://localhost:3000/api/clients/Acme
```

If `MTNINSIGHTS_AUTH_ENABLED=1`, add `-H "Authorization: Bearer <token>"`. Change `localhost:3000` to match your `API_PORT` if you overrode it in `.env.local`.

### Editing an existing client

1. Update the entry in `config/clients.json`.
2. Run `pnpm setup` to re-seed.
3. Existing meetings are **not** automatically re-extracted. If you changed `additional_extraction_llm_prompt`, `glossary`, or team rosters and want those changes reflected in prior meetings, flag them for re-extraction (see [docs/cli-admin.md](cli-admin.md)).

### Tuning detection

If meetings are being routed to the wrong client:

- Add the missing alias (company nickname, codename, email domain) to `aliases`.
- Add the recurring meeting title to `meeting_names` for a guaranteed route.
- Check for filename collisions between clients — more specific aliases win.

### Tuning extraction quality

If the LLM confuses roles, misses authority, or mangles domain terms:

- Tighten `role` strings on team members (`CTO` beats `Leader`).
- Expand `additional_extraction_llm_prompt` with authority rules.
- Add Krisp mis-transcriptions to glossary `variants`.

---

## Operational notes

- `config/clients.json` is currently checked into the repo. If it contains sensitive team data (emails, internal codenames), consider gitignoring it and keeping only `clients.example.json` under version control.
- The seed step is idempotent: re-running `pnpm setup` upserts by `name`. Renaming a client creates a new row — delete the old one via `mti` if needed.
- `meeting_names` is matched against the meeting title parsed from the Krisp filename. If your titles drift over time, keep this list current.
