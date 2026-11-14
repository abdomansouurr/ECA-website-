// ECA — lessonpuz.js: ألغاز الدروس + مهمة الدرس اليومية
// بنك ألغاز Lichess (puzzles-themes.js) مقسّم على الأفكار التكتيكية، وكل درس في المنهج ليه أفكاره
// (من تركيز واجب الدرس). الألغاز بتتحل في «ألغاز على الرقعة» نفسها، فبتتسجل محاولاتها وعدّاداتها عادي.
// مهمة اليوم: حل 10 ألغاز من درس محدد بدل «حل لغز اليوم».

const ECA_LESSON_THEMES = {
  "1-0": ["mateIn1"],
  "1-1": ["fork","hangingPiece"],
  "1-2": ["hangingPiece","capturingDefender","fork"],
  "1-3": ["advancedPawn","promotion","enPassant","pawnEndgame"],
  "1-4": ["defensiveMove","trappedPiece"],
  "1-5": ["mateIn1","doubleCheck","discoveredCheck"],
  "1-6": ["mateIn1"],
  "1-7": ["mateIn2"],
  "1-8": ["castling"],
  "1-9": ["sacrifice","capturingDefender"],
  "1-10": ["fork"],
  "1-11": ["zugzwang"],
  "2-0": ["fork","hangingPiece","trappedPiece"],
  "2-1": ["fork"],
  "2-2": ["fork"],
  "2-3": ["pin"],
  "2-4": ["capturingDefender","deflection"],
  "2-5": ["hangingPiece","fork","mateIn1"],
  "2-6": ["mateIn2"],
  "2-7": ["fork"],
  "2-8": ["mateIn1","mateIn2","backRankMate"],
  "2-9": ["fork"],
  "2-10": ["discoveredAttack","doubleCheck"],
  "2-11": ["discoveredAttack"],
  "2-12": ["defensiveMove","mateIn1","mateIn2"],
  "3-0": ["discoveredCheck","doubleCheck"],
  "3-1": ["pin"],
  "3-2": ["backRankMate","mateIn2"],
  "3-3": ["pawnEndgame","advancedPawn","promotion"],
  "3-4": ["capturingDefender","deflection"],
  "3-5": ["defensiveMove"],
  "3-6": ["zugzwang"],
  "3-7": ["xRayAttack","skewer"],
  "3-8": ["defensiveMove","pin"],
  "3-9": ["trappedPiece","zugzwang"],
  "3-10": ["pawnEndgame","zugzwang"],
  "3-11": ["pin","capturingDefender"],
  "4-0": ["interference"],
  "4-1": ["attraction"],
  "4-2": ["interference"],
  "4-3": ["pin","skewer"],
  "4-4": ["advancedPawn","promotion","pawnEndgame"],
  "4-5": ["defensiveMove","advancedPawn","pawnEndgame"],
  "4-6": ["capturingDefender","deflection","fork"],
  "4-7": ["attraction","deflection"],
  "4-8": ["hangingPiece","pawnEndgame"],
  "4-9": ["fork","pin","skewer","sacrifice","discoveredAttack","deflection","clearance"],
  "4-10": ["hangingPiece"],
  "4-11": ["fork","skewer"],
  "4-12": ["kingsideAttack","exposedKing"],
  "4-13": ["rookEndgame"],
  "4-14": ["pawnEndgame","zugzwang","advancedPawn"],
  "4-15": ["fork","pin","skewer","sacrifice","discoveredAttack","deflection","clearance","attraction"],
  "4-16": ["clearance"],
  "4-17": ["queenEndgame","promotion","advancedPawn"],
  "5-1": ["mateIn2","mateIn3"],
  "5-2": ["pawnEndgame","advancedPawn","promotion"],
  "5-3": ["pawnEndgame","zugzwang"],
  "5-4": ["pawnEndgame","advancedPawn","promotion"],
  "5-5": ["pawnEndgame","promotion","advancedPawn"],
  "5-6": ["rookEndgame"],
  "5-7": ["discoveredAttack"],
  "5-8": ["pin","quietMove"],
  "5-9": ["attackingF2F7","castling"],
  "5-10": ["rookEndgame"],
  "5-11": ["quietMove","zugzwang","trappedPiece"],
  "5-12": ["deflection","attraction"],
  "5-13": ["defensiveMove"],
  "5-14": ["rookEndgame"],
  "5-15": ["kingsideAttack","exposedKing"],
  "5-16": ["clearance","xRayAttack","discoveredAttack"],
  "5-17": ["zugzwang"],
  "5-18": ["bishopEndgame","pawnEndgame"]
};
const LP_GOAL = 10, LP_STARS = 5;
const LPL = (ar, en) => lang === "en" ? en : ar;
const LP_NAMES = {
  fork: ["الشوكة (الهجوم المزدوج)", "Fork (double attack)"], pin: ["التثبيت", "Pin"], skewer: ["السيخ", "Skewer"],
  discoveredAttack: ["الهجوم المكشوف", "Discovered attack"], discoveredCheck: ["الكش المكشوف", "Discovered check"], doubleCheck: ["الكش المزدوج", "Double check"],
  hangingPiece: ["قطعة سايبة", "Hanging piece"], capturingDefender: ["أكل المدافع", "Capture the defender"], trappedPiece: ["قطعة محبوسة", "Trapped piece"],
  deflection: ["الإبعاد", "Deflection"], attraction: ["الجذب", "Attraction"], clearance: ["التفريغ", "Clearance"], interference: ["القطع", "Interference"],
  xRayAttack: ["هجوم الأشعة", "X-ray attack"], sacrifice: ["التضحية", "Sacrifice"], quietMove: ["النقلة الهادية", "Quiet move"], defensiveMove: ["نقلة دفاعية", "Defensive move"],
  zugzwang: ["الزوجزفانج", "Zugzwang"], mateIn1: ["مات في نقلة", "Mate in 1"], mateIn2: ["مات في نقلتين", "Mate in 2"], mateIn3: ["مات في 3 نقلات", "Mate in 3"],
  backRankMate: ["مات الصف الأخير", "Back-rank mate"], smotheredMate: ["المات المخنوق", "Smothered mate"], kingsideAttack: ["هجوم على الملك", "Kingside attack"],
  exposedKing: ["الملك المكشوف", "Exposed king"], attackingF2F7: ["الهجوم على f2/f7", "Attacking f2/f7"], promotion: ["الترقية", "Promotion"],
  advancedPawn: ["البيدق المتقدم", "Advanced pawn"], enPassant: ["الأخذ في المرور", "En passant"], castling: ["التبييت", "Castling"],
  pawnEndgame: ["نهايات البيادق", "Pawn endgame"], rookEndgame: ["نهايات الطوابي", "Rook endgame"], bishopEndgame: ["نهايات الأفيال", "Bishop endgame"],
  knightEndgame: ["نهايات الأحصنة", "Knight endgame"], queenEndgame: ["نهايات الوزير", "Queen endgame"]
};
const LP_LEVELS = ["400–799", "800–1099", "1100–1399", "1400–1699", "1700–1999", "2000+"];
function lpThemeName(t) { return LP_NAMES[t] ? LP_NAMES[t][lang === "en" ? 1 : 0] : t; }
function lpTitle(key) {
  const [s, i] = String(key).split("-").map(Number), st = STEPS.find(x => x.step === s), les = st && st.lessons[i];
  return les ? String(les.t).replace(/\s*\(\s*step\s*\d\s*\)\s*$/i, "").replace(/^\d+-/, "").trim() : String(key);
}
// أفكار الدرس، أو فكرة حدث الأسبوع لو المفتاح "ev" (fun.js)
function lpThemesOf(key) { return key === "ev" ? (window.funEventTheme ? [funEventTheme()] : []) : ECA_LESSON_THEMES[key] || null; }
function lpStepOf(key) { return Number(String(key).split("-")[0]) || 1; }

