#!/usr/bin/env python3
"""
VeritasVet News Articles SEO Fix — Phase 1
Fixes all 12 articles:
1. og:image meta tags (broken PLACEHOLDER + 404 URLs)
2. Article schema — add missing image field on all 12
3. Article schema — add to 3 articles that have NONE
4. Person author (Dr. Mehmet Dogrul) on all 12
5. FAQPage schema on all 12 articles
6. Fix H1 mismatch on gut-health-sustainable-production
"""

import re, json, os
from datetime import datetime

REPO = "/home/ubuntu/veritasvet-website"

# ─── IMAGE URL MAP ────────────────────────────────────────────────────────────
# Maps: article slug → og:image URL (must be URL-safe, no spaces)
IMAGE_MAP = {
    "aquaculture-feed-innovation":        "aquaculture.webp",
    "emerging-mycotoxins-feed-mills-guide": "news/emerging-mycotoxins-feed-mills-guide/featured.jpg",
    "feed-quality-and-durability":         "feed-quality-news.png",
    "fusarium-mycotoxins-dairy-cattle":    "news/fusarium-mycotoxins-dairy-cattle/featured.jpg",
    "gut-health-and-animal-performance-strengthening-immunity-with-proper-nutrition": "animal%20performance%20news.png",
    "gut-health-sustainable-production":   "gut-health-news.png",
    "high-bioavailability-vitamin-d3":     "vitamin-d3-news.png",
    "mycotoxin-risk-management":          "mycotoxin-risk-news.png",
    "mycotoxins-enteric-nervous-system-livestock": "news/mycotoxins-enteric-nervous-system-livestock/featured.jpg",
    "reduce-mycotoxin-risk":              "mycotoxins%20news.png",
    "rumen-mycotoxin-protection-limits":  "news/rumen-mycotoxin-protection-limits/featured.jpg",
    "smart-feeding-stronger-animals":     "smart-feeding-news.png",
}

# ─── ARTICLE SCHEMA TEMPLATE ───────────────────────────────────────────────────
# Used for the 3 articles missing schema entirely
def make_article_schema(slug, headline, desc, date_published, date_modified):
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": headline,
        "description": desc,
        "image": f"https://www.veritasvet.com/{IMAGE_MAP[slug]}",
        "datePublished": date_published,
        "dateModified": date_modified,
        "author": {
            "@type": "Person",
            "name": "Dr. Mehmet Dogrul",
            "jobTitle": "Founder & Managing Director",
            "url": "https://www.veritasvet.com/about/",
            "description": "DVM, PhD Animal Nutrition — 25+ years in feed additives and animal health"
        },
        "publisher": {
            "@id": "https://www.veritasvet.com/#organization"
        }
    }

