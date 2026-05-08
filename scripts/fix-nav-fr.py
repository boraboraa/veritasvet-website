#!/usr/bin/env python3
"""
Fix FR header: Gulf→GCC ordering, MENA label, clean mobile accordion, updated JS.
Replaces nav-links block in all FR HTML files.
73 files total (B2 pattern: nav-links → </div>\n<div class="lang-switch"> → </nav>)
Special case: fr/markets/index.html is a stub — inject nav before </nav>.
"""
import os, re

FR_DESKTOP_NAV = """
  <!-- PRODUITS DROPDOWN -->
  <div class="nav-dropdown">
    <span class="nav-link">Produits <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px;vertical-align:middle;transition:transform .2s"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="nav-dropdown-menu">
      <a href="/fr/feed-additives.html">Additifs Alimentaires</a>
      <a href="/fr/premixes/">Prémélanges</a>
      <div style="height:1px;background:var(--border-subtle);margin:.5rem 0;"></div>
      <a href="/fr/products/" style="font-weight:600;color:var(--navy);">Tous les Produits →</a>
    </div>
  </div>

  <!-- ESPÈCES DROPDOWN -->
  <div class="nav-dropdown">
    <span class="nav-link">Espèces <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px;vertical-align:middle;transition:transform .2s"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="nav-dropdown-menu">
      <a href="/fr/species/poultry/">Volaille</a>
      <a href="/fr/species/ruminant/">Ruminants</a>
      <a href="/fr/species/aquaculture/">Aquaculture</a>
    </div>
  </div>

  <!-- MARCHÉS DROPDOWN -->
  <div class="nav-dropdown nav-dropdown--markets">
    <span class="nav-link">Marchés <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px;vertical-align:middle;transition:transform .2s"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="nav-dropdown-menu nav-dropdown-menu--markets">
      <div class="nav-market-group">
        <div class="nav-market-label">Afrique de l'Ouest</div>
        <a href="/fr/markets/west-africa/nigeria/">Nigeria</a>
        <a href="/fr/markets/west-africa/">Afrique de l'Ouest</a>
      </div>
      <div class="nav-market-divider"></div>
      <div class="nav-market-group">
        <div class="nav-market-label">MENA</div>
        <a href="/fr/markets/mena/egypt/">Égypte</a>
        <a href="/fr/markets/mena/jordan/">Jordanie</a>
        <a href="/fr/markets/mena/iraq/">Irak</a>
      </div>
      <div class="nav-market-divider"></div>
      <div class="nav-market-group">
        <div class="nav-market-label">GCC</div>
        <a href="/fr/markets/gcc/saudi-arabia/">Arabie Saoudite</a>
        <a href="/fr/markets/gcc/uae/">Émirats Arabes Unis</a>
        <a href="/fr/markets/gcc/">Oman</a>
        <a href="/fr/markets/gcc/">Qatar</a>
        <a href="/fr/markets/gcc/">Koweït</a>
        <a href="/fr/markets/gcc/">Bahreïn</a>
      </div>
    </div>
  </div>

  <!-- ENTREPRISE DROPDOWN -->
  <div class="nav-dropdown">
    <span class="nav-link">Entreprise <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px;vertical-align:middle;transition:transform .2s"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="nav-dropdown-menu">
      <a href="/fr/about/">À Propos</a>
      <a href="/fr/certifications/">Certifications</a>
    </div>
  </div>

  <!-- NEWS -->
  <a class="nav-link" href="/fr/news/">Actualités</a>

  <!-- CONTACT -->
  <a class="nav-link" href="/fr/contact/">Contact</a>

  <!-- CTA -->
  <a class="nav-link nav-link--cta" href="/fr/become-distributor/">Devenir Distributeur</a>
"""

FR_NEW_JS = """function toggleMob(){
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
  document.querySelectorAll('.nav-market-group').forEach(function(g){g.classList.remove('open');});
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

# ── Pattern B2: nav-links → </div>\n<div class="lang-switch"> → </nav> ──────────────────
PAT_B2 = re.compile(
    r'(<div class="nav-links" id="navLinks">)(.*?)(</div>\n<div class="lang-switch">)',
    re.DOTALL
)

# Markets/index.html stub — no nav HTML present, inject before </nav>
STUB_PAT = re.compile(r'(</nav>\n\n<!-- HERO)', re.DOTALL)

def process_file_b2(filepath):
    with open(filepath, encoding='utf-8') as f:
        content = f.read()
    new_content, n = PAT_B2.subn(
        lambda m: m.group(1) + FR_DESKTOP_NAV.strip() + '\n' + m.group(3),
        content
    )
    if n > 0:
        new_content, n_js = OLD_JS.subn(FR_NEW_JS, new_content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return ('b2', n, n_js)
    return None

OLD_JS = re.compile(
    r"function toggleMob\(\)\{.*?"
    r"document\.querySelectorAll\('\.nav-link,\.nav-dropdown-menu a'\)\.forEach\(el=>el\.addEventListener\('click',closeMob\)\);",
    re.DOTALL
)

def process_file_stub(filepath):
    """fr/markets/index.html — no nav HTML, inject it."""
    with open(filepath, encoding='utf-8') as f:
        content = f.read()
    nav_html = f"""<div class="nav-links" id="navLinks">
{FR_DESKTOP_NAV.strip()}
</div>
"""
    new_content, n = STUB_PAT.subn(nav_html + r'\1', content)
    if n > 0:
        new_content, n_js = OLD_JS.subn(FR_NEW_JS, new_content)
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return ('stub', n, n_js)
    return None

ROOT = '/home/ubuntu/veritasvet-website'
updated = []
stub_fixed = []

for dirpath, dirs, files in os.walk(ROOT):
    if '/fr/' not in dirpath:
        continue
    for fname in sorted(files):
        if not fname.endswith('.html'):
            continue
        fpath = os.path.join(dirpath, fname)
        if 'markets/index.html' in fpath and '/markets/' in fpath and '/markets/gcc/' not in fpath and '/markets/mena/' not in fpath and '/markets/west-africa/' not in fpath:
            # It's the stub
            r = process_file_stub(fpath)
            if r:
                stub_fixed.append((fpath, r))
            continue
        r = process_file_b2(fpath)
        if r:
            updated.append((fpath, r))

print(f"B2 fixed: {len(updated)} files")
for fpath, r in updated[:5]:
    print(f"  [{r[0]} nav={r[1]} js={r[2]}] {fpath.replace(ROOT,'')}")
if len(updated) > 5:
    print(f"  ...and {len(updated)-5} more")

print(f"\nStub fixed: {len(stub_fixed)} files")
for fpath, r in stub_fixed:
    print(f"  [{r[0]} nav={r[1]} js={r[2]}] {fpath.replace(ROOT,'')}")

# Verify Markets label on a sample FR file
with open('/home/ubuntu/veritasvet-website/fr/index.html') as f:
    txt = f.read()
has_mena = 'MENA' in txt and 'Golfe' not in txt and 'Moyen-Orient' not in txt
print(f"\nFR index.html — MENA label correct: {has_mena}")
print(f"West Africa first: {'Afrique de l\\'Ouest' in txt}")