// ================= المستوى الذكي: تقييم ألغاز لكل طالب بيعلى ويوطى مع كل لغز (زي Elo) =================
// بيتحفظ على الجهاز. الألغاز بتيجي قريبة من التقييم ده: بعد غلطتين ورا بعض أسهل شوية، وبعد 3 حلول صح ورا بعض أصعب شوية.
const PR_START = [600, 900, 1200, 1500, 1800, 2000];
function ecaPrKey(u) { return "ECA_PR_" + String((u && u.id) || ""); }
function ecaPrGet(u) {
  let o = null;
  try { o = JSON.parse(localStorage.getItem(ecaPrKey(u)) || "null"); } catch (_) {}
  if (!o || !(Number(o.r) > 0)) o = { r: PR_START[Math.min(6, Math.max(1, Number(u && u.level) || 1)) - 1], n: 0 };
  return { r: Number(o.r), n: Number(o.n) || 0 };
}
function ecaPrUpdate(u, rating, solved) {
  const o = ecaPrGet(u), rp = Number(rating) || o.r, expect = 1 / (1 + Math.pow(10, (rp - o.r) / 400)), k = o.n < 15 ? 60 : 32;
  o.r = Math.round(Math.min(2800, Math.max(400, o.r + k * ((solved ? 1 : 0) - expect)))); o.n++;
  try { localStorage.setItem(ecaPrKey(u), JSON.stringify(o)); } catch (_) {}
  return o.r;
}
function ecaPrTarget(u, Z) { const run = Number(Z && Z.prRun) || 0; return ecaPrGet(u).r + (run <= -2 ? -200 : run >= 3 ? 100 : 0); }
function ecaPrPick(pool, Z) {
  const t = ecaPrTarget(currUser(), Z), rt = x => Number(String(x[0]).split("|")[3]) || 0;
  const near = pool.slice().sort((a, b) => Math.abs(rt(a) - t) - Math.abs(rt(b) - t)).slice(0, 12);
  return near[Math.floor(Math.random() * near.length)];
}
window.ecaPrGet = ecaPrGet;
window.ecaPrTarget = ecaPrTarget;
window.ecaPrUpdate = ecaPrUpdate;

