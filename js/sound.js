"use strict";
/* =========================================================
   VENDEZ VOTRE CAISSE — Son
   - complete : le clip entier, joué au tout premier lancement
   - salut : le début du clip, gimmick joué à chaque achat
   - animal : le gimmick, coupé par une voix naturelle pré-générée (assets/voix/)
   ========================================================= */
const Sound = (() => {
  const files = { complete: "assets/franck-complet.mp3", salut: "assets/franck-salut.mp3" };
  const cache = {};
  let current = null, lastSalut = 0;
  const listeners = [];
  const on = (fn) => listeners.push(fn);
  const notify = (playing) => listeners.forEach((fn) => fn(playing));
  const cfg = () => (typeof Game !== "undefined" && Game.S ? Game.S.settings : { sound: true, volume: 0.8 });

  function audio(k) {
    if (!cache[k]) { cache[k] = new Audio(files[k]); cache[k].preload = "auto"; }
    return cache[k];
  }
  function play(k, onEnd) {
    if (!cfg().sound) { if (onEnd) onEnd(); return false; }
    const a = audio(k);
    if (current && !current.paused) current.pause();
    a.currentTime = 0;
    a.volume = cfg().volume;
    current = a;
    a.onended = () => { notify(false); if (onEnd) onEnd(); };
    a.play().then(() => notify(true)).catch(() => { notify(false); if (onEnd) onEnd(); });
    return true;
  }
  // Gimmick : pas de cacophonie, on ne relance pas si le clip est déjà en cours
  function salut(onEnd) {
    const now = performance.now();
    if (current && !current.paused && now - lastSalut < 2600) { if (onEnd) setTimeout(onEnd, 2650 - (now - lastSalut)); return false; }
    lastSalut = now;
    return play("salut", onEnd);
  }
  // Voix de synthèse ; « angry » = fort, grave et rapide (énervé)
  let frVoice = null;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const vs = speechSynthesis.getVoices().filter((x) => x.lang && x.lang.toLowerCase().startsWith("fr"));
    frVoice = vs.find((x) => /paul|thomas|henri|male|homme|claude/i.test(x.name)) || vs[0] || null;
  }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function say(text, angry = false) {
    if (!cfg().sound || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "fr-FR";
    u.volume = angry ? 1 : cfg().volume;
    u.rate = angry ? 1.2 : 0.95;
    u.pitch = angry ? 0.35 : 0.8;
    if (frVoice) u.voice = frVoice;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }
  // Voix des animaux : fichiers pré-générés (voix neuronale naturelle), joués en Web Audio
  // pour un départ précis. La voix coupe Franck sur la fin de « Leboeuf ».
  const SALUT_LEN = 2650, CUT_IN = 2150;
  let ctx = null;
  const buffers = {}, loading = {};
  function actx() {
    if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function loadVoice(id) {
    if (buffers[id] || loading[id] || !actx()) return loading[id];
    loading[id] = fetch(`assets/voix/${id}.mp3`).then((r) => r.arrayBuffer())
      .then((b) => new Promise((res, rej) => ctx.decodeAudioData(b, res, rej)))
      .then((buf) => (buffers[id] = buf)).catch(() => null);
    return loading[id];
  }
  function voiceAt(id, delayMs, text) {
    const c = actx();
    const fire = () => {
      const buf = buffers[id];
      if (!c || !buf) return say(text, true); // repli : synthèse du navigateur
      const src = c.createBufferSource(), g = c.createGain();
      g.gain.value = Math.min(1, 0.35 + cfg().volume);
      src.buffer = buf; src.connect(g).connect(c.destination);
      const late = Math.max(0, performance.now() - t0 - delayMs);
      src.start(c.currentTime + Math.max(0, delayMs - (performance.now() - t0)) / 1000, Math.min(late / 1000, 0.1));
      // Franck se fait couper : on baisse son clip au moment où la voix démarre
      setTimeout(() => { if (current && current === cache.salut) current.volume = cfg().volume * 0.35; }, Math.max(0, delayMs - (performance.now() - t0)));
    };
    const t0 = performance.now();
    if (buffers[id]) fire(); else (loadVoice(id) || Promise.resolve()).then(fire);
  }
  function animal(text) {
    if (!cfg().sound) return;
    const an = typeof ANIMALS !== "undefined" ? ANIMALS.find((x) => x.line === text) : null;
    const now = performance.now();
    const playing = current && current === cache.salut && !current.paused && now - lastSalut < SALUT_LEN;
    const elapsed = playing ? now - lastSalut : 0;
    if (!playing) salut();
    voiceAt(an ? an.id : "vache", Math.max(0, CUT_IN - elapsed), text);
  }
  // Précharge les voix dès la première interaction (débloque aussi l'audio sur mobile)
  const warm = () => { if (typeof ANIMALS !== "undefined") ANIMALS.forEach((a) => loadVoice(a.id)); window.removeEventListener("pointerdown", warm); };
  window.addEventListener("pointerdown", warm);
  const cow = () => animal("C'EST UNE VACHE !");
  function complete() { return play("complete"); }
  function stop() { if (current) current.pause(); notify(false); }
  return { salut, cow, animal, complete, say, stop, on };
})();
