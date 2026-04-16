#!/usr/bin/env python3
"""
SEO Schema Upgrade Script v2 — VeritasVet
Adds BreadcrumbList schema + enriches Product schema with 'offers' field
across all 13 product pages (EN + FR, 26 total).

Key fix v2: injection point is immediately after </head>, not after last JSON-LD block.
"""

import os
import re
import json

PRODUCT_SLUGS = [
    "toxifix-perfect", "toxifix-plus", "toxifix", "guarbind", "versamold",
    "versapeg", "versacid-liquid", "versamos", "butycal-ccb94",
    "veroxid-b2a", "veroxid-phenols", "verivit-hy-d3", "versacid-fl-plus",
]

PRODUCT_NAMES = {
    "toxifix-perfect":   "ToxyFix Perfect",
    "toxifix-plus":      "ToxyFix Plus",
    "toxifix":           "ToxyFix",
    "guarbind":          "GuarBind",
    "versamold":         "VersaMold",
    "versapeg":          "VersaPeg",
    "versacid-liquid":   "VersaAcid Liquid",
    "versamos":          "VersaMos",
    "butycal-ccb94":     "ButyCal CCB94",
    "veroxid-b2a":       "Veroxid B2A",
    "veroxid-phenols":   "Veroxid Phenols",
    "verivit-hy-d3":     "VeriVit Hy D3",
    "versacid-fl-plus":  "VersaAcid FL Plus",
}

# (locale_key, URL prefix, directory suffix)
LOCALES = [
    ("EN", "",          ""),
    ("FR", "/fr",       "fr"),
]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_ROOT = os.path.join(BASE_DIR, "..")


def build_breadcrumb_jsonld(slug: str, url_prefix: str) -> str:
    """Build BreadcrumbList JSON-LD for a product page."""
    base = f"https://www.veritasvet.com{url_prefix}" if url_prefix else "https://www.veritasvet.com"
    prod_name = PRODUCT_NAMES.get(slug, slug)
    return f"""<script type="application/ld+json">
{{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {{
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "{base}/"
    }},
    {{
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "{base}/products/"
    }},
    {{
      "@type": "ListItem",
      "position": 3,
      "name": "{prod_name}",
      "item": "{base}/products/{slug}/"
    }}
  ]
}}
</script>"""


def load(filepath: str) -> str:
    with open(filepath, encoding="utf-8") as f:
        return f.read()


def save(filepath: str, content: str):
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)


def parse_jsonld_blocks(html: str) -> list[tuple[str, int, int]]:
    """Return list of (json_text, start_pos, end_pos) for each JSON-LD block."""
    results = []
    for m in re.finditer(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL):
        results.append((m.group(1), m.start(), m.end()))
    return results


def add_offers_to_product(block_text: str, slug: str, url_prefix: str) -> str | None:
    """Add 'offers' to a Product JSON-LD block text. Returns None if already present."""
    if '"offers"' in block_text:
        return None
    url = f"https://www.veritasvet.com{url_prefix}/products/{slug}/"
    # Try to insert after "sku": "..." line
    m = re.search(r'("sku":\s*"[^"]*"\s*,?)', block_text)
    if m:
        insert = f',\n  "offers": {{"@type": "Offer", "availability": "https://schema.org/InStock", "url": "{url}"}}'
        return block_text[:m.end()] + insert + block_text[m.end():]
    # Fallback: insert before closing brace
    stripped = block_text.rstrip()
    if stripped.endswith("}"):
        # Find last top-level closing brace
        depth = 1
        i = len(stripped) - 2
        while i >= 0 and depth > 0:
            c = stripped[i]
            if c == "}": depth += 1
            elif c == "{": depth -= 1
            i -= 1
        insert = f',\n  "offers": {{"@type": "Offer", "availability": "https://schema.org/InStock", "url": "{url}"}}'
        return stripped[:i+1] + insert + "\n" + stripped[i+1:]
    return None


def inject_breadcrumb_after_head(html: str, breadcrumb_html: str) -> str:
    """
    Inject breadcrumb JSON-LD immediately after </head> tag.
    This is the correct injection point for product pages where Product
    schema lives in <body> AFTER </head>.
    """
    marker = "</head>"
    pos = html.find(marker)
    if pos == -1:
        print("    ⚠ No </head> found")
        return html
    insert_pos = pos + len(marker)
    return html[:insert_pos] + "\n" + breadcrumb_html + html[insert_pos:]


