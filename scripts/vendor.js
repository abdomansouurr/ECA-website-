// ECA — تحميل المكتبات الخارجية على السيرفر بدل الـ CDN:  npm run vendor
// بيحمّل نسخ مثبّتة (نفس النسخ اللي الموقع شغّال بيها) في vendor/ ويطبع SHA-256 لكل ملف عشان تحتفظ بيه.
const fs = require("fs"), path = require("path"), crypto = require("crypto");
const OUT = path.join(__dirname, "..", "vendor");
const FILES = [
  { name: "chess.js", must: /export/, urls: [
    "https://cdn.jsdelivr.net/npm/chess.js@1.0.0/dist/esm/chess.js",
    "https://cdn.jsdelivr.net/npm/chess.js@1.0.0/+esm" ] },
  { name: "stockfish.js", must: /Stockfish|onmessage/, urls: [
    "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js" ] },
  // Stockfish 19 (WASM lite، خيط واحد) لرقعة التحليل ومراجعة الأدوار — نفس نسخة devDependencies (stockfish@19.0.1)
  { name: "stockfish-19-lite-single.js", must: /wasm|Stockfish/i, local: "node_modules/stockfish/bin/stockfish-19-lite-single.js", urls: [
    "https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-lite-single.js" ] },
  { name: "stockfish-19-lite-single.wasm", binary: true, local: "node_modules/stockfish/bin/stockfish-19-lite-single.wasm", urls: [
    "https://cdn.jsdelivr.net/npm/stockfish@19.0.1/bin/stockfish-19-lite-single.wasm" ] },
  { name: "stockfish-19.LICENSE", must: /GNU GENERAL PUBLIC LICENSE/, local: "node_modules/stockfish/Copying.txt", urls: [
    "https://cdn.jsdelivr.net/npm/stockfish@19.0.1/Copying.txt" ], optional: true },
  { name: "chess.js.LICENSE", must: /./, urls: ["https://cdn.jsdelivr.net/npm/chess.js@1.0.0/LICENSE"], optional: true }
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of FILES) {
    let ok = false;
    // نسخة الـ npm المتثبّتة عندك أولاً (من غير نت)، وبعدها الـ CDN
    const local = f.local && path.join(__dirname, "..", f.local);
    if (local && fs.existsSync(local)) {
      const d = fs.readFileSync(local);
      fs.writeFileSync(path.join(OUT, f.name), d);
      console.log("✅", f.name, (d.length / 1024).toFixed(0) + "KB", "sha256:", crypto.createHash("sha256").update(d).digest("hex").slice(0, 16) + "…", "←", f.local);
      continue;
    }
    for (const u of f.urls) {
      try {
        const r = await fetch(u); if (!r.ok) continue;
        if (f.binary) {
          const d = Buffer.from(await r.arrayBuffer()); if (d.length < 100000 || d.readUInt32BE(0) !== 0x0061736d) continue;   // لازم يبدأ بـ \0asm
          fs.writeFileSync(path.join(OUT, f.name), d);
          console.log("✅", f.name, (d.length / 1024).toFixed(0) + "KB", "sha256:", crypto.createHash("sha256").update(d).digest("hex").slice(0, 16) + "…", "←", u);
          ok = true; break;
        }
        const t = await r.text(); if (t.length < 1000 && !f.optional) continue; if (!f.must.test(t)) continue;
        fs.writeFileSync(path.join(OUT, f.name), t);
        console.log("✅", f.name, (t.length / 1024).toFixed(0) + "KB", "sha256:", crypto.createHash("sha256").update(t).digest("hex").slice(0, 16) + "…", "←", u);
        ok = true; break;
      } catch (e) { /* جرّب اللي بعده */ }
    }
    if (!ok && !f.optional) { console.error("❌ فشل تحميل", f.name); process.exitCode = 1; }
  }
})();
