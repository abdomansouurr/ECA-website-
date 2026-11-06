// Runs the real site code against the local Auth + Firestore emulators with real student and admin accounts.
// Run with: npm run test:e2e (needs Java and Chrome; set CHROME_PATH if Chrome is not in the usual place).
// Production is unreachable here: the served firebase.js uses project demo-eca, and Chrome blocks Google's Firebase hosts.
const http = require("http"), fs = require("fs"), path = require("path"), os = require("os"), crypto = require("crypto"), { spawn } = require("child_process");
const root = path.join(__dirname, "..");
const PROJECT = "demo-eca", FS = "http://127.0.0.1:8085", AUTH = "http://127.0.0.1:9099", PASS = "pass123456";
const sleep = ms => new Promise(r => setTimeout(r, ms));
function chromePath() {
  const found = [process.env.CHROME_PATH, "C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/usr/bin/google-chrome", "/usr/bin/chromium"].find(p => p && fs.existsSync(p));
  if (!found) throw new Error("Chrome not found. Set CHROME_PATH.");
  return found;
}
let pass = 0, fail = 0; const failures = [];
function check(name, ok, detail) { ok ? pass++ : (fail++, failures.push(name)); console.log(ok ? "PASS" : "FAIL", name, detail === undefined ? "" : "=> " + (typeof detail === "string" ? detail : JSON.stringify(detail))); }

// ---------- static server with the emulator connection added ----------
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };
function patchFirebase(src) {
  const swap = (from, to) => { if (!src.includes(from)) throw new Error("firebase.js patch missing: " + from); src = src.replace(from, () => to); };
  swap('projectId: "eca-chess"', `projectId: "${PROJECT}"`);
  swap('const googleProvider = new GoogleAuthProvider();', `connectAuthEmulator(auth, "${AUTH}", { disableWarnings: true });\n    const googleProvider = new GoogleAuthProvider();`);
  swap('// ===================== أدوات مساعدة =====================', 'connectFirestoreEmulator(firestore, "127.0.0.1", 8085);\n    // ===================== أدوات مساعدة =====================');
  src = src.replace('console.warn("Leaderboard update failed:", e && e.code)', 'console.warn("Leaderboard update denied:", e && e.code, e && e.message, JSON.stringify(row))').replace('console.warn("streak freeze:", e && (e.code || e.message))', 'console.warn("streak freeze denied:", e && e.message)');
  return 'import { connectAuthEmulator } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";\nimport { connectFirestoreEmulator } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";\n' + src;
}
const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split("?")[0]), file = path.join(root, p === "/" ? "index.html" : p);
  if (p === "/sw.js" || !file.startsWith(root) || /[\\/]\./.test(p)) { res.writeHead(404); return res.end(); }
  fs.readFile(file, "utf8", (e, text) => {
    if (e) { res.writeHead(404); return res.end(); }
    const ext = path.extname(file);
    if (p === "/js/firebase.js") text = patchFirebase(text);
    if ([".html", ".js", ".css", ".json", ".svg"].includes(ext)) { res.writeHead(200, { "Content-Type": types[ext] }); return res.end(text); }
    fs.readFile(file, (e2, bin) => { res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" }); res.end(bin); });
  });
});

