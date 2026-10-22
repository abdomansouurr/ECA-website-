// يرفع رقم النسخة في كل الملفات مرة واحدة: npm run bump   (eca-v3 → eca-v4)
const fs = require("fs");
const files = ["index.html", "sw.js"];
const cur = fs.readFileSync("sw.js", "utf8").match(/VERSION = "eca-v(\d+)"/);
if (!cur) { console.error("VERSION not found in sw.js"); process.exit(1); }
const from = "eca-v" + cur[1], to = "eca-v" + (Number(cur[1]) + 1);
for (const f of files) {
  const s = fs.readFileSync(f, "utf8");
  fs.writeFileSync(f, s.split(from).join(to));
}
console.log(`✅ ${from} → ${to}`);
