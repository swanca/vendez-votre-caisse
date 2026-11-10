"use strict";
/* =========================================================
   VENDEZ VOTRE CAISSE — Moteur
   Flux : pubs → clients (leads) → rachat de voitures → atelier
   (réparation + customisation) → vitrine → vente. Prestige : saisons.
   ========================================================= */
const Game = (() => {
  const SAVE_KEY = "vvc_save_v1";
  let S = null;
  let ver = 0;
  const events = [];
  const emit = (type, d = {}) => { events.push(Object.assign({ type }, d)); if (events.length > 300) events.splice(0, 150); };
  const bump = () => ver++;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  let carId = 1;

  function newState() {
    return {
      v: 1, created: Date.now(), lastSave: Date.now(),
      money: 500, earned: 0, earnedTotal: 0, leads: 0, clicks: 0,
      tierMax: 0, focus: -1, garage: 0,
      ads: {}, staff: {}, ups: {}, gen: 0, catalog: {}, pack: {},
      lot: [], commission: null, comT: 60, offer: null, animals: {},
      codex: {}, franchise: {}, mission: 0, chests: {}, acc: {}, market: null, skills: {}, auction: null, auctionT: 300, museum: [], chal: [],
      stars: 0, starsSpent: 0, talents: {},
      boosts: {}, eventT: 90,
      stats: { sold: 0, bought: 0, commissions: 0, seasons: 0, starsTotal: 0, play: 0, bestSale: 0, customs: 0, negos: 0, skills: 0, animals: 0, auctions: 0, chals: 0, combos: 0, accs: 0, juggles: 0, bestJuggle: 0, chestsOpened: 0, visitors: 0 },
      ach: {}, settings: { sound: true, volume: 0.8, intro: false }
    };
  }

  /* ---------------- MULTIPLICATEURS ---------------- */
  const tal = (id) => S.talents[id] || 0;
  function upMult(t) {
    let m = 1;
    for (const u of UPGRADES) if (S.ups[u.id] && u.t === t) m *= u.v;
    for (let i = 0; i < S.gen; i++) { const g = genUpgrade(i); if (g.t === t) m *= g.v; }
    return m;
  }
  function boost(k) { const b = S.boosts[k]; return b && b.until > Date.now() ? b.v : 1; }
  const achCount = () => Object.keys(S.ach).length;
  const starMult = () => 1 + S.stars * (0.05 + 0.01 * tal("t_star"));
  const achMult = () => 1 + achCount() * ACH_BONUS;
  const codexCount = () => Object.keys(S.codex).length;
  function codexMult() {
    let m = 1 + codexCount() * 0.005;
    // marques complètes (3 modèles) : +2 % chacune
    const brands = {};
    for (const k in S.codex) { const [t, b] = k.split(":"); brands[t + ":" + b] = (brands[t + ":" + b] || 0) + 1; }
    for (const k in brands) if (brands[k] >= 3) m += 0.02;
    return m;
  }
  const museumSlots = () => 3 + Math.floor(S.garage / 2);
  const museumPiece = (c) => (0.03 + 0.012 * c.t) * (c.unique ? 1.5 : 1) * (c.ed ? 2 : 1);
  const museumMult = () => 1 + S.museum.reduce((a, c) => a + museumPiece(c), 0);
  const franchiseLvl = () => Object.values(S.franchise || {}).reduce((a, b) => a + b, 0);
  const franchiseMult = () => 1 + FRANCHISE_BONUS * franchiseLvl();
  const franchiseCost = (f) => f.base * Math.pow(FRANCHISE_GROWTH, (S.franchise || {})[f.id] || 0);
  function buyFranchise(id) {
    const f = FRANCHISES.find((x) => x.id === id);
    if (!f || S.stats.seasons < 1) return false;
    const c = franchiseCost(f);
    if (S.money < c) return false;
    S.money -= c; S.franchise = S.franchise || {}; S.franchise[id] = (S.franchise[id] || 0) + 1;
    emit("toast", { k: "franchise", n: f.n }); bump();
    return true;
  }
  const globalMult = () => starMult() * achMult() * codexMult() * museumMult() * franchiseMult();
  const milestoneMult = (n) => Math.pow(2, MILESTONES.filter((m) => n >= m).length);
  const lotCap = () => garageInfo(S.garage).cap + 2 * tal("t_lot");
  const convoy = () => Math.round(upMult("convoy") * Math.pow(2, tal("t_convoy")));
  const negoMult = () => Math.max(0.55, 1 - 0.012 * Math.sqrt(S.staff.nego || 0) * 6) * upMult("buy") * Math.max(0.6, 1 - 0.03 * tal("t_nego")) * boost("buy");
  const clickPower = () => (1 + (S.staff.camera || 0)) * upMult("click") * Math.pow(2, tal("t_click")) * globalMult();
  const workPower = () => (1 + (S.staff.meca || 0)) * milestoneMult(S.staff.meca || 0) * upMult("work") * boost("work");
  const sellPower = () => (1 + (S.staff.vendeur || 0)) * milestoneMult(S.staff.vendeur || 0) * upMult("sell") * boost("sell");
  function adLps(a) { const n = S.ads[a.id] || 0; return a.lps * n * milestoneMult(n); }
  function leadsPerSec() {
    let l = 0;
    for (const a of ADS) l += adLps(a);
    l *= upMult("ads") * globalMult();
    l += (S.staff.stagiaire || 0) * 0.5 * clickPower();
    return l * boost("leads") * (1 + animalLeadPct());
  }
  const leadsMax = () => Math.max(30, lotCap() * 10, leadsPerSec() * 30);

  /* ---------------- VOITURES ---------------- */
  const workUnit = (t) => 4 * Math.pow(2.5, t);
  const sellUnit = (t) => 3 * Math.pow(2.4, t);
  function basePrice(c) { const T = tierInfo(c.t); return T.p * (1 + 0.12 * c.b) * [0.85, 1, 1.2][c.m]; }
  function packFor(t) { const p = {}; for (const ci of CUSTOM) { const l = Math.min(S.pack[ci.id] || 0, S.catalog[ci.id] || 0); if (l) p[ci.id] = l; } return p; }
  function customTotals(custom) {
    let val = 0, cost = 0, work = 0;
    for (const k in custom) { val += customValue(custom[k]); cost += customCost(custom[k]); work += customWork(custom[k]); }
    return { val, cost, work };
  }
  function partsCost(c, custom) {
    const ct = customTotals(custom);
    // talent : la première catégorie du pack est gratuite par niveau
    let free = 0;
    if (tal("t_auto")) { const k = Object.keys(custom)[0]; if (k) free = customCost(Math.min(custom[k], tal("t_auto"))); }
    return Math.max(0, ct.cost - free) * basePrice(c) * c.q;
  }
  function salePrice(c) {
    const ct = customTotals(c.custom);
    const unique = c.unique ? 1.15 : 1;
    return basePrice(c) * (1.15 + ct.val) * garageInfo(S.garage).mult * upMult("price") * globalMult() * unique * c.q * trend(carStyle(c)) * boost("price") * (c.ed ? 4 : 1) * comboMult(c) * accMult(c);
  }
  /* ---------------- STYLES SIGNATURE & ACCESSOIRES ---------------- */
  function combosOf(c) {
    const cu = c.custom || {};
    return COMBOS.filter((k) => {
      if (k.color && c.color !== k.color) return false;
      for (const x in k.req || {}) if ((cu[x] || 0) < k.req[x]) return false;
      for (const x in k.exact || {}) if ((cu[x] || 0) !== k.exact[x]) return false;
      return true;
    });
  }
  const comboMult = (c) => 1 + combosOf(c).reduce((a, k) => a + k.v, 0);
  const accMult = (c) => { if (!c.acc) return 1; const a = ACCESSORIES.find((x) => x.id === c.acc); return a ? 1 + a.v : 1; };
  // cote de 1 à 5 étoiles selon la personnalisation
  function rating(c) {
    const ct = customTotals(c.custom || {});
    const score = ct.val + combosOf(c).reduce((a, k) => a + k.v, 0) + (accMult(c) - 1) + (c.unique ? 0.15 : 0);
    return Math.max(1, Math.min(5, 1 + Math.floor(score / 0.6)));
  }
  function applyAcc(carId, accId) {
    const c = S.lot.find((x) => x.id === carId);
    if (!c || c.acc || !(S.acc[accId] > 0)) return false;
    S.acc[accId]--; c.acc = accId; S.stats.accs++;
    emit("acc", { a: ACCESSORIES.find((x) => x.id === accId) }); bump();
    return true;
  }

  /* ---------------- CARRIÈRE & COFFRES ---------------- */
  const currentMission = () => missionInfo(S.mission);
  const missionDone = () => { try { return !!currentMission().c(S, api); } catch (e) { return false; } };
  function claimMission() {
    if (!missionDone()) return false;
    const m = currentMission();
    const cash = Math.max(150, incomeEstimate() * 90 * (1 + S.mission * 0.05));
    addMoney(cash);
    addChest(m.r);
    S.mission++;
    emit("mission", { m, cash }); bump();
    return true;
  }
  function addChest(k, n = 1) { S.chests[k] = (S.chests[k] || 0) + n; bump(); }
  function rollAcc(maxR) {
    const pool = ACCESSORIES.filter((a) => a.r <= maxR);
    const w = pool.map((a) => [6, 2.5, 1][a.r]);
    let x = Math.random() * w.reduce((p, q) => p + q, 0);
    for (let i = 0; i < pool.length; i++) { if ((x -= w[i]) <= 0) return pool[i]; }
    return pool[0];
  }
  function openChest(k) {
    if (!(S.chests[k] > 0)) return null;
    S.chests[k]--; S.stats.chestsOpened++;
    const inc = Math.max(50, incomeEstimate());
    const out = [];
    const mins = { boite: 1.5, coffre: 5, valise: 15 }[k];
    const cash = Math.max({ boite: 150, coffre: 1500, valise: 15000 }[k], inc * 60 * mins * (0.8 + Math.random() * 0.4));
    addMoney(cash); out.push({ t: "cash", v: cash });
    const nAcc = { boite: Math.random() < 0.5 ? 1 : 0, coffre: 1, valise: 2 }[k];
    for (let i = 0; i < nAcc; i++) { const a = rollAcc({ boite: 0, coffre: 1, valise: 2 }[k]); S.acc[a.id] = (S.acc[a.id] || 0) + 1; out.push({ t: "acc", a }); }
    const bk = pick(["leads", "work", "sell", "price"]);
    const bv = { boite: 2, coffre: 4, valise: 6 }[k];
    S.boosts[bk] = { v: bv, until: Date.now() + ({ boite: 45, coffre: 75, valise: 120 }[k]) * 1000 };
    out.push({ t: "boost", k: bk, v: bv });
    if (k !== "boite" && Math.random() < 0.5) { S.skills = {}; out.push({ t: "skills" }); }
    if (k === "valise") {
      const an = pick(ANIMALS.filter((x) => !x.req));
      S.animals[an.id] = (S.animals[an.id] || 0) + 1; out.push({ t: "animal", an });
      if (S.stats.seasons >= 1) { S.stars += 1; S.stats.starsTotal += 1; out.push({ t: "star" }); }
    }
    bump();
    return out;
  }

  /* ---------------- VISITEURS ---------------- */
  function visitor(id) {
    S.stats.visitors++;
    const vit = S.lot.filter((c) => c.stage === "vitrine");
    const sellTop = (mult) => {
      if (!vit.length) { const g = Math.max(200, incomeEstimate() * 60); addMoney(g); return { gain: g }; }
      const c = vit.sort((a, b) => salePrice(b) - salePrice(a))[0];
      const g = salePrice(c) * mult;
      addMoney(g); S.stats.sold += c.q; registerCodex(c); S.lot.splice(S.lot.indexOf(c), 1);
      return { gain: g, name: carName(c) };
    };
    let r = {};
    if (id === "influ") { S.boosts.leads = { v: 10, until: Date.now() + 30000 }; r = { boost: true }; }
    else if (id === "mamie") { addChest("boite"); r = { chest: "boite" }; }
    else if (id === "alien") { const c = S.lot.find((x) => ["hover", "ufo"].includes(carStyle(x)) && x.stage === "vitrine"); r = c ? (() => { const g = salePrice(c) * 10; addMoney(g); S.stats.sold += c.q; registerCodex(c); S.lot.splice(S.lot.indexOf(c), 1); return { gain: g, name: carName(c) }; })() : sellTop(3); }
    else if (id === "ct") { let n = 0; for (const c of S.lot) if (c.stage === "atelier") { c.done = c.need; n++; } r = { fixed: n }; }
    else if (id === "cheikh") r = sellTop(2);
    bump();
    return r;
  }
  // Défi de jongles du footballeur
  function juggleReward(n) {
    S.stats.juggles++;
    S.stats.bestJuggle = Math.max(S.stats.bestJuggle, n);
    const g = Math.max(100, incomeEstimate() * 8 * n);
    addMoney(g);
    let chest = null;
    if (n >= 25) chest = "valise"; else if (n >= 10) chest = "coffre"; else if (n >= 5) chest = "boite";
    if (chest) addChest(chest);
    S.leads = Math.min(leadsMax(), S.leads + n * clickPower());
    bump();
    return { gain: g, chest };
  }

  function penaltyReward(goals) {
    S.stats.bestPenalty = Math.max(S.stats.bestPenalty || 0, goals);
    const g = Math.max(150, incomeEstimate() * 25 * goals);
    addMoney(g);
    const chest = goals >= 5 ? "valise" : goals >= 3 ? "coffre" : goals >= 1 ? "boite" : null;
    if (chest) addChest(chest);
    bump();
    return { gain: g, chest };
  }

  function buyPrice(t, b, m, cond, q) { return tierInfo(t).p * (1 + 0.12 * b) * [0.85, 1, 1.2][m] * cond * 0.6 * negoMult() * q; }
  // on ne propose pas une gamme dont même une épave coûterait plus que la caisse
  function affordable(t) { while (t > 0 && buyPrice(t, 0, 0, 0.45, convoy()) > S.money) t--; return t; }
  function chooseTier() {
    if (S.focus >= 0 && S.focus <= S.tierMax) return affordable(S.focus);
    const x = Math.random();
    const t = x < 0.6 ? S.tierMax : x < 0.9 ? S.tierMax - 1 : S.tierMax - 2;
    return affordable(Math.max(0, t));
  }
  function makeOffer(t) {
    const T = tierInfo(t);
    const b = Math.floor(Math.random() * T.brands.length), m = Math.floor(Math.random() * 3);
    const cond = rnd(0.3, 0.85);
    return { t, b, m, cond, q: convoy() };
  }
  function buyCar(o) {
    const custom = packFor(o.t);
    const c = { id: carId++, t: o.t, b: o.b, m: o.m, cond: o.cond, q: o.q, color: o.color || pick(PAINTS), custom, stage: "atelier", done: 0, num: 1 + Math.floor(Math.random() * 99) };
    let price = buyPrice(o.t, o.b, o.m, o.cond, o.q) * (o.disc || 1) + partsCost(c, custom);
    // anti-blocage : parc vide et caisse vide → le vendeur accepte ce qu'il te reste
    if (S.money < price && S.lot.length === 0 && o.t === 0) { price = S.money; c.custom = {}; }
    if (S.money < price) return false;
    S.money -= price;
    c.paid = price;
    c.need = c.q * workUnit(c.t) * ((1 - c.cond) * 2 + customTotals(custom).work + 0.2);
    // vice caché : découvert à l'atelier, double presque le travail
    if (Math.random() < Math.max(0.03, 0.15 - 0.02 * (S.staff.expert || 0))) { c.vice = true; c.need *= 1.8; }
    S.lot.push(c);
    S.stats.bought += c.q;
    return true;
  }
  function carName(c) { const T = tierInfo(c.t); const br = T.brands[c.b % T.brands.length]; return br[0] + " " + br[1][c.m][0]; }
  function carStyle(c) { const T = tierInfo(c.t); const br = T.brands[c.b % T.brands.length]; return br[1][c.m][1]; }
  function carSpec(c) {
    const cu = c.custom;
    return {
      style: carStyle(c), color: c.color, color2: PAINT_FX[cu.paint || 0] || "#ffffff",
      wheel: cu.wheel || 0, rim: (cu.wheel || 0) >= 5 ? "#ffd700" : "#cfd4da",
      spoiler: cu.spoiler || 0, kit: (cu.kit || 0) > 0, neon: NEON_COLORS[cu.neon || 0], sticker: cu.sticker || 0, num: c.num,
      tint: (cu.tint || 0) > 0, rust: c.stage === "atelier" && c.done < c.need * 0.5 && c.cond < 0.55, flame: (cu.engine || 0) >= 3, shine: (cu.paint || 0) >= 4
    };
  }

  // Offre de rachat affichée (mode manuel)
  function currentOffer() {
    if (S.leads < 1 || S.lot.length >= lotCap()) return null;
    if (!S.offer || S.offer.t > S.tierMax || (S.lot.length === 0 && offerPrice(S.offer) > S.money && S.offer.t > 0)) S.offer = makeOffer(chooseTier());
    return S.offer;
  }
  function offerPrice(o) { return buyPrice(o.t, o.b, o.m, o.cond, o.q) + partsCost(o, packFor(o.t)); }
  function manualBuy() {
    const o = currentOffer();
    if (!o) return false;
    if (!buyCar(o)) return false;
    S.leads -= 1; S.offer = null;
    emit("carBought", { name: carName(o) }); bump();
    return true;
  }
  function skipOffer() { S.offer = null; bump(); }
  /* ---------------- LE PRÉ (gag) ---------------- */
  const animalCount = (id) => S.animals[id] || 0;
  const animalTotal = () => Object.values(S.animals).reduce((x, y) => x + y, 0);
  const animalCost = (an) => Math.round(an.cost * Math.pow(an.growth, animalCount(an.id)));
  const animalUnlocked = (an) => !an.req || ANIMALS.filter((x) => !x.req).every((x) => animalCount(x.id) > 0);
  function buyAnimal(id) {
    const an = ANIMALS.find((x) => x.id === id);
    if (!an || !animalUnlocked(an)) return false;
    const c = animalCost(an);
    if (S.money < c) return false;
    S.money -= c; S.animals[id] = animalCount(id) + 1; S.stats.animals++;
    emit("animal", { an, n: an.names[(animalCount(id) - 1) % an.names.length] }); bump();
    return true;
  }
  function animalIncome() {
    let x = 0;
    for (const an of ANIMALS) { const n = animalCount(an.id); if (n) x += an.prod * n * Math.pow(1.07, n); }
    return x * globalMult();
  }
  function animalLeadPct() { let p = 0; for (const an of ANIMALS) p += an.lead * animalCount(an.id); return p; }

  /* ---------------- NÉGOCIATION (mini-jeu) ----------------
     q ∈ [0,1] = précision du clic (1 = pile au centre) */
  function negotiate(q) {
    const o = currentOffer();
    if (!o || o.nego) return null;
    o.nego = true;
    let r;
    if (q > 0.85) r = { disc: 0.6, k: "top" };
    else if (q > 0.6) r = { disc: 0.78, k: "good" };
    else if (q > 0.3) r = { disc: 0.92, k: "ok" };
    else r = { disc: 1.15, k: "bad" };
    o.disc = r.disc;
    if (r.disc < 1) S.stats.negos++;
    bump();
    return r;
  }

  /* ---------------- TENDANCES DU MARCHÉ ---------------- */
  function rollMarket() {
    const styles = Object.keys(STYLE_NAMES).sort(() => Math.random() - 0.5);
    S.market = { until: Date.now() + MARKET_MS, hot: [styles[0], styles[1]], cold: styles[2], m: [1.5 + Math.random() * 0.5, 1.25 + Math.random() * 0.3] };
    emit("market", {}); bump();
  }
  function trend(style) {
    const M = S.market;
    if (!M) return 1;
    if (M.hot[0] === style) return M.m[0];
    if (M.hot[1] === style) return M.m[1];
    if (M.cold === style) return 0.75;
    return 1;
  }

  /* ---------------- COLLECTION ---------------- */
  function registerCodex(c) {
    const k = c.t + ":" + (c.b % tierInfo(c.t).brands.length) + ":" + c.m;
    if (!S.codex[k]) { S.codex[k] = 0; emit("codex", { name: carName(c) }); bump(); }
    S.codex[k] += c.q;
  }

  /* ---------------- COUPS DE FRANCK ---------------- */
  const skillReady = (sk) => Math.max(0, ((S.skills[sk.id] || 0) - Date.now()) / 1000);
  function useSkill(id) {
    const sk = SKILLS.find((x) => x.id === id);
    if (!sk || !sk.unlock(S) || skillReady(sk) > 0) return false;
    S.skills[id] = Date.now() + sk.cd * 1000;
    S.stats.skills++;
    if (sk.fx) for (const k in sk.fx) S.boosts[k] = { v: sk.fx[k], until: Date.now() + sk.dur * 1000 };
    if (id === "liquid") {
      let g = 0, n = 0;
      S.lot = S.lot.filter((c) => { if (c.stage !== "vitrine") return true; const p = salePrice(c) * 0.9; g += p; n += c.q; S.stats.sold += c.q; registerCodex(c); return false; });
      addMoney(g);
      emit("liquid", { gain: g, n });
    }
    emit("skill", { sk }); bump();
    return true;
  }

  /* ---------------- MUSÉE ---------------- */
  function exhibit(id) {
    const i = S.lot.findIndex((c) => c.id === id);
    if (i < 0 || S.museum.length >= museumSlots()) return false;
    const c = S.lot.splice(i, 1)[0];
    S.museum.push({ t: c.t, b: c.b, m: c.m, color: c.color, custom: c.custom, unique: !!c.unique, ed: !!c.ed, num: c.num, q: 1, stage: "vitrine" });
    registerCodex(c);
    emit("museum", { name: carName(c) }); bump();
    return true;
  }
  function unexhibit(i) { if (S.museum[i]) { S.museum.splice(i, 1); bump(); } }

  /* ---------------- ENCHÈRES ---------------- */
  function newAuction() {
    const t = S.tierMax + (Math.random() < 0.35 ? 1 : 0);
    const o = makeOffer(t);
    o.q = 1;
    const c = Object.assign({ custom: {}, color: pick(PAINTS), stage: "vitrine", unique: true, ed: true, num: 1 + Math.floor(Math.random() * 99) }, o);
    const val = salePrice(c);
    S.auction = { car: c, price: Math.round(val * 0.18), lead: pick(RIVALS), mine: false, ends: Date.now() + AUCTION_LEN * 1000, max: val * (0.35 + Math.random() * 0.4), nextAi: 3 };
    emit("toast", { k: "auction" }); bump();
  }
  function bid() {
    const A = S.auction;
    if (!A || A.mine || Date.now() > A.ends) return false;
    const p = Math.round(A.price * 1.12);
    if (S.money < p) return false;
    A.price = p; A.mine = true; A.lead = "Franck";
    if (A.ends - Date.now() < 8000) A.ends = Date.now() + 8000;
    bump();
    return true;
  }
  function auctionTick(dt) {
    const A = S.auction;
    if (!A) { S.auctionT -= dt; if (S.auctionT <= 0) { S.auctionT = AUCTION_EVERY[0] + Math.random() * (AUCTION_EVERY[1] - AUCTION_EVERY[0]); newAuction(); } return; }
    A.nextAi -= dt;
    if (A.mine && A.nextAi <= 0) {
      A.nextAi = 2 + Math.random() * 4;
      const p = Math.round(A.price * (1.08 + Math.random() * 0.1));
      if (p <= A.max) { A.price = p; A.mine = false; A.lead = pick(RIVALS); if (A.ends - Date.now() < 6000) A.ends = Date.now() + 6000; bump(); }
    }
    if (Date.now() > A.ends) {
      if (A.mine && S.money >= A.price && S.lot.length < lotCap() + 5) {
        S.money -= A.price;
        const c = Object.assign({}, A.car, { id: carId++, paid: A.price, done: 0, need: 0, sellDone: 0, sellNeed: sellUnit(A.car.t) * 3 });
        S.lot.push(c);
        S.stats.auctions++;
        emit("auctionWon", { name: carName(c), price: A.price });
      } else emit("auctionLost", { who: A.lead });
      S.auction = null; bump();
    }
  }

  /* ---------------- DÉFIS ---------------- */
  function chalStat(id) { const st = S.stats; return { sold: st.sold, earned: S.earnedTotal, clicks: S.clicks, customs: st.customs, bought: st.bought, animals: st.animals, negos: st.negos, skills: st.skills }[id] || 0; }
  function newChallenge() {
    const used = S.chal.map((c) => c.id);
    const pool = CHALLENGES.filter((c) => !used.includes(c.id) && !(c.id === "animals" && S.tierMax >= 3));
    const C = pick(pool);
    const lvl = 1 + S.stats.chals * 0.15;
    const inc = incomeEstimate();
    const target = C.money ? Math.round(Math.max(800, inc * 240 * lvl)) : Math.round(C.base * lvl * (C.stat === "sold" || C.stat === "bought" ? Math.max(1, convoy()) : 1));
    S.chal.push({ id: C.id, stat: C.stat, target, start: chalStat(C.stat), reward: Math.max(120, inc * 150 * lvl) });
  }
  function chalProgress(ch) { return Math.max(0, chalStat(ch.stat) - ch.start); }
  function claimChallenge(i) {
    const ch = S.chal[i];
    if (!ch || chalProgress(ch) < ch.target) return false;
    addMoney(ch.reward);
    S.stats.chals++;
    S.chal.splice(i, 1);
    newChallenge();
    emit("chal", { reward: ch.reward }); bump();
    return true;
  }

  /* ---------------- ACTIONS ---------------- */
  function clickAd() {
    const g = clickPower();
    S.leads = Math.min(leadsMax(), S.leads + g);
    S.clicks++;
    emit("click", { g });
  }
  function buyAd(id, n = 1) {
    const a = ADS.find((x) => x.id === id);
    let k = 0;
    while (k < n) { const c = adCost(a); if (S.money < c) break; S.money -= c; S.ads[id] = (S.ads[id] || 0) + 1; k++; }
    if (k) { bump(); emit("buy", {}); }
    return k;
  }
  const adCost = (a, n = S.ads[a.id] || 0) => a.cost * Math.pow(AD_GROWTH, n);
  const staffCost = (s, n = S.staff[s.id] || 0) => s.cost * Math.pow(s.growth, n);
  function buyStaff(id, n = 1) {
    const s = STAFF.find((x) => x.id === id);
    let k = 0;
    while (k < n) { const c = staffCost(s); if (S.money < c) break; S.money -= c; S.staff[id] = (S.staff[id] || 0) + 1; k++; }
    if (k) { bump(); emit("buy", {}); }
    return k;
  }
  function buyUpgrade(id) {
    if (id === "gen") { const g = genUpgrade(S.gen); if (S.money < g.cost) return; S.money -= g.cost; S.gen++; }
    else { const u = UPGRADES.find((x) => x.id === id); if (!u || S.ups[id] || S.money < u.cost) return; S.money -= u.cost; S.ups[id] = true; }
    bump(); emit("buy", {});
  }
  function nextUpgrades() { const list = UPGRADES.filter((u) => !S.ups[u.id]); if (list.length < 3) list.push(genUpgrade(S.gen)); return list; }
  function buyGarage() {
    const g = garageInfo(S.garage + 1);
    if (S.money < g.cost) return;
    S.money -= g.cost; S.garage++;
    emit("toast", { k: "garage", n: g.n }); emit("buy", {}); bump();
  }
  function unlockTier() {
    const t = S.tierMax + 1, c = tierUnlockCost(t);
    if (S.money < c) return;
    S.money -= c; S.tierMax = t;
    emit("toast", { k: "tier", n: tierInfo(t).n }); emit("buy", {}); bump();
  }
  function buyCatalog(ci) {
    const C = CUSTOM.find((x) => x.id === ci), l = S.catalog[ci] || 0;
    if (l >= C.opts.length - 1) return;
    const c = catalogCost(CUSTOM.indexOf(C), l + 1);
    if (S.money < c) return;
    S.money -= c; S.catalog[ci] = l + 1;
    emit("buy", {}); bump();
  }
  function setPack(ci, l) { S.pack[ci] = Math.max(0, Math.min(l, S.catalog[ci] || 0)); bump(); }

  // Atelier perso : customisation manuelle d'une voiture du parc
  function customizeCost(c, newCustom) {
    let extra = {};
    for (const k in newCustom) { const d = (newCustom[k] || 0) - (c.custom[k] || 0); if (d > 0) extra[k] = newCustom[k]; }
    const old = {};
    for (const k in extra) old[k] = c.custom[k] || 0;
    const cost = (customTotals(extra).cost - customTotals(old).cost) * basePrice(c) * c.q;
    const work = (customTotals(extra).work - customTotals(old).work) * workUnit(c.t) * c.q;
    return { cost: Math.max(0, cost), work: Math.max(0, work) };
  }
  function customize(id, newCustom, color) {
    const c = S.lot.find((x) => x.id === id);
    if (!c) return false;
    for (const k in newCustom) if ((newCustom[k] || 0) > (S.catalog[k] || 0)) return false;
    const { cost, work } = customizeCost(c, newCustom);
    if (S.money < cost) return false;
    S.money -= cost;
    c.paid += cost;
    c.custom = Object.assign({}, c.custom, newCustom);
    for (const k in c.custom) if (!c.custom[k]) delete c.custom[k];
    if (color) c.color = color;
    c.unique = true;
    S.stats.customs++;
    if (work > 0) { c.need += work; if (c.stage === "vitrine") { c.stage = "atelier"; c.done = Math.max(0, c.need - work); } }
    emit("custom", {}); bump();
    return true;
  }

  /* ---------------- COMMANDES SPÉCIALES ---------------- */
  function newCommission() {
    const t = Math.max(0, S.tierMax - Math.floor(Math.random() * 2));
    const cats = CUSTOM.filter((c) => c.id !== "tint").sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2));
    const req = {};
    for (const c of cats) req[c.id] = Math.max(1, Math.min(c.opts.length - 1, (S.catalog[c.id] || 0) + (Math.random() < 0.35 ? 1 : 0)));
    S.commission = { client: pick(CLIENT_NAMES), t, color: pick(PAINTS), req, until: Date.now() + 12 * 60 * 1000, mult: 3 * (1 + tal("t_commission")) };
    emit("toast", { k: "commission" }); bump();
  }
  function matchesCommission(c, co = S.commission) {
    if (!co || c.stage !== "vitrine" || c.t < co.t || c.color !== co.color) return false;
    for (const k in co.req) if ((c.custom[k] || 0) < co.req[k]) return false;
    return true;
  }
  function deliverCommission(id) {
    const co = S.commission, c = S.lot.find((x) => x.id === id);
    if (!co || !c || !matchesCommission(c)) return;
    const gain = salePrice(c) * co.mult;
    addMoney(gain);
    S.lot.splice(S.lot.indexOf(c), 1);
    S.stats.sold += c.q; S.stats.commissions++; registerCodex(c);
    S.commission = null; S.comT = 120;
    emit("sale", { gain, big: true, name: carName(c) }); bump();
  }

  /* ---------------- ÉVÈNEMENTS ---------------- */
  function triggerEvent() {
    const ev = pick(EVENTS);
    if (ev.fx.cash) { const g = incomeEstimate() * ev.fx.cash; addMoney(Math.max(g, 100)); emit("event", { ev, gain: g }); }
    else { for (const k in ev.fx) S.boosts[k] = { v: ev.fx[k], until: Date.now() + ev.dur * 1000 }; emit("event", { ev }); }
    bump();
  }
  // estimation du revenu par seconde (moyenne glissante)
  let incWindow = [], incAcc = 0, incT = 0;
  function incomeEstimate() { return incWindow.length ? incWindow.reduce((a, b) => a + b, 0) / incWindow.length : 0; }
  function addMoney(x) { S.money += x; S.earned += x; S.earnedTotal += x; incAcc += x; }

  /* ---------------- BOUCLE ---------------- */
  function tick(dt) {
    if (!S) return;
    S.stats.play += dt;
    S.leads = Math.min(leadsMax(), S.leads + leadsPerSec() * dt);
    // rachats
    // lait des vaches
    const ai = animalIncome();
    if (ai) addMoney(ai * dt);
    if (!S.market || Date.now() > S.market.until) rollMarket();
    auctionTick(dt);
    while (S.chal.length < 3) newChallenge();
    let guard = 0;
    while (S.ups.auto && S.leads >= 1 && S.lot.length < lotCap() && guard++ < 100) {
      let o = makeOffer(chooseTier());
      if (!buyCar(o)) {
        // pas assez d'argent : on tente le palier le moins cher disponible
        let ok = false;
        for (let t = o.t - 1; t >= 0 && !ok; t--) ok = buyCar(makeOffer(t));
        if (!ok) break;
      }
      S.leads -= 1;
    }
    // atelier
    let w = workPower() * dt;
    for (const c of S.lot) {
      if (w <= 0) break;
      if (c.stage !== "atelier") continue;
      const d = Math.min(w, c.need - c.done);
      c.done += d; w -= d;
      if (c.done >= c.need - 1e-9) { c.stage = "vitrine"; c.sellDone = 0; c.sellNeed = c.q * sellUnit(c.t); }
    }
    // ventes
    let s = sellPower() * dt;
    for (let i = 0; i < S.lot.length && s > 0; i++) {
      const c = S.lot[i];
      if (c.stage !== "vitrine" || c.reserved) continue;
      const d = Math.min(s, c.sellNeed - c.sellDone);
      c.sellDone += d; s -= d;
      if (c.sellDone >= c.sellNeed - 1e-9) {
        const gain = salePrice(c);
        addMoney(gain);
        S.stats.sold += c.q;
        S.stats.bestSale = Math.max(S.stats.bestSale, gain);
        registerCodex(c);
        if (combosOf(c).length) S.stats.combos++;
        if (c.acc === "klaxon") emit("klaxon", {});
        S.lot.splice(i, 1); i--;
        emit("sale", { gain, name: carName(c), unique: c.unique, id: c.id, t: c.t });
      }
    }
    // commandes et évènements
    if (S.commission && Date.now() > S.commission.until) { S.commission = null; S.comT = 90; bump(); }
    if (!S.commission) { S.comT -= dt; if (S.comT <= 0) newCommission(); }
    // revenu moyen
    incT += dt;
    if (incT >= 1) { incWindow.push(incAcc / incT); if (incWindow.length > 10) incWindow.shift(); incAcc = 0; incT = 0; }
  }

  /* ---------------- SUCCÈS ---------------- */
  function catalogTotal() { return Object.values(S.catalog).reduce((a, b) => a + b, 0); }
  function checkAch() {
    const val = { franchise: franchiseLvl(), codex: codexCount(), museum: S.museum.length, animals: S.stats.animals, auctions: S.stats.auctions, chals: S.stats.chals, earned: S.earnedTotal, sold: S.stats.sold, clicks: S.clicks, tier: S.tierMax, garage: S.garage, commissions: S.stats.commissions, seasons: S.stats.seasons, starsTotal: S.stats.starsTotal, catalog: catalogTotal() };
    for (const a of ACHIEVEMENTS) if (!S.ach[a.id] && val[a.t] >= a.v) { S.ach[a.id] = Date.now(); emit("toast", { k: "ach", n: a.n }); bump(); }
  }

  /* ---------------- PRESTIGE ---------------- */
  const pendingStars = () => Math.max(0, starsFor(S.earnedTotal) - S.stats.starsTotal);
  function prestige() {
    const p = pendingStars();
    if (p < 1) return;
    const keep = { stars: S.stars + p, starsSpent: S.starsSpent, talents: S.talents, ach: S.ach, stats: S.stats, earnedTotal: S.earnedTotal, settings: S.settings, created: S.created, clicks: S.clicks, codex: S.codex, museum: S.museum, franchise: S.franchise, mission: S.mission, chests: S.chests, acc: S.acc };
    const tierMax = tal("t_keep") ? S.tierMax : 0;
    const garage = Math.min(S.garage, tal("t_garage"));
    S = Object.assign(newState(), keep);
    S.stats.starsTotal += p; S.stats.seasons++;
    S.tierMax = tierMax; S.garage = garage;
    if (tal("t_start")) S.money = 5000;
    S.settings.intro = true;
    emit("prestige", { p }); bump();
  }
  const freeStars = () => S.stats.starsTotal - S.starsSpent;
  function buyTalent(id) {
    const t = TALENTS.find((x) => x.id === id), l = tal(id);
    if (!t || l >= t.max) return;
    const c = t.cost * (l + 1);
    if (freeStars() < c) return;
    S.starsSpent += c; S.talents[id] = l + 1; bump();
  }

  /* ---------------- HORS LIGNE / SAUVEGARDE ---------------- */
  function offline() {
    const secs = Math.min(8 * 3600, (Date.now() - S.lastSave) / 1000);
    if (secs < 60) return;
    const m0 = S.money, s0 = S.stats.sold;
    const eff = 0.5 + 0.125 * tal("t_offline");
    const steps = Math.min(4000, Math.ceil(secs / 2));
    const dt = (secs * eff) / steps;
    for (let i = 0; i < steps; i++) tick(dt);
    events.length = 0;
    emit("offline", { secs, money: S.money - m0, sold: S.stats.sold - s0 });
  }
  function save() { if (!S) return; S.lastSave = Date.now(); try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {} }
  function load() {
    let raw = null;
    try { raw = localStorage.getItem(SAVE_KEY); } catch (e) {}
    if (!raw) { S = newState(); return false; }
    try {
      const o = JSON.parse(raw), b = newState();
      S = Object.assign(b, o);
      S.stats = Object.assign(b.stats, o.stats || {});
      S.settings = Object.assign(b.settings, o.settings || {});
      if (o.cows && !o.animals) S.animals = { vache: o.cows };
    } catch (e) { S = newState(); return false; }
    carId = Math.max(1, ...S.lot.map((c) => c.id + 1));
    offline();
    bump();
    return true;
  }
  function reset() { try { localStorage.removeItem(SAVE_KEY); } catch (e) {} S = newState(); bump(); }
  function exportSave() { save(); return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); }
  function importSave(str) { try { const o = JSON.parse(decodeURIComponent(escape(atob(str.trim())))); if (!o.lot) return false; localStorage.setItem(SAVE_KEY, JSON.stringify(o)); load(); return true; } catch (e) { return false; } }

  /* ---------------- FORMAT ---------------- */
  const SUF = ["", "k", "M", "Md", "Bn", "Bd", "Tn", "Td", "Qn", "Qd", "Sx", "Sp", "Oc", "No", "Dc"];
  function fmt(n, d = 2) {
    if (n === undefined || n === null || isNaN(n)) return "0";
    if (!isFinite(n)) return "∞";
    if (n < 0) return "-" + fmt(-n, d);
    if (n < 1000) return n < 10 && n % 1 ? n.toFixed(1) : Math.floor(n).toString();
    const e3 = Math.floor(Math.log10(n) / 3);
    if (e3 < SUF.length) { const v = n / Math.pow(10, e3 * 3); return (v < 10 ? v.toFixed(d) : v < 100 ? v.toFixed(1) : Math.floor(v)) + " " + SUF[e3]; }
    return n.toExponential(2).replace("e+", "e");
  }
  const money = (n) => fmt(n) + " €";
  function fmtTime(s) { s = Math.max(0, Math.floor(s)); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h} h ${String(m).padStart(2, "0")}` : m ? `${m} min ${String(x).padStart(2, "0")}` : `${x} s`; }

  const api = {
    get S() { return S; }, get ver() { return ver; }, events, bump, emit,
    tick, load, save, reset, exportSave, importSave, checkAch,
    currentOffer, offerPrice, manualBuy, skipOffer, animalCount, animalTotal, animalCost, animalUnlocked, buyAnimal, animalIncome, animalLeadPct,
    franchiseLvl, franchiseMult, franchiseCost, buyFranchise, negotiate, trend, codexCount, codexMult, museumSlots, museumPiece, museumMult, exhibit, unexhibit, skillReady, useSkill, bid, chalProgress, claimChallenge,
    clickAd, buyAd, adCost, adLps, buyStaff, staffCost, buyUpgrade, nextUpgrades, buyGarage, unlockTier, buyCatalog, setPack,
    customize, customizeCost, matchesCommission, deliverCommission, triggerEvent, prestige, pendingStars, freeStars, buyTalent, tal,
    leadsPerSec, leadsMax, lotCap, convoy, negoMult, clickPower, workPower, sellPower, globalMult, starMult, achMult, milestoneMult, upMult, incomeEstimate,
    salePrice, basePrice, buyPrice, carName, carStyle, carSpec, workUnit, sellUnit, packFor, partsCost, customTotals, catalogTotal,
    fmt, money, fmtTime,
    combosOf, comboMult, accMult, rating, applyAcc, currentMission, missionDone, claimMission, addChest, openChest, visitor, juggleReward, penaltyReward
  };
  return api;
})();
if (typeof module !== "undefined") module.exports = Game;