def process_product(filepath: str, slug: str, url_prefix: str) -> bool:
    """Process one product HTML file. Returns True if modified."""
    content = load(filepath)
    original = content
    modified = False

    # ── 1. Parse JSON-LD blocks ────────────────────────────────────────────
    blocks = parse_jsonld_blocks(content)
    print(f"    Found {len(blocks)} JSON-LD block(s)")

    # ── 2. Add 'offers' to Product schema ──────────────────────────────────
    product_done = False
    for block_text, start, end in blocks:
        try:
            data = json.loads(block_text.strip())
            if data.get("@type") == "Product":
                enriched = add_offers_to_product(block_text, slug, url_prefix)
                if enriched:
                    full_match = content[start:end]
                    content = content.replace(full_match, f'<script type="application/ld+json">{enriched}</script>', 1)
                    print(f"    + offers field added to Product schema")
                    modified = True
                else:
                    print(f"    ⏭  offers already present in Product schema")
                product_done = True
        except json.JSONDecodeError:
            pass

    if not product_done:
        print(f"    ⚠ No Product schema block found")

    # ── 3. Inject BreadcrumbList after </head> ─────────────────────────────
    if "BreadcrumbList" in content:
        print(f"    ⏭  BreadcrumbList already present")
    else:
        breadcrumb_html = build_breadcrumb_jsonld(slug, url_prefix)
        content = inject_breadcrumb_after_head(content, breadcrumb_html)
        print(f"    + BreadcrumbList injected after </head>")
        modified = True

    if modified:
        save(filepath, content)

    return modified


def fix_feed_additives_html():
    """Fix canonical/hreflang in feed-additives.html files."""
    fixes = [
        (
            os.path.join(WEB_ROOT, "feed-additives.html"),
            [
                (
                    '<link rel="canonical" href="https://www.veritasvet.com/feed-additives.html">',
                    '<link rel="canonical" href="https://www.veritasvet.com/feed-additives/">',
                ),
                (
                    '<link rel="alternate" hreflang="en" href="https://www.veritasvet.com/feed-additives.html">',
                    '<link rel="alternate" hreflang="en" href="https://www.veritasvet.com/feed-additives/">',
                ),
                (
                    '<link rel="alternate" hreflang="fr" href="https://www.veritasvet.com/fr/feed-additives.html">',
                    '<link rel="alternate" hreflang="fr" href="https://www.veritasvet.com/fr/feed-additives/">',
                ),
                (
                    '<link rel="alternate" hreflang="x-default" href="https://www.veritasvet.com/feed-additives.html">',
                    '<link rel="alternate" hreflang="x-default" href="https://www.veritasvet.com/feed-additives/">',
                ),
            ],
        ),
        (
            os.path.join(WEB_ROOT, "fr", "feed-additives.html"),
            [
                (
                    '<link rel="canonical" href="https://www.veritasvet.com/fr/feed-additives.html">',
                    '<link rel="canonical" href="https://www.veritasvet.com/fr/feed-additives/">',
                ),
                (
                    '<link rel="alternate" hreflang="en" href="https://www.veritasvet.com/fr/feed-additives.html">',
                    '<link rel="alternate" hreflang="en" href="https://www.veritasvet.com/feed-additives/">',
                ),
                (
                    '<link rel="alternate" hreflang="fr" href="https://www.veritasvet.com/fr/feed-additives.html">',
                    '<link rel="alternate" hreflang="fr" href="https://www.veritasvet.com/fr/feed-additives/">',
                ),
                (
                    '<link rel="alternate" hreflang="x-default" href="https://www.veritasvet.com/fr/feed-additives.html">',
                    '<link rel="alternate" hreflang="x-default" href="https://www.veritasvet.com/feed-additives/">',
                ),
            ],
        ),
    ]

    for filepath, replacements in fixes:
        if not os.path.exists(filepath):
            print(f"  ⚠ File not found: {filepath}")
            continue
        content = load(filepath)
        orig = content
        for old, new in replacements:
            content = content.replace(old, new)
        if content != orig:
            save(filepath, content)
            print(f"  ✅ {filepath} — canonical/hreflang fixed")
        else:
            print(f"  ⏭  {filepath} — already correct")


def main():
    print("=" * 60)
    print("VeritasVet SEO Schema Upgrade v2")
    print("=" * 60)

    total_modified = 0

    for locale_name, url_prefix, dir_suffix in LOCALES:
        print(f"\n📂 [{locale_name}] url_prefix='{url_prefix}' dir='{dir_suffix}'")
        products_dir = os.path.join(WEB_ROOT, dir_suffix, "products") if dir_suffix else os.path.join(WEB_ROOT, "products")

        for slug in PRODUCT_SLUGS:
            filepath = os.path.join(products_dir, slug, "index.html")
            if not os.path.exists(filepath):
                print(f"  ⚠ Missing: {filepath}")
                continue

            relpath = os.path.join(dir_suffix, "products", slug, "index.html") if dir_suffix else os.path.join("products", slug, "index.html")
            print(f"\n  Processing: {relpath}")
            try:
                modified = process_product(filepath, slug, url_prefix)
                status = "✅ Modified" if modified else "⏭  No change"
                print(f"    {status}")
                if modified:
                    total_modified += 1
            except Exception as e:
                print(f"    🔴 Error: {e}")
                import traceback
                traceback.print_exc()

    print(f"\n🔧 Fixing feed-additives.html canonicals...")
    fix_feed_additives_html()

    print(f"\n{'=' * 60}")
    print(f"✅ Done. {total_modified} product pages modified.")
    print(f"📋 Next: git add -A && git commit && git push")
    print(f"         then trigger Vercel redeploy.")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