# ─── FAQ DATA PER ARTICLE ─────────────────────────────────────────────────────
FAQ_DATA = {
    "aquaculture-feed-innovation": [
        ("What are the most important feed additives for tilapia?", "Key additives include organic acids (propionate, formate), probiotics (Bacillus spp.), prebiotics (mannan oligosaccharides), and mycotoxin binders. ToxyFix Perfect is specifically formulated for aquafeed."),
        ("How does gut health affect FCR in fish?", "A healthy gut improves nutrient absorption by up to 30%, directly reducing Feed Conversion Ratio. Gut epithelial damage from mycotoxins or pathogens forces fish to expend more energy on repair, raising FCR."),
        ("What is the best feed additive strategy for catfish?", "For catfish, focus on gut health additives (probiotics, prebiotics), anti-oxidants (vitamin C, E), and mycotoxin risk management. Pellet integrity additives also improve water quality by reducing feed dissolution."),
    ],
    "emerging-mycotoxins-feed-mills-guide": [
        ("What are emerging mycotoxins?", "Emerging mycotoxins include enniatins, beauvericin, alternariol, and patulin — toxins produced by fungi that are not routinely tested for in standard mycotoxin panels. They occur increasingly due to climate change and can cause significant performance losses even when standard tests come back clean."),
        ("Why do standard mycotoxin binder products fail on emerging toxins?", "Most clay-based binder products are formulated for aflatoxins, DON, and fumonisins. Emerging toxins like enniatins and beauvericin have different chemical structures that many binders cannot adsorb effectively."),
        ("How can feed mills detect emerging mycotoxin risk?", "Feed mills should use expanded testing panels that include LC-MS/MS analysis covering emerging toxins, particularly when using ingredients from high-risk origins. Regular raw material risk assessments and supplier quality agreements are essential."),
    ],
    "feed-quality-and-durability": [
        ("What is pellet durability index (PDI)?", "Pellet Durability Index measures how well pellets withstand handling and transport. It is expressed as a percentage — above 95% is excellent for broilers, above 90% for layers. Low PDI means fine particles that birds selectively sort and waste."),
        ("How does feed oxidation affect animal health?", "Oxidised fats generate free radicals that damage cell membranes, impair vitamin absorption, and depress immune function. Antioxidant additives (like vitamin E, selenium, and ethoxyquin) protect feed quality and animal health."),
        ("What feed additives improve feed durability?", " Pellet binders such as lignosulfonates, bentonite, and GuarBind improve pellet durability by 5-15%. Antioxidant additives prevent fat oxidation and preserve nutritional value throughout storage."),
    ],
    "fusarium-mycotoxins-dairy-cattle": [
        ("What are the most dangerous Fusarium mycotoxins for dairy cattle?", "Deoxynivalenol (DON) and zearalenone (ZEN) are the primary concerns. DON reduces feed intake and milk production even at subclinical levels. ZEN has oestrogenic effects causing reproductive disorders. Fumonisins also impair liver function."),
        ("Does rumen fermentation protect cattle from mycotoxins?", "Partially. Rumen microorganisms can degrade some DON into a less toxic form (DOM-1). However, this capacity is limited — high mycotoxin loads exceed rumen degradation capacity, and ZEN is not effectively neutralised by the rumen."),
        ("What are the clinical signs of mycotoxin exposure in dairy herds?", "Reduced feed intake, lower milk yield, poor body condition, increased somatic cell count, displaced abomasum, and reproductive disorders including silent heat, irregular cycles, and early embryonic death are common signs."),
    ],
    "gut-health-and-animal-performance-strengthening-immunity-with-proper-nutrition": [
        ("What are short-chain fatty acids (SCFA) and why do they matter?", "SCFAs (acetate, propionate, butyrate) are produced by beneficial gut bacteria fermenting dietary fibre. They serve as the primary energy source for colonocytes, strengthen the gut barrier, reduce inflammation, and improve pathogen defence."),
        ("How do medium-chain fatty acids (MCFA) work as alternatives to AGPs?", "MCFAs (C6–C12) penetrate bacterial cell walls and disrupt intracellular pH homeostasis. They are effective against a broad spectrum of Gram-positive and Gram-negative bacteria without inducing resistance, making them effective antibiotic alternatives."),
        ("What is the role of butyric acid in poultry gut health?", "Butyric acid is the preferred energy source for rumen and intestinal epithelial cells. It promotes villi height and absorptive surface area, reduces pathogen load (Salmonella, E. coli), and improves nitrogen utilisation for growth."),
    ],
    "gut-health-sustainable-production": [
        ("How do gut health additives contribute to sustainable animal production?", "By improving nutrient utilisation, gut health additives reduce the amount of feed required per unit of animal product (lower FCR), decreasing land, water, and resource use per kilogram of meat, milk, or eggs produced."),
        ("What is the environmental impact of feed additives on manure quality?", "Organic acids and phytogenic feed additives can reduce nitrogen and phosphorus excretion in manure by improving digestibility. This lowers environmental nitrogen runoff and greenhouse gas emissions from livestock production systems."),
        ("Can prebiotics replace antibiotic growth promoters (AGPs)?", "Prebiotics (MOS, β-glucans, FOS) support beneficial gut bacteria and competitively exclude pathogens. While they are a key part of AGP-free strategies, best results come from combining prebiotics with probiotics, organic acids, and proven management practices."),
    ],
    "high-bioavailability-vitamin-d3": [
        ("What is the difference between cholecalciferovit D3 and calcidiol (Hy-D3)?", "Cholecalciferol (D3) requires two metabolic conversions — first in the liver to 25-hydroxy D3 (calcidiol), then in the kidney to the active 1,25-dihydroxy D3. Calcidiol (Hy-D3) bypasses the first step, reaching optimal blood levels 4x faster."),
        ("How does vitamin D3 bioavailability affect bone health in poultry?", "Broilers with insufficient vitamin D3 develop rickets, weak bone structure, and higher incidence of lameness. Higher bioavailability D3 (calcidiol) ensures consistent 25-OH D3 blood levels even during heat stress or liver challenge, improving bone mineralisation."),
        ("Why is vitamin D3 particularly important for layers?", "Laying hens require enormous calcium fluxes for eggshell formation. 25-hydroxy D3 (Hy-D3) ensures consistent calcium mobilisation from bone and intestinal absorption even when feed intake fluctuates, maintaining shell quality and preventing osteoporosis."),
    ],
    "mycotoxin-risk-management": [
        ("What is the best mycotoxin testing protocol for feed mills?", "A robust protocol combines rapid lateral flow tests (for on-site screening) with quarterly LC-MS/MS laboratory analysis for full mycotoxin panels. Test all raw materials on receipt and finished feed monthly. Store samples for at least 3 months."),
        ("How should feed mills manage mycotoxin risk from contaminated grain?", "Implement a supplier quality specification contract requiring mycotoxin testing results with each delivery. Segregate high-risk origins. Clean and grade grain before use. Dilute contaminated lots below action thresholds using clean grain. Use an effective mycotoxin binder programme."),
        ("What is the difference between binding and biotransformation for mycotoxin management?", "Binding agents (clay, activated carbon) adsorb toxins in the gastrointestinal tract and remove them via excretion. Biotransformation enzymes (epoxidases, esterases) chemically modify toxins into non-toxic metabolites. Both strategies are complementary."),
    ],
    "mycotoxins-enteric-nervous-system-livestock": [
        ("What is the gut-brain axis in livestock?", "The gut-brain axis is the bidirectional communication network between the gastrointestinal tract and the central nervous system, mediated by the enteric nervous system (ENS), vagal afferents, immune pathways, and hormonal signals. It regulates digestion, appetite, stress response, and behaviour."),
        ("How do mycotoxins damage the enteric nervous system?", "Mycotoxins disrupt the ENS by damaging enteric glial cells (EGCs) — the support cells that protect and regulate gut neurons. This leads to impaired gut motility, compromised gut barrier integrity ('leaky gut'), dysregulated immune responses, and altered neurotransmitter signalling."),
        ("Which livestock species are most vulnerable to ENS damage from mycotoxins?", "Monogastrics (poultry, swine) are most vulnerable due to their limited capacity to metabolise mycotoxins. Ruminants have partial protection from rumen fermentation but are still susceptible at high exposure levels, particularly to ZEN and fumonisins."),
    ],
    "reduce-mycotoxin-risk": [
        ("How can mycotoxin risk be reduced at farm level?", "On-farm strategies include: sourcing feed from verified low-risk suppliers, proper grain drying to <14% moisture, controlled storage temperature and humidity, regular mycotoxin testing of farm-produced feeds, and consistent use of a proven multi-site mycotoxin binder."),
        ("What are the most cost-effective mycotoxin risk management strategies?", "The most cost-effective approach combines prevention (supplier quality agreements, grain cleaning, proper storage) with targeted use of broad-spectrum mycotoxin binders. ToxyFix Perfect and ToxyFix Plus offer multi-toxin coverage at a lower cost than repeated outbreaks."),
        ("Are natural clay mycotoxin binders safe for all animal species?", "Calcium montmorillonite and other aluminosilicate clays effectively bind aflatoxins but have variable efficacy against other mycotoxins. Over-reliance on single-site binders without testing can create a false sense of security. A multi-component binder is preferable for mixed-species operations."),
    ],
    "rumen-mycotoxin-protection-limits": [
        ("Why is rumen protection from mycotoxins incomplete?", "While rumen microorganisms can partially degrade DON and some fumonisins, the degradation capacity is limited. At high mycotoxin loads, during heat stress (when rumen motility slows), or with rapidly fermentable diets, rumen passage rate increases and degradation time is insufficient."),
        ("Which mycotoxin scenarios exceed rumen protection capacity?", "Five key scenarios: (1) High-level DON exposure from contaminated corn (>5 ppm) exceeds rumen capacity. (2) ZEN is not degraded by the rumen and passes through unchanged. (3) Heat-stressed animals have reduced rumen motility. (4) Early-lactation dairy cows with high feed intake have faster rumen passage. (5) Emerging toxins (enniatins, beauvericin) are not degraded by rumen microbes at all."),
        ("What supplementary strategies complement rumen protection?", "Use a proven rumen-protected or broad-spectrum mycotoxin binder in the total mixed ration (TMI). Test all forages and concentrates for mycotoxin risk. Consider rumen-protected probiotics and antioxidants to support gut barrier integrity during mycotoxin challenge."),
    ],
    "smart-feeding-stronger-animals": [
        ("What is precision feeding in poultry?", "Precision feeding uses technology (near-infrared spectroscopy, feed sensors, animal weighing systems) to tailor feed composition and quantity to the specific requirements of each animal or group, reducing waste and improving Feed Conversion Ratio (FCR) by 5-15%."),
        ("How do feed additives support precision feeding programmes?", "Feed additives such as enzymes (phytase, protease, xylanase), organic acids, probiotics, and mycotoxin binders enable more precise nutrient formulation by improving digestibility consistency, reducing anti-nutritional factors, and maintaining gut health under variable raw material quality."),
        ("What is the economic impact of improving FCR by 0.1 in broiler production?", "A 0.1 improvement in FCR on a 1 million bird operation represents approximately €15,000–€25,000 in annual feed cost savings, depending on feed ingredient prices. Precision feeding strategies plus gut health additives are the most reliable path to achieving this."),
    ],
}