// ---------- seed and read the emulators ----------
function toValue(v) {
  if (v === null) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toValue(x)])) } };
  return { stringValue: String(v) };
}
function fromValue(v) {
  if ("nullValue" in v) return null;
  if ("arrayValue" in v) return (v.arrayValue.values || []).map(fromValue);
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("mapValue" in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromValue(x)]));
  if ("timestampValue" in v) return v.timestampValue;
  return v.stringValue;
}
const docUrl = p => `${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${p}`;
const owner = { Authorization: "Bearer owner", "Content-Type": "application/json" };
async function seed(p, data) { const r = await fetch(docUrl(p), { method: "PATCH", headers: owner, body: JSON.stringify({ fields: toValue(data).mapValue.fields }) }); if (!r.ok) throw new Error("seed " + p + " " + r.status + " " + await r.text()); }
async function read(p) { const r = await fetch(docUrl(p), { headers: owner }); if (r.status === 404) return null; if (!r.ok) throw new Error("read " + p + " " + r.status); const j = await r.json(); return fromValue({ mapValue: { fields: j.fields || {} } }); }
async function list(p) { const r = await fetch(docUrl(p) + "?pageSize=100", { headers: owner }); if (!r.ok) return []; const j = await r.json(); return (j.documents || []).map(d => d.name.split("/").pop()); }
async function signUp(email) { const r = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=x`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: PASS, returnSecureToken: true }) }); const j = await r.json(); if (!j.localId) throw new Error("signUp " + JSON.stringify(j)); return j.localId; }
const dayOf = n => { const d = new Date(Date.now() - n * 864e5); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
function student(username, extra = {}) {
  return Object.assign({ name: "Real Name " + username, username, email: username + "@eca.local", phone: "01000000000", parentPhone: "01100000000", role: "student", level: 2, group: "A", mode: "offline", att: {}, hw: {}, puz: { t: 0, c: 0 }, arena: { stars: 1200, xp: 100, days: [dayOf(1)] }, shop: { titles: [], bots: [], hints: 0, activeTitle: "" } }, extra);
}
async function until(fn, ms = 15000, step = 250) { const end = Date.now() + ms; let last; while (Date.now() < end) { last = await fn(); if (last) return last; await sleep(step); } return last; }

// ---------- Chrome: one isolated browser context per account ----------
let browserWs, msgId = 0; const pendingB = {}, sessions = {};
function bsend(method, params = {}, sessionId) { return new Promise(r => { const i = ++msgId; pendingB[i] = r; browserWs.send(JSON.stringify(Object.assign({ id: i, method, params }, sessionId ? { sessionId } : {}))); }); }
async function openPage(label, viewport) {
  const { browserContextId } = await bsend("Target.createBrowserContext");
  const { targetId } = await bsend("Target.createTarget", { url: "about:blank", browserContextId });
  const { sessionId } = await bsend("Target.attachToTarget", { targetId, flatten: true });
  const page = { label, sessionId, errors: [], denied: [] };
  sessions[sessionId] = page;
  const send = (m, p) => bsend(m, p, sessionId);
  page.send = send;
  page.ev = async expr => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(label + " eval: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).slice(0, 400) + " :: " + expr.slice(0, 80)); return r.result.value; };
  await send("Runtime.enable"); await send("Page.enable"); await send("Network.enable");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });   // keeps animation running on pages in the background
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });   // headless Chrome asks for reduced motion by default
  await send("Network.setBlockedURLs", { urls: ["https://firestore.googleapis.com/*", "https://identitytoolkit.googleapis.com/*", "https://securetoken.googleapis.com/*"] });
  await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await send("Page.navigate", { url: "http://127.0.0.1:8772/" });
  await page.ev("new Promise(r=>{ if(document.readyState==='complete') r(); else addEventListener('load',()=>r()); })").catch(() => {});
  return page;
}
async function waitReady(p) {
  const ready = () => until(() => p.ev("typeof window.fbLogin==='function'&&typeof render==='function'").catch(() => false), 30000);
  if (await ready()) return;
  console.log("Reloading", p.label, "because the Firebase SDK did not load in time");
  await p.send("Page.reload");
  if (!(await ready())) throw new Error(p.label + ": the Firebase SDK did not load. Check the internet connection.");
}
async function login(p, id) {
  await waitReady(p);
  const out = await p.ev(`fbLogin(${JSON.stringify(id)}, ${JSON.stringify(PASS)}).then(r=>JSON.stringify(r||{}))`);
  const ok = await until(() => p.ev("!!(typeof currUser==='function'&&currUser()&&!window.__authLoading)"), 20000);
  if (!ok) throw new Error(p.label + " login failed: " + out);
  await p.ev("(()=>{ try{ localStorage.setItem('ECA_SFX_OFF','1'); window.ecaSfxMuted=true; }catch(_){} })()");
}

(async () => {
  await new Promise(r => server.listen(8772, "127.0.0.1", r));
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "eca-e2e-"));
  const chrome = spawn(chromePath(), ["--headless=new", "--remote-debugging-port=9340", "--user-data-dir=" + profile, "--no-first-run", "about:blank"], { stdio: "ignore" });
  let ver;
  for (let i = 0; i < 40 && !ver; i++) { await sleep(500); try { ver = await (await fetch("http://127.0.0.1:9340/json/version")).json(); } catch (_) {} }
  browserWs = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise(r => browserWs.onopen = r);
  browserWs.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id && pendingB[d.id]) { pendingB[d.id](d.result || d); delete pendingB[d.id]; return; }
    const page = sessions[d.sessionId]; if (!page) return;
    if (d.method === "Runtime.exceptionThrown") page.errors.push(d.params.exceptionDetails.exception?.description || d.params.exceptionDetails.text);
    if (d.method === "Runtime.consoleAPICalled" && ["warning", "error"].includes(d.params.type)) {
      const t = d.params.args.map(a => a.value || a.description || "").join(" ");
      if (/permission|denied|insufficient/i.test(t)) page.denied.push(t.slice(0, 900));
    }
  };
  try {
    // ---------- accounts ----------
    const A = await signUp("stud_a@eca.local"), B = await signUp("stud_b@eca.local"), C = await signUp("stud_c@eca.local"), E = await signUp("stud_e@eca.local"), F = await signUp("stud_f@eca.local"), ADMIN = await signUp("admin@test.local");
    await seed("users/" + A, student("stud_a"));
    await seed("users/" + B, student("stud_b"));
    await seed("users/" + C, student("stud_c", { arena: { stars: 10, xp: 50, days: [dayOf(3), dayOf(2)] }, shop: { titles: [], bots: [], hints: 0, activeTitle: "", freezes: 1, frozen: [] } }));
    await seed("users/" + E, student("stud_e", { arena: { stars: 10, xp: 50, days: [dayOf(4), dayOf(3)] }, shop: { titles: [], bots: [], hints: 0, activeTitle: "", freezes: 2, frozen: [] } }));
    await seed("users/" + F, student("stud_f", { arena: { stars: 10, xp: 50, days: [dayOf(5), dayOf(4)] }, shop: { titles: [], bots: [], hints: 0, activeTitle: "", freezes: 1, frozen: [] } }));
    await seed("staff/" + ADMIN, { role: "admin", name: "Admin", username: "admin" });
    const pa = await openPage("A"), pb = await openPage("B");
    await login(pa, "stud_a"); await login(pb, "stud_b");
    check("both students log in", true);
    const U = id => read("users/" + id);

    // ---------- daily login reward ----------
    const receipts = await until(async () => { const l = await list(`users/${A}/economy`); return l.some(x => x.startsWith("login-")) ? l : null; }, 10000);
    check("login reward saved", !!receipts, receipts);

    // ---------- shop ----------
    await pa.ev("switchTab('home')");
    await pa.ev("buyShopItem('avatar-owl')");
    check("buy avatar", !!(await until(async () => ((await U(A)).shop.items || []).includes("avatar-owl"))));
    await pa.ev("buyShopItem('board-wood')");
    check("buy board", !!(await until(async () => ((await U(A)).shop.items || []).includes("board-wood"))));
    await pa.ev("buyShopItem('title-novice')");
    check("buy title", !!(await until(async () => ((await U(A)).shop.titles || []).includes("title-novice"))));
    await pa.ev("buyShopItem('streak-freeze')");
    check("buy streak freeze", !!(await until(async () => (await U(A)).shop.freezes === 1)));
    await until(() => pa.ev("currUser().shop.freezes===1"));   // the button click finishes on the device a moment after the server
    await pa.ev("ecaEquip('a','avatar-owl'); ecaEquip('b','board-wood'); setStudentTitle('title-novice')");
    const equipped = await until(async () => { const s = (await U(A)).shop; return s.eq && s.eq.a === "avatar-owl" && s.eq.b === "board-wood" && s.activeTitle === "title-novice" ? s : null; });
    check("equip reaches the server", !!equipped, equipped && equipped.eq);
    check("board skin applied", (await pa.ev("document.documentElement.dataset.ecab")) === "board-wood");
    await pa.send("Page.reload"); await sleep(1000); await waitReady(pa);
    await until(() => pa.ev("!!(typeof currUser==='function'&&currUser()&&!window.__authLoading)"), 20000);
    check("equip survives a reload", (await pa.ev("ecaAvatarOf(currUser())")) === "🦉");
    await pa.ev("window.ecaSfxMuted=true");

    // ---------- leaderboard ----------
    const rowA = await until(async () => { const r = await read("leaderboard/" + A); return r && r.a === "avatar-owl" && r.t === "title-novice" ? r : null; });
    check("own row published", !!rowA, rowA);
    check("row holds no legal name", !!rowA && !JSON.stringify(rowA).includes("Real Name"));
    await pb.ev("switchTab('honor')");
    const seesA = await until(() => pb.ev(`document.querySelectorAll('#ecaLiveBoard .eca-lb-row').length>=1`));
    check("other student sees the board", !!seesA);
    const boardText = await pb.ev("document.getElementById('ecaLiveBoard').textContent");
    check("board shows no legal names", !/Real Name/.test(boardText));

    // ---------- Coach cap ----------
    const before = (await U(A)).arena.stars;
    const xpBefore = rowA.xp;
    await pa.ev(`window.ecaAwardStudentActivity("coach", 3)`);
    const s3 = (await U(A)).arena.stars;
    check("Coach level 3 pays 3", s3 === before + 3, s3 - before);
    await pa.ev(`window.ecaAwardStudentActivity("coach", 5)`);
    const s5 = (await U(A)).arena.stars;
    check("Coach level 5 pays the difference", s5 === before + 5, s5 - before);
    const low = await pa.ev(`window.ecaAwardStudentActivity("coach", 2).then(r=>JSON.stringify(r))`);
    const s2 = (await U(A)).arena.stars;
    check("Coach lower level pays nothing", s2 === s5 && /coach-not-higher/.test(low), low);
    const liveMoved = await until(() => pb.ev(`document.getElementById('ecaLiveBoard').textContent.includes(${JSON.stringify(String(xpBefore + 100))})`), 12000);
    check("board updates live on the other device", !!liveMoved, xpBefore + 100);

    // ---------- Puzzle Rush reward ----------
    const rushBefore = (await U(A)).arena.stars;
    await pa.ev(`window.ecaAwardStudentActivity("rush", todayISO(), 7)`);
    check("rush reward", (await U(A)).arena.stars === rushBefore + 2);

    // ---------- lucky wheel ----------
    const day = await pa.ev("ecaSpinDay()"), hex = crypto.createHash("sha256").update(A + "|" + day).digest("hex")[0];
    const spinBefore = (await U(A));
    await pa.ev("ecaSpinClose(); ecaSpinOpen(); ecaSpinGo()");
    const spinDoc = await until(() => read(`users/${A}/economy/spin-${day}`));
    check("wheel receipt saved", !!spinDoc, spinDoc && { hex, stars: spinDoc.starsDelta, xp: spinDoc.xpDelta });
    const spinAfter = await U(A);
    check("wheel paid what the receipt says", !!spinDoc && spinAfter.arena.stars === spinBefore.arena.stars + spinDoc.starsDelta);
    await sleep(300);
    await pa.ev("ecaSpinClose()");
    await pa.send("Page.reload"); await sleep(1000); await waitReady(pa);
    await until(() => pa.ev("!!(typeof currUser==='function'&&currUser()&&!window.__authLoading)"), 20000);
    await pa.ev("window.ecaSfxMuted=true");
    check("wheel stays locked after a reload", await pa.ev("ecaSpinDone(currUser())"));
    const again = await pa.ev(`window.fbEconomy({op:"earn",source:"spin"}).then(r=>JSON.stringify({ok:r.ok,dup:!!r.duplicate}))`);
    const spinFinal = await U(A);
    check("second spin pays nothing", JSON.parse(again).dup === true && spinFinal.arena.stars === spinAfter.arena.stars, again);

    // ---------- live duel ----------
    await pb.ev("switchTab('arena'); arena.sub='duel'; render();");
    await pa.ev("switchTab('arena'); arena.sub='duel'; render();");
    const chessReady = p => until(() => p.ev("!!ChessCls"), 30000);
    await chessReady(pa); await chessReady(pb);
    await pa.ev("render()"); await pb.ev("render()");
    await pa.ev("duelCreate()");
    const waiting = await until(() => pa.ev("arena.duel.status==='waiting'&&arena.duel.id"));
    check("A opens a duel", !!waiting, waiting);
    const inLobby = await until(() => pb.ev("!!document.querySelector('[data-duel-id]')"));
    check("B sees it in the lobby", !!inLobby);
    const lobbyText = await pb.ev("document.getElementById('mainView').textContent");
    check("lobby shows no legal names", !/Real Name/.test(lobbyText));
    await pb.ev("document.querySelector('[data-duel-id]').click()");
    const bothLive = await until(async () => (await pa.ev("arena.duel.status")) === "live" && (await pb.ev("arena.duel.status")) === "live");
    check("both go live", !!bothLive);
    const samePuzzle = (await pa.ev("arena.duel.doc.fen+arena.duel.doc.moves")) === (await pb.ev("arena.duel.doc.fen+arena.duel.doc.moves"));
    check("same puzzle on both boards", samePuzzle);
    const duelBefore = (await U(A)).arena.stars;
    const solve = "(async()=>{ const D=arena.duel; let n=0; while(D.status==='live'&&n++<30){ const m=D.sol[D.idx]; duelPlay(m.length>4?{from:m.slice(0,2),to:m.slice(2,4),promotion:m[4]}:{from:m.slice(0,2),to:m.slice(2,4)}); await new Promise(r=>setTimeout(r,20)); } return D.status; })()";
    await sleep(3500);
    await pa.ev(solve);
    const decided = await until(async () => { const d = await read("duels/" + waiting); return d && d.status === "done" ? d : null; }, 15000);
    check("duel recorded with A as winner", !!decided && decided.winner === A, decided && { status: decided.status });
    check("A sees the win", !!(await until(() => pa.ev("arena.duel.status==='done'&&arena.duel.won"))));
    check("B sees the loss", !!(await until(() => pb.ev("arena.duel.status==='done'&&arena.duel.won===false"))));
    const duelReceipt = await until(() => read(`users/${A}/economy/duel-${dayOf(0)}`).catch(() => null), 8000);
    check("winner gets the reward", !!duelReceipt && (await U(A)).arena.stars === duelBefore + 3, duelReceipt && duelReceipt.starsDelta);
    check("loser gets no reward", !(await list(`users/${B}/economy`)).some(x => x.startsWith("duel-")));

    // second duel today: nobody gets paid twice
    await pa.ev("duelAgain()"); await pb.ev("duelAgain()");
    await pa.ev("render()"); await pb.ev("render()");
    await until(() => pa.ev("arena.duel.status==='idle'"));
    await pa.ev("duelCreate()");
    const second = await until(() => pa.ev("arena.duel.status==='waiting'&&arena.duel.id"));
    const seenSecond = await until(() => pb.ev(`!!document.querySelector('[data-duel-id="${second}"]')`));
    check("second duel opens", !!seenSecond);
    await pb.ev(`document.querySelector('[data-duel-id="${second}"]').click()`);
    await until(async () => (await pa.ev("arena.duel.status")) === "live" && (await pb.ev("arena.duel.status")) === "live");
    const secondBefore = (await U(A)).arena.stars;
    await sleep(3500);
    await pa.ev(solve);
    await until(() => pa.ev("arena.duel.status==='done'"), 15000);
    await sleep(1500);
    check("second win today pays nothing", (await U(A)).arena.stars === secondBefore);

    // cancelling removes the open duel
    await pa.ev("duelAgain(); render();");
    await pa.ev("duelCreate()");
    const third = await until(() => pa.ev("arena.duel.status==='waiting'&&arena.duel.id"));
    await pa.ev("duelCancel()");
    check("cancel deletes the duel", !!(await until(async () => !(await read("duels/" + third)))));

    // ---------- streak freeze on a real login after a missed day ----------
    const pc = await openPage("C");
    await login(pc, "stud_c");
    const frozen = await until(async () => { const s = (await U(C)).shop; return (s.frozen || []).length ? s : null; }, 15000);
    check("freeze used for the missed day", !!frozen && frozen.frozen[0] === dayOf(1) && frozen.freezes === 0, frozen && { frozen: frozen.frozen, freezes: frozen.freezes });
    check("streak stays alive", (await pc.ev("streaks(currUser().arena.days,currUser().shop.frozen).current")) >= 3, await pc.ev("streaks(currUser().arena.days,currUser().shop.frozen).current"));

    // two missed days use two freezes
    const pe = await openPage("E");
    await login(pe, "stud_e");
    const frozen2 = await until(async () => { const s = (await U(E)).shop; return (s.frozen || []).length === 2 ? s : null; }, 15000);
    check("two missed days use two freezes", !!frozen2 && frozen2.freezes === 0, frozen2 && frozen2.frozen);
    // too many missed days keep the freezes and break the streak
    const pf = await openPage("F");
    await login(pf, "stud_f");
    await sleep(4000);
    const noFreeze = (await U(F)).shop;
    check("three missed days keep the freeze", noFreeze.freezes === 1 && !(noFreeze.frozen || []).length, noFreeze.freezes);

    // ---------- the other rewards and items through the real code ----------
    const stars = async id => (await U(id)).arena.stars;
    const earnOk = async (name, expr, delta) => { const b = await stars(B), r = await pb.ev(expr + ".then(r=>JSON.stringify(r&&{ok:r.ok,s:r.starsDelta,code:r.code})).catch(e=>'threw '+e.code+' '+String(e.message).slice(0,160))"), a = await stars(B); check(name, a === b + delta, { got: a - b, r }); };
    await earnOk("pawn reward", 'window.fbEconomy({op:"earn",source:"pawn",key:todayISO(),day:todayISO()})', 2);
    await earnOk("vision reward", 'window.fbEconomy({op:"earn",source:"vision",key:todayISO(),day:todayISO(),score:9})', 3);
    await earnOk("quest reward", 'window.fbEconomy({op:"earn",source:"quest",key:"daily",day:todayISO()})', 1);
    await earnOk("same quest pays once", 'window.fbEconomy({op:"earn",source:"quest",key:"daily",day:todayISO()})', 0);
    await earnOk("puzzle reward", 'window.fbEconomy({op:"earn",source:"puzzle",key:"normal",day:todayISO()})', 4);
    await earnOk("buy a bot", 'window.fbEconomy({op:"purchase",item:"bot-3"})', -70);
    await earnOk("bot win reward", 'window.fbEconomy({op:"earn",source:"bot",key:"3",day:todayISO()})', 4);
    await earnOk("buy a hint", 'window.fbEconomy({op:"purchase",item:"hint"})', -20);
    await earnOk("spend a hint", 'window.fbEconomy({op:"spend-hint"})', 0);
    check("hint count back to zero", (await U(B)).shop.hints === 0);
    await earnOk("priciest cosmetic", 'window.fbEconomy({op:"purchase",item:"piece-gold"})', -150);
    await earnOk("priciest title", 'window.fbEconomy({op:"purchase",item:"title-master"})', -250);

    // ---------- speed arena: a real tournament from start to prize ----------
    const nextSlot = await pb.ev("JSON.stringify(saNextSlot(Date.now()))");
    const slotId = JSON.parse(nextSlot).id;
    check("the weekly slot records itself", !!(await until(() => read("speedArenas/" + slotId))), slotId);
    const pg = await openPage("Staff");
    await login(pg, "admin@test.local");
    await pg.ev("window.fbArenaStartNow(0.75)");
    const liveId = await until(async () => (await list("speedArenas")).find(x => x.startsWith("live-")));
    check("staff starts a tournament", !!liveId, liveId);
    await pa.ev("switchTab('home')"); await pb.ev("switchTab('home')");
    await pb.ev("ecaSpinAuto=false; try{localStorage.removeItem('ECA_SPIN_SEEN_'+currUser().id)}catch(_){}; ecaSpinClose(); render();");
    await pb.ev("switchTab('arena'); arena.sub='speed'; render();");
    await sleep(1900);
    check("wheel does not open during a tournament", !(await pb.ev("!!document.getElementById('ecaSpinModal')")));
    for (const p of [pa, pb]) { await p.ev("switchTab('arena'); arena.sub='speed'; render();"); await until(() => p.ev("!!ChessCls"), 30000); await until(() => p.ev("!!saActive()")); await p.ev("render()"); }
    await pa.ev("saJoin()"); await pb.ev("saJoin()");
    check("both students join", !!(await until(async () => (await pa.ev("arena.speed.status")) === "play" && (await pb.ev("arena.speed.status")) === "play")));
    const saSolve = n => "(async()=>{ const S=arena.speed; let done=0,guard=0; while(done<" + n + "&&guard++<200&&S.status==='play'){ const before=S.solved; const m=S.sol[S.idx]; saPlay(m.length>4?{from:m.slice(0,2),to:m.slice(2,4),promotion:m[4]}:{from:m.slice(0,2),to:m.slice(2,4)}); if(S.solved>before) done++; await new Promise(r=>setTimeout(r,20)); } return S.solved; })()";
    check("A solves 4 quickly", (await pa.ev(saSolve(4))) === 4);
    check("B solves 2", (await pb.ev(saSolve(2))) === 2);
    const scored = await until(async () => { const e = await read(`speedArenas/${liveId}/entries/${A}`); return e && e.solved === 4 ? e : null; }, 20000);
    check("fast solutions all reach the server", !!scored && scored.score === 6, scored && { score: scored.score, solved: scored.solved });
    const seen = await until(() => pb.ev("(()=>{ const r=(arena.speed.rows||[]).slice().sort((x,y)=>y.score-x.score); return r.length>=2&&r[0].score===6; })()"), 10000);
    check("standings update live", !!seen);
    await sleep(1000);
    const standings = await pb.ev("document.getElementById('saBoard').textContent");
    check("standings show no legal names", !/Real Name/.test(standings));
    if (process.env.E2E_SHOTS) { await pb.send("Page.bringToFront"); await sleep(400); const r = await pb.send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(process.env.E2E_SHOTS, "speed-play.png"), Buffer.from(r.data, "base64")); }
    check("own row glows in standings", (await pb.ev("!!document.querySelector('#saBoard .eca-lb-me')")));
    check("entry holds no legal name", !!scored && !JSON.stringify(scored).includes("Real Name"));
    const endsIn = await pa.ev("arena.speed.endsAt-Date.now()");
    await sleep(Math.max(0, endsIn) + 6000);
    check("students stop when time ends", (await pa.ev("arena.speed.status")) === "done");
    await pg.ev("window.fbArenaCloseDue()");
    const closed = await until(async () => { const d = await read("speedArenas/" + liveId); return d && d.closed ? d : null; });
    check("staff close writes the podium", !!closed && closed.rank[A] === 1 && closed.rank[B] === 2, closed && closed.rank);
    const prizeBefore = (await U(A)).arena.stars;
    await pa.ev("saClaimed=false; render();");
    const prizeDoc = await until(() => read(`users/${A}/economy/arena-${liveId}`));
    check("winner collects the prize", !!prizeDoc && (await U(A)).arena.stars === prizeBefore + 50, prizeDoc && prizeDoc.starsDelta);
    check("trophy saved in the profile", ((await U(A)).arena.tr || []).includes(liveId + "|1"));
    check("trophy popup shown", !!(await until(() => pa.ev("!!document.getElementById('ecaMilestone')"))));
    if (process.env.E2E_SHOTS) { await pa.send("Page.bringToFront"); await sleep(900); const r = await pa.send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(process.env.E2E_SHOTS, "milestone.png"), Buffer.from(r.data, "base64")); }
    check("second place collects", !!(await (async () => { await pb.ev("saClaimed=false; render();"); return until(async () => { const d = await read(`users/${B}/economy/arena-${liveId}`); return d && d.starsDelta === 30; }); })()));
    const prizeStars = (await U(A)).arena.stars;
    await pa.ev("ecaMilestoneClose(); saClaimed=false; render();");
    await sleep(1500);
    check("prize pays once", (await U(A)).arena.stars === prizeStars);

    // ---------- celebration effects ----------
    await pa.ev("switchTab('home')");
    await pa.send("Page.bringToFront");
    await pa.ev("ecaSpinClose(); while(document.getElementById('ecaMilestone')) ecaMilestoneClose();");
    check("home shows the trophy", await pa.ev("(()=>{ render(); return document.getElementById('mainView').textContent.includes('🥇'); })()"));
    check("confetti draws and cleans up", await pa.ev("(async()=>{ ecaConfetti(20); const on=!!document.querySelector('.eca-fx-canvas'); for(let i=0;i<40&&document.querySelector('.eca-fx-canvas');i++) await new Promise(r=>setTimeout(r,250)); return on&&!document.querySelector('.eca-fx-canvas'); })()"));
    check("shake class clears", await pa.ev("(async()=>{ ecaShake(); const on=document.getElementById('mainView').classList.contains('eca-shake'); await new Promise(r=>setTimeout(r,600)); return on&&!document.getElementById('mainView').classList.contains('eca-shake'); })()"));
    check("milestone text is not HTML", await pa.ev("(()=>{ ecaMilestone({icon:'x',title:'<img src=x onerror=window.__x=1>',text:'t'}); const ok=!document.querySelector('#ecaMilestone img'); ecaMilestoneClose(); return ok; })()"));

    // ---------- companion and achievements persist ----------
    await pc.ev("switchTab('home'); ecaPetPick('cat')");
    check("companion saved", !!(await until(async () => (await U(C)).arena.pet === "cat")));
    await pc.ev("ecaOnSolve(); ecaOnSolve(); ecaOnSolve();");
    check("achievement saved", !!(await until(async () => ((await U(C)).arena.ach || []).includes("speed-demon"))));

    // ---------- admin delete removes the row, restore brings the student back ----------
    await until(() => read("leaderboard/" + B));
    const pd = await openPage("Admin");
    await login(pd, "admin@test.local");
    const del = await pd.ev(`window.fbOnStudentDeleted(${JSON.stringify(B)}, "x").then(r=>JSON.stringify(r))`);
    check("admin delete works", JSON.parse(del).ok === true, del);
    check("deleted student leaves the board", !!(await until(async () => !(await read("leaderboard/" + B)))));
    const res = await pd.ev(`window.fbRestoreStudent(${JSON.stringify(B)}).then(r=>JSON.stringify(r))`);
    check("admin restore works", JSON.parse(res).ok === true, res);

    // ---------- problems seen in any browser ----------
    for (const p of Object.values(sessions)) {
      check(`no uncaught errors on ${p.label}`, !p.errors.length, [...new Set(p.errors)].map(e => String(e).slice(0, 200)));
      check(`no denied writes on ${p.label}`, !p.denied.length, [...new Set(p.denied)].slice(0, 8));
    }
  } catch (e) {
    fail++; failures.push("harness: " + e.message); console.log("FAIL harness:", e.stack || e.message);
    for (const s of Object.values(sessions)) console.log(" ", s.label, "errors:", [...new Set(s.errors)].slice(0, 5), "denied:", [...new Set(s.denied)].slice(0, 5));
  }
  console.log(`\nE2E: ${pass} passed, ${fail} failed`);
  if (failures.length) console.log("FAILED:\n  " + failures.join("\n  "));
  try { browserWs.close(); } catch (_) {}
  chrome.kill(); server.close();
  await sleep(800); try { fs.rmSync(profile, { recursive: true, force: true }); } catch (_) {}
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error("e2e crashed:", e); process.exit(1); });
