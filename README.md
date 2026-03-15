# The Non-Essentials site

Static rebuild of https://nonessentials.band.

What this repo contains
- rebuilt static site on GitHub + Netlify
- Google-Sheet-driven show management
- automatic next-show card
- automatic countdown to the next show
- automatic upcoming/past show split
- optional ticket/info buttons per show
- Netlify Forms for booking + mailing list signup
- archived original artwork/assets under `source_assets/`

Live URLs
- Site: https://nonessentials-band-site.netlify.app
- Show editing guide page: `/update-shows.html`
- Google Sheet: https://docs.google.com/spreadsheets/d/1KYcKwEkCV7JuKfYYFp-DBJtELqQ5N1MOWY3o61t4p5A/edit?usp=sharing

## Source of truth

The live source of truth for shows is the shared Google Sheet.

That sheet drives:
- hero next-show card
- countdown timer
- upcoming shows table
- ticket/info buttons
- past shows archive

Important workflow decision
- use CSV import/edit in Google Sheets
- do not rely on chat paste blobs for structured data

## How a nontechnical person updates shows

Fast path:
1. Open the Google Sheet.
2. Go to the `Shows` tab.
3. Add one row per show.
4. Set `status` to `live`.
5. Save and refresh the website.

Public guide page for editors:
- `/update-shows.html`

Repo guide:
- `SHEET-EDITING-GUIDE.md`

## Required Google Sheet columns

Keep these headers exactly as-is:
- `status`
- `starts_at`
- `display_date`
- `venue`
- `address`
- `notes`
- `ticket_url`

What they mean
- `status`
  - use `live` for visible shows
  - anything else effectively hides the row
- `starts_at`
  - real ISO date/time with timezone offset
  - example: `2026-08-15T20:00:00-04:00`
- `display_date`
  - the human-readable date shown on the site
- `venue`
  - venue name
- `address`
  - address/city shown on the site
- `notes`
  - short optional note
- `ticket_url`
  - optional external URL for tickets/event info

## What the site does automatically

Once the sheet has valid rows:
- filters out past shows from the upcoming list
- sends past shows to the archive
- picks the earliest future show as the next show
- points the countdown timer at that same show
- shows ticket/info buttons if `ticket_url` is present

## Current fallback behavior

There is still a local fallback show list in the repo so the site does not go blank if:
- the sheet is empty
- the sheet is malformed
- Google export fails

That fallback exists for resilience, not as the preferred editing path.

If the sheet is populated correctly, the sheet wins.

## Seeding the Google Sheet

If you want to seed the sheet with the old hardcoded shows, use:
- `content/shows-import-seed.csv`

Recommended method:
1. Open Google Sheets
2. File
3. Import
4. Upload
5. Select `content/shows-import-seed.csv`
6. Replace current sheet or import into selected cell

Why this matters:
- CSV import preserves columns correctly
- chat paste is brittle and often collapses values into one cell

## Content editing outside the show list

Markdown/content files:
- `content/about.md`
- `content/repertoire.md`
- `content/song-list.md`
- `content/mailing-list.md`

Structured site config:
- `content/config.yml`

Use `content/config.yml` for:
- hero content
- socials
- contact info
- band members
- video embeds
- show sheet URL/config
- background image references

## Project structure

- `build.py` — static build script
- `templates/index.html` — main site template
- `templates/update-shows.html` — unlinked public editing guide page
- `src/styles.css` — styling
- `src/app.js` — live show-sheet logic, countdown, archive toggle
- `content/` — markdown/YAML content
- `source_assets/` — archived original site media/assets
- `dist/` — built output

## Local development

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
python build.py
open dist/index.html
```

## Deploy

This repo is configured for Netlify.

Build command:

```bash
python3 -m pip install --user -r requirements.txt && python3 build.py
```

Publish directory:

```bash
dist
```

## Notes

- `source_assets/` keeps the original media/artwork pulled from the old site.
- Only assets actively used by the rebuilt site are copied into `dist/` during build.
- Forms use Netlify Forms, so submissions show up in the Netlify dashboard.
- The site currently has an unlinked public guide page specifically so nontechnical editors can update gigs without being taught the repo.
