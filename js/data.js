"use strict";
/* =========================================================
   VENDEZ VOTRE CAISSE — Données du jeu (parodie, noms inventés)
   ========================================================= */

// Répliques de Franck (parodie de pub, textes originaux)
const LINES = [
  "Vous voulez vendre votre voiture ? Moi, je l'achète !",
  "C'est simple, c'est rapide, et c'est moi qui le dis !",
  "Votre caisse, je la reprends. Même si elle fume. Surtout si elle fume.",
  "Estimation gratuite en trente secondes. Vingt-neuf si je cours.",
  "On ne discute pas le prix… enfin si, un peu, mais avec le sourire.",
  "Vendez votre voiture ! … Pardon, je le redis encore une fois ?",
  "J'ai gagné des trophées. Maintenant je gagne des clients.",
  "Une voiture, c'est comme un match : il faut conclure !",
  "Vous avez une épave ? J'ai un chéquier.",
  "Je ne suis pas vendeur. Je suis un passionné… qui vend.",
  "On me voit partout ? C'est normal, je suis partout.",
  "Franck vous dit : vendez. Franck vous redit : vendez !",
  "Paiement immédiat, poignée de main ferme, sourire garanti.",
  "Votre voiture vaut plus que vous ne le croyez. Moi, je le crois.",
  "Si vous me voyez à la télé, c'est que c'est le moment de vendre.",
  "Le contrôle technique ? Je ne le contrôle pas, je le maîtrise.",
  "Tuning, néons, aileron : c'est pas du luxe, c'est de la plus-value !",
  "Je rachète tout. Même votre voisin s'il a des roues.",
  "Vous pensiez zapper ? Raté, je suis aussi sur cette chaîne.",
  "Franck ne dort jamais. Il estime."
];

/* ---------------- MARQUES (parodies) ----------------
   Chaque palier = gamme de prix. Chaque marque a 3 modèles (style de carrosserie).
   Au-delà du dernier palier, des paliers « Prototypes » sont générés à l'infini. */
