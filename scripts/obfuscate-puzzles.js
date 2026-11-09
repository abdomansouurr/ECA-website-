// Light obfuscation of puzzle solutions in the static banks: npm run obfuscate:puzzles
// Each UCI move is rewritten square by square with a fixed letter/number swap, so the files show moves that look
// real but are wrong. A tiny decoder at the end of each file restores them when the file loads, so the app code
// that reads the banks does not change. This only stops casual reading in DevTools; it is not security
// (see SECURITY_AND_PERFORMANCE_AUDIT.md, H2). Run once on fresh bank files; already-encoded files are skipped.
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const F = "abcdefgh", R = "12345678", P = "qrbn", f = "fcahdgbe", r = "58371624", p = "bnqr";
const MARK = "// eca-enc:1 (solutions are encoded; see scripts/obfuscate-puzzles.js)";
const UCI = /^[a-h][1-8][a-h][1-8][qrbn]?$/;
const encMove = m => { if (!UCI.test(m)) throw new Error("not a UCI move: " + m); return [...m].map((c, i) => i === 4 ? p[P.indexOf(c)] : i % 2 ? r[R.indexOf(c)] : f[F.indexOf(c)]).join(""); };
const encLine = s => s.split(" ").map(encMove).join(" ");
const DECODER = `;(function(){var F="${F}",R="${R}",P="${P}",f="${f}",r="${r}",p="${p}";` +
  `function m(x){var o="";for(var i=0;i<x.length;i++){var c=x.charAt(i);o+=i===4?P.charAt(p.indexOf(c)):i%2?R.charAt(r.indexOf(c)):F.charAt(f.indexOf(c));}return o;}` +
  `function d(s){return String(s).split(" ").map(m).join(" ");}`;
const ROW_RE = /"([A-Za-z0-9]{3,12})\|([^|"]+)\|([a-h1-8qrbn ]+)\|(\d+)"/g;

function bankFile(rel, globalName) {
  const file = path.join(ROOT, rel); let s = fs.readFileSync(file, "utf8");
  if (s.includes(MARK)) return console.log(rel + ": already encoded");
  const rows = (s.match(/"[A-Za-z0-9]{3,12}\|[^"]*"/g) || []).length; let n = 0;
  s = s.replace(ROW_RE, (_, id, fen, moves, rating) => { n++; return `"${id}|${fen}|${encLine(moves)}|${rating}"`; });
  if (!n || n !== rows) throw new Error(rel + `: encoded ${n} of ${rows} rows`);
  const nl = s.includes("\r\n") ? "\r\n" : "\n";
  s = s.replace(/^(\/\/[^\n]*\n)/, `$1${MARK}${nl}`);
  s = s.replace(/\s*$/, "") + nl + DECODER +
    `(function w(o){if(Array.isArray(o)){for(var i=0;i<o.length;i++){if(typeof o[i]==="string"){var q=o[i].split("|");if(q.length===4){q[2]=d(q[2]);o[i]=q.join("|");}}else w(o[i]);}}else if(o&&typeof o==="object"){for(var k in o)w(o[k]);}})(window.${globalName});})();` + nl;
  fs.writeFileSync(file, s);
  console.log(rel + ": encoded " + n + " puzzles");
}

function homeworkFile(rel) {
  const file = path.join(ROOT, rel); let s = fs.readFileSync(file, "utf8");
  if (s.includes(MARK)) return console.log(rel + ": already encoded");
  let n = 0;
  s = s.replace(/"(m|alts)":(\[[^\]]*\])/g, (_, key, arr) => { const list = JSON.parse(arr); if (key === "m") n++; return `"${key}":` + JSON.stringify(list.map(encLine)); });
  const nl = s.includes("\r\n") ? "\r\n" : "\n";
  const end = s.indexOf(nl + "};" + nl);
  if (end < 0 || !n) throw new Error(rel + ": data end not found");
  const at = end + nl.length + 2;
  s = s.slice(0, at) + nl + DECODER +
    `var h=window.ECA_HOMEWORK||{};for(var k in h){var ps=(h[k]&&h[k].puzzles)||[];for(var i=0;i<ps.length;i++){if(ps[i].m)ps[i].m=ps[i].m.map(d);if(ps[i].alts)ps[i].alts=ps[i].alts.map(d);}}})();` + s.slice(at);
  s = s.replace(/^(\/\/[^\n]*\n)/, `$1${MARK}${nl}`);
  fs.writeFileSync(file, s);
  console.log(rel + ": encoded " + n + " puzzles");
}

bankFile("puzzles.js", "ECA_PUZZLE_BANK");
bankFile("puzzles-themes.js", "ECA_THEME_BANK");
homeworkFile("js/homework.js");
