# Updating show dates for The Non-Essentials

This site now reads show dates from a shared Google Sheet.

Sheet:
https://docs.google.com/spreadsheets/d/1KYcKwEkCV7JuKfYYFp-DBJtELqQ5N1MOWY3o61t4p5A/edit?usp=sharing

What to do

1. Open the `Shows` tab.
2. Add one new row per show.
3. Fill in every column.
4. Leave old rows alone. The website will move past shows into the archive automatically.

Columns you must keep exactly as-is

- status
- starts_at
- display_date
- venue
- address
- notes
- ticket_url

What each column means

- status
  - use `live` for shows that should appear on the site
  - use anything else to hide a show

- starts_at
  - the real date/time in ISO format
  - example: `2026-08-15T20:00:00-04:00`
  - this is what controls:
    - whether a show is upcoming or past
    - the next-show card
    - the countdown timer

- display_date
  - what people see on the website
  - example: `Aug 15, Saturday, 8pm–11pm`

- venue
  - example: `Tommy Fox's`

- address
  - example: `32 S. Washington Ave, Bergenfield, NJ`

- notes
  - optional short note
  - example: `Outdoor summer set.`

- ticket_url
  - optional link to tickets or event info
  - if this is filled in, the website shows a `Tickets / Info` button automatically

Important rules

- Do not rename the column headers.
- Do not delete the header row.
- One show per row.
- Use the exact `starts_at` date format.
- If a show should not be visible yet, do not mark it `live`.

Examples

Visible show:

- status: `live`
- starts_at: `2026-08-15T20:00:00-04:00`
- display_date: `Aug 15, Saturday, 8pm–11pm`
- venue: `Tommy Fox's`
- address: `32 S. Washington Ave, Bergenfield, NJ`
- notes: `Classic rock all night.`
- ticket_url: `https://example.com/tickets`

Hidden show draft:

- status: `draft`
- starts_at: `2026-09-01T19:00:00-04:00`
- display_date: `Sept 1, Tuesday, 7pm`
- venue: `TBD`
- address: `TBD`
- notes: `Waiting on confirmation.`
- ticket_url: ``

What happens automatically

- the next upcoming show becomes the homepage `Next show`
- the countdown timer points to that same show
- past shows disappear from the upcoming list
- past shows move into the Past Shows archive

If something looks wrong

Check first:
- is `status` set to `live`?
- is `starts_at` a valid ISO date/time?
- did someone rename a column header?
- is the row missing venue/address?

Seed file

If you ever need the old hardcoded dates as a starting point, use:
- `content/shows-import-seed.csv`