# ─── DATE DATA ─────────────────────────────────────────────────────────────────
# datePublished for each article (from GSC data)
DATES = {
    "aquaculture-feed-innovation":         ("2026-01-10", "2026-04-18"),
    "emerging-mycotoxins-feed-mills-guide": ("2026-02-15", "2026-04-18"),
    "feed-quality-and-durability":          ("2026-02-15", "2026-04-18"),
    "fusarium-mycotoxins-dairy-cattle":    ("2026-03-31", "2026-04-18"),
    "gut-health-and-animal-performance-strengthening-immunity-with-proper-nutrition": ("2026-02-08", "2026-04-18"),
    "gut-health-sustainable-production":   ("2026-02-01", "2026-04-18"),
    "high-bioavailability-vitamin-d3":     ("2026-01-20", "2026-04-18"),
    "mycotoxin-risk-management":          ("2026-01-15", "2026-04-18"),
    "mycotoxins-enteric-nervous-system-livestock": ("2026-03-31", "2026-04-18"),
    "reduce-mycotoxin-risk":              ("2026-02-01", "2026-04-18"),
    "rumen-mycotoxin-protection-limits":  ("2026-03-31", "2026-04-18"),
    "smart-feeding-stronger-animals":     ("2026-02-20", "2026-04-18"),
}

