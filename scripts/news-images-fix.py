#!/usr/bin/env python3
"""
Fix article + listing page images for 404/broken img src references.

Known working URLs (HTTP 200 on live site):
  ✅ /aquaculture.webp
  ✅ /feed-quality-news.png
  ✅ /animal%20performance%20news.png
  ✅ /gut-health-news.png
  ✅ /vitamin-d3-news.png
  ✅ /mycotoxin-risk-news.png
  ✅ /mycotoxins%20news.png
  ✅ /rumen-news.png
  ✅ /smart-feeding-news.png
  ✅ /news/<slug>/featured.jpg   (4 articles)

KNOWN BROKEN (404 on live site):
  ❌ /aquaculture%20news.png
  ❌ /aquaculture-feed.png
  ❌ /vitamin%20d3%20news.png
  ❌ /reduce-mycotoxin-risk-news.png
  ❌ /mycotoxin-risk-management-news.png

ACTUAL CURRENT STATE (from listing page HTML):
  1. aquaculture-feed-innovation        → listing: /aquaculture-feed.png (❌)  body: /aquaculture%20news.png (❌)
  2. feed-quality-and-durability        → listing: /pellet%20news.png   (✅)  body: /pellet%20news.png   (✅) [wrong img!]
  3. gut-health-sustainable-production  → listing: /mycotoxins%20news.png (✅) body: /mycotoxins%20news.png (✅) [wrong img!]
  4. high-bioavailability-vitamin-d3    → listing: /vitamin-d3-news.png  (✅)  body: /vitamin%20d3%20news.png (❌)
  5. reduce-mycotoxin-risk              → listing: /reduce-mycotoxin-risk-news.png (❌)  body: NONE (❌)
  6. mycotoxin-risk-management          → listing: /mycotoxin-risk-management-news.png (❌)  body: NONE (❌)
  7. smart-feeding-stronger-animals     → listing: /smart-feeding-news.png (✅)  body: NONE (❌)
  8. rumen-mycotoxin-protection-limits → listing: featured.jpg (✅)  body: featured.jpg (✅) [CORRECT]
  9. emerging-mycotoxins-feed-mills-guide → listing+body: featured.jpg (✅)  [CORRECT]
 10. fusarium-mycotoxins-dairy-cattle  → listing+body: featured.jpg (✅)  [CORRECT]
 11. mycotoxins-enteric-nervous-system-livestock → listing+body: featured.jpg (✅)  [CORRECT]
 12. gut-health-and-animal-performance-strengthening-immunity → listing+body: /animal%20performance%20news.png (✅) [CORRECT]
"""
import re, os

ARTICLES_DIR = "/home/ubuntu/veritasvet-website/news"
LISTING_PATH = os.path.join(ARTICLES_DIR, "index.html")

# Format: slug → (listing_old, listing_new, body_old, body_new)
# None = no change needed
OPERATIONS = [
    # aquaculture: listing /aquaculture-feed.png (404) + body /aquaculture%20news.png (404)
    ("aquaculture-feed-innovation",
     "/aquaculture-feed.png", "/aquaculture.webp",
     "/aquaculture%20news.png", "/aquaculture.webp"),

    # feed-quality: listing uses pellet%20news.png (wrong img), body uses pellet%20news.png (wrong img)
    ("feed-quality-and-durability",
     "/pellet%20news.png", "/feed-quality-news.png",
     "/pellet%20news.png", "/feed-quality-news.png"),

    # gut-health-sustainable: listing uses mycotoxins%20news.png (wrong img), body uses same (wrong img)
    ("gut-health-sustainable-production",
     "/mycotoxins%20news.png", "/gut-health-news.png",
     "/mycotoxins%20news.png", "/gut-health-news.png"),

    # vitamin-d3: listing uses vitamin-d3-news.png (✅), body uses vitamin%20d3%20news.png (❌)
    ("high-bioavailability-vitamin-d3",
     "/vitamin-d3-news.png", "/vitamin-d3-news.png",
     "/vitamin%20d3%20news.png", "/vitamin-d3-news.png"),

    # reduce-mycotoxin-risk: listing 404, body missing entirely
    ("reduce-mycotoxin-risk",
     "/reduce-mycotoxin-risk-news.png", "/mycotoxins%20news.png",
     None, "/mycotoxins%20news.png"),

    # mycotoxin-risk-management: listing 404, body missing entirely
    ("mycotoxin-risk-management",
     "/mycotoxin-risk-management-news.png", "/mycotoxin-risk-news.png",
     None, "/mycotoxin-risk-news.png"),

    # smart-feeding: listing correct, body missing
    ("smart-feeding-stronger-animals",
     "/smart-feeding-news.png", "/smart-feeding-news.png",
     None, "/smart-feeding-news.png"),
]


def patch_file(path, old, new):
    """Replace a string in a file. Returns True if changed."""
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()
    if old not in html:
        return False
    html = html.replace(old, new, 1)  # replace first occurrence only
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)
    return True


def add_img_after_logo(html, img_path, slug):
    """Insert article body img after the logo div closing tag."""
    logo_pattern = '<img src="/image_logo_VERITASVET.png" alt="VeritasVet">'
    insert = (
        f'{logo_pattern}</div>\n      <div class="article-image">\n'
        f'        <img src="{img_path}" alt="{slug.replace("-", " ").title()}" '
        f'width="1456" height="816" loading="eager" decoding="async">\n      </div>'
    )
    return html.replace(logo_pattern, insert, 1)


