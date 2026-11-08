// Static audit of the site code (no network, no browser). Run with: npm run audit
// 1. Name clashes in the shared global scope: every classic script is loaded into one V8 context in index.html
//    order, so a second let/const/class with the same name fails exactly like it would in the browser.
// 2. Inline handlers (onclick="fn(...)" etc.) call functions that exist somewhere.
// 3. getElementById("x") with a fixed id points at an id that some template or index.html creates.
// 4. Script tags, the service worker precache list and the lazy module list agree with the files on disk.
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, ".."), read = f => fs.readFileSync(path.join(root, f), "utf8");
const html = read("index.html"), sw = read("sw.js");
const problems = [], notes = [];
const fail = (area, msg) => problems.push(`[${area}] ${msg}`);

// ---------- the scripts in load order ----------
const tags = [...html.matchAll(/<script\b([^>]*)\bsrc="([^"?]+)(?:\?[^"]*)?"[^>]*><\/script>/g)].map(m => ({ src: m[2], module: /type="module"/.test(m[1]) }))
  .filter(t => !/^https?:/.test(t.src));
const classic = tags.filter(t => !t.module).map(t => t.src);
const lazy = Object.assign({}, JSON.parse((html.match(/<script type="application\/json" id="ecaLazyModules">([^<]*)<\/script>/) || [, "{}"])[1]));
const coreSrc = read("js/core.js"), lazyCore = coreSrc.match(/const MODULE_SOURCES = Object\.assign\(\{([\s\S]*?)\}/);
if (lazyCore) for (const m of lazyCore[1].matchAll(/"?([\w-]+)"?\s*:\s*"([^"]+)"/g)) lazy[m[1]] = m[2];
const allJs = [...new Set([...tags.map(t => t.src), ...Object.values(lazy)])];

// ---------- 1. global name clashes ----------
{
  const ctx = vm.createContext({});
  for (const file of [...classic, ...Object.values(lazy)]) {
    if (!fs.existsSync(path.join(root, file))) continue;
    try { new vm.Script(read(file), { filename: file }).runInContext(ctx, { timeout: 2000 }); }
    catch (e) {
      // the code itself expects a browser, so most files stop at the first DOM call; only declaration clashes matter here
      if (e instanceof SyntaxError || /has already been declared/.test(String(e && e.message))) fail("globals", `${file}: ${e.message}`);
    }
  }
}

// ---------- 2. inline handlers call real functions ----------
const sources = Object.fromEntries(allJs.filter(f => fs.existsSync(path.join(root, f))).map(f => [f, read(f)]));
sources["index.html"] = html;
const everything = Object.values(sources).join("\n");
const defined = new Set();
for (const m of everything.matchAll(/(?:^|[^.\w$])(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(/g)) defined.add(m[1]);
for (const m of everything.matchAll(/window\.([A-Za-z_$][\w$]*)\s*=/g)) defined.add(m[1]);
for (const m of everything.matchAll(/(?:^|[;\s{])(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/gm)) defined.add(m[1]);
const builtins = new Set(["event", "this", "if", "return", "window", "document", "setTimeout", "clearTimeout", "confirm", "alert", "history", "location", "localStorage", "sessionStorage", "navigator", "Number", "String", "JSON", "Math", "Object", "Array", "Date", "encodeURIComponent", "scrollTo", "print", "open", "event.stopPropagation", "void", "new", "typeof", "true", "false", "null"]);
const handlerCalls = new Map();
for (const [file, src] of Object.entries(sources)) {
  for (const m of src.matchAll(/\bon(?:click|change|input|keydown|submit|blur|focus|load|error)="([^"]*)"/g)) {
    // only the first identifier of each statement, and not property calls like this.value or event.stopPropagation
    for (const stmt of m[1].replace(/\$\{[^}]*\}/g, "0").split(/;/)) {
      const id = (stmt.trim().match(/^(?:await\s+)?(?:if\s*\(.*?\)\s*)?([A-Za-z_$][\w$]*)\s*\(/) || [])[1];
      if (id && !builtins.has(id)) { if (!handlerCalls.has(id)) handlerCalls.set(id, file); }
    }
  }
}
for (const [id, file] of handlerCalls) if (!defined.has(id)) fail("handlers", `${file}: inline handler calls ${id}() but no file defines it`);

// ---------- 3. fixed element ids ----------
const ids = new Set();
for (const m of everything.matchAll(/\bid=\\?["']([A-Za-z][\w-]*)\\?["']/g)) ids.add(m[1]);
for (const m of everything.matchAll(/\.id\s*=\s*["']([A-Za-z][\w-]*)["']/g)) ids.add(m[1]);
for (const m of everything.matchAll(/setAttribute\(\s*["']id["']\s*,\s*["']([A-Za-z][\w-]*)["']/g)) ids.add(m[1]);
const looked = new Map();
for (const [file, src] of Object.entries(sources)) for (const m of src.matchAll(/getElementById\(\s*["']([A-Za-z][\w-]*)["']\s*\)/g)) if (!looked.has(m[1])) looked.set(m[1], file);
for (const [id, file] of looked) if (!ids.has(id)) notes.push(`[ids] ${file}: getElementById("${id}") has no matching id in any template (fine if it is optional)`);

// ---------- 4. files, script tags and the precache list ----------
const precache = new Set([...sw.matchAll(/"\.\/([^"?]+)\?v=/g)].map(m => m[1]));
for (const f of allJs) {
  if (!fs.existsSync(path.join(root, f))) fail("files", `${f} is referenced but missing`);
  if (!precache.has(f)) fail("precache", `${f} is loaded by the site but not in the sw.js precache list`);
}
for (const f of precache) if (/\.js$/.test(f) && !allJs.includes(f)) fail("precache", `${f} is in sw.js but nothing loads it`);
const versions = new Set([...html.matchAll(/\?v=(eca-v\d+)/g), ...sw.matchAll(/\?v=(eca-v\d+)/g)].map(m => m[1]));
if (versions.size > 1) fail("version", "mixed cache versions: " + [...versions].join(", "));

console.log(`Checked ${allJs.length} scripts, ${handlerCalls.size} inline handler functions, ${looked.size} fixed element ids.`);
notes.forEach(n => console.log("note", n));
problems.forEach(p => console.log("FAIL", p));
console.log(problems.length ? `\n${problems.length} problem(s) found.` : "\nNo problems found.");
process.exit(problems.length ? 1 : 0);
