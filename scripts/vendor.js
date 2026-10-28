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
  { name: "chess.js.LICENSE", must: /./, urls: ["https://cdn.jsdelivr.net/npm/chess.js@1.0.0/LICENSE"], optional: true }
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of FILES) {
    let ok = false;
    for (const u of f.urls) {
      try {
        const r = await fetch(u); if (!r.ok) continue;
        const t = await r.text(); if (t.length < 1000 && !f.optional) continue; if (!f.must.test(t)) continue;
        fs.writeFileSync(path.join(OUT, f.name), t);
        console.log("✅", f.name, (t.length / 1024).toFixed(0) + "KB", "sha256:", crypto.createHash("sha256").update(t).digest("hex").slice(0, 16) + "…", "←", u);
        ok = true; break;
      } catch (e) { /* جرّب اللي بعده */ }
    }
    if (!ok && !f.optional) { console.error("❌ فشل تحميل", f.name); process.exitCode = 1; }
  }
})();
