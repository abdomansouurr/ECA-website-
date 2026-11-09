// ECA — fun.js: ضد الملل
// مهام يومية بتتبدل، وحدث أسبوعي بفكرة تكتيكية (نفس الفكرة لكل الأكاديمية)، ولغز ذهبي نادر، وصندوق بعد 5 حلول صح ورا بعض.
// الجوايز كلها بتعدّي على fbEconomy بإيصال برقم ثابت، والقواعد بتفحص النجوم ومرة واحدة (اليوم أو الأسبوع).

const FUN = (ar, en) => lang === "en" ? en : ar;

// ================= 1) المهام اليومية بتتبدل: مهمة الدرس ثابتة + 2 من 4 كل يوم =================
const FUN_POOL = [
  { key: "puzzles", goal: 3, stars: 2, ar: "حل 3 ألغاز في ساحة التدريب", en: "Solve 3 puzzles in the training arena" },
  { key: "win", goal: 1, stars: 2, ar: "اكسب دور ضد أي بوت", en: "Win a game against any bot" },
  { key: "streak3", goal: 3, stars: 2, ar: "حل 3 ألغاز صح ورا بعض", en: "Solve 3 puzzles in a row" },
  { key: "rush6", goal: 6, stars: 2, ar: "اجمع 6 نقط في Puzzle Rush", en: "Score 6 in Puzzle Rush" }
];
function funQuestsToday(u) {
  const h = lpHash(String(u.id) + "|q|" + todayISO()), a = h % 4, b = (a + 1 + Math.floor(h / 4) % 3) % 4;
  return [FUN_POOL[a], FUN_POOL[b]];
}
function funQuestSync() {
  const u = currUser();
  if (!u || u.role !== "student") return;
  const lesson = ECA_QUESTS.find(q => q.key === "lesson"), want = [lesson, ...funQuestsToday(u)].filter(Boolean);
  if (ECA_QUESTS.map(q => q.key).join() !== want.map(q => q.key).join()) ECA_QUESTS.splice(0, ECA_QUESTS.length, ...want);
}
window.funQuestSync = funQuestSync;
function funRushKey(u) { return "ECA_RUSH_BEST_" + String((u && u.id) || "") + "_" + todayISO(); }
function funRushBest(u) { try { return Number(localStorage.getItem(funRushKey(u))) || 0; } catch (_) { return 0; } }
{
  const _qp = ecaQuestProgress;
  ecaQuestProgress = function (u, key) {
    const a = (u && u.arena) || {};
    if (key === "streak3") return a.qsd === todayISO() ? Number(a.qs) || 0 : 0;
    if (key === "rush6") return funRushBest(u);
    return _qp.apply(this, arguments);
  };
  // أحسن سلسلة النهاردة وتقدّم حدث الأسبوع بيتحسبوا جوه نفس كتابة محاولة اللغز
  const _qb = window.ecaQuestBump;
  window.ecaQuestBump = function (a, kind) {
    _qb(a, kind);
    if (kind !== "puzzles") return;
    const day = todayISO(), run = (Number(a.puzStreak) || 0) + 1;
    if (a.qsd !== day) { a.qsd = day; a.qs = 0; }
    a.qs = Math.max(Number(a.qs) || 0, run);
    if (arena.puz.lesson === "ev" && !arena.puz.review) {
      const w = ecaWeekKey();
      if (!a.ev || a.ev.w !== w) a.ev = { w, n: 0 };
      a.ev.n = (Number(a.ev.n) || 0) + 1;
    }
  };
  // أحسن نتيجة Puzzle Rush النهاردة
  const _aw = window.ecaAwardStudentActivity;
  window.ecaAwardStudentActivity = function (source, key, score) {
    if (source === "rush") { const u = currUser(); if (u && Number(score) > funRushBest(u)) try { localStorage.setItem(funRushKey(u), String(Math.floor(Number(score)))); } catch (_) {} }
    return _aw.apply(this, arguments);
  };
  const _qc = ecaQuestsCardHTML;
  ecaQuestsCardHTML = function () { funQuestSync(); return _qc.apply(this, arguments); };
  const _cq = ecaClaimQuest;
  ecaClaimQuest = function () { funQuestSync(); return _cq.apply(this, arguments); };
  window.ecaClaimQuest = ecaClaimQuest;
}