const TIERS = [
  { n: "Épaves", p: 400, brands: [["Rouillon", [["Tas", "citadine"], ["Bouzin", "berline"], ["Ferraille", "van"]]], ["Tacot & Fils", [["Antique", "berline"], ["Pétaradeuse", "citadine"], ["Grincheuse", "pickup"]]]] },
  { n: "Citadines", p: 2500, brands: [["Pijo", [["206 Tuning", "citadine"], ["Partenaire", "van"], ["307 Kevin", "berline"]]], ["Renô", [["Clia", "citadine"], ["Méganne", "berline"], ["Kangourou", "van"]]], ["Citron", [["C-Pressé", "citadine"], ["Picasso Van Gogh", "van"], ["Deux Chevaux Vapeur", "citadine"]]]] },
  { n: "Familiales", p: 9000, brands: [["Volksvagon", [["Golfe", "citadine"], ["Passade", "berline"], ["Combi Hippie", "van"]]], ["Opelle", [["Astre", "berline"], ["Corsaire", "citadine"], ["Zafira-la", "van"]]], ["Fourd", [["Fiestaaa", "citadine"], ["Mondéo", "berline"], ["Ranger Pas", "pickup"]]]] },
  { n: "Premium", p: 32000, brands: [["Audy", [["A-Quatre", "berline"], ["Q-Septante", "suv"], ["TT Tip-Top", "coupe"]]], ["BMV", [["Série Trois", "berline"], ["X-Cinq", "suv"], ["M-Fusée", "coupe"]]], ["Mercédès", [["Classe Ah", "berline"], ["G-Classe Costaud", "suv"], ["SLK Classe", "coupe"]]]] },
  { n: "Sportives", p: 95000, brands: [["Porshe", [["911 Neuf-Onze", "coupe"], ["Kayenne", "suv"], ["Boxeur", "coupe"]]], ["Alpin", [["A-Cent-Dix", "coupe"], ["Berlinette Bleue", "coupe"], ["Sommet", "supercar"]]], ["Lotuss", [["Élysée", "coupe"], ["Exiger", "supercar"], ["Évora-tion", "coupe"]]]] },
  { n: "Luxe", p: 260000, brands: [["Bentlé", [["Continentale", "coupe"], ["Bentaïga", "suv"], ["Mulsanne-Sanne", "limo"]]], ["Rolls-Roy", [["Fantôme", "limo"], ["Spectre Doux", "coupe"], ["Culinaire", "suv"]]], ["Maseratti", [["Quattro-Porte", "berline"], ["Levante-toi", "suv"], ["MC Vingt", "supercar"]]]] },
  { n: "Supercars", p: 950000, brands: [["Ferrarri", [["Testarossa Rouge", "supercar"], ["F-Quarante", "supercar"], ["Roma-ntique", "coupe"]]], ["Lamborguigni", [["Avantador", "supercar"], ["Urus-sur", "suv"], ["Huracan-ard", "supercar"]]], ["McLarène", [["Sennna", "supercar"], ["P-Un", "supercar"], ["Artura-la", "supercar"]]]] },
  { n: "Hypercars", p: 4.2e6, brands: [["Bugattix", [["Chironne", "supercar"], ["Veyronne", "supercar"], ["Divo-rce", "supercar"]]], ["Koenigzeg", [["Jesko-mme", "supercar"], ["Regera-tion", "supercar"], ["Agera-ffe", "supercar"]]], ["Pagagni", [["Zonda-ge", "supercar"], ["Huayra-ah", "supercar"], ["Utopia-nte", "supercar"]]]] },
  { n: "Légendes", p: 2.2e7, brands: [["Chauvemobile", [["Crâne Lisse", "supercar"], ["Reflet Total", "supercar"], ["Batcrâne", "supercar"]]], ["DéLoréanne", [["Retour vers le Garage", "coupe"], ["88 Miles", "coupe"], ["Flux Capacitor", "coupe"]]], ["Kitt-Cat", [["Pilote Automatique", "coupe"], ["Scanner Rouge", "coupe"], ["Turbo Boost", "coupe"]]]] },
  { n: "Volantes", p: 1.6e8, brands: [["Volantix", [["Cumulus", "hover"], ["Nimbus", "hover"], ["Stratus", "hover"]]], ["Jetsonne", [["Bulle", "hover"], ["Taxi Céleste", "hover"], ["Familiale des Nuages", "hover"]]], ["AéroBœuf", [["Ballon d'Or", "hover"], ["Coup Franc", "hover"], ["Lucarne", "hover"]]]] },
  { n: "Spatiales", p: 1.5e9, brands: [["SpaceY", [["Faucon Lourd", "hover"], ["Étoile-Navette", "hover"], ["Dragonnet", "hover"]]], ["Orbite Bleue", [["Nouveau Shepard", "hover"], ["Glenn-tleman", "hover"], ["Lune Bleue", "hover"]]], ["Fusée Franck", [["Décollage Immédiat", "hover"], ["Estimation Orbitale", "hover"], ["Rachat Lunaire", "hover"]]]] },
  { n: "Cosmiques", p: 2.2e10, brands: [["Soucoupia", [["Petit Gris", "ufo"], ["Rayon Tracteur", "ufo"], ["Zone Cinquante", "ufo"]]], ["Nébulor", [["Pulsar", "ufo"], ["Quasar", "ufo"], ["Trou Noir", "ufo"]]], ["Galactik Motors", [["Voie Lactée", "ufo"], ["Andromède", "ufo"], ["Big Bang", "ufo"]]]] },
  { n: "Multivers", p: 3.5e11, brands: [["Paradoxe", [["Boucle Temporelle", "ufo"], ["Univers Parallèle", "hover"], ["Hier-Demain", "supercar"]]], ["Infinitude", [["Omega", "ufo"], ["Alpha", "hover"], ["Éternité", "limo"]]], ["Franck Prime", [["Le Bœuf Cosmique", "ufo"], ["Chauve Absolu", "supercar"], ["Sourire Éternel", "limo"]]]] }
];
const PROTO_STYLES = ["supercar", "hover", "ufo", "limo", "coupe"];
const PROTO_NAMES = ["Prototype", "Concept", "Chimère", "Singularité", "Hyperion", "Titan", "Odyssée", "Zénith", "Apex", "Nova"];
// Palier t (illimité)
function tierInfo(t) {
  if (t < TIERS.length) return TIERS[t];
  const k = t - TIERS.length + 1;
  const base = TIERS[TIERS.length - 1].p * Math.pow(16, k);
  const nm = PROTO_NAMES[(k - 1) % PROTO_NAMES.length] + " " + "Ω".repeat(1 + Math.floor((k - 1) / PROTO_NAMES.length)) + k;
  return { n: nm, p: base, proto: true, brands: [[nm, [["Mk-I", PROTO_STYLES[k % 5]], ["Mk-II", PROTO_STYLES[(k + 1) % 5]], ["Mk-III", PROTO_STYLES[(k + 2) % 5]]]]] };
}
// Coût du contrat de concession pour débloquer le palier t
const tierUnlockCost = (t) => (t === 0 ? 0 : Math.round(tierInfo(t).p * 500 * Math.pow(1.9, t)));

