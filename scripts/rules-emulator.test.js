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
const STARS = { daily: 1, easiest: 1, easier: 2, normal: 3, harder: 4, hardest: 5 }, PRICES = { hint: 20, "bot-1": 20, "bot-2": 40, "title-tactics": 50, "bot-3": 70, "bot-4": 100, "title-knight": 120, "bot-5": 150, "bot-6": 220, "title-master": 250, "bot-7": 300, "title-novice": 15, "title-wizard": 180 };
async function econ(db, r, change) {
  const ur = db.collection("users").doc(uid), rr = ur.collection("economy").doc(r.id);
  return db.runTransaction(async tx => {
    const p = (await tx.get(ur)).data(); await tx.get(rr);
    const arena = Object.assign({}, p.arena || {}), shop = Object.assign({ titles: [], bots: [], hints: 0, activeTitle: "" }, p.shop || {});
    arena.stars = (Number(arena.stars) || 0) + r.starsDelta; arena.xp = (Number(arena.xp) || 0) + r.xpDelta;
    if (r.source === "puzzle" && r.key === "daily" && !r.noDailyLock) arena.lastDailyPuzzleSolvedDate = today;   // the daily puzzle locks its day in the same write
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
  // تلميحات الكوتش بتقلل الجايزة: أي عدد صحيح من 1 لحد الكاملة
  await T("puzzle: reward lowered by coach hints (x0.75)", true, legacy, db => econ(db, { kind: "earn", source: "puzzle", key: "hardest", starsDelta: 3 + 1, xpDelta: 75, missionBonus: true, id: `puzzle-${today}-hardest` }));
  await T("puzzle: hinted reward above the full amount", false, legacy, db => econ(db, { kind: "earn", source: "puzzle", key: "hardest", starsDelta: 6 + 1, xpDelta: 100, missionBonus: true, id: `puzzle-${today}-hardest` }));
  await T("daily puzzle: reward without locking the day", false, legacy, db => econ(db, { kind: "earn", source: "puzzle", key: "daily", starsDelta: 2, xpDelta: 20, missionBonus: true, id: `puzzle-${today}-daily`, noDailyLock: true }));
  await T("daily puzzle: reward when today is already locked", false, Object.assign({}, legacy, { arena: Object.assign({}, legacy.arena, { lastDailyPuzzleSolvedDate: today }) }), db => econ(db, { kind: "earn", source: "puzzle", key: "daily", starsDelta: 2, xpDelta: 20, missionBonus: true, id: `puzzle-${today}-daily` }));
  await T("daily puzzle: paid, then the lock cleared by hand", true, legacy, async db => {
    await econ(db, { kind: "earn", source: "puzzle", key: "daily", starsDelta: 2, xpDelta: 20, missionBonus: true, id: `puzzle-${today}-daily` });
    const u = (await db.collection("users").doc(uid).get()).data();
    await patch(db, { arena: Object.assign({}, u.arena, { lastDailyPuzzleSolvedDate: "" }) });
  });
  await T("daily puzzle: clearing the lock does not pay the day twice", false, Object.assign({}, legacy, { arena: Object.assign({}, legacy.arena, { stars: 9, xp: 20, missionDate: today, missionDone: true, lastDailyPuzzleSolvedDate: "" }) }),
    db => econ(db, { kind: "earn", source: "puzzle", key: "daily", starsDelta: 1, xpDelta: 20, missionBonus: false, id: `puzzle-${today}-daily` }),
    s => s.collection("users").doc(uid).collection("economy").doc(`puzzle-${today}-daily`).set({ uid, kind: "earn", source: "puzzle", key: "daily", day: today, item: "", score: 0, starsDelta: 2, xpDelta: 20, missionBonus: true, at: ts() }));
  await T("puzzle: hinted reward of zero xp", false, legacy, db => econ(db, { kind: "earn", source: "puzzle", key: "hardest", starsDelta: 1 + 1, xpDelta: 0, missionBonus: true, id: `puzzle-${today}-hardest` }));
  await T("bot 0 reward", true, fresh, db => earn(db, "bot", "0", 1));
  await T("bot 7 locked", false, rich, db => earn(db, "bot", "7", 8));
  await T("bot 7 owned", true, Object.assign({}, rich, { shop: { titles: [], bots: [7], hints: 0, activeTitle: "" } }), db => earn(db, "bot", "7", 8));
  await T("pawn reward", true, fresh, db => earn(db, "pawn", today, 2));
  // Coach bot: stars follow the chosen level, once a day per level
  const coachWin = (db, level, stars = level, cb = { d: today, k: level }) => econ(db, { kind: "earn", source: "coach", key: String(level), starsDelta: stars, xpDelta: stars * 20, id: `coach-${today}-${level}` }, (s, a) => { if (cb) a.cb = cb; else delete a.cb; return s; });
  await T("coach level 1 win", true, fresh, db => coachWin(db, 1));
  await T("coach level 10 win", true, legacy, db => coachWin(db, 10));
  await T("coach win with forged stars", false, fresh, db => coachWin(db, 2, 9));
  await T("coach level 11 rejected", false, fresh, db => coachWin(db, 11));
  await T("coach same level twice a day", false, fresh, async db => { await coachWin(db, 3); await coachWin(db, 3); });
  await T("coach higher level pays the difference", true, fresh, async db => { await coachWin(db, 3); await coachWin(db, 5, 2); });
  await T("coach higher level pays in full", false, fresh, async db => { await coachWin(db, 3); await coachWin(db, 4, 4); });
  await T("coach lower level after a higher one", false, fresh, async db => { await coachWin(db, 5); await coachWin(db, 3, 1); });
  await T("coach win without recording the level", false, fresh, db => coachWin(db, 3, 3, null));
  await T("coach win records a lower level", false, fresh, db => coachWin(db, 3, 3, { d: today, k: 1 }));
  await T("coach level from another day does not count", true, Object.assign({}, fresh, { arena: Object.assign({}, fresh.arena, { cb: { d: "2020-01-01", k: 10 } }) }), db => coachWin(db, 1));
  await T("coach record reset by another reward", false, Object.assign({}, fresh, { arena: Object.assign({}, fresh.arena, { cb: { d: today, k: 10 } }) }), db => econ(db, { kind: "earn", source: "pawn", key: today, starsDelta: 2, xpDelta: 40, id: "pawn-" + today }, (s, a) => { delete a.cb; return s; }));
  // daily quests: fixed reward, once a day per quest
  const quest = (db, key, stars) => econ(db, { kind: "earn", source: "quest", key, starsDelta: stars, xpDelta: stars * 20, id: `quest-${today}-${key}` });
  await T("quest daily", true, fresh, db => quest(db, "daily", 1));
  await T("quest puzzles on a legacy account", true, legacy, db => quest(db, "puzzles", 2));
  await T("quest win", true, fresh, db => quest(db, "win", 2));
  await T("quest three in a row", true, fresh, db => quest(db, "streak3", 2));
  await T("quest rush score", true, fresh, db => quest(db, "rush6", 2));
  await T("quest rush score with forged stars", false, fresh, db => quest(db, "rush6", 5));
  await T("quest that does not exist", false, fresh, db => quest(db, "vision9", 2));
  // golden puzzle and the five-in-a-row chest: fixed reward, once a day
  await T("golden puzzle", true, fresh, db => earn(db, "golden", today, 3));
  await T("golden puzzle on a full profile", true, rich, db => earn(db, "golden", today, 3));
  await T("five in a row chest on a full profile", true, rich, db => earn(db, "combo", today, 3));
  await T("golden puzzle twice a day", false, fresh, async db => { await earn(db, "golden", today, 3); await earn(db, "golden", today, 3); });
  await T("golden puzzle with forged stars", false, fresh, db => earn(db, "golden", today, 9));
  await T("golden puzzle for another day", false, fresh, db => earn(db, "golden", "2020-01-01", 3, { id: "golden-2020-01-01" }));
  await T("five in a row chest", true, fresh, db => earn(db, "combo", today, 3));
  await T("five in a row chest twice a day", false, fresh, async db => { await earn(db, "combo", today, 3); await earn(db, "combo", today, 3); });
  // weekly theme event: once a week, keyed by this week's Saturday only
  const dayShift = (iso, n) => { const t = new Date(iso + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); };
  const satKey = dayShift(today, -((new Date(today + "T12:00:00Z").getUTCDay() + 1) % 7));
  const ev = (key, stars = 8) => db => earn(db, "event", key, stars, { id: "event-" + key });
  await T("weekly event reward", true, fresh, ev(satKey));
  await T("weekly event reward twice", false, fresh, async db => { await ev(satKey)(db); await ev(satKey)(db); });
  await T("weekly event with forged stars", false, fresh, ev(satKey, 20));
  await T("weekly event keyed by a day that is not Saturday", false, fresh, ev(dayShift(satKey, 1)));
  await T("weekly event from an old week", false, fresh, ev(dayShift(satKey, -14)));
  // +14 not +7: on a Friday next Saturday is already inside the rule's one-day early window (Cairo time), so +7 failed every Friday
  await T("weekly event for a future week", false, fresh, ev(dayShift(satKey, 14)));
  const withQl = (n, d = today) => Object.assign({}, legacy, { arena: Object.assign({}, legacy.arena, { ql: { d, k: "2-7", n } }) });
  await T("quest lesson puzzles after 10 solves", true, withQl(10), db => quest(db, "lesson", 5));
  await T("quest lesson puzzles after 9 solves", false, withQl(9), db => quest(db, "lesson", 5));
  await T("quest lesson puzzles from yesterday's count", false, withQl(10, "2020-01-01"), db => quest(db, "lesson", 5));
  await T("quest lesson puzzles with no count", false, fresh, db => quest(db, "lesson", 5));
  await T("quest lesson puzzles with forged stars", false, withQl(10), db => quest(db, "lesson", 9));
  await T("quest lesson puzzles twice a day", false, withQl(10), async db => { await quest(db, "lesson", 5); await quest(db, "lesson", 5); });
  const lessonSolve = (ok, ql) => db => attempt(db, "arena", "LeSsOn1", ok, u => { const a = u.arena; const st = ok ? a.puzStreak + 1 : 0; return { arena: Object.assign({}, a, { puzTried: a.puzTried + 1, puzSolved: a.puzSolved + (ok ? 1 : 0), puzStreak: st, puzBestStreak: Math.max(a.puzBestStreak, st), ql, days: dayPush(u) }) }; });
  await T("lesson count grows with a solved puzzle", true, withQl(3), lessonSolve(true, { d: today, k: "2-7", n: 4 }));
  await T("lesson count starts over on a new lesson", true, withQl(3), lessonSolve(true, { d: today, k: "3-1", n: 1 }));
  await T("lesson count grows with a wrong answer", false, withQl(3), lessonSolve(false, { d: today, k: "2-7", n: 4 }));
  await T("lesson count jumps ahead", false, withQl(3), lessonSolve(true, { d: today, k: "2-7", n: 10 }));
  await T("lesson count written with no puzzle", false, withQl(3), db => patch(db, { arena: Object.assign({}, withQl(3).arena, { ql: { d: today, k: "2-7", n: 4 } }) }));
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
  const COSMETICS = { "avatar-rocket": 25, "avatar-robot": 25, "avatar-owl": 25, "board-neon": 40, "avatar-crown": 60, "avatar-dragon": 60, "board-ember": 60, "piece-neon": 80, "board-royal": 90, "piece-gold": 150, "board-wood": 30, "board-midnight": 50, "board-marble": 70 };
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
  // lucky wheel: the prize comes from the account and the day
  const spinHexOf = (who, day) => require("crypto").createHash("sha256").update(who + "|" + day).digest("hex")[0];
  const spinPay = h => h === "e" ? [0, 100] : h === "f" ? [0, 0] : (s => [s, s * 20])("012345".includes(h) ? 1 : "6789".includes(h) ? 2 : "abc".includes(h) ? 3 : 5);
  const spinEcon = (db, who, stars, xp, change) => { const ur = db.collection("users").doc(who), id = "spin-" + today, rr = ur.collection("economy").doc(id); return db.runTransaction(async tx => {
    const p = (await tx.get(ur)).data(); await tx.get(rr);
    const arena = Object.assign({}, p.arena || {}), shop = Object.assign({ titles: [], bots: [], hints: 0, activeTitle: "" }, p.shop || {});
    arena.stars = (Number(arena.stars) || 0) + stars; arena.xp = (Number(arena.xp) || 0) + xp; arena.sp = today;
    tx.update(ur, { arena, shop: change ? change(shop) : shop, lastEconomy: id });
    tx.set(rr, { uid: who, kind: "earn", source: "spin", key: today, day: today, item: "", score: 0, starsDelta: stars, xpDelta: xp, missionBonus: false, at: ts() });
  }); };
  // Finds a user id per prize type, so every branch runs whatever today's date is
  const spinUser = want => { for (let i = 0; i < 5000; i++) { const who = "spin" + i; if (spinHexOf(who, today) === want) return who; } throw new Error("no spin user"); };
  const spinT = async (name, expect, who, profile, fn) => {
    await env.clearFirestore();
    await seedAs(s => s.collection("users").doc(who).set(profile));
    const db = env.authenticatedContext(who, { firebase: { sign_in_provider: "password" } }).firestore();
    let got = true, msg = "";
    try { await fn(db); } catch (e) { got = false; msg = String(e.message).replace(/\s+/g, " ").slice(0, 300); }
    const ok = got === expect; ok ? pass++ : (fail++, failures.push(name + " :: " + msg));
    if (!ok || !quiet) console.log(ok ? "OK  " : "FAIL", expect ? "allow" : "deny ", name);
  };
  for (const h of ["0", "7", "b", "d"]) { const who = spinUser(h), [s, x] = spinPay(h); await spinT("spin prize " + h, true, who, rich, db => spinEcon(db, who, s, x)); await spinT("spin prize " + h + " forged", false, who, rich, db => spinEcon(db, who, s + 4, (s + 4) * 20)); }
  { const who = spinUser("e"); await spinT("spin xp prize", true, who, rich, db => spinEcon(db, who, 0, 100)); await spinT("spin xp prize forged", false, who, rich, db => spinEcon(db, who, 5, 100)); }
  { const who = spinUser("f"), withF = n => Object.assign({}, rich, { shop: { titles: [], bots: [], hints: 0, activeTitle: "", freezes: n, frozen: [] } }), addF = s => { s.freezes = (s.freezes || 0) + 1; return s; };
    await spinT("spin freeze prize", true, who, withF(0), db => spinEcon(db, who, 0, 0, addF));
    await spinT("spin freeze prize becomes stars at the limit", true, who, withF(2), db => spinEcon(db, who, 3, 60));
    await spinT("spin third freeze", false, who, withF(2), db => spinEcon(db, who, 0, 0, addF)); }
  { const who = spinUser("0"); await spinT("spin claims a freeze it did not win", false, who, rich, db => spinEcon(db, who, 0, 0, s => { s.freezes = 1; return s; }));
    await spinT("spin twice", false, who, rich, async db => { await spinEcon(db, who, 1, 20); await spinEcon(db, who, 1, 20); }); }
  // duels
  const other = "other1", tsAgo = ms => TS.fromMillis(Date.now() - ms), DID = "duelAAAAAAAAAAAAAAAAA";
  const duelBase = (x = {}) => Object.assign({ a: other, an: "", fen: "8/8/8/8/8/8/8/8 w - - 0 1", moves: "e2e4 e7e5", status: "open", created: tsAgo(1000) }, x);
  const duelSeed = d => async s => { await s.collection("users").doc(other).set(Object.assign({}, rich, { username: "other_1" })); await s.collection("duels").doc(DID).set(d); };
  const duelRef = db => db.collection("duels").doc(DID);
  const liveDuel = (x = {}) => duelBase(Object.assign({ status: "live", b: uid, bn: "", started: tsAgo(20000) }, x));
  const newDuel = (x = {}) => Object.assign({ a: uid, an: "", fen: "8/8/8/8/8/8/8/8 w - - 0 1", moves: "e2e4 e7e5", status: "open", created: ts() }, x);
  await T("duel: create", true, rich, db => duelRef(db).set(newDuel()));
  await T("duel: create for another student", false, rich, db => duelRef(db).set(newDuel({ a: other })));
  await T("duel: create with a legal name", false, rich, db => duelRef(db).set(newDuel({ an: "Ali" })));
  await T("duel: create with an extra field", false, rich, db => duelRef(db).set(newDuel({ chat: "hi" })));
  await T("duel: create already won", false, rich, db => duelRef(db).set(newDuel({ status: "done" })));
  await T("duel: join", true, rich, db => duelRef(db).update({ status: "live", b: uid, bn: "", started: ts() }), duelSeed(duelBase()));
  await T("duel: join own duel", false, rich, db => duelRef(db).update({ status: "live", b: uid, bn: "", started: ts() }), duelSeed(duelBase({ a: uid })));
  await T("duel: join an expired duel", false, rich, db => duelRef(db).update({ status: "live", b: uid, bn: "", started: ts() }), duelSeed(duelBase({ created: tsAgo(10 * 60000) })));
  await T("duel: join as someone else", false, rich, db => duelRef(db).update({ status: "live", b: other, bn: "", started: ts() }), duelSeed(duelBase()));
  await T("duel: join and change the puzzle", false, rich, db => duelRef(db).update({ status: "live", b: uid, bn: "", started: ts(), moves: "a2a3" }), duelSeed(duelBase()));
  await T("duel: win", true, rich, db => duelRef(db).update({ status: "done", winner: uid, ended: ts() }), duelSeed(liveDuel()));
  await T("duel: win instantly", false, rich, db => duelRef(db).update({ status: "done", winner: uid, ended: ts() }), duelSeed(liveDuel({ started: tsAgo(500) })));
  await T("duel: declare the rival as winner", false, rich, db => duelRef(db).update({ status: "done", winner: other, ended: ts() }), duelSeed(liveDuel()));
  await T("duel: win a duel you are not in", false, rich, db => duelRef(db).update({ status: "done", winner: uid, ended: ts() }), duelSeed(liveDuel({ b: "third1" })));
  await T("duel: overwrite a finished duel", false, rich, db => duelRef(db).update({ winner: uid, ended: ts() }), duelSeed(liveDuel({ status: "done", winner: other, ended: tsAgo(1000) })));
  const duelPay = (db, stars = 3, id = "duel-" + today) => econ(db, { kind: "earn", source: "duel", key: DID, starsDelta: stars, xpDelta: stars * 20, id });
  const doneDuel = (x = {}) => liveDuel(Object.assign({ status: "done", winner: uid, ended: tsAgo(5000) }, x));
  await T("duel: reward the winner", true, rich, db => duelPay(db), duelSeed(doneDuel()));
  await T("duel: reward with forged stars", false, rich, db => duelPay(db, 9), duelSeed(doneDuel()));
  await T("duel: reward the loser", false, rich, db => duelPay(db), duelSeed(doneDuel({ winner: other })));
  await T("duel: reward an unfinished duel", false, rich, db => duelPay(db), duelSeed(liveDuel()));
  await T("duel: reward from an old win", false, rich, db => duelPay(db), duelSeed(doneDuel({ ended: tsAgo(60 * 60000) })));
  await T("duel: reward twice a day", false, rich, async db => { await duelPay(db); await duelPay(db); }, duelSeed(doneDuel()));
  await T("duel: delete own open duel", true, rich, db => duelRef(db).delete(), duelSeed(duelBase({ a: uid })));
  await T("duel: delete a live duel", false, rich, db => duelRef(db).delete(), duelSeed(liveDuel({ a: uid, b: other })));
  await T("duel: delete someone else's duel", false, rich, db => duelRef(db).delete(), duelSeed(duelBase()));
  // speed arena
  const AID = "live-test", arenaRef = (db, id = AID) => db.collection("speedArenas").doc(id), entryRef = (db, who = uid) => arenaRef(db).collection("entries").doc(who);
  const liveWindow = (x = {}) => Object.assign({ startsAt: tsAgo(60000), endsAt: TS.fromMillis(Date.now() + 600000), closed: false }, x);
  const arenaSeed = (a = liveWindow(), entry) => async s => { await s.collection("speedArenas").doc(AID).set(a); if (entry) await s.collection("speedArenas").doc(AID).collection("entries").doc(uid).set(entry); };
  const newEntry = (x = {}) => Object.assign({ n: "", a: "", score: 0, solved: 0, at: ts() }, x);
  const oldEntry = (x = {}) => Object.assign({ n: "", a: "", score: 5, solved: 4, at: tsAgo(10000) }, x);
  const nextFriday = () => { const t = new Date(); t.setUTCHours(16, 0, 0, 0); while (t.getUTCDay() !== 5 || t.getTime() + 1800000 <= Date.now()) t.setUTCDate(t.getUTCDate() + 1); return t; };
  const fri = nextFriday(), friId = fri.toISOString().slice(0, 10), slot = (x = {}) => Object.assign({ startsAt: TS.fromDate(fri), endsAt: TS.fromMillis(fri.getTime() + 1800000), closed: false }, x);
  const thuId = new Date(fri.getTime() - 864e5).toISOString().slice(0, 10), thu = new Date(fri.getTime() - 864e5);
  await T("arena: student records next Friday", true, rich, db => arenaRef(db, friId).set(slot()));
  await T("arena: slot on the wrong day", false, rich, db => arenaRef(db, thuId).set({ startsAt: TS.fromDate(thu), endsAt: TS.fromMillis(thu.getTime() + 1800000), closed: false }));
  await T("arena: slot at the wrong hour", false, rich, db => arenaRef(db, friId).set(slot({ startsAt: TS.fromMillis(fri.getTime() - 3600000) })));
  await T("arena: slot too long", false, rich, db => arenaRef(db, friId).set(slot({ endsAt: TS.fromMillis(fri.getTime() + 7200000) })));
  await T("arena: student starts one now", false, rich, db => arenaRef(db).set(liveWindow()));
  await T("arena: student edits the schedule", false, rich, db => arenaRef(db).update({ closed: true }), arenaSeed());
  await T("arena: student writes the prizes", false, rich, db => arenaRef(db).update({ rank: { [uid]: 1 } }), arenaSeed());
  await T("arena: join", true, rich, db => entryRef(db).set(newEntry()), arenaSeed());
  await T("arena: join before it starts", false, rich, db => entryRef(db).set(newEntry()), arenaSeed(liveWindow({ startsAt: TS.fromMillis(Date.now() + 60000) })));
  await T("arena: join after it ends", false, rich, db => entryRef(db).set(newEntry()), arenaSeed(liveWindow({ endsAt: tsAgo(1000) })));
  await T("arena: join a closed one", false, rich, db => entryRef(db).set(newEntry()), arenaSeed(liveWindow({ closed: true })));
  await T("arena: join with points", false, rich, db => entryRef(db).set(newEntry({ score: 99 })), arenaSeed());
  await T("arena: join with a legal name", false, rich, db => entryRef(db).set(newEntry({ n: "Ali" })), arenaSeed());
  await T("arena: join for someone else", false, rich, db => entryRef(db, other).set(newEntry()), arenaSeed());
  await T("arena: one solve", true, rich, db => entryRef(db).update({ score: 6, solved: 5, at: ts() }), arenaSeed(liveWindow(), oldEntry()));
  await T("arena: streak solve", true, rich, db => entryRef(db).update({ score: 7, solved: 5, at: ts() }), arenaSeed(liveWindow(), oldEntry()));
  await T("arena: forged points", false, rich, db => entryRef(db).update({ score: 50, solved: 5, at: ts() }), arenaSeed(liveWindow(), oldEntry()));
  await T("arena: points with no solve", false, rich, db => entryRef(db).update({ score: 6, at: ts() }), arenaSeed(liveWindow(), oldEntry()));
  await T("arena: solving too fast", false, rich, db => entryRef(db).update({ score: 6, solved: 5, at: ts() }), arenaSeed(liveWindow(), oldEntry({ at: tsAgo(500) })));
  await T("arena: solve after the end", false, rich, db => entryRef(db).update({ score: 6, solved: 5, at: ts() }), arenaSeed(liveWindow({ endsAt: tsAgo(1000) }), oldEntry()));
  await T("arena: change the nickname mid-way", false, rich, db => entryRef(db).update({ score: 6, solved: 5, at: ts(), n: "x" }), arenaSeed(liveWindow(), oldEntry()));
  const winner = (rk, x = {}) => liveWindow(Object.assign({ closed: true, endsAt: tsAgo(60000), rank: { [uid]: rk } }, x));
  const prize = (db, stars, rk, tr = AID + "|" + rk) => econ(db, { kind: "earn", source: "arena", key: AID, starsDelta: stars, xpDelta: stars * 20, id: "arena-" + AID }, (s, a) => { a.tr = [...(a.tr || []), tr]; return s; });
  for (const [rk, stars] of [[1, 50], [2, 30], [3, 20]]) await T("arena: prize for place " + rk, true, rich, db => prize(db, stars, rk), arenaSeed(winner(rk)));
  await T("arena: prize above the place", false, rich, db => prize(db, 50, 1), arenaSeed(winner(2)));
  await T("arena: prize without a place", false, rich, db => prize(db, 20, 3), arenaSeed(liveWindow({ closed: true, rank: {} })));
  await T("arena: prize before closing", false, rich, db => prize(db, 50, 1), arenaSeed(liveWindow()));
  await T("arena: prize twice", false, rich, async db => { await prize(db, 50, 1); await prize(db, 50, 1); }, arenaSeed(winner(1)));
  await T("arena: prize with a wrong trophy", false, rich, db => prize(db, 30, 2, AID + "|1"), arenaSeed(winner(2)));
  await T("arena: prize without the trophy", false, rich, db => econ(db, { kind: "earn", source: "arena", key: AID, starsDelta: 50, xpDelta: 1000, id: "arena-" + AID }), arenaSeed(winner(1)));
  await T("arena: trophy added with no receipt", false, rich, db => patch(db, { arena: Object.assign({}, rich.arena, { tr: ["x|1"] }) }));
  await T("arena: trophy added by another reward", false, rich, db => econ(db, { kind: "earn", source: "pawn", key: today, starsDelta: 2, xpDelta: 40, id: "pawn-" + today }, (s, a) => { a.tr = ["x|1"]; return s; }));
  // student-made daily notifications
  const note = (id, x) => db => db.collection("users").doc(uid).collection("notifications").doc(id).set(x);
  const spinNote = (x = {}) => Object.assign({ type: "lucky_spin", day: today, titleAr: "عجلة الحظ جاهزة", titleEn: "Your lucky wheel is ready", bodyAr: "لفة مجانية مستنياك النهاردة. اضغط هنا وجرّب حظك.", bodyEn: "A free spin is waiting for you today. Tap here to spin.", createdAt: ts(), read: false }, x);
  const puzzleNote = (x = {}) => Object.assign({ type: "daily_puzzle", day: today, titleAr: "لغز اليوم الجديد جاهز", titleEn: "Today's new puzzle is ready", bodyAr: "افتح ساحة التدريب وحل لغز اليوم.", bodyEn: "Open the Training Arena and solve today's puzzle.", createdAt: ts(), read: false }, x);
  await T("notification: daily puzzle", true, rich, note("daily-puzzle-" + today, puzzleNote()));
  await T("notification: lucky wheel", true, rich, note("lucky-spin-" + today, spinNote()));
  await T("notification: lucky wheel with other text", false, rich, note("lucky-spin-" + today, spinNote({ bodyEn: "Click this link" })));
  await T("notification: lucky wheel for another day", false, rich, note("lucky-spin-2020-01-01", spinNote({ day: "2020-01-01" })));
  await T("notification: lucky wheel under another id", false, rich, note("announcement-x", spinNote()));
  await T("notification: another student's wheel", false, rich, db => db.collection("users").doc(other).collection("notifications").doc("lucky-spin-" + today).set(spinNote()), duelSeed(duelBase()));
  // heroes and frames
  const shopEq = (eq, items = []) => ({ titles: [], bots: [], hints: 0, activeTitle: "", items, eq });
  const atLevel = (level, items = []) => Object.assign({}, rich, { level, shop: shopEq({}, items) });
  await T("hero: equip a hero from a passed Step", true, atLevel(3), db => patch(db, { shop: shopEq({ a: "hero-2" }) }));
  await T("hero: equip the current Step's hero", false, atLevel(3), db => patch(db, { shop: shopEq({ a: "hero-3" }) }));
  await T("hero: equip an unknown hero", false, atLevel(6), db => patch(db, { shop: shopEq({ a: "hero-9" }) }));
  await T("frame: equip an owned frame", true, atLevel(1, ["frame-gold"]), db => patch(db, { shop: shopEq({ f: "frame-gold" }, ["frame-gold"]) }));
  await T("frame: equip a frame not owned", false, atLevel(1), db => patch(db, { shop: shopEq({ f: "frame-gold" }) }));
  await T("frame: buy a frame", false, rich, db => buy(db, "frame-gold", addItem("frame-gold"), 1));
  // mystery chest: the prize comes from the account and the chest number
  const CHEST_ITEMS = { a: "frame-silver", b: "frame-silver", c: "frame-gold", d: "frame-fire", e: "piece-ruby", f: "piece-crystal" };
  const chestUser = want => { for (let i = 0; i < 5000; i++) { const who = "chest" + i; if (require("crypto").createHash("sha256").update(who + "|0").digest("hex")[0] === want) return who; } throw new Error("no chest user"); };
  const chestEcon = (db, who, x = {}) => { const ur = db.collection("users").doc(who), id = x.id || "chest-0", rr = ur.collection("economy").doc(id); return db.runTransaction(async tx => {
    const p = (await tx.get(ur)).data(); await tx.get(rr);
    const arena = Object.assign({}, p.arena || {}), shop = Object.assign({ titles: [], bots: [], hints: 0, activeTitle: "" }, p.shop || {});
    const stars = x.stars === undefined ? -40 : x.stars, xp = x.xp || 0;
    arena.stars = (Number(arena.stars) || 0) + stars; arena.xp = (Number(arena.xp) || 0) + xp; arena.ch = x.ch === undefined ? (Number(arena.ch) || 0) + 1 : x.ch;
    arena.chx = x.chx === undefined ? (Number(arena.chx) || 0) + xp : x.chx;
    if (x.item) shop.items = [...(shop.items || []), x.item];
    tx.update(ur, { arena, shop, lastEconomy: id });
    tx.set(rr, { uid: who, kind: "chest", source: "", key: "", day: today, item: "", score: 0, starsDelta: stars, xpDelta: xp, missionBonus: false, at: ts() });
  }); };
  { const who = chestUser("2"); await spinT("chest: small XP prize", true, who, rich, db => chestEcon(db, who, { xp: 150 })); await spinT("chest: bigger XP than drawn", false, who, rich, db => chestEcon(db, who, { xp: 300 })); await spinT("chest: an item it did not draw", false, who, rich, db => chestEcon(db, who, { item: "frame-gold" })); await spinT("chest: free chest", false, who, rich, db => chestEcon(db, who, { stars: 0, xp: 150 })); await spinT("chest: counter not moved", false, who, rich, db => chestEcon(db, who, { xp: 150, ch: 0 })); await spinT("chest: counter skipped", false, who, rich, db => chestEcon(db, who, { xp: 150, ch: 5 })); await spinT("chest: wrong id", false, who, rich, db => chestEcon(db, who, { xp: 150, id: "chest-7" })); }
  { const who = chestUser("8"); await spinT("chest: big XP prize", true, who, rich, db => chestEcon(db, who, { xp: 300 })); await spinT("chest: XP not set aside from the leaderboard", false, who, rich, db => chestEcon(db, who, { xp: 300, chx: 0 })); }
  await T("chest: set-aside XP changed with no receipt", false, rich, db => patch(db, { arena: Object.assign({}, rich.arena, { chx: 0 }) }), s => s.collection("users").doc(uid).update({ "arena.chx": 300 }));
  await T("board: chest XP left out", true, Object.assign({}, rich, { arena: Object.assign({}, rich.arena, { xp: 800, chx: 300 }) }), db => db.collection("leaderboard").doc(uid).set({ n: "", a: "", t: "", g: "A", xp: 500, wk: today, wx: 0 }));
  await T("board: chest XP counted", false, Object.assign({}, rich, { arena: Object.assign({}, rich.arena, { xp: 800, chx: 300 }) }), db => db.collection("leaderboard").doc(uid).set({ n: "", a: "", t: "", g: "A", xp: 800, wk: today, wx: 0 }));
  { const who = chestUser("c"); await spinT("chest: legendary frame", true, who, rich, db => chestEcon(db, who, { item: "frame-gold" })); await spinT("chest: legendary frame plus XP", false, who, rich, db => chestEcon(db, who, { item: "frame-gold", xp: 300 })); await spinT("chest: owned frame turns into XP", true, who, Object.assign({}, rich, { shop: shopEq({}, ["frame-gold"]) }), db => chestEcon(db, who, { xp: 300 })); }
  { const who = chestUser("f"); await spinT("chest: rare piece set", true, who, rich, db => chestEcon(db, who, { item: "piece-crystal" })); }
  await T("chest: counter changed with no receipt", false, rich, db => patch(db, { arena: Object.assign({}, rich.arena, { ch: 9 }) }));
  // mistake vault and the comeback bonus
  const vaultRef = (db, id = "abc123") => db.collection("users").doc(uid).collection("mistakeVault").doc(id);
  const newVault = (x = {}) => Object.assign({ puzzleId: "abc123", motifs: ["fork"], stepLevel: 2, failedAt: ts(), attempts: 1, resolved: false, nextAt: TS.fromMillis(Date.now() + 1800000), rating: 1200 }, x);
  const oldVault = (x = {}) => newVault(Object.assign({ failedAt: tsAgo(3600000), nextAt: tsAgo(60000) }, x));
  const vaultSeed = v => s => s.collection("users").doc(uid).collection("mistakeVault").doc("abc123").set(v);
  await T("vault: log a mistake", true, rich, db => vaultRef(db).set(newVault()));
  await T("vault: log with an old time", false, rich, db => vaultRef(db).set(newVault({ failedAt: tsAgo(3600000) })));
  await T("vault: log as already solved", false, rich, db => vaultRef(db).set(newVault({ resolved: true })));
  await T("vault: log under another id", false, rich, db => vaultRef(db, "zzz999").set(newVault()));
  await T("vault: log with an extra field", false, rich, db => vaultRef(db).set(newVault({ stars: 5 })));
  await T("vault: fail again", true, rich, db => vaultRef(db).update({ attempts: 2, failedAt: ts(), nextAt: TS.fromMillis(Date.now() + 864e5) }), vaultSeed(oldVault()));
  await T("vault: backdate a mistake", false, rich, db => vaultRef(db).update({ failedAt: tsAgo(7200000) }), vaultSeed(newVault({ failedAt: tsAgo(60000) })));
  await T("vault: mark solved", true, rich, db => vaultRef(db).update({ resolved: true }), vaultSeed(oldVault()));
  await T("vault: another student's vault", false, rich, db => db.collection("users").doc(other).collection("mistakeVault").doc("abc123").set(newVault()), duelSeed(duelBase()));
  const dojoPay = (db, x = {}) => econ(db, Object.assign({ kind: "earn", source: "dojo", key: "abc123", starsDelta: 2, xpDelta: 40, id: "dojo-abc123" }, x), (s, a) => { a.dj = x.dj || { d: today, n: 1 }; return s; });
  await T("dojo: comeback bonus", true, rich, db => dojoPay(db), vaultSeed(oldVault()));
  await T("dojo: bonus right after the mistake", false, rich, db => dojoPay(db), vaultSeed(newVault({ failedAt: tsAgo(60000) })));
  await T("dojo: bonus for a solved puzzle", false, rich, db => dojoPay(db), vaultSeed(oldVault({ resolved: true })));
  await T("dojo: bonus with no mistake logged", false, rich, db => dojoPay(db));
  await T("dojo: forged bonus", false, rich, db => dojoPay(db, { starsDelta: 10, xpDelta: 200 }), vaultSeed(oldVault()));
  await T("dojo: bonus lowered by coach hints (1 star, 20 xp)", true, rich, db => dojoPay(db, { starsDelta: 1, xpDelta: 20 }), vaultSeed(oldVault()));
  await T("dojo: bonus of zero stars", false, rich, db => dojoPay(db, { starsDelta: 0, xpDelta: 20 }), vaultSeed(oldVault()));
  await T("dojo: bonus twice for one puzzle", false, rich, async db => { await dojoPay(db); await dojoPay(db, { dj: { d: today, n: 2 } }); }, vaultSeed(oldVault()));
  await T("dojo: sixth bonus in a day", false, Object.assign({}, rich, { arena: Object.assign({}, rich.arena, { dj: { d: today, n: 5 } }) }), db => dojoPay(db, { dj: { d: today, n: 6 } }), vaultSeed(oldVault()));
  await T("dojo: bonus without counting it", false, rich, db => econ(db, { kind: "earn", source: "dojo", key: "abc123", starsDelta: 2, xpDelta: 40, id: "dojo-abc123" }), vaultSeed(oldVault()));
  await T("dojo: counter changed with no receipt", false, rich, db => patch(db, { arena: Object.assign({}, rich.arena, { dj: { d: today, n: 0 } }) }));
  await T("cards: save motif counters and unlocked cards", true, rich, db => patch(db, { arena: Object.assign({}, rich.arena, { mot: { fork: { s: 10, t: 12 } }, cards: ["fork"] }) }));
  // emotes
  const emoteTo = (db, target, x = {}) => { const b = db.batch(); b.set(db.collection("emoteRate").doc(uid), { at: ts() }); b.set(db.collection("users").doc(target).collection("emotes").doc(), Object.assign({ from: uid, n: "", e: "🔥", at: ts() }, x)); return b.commit(); };
  const withOther = async s => { await s.collection("users").doc(other).set(Object.assign({}, rich, { username: "other_1" })); };
  await T("emote: send a cheer", true, rich, db => emoteTo(db, other), withOther);
  await T("emote: send a word instead of an emote", false, rich, db => emoteTo(db, other, { e: "loser" }), withOther);
  await T("emote: send with a legal name", false, rich, db => emoteTo(db, other, { n: "Ali" }), withOther);
  await T("emote: send as someone else", false, rich, db => emoteTo(db, other, { from: other }), withOther);
  await T("emote: cheer yourself", false, rich, db => emoteTo(db, uid));
  await T("emote: two cheers within 10 seconds", false, rich, db => emoteTo(db, other), async s => { await withOther(s); await s.collection("emoteRate").doc(uid).set({ at: tsAgo(3000) }); });
  await T("emote: cheer after 10 seconds", true, rich, db => emoteTo(db, other), async s => { await withOther(s); await s.collection("emoteRate").doc(uid).set({ at: tsAgo(12000) }); });
  await T("emote: cheer without the rate stamp", false, rich, db => db.collection("users").doc(other).collection("emotes").doc().set({ from: uid, n: "", e: "🔥", at: ts() }), withOther);
  await T("emote: read another student's cheers", false, rich, db => db.collection("users").doc(other).collection("emotes").get(), withOther);
  // friend challenge links
  const FID = "friendAAAAAAAAAAAAAAA", fRef = db => db.collection("friendDuels").doc(FID);
  const P5 = ["p1aaa", "p2bbb", "p3ccc", "p4ddd", "p5eee"];
  const fBase = (x = {}) => Object.assign({ a: uid, an: "", step: 2, puzzles: P5, status: "open", created: tsAgo(60000) }, x);
  const fSeed = d => async s => { await withOther(s); await s.collection("friendDuels").doc(FID).set(d); };
  const res = (n, solved, ms) => ({ n, solved, ms, done: n === 5 });
  await T("friend: create", true, rich, db => fRef(db).set(Object.assign(fBase(), { created: ts() })));
  await T("friend: create with 3 puzzles", false, rich, db => fRef(db).set(Object.assign(fBase({ puzzles: ["a", "b", "c"] }), { created: ts() })));
  await T("friend: create for someone else", false, rich, db => fRef(db).set(Object.assign(fBase({ a: other }), { created: ts() })));
  await T("friend: join by link", true, rich, db => fRef(db).update({ status: "live", b: uid, bn: "", started: ts() }), fSeed(fBase({ a: other })));
  await T("friend: join your own", false, rich, db => fRef(db).update({ status: "live", b: uid, bn: "", started: ts() }), fSeed(fBase()));
  await T("friend: creator plays before the friend joins", true, rich, db => fRef(db).update({ ra: res(1, 1, 9000) }), fSeed(fBase()));
  await T("friend: claim two solves at once", false, rich, db => fRef(db).update({ ra: res(2, 2, 9000) }), fSeed(fBase()));
  await T("friend: impossibly fast", false, rich, db => fRef(db).update({ ra: res(1, 1, 500) }), fSeed(fBase()));
  await T("friend: write the friend's result", false, rich, db => fRef(db).update({ rb: res(1, 1, 9000) }), fSeed(fBase({ status: "live", b: other, bn: "", started: tsAgo(1000) })));
  const almost = (x = {}) => fBase(Object.assign({ status: "live", b: other, bn: "", started: tsAgo(60000), ra: res(4, 4, 40000), rb: res(5, 3, 30000) }, x));
  await T("friend: finish and win", true, rich, db => fRef(db).update({ ra: res(5, 5, 50000), status: "done", winner: uid, ended: ts() }), fSeed(almost()));
  await T("friend: finish and claim a win you lost", false, rich, db => fRef(db).update({ ra: res(5, 2, 50000), status: "done", winner: uid, ended: ts() }), fSeed(almost({ ra: res(4, 2, 40000) })));
  await T("friend: finish without declaring", false, rich, db => fRef(db).update({ ra: res(5, 5, 50000) }), fSeed(almost()));
  await T("friend: winner prize", true, rich, db => econ(db, { kind: "earn", source: "fduel", key: FID, starsDelta: 3, xpDelta: 60, id: "fduel-" + today }), fSeed(almost({ status: "done", winner: uid, ended: tsAgo(1000), ra: res(5, 5, 50000) })));
  await T("friend: prize for the loser", false, rich, db => econ(db, { kind: "earn", source: "fduel", key: FID, starsDelta: 3, xpDelta: 60, id: "fduel-" + today }), fSeed(almost({ status: "done", winner: other, ended: tsAgo(1000), ra: res(5, 1, 50000) })));
  // coach's weekly challenge and Hall of Fame
  const WID = today, wRef = (db, sub, id) => sub ? db.collection("coachChallenges").doc(WID).collection(sub).doc(id || uid) : db.collection("coachChallenges").doc(WID);
  const wSeed = (att) => async s => { await s.collection("coachChallenges").doc(WID).set({ title: "Week", fen: "8/8/8/8/8/8/8/8 w - - 0 1", moves: "e2e4", setup: false, by: "coach", at: tsAgo(1000) }); if (att) await s.collection("coachChallenges").doc(WID).collection("attempts").doc(uid).set(att); };
  const hof = (x = {}) => Object.assign({ uid, n: "", a: "", f: "", ms: 8000, at: ts() }, x);
  await T("weekly: student posts the challenge", false, rich, db => wRef(db).set({ title: "x", fen: "8/8/8/8/8/8/8/8 w - - 0 1", moves: "e2e4", setup: false, by: uid, at: ts() }));
  await T("weekly: first attempt", true, rich, db => wRef(db, "attempts").set({ n: 1, solved: false, at: ts() }), wSeed());
  await T("weekly: second attempt", true, rich, db => wRef(db, "attempts").update({ n: 2, at: ts() }), wSeed({ n: 1, solved: false, at: tsAgo(60000) }));
  await T("weekly: third attempt", false, rich, db => wRef(db, "attempts").update({ n: 3, at: ts() }), wSeed({ n: 2, solved: false, at: tsAgo(60000) }));
  await T("weekly: solve into the Hall of Fame", true, rich, db => { const b = db.batch(); b.update(wRef(db, "attempts"), { solved: true }); b.set(wRef(db, "hallOfFame"), hof({ ms: 58000 })); return b.commit(); }, wSeed({ n: 1, solved: false, at: tsAgo(60000) }));
  await T("weekly: Hall of Fame with a faked fast time", false, rich, db => { const b = db.batch(); b.update(wRef(db, "attempts"), { solved: true }); b.set(wRef(db, "hallOfFame"), hof({ ms: 8000 })); return b.commit(); }, wSeed({ n: 1, solved: false, at: tsAgo(60000) }));
  await T("weekly: Hall of Fame without solving", false, rich, db => wRef(db, "hallOfFame").set(hof()), wSeed({ n: 1, solved: false, at: tsAgo(60000) }));
  await T("weekly: Hall of Fame with a legal name", false, rich, db => { const b = db.batch(); b.update(wRef(db, "attempts"), { solved: true }); b.set(wRef(db, "hallOfFame"), hof({ n: "Ali" })); return b.commit(); }, wSeed({ n: 1, solved: false, at: tsAgo(60000) }));
  await T("weekly: Hall of Fame for someone else", false, rich, db => wRef(db, "hallOfFame", other).set(hof({ uid: other })), wSeed({ n: 1, solved: false, at: tsAgo(60000) }));
  // companion and achievements stay in the student's own profile
  await T("save companion and achievements", true, rich, db => patch(db, { arena: Object.assign({}, rich.arena, { pet: "dragon", ach: ["night-owl"], duelW: 1 }) }));
  // leaderboard
  const bRow = (extra = {}) => Object.assign({ n: "", a: "", t: "", g: "A", xp: 500, wk: today, wx: 0 }, extra);
  const pub = row => db => db.collection("leaderboard").doc(uid).set(row);
  const bSeed = row => s => s.collection("leaderboard").doc(uid).set(row);
  const bOld = (extra = {}) => bRow(Object.assign({ xp: 400, wx: 50 }, extra));
  await T("board: first publish", true, rich, pub(bRow()));
  await T("board: first publish claims weekly points", false, rich, pub(bRow({ wx: 500 })));
  await T("board: forged xp", false, rich, pub(bRow({ xp: 9999 })));
  await T("board: legal name as nickname", false, rich, pub(bRow({ n: "Ali" })));
  await T("board: extra field", false, rich, pub(bRow({ name: "Ali" })));
  await T("board: another group", false, rich, pub(bRow({ g: "B" })));
  await T("board: avatar not equipped", false, rich, pub(bRow({ a: "avatar-dragon" })));
  await T("board: avatar equipped", true, Object.assign({}, rich, { shop: { titles: [], bots: [], hints: 0, activeTitle: "", items: ["avatar-owl"], eq: { a: "avatar-owl" } } }), pub(bRow({ a: "avatar-owl" })));
  await T("board: stale week", false, rich, pub(bRow({ wk: "2020-01-04" })));
  await T("board: gain in the same week", true, rich, pub(bRow({ wx: 150 })), bSeed(bOld()));
  await T("board: forged weekly gain", false, rich, pub(bRow({ wx: 900 })), bSeed(bOld()));
  await T("board: new week starts from the gain", true, rich, pub(bRow({ wx: 100 })), bSeed(bOld({ wk: dayBack(7) })));
  await T("board: new week keeps old points", false, rich, pub(bRow({ wx: 150 })), bSeed(bOld({ wk: dayBack(7) })));
  await T("board: week moved back", false, rich, pub(bRow({ wk: dayBack(1), wx: 100 })), bSeed(bOld()));
  await T("board: another student's row", false, rich, db => db.collection("leaderboard").doc("other1").set(bRow()));
  await T("board: staff-only profile fields stay out", false, rich, pub(bRow({ phone: "01000000000" })));
  await T("board: deleted student", false, rich, pub(bRow()), s => s.collection("deleted").doc(uid).set({ name: "x" }));
  await T("board: read the list", true, rich, db => db.collection("leaderboard").orderBy("xp", "desc").limit(50).get(), bSeed(bRow()));
  await T("board: student cannot delete", false, rich, db => db.collection("leaderboard").doc(uid).delete(), bSeed(bRow()));
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
  // boss homework: the coach assigns a pack to a group, every solve takes 1 HP
  const BID = "bossAAAA1", PZ = ["p1aaa", "p2bbb", "p3ccc"];
  const bossDoc = (x = {}) => Object.assign({ title: "Fork Dragon", group: "A", step: 2, motif: "fork", puzzles: PZ, due: TS.fromMillis(Date.now() + 7 * 864e5), by: "admin1", at: ts() }, x);
  const bossRef = db => db.collection("assignments").doc(BID), progRef = (db, who = uid) => bossRef(db).collection("progress").doc(who);
  const bossSeed = (prog, x = {}) => async s => { await staffSeed(s); await s.collection("assignments").doc(BID).set(bossDoc(Object.assign({ at: tsAgo(60000) }, x))); if (prog) await s.collection("assignments").doc(BID).collection("progress").doc(uid).set(prog); };
  const hit = (solved, done, x = {}) => Object.assign({ solved, done, at: ts() }, x);
  await T("boss: coach assigns a pack to a group", true, null, () => bossRef(adminCtx()).set(bossDoc()), staffSeed);
  await T("boss: student assigns homework", false, rich, db => bossRef(db).set(bossDoc({ by: uid })), staffSeed);
  await T("boss: title with HTML", false, null, () => bossRef(adminCtx()).set(bossDoc({ title: "<b>x</b>" })), staffSeed);
  await T("boss: only 2 puzzles", false, null, () => bossRef(adminCtx()).set(bossDoc({ puzzles: ["a1a", "b2b"] })), staffSeed);
  await T("boss: the same puzzle twice", false, null, () => bossRef(adminCtx()).set(bossDoc({ puzzles: ["p1aaa", "p1aaa", "p3ccc"] })), staffSeed);
  await T("boss: deadline in the past", false, null, () => bossRef(adminCtx()).set(bossDoc({ due: tsAgo(60000) })), staffSeed);
  await T("boss: deadline after 2 months", false, null, () => bossRef(adminCtx()).set(bossDoc({ due: TS.fromMillis(Date.now() + 90 * 864e5) })), staffSeed);
  await T("boss: posted in someone else's name", false, null, () => bossRef(adminCtx()).set(bossDoc({ by: "coach9" })), staffSeed);
  await T("boss: coach edits a sent homework", false, null, () => bossRef(adminCtx()).update({ title: "New" }), bossSeed());
  await T("boss: student lists their group's homework", true, rich, db => db.collection("assignments").where("group", "==", "A").get(), bossSeed());
  await T("boss: student lists another group's homework", false, rich, db => db.collection("assignments").where("group", "==", "B").get(), bossSeed());
  await T("boss: student lists all homework", false, rich, db => db.collection("assignments").get(), bossSeed());
  await T("boss: first hit", true, rich, db => progRef(db).set(hit(["p1aaa"], false)), bossSeed());
  await T("boss: first hit with a puzzle from outside the pack", false, rich, db => progRef(db).set(hit(["zzzzz"], false)), bossSeed());
  await T("boss: two hits at once", false, rich, db => progRef(db).set(hit(["p1aaa", "p2bbb"], false)), bossSeed());
  await T("boss: student from another group", false, Object.assign({}, rich, { group: "B" }), db => progRef(db).set(hit(["p1aaa"], false)), bossSeed());
  await T("boss: hit after the deadline", false, rich, db => progRef(db).set(hit(["p1aaa"], false)), bossSeed(null, { due: tsAgo(1000) }));
  await T("boss: hit for another student", false, rich, db => progRef(db, other).set(hit(["p1aaa"], false)), bossSeed());
  await T("boss: second hit", true, rich, db => progRef(db).set(hit(["p1aaa", "p2bbb"], false)), bossSeed({ solved: ["p1aaa"], done: false, at: tsAgo(5000) }));
  await T("boss: hits too fast", false, rich, db => progRef(db).set(hit(["p1aaa", "p2bbb"], false)), bossSeed({ solved: ["p1aaa"], done: false, at: tsAgo(500) }));
  await T("boss: the same puzzle hits twice", false, rich, db => progRef(db).set(hit(["p1aaa", "p1aaa"], false)), bossSeed({ solved: ["p1aaa"], done: false, at: tsAgo(5000) }));
  await T("boss: earlier hits rewritten", false, rich, db => progRef(db).set(hit(["p2bbb", "p3ccc"], false)), bossSeed({ solved: ["p1aaa"], done: false, at: tsAgo(5000) }));
  await T("boss: final hit defeats the boss", true, rich, db => progRef(db).set(hit(PZ, true)), bossSeed({ solved: ["p1aaa", "p2bbb"], done: false, at: tsAgo(5000) }));
  await T("boss: final hit not marked done", false, rich, db => progRef(db).set(hit(PZ, false)), bossSeed({ solved: ["p1aaa", "p2bbb"], done: false, at: tsAgo(5000) }));
  await T("boss: marked done early", false, rich, db => progRef(db).set(hit(["p1aaa", "p2bbb"], true)), bossSeed({ solved: ["p1aaa"], done: false, at: tsAgo(5000) }));
  await T("boss: student reads another student's progress", false, rich, db => progRef(db, other).get(), bossSeed());
  await T("boss: coach reads the progress", true, null, () => bossRef(adminCtx()).collection("progress").get(), bossSeed({ solved: ["p1aaa"], done: false, at: tsAgo(5000) }));
  const bossPay = (db, stars = 10, xp = 200) => econ(db, { kind: "earn", source: "boss", key: BID, starsDelta: stars, xpDelta: xp, id: "boss-" + BID });
  await T("boss: reward after defeating the boss", true, rich, db => bossPay(db), bossSeed({ solved: PZ, done: true, at: tsAgo(5000) }));
  await T("boss: reward while the boss is alive", false, rich, db => bossPay(db), bossSeed({ solved: ["p1aaa"], done: false, at: tsAgo(5000) }));
  await T("boss: forged reward", false, rich, db => bossPay(db, 50, 1000), bossSeed({ solved: PZ, done: true, at: tsAgo(5000) }));
  await T("boss: reward lowered by coach hints (x0.5)", true, rich, db => bossPay(db, 5, 100), bossSeed({ solved: PZ, done: true, at: tsAgo(5000) }));
  await T("boss: reward a little above the full amount", false, rich, db => bossPay(db, 11, 200), bossSeed({ solved: PZ, done: true, at: tsAgo(5000) }));
  await T("boss: reward twice", false, rich, async db => { await bossPay(db); await bossPay(db); }, bossSeed({ solved: PZ, done: true, at: tsAgo(5000) }));
  // live class drops: the coach sends, the student claims once
  const DRID = "dropAAAA1", dropRef = (db, who = uid, id = DRID) => db.collection("liveDrops").doc(who).collection("drops").doc(id);
  const dropDoc = (x = {}) => Object.assign({ type: "stars", amount: 10, note: "Great move", by: "admin1", at: ts() }, x);
  const dropSeed = d => async s => { await staffSeed(s); await s.collection("users").doc(uid).set(rich); if (d) await s.collection("liveDrops").doc(uid).collection("drops").doc(DRID).set(Object.assign(dropDoc(), { at: tsAgo(1000) }, d)); };
  await T("drop: coach sends stars", true, null, () => dropRef(adminCtx()).set(dropDoc()), dropSeed());
  await T("drop: coach sends an XP boost", true, null, () => dropRef(adminCtx()).set(dropDoc({ type: "xp", amount: 200 })), dropSeed());
  await T("drop: coach sends a mystery chest", true, null, () => dropRef(adminCtx()).set(dropDoc({ type: "chest", amount: 0 })), dropSeed());
  await T("drop: student sends a drop", false, rich, db => dropRef(db, other).set(dropDoc({ by: uid })), async s => { await s.collection("users").doc(other).set(fresh); });
  await T("drop: 999 stars", false, null, () => dropRef(adminCtx()).set(dropDoc({ amount: 999 })), dropSeed());
  await T("drop: message with HTML", false, null, () => dropRef(adminCtx()).set(dropDoc({ note: "<img src=x>" })), dropSeed());
  await T("drop: chest with stars inside", false, null, () => dropRef(adminCtx()).set(dropDoc({ type: "chest", amount: 5 })), dropSeed());
  await T("drop: to an account that does not exist", false, null, () => dropRef(adminCtx(), "ghost1").set(dropDoc()), dropSeed());
  const dropClaim = (db, stars, xp, del = true, id = DRID, note = "Great move") => { const ur = db.collection("users").doc(uid), rr = ur.collection("economy").doc("drop-" + id), dr = dropRef(db, uid, id); return db.runTransaction(async tx => {
    const p = (await tx.get(ur)).data(); await tx.get(rr); await tx.get(dr);
    const arena = Object.assign({}, p.arena || {}); arena.stars = (Number(arena.stars) || 0) + stars; arena.xp = (Number(arena.xp) || 0) + xp;
    if (del) tx.delete(dr);
    tx.update(ur, { arena, lastEconomy: "drop-" + id });
    tx.set(rr, Object.assign({ uid, kind: "earn", source: "drop", key: id, day: today, item: "", score: 0, starsDelta: stars, xpDelta: xp, missionBonus: false, at: ts() }, note === null ? {} : { note }));
  }); };
  await T("drop: student claims the stars", true, rich, db => dropClaim(db, 10, 0), dropSeed({}));
  await T("drop: claims more stars than sent", false, rich, db => dropClaim(db, 30, 0), dropSeed({}));
  await T("drop: claims and keeps the drop", false, rich, db => dropClaim(db, 10, 0, false), dropSeed({}));
  await T("drop: claims a drop that was never sent", false, rich, db => dropClaim(db, 10, 0), dropSeed());
  await T("drop: claims the XP boost", true, rich, db => dropClaim(db, 0, 200), dropSeed({ type: "xp", amount: 200 }));
  await T("drop: XP boost claimed as stars", false, rich, db => dropClaim(db, 200, 0), dropSeed({ type: "xp", amount: 200 }));
  await T("drop: claim with a forged coach message", false, rich, db => dropClaim(db, 10, 0, true, DRID, "You are the best player ever"), dropSeed({}));
  await T("drop: claim without the coach message", false, rich, db => dropClaim(db, 10, 0, true, DRID, null), dropSeed({}));
  await T("drop: message on a receipt that is not a drop is ignored", true, fresh, db => db.runTransaction(async tx => { const ur = db.collection("users").doc(uid), rr = ur.collection("economy").doc("lesson-1-0"); await tx.get(ur); await tx.get(rr); tx.update(ur, { arena: { stars: 1, xp: 20 }, lastEconomy: "lesson-1-0" }); tx.set(rr, { uid, kind: "earn", source: "lesson", key: "1-0", day: today, item: "", score: 0, starsDelta: 1, xpDelta: 20, missionBonus: false, at: ts(), note: "Coach says hi" }); }));
  await T("report: coach reads a student's receipts", true, null, () => adminCtx().collection("users").doc(uid).collection("economy").get(), dropSeed());
  await T("report: coach reads a student's mistake vault", true, null, () => adminCtx().collection("users").doc(uid).collection("mistakeVault").get(), dropSeed());
  await T("report: another student reads the receipts", false, rich, db => db.collection("users").doc(other).collection("economy").get(), async s => { await s.collection("users").doc(other).set(fresh); });
  await T("drop: student reads their drops", true, rich, db => db.collection("liveDrops").doc(uid).collection("drops").get(), dropSeed({}));
  await T("drop: student reads someone else's drops", false, rich, db => db.collection("liveDrops").doc(other).collection("drops").get(), dropSeed({}));
  await T("drop: student deletes someone else's drop", false, rich, db => dropRef(db, other).delete(), async s => { await dropSeed({})(s); await s.collection("liveDrops").doc(other).collection("drops").doc(DRID).set(dropDoc({ at: tsAgo(1000) })); });
  const chestDrop = (db, who, x = {}) => { const ur = db.collection("users").doc(who), rr = ur.collection("economy").doc("chest-0"), dr = dropRef(db, who); return db.runTransaction(async tx => {
    const p = (await tx.get(ur)).data(); await tx.get(rr); await tx.get(dr);
    const arena = Object.assign({}, p.arena || {}), stars = x.stars || 0, xp = x.xp || 0;
    arena.stars = (Number(arena.stars) || 0) + stars; arena.xp = (Number(arena.xp) || 0) + xp; arena.ch = (Number(arena.ch) || 0) + 1; arena.chx = (Number(arena.chx) || 0) + xp;
    if (x.keep !== true) tx.delete(dr);
    tx.update(ur, { arena, lastEconomy: "chest-0" });
    tx.set(rr, { uid: who, kind: "chest", source: "drop", key: DRID, day: today, item: "", score: 0, starsDelta: stars, xpDelta: xp, missionBonus: false, at: ts(), note: "Great move" });
  }); };
  { const who = chestUser("2"), sendChest = (type = "chest") => seedAs(s => s.collection("liveDrops").doc(who).collection("drops").doc(DRID).set(dropDoc({ type, amount: type === "chest" ? 0 : 10, at: tsAgo(1000) })));
    await spinT("drop: free chest from the coach", true, who, rich, async db => { await sendChest(); return chestDrop(db, who, { xp: 150 }); });
    await spinT("drop: chest from the coach still charges stars", false, who, rich, async db => { await sendChest(); return chestDrop(db, who, { stars: -40, xp: 150 }); });
    await spinT("drop: free chest with no drop", false, who, rich, db => chestDrop(db, who, { xp: 150 }));
    await spinT("drop: free chest from a stars drop", false, who, rich, async db => { await sendChest("stars"); return chestDrop(db, who, { xp: 150 }); });
    await spinT("drop: free chest that keeps the drop", false, who, rich, async db => { await sendChest(); return chestDrop(db, who, { xp: 150, keep: true }); });
    await spinT("drop: free chest with a bigger prize", false, who, rich, async db => { await sendChest(); return chestDrop(db, who, { xp: 300 }); }); }

  // ---------- live chess games, arena tournaments and the game archive ----------
  {
    const LM = "liveAAAAAAAAAAAAAAAA", third = "third1", coachU = "coach1", TID = "arenaAAAAAA", AG = "gameAAAAAAAAAAAA";
    const ctxOf = who => env.authenticatedContext(who, { firebase: { sign_in_provider: "password" } }).firestore();
    const withNick = (n, user) => Object.assign({}, rich, { nickname: n, username: user });
    const withPeople = async s => {
      await s.collection("users").doc(other).set(withNick("Tiger", "other_1"));
      await s.collection("users").doc(third).set(withNick("Owl", "third_1"));
      await s.collection("staff").doc(coachU).set({ role: "coach", name: "C", username: "c" });
    };
    const TT = async (name, expect, who, fn, seed) => {
      await env.clearFirestore();
      await seedAs(async s => { await s.collection("users").doc(uid).set(withNick("Falcon", "ali_1")); await withPeople(s); if (seed) await seed(s); });
      let got = true, msg = "";
      try { await fn(ctxOf(who)); } catch (e) { got = false; msg = String(e.message).replace(/\s+/g, " ").slice(0, 300); }
      const lim = !got && /1000 expressions/.test(msg); if (lim) limited++;
      const ok = got === expect; ok ? pass++ : (fail++, failures.push(name + " :: " + msg));
      if (!ok || !quiet) console.log(ok ? "OK  " : "FAIL", expect ? "allow" : "deny ", name, lim ? "[HIT-1000-LIMIT]" : "");
    };
    const lmRef = db => db.collection("liveMatches").doc(LM);
    const lmDoc = (x = {}) => Object.assign({ w: uid, b: other, wn: "Falcon", bn: "Tiger", p: [uid, other], base: 180000, inc: 2000, tc: "3+2", mode: "pvp", tid: "", status: "live", moves: [], n: 0, wt: 180000, bt: 180000, at: tsAgo(1000), bzw: false, bzb: false, draw: "", res: "", why: "", hbw: tsAgo(1000), hbb: tsAgo(1000), created: tsAgo(60000) }, x);
    const lmSeed = d => s => s.collection("liveMatches").doc(LM).set(typeof d === "function" ? d() : d);
    const open0 = (x = {}) => Object.assign(lmDoc({ status: "open", b: "", bn: "", p: [uid] }), { at: ts(), hbw: ts(), hbb: ts(), created: ts() }, x);
    const mv = x => db => lmRef(db).update(Object.assign({ at: ts() }, x));
    const mid = (x = {}) => () => lmDoc(Object.assign({ moves: ["e2e4", "e7e5"], n: 2, wt: 100000, bt: 90000, at: tsAgo(5000) }, x));
    const M3 = ["e2e4", "e7e5", "g1f3"];
    // a challenge and joining it
    await TT("live: open a challenge as white", true, uid, db => lmRef(db).set(open0()));
    await TT("live: open a challenge as black", true, uid, db => lmRef(db).set(open0({ w: "", wn: "", b: uid, bn: "Falcon" })));
    await TT("live: open a challenge with a legal name", false, uid, db => lmRef(db).set(open0({ wn: "Ali" })));
    await TT("live: open a game already live against a classmate", false, uid, db => lmRef(db).set(open0({ status: "live", b: other, bn: "Tiger", p: [uid, other] })));
    await TT("live: open a challenge with the clock already cut", false, uid, db => lmRef(db).set(open0({ bt: 1000 })));
    await TT("live: open a challenge in someone else's seat", false, uid, db => lmRef(db).set(open0({ w: other, wn: "Tiger", p: [other] })));
    await TT("live: join a challenge by its link", true, other, db => lmRef(db).update({ b: other, bn: "Tiger", p: [uid, other], status: "live", at: ts(), hbw: ts(), hbb: ts() }), lmSeed(lmDoc({ status: "open", b: "", bn: "", p: [uid] })));
    await TT("live: join your own challenge", false, uid, db => lmRef(db).update({ b: uid, bn: "Falcon", p: [uid, uid], status: "live", at: ts(), hbw: ts(), hbb: ts() }), lmSeed(lmDoc({ status: "open", b: "", bn: "", p: [uid] })));
    // moves: only the player whose turn it is, appended at the end, and never with more time than the server allows
    await TT("live: white plays the first move", true, uid, mv({ moves: ["e2e4"], n: 1 }), lmSeed(lmDoc()));
    await TT("live: play on the opponent's turn (forge their move)", false, uid, mv({ moves: ["e2e4", "e7e5"], n: 2 }), lmSeed(lmDoc({ moves: ["e2e4"], n: 1 })));
    await TT("live: a spectator plays a move", false, third, mv({ moves: ["e2e4"], n: 1 }), lmSeed(lmDoc()));
    await TT("live: rewrite an earlier move", false, uid, mv({ moves: ["d2d4", "e7e5", "g1f3"], n: 3 }), lmSeed(mid()));
    await TT("live: two moves in one write", false, uid, mv({ moves: ["e2e4", "e7e5", "g1f3", "b8c6"], n: 4 }), lmSeed(mid()));
    await TT("live: a move that is not a move", false, uid, mv({ moves: ["e2e4", "e7e5", "<b>x"], n: 3, wt: 95500 }), lmSeed(mid()));
    await TT("live: honest clock after 5 seconds (+2s increment)", true, uid, mv({ moves: M3, n: 3, wt: 95500 }), lmSeed(mid()));
    await TT("live: inflate your own clock", false, uid, mv({ moves: M3, n: 3, wt: 101000 }), lmSeed(mid()));
    await TT("live: keep your clock as if no time passed", false, uid, mv({ moves: M3, n: 3, wt: 100000 }), lmSeed(mid()));
    await TT("live: cut the opponent's clock", false, uid, mv({ moves: M3, n: 3, wt: 95500, bt: 1000 }), lmSeed(mid()));
    await TT("live: the first move cannot add time", false, uid, mv({ moves: ["e2e4"], n: 1, wt: 185000 }), lmSeed(lmDoc()));
    await TT("live: checkmate with the move", true, uid, mv({ moves: ["e2e4", "e7e5", "d1h5"], n: 3, wt: 95500, status: "over", res: "1-0", why: "checkmate" }), lmSeed(mid()));
    await TT("live: checkmate that gives the win to the opponent", false, uid, mv({ moves: ["e2e4", "e7e5", "d1h5"], n: 3, wt: 95500, status: "over", res: "0-1", why: "checkmate" }), lmSeed(mid()));
    await TT("live: stalemate with the move is a draw", true, uid, mv({ moves: M3, n: 3, wt: 95500, status: "over", res: "1/2-1/2", why: "stalemate" }), lmSeed(mid()));
    await TT("live: stalemate written as a win", false, uid, mv({ moves: M3, n: 3, wt: 95500, status: "over", res: "1-0", why: "stalemate" }), lmSeed(mid()));
    // resign, draw offers, flags and abandoned games
    await TT("live: resign", true, uid, db => lmRef(db).update({ status: "over", res: "0-1", why: "resign" }), lmSeed(mid()));
    await TT("live: resign but write a win", false, uid, db => lmRef(db).update({ status: "over", res: "1-0", why: "resign" }), lmSeed(mid()));
    await TT("live: offer a draw", true, uid, db => lmRef(db).update({ draw: "w" }), lmSeed(mid()));
    await TT("live: offer a draw in the opponent's name", false, uid, db => lmRef(db).update({ draw: "b" }), lmSeed(mid()));
    await TT("live: accept the opponent's draw offer", true, other, db => lmRef(db).update({ draw: "", status: "over", res: "1/2-1/2", why: "draw" }), lmSeed(mid({ draw: "w" })));
    await TT("live: accept your own draw offer", false, uid, db => lmRef(db).update({ draw: "", status: "over", res: "1/2-1/2", why: "draw" }), lmSeed(mid({ draw: "w" })));
    await TT("live: decline a draw offer", true, other, db => lmRef(db).update({ draw: "" }), lmSeed(mid({ draw: "w" })));
    const flagged = (x = {}) => () => lmDoc(Object.assign({ moves: M3, n: 3, wt: 90000, bt: 4000, at: tsAgo(6000) }, x));
    await TT("live: claim the win when the opponent's clock ran out", true, uid, db => lmRef(db).update({ status: "over", res: "1-0", why: "timeout" }), lmSeed(flagged()));
    await TT("live: claim on time before the opponent's clock runs out", false, uid, db => lmRef(db).update({ status: "over", res: "1-0", why: "timeout" }), lmSeed(flagged({ bt: 60000 })));
    await TT("live: claim on time while your own clock is running", false, other, db => lmRef(db).update({ status: "over", res: "0-1", why: "timeout" }), lmSeed(flagged()));
    await TT("live: draw on time when you cannot mate", true, uid, db => lmRef(db).update({ status: "over", res: "1/2-1/2", why: "material" }), lmSeed(flagged()));
    await TT("live: claim the win after 30s without the opponent", true, uid, db => lmRef(db).update({ status: "over", res: "1-0", why: "abandon" }), lmSeed(mid({ hbb: tsAgo(40000) })));
    await TT("live: claim abandon while the opponent is online", false, uid, db => lmRef(db).update({ status: "over", res: "1-0", why: "abandon" }), lmSeed(mid({ hbb: tsAgo(5000) })));
    await TT("live: abort before both players moved", true, uid, db => lmRef(db).update({ status: "over", why: "abort" }), lmSeed(lmDoc({ moves: ["e2e4"], n: 1 })));
    await TT("live: abort a game in progress", false, uid, db => lmRef(db).update({ status: "over", why: "abort" }), lmSeed(mid()));
    await TT("live: heartbeat", true, uid, db => lmRef(db).update({ hbw: ts() }), lmSeed(mid()));
    await TT("live: write the opponent's heartbeat", false, uid, db => lmRef(db).update({ hbb: ts() }), lmSeed(mid()));
    await TT("live: berserk in a friendly game", false, uid, db => lmRef(db).update({ bzw: true, wt: 90000 }), lmSeed(lmDoc()));
    await TT("live: a classmate watches the game", true, third, db => lmRef(db).get(), lmSeed(mid()));
    await TT("live: move after the game ended", false, uid, mv({ moves: M3, n: 3, wt: 95500 }), lmSeed(mid({ status: "over", res: "0-1", why: "resign" })));
    // arena tournaments
    const aRef = db => db.collection("liveArenas").doc(TID), pRef = (db, who) => aRef(db).collection("players").doc(who);
    const arenaDoc = (x = {}) => { const t0 = Date.now() - 60000; return Object.assign({ name: "Friday Arena", tc: "3+2", base: 180000, inc: 2000, minutes: 30, startAt: TS.fromMillis(t0), endAt: TS.fromMillis(t0 + 30 * 60000), by: coachU, created: tsAgo(120000) }, x); };
    const pl = (n, x = {}) => Object.assign({ n, pts: 0, streak: 0, fire: false, games: [], wait: false, since: tsAgo(5000), cur: "", last: "" }, x);
    const arenaSeed = (players = {}, match) => async s => {
      await s.collection("liveArenas").doc(TID).set(arenaDoc());
      for (const [who, d] of Object.entries(players)) await s.collection("liveArenas").doc(TID).collection("players").doc(who).set(d);
      if (match) await s.collection("liveMatches").doc(LM).set(typeof match === "function" ? match() : match);
    };
    await TT("arena: coach creates a 30-minute arena", true, coachU, db => aRef(db).set(Object.assign(arenaDoc(), { created: ts() })));
    await TT("arena: a student creates an arena", false, uid, db => aRef(db).set(Object.assign(arenaDoc({ by: uid }), { created: ts() })));
    await TT("arena: end time that does not match the length", false, coachU, db => aRef(db).set(Object.assign(arenaDoc({ minutes: 45 }), { created: ts() })));
    await TT("arena: join with the nickname", true, uid, db => pRef(db, uid).set(pl("Falcon", { wait: true, since: ts() })), arenaSeed());
    await TT("arena: join with free points", false, uid, db => pRef(db, uid).set(pl("Falcon", { pts: 10, since: ts() })), arenaSeed());
    await TT("arena: join with a legal name", false, uid, db => pRef(db, uid).set(pl("Ali", { since: ts() })), arenaSeed());
    await TT("arena: sign a classmate up", false, uid, db => pRef(db, other).set(pl("Tiger", { since: ts() })), arenaSeed());
    await TT("arena: join the queue", true, uid, db => pRef(db, uid).update({ wait: true, since: ts() }), arenaSeed({ [uid]: pl("Falcon") }));
    await TT("arena: put a classmate in the queue", false, uid, db => pRef(db, other).update({ wait: true, since: ts() }), arenaSeed({ [other]: pl("Tiger") }));
    const pair = (x = {}) => db => { const b = db.batch();
      b.set(lmRef(db), Object.assign(lmDoc({ mode: "arena", tid: TID }), { at: ts(), hbw: ts(), hbb: ts(), created: ts() }, x));
      b.update(pRef(db, uid), { wait: false, cur: LM, last: other }); b.update(pRef(db, other), { wait: false, cur: LM, last: uid }); return b.commit(); };
    const waiting = { [uid]: pl("Falcon", { wait: true }), [other]: pl("Tiger", { wait: true }) };
    await TT("arena: pair two waiting players into a game", true, uid, pair(), arenaSeed(waiting));
    await TT("arena: pair a player who is not in the queue", false, uid, pair(), arenaSeed({ [uid]: pl("Falcon", { wait: true }), [other]: pl("Tiger") }));
    await TT("arena: pairing with a different clock", false, uid, pair({ base: 600000, wt: 600000, bt: 600000, tc: "10+0", inc: 0 }), arenaSeed(waiting));
    await TT("arena: pairing two classmates from outside", false, third, pair(), arenaSeed(waiting));
    const am = (x = {}) => lmDoc(Object.assign({ mode: "arena", tid: TID }, x));
    await TT("arena: berserk before the first move", true, uid, db => lmRef(db).update({ bzw: true, wt: 90000 }), lmSeed(am()));
    await TT("arena: berserk that keeps more than half", false, uid, db => lmRef(db).update({ bzw: true, wt: 120000 }), lmSeed(am()));
    await TT("arena: berserk after moving", false, uid, db => lmRef(db).update({ bzw: true, wt: 90000 }), lmSeed(am({ moves: ["e2e4", "e7e5"], n: 2 })));
    await TT("arena: berserk the opponent", false, uid, db => lmRef(db).update({ bzb: true, bt: 90000 }), lmSeed(am()));
    const over = (res, x = {}) => am(Object.assign({ status: "over", res, why: res === "1/2-1/2" ? "draw" : "resign", moves: ["e2e4", "e7e5"], n: 2 }, x));
    const scoreSeed = (mine, match) => arenaSeed({ [uid]: mine, [other]: pl("Tiger", { cur: LM, last: uid }) }, match);
    const score = (who, x) => db => pRef(db, who).update(Object.assign({ games: [LM], cur: "" }, x));
    await TT("arena: a win is 2 points", true, uid, score(uid, { pts: 2, streak: 1 }), scoreSeed(pl("Falcon", { cur: LM }), over("1-0")));
    await TT("arena: a draw is 1 point", true, uid, score(uid, { pts: 1 }), scoreSeed(pl("Falcon", { cur: LM }), over("1/2-1/2")));
    await TT("arena: third win in a row is 4 points (fire)", true, uid, db => pRef(db, uid).update({ pts: 8, streak: 3, fire: true, games: ["gA", "gB", LM], cur: "" }), scoreSeed(pl("Falcon", { pts: 4, streak: 2, fire: true, games: ["gA", "gB"], cur: LM }), over("1-0")));
    await TT("arena: fire points without the streak", false, uid, db => pRef(db, uid).update({ pts: 6, streak: 2, fire: true, games: ["gA", LM], cur: "" }), scoreSeed(pl("Falcon", { pts: 2, streak: 1, games: ["gA"], cur: LM }), over("1-0")));
    await TT("arena: berserk win adds 1 point", true, uid, score(uid, { pts: 3, streak: 1 }), scoreSeed(pl("Falcon", { cur: LM }), over("1-0", { bzw: true, wt: 90000 })));
    await TT("arena: a loss written as a win", false, uid, score(uid, { pts: 2, streak: 1 }), scoreSeed(pl("Falcon", { cur: LM }), over("0-1")));
    await TT("arena: a loss is 0 and ends the streak", true, uid, score(uid, { pts: 4, streak: 0, fire: false }), scoreSeed(pl("Falcon", { pts: 4, streak: 2, fire: true, cur: LM }), over("0-1")));
    await TT("arena: record the opponent's loss too", true, uid, score(other, {}), scoreSeed(pl("Falcon", { cur: LM }), over("1-0")));
    await TT("arena: count the same game twice", false, uid, db => pRef(db, uid).update({ pts: 4, streak: 2, fire: true, games: [LM, LM], cur: "" }), scoreSeed(pl("Falcon", { pts: 2, streak: 1, games: [LM], cur: LM }), over("1-0")));
    await TT("arena: points for a game still being played", false, uid, score(uid, { pts: 2, streak: 1 }), scoreSeed(pl("Falcon", { cur: LM }), am({ moves: ["e2e4"], n: 1 })));
    await TT("arena: an aborted game gives no points", false, uid, score(uid, { pts: 2, streak: 1 }), scoreSeed(pl("Falcon", { cur: LM }), am({ status: "over", why: "abort" })));
    // the game archive
    const agRef = (db, id = AG) => db.collection("archivedGames").doc(id);
    const ag = (x = {}) => Object.assign({ gameId: AG, whiteUid: uid, whiteName: "Falcon", whiteRating: null, blackUid: "bot-3", blackName: "Bot", blackRating: 1200, mode: "bot", timeControl: "5+0", result: "1-0", termination: "checkmate",
      pgn: '[Event "ECA"]\n[White "Falcon"]\n\n1. e4 e5 2. Qh5 Nc6 3. Bc4 Nf6 4. Qxf7# 1-0', uciMoves: "e2e4 e7e5 d1h5 b8c6 f1c4 g8f6 h5f7", clockTimesCentisec: [30000, 30000, 29500], openingNameAr: "افتتاح", analysisSummary: null, playedAt: ts(), participantUids: [uid] }, x);
    const summary = { whiteAccuracy: 88.4, blackAccuracy: 61.2, tierCounts: { BEST: 3, BLUNDER: 1 }, compactMoveTiers: "KKTIXTT", at: Date.now() };
    await TT("archive: save a bot game", true, uid, db => agRef(db).set(ag()));
    await TT("archive: save an imported PGN", true, uid, db => agRef(db).set(ag({ mode: "import", whiteUid: "", blackUid: "", blackRating: null })));
    await TT("archive: save a bot game into a classmate's archive", false, uid, db => agRef(db).set(ag({ whiteUid: other, participantUids: [other] })));
    await TT("archive: save with an analysis already attached", false, uid, db => agRef(db).set(ag({ analysisSummary: summary })));
    await TT("archive: save HTML in the PGN", false, uid, db => agRef(db).set(ag({ pgn: "<img src=x onerror=alert(1)>" })));
    const liveOver = () => lmDoc({ status: "over", res: "1-0", why: "resign", moves: ["e2e4", "e7e5"], n: 2 });
    const agLive = (x = {}) => ag(Object.assign({ gameId: LM, mode: "pvp", blackUid: other, blackName: "Tiger", blackRating: null, timeControl: "3+2", result: "1-0", termination: "resign", uciMoves: "e2e4 e7e5", participantUids: [uid, other] }, x));
    await TT("archive: save a finished live game", true, uid, db => agRef(db, LM).set(agLive()), lmSeed(liveOver));
    await TT("archive: the opponent saves the same live game", true, other, db => agRef(db, LM).set(agLive()), lmSeed(liveOver));
    await TT("archive: save a lost live game as a win", false, uid, db => agRef(db, LM).set(agLive()), lmSeed(() => lmDoc({ status: "over", res: "0-1", why: "resign", moves: ["e2e4", "e7e5"], n: 2 })));
    await TT("archive: save a live game with other moves", false, uid, db => agRef(db, LM).set(agLive({ uciMoves: "d2d4 d7d5" })), lmSeed(liveOver));
    await TT("archive: save a live game that is still running", false, uid, db => agRef(db, LM).set(agLive()), lmSeed(mid()));
    const stored = s => s.collection("archivedGames").doc(AG).set(ag({ playedAt: tsAgo(60000) }));
    await TT("archive: list your own games", true, uid, db => db.collection("archivedGames").where("participantUids", "array-contains", uid).get(), stored);
    await TT("archive: read a classmate's game", false, third, db => agRef(db).get(), stored);
    await TT("archive: list a classmate's games", false, third, db => db.collection("archivedGames").where("participantUids", "array-contains", uid).get(), stored);
    await TT("archive: the coach reads a student's game", true, coachU, db => agRef(db).get(), stored);
    await TT("archive: attach the analysis summary", true, uid, db => agRef(db).update({ analysisSummary: summary }), stored);
    await TT("archive: the coach attaches the analysis summary", true, coachU, db => agRef(db).update({ analysisSummary: summary }), stored);
    await TT("archive: a classmate attaches an analysis", false, third, db => agRef(db).update({ analysisSummary: summary }), stored);
    await TT("archive: an analysis with a fake accuracy", false, uid, db => agRef(db).update({ analysisSummary: Object.assign({}, summary, { whiteAccuracy: 140 }) }), stored);
    await TT("archive: change the result later", false, uid, db => agRef(db).update({ result: "0-1" }), stored);
    await TT("archive: overwrite a classmate's game", false, third, db => agRef(db).set(ag({ whiteUid: third, participantUids: [third] })), stored);
    await TT("archive: delete your own game", false, uid, db => agRef(db).delete(), stored);
  }

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
