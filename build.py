from __future__ import annotations

import csv
import html
import re
import shutil
from datetime import datetime
from pathlib import Path
from string import Template

import markdown
import yaml

ROOT = Path(__file__).parent
CONTENT = ROOT / "content"
SRC = ROOT / "src"
TEMPLATES = ROOT / "templates"
DIST = ROOT / "dist"
ARCHIVE = ROOT / "source_assets"


def load_yaml(path: Path):
    return yaml.safe_load(path.read_text())


def render_md(path: Path) -> str:
    text = path.read_text()
    return markdown.markdown(text, extensions=["extra", "sane_lists"])


def social_links(items):
    return "".join(
        f'<a href="{html.escape(item["href"])}" target="_blank" rel="noreferrer">{html.escape(item["label"])}</a>'
        for item in items
    )


def schedule_rows(shows):
    rows = []
    for show in shows:
        rows.append(
            "\n".join(
                [
                    "<tr>",
                    f"  <td><strong>{html.escape(show['display_date'])}</strong>{html.escape(show.get('notes', ''))}</td>",
                    f"  <td>{html.escape(show['venue'])}</td>",
                    f"  <td>{html.escape(show['address'])}</td>",
                    "</tr>",
                ]
            )
        )
    return "\n".join(rows)


def member_cards(members):
    cards = []
    for member in members:
        cards.append(
            f'''<article class="member-card">
  <img src="{html.escape(member['image'])}" alt="{html.escape(member['name'])} — {html.escape(member['role'])}">
  <h3>{html.escape(member['name'])}</h3>
  <p>{html.escape(member['role'])}</p>
</article>'''
        )
    return "\n".join(cards)


def clean_dist():
    if DIST.exists():
        shutil.rmtree(DIST)
    (DIST / "assets").mkdir(parents=True, exist_ok=True)
    (DIST / "assets" / "images").mkdir(parents=True, exist_ok=True)
    (DIST / "assets" / "images" / "gallery01").mkdir(parents=True, exist_ok=True)


def supporting_video_cards(items):
    cards = []
    for item in items:
        cards.append(
            f'''<article class="panel video-panel">
  <h3>{html.escape(item['title'])}</h3>
  <div class="video-frame">
    <iframe src="{html.escape(item['embed_url'])}" title="{html.escape(item['title'])}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
  </div>
</article>'''
        )
    return "\n".join(cards)


def copy_asset(rel_path: str):
    src = ARCHIVE / rel_path
    dest = DIST / rel_path
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dest)


def parse_starts_at(value):
    if isinstance(value, datetime):
        return value
    return datetime.fromisoformat(str(value))


def choose_next_show(gigs):
    now = datetime.now().astimezone()
    parsed = []
    for show in gigs:
        parsed.append((parse_starts_at(show["starts_at"]), show))
    future = [item for item in parsed if item[0] >= now]
    if future:
        future.sort(key=lambda item: item[0])
        return future[0][1]
    parsed.sort(key=lambda item: item[0])
    return parsed[-1][1]


def google_sheet_csv_url(sheet_url: str, gid: int | str = 0) -> str:
    match = re.search(r"/d/([a-zA-Z0-9-_]+)", sheet_url)
    if not match:
        raise ValueError("Invalid Google Sheet URL")
    sheet_id = match.group(1)
    return f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"


def write_import_seed_csv(gigs):
    output_path = ROOT / "content" / "shows-import-seed.csv"
    fieldnames = ["status", "starts_at", "display_date", "venue", "address", "notes", "ticket_url"]
    with output_path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        for show in gigs:
            writer.writerow(
                {
                    "status": "live",
                    "starts_at": parse_starts_at(show["starts_at"]).isoformat(),
                    "display_date": show["display_date"],
                    "venue": show["venue"],
                    "address": show["address"],
                    "notes": show.get("notes", ""),
                    "ticket_url": show.get("ticket_url", ""),
                }
            )