/* ---------------- GARAGES / LIEUX ----------------
   cap : places de parking ; mult : bonus de prix de vente ; tier : palier max des voitures acceptées */
const GARAGES = [
  { n: "Parking de la cité", cost: 0, cap: 3, mult: 1, icon: "🅿️" },
  { n: "Garage de Tonton", cost: 6000, cap: 5, mult: 1.1, icon: "🔧" },
  { n: "Casse de Marcel", cost: 80000, cap: 8, mult: 1.2, icon: "🧲" },
  { n: "Concession de zone commerciale", cost: 1000000, cap: 12, mult: 1.35, icon: "🏬" },
  { n: "Showroom du centre-ville", cost: 14000000, cap: 16, mult: 1.5, icon: "🏙️" },
  { n: "Hall d'exposition géant", cost: 200000000, cap: 20, mult: 1.7, icon: "🏟️" },
  { n: "Concession sur les Champs", cost: 3200000000, cap: 25, mult: 2, icon: "🗼" },
  { n: "Port de Monaco", cost: 56000000000, cap: 30, mult: 2.4, icon: "⛵" },
  { n: "Tour à Dubaï", cost: 1000000000000, cap: 36, mult: 2.9, icon: "🌇" },
  { n: "Île privée", cost: 20000000000000, cap: 42, mult: 3.5, icon: "🏝️" },
  { n: "Station orbitale", cost: 400000000000000, cap: 50, mult: 4.3, icon: "🛰️" },
  { n: "Base lunaire", cost: 8800000000000000, cap: 60, mult: 5.3, icon: "🌙" },
  { n: "Colonie martienne", cost: 200000000000000000, cap: 70, mult: 6.6, icon: "🔴" },
  { n: "Nexus du multivers", cost: 4800000000000000000, cap: 85, mult: 8.2, icon: "🌀" }
];
function garageInfo(i) {
  if (i < GARAGES.length) return GARAGES[i];
  const k = i - GARAGES.length + 1, L = GARAGES[GARAGES.length - 1];
  return { n: "Dimension " + k, cost: L.cost * Math.pow(30, k), cap: L.cap + 15 * k, mult: L.mult * Math.pow(1.25, k), icon: "✴️" };
}

/* ---------------- PUBLICITÉ (génère des clients / s) ---------------- */
const ADS = [
  { id: "flyer", n: "Flyers sur les pare-brise", lps: 0.2, cost: 15, icon: "📄" },
  { id: "journal", n: "Petite annonce", lps: 0.6, cost: 120, icon: "📰" },
  { id: "radio", n: "Spot radio", lps: 1.5, cost: 1300, icon: "📻" },
  { id: "affiche", n: "Affiche 4x3 avec ta tête", lps: 4, cost: 14000, icon: "🪧" },
  { id: "tv", n: "Pub télé en boucle", lps: 10, cost: 160000, icon: "📺" },
  { id: "foot", n: "Sponsor de club de foot", lps: 25, cost: 1.9e6, icon: "⚽" },
  { id: "web", n: "Bannière qui clignote", lps: 60, cost: 2.4e7, icon: "🖥️" },
  { id: "meme", n: "Mème viral", lps: 150, cost: 3.2e8, icon: "😂" },
  { id: "holo", n: "Hologramme géant", lps: 380, cost: 4.5e9, icon: "🌐" },
  { id: "lune", n: "Pub gravée sur la Lune", lps: 950, cost: 7e10, icon: "🌕" },
  { id: "reve", n: "Pub dans les rêves", lps: 2400, cost: 1.1e12, icon: "💤" },
  { id: "multi", n: "Pub dans tous les univers", lps: 6000, cost: 2e13, icon: "🌌" }
];
const AD_GROWTH = 1.15;
const MILESTONES = [10, 25, 50, 100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900, 1000];

/* ---------------- LE PRÉ DE FRANCK ----------------
   Gag du tout début : avant les voitures, Franck achète… des animaux.
   Chacun rapporte un peu (€/s) et attire des curieux (+% de clients).
   Le bœuf se débloque quand on a un animal de chaque. */