# ─── HEADLINES (from existing Article schema or page title) ────────────────────
HEADLINES = {
    "aquaculture-feed-innovation":        "Aquaculture Feed Innovation | Tilapia & Catfish Nutrition",
    "emerging-mycotoxins-feed-mills-guide": "Why Your Mycotoxin Binder Might Not Be Working: The Emerging Toxin Problem",
    "feed-quality-and-durability":         "Feed Quality and Durability: How to Optimize Your Feeding Program",
    "fusarium-mycotoxins-dairy-cattle":    "Fusarium Mycotoxins in Dairy Cattle: What the Science Says",
    "gut-health-and-animal-performance-strengthening-immunity-with-proper-nutrition": "Gut Health and Animal Performance: Strengthening Immunity with Proper Nutrition",
    "gut-health-sustainable-production":  "Gut Health and Sustainable Production",
    "high-bioavailability-vitamin-d3":    "High Bioavailability Vitamin D3 for Poultry & Swine",
    "mycotoxin-risk-management":          "Mycotoxin Risk Management for Feed Mills",
    "mycotoxins-enteric-nervous-system-livestock": "The Hidden Threat: How Mycotoxins Damage the Gut-Brain Axis in Livestock",
    "reduce-mycotoxin-risk":               "Reduce Mycotoxin Risk in Poultry & Ruminant Feed",
    "rumen-mycotoxin-protection-limits":   "When the Rumen Is Not Enough: The Hidden Limits of Mycotoxin Protection in Ruminants",
    "smart-feeding-stronger-animals":      "Smart Feeding, Stronger Animals",
}

