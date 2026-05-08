#!/usr/bin/env python3
"""Fix navigation in all VeritasVet HTML files.
Replaces old nav structure with new accordion dropdown + Company dropdown.
"""
import os, re

# ── Desktop nav (4 dropdowns) — shared by all EN pages ──────────────────────
DESKTOP_NAV = '''
  <!-- PRODUCTS DROPDOWN -->
  <div class="nav-dropdown">
    <span class="nav-link">Products <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px;vertical-align:middle;transition:transform .2s"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="nav-dropdown-menu">
      <a href="/feed-additives.html">Feed Additives</a>
      <a href="/premixes/">Premixes</a>
      <div style="height:1px;background:var(--border-subtle);margin:.5rem 0;"></div>
      <a href="/products/" style="font-weight:600;color:var(--navy);">View All Products →</a>
    </div>
  </div>

  <!-- SPECIES DROPDOWN -->
  <div class="nav-dropdown">
    <span class="nav-link">Species <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px;vertical-align:middle;transition:transform .2s"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="nav-dropdown-menu">
      <a href="/species/poultry/">Poultry</a>
      <a href="/species/ruminant/">Ruminants</a>
      <a href="/species/aquaculture/">Aquaculture</a>
    </div>
  </div>

  <!-- MARKETS DROPDOWN -->
  <div class="nav-dropdown">
    <span class="nav-link">Markets <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px;vertical-align:middle;transition:transform .2s"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="nav-dropdown-menu nav-dropdown-menu--markets">
      <div class="nav-market-group">
        <div class="nav-market-label">Gulf</div>
        <a href="/markets/gcc/saudi-arabia/">Saudi Arabia</a>
        <a href="/markets/gcc/uae/">UAE</a>
        <a href="/markets/gcc/">Oman</a>
        <a href="/markets/gcc/">Qatar</a>
        <a href="/markets/gcc/">Kuwait</a>
        <a href="/markets/gcc/">Bahrain</a>
      </div>
      <div class="nav-market-divider"></div>
      <div class="nav-market-group">
        <div class="nav-market-label">Middle East</div>
        <a href="/markets/mena/egypt/">Egypt</a>
        <a href="/markets/mena/jordan/">Jordan</a>
        <a href="/markets/mena/iraq/">Iraq</a>
      </div>
      <div class="nav-market-divider"></div>
      <div class="nav-market-group">
        <div class="nav-market-label">West Africa</div>
        <a href="/markets/west-africa/nigeria/">Nigeria</a>
        <a href="/markets/west-africa/">Other West Africa</a>
      </div>
    </div>
  </div>

  <!-- COMPANY DROPDOWN -->
  <div class="nav-dropdown">
    <span class="nav-link">Company <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px;vertical-align:middle;transition:transform .2s"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="nav-dropdown-menu">
      <a href="/about/">About Us</a>
      <a href="/certifications/">Certifications</a>
      <a href="/become-distributor/">Become a Distributor</a>
    </div>
  </div>

  <!-- NEWS -->
  <a class="nav-link" href="/news/">News</a>

  <!-- CONTACT -->
  <a class="nav-link" href="/contact/">Contact</a>

  <!-- DESKTOP CTA -->
  <a class="nav-link nav-link--cta" href="/become-distributor/">Become a Distributor</a>

  <!-- MOBILE CONTACT -->
  <div class="nav-mobile-contact">
    <a class="nav-mobile-whatsapp" href="https://wa.me/32470954643?text=Hi%20VeritasVet%2C%20I%27d%20like%20to%20discuss%20feed%20additive%20solutions." target="_blank" rel="noopener">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      WhatsApp Us
    </a>
    <a class="nav-mobile-tel" href="tel:+32470954643">+32 470 95 46 43</a>
  </div>
'''

# ── Old nav block pattern (multiline) ────────────────────────────────────────
# Matches from <div class="nav-links" id="navLinks"> to just before </div> that closes nav-links
OLD_NAV_PATTERN = re.compile(
    r'<div class="nav-links" id="navLinks">.*?</div>\s*\n\s*<div class="nav-social">',
    re.DOTALL
)

# ── Old JS pattern ───────────────────────────────────────────────────────────
OLD_JS = re.compile(
    r"function toggleMob\(\)\{document\.getElementById\('navLinks'\)\.classList\.toggle\('open'\);document\.getElementById\('hamburger'\)\.classList\.toggle\('active'\)\}\n"
    r"function closeMob\(\)\{document\.getElementById\('navLinks'\)\.classList\.remove\('open'\);document\.getElementById\('hamburger'\)\.classList\.remove\('active'\)\}\n"
    r"document\.querySelectorAll\('\.nav-link,\.nav-dropdown-menu a'\)\.forEach\(el=>el\.addEventListener\('click',closeMob\)\);",
    re.DOTALL
)

NEW_JS = """function toggleMob(){
  var nav=document.getElementById('navLinks');
  var ham=document.getElementById('hamburger');
  nav.classList.toggle('open');
  ham.classList.toggle('active');
  if(!nav.classList.contains('open')){closeMobDrops();}
}
function closeMob(){
  document.getElementById('navLinks').classList.remove('open');
  document.getElementById('hamburger').classList.remove('active');
  closeMobDrops();
}
function closeMobDrops(){
  document.querySelectorAll('.nav-dropdown').forEach(function(d){d.classList.remove('open');});
}
document.querySelectorAll('.nav-dropdown > .nav-link').forEach(function(el){
  el.addEventListener('click',function(e){
    if(window.innerWidth<=768){
      e.preventDefault();
      var dropdown=this.parentElement;
      document.querySelectorAll('.nav-dropdown.open').forEach(function(openDd){
        if(openDd!==dropdown)openDd.classList.remove('open');
      });
      dropdown.classList.toggle('open');
    }
  });
});
document.querySelectorAll('.nav-links a:not(.nav-dropdown > .nav-link)').forEach(function(el){
  el.addEventListener('click',closeMob);
});
window.addEventListener('resize',function(){
  if(window.innerWidth>768){closeMob();}
});"""

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content

    # Replace nav block
    new_nav = '<div class="nav-links" id="navLinks">\n' + DESKTOP_NAV.strip() + '\n</div>\n'
    content, n_nav = OLD_NAV_PATTERN.subn(new_nav, content)

    # Replace JS
    content, n_js = OLD_JS.subn(NEW_JS, content)

    if n_nav > 0 or n_js > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return (n_nav, n_js)
    return (0, 0)

# ── Find all HTML files (excluding fr/) ──────────────────────────────────────
ROOT = '/home/ubuntu/veritasvet-website'
updated = []
for dirpath, dirs, files in os.walk(ROOT):
    # Skip fr/ directory
    if '/fr/' in dirpath or dirpath.endswith('/fr'):
        continue
    for fname in files:
        if fname.endswith('.html'):
            fpath = os.path.join(dirpath, fname)
            n_nav, n_js = process_file(fpath)
            if n_nav or n_js:
                updated.append((fpath, n_nav, n_js))

print(f"Updated {len(updated)} files:")
for fpath, n_nav, n_js in updated:
    print(f"  [{n_nav} nav, {n_js} js] {fpath.replace(ROOT, '')}")