def main():
    config = load_yaml(CONTENT / "config.yml")
    gigs = load_yaml(CONTENT / "gigs.yml")["shows"]
    next_show = choose_next_show(gigs)
    shows_csv_url = google_sheet_csv_url(config["shows"]["sheet_url"], config["shows"].get("sheet_gid", 0))
    write_import_seed_csv(gigs)

    clean_dist()

    for rel in [
        "assets/images/card.jpg",
        "assets/images/container03.jpg",
        "assets/images/container05.jpg",
        "assets/images/container06.jpg",
        "assets/images/container07.jpg",
        "assets/images/container08.jpg",
        "assets/images/container09.jpg",
        "assets/images/gallery01/289a5fc5.jpg",
        "assets/images/gallery01/608892e0.jpg",
        "assets/images/gallery01/84c32bc7.jpg",
        "assets/images/gallery01/b4bc9af0.jpg",
        "assets/images/gallery01/282ab833.jpg",
    ]:
        copy_asset(rel)

    shutil.copy2(SRC / "styles.css", DIST / "assets" / "styles.css")
    shutil.copy2(SRC / "app.js", DIST / "assets" / "app.js")

    replacements = {
        "site_title": config["site"]["title"],
        "site_description": config["site"]["description"],
        "site_url": config["site"]["url"].rstrip("/"),
        "og_image": config["site"]["og_image"],
        "hero_eyebrow": config["hero"]["eyebrow"],
        "hero_title": config["hero"]["title"],
        "hero_intro": config["hero"]["intro"],
        "hero_cta_primary_label": config["hero"]["cta_primary"]["label"],
        "hero_cta_primary_href": config["hero"]["cta_primary"]["href"],
        "hero_cta_secondary_label": config["hero"]["cta_secondary"]["label"],
        "hero_cta_secondary_href": config["hero"]["cta_secondary"]["href"],
        "hero_background": config["hero"]["background_image"],
        "about_background": config["about_section"]["background_image"],
        "videos_background": config["videos"]["background_image"],
        "social_links": social_links(config["socials"]),
        "shows_csv_url": shows_csv_url,
        "next_show_iso": parse_starts_at(next_show["starts_at"]).isoformat(),
        "next_show_display": next_show["display_date"],
        "next_show_venue": next_show["venue"],
        "next_show_address": next_show["address"],
        "about_html": render_md(CONTENT / "about.md"),
        "repertoire_html": render_md(CONTENT / "repertoire.md"),
        "songs_html": render_md(CONTENT / "song-list.md"),
        "mailing_html": render_md(CONTENT / "mailing-list.md"),
        "videos_heading": config["videos"]["heading"],
        "videos_intro": config["videos"]["intro"],
        "videos_channel_url": config["videos"]["channel_url"],
        "videos_cta_label": config["videos"]["cta_label"],
        "featured_video_title": config["videos"]["featured"]["title"],
        "featured_video_embed": config["videos"]["featured"]["embed_url"],
        "supporting_video_cards": supporting_video_cards(config["videos"]["supporting"]),
        "schedule_rows": schedule_rows(gigs),
        "band_heading": config["band"]["heading"],
        "band_intro": config["band"]["intro"],
        "band_background": config["band"]["background_image"],
        "member_cards": member_cards(config["band"]["members"]),
        "contact_heading": config["contact"]["heading"],
        "contact_intro": config["contact"]["intro"],
        "contact_email": config["contact"]["email"],
        "contact_booking_note": config["contact"]["booking_note"],
        "contact_background": config["contact"]["background_image"],
    }

    template = Template((TEMPLATES / "index.html").read_text().replace("{{", "${").replace("}}", "}"))
    output = template.safe_substitute(replacements)
    (DIST / "index.html").write_text(output)
    print(f"Built {DIST / 'index.html'}")


if __name__ == "__main__":
    main()