DESCRIPTIONS = {
    "aquaculture-feed-innovation":        "The latest feed additive strategies for tilapia and catfish farming: gut health, pellet integrity, and precision feeding for improved FCR.",
    "emerging-mycotoxins-feed-mills-guide": "Feed tests clean but FCR still off? Emerging mycotoxins like enniatins and beauvericin may be damaging your animals. Here is what feed mills can do.",
    "feed-quality-and-durability":         "Feed deterioration, crumbling pellets and oxidation reduce nutrient intake and feed efficiency. Learn how to protect your feed investment.",
    "fusarium-mycotoxins-dairy-cattle":    "Evidence-based overview of how deoxynivalenol, zearalenone, and fumonisins affect dairy cattle performance, fertility, and milk quality.",
    "gut-health-and-animal-performance-strengthening-immunity-with-proper-nutrition": "Gut health drives animal performance and immunity. Learn how targeted nutrition with SCFAs and MCFAs strengthens animals naturally.",
    "gut-health-sustainable-production":   "Incorporating gut health additives — including organic acids, prebiotics and mycotoxin binders — into sustainable animal production systems.",
    "high-bioavailability-vitamin-d3":    "Why vitamin D3 bioavailability matters for poultry bone health, eggshell quality, and immune function — and why Hy-D3 outperforms standard cholecalciferol.",
    "mycotoxin-risk-management":           "A practical guide to mycotoxin testing, risk assessment and additive programmes for feed mills operating in high-risk regions.",
    "mycotoxins-enteric-nervous-system-livestock": "Peer-reviewed research reveals mycotoxins damage the enteric nervous system in livestock — the gut-brain axis implications for animal health and performance.",
    "reduce-mycotoxin-risk":              "Evidence-based strategies to reduce mycotoxin risk in poultry and ruminant feed: testing, storage, and additive programmes.",
    "rumen-mycotoxin-protection-limits":  "Rumen microorganisms offer partial protection against Fusarium mycotoxins — but five key scenarios can overwhelm that protection. Here is what you need to know.",
    "smart-feeding-stronger-animals":      "How precision feeding strategies improve FCR, reduce waste and support animal performance through technology and targeted feed additives.",
}

# ─── FIX FUNCTIONS ─────────────────────────────────────────────────────────────

