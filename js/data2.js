"use strict";
/* =========================================================
   VENDEZ VOTRE CAISSE — Données V2 : carrière, coffres, accessoires,
   styles signature, visiteurs farfelus
   ========================================================= */

/* ---------------- CARRIÈRE DE FRANCK (missions) ----------------
   Missions dans l'ordre, chacune racontée comme un épisode de pub.
   c(S, G) : condition ; r : coffre gagné ; m : bonus d'argent (minutes de revenu) */
const MISSIONS = [
  { n: "Moteur… action !", d: "Tourne 10 pubs.", c: (S) => S.clicks >= 10, r: "boite" },
  { n: "Premier client", d: "Rachète ta première voiture.", c: (S) => S.stats.bought >= 1, r: "boite" },
  { n: "Ça roule", d: "Vends 5 voitures.", c: (S) => S.stats.sold >= 5, r: "boite" },
  { n: "C'est une vache", d: "Achète une vache. Pourquoi ? Pourquoi pas.", c: (S) => (S.animals.vache || 0) >= 1, r: "boite" },
  { n: "L'équipe se monte", d: "Embauche un mécanicien et un vendeur.", c: (S) => (S.staff.meca || 0) >= 1 && (S.staff.vendeur || 0) >= 1, r: "boite" },
  { n: "Le sens des affaires", d: "Réussis une négociation.", c: (S) => S.stats.negos >= 1, r: "boite" },
  { n: "Allô Franck ?", d: "Installe le Standard téléphonique.", c: (S) => !!S.ups.auto, r: "coffre" },
  { n: "Chez Tonton", d: "Déménage au Garage de Tonton.", c: (S) => S.garage >= 1, r: "boite" },
  { n: "Ma première œuvre", d: "Customise une voiture dans l'Atelier perso.", c: (S) => S.stats.customs >= 1, r: "boite" },
  { n: "Petites citadines", d: "Débloque la gamme Citadines.", c: (S) => S.tierMax >= 1, r: "coffre" },
  { n: "Style signature", d: "Vends une voiture avec un style signature (voir l'Atelier).", c: (S) => S.stats.combos >= 1, r: "coffre" },
  { n: "Accessoirisé", d: "Pose un accessoire sur une voiture.", c: (S) => S.stats.accs >= 1, r: "boite" },
  { n: "Client exigeant", d: "Livre une commande spéciale.", c: (S) => S.stats.commissions >= 1, r: "coffre" },
  { n: "Adjugé, vendu !", d: "Remporte une enchère.", c: (S) => S.stats.auctions >= 1, r: "coffre" },
  { n: "Le pied !", d: "Fais 10 jongles face au footballeur.", c: (S) => (S.stats.bestJuggle || 0) >= 10, r: "coffre" },
  { n: "Ménagerie", d: "Possède un animal de chaque espèce (le bœuf apparaît).", c: (S) => ["vache", "ane", "zebre", "cheval"].every((k) => (S.animals[k] || 0) > 0), r: "coffre" },
  { n: "Conservateur", d: "Expose une voiture au musée.", c: (S) => S.museum.length >= 1, r: "coffre" },
  { n: "Le million", d: "Gagne 1 million d'euros au total.", c: (S) => S.earnedTotal >= 1e6, r: "coffre" },
  { n: "Papa poule", d: "Débloque la gamme Familiales.", c: (S) => S.tierMax >= 2, r: "coffre" },
  { n: "Collectionneur", d: "Possède 15 modèles dans la collection.", c: (S) => Object.keys(S.codex).length >= 15, r: "coffre" },
  { n: "Grande surface", d: "Déménage dans la concession de zone commerciale.", c: (S) => S.garage >= 3, r: "valise" },
  { n: "Monsieur Premium", d: "Débloque la gamme Premium.", c: (S) => S.tierMax >= 3, r: "coffre" },
  { n: "Styliste", d: "Vends 10 voitures avec un style signature.", c: (S) => S.stats.combos >= 10, r: "valise" },
  { n: "Le milliard", d: "Gagne 1 milliard d'euros au total.", c: (S) => S.earnedTotal >= 1e9, r: "valise" },
  { n: "Nouvelle saison", d: "Lance une nouvelle saison de pubs (onglet Notoriété).", c: (S) => S.stats.seasons >= 1, r: "valise" },
  { n: "Franck à Lyon", d: "Ouvre ta première franchise.", c: (S) => Object.values(S.franchise || {}).some((v) => v > 0), r: "valise" },
  { n: "Pied au plancher", d: "Débloque la gamme Sportives.", c: (S) => S.tierMax >= 4, r: "valise" },
  { n: "Tireur d'élite", d: "Marque 4 tirs au but sur 5 face au gardien.", c: (S) => (S.stats.bestPenalty || 0) >= 4, r: "valise" },
  { n: "Jongleur pro", d: "Fais 25 jongles.", c: (S) => (S.stats.bestJuggle || 0) >= 25, r: "valise" },
  { n: "Grand luxe", d: "Débloque la gamme Luxe.", c: (S) => S.tierMax >= 5, r: "valise" }
];
// Au-delà : missions générées à l'infini
function missionInfo(i) {
  if (i < MISSIONS.length) return MISSIONS[i];
  const k = i - MISSIONS.length;
  if (k % 2 === 0) { const t = 6 + k / 2; return { n: "Conquête : " + tierInfo(t).n, d: "Débloque la gamme " + tierInfo(t).n + ".", c: (S) => S.tierMax >= t, r: "valise" }; }
  const v = Math.pow(10, 12 + (k - 1) / 2 * 3);
  return { n: "Empire " + ((k + 1) / 2), d: "Gagne " + v.toExponential(0).replace("e+", "e") + " € au total.", c: (S) => S.earnedTotal >= v, r: "valise" };
}

