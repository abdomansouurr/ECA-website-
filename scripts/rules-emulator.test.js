// Runs the real firestore.rules on the local emulator (project demo-eca). Never touches production.
// Run with: npm run test:rules:emulator (needs Java). Unlike rules-sim, this enforces Firestore's real limits.
// A second pass adds extra expressions to both write paths, so it fails when the rules get close to the 1000 limit.
const { initializeTestEnvironment } = require("@firebase/rules-unit-testing");
const firebase = require("firebase/compat/app"); require("firebase/compat/firestore");
const fs = require("fs"), path = require("path");
const RULES_FILE = path.join(__dirname, "..", "firestore.rules");
const MARGIN_GROUPS = Number(process.env.RULES_MARGIN_GROUPS || 2);   // 20 extra terms per group
const FV = firebase.firestore.FieldValue, TS = firebase.firestore.Timestamp;
const ts = () => FV.serverTimestamp();
const pad = n => String(n).padStart(2, "0");
const d = new Date(), today = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const uid = "stuA1";
const fresh = { name: "Ali", username: "ali_1", email: "a@b.co", phone: "01000000000", parentPhone: "01100000000", role: "student", level: 1, group: "A", mode: "offline", att: { "1-0": true }, hw: {}, puz: { t: 0, c: 0 } };
const legacy = Object.assign({}, fresh, { coachName: "Coach", stuCode: "ECA-0001", level: 2, att: { "1-0": true, "2-3": true }, hw: { "1-0": true }, puz: { t: 12, c: 9 }, lastAttempt: "stuA1_arena_old",
  arena: { days: ["2026-10-01", "2026-10-02"], puzTried: 5, puzSolved: 3, puzStreak: 1, puzBestStreak: 2, stars: 7, missionDate: "2026-10-02", missionDone: true, games: { w: 1, l: 2, d: 0 } },
  examState: { "1": { status: "passed", score: 80, attempts: 1, date: "2026-09-01" } }, certificates: [{ step: 1, score: 80, studentName: "Ali", coachName: "Coach", date: "2026-09-01" }] });