def fix_og_image(html, slug):
    """Fix the og:image meta tag."""
    img_url = f"https://www.veritasvet.com/{IMAGE_MAP[slug]}"
    if re.search(r'<meta property="og:image" content="\[PLACEHOLDER\]">', html):
        return html.replace(
            '<meta property="og:image" content="[PLACEHOLDER]">',
            f'<meta property="og:image" content="{img_url}">'
        )
    elif re.search(r'<meta property="og:image" content="[^"]*PLACEHOLDER[^"]*">', html):
        return re.sub(
            r'<meta property="og:image" content="[^"]*PLACEHOLDER[^"]*">',
            f'<meta property="og:image" content="{img_url}">',
            html
        )
    elif re.search(r'<meta property="og:image" content="[^"]+">', html):
        # Already set — replace with correct URL
        return re.sub(
            r'<meta property="og:image" content="[^"]+">',
            f'<meta property="og:image" content="{img_url}">',
            html
        )
    else:
        # og:image tag missing entirely — insert after og:description
        return re.sub(
            r'(<meta property="og:description" content="[^"]+">)',
            r'\\1\n  <meta property="og:image" content="' + img_url + '">',
            html
        )


def build_article_schema(slug):
    """Build a complete Article schema dict."""
    pub_date, mod_date = DATES[slug]
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": HEADLINES[slug],
        "description": DESCRIPTIONS[slug],
        "image": IMAGE_MAP[slug],   # relative path — host will resolve via og:URL
        "datePublished": pub_date,
        "dateModified": mod_date,
        "author": {
            "@type": "Person",
            "name": "Dr. Mehmet Dogrul",
            "jobTitle": "Founder & Managing Director",
            "url": "https://www.veritasvet.com/about/",
            "description": "DVM, PhD Animal Nutrition — 25+ years in feed additives and animal health"
        },
        "publisher": {"@id": "https://www.veritasvet.com/#organization"}
    }


def build_faq_schema(slug):
    """Build a FAQPage schema from FAQ_DATA."""
    faqs = FAQ_DATA.get(slug, [])
    if not faqs:
        return None
    questions = [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faqs]
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": questions}


def fix_article_schema(html, slug):
    """
    Adds or updates Article schema for an article.
    - If Article schema exists: patch in image field, upgrade author to Person
    - If Article schema missing: inject full Article + FAQPage schemas
    """
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    has_article = False
    for b in blocks:
        try:
            data = json.loads(b.strip())
            if data.get("@type") == "Article":
                has_article = True
                break
        except:
            pass

    new_article = build_article_schema(slug)
    new_faq = build_faq_schema(slug)

    if has_article:
        # Patch existing Article schema via targeted regex
        img_val = f"https://www.veritasvet.com/{IMAGE_MAP[slug]}"
        person_author = {
            "@type": "Person",
            "name": "Dr. Mehmet Dogrul",
            "jobTitle": "Founder & Managing Director",
            "url": "https://www.veritasvet.com/about/",
            "description": "DVM, PhD Animal Nutrition — 25+ years in feed additives and animal health"
        }
        person_author_json = json.dumps(person_author, indent=4)

        # Strategy: find the <script type="application/ld+json"> block that contains Article,
        # replace author Organization with Person, add image field, update dateModified
        def patch_article_block(m):
            raw = m.group(1)  # content inside script tag
            try:
                data = json.loads(raw)
            except:
                return m.group(0)  # return unchanged if parse fails
            if data.get("@type") != "Article":
                return m.group(0)

            # Patch fields
            data["author"] = person_author
            data["dateModified"] = "2026-04-18"
            # Add image at the end
            data["image"] = img_val
            # Remove existing publisher if it's an inline Org dict (replace with @id reference)
            if "publisher" in data and isinstance(data.get("publisher"), dict):
                data["publisher"] = {"@id": "https://www.veritasvet.com/#organization"}
            return (
                '<script type="application/ld+json">\n'
                + json.dumps(data, indent=2, ensure_ascii=False)
                + '\n</script>'
            )

        html = re.sub(
            r'<script type="application/ld\+json">((?:(?!</script>).)*?)</script>',
            patch_article_block,
            html,
            flags=re.DOTALL
        )
    else:
        # No Article schema — inject full schema block before </head> or at end of <head>
        schema_block = '\n<script type="application/ld+json">\n' + json.dumps(new_article, indent=2) + '\n</script>'
        if new_faq:
            schema_block += '\n<script type="application/ld+json">\n' + json.dumps(new_faq, indent=2) + '\n</script>'
        # Try to insert before closing </head>
        if "</head>" in html:
            html = html.replace("</head>", schema_block + "\n</head>")
        else:
            html += schema_block

    # Add FAQ schema even if Article already exists
    if new_faq and 'FAQPage' not in html:
        faq_block = '\n<script type="application/ld+json">\n' + json.dumps(new_faq, indent=2) + '\n</script>'
        if "</body>" in html:
            html = html.replace("</body>", faq_block + "\n</body>")
        else:
            html += faq_block

    return html


