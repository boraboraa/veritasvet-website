(function () {
  'use strict';

  /* ── Product catalogue ─────────────────────────────────────── */
  var PRODUCTS = [
    {id:'butycal-ccb94',n:'ButyCal CCB94',c:'gut-health',cn:'Gut Health',d:'Butyrate and calcium support designed for digestive resilience.',s:['Poultry','Ruminant'],inc:'As directed in product documentation',out:'Supports resilient digestive performance'},
    {id:'versamos',n:'VersaMos',c:'gut-health',cn:'Gut Health',d:'MOS-based support for digestive balance and pathogen management.',s:['Poultry'],inc:'As directed in product documentation',out:'Supports stable digestive health programs'},
    {id:'versacid-fl-plus',n:'VersAcid FL Plus',c:'gut-health',cn:'Gut Health',d:'Acidifier blend for pH and digestive optimization.',s:['Poultry'],inc:'As directed in product documentation',out:'Supports digestive and feed acidification goals'},
    {id:'versacid-liquid',n:'VersAcid Liquid',c:'gut-health',cn:'Gut Health',d:'Liquid acidifier for practical water and feed programs.',s:['Poultry'],inc:'As directed in product documentation',out:'Supports daily acidification performance'},
    {id:'toxifix',n:'ToxyFix',c:'mycotoxin-eliminator',cn:'Mycotoxin Eliminator',d:'Mycotoxin binder supporting contamination risk management.',s:['Poultry','Ruminant'],inc:'As directed in product documentation',out:'Supports mycotoxin management outcomes'},
    {id:'toxifix-plus',n:'ToxyFix Plus',c:'mycotoxin-eliminator',cn:'Mycotoxin Eliminator',d:'Enhanced mycotoxin eliminator for broad-spectrum feed challenges.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports robust toxin control plans'},
    {id:'toxifix-perfect',n:'ToxyFix Perfect',c:'mycotoxin-eliminator',cn:'Mycotoxin Eliminator',d:'Comprehensive toxin eliminator for high-risk feed scenarios.',s:['Poultry','Ruminant','Aquaculture'],inc:'As directed in product documentation',out:'Supports complete toxin elimination strategies'},
    {id:'verivit-hy-d3',n:'VeriVit HY D3',c:'nutrition',cn:'Nutrition',d:'Vitamin-focused additive supporting nutritional completeness.',s:['Poultry'],inc:'As directed in product documentation',out:'Supports nutrition-focused feed outcomes'},
    {id:'versapeg',n:'VersaPeg',c:'nutrition',cn:'Nutrition',d:'Nutritional formulation support for balanced performance.',s:['Poultry'],inc:'As directed in product documentation',out:'Supports optimized nutrition design'},
    {id:'guarbind',n:'GuarBind',c:'feed-quality',cn:'Feed Quality',d:'Feed binding solution for pellet and texture consistency.',s:['Poultry'],inc:'As directed in product documentation',out:'Supports stable feed quality metrics'},
    {id:'veroxid-b2a',n:'VerOxid B2A',c:'feed-quality',cn:'Feed Quality',d:'Antioxidant support for preserving feed freshness.',s:['Poultry'],inc:'As directed in product documentation',out:'Supports prolonged feed quality retention'},
    {id:'veroxid-phenols',n:'VerOxid Phenols',c:'feed-quality',cn:'Feed Quality',d:'Phenolic antioxidant support for feed preservation programs.',s:['Poultry'],inc:'As directed in product documentation',out:'Supports antioxidant-based feed protection'},
    {id:'versamold',n:'VersaMold',c:'feed-quality',cn:'Feed Quality',d:'Mold inhibitor for feed preservation and storage stability.',s:['Poultry'],inc:'As directed in product documentation',out:'Supports mold-free feed storage programs'}
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
    { key: 'gut-health',  label: 'Gut Health', labelFr: 'Santé Intestinale' },
    { key: 'mycotoxin',   label: 'Mycotoxin Eliminator', labelFr: 'Éliminateur de Mycotoxines' },
    { key: 'feed-quality', label: 'Feed Quality', labelFr: 'Qualité de l\'Aliment' },
    { key: 'nutrition',   label: 'Nutrition', labelFr: 'Nutrition' }
  ];

  var PREMIX_MAP = {
    poultry: {
      n: 'Versamixx Poultry',
      img: '/Versamixx%20poultry.jpeg',
      href: '/premixes/versamixx-poultry/',
      d: 'Precision micronutrition designed for your production system \u2014 broilers, layers, or breeders. Formulated to optimize feed conversion, immune resilience, and growth performance based on your flock\u2019s specific needs.'
    },
    ruminant: {
      n: 'Versamixx Dairy',
      img: '/Versamixx%20Dairy%20.jpeg',
      href: '/premixes/versamixx-dairy/',
      d: 'A custom blend of vitamins, chelated minerals, and functional additives formulated to support milk production, reproductive performance, and metabolic health in dairy cattle.'
    },
    aquaculture: {
      n: 'Versamixx Aqua',
      img: '/versamixx%20aqua.jpeg',
      href: '/premixes/versamixx-aqua/',
      d: 'Custom-developed for your aquatic species \u2014 shrimp, tilapia, salmon, or seabass. Delivers a balanced profile of vitamins, chelated minerals, and functional additives to support growth, immunity, and feed efficiency.'
    }
  };

  /* ── Language detection ────────────────────────────────────── */
  var isFr = document.documentElement.lang === 'fr' || location.pathname.indexOf('/fr/') > -1;

  /* ── French translations for dynamic strings ─────────────── */
  var FR_PRODUCTS = {
    'butycal-ccb94': {cn:'Santé Intestinale',d:'Support de butyrate et calcium conçu pour la résilience digestive.',inc:'Selon la documentation produit',out:'Soutient une performance digestive résiliente'},
    'versamos': {cn:'Santé Intestinale',d:'Support à base de MOS pour l\'équilibre digestif et la gestion des pathogènes.',inc:'Selon la documentation produit',out:'Soutient des programmes de santé digestive stables'},
    'versacid-fl-plus': {cn:'Santé Intestinale',d:'Mélange acidifiant pour l\'optimisation du pH et de la digestion.',inc:'Selon la documentation produit',out:'Soutient les objectifs d\'acidification digestive et alimentaire'},
    'versacid-liquid': {cn:'Santé Intestinale',d:'Acidifiant liquide pour les programmes pratiques d\'eau et d\'alimentation.',inc:'Selon la documentation produit',out:'Soutient la performance d\'acidification quotidienne'},
    'toxifix': {cn:'Éliminateur de Mycotoxines',d:'Liant de mycotoxines soutenant la gestion du risque de contamination.',inc:'Selon la documentation produit',out:'Soutient les résultats de gestion des mycotoxines'},
    'toxifix-plus': {cn:'Éliminateur de Mycotoxines',d:'Éliminateur de mycotoxines amélioré pour les défis alimentaires à large spectre.',inc:'Selon la documentation produit',out:'Soutient des plans de contrôle robustes des toxines'},
    'toxifix-perfect': {cn:'Éliminateur de Mycotoxines',d:'Éliminateur complet de toxines pour les scénarios alimentaires à haut risque.',inc:'Selon la documentation produit',out:'Soutient les stratégies complètes d\'élimination des toxines'},
    'verivit-hy-d3': {cn:'Nutrition',d:'Additif axé sur les vitamines soutenant la complétude nutritionnelle.',inc:'Selon la documentation produit',out:'Soutient les résultats alimentaires axés sur la nutrition'},
    'versapeg': {cn:'Nutrition',d:'Support de formulation nutritionnelle pour des performances équilibrées.',inc:'Selon la documentation produit',out:'Soutient la conception nutritionnelle optimisée'},
    'guarbind': {cn:'Qualité de l\'Aliment',d:'Solution de liaison alimentaire pour la cohérence des granulés et de la texture.',inc:'Selon la documentation produit',out:'Soutient des métriques de qualité alimentaire stables'},
    'veroxid-b2a': {cn:'Qualité de l\'Aliment',d:'Support antioxydant pour préserver la fraîcheur de l\'aliment.',inc:'Selon la documentation produit',out:'Soutient la rétention prolongée de la qualité alimentaire'},
    'veroxid-phenols': {cn:'Qualité de l\'Aliment',d:'Support antioxydant phénolique pour les programmes de préservation des aliments.',inc:'Selon la documentation produit',out:'Soutient la protection alimentaire à base d\'antioxydants'},
    'versamold': {cn:'Qualité de l\'Aliment',d:'Inhibiteur de moisissures pour la préservation des aliments et la stabilité de stockage.',inc:'Selon la documentation produit',out:'Soutient les programmes de stockage d\'aliments sans moisissure'}
  };

  var FR_PREMIX_MAP = {
    poultry: {
      n: 'Versamixx Volaille',
      d: 'Micronutrition de précision conçue pour votre système de production \u2014 poulets de chair, pondeuses ou reproducteurs. Formulée pour optimiser la conversion alimentaire, la résilience immunitaire et les performances de croissance selon les besoins spécifiques de votre élevage.'
    },
    ruminant: {
      n: 'Versamixx Dairy',
      d: 'Un mélange personnalisé de vitamines, minéraux chélatés et additifs fonctionnels formulé pour soutenir la production laitière, les performances reproductives et la santé métabolique des bovins laitiers.'
    },
    aquaculture: {
      n: 'Versamixx Aqua',
      d: 'Développé sur mesure pour vos espèces aquatiques \u2014 crevettes, tilapia, saumon ou bar. Offre un profil équilibré de vitamines, minéraux chélatés et additifs fonctionnels pour soutenir la croissance, l\'immunité et l\'efficacité alimentaire.'
    }
  };

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
    var fr = isFr && FR_PRODUCTS[p.id];
    var cn = fr ? fr.cn : p.cn;
    var desc = fr ? fr.d : p.d;
    var inc = fr ? fr.inc : p.inc;
    var out = fr ? fr.out : p.out;
    var prefix = isFr ? '/fr' : '';
    var inclLabel = isFr ? 'Incorporation :' : 'Inclusion:';
    var viewLabel = isFr ? 'Voir les Détails' : 'View Details';
    return '<a class="pc" href="' + prefix + '/products/' + p.id + '/" data-category="' + catKey(p.c) + '">' +
      '<div class="pc-vis">' +
        '<img src="' + img + '" alt="' + p.n + '" onerror="this.style.display=\'none\'">' +
        '<span class="pc-cat">' + cn + '</span>' +
      '</div>' +
      '<div class="pc-body">' +
        '<h4>' + p.n + '</h4>' +
        '<p>' + desc + '</p>' +
        '<div class="sol-proofs">' +
          '<div class="sol-proof"><span class="sol-proof-icon">&#9670;</span><span><strong>' + inclLabel + '</strong> ' + inc + '</span></div>' +
          '<div class="sol-proof"><span class="sol-proof-icon">&#9670;</span><span>' + out + '</span></div>' +
        '</div>' +
        '<span class="btn-arrow">' + viewLabel + ' &#8594;</span>' +
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
      var lbl = isFr ? c.labelFr : c.label;
      html += '<button type="button" class="sp-cat-card" data-category="' + c.key + '">' + lbl + '</button>';
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
    premix.style.display = 'none';
    var pmxData = PREMIX_MAP[species];
    var frPmx = isFr && FR_PREMIX_MAP[species];
    var pmxName = frPmx ? frPmx.n : pmxData.n;
    var pmxDesc = frPmx ? frPmx.d : pmxData.d;
    var pmxHref = isFr ? '/fr' + pmxData.href : pmxData.href;
    var pmxCatLabel = isFr ? 'Prémélange' : 'Premix';
    var pmxViewLabel = isFr ? 'Voir les Détails' : 'View Details';
    premix.innerHTML =
      '<div class="sp-products-list" style="padding:2rem 0">' +
        '<a class="pc" href="' + pmxHref + '">' +
          '<div class="pc-vis">' +
            '<img src="' + pmxData.img + '" alt="' + pmxName + '" onerror="this.style.display=\'none\'">' +
            '<span class="pc-cat">' + pmxCatLabel + '</span>' +
          '</div>' +
          '<div class="pc-body">' +
            '<h4>' + pmxName + '</h4>' +
            '<p>' + pmxDesc + '</p>' +
            '<span class="btn-arrow">' + pmxViewLabel + ' &#8594;</span>' +
          '</div>' +
        '</a>' +
      '</div>';
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
        var tabText = tab.textContent.trim();
        var isAdditives = tabText === 'Feed Additives' || tabText === 'Additifs Alimentaires';
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
