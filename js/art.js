"use strict";
/* =========================================================
   VENDEZ VOTRE CAISSE — Art SVG généré en code
   Franck (caricature parodique) et voitures personnalisables.
   ========================================================= */
const Art = (() => {
  let gid = 0;

  /* ---------------- FRANCK ----------------
     mood : grin | talk | wink | wow | cash */
  function franck(mood = "grin", opts = {}) {
    const id = "fk" + ++gid;
    const skin = "#efbf9c", skinD = "#d4977a", skinDD = "#b97a60";
    const beard = "#cbc5bc", beardD = "#a39c92";
    const bg = opts.bg !== false;
    // Bouche selon l'humeur
    let mouth;
    if (mood === "talk") mouth = `<path d="M160 226 C 175 270 225 270 240 226 C 222 236 178 236 160 226Z" fill="#4a1a1a"/><path d="M164 228 C 182 238 218 238 236 228 L 233 237 C 215 244 185 244 167 237Z" fill="#fff"/><ellipse cx="200" cy="256" rx="20" ry="7" fill="#c2545b"/>`;
    else if (mood === "wow") mouth = `<ellipse cx="200" cy="244" rx="20" ry="24" fill="#4a1a1a"/><ellipse cx="200" cy="258" rx="12" ry="7" fill="#c2545b"/>`;
    else mouth = `<path d="M148 224 C 170 268 230 268 252 224 C 228 234 172 234 148 224Z" fill="#4a1a1a"/>
      <path d="M152 226 C 175 238 225 238 248 226 L 244 238 C 222 247 178 247 156 238Z" fill="#fff"/>
      <path d="M170 233 L171 243 M184 236 L184 246 M200 237 L200 247 M216 236 L216 246 M230 233 L229 243" stroke="#d8d2cc" stroke-width="1.6"/>
      <path d="M172 252 C 188 258 212 258 228 252" stroke="#c2545b" stroke-width="5" stroke-linecap="round" fill="none"/>`;
    // Yeux
    const eyeL = mood === "wow" ? `<ellipse cx="162" cy="160" rx="10" ry="11" fill="#fff"/><circle cx="163" cy="161" r="6" fill="#3d2b1f"/>` : mood === "cash" ? `<text x="162" y="170" font-size="26" text-anchor="middle" font-weight="900" fill="#1e9e4a">€</text>` : `<path d="M144 163 Q162 148 180 163 Q162 170 144 163Z" fill="#2b1d16"/><circle cx="166" cy="160" r="2" fill="#fff" opacity=".8"/>`;
    const eyeR = mood === "wink" ? `<path d="M220 162 Q238 170 256 162" stroke="#2b1d16" stroke-width="4" fill="none" stroke-linecap="round"/>` : mood === "wow" ? `<ellipse cx="238" cy="160" rx="10" ry="11" fill="#fff"/><circle cx="237" cy="161" r="6" fill="#3d2b1f"/>` : mood === "cash" ? `<text x="238" y="170" font-size="26" text-anchor="middle" font-weight="900" fill="#1e9e4a">€</text>` : `<path d="M220 163 Q238 148 256 163 Q238 170 220 163Z" fill="#2b1d16"/><circle cx="242" cy="160" r="2" fill="#fff" opacity=".8"/>`;
    const browY = mood === "wow" ? -10 : 0;
    return `<svg viewBox="0 0 400 460" xmlns="http://www.w3.org/2000/svg" class="franck-svg">
      <defs>
        <radialGradient id="${id}bg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#3a56d4"/><stop offset=".55" stop-color="#1f2f93"/><stop offset="1" stop-color="#0a1250"/></radialGradient>
        <radialGradient id="${id}sk" cx="42%" cy="30%" r="80%"><stop offset="0" stop-color="#f8d3b4"/><stop offset=".6" stop-color="${skin}"/><stop offset="1" stop-color="${skinD}"/></radialGradient>
        <linearGradient id="${id}cd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3247"/><stop offset="1" stop-color="#171b28"/></linearGradient>
        <pattern id="${id}st" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".9" fill="${beardD}"/><circle cx="3.5" cy="3.2" r=".7" fill="#f4f1ec"/></pattern>
      </defs>
      ${bg ? `<rect width="400" height="460" fill="url(#${id}bg)"/><ellipse cx="200" cy="200" rx="170" ry="150" fill="#5672ff" opacity=".18"/>` : ""}
      <!-- corps : gilet marine, chemise bleue -->
      <path d="M30 460 C 34 390 60 350 110 332 C 140 320 160 304 200 304 C 240 304 260 320 290 332 C 340 350 366 390 370 460Z" fill="url(#${id}cd)"/>
      <path d="M163 300 L200 402 L237 300 Q200 316 163 300Z" fill="#6189c6"/>
      <path d="M163 300 L200 336 L183 352 L150 318Z" fill="#7aa0d8" stroke="#46679c" stroke-width="2"/>
      <path d="M237 300 L200 336 L217 352 L250 318Z" fill="#7aa0d8" stroke="#46679c" stroke-width="2"/>
      <circle cx="200" cy="372" r="3" fill="#2d4a7a"/><circle cx="200" cy="392" r="3" fill="#2d4a7a"/>
      <path d="M150 318 L196 420 M250 318 L204 420" stroke="#11141e" stroke-width="5"/>
      <path d="M60 380 Q100 368 130 372 M340 380 Q300 368 270 372" stroke="#11141e" stroke-width="3" fill="none" opacity=".6"/>
      <!-- bras croisés -->
      <path d="M58 424 C 90 396 160 400 230 408 C 280 413 320 404 346 396 L 352 446 C 300 460 120 460 64 452Z" fill="#20263a"/>
      <path d="M74 430 C 120 414 200 418 268 432" stroke="#11141e" stroke-width="4" fill="none" opacity=".7"/>
      <path d="M262 400 C 290 394 318 396 334 408 C 344 416 338 430 324 430 C 306 432 284 426 268 424Z" fill="${skin}" stroke="${skinDD}" stroke-width="2"/>
      <path d="M296 404 Q300 416 296 426 M310 404 Q315 416 311 428 M323 408 Q328 418 324 428" stroke="${skinDD}" stroke-width="2" fill="none"/>
      <path d="M248 402 L268 398 L270 428 L250 432Z" fill="#6189c6"/>
      <!-- cou -->
      <path d="M170 262 L172 306 Q200 322 228 306 L230 262Z" fill="${skinD}"/>
      <g transform="rotate(-7 200 200)">
        <!-- oreilles -->
        <ellipse cx="111" cy="178" rx="15" ry="26" fill="${skinD}"/><ellipse cx="114" cy="178" rx="8" ry="16" fill="${skinDD}" opacity=".5"/>
        <ellipse cx="289" cy="178" rx="15" ry="26" fill="${skinD}"/><ellipse cx="286" cy="178" rx="8" ry="16" fill="${skinDD}" opacity=".5"/>
        <!-- crâne chauve -->
        <path d="M200 30 C 290 30 304 110 300 178 C 296 250 258 296 200 298 C 142 296 104 250 100 178 C 96 110 110 30 200 30Z" fill="url(#${id}sk)"/>
        <ellipse cx="168" cy="72" rx="46" ry="20" fill="#fff" opacity=".42" transform="rotate(-18 168 72)"/>
        <ellipse cx="150" cy="66" rx="14" ry="6" fill="#fff" opacity=".7" transform="rotate(-18 150 66)"/>
        <!-- rides du front -->
        <path d="M150 112 Q200 100 250 112 M158 126 Q200 116 242 126" stroke="${skinDD}" stroke-width="2.4" fill="none" opacity=".55"/>
        <!-- sourcils -->
        <g transform="translate(0 ${browY})"><path d="M138 142 Q160 128 184 140" stroke="#8d877e" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M216 140 Q240 128 262 142" stroke="#8d877e" stroke-width="7" fill="none" stroke-linecap="round"/></g>
        <!-- yeux plissés + pattes d'oie -->
        ${eyeL}${eyeR}
        <path d="M140 160 L128 154 M140 166 L127 168 M141 171 L131 179 M260 160 L272 154 M260 166 L273 168 M259 171 L269 179" stroke="${skinDD}" stroke-width="2" stroke-linecap="round"/>
        <path d="M148 174 Q162 182 178 174 M222 174 Q238 182 252 174" stroke="${skinDD}" stroke-width="2" fill="none" opacity=".7"/>
        <!-- nez -->
        <path d="M197 150 C 192 176 180 190 186 200 C 192 208 208 208 214 200 C 220 190 206 176 201 150Z" fill="${skinD}"/>
        <ellipse cx="192" cy="200" rx="5" ry="3" fill="${skinDD}"/><ellipse cx="208" cy="200" rx="5" ry="3" fill="${skinDD}"/>
        <!-- barbe courte grise -->
        <path d="M104 186 C 108 252 148 300 200 302 C 252 300 292 252 296 186 C 286 206 272 218 258 222 C 246 206 154 206 142 222 C 128 218 114 206 104 186Z" fill="${beard}"/>
        <path d="M104 186 C 108 252 148 300 200 302 C 252 300 292 252 296 186 C 286 206 272 218 258 222 C 246 206 154 206 142 222 C 128 218 114 206 104 186Z" fill="url(#${id}st)" opacity=".45"/>
        <!-- plis du sourire -->
        <path d="M180 204 Q156 214 150 236 M220 204 Q244 214 250 236" stroke="${skinDD}" stroke-width="2.6" fill="none" opacity=".7"/>
        <!-- moustache -->
        <path d="M146 222 C 166 202 234 202 254 222 C 236 216 216 214 200 220 C 184 214 164 216 146 222Z" fill="${beardD}"/>
        ${mouth}
        <!-- joues -->
        <ellipse cx="146" cy="196" rx="16" ry="9" fill="#f08f8f" opacity=".28"/><ellipse cx="254" cy="196" rx="16" ry="9" fill="#f08f8f" opacity=".28"/>
      </g>
    </svg>`;
  }

  /* ---------------- VOITURES ---------------- */
  const BODIES = {
    citadine: { b: "M20 80 L22 60 Q30 50 55 48 L80 30 Q90 24 120 24 L150 26 Q165 28 175 45 L200 50 Q215 54 218 66 L220 80Z", w: "M86 33 Q93 28 118 28 L148 30 Q158 32 166 46 L88 47Z", wh: [60, 182], r: 15, sp: [20, 46] },
    berline: { b: "M12 80 L14 62 Q20 54 50 52 L80 34 Q90 28 125 28 L150 30 Q165 32 180 50 L215 54 Q228 58 228 70 L228 80Z", w: "M86 37 Q94 32 124 32 L148 34 Q160 36 172 50 L88 51Z", wh: [52, 190], r: 15, sp: [12, 50] },
    suv: { b: "M12 82 L12 50 Q14 40 30 38 L60 22 Q66 18 90 18 L170 18 Q185 18 195 36 L218 42 Q228 46 228 60 L228 82Z", w: "M66 26 Q72 22 90 22 L165 22 Q178 22 186 38 L68 40Z", wh: [54, 190], r: 17, sp: [12, 36] },
    pickup: { b: "M10 82 L10 50 L110 50 L110 30 Q112 20 130 20 L160 20 Q170 20 178 38 L212 44 Q228 48 228 62 L228 82Z", w: "M116 46 L116 30 Q118 24 132 24 L158 24 Q166 24 172 40 L174 46Z", wh: [50, 190], r: 17, sp: [10, 48] },
    van: { b: "M10 82 L10 26 Q10 14 26 14 L170 14 Q182 14 192 30 L212 44 Q228 50 228 64 L228 82Z", w: "M150 20 L170 20 Q180 20 188 34 L192 42 L150 42Z M30 22 H70 V42 H30Z M80 22 H140 V42 H80Z", wh: [50, 192], r: 15, sp: [10, 12] },
    coupe: { b: "M14 80 L16 64 Q22 56 50 54 L90 36 Q100 30 125 30 L145 32 Q160 36 180 52 L218 56 Q230 60 230 72 L230 80Z", w: "M96 39 Q104 34 124 34 L143 36 Q152 39 166 52 L94 53Z", wh: [52, 192], r: 15, sp: [14, 52] },
    supercar: { b: "M10 80 L12 70 Q16 62 40 60 L95 42 Q108 36 130 36 L150 38 Q170 42 200 58 L226 62 Q232 66 232 74 L232 80Z", w: "M102 44 Q112 40 130 40 L148 42 Q160 45 176 58 L100 58Z", wh: [52, 196], r: 14, sp: [10, 58] },
    limo: { b: "M4 80 L6 62 Q10 54 30 52 L60 40 Q66 36 80 36 L170 36 Q180 36 190 50 L222 54 Q234 58 234 70 L234 80Z", w: "M64 42 L78 40 L168 40 Q176 40 184 52 L62 52Z", wh: [38, 202], r: 13, sp: [4, 50] },
    hover: { b: "M10 72 L12 62 Q16 54 40 52 L95 34 Q108 28 130 28 L150 30 Q170 34 200 50 L226 54 Q232 58 232 66 L232 72Z", w: "M102 36 Q112 32 130 32 L148 34 Q160 37 176 50 L100 50Z", wh: [], r: 0, sp: [10, 50], hover: true },
    ufo: { ufo: true, wh: [], r: 0 }
  };
  const WHEEL_STYLES = 6;
  function wheel(x, y, r, st, rim) {
    let spokes = "";
    const n = [0, 5, 10, 3, 6, 8][st % WHEEL_STYLES];
    for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; spokes += `<line x1="${x}" y1="${y}" x2="${(x + Math.cos(a) * r * 0.58).toFixed(1)}" y2="${(y + Math.sin(a) * r * 0.58).toFixed(1)}" stroke="${st === 2 ? "#222" : rim}" stroke-width="${st === 2 ? 1 : 2.4}"/>`; }
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="#151515"/><circle cx="${x}" cy="${y}" r="${r * 0.66}" fill="${st === 0 ? "#9aa0a6" : "#2b2b2b"}" stroke="${rim}" stroke-width="2"/>${spokes}<circle cx="${x}" cy="${y}" r="${r * 0.18}" fill="${rim}"/>`;
  }
  /* spec : { style, color, color2, wheel, rim, spoiler, kit, neon, sticker, tint, rust, flame, shine } */
  function car(spec = {}) {
    const id = "car" + ++gid;
    const B = BODIES[spec.style] || BODIES.berline;
    const col = spec.color || "#c0392b", col2 = spec.color2 || "#ffffff";
    const low = spec.kit ? 3 : 0;
    let h = `<svg viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg" class="car-svg">`;
    h += `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
      <clipPath id="${id}c"><path d="${B.b || ""}"/></clipPath></defs>`;
    if (spec.neon) h += `<ellipse cx="120" cy="${B.hover ? 98 : 96}" rx="104" ry="8" fill="${spec.neon}" opacity=".75"><animate attributeName="opacity" values=".45;.85;.45" dur="1.6s" repeatCount="indefinite"/></ellipse>`;
    else h += `<ellipse cx="120" cy="99" rx="100" ry="5" fill="#000" opacity=".35"/>`;
    if (B.ufo) {
      h += `<ellipse cx="120" cy="52" rx="44" ry="30" fill="${spec.tint ? "#1d2a3a" : "#9fd8ff"}" opacity=".9"/><ellipse cx="120" cy="66" rx="108" ry="22" fill="${col}"/><ellipse cx="120" cy="66" rx="108" ry="22" fill="url(#${id}g)"/>`;
      for (let i = 0; i < 7; i++) h += `<circle cx="${30 + i * 30}" cy="70" r="4" fill="${spec.neon || "#ffe14d"}"/>`;
      return h + `<path d="M70 86 L60 104 M120 88 L120 106 M170 86 L180 104" stroke="${col2}" stroke-width="4"/></svg>`;
    }
    h += `<g transform="translate(0 ${low})">`;
    // aileron
    if (spec.spoiler) {
      const [sx, sy] = B.sp;
      h += `<path d="M${sx + 6} ${sy} L${sx + 4} ${sy - 10} M${sx + 24} ${sy - 2} L${sx + 22} ${sy - 10}" stroke="#222" stroke-width="3"/><path d="M${sx - 2} ${sy - 10} L${sx + 34} ${sy - 12} L${sx + 34} ${sy - 7} L${sx - 2} ${sy - 5}Z" fill="${spec.spoiler > 1 ? col2 : "#222"}"/>`;
    }
    h += `<path d="${B.b}" fill="${col}" stroke="#0a0a0a" stroke-width="1.5"/>`;
    h += `<g clip-path="url(#${id}c)">`;
    if (spec.sticker === 1) h += `<rect x="0" y="60" width="240" height="7" fill="${col2}"/><rect x="0" y="69" width="240" height="3" fill="${col2}"/>`;
    if (spec.sticker === 2) h += `<path d="M200 76 Q170 70 160 58 Q150 70 135 62 Q128 72 110 66 Q115 78 100 80 H220Z" fill="#ff8c1a"/><path d="M200 78 Q178 74 168 66 Q160 74 148 70 Q144 78 130 78 H220Z" fill="#ffd21a"/>`;
    if (spec.sticker === 3) h += `<circle cx="120" cy="64" r="11" fill="#fff" stroke="#111" stroke-width="2"/><text x="120" y="69" font-size="13" font-weight="900" text-anchor="middle" fill="#111">${spec.num || 7}</text>`;
    if (spec.sticker === 4) h += `<path d="M0 74 L240 56 L240 62 L0 80Z" fill="${col2}"/><path d="M0 80 L240 64 L240 66 L0 82Z" fill="#111"/>`;
    if (spec.rust) for (let i = 0; i < 6; i++) h += `<circle cx="${30 + ((i * 37) % 180)}" cy="${60 + ((i * 13) % 18)}" r="${3 + (i % 3) * 2}" fill="#7a3d12" opacity=".75"/>`;
    h += `<rect x="0" y="0" width="240" height="110" fill="url(#${id}g)"/></g>`;
    h += `<path d="${B.w}" fill="${spec.tint ? "#151d2b" : "#a9d8f5"}" stroke="#0a0a0a" stroke-width="1.2"/>`;
    if (!spec.tint) h += `<path d="${B.w}" fill="#fff" opacity=".18" transform="translate(4 0) scale(.97 1)"/>`;
    // phares
    h += `<rect x="${B.hover ? 222 : 216}" y="${B.hover ? 58 : 62}" width="10" height="5" rx="2" fill="#fff6b0"/><rect x="${B.hover ? 10 : 10}" y="${B.hover ? 56 : 62}" width="7" height="5" rx="2" fill="#ff3030"/>`;
    if (spec.kit) h += `<path d="M${(B.wh[0] || 60) + B.r} 80 H${(B.wh[1] || 180) - B.r} V84 H${(B.wh[0] || 60) + B.r}Z" fill="#111"/>`;
    if (spec.flame) h += `<path d="M8 74 L-6 70 L2 76 L-8 80 L8 78Z" fill="#ff8c1a"><animate attributeName="opacity" values="1;.4;1" dur=".3s" repeatCount="indefinite"/></path>`;
    h += `</g>`;
    if (B.hover) h += `<ellipse cx="60" cy="86" rx="16" ry="5" fill="#57d6ff" opacity=".85"/><ellipse cx="185" cy="86" rx="16" ry="5" fill="#57d6ff" opacity=".85"/>`;
    for (const x of B.wh) h += wheel(x, 82 + low * 0.3, B.r, spec.wheel || 0, spec.rim || "#cfd4da");
    if (spec.shine) h += `<path d="M150 30 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3Z" fill="#fff"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/></path>`;
    return h + `</svg>`;
  }

  // La vache (gag) : « C'est une vache. »
  function cow(seed = 0) {
    const spots = [[70, 50, 16, 11], [118, 62, 13, 9], [96, 40, 9, 7], [140, 46, 10, 8], [60, 70, 8, 6]];
    const sp = spots.map(([x, y, rx, ry], i) => `<ellipse cx="${x + ((seed * 7 + i * 3) % 9) - 4}" cy="${y}" rx="${rx}" ry="${ry}" fill="#222"/>`).join("");
    return `<svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" class="cow-svg">
      <ellipse cx="105" cy="122" rx="85" ry="6" fill="#000" opacity=".3"/>
      <rect x="52" y="78" width="11" height="40" rx="4" fill="#f2f2f2"/><rect x="76" y="80" width="11" height="38" rx="4" fill="#e6e6e6"/><rect x="128" y="80" width="11" height="38" rx="4" fill="#e6e6e6"/><rect x="150" y="78" width="11" height="40" rx="4" fill="#f2f2f2"/>
      <rect x="50" y="112" width="15" height="7" rx="2" fill="#333"/><rect x="74" y="112" width="15" height="7" rx="2" fill="#333"/><rect x="126" y="112" width="15" height="7" rx="2" fill="#333"/><rect x="148" y="112" width="15" height="7" rx="2" fill="#333"/>
      <path d="M40 60 Q36 40 30 50" stroke="#f2f2f2" stroke-width="5" fill="none"/><path d="M30 50 l-5 8 l8 -2Z" fill="#222"/>
      <ellipse cx="105" cy="60" rx="66" ry="32" fill="#fafafa" stroke="#cfcfcf" stroke-width="2"/>
      <g clip-path="none">${sp}</g>
      <ellipse cx="108" cy="88" rx="14" ry="8" fill="#f7a8b8"/><circle cx="102" cy="95" r="2.5" fill="#f7a8b8"/><circle cx="114" cy="95" r="2.5" fill="#f7a8b8"/>
      <path d="M168 40 Q175 30 184 34" stroke="#d9c79a" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M196 40 Q190 28 202 30" stroke="#d9c79a" stroke-width="5" fill="none" stroke-linecap="round"/>
      <ellipse cx="166" cy="52" rx="10" ry="6" fill="#fafafa" stroke="#cfcfcf"/><ellipse cx="206" cy="52" rx="10" ry="6" fill="#fafafa" stroke="#cfcfcf"/>
      <ellipse cx="186" cy="60" rx="20" ry="24" fill="#fafafa" stroke="#cfcfcf" stroke-width="2"/>
      <ellipse cx="180" cy="48" rx="6" ry="5" fill="#222"/>
      <circle cx="178" cy="56" r="3.5" fill="#222"/><circle cx="194" cy="56" r="3.5" fill="#222"/><circle cx="179" cy="55" r="1" fill="#fff"/><circle cx="195" cy="55" r="1" fill="#fff"/>
      <ellipse cx="186" cy="76" rx="16" ry="11" fill="#f7a8b8"/><ellipse cx="180" cy="76" rx="2.5" ry="3.5" fill="#b85c70"/><ellipse cx="192" cy="76" rx="2.5" ry="3.5" fill="#b85c70"/>
      <rect x="180" y="86" width="12" height="8" rx="2" fill="#f2c94c" stroke="#b8860b"/>
    </svg>`;
  }

  // Âne, zèbre, cheval, bœuf : un quadrupède paramétré
  function animal(kind, seed = 0) {
    if (kind === "vache") return cow(seed);
    const K = {
      ane: { body: "#9b9590", belly: "#d9d4cf", mane: "#5d5753", ears: 30, nose: "#e4ddd6", tail: "#5d5753" },
      zebre: { body: "#f7f7f7", belly: "#ffffff", mane: "#111", ears: 16, nose: "#2b2b2b", tail: "#111", stripes: true },
      cheval: { body: "#8a4b22", belly: "#a8643a", mane: "#2a1608", ears: 14, nose: "#5a2f14", tail: "#2a1608", blaze: true },
      boeuf: { body: "#6b3b1f", belly: "#8a5130", mane: "#3a1f0e", ears: 10, nose: "#c9907a", tail: "#3a1f0e", horns: true, ring: true }
    }[kind] || {};
    const id = "an" + ++gid;
    let stripes = "";
    if (K.stripes) for (let i = 0; i < 9; i++) stripes += `<path d="M${48 + i * 14} 28 q${6 + (i % 3) * 2} 30 -2 64" stroke="#111" stroke-width="5" fill="none"/>`;
    const headStripes = K.stripes ? `<path d="M172 40 q8 6 0 12 M178 30 q8 8 2 16 M186 62 q8 4 14 0" stroke="#111" stroke-width="3.5" fill="none"/>` : "";
    return `<svg viewBox="0 0 220 130" xmlns="http://www.w3.org/2000/svg" class="cow-svg">
      <defs><clipPath id="${id}"><ellipse cx="105" cy="62" rx="64" ry="28"/></clipPath></defs>
      <ellipse cx="105" cy="122" rx="85" ry="6" fill="#000" opacity=".3"/>
      <path d="M44 56 Q30 70 34 96" stroke="${K.tail}" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M34 92 l-6 12 l12 -4Z" fill="${K.tail}"/>
      ${[54, 78, 128, 150].map((x, i) => `<rect x="${x}" y="78" width="10" height="38" rx="4" fill="${i % 3 ? K.body : K.belly}"/><rect x="${x - 1}" y="111" width="12" height="7" rx="2" fill="#2b2b2b"/>`).join("")}
      <ellipse cx="105" cy="62" rx="64" ry="28" fill="${K.body}"/>
      <g clip-path="url(#${id})">${stripes}<ellipse cx="105" cy="84" rx="50" ry="12" fill="${K.belly}" opacity=".7"/></g>
      <path d="M150 54 Q160 30 176 26 L186 34 Q176 46 168 74Z" fill="${K.body}"/>
      <path d="M152 50 Q162 26 178 22" stroke="${K.mane}" stroke-width="8" fill="none" stroke-linecap="round"/>
      ${K.horns ? `<path d="M172 28 Q160 12 150 18 M196 28 Q208 12 218 18" stroke="#efe6cf" stroke-width="7" fill="none" stroke-linecap="round"/>` : ""}
      <ellipse cx="${178}" cy="${32 - K.ears / 2}" rx="5" ry="${K.ears / 2 + 4}" fill="${K.body}" transform="rotate(-18 178 ${32 - K.ears / 2})"/>
      <ellipse cx="${190}" cy="${32 - K.ears / 2}" rx="5" ry="${K.ears / 2 + 4}" fill="${K.body}" transform="rotate(14 190 ${32 - K.ears / 2})"/>
      <path d="M170 34 Q186 26 200 40 L206 76 Q196 90 182 86 Q170 70 170 34Z" fill="${K.body}"/>
      ${headStripes}
      ${K.blaze ? `<path d="M188 38 L192 38 L196 76 L186 76Z" fill="#fff"/>` : ""}
      <circle cx="182" cy="48" r="3.5" fill="#111"/><circle cx="183" cy="47" r="1" fill="#fff"/>
      <ellipse cx="194" cy="80" rx="13" ry="9" fill="${K.nose}"/><ellipse cx="190" cy="80" rx="2" ry="3" fill="#111" opacity=".6"/><ellipse cx="199" cy="80" rx="2" ry="3" fill="#111" opacity=".6"/>
      ${K.ring ? `<circle cx="194" cy="88" r="5" fill="none" stroke="#ffd700" stroke-width="2.5"/>` : ""}
    </svg>`;
  }

  // Icône de pièce d'or / billet
  const coin = () => `<svg viewBox="0 0 20 20" class="ic"><circle cx="10" cy="10" r="9" fill="#ffc83d" stroke="#b8860b"/><text x="10" y="14" font-size="11" text-anchor="middle" font-weight="900" fill="#8a5a00">€</text></svg>`;

  return { franck, car, cow, animal, BODIES, WHEEL_STYLES, coin };
})();
if (typeof module !== "undefined") module.exports = Art;
