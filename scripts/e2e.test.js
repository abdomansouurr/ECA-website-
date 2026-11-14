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
const types = { ".html": "text/html", ".js": "text/javascript", ".wasm": "application/wasm", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };
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
      if (/permission|denied|insufficient/i.test(t)) { page.denied.push(t.slice(0, 900)); console.log("  ! denied on " + page.label + ": " + t.slice(0, 200)); }   // printed in place, so the log shows which test it came from
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
    const conf = await pa.ev("(async()=>{ const calm = document.documentElement.classList.contains('eca-calm'), rm = matchMedia('(prefers-reduced-motion: reduce)').matches, before = document.querySelectorAll('.eca-fx-canvas').length; ecaConfetti(20); const on=!!document.querySelector('.eca-fx-canvas'); let i=0; for(;i<40&&document.querySelector('.eca-fx-canvas');i++) await new Promise(r=>setTimeout(r,250)); return { on, gone: !document.querySelector('.eca-fx-canvas'), calm, rm, before, waited: i, hidden: document.hidden }; })()");
    check("confetti draws and cleans up", conf.on && conf.gone, conf);
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
    // ---------- coach: a wrong move in a lesson gets the opponent's punishing reply, then the board comes back ----------
    const refA = await pa.ev(`(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
      const ready = async () => { for (let i = 0; i < 60 && !(arena.puz.status === 'play' && arena.puz.game); i++) await wait(250); };
      const nonMate = (fen, m) => { const c = new ChessCls(fen); c.move(m); return !c.isCheckmate(); };
      let pick = null, maxMs = 0, tried = 0;
      for (let tries = 0; tries < 15 && !pick; tries++) {
        await ready();
        const Z = arena.puz, g = Z.game, want = Z.sol[Z.idx], pre = g.fen();
        for (const m of g.moves({ verbose: true })) {
          const u = m.from + m.to + (m.promotion || '');
          if (u === want || !nonMate(pre, m)) continue;
          const a = ChessPositionAnalyzer.analyze(pre, u, want, Z.info.themes); tried++;
          if (a) maxMs = Math.max(maxMs, a.ms);
          if (a && a.refutation && a.diag) { pick = { m: { from: m.from, to: m.to, promotion: m.promotion }, a, pre }; break; }
        }
        if (!pick) { puzLoad(); await wait(300); }
      }
      out.found = !!pick; out.maxMs = Math.round(maxMs * 10) / 10; out.tried = tried;
      if (!pick) return out;
      out.type = pick.a.diag.type;
      const Z = arena.puz, g = Z.game, hist0 = g.history().length;
      const real = window.fbVaultFail; let vf = 0; window.fbVaultFail = function () { vf++; return real.apply(this, arguments); };
      try {
        puzPlay(pick.m);
        out.locked = Z.isRefuting === true && Z.status === 'wrong' && !!document.querySelector('#mainView .eca-board.eca-coach-lock');
        await wait(500);
        const last = g.history({ verbose: true }).slice(-1)[0];
        out.replied = g.history().length === hist0 + 2 && last.from === pick.a.refutation.from && last.to === pick.a.refutation.to;
        const svg = document.querySelector('#mainView .eca-board .eca-coach-svg');
        out.arrow = !!(svg && svg.querySelector('.eca-co-ref') && svg.querySelector('.eca-co-ref-head'));
        out.svgBox = !!svg && Math.abs(svg.getBoundingClientRect().width - document.querySelector('#mainView .eca-board').clientWidth) <= 1;
        const box = document.querySelector('#mainView .eca-coach-toast'), skip = box && box.querySelector('.eca-coach-skip');
        out.title = !!box && box.textContent.includes(CoachKnowledgeBot.title(pick.a.diag.type));
        out.skipLabel = !!skip && /فهمت السبب|Got it/.test(skip.textContent);
        out.skipSize = skip ? Math.round(Math.min(skip.getBoundingClientRect().width, skip.getBoundingClientRect().height)) : 0;
        const panel = document.querySelector('#mainView .eca-coach-panel');
        out.panelEarly = !!panel && !!panel.querySelector('.eca-gm-layer[data-layer="1"]');
        out.panelSquares = !!panel && panel.textContent.includes(pick.a.refutation.to) && panel.querySelectorAll('.eca-sq-tok[dir="ltr"]').length >= 1;
        out.panelBelow = !!panel && panel.getBoundingClientRect().top >= document.querySelector('#mainView .eca-board').getBoundingClientRect().bottom - 1;
        const st0 = Z.status; puzClick(pick.m.from); out.inputLocked = Z.status === st0 && Z.isRefuting === true && !Z.sel;
        skip.click(); await wait(100);
        out.skipRestored = g.fen() === pick.pre && Z.isRefuting === false && Z.status === 'play' && !document.querySelector('#mainView .eca-coach-svg, #mainView .eca-coach-toast, #mainView .eca-board.eca-coach-lock');
        out.panelStays = !!document.querySelector('#mainView .eca-coach-panel');
        // كارت الجراند ماستر بعد ما المحرك يخلص: 4 طبقات + شارة بلون الدرجة + زرار التكملة
        for (let i = 0; i < 60 && !(Z.coachPanel && Z.coachPanel.rv); i++) await wait(100);
        const card = document.querySelector('#mainView .eca-gm-card[data-tier]:not([data-tier=""])'), rv = Z.coachPanel && Z.coachPanel.rv;
        out.gmTier = rv ? rv.tier : ''; out.gmLayers = card ? card.querySelectorAll('.eca-gm-layer').length : 0;
        out.gmBad = ['INACCURACY', 'MISTAKE', 'MISSED_WIN', 'BLUNDER'].includes(out.gmTier);
        out.gmBadge = !!card && !!rv && card.querySelector('.eca-gm-badge').textContent === ecaGM.tiers[rv.tier].sym && card.style.getPropertyValue('--gm').trim() === ecaGM.tiers[rv.tier].color;
        out.gmTitle = !!card && !!rv && card.querySelector('.eca-gm-title').textContent.includes(ecaGM.tiers[rv.tier].ar);
        out.gmNoSolution = !document.getElementById('mainView').innerHTML.includes(Z.sol[Z.idx]) && !/أفضل نقلة كانت/.test(card ? card.textContent : '');
        const fb = card && card.querySelector('.eca-gm-follow');
        out.followSize = fb ? Math.round(Math.min(fb.getBoundingClientRect().width, fb.getBoundingClientRect().height)) : 0;
        if (fb) {
          fb.click(); await wait(500);
          out.followOn = Z.status === 'follow' && g.fen() !== pick.pre && !!document.querySelector('#mainView .eca-gm-svg .eca-gm-num') && !!document.querySelector('#mainView .eca-gm-followbar');
          for (let i = 0; i < 90 && Z.gmFollow && Z.gmFollow.i < Z.gmFollow.moves.length; i++) await wait(100);
          out.followSteps = Z.gmFollow ? Z.gmFollow.i : 0; out.followNums = document.querySelectorAll('#mainView .eca-gm-svg .eca-gm-num').length;
          const back = document.querySelector('#mainView .eca-gm-back');
          out.backSize = back ? Math.round(Math.min(back.getBoundingClientRect().width, back.getBoundingClientRect().height)) : 0;
          back.click(); await wait(150);
          out.followBack = !Z.gmFollow && Z.status === 'play' && g.fen() === pick.pre && !document.querySelector('#mainView .eca-gm-followbar, #mainView .eca-gm-num');
        }
        // النقلة الغلط بعد ما الرقعة رجعت: الشارة + سهم باهت مكانها بيفضلوا 3 ثواني وأكتر (لحد النقلة الجاية)
        await wait(3000);
        const pb = document.querySelector('#mainView .eca-gm-svg .eca-gm-sqbadge[data-sq="' + pick.m.to + '"]');
        out.badgeStays = !!pb && getComputedStyle(pb).opacity === '1' && getComputedStyle(pb).display !== 'none' && !!document.querySelector('#mainView .eca-gm-svg .eca-gm-ghost') && !!document.querySelector('#mainView .eca-gm-card .eca-gm-badge');
        out.analyzeBtn = !!document.querySelector('#mainView .eca-gm-card .eca-gm-analyze');
        const second = g.moves({ verbose: true }).find(m => { const u = m.from + m.to + (m.promotion || ''); return u !== Z.sol[Z.idx] && nonMate(g.fen(), m); });
        puzPlay({ from: second.from, to: second.to, promotion: second.promotion });
        out.secondLocked = Z.isRefuting === true;
        await wait(ecaCoach.show + 700);
        out.autoRestored = g.fen() === pick.pre && Z.isRefuting === false && Z.status === 'play';
        await wait(800); out.vaultWrites = vf;
      } finally { window.fbVaultFail = real; }
      return out; })()`);
    check("coach: a wrong move locks the board and the opponent plays the exact punishing reply with a red arrow", refA.found && refA.locked && refA.replied && refA.arrow && refA.svgBox && refA.inputLocked, refA);
    check("coach: the coach card appears at once under the board with the squares in LTR", refA.title && refA.panelEarly && refA.panelSquares && refA.panelBelow, refA);
    check("GM coach: the wrong move gets a class (?! ? ⚡ ??) with its Chess.com badge, color and Arabic title, in a 4-layer card", refA.gmBad && refA.gmLayers === 4 && refA.gmBadge && refA.gmTitle, refA);
    check("GM coach: in a running puzzle the card never shows the solution", refA.gmNoSolution, refA);
    check("GM coach: the wrong move's badge and faded arrow stay on the board 3 seconds after it restores (until the next move), and the card has «🔬 Analyze»", refA.badgeStays && refA.analyzeBtn, refA);
    check("GM coach: «▶ show the follow-up» (44px) plays the line on the board with numbered arrows, and «↩ back» (44px) restores the exact position", refA.followSize >= 44 && refA.followOn && refA.followSteps >= 2 && refA.followNums === refA.followSteps && refA.backSize >= 44 && refA.followBack, refA);
    check("coach: «got it — try again» (44px) and the 2.6s timer bring back the position, and the explanation stays to read", refA.skipLabel && refA.skipSize >= 44 && refA.skipRestored && refA.panelStays && refA.secondLocked && refA.autoRestored, refA);
    check("coach: two wrong moves on one puzzle log it in the mistake vault once", refA.vaultWrites === 1, refA.vaultWrites);
    check("coach: the deep search finds the punishing reply in under 30ms", refA.maxMs < 30, { maxMs: refA.maxMs, tried: refA.tried });
    // ---------- coach: each kind of mistake, on positions built for it ----------
    const kinds = await pa.ev(`(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms)), Z = arena.puz, out = {};
      const craft = async (fen, sol, wrong) => {
        coachCancelAll();
        const g = new ChessCls(fen);
        Object.assign(Z, { game: g, sol: [sol], idx: 0, color: g.turn(), flip: false, last: null, counted: true, status: 'play', review: false, info: { id: 'craft', rating: 1200, themes: [] }, coachPanel: null, coachStage: 0, coachKey: null });
        render(); const f0 = g.fen();
        puzPlay({ from: wrong.slice(0, 2), to: wrong.slice(2, 4) }); await wait(500);
        const R = Z.refute || {}, panel = document.querySelector('#mainView .eca-coach-panel'), svg = document.querySelector('#mainView .eca-coach-svg');
        const r = { type: R.diag && R.diag.type, reply: (g.history({ verbose: true }).slice(-1)[0] || {}).to, text: panel ? panel.textContent.replace(/\\s+/g, ' ') : '',
          dash: svg ? svg.querySelectorAll('.eca-co-dash').length : 0, amber: svg ? svg.querySelectorAll('.eca-co-ring-amber').length : 0, badge: !!(svg && svg.querySelector('.eca-co-badge')),
          dots: !!(svg && svg.querySelector('.eca-co-dots')), xray: !!(svg && svg.querySelector('.eca-co-xray')), ring: svg ? svg.querySelectorAll('.eca-co-ring').length : 0 };
        coachSkip(); await wait(60); r.back = g.fen() === f0;
        return r;
      };
      out.fork = await craft('6k1/8/8/4n3/8/8/3Q2P1/6K1 w - - 0 1', 'd2d3', 'g2g3');
      out.abandoned = await craft('4r1k1/8/8/8/4B3/2N5/8/6K1 w - - 0 1', 'e4d5', 'c3b5');
      out.hanging = await craft('4k3/8/3p4/8/8/5N2/8/4K3 w - - 0 1', 'f3d4', 'f3e5');
      out.mate = await craft('4r1k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1', 'h2h3', 'd1d7');
      out.threat = await craft('2r4k/8/8/8/2B5/8/P7/6K1 w - - 0 1', 'c4b5', 'a2a3');
      out.pin = await craft('r5k1/8/8/8/3K4/8/4Q3/8 w - - 0 1', 'e2e3', 'd4e4');
      Z.status = 'idle'; Z.game = null; Z.counted = false; puzLoad();   // back to a normal lesson puzzle in play, like before these tests
      for (let i = 0; i < 60 && !(Z.status === 'play' && Z.game); i++) await wait(250);
      return out; })()`);
    const has = (r, ...words) => words.every(w => r.text.includes(w));
    check("coach: a move that allows a fork names the knight, the fork square and both targets, with two amber arrows", kinds.fork.type === "ALLOWED_OPPONENT_FORK" && kinds.fork.reply === "f3" && has(kinds.fork, "الحصان", "f3", "d2", "g1", "شوكة") && kinds.fork.dash === 2 && kinds.fork.amber === 2 && kinds.fork.back, kinds.fork);
    check("coach: a defender walking away shows the broken shield, the dotted line, and names both pieces and squares", kinds.abandoned.type === "ABANDONED_DEFENSE" && kinds.abandoned.reply === "e4" && has(kinds.abandoned, "الحصان", "c3", "b5", "الفيل", "e4", "الرخ (القلعة)", "e8") && kinds.abandoned.badge && kinds.abandoned.dots && kinds.abandoned.back, kinds.abandoned);
    check("coach: a piece moved to a guarded square names the square and the pawn that takes it", kinds.hanging.type === "MOVED_TO_HANGING_SQUARE" && kinds.hanging.reply === "e5" && has(kinds.hanging, "e5", "d6", "البيدق (العسكري)", "الحصان") && kinds.hanging.ring >= 1 && kinds.hanging.back, kinds.hanging);
    check("coach: walking into mate names the king's square and the mating move", kinds.mate.type === "WALKED_INTO_MATE" && kinds.mate.reply === "e1" && has(kinds.mate, "g1", "e8", "e1", "كش مات") && kinds.mate.back, kinds.mate);
    check("coach: an ignored threat names the threatened bishop and its square", kinds.threat.type === "IGNORED_EXISTING_THREAT" && kinds.threat.reply === "c4" && has(kinds.threat, "الفيل", "c4", "تهديد") && kinds.threat.back, kinds.threat);
    check("coach: a pin or skewer draws the x-ray line through both pieces", kinds.pin.type === "ALLOWED_OPPONENT_PIN_OR_SKEWER" && kinds.pin.xray && has(kinds.pin, "e4", "e2") && kinds.pin.back, kinds.pin);
    // ---------- GM coach: the right move in a puzzle gets its badge (!! for a sacrifice, ! for the only move) and its sound ----------
    const gmP = await pa.ev(`(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms)), Z = arena.puz, out = {}, notes = [], real = window.sfxNotes;
      window.sfxNotes = function (n) { notes.push(n.join('-')); };
      const craft = (fen, sol) => { coachCancelAll(); const g = new ChessCls(fen); Object.assign(Z, { game: g, sol: [sol], idx: 0, color: g.turn(), flip: false, last: null, counted: true, status: 'play', review: false, info: { id: 'craft', rating: 1200, themes: [] }, coachPanel: null, coachStage: 0, coachKey: null, gmNote: null, gmBadge: null }); render(); return g; };
      const vis = el => !!el && getComputedStyle(el).opacity === '1' && getComputedStyle(el).display !== 'none' && getComputedStyle(el).visibility !== 'hidden';
      try {
        // Qe8+!! : تضحية بالوزير هي الطريقة الوحيدة للمكسب (مات الصف الأخير) — بتبدأ ★ والمحرك (MultiPV 3) بيرقّيها لـ !!
        craft('3r3k/1n4pp/1q3p2/5P2/5r2/8/4Q1PP/4R2K w - - 0 39', 'e2e8'); puzPlay({ from: 'e2', to: 'e8' }); clearTimeout(Z.nextTimer);
        out.first = Z.gmBadge && Z.gmBadge.tier;
        for (let i = 0; i < 50 && !(Z.gmBadge && Z.gmBadge.tier === 'BRILLIANT'); i++) await wait(100);
        let b = document.querySelector('#mainView .eca-gm-svg .eca-gm-sqbadge'), n = document.querySelector('#mainView .eca-gm-note');
        out.brilliant = Z.gmBadge && Z.gmBadge.tier; out.bSym = b ? b.querySelector('text').textContent : ''; out.bColor = b ? b.querySelector('circle').getAttribute('fill') : '';
        out.bNote = n ? n.textContent.replace(/\\s+/g, ' ') : ''; out.bSound = notes.includes('1047-1319-1568-2093');
        const sq = document.querySelector('#mainView .eca-sq[data-sq="e8"]'), br = b && b.getBoundingClientRect(), sr = sq && sq.getBoundingClientRect();
        out.onSquare = !!br && !!sr && br.left >= sr.left - 2 && br.right <= sr.right + 14 && br.top >= sr.top - 14 && br.bottom <= sr.bottom + 2;
        // الشارة ثابتة: بعد 3 ثواني ورسم الرقعة من جديد لسه موجودة وظاهرة، هي والملاحظة
        render(); await wait(3000);
        b = document.querySelector('#mainView .eca-gm-svg .eca-gm-sqbadge[data-sq="e8"]'); n = document.querySelector('#mainView .eca-gm-note');
        out.stays = vis(b) && b.querySelector('text').textContent === '!!' && vis(n);
        // Ne6+! : شوكة الملك والوزير، وكل نقلة تانية بتخسر
        craft('8/1KN5/1P6/2q3kp/8/8/8/8 w - - 0 55', 'c7e6'); puzPlay({ from: 'c7', to: 'e6' }); clearTimeout(Z.nextTimer);
        for (let i = 0; i < 50 && !(Z.gmBadge && Z.gmBadge.tier === 'GREAT'); i++) await wait(100);
        b = document.querySelector('#mainView .eca-gm-svg .eca-gm-sqbadge');
        out.great = Z.gmBadge && Z.gmBadge.tier; out.gSym = b ? b.querySelector('text').textContent : ''; out.gColor = b ? b.querySelector('circle').getAttribute('fill') : '';
        out.gSound = notes.includes('880-1175-1480');
        // أكل وزير سايب = أكل روتيني: بيفضل ★ (مش «عظيمة») حتى لو كل النقلات التانية أسوأ بكتير
        craft('4k3/8/8/8/3q4/8/8/3RK3 w - - 0 1', 'd1d4'); puzPlay({ from: 'd1', to: 'd4' }); clearTimeout(Z.nextTimer); await wait(2500);
        out.routine = Z.gmBadge && Z.gmBadge.tier;
      } finally { window.sfxNotes = real; }
      clearTimeout(Z.nextTimer); Z.status = 'idle'; Z.game = null; Z.counted = false; puzLoad();
      for (let i = 0; i < 60 && !(Z.status === 'play' && Z.game); i++) await wait(250);
      return out; })()`);
    check("GM coach: the only winning sacrifice (Qe8+!!) starts as ★ and the engine upgrades it to the teal «!!» badge on its square, with a note and the chime", gmP.first === "BEST" && gmP.brilliant === "BRILLIANT" && gmP.bSym === "!!" && gmP.bColor === "#1BACA6" && gmP.onSquare && /تضحية/.test(gmP.bNote) && gmP.bSound, gmP);
    check("GM coach: a puzzle badge and its note stay fully visible 3 seconds later, after the board redraws", gmP.stays, gmP);
    check("GM coach: the only move that wins (Ne6+ fork) is upgraded to the blue «!» GREAT badge", gmP.great === "GREAT" && gmP.gSym === "!" && gmP.gColor === "#5C8BB0" && gmP.gSound, gmP);
    check("GM coach: calibrated tiers — taking a free queen is ★ BEST, never «! great»", gmP.routine === "BEST", gmP);
    // ---------- GM coach: «🔬 open on the analysis board» from a puzzle mistake, then back to training ----------
    const af = await pa.ev(`(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms)), Z = arena.puz, A = arena.ana, out = {};
      const until = async (f, ms) => { for (let t = 0; t < ms; t += 100) { if (f()) return true; await wait(100); } return false; };
      coachCancelAll();
      const fen = '6k1/8/8/4n3/8/8/3Q2P1/6K1 w - - 0 1', g = new ChessCls(fen);
      Object.assign(Z, { game: g, sol: ['d2d3'], idx: 0, color: 'w', flip: false, last: null, counted: true, status: 'play', review: false, info: { id: 'craft', rating: 1200, themes: [] }, coachPanel: null, coachStage: 0, coachKey: null, gmNote: null, gmBadge: null });
      render(); puzPlay({ from: 'g2', to: 'g3' });
      out.card = await until(() => Z.coachPanel && Z.coachPanel.rv, 8000); await wait(100);
      const b = document.querySelector('#mainView .eca-gm-card .eca-gm-analyze');
      out.btnSize = b ? Math.round(Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height)) : 0;
      if (b) b.click(); await wait(300);
      out.sub = arena.sub; out.root = A.root === g.fen(); out.line = A.line.map(m => m.uci).join(' '); out.ply = A.ply; out.from = A.from && A.from.sub; out.solution = (A.solution || []).join(' ');
      out.rv = await until(() => A.line[0] && A.line[0].rv, 20000); await wait(400);
      out.tier = A.line[0] && A.line[0].rv && A.line[0].rv.tier;
      out.badge = !!document.querySelector('#mainView .eca-board .eca-gm-svg .eca-gm-sqbadge[data-sq="g3"]');
      out.green = !!document.querySelector('#mainView .eca-gm-svg .eca-gm-best'); out.gmCard = !!document.querySelector('#anaGM .eca-gm-card');
      out.backBtn = !!document.querySelector('#mainView .eca-ana-from button[onclick="anaBackToTraining()"]');
      anaShowSolution(); await wait(700); out.solShown = !!A.gmFollow && /الحل/.test(A.gmFollow.title) && A.game.fen() !== A.root;
      ecaGMFollowStop(); await wait(150);
      anaBackToTraining(); await wait(300);
      out.backSub = arena.sub; out.backGame = Z.game === g; out.backStatus = Z.status; out.back = arena.sub === 'puzzles' && Z.game === g && Z.status === 'play' && !A.from && !!Z.lesson;
      Z.status = 'idle'; Z.game = null; Z.counted = false; puzLoad();
      for (let i = 0; i < 60 && !(Z.status === 'play' && Z.game); i++) await wait(250);
      return out; })()`);
    check("GM coach: «🔬 open on the analysis board» (44px) in the mistake card loads the puzzle's exact start, the wrong move and the solution", af.card && af.btnSize >= 44 && af.sub === "analysis" && af.root && af.line === "g2g3" && af.ply === 1 && af.from === "puzzles" && af.solution === "d2d3", af);
    check("GM coach: on the analysis board the wrong move has its badge and card, the best move its green arrow, and «★ show the solution» plays it", af.rv && ["MISTAKE", "BLUNDER", "INACCURACY"].includes(af.tier) && af.badge && af.green && af.gmCard && af.solShown, af);
    check("GM coach: «↩ back to training» returns to the same puzzle where the student left it", af.backBtn && af.back, af);
    // ---------- GM coach: a bot game — persistent badges, then «📊 Game Review» with accuracy and key moments ----------
    const bg = await pa.ev(`(async () => {
      const wait = ms => new Promise(r => setTimeout(r, ms)), P = arena.play, A = arena.ana, out = {};
      const until = async (f, ms) => { for (let t = 0; t < ms; t += 100) { if (f()) return true; await wait(100); } return false; };
      const vis = el => !!el && getComputedStyle(el).opacity === '1' && getComputedStyle(el).display !== 'none';
      switchTab('arena'); arenaSub('play'); await wait(200);
      P.level = 0; P.colorChoice = 'w'; P.tc = 0; playStart(); await wait(200);
      playClick('e2'); playClick('e4');
      out.book = await until(() => P.gmBadge && P.gmBadge.tier === 'BOOK', 5000);
      await wait(3000);   // البوت رد، والرقعة اترسمت كذا مرة
      const b = document.querySelector('#mainView .eca-gm-svg .eca-gm-sqbadge[data-sq="e4"]');
      out.stays = vis(b) && P.game.history().length >= 2;
      out.listChip = ((document.querySelector('#mainView [data-gm-moves] .eca-mv-cell[data-tier="BOOK"] .eca-gm-mini') || {}).textContent || '') === '📖';
      // دور خلص فيه غلطة: 3.Qxe5+?? Nxe5
      P.thinking = false;
      const g = new ChessCls(); ['e4', 'e5', 'Qh5', 'Nc6', 'Qxe5+', 'Nxe5', 'Nc3', 'Nf6'].forEach(m => g.move(m));
      Object.assign(P, { game: g, color: 'w', over: 'loss', reason: '', sel: null, last: null, clk: null, pre: null }); render(); await wait(200);
      const cta = document.querySelector('#mainView .eca-gm-result .eca-gm-cta'), all = document.querySelectorAll('#mainView .eca-gm-cta');
      out.cta = !!cta && /Game Review/.test(cta.textContent) && Math.min(cta.getBoundingClientRect().width, cta.getBoundingClientRect().height) >= 44 && all.length >= 2;
      if (cta) cta.click(); await wait(300);
      out.sub = arena.sub; out.lineLen = A.line.length; out.ply0 = A.ply === 0; out.review = !!A.review && A.review.side === 'w';
      out.done = await until(() => A.line.length === 8 && A.line.every(m => m.rv), 60000); await wait(400);
      const rc = document.getElementById('anaReview');
      out.accMe = ((document.getElementById('anaAccMe') || {}).textContent || ''); out.accBot = ((document.getElementById('anaAccBot') || {}).textContent || '');
      out.chips = rc ? rc.querySelectorAll('.eca-rev-chip').length : 0;
      const km = rc ? [...rc.querySelectorAll('.eca-rev-km')] : [];
      out.kms = km.length; out.kmSize = km.every(k => k.getBoundingClientRect().height >= 44);
      out.qx = A.line[4].rv && A.line[4].rv.tier;
      out.greatOk = A.line.every(m => !m.rv || m.rv.tier !== 'GREAT' || m.rv.gap >= 18);
      out.tiers = A.line.map(m => m.rv && m.rv.tier).join(',');
      const k5 = km.find(k => k.getAttribute('onclick') === 'anaGo(5)');
      if (k5) { k5.click(); await wait(300); }
      out.jumped = A.ply === 5 && !!document.querySelector('#anaGM .eca-gm-card[data-tier="BLUNDER"]');
      const rb = document.querySelector('#anaGM .eca-gm-retry'); if (rb) rb.click(); await wait(300);
      out.retryOn = !!A.retry && A.ply === 4 && A.game.fen() === A.line[4].before && !!document.querySelector('#anaGM .eca-ana-retry') && !document.querySelector('#mainView .eca-gm-svg .eca-gm-best');
      anaClick('h5'); anaClick('e5'); await wait(150);
      out.retryWrong = !!A.retry && A.line.length === 8 && A.ply === 4;
      const best = ((ecaGM.get(A.line[4].before) || {}).lines || [])[0] || {};
      if (best.uci) { anaClick(best.uci.slice(0, 2)); anaClick(best.uci.slice(2, 4)); } await wait(300);
      out.retryRight = !A.retry && A.ply === 5 && A.line.length === 8 && A.line[4].uci === 'h5e5';
      const bl = document.querySelector('#anaGM .eca-gm-bestline'); if (bl) bl.click(); await wait(700);
      out.bestLine = !!A.gmFollow && /أفضل خط/.test(A.gmFollow.title) && !!document.querySelector('#mainView .eca-gm-svg .eca-gm-num');
      ecaGMFollowStop(); await wait(150);
      anaBackToTraining(); await wait(200);
      out.backToGame = arena.sub === 'play' && P.game === g;
      // مراجعة دور تاني وبعدين خروج على طول: شغل المراجعة في الخلفية بيقف بره رقعة التحليل
      const g2 = new ChessCls(); ['d4', 'Nf6', 'Bf4', 'g6', 'e3', 'Bg7', 'h3', 'O-O', 'Nf3', 'd6'].forEach(m => g2.move(m));
      Object.assign(P, { game: g2, over: 'draw' }); ecaGameReview('play'); await wait(150);
      arenaSub('lobby'); await wait(1800);
      const q = ecaGM.queue(); out.paused = !q.running || q.running.prio < 2; out.waiting = q.waiting.filter(p => p === 2).length > 0;
      // back to the lesson puzzle the next tests start from
      arena.puz.keepLesson = true; arenaSub('puzzles'); arena.puz.keepLesson = false;
      for (let i = 0; i < 60 && !(arena.puz.status === 'play' && arena.puz.game); i++) await wait(250);
      return out; })()`);
    check("GM bot game: the student's move gets its badge (📖) on the board and in the move list, still fully visible 3 seconds later after the bot's reply", bg.book && bg.stays && bg.listChip, bg);
    check("GM bot game: a finished game shows «📊 تحليل الدور مع الجراند ماستر (Game Review)» (44px) under the board and in the controls", bg.cta, bg);
    check("GM game review: opens the whole game (move 1 to the end) on the analysis board in review mode", bg.sub === "analysis" && bg.lineLen === 8 && bg.ply0 && bg.review, bg);
    check("GM game review: accuracy % for the student and the bot, a count for all 10 classes, and key moments", bg.done && /^\d+(\.\d)?%$/.test(bg.accMe) && /^\d+(\.\d)?%$/.test(bg.accBot) && bg.chips === 10 && bg.kms >= 1 && bg.kmSize && bg.qx === "BLUNDER", bg);
    check("GM game review: «⚡» jumps to the blunder, «🔄 retry» keeps the game and accepts only the best move, «▶ best line» plays it", bg.jumped && bg.retryOn && bg.retryWrong && bg.retryRight && bg.bestLine, bg);
    check("GM game review: calibrated — no «! great» without a ≥18% gap; «↩ back» returns to the game", bg.greatOk && bg.backToGame, bg);
    check("GM sweep: leaving the analysis board pauses the background review (nothing keeps running in other modes)", bg.paused && bg.waiting, bg);
    if (process.env.E2E_SHOTS) {
      const shotOk = await pa.ev(`(async () => { const Z = arena.puz, g = Z.game, want = Z.sol[Z.idx], pre = g.fen();
        const m = g.moves({ verbose: true }).find(x => { const u = x.from + x.to + (x.promotion || ''); if (u === want) return false; const r = findRefutationMove(pre, u, want); return r && 'BCDE'.includes(r.kind); });
        if (!m) return false; document.querySelector('#mainView .eca-board').scrollIntoView({ block: 'center' }); puzPlay({ from: m.from, to: m.to, promotion: m.promotion }); return true; })()`);
      if (shotOk) { await sleep(700); const shot = await pa.send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(process.env.E2E_SHOTS, "coach-refute.png"), Buffer.from(shot.data, "base64")); await pa.ev("coachSkip()"); }
    }
    const refModes = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), Z = arena.puz, out = {};
      Z.review = true; out.dojo = ecaCoach.mode() === 'dojo' && ecaCoach.refuteOk('dojo') && ecaCoach.hintOk('dojo'); Z.review = false;
      out.boss = ecaCoach.refuteOk('boss') && ecaCoach.hintOk('boss');
      lpExit(); for (let i = 0; i < 60 && !(Z.status === 'play' && Z.game && !Z.lesson); i++) await wait(250);
      out.mode = ecaCoach.mode();
      const m = Z.game.moves({ verbose: true }).find(x => { const u = x.from + x.to + (x.promotion || ''); if (u === Z.sol[Z.idx]) return false; const c = new ChessCls(Z.game.fen()); c.move(x); return !c.isCheckmate(); });
      puzPlay({ from: m.from, to: m.to, promotion: m.promotion });
      out.practiceOld = Z.status === 'wrong' && !Z.isRefuting && !document.querySelector('#mainView .eca-coach-toast');
      await wait(1000); out.practiceBack = Z.status === 'play';
      return out; })()`);
    check("coach: the punishing reply runs in lessons, the dojo and boss homework, and practice puzzles keep the quick retry", refModes.dojo && refModes.boss && refModes.mode === "practice" && refModes.practiceOld && refModes.practiceBack, refModes);
    // ---------- coach: 3-stage guided hint (question → piece → arrow) ----------
    await pa.ev("lpStart(lpDailyLesson(currUser()))");
    await until(() => pa.ev("arena.puz.status === 'play' && !!arena.puz.game && !!arena.puz.lesson"), 15000);
    const hint = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), Z = arena.puz, out = {};
      const btn = () => document.querySelector('#mainView button.eca-coach-hint');
      const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
      out.label0 = btn() ? btn().textContent.trim() : ''; out.size = btn() ? Math.round(Math.min(btn().getBoundingClientRect().width, btn().getBoundingClientRect().height)) : 0; out.mult0 = coachRewardMult(Z);
      btn().click(); await wait(80);
      const b1 = document.querySelector('#mainView .eca-coach-bubble');
      const plain = h => { const d = document.createElement('div'); d.innerHTML = h; return d.textContent.replace(/\s+/g, ' ').trim(); };
      out.s1text = b1 ? b1.textContent.replace(/\s+/g, ' ').trim() : '';
      out.s1 = !!b1 && out.s1text.includes(plain(ecaCoach.step1Text(Z, 'lesson'))) && !document.querySelector('#mainView .eca-coach-svg');
      out.label1 = btn().textContent.trim(); out.mult1 = coachRewardMult(Z);
      btn().click(); await wait(80);
      const want = Z.sol[Z.idx], spot = document.querySelector('#mainView .eca-coach-svg .eca-co-spot'), sq = document.querySelector('#mainView .eca-sq[data-sq="' + want.slice(0, 2) + '"]');
      const a = spot && center(spot), c = sq && center(sq);
      out.s2 = !!spot && !!c && Math.hypot(a[0] - c[0], a[1] - c[1]) < 3 && document.querySelectorAll('#mainView .eca-co-radar').length === 2 && /خطوة 2|Step 2/.test(document.querySelector('#mainView .eca-coach-bubble').textContent);
      out.label2 = btn().textContent.trim(); out.mult2 = coachRewardMult(Z);
      return out; })()`);
    check("hint: the coach button (44px) starts at 3 with no reward cut", /مساعدة الكوتش \(3\)|Coach help \(3\)/.test(hint.label0) && hint.size >= 44 && hint.mult0 === 1, hint);
    check("hint: step 1 asks about the puzzle's idea (by motif) without marking any square, reward x0.9", hint.s1 && /تلميح القطعة \(2\)|Piece hint \(2\)/.test(hint.label1) && hint.mult1 === 0.9, hint);
    check("hint: step 2 puts a gold radar ring on the piece to move, reward x0.75", hint.s2 && /مسار التكتيك \(1\)|Tactic path \(1\)/.test(hint.label2) && hint.mult2 === 0.75, hint);
    if (process.env.E2E_SHOTS) { await pa.ev("document.querySelector('#mainView .eca-coach-bubble').scrollIntoView({ block: 'start' })"); await sleep(400); const shot = await pa.send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(process.env.E2E_SHOTS, "coach-hint2.png"), Buffer.from(shot.data, "base64")); }
    const coachFit = [];
    for (const [w, h, mobile] of [[320, 640, true], [1920, 1080, false]]) for (const fsOn of [false, true]) {
      await pa.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
      coachFit.push(await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); if (${fsOn}) ecaBoardFs(true); await wait(500);
        const Z = arena.puz, board = document.querySelector('#mainView .eca-board'), svg = board && board.querySelector('.eca-coach-svg'), spot = svg && svg.querySelector('.eca-co-spot'), sq = document.querySelector('#mainView .eca-sq[data-sq="' + Z.sol[Z.idx].slice(0, 2) + '"]');
        const bR = board.getBoundingClientRect(), sR = svg ? svg.getBoundingClientRect() : { width: 0, height: 0, left: 0, top: 0 }, a = spot && spot.getBoundingClientRect(), c = sq && sq.getBoundingClientRect();
        const r = { view: '${w}x${h}' + (${fsOn} ? ' full screen' : ''), board: Math.round(bR.width), same: Math.abs(sR.width - board.clientWidth) <= 1 && Math.abs(sR.height - board.clientHeight) <= 1 && Math.abs(sR.left - (bR.left + board.clientLeft)) <= 1,
          onSquare: !!a && !!c && Math.abs((a.left + a.width / 2) - (c.left + c.width / 2)) < 3 && Math.abs((a.top + a.height / 2) - (c.top + c.height / 2)) < 3, bubble: !!document.querySelector('#mainView .eca-coach-bubble') && document.querySelector('#mainView .eca-coach-bubble').getBoundingClientRect().height > 0 };
        if (${fsOn}) ecaBoardFs(false); return r; })()`));
    }
    await pa.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    check("hint: the overlay sits exactly on the board at 320px and 1920x1080, normal and full screen", coachFit.every(r => r.same && r.onSquare && r.bubble), coachFit);
    const hint3 = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), Z = arena.puz, out = {};
      const btn = () => document.querySelector('#mainView button.eca-coach-hint');
      btn().click(); await wait(80);
      const want = Z.sol[Z.idx], svg = document.querySelector('#mainView .eca-coach-svg');
      out.arrow = !!(svg && svg.querySelector('.eca-co-hint') && svg.querySelector('.eca-co-hint-head') && svg.querySelector('#ecaCoGrad'));
      out.bubble = /خطوة 3|Step 3/.test((document.querySelector('#mainView .eca-coach-bubble') || {}).textContent || '');
      out.done = btn().disabled && /تم عرض التلميح|Hint shown/.test(btn().textContent); out.mult3 = coachRewardMult(Z);
      out.notPlayed = Z.status === 'play' && Z.idx === Z.coachAt;
      out.noLeak = !document.getElementById('mainView').innerHTML.includes(want) && ![...document.querySelectorAll('#mainView *')].some(e => [...e.attributes].some(a => a.name.startsWith('data-') && a.value.includes(want)));
      btn().click(); out.stillThree = Z.coachStage === 3;
      puzPlay(want.length > 4 ? { from: want.slice(0, 2), to: want.slice(2, 4), promotion: want[4] } : { from: want.slice(0, 2), to: want.slice(2, 4) });
      await wait(80); out.cleared = !document.querySelector('#mainView .eca-coach-svg, #mainView .eca-coach-bubble');
      out.amounts = [[5, 0.9], [5, 0.75], [5, 0.5], [1, 0.5], [2, 0.75], [40, 0.9], [200, 0.5], [100, 0.75]].map(([b, m]) => ecaCoach.amount(b, m)).join();
      return out; })()`);
    check("hint: step 3 draws a green-to-gold arrow, the student still plays the move, reward x0.5, button done", hint3.arrow && hint3.bubble && hint3.done && hint3.mult3 === 0.5 && hint3.notPlayed && hint3.stillThree, hint3);
    check("hint: the solution never appears in the page or in a data attribute", hint3.noLeak, hint3);
    check("hint: a correct move clears the bubble and the overlay", hint3.cleared, hint3);
    check("hint: rewards stay whole positive numbers (Math.max(1, Math.floor(...)))", hint3.amounts === "4,3,2,1,1,36,100,75", hint3.amounts);
    const hintPay = await pa.ev(`(async () => { const day = todayISO();
      for (const k of ['hardest', 'harder', 'normal', 'easier']) { const r = await window.fbEconomy({ op: 'earn', source: 'puzzle', key: k, day, mult: 0.75 }); if (r && r.ok && !r.duplicate) return { day, key: k }; }
      return { day, key: '' }; })()`);
    const hintRc = hintPay.key ? await read("users/" + A + "/economy/puzzle-" + hintPay.day + "-" + hintPay.key) : null;
    const hintBase = { hardest: 5, harder: 4, normal: 3, easier: 2 }[hintPay.key];
    check("hint: a hinted puzzle reward is saved cut down (x0.75) and the rules accept it", !!hintRc && hintRc.starsDelta - (hintRc.missionBonus ? 1 : 0) === Math.max(1, Math.floor(hintBase * 0.75)) && hintRc.xpDelta === Math.max(1, Math.floor(hintBase * 20 * 0.75)), { hintPay, hintRc });
    const gate = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
      for (const k of ['rush', 'duel', 'friend', 'speed', 'weekly']) { arenaSub(k); await wait(350); const m = ecaCoach.mode(); out[k] = !document.querySelector('#mainView .eca-coach-hint, #mainView button[onclick="puzHint()"]') && !ecaCoach.hintOk(m) && !ecaCoach.refuteOk(m); }
      arenaSub('analysis'); await wait(500); out.analysis = !!document.querySelector('#mainView .eca-coach-hint') && ecaCoach.hintOk(ecaCoach.mode()) && !ecaCoach.refuteOk(ecaCoach.mode());
      arenaSub('lobby'); return out; })()`);
    check("hint: no coach help in 60s rush, duels, the speed arena or the weekly challenge; it is on the analysis board", Object.values(gate).every(Boolean), gate);
    // ---------- GM coach on the analysis board: Stockfish (MultiPV 2) reviews every move, with the site's engine as the fallback ----------
    const gmA = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), A = arena.ana, out = {}, notes = [], real = window.sfxNotes;
      const until = async (f, ms) => { for (let t = 0; t < ms; t += 100) { if (f()) return true; await wait(100); } return false; };
      window.sfxNotes = function (n) { notes.push(n.join('-')); };
      try {
        switchTab('arena'); arenaSub('analysis'); await wait(300);
        anaSet(new ChessCls()); anaClick('e2'); anaClick('e4');
        out.bookOk = await until(() => A.line[0] && A.line[0].rv, 20000); await wait(150);
        out.book = A.line[0].rv && A.line[0].rv.tier;
        out.bookName = ((document.querySelector('#anaEval .eca-ana-book') || {}).textContent || '').trim();
        out.bookMini = ((document.querySelector('#anaMoves .eca-ana-mv[data-tier="BOOK"] .eca-gm-mini') || {}).textContent || '');
        out.evalBar = !!document.querySelector('#anaEval .eval-bar > div') && /^[+−\\-]?\\d|^-?M|…/.test(((document.querySelector('#anaEval .eca-ana-pill') || {}).textContent || '').trim());
        out.bookCard = !!document.querySelector('#anaGM .eca-gm-card[data-tier="BOOK"]') && document.querySelectorAll('#anaGM .eca-gm-layer').length === 4;
        // blunder: the queen walks onto a square the pawn takes
        anaSet(new ChessCls('4k3/8/8/3p4/8/3Q4/8/4K3 w - - 0 1')); await wait(100); anaClick('d3'); anaClick('c4');
        out.blOk = await until(() => A.line[0] && A.line[0].rv, 25000); await wait(200);
        const rv = A.line[0].rv; out.tier = rv && rv.tier; out.src = (ecaGM.get(A.line[0].after) || {}).src;
        const card = document.querySelector('#anaGM .eca-gm-card'), text = card ? card.textContent.replace(/\\s+/g, ' ') : '';
        out.title = card ? card.querySelector('.eca-gm-title').textContent : ''; out.layers = card ? card.querySelectorAll('.eca-gm-layer').length : 0;
        out.free = /من غير أي حماية/.test(text); out.cont = /dxc4/.test(text); out.best = /★ أفضل نقلة كانت/.test(text);
        out.mini = ((document.querySelector('#anaMoves .eca-ana-mv[data-tier="BLUNDER"] .eca-gm-mini') || {}).textContent || '');
        const sb = document.querySelector('#mainView .eca-board .eca-gm-svg .eca-gm-sqbadge[data-tier="BLUNDER"]');
        out.sqBadge = !!sb && sb.querySelector('circle').getAttribute('fill') === '#CA3431' && sb.querySelector('text').textContent === '??';
        out.green = !!document.querySelector('#mainView .eca-gm-svg .eca-gm-best'); out.red = !!document.querySelector('#mainView .eca-gm-svg .eca-gm-threat');
        out.thud = notes.includes('110-82');
        // الشارة ثابتة: بعد 3 ثواني (والتقييم بيتحدّث) لسه ظاهرة ومن غير ما الانيميشن يتعاد
        await wait(3000);
        const sb1 = document.querySelector('#mainView .eca-board .eca-gm-svg .eca-gm-sqbadge[data-tier="BLUNDER"]');
        out.anaStays = !!sb1 && getComputedStyle(sb1).opacity === '1' && getComputedStyle(sb1).display !== 'none' && !sb1.classList.contains('is-new') && !!document.querySelector('#anaGM .eca-gm-card .eca-gm-badge');
        const preRes = ecaGM.get(A.line[0].before) || {}; out.depth = preRes.depth || 0; out.multi = (preRes.lines || []).length; out.preSrc = preRes.src;
        anaLines(); await wait(100); out.hidden = !document.querySelector('#mainView .eca-gm-svg .eca-gm-best, #mainView .eca-gm-svg .eca-gm-threat');
        anaLines(); await wait(100); out.shown = !!document.querySelector('#mainView .eca-gm-svg .eca-gm-best');
        // the follow-up on the board, then back to the position
        const f0 = A.game.fen(); document.querySelector('#anaGM .eca-gm-follow').click(); await wait(500);
        out.followMoved = A.game.fen() !== f0 && !!document.querySelector('#mainView .eca-gm-svg .eca-gm-num');
        anaClick('e8'); out.locked = !A.sel;
        await until(() => A.gmFollow && A.gmFollow.i >= A.gmFollow.moves.length, 9000);
        out.steps = A.gmFollow ? A.gmFollow.i : 0;
        document.querySelector('#mainView .eca-gm-back').click(); await wait(200);
        out.back = !A.gmFollow && A.game.fen() === f0 && A.ply === 1 && !!document.querySelector('#anaGM .eca-gm-card[data-tier="BLUNDER"]');
        // stepping through the game keeps every move
        anaGo(0); await wait(60); out.navStart = A.ply === 0 && A.game.fen() === A.root && A.line.length === 1;
        anaStep(1); await wait(60); out.navNext = A.ply === 1 && A.game.fen() === f0;
        out.navBtns = [...document.querySelectorAll('#mainView .eca-ana-nav button')].every(b => b.getBoundingClientRect().height >= 44 && b.getBoundingClientRect().width >= 44 && (b.title || b.getAttribute('aria-label')));
        // brilliant: Qe8+!! — the queen sacrifice is the only way to win (back-rank mate)
        anaSet(new ChessCls('3r3k/1n4pp/1q3p2/5P2/5r2/8/4Q1PP/4R2K w - - 0 39')); await wait(100); anaClick('e2'); anaClick('e8');
        out.brOk = await until(() => A.line[0] && A.line[0].rv, 25000); out.brilliant = A.line[0].rv && A.line[0].rv.tier;
        out.brChime = notes.includes('1047-1319-1568-2093');
        // the site's own engine when Stockfish isn't there
        ecaGM.engine = 'internal';
        anaSet(new ChessCls('r3k3/8/8/1N6/8/8/8/4K3 w - - 0 1')); await wait(100); anaClick('b5'); anaClick('c7');
        out.inOk = await until(() => A.line[0] && A.line[0].rv, 25000); out.internalTier = A.line[0].rv && A.line[0].rv.tier;
        out.internalSrc = (ecaGM.get(A.line[0].after) || {}).src; out.internalCard = !!document.querySelector('#anaGM .eca-gm-card');
      } finally { ecaGM.engine = 'auto'; window.sfxNotes = real; }
      return out; })()`);
    check("GM analysis: 1.e4 is marked 📖 Book in the move list, the opening is named, and the eval bar with its pill is shown", gmA.bookOk && gmA.book === "BOOK" && gmA.bookMini === "📖" && /افتتاح بيدق الملك|King's Pawn/.test(gmA.bookName) && gmA.evalBar && gmA.bookCard, gmA);
    check("GM analysis: Qc4?? is a BLUNDER: «??» in the move list, the crimson badge on c4, the low thud, and a 4-layer card", gmA.blOk && gmA.tier === "BLUNDER" && gmA.mini === "??" && gmA.sqBadge && gmA.thud && gmA.layers === 4 && /خطأ فادح/.test(gmA.title), gmA);
    check("GM analysis: the card says the queen had no defender, shows the line (dxc4) and the best move", gmA.free && gmA.cont && gmA.best, gmA);
    check("GM analysis: green arrow for the best move, red for the opponent's reply, and the 👁 toggle hides and shows them", gmA.green && gmA.red && gmA.hidden && gmA.shown, gmA);
    check("GM analysis: «▶ show the follow-up» plays the line with numbered arrows (board locked), «↩ back» restores it", gmA.followMoved && gmA.locked && gmA.steps >= 1 && gmA.back, gmA);
    check("GM analysis: ⏮ ◀ ▶ ⏭ step through the game without losing moves (44px buttons with labels)", gmA.navStart && gmA.navNext && gmA.navBtns, gmA);
    check("GM analysis: the only winning queen sacrifice (Qe8+) is BRILLIANT with the chime", gmA.brOk && gmA.brilliant === "BRILLIANT" && gmA.brChime, gmA);
    check("GM analysis: the move badge is still fully visible 3 seconds later without replaying its animation", gmA.anaStays, gmA);
    check("GM analysis: Stockfish 19 (WASM) analyzes with MultiPV 3 at depth 12 or more", gmA.preSrc === "sf" && gmA.multi === 3 && gmA.depth >= 12, gmA);
    check("GM analysis: without Stockfish the site's own engine (Web Worker) reviews the move", gmA.inOk && gmA.internalSrc === "eca" && !!gmA.internalTier && gmA.internalCard, gmA);
    // ---------- daily puzzle: once a day (Cairo time), then locked with a live countdown ----------
    await pa.send("Page.bringToFront");
    const dly = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), out = {}, u = currUser(), Z = arena.puz;
      out.key = getDailyDateKey(); out.keyIsCairo = out.key === window.ecaCairoDay();
      out.before = ecaDailySolved();
      switchTab('arena'); arenaSub('lobby'); await wait(300);
      const card = () => document.querySelector('#mainView .game-card-daily');
      out.cardOpen = !!card() && /مرة في اليوم|Once a day/.test(card().textContent);
      lbOpen('daily');
      for (let i = 0; i < 80 && !(Z.status === 'play' && Z.game && Z.diff === 'daily'); i++) await wait(250);
      out.opened = arena.sub === 'puzzles' && Z.diff === 'daily' && Z.status === 'play';
      for (let g = 0; g < 200 && Z.status !== 'solved'; g++) { if (Z.status === 'play' && Z.sol[Z.idx]) { const m = Z.sol[Z.idx]; puzPlay(m.length > 4 ? { from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] } : { from: m.slice(0, 2), to: m.slice(2, 4) }); } await wait(150); }
      out.solved = Z.status === 'solved';
      out.cached = localStorage.getItem('eca_daily_solved_' + u.id + '_' + out.key) === '1';
      out.lockedNow = ecaDailySolved();
      return out; })()`);
    check("daily: the day key is Cairo's date, and the daily card is open before solving", dly.keyIsCairo && !dly.before && dly.cardOpen && dly.opened, dly);
    check("daily: solving it locks it on this device at once", dly.solved && dly.cached && dly.lockedNow, dly);
    const dayLocked = await until(async () => ((await U(A)).arena || {}).lastDailyPuzzleSolvedDate === dly.key, 15000);
    const dailyRc = await read("users/" + A + "/economy/puzzle-" + dly.key + "-daily");
    check("daily: the reward and lastDailyPuzzleSolvedDate are saved together", !!dayLocked && !!dailyRc, { field: ((await U(A)).arena || {}).lastDailyPuzzleSolvedDate, receipt: dailyRc });
    const starsBefore = (await U(A)).arena.stars;
    const dly2 = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), out = {}, Z = arena.puz;
      await wait(2600); out.nextNotDaily = Z.diff === 'easier';
      out.again = await window.fbEconomy({ op: 'earn', source: 'puzzle', key: 'daily', day: todayISO() });
      switchTab('arena'); arenaSub('lobby'); await wait(300);
      const card = document.querySelector('#mainView .game-card-daily');
      out.badge = !!card && /تم حل لغز اليوم بنجاح|Today's puzzle solved/.test(card.textContent);
      out.clock0 = (document.getElementById('lbDailyClock') || {}).textContent || '';
      for (let i = 0; i < 40 && ((document.getElementById('lbDailyClock') || {}).textContent || '') === out.clock0; i++) await wait(100);
      out.clock1 = (document.getElementById('lbDailyClock') || {}).textContent || '';
      out.ticks = /^\\d\\d:\\d\\d:\\d\\d$/.test(out.clock0) && out.clock0 !== out.clock1;
      lbOpen('daily'); await wait(50);
      const t = document.getElementById('toast').textContent;
      out.blocked = arena.sub === 'lobby' && /حليت لغز النهاردة خلاص/.test(t) && /ساعة/.test(t) && /دقيقة/.test(t);
      Z.lesson = ''; Z.review = false; Z.diff = 'daily'; Z.status = 'idle'; arenaSub('puzzles'); await wait(400); out.menuBlocked = Z.diff === 'easier';
      arenaSub('lobby'); return out; })()`);
    check("daily: the next puzzle after solving is not the daily one", dly2.nextNotDaily, dly2);
    check("daily: the lobby card says it's solved with a ticking countdown to the next one", dly2.badge && dly2.ticks, dly2);
    check("daily: opening it again (card or puzzle menu) is blocked with the come-back-tomorrow message", dly2.blocked && dly2.menuBlocked, dly2);
    check("daily: a second reward the same day pays nothing", (await U(A)).arena.stars === starsBefore && !!dly2.again && (dly2.again.duplicate || dly2.again.ok === false), { again: dly2.again });
    await pa.send("Page.reload"); await sleep(1000); await waitReady(pa);
    const dly3 = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), out = {}, u = currUser(), key = getDailyDateKey();
      out.afterReload = ecaDailySolved();
      localStorage.removeItem('eca_daily_solved_' + u.id + '_' + key); out.fromServer = ecaDailySolved();
      switchTab('arena'); arenaSub('lobby'); await wait(300);
      out.cardLocked = /تم حل لغز اليوم بنجاح|Today's puzzle solved/.test((document.querySelector('#mainView .game-card-daily') || {}).textContent || '');
      const real = window.getDailyDateKey, d = new Date(Date.now() + 864e5);
      window.getDailyDateKey = () => real(d);   // the clock crosses midnight in Cairo
      await wait(1500);
      out.midnight = !ecaDailySolved() && /مرة في اليوم|Once a day/.test((document.querySelector('#mainView .game-card-daily') || {}).textContent || '');
      window.getDailyDateKey = real; await wait(1300);
      out.restored = ecaDailySolved();
      return out; })()`);
    check("daily: the lock survives a page reload, also from the saved field alone", dly3.afterReload && dly3.fromServer && dly3.cardLocked, dly3);
    check("daily: at Cairo midnight the card unlocks by itself", dly3.midnight && dly3.restored, dly3);
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
      const h1 = document.querySelector('.nf-billboard'); out.boss = h1.classList.contains('lb-crimson') && /Fork Dragon/.test(h1.textContent) && /واجب الكوتش|Coach homework/.test(h1.querySelector('.nf-badge').textContent) && !!h1.querySelector('.nf-btn-play') && !!h1.querySelector('.nf-btn-info') && !!h1.querySelector('.nf-bar i');
      arena.boss.list = []; render();
      const h2 = document.querySelector('.nf-billboard'); out.step = h2.classList.contains('lb-emerald') && /Step/.test(h2.querySelector('.nf-bb-title').textContent);
      arena.boss.list = keep; render(); return out; })()`);
    check("lobby: the billboard spotlights the boss, then the current step when there is none", hero.boss && hero.step, hero);
    const rows = await pa.ev(`(() => { const out = {}, row = k => document.querySelector('.nf-row[data-row="' + k + '"]'), text = k => (row(k) || {}).textContent || '';
      out.rows = [...document.querySelectorAll('.nf-row')].map(r => r.dataset.row);
      out.continue = /مغامرة الدروس/.test(text('continue')) && /دوجو الانتقام/.test(text('continue')) && !!row('continue').querySelector('.nf-bar');
      out.pvp = /تحدي 60 ثانية/.test(text('pvp')) && /تحدي صاحبك/.test(text('pvp')) && /عجلة الحظ/.test(text('pvp'));
      out.originals = /ECA ORIGINAL/.test(text('originals')) && /تحدي الأسبوع/.test(text('originals')) && /لوحة الشرف/.test(text('originals')) && !!document.getElementById('lbSaPill');
      out.posters = row('top').querySelectorAll('.nf-num').length >= 1 && !!row('top').querySelector('.nf-poster');
      out.all = row('all').querySelectorAll('.nf-card').length;
      out.scroll = [...document.querySelectorAll('.nf-track')].every(t => getComputedStyle(t).overflowX === 'auto' && getComputedStyle(t).scrollSnapType.includes('x'));
      out.oneTap = [...document.querySelectorAll('.nf-card')].every(c => c.tagName === 'BUTTON' && c.querySelector('.nf-card-title') && c.querySelector('.nf-card-tag'));
      return out; })()`);
    check("lobby: five swipeable rows (continue, speed and friends, coach originals, cards and shop, all games)", rows.rows.join() === "continue,pvp,originals,top,all" && rows.continue && rows.pvp && rows.originals && rows.posters && rows.scroll && rows.oneTap, rows);
    const reach = await pa.ev("(() => { const go = [...document.querySelectorAll('#mainView .nf-row [onclick]')].map(b => b.getAttribute('onclick')); const modes = ['play','puzzles','vision','pawns','analysis','lessons','rush','duel','friend','speed','weekly','boss','cards']; const n = k => go.filter(g => g.startsWith(\"lbOpen('\" + k + \"'\")).length; return { miss: modes.filter(k => !n(k)), twice: modes.filter(k => n(k) > 1) }; })()");
    check("lobby: every game is one tap away and none shows up twice", !reach.miss.length && !reach.twice.length, reach);
    const pills = await until(() => pa.ev("(() => { const p = [...document.querySelectorAll('.nf-row[data-row=\"originals\"] .nf-card-tag')].map(x => x.textContent); return /المحاولات|حليته|ما نزلش|Attempts|Solved|Not posted/.test(p[0]) && /شغّالة|تبدأ بعد|LIVE|Starts in/.test(p[1]) ? p : null; })()"), 15000);
    check("lobby: events show the weekly attempts and the tournament clock", !!pills, pills);
    const peek = await pa.ev("(() => { const t = document.querySelector('.nf-row[data-row=\"all\"] .nf-track'), c = t.querySelector('.nf-card'); return c.getBoundingClientRect().width < t.clientWidth * 0.95 && t.scrollWidth > t.clientWidth; })()");
    check("lobby: rows peek past the edge so they look swipeable", peek);
    const open = await pa.ev("(() => { lbOpen('rush'); const inGame = arena.sub === 'rush' && !!document.querySelector('#mainView button[onclick=\"arenaSub(\\'lobby\\')\"]') && !document.querySelector('.nf-billboard'); arenaSub('lobby'); return inGame && arena.sub === 'lobby'; })()");
    check("lobby: a card opens its game, and «lobby» brings you back", open);
    // ---------- lobby: cards come alive on hover or touch (cardfx.js) ----------
    await pa.send("Page.bringToFront");   // a background tab doesn't run the fade-in
    const gc = await pa.ev(`(async () => { const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)), cs = (el, p) => el ? getComputedStyle(el)[p] : null;
      switchTab('arena'); arenaSub('lobby'); await wait(700);
      const m = document.getElementById('mainView');
      out.kinds = ['speed', 'dojo', 'duel', 'coach', 'arena'].filter(k => !m.querySelector('.game-card-' + k + ' .game-card-media .gc-bg + .gc-hero + .gc-fx'));
      out.filled = !m.querySelector('.gc-fx[data-fx]:empty') && [...m.querySelectorAll('.gc-fx')].every(f => f.children.length > 0);
      const sp = m.querySelector('.nf-row[data-row="pvp"] .game-card-speed');
      out.sleep = cs(sp.querySelector('.gc-fx'), 'opacity') === '0' && cs(sp.querySelector('.gc-dclock'), 'animationName') === 'none' && cs(sp.querySelector('.gc-line'), 'animationName') === 'none';
      sp.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); await wait(250);
      const sp2 = m.querySelector('.nf-row[data-row="pvp"] .game-card-speed');   // the lobby may have re-rendered meanwhile: the card stays awake
      sp2.querySelector('.gc-fx').getAnimations().forEach(t => t.finish());   // the fade-in, without waiting for frames
      out.hoverParts = [sp2.classList.contains('hover-active'), cs(sp2.querySelector('.gc-fx'), 'opacity'), cs(sp2.querySelector('.gc-dclock'), 'animationName'), cs(sp2.querySelector('.gc-line'), 'animationName'), cs(sp2.querySelector('.gc-roll'), 'animationName')].join();
      out.hover = out.hoverParts === 'true,1,clockShudder,speedStream,spdCount';
      sp2.dispatchEvent(new MouseEvent('mouseout', { bubbles: true, relatedTarget: document.body })); out.leave = !sp2.classList.contains('hover-active'); render(); out.leave = out.leave && !m.querySelector('.game-card.hover-active');
      const names = { dojo: ['.gc-slash', 'slashSweeper'], duel: ['.gc-sword-r', 'duelClash'], coach: ['.gc-crown', 'coachFloat'], arena: ['.gc-trophy', 'trophyShine'] };
      out.each = Object.entries(names).filter(([k, [sel, name]]) => { const c = m.querySelector('.game-card-' + k); GameCardAnimator.activate(c); const ok = cs(c.querySelector(sel), 'animationName') === name; GameCardAnimator.sleep(c); return !ok; }).map(([k]) => k);
      const keep = window.lbOpen; let n = 0; window.lbOpen = () => { n++; };
      try {
        const du = m.querySelector('.nf-row[data-row="pvp"] .game-card-duel');
        du.dispatchEvent(new Event('touchstart', { bubbles: true })); out.touchOn = du.classList.contains('hover-active');
        du.click(); du.click(); out.waited = n === 0; await wait(320); out.once = n;
        document.body.dispatchEvent(new Event('touchstart', { bubbles: true })); out.touchOff = !m.querySelector('.game-card.hover-active');
      } finally { window.lbOpen = keep; }
      return out; })()`);
    check("cards: speed, dojo, duel, coach and tournament cards have a backing, a still hero and an effects layer", gc.kinds.length === 0 && gc.filled, gc);
    check("cards: sleeping cards stay still with the effects hidden", gc.sleep, gc);
    check("cards: hovering the 60s card wakes it (clock shudders and counts down, speed lines) and leaving stops it", gc.hover && gc.leave, gc);
    check("cards: dojo slash, duel clash, coach scan and trophy shine each run their own loop", gc.each.length === 0, gc.each);
    check("cards: a tap lights the card, opens the game after a short beat, only once, and a tap outside turns it off", gc.touchOn && gc.waited && gc.once === 1 && gc.touchOff, gc);
    await sleep(1300);
    check("cards: a mouse or keyboard click still opens right away", await pa.ev("(() => { const keep = window.lbOpen; let n = 0; window.lbOpen = () => { n++; }; try { document.querySelector('#mainView .game-card-coach').click(); return n === 1; } finally { window.lbOpen = keep; } })()"));
    await pa.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const gcOs = await pa.ev("(() => { const c = document.querySelector('#mainView .game-card-speed'); c.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' })); const fx = c.querySelector('.gc-fx'); fx.getAnimations().forEach(t => t.finish()); const cl = getComputedStyle(c.querySelector('.gc-dclock')); const r = { lit: c.classList.contains('hover-active'), fx: getComputedStyle(fx).opacity, clock: cl.animationName, state: cl.animationPlayState, dur: cl.animationDuration }; GameCardAnimator.sleep(c); return r; })()");
    await pa.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    check("cards: with Windows animations off, pointing at a card still plays its preview", gcOs.lit && gcOs.fx === "1" && gcOs.clock === "clockShudder" && gcOs.state === "running" && parseFloat(gcOs.dur) >= 0.1, gcOs);
    const gcCalm = await pa.ev("(() => { document.documentElement.classList.add('eca-calm'); const c = document.querySelector('#mainView .game-card-speed'); GameCardAnimator.activate(c); const fx = c.querySelector('.gc-fx'); fx.getAnimations().forEach(t => t.finish()); const r = { fx: getComputedStyle(fx).opacity, clock: getComputedStyle(c.querySelector('.gc-dclock')).animationName, lit: c.classList.contains('hover-active') }; GameCardAnimator.sleep(c); document.documentElement.classList.remove('eca-calm'); return r; })()");
    check("cards: with «less motion» on in the app, the card only lights up, no effects", gcCalm.lit && gcCalm.fx === "0" && gcCalm.clock === "none", gcCalm);
    // ---------- cards: desktop mouse on Windows (also a touch screen laptop, and animations off) ----------
    await pa.send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 720, deviceScaleFactor: 1, mobile: false });
    await pa.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const desk = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), out = { bad: [] };
      switchTab('arena'); arenaSub('lobby'); await wait(400); GameCardAnimator.activate(null);
      document.body.dispatchEvent(new Event('touchstart', { bubbles: true }));   // the same laptop was just touched
      const cards = [...document.querySelectorAll('#mainView .game-card')]; out.cards = cards.length;
      for (const c of cards) {
        c.dispatchEvent(new PointerEvent('pointerover', { bubbles: true, pointerType: 'mouse' })); c.dispatchEvent(new MouseEvent('mouseenter'));
        const fx = c.querySelector('.gc-fx'); fx.getAnimations().forEach(t => t.finish());
        const running = [...c.querySelectorAll('.game-card-media *')].filter(e => { const st = getComputedStyle(e); return st.animationName !== 'none' && st.animationPlayState === 'running'; }).length;
        const on = c.classList.contains('hover-active') && getComputedStyle(fx).opacity === '1' && running > 0;
        c.dispatchEvent(new PointerEvent('pointerout', { bubbles: true, pointerType: 'mouse', relatedTarget: document.body })); c.dispatchEvent(new MouseEvent('mouseleave', { relatedTarget: document.body }));
        const off = !c.classList.contains('hover-active');
        if (!on || !off) out.bad.push({ card: [...c.classList].find(x => x.startsWith('game-card-')), on, running, off });
      }
      document.querySelectorAll('.eca-spin-modal,#ecaMilestone,.eca-drop-modal').forEach(e => e.remove());
      const sp = document.querySelector('#mainView .game-card-speed'); sp.scrollIntoView({ block: 'center', inline: 'center' }); await wait(400);
      const r = sp.getBoundingClientRect(); out.at = { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
      const top = document.elementFromPoint(out.at.x, out.at.y); out.top = top === sp || sp.contains(top) ? 'card' : (top ? top.tagName + '.' + String(top.className).slice(0, 60) : 'none');
      out.blocked = [...sp.querySelectorAll('*')].filter(e => getComputedStyle(e).pointerEvents !== 'none').length;
      return out; })()`);
    await pa.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: desk.at.x, y: desk.at.y }); await sleep(250);
    const real = await pa.ev("(() => { const c = document.querySelector('#mainView .game-card-speed'), cl = getComputedStyle(c.querySelector('.gc-dclock')); return { hover: c.matches(':hover'), lit: c.classList.contains('hover-active'), clock: cl.animationName, state: cl.animationPlayState }; })()");
    await pa.send("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 }); await sleep(250);
    const realOff = await pa.ev("!document.querySelector('#mainView .game-card-speed').classList.contains('hover-active')");
    await pa.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    await pa.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    check("cards: on a Windows desktop every card wakes on mouse hover and sleeps on leave, even after a touch and with animations off", desk.cards >= 20 && !desk.bad.length && desk.blocked === 0, desk);
    check("cards: a real mouse moving over a card starts its animation, moving away stops it", real.hover && real.lit && real.clock === "clockShudder" && real.state === "running" && realOff, { real, realOff, top: desk.top, at: desk.at });
    if (process.env.E2E_SHOTS) for (const k of ["target", "map", "dojo", "boss", "speed", "knights", "duel", "spin", "coach", "arena", "event", "honor", "album", "pieces", "boards", "avatar", "frame", "chest", "bot", "puzzle", "vision", "pawns", "analysis"]) {
      await pa.send("Emulation.setDeviceMetricsOverride", { width: 375, height: 700, deviceScaleFactor: 2, mobile: true });
      const box = await pa.ev(`(async () => { document.querySelectorAll('.eca-spin-modal,#ecaMilestone,.eca-drop-modal').forEach(e => e.remove()); const c = document.querySelector('#mainView .game-card-${k}'); c.scrollIntoView({ block: 'center', inline: 'center' }); GameCardAnimator.activate(c); await new Promise(r => setTimeout(r, 330)); const r = c.getBoundingClientRect(); return { x: r.left + scrollX - 6, y: r.top + scrollY - 6, w: r.width + 12, h: r.height + 12 }; })()`);
      const shot = await pa.send("Page.captureScreenshot", { format: "png", clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: box.w, height: box.h, scale: 1 } });
      fs.writeFileSync(path.join(process.env.E2E_SHOTS, "card-" + k + ".png"), Buffer.from(shot.data, "base64"));
    }
    if (process.env.E2E_SHOTS) await pa.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    await pa.ev("GameCardAnimator.activate(null)");
    const uniq = await pa.ev(`(() => { const m = document.getElementById('mainView'), cards = [...m.querySelectorAll('.nf-row .nf-card, .nf-row .nf-poster-wrap')];
      const out = { cards: cards.length, noFx: [], kinds: [], sigs: {} };
      cards.forEach(c => { const k = [...c.classList].filter(x => x.startsWith('game-card-')); if (k.length !== 1) { out.noFx.push(c.getAttribute('onclick')); return; } out.kinds.push(k[0]);
        GameCardAnimator.activate(c); const names = new Set();
        c.querySelectorAll('.game-card-media *').forEach(e => getComputedStyle(e).animationName.split(',').map(s => s.trim()).filter(n => n && n !== 'none').forEach(n => names.add(n)));
        GameCardAnimator.sleep(c); out.sigs[k[0]] = [...names]; });
      out.dupKinds = out.kinds.filter((k, i) => out.kinds.indexOf(k) !== i);
      const count = {}; Object.values(out.sigs).forEach(ns => ns.forEach(n => { count[n] = (count[n] || 0) + 1; }));
      out.noOwn = Object.keys(out.sigs).filter(k => !out.sigs[k].some(n => count[n] === 1));
      out.still = Object.keys(out.sigs).filter(k => !out.sigs[k].length);
      return out; })()`);
    check("cards: every card in every row wakes with its own animation, no two alike", uniq.cards >= 20 && !uniq.noFx.length && !uniq.dupKinds.length && !uniq.noOwn.length && !uniq.still.length, { cards: uniq.cards, noFx: uniq.noFx, dupKinds: uniq.dupKinds, noOwn: uniq.noOwn, still: uniq.still });
    // ---------- games: full screen board ----------
    await pa.send("Page.bringToFront");
    const fsProbe = `(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
      const probe = async sub => { ecaBoardFs(false); switchTab('arena'); arenaSub(sub); await wait(700); const b = document.getElementById('ecaFsBtn'), board = document.querySelector('#mainView .eca-board');
        if (!b || !board) return { sub, found: false };
        const r0 = board.getBoundingClientRect().width, bs = b.getBoundingClientRect();
        b.click(); await wait(600);
        const mv = document.getElementById('mainView'), W = innerWidth, H = innerHeight, on = mv.classList.contains('board-fullscreen-active') && getComputedStyle(mv).position === 'fixed';
        const bd = document.querySelector('#mainView .eca-board').getBoundingClientRect(), bar = document.querySelector('#mainView .eca-arena-bar').getBoundingClientRect();
        const sq = [...document.querySelectorAll('#mainView .eca-board .eca-sq')].map(e => e.getBoundingClientRect());
        const inView = r => r.left >= -0.5 && r.top >= -0.5 && r.right <= W + 0.5 && r.bottom <= H + 0.5;
        const btn2 = document.getElementById('ecaFsBtn');
        const res = { sub, found: true, W, H, side: Math.round(bd.width), btn: Math.round(bs.width) + 'x' + Math.round(bs.height), size: bs.width >= 43.5 && bs.height >= 43.5, on,
          fits: inView(bd), all64: sq.length === 64 && sq.every(inView), square: Math.abs(bd.width - bd.height) <= 1,
          centered: Math.abs(bd.left - (W - bd.right)) <= 2, noScroll: document.scrollingElement.scrollHeight <= H + 1 && mv.scrollHeight <= mv.clientHeight + 1 && mv.scrollTop === 0 && scrollY === 0,
          docH: document.scrollingElement.scrollHeight, mvH: mv.scrollHeight + '/' + mv.clientHeight, bar: bar.height > 0 && bar.bottom <= bd.top + 1, big: bd.width >= Math.min(W - 32, H - 300) - 1, pressed: !!btn2 && btn2.getAttribute('aria-pressed') === 'true' };
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); await wait(250);
        res.off = !mv.classList.contains('board-fullscreen-active') && !document.documentElement.classList.contains('eca-board-fs') && getComputedStyle(mv).position !== 'fixed';
        res.back = Math.abs(document.querySelector('#mainView .eca-board').getBoundingClientRect().width - r0) < 2;
        return res; };
      out.game = await probe('pawns'); if (!out.game.found) out.game = await probe('puzzles'); out.analysis = await probe('analysis');
      ecaBoardFs(true); arenaSub('lobby'); await wait(250); out.leaveExits = !document.documentElement.classList.contains('eca-board-fs') && !document.getElementById('mainView').classList.contains('board-fullscreen-active');
      return out; })()`;
    const fsOk = p => p.found && p.size && p.on && p.fits && p.all64 && p.square && p.centered && p.noScroll && p.bar && p.big && p.pressed && p.off && p.back;
    const fsAll = [];
    for (const [w, h, mobile] of [[1280, 720, false], [1366, 768, false], [1920, 1080, false], [375, 667, true]]) {
      await pa.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile });
      const r = await pa.ev(fsProbe); fsAll.push({ view: w + "x" + h, ...r });
    }
    await pa.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    const fsBad = fsAll.filter(r => !fsOk(r.game) || !fsOk(r.analysis));
    check("board: full screen shows all 64 squares centered with no scrolling at 1280x720, 1366x768, 1920x1080 and 375x667, in a game and on the analysis board", !fsBad.length, fsBad.length ? fsBad : fsAll.map(r => r.view + " game " + r.game.side + " analysis " + r.analysis.side));
    check("board: going back to the lobby leaves full screen", fsAll.every(r => r.leaveExits), fsAll.map(r => r.leaveExits));
    if (process.env.E2E_SHOTS) for (const [w, h, mobile] of [[1366, 768, false], [375, 667, true]]) { await pa.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile }); await pa.ev("(async () => { switchTab('arena'); arenaSub('analysis'); await new Promise(r => setTimeout(r, 500)); ecaBoardFs(true); })()"); await sleep(600); const shot = await pa.send("Page.captureScreenshot", { format: "png" }); fs.writeFileSync(path.join(process.env.E2E_SHOTS, "board-fullscreen-" + w + ".png"), Buffer.from(shot.data, "base64")); await pa.ev("ecaBoardFs(false); arenaSub('lobby')"); }
    if (process.env.E2E_SHOTS) await pa.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    // ---------- games: back to the lobby (button and the phone/browser back) ----------
    const nav = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), out = { bad: [] };
      switchTab('arena'); arenaSub('lobby'); await wait(400); window.scrollTo(0, 420); await wait(80); out.y0 = Math.round(scrollY);
      for (const k of ['play', 'puzzles', 'vision', 'pawns', 'analysis', 'lessons', 'rush', 'duel', 'friend', 'speed', 'weekly', 'boss', 'cards']) {
        arenaSub(k); await wait(300);
        if (k === 'vision' && typeof visStart === 'function') { visStart(); await wait(60); }
        const pushed = !!history.state && history.state.view === k, btn = !!document.querySelector('#mainView button[onclick="arenaSub(\\'lobby\\')"]');
        history.back(); await wait(450);
        const ok = tab === 'arena' && arena.sub === 'lobby' && !(history.state && history.state.view) && !arena.vis.timer && !arena.vis.active && !arena.rush.timer && !!document.querySelector('#mainView .nf-billboard');
        if (!pushed || !btn || !ok) out.bad.push({ k, pushed, btn, sub: arena.sub, tab, state: history.state });
      }
      out.y = Math.round(scrollY);
      arenaSub('rush'); await wait(200); arenaSub('lobby'); await wait(100); out.button = arena.sub === 'lobby' && !(history.state && history.state.view);
      return out; })()`);
    check("back: the phone or browser back button from every game lands in the lobby with no timers left running", nav.bad.length === 0, nav.bad);
    check("back: the lobby comes back where you left it", Math.abs(nav.y - nav.y0) <= 4, nav);
    check("back: the «back to the lobby» button works and leaves no game step in the history", nav.button, nav);
    const navReset = await pa.ev(`(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
      const navBtn = id => document.querySelector('.nav-tab[onclick$="switchTab(\\'' + id + '\\')"]');
      switchTab('arena'); arenaSub('lobby'); await wait(200);
      arenaSub('rush'); await wait(200); await rushStart(); await wait(200); out.started = !!arena.rush.timer;
      navBtn('home').click(); await wait(300); out.home = tab === 'home' && arena.sub === 'lobby' && !arena.rush.timer;
      navBtn('arena').click(); await wait(400); out.arena = tab === 'arena' && arena.sub === 'lobby' && !!document.querySelector('#mainView .nf-billboard');
      arenaSub('puzzles'); await wait(300); navBtn('arena').click(); await wait(400); out.direct = tab === 'arena' && arena.sub === 'lobby' && !!document.querySelector('#mainView .nf-billboard');
      arenaSub('analysis'); await wait(200); switchTab('home'); switchTab('arena'); await wait(200); out.code = arena.sub === 'analysis';
      arenaSub('lobby'); return out; })()`);
    check("nav: game → Home → Training Arena opens the lobby, not the old game, and its timer is stopped", navReset.started && navReset.home && navReset.arena, navReset);
    check("nav: pressing Training Arena while inside a game goes straight to the lobby", navReset.direct, navReset);
    check("nav: code that opens a game itself is not affected", navReset.code, navReset);
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
    // ---------- home: gaming lobby layout ----------
    await pa.send("Page.bringToFront");
    const hm = await pa.ev(`(() => { const out = {};
      out.fns = ['ecaHomeCore', 'flCardHTML', 'ecaQuestsCardHTML', 'streakCardHTML', 'ecaMapHTML', 'ecaSpinCardHTML', 'ecaPetHTML', 'ecaAchHTML', 'liCardHTML', 'homeExtrasHTML', 'wkHomeCardHTML', 'funEventCardHTML', 'saTrophyCardHTML', 'annStudentHTML'].filter(n => typeof window[n] !== 'function');
      switchTab('arena'); switchTab('home'); const m = document.getElementById('mainView');
      out.intro = !!m.querySelector('.hm.hm-intro');
      out.cards = { player: m.querySelectorAll('.hm-hero .hm-player').length, play: !!m.querySelector('.hm-hero .eca-play-now'), shop: !!m.querySelector('#ecaShopCard'), map: !!m.querySelector('.eca-map'),
        mission: !!m.querySelector('[data-hm="mission"]'), lesson: !!m.querySelector('[data-hm="lesson"]'), sections: m.querySelectorAll('.hm-sec').length, xp: !!m.querySelector('.hm-player .hm-xp'), nick: !!m.querySelector('.hm-player input') };
      render(); out.again = !document.querySelector('#mainView .hm-intro');
      return out; })()`);
    check("home: every card's function is there", hm.fns.length === 0, hm.fns);
    check("home: player card, play now, quests, map, mission, lesson and shop each appear once in the new layout", hm.cards.player === 1 && hm.cards.play && hm.cards.shop && hm.cards.map && hm.cards.mission && hm.cards.lesson && hm.cards.sections >= 3 && hm.cards.xp && hm.cards.nick, hm.cards);
    check("home: the intro plays when you open home, not on every update", hm.intro && hm.again, hm);
    // ---------- home: living adventure map ----------
    const mp = await pa.ev(`(async () => { const out = {}, wait = ms => new Promise(r => setTimeout(r, ms)); switchTab('arena'); switchTab('home'); await wait(900);
      const v = document.querySelector('#mainView .eca-map-view'), box = v.querySelector('.eca-map-scroll'), now = v.querySelector('.eca-map-node.is-now'), u = currUser(), level = Math.min(6, Number(u.level) || 1);
      out.parts = !!(box.querySelector('.eca-map .eca-map-grid') && box.querySelectorAll('.eca-ember').length >= 6 && now && now.querySelectorAll('.eca-map-ring').length === 2 && now.querySelector('.eca-map-cta')
        && box.querySelector('.eca-map-token .eca-map-tok-av') && box.querySelector('.eca-map-token .eca-map-tok-pet') && /🔥/.test(box.querySelector('.eca-map-bubble').textContent));
      out.moves = [getComputedStyle(now.querySelector('.eca-map-badge')).animationName, getComputedStyle(now.querySelector('.eca-map-ring')).animationName, getComputedStyle(box.querySelector('.eca-map-tok')).animationName];
      const br = box.getBoundingClientRect(), nr = now.querySelector('.eca-map-disc').getBoundingClientRect();
      out.centered = nr.top >= br.top - 1 && nr.bottom <= br.bottom + 1 && (box.scrollHeight <= box.clientHeight || box.scrollTop > 0 || level >= 5);
      box.scrollTop = level >= 4 ? box.scrollHeight : 0; await wait(50); ecaMapCenter(false); await wait(50);
      const nr2 = now.querySelector('.eca-map-disc').getBoundingClientRect(); out.backHome = nr2.top >= br.top - 1 && nr2.bottom <= br.bottom + 1;
      const me = v.querySelector('.eca-map-me'), mr = me.getBoundingClientRect(); out.me = mr.width >= 43.5 && mr.height >= 43.5 && !!me.getAttribute('aria-label'); out.meSize = Math.round(mr.width) + 'x' + Math.round(mr.height) + ' ' + getComputedStyle(me).minHeight + ' ' + getComputedStyle(me).display;
      out.prog = v.querySelector('.eca-map-prog').textContent.trim();
      const lk = v.querySelector('.eca-map-node.is-locked');
      if (lk) { lk.click(); const tip = lk.querySelector('.eca-map-tip'); out.locked = tab === 'home' && lk.classList.contains('is-rattle') && /🔒/.test(tip.textContent) && getComputedStyle(tip).display === 'block' && getComputedStyle(lk.querySelector('.eca-map-badge')).animationName === 'ecaLockRattle'; }
      else out.locked = 'no locked kingdom';
      const d = document.createElement('div'); d.innerHTML = ecaMapHTML(Object.assign({}, u, { level: 3 }));
      out.done = d.querySelectorAll('.eca-map-node.is-done').length === 2 && d.querySelectorAll('.eca-map-node.is-done .eca-map-stars i').length === 6 && !!d.querySelector('.eca-map-road') && !!d.querySelector('.eca-map-energy[pathLength]') && !!d.querySelector('.eca-map-trail') && d.querySelectorAll('.eca-map-node.is-locked .eca-map-fog').length === 3;
      const tok = box.querySelector('.eca-map-token'); ecaMapSlide(box.querySelector('.eca-map'), tok, 1, 2);
      out.slide = tok.dataset.slide === '1' && tok.getAnimations().length > 0; await wait(1100);
      out.burst = true; render(); return out; })()`);
    check("map: battlefield, embers, the current kingdom with radar rings and play now, and your avatar with your pet", mp.parts, mp);
    check("map: the current kingdom floats, its radar pulses and your token bounces", mp.moves.join() === "ecaFloatNode,ecaRadar,ecaTokBob", mp.moves);
    check("map: opens centered on your kingdom, and «my place» brings it back", mp.centered && mp.backHome, mp);
    check("map: «my place» button is 44px or more, with the kingdom progress pill", mp.me && /(المرحلة|Kingdom) \d (من|of) 6 • \d+%/.test(mp.prog), { prog: mp.prog, size: mp.meSize });
    check("map: a locked kingdom shakes and says how to open it", mp.locked === true || mp.locked === "no locked kingdom", mp.locked);
    check("map: done kingdoms have 3 stars, a glowing road with flowing energy, and fog over locked ones", mp.done, mp);
    check("map: your token walks along the road to a new kingdom", mp.slide, mp);
    await pa.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    const calmMap = await pa.ev(`(() => { render(); const v = document.querySelector('#mainView .eca-map-view'), st = s => s ? getComputedStyle(s) : null;
      const r = { badge: st(v.querySelector('.eca-map-node.is-now .eca-map-badge')).animationName, ring: st(v.querySelector('.eca-map-ring')).display, ember: st(v.querySelector('.eca-ember')).display, tok: st(v.querySelector('.eca-map-tok')).animationName };
      const u = currUser(), level = Math.min(6, Number(u.level) || 1); if (level > 1) { localStorage.setItem('ECA_MAP_SEEN_' + u.id, String(level - 1)); render(); r.slide = document.querySelector('#mainView .eca-map-token').dataset.slide || ''; } else r.slide = '';
      return r; })()`);
    await pa.send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    check("map: with reduced motion nothing floats, pulses or walks", calmMap.badge === "none" && calmMap.ring === "none" && calmMap.ember === "none" && calmMap.tok === "none" && !calmMap.slide, calmMap);
    if (process.env.E2E_SHOTS) for (const [w, h] of [[375, 900], [1280, 900]]) {
      await pa.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
      await pa.ev("(() => { document.querySelectorAll('.eca-spin-modal,#ecaMilestone,.eca-drop-modal').forEach(e => e.remove()); render(); const v = document.querySelector('#mainView .eca-map-view'); window.scrollTo(0, v.getBoundingClientRect().top + scrollY - 120); })()"); await sleep(1500);
      const shot = await pa.send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(process.env.E2E_SHOTS, "map-" + w + ".png"), Buffer.from(shot.data, "base64"));
    }
    if (process.env.E2E_SHOTS) for (const [w, h] of [[375, 1500], [1280, 1500]]) {
      await pa.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
      await pa.ev("document.querySelectorAll('.eca-spin-modal,#ecaMilestone,.eca-drop-modal').forEach(e => e.remove()); render(); window.scrollTo(0, 0)"); await sleep(1200);
      const shot = await pa.send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(process.env.E2E_SHOTS, "home-" + w + ".png"), Buffer.from(shot.data, "base64"));
    }
    if (process.env.E2E_SHOTS) await pa.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
    if (process.env.E2E_SHOTS) for (const [w, h, theme] of [[375, 1400, "game"], [1280, 1100, "game"], [375, 1400, "kids"]]) {
      await pa.send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 800 });
      await pa.ev("(() => { document.querySelectorAll('.eca-spin-modal,#ecaMilestone,.eca-drop-modal').forEach(e => e.remove()); const keep = document.documentElement.className; if ('" + theme + "' === 'kids') { document.documentElement.className = 'kids'; } else applyTheme('" + theme + "'); switchTab('arena'); arenaSub('lobby'); window.scrollTo(0, 0); window.__keepTheme = window.__keepTheme || keep; })()"); await sleep(1200);
      const shot = await pa.send("Page.captureScreenshot", { format: "png" });
      fs.writeFileSync(path.join(process.env.E2E_SHOTS, "lobby-" + w + "-" + theme + ".png"), Buffer.from(shot.data, "base64"));
    }
    if (process.env.E2E_SHOTS) await pa.ev("document.documentElement.className = window.__keepTheme || document.documentElement.className; render();");
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
      const inScroller = e => { for (let p = e.parentElement; p && p.id !== "mainView"; p = p.parentElement) { const ox = getComputedStyle(p).overflowX; if (ox === "auto" || ox === "scroll") return true; } return false; };
      const cut = [...document.querySelectorAll("#mainView *")].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (r.right > W + 1 || r.left < -1) && !inScroller(e); })
        .map(e => (e.id ? "#" + e.id : (typeof e.className === "string" ? e.className : e.tagName).slice(0, 50)) + " " + Math.round(e.getBoundingClientRect().left) + ".." + Math.round(e.getBoundingClientRect().right));
      return { wide: wide ? document.documentElement.scrollWidth : 0, small: [...new Set(small)].slice(0, 40), cut: cut.slice(0, 8) }; })()`;
    const views = [["home", "switchTab('home')"]].concat(["lobby", "play", "puzzles", "lessons", "rush", "vision", "pawns", "duel", "friend", "speed", "weekly", "boss", "cards", "analysis"].map(v => [v, `switchTab('arena'); arena.sub='${v}'; render();`]));
    const fitBad = [];
    for (const [name, go] of views) { await pa.ev(go); await sleep(700); const r = await pa.ev(fit); if (r.wide || r.small.length || r.cut.length) fitBad.push({ view: name, ...r }); }
    check("320px: no sideways scroll on any view", !fitBad.some(r => r.wide), fitBad.filter(r => r.wide));
    check("320px: nothing is cut off at the sides", !fitBad.some(r => r.cut.length), fitBad.filter(r => r.cut.length).map(r => ({ view: r.view, cut: r.cut })));
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
