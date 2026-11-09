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
  // كل استدعاء في الصفحة ليه حد أقصى: لو علّق نعرف فين بدل ما الاختبار يقف ساعات
  page.ev = async expr => { let tm; const r = await Promise.race([send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }), new Promise((_, no) => { tm = setTimeout(() => no(new Error(label + " eval timed out after 7 min :: " + expr.slice(0, 160))), 7 * 60000); })]).finally(() => clearTimeout(tm)); if (r.exceptionDetails) throw new Error(label + " eval: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text).slice(0, 400) + " :: " + expr.slice(0, 80)); return r.result.value; };
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
  if (!ok) throw new Error(p.label + " login failed: " + out + " state: " + await p.ev("JSON.stringify({user:typeof currUser==='function'&&!!currUser(),loading:window.__authLoading,users:(db.users||[]).length,currId:db.currId,tab})").catch(e => String(e)));
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

    // ---------- notifications open the right place ----------
    const notes = await until(async () => { const l = await list(`users/${A}/notifications`); return l.some(x => x.startsWith("lucky-spin-")) && l.some(x => x.startsWith("daily-puzzle-")) ? l : null; }, 15000);
    check("daily puzzle and lucky wheel notifications created", !!notes, notes);
    await until(() => pa.ev("(window.ecaNotifications||[]).length>=2"));
    const clickNote = async type => { await pa.ev("switchTab('home'); toggleNotifications()"); await sleep(300); await pa.ev(`(()=>{ const n=(window.ecaNotifications||[]).find(x=>x.type===${JSON.stringify(type)}); document.querySelector('[data-notification-id="'+n.id+'"][onclick^="openNotification"]').click(); })()`); await sleep(1200); };
    await clickNote("daily_puzzle");
    check("daily puzzle notification opens today's puzzle", await pa.ev("tab==='arena'&&arena.sub==='puzzles'&&arena.puz.diff==='daily'&&!document.getElementById('notificationsMenu').offsetParent"));
    await clickNote("lucky_spin");
    check("lucky wheel notification opens the wheel", await pa.ev("tab==='home'&&!!document.getElementById('ecaSpinModal')"));
    await pa.ev("ecaSpinClose()");
    check("clicked notifications are marked read", !!(await until(async () => { const a = await read(`users/${A}/notifications/${notes.find(x => x.startsWith("lucky-spin-"))}`), b = await read(`users/${A}/notifications/${notes.find(x => x.startsWith("daily-puzzle-"))}`); return a.read && b.read; })));
    check("companion is called Lion", await pa.ev("(()=>{ const l=lang; lang='en'; const h=ecaPetHTML({arena:{},att:{},hw:{},puz:{}}); lang=l; return h.includes('Lion')&&!h.includes('Cat'); })()"));

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
    const streakNow = await until(() => pc.ev("(()=>{ const n=streaks(currUser().arena.days,currUser().shop.frozen).current; return n>=3?n:0; })()"), 10000);
    check("streak stays alive", streakNow >= 3, streakNow);

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

    // ---------- heroes, mystery chests, frames and voice cheers ----------
    await pa.send("Page.bringToFront");
    await pa.ev("switchTab('home'); ecaSpinClose(); while(document.getElementById('ecaMilestone')) ecaMilestoneClose();");
    check("map uses the kingdom names", await pa.ev("(()=>{ const l=lang; lang='en'; const h=ecaMapHTML(currUser()); lang=l; return h.includes('Pawn Kingdom')&&h.includes('Queen Empire'); })()"));
    check("passed Step 1 unlocks its hero", await pa.ev("ecaOwnsItem(currUser(),'hero-1')&&!ecaOwnsItem(currUser(),'hero-2')"));
    await pa.ev("ecaEquip('a','hero-1')");
    check("hero equipped on the server", !!(await until(async () => ((await U(A)).shop.eq || {}).a === "hero-1")));
    check("locked hero cannot be equipped", await pa.ev("(()=>{ ecaEquip('a','hero-3'); return currUser().shop.eq.a==='hero-1'; })()"));
    const chestOne = async () => {
      const before = await U(A), n = Number(before.arena.ch) || 0;
      await pa.ev("ecaChestClose(); ecaOpenChest(); ecaChestGo()");
      const receipt = await until(() => read(`users/${A}/economy/chest-${n}`), 15000);
      const after = await U(A);
      return { before, after, receipt, n };
    };
    const c1 = await chestOne();
    const hex1 = crypto.createHash("sha256").update(A + "|" + c1.n).digest("hex")[0];
    check("chest opens through the real code", !!c1.receipt && c1.after.arena.stars === c1.before.arena.stars - 40 && c1.after.arena.ch === c1.n + 1, c1.receipt && { hex: hex1, xp: c1.receipt.xpDelta });
    await sleep(1600);
    check("chest shows its prize", await pa.ev("(()=>{ const t=document.getElementById('ecaChestPrize').textContent; return /XP|Frame|frame|pieces|إطار|قطع|خبرة/.test(t); })()"));
    const c2 = await chestOne();
    check("second chest uses the next number", !!c2.receipt && c2.after.arena.ch === c2.n + 1);
    const chestXp = (c1.receipt.xpDelta || 0) + (c2.receipt.xpDelta || 0);
    check("chest XP is set aside", (Number(c2.after.arena.chx) || 0) === chestXp, { chx: c2.after.arena.chx, chestXp });
    const boardAfterChest = await until(async () => { const r = await read("leaderboard/" + A), p = await U(A); return r && r.xp === p.arena.xp - (Number(p.arena.chx) || 0) ? r : null; }, 15000);
    check("leaderboard leaves chest XP out", !!boardAfterChest);
    await pa.ev("ecaChestClose()");
    const lootItem = ((await U(A)).shop.items || []).find(x => /^(frame|piece)-(silver|gold|fire|ruby|crystal)$/.test(x));
    if (lootItem && lootItem.startsWith("frame-")) {
      await pa.ev(`ecaEquip('f', ${JSON.stringify(lootItem)})`);
      check("frame from a chest can be equipped", !!(await until(async () => ((await U(A)).shop.eq || {}).f === lootItem)));
    }
    check("voice cheer shows on screen", await pa.ev("(()=>{ window.ecaSfxMuted=false; window.ecaVoiceOff=false; cheerLast=0; ecaCheer('retry'); const on=!!document.querySelector('.eca-cheer.is-retry'); return on; })()"));
    check("voice cheers can be turned off", await pa.ev("(()=>{ ecaToggleVoice(); document.querySelectorAll('.eca-cheer').forEach(e=>e.remove()); cheerLast=0; ecaCheer('hype'); const quiet=!document.querySelector('.eca-cheer'); ecaToggleVoice(); window.ecaSfxMuted=true; return quiet && localStorage.getItem('ECA_VOICE_OFF')==='0'; })()"));

    // ---------- Dojo Revenge, tactic cards and break reminder ----------
    await pa.send("Page.bringToFront");
    await pa.ev("switchTab('home'); ecaChestClose(); ecaSpinClose(); while(document.getElementById('ecaMilestone')) ecaMilestoneClose();");
    const bankId = await pa.ev("loadPuzzleBank().then(b => b.easiest[0].split('|')[0])");
    await pa.ev(`window.fbVaultFail(${JSON.stringify(bankId)}, { motifs: ['fork'], step: 2, rating: 900 })`);
    const logged = await until(() => read(`users/${A}/mistakeVault/${bankId}`));
    check("a missed puzzle goes into the vault", !!logged && logged.resolved === false && logged.attempts === 1 && logged.stepLevel === 2, logged && { motifs: logged.motifs });
    const oldIso = new Date(Date.now() - 2 * 3600000).toISOString();
    await fetch(docUrl(`users/${A}/mistakeVault/${bankId}`) + "?updateMask.fieldPaths=failedAt&updateMask.fieldPaths=nextAt", { method: "PATCH", headers: owner, body: JSON.stringify({ fields: { failedAt: { timestampValue: oldIso }, nextAt: { timestampValue: oldIso } } }) });
    await pa.ev("dojoRows=null; switchTab('arena'); arena.sub='puzzles'; render();");
    await until(() => pa.ev("!!ChessCls"), 30000);
    const dueCount = await until(() => pa.ev("Array.isArray(dojoRows) && dojoDue().length"));
    check("the dojo shows the due puzzle", dueCount >= 1, dueCount);
    check("the dojo box replaces the old review box", await pa.ev("document.getElementById('mainView').innerHTML.includes('reviewStart()')"));
    const dojoBefore = await U(A);
    await pa.ev("reviewStart()");
    await until(() => pa.ev("arena.puz.review===true && arena.puz.status==='play'"), 20000);
    const dojoSolve = await pa.ev("(async()=>{ const Z=arena.puz; let n=0; while(Z.status!=='solved'&&n++<80){ if(Z.status==='play'){ const m=Z.sol[Z.idx]; puzPlay(m.length>4?{from:m.slice(0,2),to:m.slice(2,4),promotion:m[4]}:{from:m.slice(0,2),to:m.slice(2,4)}); } await new Promise(r=>setTimeout(r,150)); } return JSON.stringify({s:Z.status,rev:Z.review,idx:Z.idx,len:Z.sol.length,counted:Z.counted,id:Z.info&&Z.info.id}); })()").catch(e => String(e));
    const bonus = await until(() => read(`users/${A}/economy/dojo-${bankId}`), 15000);
    const dojoAfter = await U(A);
    check("solving it pays the comeback bonus", !!bonus && dojoAfter.arena.stars === dojoBefore.arena.stars + 2 && dojoAfter.arena.xp === dojoBefore.arena.xp + 40, bonus ? { stars: bonus.starsDelta, xp: bonus.xpDelta } : dojoSolve);
    check("the puzzle is marked solved in the vault", !!(await until(async () => (await read(`users/${A}/mistakeVault/${bankId}`)).resolved === true)));
    await pa.ev("puzLoad()");
    check("cards: the album opens", await pa.ev("(()=>{ arena.sub='cards'; render(); return document.querySelectorAll('.eca-card').length===8 && document.querySelectorAll('.eca-card.is-locked').length>=7; })()"));
    await pa.ev("(()=>{ const u=currUser(); u.arena=u.arena||{}; for(let i=0;i<10;i++) ecaMotifCount(u.arena,['fork','middlegame'],true); ecaMotifCount(u.arena,['fork'],false); save(); render(); })()");
    check("cards: ten solves unlock the card", !!(await until(async () => ((await U(A)).arena.cards || []).includes("fork"))));
    check("cards: unlocked card shows its stats", await pa.ev("(()=>{ const c=[...document.querySelectorAll('.eca-card.is-on')]; return c.length===1 && /10/.test(c[0].textContent) && /11/.test(c[0].textContent) && /91%/.test(c[0].textContent); })()"));
    await pa.ev("while(document.getElementById('ecaMilestone')) ecaMilestoneClose();");
    await sleep(1200); await pa.ev("switchTab('home'); while(document.getElementById('ecaMilestone')) ecaMilestoneClose(); ecaChestClose(); ecaSpinClose();");
    check("break: no reminder before 45 minutes", await pa.ev("(()=>{ ecaStaminaSet(30*60000); ecaStaminaTick(); return !document.getElementById('ecaBreakModal'); })()"));
    check("break: reminder after 45 minutes of play", await pa.ev("(()=>{ ecaStaminaSet(45*60000); ecaStaminaTick(); return !!document.getElementById('ecaBreakModal') && /5:00|4:5/.test(document.getElementById('ecaBreakLeft').textContent); })()"));
    check("break: back to training closes it", await pa.ev("(()=>{ ecaBreakClose(); return !document.getElementById('ecaBreakModal'); })()"));
    check("break: waits while a game is running", await pa.ev("(()=>{ arena.rush.status='play'; tab='arena'; ecaStaminaSet(46*60000); ecaStaminaTick(); const waited=!document.getElementById('ecaBreakModal'); arena.rush.status='idle'; tab='home'; ecaStaminaTick(); const shown=!!document.getElementById('ecaBreakModal'); ecaBreakClose(); return waited && shown; })()"));

    // ---------- elite frames, cheers, friend challenge links and the coach's weekly challenge ----------
    await pa.send("Page.bringToFront");
    await pa.ev("switchTab('home'); ecaChestClose(); ecaSpinClose(); while(document.getElementById('ecaMilestone')) ecaMilestoneClose(); if(window.ecaBreakClose) ecaBreakClose();");
    const wkNow = await pa.ev("ecaWeekKey()");
    await seed("leaderboard/eliteX1", { n: "", a: "", t: "", g: "A", xp: 999, wk: wkNow, wx: 99999 });
    await seed("leaderboard/eliteX2", { n: "", a: "", t: "", g: "A", xp: 998, wk: wkNow, wx: 50 });
    await seed("leaderboard/eliteOld", { n: "", a: "", t: "", g: "A", xp: 997, wk: "2020-01-04", wx: 5000 });
    const rowAnow = await read("leaderboard/" + A);
    await seed("leaderboard/" + A, Object.assign({}, rowAnow, { wk: wkNow, wx: 99998 }));
    await pa.ev("eliteAt=0; ecaEliteRefresh()"); await sleep(1500);
    check("elite: second place this week gets the Electric Plasma frame", await pa.ev(`ecaEliteRank(${JSON.stringify(A)})===2 && ecaEliteRank('eliteX1')===1 && ecaEliteRank('eliteOld')===0`));
    check("elite: frame shows in the HUD", await pa.ev("(()=>{ ecaHudUpdate(); const e=document.getElementById('ecaHudAvatar'); return !e.hidden && e.classList.contains('eca-elite-2'); })()"));
    await pb.send("Page.bringToFront");
    await pb.ev("switchTab('honor')"); await sleep(2500);
    check("elite: frames show on the leaderboard", await pb.ev("(()=>{ lbTabSet('weekly'); return !!document.querySelector('#ecaLiveBoard .eca-elite-1') && !!document.querySelector('#ecaLiveBoard .eca-elite-2'); })()"));
    check("cheer button next to other students", await pb.ev(`!!document.querySelector('#ecaLiveBoard [data-emote-to="${A}"]')`));
    await pb.ev(`(()=>{ const b=document.querySelector('#ecaLiveBoard [data-emote-to="${A}"]'); b.click(); document.querySelector('#ecaEmoteMenu [data-e="1"]').click(); })()`);
    await pa.send("Page.bringToFront");
    check("cheer arrives as a floating message", !!(await until(() => pa.ev("!!document.querySelector('.eca-emote-pop') && document.querySelector('.eca-emote-pop').textContent.includes('🔥')"), 10000)));
    check("received cheers are cleared", !!(await until(async () => (await list(`users/${A}/emotes`)).length === 0)));
    check("a second cheer within 10 seconds waits", await pb.ev(`(async()=>{ const b=document.querySelector('#ecaLiveBoard [data-emote-to="${A}"]'); b.click(); document.querySelector('#ecaEmoteMenu [data-e="0"]').click(); await new Promise(r=>setTimeout(r,800)); return emoteNextAt > Date.now(); })()`));
    check("no stranger text can be sent", await pb.ev("typeof ECA_EMOTES!=='undefined' && ECA_EMOTES.length===5 && !document.querySelector('#ecaEmoteMenu input, #ecaEmoteMenu textarea')"));

    // friend challenge by link
    await pa.ev("switchTab('arena'); arena.sub='friend'; render();");
    await until(() => pa.ev("!!ChessCls"), 30000);
    await pa.ev("render(); fdCreate()");
    const fid = await until(() => pa.ev("arena.friend.doc && arena.friend.doc.status==='open' && arena.friend.id"), 15000);
    check("friend: challenge created with 5 puzzles", !!fid && (await pa.ev("arena.friend.doc.puzzles.length")) === 5, fid);
    check("friend: share link and WhatsApp button", await pa.ev(`(()=>{ const h=document.getElementById('mainView').innerHTML; return h.includes('?duel=${fid}') && h.includes('wa.me'); })()`));
    const playFriend = (wrongAt) => `(async()=>{ const F=arena.friend; let k=0; for(let guard=0; guard<400; guard++){ const side=F.doc&&(F.doc.a===currUser().id?'ra':'rb'); if(F.doc&&side&&F.doc[side]&&F.doc[side].done) return F.doc[side]; if(F.status==='lobby'&&!F.busy){ fdPlayNext(); } if(F.status==='play'&&!F.busy){ const num=F.num; if(${JSON.stringify(wrongAt)}.includes(num) && F.idx===0){ const g=F.game, want=F.sol[0]; const m=g.moves({verbose:true}).find(m=>m.from+m.to!==want.slice(0,4)&&!m.promotion&&(()=>{const c=new ChessCls(g.fen());c.move(m);return !c.isCheckmate()})()); if(m){ fdMove({from:m.from,to:m.to}); } } else { const m=F.sol[F.idx]; if(m) fdMove(m.length>4?{from:m.slice(0,2),to:m.slice(2,4),promotion:m[4]}:{from:m.slice(0,2),to:m.slice(2,4)}); } } await new Promise(r=>setTimeout(r,120)); } return 'timeout'; })()`;
    const aRes = await pa.ev(playFriend([]));
    check("friend: creator solves all 5", aRes && aRes.solved === 5 && aRes.done === true, aRes);
    await pb.send("Page.bringToFront");
    await pb.ev(`(()=>{ sessionStorage.setItem('ECA_FDUEL', ${JSON.stringify(fid)}); render(); })()`);
    check("friend: the link opens the challenge", !!(await until(() => pb.ev(`tab==='arena' && arena.sub==='friend' && arena.friend.id===${JSON.stringify(fid)}`))));
    check("friend: friend joins automatically", !!(await until(async () => (await read("friendDuels/" + fid)).status === "live")));
    await until(() => pb.ev("!!ChessCls"), 30000);
    const bRes = await pb.ev(playFriend([2, 4]));
    check("friend: friend finishes with 3 of 5", bRes && bRes.solved === 3 && bRes.done === true, bRes);
    const fdone = await until(async () => { const d = await read("friendDuels/" + fid); return d.status === "done" ? d : null; });
    check("friend: the winner is decided", !!fdone && fdone.winner === A, fdone && fdone.winner);
    check("friend: both see the comparison", !!(await until(() => pb.ev("document.getElementById('mainView').textContent.includes('3/5')"))) && !!(await until(() => pa.ev("arena.friend.doc && arena.friend.doc.status==='done'"))));
    const fprize = await until(() => read(`users/${A}/economy/fduel-${dayOf(0)}`), 10000);
    check("friend: the winner gets the prize", !!fprize && fprize.starsDelta === 3);

    // coach's weekly challenge
    await pg.send("Page.bringToFront");
    const wkRow = await pg.ev("loadPuzzleBank().then(b => b.easier[3])");
    const [, wkFen, wkMoves] = wkRow.split("|");
    await pg.ev(`window.fbWeeklySave(ecaWeekKey(), { title: 'Find the fork', fen: ${JSON.stringify(wkFen)}, moves: ${JSON.stringify(wkMoves)}, setup: true })`);
    check("weekly: coach publishes the challenge", !!(await until(() => read("coachChallenges/" + wkNow))));
    await pa.send("Page.bringToFront");
    await pa.ev("switchTab('home')");
    check("weekly: spotlight card on the home page", !!(await until(() => pa.ev("document.getElementById('mainView').textContent.includes('Find the fork')"), 10000)));
    await pa.ev("arena.sub='weekly'; switchTab('arena');");
    await until(() => pa.ev("arena.weekly.doc && !!ChessCls"), 15000);
    await pa.ev("render(); wkStart()");
    await until(() => pa.ev("arena.weekly.status==='play'"), 10000);
    await sleep(1100);
    await pa.ev("(async()=>{ const W=arena.weekly; for(let n=0;n<30&&W.status==='play';n++){ const m=W.sol[W.idx]; wkMove(m.length>4?{from:m.slice(0,2),to:m.slice(2,4),promotion:m[4]}:{from:m.slice(0,2),to:m.slice(2,4)}); await new Promise(r=>setTimeout(r,60)); } })()");
    const hofA = await until(() => read(`coachChallenges/${wkNow}/hallOfFame/${A}`), 10000);
    check("weekly: solving adds you to the Hall of Fame", !!hofA && hofA.ms >= 1000 && hofA.a === "hero-1", hofA && { ms: hofA.ms, a: hofA.a });
    check("weekly: Hall of Fame shows the solver", !!(await until(() => pa.ev("document.querySelectorAll('#mainView .eca-lb-row').length>=1 && document.getElementById('mainView').textContent.includes('🏅')"))));
    await pb.send("Page.bringToFront");
    await pb.ev("arena.sub='weekly'; switchTab('arena');");
    await until(() => pb.ev("arena.weekly.doc && !!ChessCls"), 15000);
    const failOnce = "(async()=>{ await wkStart(); for(let i=0;i<40&&arena.weekly.status!=='play';i++) await new Promise(r=>setTimeout(r,100)); const W=arena.weekly; if(W.status!=='play') return 'no-play'; const g=W.game, want=W.sol[0]; const m=g.moves({verbose:true}).find(m=>m.from+m.to!==want.slice(0,4)&&!m.promotion&&(()=>{const c=new ChessCls(g.fen());c.move(m);return !c.isCheckmate()})()); wkMove({from:m.from,to:m.to}); await new Promise(r=>setTimeout(r,1200)); return W.status; })()";
    await pb.ev(failOnce); await pb.ev(failOnce);
    check("weekly: two attempts only", !!(await until(() => pb.ev("arena.weekly.att && arena.weekly.att.n===2 && !arena.weekly.att.solved && document.getElementById('mainView').textContent.match(/No attempts left|خلّصت محاولاتك/)"), 8000)));
    check("weekly: the failed student is not in the Hall of Fame", !(await read(`coachChallenges/${wkNow}/hallOfFame/${B}`)));

    // ---------- coach command center: groups, boss homework and live drops ----------
    await pg.send("Page.bringToFront");
    await pg.ev("window.confirm = () => true; switchTab('command')");
    check("command center opens for staff", !!(await until(() => pg.ev("!!document.getElementById('cmdBossList') && !!window.ECA_HOMEWORK"), 20000)));
    await pg.ev("(()=>{ for (const g of ['A', 'Lake House - Step 1']) { if (!(db.groups||[]).includes(g)) { document.getElementById('cmdNewGroup').value = g; cmdAddGroup(); } } })()");
    check("groups: coach adds groups", !!(await until(async () => { const m = await read("meta/groups"); return m && m.list.includes("A") && m.list.includes("Lake House - Step 1"); })));
    await pg.ev(`cmdSetGroup(${JSON.stringify(F)}, String(db.groups.indexOf('Lake House - Step 1')))`);
    check("groups: coach moves a student", !!(await until(async () => (await U(F)).group === "Lake House - Step 1")));
    await pg.ev(`cmdSetGroup(${JSON.stringify(F)}, String(db.groups.indexOf('A')))`);
    await until(async () => (await U(F)).group === "A");
    await pg.ev("CMD.draft = { title: 'Fork Dragon', group: String(db.groups.indexOf('A')), step: '2', motif: 'fork', count: '5', due: cmdIsoIn(7), puzzles: [] }; cmdPick();");
    check("boss: pack picked by step and motif", await pg.ev("CMD.draft.puzzles.length === 5 && CMD.draft.puzzles.every(id => cmdPool(2).some(p => p.id === id && p.themes.includes('fork')))"));
    await pg.ev("cmdBossSend()");
    const bossId = await until(async () => (await list("assignments"))[0], 15000);
    const bossDoc = bossId && await read("assignments/" + bossId);
    check("boss: assigned to the whole group with one click", !!bossDoc && bossDoc.group === "A" && bossDoc.puzzles.length === 5 && bossDoc.motif === "fork", bossDoc && { group: bossDoc.group, n: bossDoc.puzzles.length });
    await pa.send("Page.bringToFront");
    await pa.ev("switchTab('home'); while(document.getElementById('ecaMilestone')) ecaMilestoneClose();");
    check("boss: shows on the student's adventure map", !!(await until(() => pa.ev("!!document.querySelector('.eca-map .eca-boss-node') && document.querySelector('.eca-boss-node').textContent.includes('Fork Dragon')"), 15000)));
    check("boss: health bar starts full", await pa.ev("(()=>{ const b=document.querySelector('.eca-boss-node [role=progressbar]'); return b && b.getAttribute('aria-valuenow')==='5' && b.getAttribute('aria-valuemax')==='5'; })()"));
    check("boss: classmate sees it too", !!(await until(() => pb.ev("(arena.boss.list||[]).some(a => a.title === 'Fork Dragon')"), 15000)));
    const starsBeforeBoss = (await U(A)).arena.stars;
    await pa.ev(`ecaBossOpen(${JSON.stringify(bossId)})`);
    await until(() => pa.ev("!!ChessCls && tab==='arena' && arena.sub==='boss'"), 15000);
    const fight = await pa.ev(`(async()=>{ const B=arena.boss, sleep=ms=>new Promise(r=>setTimeout(r,ms)); let tried=false, hp=[];
      for (let guard=0; guard<700; guard++) {
        const a=bossCur(); if (!a) return 'no-boss';
        if (a.done) return { done: true, solved: a.solved.length, blocked: !!window.__bossBlocked, hp };
        if (B.status==='idle' && !B.busy) { hp.push(bossHP(a)); bossNext(); }
        else if (B.status==='play' && !B.busy) {
          if (!tried) { tried=true; const g=B.game, want=B.sol[B.idx]; const m=g.moves({verbose:true}).find(m=>m.from+m.to!==want.slice(0,4)&&!m.promotion&&(()=>{const c=new ChessCls(g.fen());c.move(m);return !c.isCheckmate()})());
            if (m) { const before=bossHP(a); bossMove({from:m.from,to:m.to}); window.__bossBlocked = B.status==='block' && bossHP(a)===before; await sleep(1100); continue; } }
          const m=B.sol[B.idx]; if (m) bossMove(m.length>4?{from:m.slice(0,2),to:m.slice(2,4),promotion:m[4]}:{from:m.slice(0,2),to:m.slice(2,4)});
        }
        await sleep(120);
      } return 'timeout:' + B.status; })()`);
    check("boss: every solve takes 1 HP until it falls", fight && fight.done === true && fight.solved === 5, fight);
    check("boss: a wrong move is blocked without losing anything", !!(fight && fight.blocked));
    const prog = await read(`assignments/${bossId}/progress/${A}`);
    check("boss: progress saved on the server", !!prog && prog.done === true && prog.solved.length === 5);
    const bossPay = await until(() => read(`users/${A}/economy/boss-${bossId}`), 15000);
    check("boss: defeat pays the bonus", !!bossPay && bossPay.starsDelta === 10 && bossPay.xpDelta === 200);
    check("boss: stars credited", (await until(async () => (await U(A)).arena.stars === starsBeforeBoss + 10 ? true : null, 10000)) === true);
    check("boss: defeat celebration", !!(await until(() => pa.ev("!!document.getElementById('ecaMilestone') && /Boss defeated|هزمت الزعيم/.test(document.getElementById('ecaMilestone').textContent)"), 8000)));
    await pa.ev("while(document.getElementById('ecaMilestone')) ecaMilestoneClose();");
    await pg.send("Page.bringToFront");
    await pg.ev(`cmdToggle(${JSON.stringify(bossId)})`);
    check("boss: coach sees the student completed", !!(await until(() => pg.ev("/Completed|خلّص/.test(document.getElementById('cmdBossList').textContent) && /[^0-9]1[^0-9]/.test(document.getElementById('cmdBossList').querySelector('p').textContent)"), 15000)));

    // live drops
    const dropTo = async (to, type, amount, note) => { await pg.ev(`Object.assign(CMD, { dropTo: ${JSON.stringify(to)}, dropType: ${JSON.stringify(type)}, dropAmt: ${JSON.stringify(String(amount))}, dropNote: ${JSON.stringify(note)} }); cmdDropSend();`); };
    const dropReceipts = async who => (await list(`users/${who}/economy`)).filter(x => x.startsWith("drop-"));
    const starsBeforeDrop = (await U(A)).arena.stars;
    await pa.send("Page.bringToFront");
    await dropTo("s:" + A, "stars", 7, "Brilliant move");
    check("drop: popup appears on the student's screen", !!(await until(() => pa.ev("!!document.getElementById('ecaDropModal') && document.getElementById('ecaDropModal').textContent.includes('+7') && document.getElementById('ecaDropNote').textContent.includes('Brilliant move')"), 15000)));
    check("drop: stars credited once", (await until(async () => (await U(A)).arena.stars === starsBeforeDrop + 7 ? true : null, 10000)) === true && (await dropReceipts(A)).length === 1);
    check("drop: claimed drop is gone", !!(await until(async () => (await list(`liveDrops/${A}/drops`)).length === 0)));
    await pa.ev("dropClose()");
    const xpA = (await U(A)).arena.xp, xpB = (await U(B)).arena.xp;
    await dropTo("g:" + await pg.ev("db.groups.indexOf('A')"), "xp", 100, "");
    check("drop: whole group gets the XP boost", !!(await until(async () => (await U(A)).arena.xp === xpA + 100 && (await U(B)).arena.xp === xpB + 100, 20000)));
    check("drop: classmate sees the popup too", !!(await until(() => pb.ev("!!document.getElementById('ecaDropModal') && document.getElementById('ecaDropModal').textContent.includes('+100 XP')"), 15000)));
    await pb.ev("dropClose()");
    await until(() => pa.ev("!!document.getElementById('ecaDropModal')"), 10000);
    await pa.ev("dropClose()");
    const chBefore = Number((await U(A)).arena.ch) || 0, starsBeforeChest = (await U(A)).arena.stars;
    await dropTo("s:" + A, "chest", 0, "");
    const freeChest = await until(() => read(`users/${A}/economy/chest-${chBefore}`), 15000);
    check("drop: free mystery chest", !!freeChest && freeChest.source === "drop" && freeChest.starsDelta === 0 && (await U(A)).arena.stars === starsBeforeChest, freeChest && { source: freeChest.source, stars: freeChest.starsDelta });
    check("drop: chest prize revealed", !!(await until(() => pa.ev("!!document.getElementById('ecaDropModal') && /XP|Frame|frame|pieces|إطار|قطع|خبرة/.test(document.getElementById('ecaDropModal').textContent)"), 10000)));
    await pa.ev("dropClose()");

    // ---------- lesson puzzles and the daily lesson mission ----------
    await pc.send("Page.bringToFront");
    await until(() => pc.ev("!document.getElementById('ecaDropModal') || (dropClose(), false)"), 10000);
    await pc.ev("switchTab('home'); while(document.getElementById('ecaMilestone')) ecaMilestoneClose();");
    const dailyLesson = await pc.ev("lpDailyLesson(currUser())");
    check("quests: lesson mission replaces today's puzzle", await pc.ev("ECA_QUESTS[0].key==='lesson' && !ECA_QUESTS.some(q=>q.key==='daily') && document.getElementById('mainView').textContent.includes(lpTitle(lpDailyLesson(currUser())))"), dailyLesson);
    await pc.ev("arena.sub='lessons'; switchTab('arena')");
    check("lesson puzzles tab lists the curriculum lessons", !!(await until(() => pc.ev("!!ChessCls && document.querySelectorAll('#mainView [onclick^=\"lpStart\"]').length > 5"), 20000)));
    const solvedBefore = Number(((await U(C)).arena || {}).puzSolved) || 0;
    await pc.ev(`lpStart(${JSON.stringify(dailyLesson)})`);
    const lessonRun = await pc.ev(`(async()=>{ const Z=arena.puz, sleep=ms=>new Promise(r=>setTimeout(r,ms)); let solved=0, last='', lastAt=0, themesOk=true, levelOk=true;
      for (let guard=0; guard<2000 && solved<10; guard++) {
        if (Z.status==='solved' && Z.info && Z.info.id!==last) { last=Z.info.id; solved++; lastAt=Date.now(); themesOk = themesOk && (ECA_LESSON_THEMES[Z.lesson]||[]).includes(Z.info.themes[0]); }
        else if (Z.status==='play' && Z.game && Date.now()-lastAt > 3600) { const m=Z.sol[Z.idx]; if (m) puzPlay(m.length>4?{from:m.slice(0,2),to:m.slice(2,4),promotion:m[4]}:{from:m.slice(0,2),to:m.slice(2,4)}); }
        await sleep(150);
      }
      const ql=currUser().arena.ql||{}; return { solved, themesOk, n: ql.n, k: ql.k, lesson: Z.lesson, banner: /Today's mission|مهمة النهاردة/.test(document.getElementById('mainView').textContent) }; })()`);
    check("lesson puzzles come from the lesson's themes", !!lessonRun && lessonRun.solved === 10 && lessonRun.themesOk && lessonRun.banner, lessonRun);
    check("lesson mission counts 10 solves", !!(await until(async () => { const a = (await U(C)).arena || {}; return a.ql && a.ql.n === 10 && a.ql.k === dailyLesson && a.puzSolved === solvedBefore + 10; }, 15000)));
    await pc.ev("arenaSub('puzzles')");
    check("the normal puzzles tab leaves lesson mode", await pc.ev("!arena.puz.lesson"));
    await pc.ev("switchTab('home'); ecaClaimQuest('lesson')");
    const lessonPay = await until(async () => { const id = (await list(`users/${C}/economy`)).find(x => /^quest-.*-lesson$/.test(x)); return id ? read(`users/${C}/economy/${id}`) : null; }, 15000);
    check("lesson mission pays stars and XP", !!lessonPay && lessonPay.starsDelta === 5 && lessonPay.xpDelta === 100, lessonPay && { s: lessonPay.starsDelta, x: lessonPay.xpDelta });

    // ---------- parent analytics report ----------
    await pa.send("Page.bringToFront");
    await pa.ev("while(document.getElementById('ecaDropModal')) dropClose(); while(document.getElementById('ecaMilestone')) ecaMilestoneClose(); prPending = 600; ecaTrainingFlush();");
    check("report: focused training time saved", !!(await until(async () => ((((await U(A)).arena || {}).tm || {})[dayOf(0)] || 0) >= 600)));
    check("report: puzzle accuracy and speed are logged per day", await pa.ev("(()=>{ const r=(currUser().arena.ps||{})[todayISO()]; return Array.isArray(r) && r.length===4 && r[0]>=1; })()"));
    await pa.ev("switchTab('parent')");
    const reportOk = await until(() => pa.ev("(()=>{ const r=document.querySelector('.eca-pr'); if(!r||PRD.busy||!PRD.data) return false; const t=r.textContent; return { charts: r.querySelectorAll('svg.pr-chart').length, praise: t.includes('Brilliant move'), boss: t.includes('Fork Dragon'), done: /Completed|خلّص/.test(t), time: /10 د|10m/.test(t), donut: !!r.querySelector('svg.pr-donut') }; })()"), 20000);
    check("report: executive view with SVG charts", !!reportOk && reportOk.charts >= 3, reportOk);
    check("report: training time shown", !!reportOk && reportOk.time);
    check("report: coach praise from class is listed", !!reportOk && reportOk.praise);
    check("report: boss homework status is listed", !!reportOk && reportOk.boss && reportOk.done);
    check("report: mistake vault resolution rate", !!reportOk && reportOk.donut);
    const summary = await pa.ev("prSummaryText(currUser())");
    check("report: WhatsApp summary text", /Egypt Chess Academy/.test(summary) && summary.includes("Real Name stud_a") && summary.includes("Brilliant move") && /Fork Dragon|1 /.test(summary), summary.slice(0, 160));
    await pa.ev("window.confirm = () => true; document.querySelector('.pr-pin').open = true; document.getElementById('prPinNew').value='4826'; document.getElementById('prPinNew2').value='4826'; prPinSet();");
    await until(() => pa.ev("!!localStorage.getItem('ECA_PARENT_PIN_' + currUser().id)"), 5000);
    await pa.ev("sessionStorage.removeItem('ECA_PARENT_OK_' + currUser().id); render();");
    check("report: PIN gate locks the report", await pa.ev("!!document.getElementById('prPin') && !document.querySelector('.eca-pr .pr-kpis')"));
    await pa.ev("document.getElementById('prPin').value='1111'; prPinTry();"); await sleep(400);
    check("report: wrong PIN keeps it locked", await pa.ev("!!document.getElementById('prPin')"));
    await pa.ev("document.getElementById('prPin').value='4826'; prPinTry();");
    check("report: right PIN opens it", !!(await until(() => pa.ev("!!document.querySelector('.eca-pr .pr-kpis')"), 5000)));
    await pa.ev("prPinClear()");
    await pg.send("Page.bringToFront");
    await pg.ev("switchTab('command')");
    await until(() => pg.ev("!!document.getElementById('prCoachPick')"), 10000);
    await pg.ev(`document.getElementById('prCoachPick').value=${JSON.stringify(A)}; prCoachOpen();`);
    const coachReport = await until(() => pg.ev("(()=>{ const r=document.querySelector('.eca-pr'); if(!r||PRD.busy||!PRD.data) return false; return { name: r.textContent.includes('Real Name stud_a'), praise: r.textContent.includes('Brilliant move'), vault: !!PRD.data.vault }; })()"), 20000);
    check("report: coach opens a student's report", !!coachReport && coachReport.name && coachReport.praise && coachReport.vault, coachReport);
    await pg.ev(`window.__wa=''; window.open=(u)=>{ window.__wa=u; }; prWhatsApp(${JSON.stringify(A)});`);
    check("report: coach sends the summary to the parent's WhatsApp", /^https:\/\/wa\.me\/201100000000\?text=/.test(await pg.ev("window.__wa")));
    await pg.ev("prCoachClose()");

    // ---------- flow: warm-up, adaptive lesson puzzles, «play now» ----------
    check("flow: chess library and puzzle banks load in the background on the home page", !!(await until(() => pf.ev("typeof ChessCls !== 'undefined' && !!ChessCls && !!window.ECA_THEME_BANK && !!window.ECA_PUZZLE_BANK && tab === 'home'"), 30000)));
    await pa.send("Page.bringToFront");
    await pa.ev("switchTab('home')");
    check("flow: home shows the play-now card", !!(await until(() => pa.ev("!!document.querySelector('.eca-play-now h2') && document.querySelector('.eca-play-now h2').textContent.trim().length > 2"), 10000)));
    const pr = await pa.ev("(() => { const u = currUser(); localStorage.removeItem('ECA_PR_' + u.id); const r0 = ecaPrGet(u).r, r1 = ecaPrUpdate(u, r0, true), r2 = ecaPrUpdate(u, r1, false); const Z = { prRun: -2 }, easy = ecaPrTarget(u, Z), Z3 = { prRun: 3 }, hard = ecaPrTarget(u, Z3); return { r0, r1, r2, easy, hard, now: ecaPrGet(u).r }; })()");
    check("adaptive: a solve raises the level, a miss lowers it", pr.r1 > pr.r0 && pr.r2 < pr.r1, pr);
    check("adaptive: two misses ask for an easier puzzle, three solves for a harder one", pr.easy === pr.now - 200 && pr.hard === pr.now + 100, pr);
    const order = await pa.ev("(() => { const u = currUser(), keep = arena.boss.list; arena.boss.list = [{ id: 'flowBoss1', title: 'T', done: false, dueMs: Date.now() + 864e5, solved: [], puzzles: ['a1b2c', 'd3e4f'] }]; const k1 = flNext(u).key; arena.boss.list = []; const k2 = flNext(u).key; arena.boss.list = keep; return [k1, k2]; })()");
    check("flow: boss homework comes before the rest", ["claim", "boss"].includes(order[0]) && order[1] !== "boss", order);
    const nx = await pa.ev("flNext(currUser())");
    await pa.ev("ecaPlayNow()");
    const where = { claim: "tab === 'home'", boss: "tab === 'arena' && arena.sub === 'boss'", lesson: "tab === 'arena' && arena.sub === 'puzzles' && !!arena.puz.lesson", more: "tab === 'arena' && arena.sub === 'puzzles' && !!arena.puz.lesson", weekly: "tab === 'arena' && arena.sub === 'weekly'", dojo: "tab === 'arena' && arena.sub === 'puzzles'", bot: "tab === 'arena' && arena.sub === 'play'" }[nx.key];
    check("flow: play now opens the suggested activity", !!where && !!(await until(() => pa.ev(where), 10000)), nx);
    await pa.ev("lpAuto(); lpStart(lpDailyLesson(currUser()))");
    const lz = await until(() => pa.ev("arena.puz.status === 'play' && arena.puz.lesson && arena.puz.info ? { rating: arena.puz.info.rating, target: ecaPrTarget(currUser(), arena.puz), auto: arena.puz.lessonAuto, near: (() => { const t = ecaPrTarget(currUser(), arena.puz), d = []; (lpThemesOf(arena.puz.lesson) || []).forEach(th => ((ECA_THEME_BANK.themes || {})[th] || []).forEach(lv => lv.forEach(r => d.push(Math.abs(Number(r.split('|')[3]) - t))))); d.sort((x, y) => x - y); return d[Math.min(d.length - 1, 11 + 12)]; })() } : null"), 15000);
    check("adaptive: the lesson puzzle is near the student's level", !!lz && lz.auto === true && Math.abs(lz.rating - lz.target) <= lz.near, lz);
    check("flow: no play-now strip while already in that activity", await pa.ev("(() => { const n = flNext(currUser()); return !(n.key === 'lesson' || n.key === 'more') || !document.querySelector('.eca-play-strip'); })()"));
    check("adaptive: the level shows on the lesson banner", await pa.ev("document.getElementById('mainView').textContent.includes(String(ecaPrGet(currUser()).r))"));
    // ---------- care: hint ladder, the mistake explained, soft streak, nothing interrupts a game ----------
    await pa.ev("lpStart(lpDailyLesson(currUser()))");
    await until(() => pa.ev("arena.puz.status === 'play' && !!arena.puz.game"), 15000);
    check("care: a puzzle in progress counts as playing", await pa.ev("ecaIsPlaying() === true"));
    const ladder = await pa.ev(`(async () => {
      const Z = arena.puz, want = Z.sol[Z.idx], idx0 = Z.idx, out = {};
      puzHint(); out.l1 = Z.hint === want.slice(0, 2) && !Z.flash; out.label2 = document.getElementById('mainView').textContent.includes('2/3');
      puzHint(); out.l2 = Z.hint === want.slice(0, 2) && !!Z.flash && Z.flash[want.slice(2, 4)] === 'goal';
      puzHint(); out.l3 = Z.idx > idx0 && !Z.hint;
      return out; })()`);
    check("care: hint 1 shows the piece, hint 2 the square, hint 3 plays the move", ladder.l1 && ladder.l2 && ladder.l3 && ladder.label2, ladder);
    const why = await pa.ev(`(() => {
      const fen = '6k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1';
      return { same: careWhy(fen, { from: 'a1', to: 'a7' }, 'a1a8'), mate: careWhy(fen, { from: 'g1', to: 'f1' }, 'a1a8'), take: careWhy('6k1/5ppp/8/8/8/8/r4PPP/R5K1 w - - 0 1', { from: 'g1', to: 'f1' }, 'a1a2') };
    })()`);
    check("care: a wrong move gets a reason (right piece / mate / capture)", /القطعة صح|Right piece/.test(why.same) && /كش مات|mate in one/.test(why.mate) && /تاكلها|take/.test(why.take), why);
    const sk = await pa.ev(`(() => {
      const d = n => { const t = new Date(todayISO() + 'T12:00:00Z'); t.setUTCDate(t.getUTCDate() - n); return t.toISOString().slice(0, 10); };
      const six = [8, 7, 6, 5, 4, 3].map(d);
      return { back: streaks(six.concat([d(0)]), []), waiting: streaks(six, []), long: streaks([12, 11, 10, 9, 8, 7].map(d).concat([d(0)]), []) };
    })()`);
    check("care: missing 2 days halves the streak instead of zeroing it", sk.back.current === 4 && sk.back.best === 6 && sk.waiting.current === 0 && sk.waiting.comeback === 4 && sk.long.current === 1, sk);
    await pa.ev("lpExit(); switchTab('home')");
    check("care: home is not playing", await pa.ev("ecaIsPlaying() === false"));

    // ---------- no interruptions: popups wait for the game, a bot game survives a closed page, install card ----------
    await pa.ev("lpStart(lpDailyLesson(currUser()))");
    await until(() => pa.ev("arena.puz.status === 'play' && !!arena.puz.game"), 15000);
    const held = await pa.ev("(async () => { window.__held = 0; ecaWhenFree(() => { window.__held = 1; }); document.querySelectorAll('.eca-emote-pop').forEach(e => e.remove()); ecaEmotePop({ e: '👏', from: 'flowX', n: 'Knight' }, 0); await new Promise(r => setTimeout(r, 1500)); return { held: window.__held, pop: !!document.querySelector('.eca-emote-pop'), fx: fxPlaying() }; })()");
    check("calm: popups and cheers wait while a puzzle is being solved", held.held === 0 && !held.pop && held.fx === true, held);
    await pa.ev("lpExit(); switchTab('home')");
    check("calm: they show once the puzzle is over", !!(await until(() => pa.ev("window.__held === 1 && !!document.querySelector('.eca-emote-pop')"), 6000)));
    const bot = await pa.ev(`(async () => {
      const P = arena.play; switchTab('arena'); arenaSub('play');
      await new Promise(r => { const t = Date.now(); const w = () => (typeof ChessCls !== 'undefined' && ChessCls) || Date.now() - t > 15000 ? r() : setTimeout(w, 200); w(); });
      P.colorChoice = 'w'; P.tc = 0; P.level = 0; playStart(); playDo({ from: 'e2', to: 'e4' });
      await new Promise(r => { const t = Date.now(); const w = () => P.game.history().length >= 2 || Date.now() - t > 15000 ? r() : setTimeout(w, 200); w(); });
      const fen = P.game.fen(), saved = careSaveGame();
      window.confirm = () => false; switchTab('home'); const stayed = tab === 'arena' && careGameLive();
      P.game = null; P.over = ''; render();
      const offered = !!careResumeData() && flNext(currUser()).key === 'resume' && document.getElementById('mainView').textContent.includes('كمّل الدور');
      careResume();
      const back = !!P.game && P.game.fen() === fen && !careResumeData();
      return { saved, stayed, offered, back, moves: P.game ? P.game.history().length : 0 };
    })()`);
    check("calm: leaving a bot game by mistake asks first", bot.stayed === true, bot);
    check("calm: a closed page keeps the game, and play-now offers to resume it", bot.saved && bot.offered && bot.back, bot);
    const lost0 = (((await U(A)).arena || {}).games || {}).l || 0;
    await pa.ev("(async () => { careSaveGame(); arena.play.game = null; arena.play.over = ''; await careResumeDecline(); window.confirm = () => true; switchTab('home'); })()");
    check("calm: saying no counts the game as a loss, like leaving", !!(await until(async () => ((((await U(A)).arena || {}).games || {}).l || 0) === lost0 + 1, 15000)), lost0);
    const inst = await pa.ev("(() => { localStorage.setItem('ECA_VISIT_DAYS', JSON.stringify(['2026-01-01', '2026-01-02'])); localStorage.removeItem('ECA_INSTALL_LATER'); deferredInstall = { prompt() {}, userChoice: Promise.resolve() }; const shown = careInstallCheck(); const card = !!document.getElementById('ecaInstallCard'); careInstallLater(); const again = careInstallCheck(); deferredInstall = null; return { shown, card, gone: !document.getElementById('ecaInstallCard'), again }; })()");
    check("calm: install card on the third visit day, and «not now» hides it", inst.shown && inst.card && inst.gone && inst.again === false, inst);

    // ---------- fun: rotating quests, weekly event, golden puzzle, five-in-a-row chest ----------
    const qs = await pa.ev("(() => { funQuestSync(); const keys = ECA_QUESTS.map(q => q.key), want = ['lesson'].concat(funQuestsToday(currUser()).map(q => q.key)); const a = { puzStreak: 2 }; ecaQuestBump(a, 'puzzles'); return { keys, want, qs: a.qs, qsd: a.qsd === todayISO() }; })()");
    check("fun: today's quests are the lesson mission plus two from the pool", qs.keys.join() === qs.want.join() && qs.keys.length === 3 && new Set(qs.keys).size === 3, qs);
    check("fun: three in a row is tracked inside the puzzle save", qs.qs === 3 && qs.qsd, qs);
    const qsStars = (await U(A)).arena.stars;
    await pa.ev("window.fbEconomy({ op: 'earn', source: 'quest', key: 'streak3', day: todayISO() })");
    check("fun: a new quest pays its stars", !!(await until(async () => (await U(A)).arena.stars === qsStars + 2, 15000)));
    await pa.ev("funEventStart()");
    const evp = await until(() => pa.ev("arena.puz.lesson === 'ev' && arena.puz.status === 'play' && arena.puz.info ? { theme: arena.puz.info.themes[0], want: funEventTheme(), title: document.getElementById('mainView').textContent.includes(lpThemeName(funEventTheme())) } : null"), 15000);
    check("fun: the weekly event serves puzzles of this week's idea", !!evp && evp.theme === evp.want && evp.title, evp);
    await pa.ev("lpExit(); switchTab('home')");
    await pa.ev("(() => { const u = currUser(); u.arena.ev = { w: ecaWeekKey(), n: 15 }; save(); })()");
    await until(async () => ((((await U(A)).arena || {}).ev) || {}).n === 15, 15000);
    const evStars = (await U(A)).arena.stars;
    check("fun: the event card offers the reward when it is done", !!(await until(() => pa.ev("document.getElementById('mainView').innerHTML.includes('funEventClaim()')"), 10000)));
    await pa.ev("funEventClaim()");
    check("fun: the weekly event pays 8 stars once and is marked done", !!(await until(async () => { const x = (await U(A)).arena; return x.stars === evStars + 8 && x.evc === await pa.ev("ecaWeekKey()"); }, 15000)));
    await pa.ev("funEventClaim()"); await sleep(2000);
    check("fun: the weekly event cannot be claimed twice", (await U(A)).arena.stars === evStars + 8);
    await sleep(3500);
    await pa.ev("arena.puz.forceGold = true; lpStart(lpDailyLesson(currUser()))");
    await until(() => pa.ev("arena.puz.status === 'play' && !!arena.puz.golden && arena.puz.golden === arena.puz.game"), 15000);
    check("fun: a golden puzzle shows its banner", await pa.ev("!!document.querySelector('.eca-golden')"));
    const solvedGold = await pa.ev(`(async () => { const Z = arena.puz; Z.prRun = 4;
      for (let g = 0; g < 200 && Z.status !== 'solved'; g++) { if (Z.status === 'play' && Z.sol[Z.idx]) { const m = Z.sol[Z.idx]; puzPlay(m.length > 4 ? { from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] } : { from: m.slice(0, 2), to: m.slice(2, 4) }); } await new Promise(r => setTimeout(r, 150)); }
      return Z.status; })()`);
    const cday = await pa.ev("window.ecaCairoDay()");
    check("fun: solving the golden puzzle first try pays its reward", solvedGold === "solved" && !!(await until(() => read("users/" + A + "/economy/golden-" + cday), 15000)), solvedGold);
    check("fun: five in a row opens the streak chest", !!(await until(() => read("users/" + A + "/economy/combo-" + cday), 15000)));
    await pa.ev("lpExit(); switchTab('home')");

    // ---------- assist: first-run tour, back where you left off, comfort settings ----------
    const tour = await pa.ev(`(() => { const u = currUser(), a = u.arena, keep = { t: a.puzTried, d: a.days }; a.puzTried = 0; a.days = [];
      localStorage.removeItem('ECA_TOUR_' + u.id); const old = document.getElementById('ecaTour'); if (old) old.remove(); switchTab('home');
      const shown = !!document.getElementById('ecaTour'); asTourNext(); asTourNext(); const last = document.getElementById('ecaTour').textContent;
      asTourEnd(false); a.puzTried = keep.t; a.days = keep.d; a.puzTried = 0; const again = asTourDue(); a.puzTried = keep.t;
      return { shown, last: /العب دلوقتي|Play now/.test(last), gone: !document.getElementById('ecaTour'), again }; })()`);
    check("assist: first-run tour shows three steps once and can be closed", tour.shown && tour.last && tour.gone && tour.again === false, tour);
    const back = await pa.ev("(() => { const u = currUser(); asPlaceReady = ''; localStorage.setItem('ECA_LAST_PLACE', JSON.stringify({ uid: u.id, at: Date.now(), tab: 'arena', sub: 'cards', lesson: '' })); switchTab('home'); const where = tab + '|' + arena.sub; switchTab('home'); return where; })()");
    check("assist: opening again brings the student back where they were", back === "arena|cards", back);
    const comfort = await pa.ev(`(() => { const h = document.documentElement, out = {};
      out.menu = document.body.innerHTML.includes('asComfortOpen()');
      asComfortOpen(); out.modal = !!document.getElementById('ecaComfort');
      asComfortToggle('big'); asComfortToggle('cb'); asComfortToggle('text'); out.on = h.classList.contains('eca-big-board') && h.classList.contains('eca-cb') && h.classList.contains('eca-big-text');
      asComfortToggle('calm'); document.querySelectorAll('.eca-fx-canvas').forEach(e => e.remove()); ecaConfetti(20); out.calm = h.classList.contains('eca-calm') && !document.querySelector('.eca-fx-canvas');
      ['big', 'cb', 'text', 'calm'].forEach(k => asComfortToggle(k)); out.off = !['eca-big-board', 'eca-cb', 'eca-big-text', 'eca-calm'].some(c => h.classList.contains(c));
      asComfortClose(); out.closed = !document.getElementById('ecaComfort'); return out; })()`);
    check("assist: comfort settings turn on and off from the account menu", comfort.menu && comfort.modal && comfort.on && comfort.calm && comfort.off && comfort.closed, comfort);
    await pg.send("Page.bringToFront");
    await pg.ev("switchTab('command')");
    check("assist: the coach sees «need your attention»", !!(await until(() => pg.ev("!!document.getElementById('asAlerts')"), 10000)));
    const alerts = await pg.ev(`(() => { db.users.push({ id: 'flowFake1', role: 'student', name: 'Test Kid', group: 'A', arena: { days: ['2020-01-01'], mot: { fork: { t: 10, s: 2 } } } });
      const mine = asAlerts().filter(x => x.s.id === 'flowFake1').map(x => x.icon); db.users.pop();
      const first = cmdStudents()[0]; asCheer(first.id); const picked = CMD.dropTo === 's:' + first.id;
      const text = prSummaryText(first); return { mine, picked, encourage: text.includes('💬') }; })()`);
    check("assist: an absent student and a weak idea both raise an alert", alerts.mine.includes("💤") && alerts.mine.includes("🧩"), alerts);
    check("assist: 🎁 picks the student in the live reward box", alerts.picked, alerts);
    check("assist: the parent summary ends with something to encourage", alerts.encourage, alerts);
    await pa.send("Page.bringToFront");

    // ---------- fixes: board in view when a game opens, quest rewards, no "already collected" message ----------
    await pa.ev("switchTab('arena'); arenaSub('lessons')");
    await sleep(500);
    await pa.ev("window.scrollTo(0, document.documentElement.scrollHeight)");
    await sleep(300);
    await pa.ev("lpStart(lpDailyLesson(currUser()))");
    const view = await until(() => pa.ev("(() => { if (arena.puz.status !== 'play') return null; const b = document.querySelector('#mainView .eca-board'), r = b && b.getBoundingClientRect(); return r ? { top: Math.round(r.top), bottom: Math.round(r.bottom), h: innerHeight, y: Math.round(scrollY) } : null; })()"), 15000);
    check("fix: opening a game from the bottom of the page shows the board", !!view && view.top >= 0 && view.top < view.h / 2, view);
    await pa.ev("lpExit(); switchTab('home')");
    const q0 = (await U(A)).arena.stars;
    // قبل التصليح الزرار كان بيرجع ok:false من غير ما يوصل للجايزة. دلوقتي بيدفع، أو بيقول «اتاخدت» لو اتاخدت النهاردة
    const qr = await pa.ev("(async () => { const out = {}; for (const k of ['rush6', 'streak3']) { const r = await ecaAwardStudentActivity('quest', k); out[k] = r && { ok: r.ok, dup: !!r.duplicate, s: r.starsDelta || 0 }; } return out; })()");
    const paid = ["rush6", "streak3"].reduce((n, k) => n + (qr[k] && !qr[k].dup ? qr[k].s : 0), 0);
    check("fix: the new daily quests pay through the claim button", ["rush6", "streak3"].every(k => qr[k] && qr[k].ok === true && (qr[k].dup || qr[k].s === 2)) && !!(await until(async () => (await U(A)).arena.stars === q0 + paid, 15000)), qr);
    await sleep(3500);
    const r0 = (await U(A)).arena;
    const race = await pa.ev(`Promise.all([
      window.fbEconomy({ op: 'earn', source: 'vision', key: todayISO(), day: todayISO(), score: 9 }),
      recordAttempt('arena', 'raceTest' + Date.now().toString(36), true, u => { const a = u.arena; markActiveDay(u); a.puzTried = (a.puzTried || 0) + 1; a.puzSolved = (a.puzSolved || 0) + 1; a.puzStreak = (a.puzStreak || 0) + 1; a.puzBestStreak = Math.max(a.puzBestStreak || 0, a.puzStreak); })
    ]).then(([e, t]) => ({ reward: !!(e && e.ok), attempt: !!(t && t.ok) }))`);
    check("fix: a reward and a puzzle save at the same moment both go through", race.reward && race.attempt && !!(await until(async () => { const x = (await U(A)).arena; return x.stars === r0.stars + 3 && x.puzTried === (r0.puzTried || 0) + 1; }, 15000)), race);
    const dup = await pa.ev("(async () => { const t = document.getElementById('toast'); await ecaAwardStudentActivity('puzzle', 'easiest'); t.textContent = ''; await ecaAwardStudentActivity('puzzle', 'easiest'); return t.textContent; })()");
    check("fix: no «reward already collected» message on the next puzzles", !/سبق الحصول|already collected/.test(dup || ""), dup);

    // ---------- arena lobby: hero card, three tabs with two cards each, all games drawer ----------
    check("lobby: the arena opens on the lobby", await pe.ev("(() => { switchTab('arena'); const on = arena.sub === 'lobby' && !!document.querySelector('.lb-hero'); switchTab('home'); return on; })()"));
    await pa.ev("switchTab('arena'); arenaSub('lobby')");
    const hero = await pa.ev(`(() => { const keep = arena.boss.list, out = {};
      arena.boss.list = [{ id: 'lobbyBoss1', title: 'Fork Dragon', done: false, dueMs: Date.now() + 864e5, solved: ['a'], puzzles: ['a', 'b', 'c'] }]; render();
      const h1 = document.querySelector('.lb-hero'); out.boss = h1.classList.contains('lb-crimson') && /هاجم الزعيم|Attack the boss/.test(h1.textContent) && !!h1.querySelector('[role=progressbar]');
      arena.boss.list = []; render();
      const h2 = document.querySelector('.lb-hero'); out.step = h2.classList.contains('lb-emerald') && /كمّل Step|Continue Step/.test(h2.textContent);
      arena.boss.list = keep; render(); return out; })()`);
    check("lobby: the hero card shows the boss, then the current step when there is none", hero.boss && hero.step, hero);
    const tabsOk = await pa.ev(`(() => { const out = {};
      for (const [k, want] of [['solo', /مغامرة الدروس[\\s\\S]*دوجو الانتقام/], ['arcade', /تحدي 60 ثانية[\\s\\S]*تحدي صاحبك/], ['events', /تحدي الأسبوع[\\s\\S]*بطولة السرعة/]]) {
        lobbyTab(k); const cards = [...document.querySelectorAll('.lb-cards .lb-card')];
        out[k] = cards.length === 2 && want.test(cards.map(c => c.textContent).join(' ')) && cards.every(c => c.tagName === 'BUTTON' && c.querySelector('.lb-card-icon') && c.querySelector('.lb-card-title') && c.querySelector('.lb-pill'));
      }
      out.selected = document.querySelector('.lb-tab.is-on').getAttribute('aria-selected') === 'true';
      out.chips = document.querySelectorAll('.lb-all .lb-chip').length; return out; })()`);
    check("lobby: three tabs, two one-tap cards each (icon, title, status)", tabsOk.solo && tabsOk.arcade && tabsOk.events && tabsOk.selected, tabsOk);
    check("lobby: every game is still one tap away in «all games»", tabsOk.chips === 13, tabsOk.chips);
    const pills = await until(() => pa.ev("(() => { lobbyTab('events'); const p = [...document.querySelectorAll('.lb-cards .lb-pill')].map(x => x.textContent); return /المحاولات|حليته|ما نزلش|Attempts|Solved|Not posted/.test(p[0]) && /شغّالة|تبدأ بعد|LIVE|Starts in/.test(p[1]) ? p : null; })()"), 15000);
    check("lobby: events show the weekly attempts and the tournament clock", !!pills, pills);
    const open = await pa.ev("(() => { lobbyTab('arcade'); lbOpen('rush'); const inGame = arena.sub === 'rush' && !!document.querySelector('#mainView button[onclick=\"arenaSub(\\'lobby\\')\"]') && !document.querySelector('.lb-hero'); arenaSub('lobby'); return inGame && arena.sub === 'lobby'; })()");
    check("lobby: a card opens its game, and «lobby» brings you back", open);
    const pcs = await pb.ev(`(async () => {
      const u = currUser(), keep = ((u.shop || {}).eq || {}).p || "", out = {}, imgs = () => document.querySelectorAll('#mainView .eca-board img.eca-pimg').length, glyphs = () => document.querySelectorAll('#mainView .eca-board .eca-pc').length;
      ecaEquip('p', ''); switchTab('arena'); arenaSub('puzzles');
      await new Promise(r => { const t = Date.now(); const w = () => (arena.puz.status === 'play' || Date.now() - t > 15000) ? r() : setTimeout(w, 200); w(); });
      out.def = pieceSet === 'lichess' && imgs() > 0 && glyphs() === 0;
      out.noChoice = !document.querySelector('#mainView [onclick^="setPieceSet"]') && !!document.querySelector('#mainView [onclick="ecaPieceShop()"]');
      ecaEquip('p', 'piece-gold'); out.skin = pieceSet === 'classic' && document.documentElement.dataset.ecap === 'piece-gold' && glyphs() > 0 && imgs() === 0;
      ecaEquip('p', ''); out.back = pieceSet === 'lichess' && imgs() > 0;
      if (keep) ecaEquip('p', keep); switchTab('home'); return out; })()`);
    check("pieces: Lichess pieces by default with no other choice, bought pieces replace them while worn", pcs.def && pcs.noChoice && pcs.skin && pcs.back, pcs);
    if (process.env.E2E_SHOTS) for (const [w, h, tabK] of [[375, 812, "solo"], [375, 812, "events"], [1280, 900, "arcade"]]) {
      await pa.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
      await pa.ev("switchTab('arena'); arenaSub('lobby'); lobbyTab('" + tabK + "'); window.scrollTo(0, 0)"); await sleep(900);
      const shot = await pa.send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(process.env.E2E_SHOTS, "lobby-" + w + "-" + tabK + ".png"), Buffer.from(shot.data, "base64"));
    }
    if (process.env.E2E_SHOTS) await pa.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await pa.ev("switchTab('home')");
    await pa.ev("lpExit(); switchTab('home')");

    // ---------- connection drops: banner, and a reward earned offline is saved once, when it is back ----------
    await pa.send("Page.bringToFront");
    const aStars0 = (await U(A)).arena.stars;
    const net = offline => pa.send("Network.emulateNetworkConditions", { offline, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await net(true);
    check("offline: banner shows", !!(await until(() => pa.ev("!!document.getElementById('ecaNetBanner')"), 5000)));
    const offR = await pa.ev('Promise.race([window.fbEconomy({op:"earn",source:"pawn",key:todayISO(),day:todayISO()}).then(r=>r&&(r.code||(r.ok?"ok":"no"))).catch(e=>"threw "+(e&&e.code)), new Promise(r=>setTimeout(()=>r("pending"),25000))])');
    await net(false);
    check("offline: the reward is queued, not lost", ["offline-queued", "ok", "pending"].includes(offR), offR);
    check("offline: saved when the connection is back", !!(await until(async () => (await U(A)).arena.stars === aStars0 + 2, 40000)), { before: aStars0, after: (await U(A)).arena.stars, offR, pending: await pa.ev("window.ecaPendingRewards ? ecaPendingRewards() : -1"), errors: pa.errors.slice(-3) });
    await sleep(3000);
    check("offline: saved only once", (await U(A)).arena.stars === aStars0 + 2, (await U(A)).arena.stars - aStars0);
    check("offline: banner goes away", !!(await until(() => pa.ev("!document.getElementById('ecaNetBanner')"), 5000)));

    // ---------- small phones (320px): no sideways scroll, touch targets >= 44px ----------
    await pa.send("Page.bringToFront");
    await pa.send("Emulation.setDeviceMetricsOverride", { width: 320, height: 640, deviceScaleFactor: 1, mobile: true });
    const fit = `(() => { const W = innerWidth, wide = document.documentElement.scrollWidth > W + 1;
      const small = [...document.querySelectorAll("#mainView button, #mainView [onclick], #navButtons button, .eca-hud button, #ecaHud button")].filter(e => {
        if (e.closest(".eca-board") || e.disabled) return false; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return false;
        const st = getComputedStyle(e); if (st.visibility === "hidden" || st.display === "none") return false;
        return r.height < 43.5 || r.width < 43.5; }).map(e => (e.getAttribute("onclick") || e.title || e.textContent || e.tagName).trim().slice(0, 40) + " " + Math.round(e.getBoundingClientRect().width) + "x" + Math.round(e.getBoundingClientRect().height));
      return { wide: wide ? document.documentElement.scrollWidth : 0, small: [...new Set(small)].slice(0, 40) }; })()`;
    const views = [["home", "switchTab('home')"]].concat(["lobby", "play", "puzzles", "lessons", "rush", "vision", "pawns", "duel", "friend", "speed", "weekly", "boss", "cards", "analysis"].map(v => [v, `switchTab('arena'); arena.sub='${v}'; render();`]));
    const fitBad = [];
    for (const [name, go] of views) { await pa.ev(go); await sleep(700); const r = await pa.ev(fit); if (r.wide || r.small.length) fitBad.push({ view: name, ...r }); }
    check("320px: no sideways scroll on any view", !fitBad.some(r => r.wide), fitBad.filter(r => r.wide));
    check("320px: touch targets are 44px or more", !fitBad.some(r => r.small.length), fitBad.filter(r => r.small.length));
    await pa.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await pa.ev("switchTab('home')");
    const hb = await U(A), hs = hb.arena.stars, hh = (hb.shop && hb.shop.hints) || 0;
    if (hs >= 20) {
      await pa.ev("buyShopItem('hint'); buyShopItem('hint');");
      await until(async () => ((await U(A)).shop.hints || 0) > hh, 15000); await sleep(3000);
      const ha = await U(A);
      check("shop: a double tap buys once", (ha.shop.hints || 0) === hh + 1 && ha.arena.stars === hs - 20, { hints: (ha.shop.hints || 0) - hh, stars: ha.arena.stars - hs });
    } else check("shop: a double tap buys once (needs 20 stars)", false, hs);
    check("audio: one shared sound context", await pa.ev("typeof ecaAudio === 'function'"));
    check("system check: students can't run it on the real site", await pa.ev("ecaDiagAllowed('eca-website-for-coach.vercel.app') === false"));

    // ---------- system check (read-only) and listener cleanup ----------
    await pa.send("Page.bringToFront");
    await pa.ev("switchTab('arena'); arena.sub='friend'; render();"); await sleep(800);
    await pa.ev("arena.sub='speed'; render();"); await sleep(800);
    await pa.ev("switchTab('home')"); await sleep(800);
    const openA = await pa.ev("ecaListeners().map(l => l.name)");
    check("listeners: closed views stop listening", !openA.includes("friendDuel") && !openA.includes("speedArenaBoard") && !openA.includes("duelLobby") && !openA.includes("leaderboard"), openA);
    check("listeners: no duplicates", new Set(openA).size === openA.length, openA);
    await pa.ev("switchTab('arena'); arena.sub='lessons'; render();");
    await until(() => pa.ev("!!ChessCls"), 15000);
    const diagA = await pa.ev("runSystemDiagnostics().then(r => ({ pass: r.pass, fail: r.fail, failed: r.results.filter(x => x.result === 'FAIL').map(x => x.check + ': ' + x.detail) }))");
    check("diagnostics: student check passes", !!diagA && diagA.fail === 0 && diagA.pass >= 20, diagA);
    await pa.ev("switchTab('home')");
    await pg.send("Page.bringToFront");
    await pg.ev("switchTab('command')");
    const diagG = await pg.ev("runSystemDiagnostics().then(r => ({ pass: r.pass, fail: r.fail, failed: r.results.filter(x => x.result === 'FAIL').map(x => x.check + ': ' + x.detail) }))");
    check("diagnostics: coach check passes", !!diagG && diagG.fail === 0 && diagG.pass >= 10, diagG);
    const bk = await pg.ev("(() => { const d = cmdBackupData(); return d && { n: d.counts.students, g: d.counts.groups, hasGroups: Array.isArray(d.groups), noCodes: !JSON.stringify(d.students).includes('parentCode'), names: d.students.every(s => typeof s.name === 'string') }; })()");
    check("backup: coach export has students and groups, no parent codes", !!bk && bk.n >= 3 && bk.hasGroups && bk.g >= 1 && bk.noCodes && bk.names, bk);
    check("backup: the button downloads a JSON file", await pg.ev("(() => { let f = ''; const o = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function () { f = this.download + '|' + this.href.slice(0, 5); }; try { cmdExportBackup(); } finally { HTMLAnchorElement.prototype.click = o; } return /^eca-backup-[0-9]{4}-[0-9]{2}-[0-9]{2}[.]json[|]blob:$/.test(f); })()"));
    check("weekly: the stored solution is not plain text", await (async () => { const d = await read("coachChallenges/" + wkNow); return !!d && typeof d.moves === "string" && d.moves.startsWith(" ") && d.moves.trim() !== wkMoves; })());
    check("banks: solutions in the files are encoded", await pa.ev("fetch('puzzles.js').then(r => r.text()).then(t => t.includes('eca-enc:1') && !t.includes('0FCbL|8/7p/5kp1/r4p2/p7/R7/1N1K4/8 b - - 7 47|f6e5'))"));
    await pg.ev("showSystemDiagnostics()");
    check("diagnostics: coach panel shows the results", !!(await until(() => pg.ev("!!document.getElementById('ecaDiagModal') && /PASS/.test(document.getElementById('ecaDiagModal').textContent)"), 20000)));
    await pg.ev("document.getElementById('ecaDiagModal').remove()");

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

    // ---------- logout closes every listener ----------
    await pc.send("Page.bringToFront");
    await pc.ev("logout()");
    check("listeners: logout closes them all", !!(await until(() => pc.ev("!currUser() && ecaListeners().length === 0"), 10000)), await pc.ev("ecaListeners().map(l => l.name)"));

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
