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
