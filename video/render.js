// Rendu image par image de trailer.html (1080x1920, 30 i/s) via Chrome headless + DevTools.
// Usage : node render.js [fps] [durée]   (le serveur `node serve.js` doit tourner sur :8080)
const { spawn } = require("child_process");
const fs = require("fs"), path = require("path");
const FPS = +process.argv[2] || 30, DUR = +process.argv[3] || 30;
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = path.join(__dirname, "out", "frames");
const URL = "http://localhost:8080/vendez-votre-caisse/video/trailer.html";
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const prof = path.join(__dirname, "out", "chrome-profile");
  const ch = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--mute-audio", "--remote-debugging-port=9333", `--user-data-dir=${prof}`, "--window-size=1080,1920", "about:blank"], { stdio: "ignore" });
  let ws;
  for (let i = 0; i < 50 && !ws; i++) {
    try { const list = await (await fetch("http://127.0.0.1:9333/json/list")).json(); const pg = list.find((x) => x.type === "page"); if (pg) ws = pg.webSocketDebuggerUrl; } catch (e) {}
    if (!ws) await sleep(200);
  }
  if (!ws) throw new Error("Chrome DevTools introuvable");
  const sock = new WebSocket(ws);
  await new Promise((r) => (sock.onopen = r));
  let id = 0;
  const pending = new Map();
  sock.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); sock.send(JSON.stringify({ id: i, method, params })); });
  const evalJS = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result;
  await send("Page.enable");
  await send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: URL });
  await sleep(1500);
  await evalJS("window.ready");
  await sleep(500);
  const total = Math.round(FPS * DUR);
  const t0 = Date.now();
  for (let f = 0; f < total; f++) {
    await evalJS(`seek(${(f / FPS).toFixed(4)}); new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => r(1))))`);
    const shot = await send("Page.captureScreenshot", { format: "jpeg", quality: 92, clip: { x: 0, y: 0, width: 1080, height: 1920, scale: 1 } });
    fs.writeFileSync(path.join(OUT, `f${String(f).padStart(4, "0")}.jpg`), Buffer.from(shot.result.data, "base64"));
    if (f % 60 === 0) console.log(`image ${f}/${total} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
  }
  sock.close();
  ch.kill();
  console.log("fini :", total, "images");
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
