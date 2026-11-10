"use strict";
/* =========================================================
   VENDEZ VOTRE CAISSE — Interface
   ========================================================= */
const UI = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const G = Game;
  const fmt = (n) => G.fmt(n), money = (n) => G.money(n);
  let view = "garage", qty = 1;
  let renderedVer = -1, renderedView = null, lastRender = 0, ptrDown = false, lastPtr = 0;
  let selCar = null, draft = null; // atelier perso
  let lineI = 0, lineT = 0, talking = false, mouthT = 0, mouthOpen = false;
  const pointerBusy = () => ptrDown || performance.now() - lastPtr < 500;

  /* ---------------- STRUCTURE ---------------- */
  const VIEWS = [["garage", "🚗", "Parc auto"], ["pubs", "📣", "Publicité"], ["equipe", "👔", "Équipe"], ["concession", "🏢", "Concessions"], ["atelier", "🎨", "Atelier perso"], ["collection", "📚", "Collection"], ["ups", "⬆️", "Améliorations"], ["star", "⭐", "Notoriété"], ["ach", "🏆", "Succès"], ["options", "⚙️", "Options"]];
  function buildNav() {
    $("#nav").innerHTML = VIEWS.map(([k, ic, lb]) => `<button class="nav-btn ${view === k ? "sel" : ""}" data-act="view" data-v="${k}"><span>${ic}</span><b>${lb}</b><i class="badge" id="b-${k}"></i></button>`).join("");
  }
  function setView(v) { view = v; buildNav(); render(true); $("#main").scrollTop = 0; }

  /* ---------------- FRANCK ---------------- */
  let franckMood = "";
  function setFranck(mood) {
    if (mood === franckMood) return;
    franckMood = mood;
    $("#franck").innerHTML = Art.franck(mood);
  }
  function say(text, ms = 4500) {
    const b = $("#bubble");
    b.textContent = text;
    b.classList.add("show");
    clearTimeout(say.t);
    say.t = setTimeout(() => b.classList.remove("show"), ms);
  }
  function franckTick(dt) {
    lineT -= dt;
    if (lineT <= 0) { lineT = 14 + Math.random() * 8; say(LINES[lineI++ % LINES.length]); }
    if (talking) { mouthT -= dt; if (mouthT <= 0) { mouthT = 0.13 + Math.random() * 0.1; mouthOpen = !mouthOpen; setFranck(mouthOpen ? "talk" : "grin"); } }
  }

  /* ---------------- TOASTS / MODALES ---------------- */
  function toast(html, cls = "") {
    const el = document.createElement("div");
    el.className = "toast " + cls; el.innerHTML = html;
    $("#toasts").appendChild(el);
    setTimeout(() => el.classList.add("out"), 3200);
    setTimeout(() => el.remove(), 3800);
    while ($("#toasts").children.length > 5) $("#toasts").firstChild.remove();
  }
  function modal(html) { $("#modal").innerHTML = html; $("#modal-wrap").classList.remove("hidden"); }
  function closeModal() { $("#modal-wrap").classList.add("hidden"); }
  function floatTxt(x, y, txt, cls = "") {
    const el = document.createElement("div");
    el.className = "float " + cls; el.textContent = txt;
    el.style.left = x + "px"; el.style.top = y + "px";
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  /* ---------------- HAUT ---------------- */
  function updateTop() {
    const S = G.S;
    $("#t-money").textContent = money(S.money);
    $("#t-income").textContent = "+" + money(G.incomeEstimate() + G.animalIncome()) + "/s";
    $("#t-leads").textContent = fmt(S.leads) + (S.leads >= G.leadsMax() - 1 ? " (max)" : "");
    $("#t-lps").textContent = "+" + fmt(G.leadsPerSec()) + "/s";
    $("#t-lot").textContent = S.lot.length + "/" + G.lotCap();
    $("#t-stars").textContent = fmt(S.stars);
    $("#ad-gain").textContent = "+" + fmt(G.clickPower()) + " client" + (G.clickPower() >= 2 ? "s" : "");
  }

  /* ---------------- VUE PARC ---------------- */
  const tierBadge = (t) => `<span class="tier t${Math.min(t, 13)}">${esc(tierInfo(t).n)}</span>`;
  function carCard(c) {
    const pct = c.stage === "atelier" ? c.done / c.need : (c.sellDone || 0) / (c.sellNeed || 1);
    return `<div class="car-card ${c.stage}" id="car-${c.id}" data-act="openCar" data-id="${c.id}">
      <div class="cc-art">${Art.car(G.carSpec(c))}</div>
      <div class="cc-b"><b>${esc(G.carName(c))}${c.q > 1 ? ` <small>×${fmt(c.q)}</small>` : ""}</b>${tierBadge(c.t)}${c.unique ? ' <span class="uniq">✨ Pièce unique</span>' : ""}${c.ed ? ' <span class="uniq">💎 Édition limitée</span>' : ""}${c.vice && c.stage === "atelier" ? ' <span class="vice" title="Vice caché : beaucoup plus de travail">⚠️ Vice caché</span>' : ""}${G.trend(G.carStyle(c)) > 1 ? ' <span class="hotb">🔥</span>' : G.trend(G.carStyle(c)) < 1 ? ' <span class="hotb">🥶</span>' : ""}
      <div class="cc-rate">${"★".repeat(G.rating(c))}<span>${"★".repeat(5 - G.rating(c))}</span>${c.acc ? " " + ACCESSORIES.find((a) => a.id === c.acc).icon : ""}${G.combosOf(c).length ? ` <span class="combo-b">🎨 ${esc(G.combosOf(c)[0].n)}</span>` : ""}</div>
      <div class="cc-st"><span>${c.stage === "atelier" ? "🔧 Atelier" : "🏷️ En vitrine"}</span><span class="cc-val">${money(G.salePrice(c))}</span></div>
      <div class="bar"><i style="width:${Math.min(100, pct * 100)}%"></i></div></div></div>`;
  }
  function offerCard() {
    const S = G.S;
    if (S.ups.auto) return `<div class="panel offer auto"><h3>📞 Standard téléphonique</h3><p class="muted">Les rachats sont automatiques : chaque client qui appelle repart sans sa voiture (et avec un chèque).</p></div>`;
    const o = G.currentOffer();
    if (!o) return `<div class="panel offer"><h3>📞 Aucune offre</h3><p class="muted">${S.lot.length >= G.lotCap() ? "Le parking est plein ! Attends qu'une voiture soit vendue ou agrandis ta concession." : "Tourne une pub pour faire venir des vendeurs."}</p></div>`;
    const c = Object.assign({ custom: G.packFor(o.t), color: o.color || (o.color = PAINTS[Math.floor(Math.random() * PAINTS.length)]), stage: "atelier", done: 0, need: 1 }, o);
    const p = G.offerPrice(o) * (o.disc || 1), canPay = S.money >= p || (S.lot.length === 0 && o.t === 0);
    const est = G.salePrice(Object.assign({}, c, { unique: false }));
    return `<div class="panel offer"><h3>📞 Un client veut vendre sa voiture !</h3>
      <div class="offer-row"><div class="offer-art">${Art.car(Object.assign(G.carSpec(c), { rust: o.cond < 0.55 }))}</div>
      <div class="offer-b"><b class="big">${esc(G.carName(o))}${o.q > 1 ? ` ×${fmt(o.q)}` : ""}</b>${tierBadge(o.t)}
        <div class="kv"><span>État</span><span class="cond"><i style="width:${Math.round(o.cond * 100)}%"></i></span><b>${Math.round(o.cond * 100)} %</b></div>
        <div class="kv"><span>Prix de rachat</span><b class="neg">${money(p)}</b></div>
        <div class="kv"><span>Revente estimée</span><b class="pos">${money(est)}</b></div>
        ${o.disc ? `<div class="kv"><span>Négociation</span><b class="${o.disc < 1 ? "pos" : "neg"}">${o.disc < 1 ? "-" + Math.round((1 - o.disc) * 100) + " %" : "+" + Math.round((o.disc - 1) * 100) + " % (client vexé)"}</b></div>` : ""}
        <div class="btns"><button class="btn big primary" data-act="buyCar" ${canPay ? "" : "disabled"}>🤝 Racheter</button>${o.nego ? "" : `<button class="btn" data-act="nego">💬 Négocier</button>`}<button class="btn" data-act="skipOffer">Suivante ➜</button></div>
        <small class="muted">${fmt(S.leads)} client(s) en attente</small></div></div></div>`;
  }
  function commissionCard() {
    const co = G.S.commission;
    if (!co) return "";
    const left = Math.max(0, (co.until - Date.now()) / 1000);
    const req = Object.keys(co.req).map((k) => { const C = CUSTOM.find((x) => x.id === k); return `<span class="req">${C.icon} ${esc(C.opts[co.req[k]])}</span>`; }).join("");
    const ok = G.S.lot.filter((c) => G.matchesCommission(c));
    return `<div class="panel commission"><h3>📜 Commande spéciale : ${esc(co.client)}</h3>
      <p>Veut une voiture <b>${esc(tierInfo(co.t).n)}</b> (ou mieux), couleur <span class="sw" style="background:${co.color}"></span>, avec : ${req}</p>
      <p class="muted">Récompense : <b class="pos">×${co.mult}</b> le prix de vente · expire dans ${G.fmtTime(left)}. Prépare-la dans l'Atelier perso, puis livre-la quand elle est en vitrine.</p>
      ${ok.length ? ok.map((c) => `<button class="btn primary" data-act="deliver" data-id="${c.id}">🚚 Livrer ${esc(G.carName(c))} (${money(G.salePrice(c) * co.mult)})</button>`).join(" ") : `<button class="btn" data-act="prepCom">🎨 Préparer une voiture</button>`}</div>`;
  }
  function penCard() {
    const S = G.S;
    const pen = [];
    for (const an of ANIMALS) for (let i = 0; i < Math.min(G.animalCount(an.id), 4); i++) pen.push(`<div class="cow" title="${esc(an.names[i % an.names.length])}">${Art.animal(an.id, i)}</div>`);
    const btns = ANIMALS.map((an) => {
      if (!G.animalUnlocked(an)) return `<button class="btn animal-btn" disabled>🔒 ??? <small>Un de chaque animal…</small></button>`;
      return `<button class="btn animal-btn" data-act="buyAnimal" data-id="${an.id}" ${S.money < G.animalCost(an) ? "disabled" : ""}>${an.icon} ${esc(an.n)} <b>×${G.animalCount(an.id)}</b><small>${money(G.animalCost(an))} · ${esc(an.what)}</small></button>`;
    }).join("");
    return `<div class="panel cow-panel"><h3>🐄 Le pré de Franck <small>${G.animalTotal()} animaux · +${money(G.animalIncome())}/s · +${Math.round(G.animalLeadPct() * 100)} % de clients</small></h3>
      <p class="muted">Avant les voitures, Franck a commencé par… les animaux. Aucun rapport, mais ça rapporte un peu et ça attire les curieux.</p>
      ${pen.length ? `<div class="cows">${pen.join("")}</div>` : ""}<div class="animal-btns">${btns}</div></div>`;
  }
  function missionCard() {
    const S = G.S, m = G.currentMission(), done = G.missionDone();
    return `<div class="mission ${done ? "done" : ""}"><div class="mi-ep">📺 Épisode ${S.mission + 1}</div><div class="mi-b"><b>${esc(m.n)}</b><small>${esc(m.d)}</small></div>
      ${done ? `<button class="btn primary" data-act="claimMission">🎁 ${CHESTS[m.r].icon} Récupérer</button>` : `<span class="mi-r" title="Récompense">${CHESTS[m.r].icon}</span>`}</div>`;
  }
  function chestBar() {
    const S = G.S;
    const ks = Object.keys(CHESTS).filter((k) => S.chests[k] > 0);
    const accN = Object.values(S.acc).reduce((a, b) => a + b, 0);
    if (!ks.length && !accN) return "";
    return `<div class="chest-bar">${ks.map((k) => `<button class="chest-btn" data-act="openChest" data-id="${k}" style="--c:${CHESTS[k].c}"><span>${CHESTS[k].icon}</span><b>${esc(CHESTS[k].n)}</b><i>×${S.chests[k]}</i></button>`).join("")}${accN ? `<button class="chest-btn acc" data-act="view" data-v="atelier"><span>🎁</span><b>${accN} accessoire${accN > 1 ? "s" : ""}</b><i>à poser</i></button>` : ""}</div>`;
  }
  function marketBanner() {
    const M = G.S.market;
    if (!M) return "";
    return `<div class="market"><b>📈 Tendance du marché</b> <span class="hot">🔥 ${STYLE_NAMES[M.hot[0]]} +${Math.round((M.m[0] - 1) * 100)} %</span><span class="hot">🔥 ${STYLE_NAMES[M.hot[1]]} +${Math.round((M.m[1] - 1) * 100)} %</span><span class="cold">🥶 ${STYLE_NAMES[M.cold]} -25 %</span><small id="mk-left"></small></div>`;
  }
  function auctionCard() {
    const A = G.S.auction;
    if (!A) return "";
    const c = A.car;
    return `<div class="panel auction"><h3>🔨 Vente aux enchères : édition limitée !</h3><div class="offer-row"><div class="offer-art gold">${Art.car(Object.assign(G.carSpec(c), { shine: true }))}</div>
      <div class="offer-b"><b class="big">💎 ${esc(G.carName(c))}</b><span>${tierBadge(c.t)}${c.t > G.S.tierMax ? ' <span class="uniq">Gamme pas encore débloquée !</span>' : ""}</span>
      <div class="kv"><span>Valeur de revente</span><b class="pos">${money(G.salePrice(c))}</b></div>
      <div class="kv"><span>Enchère actuelle</span><b>${money(A.price)}</b></div>
      <div class="kv"><span>Meilleur enchérisseur</span><b class="${A.mine ? "pos" : "neg"}">${A.mine ? "🙋 Toi (Franck)" : esc(A.lead)}</b></div>
      <div class="kv"><span>Fin dans</span><b id="auc-left"></b></div>
      <div class="btns"><button class="btn big primary" data-act="bid" ${A.mine || G.S.money < A.price * 1.12 ? "disabled" : ""}>🔨 Enchérir · ${money(A.price * 1.12)}</button></div>
      <small class="muted">On peut l'exposer au musée (bonus permanent) ou la revendre ×4.</small></div></div></div>`;
  }
  function chalCard() {
    const S = G.S;
    if (!S.chal.length) return "";
    return `<div class="panel chals"><h3>🎯 Défis de Franck</h3><div class="chal-list">${S.chal.map((ch, i) => {
      const C = CHALLENGES.find((x) => x.id === ch.id), p = G.chalProgress(ch), done = p >= ch.target;
      return `<div class="chal ${done ? "done" : ""}"><b>${esc(C.n.replace("{n}", fmt(ch.target)).replace("{m}", money(ch.target)))}</b><div class="bar"><i style="width:${Math.min(100, (100 * p) / ch.target)}%"></i></div><small>${C.money ? money(Math.min(p, ch.target)) : fmt(Math.min(p, ch.target))} / ${C.money ? money(ch.target) : fmt(ch.target)}</small>
        <button class="btn xs ${done ? "primary" : ""}" data-act="claim" data-id="${i}" ${done ? "" : "disabled"}>🎁 ${money(ch.reward)}</button></div>`;
    }).join("")}</div></div>`;
  }
  function renderGarage(root) {
    const S = G.S;
    const lot = S.lot.slice(0, 60).map(carCard).join("") || `<div class="muted empty">Le parking est vide. Rachète ta première voiture !</div>`;
    const early = S.stats.sold < 8 && S.tierMax === 0;
    root.innerHTML = `${missionCard()}${chestBar()}${marketBanner()}${early ? penCard() : ""}<div class="garage-top">${offerCard()}${chalCard()}</div>${auctionCard()}${commissionCard()}
      <div class="panel"><h3>🅿️ ${esc(garageInfo(S.garage).n)} <small>${S.lot.length}/${G.lotCap()} places · 🔧 ${fmt(G.workPower())}/s · 🏷️ ${fmt(G.sellPower())}/s · 🚚 convoi ×${fmt(G.convoy())}</small></h3>
      <div class="lot">${lot}</div></div>${early ? "" : penCard()}`;
  }
  // mise à jour légère des barres sans reconstruire la vue
  function updateLot() {
    for (const c of G.S.lot) {
      const el = document.getElementById("car-" + c.id);
      if (!el) continue;
      const pct = c.stage === "atelier" ? c.done / c.need : (c.sellDone || 0) / (c.sellNeed || 1);
      el.querySelector(".bar i").style.width = Math.min(100, pct * 100) + "%";
      if (!el.classList.contains(c.stage)) { el.className = "car-card " + c.stage; el.querySelector(".cc-st span").textContent = c.stage === "atelier" ? "🔧 Atelier" : "🏷️ En vitrine"; }
    }
  }

  /* ---------------- LISTES D'ACHAT ---------------- */
  function qtyBar() { return `<div class="seg qty">${[1, 10, 100, "max"].map((q) => `<button class="${qty === q ? "sel" : ""}" data-act="qty" data-v="${q}">${q === "max" ? "Max" : "×" + q}</button>`).join("")}</div>`; }
  function bulk(costFn, n0) {
    const S = G.S;
    let n = 0, tot = 0;
    const lim = qty === "max" ? 1000 : qty;
    while (n < lim) { const c = costFn(n0 + n); if (qty === "max" && tot + c > S.money) break; tot += c; n++; }
    return { n: Math.max(qty === "max" ? 0 : n, n), tot };
  }
  function renderPubs(root) {
    const S = G.S;
    const rows = ADS.map((a, i) => {
      const n = S.ads[a.id] || 0;
      if (i > 0 && !(S.ads[ADS[i - 1].id] || 0) && n === 0 && i > 1 && !(S.ads[ADS[i - 2].id] || 0)) return "";
      const b = bulk((k) => G.adCost(a, k), n);
      const next = MILESTONES.find((m) => m > n);
      return `<div class="row"><span class="ic">${a.icon}</span><div class="rb"><b>${esc(a.n)} <small>×${n}</small></b><small>${fmt(a.lps * G.milestoneMult(n) * G.upMult("ads") * G.globalMult())} clients/s chacun${next ? ` · ×2 à ${next}` : ""}</small></div>
        <button class="btn buy" data-act="buyAd" data-id="${a.id}" ${S.money < b.tot || !b.n ? "disabled" : ""}>×${b.n || 1} · ${money(b.tot || G.adCost(a))}</button></div>`;
    }).join("");
    root.innerHTML = `<div class="panel"><h3>📣 Publicité <small>${fmt(G.leadsPerSec())} clients/s</small></h3>${qtyBar()}<p class="muted">Plus on voit Franck, plus les gens ont envie de lui vendre leur voiture. Tous les paliers de 10, 25, 50, 100… doublent la production.</p>${rows}</div>`;
  }
  function renderEquipe(root) {
    const S = G.S;
    const val = { expert: "vices cachés : " + Math.round(Math.max(3, 15 - 2 * (S.staff.expert || 0))) + " %", work: G.workPower(), sell: G.sellPower(), nego: Math.round((1 - G.negoMult()) * 100) + " % de remise", click: fmt(G.clickPower()) + " clients / pub", auto: fmt((S.staff.stagiaire || 0) * 0.5) + " pubs/s" };
    const rows = STAFF.map((s) => {
      const n = S.staff[s.id] || 0;
      const b = bulk((k) => G.staffCost(s, k), n);
      return `<div class="row"><span class="ic">${s.icon}</span><div class="rb"><b>${esc(s.n)} <small>×${n}</small></b><small>${esc(s.d)} · total : ${typeof val[s.stat] === "number" ? fmt(val[s.stat]) + " pts/s" : val[s.stat]}</small></div>
        <button class="btn buy" data-act="buyStaff" data-id="${s.id}" ${S.money < b.tot || !b.n ? "disabled" : ""}>×${b.n || 1} · ${money(b.tot || G.staffCost(s))}</button></div>`;
    }).join("");
    root.innerHTML = `<div class="panel"><h3>👔 Équipe</h3>${qtyBar()}<p class="muted">Les mécaniciens réparent et customisent, les vendeurs vendent. Les grosses voitures demandent beaucoup plus de travail… mais rapportent beaucoup plus.</p>${rows}</div>`;
  }
  function renderConcession(root) {
    const S = G.S;
    const g = garageInfo(S.garage), ng = garageInfo(S.garage + 1);
    const nt = S.tierMax + 1, ntc = tierUnlockCost(nt);
    let tiers = "";
    for (let t = 0; t <= S.tierMax + 1; t++) {
      const T = tierInfo(t), open = t <= S.tierMax;
      tiers += `<div class="tier-row ${open ? "" : "locked"} ${S.focus === t ? "focus" : ""}"><div>${tierBadge(t)} <small>~${money(T.p)}</small></div>
        <div class="brands">${T.brands.map((b) => `<span>${esc(b[0])}</span>`).join("")}</div>
        ${open ? `<button class="btn xs ${S.focus === t ? "primary" : ""}" data-act="focus" data-v="${t}">${S.focus === t ? "🎯 Ciblé" : "Cibler"}</button>` : `<button class="btn primary" data-act="unlockTier" ${S.money < ntc ? "disabled" : ""}>🔓 Contrat · ${money(ntc)}</button>`}</div>`;
    }
    root.innerHTML = `<div class="panel"><h3>🏢 Lieu actuel : ${g.icon} ${esc(g.n)}</h3><p>${g.cap} places · prix de vente ×${g.mult.toFixed(2)}</p>
      <div class="row next"><span class="ic">${ng.icon}</span><div class="rb"><b>${esc(ng.n)}</b><small>${ng.cap} places · prix ×${ng.mult.toFixed(2)}</small></div><button class="btn buy primary" data-act="buyGarage" ${S.money < ng.cost ? "disabled" : ""}>Déménager · ${money(ng.cost)}</button></div></div>
      ${franchisePanel()}
      <div class="panel"><h3>🚘 Marques et gammes</h3><p class="muted">Signe des contrats pour racheter des voitures de plus en plus chères. Par défaut, Franck rachète surtout la meilleure gamme ; tu peux en cibler une.</p>
      <button class="btn xs ${S.focus < 0 ? "primary" : ""}" data-act="focus" data-v="-1">🎲 Automatique</button>${tiers}</div>`;
  }
  function franchisePanel() {
    const S = G.S;
    if (S.stats.seasons < 1) return `<div class="panel locked-panel"><h3>🌍 Franchises Franck</h3><p class="muted">🔒 Disponibles après ta première nouvelle saison (onglet Notoriété). Les franchises restent d'une saison à l'autre.</p></div>`;
    return `<div class="panel"><h3>🌍 Franchises Franck <small>niveau ${G.franchiseLvl()} · +${Math.round((G.franchiseMult() - 1) * 100)} % de revenus · gardées entre les saisons</small></h3>
      <div class="ups">${FRANCHISES.map((f, i) => {
        if (i > 0 && !(S.franchise[FRANCHISES[i - 1].id] || 0)) return "";
        const l = S.franchise[f.id] || 0;
        return `<div class="up"><b>${f.icon} ${esc(f.n)} <small>niv. ${l}</small></b><small>+10 % de revenus et de clients par niveau</small><button class="btn buy" data-act="franchise" data-id="${f.id}" ${S.money < G.franchiseCost(f) ? "disabled" : ""}>${money(G.franchiseCost(f))}</button></div>`;
      }).join("")}</div></div>`;
  }
  function renderUps(root) {
    const S = G.S;
    const list = G.nextUpgrades().slice(0, 8);
    root.innerHTML = `<div class="panel"><h3>⬆️ Améliorations</h3><div class="ups">${list.map((u) => `<div class="up"><b>${esc(u.n)}</b><small>${esc(u.d)}</small><button class="btn buy" data-act="buyUp" data-id="${u.gen ? "gen" : u.id}" ${S.money < u.cost ? "disabled" : ""}>${money(u.cost)}</button></div>`).join("")}</div>
      <p class="muted">Achetées : ${Object.keys(S.ups).length + S.gen}</p></div>`;
  }

  /* ---------------- ATELIER PERSO ---------------- */
  function combosPanel(prev) {
    const on = G.combosOf(prev).map((k) => k.id);
    return `<div class="combos"><b>🎨 Styles signature</b><small class="muted">Des combinaisons précises qui font exploser la cote.</small>${COMBOS.map((k) => `<div class="combo ${on.includes(k.id) ? "on" : ""}"><span>${on.includes(k.id) ? "✅" : "▫️"} <b>${esc(k.n)}</b> <em>+${Math.round(k.v * 100)} %</em></span><small>${esc(k.d)}${k.color ? ` <i class="sw" style="background:${k.color}"></i>` : ""}</small></div>`).join("")}</div>`;
  }
  function accPicker(car) {
    const S = G.S;
    if (car.acc) { const a = ACCESSORIES.find((x) => x.id === car.acc); return `<div class="kv"><span>Accessoire</span><b>${a.icon} ${esc(a.n)} (+${Math.round(a.v * 100)} %)</b></div>`; }
    const owned = ACCESSORIES.filter((a) => S.acc[a.id] > 0);
    if (!owned.length) return `<div class="kv"><span>Accessoire</span><small class="muted">Gagne-en dans les coffres</small></div>`;
    return `<div class="acc-pick"><span>Poser un accessoire :</span>${owned.map((a) => `<button class="btn xs acc-r${a.r}" data-act="applyAcc" data-id="${a.id}" title="${esc(a.n)} · ${ACC_RARITY[a.r]}">${a.icon} ×${S.acc[a.id]} <small>+${Math.round(a.v * 100)}%</small></button>`).join("")}</div>`;
  }
  function renderAtelier(root) {
    const S = G.S;
    if (selCar && !S.lot.find((c) => c.id === selCar)) selCar = null;
    if (!selCar && S.lot.length) selCar = (S.lot.find((c) => c.stage === "vitrine") || S.lot[0]).id;
    const car = S.lot.find((c) => c.id === selCar);
    if (car && (!draft || draft.id !== car.id)) draft = { id: car.id, custom: Object.assign({}, car.custom), color: car.color };
    const picker = S.lot.map((c) => `<button class="pick ${c.id === selCar ? "sel" : ""}" data-act="selCar" data-id="${c.id}">${Art.car(G.carSpec(c))}<small>${esc(G.carName(c))}</small></button>`).join("");
    let editor = `<div class="muted">Aucune voiture au parc.</div>`;
    if (car) {
      const prev = Object.assign({}, car, { custom: draft.custom, color: draft.color, stage: "vitrine" });
      const cats = CUSTOM.map((C) => {
        const max = S.catalog[C.id] || 0;
        return `<div class="cat"><b>${C.icon} ${esc(C.n)}</b><div class="opts">${C.opts.map((o, l) => `<button class="${(draft.custom[C.id] || 0) === l ? "sel" : ""} ${l < (car.custom[C.id] || 0) ? "own" : ""}" data-act="opt" data-k="${C.id}" data-v="${l}" ${l > max ? "disabled" : ""} title="${l > max ? "À débloquer dans le catalogue" : ""}">${esc(o)}${l > max ? " 🔒" : ""}</button>`).join("")}</div></div>`;
      }).join("");
      const { cost, work } = G.customizeCost(car, draft.custom);
      const gain = G.salePrice(Object.assign({}, prev, { unique: true })) - G.salePrice(car);
      const co = S.commission, match = co && G.matchesCommission(Object.assign({}, prev, { stage: "vitrine" }));
      editor = `<div class="atelier-preview"><div class="ap-art">${Art.car(G.carSpec(prev))}</div><b class="big">${esc(G.carName(car))}</b>${tierBadge(car.t)}
        <div class="colors">${PAINTS.map((p) => `<button class="sw ${draft.color === p ? "sel" : ""}" style="background:${p}" data-act="color" data-v="${p}"></button>`).join("")}</div>
        <div class="kv"><span>Coût des pièces</span><b class="neg">${money(cost)}</b></div><div class="kv"><span>Travail en plus</span><b>${fmt(work)} pts</b></div><div class="kv"><span>Plus-value (✨ pièce unique +15 %)</span><b class="pos">+${money(gain)}</b></div>
        ${co ? `<div class="kv"><span>Commande de ${esc(co.client)}</span><b class="${match ? "pos" : "neg"}">${match ? "✅ Conforme" : "❌ Pas conforme"}</b></div>` : ""}
        <div class="kv"><span>Cote</span><b class="stars">${"★".repeat(G.rating(prev))}<span>${"★".repeat(5 - G.rating(prev))}</span></b></div>
        ${accPicker(car)}
        <button class="btn big primary" data-act="applyCustom" ${S.money < cost ? "disabled" : ""}>🔧 Appliquer</button>
        <button class="btn" data-act="exhibit" data-id="${car.id}" ${car.stage !== "vitrine" || S.museum.length >= G.museumSlots() ? "disabled" : ""} title="Une voiture en vitrine peut entrer au musée : bonus permanent, gardé entre les saisons">🏛️ Exposer au musée (${S.museum.length}/${G.museumSlots()})</button></div><div class="cats">${cats}${combosPanel(prev)}</div>`;
    }
    const catalog = CUSTOM.map((C, ci) => {
      const l = S.catalog[C.id] || 0, max = C.opts.length - 1;
      return `<div class="row"><span class="ic">${C.icon}</span><div class="rb"><b>${esc(C.n)} <small>${l}/${max}</small></b><small>${l < max ? "Prochain : " + esc(C.opts[l + 1]) + ` (+${Math.round((customValue(l + 1) - customValue(l)) * 100)} % de valeur)` : "Catalogue complet"}</small></div>
        <select data-act="pack" data-k="${C.id}" title="Pack automatique sur chaque voiture rachetée">${C.opts.slice(0, l + 1).map((o, k) => `<option value="${k}" ${(S.pack[C.id] || 0) === k ? "selected" : ""}>Auto : ${esc(o)}</option>`).join("")}</select>
        ${l < max ? `<button class="btn buy" data-act="catalog" data-id="${C.id}" ${S.money < catalogCost(ci, l + 1) ? "disabled" : ""}>🔓 ${money(catalogCost(ci, l + 1))}</button>` : ""}</div>`;
    }).join("");
    root.innerHTML = `<div class="panel"><h3>🎨 Atelier perso de Franck</h3><p class="muted">Choisis une voiture du parc et personnalise-la toi-même : chaque voiture retouchée devient une ✨ pièce unique (+15 %). Les commandes spéciales se préparent ici.</p>
      <div class="picker">${picker}</div><div class="atelier">${editor}</div></div>
      <div class="panel"><h3>📒 Catalogue de pièces et pack automatique</h3><p class="muted">Débloque des options, puis choisis le pack appliqué automatiquement à chaque voiture rachetée. Les pièces coûtent un pourcentage du prix de la voiture et ajoutent du travail à l'atelier.</p>${catalog}</div>`;
  }

  /* ---------------- COLLECTION + MUSÉE ---------------- */
  function renderCollection(root) {
    const S = G.S;
    const museum = S.museum.map((c, i) => `<div class="mus"><div class="cc-art gold">${Art.car(Object.assign(G.carSpec(c), { shine: c.ed }))}</div><b>${esc(G.carName(c))}</b><small>+${(G.museumPiece(c) * 100).toFixed(1)} % de revenus</small><button class="btn xs" data-act="unexhibit" data-id="${i}">Retirer</button></div>`).join("");
    const empty = Array.from({ length: Math.max(0, G.museumSlots() - S.museum.length) }, () => `<div class="mus empty-slot">🏛️<small>Place libre</small></div>`).join("");
    let codex = "";
    for (let t = 0; t <= Math.max(S.tierMax, 1) && t < TIERS.length + 3; t++) {
      const T = tierInfo(t);
      codex += `<div class="cx-tier"><div>${tierBadge(t)}</div><div class="cx-brands">${T.brands.map((br, b) => `<div class="cx-brand ${[0, 1, 2].every((m) => S.codex[t + ":" + b + ":" + m] !== undefined) ? "full" : ""}"><b>${esc(br[0])}</b><div class="cx-models">${br[1].map((md, m) => {
        const k = t + ":" + b + ":" + m, got = S.codex[k] !== undefined;
        return `<div class="cx-m ${got ? "got" : ""}" title="${got ? esc(md[0]) + " · " + fmt(S.codex[k]) + " vendue(s)" : "???"}">${Art.car({ style: md[1], color: got ? PAINTS[(t + b + m) % PAINTS.length] : "#1d2440", tint: !got })}<small>${got ? esc(md[0]) : "???"}</small></div>`;
      }).join("")}</div></div>`).join("")}</div></div>`;
    }
    root.innerHTML = `<div class="panel"><h3>🏛️ Musée Franck <small>${S.museum.length}/${G.museumSlots()} · +${((G.museumMult() - 1) * 100).toFixed(1)} % de revenus (gardé entre les saisons)</small></h3>
      <p class="muted">Expose tes plus belles voitures depuis l'Atelier perso (une fois en vitrine). Les pièces uniques et les éditions limitées gagnées aux enchères rapportent beaucoup plus. Plus de places en déménageant.</p><div class="museum">${museum}${empty}</div></div>
      <div class="panel"><h3>📚 Collection de modèles <small>${G.codexCount()} modèles · +${((G.codexMult() - 1) * 100).toFixed(1)} % de revenus</small></h3>
      <p class="muted">Chaque modèle vendu au moins une fois entre dans la collection (+0,5 %). Une marque complète (3 modèles) donne +2 % de plus. La collection est gardée entre les saisons.</p>${codex}</div>`;
  }

  /* ---------------- NOTORIÉTÉ ---------------- */
  function renderStar(root) {
    const S = G.S, p = G.pendingStars();
    const talents = TALENTS.map((t) => {
      const l = G.tal(t.id), c = t.cost * (l + 1);
      return `<div class="up"><b>${esc(t.n)} <small>${l}/${t.max}</small></b><small>${esc(t.d)}</small>${l < t.max ? `<button class="btn buy" data-act="talent" data-id="${t.id}" ${G.freeStars() < c ? "disabled" : ""}>⭐ ${c}</button>` : `<b class="pos">MAX</b>`}</div>`;
    }).join("");
    root.innerHTML = `<div class="panel star"><h3>⭐ Notoriété</h3><p>Étoiles : <b>${fmt(S.stars)}</b> (+${fmt((G.starMult() - 1) * 100)} % sur tout) · Saisons : ${S.stats.seasons}</p>
      <p class="muted">Lancer une <b>nouvelle saison de pubs</b> remet à zéro l'argent, le parc, la pub, l'équipe et les améliorations, mais rapporte des étoiles selon tout l'argent gagné depuis le début. Chaque étoile donne +5 % de revenus, et sert à acheter des talents.</p>
      <button class="btn big primary" data-act="prestige" ${p < 1 ? "disabled" : ""}>🎬 Nouvelle saison : +${fmt(p)} ⭐</button>
      <small class="muted">${p < 1 ? "Gagne encore un peu d'argent pour obtenir ta première étoile." : ""}</small></div>
      <div class="panel"><h3>🎓 Talents de Franck <small>${fmt(G.freeStars())} ⭐ disponibles</small></h3><div class="ups">${talents}</div></div>`;
  }
  function renderAch(root) {
    const S = G.S, n = Object.keys(S.ach).length;
    root.innerHTML = `<div class="panel"><h3>🏆 Succès <small>${n}/${ACHIEVEMENTS.length} · +${Math.round(n * ACH_BONUS * 100)} % de revenus</small></h3><div class="ach">${ACHIEVEMENTS.map((a) => `<div class="a ${S.ach[a.id] ? "on" : ""}">${S.ach[a.id] ? "🏆" : "🔒"} ${esc(a.n)}</div>`).join("")}</div>
      <h3>📊 Statistiques</h3><div class="stats"><span>Voitures vendues</span><b>${fmt(S.stats.sold)}</b><span>Voitures rachetées</span><b>${fmt(S.stats.bought)}</b><span>Pubs tournées</span><b>${fmt(S.clicks)}</b><span>Argent gagné (total)</span><b>${money(S.earnedTotal)}</b><span>Meilleure vente</span><b>${money(S.stats.bestSale)}</b><span>Commandes livrées</span><b>${S.stats.commissions}</b><span>Animaux</span><b>${G.animalTotal()}</b><span>Modèles collectionnés</span><b>${G.codexCount()}</b><span>Enchères gagnées</span><b>${S.stats.auctions}</b><span>Défis réussis</span><b>${S.stats.chals}</b><span>Temps de jeu</span><b>${G.fmtTime(S.stats.play)}</b></div></div>`;
  }
  function renderOptions(root) {
    const S = G.S;
    root.innerHTML = `<div class="panel opt"><h3>⚙️ Options</h3>
      <label class="row"><span>🔊 Son</span><input type="checkbox" data-act="sound" ${S.settings.sound ? "checked" : ""}></label>
      <label class="row"><span>Volume</span><input type="range" min="0" max="1" step="0.05" value="${S.settings.volume}" data-act="volume"></label>
      <div class="row"><span>📲 Installer le jeu <small class="muted">(icône sur l'écran d'accueil, plein écran, hors ligne)</small></span><button class="btn primary" data-act="install">Installer</button></div>
      <div class="row"><span>⛶ Plein écran</span><button class="btn" data-act="fullscreen">Activer / quitter</button></div>
      <label class="row"><span>✨ Effets spéciaux</span><input type="checkbox" data-act="fx" ${S.settings.fx !== false ? "checked" : ""}></label>
      <div class="row"><span>Réécouter Franck</span><button class="btn" data-act="replay">▶ Clip complet</button> <button class="btn" data-act="salut">▶ Gimmick</button></div>
      <div class="row"><span>Sauvegarde</span><button class="btn" data-act="saveNow">💾 Sauver</button> <button class="btn" data-act="export">Exporter</button> <button class="btn" data-act="import">Importer</button></div>
      <textarea id="save-box" placeholder="Colle ou copie ta sauvegarde ici"></textarea>
      <div class="row danger"><span>Tout effacer</span><button class="btn danger" data-act="reset">🗑️ Réinitialiser</button></div>
      <p class="disclaimer">Jeu parodique de fan, non officiel, sans lien avec une marque ou une personne réelle. Toutes les marques de voitures sont inventées.</p></div>`;
  }

  /* ---------------- RENDU ---------------- */
  const R = { collection: renderCollection, garage: renderGarage, pubs: renderPubs, equipe: renderEquipe, concession: renderConcession, atelier: renderAtelier, ups: renderUps, star: renderStar, ach: renderAch, options: renderOptions };
  function render(force) {
    const now = performance.now();
    if (force || renderedView !== view || (renderedVer !== G.ver && now - lastRender > 700 && !pointerBusy()) || (now - lastRender > 2500 && !pointerBusy() && view !== "atelier")) {
      const root = $("#main"), sc = root.scrollTop;
      R[view](root);
      if (renderedView === view) root.scrollTop = sc;
      renderedView = view; renderedVer = G.ver; lastRender = now;
    }
    // badges
    const S = G.S;
    const bg = $("#b-garage"); if (bg) bg.textContent = G.missionDone() || Object.values(S.chests).some((n) => n > 0) ? "!" : "";
    const bc = $("#b-star"); if (bc) bc.textContent = G.pendingStars() >= 1 ? "!" : "";
    const bu = $("#b-ups"); if (bu) bu.textContent = G.nextUpgrades().some((u) => u.cost <= S.money) ? "•" : "";
  }
  let last = performance.now();
  function frame() {
    const now = performance.now(), dt = (now - last) / 1000; last = now;
    if (!G.S) return;
    updateTop();
    franckTick(dt);
    render(false);
    if (view === "garage") { updateLot(); liveTimers(); }
    renderSkills();
    eventTick(dt);
    visitorTick(dt);
  }

  /* ---------------- ÉVÈNEMENTS DU JEU ---------------- */
  function processEvents() {
    const evs = G.events.splice(0, G.events.length);
    let sales = 0, saleGain = 0;
    for (const ev of evs) {
      if (ev.type === "sale") {
        sales++; saleGain += ev.gain;
        if (sales <= 4) saleFx(ev);
        if (ev.big) { toast(`🚚 Commande livrée ! <b>+${money(ev.gain)}</b>`, "good"); coinRain(); jackpot("COMMANDE<br>LIVRÉE !"); moodFx("cash", 2500); }
        else if (ev.gain > G.incomeEstimate() * 25 && G.S.stats.sold > 20) { jackpot("JACKPOT !"); shake(); moodFx("cash", 2000); }
      }
      else if (ev.type === "toast") {
        if (ev.k === "ach") toast(`🏆 ${esc(ev.n)}`, "ach");
        else if (ev.k === "garage") toast(`🏢 Nouveau lieu : ${esc(ev.n)}`, "good");
        else if (ev.k === "franchise") toast(`🌍 Nouvelle franchise : ${esc(ev.n)}`, "ach");
        else if (ev.k === "tier") toast(`🔓 Nouvelle gamme : ${esc(ev.n)}`, "good");
        else if (ev.k === "commission") toast(`📜 Nouvelle commande spéciale !`, "info");
        else if (ev.k === "auction") { toast(`🔨 Une vente aux enchères commence !`, "info"); say("Une voiture de collection aux enchères !", 3500); }
      } else if (ev.type === "event") {
        toast(`🎉 <b>${esc(ev.ev.n)}</b> — ${esc(ev.ev.d)}${ev.gain ? " (+" + money(ev.gain) + ")" : ""}`, "good");
        say(ev.ev.n);
      } else if (ev.type === "animal") { toast(`${ev.an.icon} ${esc(ev.n)} rejoint le pré. ${esc(ev.an.line)}`, "info"); say(ev.an.line, 3000); }
      else if (ev.type === "codex") toast(`📚 Nouveau modèle en collection : ${esc(ev.name)}`, "info");
      else if (ev.type === "market") toast(`📈 Le marché change ! Regarde les tendances.`, "info");
      else if (ev.type === "skill") { say(ev.sk.n + " !", 2500); }
      else if (ev.type === "liquid") toast(`🏷️ Liquidation : ${fmt(ev.n)} voitures, +${money(ev.gain)}`, "good");
      else if (ev.type === "museum") toast(`🏛️ ${esc(ev.name)} entre au musée`, "ach");
      else if (ev.type === "auctionWon") { coinRain(); jackpot("ADJUGÉ !"); moodFx("cash", 2500); toast(`🔨 Adjugé ! ${esc(ev.name)} pour ${money(ev.price)}`, "ach"); Sound.salut(); }
      else if (ev.type === "auctionLost") toast(`🔨 Enchère perdue face à ${esc(ev.who)}`, "bad");
      else if (ev.type === "mission") { coinRain(18); moodFx("wink", 2000); toast(`📺 Épisode terminé : <b>${esc(ev.m.n)}</b> · +${money(ev.cash)} · ${CHESTS[ev.m.r].icon} ${esc(CHESTS[ev.m.r].n)}`, "ach"); say("Épisode terminé ! On tourne le suivant !", 3000); }
      else if (ev.type === "acc") toast(`${ev.a.icon} ${esc(ev.a.n)} posé ! +${Math.round(ev.a.v * 100)} %`, "good");
      else if (ev.type === "klaxon") Sound.salut();
      else if (ev.type === "chal") toast(`🎯 Défi réussi ! +${money(ev.reward)}`, "good");
      else if (ev.type === "offline") modal(`<h2>Franck a bossé pendant ton absence</h2><p>${G.fmtTime(ev.secs)} hors ligne : <b>${money(ev.money)}</b> gagnés et <b>${fmt(ev.sold)}</b> voitures vendues.</p><button class="btn primary" data-act="closeModal">Super !</button>`);
      else if (ev.type === "prestige") { coinRain(40); jackpot("NOUVELLE<br>SAISON !"); toast(`🎬 Nouvelle saison ! +${fmt(ev.p)} ⭐`, "ach"); }
    }
    if (sales && view === "garage") { const el = $("#t-money"); if (el) { const r = el.getBoundingClientRect(); floatTxt(r.left + 20, r.bottom, "+" + money(saleGain), "money"); } }
  }

  /* ---------------- FRANCK SURPRISE (évènement cliquable) ---------------- */
  let evT = 60;
  function eventTick(dt) {
    evT -= dt * (G.tal("t_event") ? 1.5 : 1);
    if (evT > 0) return;
    evT = 80 + Math.random() * 100;
    const el = document.createElement("button");
    el.className = "surprise";
    el.innerHTML = Art.franck("wink", { bg: false });
    el.style.left = 10 + Math.random() * 75 + "vw";
    el.style.top = 15 + Math.random() * 60 + "vh";
    el.onclick = () => { G.triggerEvent(); Sound.salut(); el.remove(); };
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 12000);
  }

  /* ---------------- EFFETS SPÉCIAUX ---------------- */
  function burst(x, y, chars = ["💶", "🪙", "✨"], n = 10, spread = 140) {
    if (!G.S.settings.fx && G.S.settings.fx !== undefined) return;
    for (let i = 0; i < n; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.textContent = chars[i % chars.length];
      const a = Math.random() * Math.PI * 2, r = spread * (0.4 + Math.random() * 0.6);
      p.style.left = x + "px"; p.style.top = y + "px";
      p.style.setProperty("--dx", Math.cos(a) * r + "px");
      p.style.setProperty("--dy", Math.sin(a) * r - 60 + "px");
      p.style.setProperty("--rot", (Math.random() * 720 - 360) + "deg");
      p.style.animationDelay = Math.random() * 0.12 + "s";
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1400);
    }
  }
  function coinRain(n = 26) {
    for (let i = 0; i < n; i++) {
      const p = document.createElement("div");
      p.className = "rain";
      p.textContent = ["💶", "🪙", "💰", "⭐"][i % 4];
      p.style.left = Math.random() * 100 + "vw";
      p.style.animationDuration = 1.2 + Math.random() * 1.2 + "s";
      p.style.animationDelay = Math.random() * 0.8 + "s";
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3400);
    }
  }
  function shake() { const el = document.getElementById("app"); if (!el) return; el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); }
  function jackpot(txt) {
    const el = document.createElement("div");
    el.className = "jackpot"; el.innerHTML = txt;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }
  function moodFx(mood, ms = 1500) {
    if (talking) return;
    setFranck(mood);
    clearTimeout(moodFx.t);
    moodFx.t = setTimeout(() => { if (!talking) setFranck("grin"); }, ms);
  }
  // voiture vendue : tampon « VENDU ! » + pièces qui jaillissent
  function saleFx(ev) {
    const card = document.getElementById("car-" + ev.id);
    if (card && view === "garage") {
      const r = card.getBoundingClientRect();
      const ghost = card.cloneNode(true);
      ghost.removeAttribute("id"); ghost.classList.add("sold-ghost");
      ghost.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`;
      ghost.insertAdjacentHTML("beforeend", '<div class="stamp">VENDU !</div>');
      document.body.appendChild(ghost);
      setTimeout(() => ghost.remove(), 1200);
      burst(r.left + r.width / 2, r.top + r.height / 3, ["💶", "🪙", "✨"], 8, 110);
    }
  }

  /* ---------------- OUVERTURE DE COFFRE ---------------- */
  function openChestFx(k) {
    const C = CHESTS[k];
    modal(`<div class="chest-open"><div class="chest-big shake" style="--c:${C.c}">${C.icon}</div><h2>${esc(C.n)}</h2><p class="muted">Franck secoue le coffre…</p></div>`);
    Sound.salut();
    setTimeout(() => {
      const out = G.openChest(k);
      if (!out) { closeModal(); return; }
      const lines = out.map((o) => o.t === "cash" ? `<li>💰 <b>+${money(o.v)}</b></li>` : o.t === "acc" ? `<li class="acc-r${o.a.r}">${o.a.icon} <b>${esc(o.a.n)}</b> <small>${ACC_RARITY[o.a.r]} · +${Math.round(o.a.v * 100)} % sur une voiture</small></li>` : o.t === "boost" ? `<li>⚡ Boost <b>${({ leads: "clients", work: "atelier", sell: "ventes", price: "prix" })[o.k]} ×${o.v}</b></li>` : o.t === "skills" ? `<li>🔄 Coups de Franck rechargés</li>` : o.t === "animal" ? `<li>${o.an.icon} Un animal en cadeau : <b>${esc(o.an.n)}</b></li>` : `<li>⭐ <b>+1 étoile</b></li>`).join("");
      $("#modal").innerHTML = `<div class="chest-open"><div class="chest-big pop" style="--c:${C.c}">${C.icon}</div><h2>${esc(C.n)}</h2><ul class="loot">${lines}</ul><button class="btn primary" data-act="closeModal">Génial !</button></div>`;
      const an = out.find((o) => o.t === "animal"); if (an) Sound.animal(an.an.line);
      const rb = document.querySelector(".chest-big"); if (rb) { const q = rb.getBoundingClientRect(); burst(q.left + q.width / 2, q.top + q.height / 2, k === "valise" ? ["⭐", "🏆", "💶", "✨"] : ["💶", "🪙", "✨"], k === "valise" ? 24 : 14, 180); }
      if (k === "valise") { coinRain(30); moodFx("wow", 2500); }
      render(true);
    }, 1100);
  }

  /* ---------------- VISITEURS FARFELUS ---------------- */
  let visT = 45;
  function visitorTick(dt) {
    visT -= dt;
    if (visT > 0 || document.querySelector(".visitor")) return;
    visT = 60 + Math.random() * 70;
    const tot = VISITORS.reduce((a, v) => a + v.w, 0);
    let x = Math.random() * tot, V = VISITORS[0];
    for (const v of VISITORS) { if ((x -= v.w) <= 0) { V = v; break; } }
    const el = document.createElement("button");
    el.className = "visitor";
    el.dataset.act = "visitor"; el.dataset.id = V.id;
    el.innerHTML = `<span class="v-ic">${V.icon}</span><span class="v-tag">${esc(V.n)}</span>`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 16000);
  }
  function clickVisitor(el) {
    const V = VISITORS.find((v) => v.id === el.dataset.id);
    el.remove();
    say(V.line, 4000);
    Sound.say(V.line);
    if (V.id === "foot") { openJuggle(); return; }
    if (V.id === "keeper") { openPenalty(); return; }
    const r = G.visitor(V.id);
    toast(`${V.icon} <b>${esc(V.n)}</b> — ${r.gain ? `achète ${esc(r.name || "une voiture")} : +${money(r.gain)}` : r.chest ? "t'offre une Boîte à gants 🧤" : r.boost ? "clients ×10 pendant 30 s" : r.fixed !== undefined ? `${r.fixed} voiture(s) réparée(s) d'un coup` : ""}`, "good");
    render(true);
  }

  /* ---------------- DÉFI DE JONGLES (footballeur) ---------------- */
  let jg = null;
  function openJuggle() {
    modal(`<h2>⚽ Défi de jongles</h2><p class="muted">Le footballeur te défie ! Tape le ballon pour le garder en l'air. 5 jongles = Boîte à gants, 10 = Coffre, 25 = Valise du Ballon d'Or.</p>
      <div class="juggle" id="juggle"><div class="j-count" id="j-count">0</div><button class="j-ball" id="j-ball">⚽</button><div class="j-ground"></div><div class="j-franck">${Art.franck("wow", { bg: false })}</div></div>`);
    jg = { x: 0.5, y: 0.35, vx: 0, vy: 0, n: 0, started: false, over: false, last: performance.now() };
    requestAnimationFrame(juggleStep);
  }
  function juggleStep() {
    if (!jg || jg.over) return;
    const now = performance.now(), dt = Math.min(0.033, (now - jg.last) / 1000); jg.last = now;
    if (jg.started) {
      jg.vy += 1.9 * dt * (1 + jg.n * 0.03); jg.x += jg.vx * dt; jg.y += jg.vy * dt;
      if (jg.x < 0.08 || jg.x > 0.92) { jg.vx *= -1; jg.x = Math.max(0.08, Math.min(0.92, jg.x)); }
      if (jg.y > 0.86) { endJuggle(); return; }
    }
    const b = document.getElementById("j-ball");
    if (!b) { jg = null; return; }
    b.style.left = jg.x * 100 + "%"; b.style.top = jg.y * 100 + "%";
    b.style.transform = `translate(-50%,-50%) rotate(${jg.x * 720}deg)`;
    requestAnimationFrame(juggleStep);
  }
  function kickBall(e) {
    if (!jg || jg.over) return;
    jg.started = true;
    jg.vy = -1.15 - Math.random() * 0.25;
    jg.vx = (Math.random() - 0.5) * 0.6;
    jg.n++;
    const c = document.getElementById("j-count"); if (c) { c.textContent = jg.n; c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); }
  }
  function endJuggle() {
    const n = jg.n; jg.over = true;
    const r = G.juggleReward(n);
    const box = document.getElementById("juggle");
    if (box) box.insertAdjacentHTML("beforeend", `<div class="j-end"><b>${n} jongle${n > 1 ? "s" : ""} !</b><span>+${money(r.gain)}${r.chest ? " · " + CHESTS[r.chest].icon + " " + esc(CHESTS[r.chest].n) : ""}</span><button class="btn primary" data-act="closeModal">${n >= 10 ? "Ballon d'Or !" : "Bien joué"}</button></div>`);
    if (n >= 5) Sound.salut();
    jg = null;
    render(true);
  }

  /* ---------------- TIRS AU BUT (gardien) ---------------- */
  let pk = null;
  function openPenalty() {
    modal(`<h2>🥅 Tirs au but</h2><p class="muted">5 tirs. Le gardien plonge au hasard : vise un côté libre ! 1 but = Boîte à gants, 3 = Coffre, 5 = Valise.</p>
      <div class="penalty"><div class="goal"><div class="keeper" id="pk-keeper">🧤<span>🧍</span></div><div class="pk-ball" id="pk-ball">⚽</div></div>
      <div class="pk-score" id="pk-score">⚽ 0 / 5</div><div class="btns pk-btns"><button class="btn big" data-act="shoot" data-v="0">⬅️ Gauche</button><button class="btn big" data-act="shoot" data-v="1">⬆️ Centre</button><button class="btn big" data-act="shoot" data-v="2">➡️ Droite</button></div></div>`);
    pk = { shot: 0, goals: 0, busy: false };
  }
  function shoot(zone) {
    if (!pk || pk.busy) return;
    pk.busy = true;
    const dive = Math.floor(Math.random() * 3);
    const goal = dive !== zone;
    const kp = document.getElementById("pk-keeper"), b = document.getElementById("pk-ball");
    kp.style.left = [18, 50, 82][dive] + "%"; kp.classList.add("dive");
    b.style.left = [18, 50, 82][zone] + "%"; b.style.top = "22%"; b.style.transform = "translate(-50%,-50%) scale(.6) rotate(540deg)";
    pk.shot++; if (goal) pk.goals++;
    setTimeout(() => {
      const box = document.querySelector(".goal");
      if (box) { const r = box.getBoundingClientRect(); burst(r.left + r.width * [0.18, 0.5, 0.82][zone], r.top + r.height * 0.25, goal ? ["⚽", "🎉", "✨"] : ["🧤", "💨"], goal ? 12 : 5, 90); }
      if (goal) Sound.salut();
      const sc = document.getElementById("pk-score"); if (sc) sc.innerHTML = `${goal ? "<b class='pos'>BUT !</b>" : "<b class='neg'>Arrêté !</b>"} · ⚽ ${pk.goals} / ${pk.shot}`;
      setTimeout(() => {
        if (!pk) return;
        if (kp) { kp.style.left = "50%"; kp.classList.remove("dive"); }
        if (b) { b.style.left = "50%"; b.style.top = "84%"; b.style.transform = "translate(-50%,-50%)"; }
        pk.busy = false;
        if (pk.shot >= 5) {
          const r = G.penaltyReward(pk.goals), g = pk.goals; pk = null;
          const pen = document.querySelector(".penalty");
          if (pen) pen.insertAdjacentHTML("beforeend", `<div class="j-end"><b>${g} / 5</b><span>+${money(r.gain)}${r.chest ? " · " + CHESTS[r.chest].icon + " " + esc(CHESTS[r.chest].n) : ""}</span><button class="btn primary" data-act="closeModal">${g >= 4 ? "Ballon d'Or !" : "OK"}</button></div>`);
          if (g >= 4) coinRain();
          render(true);
        }
      }, 900);
    }, 450);
  }

  /* ---------------- INSTALLATION (PWA) ---------------- */
  let installEvt = null;
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvt = e; });
  window.addEventListener("appinstalled", () => { installEvt = null; toast("📲 Jeu installé ! Lance-le depuis ton écran d'accueil.", "good"); });
  function installGame() {
    if (isStandalone()) { toast("✅ Le jeu est déjà installé et lancé comme une appli.", "good"); return; }
    if (installEvt) { installEvt.prompt(); installEvt.userChoice.finally(() => (installEvt = null)); return; }
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    modal(`<h2>📲 Installer le jeu</h2>${ios ? `<ol class="steps"><li>Ouvre le jeu dans <b>Safari</b>.</li><li>Touche le bouton <b>Partager</b> (carré avec une flèche).</li><li>Choisis <b>Sur l'écran d'accueil</b>, puis <b>Ajouter</b>.</li></ol>` : `<ol class="steps"><li>Ouvre le menu du navigateur (<b>⋮</b> ou <b>…</b>).</li><li>Choisis <b>Installer l'application</b> ou <b>Ajouter à l'écran d'accueil</b>.</li></ol>`}
      <p class="muted">Une fois installé, le jeu se lance en plein écran depuis son icône et marche même sans connexion. Ta sauvegarde reste sur l'appareil.</p><button class="btn primary" data-act="closeModal">Compris</button>`);
  }

  /* ---------------- NÉGOCIATION (mini-jeu) ---------------- */
  let nego = null;
  function openNego() {
    if (!G.currentOffer()) return;
    nego = { x: 0, dir: 1, speed: 1.1 + Math.random() * 0.6, t0: performance.now() };
    modal(`<h2>💬 Négociation</h2><p>Arrête le curseur dans la zone verte pour faire baisser le prix. Rate-le et le client se vexe…</p>
      <div class="nego-bar"><i class="z red"></i><i class="z yel"></i><i class="z grn"></i><i class="z yel2"></i><i class="z red2"></i><span id="nego-cur"></span></div>
      <div class="btns"><button class="btn big primary" data-act="negoStop">✋ Tope là !</button></div>`);
    const step = () => {
      if (!nego) return;
      const now = performance.now(), dt = (now - (nego.last || now)) / 1000; nego.last = now;
      nego.x += nego.dir * nego.speed * dt;
      if (nego.x > 1) { nego.x = 1; nego.dir = -1; } if (nego.x < 0) { nego.x = 0; nego.dir = 1; }
      const c = document.getElementById("nego-cur"); if (c) c.style.left = nego.x * 100 + "%";
      if (performance.now() - nego.t0 > 8000) { stopNego(0); return; }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function stopNego(forced) {
    if (!nego) return;
    const q = forced === 0 ? 0 : 1 - Math.abs(nego.x - 0.5) * 2;
    nego = null;
    const r = G.negotiate(q);
    closeModal();
    if (!r) return;
    const msg = { top: "Affaire du siècle ! -40 %", good: "Belle négo ! -22 %", ok: "Petit geste : -8 %", bad: "Le client est vexé : +15 %" }[r.k];
    toast(`💬 ${msg}`, r.disc < 1 ? "good" : "bad");
    say(r.disc < 1 ? "Allez, on se serre la main et c'est réglé !" : "Bon… d'accord, d'accord, je monte un peu.", 3000);
    render(true);
  }

  /* ---------------- COUPS DE FRANCK ---------------- */
  function renderSkills() {
    const S = G.S, el = $("#skills");
    if (!el) return;
    const key = SKILLS.map((sk) => (sk.unlock(S) ? 1 : 0) + ":" + Math.ceil(G.skillReady(sk))).join(",");
    if (el.dataset.k === key) return;
    el.dataset.k = key;
    el.innerHTML = SKILLS.map((sk) => {
      const open = sk.unlock(S), cd = G.skillReady(sk);
      return `<button class="skill ${cd > 0 ? "cd" : ""}" data-act="skill" data-id="${sk.id}" ${!open || cd > 0 ? "disabled" : ""} title="${esc(sk.n)} — ${esc(open ? sk.d : "Débloqué par : " + sk.req)}"><span>${open ? sk.icon : "🔒"}</span>${cd > 0 ? `<i>${Math.ceil(cd)}</i>` : ""}</button>`;
    }).join("");
  }
  function liveTimers() {
    const S = G.S;
    const al = $("#auc-left"); if (al && S.auction) al.textContent = G.fmtTime((S.auction.ends - Date.now()) / 1000);
    const ml = $("#mk-left"); if (ml && S.market) ml.textContent = "change dans " + G.fmtTime((S.market.until - Date.now()) / 1000);
  }

  /* ---------------- ACTIONS ---------------- */
  const buyN = () => (qty === "max" ? 1000 : qty);
  function onClick(e) {
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const act = el.dataset.act, id = el.dataset.id, v = el.dataset.v;
    if (el.tagName === "INPUT" || el.tagName === "SELECT") return;
    const S = G.S;
    let bought = false;
    switch (act) {
      case "view": setView(v); return;
      case "closeModal": closeModal(); return;
      case "start": startGame(); return;
      case "startFs": toggleFullscreen(true); startGame(); return;
      case "fullscreen": toggleFullscreen(); return;
      case "ad": {
        G.clickAd();
        const r = el.getBoundingClientRect();
        floatTxt(r.left + r.width / 2 + (Math.random() * 60 - 30), r.top, "+" + fmt(G.clickPower()), "lead");
        burst(r.left + r.width / 2, r.top + r.height / 2, ["📣", "📞", "✨"], 4, 70);
        if (Math.random() < 0.15) moodFx("talk", 300);
        el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse");
        if (Math.random() < 0.08) say(LINES[Math.floor(Math.random() * LINES.length)], 3000);
        break;
      }
      case "buyCar": { bought = G.manualBuy(); if (bought) { const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, ["🤝", "🚗", "✨"], 6, 90); } break; }
      case "skipOffer": G.skipOffer(); break;
      case "buyAnimal": { const an = ANIMALS.find((x) => x.id === id); if (G.buyAnimal(id)) { Sound.animal(an.line); const r = el.getBoundingClientRect(); burst(r.left + r.width / 2, r.top, [an.icon, "❤️", "✨"], 8, 100); jackpot(esc(an.line)); moodFx("wow", 2600); } break; }
      case "nego": openNego(); return;
      case "negoStop": stopNego(); return;
      case "skill": if (G.useSkill(id)) Sound.salut(); break;
      case "bid": bought = G.bid(); break;
      case "claim": if (G.claimChallenge(+id)) Sound.salut(); break;
      case "exhibit": bought = G.exhibit(+id); if (bought) { selCar = null; draft = null; } break;
      case "unexhibit": G.unexhibit(+id); break;
      case "claimMission": if (G.claimMission()) Sound.salut(); break;
      case "openChest": openChestFx(id); return;
      case "applyAcc": if (selCar) bought = G.applyAcc(selCar, id); break;
      case "visitor": clickVisitor(el); return;
      case "juggleKick": kickBall(e); return;
      case "shoot": shoot(+v); return;
      case "install": installGame(); return;
      case "fxToggle": break;
      case "franchise": bought = G.buyFranchise(id); break;
      case "qty": qty = v === "max" ? "max" : +v; break;
      case "buyAd": bought = G.buyAd(id, buyN()) > 0; break;
      case "buyStaff": bought = G.buyStaff(id, buyN()) > 0; break;
      case "buyUp": { const m = S.money; G.buyUpgrade(id); bought = S.money < m; break; }
      case "buyGarage": { const g = S.garage; G.buyGarage(); bought = S.garage > g; break; }
      case "unlockTier": { const t = S.tierMax; G.unlockTier(); bought = S.tierMax > t; break; }
      case "focus": S.focus = +v; S.offer = null; G.bump(); break;
      case "catalog": { const m = S.money; G.buyCatalog(id); bought = S.money < m; break; }
      case "openCar": selCar = +id; draft = null; setView("atelier"); return;
      case "selCar": selCar = +id; draft = null; break;
      case "opt": if (draft) draft.custom[el.dataset.k] = +v; break;
      case "color": if (draft) draft.color = v; break;
      case "applyCustom": if (draft) bought = G.customize(draft.id, draft.custom, draft.color); if (bought) draft = null; break;
      case "deliver": G.deliverCommission(+id); Sound.salut(); break;
      case "prepCom": setView("atelier"); return;
      case "talent": { const f = G.freeStars(); G.buyTalent(id); bought = G.freeStars() < f; break; }
      case "prestige":
        modal(`<h2>🎬 Nouvelle saison de pubs ?</h2><p>Tu repars de zéro avec <b>+${fmt(G.pendingStars())} ⭐</b>. Les talents, succès et étoiles sont gardés.</p><div class="btns"><button class="btn" data-act="closeModal">Pas encore</button><button class="btn primary" data-act="prestigeYes">On tourne !</button></div>`);
        return;
      case "prestigeYes": G.prestige(); closeModal(); Sound.salut(); setView("garage"); return;
      case "replay": Sound.complete(); break;
      case "salut": Sound.salut(); break;
      case "saveNow": G.save(); toast("💾 Sauvegardé"); break;
      case "export": $("#save-box").value = G.exportSave(); $("#save-box").select(); break;
      case "import": if (G.importSave($("#save-box").value)) toast("✅ Sauvegarde importée"); else toast("❌ Sauvegarde invalide", "bad"); break;
      case "reset": modal(`<h2>Tout effacer ?</h2><p>Ta partie sera perdue définitivement.</p><div class="btns"><button class="btn" data-act="closeModal">Annuler</button><button class="btn danger" data-act="resetYes">Effacer</button></div>`); return;
      case "resetYes": G.reset(); closeModal(); location.reload(); return;
    }
    if (bought) Sound.salut();
    render(true);
  }
  function onChange(e) {
    const el = e.target, act = el.dataset.act, S = G.S;
    if (!act) return;
    if (act === "pack") { G.setPack(el.dataset.k, +el.value); }
    if (act === "sound") { S.settings.sound = el.checked; if (!el.checked) Sound.stop(); }
    if (act === "volume") S.settings.volume = +el.value;
    if (act === "fx") S.settings.fx = el.checked;
  }

  /* ---------------- PLEIN ÉCRAN ---------------- */
  const isTouch = () => matchMedia("(pointer: coarse)").matches;
  const isStandalone = () => matchMedia("(display-mode: fullscreen), (display-mode: standalone)").matches || navigator.standalone;
  function toggleFullscreen(onlyEnter) {
    const d = document, el = d.documentElement;
    const on = d.fullscreenElement || d.webkitFullscreenElement;
    if (on) { if (!onlyEnter) (d.exitFullscreen || d.webkitExitFullscreen).call(d); return; }
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req && !isStandalone()) {
      Promise.resolve(req.call(el, { navigationUI: "hide" })).then(() => { if (screen.orientation && screen.orientation.lock) screen.orientation.lock("portrait").catch(() => {}); }).catch(() => fsHelp());
    } else if (!isStandalone()) fsHelp();
  }
  function fsHelp() {
    modal(`<h2>⛶ Plein écran</h2><p>Ton navigateur ne permet pas le plein écran direct (c'est le cas sur iPhone).</p>
      <p><b>Astuce :</b> ajoute le jeu à ton écran d'accueil (bouton <b>Partager</b> → <b>Sur l'écran d'accueil</b> sur iPhone, menu <b>⋮</b> → <b>Installer l'application</b> sur Android). Ouvert depuis l'icône, il se lance en plein écran, comme une vraie appli.</p>
      <button class="btn primary" data-act="closeModal">Compris</button>`);
  }

  /* ---------------- DÉMARRAGE ---------------- */
  function showSplash() {
    $("#splash").innerHTML = `<div class="splash-box"><div class="splash-franck">${Art.franck("grin")}</div>
      <div class="splash-txt"><div class="logo">Vendez<b>Votre</b>Caisse<span>.fr</span></div><p class="tag">L'idle game où Franck rachète TOUTES les voitures.</p>
      <button class="btn huge primary" data-act="start">▶ Lancer le jeu</button>
      ${isTouch() ? `<button class="btn big" data-act="startFs" style="margin-top:10px">⛶ Jouer en plein écran</button>` : ""}
      <p class="disclaimer">Parodie de fan, non officielle. Marques inventées. Son conseillé 🔊</p></div></div>`;
  }
  function startGame() {
    const S = G.S;
    $("#splash").classList.add("hidden");
    $("#app").classList.remove("hidden");
    if (!S.settings.intro) { S.settings.intro = true; Sound.complete(); say(LINES[0], 6000); G.save(); }
    else Sound.salut();
    buildNav(); render(true);
  }
  function init() {
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChange);
    document.addEventListener("pointerdown", (e) => { if (e.target.closest("#j-ball")) { e.preventDefault(); kickBall(); } });
    document.addEventListener("input", (e) => { if (e.target.dataset.act === "volume") onChange(e); });
    document.addEventListener("pointerdown", () => { ptrDown = true; lastPtr = performance.now(); }, true);
    document.addEventListener("pointerup", () => { ptrDown = false; lastPtr = performance.now(); }, true);
    $("#modal-wrap").addEventListener("click", (e) => { if (e.target.id === "modal-wrap") closeModal(); });
    Sound.on((p) => { talking = p; if (!p) setFranck("grin"); });
    setFranck("grin");
    showSplash();
  }
  return { init, frame, processEvents, toast };
})();
