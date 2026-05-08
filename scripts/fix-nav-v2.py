#!/usr/bin/env python3
"""Fix navigation in all VeritasVet EN HTML files — simplified Markets, Company without distributor."""
import os, re

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
  <div class="nav-dropdown nav-dropdown--markets">
    <span class="nav-link">Markets <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px;vertical-align:middle;transition:transform .2s"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="nav-dropdown-menu nav-dropdown-menu--markets">
      <div class="nav-market-group">
        <div class="nav-market-label">West Africa</div>
        <a href="/markets/west-africa/nigeria/">Nigeria</a>
        <a href="/markets/west-africa/">West Africa</a>
      </div>
      <div class="nav-market-divider"></div>
      <div class="nav-market-group">
        <div class="nav-market-label">MENA</div>
        <a href="/markets/mena/egypt/">Egypt</a>
        <a href="/markets/mena/jordan/">Jordan</a>
        <a href="/markets/mena/iraq/">Iraq</a>
      </div>
      <div class="nav-market-divider"></div>
      <div class="nav-market-group">
        <div class="nav-market-label">GCC</div>
        <a href="/markets/gcc/saudi-arabia/">Saudi Arabia</a>
        <a href="/markets/gcc/uae/">UAE</a>
        <a href="/markets/gcc/">Oman</a>
        <a href="/markets/gcc/">Qatar</a>
        <a href="/markets/gcc/">Kuwait</a>
        <a href="/markets/gcc/">Bahrain</a>
      </div>
    </div>
  </div>

  <!-- COMPANY DROPDOWN -->
  <div class="nav-dropdown">
    <span class="nav-link">Company <svg class="nav-chevron" width="10" height="6" viewBox="0 0 10 6" fill="none" style="margin-left:4px;vertical-align:middle;transition:transform .2s"><path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    <div class="nav-dropdown-menu">
      <a href="/about/">About Us</a>
      <a href="/certifications/">Certifications</a>
    </div>
  </div>

  <!-- NEWS -->
  <a class="nav-link" href="/news/">News</a>

  <!-- CONTACT -->
  <a class="nav-link" href="/contact/">Contact</a>

  <!-- CTA -->
  <a class="nav-link nav-link--cta" href="/become-distributor/">Become a Distributor</a>
'''

# Match from nav-links open div to just before nav-social div
OLD_NAV_PATTERN = re.compile(
    r'<div class="nav-links" id="navLinks">.*?</div>\s*\n\s*<div class="nav-social">',
    re.DOTALL
)

OLD_JS = re.compile(
    r"function toggleMob\(\)\{.*?document\.querySelectorAll\('\.nav-link,\.nav-dropdown-menu a'\)\.forEach\(el=>el\.addEventListener\('click',closeMob\)\);",
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

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    original = content

    new_nav = '<div class="nav-links" id="navLinks">\n' + DESKTOP_NAV.strip() + '\n</div>\n'
    content, n_nav = OLD_NAV_PATTERN.subn(new_nav, content)
    content, n_js = OLD_JS.subn(NEW_JS, content)

    if n_nav > 0 or n_js > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return (n_nav, n_js)
    return (0, 0)

ROOT = '/home/ubuntu/veritasvet-website'
updated = []
for dirpath, dirs, files in os.walk(ROOT):
    if '/fr/' in dirpath or dirpath.endswith('/fr'):
        continue
    for fname in files:
        if fname.endswith('.html'):
            fpath = os.path.join(dirpath, fname)
            n_nav, n_js = process_file(fpath)
            if n_nav or n_js:
                updated.append((fpath, n_nav, n_js))

print(f"Updated {len(updated)} EN files:")
for fpath, n_nav, n_js in updated:
    print(f"  [{n_nav} nav, {n_js} js] {fpath.replace(ROOT, '')}")