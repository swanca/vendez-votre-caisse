"use strict";
/* VENDEZ VOTRE CAISSE — Démarrage et boucle */
(function () {
  Game.load();
  UI.init();
  let last = Date.now(), saveT = 0, achT = 0;
  setInterval(() => {
    const now = Date.now();
    const dt = Math.min(3600, (now - last) / 1000);
    last = now;
    Game.tick(dt);
    UI.processEvents();
    saveT += dt; achT += dt;
    if (achT > 1) { achT = 0; Game.checkAch(); }
    if (saveT > 15) { saveT = 0; Game.save(); }
  }, 100);
  (function loop() { UI.frame(); requestAnimationFrame(loop); })();
  window.addEventListener("beforeunload", () => Game.save());
  document.addEventListener("visibilitychange", () => { if (document.hidden) Game.save(); });
  // jeu installable et jouable hors ligne (https ou localhost)
  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
