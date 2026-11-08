// Demo data for the LOCAL emulators only (never production): npm run seed:emulator
// Start the emulators first in another terminal:  npx firebase emulators:start --only auth,firestore --project demo-eca
// Then run this. It adds, only if the demo group is not there yet (or with --force):
//   - a coach account and 3 students in the group "Lake House - Step 2" (password: demo12345)
//   - 16 tactical puzzles from the academy's lesson bank, 2 per motif (Pin, Fork, Discovered Attack, Double Check,
//     Deflection, Skewer, Mate in 1, Mate in 2), one at Step 1 level and one at Step 2 level
//   - this week's Coach's Weekly Challenge
//   - an active Boss Homework for the group with 10 of those puzzles (10 HP), due in 7 days
//   - one waiting Live Drop for the first student
// Puzzles stay in the site's files (the app never reads a puzzles collection); the list is printed and saved in
// meta/demoPuzzles so you can see which ones the demo uses.
const fs = require("fs"), path = require("path"), vm = require("vm");
const PROJECT = process.env.SEED_PROJECT || "demo-eca";
const FS = process.env.FIRESTORE_EMULATOR_HOST ? "http://" + process.env.FIRESTORE_EMULATOR_HOST : "http://127.0.0.1:8085";
const AUTH = process.env.FIREBASE_AUTH_EMULATOR_HOST ? "http://" + process.env.FIREBASE_AUTH_EMULATOR_HOST : "http://127.0.0.1:9099";
const PASS = "demo12345", GROUP = "Lake House - Step 2";
for (const url of [FS, AUTH]) if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url)) { console.error("Refusing to seed a non-local address: " + url); process.exit(1); }
if (!/^demo-/.test(PROJECT)) { console.error("Refusing to seed a project that is not a demo-* emulator project: " + PROJECT); process.exit(1); }

function toValue(v) {
  if (v === null) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "object") return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toValue(x)])) } };
  return { stringValue: String(v) };
}
const docUrl = p => `${FS}/v1/projects/${PROJECT}/databases/(default)/documents/${p}`;
const owner = { Authorization: "Bearer owner", "Content-Type": "application/json" };
async function put(p, data) { const r = await fetch(docUrl(p), { method: "PATCH", headers: owner, body: JSON.stringify({ fields: toValue(data).mapValue.fields }) }); if (!r.ok) throw new Error("write " + p + " " + r.status + " " + await r.text()); }
async function exists(p) { const r = await fetch(docUrl(p), { headers: owner }); return r.ok; }
async function account(email) {
  const body = JSON.stringify({ email, password: PASS, returnSecureToken: true });
  let r = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo`, { method: "POST", headers: { "Content-Type": "application/json" }, body });
  let j = await r.json();
  if (!j.localId) { r = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo`, { method: "POST", headers: { "Content-Type": "application/json" }, body }); j = await r.json(); }
  if (!j.localId) throw new Error("account " + email + " " + JSON.stringify(j));
  return j.localId;
}
const isoDay = d => { const t = new Date(d); t.setMinutes(t.getMinutes() - t.getTimezoneOffset()); return t.toISOString().slice(0, 10); };
function weekKey() { const t = new Date(isoDay(Date.now()) + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() - (t.getUTCDay() + 1) % 7); return t.toISOString().slice(0, 10); }

function samplePuzzles() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", "puzzles-themes.js"), "utf8"), ctx);
  const bank = ctx.window.ECA_THEME_BANK, out = [], used = new Set();
  const MOTIFS = [["pin", "Pin"], ["fork", "Fork"], ["discoveredAttack", "Discovered Attack"], ["doubleCheck", "Double Check"], ["deflection", "Deflection"], ["skewer", "Skewer"], ["mateIn1", "Mate in 1"], ["mateIn2", "Mate in 2"]];
  for (const [theme, label] of MOTIFS) for (const step of [1, 2]) {
    const row = bank.themes[theme][step - 1].find(r => !used.has(r.split("|")[0]));
    const [id, fen, moves, rating] = row.split("|");
    used.add(id);
    out.push({ id, motif: label, theme, step: "Step " + step, rating: Number(rating), fen, moves });
  }
  return out;
}

async function seedDatabase({ force = false } = {}) {
  if (!force && await exists("meta/demoPuzzles")) { console.log("Demo data is already there. Use --force to add it again."); return false; }
  const puzzles = samplePuzzles();
  const coach = await account("coach@demo.local");
  await put("staff/" + coach, { role: "coach", name: "Demo Coach", username: "democoach" });
  const names = [["Omar Hassan", "omar_demo", "Knight"], ["Mariam Adel", "mariam_demo", "Bishop"], ["Youssef Samir", "youssef_demo", "Rook"]], ids = [];
  for (const [name, username, nickname] of names) {
    const uid = await account(username + "@demo.local");
    ids.push(uid);
    await put("users/" + uid, { name, username, email: username + "@demo.local", phone: "01000000000", parentPhone: "01100000000", role: "student", level: 2, group: GROUP, mode: "offline",
      nickname, att: { "1-0": true, "1-1": true, "2-0": true, "2-1": true }, hw: { "1-0": true }, puz: { t: 0, c: 0 }, arena: { stars: 20, xp: 300, days: [isoDay(Date.now() - 864e5)] },
      shop: { titles: [], bots: [], hints: 0, activeTitle: "" }, examState: { "1": { status: "passed", score: 85, attempts: 1, date: isoDay(Date.now() - 30 * 864e5) } } });
  }
  await put("meta/groups", { list: [GROUP], sched: {} });
  await put("meta/demoPuzzles", { puzzles: puzzles.map(p => ({ id: p.id, motif: p.motif, step: p.step, rating: p.rating })) });
  const weekly = puzzles.find(p => p.theme === "fork" && p.step === "Step 2");
  await put("coachChallenges/" + weekKey(), { title: "Find the fork", fen: weekly.fen, moves: weekly.moves, setup: true, by: coach, at: new Date() });
  const pack = puzzles.filter(p => p !== weekly).slice(0, 10).map(p => p.id);
  const bossId = "demoBoss" + Date.now().toString(36);
  await put("assignments/" + bossId, { title: "The Tactics Dragon", group: GROUP, step: 2, motif: "", puzzles: pack, due: new Date(Date.now() + 7 * 864e5), by: coach, at: new Date() });
  await put(`liveDrops/${ids[0]}/drops/demoDrop${Date.now().toString(36)}`, { type: "stars", amount: 5, note: "Welcome to the academy!", by: coach, at: new Date() });
  console.table(puzzles.map(({ id, motif, step, rating }) => ({ id, motif, step, rating })));
  console.log(`Seeded: coach@demo.local and ${names.map(n => n[1] + "@demo.local").join(", ")} (password ${PASS}),`);
  console.log(`group "${GROUP}", weekly challenge ${weekKey()}, boss homework ${bossId} (${pack.length} HP), 1 live drop.`);
  return true;
}
module.exports = { seedDatabase };
if (require.main === module) seedDatabase({ force: process.argv.includes("--force") }).catch(e => { console.error("Seeding failed:", e.message); process.exit(1); });
