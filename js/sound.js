"use strict";
/* =========================================================
   VENDEZ VOTRE CAISSE — Son
   - complete : le clip entier, joué au tout premier lancement
   - salut : le début du clip, gimmick joué à chaque achat
   - cow : le gimmick puis une voix de synthèse « C'est une vache. »
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
  // Gimmick + annonce énervée enchaînée tout de suite (lancée juste avant la fin du clip
  // pour compenser le temps de démarrage de la synthèse vocale)
  const SALUT_LEN = 2650, TTS_LEAD = 350;
  function animal(text) {
    if (!cfg().sound) return;
    const now = performance.now();
    const playing = current && !current.paused && now - lastSalut < SALUT_LEN;
    const wait = playing ? SALUT_LEN - (now - lastSalut) : SALUT_LEN;
    if (!playing) salut();
    if (current) current.volume = Math.min(cfg().volume, 0.7);
    setTimeout(() => say(text, true), Math.max(0, wait - TTS_LEAD));
  }
  const cow = () => animal("C'EST UNE VACHE !");
  function complete() { return play("complete"); }
  function stop() { if (current) current.pause(); notify(false); }
  return { salut, cow, animal, complete, say, stop, on };
})();