let lpBankP = null;
function loadThemeBank() {
  if (window.ECA_THEME_BANK) return Promise.resolve(window.ECA_THEME_BANK);
  if (lpBankP) return lpBankP;
  lpBankP = loadModule("themes").then(() => {
    if (!window.ECA_THEME_BANK) throw new Error("Theme bank is empty");
    return window.ECA_THEME_BANK;
  }).catch(e => { lpBankP = null; throw e; });
  return lpBankP;
}
window.loadThemeBank = loadThemeBank;

// ================= درس اليوم: من الدروس اللي الطالب حضرها، وثابت طول اليوم =================
function lpHash(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; } return h; }
function lpDailyLesson(u) {
  if (!u) return "";
  const level = Math.min(6, Number(u.level) || 1), att = u.att || {}, keys = Object.keys(ECA_LESSON_THEMES);
  let pool = keys.filter(k => lpStepOf(k) <= level && att[k] === true);
  if (!pool.length) pool = keys.filter(k => lpStepOf(k) === level);
  if (!pool.length) pool = keys.filter(k => lpStepOf(k) <= level);
  if (!pool.length) pool = keys;
  return pool[lpHash(u.id + "|" + todayISO()) % pool.length];
}
window.lpDailyLesson = lpDailyLesson;
function lpDailyCount(u) {
  const ql = ((u && u.arena) || {}).ql;
  return ql && ql.d === todayISO() && ql.k === lpDailyLesson(u) ? Number(ql.n) || 0 : 0;
}

// ================= المهمة اليومية بدل «حل لغز اليوم» =================
{
  const quest = {
    key: "lesson", goal: LP_GOAL, stars: LP_STARS,
    get ar() { return `حل ${LP_GOAL} ألغاز من درس «${esc(lpTitle(lpDailyLesson(currUser())))}»`; },
    get en() { return `Solve ${LP_GOAL} puzzles from the lesson «${esc(lpTitle(lpDailyLesson(currUser())))}»`; }
  };
  const i = ECA_QUESTS.findIndex(q => q.key === "daily");
  if (i >= 0) ECA_QUESTS.splice(i, 1, quest); else ECA_QUESTS.unshift(quest);
  const _qp = ecaQuestProgress;
  ecaQuestProgress = function (u, key) { return key === "lesson" ? lpDailyCount(u) : _qp(u, key); };
  // العدّاد بيزيد جوه نفس كتابة محاولة اللغز (اللي القواعد بتربطها بوثيقة محاولة)
  const _qb = window.ecaQuestBump;
  window.ecaQuestBump = function (a, kind) {
    _qb(a, kind);
    const Z = arena.puz, u = currUser();
    if (kind !== "puzzles" || !Z.lesson || Z.review || !u) return;
    const day = todayISO(), k = lpDailyLesson(u);
    if (Z.lesson !== k) return;
    if (!a.ql || a.ql.d !== day || a.ql.k !== k) a.ql = { d: day, k, n: 0 };
    a.ql.n = (Number(a.ql.n) || 0) + 1;
    if (a.ql.n === LP_GOAL) setTimeout(() => toast(LPL(`🎯 خلّصت مهمة الدرس! استلم ⭐ ${LP_STARS} من أهداف اليوم.`, `🎯 Lesson mission done! Claim ⭐ ${LP_STARS} from today's quests.`)), 900);
  };
  const _qc = ecaQuestsCardHTML;
  ecaQuestsCardHTML = function (u) {
    const html = _qc(u);
    if (lpDailyCount(u) >= LP_GOAL) return html;
    const btn = `<button type="button" onclick="lpStart(lpDailyLesson(currUser()))" class="tap w-full rounded-xl text-xs font-bold bg-zinc-900 text-yellow-300 border border-yellow-500/30">📚 ${LPL("ابدأ ألغاز درس النهاردة", "Start today's lesson puzzles")}</button>`;
    const end = html.lastIndexOf("</section>");
    return end < 0 ? html : html.slice(0, end) + btn + html.slice(end);
  };
}