const ANIMALS = [
  { id: "vache", n: "Vache", icon: "🐄", line: "C'EST UNE VACHE !", cost: 40, growth: 1.45, prod: 0.5, lead: 0.02, what: "lait", names: ["Marguerite", "Noiraude", "Blanchette", "Paquerette", "Roussette", "Bernadette", "Meuh-Meuh", "Ginette"] },
  { id: "ane", n: "Âne", icon: "🫏", line: "C'EST UN ÂNE !", cost: 110, growth: 1.45, prod: 1.4, lead: 0.02, what: "balades à dos d'âne", names: ["Cadichon", "Hi-Han", "Pompon", "Grisou", "Bourriquet", "Têtu"] },
  { id: "zebre", n: "Zèbre", icon: "🦓", line: "C'EST UN ZÈBRE !", cost: 280, growth: 1.45, prod: 3.6, lead: 0.03, what: "selfies payants", names: ["Code-Barre", "Pyjama", "Rayures", "Passage Piéton", "Marty"] },
  { id: "cheval", n: "Cheval", icon: "🐎", line: "C'EST UN CHEVAL !", cost: 650, growth: 1.45, prod: 9, lead: 0.03, what: "chevaux-vapeur", names: ["Tornado", "Jolly", "Crin-Crin", "Turbo", "Galopin", "Pur-Sang"] },
  { id: "boeuf", n: "Bœuf", icon: "🐂", line: "C'EST UN BŒUF ! … ATTENDS, C'EST MOI ?", cost: 5000, growth: 1.6, prod: 40, lead: 0.05, what: "charisme", names: ["Le Bœuf", "Monsieur Bœuf", "Bœuf Bourguignon", "Bœuf Royal"], req: true }
];

/* ---------------- ÉQUIPE ---------------- */
const STAFF = [
  { id: "meca", n: "Mécanicien", d: "Répare et customise les voitures", base: 1, cost: 60, growth: 1.13, icon: "🧑‍🔧", stat: "work" },
  { id: "vendeur", n: "Vendeur en costume", d: "Vend les voitures prêtes", base: 1, cost: 80, growth: 1.13, icon: "🕴️", stat: "sell" },
  { id: "nego", n: "Négociateur", d: "Rachète moins cher (jusqu'à -45 %)", base: 1, cost: 400, growth: 1.22, icon: "🤝", stat: "nego" },
  { id: "camera", n: "Caméraman", d: "Chaque pub tournée attire plus de clients", base: 1, cost: 250, growth: 1.2, icon: "🎥", stat: "click" },
  { id: "expert", n: "Expert automobile", d: "Repère les vices cachés avant le rachat (-2 % de risque chacun)", base: 1, cost: 2500, growth: 1.35, icon: "🔍", stat: "expert" },
  { id: "stagiaire", n: "Stagiaire", d: "Tourne des pubs tout seul (1 par 2 s)", base: 1, cost: 1000, growth: 1.25, icon: "🧃", stat: "auto" }
];

/* ---------------- CUSTOMISATION ----------------
   Chaque catégorie a des niveaux : coût en pièces (% du prix de base),
   bonus de valeur (% du prix), travail en plus (× du travail de base). */