// ================= 2) حدث الأسبوع: فكرة تكتيكية واحدة لكل الأكاديمية =================
const FUN_EVENT_GOAL = 15, FUN_EVENT_STARS = 8;
const FUN_EVENT_THEMES = ["fork", "pin", "skewer", "discoveredAttack", "doubleCheck", "deflection", "attraction", "mateIn1", "mateIn2", "backRankMate",
  "hangingPiece", "trappedPiece", "capturingDefender", "sacrifice", "promotion", "clearance", "interference", "xRayAttack", "kingsideAttack", "exposedKing"];
function funEventTheme() { return FUN_EVENT_THEMES[lpHash("event|" + ecaWeekKey()) % FUN_EVENT_THEMES.length]; }
window.funEventTheme = funEventTheme;
function funEventState(u) {
  const a = (u && u.arena) || {}, w = ecaWeekKey(), n = a.ev && a.ev.w === w ? Number(a.ev.n) || 0 : 0;
  return { w, theme: funEventTheme(), n: Math.min(FUN_EVENT_GOAL, n), done: n >= FUN_EVENT_GOAL, claimed: a.evc === w };
}
window.funEventState = funEventState;
function funEventStart() { lpStart("ev"); }
window.funEventStart = funEventStart;
let funEventBusy = false;
async function funEventClaim() {
  const u = currUser(), st = funEventState(u);
  if (!u || !st.done || st.claimed || funEventBusy) return;
  funEventBusy = true;
  try {
    const r = await window.fbEconomy({ op: "earn", source: "event", key: st.w, day: todayISO() });
    if (r && r.ok && !r.duplicate) {
      if (window.ecaMilestone) ecaMilestone({ icon: "🎪", big: true, title: FUN("كسبت حدث الأسبوع!", "Weekly event won!"), text: FUN(`${lpThemeName(st.theme)}: +${FUN_EVENT_STARS} ⭐`, `${lpThemeName(st.theme)}: +${FUN_EVENT_STARS} ⭐`) });
      if (window.ecaFireworks) ecaFireworks(3);
    } else if (r && r.code !== "offline-queued") toast(FUN("الجايزة دي اتاخدت قبل كده.", "This reward was already claimed."));
  } catch (e) { console.warn("Event claim failed:", e && e.code); toast(FUN("ما قدرناش نسلّم الجايزة. حاول تاني.", "Could not claim the reward. Try again.")); }
  funEventBusy = false;
  render();
}
window.funEventClaim = funEventClaim;
function funEventCardHTML(u) {
  const st = funEventState(u), name = lpThemeName(st.theme);
  const btn = st.claimed ? `<span class="text-xs font-bold text-emerald-300">✓ ${FUN("خلّصته", "Done")}</span>`
    : st.done ? `<button type="button" onclick="funEventClaim()" class="tap shrink-0 rounded-xl px-4 text-xs font-bold gold-btn">🎁 ${FUN(`استلم ⭐ ${FUN_EVENT_STARS}`, `Claim ⭐ ${FUN_EVENT_STARS}`)}</button>`
    : `<button type="button" onclick="funEventStart()" class="tap shrink-0 rounded-xl px-4 text-xs font-bold gold-btn">▶ ${FUN("العب", "Play")}</button>`;
  return `<section class="gold-card rounded-2xl p-4 space-y-2" aria-label="${esc(FUN("حدث الأسبوع", "Weekly event"))}">
    <div class="flex items-center gap-3">
      <span class="text-3xl shrink-0" aria-hidden="true">🎪</span>
      <div class="min-w-0 flex-1"><b class="block text-sm text-yellow-300">${esc(FUN(`حدث الأسبوع: أسبوع ${name}`, `Weekly event: ${name} week`))}</b>
        <span class="block text-xs text-gray-300">${esc(FUN(`حل ${FUN_EVENT_GOAL} لغز ${name} قبل الجمعة واكسب ⭐ ${FUN_EVENT_STARS}.`, `Solve ${FUN_EVENT_GOAL} ${name} puzzles by Friday to win ⭐ ${FUN_EVENT_STARS}.`))}</span></div>
      ${btn}
    </div>
    <div class="eca-quest-track" role="progressbar" aria-valuemin="0" aria-valuemax="${FUN_EVENT_GOAL}" aria-valuenow="${st.n}" aria-label="${esc(FUN("تقدّم الحدث", "Event progress"))}"><div style="width:${Math.round(st.n / FUN_EVENT_GOAL * 100)}%"></div></div>
    <p class="text-xs text-gray-400 text-end" dir="ltr">${st.n}/${FUN_EVENT_GOAL}</p>
  </section>`;
}
{
  // ألغاز الحدث بتتحل في وضع الدرس نفسه (مستوى ذكي وتلميحات)، باسم الحدث
  const _lt = lpTitle;
  lpTitle = function (k) { return k === "ev" ? FUN("حدث الأسبوع: ", "Weekly event: ") + lpThemeName(funEventTheme()) : _lt.apply(this, arguments); };
  const _sh = renderStudentHome;
  renderStudentHome = function (s) { return `<div class="space-y-6">${funEventCardHTML(s)}${_sh(s)}</div>`; };
  const _lh = arenaLessonsHTML;
  arenaLessonsHTML = function () { const u = currUser(), html = _lh.apply(this, arguments); return u && u.role === "student" ? `<div class="space-y-4 max-w-2xl w-full mx-auto">${funEventCardHTML(u)}${html}</div>` : html; };
}