// ================= تشغيل ألغاز الدرس في «ألغاز على الرقعة» =================
function lpStart(key) {
  if (!(lpThemesOf(key) || []).length) return;
  const Z = arena.puz, u = currUser();
  Z.lesson = key;
  Z.lessonLv = Z.lessonLv || Math.min(6, Math.max(1, Number(u && u.level) || 1));
  if (Z.lessonAuto === undefined) Z.lessonAuto = true;
  Z.prRun = 0;
  Z.lessonSeen = new Set();
  Z.review = false;
  arena.sub = "puzzles";
  if (tab !== "arena") switchTab("arena"); else render();
  let tries = 0;
  const go = () => { if (typeof ChessCls !== "undefined" && ChessCls) puzLoad(); else if (++tries < 60) setTimeout(go, 200); };
  go();
}
window.lpStart = lpStart;
function lpAuto() { const Z = arena.puz; Z.lessonAuto = true; Z.prRun = 0; Z.lessonSeen = new Set(); puzLoad(); }
window.lpAuto = lpAuto;
function lpLevel(n) { const Z = arena.puz; Z.lessonAuto = false; Z.lessonLv = Math.min(6, Math.max(1, Number(n) || 1)); Z.lessonSeen = new Set(); puzLoad(); }
window.lpLevel = lpLevel;
function lpExit() { const Z = arena.puz; Z.lesson = ""; puzLoad(); }
window.lpExit = lpExit;
{
  const _pl = puzLoad;
  puzLoad = async function () {
    const Z = arena.puz;
    if (!Z.lesson || Z.review) return _pl.apply(this, arguments);
    if (!ChessCls) return;
    // آخر طلب هو اللي يكسب: لغز Lichess بطيء ما يعطّلش درس اتفتح بعده، ولما يوصل متأخر بيتجاهل
    const tok = Z.loadTok = (Z.loadTok || 0) + 1;
    clearTimeout(Z.nextTimer); Z.nextTimer = null;
    Z.status = "loading"; Z.sel = null; Z.hint = null; Z.flash = null; arenaRefresh();
    try {
      const bank = await loadThemeBank(), seen = new Set(), pool = [];
      const at = lv => { const out = []; (lpThemesOf(Z.lesson) || []).forEach(t => (((bank.themes || {})[t] || [])[lv - 1] || []).forEach(row => out.push([row, t]))); return out; };
      // بعض الأفكار (زي التبييت) ألغازها قليلة في المستويات السهلة: بنروح لأقرب مستوى فيه ألغاز
      const auto = Z.lessonAuto !== false && !!currUser();
      let lv = Z.lessonLv || 1;
      if (!auto) {
        for (const d of [0, 1, -1, 2, -2, 3, -3, 4, -4, 5, -5]) { const v = lv + d; if (v >= 1 && v <= 6 && at(v).length >= 3) { lv = v; break; } }
        Z.lessonLv = lv;
      }
      (auto ? [1, 2, 3, 4, 5, 6] : [lv]).flatMap(at).forEach(([row, t]) => { const id = row.split("|")[0]; if (!seen.has(id)) { seen.add(id); pool.push([row, t]); } });
      if (!pool.length) throw new Error("empty");
      let fresh = pool.filter(([row]) => !Z.lessonSeen.has(row.split("|")[0]));
      if (!fresh.length) { Z.lessonSeen = new Set(); fresh = pool; }
      const [row, theme] = auto ? ecaPrPick(fresh, Z) : fresh[Math.floor(Math.random() * fresh.length)];
      const [id, fen, moves, rating] = row.split("|"), mv = moves.split(" ");
      const g = new ChessCls(fen), r0 = uciMove(g, mv[0]);
      if (Z.loadTok !== tok) return;
      Z.lessonSeen.add(id);
      Object.assign(Z, { game: g, sol: mv.slice(1), idx: 0, color: g.turn(), flip: g.turn() === "b", last: [r0.from, r0.to], counted: false, status: "play",
        info: { id: id.replace(/[^A-Za-z0-9]/g, ""), rating: Number(rating) || 0, themes: [theme] } });
    } catch (e) { if (Z.loadTok === tok) { console.warn("Lesson puzzles failed:", e && e.message); Z.status = "error"; } }
    if (Z.loadTok === tok) arenaRefresh();
  };
  // التاب العادي بيرجّع الألغاز العادية — ماعدا الرجوع من رقعة التحليل (keepLesson): اللغز يكمّل من نفس المكان
  const _sub = arenaSub;
  arenaSub = function (k) { if (k === "puzzles" && arena.puz.lesson && !arena.puz.keepLesson) { arena.puz.lesson = ""; arena.puz.game = null; arena.puz.status = "idle"; } return _sub.apply(this, arguments); };
  const _az = arenaPuzHTML;
  arenaPuzHTML = function () {
    const Z = arena.puz, u = currUser();
    if (!Z.lesson || Z.review) return _az.apply(this, arguments);
    const daily = u && u.role === "student" && Z.lesson === lpDailyLesson(u), n = daily ? Math.min(LP_GOAL, lpDailyCount(u)) : 0;
    const banner = `<div class="gold-card rounded-2xl p-4 space-y-3 mb-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="min-w-0"><h3 class="font-bold text-yellow-300 truncate">📚 ${esc(lpTitle(Z.lesson))} ${Z.lesson === "ev" ? "" : `<span class="text-xs text-gray-400">• Step ${lpStepOf(Z.lesson)}</span>`}</h3>
          <p class="text-xs text-gray-300">${(lpThemesOf(Z.lesson) || []).map(t => esc(lpThemeName(t))).join(" • ")}</p></div>
        <button type="button" onclick="lpExit()" class="tap rounded-lg px-3 text-xs font-bold bg-zinc-800 text-white border border-yellow-500/30">${LPL("خروج من الدرس", "Leave the lesson")}</button>
      </div>
      ${daily ? `<div><div class="flex justify-between text-xs text-gray-300"><span>🎯 ${LPL("مهمة النهاردة", "Today's mission")}</span><span dir="ltr">${n}/${LP_GOAL}</span></div>
        <div class="eca-quest-track" role="progressbar" aria-valuemin="0" aria-valuemax="${LP_GOAL}" aria-valuenow="${n}" aria-label="${LPL("مهمة النهاردة", "Today's mission")}"><div style="width:${Math.round(n / LP_GOAL * 100)}%"></div></div></div>` : ""}
      <div class="flex flex-wrap items-center gap-1.5" role="group" aria-label="${LPL("المستوى", "Level")}"><span class="text-xs text-gray-400">${LPL("المستوى", "Level")}:</span>
        <button type="button" onclick="lpAuto()" aria-pressed="${Z.lessonAuto !== false}" title="${LPL("الألغاز بتيجي على قد مستواك", "Puzzles match your level")}" class="tap min-w-[44px] rounded-lg px-2 text-xs font-bold ${Z.lessonAuto !== false ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/20"}">🤖 ${LPL("تلقائي", "Auto")}</button>
        ${LP_LEVELS.map((r, i) => `<button type="button" onclick="lpLevel(${i + 1})" aria-pressed="${Z.lessonAuto === false && Z.lessonLv === i + 1}" title="${r}" class="tap min-w-[44px] rounded-lg px-2 text-xs font-bold ${Z.lessonAuto === false && Z.lessonLv === i + 1 ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/20"}">${i + 1}</button>`).join("")}
        <span class="text-xs text-gray-400">${Z.lessonAuto !== false && u ? LPL("مستواك", "Your level") + ` <b dir="ltr" class="text-yellow-300">${ecaPrGet(u).r}</b>` : `<span dir="ltr">(${LP_LEVELS[(Z.lessonLv || 1) - 1]})</span>`}</span></div>
    </div>`;
    return banner + _az.apply(this, arguments);
  };
}

// ================= تاب «ألغاز الدروس» =================
function arenaLessonsHTML() {
  const u = currUser(), en = lang === "en";
  if (!u) return "";
  const student = u.role === "student", level = Math.min(6, Number(u.level) || 1), today = student ? lpDailyLesson(u) : "";
  const keys = Object.keys(ECA_LESSON_THEMES).filter(k => !student || lpStepOf(k) <= level);
  const steps = [...new Set(keys.map(lpStepOf))];
  const lessonRow = k => `<li class="flex items-center gap-3 py-2 border-b border-yellow-500/10">
      <div class="min-w-0 flex-1"><b class="block text-sm text-white truncate">${k === today ? "🎯 " : ""}${esc(lpTitle(k))}</b>
        <span class="block text-xs text-gray-400 truncate">${ECA_LESSON_THEMES[k].map(t => esc(lpThemeName(t))).join(" • ")}</span></div>
      <button type="button" onclick="lpStart('${esc(k)}')" class="tap shrink-0 rounded-lg px-3 text-xs font-bold ${k === today ? "gold-btn" : "bg-zinc-800 text-white border border-yellow-500/30"}">${LPL("حل", "Solve")}</button></li>`;
  const mission = student ? `<div class="rounded-xl bg-black/30 border border-yellow-500/30 p-3 flex items-center gap-3">
      <div class="min-w-0 flex-1"><b class="block text-sm text-yellow-300">🎯 ${LPL("مهمة النهاردة", "Today's mission")}</b>
        <span class="block text-xs text-gray-300">${LPL(`حل ${LP_GOAL} ألغاز من «${esc(lpTitle(today))}» واكسب ⭐ ${LP_STARS} و ${LP_STARS * 20} خبرة.`, `Solve ${LP_GOAL} puzzles from «${esc(lpTitle(today))}» to earn ⭐ ${LP_STARS} and ${LP_STARS * 20} XP.`)}</span>
        <span class="block text-xs text-gray-400" dir="ltr">${Math.min(LP_GOAL, lpDailyCount(u))}/${LP_GOAL}</span></div>
      <button type="button" onclick="lpStart('${esc(today)}')" class="tap shrink-0 rounded-lg px-3 text-xs font-bold gold-btn">${LPL("ابدأ", "Start")}</button></div>` : "";
  return `<div class="gold-card rounded-2xl p-4 sm:p-5 space-y-4 max-w-2xl w-full mx-auto">
    <div><h3 class="font-display font-bold text-lg text-yellow-300">📚 ${LPL("ألغاز الدروس", "Lesson puzzles")}</h3>
      <p class="text-xs text-gray-400">${LPL("ألغاز حقيقية من Lichess مقسّمة على دروس المنهج، وكل درس فيه 6 مستويات من الأسهل للأصعب.", "Real Lichess puzzles grouped by curriculum lesson, each with 6 levels from easiest to hardest.")}</p></div>
    ${mission}
    ${steps.map(s => `<details class="rounded-xl bg-black/20 border border-yellow-500/20 p-3" ${s === level || !student && s === 1 ? "open" : ""}>
      <summary class="tap flex items-center justify-between cursor-pointer"><b class="text-sm text-white">Step ${s}</b><span class="text-xs text-gray-400">${keys.filter(k => lpStepOf(k) === s).length} ${LPL("درس", "lessons")}</span></summary>
      <ul class="mt-2">${keys.filter(k => lpStepOf(k) === s).map(lessonRow).join("")}</ul></details>`).join("")}
  </div>`;
}
window.arenaLessonsHTML = arenaLessonsHTML;

// كل لغز درس اتحسب (صح أو غلط أو تلميح) بيحرّك المستوى، ومعاه رسالة صغيرة لما الصعوبة تتغير
{
  const _pc = puzCount;
  puzCount = function (solved) {
    const Z = arena.puz, u = currUser(), track = !Z.counted && !!Z.lesson && !Z.review && !!u && u.role === "student" && !!Z.info;
    const out = _pc.apply(this, arguments);
    if (track) {
      ecaPrUpdate(u, Z.info.rating, solved);
      const was = Number(Z.prRun) || 0;
      Z.prRun = solved ? (was > 0 ? was + 1 : 1) : (was < 0 ? was - 1 : -1);
      if (Z.lessonAuto !== false && Z.prRun === -2) toast(LPL("ولا يهمك 💪 اللغز الجاي أسهل شوية من نفس الفكرة.", "No worries 💪 the next one is a bit easier, same idea."));
      else if (Z.lessonAuto !== false && Z.prRun === 3) toast(LPL("🔥 3 ورا بعض! اللغز الجاي أصعب شوية.", "🔥 3 in a row! The next one is a little harder."));
    }
    return out;
  };
}
