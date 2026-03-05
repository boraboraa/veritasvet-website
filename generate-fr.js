#!/usr/bin/env node
/**
 * generate-fr.js — Generates French (/fr/) versions of all English pages
 * Also adds hreflang tags and language switcher to English pages
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITE_URL = 'https://www.veritasvet.com';

// ─── Collect all HTML files ───────────────────────────────────────
function collectHtml(dir, base) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel = path.relative(base, full);
    if (entry.isDirectory()) {
      if (['.git', '.claude', 'node_modules', 'fr'].includes(entry.name)) continue;
      results = results.concat(collectHtml(full, base));
    } else if (entry.name.endsWith('.html')) {
      results.push(rel);
    }
  }
  return results;
}

// ─── Translation dictionary ──────────────────────────────────────
// Ordered from longest to shortest to avoid partial matches
const translations = [
  // Page titles
  ['VeritasVet — Science-Driven Animal Nutrition', 'VeritasVet — Nutrition Animale Scientifique'],
  ['Company | VeritasVet', 'Entreprise | VeritasVet'],
  ['Contact | VeritasVet', 'Contact | VeritasVet'],
  ['Feed Additives | VeritasVet', 'Additifs Alimentaires | VeritasVet'],
  ['Products | VeritasVet', 'Produits | VeritasVet'],
  ['Premixes | VeritasVet', 'Prémélanges | VeritasVet'],
  ['Technical Insights | VeritasVet', 'Perspectives Techniques | VeritasVet'],
  ['Certifications | VeritasVet', 'Certifications | VeritasVet'],
  ['Legal Notice | VeritasVet', 'Mentions Légales | VeritasVet'],
  ['Privacy Policy | VeritasVet', 'Politique de Confidentialité | VeritasVet'],
  ['Cookie Policy | VeritasVet', 'Politique des Cookies | VeritasVet'],
  ['Terms &amp; Conditions | VeritasVet', 'Conditions Générales | VeritasVet'],
  ['Terms & Conditions | VeritasVet', 'Conditions Générales | VeritasVet'],

  // Nav links
  ['>Company</a>', '>Entreprise</a>'],
  ['>Poultry</a>', '>Volaille</a>'],
  ['>Ruminants</a>', '>Ruminants</a>'],
  ['>Aquaculture</a>', '>Aquaculture</a>'],
  ['>Feed Additives</a>', '>Additifs Alimentaires</a>'],
  ['>Premixes</a>', '>Prémélanges</a>'],
  ['>News</a>', '>Actualités</a>'],
  ['>Contact</a>', '>Contact</a>'],

  // Nav dropdown labels
  ['">Species ', '">Espèces '],
  ['">Products ', '">Produits '],

  // Homepage hero
  ['Feed Additive &amp; Premix for Animal Health', 'Additifs &amp; Prémélanges pour la Santé Animale'],
  ['Feed Additive & Premix for Animal Health', 'Additifs & Prémélanges pour la Santé Animale'],
  ['FEED ADDITIVES & PREMIX FOR ANIMAL HEALTH', 'ADDITIFS & PRÉMÉLANGES POUR LA SANTÉ ANIMALE'],
  ['FEED ADDITIVES &amp; PREMIX FOR ANIMAL HEALTH', 'ADDITIFS &amp; PRÉMÉLANGES POUR LA SANTÉ ANIMALE'],
  ['<span class="hero-title-navy">Feed Smarter,</span><br><em>Grow Stronger</em>', '<span class="hero-title-navy">Nourrir Intelligemment,</span><br><em>Grandir Plus Fort</em>'],
  ['VeritasVet provides science-based feeding solutions designed to enhance animal resilience, efficiency, and performance.', 'VeritasVet fournit des solutions alimentaires scientifiques conçues pour améliorer la résilience, l\'efficacité et les performances animales.'],
  ['>Explore Products</a>', '>Découvrir les Produits</a>'],
  ['>Request Info</a>', '>Demander des Informations</a>'],
  ['<span>Scroll</span>', '<span>Défiler</span>'],

  // Credibility section
  ['Quality & Compliance', 'Qualité & Conformité'],
  ['Quality &amp; Compliance', 'Qualité &amp; Conformité'],
  ['Certified European Standards', 'Normes Européennes Certifiées'],
  ['All products are manufactured under internationally recognized quality and safety systems — independently audited and continuously monitored.', 'Tous les produits sont fabriqués selon des systèmes de qualité et de sécurité reconnus internationalement — audités indépendamment et surveillés en continu.'],
  ['View all certifications →', 'Voir toutes les certifications →'],
  ['International Reach', 'Portée Internationale'],
  ['Active Across Key Markets', 'Actif sur les Marchés Clés'],
  ['VeritasVet operates across Europe, the Middle East and North Africa through technical partnerships and distribution networks.', 'VeritasVet opère en Europe, au Moyen-Orient et en Afrique du Nord grâce à des partenariats techniques et des réseaux de distribution.'],
  ['View regions we serve →', 'Voir les régions que nous desservons →'],

  // Species panels
  [' By Species', ' Par Espèce'],
  ['Feed Additive Solutions by Species', 'Solutions d\'Additifs Alimentaires par Espèce'],
  ['Performance-driven feed additives engineered for species-specific physiology and production goals.', 'Additifs alimentaires axés sur la performance, conçus pour la physiologie spécifique à chaque espèce et les objectifs de production.'],
  ['Feed additives supporting rumen function, metabolic efficiency, and consistent production performance in dairy and beef systems.', 'Additifs alimentaires soutenant la fonction ruminale, l\'efficacité métabolique et les performances de production constantes dans les systèmes laitiers et bovins.'],
  ['Designed for rumen stability and feed conversion optimization.', 'Conçus pour la stabilité ruminale et l\'optimisation de la conversion alimentaire.'],
  ['>View Solutions</span>', '>Voir les Solutions</span>'],
  ['Feed additives engineered to enhance gut integrity, growth rate, and feed efficiency across broiler and layer operations.', 'Additifs alimentaires conçus pour améliorer l\'intégrité intestinale, le taux de croissance et l\'efficacité alimentaire dans les élevages de poulets de chair et de pondeuses.'],
  ['Targeted solutions for digestive health and flock performance.', 'Solutions ciblées pour la santé digestive et les performances du troupeau.'],
  ['Targeted feed additives for healthy growth, water quality management, and optimized performance in fish and shrimp farming.', 'Additifs alimentaires ciblés pour une croissance saine, la gestion de la qualité de l\'eau et des performances optimisées en pisciculture et crevetticulture.'],
  ['Supporting sustainable aquatic production systems.', 'Soutenir des systèmes de production aquatique durables.'],

  // Insights section
  [' Latest Research', ' Dernières Recherches'],
  ['Industry Insights', 'Perspectives du Secteur'],
  ['Stay informed with our latest findings and research developments.', 'Restez informé de nos dernières découvertes et développements en recherche.'],
  ['Gut Health and Animal Performance: Strengthening Immunity with Proper Nutrition', 'Santé Intestinale et Performance Animale : Renforcer l\'Immunité par une Nutrition Adaptée'],
  ['How nutrition-centered gut health strategies reinforce immunity and support consistent animal performance across production systems.', 'Comment les stratégies de santé intestinale centrées sur la nutrition renforcent l\'immunité et soutiennent des performances animales constantes dans les systèmes de production.'],
  ['Feed Quality and Durability', 'Qualité et Durabilité de l\'Aliment'],
  ['Benchmarks and quality checks to support consistent feed handling outcomes and reduce nutrient loss during storage and transport.', 'Références et contrôles de qualité pour garantir des résultats de manipulation cohérents et réduire la perte de nutriments pendant le stockage et le transport.'],
  ['Reduce Mycotoxin Risk: Safe and Reliable Feeding Solutions', 'Réduire le Risque de Mycotoxines : Solutions Alimentaires Sûres et Fiables'],
  ['Incorporating toxin binders and mycotoxin eliminator solutions into feeding programs to ensure safe, reliable animal production.', 'Intégrer des liants de toxines et des solutions d\'élimination des mycotoxines dans les programmes alimentaires pour assurer une production animale sûre et fiable.'],
  ['View all technical insights →', 'Voir toutes les perspectives techniques →'],

  // CTA section
  ['Ready to Optimize Your Feed Program?', 'Prêt à Optimiser Votre Programme Alimentaire ?'],
  ['Whether you need a technical data sheet, a tailored quotation, or distribution partnership information, our team responds within 24 hours.', 'Que vous ayez besoin d\'une fiche technique, d\'un devis personnalisé ou d\'informations sur un partenariat de distribution, notre équipe répond sous 24 heures.'],
  ['Technical Data Sheet', 'Fiche Technique'],
  ['Request a Quote', 'Demander un Devis'],
  ['Become a Distributor', 'Devenir Distributeur'],
  ['>Contact Our Team →</a>', '>Contacter Notre Équipe →</a>'],
  ['>Contact Our Team</a>', '>Contacter Notre Équipe</a>'],

  // Footer
  ['Science-driven feed additive solutions for modern animal production. Supporting animal health, performance, and sustainability worldwide.', 'Solutions d\'additifs alimentaires scientifiques pour la production animale moderne. Soutenir la santé, les performances et la durabilité animales dans le monde entier.'],
  ['>About Us</a>', '>À Propos</a>'],
  ['>Our Solutions</a>', '>Nos Solutions</a>'],
  ['>Research</a>', '>Recherche</a>'],
  ['<h5>Company</h5>', '<h5>Entreprise</h5>'],
  ['<h5>Products</h5>', '<h5>Produits</h5>'],
  ['<h5>Species</h5>', '<h5>Espèces</h5>'],
  ['<h5>Legal</h5>', '<h5>Juridique</h5>'],
  ['>Legal Notice</a>', '>Mentions Légales</a>'],
  ['>Privacy Policy</a>', '>Politique de Confidentialité</a>'],
  ['>Cookie Policy</a>', '>Politique des Cookies</a>'],
  ['>Terms &amp; Conditions</a>', '>Conditions Générales</a>'],
  ['>Terms & Conditions</a>', '>Conditions Générales</a>'],
  ['Get our latest research updates', 'Recevez nos dernières mises à jour de recherche'],
  ['Your email address', 'Votre adresse e-mail'],
  ['>Subscribe</button>', '>S\'abonner</button>'],
  ['&copy; 2026 VeritasVet. All rights reserved.', '&copy; 2026 VeritasVet. Tous droits réservés.'],
  ['Trusted Partner in Animal Nutrition', 'Partenaire de Confiance en Nutrition Animale'],

  // About page
  ['Quality You Can Trust, Prices You Can Afford', 'Qualité de Confiance, Prix Abordables'],
  ['VeritasVet is a technical animal nutrition partner providing practical feed additive strategies to improve animal resilience, feed safety and production efficiency under real farming conditions.', 'VeritasVet est un partenaire technique en nutrition animale fournissant des stratégies pratiques d\'additifs alimentaires pour améliorer la résilience animale, la sécurité des aliments et l\'efficacité de production dans des conditions d\'élevage réelles.'],
  ['<h2>Who We Are</h2>', '<h2>Qui Sommes-Nous</h2>'],
  ['VeritasVet is a European-based animal nutrition company providing scientifically grounded feed additive and premix solutions designed to support performance, safety and cost-efficiency across international markets.', 'VeritasVet est une entreprise européenne de nutrition animale fournissant des solutions d\'additifs alimentaires et de prémélanges scientifiquement fondées, conçues pour soutenir la performance, la sécurité et la rentabilité sur les marchés internationaux.'],
  ['We operate with a flexible sourcing model, collaborating with certified manufacturing partners while maintaining strict quality standards and technical supervision. Our objective is simple: deliver reliable, economically relevant solutions adapted to real production constraints.', 'Nous opérons avec un modèle d\'approvisionnement flexible, collaborant avec des partenaires de fabrication certifiés tout en maintenant des normes de qualité strictes et une supervision technique. Notre objectif est simple : fournir des solutions fiables et économiquement pertinentes adaptées aux contraintes de production réelles.'],
  ['Managing Director &amp; Founder', 'Directeur Général &amp; Fondateur'],
  ['Managing Director & Founder', 'Directeur Général & Fondateur'],
  ['Leadership &amp; Industry Experience', 'Direction &amp; Expérience Industrielle'],
  ['Leadership & Industry Experience', 'Direction & Expérience Industrielle'],
  ['VeritasVet was founded by Dr. Mehmet Dogrul, Veterinarian (DVM), PhD in Animal Nutrition and MBA, bringing more than 25 years of international experience in animal health and feed business leadership.', 'VeritasVet a été fondée par le Dr Mehmet Dogrul, Vétérinaire (DVM), PhD en Nutrition Animale et MBA, apportant plus de 25 ans d\'expérience internationale dans la santé animale et la direction commerciale des aliments pour animaux.'],
  ['His career bridges scientific expertise and executive responsibility across feed additives, premixes and complete feed operations.', 'Sa carrière fait le pont entre l\'expertise scientifique et la responsabilité de direction à travers les additifs alimentaires, les prémélanges et les opérations d\'alimentation complète.'],
  ['At Pfizer Animal Health, he managed senior commercial operations within the poultry division, overseeing regional activities representing more than USD 80 million in annual revenue.', 'Chez Pfizer Animal Health, il a dirigé les opérations commerciales seniors au sein de la division avicole, supervisant des activités régionales représentant plus de 80 millions USD de chiffre d\'affaires annuel.'],
  ['He later assumed full P&amp;L responsibility exceeding USD 100 million annually at IFFCO Animal Nutrition, leading diversified portfolios across feed additives, premixes and feed production in multiple markets.', 'Il a ensuite assumé la responsabilité complète du P&amp;L dépassant 100 millions USD annuellement chez IFFCO Animal Nutrition, dirigeant des portefeuilles diversifiés à travers les additifs alimentaires, les prémélanges et la production d\'aliments dans plusieurs marchés.'],
  ['With a background combining veterinary science, strategic management and large-scale operational leadership, Dr. Dogrul founded VeritasVet to deliver technically sound and economically optimized nutritional solutions tailored to real production environments.', 'Avec une formation combinant les sciences vétérinaires, le management stratégique et la direction opérationnelle à grande échelle, le Dr Dogrul a fondé VeritasVet pour fournir des solutions nutritionnelles techniquement solides et économiquement optimisées adaptées aux environnements de production réels.'],
  ['Manufacturing &amp; Quality Standards', 'Fabrication &amp; Normes de Qualité'],
  ['Manufacturing & Quality Standards', 'Fabrication & Normes de Qualité'],
  ['Our feed additive and premix solutions are produced in fully automated manufacturing facilities engineered for precision, consistency, and strict regulatory compliance.', 'Nos solutions d\'additifs alimentaires et de prémélanges sont produites dans des installations de fabrication entièrement automatisées conçues pour la précision, la cohérence et le strict respect de la réglementation.'],
  ['Through advanced quality control systems, independent audit validation, and complete end-to-end batch traceability, we ensure consistent product performance and full documentation transparency for our partners worldwide.', 'Grâce à des systèmes de contrôle qualité avancés, une validation d\'audit indépendante et une traçabilité complète de bout en bout, nous assurons des performances produit constantes et une transparence documentaire totale pour nos partenaires dans le monde entier.'],
  ['Flexible International Supply &amp; Documentation', 'Approvisionnement International Flexible &amp; Documentation'],
  ['Flexible International Supply & Documentation', 'Approvisionnement International Flexible & Documentation'],
  ['We support international partners with structured export logistics and precise documentation management tailored to regional regulatory requirements.<br>From CIF to FOB and Ex-Works pricing structures, we adapt to your operational preferences while ensuring full compliance.', 'Nous accompagnons nos partenaires internationaux avec une logistique d\'exportation structurée et une gestion documentaire précise adaptée aux exigences réglementaires régionales.<br>Des structures de prix CIF, FOB et Ex-Works, nous nous adaptons à vos préférences opérationnelles tout en assurant une conformité totale.'],
  ['Our team manages certificate preparation, government-required documentation, customs clearance coordination, and validated packaging standards — delivering accurate documentation on time and ensuring smooth goods release at destination.', 'Notre équipe gère la préparation des certificats, la documentation requise par les gouvernements, la coordination du dédouanement et les normes d\'emballage validées — livrant une documentation précise à temps et assurant une libération fluide des marchandises à destination.'],
  ['Global shipping coordination', 'Coordination logistique mondiale'],
  ['Export &amp; customs documentation', 'Documentation douanière &amp; d\'exportation'],
  ['Export & customs documentation', 'Documentation douanière & d\'exportation'],
  ['CIF / FOB / Ex-Works flexibility', 'Flexibilité CIF / FOB / Ex-Works'],
  ['Certified packaging &amp; traceability', 'Emballage certifié &amp; traçabilité'],
  ['Certified packaging & traceability', 'Emballage certifié & traçabilité'],
  ['Our Headquarters &amp; Legal Entities', 'Notre Siège &amp; Entités Juridiques'],
  ['Our Headquarters & Legal Entities', 'Notre Siège & Entités Juridiques'],
  ['To ensure regulatory alignment, commercial flexibility and seamless international operations, VeritasVet operates through three legally established entities strategically positioned across Europe and the Middle East.', 'Pour assurer l\'alignement réglementaire, la flexibilité commerciale et des opérations internationales fluides, VeritasVet opère à travers trois entités juridiquement établies stratégiquement positionnées en Europe et au Moyen-Orient.'],
  ['Regional Presence', 'Présence Régionale'],
  ['VeritasVet collaborates with partners across the Middle East, delivering localized nutritional strategies adapted to regional farming conditions and market requirements.', 'VeritasVet collabore avec des partenaires au Moyen-Orient, fournissant des stratégies nutritionnelles localisées adaptées aux conditions d\'élevage régionales et aux exigences du marché.'],
  ['Proven Performance', 'Performance Prouvée'],
  ['Our solutions are assessed through recognized validation systems. Mycotoxin management technologies are evaluated using the UGent simulated gastrointestinal digestion model and independently verified by Trilogy Analytical Laboratories (USA).', 'Nos solutions sont évaluées par des systèmes de validation reconnus. Les technologies de gestion des mycotoxines sont évaluées à l\'aide du modèle de digestion gastro-intestinale simulée de l\'UGent et vérifiées indépendamment par Trilogy Analytical Laboratories (USA).'],
  ['Our collaboration model is supported by manufacturing partners operating under internationally recognized certification systems.', 'Notre modèle de collaboration est soutenu par des partenaires de fabrication opérant sous des systèmes de certification reconnus internationalement.'],
  ['All products comply with GMP+, HACCP, FAMI-QS and ISO 22000 standards.', 'Tous les produits sont conformes aux normes GMP+, HACCP, FAMI-QS et ISO 22000.'],
  ['>View Certifications</a>', '>Voir les Certifications</a>'],
  ['Let\'s Work Together', 'Travaillons Ensemble'],
  ['Whether you are looking to distribute our solutions or optimize your feeding programs, our technical team is ready to discuss your needs and define the most suitable collaboration.', 'Que vous cherchiez à distribuer nos solutions ou à optimiser vos programmes alimentaires, notre équipe technique est prête à discuter de vos besoins et à définir la collaboration la plus adaptée.'],
  ['Schedule a short meeting with us — no commitment, just practical discussion.', 'Planifiez une courte réunion avec nous — sans engagement, juste une discussion pratique.'],
  ['>Book a Meeting</a>', '>Prendre Rendez-vous</a>'],
  ['>Become a Partner</a>', '>Devenir Partenaire</a>'],

  // Contact page
  ['Let\'s build the right solution together', 'Construisons ensemble la bonne solution'],
  ['Every operation is different. Describe your needs — we will take care of the rest.', 'Chaque opération est différente. Décrivez vos besoins — nous nous occupons du reste.'],
  ['Response time: 6–24 business hours', 'Temps de réponse : 6–24 heures ouvrées'],
  ['Company Name', 'Nom de l\'Entreprise'],
  ['Your company name', 'Le nom de votre entreprise'],
  ['Professional Email', 'E-mail Professionnel'],
  ['Phone', 'Téléphone'],
  ['(Optional)', '(Facultatif)'],
  ['Activity Type', 'Type d\'Activité'],
  ['Select your activity', 'Sélectionnez votre activité'],
  ['>Feedmill</option>', '>Usine d\'Aliments</option>'],
  ['>Integrator</option>', '>Intégrateur</option>'],
  ['>Distributor</option>', '>Distributeur</option>'],
  ['>Premix Manufacturer</option>', '>Fabricant de Prémélanges</option>'],
  ['>Nutrition Consultant</option>', '>Consultant en Nutrition</option>'],
  ['>Other</option>', '>Autre</option>'],
  ['Number of Feed Mills', 'Nombre d\'Usines d\'Aliments'],
  ['Annual Production Volume', 'Volume de Production Annuel'],
  ['Species Focus', 'Espèce Ciblée'],
  ['Number of Farms', 'Nombre de Fermes'],
  ['Territory / Region', 'Territoire / Région'],
  ['Current Portfolio', 'Portefeuille Actuel'],
  ['Specialization', 'Spécialisation'],
  ['Production Capacity', 'Capacité de Production'],
  ['Number of Clients', 'Nombre de Clients'],
  ['Please Specify', 'Veuillez Préciser'],
  ['Describe your activity', 'Décrivez votre activité'],
  ['Area of Interest', 'Domaine d\'Intérêt'],
  ['Select area of interest', 'Sélectionnez le domaine d\'intérêt'],
  ['>Feed Additives</option>', '>Additifs Alimentaires</option>'],
  ['>Premixes</option>', '>Prémélanges</option>'],
  ['>Technical Support</option>', '>Support Technique</option>'],
  ['>Distribution Partnership</option>', '>Partenariat de Distribution</option>'],
  ['>Regulatory Questions</option>', '>Questions Réglementaires</option>'],
  ['Message', 'Message'],
  ['Describe your needs, volumes, species, or any specific requirements...', 'Décrivez vos besoins, volumes, espèces ou toute exigence spécifique...'],
  ['>Send Message</button>', '>Envoyer le Message</button>'],
  ['Direct Contact', 'Contact Direct'],
  ['Corporate Offices', 'Bureaux Corporatifs'],

  // Feed additives page
  ['Targeted Feed Additives', 'Additifs Alimentaires Ciblés'],
  ['At VeritasVet, feed additives are not generic supplements', 'Chez VeritasVet, les additifs alimentaires ne sont pas des suppléments génériques'],
  ['they are science-driven solutions selected for your species, your challenges, and your production goals.', 'ce sont des solutions scientifiques sélectionnées pour votre espèce, vos défis et vos objectifs de production.'],
  ['Every farm faces different pressures', 'Chaque exploitation fait face à des pressions différentes'],
  ['and so every formula must answer differently.', 'et chaque formule doit répondre différemment.'],
  ['Developed with precision. Validated by science. Delivered for performance.', 'Développé avec précision. Validé par la science. Livré pour la performance.'],
  ['>All</button>', '>Tous</button>'],
  ['>Gut Health</button>', '>Santé Intestinale</button>'],
  ['>Feed Quality</button>', '>Qualité de l\'Aliment</button>'],
  ['>Mycotoxin Eliminator</button>', '>Éliminateur de Mycotoxines</button>'],
  ['>Nutrition</button>', '>Nutrition</button>'],
  ['&#8592; Back to Feed Additives', '&#8592; Retour aux Additifs Alimentaires'],
  ['View Details &#8594;', 'Voir les Détails &#8594;'],

  // Products overview
  ['Explore Our Products', 'Découvrez Nos Produits'],
  ['Browse our complete range of feed additives and premixes.', 'Parcourez notre gamme complète d\'additifs alimentaires et de prémélanges.'],

  // Premixes
  ['Custom Premixes', 'Prémélanges Personnalisés'],
  ['Species-specific premix solutions', 'Solutions de prémélanges spécifiques par espèce'],

  // News/Insights
  ['Technical Knowledge Hub', 'Centre de Connaissances Techniques'],
  ['Technical Insights', 'Perspectives Techniques'],
  ['Practical feeding knowledge, field experience and nutritional strategies to improve animal performance and production stability.', 'Connaissances pratiques en alimentation, expérience de terrain et stratégies nutritionnelles pour améliorer les performances animales et la stabilité de la production.'],
  ['Read article &rarr;', 'Lire l\'article &rarr;'],
  ['Read article →', 'Lire l\'article →'],
  ['Gut Health', 'Santé Intestinale'],
  ['Feed Quality', 'Qualité de l\'Aliment'],
  ['Mycotoxins', 'Mycotoxines'],
  ['Mycotoxin Eliminator', 'Éliminateur de Mycotoxines'],

  // Product detail pages common elements
  ['Key Benefits', 'Avantages Clés'],
  ['Target Species', 'Espèces Cibles'],
  ['Typical inclusion rate:', 'Taux d\'incorporation typique :'],
  ['Target outcomes:', 'Résultats visés :'],
  ['Inclusion:', 'Incorporation :'],
  ['As directed in product documentation', 'Selon la documentation produit'],
  ['&#128196; Request TDS', '&#128196; Demander la FT'],
  ['&#128176; Request Quote', '&#128176; Demander un Devis'],
  ['&#9993;&#65039; Contact Us', '&#9993;&#65039; Nous Contacter'],

  // Product descriptions (from the JS data array in feed-additives.html)
  ['Butyrate and calcium support designed for digestive resilience.', 'Support de butyrate et calcium conçu pour la résilience digestive.'],
  ['A gut health additive supporting feed efficiency and digestive integrity in routine feeding programs.', 'Un additif de santé intestinale soutenant l\'efficacité alimentaire et l\'intégrité digestive dans les programmes alimentaires courants.'],
  ['Supports gut integrity', 'Soutient l\'intégrité intestinale'],
  ['Helps optimize feed conversion', 'Aide à optimiser la conversion alimentaire'],
  ['Designed for stable daily use', 'Conçu pour un usage quotidien stable'],
  ['Supports resilient digestive performance', 'Soutient une performance digestive résiliente'],
  ['MOS-based support for digestive balance and pathogen management.', 'Support à base de MOS pour l\'équilibre digestif et la gestion des pathogènes.'],
  ['A science-based gut support option formulated to reinforce intestinal health and microbiome stability.', 'Une option de soutien intestinal basée sur la science formulée pour renforcer la santé intestinale et la stabilité du microbiome.'],
  ['MOS digestive support', 'Support digestif MOS'],
  ['Pathogen pressure management', 'Gestion de la pression pathogène'],
  ['Gut microbiota support', 'Support du microbiote intestinal'],
  ['Supports stable digestive health programs', 'Soutient des programmes de santé digestive stables'],
  ['Acidifier blend for pH and digestive optimization.', 'Mélange acidifiant pour l\'optimisation du pH et de la digestion.'],
  ['A liquid acidifier solution used to support feed hygiene and gut environment consistency.', 'Une solution d\'acidifiant liquide utilisée pour soutenir l\'hygiène des aliments et la cohérence de l\'environnement intestinal.'],
  ['pH support', 'Support du pH'],
  ['Feed hygiene support', 'Support de l\'hygiène alimentaire'],
  ['Digestive conditioning', 'Conditionnement digestif'],
  ['Supports digestive and feed acidification goals', 'Soutient les objectifs d\'acidification digestive et alimentaire'],
  ['Liquid acidifier for practical water and feed programs.', 'Acidifiant liquide pour les programmes pratiques d\'eau et d\'alimentation.'],
  ['Flexible acidification support intended for operational feed and drinking-water systems.', 'Support d\'acidification flexible destiné aux systèmes opérationnels d\'alimentation et d\'eau potable.'],
  ['Operational flexibility', 'Flexibilité opérationnelle'],
  ['Supports acidic gut environment', 'Soutient un environnement intestinal acide'],
  ['Compatible daily use', 'Usage quotidien compatible'],
  ['Supports daily acidification performance', 'Soutient la performance d\'acidification quotidienne'],
  ['Mycotoxin binder supporting contamination risk management.', 'Liant de mycotoxines soutenant la gestion du risque de contamination.'],
  ['A targeted mycotoxin control option designed to bind and manage toxin exposure in feed.', 'Une option de contrôle ciblé des mycotoxines conçue pour lier et gérer l\'exposition aux toxines dans l\'aliment.'],
  ['Mycotoxin binding', 'Liaison des mycotoxines'],
  ['Risk mitigation support', 'Support d\'atténuation des risques'],
  ['Supports safer feed intake', 'Soutient une consommation alimentaire plus sûre'],
  ['Supports mycotoxin management outcomes', 'Soutient les résultats de gestion des mycotoxines'],
  ['Enhanced mycotoxin eliminator for broad-spectrum feed challenges.', 'Éliminateur de mycotoxines amélioré pour les défis alimentaires à large spectre.'],
  ['Advanced toxin-binding technology built for demanding contamination conditions.', 'Technologie avancée de liaison des toxines conçue pour des conditions de contamination exigeantes.'],
  ['Broad-spectrum support', 'Support à large spectre'],
  ['Enhanced formula', 'Formule améliorée'],
  ['Operational consistency', 'Cohérence opérationnelle'],
  ['Supports robust toxin control plans', 'Soutient des plans de contrôle robustes des toxines'],
  ['Comprehensive toxin eliminator for high-risk feed scenarios.', 'Éliminateur complet de toxines pour les scénarios alimentaires à haut risque.'],
  ['Premium mycotoxin strategy with broad application for preventive and corrective feed programs.', 'Stratégie premium de mycotoxines avec une large application pour les programmes alimentaires préventifs et correctifs.'],
  ['Comprehensive support', 'Support complet'],
  ['Premium binder platform', 'Plateforme de liant premium'],
  ['Ideal for high-risk periods', 'Idéal pour les périodes à haut risque'],
  ['Supports complete toxin elimination strategies', 'Soutient les stratégies complètes d\'élimination des toxines'],
  ['Vitamin-focused additive supporting nutritional completeness.', 'Additif axé sur les vitamines soutenant la complétude nutritionnelle.'],
  ['Nutrition category solution designed to strengthen feed micronutrient delivery and consistency.', 'Solution de catégorie nutrition conçue pour renforcer la livraison et la cohérence des micronutriments dans l\'alimentation.'],
  ['Vitamin support', 'Support vitaminique'],
  ['Nutritional consistency', 'Cohérence nutritionnelle'],
  ['Supports performance programs', 'Soutient les programmes de performance'],
  ['Supports nutrition-focused feed outcomes', 'Soutient les résultats alimentaires axés sur la nutrition'],
  ['Nutritional formulation support for balanced performance.', 'Support de formulation nutritionnelle pour des performances équilibrées.'],
  ['Specialized nutrition support ingredient used in additive and premix strategies.', 'Ingrédient de soutien nutritionnel spécialisé utilisé dans les stratégies d\'additifs et de prémélanges.'],
  ['Balanced nutrition support', 'Support nutritionnel équilibré'],
  ['Program integration', 'Intégration de programme'],
  ['Performance-oriented', 'Orienté performance'],
  ['Supports optimized nutrition design', 'Soutient la conception nutritionnelle optimisée'],
  ['Feed binding solution for pellet and texture consistency.', 'Solution de liaison alimentaire pour la cohérence des granulés et de la texture.'],
  ['Feed quality solution supporting cohesive feed form and handling stability.', 'Solution de qualité alimentaire soutenant la forme cohésive de l\'aliment et la stabilité de manipulation.'],
  ['Binding consistency', 'Cohérence de liaison'],
  ['Improved handling', 'Manipulation améliorée'],
  ['Supports feed uniformity', 'Soutient l\'uniformité de l\'aliment'],
  ['Supports stable feed quality metrics', 'Soutient des métriques de qualité alimentaire stables'],
  ['Antioxidant support for preserving feed freshness.', 'Support antioxydant pour préserver la fraîcheur de l\'aliment.'],
  ['Feed quality additive used to protect feed value against oxidative deterioration.', 'Additif de qualité alimentaire utilisé pour protéger la valeur de l\'aliment contre la détérioration oxydative.'],
  ['Oxidation control', 'Contrôle de l\'oxydation'],
  ['Preserves freshness', 'Préserve la fraîcheur'],
  ['Improves shelf stability', 'Améliore la stabilité de conservation'],
  ['Supports prolonged feed quality retention', 'Soutient la rétention prolongée de la qualité alimentaire'],
  ['Phenolic antioxidant support for feed preservation programs.', 'Support antioxydant phénolique pour les programmes de préservation des aliments.'],
  ['A quality-focused antioxidant component used to sustain feed integrity over time.', 'Un composant antioxydant axé sur la qualité utilisé pour maintenir l\'intégrité de l\'aliment dans le temps.'],
  ['Phenolic antioxidant support', 'Support antioxydant phénolique'],
  ['Integrity preservation', 'Préservation de l\'intégrité'],
  ['Stable storage support', 'Support de stockage stable'],
  ['Supports antioxidant-based feed protection', 'Soutient la protection alimentaire à base d\'antioxydants'],
  ['Mold inhibitor for feed preservation and storage stability.', 'Inhibiteur de moisissures pour la préservation des aliments et la stabilité de stockage.'],
  ['A feed quality solution designed to control mold growth and maintain feed integrity during storage and handling.', 'Une solution de qualité alimentaire conçue pour contrôler la croissance des moisissures et maintenir l\'intégrité de l\'aliment pendant le stockage et la manipulation.'],
  ['Mold growth inhibition', 'Inhibition de la croissance des moisissures'],
  ['Storage stability support', 'Support de stabilité de stockage'],
  ['Feed freshness preservation', 'Préservation de la fraîcheur alimentaire'],
  ['Supports mold-free feed storage programs', 'Soutient les programmes de stockage d\'aliments sans moisissure'],

  // Certifications page
  ['Our Certifications', 'Nos Certifications'],
  ['Certified Quality', 'Qualité Certifiée'],
  ['Our manufacturing partners are certified under internationally recognized quality, safety and traceability systems.', 'Nos partenaires de fabrication sont certifiés selon des systèmes de qualité, de sécurité et de traçabilité reconnus internationalement.'],

  // Species page common
  ['Feed Additives', 'Additifs Alimentaires'],

  // Footer translations
  ['Woluwe-Saint-Lambert, Belgium', 'Woluwe-Saint-Lambert, Belgique'],
  ['aria-label="Email for newsletter"', 'aria-label="E-mail pour la newsletter"'],
  ['Brussels, Belgium', 'Bruxelles, Belgique'],
  ['Dubai, United Arab Emirates', 'Dubaï, Émirats Arabes Unis'],

  // Country names
  ['>Jordan</span>', '>Jordanie</span>'],
  ['>Saudi Arabia</span>', '>Arabie Saoudite</span>'],
  ['>UAE</span>', '>EAU</span>'],
  ['>Egypt</span>', '>Égypte</span>'],
  ['>Iraq</span>', '>Irak</span>'],
  ['>Yemen</span>', '>Yémen</span>'],
  ['>United Arab Emirates</span>', '>Émirats Arabes Unis</span>'],

  // Alt texts
  ['alt="Cattle and poultry on a professional livestock farm, representing VeritasVet science-based animal nutrition"', 'alt="Bétail et volaille dans un élevage professionnel, représentant la nutrition animale scientifique VeritasVet"'],
  ['alt="VeritasVet — science-driven animal nutrition partner"', 'alt="VeritasVet — partenaire en nutrition animale scientifique"'],
  ['alt="Dr. Mehmet Dogrul — VeritasVet Founder"', 'alt="Dr. Mehmet Dogrul — Fondateur de VeritasVet"'],
  ['alt="International shipping container — VeritasVet global supply chain"', 'alt="Conteneur d\'expédition internationale — chaîne d\'approvisionnement mondiale VeritasVet"'],
  ['alt="VeritasVet regional presence across the Middle East"', 'alt="Présence régionale de VeritasVet au Moyen-Orient"'],
  ['alt="Laboratory validation of VeritasVet feed additive solutions"', 'alt="Validation en laboratoire des solutions d\'additifs alimentaires VeritasVet"'],
  ['alt="Technical discussion with customer"', 'alt="Discussion technique avec un client"'],
  ['alt="Gut health and animal performance in modern production systems"', 'alt="Santé intestinale et performance animale dans les systèmes de production modernes"'],
  ['alt="High-quality animal feed pellets demonstrating durability and structural integrity"', 'alt="Granulés alimentaires pour animaux de haute qualité démontrant durabilité et intégrité structurelle"'],

  // Contact page placeholders
  ['placeholder="your.email@company.com"', 'placeholder="votre.email@entreprise.com"'],
  ['placeholder="+1 (555) 000-0000"', 'placeholder="+32 (0)2 123 45 67"'],
  ['placeholder="e.g. 3"', 'placeholder="ex. 3"'],
  ['placeholder="e.g. 50,000 MT/year"', 'placeholder="ex. 50 000 t/an"'],
  ['placeholder="e.g. 25"', 'placeholder="ex. 25"'],
  ['placeholder="e.g. Western Europe"', 'placeholder="ex. Europe de l\'Ouest"'],
  ['placeholder="e.g. Feed additives, premixes"', 'placeholder="ex. Additifs alimentaires, prémélanges"'],
  ['placeholder="e.g. Poultry premixes"', 'placeholder="ex. Prémélanges volaille"'],
  ['placeholder="e.g. 10,000 MT/year"', 'placeholder="ex. 10 000 t/an"'],
  ['placeholder="e.g. Poultry, Aquaculture"', 'placeholder="ex. Volaille, Aquaculture"'],
  ['placeholder="e.g. Poultry, Ruminants"', 'placeholder="ex. Volaille, Ruminants"'],
  ['placeholder="e.g. 15"', 'placeholder="ex. 15"'],

  // Products page
  ['Our Nutritional Solutions', 'Nos Solutions Nutritionnelles'],
  ['Precision-engineered feed additives and tailored premix programs', 'Des additifs alimentaires conçus avec précision et des programmes de prémélanges personnalisés'],
  ['Need Help Choosing the Right Solution?', 'Besoin d\'Aide pour Choisir la Bonne Solution ?'],
  ['Contact Our Team', 'Contacter Notre Équipe'],
  ['>Explore <span>', '>Découvrir <span>'],

  // Premixes page
  ['Tailored Premix Solutions', 'Solutions de Prémélanges Personnalisées'],
  ['premixes are not standard products', 'les prémélanges ne sont pas des produits standards'],
  ['Every operation is unique', 'Chaque exploitation est unique'],
  ['Discover More <span>', 'En Savoir Plus <span>'],

  // Feed additives JS labels
  ["'all':'All'", "'all':'Tous'"],
  ["' Products'", "' Produits'"],
  ['feed additive by VeritasVet', 'additif alimentaire par VeritasVet'],
  ['product detail by VeritasVet', 'détail produit par VeritasVet'],

  // General terms used across pages
  ['Poultry', 'Volaille'],
  ['Ruminant', 'Ruminant'],
  ['Aquaculture', 'Aquaculture'],
  ['Nutrition', 'Nutrition'],
];

// ─── Language switcher HTML ──────────────────────────────────────
function getLangSwitcher(isfrench, enPath, frPath) {
  const enUrl = enPath;
  const frUrl = frPath;
  if (isfrench) {
    return `<div class="lang-switch"><a href="${enUrl}" class="lang-btn">EN</a><span class="lang-sep">|</span><a href="${frUrl}" class="lang-btn lang-active">FR</a></div>`;
  }
  return `<div class="lang-switch"><a href="${enUrl}" class="lang-btn lang-active">EN</a><span class="lang-sep">|</span><a href="${frUrl}" class="lang-btn">FR</a></div>`;
}

// ─── Compute canonical path from relative file path ──────────────
function fileToUrlPath(relFile) {
  // feed-additives.html -> /feed-additives.html
  // index.html -> /
  // about/index.html -> /about/
  // products/butycal-ccb94/index.html -> /products/butycal-ccb94/
  let p = '/' + relFile.replace(/\\/g, '/');
  if (p.endsWith('/index.html')) {
    p = p.replace('/index.html', '/');
  }
  return p;
}

// ─── Rewrite internal links to /fr/ prefix ───────────────────────
function rewriteLinksToFr(html) {
  // Rewrite href="/..." to href="/fr/..."  (but not external URLs, anchors, mailto:, tel:, etc.)
  // Also rewrite src references to stylesheets/images that are root-relative
  // Only rewrite href attributes, not src (images/css stay at root)
  return html.replace(/href="(\/[^"]*?)"/g, function(match, url) {
    // Don't rewrite if already /fr/
    if (url.startsWith('/fr/')) return match;
    // Don't rewrite asset/image paths
    if (/\.(css|js|png|jpg|jpeg|webp|svg|gif|mp4|woff2|ico)$/i.test(url)) return match;
    // Don't rewrite images/ or assets/ paths
    if (url.startsWith('/images/') || url.startsWith('/assets/')) return match;
    // Don't rewrite mailto/tel
    if (url.startsWith('/mailto:') || url.startsWith('/tel:')) return match;
    // Rewrite to /fr/ prefix
    return `href="/fr${url}"`;
  });
}

// ─── Add hreflang tags ───────────────────────────────────────────
function getHreflangTags(enPath) {
  const frPath = '/fr' + enPath;
  const enUrl = SITE_URL + enPath;
  const frUrl = SITE_URL + frPath;
  return `<link rel="alternate" hreflang="en" href="${enUrl}">\n<link rel="alternate" hreflang="fr" href="${frUrl}">\n<link rel="alternate" hreflang="x-default" href="${enUrl}">`;
}

// ─── Apply translations ─────────────────────────────────────────
function translateContent(html) {
  let result = html;
  for (const [en, fr] of translations) {
    // Use split/join for literal replacement (no regex special chars issues)
    result = result.split(en).join(fr);
  }
  return result;
}

// ─── Language switcher CSS ───────────────────────────────────────
const langSwitcherCSS = `
<style>
.lang-switch{display:flex;align-items:center;gap:4px;margin-left:12px;font-family:'DM Sans',sans-serif;font-size:13px;font-weight:500}
.lang-btn{color:var(--text-secondary,#6b7280);text-decoration:none;padding:2px 6px;border-radius:4px;transition:color .2s,background .2s}
.lang-btn:hover{color:var(--navy,#1a2332)}
.lang-btn.lang-active{color:var(--navy,#1a2332);font-weight:700;background:rgba(26,35,50,.06)}
.lang-sep{color:var(--text-secondary,#6b7280);font-weight:300}
@media(max-width:900px){.lang-switch{margin:12px 0 0;justify-content:center}}
</style>
`;

// ─── Main processing ─────────────────────────────────────────────
function main() {
  const htmlFiles = collectHtml(ROOT, ROOT);
  console.log(`Found ${htmlFiles.length} HTML files to process.`);

  // Also filter out standalone species/product html at root that are old
  // (poultry.html, aquaculture.html, ruminant.html — keep them)

  const pages = [];
  for (const relFile of htmlFiles) {
    const enPath = fileToUrlPath(relFile);
    const frPath = '/fr' + enPath;
    pages.push({ relFile, enPath, frPath });
  }

  // ── Generate French pages ──
  let frCount = 0;
  for (const { relFile, enPath, frPath } of pages) {
    const srcPath = path.join(ROOT, relFile);
    let html = fs.readFileSync(srcPath, 'utf8');

    // 1. Change lang="en" to lang="fr"
    let frHtml = html.replace('<html lang="en">', '<html lang="fr">');

    // 2. Apply translations
    frHtml = translateContent(frHtml);

    // 3. Rewrite internal links to /fr/ prefix
    frHtml = rewriteLinksToFr(frHtml);

    // 4. Add hreflang tags in <head>
    const hreflangTags = getHreflangTags(enPath);
    frHtml = frHtml.replace('</head>', hreflangTags + '\n</head>');

    // 5. Add language switcher CSS in <head>
    frHtml = frHtml.replace('</head>', langSwitcherCSS + '</head>');

    // 6. Add language switcher in nav (after nav-social div, before hamburger)
    const langSwitch = getLangSwitcher(true, enPath, frPath);
    frHtml = frHtml.replace(
      '<div class="hamburger"',
      langSwitch + '\n<div class="hamburger"'
    );

    // 7. Write to /fr/ directory
    const destFile = relFile.replace(/\\/g, '/');
    const destPath = path.join(ROOT, 'fr', destFile);
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, frHtml, 'utf8');
    frCount++;
  }
  console.log(`Generated ${frCount} French pages in /fr/ directory.`);

  // ── Update English pages with hreflang + language switcher ──
  let enCount = 0;
  for (const { relFile, enPath, frPath } of pages) {
    const srcPath = path.join(ROOT, relFile);
    let html = fs.readFileSync(srcPath, 'utf8');

    // Skip if already has hreflang
    if (html.includes('hreflang="fr"')) continue;

    // Add hreflang tags
    const hreflangTags = getHreflangTags(enPath);
    html = html.replace('</head>', hreflangTags + '\n</head>');

    // Add language switcher CSS
    html = html.replace('</head>', langSwitcherCSS + '</head>');

    // Add language switcher in nav
    const langSwitch = getLangSwitcher(false, enPath, frPath);
    html = html.replace(
      '<div class="hamburger"',
      langSwitch + '\n<div class="hamburger"'
    );

    fs.writeFileSync(srcPath, html, 'utf8');
    enCount++;
  }
  console.log(`Updated ${enCount} English pages with hreflang tags and language switcher.`);

  // ── Generate sitemap.xml with hreflang alternates ──
  let sitemapEntries = [];
  for (const { enPath } of pages) {
    const enUrl = SITE_URL + enPath;
    const frUrl = SITE_URL + '/fr' + enPath;
    sitemapEntries.push(`  <url>
    <loc>${enUrl}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>
  </url>
  <url>
    <loc>${frUrl}</loc>
    <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
    <xhtml:link rel="alternate" hreflang="fr" href="${frUrl}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${enUrl}"/>
  </url>`);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${sitemapEntries.join('\n')}
</urlset>`;

  fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap, 'utf8');
  console.log('Generated sitemap.xml with hreflang alternates.');

  // ── Generate robots.txt ──
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots, 'utf8');
  console.log('Generated robots.txt.');

  console.log('Done!');
}

main();
