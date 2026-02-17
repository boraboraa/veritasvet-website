(function () {
  'use strict';

  /* ── Product catalogue ─────────────────────────────────────── */
  var PRODUCTS = [
    {id:'butycal-ccb94',n:'ButyCal CCB94',c:'gut-health',cn:'Gut Health',d:'Butyrate and calcium support designed for digestive resilience.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports resilient digestive performance'},
    {id:'versamos',n:'VersaMos',c:'gut-health',cn:'Gut Health',d:'MOS-based support for digestive balance and pathogen management.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports stable digestive health programs'},
    {id:'versacid-fl-plus',n:'VersAcid FL Plus',c:'gut-health',cn:'Gut Health',d:'Acidifier blend for pH and digestive optimization.',s:['Poultry','Ruminant'],inc:'As directed in product documentation',out:'Supports digestive and feed acidification goals'},
    {id:'versacid-liquid',n:'VersAcid Liquid',c:'gut-health',cn:'Gut Health',d:'Liquid acidifier for practical water and feed programs.',s:['Poultry','Aquaculture'],inc:'As directed in product documentation',out:'Supports daily acidification performance'},
    {id:'toxifix',n:'ToxyFix',c:'mycotoxin-eliminator',cn:'Mycotoxin Eliminator',d:'Mycotoxin binder supporting contamination risk management.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports mycotoxin management outcomes'},
    {id:'toxifix-plus',n:'ToxyFix Plus',c:'mycotoxin-eliminator',cn:'Mycotoxin Eliminator',d:'Enhanced mycotoxin eliminator for broad-spectrum feed challenges.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports robust toxin control plans'},
    {id:'toxifix-perfect',n:'ToxyFix Perfect',c:'mycotoxin-eliminator',cn:'Mycotoxin Eliminator',d:'Comprehensive toxin eliminator for high-risk feed scenarios.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports complete toxin elimination strategies'},
    {id:'verivit-hy-d3',n:'VeriVit HY D3',c:'nutrition',cn:'Nutrition',d:'Vitamin-focused additive supporting nutritional completeness.',s:['Poultry','Ruminant'],inc:'As directed in product documentation',out:'Supports nutrition-focused feed outcomes'},
    {id:'versapeg',n:'VersaPeg',c:'nutrition',cn:'Nutrition',d:'Nutritional formulation support for balanced performance.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports optimized nutrition design'},
    {id:'guarbind',n:'GuarBind',c:'feed-quality',cn:'Feed Quality',d:'Feed binding solution for pellet and texture consistency.',s:['Poultry','Ruminant'],inc:'As directed in product documentation',out:'Supports stable feed quality metrics'},
    {id:'veroxid-b2a',n:'VerOxid B2A',c:'feed-quality',cn:'Feed Quality',d:'Antioxidant support for preserving feed freshness.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports prolonged feed quality retention'},
    {id:'veroxid-phenols',n:'VerOxid Phenols',c:'feed-quality',cn:'Feed Quality',d:'Phenolic antioxidant support for feed preservation programs.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports antioxidant-based feed protection'},
    {id:'versamold',n:'VersaMold',c:'feed-quality',cn:'Feed Quality',d:'Mold inhibitor for feed preservation and storage stability.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports mold-free feed storage programs'}
  ];

  var IMG_MAP = {
    'butycal-ccb94':'/butycal_CCB94.jpg',
    'versamos':'/versamos.jpg',
    'versacid-fl-plus':'/veracid_fl_plus.jpg',
    'versacid-liquid':'/veracid_liquid.jpg',
    'toxifix':'/toxyfix.jpg',
    'toxifix-plus':'/toxyfix_plus.jpg',
    'toxifix-perfect':'/toxyfix_perfect.jpg',
    'verivit-hy-d3':'/verivit_hy_d3.jpg',
    'versapeg':'/versapeg.jpg',
    'guarbind':'/guarbind.jpg',
    'veroxid-b2a':'/veroxid_b2a.jpg',
    'veroxid-phenols':'/veroxid_phenols.jpg',
    'versamold':'/versamold.jpg'
  };

  var CATEGORIES = [
    { key: 'gut-health',  label: 'Gut Health' },
    { key: 'mycotoxin',   label: 'Mycotoxin Eliminator' },
    { key: 'feed-quality', label: 'Feed Quality' },
    { key: 'nutrition',   label: 'Nutrition' }
  ];

  /* ── Helpers ───────────────────────────────────────────────── */

  function catKey(raw) {
    return raw === 'mycotoxin-eliminator' ? 'mycotoxin' : raw;
  }

  function detectSpecies() {
    var el = document.querySelector('[id$="-category-grid"]');
    if (el) return el.id.replace('-category-grid', '');
    var p = location.pathname.toLowerCase();
    if (p.indexOf('poultry') > -1) return 'poultry';
    if (p.indexOf('ruminant') > -1) return 'ruminant';
    if (p.indexOf('aquaculture') > -1) return 'aquaculture';
    return null;
  }

  function cardHTML(p) {
    var img = IMG_MAP[p.id] || '';
    return '<a class="pc" href="/products/' + p.id + '/" data-category="' + catKey(p.c) + '">' +
      '<div class="pc-vis">' +
        '<img src="' + img + '" alt="' + p.n + '" onerror="this.style.display=\'none\'">' +
        '<span class="pc-cat">' + p.cn + '</span>' +
      '</div>' +
      '<div class="pc-body">' +
        '<h4>' + p.n + '</h4>' +
        '<p>' + p.d + '</p>' +
        '<div class="sol-proofs">' +
          '<div class="sol-proof"><span class="sol-proof-icon">&#9670;</span><span><strong>Inclusion:</strong> ' + p.inc + '</span></div>' +
          '<div class="sol-proof"><span class="sol-proof-icon">&#9670;</span><span>' + p.out + '</span></div>' +
        '</div>' +
        '<span class="btn-arrow">View Details &#8594;</span>' +
      '</div>' +
    '</a>';
  }

  /* ── Init ───────────────────────────────────────────────────── */

  document.addEventListener('DOMContentLoaded', function () {
    var species = detectSpecies();
    if (!species) return;

    var speciesLabel = species.charAt(0).toUpperCase() + species.slice(1);
    var speciesProducts = PRODUCTS.filter(function (p) {
      return p.s.indexOf(speciesLabel) > -1;
    });

    var container = document.getElementById(species + '-category-grid');
    if (!container) return;

    var categorySection = container.closest('.category-section');
    var tabs = document.querySelectorAll('.solution-switcher .tab');
    if (!categorySection || tabs.length < 2) return;

    /* Clear placeholder styling on dynamic-container */
    container.style.border = 'none';
    container.style.background = 'none';
    container.style.minHeight = '0';

    /* ── Render category grid ────────────────────────────────── */
    var html = '<div class="sp-cat-grid" id="category-grid">';
    CATEGORIES.forEach(function (c) {
      html += '<button type="button" class="sp-cat-card" data-category="' + c.key + '">' + c.label + '</button>';
    });
    html += '</div>';

    /* ── Render products grid ────────────────────────────────── */
    html += '<div class="sp-products-list" id="products-container">';
    speciesProducts.forEach(function (p) {
      html += cardHTML(p);
    });
    html += '</div>';

    container.innerHTML = html;

    /* ── Create premix panel ─────────────────────────────────── */
    var premix = document.createElement('section');
    premix.id = 'premix-panel';
    premix.className = 'sp-premix-panel';
    premix.style.display = 'none';
    premix.innerHTML =
      '<h3 style="font-family:\'Cormorant Garamond\',serif;font-size:1.6rem;font-weight:600;color:var(--navy,#162d50);margin-bottom:1rem">Premix Solutions</h3>' +
      '<p>Our premix programs are formulated specifically for ' + species + ' production, combining selected additives into ready-to-use blends tailored to your feed mill requirements and production objectives.</p>' +
      '<a class="btn-arrow" href="/contact/">Contact Our Team &#8594;</a>';
    categorySection.parentNode.insertBefore(premix, categorySection.nextSibling);

    /* ── DOM references ──────────────────────────────────────── */
    var catGrid = document.getElementById('category-grid');
    var productsEl = document.getElementById('products-container');
    var activeCategory = null;

    /* ── Tab switching ────────────────────────────────────────── */
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        /* Update active tab */
        tabs.forEach(function (t) {
          t.classList.remove('is-active');
          t.setAttribute('aria-pressed', 'false');
        });
        tab.classList.add('is-active');
        tab.setAttribute('aria-pressed', 'true');

        /* Toggle panels */
        var isAdditives = tab.textContent.trim() === 'Feed Additives';
        categorySection.style.display = isAdditives ? '' : 'none';
        premix.style.display = isAdditives ? 'none' : '';
      });
    });

    /* ── Category filtering ──────────────────────────────────── */
    catGrid.addEventListener('click', function (e) {
      var card = e.target.closest('.sp-cat-card');
      if (!card) return;

      var cat = card.getAttribute('data-category');

      /* Toggle off: click same category → show all */
      if (activeCategory === cat) {
        activeCategory = null;
        catGrid.querySelectorAll('.sp-cat-card').forEach(function (c) {
          c.classList.remove('active');
        });
        productsEl.querySelectorAll('.pc').forEach(function (pc) {
          pc.style.display = '';
        });
        return;
      }

      activeCategory = cat;

      /* Highlight active card */
      catGrid.querySelectorAll('.sp-cat-card').forEach(function (c) {
        c.classList.remove('active');
      });
      card.classList.add('active');

      /* Filter products */
      productsEl.querySelectorAll('.pc').forEach(function (pc) {
        pc.style.display = pc.getAttribute('data-category') === cat ? '' : 'none';
      });
    });
  });
})();