const CUSTOM = [
  { id: "paint", n: "Peinture", icon: "🎨", opts: ["Origine", "Métallisée", "Nacrée", "Caméléon", "Or 24 carats", "Chrome miroir", "Poussière d'étoile"] },
  { id: "wheel", n: "Jantes", icon: "🛞", opts: ["Enjoliveurs", "Alu 5 branches", "Nid d'abeille", "Tri-branches", "Étoile", "Rayons dorés"] },
  { id: "kit", n: "Kit carrosserie", icon: "🧱", opts: ["Aucun", "Bas de caisse", "Kit large", "Kit course"] },
  { id: "spoiler", n: "Aileron", icon: "🪽", opts: ["Aucun", "Becquet", "Aileron GT", "Aileron de fusée"] },
  { id: "sticker", n: "Stickers", icon: "🔥", opts: ["Aucun", "Bandes racing", "Flammes", "Numéro de course", "Diagonale"] },
  { id: "neon", n: "Néons", icon: "💡", opts: ["Aucun", "Bleu", "Rose", "Vert", "Arc-en-ciel"] },
  { id: "tint", n: "Vitres teintées", icon: "🕶️", opts: ["Claires", "Teintées"] },
  { id: "engine", n: "Moteur gonflé", icon: "⚙️", opts: ["Origine", "Reprog", "Turbo", "Bi-turbo", "Réacteur", "Moteur à l'enthousiasme"] },
  { id: "interior", n: "Intérieur", icon: "💺", opts: ["Tissu", "Simili", "Cuir", "Cuir matelassé", "Alcantara doré"] },
  { id: "sono", n: "Sono", icon: "🔊", opts: ["Autoradio", "Caisson", "Mur de son", "Concert ambulant"] }
];
// bonus de valeur et coût par niveau (cumulés)
const customValue = (lvl) => lvl * 0.14 + lvl * lvl * 0.03; // fraction du prix
const customCost = (lvl) => lvl * 0.06 + lvl * lvl * 0.012;
const customWork = (lvl) => lvl * 0.35;
// Déblocage d'un niveau de customisation (catalogue)
const catalogCost = (ci, lvl) => Math.round(500 * Math.pow(12, lvl) * (1 + ci * 0.35));
const NEON_COLORS = [null, "#00e5ff", "#ff4fd8", "#3dff7a", "#ffe14d"];
const PAINTS = ["#c0392b", "#2980b9", "#27ae60", "#f1c40f", "#8e44ad", "#e67e22", "#ecf0f1", "#2c3e50", "#16a085", "#e91e63", "#111111", "#7f8c8d"];
const PAINT_FX = [null, "#d0d6dc", "#fff4fb", "#3ef0c9", "#ffcf3a", "#e8f4ff", "#c9a6ff"];

/* ---------------- AMÉLIORATIONS (achats uniques) ---------------- */
// t : type d'effet ; v : valeur ; req : condition simple
const UPGRADES = [
  { id: "auto", n: "Standard téléphonique", d: "Les rachats se font tout seuls (plus besoin de cliquer « Racheter »)", cost: 1200, t: "auto", v: 1 },
  { id: "u1", n: "Sourire Ultra-Bright", d: "Tourner une pub rapporte ×2 clients", cost: 300, t: "click", v: 2 },
  { id: "u2", n: "Clé à molette en or", d: "Mécaniciens ×2", cost: 2500, t: "work", v: 2 },
  { id: "u3", n: "Costume trois pièces", d: "Vendeurs ×2", cost: 4000, t: "sell", v: 2 },
  { id: "u4", n: "Chéquier pré-signé", d: "Rachat 10 % moins cher", cost: 9000, t: "buy", v: 0.9 },
  { id: "u5", n: "Convoi ×2", d: "Chaque achat ramène 2 voitures du même modèle", cost: 25000, t: "convoy", v: 2 },
  { id: "u6", n: "Slogan qui reste en tête", d: "Pubs ×2", cost: 60000, t: "ads", v: 2 },
  { id: "u7", n: "Lustrage à la main", d: "Prix de vente +25 %", cost: 150000, t: "price", v: 1.25 },
  { id: "u8", n: "Pont élévateur", d: "Mécaniciens ×2", cost: 4e5, t: "work", v: 2 },
  { id: "u9", n: "Poignée de main légendaire", d: "Vendeurs ×2", cost: 9e5, t: "sell", v: 2 },
  { id: "u10", n: "Convoi ×3", d: "Convoi ×3", cost: 3e6, t: "convoy", v: 3 },
  { id: "u11", n: "Clin d'œil caméra", d: "Tourner une pub ×3", cost: 8e6, t: "click", v: 3 },
  { id: "u12", n: "Pubs en prime time", d: "Pubs ×3", cost: 2.5e7, t: "ads", v: 3 },
  { id: "u13", n: "Certificat « Garanti Franck »", d: "Prix de vente +50 %", cost: 8e7, t: "price", v: 1.5 },
  { id: "u14", n: "Robots d'atelier", d: "Mécaniciens ×3", cost: 3e8, t: "work", v: 3 },
  { id: "u15", n: "Hologramme vendeur", d: "Vendeurs ×3", cost: 9e8, t: "sell", v: 3 },
  { id: "u16", n: "Convoi ×5", d: "Convoi ×5", cost: 4e9, t: "convoy", v: 5 },
  { id: "u17", n: "Chauve qui brille", d: "Pubs ×5", cost: 2e10, t: "ads", v: 5 },
  { id: "u18", n: "Estimation au radar", d: "Rachat 15 % moins cher", cost: 6e10, t: "buy", v: 0.85 },
  { id: "u19", n: "Garantie à vie (et après)", d: "Prix de vente ×2", cost: 3e11, t: "price", v: 2 },
  { id: "u20", n: "Atelier quantique", d: "Mécaniciens ×5", cost: 1.5e12, t: "work", v: 5 },
  { id: "u21", n: "Vendeurs télépathes", d: "Vendeurs ×5", cost: 6e12, t: "sell", v: 5 },
  { id: "u22", n: "Convoi ×10", d: "Convoi ×10", cost: 4e13, t: "convoy", v: 10 },
  { id: "u23", n: "Franck en 4D", d: "Pubs ×10", cost: 3e14, t: "ads", v: 10 },
  { id: "u24", n: "Valeur sentimentale infinie", d: "Prix de vente ×3", cost: 2e15, t: "price", v: 3 }
];
// Améliorations répétables générées à l'infini après la liste
function genUpgrade(i) {
  const types = [["work", "Mécaniciens"], ["sell", "Vendeurs"], ["ads", "Pubs"], ["price", "Prix de vente"], ["convoy", "Convoi"]];
  const [t, lab] = types[i % types.length];
  const v = t === "price" ? 1.5 : t === "convoy" ? 2 : 3;
  return { id: "g" + i, n: lab + " — niveau " + (i + 1), d: lab + " ×" + v, cost: 2e15 * Math.pow(9, i + 1), t, v, gen: true };
}