const rich = Object.assign({}, legacy, { arena: Object.assign({}, legacy.arena, { stars: 1000, xp: 500 }), shop: { titles: [], bots: [], hints: 2, activeTitle: "" } });
const STARS = { daily: 1, easiest: 1, easier: 2, normal: 3, harder: 4, hardest: 5 }, PRICES = { hint: 20, "bot-1": 20, "bot-2": 40, "title-tactics": 50, "bot-3": 70, "bot-4": 100, "title-knight": 120, "bot-5": 150, "bot-6": 220, "title-master": 250, "bot-7": 300 };
async function econ(db, r, change) {
  const ur = db.collection("users").doc(uid), rr = ur.collection("economy").doc(r.id);
  return db.runTransaction(async tx => {
    const p = (await tx.get(ur)).data(); await tx.get(rr);
    const arena = Object.assign({}, p.arena || {}), shop = Object.assign({ titles: [], bots: [], hints: 0, activeTitle: "" }, p.shop || {});
    arena.stars = (Number(arena.stars) || 0) + r.starsDelta; arena.xp = (Number(arena.xp) || 0) + r.xpDelta;
    if (r.missionBonus) { arena.missionDate = today; arena.missionDone = true; }
    const next = change ? change(shop, arena) || shop : shop;
    tx.update(ur, { arena, shop: next, lastEconomy: r.id });
    tx.set(rr, { uid, kind: r.kind, source: r.source || "", key: r.key || "", day: today, item: r.item || "", score: r.score || 0, starsDelta: r.starsDelta, xpDelta: r.xpDelta, missionBonus: !!r.missionBonus, at: ts() });
  });
}
const earn = (db, source, key, stars, extra = {}) => econ(db, Object.assign({ kind: "earn", source, key, starsDelta: stars, xpDelta: stars * 20, id: source === "lesson" ? "lesson-" + key : source === "puzzle" ? `puzzle-${today}-${key}` : source === "bot" ? `bot-${today}-${key}` : `${source}-${today}` }, extra));
const buy = (db, item, change, price) => econ(db, { kind: "purchase", item, starsDelta: -(price === undefined ? PRICES[item] : price), xpDelta: 0, id: "buy-" + item + "-abcd12345678" }, change);
function grant(item) { return shop => { if (item === "hint") shop.hints++; else if (item.startsWith("title")) shop.titles = [...shop.titles, item]; else shop.bots = [...shop.bots, Number(item.slice(4))]; return shop; }; }
async function attempt(db, kind, key, ok, change) {
  const u = (await db.collection("users").doc(uid).get()).data(), id = `${uid}_${kind}_${key}`, b = db.batch();
  b.set(db.collection("attempts").doc(id), { uid, at: ts(), kind, key, ok, step: 1 });
  b.update(db.collection("users").doc(uid), Object.assign({ lastAttempt: id }, change(u)));
  return b.commit();
}
const dayPush = u => [...((u.arena || {}).days || []), today];
const daily = (db, ok = true, bump = 1) => attempt(db, "daily", today + "-L1", ok, u => ({ puz: { t: u.puz.t + bump, c: u.puz.c + (ok ? bump : 0) }, arena: Object.assign({}, u.arena || {}, { days: dayPush(u) }) }));
const arenaAtt = (db, ok) => attempt(db, "arena", "AbC12", ok, u => { const a = u.arena || {}; const st = ok ? (a.puzStreak || 0) + 1 : 0; return { arena: Object.assign({}, a, { puzTried: (a.puzTried || 0) + 1, puzSolved: (a.puzSolved || 0) + (ok ? 1 : 0), puzStreak: st, puzBestStreak: Math.max(a.puzBestStreak || 0, st), days: dayPush(u) }) }; });
const patch = (db, p) => db.collection("users").doc(uid).update(p);

function withMargin(rules, groups) {
  const terms = Array(20).fill("1 == 1").join(" && ");
  let defs = "", calls = [];
  for (let i = 0; i < groups; i++) { defs += "function pad" + i + "() { return " + terms + "; }\n    "; calls.push("pad" + i + "()"); }
  const padCall = "&& " + calls.join(" && ") + " ";
  let s = rules.replace("function signedIn()", defs + "function signedIn()");
  for (const anchor of ["&& (!changed.hasAny(['puz','arena'])", "&& r.at == request.time && dateNear(r.day.split"]) {
    if (s.split(anchor).length !== 2) throw new Error("Margin anchor not found in firestore.rules: " + anchor);
    s = s.replace(anchor, padCall + anchor);
  }
  return s;
}