def fix_article(slug, body_old, body_new):
    if body_old is None and body_new is None:
        return []

    path = os.path.join(ARTICLES_DIR, slug, "index.html")
    with open(path, "r", encoding="utf-8") as f:
        html = f.read()

    changes = []
    if body_old is None and body_new is not None:
        # INSERT new img after the logo
        if f'src="{body_new}"' not in html:
            logo_pattern = '<img src="/image_logo_VERITASVET.png" alt="VeritasVet">'
            insert_tag = (
                f'<img src="{body_new}" alt="{slug.replace("-", " ").title()}" '
                f'width="1456" height="816" loading="eager" decoding="async">'
            )
            # Insert between the logo </div> and the next element
            html_new = html.replace(
                f'{logo_pattern}</div>',
                f'{logo_pattern}</div>\n      <div class="article-image">\n        {insert_tag}\n      </div>',
                1
            )
            if html_new != html:
                changes.append(f"  INSERT article body img: {body_new}")
                html = html_new
            else:
                changes.append(f"  INSERT FAILED — logo pattern not found")
        else:
            changes.append(f"  img {body_new} already in article HTML")
    elif body_old in html:
        html_new = html.replace(f'src="{body_old}"', f'src="{body_new}"', 1)
        if html_new != html:
            changes.append(f"  REPLACE article body: {body_old} → {body_new}")
            html = html_new
        else:
            changes.append(f"  REPLACE FAILED — pattern not in HTML")
    else:
        changes.append(f"  article body: '{body_old}' NOT FOUND in HTML")

    with open(path, "w", encoding="utf-8") as f:
        f.write(html)

    return changes


def fix_listing(slug, listing_old, listing_new):
    if listing_old is None and listing_new is None:
        return []

    with open(LISTING_PATH, "r", encoding="utf-8") as f:
        html = f.read()

    changes = []

    if listing_old is None and listing_new is not None:
        # Find the card for this slug and INSERT an img before news-card-body
        slug_pattern = f'/news/{slug}/'
        idx = html.find(slug_pattern)
        if idx == -1:
            return [f"  listing: slug path /news/{slug}/ NOT FOUND"]

        window_start = max(0, idx - 600)
        window = html[window_start:idx + 400]

        # Find the last img tag before slug
        img_matches = list(re.finditer(r'<img[^>]+src="([^"]+)"[^>]*>', window))
        non_logo_imgs = [(m, m.group(1)) for m in img_matches if 'logo' not in m.group(1).lower()]

        if non_logo_imgs:
            last_img_m = non_logo_imgs[-1][0]
            abs_start = window_start + last_img_m.start()
            abs_end = window_start + last_img_m.end()
            old_tag = window[last_img_m.start():last_img_m.end()]
            new_tag = old_tag.replace(f'src="{non_logo_imgs[-1][1]}"', f'src="{listing_new}"', 1)
            html = html[:abs_start] + new_tag + html[abs_end:]
            changes.append(f"  REPLACE listing card img: {non_logo_imgs[-1][1]} → {listing_new}")
        else:
            # No img found before news-card-body — insert before <div class="news-card-body">
            ncb_match = re.search(r'<div class="news-card-body">', window)
            if ncb_match:
                abs_pos = window_start + ncb_match.start()
                new_tag = (
                    f'<img src="{listing_new}" alt="{slug.replace("-", " ").title()}" '
                    f'width="1456" height="816" loading="lazy" decoding="async">'
                )
                html = html[:abs_pos] + new_tag + '\n      ' + html[abs_pos:]
                changes.append(f"  INSERT listing card img: {listing_new}")
            else:
                changes.append(f"  listing: could not find insertion point for {listing_new}")
    else:
        # Simple replace
        slug_pattern = f'/news/{slug}/'
        idx = html.find(slug_pattern)
        if idx == -1:
            return [f"  listing: slug path NOT FOUND"]

        window_start = max(0, idx - 600)
        window = html[window_start:idx + 400]

        img_matches = list(re.finditer(r'<img[^>]+src="([^"]+)"[^>]*>', window))
        non_logo_imgs = [(m, m.group(1)) for m in img_matches if 'logo' not in m.group(1).lower()]

        if non_logo_imgs:
            last_img_m = non_logo_imgs[-1][0]
            abs_start = window_start + last_img_m.start()
            abs_end = window_start + last_img_m.end()
            old_tag = window[last_img_m.start():last_img_m.end()]
            new_tag = old_tag.replace(f'src="{listing_old}"', f'src="{listing_new}"', 1)
            if new_tag != old_tag:
                html = html[:abs_start] + new_tag + html[abs_end:]
                changes.append(f"  REPLACE listing card: {listing_old} → {listing_new}")
            else:
                changes.append(f"  listing replace: pattern '{listing_old}' not in found img tag")
        else:
            changes.append(f"  listing: no non-logo img found near slug")

    with open(LISTING_PATH, "w", encoding="utf-8") as f:
        f.write(html)

    return changes


# ─── MAIN ───────────────────────────────────────────────────────────────────────
print("Fixing article + listing images...")
print("=" * 60)

all_changes = {}
for entry in OPERATIONS:
    slug, listing_old, listing_new, body_old, body_new = entry
    print(f"\n▶ {slug}")
    lc = fix_listing(slug, listing_old, listing_new)
    bc = fix_article(slug, body_old, body_new)
    all_changes[slug] = lc + bc
    for c in lc + bc:
        print(c)

print("\n" + "=" * 60)
print("SUMMARY")
ok = [s for s, ch in all_changes.items() if any("→" in c or "INSERT" in c or "REPLACE" in c for c in ch)]
fail = [s for s, ch in all_changes.items() if not ch or all("NOT" in c or "FAILED" in c for c in ch)]
print(f"  ✅ Fixed: {len(ok)} articles")
print(f"  ⚠️  Issues: {[s for s, ch in all_changes.items() if ch and any('FAILED' in c or 'NOT' in c for c in ch)]}")
