# The Non-Essentials site

Static site rebuild for https://nonessentials.band with:
- markdown-driven section copy
- editable gig dates in YAML
- automatic countdown to the next show
- Netlify Forms for booking + mailing list signup
- archived original artwork/assets from the Carrd site under `source_assets/`

## Edit the site

### Update gig dates
Edit `content/gigs.yml`.

Each show looks like this:

```yml
- starts_at: 2026-04-11T21:00:00-04:00
  display_date: Apr 11th, Saturday, 9pm–12 midnight
  venue: Tommy Fox's
  address: 32 S. Washington Ave, Bergenfield, NJ
  notes: Classic rock all night.
```

Rules:
- `starts_at` must be a real ISO date/time with timezone offset.
- `display_date` is what visitors see.
- The countdown automatically finds the nearest upcoming show.

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