async function runSuite(label, rules, quiet) {
  const env = await initializeTestEnvironment({ projectId: "demo-eca", firestore: { rules, host: "127.0.0.1", port: 8085 } });
  let pass = 0, fail = 0, limited = 0; const failures = [];
  const seedAs = fn => env.withSecurityRulesDisabled(c => fn(c.firestore()));
  const T = async (name, expect, profile, fn, seed) => {
    await env.clearFirestore();
    await seedAs(async s => { if (profile) await s.collection("users").doc(uid).set(profile); if (seed) await seed(s); });
    const db = env.authenticatedContext(uid, { firebase: { sign_in_provider: "password" } }).firestore();
    let got = true, msg = "";
    try { await fn(db); } catch (e) { got = false; msg = String(e.message).replace(/\s+/g, " ").slice(0, 300); }
    const lim = !got && /1000 expressions/.test(msg); if (lim) limited++;
    const ok = got === expect; ok ? pass++ : (fail++, failures.push(name + " :: " + msg));
    if (!ok || !quiet) console.log((ok ? "OK  " : "FAIL"), expect ? "allow" : "deny ", name, lim ? "[HIT-1000-LIMIT]" : "");
  };
  const adminCtx = () => env.authenticatedContext("admin1", { firebase: { sign_in_provider: "password" } }).firestore();
  const staffSeed = async s => { await s.collection("staff").doc("admin1").set({ role: "admin", name: "A", username: "a" }); };

  // earn
  await T("lesson: new account", true, fresh, db => earn(db, "lesson", "1-0", 1));
  await T("lesson: legacy account", true, legacy, db => earn(db, "lesson", "2-3", 1));
  await T("lesson: not attended", false, fresh, db => earn(db, "lesson", "1-5", 1));
  await T("lesson: forged +5 stars", false, fresh, db => earn(db, "lesson", "1-0", 5));
  await T("lesson: collected twice", false, fresh, async db => { await earn(db, "lesson", "1-0", 1); await econ(db, { kind: "earn", source: "lesson", key: "1-0", starsDelta: 1, xpDelta: 20, id: "lesson-1-0" }); });
  for (const k of Object.keys(STARS)) await T("puzzle " + k + " + mission bonus", true, legacy, db => econ(db, { kind: "earn", source: "puzzle", key: k, starsDelta: STARS[k] + 1, xpDelta: STARS[k] * 20, missionBonus: true, id: `puzzle-${today}-${k}` }));
  await T("puzzle: bonus claimed without mission update", false, legacy, db => earn(db, "puzzle", "daily", 2, { xpDelta: 20, missionBonus: false }));
  await T("bot 0 reward", true, fresh, db => earn(db, "bot", "0", 1));
  await T("bot 7 locked", false, rich, db => earn(db, "bot", "7", 8));
  await T("bot 7 owned", true, Object.assign({}, rich, { shop: { titles: [], bots: [7], hints: 0, activeTitle: "" } }), db => earn(db, "bot", "7", 8));
  await T("pawn reward", true, fresh, db => earn(db, "pawn", today, 2));
  // Coach bot: stars follow the chosen level, once a day per level
  const coachWin = (db, level, stars = level) => econ(db, { kind: "earn", source: "coach", key: String(level), starsDelta: stars, xpDelta: stars * 20, id: `coach-${today}-${level}` });
  await T("coach level 1 win", true, fresh, db => coachWin(db, 1));
  await T("coach level 10 win", true, legacy, db => coachWin(db, 10));
  await T("coach win with forged stars", false, fresh, db => coachWin(db, 2, 9));
  await T("coach level 11 rejected", false, fresh, db => coachWin(db, 11));
  await T("coach same level twice a day", false, fresh, async db => { await coachWin(db, 3); await coachWin(db, 3); });
  await T("coach two levels on the same day", true, fresh, async db => { await coachWin(db, 3); await coachWin(db, 4); });
  // daily quests: fixed reward, once a day per quest
  const quest = (db, key, stars) => econ(db, { kind: "earn", source: "quest", key, starsDelta: stars, xpDelta: stars * 20, id: `quest-${today}-${key}` });
  await T("quest daily", true, fresh, db => quest(db, "daily", 1));
  await T("quest puzzles on a legacy account", true, legacy, db => quest(db, "puzzles", 2));
  await T("quest win", true, fresh, db => quest(db, "win", 2));
  await T("quest with forged stars", false, fresh, db => quest(db, "win", 9));
  await T("quest with an unknown key", false, fresh, db => quest(db, "free", 2));
  await T("same quest twice a day", false, fresh, async db => { await quest(db, "win", 2); await quest(db, "win", 2); });
  await T("three quests on the same day", true, fresh, async db => { await quest(db, "daily", 1); await quest(db, "puzzles", 2); await quest(db, "win", 2); });
  await T("quest counters saved with an arena attempt", true, legacy, db => attempt(db, "arena", "QuEsT1", true, u => ({ arena: Object.assign({}, u.arena, { puzTried: u.arena.puzTried + 1, puzSolved: u.arena.puzSolved + 1, puzStreak: u.arena.puzStreak + 1, puzBestStreak: Math.max(u.arena.puzBestStreak, u.arena.puzStreak + 1), qd: today, qp: 1, qw: 0, days: dayPush(u) }) })));
  await T("quest win counter saved with a game result", true, legacy, db => patch(db, { arena: Object.assign({}, legacy.arena, { games: { w: 2, l: 2, d: 0 }, qd: today, qp: 0, qw: 1, days: [...legacy.arena.days, today] }) }));
  // Puzzle Rush: stars follow the score, once a day
  const rush = (db, score, stars) => econ(db, { kind: "earn", source: "rush", key: today, score, starsDelta: stars, xpDelta: stars * 20, id: "rush-" + today });
  await T("rush score 3", true, fresh, db => rush(db, 3, 1));
  await T("rush score 15 on a legacy account", true, legacy, db => rush(db, 15, 5));
  await T("rush score 40 stays at 5 stars", true, fresh, db => rush(db, 40, 5));
  await T("rush forged stars", false, fresh, db => rush(db, 3, 5));
  await T("rush score under 3", false, fresh, db => rush(db, 2, 1));
  await T("rush twice a day", false, fresh, async db => { await rush(db, 6, 2); await rush(db, 6, 2); });
  // Streak Freeze: bought with stars, used on a recent missed day
  const dayBack = n => { const x = new Date(Date.parse(today + "T12:00:00Z") - n * 864e5); return x.toISOString().slice(0, 10); };
  const buyFreeze = (db, price = 30) => buy(db, "streak-freeze", s => { s.freezes = (s.freezes || 0) + 1; return s; }, price);
  const useFreeze = (db, key, change) => econ(db, { kind: "spend-freeze", key, starsDelta: 0, xpDelta: 0, id: "freeze-" + key }, change || (s => { s.freezes = s.freezes - 1; s.frozen = [...(s.frozen || []), key]; return s; }));
  const withFreeze = n => Object.assign({}, rich, { shop: { titles: [], bots: [], hints: 0, activeTitle: "", freezes: n, frozen: [] } });
  await T("buy streak freeze", true, rich, db => buyFreeze(db));
  await T("buy streak freeze at a forged price", false, rich, db => buyFreeze(db, 1));
  await T("hold a third streak freeze", false, withFreeze(2), db => buyFreeze(db));
  await T("use freeze for yesterday", true, withFreeze(1), db => useFreeze(db, dayBack(1)));
  await T("use freeze for two days ago", true, withFreeze(2), db => useFreeze(db, dayBack(2)));
  await T("use freeze with none left", false, withFreeze(0), db => useFreeze(db, dayBack(1)));
  await T("use freeze on today", false, withFreeze(1), db => useFreeze(db, today));
  await T("use freeze on an old day", false, withFreeze(1), db => useFreeze(db, dayBack(9)));
  await T("use freeze twice on one day", false, withFreeze(2), async db => { await useFreeze(db, dayBack(1)); await useFreeze(db, dayBack(1)); });
  await T("use freeze without paying for it", false, withFreeze(1), db => useFreeze(db, dayBack(1), s => { s.frozen = [dayBack(1)]; return s; }));
  await T("frozen days written with no receipt", false, withFreeze(1), db => patch(db, { shop: { titles: [], bots: [], hints: 0, activeTitle: "", freezes: 1, frozen: [dayBack(1)] } }));
  await T("freezes added with no receipt", false, rich, db => patch(db, { shop: { titles: [], bots: [], hints: 2, activeTitle: "", freezes: 2 } }));
  await T("reward adds a freeze for free", false, withFreeze(0), db => econ(db, { kind: "earn", source: "lesson", key: "1-0", starsDelta: 1, xpDelta: 20, id: "lesson-1-0" }, s => { s.freezes = 2; return s; }));
  await T("hint purchase adds frozen days", false, withFreeze(1), db => buy(db, "hint", s => { s.hints++; s.frozen = [dayBack(1)]; return s; }));
  // daily login reward: decided by the date, once a day
  const dom = Number(today.slice(8)), loginStars = dom % 7 === 0 ? 3 : dom % 3 === 0 ? 2 : 1;
  const login = (db, stars = loginStars, day = today) => econ(db, { kind: "earn", source: "login", key: day, starsDelta: stars, xpDelta: stars * 20, id: "login-" + day });
  await T("login reward: new account", true, fresh, db => login(db));
  await T("login reward: legacy account", true, legacy, db => login(db));
  await T("login reward: forged bigger prize", false, fresh, db => login(db, loginStars + 1));
  await T("login reward: twice in one day", false, fresh, async db => { await login(db); await login(db); });
  await T("vision reward score 30", true, fresh, db => earn(db, "vision", today, 10, { score: 30 }));
  await T("vision forged stars", false, fresh, db => earn(db, "vision", today, 10, { score: 3 }));
  // shop
  for (const item of Object.keys(PRICES)) await T("buy " + item, true, rich, db => buy(db, item, grant(item)));
  await T("buy without stars", false, fresh, db => buy(db, "title-master", grant("title-master")));
  await T("buy at a forged price", false, rich, db => buy(db, "title-master", grant("title-master"), 1));
  await T("buy title already owned", false, Object.assign({}, rich, { shop: { titles: ["title-knight"], bots: [], hints: 0, activeTitle: "" } }), db => buy(db, "title-knight", shop => { shop.titles = ["title-knight", "title-knight"]; return shop; }));
  await T("buy grants a different item", false, rich, db => buy(db, "hint", grant("bot-7")));
  await T("spend hint", true, rich, db => econ(db, { kind: "spend-hint", starsDelta: 0, xpDelta: 0, id: "hint-use-abcd12345678" }, s => { s.hints--; return s; }));
  await T("spend hint with none left", false, Object.assign({}, rich, { shop: { titles: [], bots: [], hints: 0, activeTitle: "" } }), db => econ(db, { kind: "spend-hint", starsDelta: 0, xpDelta: 0, id: "hint-use-abcd12345678" }, s => { s.hints = -1; return s; }));
  await T("equip owned title", true, Object.assign({}, rich, { shop: { titles: ["title-knight"], bots: [], hints: 0, activeTitle: "" } }), db => patch(db, { shop: { titles: ["title-knight"], bots: [], hints: 0, activeTitle: "title-knight" } }));
  await T("equip locked title", false, rich, db => patch(db, { shop: { titles: [], bots: [], hints: 2, activeTitle: "title-master" } }));
  // cosmetics
  const COSMETICS = { "avatar-rocket": 25, "avatar-robot": 25, "avatar-owl": 25, "board-neon": 40, "avatar-crown": 60, "avatar-dragon": 60, "board-ember": 60, "piece-neon": 80, "board-royal": 90, "piece-gold": 150 };
  const addItem = id => s => { s.items = [...(s.items || []), id]; return s; };
  const withItems = (items, eq) => Object.assign({}, rich, { shop: Object.assign({ titles: [], bots: [], hints: 0, activeTitle: "", items }, eq ? { eq } : {}) });
  const shopWith = (items, eq) => ({ titles: [], bots: [], hints: 0, activeTitle: "", items, eq });
  for (const id of Object.keys(COSMETICS)) await T("buy " + id, true, rich, db => buy(db, id, addItem(id), COSMETICS[id]));
  await T("buy cosmetic with a full inventory", true, withItems(Object.keys(COSMETICS).filter(x => x !== "piece-gold"), { b: "board-neon", p: "piece-neon", a: "avatar-owl" }), db => buy(db, "piece-gold", addItem("piece-gold"), 150));
  await T("buy cosmetic at a forged price", false, rich, db => buy(db, "piece-gold", addItem("piece-gold"), 1));
  await T("buy unknown cosmetic", false, rich, db => buy(db, "board-free", addItem("board-free"), 1));
  await T("buy cosmetic already owned", false, withItems(["board-neon"]), db => buy(db, "board-neon", addItem("board-neon"), 40));
  await T("cosmetic purchase grants another item", false, rich, db => buy(db, "avatar-owl", addItem("piece-gold"), 25));
  await T("cosmetic purchase adds a bot", false, rich, db => buy(db, "avatar-owl", s => { s.items = ["avatar-owl"]; s.bots = [7]; return s; }, 25));
  await T("cosmetic purchase adds a freeze", false, rich, db => buy(db, "avatar-owl", s => { s.items = ["avatar-owl"]; s.freezes = 2; return s; }, 25));
  await T("cosmetic purchase equips another item", false, withItems(["board-neon"]), db => buy(db, "avatar-owl", s => { s.items = [...s.items, "avatar-owl"]; s.eq = { b: "board-neon" }; return s; }, 25));
  await T("hint purchase adds a cosmetic", false, rich, db => buy(db, "hint", s => { s.hints++; s.items = ["piece-gold"]; return s; }));
  await T("reward adds a cosmetic", false, rich, db => econ(db, { kind: "earn", source: "pawn", key: today, starsDelta: 2, xpDelta: 40, id: "pawn-" + today }, s => { s.items = ["piece-gold"]; return s; }));
  await T("reward still works with cosmetics owned", true, withItems(["board-neon"], { b: "board-neon" }), db => econ(db, { kind: "earn", source: "pawn", key: today, starsDelta: 2, xpDelta: 40, id: "pawn-" + today }));
  await T("cosmetic added with no receipt", false, rich, db => patch(db, { shop: { titles: [], bots: [], hints: 2, activeTitle: "", items: ["piece-gold"] } }));
  await T("equip owned cosmetics", true, withItems(["board-neon", "avatar-owl"]), db => patch(db, { shop: shopWith(["board-neon", "avatar-owl"], { b: "board-neon", a: "avatar-owl" }) }));
  await T("remove an equipped cosmetic", true, withItems(["board-neon"], { b: "board-neon" }), db => patch(db, { shop: shopWith(["board-neon"], { b: "" }) }));
  await T("equip a cosmetic not owned", false, withItems(["board-neon"]), db => patch(db, { shop: shopWith(["board-neon"], { b: "board-royal" }) }));
  await T("equip with an unknown slot", false, withItems(["board-neon"]), db => patch(db, { shop: shopWith(["board-neon"], { x: "board-neon" }) }));
  await T("equip and add an item together", false, withItems(["board-neon"]), db => patch(db, { shop: shopWith(["board-neon", "piece-gold"], { p: "piece-gold" }) }));
  await T("edit stars with no receipt", false, legacy, db => patch(db, { arena: Object.assign({}, legacy.arena, { stars: 999 }) }));
  // attempts + days
  await T("daily attempt: first day of a new account", true, fresh, db => daily(db));
  await T("daily attempt: legacy", true, legacy, db => daily(db));
  await T("daily attempt: +5 inflation", false, legacy, db => daily(db, true, 5));
  await T("arena attempt right: legacy", true, legacy, db => arenaAtt(db, true));
  await T("arena attempt wrong: new account", true, fresh, db => arenaAtt(db, false));
  await T("first active day alone", true, fresh, db => patch(db, { arena: { days: [today] } }));
  await T("days wiped to today", false, legacy, db => patch(db, { arena: Object.assign({}, legacy.arena, { days: [today] }) }));
  await T("malformed day", false, legacy, db => patch(db, { arena: Object.assign({}, legacy.arena, { days: [...legacy.arena.days, today + "-x"] }) }));
  await T("future day", false, legacy, db => patch(db, { arena: Object.assign({}, legacy.arena, { days: [...legacy.arena.days, "2099-01-01"] }) }));
  { const full = Array.from({ length: 800 }, (_, i) => new Date(Date.UTC(2023, 0, 1 + i)).toISOString().slice(0, 10));
    const p = Object.assign({}, legacy, { arena: Object.assign({}, legacy.arena, { days: full }) });
    await T("day rolls off at 800 cap", true, p, db => patch(db, { arena: Object.assign({}, p.arena, { days: [...full.slice(1), today] }) })); }
  // profile
  await T("ordinary save (nickname)", true, legacy, db => patch(db, { nickname: "Rook" }));
  await T("student marks attendance", false, legacy, db => patch(db, { att: Object.assign({}, legacy.att, { "2-4": true }) }));
  await T("student edits level", false, legacy, db => patch(db, { level: 5 }));
  await T("student edits group", false, legacy, db => patch(db, { group: "B" }));
  await T("reward heals an unsafe name", true, Object.assign({}, fresh, { name: "O'Neil" }), db => db.runTransaction(async tx => { const ur = db.collection("users").doc(uid), rr = ur.collection("economy").doc("lesson-1-0"); await tx.get(ur); await tx.get(rr); tx.update(ur, { name: "ONeil", arena: { stars: 1, xp: 20 }, shop: { titles: [], bots: [], hints: 0, activeTitle: "" }, lastEconomy: "lesson-1-0" }); tx.set(rr, { uid, kind: "earn", source: "lesson", key: "1-0", day: today, item: "", score: 0, starsDelta: 1, xpDelta: 20, missionBonus: false, at: ts() }); }));
  // exam: start -> pass -> first certificate
  const exId = uid + "_exam_1-1", started = () => ({ examState: { "1": { status: "failed", score: 0, attempts: 1, reqRetry: false, inProgress: true, date: today } } });
  const startedProfile = Object.assign({}, fresh, started(), { lastAttempt: exId });
  const seedExam = mins => s => s.collection("attempts").doc(exId).set({ uid, kind: "exam", key: "1-1", ok: false, step: 1, at: TS.fromMillis(Date.now() - mins * 60000) });
  await T("exam start", true, fresh, db => attempt(db, "exam", "1-1", false, started));
  const passBody = { examState: { "1": { status: "passed", score: 80, attempts: 1, date: today } }, level: 2, certificates: [{ step: 1, score: 80, studentName: "Ali", coachName: "C", date: today }] };
  await T("exam pass with first certificate", true, startedProfile, db => patch(db, passBody), seedExam(5));
  await T("exam pass after 25 min", false, startedProfile, db => patch(db, passBody), seedExam(25));
  await T("exam pass jumps to level 4", false, startedProfile, db => patch(db, Object.assign({}, passBody, { level: 4 })), seedExam(5));
  await T("exam certificate score forged", false, startedProfile, db => patch(db, Object.assign({}, passBody, { certificates: [{ step: 1, score: 100, date: today }] })), seedExam(5));
  await T("exam fail in time", true, startedProfile, db => patch(db, { examState: { "1": { status: "failed", score: 40, attempts: 1, reqRetry: false, date: today } } }), seedExam(5));
  // placement results
  const seedPT = s => s.collection("placementTests").doc("01000000000").set({ owner: uid, status: "in_progress", total: 20, answers: {}, name: "A", phone: "01000000000" });
  const pt = db => db.collection("placementTests").doc("01000000000");
  await T("placement: numeric result", true, null, db => pt(db).update({ status: "done", score: 80, correct: 16, suggested: 5, finishedAt: Date.now(), answers: {} }), seedPT);
  await T("placement: dotted answer save", true, null, db => pt(db).update({ "answers.3": { k: "p", ok: 1, c: "e2e4", s: 3, q: "x" } }), seedPT);
  await T("placement: XSS string in score", false, null, db => pt(db).update({ status: "done", score: "<img src=x onerror=1>" }), seedPT);
  await T("placement: XSS string in suggested", false, null, db => pt(db).update({ status: "done", suggested: "1);alert(1);(" }), seedPT);
  // staff: notification batch sizes
  const notif = () => ({ type: "announcement", titleAr: "t", titleEn: "t", bodyAr: "b", bodyEn: "b", createdAt: ts(), read: false });
  const seedStudents = async s => { await staffSeed(s); for (let i = 0; i < 12; i++) await s.collection("users").doc("s" + i).set(fresh); };
  const sendTo = n => async () => { const db = adminCtx(), b = db.batch(); for (let i = 0; i < n; i++) b.set(db.collection("users").doc("s" + i).collection("notifications").doc("announcement-x"), notif()); await b.commit(); };
  await T("notifications: batch of 6", true, null, sendTo(6), seedStudents);
  // purge + restore
  const past = TS.fromMillis(Date.now() - 86400000), future = TS.fromMillis(Date.now() + 86400000);
  const seedDel = when => async s => { await staffSeed(s); await s.collection("users").doc(uid).set(fresh); await s.collection("users").doc(uid).collection("economy").doc("r1").set({ uid }); await s.collection("users").doc(uid).collection("notifications").doc("n1").set({ read: false }); await s.collection("deleted").doc(uid).set({ deletedAt: past, expiresAt: when, name: "Ali", by: "admin1" }); };
  const delRef = db => db.collection("deleted").doc(uid), ecoRef = db => db.collection("users").doc(uid).collection("economy");
  await T("purge gate: before 30 days denied", false, null, () => ecoRef(adminCtx()).get(), seedDel(future));
  await T("purge gate: after 30 days allowed", true, null, () => ecoRef(adminCtx()).get(), seedDel(past));
  await T("purge: delete receipt before 30 days denied", false, null, () => ecoRef(adminCtx()).doc("r1").delete(), seedDel(future));
  await T("purge: delete receipt after 30 days", true, null, () => ecoRef(adminCtx()).doc("r1").delete(), seedDel(past));
  await T("purge: read notifications after 30 days", true, null, () => adminCtx().collection("users").doc(uid).collection("notifications").get(), seedDel(past));
  await T("tombstone scrub after 30 days", true, null, () => delRef(adminCtx()).update({ name: "", purgedAt: ts() }), seedDel(past));
  await T("tombstone scrub before 30 days denied", false, null, () => delRef(adminCtx()).update({ name: "", purgedAt: ts() }), seedDel(future));
  await T("restore before 30 days", true, null, () => delRef(adminCtx()).delete(), seedDel(future));
  await T("restore after 30 days", true, null, () => delRef(adminCtx()).delete(), seedDel(past));
  await T("restore after purge denied", false, null, () => delRef(adminCtx()).delete(), async s => { await seedDel(past)(s); await s.collection("deleted").doc(uid).update({ purgedAt: past }); });
  await T("deleted student cannot earn", false, fresh, db => earn(db, "lesson", "1-0", 1), s => s.collection("deleted").doc(uid).set({ expiresAt: future }));

  console.log(`\n${label}: ${pass} passed, ${fail} failed, ${limited} hit the 1000 limit`);
  if (failures.length) console.log("FAILURES:\n  " + failures.join("\n  "));
  await env.cleanup();
  return fail;
}

(async () => {
  const rules = fs.readFileSync(RULES_FILE, "utf8");
  const failed = await runSuite("Rules", rules, false);
  const marginFailed = await runSuite("Rules + " + MARGIN_GROUPS * 20 + " extra terms", withMargin(rules, MARGIN_GROUPS), true);
  if (marginFailed && !failed) console.log("\nThe rules pass, but they are too close to Firestore's limit of 1000 expressions per request.");
  process.exit(failed || marginFailed ? 1 : 0);
})().catch(e => { console.error("HARNESS", e); process.exit(1); });