// ================= 3) اللغز الذهبي و4) صندوق الـ 5 ورا بعض (ألغاز الدروس والحدث) =================
const FUN_GOLD_CHANCE = 1 / 10;
// آخر حفظ لمحاولة لغز: الجايزة بتستناه عشان ما يحصلش سباق على ملف الطالب
{ const _ra = recordAttempt; recordAttempt = function () { const p = _ra.apply(this, arguments); window.__ecaAttemptP = Promise.resolve(p).catch(() => {}); return p; }; }
function funDayKey(kind) { const u = currUser(); return "ECA_" + kind + "_" + String((u && u.id) || "") + "_" + todayISO(); }
function funGot(kind) { try { return localStorage.getItem(funDayKey(kind)) === "1"; } catch (_) { return false; } }
function funMark(kind) { try { localStorage.setItem(funDayKey(kind), "1"); } catch (_) {} }
{
  const _pl = puzLoad;
  puzLoad = async function () {
    const before = arena.puz.game, out = await _pl.apply(this, arguments), Z = arena.puz, u = currUser();
    if (Z.game === before) return out;                   // اللغز ما اتغيرش (كان لسه بيتحمّل)
    Z.golden =Z.lesson && !Z.review && Z.game && u && u.role === "student" && !funGot("GOLD") && Math.random() < (Z.forceGold ? 1 : FUN_GOLD_CHANCE) ? Z.game : null;
    Z.forceGold = false;
    if (Z.golden) arenaRefresh();
    return out;
  };
  const _pc = puzCount;
  puzCount = function (solved) {
    const Z = arena.puz, u = currUser(), first = !Z.counted && !!Z.lesson && !Z.review && !!u && u.role === "student";
    const gold = first && Z.golden && Z.golden === Z.game;
    const out = _pc.apply(this, arguments);
    if (!first) return out;
    if (gold) {
      Z.golden = null;
      if (solved) funPay("golden", "GOLD", "✨", FUN("لغز ذهبي!", "Golden puzzle!"), FUN("حليته من أول مرة: +3 ⭐", "Solved first try: +3 ⭐"));
      else toast(FUN("اللغز الذهبي راح المرة دي. هيجيلك غيره ✨", "The golden puzzle got away this time. Another one will come ✨"));
    }
    if (solved && Number(Z.prRun) === 5 && !funGot("COMBO")) funPay("combo", "COMBO", "🎁", FUN("صندوق السلسلة!", "Streak chest!"), FUN("5 ألغاز صح ورا بعض: +3 ⭐", "5 puzzles in a row: +3 ⭐"));
    return out;
  };
  const _az = arenaPuzHTML;
  arenaPuzHTML = function () {
    const Z = arena.puz, html = _az.apply(this, arguments);
    if (!(Z.golden && Z.golden === Z.game && Z.status === "play")) return html;
    return `<div class="eca-golden rounded-2xl px-4 py-3 mb-3 flex items-center gap-3" role="status"><span class="text-2xl" aria-hidden="true">✨</span>
      <span class="text-sm font-bold">${esc(FUN("لغز ذهبي! حلّه من أول مرة من غير تلميح وخد ⭐ 3", "Golden puzzle! Solve it first try with no hint for ⭐ 3"))}</span></div>${html}`;
  };
}
async function funPay(source, mark, icon, title, text) {
  try {
    await window.__ecaAttemptP;            // استنى حفظ محاولة اللغز الأول (الاتنين بيكتبوا في ملف الطالب)
    const r = await window.fbEconomy({ op: "earn", source, key: todayISO(), day: todayISO() });
    if (r && (r.ok || r.code === "offline-queued")) funMark(mark);
    if (r && r.ok && !r.duplicate) {
      if (window.ecaMilestone) ecaMilestone({ icon, big: true, title, text });
      if (window.ecaFireworks) ecaFireworks(2);
    }
  } catch (e) { console.warn("Reward failed:", source, e && e.code); }
}
window.funPay = funPay;