def fix_h1_mismatch(html, slug):
    """Fix H1 mismatch on gut-health-sustainable-production."""
    if slug != "gut-health-sustainable-production":
        return html
    # The H1 currently says "Reduce Mycotoxin Risk" but the URL is gut-health-sustainable-production
    old_h1 = "Reduce Mycotoxin Risk: Safe and Reliable Feeding Solutions"
    new_h1 = "Gut Health and Sustainable Production"
    if old_h1 in html:
        html = html.replace(old_h1, new_h1)
    return html


# ─── MAIN ──────────────────────────────────────────────────────────────────────

ARTICLES_DIR = os.path.join(REPO, "news")
slugs = list(IMAGE_MAP.keys())

stats = {"fixed_og": 0, "fixed_schema": 0, "added_faq": 0, "fixed_h1": 0, "errors": []}

for slug in slugs:
    html_path = os.path.join(ARTICLES_DIR, slug, "index.html")
    if not os.path.exists(html_path):
        stats["errors"].append(f"Missing: {html_path}")
        continue

    with open(html_path, "r", encoding="utf-8") as f:
        html = f.read()

    original = html

    # 1. Fix og:image
    html = fix_og_image(html, slug)

    # 2. Fix/add Article schema + FAQPage
    html = fix_article_schema(html, slug)

    # 3. Fix H1 mismatch
    html = fix_h1_mismatch(html, slug)

    changed = html != original
    if changed:
        with open(html_path, "w", encoding="utf-8") as f:
            f.write(html)
        stats["fixed_og"] += 1
    else:
        stats["errors"].append(f"No change: {slug}")

print("=" * 60)
print("SEO FIX COMPLETE")
print("=" * 60)
for k, v in stats.items():
    print(f"  {k}: {v}")

# ─── VERIFICATION ──────────────────────────────────────────────────────────────
print("\n=== VERIFICATION ===")
for slug in slugs:
    html_path = os.path.join(ARTICLES_DIR, slug, "index.html")
    if not os.path.exists(html_path):
        print(f"  ❌ {slug}: FILE MISSING")
        continue
    html = open(html_path).read()

    og = re.search(r'<meta property="og:image" content="([^"]+)"', html)
    blocks = re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.DOTALL)
    schemas = []
    for b in blocks:
        try:
            schemas.append(json.loads(b.strip()).get("@type", "?"))
        except:
            schemas.append("PARSE_ERR")

    h1 = re.findall(r'<h1[^>]*>(.*?)</h1>', html, re.DOTALL)
    h1_clean = [re.sub(r'<[^>]+>', '', h).strip() for h in h1]
    h1_ok = h1_clean[0] if h1_clean else "MISSING"

    author_ok = any(
        ("Dr. Mehmet Dogrul" in b and '"Person"' in b) for b in blocks
    ) if blocks else False
    faq_ok = any("FAQPage" in b for b in blocks)
    image_ok = any("image" in b and "https://www.veritasvet.com" in b for b in blocks) if blocks else False

    status = "✅" if (og and author_ok and faq_ok and image_ok) else "⚠️"
    print(f"  {status} {slug}")
    print(f"      og:image: {og.group(1)[:60] if og else 'MISSING'}")
    print(f"      H1: {h1_ok[:60]}")
    print(f"      Schema types: {schemas}")
    print(f"      Person author: {'✅' if author_ok else '❌'} | FAQPage: {'✅' if faq_ok else '❌'} | image in schema: {'✅' if image_ok else '❌'}")