/* ---------------- NOTORIÉTÉ (prestige) ----------------
   Nouvelle saison de pubs : on recommence avec des étoiles ⭐ (+3 % chacune)
   et des talents permanents. */
const TALENTS = [
  { id: "t_start", n: "Carnet d'adresses", d: "Commence chaque saison avec 5 000 €", cost: 1, max: 1 },
  { id: "t_click", n: "Charisme télévisuel", d: "Tourner une pub ×2 par niveau", cost: 2, max: 10 },
  { id: "t_lot", n: "Parking bien rangé", d: "+2 places par niveau", cost: 3, max: 10 },
  { id: "t_nego", n: "Regard qui négocie", d: "Rachat -3 % par niveau", cost: 3, max: 5 },
  { id: "t_offline", n: "Franck ne dort jamais", d: "Gains hors ligne +25 % par niveau (max 100 %)", cost: 4, max: 4 },
  { id: "t_auto", n: "Personnalisation automatique", d: "Le pack auto ne coûte plus de pièces sur la première catégorie par niveau", cost: 5, max: 5 },
  { id: "t_keep", n: "Contrats en béton", d: "Garde les paliers de marques débloqués", cost: 8, max: 1 },
  { id: "t_garage", n: "Bail commercial", d: "Garde un garage de plus par niveau", cost: 6, max: 5 },
  { id: "t_event", n: "Buzz permanent", d: "Évènements 50 % plus fréquents", cost: 6, max: 1 },
  { id: "t_star", n: "Superstar", d: "Chaque étoile donne +1 % de plus par niveau", cost: 10, max: 10 },
  { id: "t_commission", n: "Clients VIP", d: "Commandes spéciales ×2 récompense par niveau", cost: 7, max: 5 },
  { id: "t_convoy", n: "Flotte de camions", d: "Convoi ×2 par niveau", cost: 12, max: 10 }
];
const starsFor = (earned) => Math.floor(Math.pow(Math.max(0, earned) / 1e9, 0.33));

/* ---------------- TENDANCES DU MARCHÉ ----------------
   Toutes les 5 min, deux styles de carrosserie sont à la mode, un est boudé. */
const STYLE_NAMES = { citadine: "Citadines", berline: "Berlines", suv: "SUV", pickup: "Pick-up", van: "Vans", coupe: "Coupés", supercar: "Supercars", limo: "Limousines", hover: "Volantes", ufo: "Soucoupes" };
const MARKET_MS = 5 * 60 * 1000;