/* ---------------- COFFRES ---------------- */
const CHESTS = {
  boite: { n: "Boîte à gants", icon: "🧤", c: "#9aa5b1" },
  coffre: { n: "Coffre de berline", icon: "🧳", c: "#2f80ed" },
  valise: { n: "Valise du Ballon d'Or", icon: "🏆", c: "#f2c94c" }
};

/* ---------------- ACCESSOIRES (gagnés dans les coffres) ----------------
   Un accessoire se pose sur une voiture du parc (consommé) : bonus de prix. */
const ACCESSORIES = [
  { id: "sapin", n: "Désodorisant sapin", icon: "🌲", r: 0, v: 0.06 },
  { id: "fanion", n: "Fanion de foot", icon: "🚩", r: 0, v: 0.08 },
  { id: "figurine", n: "Figurine de Franck qui hoche la tête", icon: "🗿", r: 0, v: 0.1 },
  { id: "des", n: "Dés en peluche", icon: "🎲", r: 0, v: 0.07 },
  { id: "plaque", n: "Plaque perso « VENDEZ »", icon: "🪪", r: 1, v: 0.18 },
  { id: "klaxon", n: "Klaxon « Salut c'est Franck »", icon: "📯", r: 1, v: 0.22 },
  { id: "maillot", n: "Maillot dédicacé n°5", icon: "👕", r: 1, v: 0.25 },
  { id: "crampons", n: "Crampons sur le rétro", icon: "👟", r: 1, v: 0.2 },
  { id: "ballon", n: "Ballon d'Or sur le tableau de bord", icon: "⚽", r: 2, v: 0.6 },
  { id: "crane", n: "Peinture « Crâne lisse » effet miroir", icon: "🪩", r: 2, v: 0.75 },
  { id: "vache", n: "Vache en plastique sur le toit", icon: "🐄", r: 2, v: 0.5 }
];
const ACC_RARITY = ["Commun", "Rare", "Légendaire"];

/* ---------------- STYLES SIGNATURE ----------------
   Combinaisons de personnalisation qui font exploser la cote.
   req : niveau minimum par catégorie ; exact : valeur exacte ; color : couleur imposée */
const COMBOS = [
  { id: "kevin", n: "Tuning de Kevin", v: 0.35, req: { spoiler: 2, sono: 2 }, exact: { sticker: 2, neon: 1 }, d: "Flammes, néons bleus, gros aileron et caisson" },
  { id: "rallye", n: "Rallye du dimanche", v: 0.35, req: { kit: 2, wheel: 2, engine: 2 }, exact: { sticker: 3 }, d: "Numéro de course, kit large, jantes et moteur" },
  { id: "monaco", n: "Classe Monaco", v: 0.5, req: { paint: 3, interior: 3, tint: 1 }, d: "Peinture caméléon ou mieux, cuir matelassé, vitres teintées" },
  { id: "pigalle", n: "Nuit à Pigalle", v: 0.6, req: { tint: 1, sono: 3 }, exact: { neon: 4 }, d: "Néons arc-en-ciel, vitres teintées, concert ambulant" },
  { id: "bleus", n: "Allez les Bleus !", v: 0.45, color: "#2980b9", exact: { sticker: 1, neon: 1 }, d: "Carrosserie bleue, bandes racing, néons bleus" },
  { id: "discret", n: "Discret mais riche", v: 0.4, color: "#111111", req: { tint: 1, interior: 3, paint: 2 }, d: "Noir, vitres teintées, cuir, peinture nacrée" },
  { id: "course", n: "Bête de course", v: 0.8, req: { spoiler: 3, engine: 4, kit: 3 }, exact: { sticker: 1 }, d: "Aileron de fusée, réacteur, kit course, bandes" },
  { id: "dubai", n: "Bling de Dubaï", v: 1, req: { paint: 4, interior: 4 }, exact: { wheel: 5 }, d: "Or 24 carats, rayons dorés, alcantara doré" },
  { id: "crane", n: "Crâne lisse", v: 0.9, req: { paint: 5, wheel: 1 }, d: "Chrome miroir intégral (ça brille comme Franck)" },
  { id: "full", n: "Tout à fond", v: 1.5, req: { paint: 6, wheel: 5, kit: 3, spoiler: 3, interior: 4, engine: 5, sono: 3 }, d: "Tout au maximum. Tout." }
];

/* ---------------- VISITEURS FARFELUS ----------------
   Ils traversent l'écran ; un clic déclenche leur effet. */
const VISITORS = [
  { id: "foot", n: "Un footballeur star", icon: "⚽", line: "Hé Franck ! On se fait un petit défi de jongles ?", w: 3 },
  { id: "keeper", n: "Un gardien de but", icon: "🧤", line: "Cinq tirs au but, Franck. Si tu marques, je t'achète une voiture.", w: 2 },
  { id: "influ", n: "Une influenceuse", icon: "🤳", line: "Coucou la commu ! Je suis chez Franck !", w: 2 },
  { id: "mamie", n: "Mamie Ginette", icon: "👵", line: "Tiens mon petit, des bonbons… et un coffre.", w: 2 },
  { id: "alien", n: "Un extraterrestre poli", icon: "👽", line: "Bonjour. Je voudrais acheter votre voiture la plus brillante.", w: 1 },
  { id: "ct", n: "Le contrôleur technique", icon: "🧐", line: "Contrôle surprise ! … Bon, c'est réparé.", w: 2 },
  { id: "cheikh", n: "Un cheikh pressé", icon: "🕶️", line: "Je prends la plus chère. Je paie le double.", w: 1 }
];

if (typeof module !== "undefined") module.exports = {};
