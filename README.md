# The Non-Essentials site

Static site rebuild for https://nonessentials.band with:
- markdown-driven section copy
- Google-Sheet-driven gig dates
- automatic countdown to the next show
- automatic hiding of past shows
- Netlify Forms for booking + mailing list signup
- archived original artwork/assets from the Carrd site under `source_assets/`

## Edit the site

### Update gig dates
The live source of truth is the shared Google Sheet:
- https://docs.google.com/spreadsheets/d/1KYcKwEkCV7JuKfYYFp-DBJtELqQ5N1MOWY3o61t4p5A/edit?usp=sharing

Required columns:
- `status`
- `starts_at`
- `display_date`
- `venue`
- `address`
- `notes`
- `ticket_url`

Rules:
- `status` should be `live` for shows you want visible
- `starts_at` must be a real ISO date/time with timezone offset, for example:
  `2026-04-11T21:00:00-04:00`
- `display_date` is what visitors see
- past shows disappear automatically once `starts_at` passes
- the earliest upcoming show automatically becomes:
  - the hero next-show card
  - the “Next show” callout
  - the countdown target

If you want to seed the sheet with the old hardcoded shows, use:
- `content/shows-import-seed.csv`

That file is regenerated automatically from the fallback YAML during build.

### Update section copy
- `content/about.md`
- `content/repertoire.md`
- `content/song-list.md`
- `content/mailing-list.md`
- `content/config.yml` for hero text, socials, contact info, and band members

## Local development

```bash
python3 -m pip install -r requirements.txt
python3 build.py
open dist/index.html
```

## Deploy

This repo is configured for Netlify.

Build command:

```bash
python3 -m pip install -r requirements.txt && python3 build.py
```

Publish directory:

```bash
dist
```

## Notes

- `source_assets/` keeps the original media/artwork pulled from the old site.
- Only the assets actively used by the rebuilt site are copied into `dist/` during build, so the deploy stays lighter than the full archive.
- Forms use Netlify Forms, so submissions show up in the Netlify dashboard.