/* ---------------- COUPS DE FRANCK (compétences actives) ---------------- */
const SKILLS = [
  { id: "spot", n: "Spot choc", icon: "📺", d: "Clients ×10 pendant 20 s", cd: 120, fx: { leads: 10 }, dur: 20, unlock: () => true, req: "Disponible" },
  { id: "cle", n: "Coup de clé à molette", icon: "🔧", d: "Atelier ×8 pendant 15 s", cd: 100, fx: { work: 8 }, dur: 15, unlock: (S) => S.garage >= 1, req: "Garage de Tonton" },
  { id: "liquid", n: "Grande liquidation", icon: "🏷️", d: "Vend toute la vitrine à l'instant (90 % du prix)", cd: 180, unlock: (S) => S.tierMax >= 1, req: "Gamme Citadines" },
  { id: "main", n: "Poignée de main", icon: "🤝", d: "Rachats -40 % pendant 30 s", cd: 240, fx: { buy: 0.6 }, dur: 30, unlock: (S) => S.tierMax >= 2, req: "Gamme Familiales" },
  { id: "direct", n: "Franck en direct", icon: "🎤", d: "Prix de vente ×3 pendant 20 s", cd: 600, fx: { price: 3 }, dur: 20, unlock: (S) => S.stats.seasons >= 1 || S.tierMax >= 4, req: "Gamme Sportives ou 1 saison" }
];

/* ---------------- ENCHÈRES ---------------- */
const RIVALS = ["Dédé la Casse", "Mme Loiseau (collectionneuse)", "Le Baron du Diesel", "Kevin Tuning", "Un émir discret", "Garage Concurrent SARL", "Le cousin de Marcel", "Un robot enchérisseur"];
const AUCTION_EVERY = [6 * 60, 10 * 60];
const AUCTION_LEN = 45;

/* ---------------- DÉFIS DE FRANCK ---------------- */
const CHALLENGES = [
  { id: "sell", n: "Vendre {n} voitures", stat: "sold", base: 15 },
  { id: "earn", n: "Gagner {m}", stat: "earned", money: true },
  { id: "clicks", n: "Tourner {n} pubs", stat: "clicks", base: 60 },
  { id: "custom", n: "Customiser {n} voitures à l'atelier perso", stat: "customs", base: 2 },
  { id: "buy", n: "Racheter {n} voitures", stat: "bought", base: 15 },
  { id: "animals", n: "Acheter {n} animaux", stat: "animals", base: 2 },
  { id: "nego", n: "Réussir {n} négociations", stat: "negos", base: 3 },
  { id: "skills", n: "Utiliser {n} coups de Franck", stat: "skills", base: 3 }
];

/* ---------------- FRANCHISES ----------------
   Débloquées après la première saison. Achetées en euros, elles restent
   d'une saison à l'autre : chaque niveau donne +10 % de revenus et de clients. */
const FRANCHISES = [
  { id: "lyon", n: "Franck Lyon", icon: "🦁", base: 5e7 },
  { id: "marseille", n: "Franck Marseille", icon: "⚓", base: 4e8 },
  { id: "bordeaux", n: "Franck Bordeaux", icon: "🍷", base: 3e9 },
  { id: "lille", n: "Franck Lille", icon: "🧇", base: 2.5e10 },
  { id: "bruxelles", n: "Franck Bruxelles", icon: "🍟", base: 2e11 },
  { id: "geneve", n: "Franck Genève", icon: "⌚", base: 1.8e12 },
  { id: "londres", n: "Franck London", icon: "☂️", base: 1.6e13 },
  { id: "newyork", n: "Franck New York", icon: "🗽", base: 1.5e14 },
  { id: "tokyo", n: "Franck Tokyo", icon: "🗼", base: 1.4e15 },
  { id: "lune", n: "Franck Lune", icon: "🌙", base: 1.3e16 },
  { id: "mars", n: "Franck Mars", icon: "🔴", base: 1.2e17 },
  { id: "andromede", n: "Franck Andromède", icon: "🌌", base: 1.1e18 }
];
const FRANCHISE_GROWTH = 3.2, FRANCHISE_BONUS = 0.1;

/* ---------------- ÉVÈNEMENTS ---------------- */
const EVENTS = [
  { id: "buzz", n: "Buzz sur les réseaux !", d: "Clients ×7 pendant 30 s", dur: 30, fx: { leads: 7 } },
  { id: "rush", n: "Rush du samedi", d: "Ventes ×5 pendant 30 s", dur: 30, fx: { sell: 5 } },
  { id: "huile", n: "Huile de coude", d: "Atelier ×5 pendant 30 s", dur: 30, fx: { work: 5 } },
  { id: "cash", n: "Client millionnaire", d: "Gain immédiat : 3 min de revenus", dur: 0, fx: { cash: 180 } },
  { id: "promo", n: "Fin de série", d: "Rachats -50 % pendant 20 s", dur: 20, fx: { buy: 0.5 } }
];

/* ---------------- COMMANDES SPÉCIALES ----------------
   Un client veut une voiture précise : palier, couleur, options. */
const CLIENT_NAMES = ["Kevin", "Jessica", "Monsieur Dupont", "Tata Josiane", "Un influenceur", "Un footballeur", "Le maire", "Un cheikh pressé", "Un rappeur", "Mamie Ginette", "Un collectionneur", "Un extraterrestre poli", "Un voyageur du temps"];

/* ---------------- SUCCÈS (générés) ---------------- */
const ACHIEVEMENTS = [];
const BIG_NAMES = { 1e3: "1 000 €", 1e4: "10 000 €", 1e5: "100 000 €", 1e6: "1 million €", 1e7: "10 millions €", 1e8: "100 millions €", 1e9: "1 milliard €", 1e10: "10 milliards €", 1e12: "1 billion €", 1e15: "1 billiard €", 1e18: "1 trillion €", 1e21: "1 trilliard €", 1e24: "1 quadrillion €", 1e30: "1 quintillion €" };
[1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10, 1e12, 1e15, 1e18, 1e21, 1e24, 1e30].forEach((v, i) => ACHIEVEMENTS.push({ id: "earn" + i, n: "Chiffre d'affaires : " + BIG_NAMES[v], t: "earned", v }));
[1, 10, 100, 1000, 1e4, 1e5, 1e6, 1e8, 1e10].forEach((v, i) => ACHIEVEMENTS.push({ id: "sold" + i, n: v + " voiture(s) vendue(s)", t: "sold", v }));
[10, 100, 1000, 1e4, 1e5, 1e6].forEach((v, i) => ACHIEVEMENTS.push({ id: "click" + i, n: v + " pubs tournées", t: "clicks", v }));
for (let i = 1; i < 16; i++) ACHIEVEMENTS.push({ id: "tier" + i, n: "Palier débloqué : " + tierInfo(i).n, t: "tier", v: i });
for (let i = 1; i < 14; i++) ACHIEVEMENTS.push({ id: "gar" + i, n: "Nouveau lieu : " + GARAGES[i].n, t: "garage", v: i });
[1, 5, 25, 100, 500].forEach((v, i) => ACHIEVEMENTS.push({ id: "com" + i, n: v + " commande(s) spéciale(s) livrée(s)", t: "commissions", v }));
[1, 5, 10, 25, 50, 100].forEach((v, i) => ACHIEVEMENTS.push({ id: "pres" + i, n: v + " saison(s) de pub", t: "seasons", v }));
[1, 10, 100, 1000].forEach((v, i) => ACHIEVEMENTS.push({ id: "star" + i, n: v + " étoile(s) de notoriété", t: "starsTotal", v }));
[1, 5, 15, 40, 80].forEach((v, i) => ACHIEVEMENTS.push({ id: "fr" + i, n: v + " niveau(x) de franchise", t: "franchise", v }));
[10, 30, 60, 100].forEach((v, i) => ACHIEVEMENTS.push({ id: "codex" + i, n: v + " modèles en collection", t: "codex", v }));
[1, 5, 10].forEach((v, i) => ACHIEVEMENTS.push({ id: "museum" + i, n: v + " voiture(s) au musée", t: "museum", v }));
[1, 4, 10, 20].forEach((v, i) => ACHIEVEMENTS.push({ id: "animal" + i, n: v + " animaux dans le pré (c'est une vache)", t: "animals", v }));
[1, 10, 50].forEach((v, i) => ACHIEVEMENTS.push({ id: "auction" + i, n: v + " enchère(s) remportée(s)", t: "auctions", v }));
[5, 25, 100].forEach((v, i) => ACHIEVEMENTS.push({ id: "chal" + i, n: v + " défis de Franck réussis", t: "chals", v }));
[5, 20, 40, 60].forEach((v, i) => ACHIEVEMENTS.push({ id: "cust" + i, n: v + " niveaux de catalogue", t: "catalog", v }));
ACHIEVEMENTS.push({ id: "frank", n: "« Vendez votre voiture ! » ×1000", t: "clicks", v: 1000 });
const ACH_BONUS = 0.02; // +2 % de revenus par succès

if (typeof module !== "undefined") module.exports = {};
