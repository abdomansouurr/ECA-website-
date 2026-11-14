// ECA — coach.js: الكوتش جنب الرقعة
// 1) الرد العقابي: نقلة غلط في (مغامرة الدروس، دوجو الانتقام، واجب الزعيم) → الخصم بيلعب الرد اللي بيعاقبها
//    بسهم أحمر ودايرة خطر وسبب بالعربي، وبعد 1.65 ثانية (أو «جرب تاني الآن») الرقعة بترجع للوضع قبل الغلطة بالظبط.
// 2) المساعد الذكي بمنهج الخطوات: سؤال على الفكرة ← القطعة ← السهم. كل مرحلة بتقلل جايزة اللغز (×0.9 ← ×0.75 ← ×0.5).
// الحل بيتقري من الذاكرة بس (S.sol / تحليل المحرك)، ومفيش نقلة من الحل بتتكتب في الصفحة كنص أو data-attribute.
// الأصوات من نفس AudioContext بتاع الموقع (sfxNotes في gamify.js).

const CCL = (ar, en) => lang === "en" ? en : ar;
const COACH_VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const COACH_MULT = [1, 0.9, 0.75, 0.5];
const COACH_PAUSE = 250, COACH_SHOW = 2600, COACH_FALLBACK = 1100;
const COACH_TAGS = {
  A: ["⚠️ الخصم عنده رد محضّر على النقلة دي!", "⚠️ Your opponent has a prepared answer to this move!"],
  B: ["⚠️ النقلة دي بتسمح بكش مات في نقلة واحدة!", "⚠️ This move allows mate in one!"],
  C: ["⚠️ تركت قطعة غير محمية للخصم!", "⚠️ You left a piece undefended!"],
  D: ["⚠️ الخصم عنده كش قوي مع تهديد مزدوج!", "⚠️ Your opponent has a strong check with a double threat!"],
  E: ["⚠️ تجاهلت تهديد الخصم الأساسي في الموقف!", "⚠️ You ignored your opponent's main threat!"],
  F: ["⚠️ فكر تاني! في نقلة أقوى بكتير في الموقف ده", "⚠️ Think again! There's a much stronger move here"]
};
const COACH_STEP1 = {
  fork: ["💡 خطوة 1: دور على مربع يقدر يهاجم قطعتين للخصم في نفس الوقت!", "💡 Step 1: Look for a square that attacks two enemy pieces at once!"],
  pin: ["💡 خطوة 1: في قطعة للخصم وراها الملك أو قطعة أغلى منها على نفس الخط.. فين هي؟", "💡 Step 1: An enemy piece has its king or a bigger piece behind it on the same line. Where is it?"],
  skewer: ["💡 خطوة 1: هاجم القطعة الكبيرة عشان لما تتحرك تاكل القطعة اللي وراها!", "💡 Step 1: Attack the big piece so that when it moves you take the one behind it!"],
  discovered: ["💡 خطوة 1: لو حركت قطعة من قطعك، في قطعة تانية وراها هتفتح خط هجوم خطير!", "💡 Step 1: Move one of your pieces and another one behind it opens a dangerous line!"],
  doubleCheck: ["💡 خطوة 1: ابحث عن نقلة تكش الملك بقطعتين في نفس اللحظة!", "💡 Step 1: Find a move that checks the king with two pieces at once!"],
  deflection: ["💡 خطوة 1: في قطعة عند الخصم بتدافع عن مربع مهم.. إزاي نبعدها عن مكانها؟", "💡 Step 1: An enemy piece guards an important square. How do we lure it away?"],
  mate: ["💡 خطوة 1: شوف المربعات اللي الملك يقدر يهرب ليها، وإزاي نقفلها بالكامل!", "💡 Step 1: Find the squares the king can escape to, and how to close them all!"],
  default: ["💡 خطوة 1: بص على القطع غير المحمية وتهديدات الكش والأكل أولاً!", "💡 Step 1: First look at undefended pieces, checks and captures!"]
};
const COACH_MOTIF = { fork: "fork", pin: "pin", skewer: "skewer", discoveredAttack: "discovered", discoveredCheck: "discovered", doubleCheck: "doubleCheck",
  deflection: "deflection", mateIn1: "mate", mateIn2: "mate", mate: "mate", backRankMate: "mate", smotheredMate: "mate" };

// ================= الوضع الحالي ومين مسموحله =================
function coachMode() {
  if (typeof tab === "undefined" || tab !== "arena" || typeof arena === "undefined") return "";
  const s = arena.sub;
  if (s === "puzzles") return arena.puz.review ? "dojo" : arena.puz.lesson ? "lesson" : "practice";
  if (s === "boss") return "boss";
  if (s === "analysis") return "analysis";
  return "";   // تحدي 60 ثانية والمبارزة والبطولة وتحدي الكوتش والباقي: من غير تلميحات ولا رد عقابي
}
const coachHintOk = m => ["lesson", "dojo", "boss", "practice", "analysis"].includes(m);
const coachRefuteOk = m => ["lesson", "dojo", "boss"].includes(m);
function coachState(m) { return m === "boss" ? arena.boss : m === "analysis" ? arena.ana : arena.puz; }

// ================= محرك الرد العقابي (نقلتين بالكتير، من غير Stockfish) =================
function coachUci(m) { return m.from + m.to + (m.promotion || ""); }
function coachTry(g, u) {
  try { return g.move(u.length > 4 ? { from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] } : { from: u.slice(0, 2), to: u.slice(2, 4) }); } catch (_) { return null; }
}
function coachAtt(g, sq, color) {
  try { return typeof g.attackers === "function" ? g.attackers(sq, color).length : (g.isAttacked(sq, color) ? 1 : 0); } catch (_) { return 0; }
}
// أغلى قطعة (حصان أو أكبر، من غير الملك) مهددة ومش محمية
function coachLoose(g, me, opp) {
  let best = null;
  g.board().forEach(row => row.forEach(p => {
    if (!p || p.color !== me || p.type === "k") return;
    const v = COACH_VAL[p.type];
    if (v >= 3 && coachAtt(g, p.square, opp) && !coachAtt(g, p.square, me) && (!best || v > best.v)) best = { sq: p.square, v };
  }));
  return best;
}
// الترتيب: A رد مكتوب في اللغز ← B مات في نقلة ← C قطعة بقت سايبة بسبب النقلة ← D كش ومعاه تهديد ← E تهديد كان موجود واتساب
function findRefutationMove(preFen, wrong, expected, explicit) {
  if (typeof ChessCls === "undefined" || !ChessCls || !preFen || !wrong) return null;
  const t0 = performance.now();
  let g;
  try { g = new ChessCls(preFen); } catch (_) { return null; }
  const w = coachTry(g, wrong);
  if (!w) return null;
  const me = w.color, opp = me === "w" ? "b" : "w";
  const done = (m, kind, target) => ({ from: m.from, to: m.to, promotion: m.promotion || "", kind, target: target || m.to, ms: performance.now() - t0 });
  if (explicit && explicit[wrong]) { const m = coachTry(g, explicit[wrong]); if (m) { g.undo(); return done(m, "A"); } }
  const moves = g.moves({ verbose: true });
  // chess.js بيعلّم نقلة المات بـ # في الـ SAN، فمش محتاجين نلعب كل نقلة ونشوف (ده كان أبطأ جزء)
  const mate = moves.find(m => m.san.endsWith("#"));
  if (mate) return done(mate, "B");
  const caps = [];
  for (const m of moves) {
    if (!m.captured) continue;
    g.move(m);
    let back = coachAtt(g, m.to, me);
    // الملك بس اللي يقدر ياخد تاني، والمربع محمي: يبقى مفيش أخد تاني
    if (back && typeof g.attackers === "function" && g.attackers(m.to, me).every(s => (g.get(s) || {}).type === "k") && coachAtt(g, m.to, opp)) back = 0;
    g.undo();
    const gain = COACH_VAL[m.captured] - (back ? COACH_VAL[m.piece] : 0);
    if (gain > 0) caps.push({ m, gain });
  }
  caps.sort((a, b) => b.gain - a.gain || COACH_VAL[b.m.captured] - COACH_VAL[a.m.captured] || COACH_VAL[a.m.piece] - COACH_VAL[b.m.piece]);
  const pre = new ChessCls(preFen);
  const wasLoose = sq => { const p = pre.get(sq); return !!p && p.color === me && coachAtt(pre, sq, opp) > 0 && coachAtt(pre, sq, me) === 0; };
  const fresh = caps.find(x => x.m.to === w.to || !wasLoose(x.m.to));
  if (fresh) return done(fresh.m, "C");
  let best = null;
  for (const m of moves) {
    if (!m.san.includes("+")) continue;
    g.move(m); const loose = coachLoose(g, me, opp); g.undo();
    if (loose && (!best || loose.v > best.v)) best = { m, sq: loose.sq, v: loose.v };
  }
  if (best) return done(best.m, "D", best.sq);
  // التهديد كان موجود قبل النقلة (والنقلة الصح كانت بتتعامل معاه)
  if (caps.length) return done(caps[0].m, "E");
  if (expected) {
    const e = new ChessCls(preFen), sol = coachTry(e, expected);
    if (sol && sol.captured) { const m = moves.find(x => x.from === sol.to && x.captured); if (m) return done(m, "E"); }
  }
  return null;
}

// ================= تشغيل الرد العقابي ورجوع الرقعة =================
let coachTimers = [];
function coachClear() { coachTimers.forEach(clearTimeout); coachTimers = []; }
function coachSfx(kind) {
  if (typeof sfxNotes !== "function") return;
  if (kind === "warn") sfxNotes([587, 415], 0.11, 0.24, 0.09);   // نغمتين نازلين: تحذير هادي
  else sfxNotes([988, 1319], 0.06, 0.18, 0.07);                   // تلميح
}
function coachStartRefute(S, mode, pre, r, want, onDone, last0) {
  coachClear();
  const wrong = coachUci(r), themes = (S.info && S.info.themes) || (S.pz && S.pz.themes) || [], explicit = S.refutations || (S.pz && S.pz.refutations);
  S.isRefuting = true; S.coachPanel = null;
  S.refute = { mode, game: S.game, pre, last0, wrong: r.to, wrongUci: wrong, ref: null, diag: null, themes, kind: "F", onDone, shown: false, gain: 0, sol: (S.sol || []).slice(S.idx || 0) };
  coachTimers.push(setTimeout(() => {
    const R = S.refute;
    if (!R || R.game !== S.game) return;
    // البحث بيحصل هنا (بعد ما النقلة اترسمت)، مش جوه حدث الضغط/السحب: النقلة نفسها مالهاش أي تأخير
    const an = window.ChessPositionAnalyzer ? ChessPositionAnalyzer.analyze(pre, wrong, want, themes, explicit) : null;
    if (an && an.diag) { R.diag = an.diag; if (an.refutation) R.ref = { from: an.refutation.from, to: an.refutation.to, promotion: an.refutation.promotion || "", target: an.refutation.to, kind: an.diag.type }; }
    else R.ref = findRefutationMove(pre, wrong, want, explicit);
    R.kind = R.diag ? R.diag.type : R.ref ? R.ref.kind : "F"; R.gain = an && an.refutation ? an.refutation.gain : 0;
    if (R.ref) { const m = coachTry(S.game, coachUci(R.ref)); if (m) S.last = [m.from, m.to]; else { R.ref = null; if (R.diag) R.diag = Object.assign({}, R.diag, { vectors: [] }); } }
    R.shown = true;
    // كش مات أو خسارة قطعة كاملة = خبطة الخطأ الفادح، وغير كده التحذير الهادي
    if (window.ecaGM && R.diag && (R.diag.type === "WALKED_INTO_MATE" || R.gain >= 250)) ecaGM.sound("BLUNDER"); else coachSfx("warn");
    // الشرح بيفضل ظاهر بعد ما الرقعة ترجع، لحد ما الطالب يلعب نقلته الجاية.
    // كارت الجراند ماستر (gmcoach.js): الحكم المبدئي على طول، والمحرك بيكمّل التصنيف والتكملة في الخلفية
    if (window.ecaGM) ecaGM.puzzleWrong(S, R);
    else if (R.diag) S.coachPanel = { game: S.game, idx: S.idx, html: coachBotPanel(R.diag, R.pre, R.themes) };
    if (typeof arenaRefresh === "function") arenaRefresh();
    coachTimers.push(setTimeout(() => coachRestore(S), R.ref || R.diag ? COACH_SHOW : COACH_FALLBACK));
  }, COACH_PAUSE));
}
function coachRestore(S, quiet) {
  coachClear();
  const R = S && S.refute;
  if (!R) return;
  S.refute = null; S.isRefuting = false;
  if (quiet) S.coachPanel = null;
  if (R.game === S.game && S.game) {
    const g = S.game;
    for (let i = 0; i < 3 && g.fen() !== R.pre; i++) if (!g.undo()) break;
    if (g.fen() !== R.pre) { try { g.load(R.pre); } catch (_) {} }
    S.last = R.last0 || null; S.flash = null; S.sel = null;
    if (R.onDone) R.onDone();
  }
  if (!quiet && typeof arenaRefresh === "function") arenaRefresh();
}
function coachSkip() { const m = coachMode(); if (m) coachRestore(coachState(m)); }
// الخروج من اللعبة (اللوبي، تاب تاني): مفيش مؤقت يفضل شغال
function coachCancelAll() { if (typeof arena === "undefined") return; [arena.puz, arena.boss].forEach(S => { if (S && S.refute) coachRestore(S, true); }); }
window.coachSkip = coachSkip;
window.coachCancelAll = coachCancelAll;
window.findRefutationMove = findRefutationMove;
function coachPanelClose() { const m = coachMode(); if (m && coachState(m)) { coachState(m).coachPanel = null; if (typeof arenaRefresh === "function") arenaRefresh(); } }
window.coachPanelClose = coachPanelClose;

// ================= البوت التعليمي (CoachKnowledgeBot): الغلطة بالقطع والمربعات بالعربي =================
const CKB_PIECE = { p: ["البيدق (العسكري)", "pawn"], n: ["الحصان", "knight"], b: ["الفيل", "bishop"], r: ["الرخ (القلعة)", "rook"], q: ["الوزير", "queen"], k: ["الملك", "king"] };
const ckbP = t => { const x = CKB_PIECE[t]; return `<b>${x ? CCL(x[0], "the " + x[1]) : CCL("قطعة", "a piece")}</b>`; };
// المربعات بتفضل LTR جوه الجملة العربي
const ckbS = s => `<bdi dir="ltr" class="eca-sq-tok">${esc(String(s || ""))}</bdi>`;
const CKB_TITLE = {
  WALKED_INTO_MATE: ["⚠️ النقلة دي بتسمح بكش مات!", "⚠️ This move allows checkmate!"],
  MOVED_TO_HANGING_SQUARE: ["⚠️ قطعتك راحت مربع مش محمي!", "⚠️ Your piece went to an unprotected square!"],
  ABANDONED_DEFENSE: ["⚠️ شلت الحماية عن قطعة عندك!", "⚠️ You took away a defender!"],
  OPENED_LINE_OR_BROKEN_PIN: ["⚠️ نقلتك فتحت خط للخصم!", "⚠️ Your move opened a line for the opponent!"],
  ALLOWED_OPPONENT_FORK: ["⚠️ نقلتك سمحت بشوكة!", "⚠️ Your move allowed a fork!"],
  ALLOWED_OPPONENT_PIN_OR_SKEWER: ["⚠️ نقلتك سمحت بربط أو سيخ!", "⚠️ Your move allowed a pin or skewer!"],
  IGNORED_EXISTING_THREAT: ["⚠️ تجاهلت تهديد الخصم!", "⚠️ You ignored your opponent's threat!"],
  MISSED_TACTICAL_WIN: ["⚠️ فكر تاني! في نقلة أقوى بكتير", "⚠️ Think again! There's a much stronger move"]
};
function ckbMotif(themes) {
  for (const t of themes || []) if (typeof LP_NAMES !== "undefined" && LP_NAMES[t]) return LP_NAMES[t][lang === "en" ? 1 : 0];
  return CCL("تكتيكي", "a tactic");
}
function coachBotDiagnosis(d) {
  const P = ckbP, S = ckbS, sp = P(d.studentPiece), op = P(d.opponentPiece);
  switch (d.type) {
    case "WALKED_INTO_MATE": return CCL(`نقلة ${sp} من ${S(d.wrongFrom)} لـ ${S(d.wrongTo)} سابت ملكك في ${S(d.kingSq)} مكشوف، والخصم عنده ${d.mateIn > 1 ? "كش مات في نقلتين" : "كش مات في نقلة واحدة"} بيبدأ بـ ${op} من ${S(d.refFrom)} لـ ${S(d.refTo)}!`,
      `Moving ${sp} from ${S(d.wrongFrom)} to ${S(d.wrongTo)} left your king on ${S(d.kingSq)} exposed: the opponent has mate in ${d.mateIn || 1} starting with ${op} from ${S(d.refFrom)} to ${S(d.refTo)}!`);
    case "MOVED_TO_HANGING_SQUARE": return d.defenders
      ? CCL(`مربع ${S(d.wrongTo)} مراقب بـ ${op} الخصم الموجود في ${S(d.refFrom)}! صحيح ${sp} عليه حماية، لكن ${op} أرخص منه، فالتبادل خسران ليك.`,
        `Square ${S(d.wrongTo)} is watched by the opponent's ${op} on ${S(d.refFrom)}! ${sp} is protected, but ${op} is cheaper, so the trade loses for you.`)
      : CCL(`مربع ${S(d.wrongTo)} مراقب بـ ${op} الخصم الموجود في ${S(d.refFrom)}! كده أنت قدمت ${sp} هدية بدون حماية.`,
        `Square ${S(d.wrongTo)} is watched by the opponent's ${op} on ${S(d.refFrom)}! You gave away ${sp} for free.`);
    case "ABANDONED_DEFENSE": return CCL(`تحريك ${sp} من مربع ${S(d.wrongFrom)} لمربع ${S(d.wrongTo)} رفع الحماية عن ${P(d.targetPiece)} في مربع ${S(d.targetSq)}، وده سمح لـ ${op} الخصم من ${S(d.refFrom)} إنه ياكله مجاناً!`,
      `Moving ${sp} from ${S(d.wrongFrom)} to ${S(d.wrongTo)} took away the protection of ${P(d.targetPiece)} on ${S(d.targetSq)}, so the opponent's ${op} on ${S(d.refFrom)} takes it for free!`);
    case "OPENED_LINE_OR_BROKEN_PIN": return CCL(`تحريك ${sp} من ${S(d.throughSq || d.wrongFrom)} فتح الخط قدام ${op} الخصم في ${S(d.attackerSq || d.refFrom)}، فبقى يوصل لـ ${P(d.targetPiece)} في ${S(d.refTo)}!`,
      `Moving ${sp} off ${S(d.throughSq || d.wrongFrom)} opened the line for the opponent's ${op} on ${S(d.attackerSq || d.refFrom)}, which now reaches ${P(d.targetPiece)} on ${S(d.refTo)}!`);
    case "ALLOWED_OPPONENT_FORK": { const [a, b] = d.forkTargets || [];
      return CCL(`نقلتك سمحت لـ ${op} الخصم ينزل في مربع ${S(d.refTo)} ويعمل <b>شوكة مزدوجة (Fork)</b> بيهاجم فيها ${P(a && a.type)} (${S(a && a.sq)}) و ${P(b && b.type)} (${S(b && b.sq)}) في نفس الوقت!`,
        `Your move let the opponent's ${op} land on ${S(d.refTo)} with a <b>fork</b>, attacking ${P(a && a.type)} (${S(a && a.sq)}) and ${P(b && b.type)} (${S(b && b.sq)}) at once!`); }
    case "ALLOWED_OPPONENT_PIN_OR_SKEWER": return CCL(`نقلتك سمحت لـ ${op} الخصم يروح ${S(d.refTo)}: ${P(d.pinnedPiece)} في ${S(d.pinnedSq)} و${P(d.behindPiece)} في ${S(d.behindSq)} بقوا على نفس الخط قدامه (<b>ربط أو سيخ</b>)!`,
      `Your move let the opponent's ${op} go to ${S(d.refTo)}: ${P(d.pinnedPiece)} on ${S(d.pinnedSq)} and ${P(d.behindPiece)} on ${S(d.behindSq)} are on the same line in front of it (<b>pin or skewer</b>)!`);
    case "IGNORED_EXISTING_THREAT": return CCL(`انتبه لتهديد الخصم! الخصم كان بيهدد ${P(d.threatPiece)} في ${S(d.threatSq || d.refTo)} بنقلة ${op} إلى ${S(d.refTo)}، ونقلتك مدافعتش عن التهديد ده.`,
      `Watch your opponent's threat! They were threatening ${P(d.threatPiece)} on ${S(d.threatSq || d.refTo)} with ${op} to ${S(d.refTo)}, and your move didn't deal with it.`);
    default: return CCL(`نقلتك آمنة ومش بتخسر قطعة، لكنها بطيئة وبتفوت عليك فرصة حسم الموقف بتكتيك <b>${esc(ckbMotif(d.themes))}</b>!`,
      `Your move is safe and loses nothing, but it's slow and misses the winning <b>${esc(ckbMotif(d.themes))}</b>!`);
  }
}
// تفكير الكوتش: من قراءة الموقف قبل النقلة (قطع الخصم السايبة، قطع على نفس الخط، مربعات هروب الملك، الكشوش المتاحة)
function coachBotThinking(preFen) {
  const f = window.ChessPositionAnalyzer ? ChessPositionAnalyzer.features(preFen) : null, bits = [];
  if (f && f.loose.length) bits.push(CCL("قطع الخصم اللي مش محمية: ", "Undefended enemy pieces: ") + f.loose.slice(0, 2).map(x => `${ckbP(x.type)} ${CCL("في", "on")} ${ckbS(x.sq)}`).join(CCL(" و", " and ")));
  if (f && f.aligned) bits.push(`${ckbP(f.aligned.a.type)} ${CCL("في", "on")} ${ckbS(f.aligned.a.sq)} ${CCL("و", "and")} ${ckbP(f.aligned.b.type)} ${CCL("في", "on")} ${ckbS(f.aligned.b.sq)} ${CCL("على نفس الخط", "on the same line")}`);
  if (f && f.escapes <= 1) bits.push(CCL(`ملك الخصم في ${ckbS(f.kingSq)} ${f.escapes ? "عنده مربع هروب واحد بس" : "مالوش ولا مربع هروب"}`, `the enemy king on ${ckbS(f.kingSq)} has ${f.escapes ? "only one escape square" : "no escape square"}`));
  if (f && f.checks) bits.push(CCL(`عندك ${f.checks} ${f.checks === 1 ? "كش متاح" : "كشوش متاحة"}`, `you have ${f.checks} check${f.checks === 1 ? "" : "s"} available`));
  return bits.length ? CCL("قبل نقلتك كان في الموقف: ", "Before your move the position had: ") + bits.join(CCL("، ", "; ")) + CCL(". دي الحاجات اللي المفروض تبدأ بيها.", ". That's where to start looking.")
    : CCL("اسأل نفسك قبل كل نقلة: إيه اللي اتغيّر بعد نقلة الخصم؟ إيه المهدد عندي؟ وإيه أقوى نقلة إجبارية عندي؟", "Before every move ask: what changed after the opponent's move? What of mine is attacked? What is my strongest forcing move?");
}
const CKB_RULE = {
  WALKED_INTO_MATE: ["قبل أي نقلة اعمل «فحص الأمان»: الخصم عنده كش؟ عنده مات؟ وسيب لملكك مربع هروب.", "Before every move do a safety check: does the opponent have a check or a mate? Give your king an escape square."],
  MOVED_TO_HANGING_SQUARE: ["قبل ما تحط قطعة في مربع اسأل: مين بيهاجم المربع ده ومين بيحميه؟ لو المهاجمين أكتر أو أرخص، متروحش.", "Before putting a piece on a square ask: who attacks it and who defends it? If the attackers are more or cheaper, don't go."],
  ABANDONED_DEFENSE: ["كل قطعة عندك ليها شغلانة. قبل ما تحركها اسأل: هي بتحمي مين؟ ولو مشيت، مين هيحميه؟", "Every piece has a job. Before moving it ask: what is it defending, and who defends that once it leaves?"],
  OPENED_LINE_OR_BROKEN_PIN: ["قبل ما تحرك قطعة واقفة على خط فيه فيل أو رخ أو وزير للخصم، شوف إيه اللي هيبان وراها.", "Before moving a piece that stands on a line with an enemy bishop, rook or queen, look at what's behind it."],
  ALLOWED_OPPONENT_FORK: ["خلي بالك من مربعات الشوكة: قطعتين غاليين (أو الملك وقطعة) على مسافة نقلة واحدة من حصان أو وزير الخصم = خطر.", "Watch fork squares: two valuable pieces (or king and a piece) one move away from an enemy knight or queen means danger."],
  ALLOWED_OPPONENT_PIN_OR_SKEWER: ["متحطش الملك أو الوزير على نفس خط فيل أو رخ الخصم، حتى لو في قطعة في النص.", "Don't line up your king or queen with an enemy bishop or rook, even with a piece in between."],
  IGNORED_EXISTING_THREAT: ["منهج الخطوات: أول سؤال دايماً «الخصم بيهدد إيه؟» — رد على التهديد الأول: احمي، اهرب، اسد، أو كُل المهاجم.", "Step method: the first question is always «what does my opponent threaten?» — answer it: defend, move, block or take the attacker."],
  MISSED_TACTICAL_WIN: ["دور الأول على النقلات الإجبارية بالترتيب: كش ← أكل ← تهديد.", "Look at forcing moves first, in order: checks, captures, threats."]
};
function coachBotRule(d) {
  const r = CKB_RULE[d.type] || CKB_RULE.MISSED_TACTICAL_WIN;
  return CCL(r[0], r[1]) + (d.type === "MISSED_TACTICAL_WIN" ? CCL(` فكرة الموقف ده: <b>${esc(ckbMotif(d.themes))}</b>.`, ` This position's idea: <b>${esc(ckbMotif(d.themes))}</b>.`) : "");
}
function coachBotPanel(d, preFen) {
  return `<section class="eca-coach-panel eca-fs-keep" aria-label="${CCL("شرح الكوتش", "Coach explanation")}">
    <header><b>🧑‍🏫 ${CCL("الكوتش بيشرحلك", "Your coach explains")}</b><button type="button" onclick="coachPanelClose()" class="tap eca-coach-x" title="${CCL("اقفل الشرح", "Close")}" aria-label="${CCL("اقفل الشرح", "Close")}">✕</button></header>
    <div class="eca-ckb-part" data-part="1"><h4>1. ${CCL("تشخيص النقلة (ليه نقلتك خطأ؟)", "Diagnosis (why was your move wrong?)")}</h4><p>${coachBotDiagnosis(d)}</p></div>
    <div class="eca-ckb-part" data-part="2"><h4>2. ${CCL("تفكير الكوتش (إزاي تقرأ الموقف صح؟)", "Coach's thinking (how to read the position)")}</h4><p>${coachBotThinking(preFen)}</p></div>
    <div class="eca-ckb-part" data-part="3"><h4>3. ${CCL("نصيحة منهج الخطوات", "Step method rule")}</h4><p>${coachBotRule(d)}</p></div>
  </section>`;
}
window.CoachKnowledgeBot = { diagnosis: coachBotDiagnosis, thinking: coachBotThinking, rule: coachBotRule, panel: coachBotPanel, title: t => CCL(...(CKB_TITLE[t] || CKB_TITLE.MISSED_TACTICAL_WIN)), piece: ckbP };

// النقلة دي غلط؟ (على نسخة من الرقعة، من غير ما نلمس الدور نفسه) — نفس شرط arena.js: النقلة المطلوبة أو كش مات
function coachIsWrong(S, mv) {
  const want = S.sol && S.sol[S.idx];
  if (!S.game || !want) return false;
  let c;
  try { c = new ChessCls(S.game.fen()); } catch (_) { return false; }
  let r = null;
  try { r = c.move(mv); } catch (_) {}
  if (!r) return false;
  return coachUci(r) !== want && !c.isCheckmate();
}
{
  const _pp = puzPlay;
  puzPlay = function (mv) {
    const Z = arena.puz, m = coachMode();
    if (Z.status === "play") Z.coachPanel = null;   // نقلة جديدة: شرح الغلطة اللي فاتت بيقفل
    if (Z.status === "play" && coachRefuteOk(m) && coachLive() && coachIsWrong(Z, mv)) {
      const g = Z.game, pre = g.fen(), want = Z.sol[Z.idx], last0 = Z.last;
      const r = g.move(mv);
      Z.last = [r.from, r.to]; Z.status = "wrong"; Z.flash = { [r.to]: "bad" }; Z.sel = null;
      puzCount(false);   // مرة واحدة بس لكل لغز (puzCount بيقفل نفسه): خزنة الغلطات ما تتكررش
      coachStartRefute(Z, m, pre, r, want, () => { Z.status = "play"; }, last0);
      return arenaRefresh();
    }
    return _pp.apply(this, arguments);
  };
  const _ps = puzShow;
  puzShow = function () { if (arena.puz.refute) coachRestore(arena.puz, true); return _ps.apply(this, arguments); };
  window.puzShow = puzShow;
  const _bm = bossMove;
  bossMove = async function (mv) {
    const B = arena.boss;
    if (B.status === "play") B.coachPanel = null;
    if (B.status === "play" && B.game && !B.busy && coachLive() && coachIsWrong(B, mv)) {
      const g = B.game, pre = g.fen(), want = B.sol[B.idx], last0 = B.last;
      const r = g.move(mv);
      B.last = [r.from, r.to]; B.flash = { [r.to]: "bad" }; B.sel = null; B.status = "block";
      arenaRefresh();
      if (typeof bossFx === "function") bossFx("block");
      if (window.ecaCheer) ecaCheer("retry");
      coachStartRefute(B, "boss", pre, r, want, () => { B.status = "play"; }, last0);
      return;
    }
    return _bm.apply(this, arguments);
  };
}

// ================= المساعد الذكي: 3 مراحل =================
function coachKey(S, m) { return m === "analysis" ? (S.game ? S.game.fen() : "") : S.game; }
function coachStage(S, m) { return S && S.game && S.coachKey === coachKey(S, m) ? Number(S.coachStage) || 0 : 0; }
// النقلة المطلوبة: من الحل (في الذاكرة) أو من أحسن خط للمحرك في رقعة التحليل
function coachWant(S, m) {
  if (!S || !S.game) return "";
  if (m === "analysis") return S.ev && S.ev.pv && S.evFen === S.game.fen() ? S.ev.pv.split(" ")[0] : "";
  return (S.sol && S.sol[S.idx]) || "";
}
function coachMotif(S, m) {
  if (m === "analysis") {
    const u = coachWant(S, m);
    try { const c = new ChessCls(S.game.fen()); coachTry(c, u); if (c.isCheckmate()) return "mate"; } catch (_) {}
    return "default";
  }
  for (const t of ((S.info && S.info.themes) || (S.pz && S.pz.themes) || [])) if (COACH_MOTIF[t]) return COACH_MOTIF[t];
  return "default";
}
// وضع التحليل الفوري (gmcoach.js): مقفول افتراضياً — الرد العقابي بيشتغل بس لو الطالب فتحه
function coachLive() { return !window.ecaAnalysisOn || window.ecaAnalysisOn(); }
// ================= التلميحات من الحل نفسه (GroundTruthTacticalAnalyzer) =================
// في الألغاز: نقلة الحل الحقيقية (S.sol في الذاكرة) — في رقعة التحليل: أحسن خط للمحرك. مفيش تخمين من شكل الموقف
function coachTruth(S, m) {
  if (!S || !S.game || !window.GroundTruthTacticalAnalyzer) return null;
  const fen = S.game.fen();
  const line = m === "analysis" ? (S.ev && S.ev.pv && S.evFen === fen ? S.ev.pv.split(" ").filter(Boolean) : []) : (S.sol || []).slice(S.idx || 0);
  if (!line.length) return null;
  const key = fen + "|" + line.slice(0, 6).join(" ");
  if (S.gtKey !== key) { S.gtKey = key; try { S.gtVal = GroundTruthTacticalAnalyzer.effect(fen, line.slice(0, 6)); } catch (_) { S.gtVal = null; } }
  return S.gtVal;
}
const coachPairs = ts => (ts || []).slice(0, 2).map(x => `${ckbP(x.type)} ${CCL("في", "on")} ${ckbS(x.sq)}`).join(CCL(" و", " and "));
// خطوة 1: الفكرة والهدف (من غير القطعة اللي هتتحرك)
function coachTruthStep1(e) {
  if (!e) return "";
  const K = ckbS(e.enemyKing);
  switch (e.motive) {
    case "mateNow": return CCL(`💡 خطوة 1: في <b>كش مات في نقلة واحدة</b>! ملك الخصم في ${K} — دوّر على الكش اللي مايسيبلوش مهرب.`, `💡 Step 1: There's <b>mate in one</b>! The enemy king is on ${K} — find the check that leaves no escape.`);
    case "mate": return CCL(`💡 خطوة 1: في <b>كش مات في ${e.mateIn}</b> على الملك في ${K} — ابدأ بنقلة إجبارية.`, `💡 Step 1: There's <b>mate in ${e.mateIn}</b> against the king on ${K} — start with a forcing move.`);
    case "fork": return CCL(`💡 خطوة 1: في نقلة بتعمل <b>شوكة مزدوجة</b> على ${coachPairs(e.fork.targets)} في نفس الوقت!`, `💡 Step 1: One move makes a <b>fork</b> on ${coachPairs(e.fork.targets)} at once!`);
    case "pin": return CCL(`💡 خطوة 1: ${ckbP(e.pin.front.type)} في ${ckbS(e.pin.front.sq)} و${ckbP(e.pin.behind.type)} في ${ckbS(e.pin.behind.sq)} على نفس الخط — في <b>ربط</b> جاهز.`, `💡 Step 1: ${ckbP(e.pin.front.type)} on ${ckbS(e.pin.front.sq)} and ${ckbP(e.pin.behind.type)} on ${ckbS(e.pin.behind.sq)} share a line — a <b>pin</b> is ready.`);
    case "skewer": return CCL(`💡 خطوة 1: ${ckbP(e.skewer.front.type)} في ${ckbS(e.skewer.front.sq)} ووراه ${ckbP(e.skewer.behind.type)} في ${ckbS(e.skewer.behind.sq)} — في <b>سيخ</b> جاهز.`, `💡 Step 1: ${ckbP(e.skewer.front.type)} on ${ckbS(e.skewer.front.sq)} with ${ckbP(e.skewer.behind.type)} behind it — a <b>skewer</b> is ready.`);
    case "discovered": return CCL(`💡 خطوة 1: ${ckbP(e.discovered.by)} في ${ckbS(e.discovered.bySq)} مستخبي ورا قطعة من قطعك — لو اتحركت هيهاجم ${ckbP(e.discovered.target)} في ${ckbS(e.discovered.targetSq)} (<b>${e.discovered.check ? "كش بالكشف" : "هجوم بالكشف"}</b>).`, `💡 Step 1: ${ckbP(e.discovered.by)} on ${ckbS(e.discovered.bySq)} hides behind one of your pieces — move it and it hits ${ckbP(e.discovered.target)} on ${ckbS(e.discovered.targetSq)} (<b>discovered ${e.discovered.check ? "check" : "attack"}</b>).`);
    case "freeCapture": return CCL(`💡 خطوة 1: ${ckbP(e.captured)} بتاع الخصم في ${ckbS(e.capSq)} <b>مالوش حماية</b> — تقدر تكسبه.`, `💡 Step 1: The enemy ${ckbP(e.captured)} on ${ckbS(e.capSq)} is <b>unprotected</b> — you can win it.`);
    case "winCapture": return CCL(`💡 خطوة 1: في أكل على ${ckbS(e.capSq)} <b>بيكسب خامات</b> حتى بعد ما الخصم ياخد تاني.`, `💡 Step 1: A capture on ${ckbS(e.capSq)} <b>wins material</b> even after the recapture.`);
    case "deflection": return CCL(`💡 خطوة 1: ${ckbP(e.deflection.defender.type)} في ${ckbS(e.deflection.defender.sq)} بيحمي ${ckbS(e.deflection.target)} — <b>شتّت المدافع</b> ده.`, `💡 Step 1: ${ckbP(e.deflection.defender.type)} on ${ckbS(e.deflection.defender.sq)} guards ${ckbS(e.deflection.target)} — <b>deflect that defender</b>.`);
    case "decoy": return CCL(`💡 خطوة 1: الحل فيه <b>استدراج</b>: اشد ${ckbP(e.deflection.piece)} بتاع الخصم لمربع ${ckbS(e.deflection.sq)}.`, `💡 Step 1: The solution is a <b>decoy</b>: lure the enemy ${ckbP(e.deflection.piece)} to ${ckbS(e.deflection.sq)}.`);
    case "removalGuard": return CCL(`💡 خطوة 1: ${ckbP(e.deflection.guard.type)} في ${ckbS(e.deflection.guard.sq)} هو اللي حامي ${ckbS(e.deflection.target)} — <b>شيل المدافع</b>.`, `💡 Step 1: ${ckbP(e.deflection.guard.type)} on ${ckbS(e.deflection.guard.sq)} guards ${ckbS(e.deflection.target)} — <b>remove the guard</b>.`);
    case "sacrifice": return CCL("💡 خطوة 1: الحل فيه <b>تضحية</b> — متخافش تدّي قطعة لو بعدها بتكسب أكتر.", "💡 Step 1: The solution is a <b>sacrifice</b> — don't fear giving a piece if you win more after it.");
    case "promotion": return CCL("💡 خطوة 1: بيدقك قريب جداً من <b>الترقية</b>.", "💡 Step 1: Your pawn is very close to <b>promoting</b>.");
    case "trapped": return CCL(`💡 خطوة 1: ${ckbP(e.trapped.target.type)} بتاع الخصم في ${ckbS(e.trapped.target.sq)} <b>هيبقى محبوس</b> من غير مربع هروب.`, `💡 Step 1: The enemy ${ckbP(e.trapped.target.type)} on ${ckbS(e.trapped.target.sq)} <b>can be trapped</b>.`);
    case "check": return CCL(`💡 خطوة 1: ابدأ بـ <b>كش</b> يجبر ملك الخصم في ${K} يتحرك.`, `💡 Step 1: Start with a <b>check</b> that forces the king on ${K} to move.`);
    case "threat": return CCL(`💡 خطوة 1: الحل <b>نقلة هادية</b> بتهدد ${ckbP(e.threat.type)} في ${ckbS(e.threat.sq)}.`, `💡 Step 1: The solution is a <b>quiet move</b> that threatens ${ckbP(e.threat.type)} on ${ckbS(e.threat.sq)}.`);
    case "winMaterial": return CCL("💡 خطوة 1: في سلسلة نقلات إجبارية <b>بتكسب خامات</b> في الآخر.", "💡 Step 1: A forcing sequence <b>wins material</b> at the end.");
    default: return "";
  }
}
// خطوة 2: القطعة بالظبط ودورها
function coachTruthRole(e) {
  switch (e.motive) {
    case "mateNow": return CCL("هو اللي هيدّي الكش مات", "it delivers the mate");
    case "mate": return CCL("هو اللي هيبدأ الهجوم القاتل", "it starts the mating attack");
    case "fork": return CCL("هو اللي هيعمل الشوكة", "it makes the fork");
    case "pin": return CCL("هو اللي هيعمل الربط", "it makes the pin");
    case "skewer": return CCL("هو اللي هيعمل السيخ", "it makes the skewer");
    case "discovered": return CCL("حركته هتفتح الخط للقطعة اللي وراه", "moving it opens the line behind it");
    case "freeCapture": case "winCapture": return CCL("هو اللي هياكل", "it makes the capture");
    case "deflection": case "decoy": case "removalGuard": return CCL("هو اللي هيشتت دفاع الخصم", "it breaks the defence");
    case "sacrifice": return CCL("هيضحّي بنفسه عشان الخطة", "it sacrifices itself for the plan");
    case "promotion": return CCL("هيترقّى", "it promotes");
    case "check": return CCL("هو اللي هيكش", "it gives the check");
    default: return CCL("فكّر فين أقوى مربع يروح له", "think where its strongest square is");
  }
}
// خطوة 3: النقلة بالظبط + ليه (اللي حصل فعلاً بعد ما لعبناها على نسخة من الرقعة)
function coachTruthWhy(e) {
  const W = window.GrandmasterMoveClassifier;
  switch (e.motive) {
    case "mateNow": return CCL("<b>كش مات!</b>", "<b>checkmate!</b>");
    case "mate": return CCL(`بتبدأ <b>كش مات في ${e.mateIn}</b>`, `it starts <b>mate in ${e.mateIn}</b>`);
    case "fork": return CCL(`لأنها بتهدد ${coachPairs(e.fork.targets)} في نفس اللحظة ومفيش قطعة تقدر تحمي الاتنين!`, `because it hits ${coachPairs(e.fork.targets)} at once and nothing can guard both!`);
    case "pin": return CCL(`بتربط ${ckbP(e.pin.front.type)} بـ${ckbP(e.pin.behind.type)} فمش هيقدر يتحرك`, `it pins ${ckbP(e.pin.front.type)} to ${ckbP(e.pin.behind.type)}`);
    case "skewer": return CCL(`${ckbP(e.skewer.front.type)} لازم يهرب، و${ckbP(e.skewer.behind.type)} اللي وراه بيتاكل`, `${ckbP(e.skewer.front.type)} must move and ${ckbP(e.skewer.behind.type)} behind it falls`);
    case "discovered": return CCL(`و${ckbP(e.discovered.by)} بيهاجم ${ckbP(e.discovered.target)} في نفس اللحظة`, `and ${ckbP(e.discovered.by)} hits ${ckbP(e.discovered.target)} at the same time`);
    case "freeCapture": return CCL(`بتاكل ${ckbP(e.captured)} ببلاش`, `it takes ${ckbP(e.captured)} for free`);
    case "winCapture": return CCL(`بتكسب خامات بعد سلسلة الأكل كلها (+${Math.round(e.see / 100)})`, `it wins material after all the captures (+${Math.round(e.see / 100)})`);
    case "sacrifice": return CCL("تضحية — ولو الخصم أكل بتكسب أكتر", "a sacrifice — if it's taken you win more");
    case "promotion": return CCL("وبيترقّى", "and promotes");
    case "check": return CCL("كش، والخصم مجبر يرد عليه", "check — the opponent must answer it");
    case "threat": return CCL(`وبتهدد ${ckbP(e.threat.type)} في ${ckbS(e.threat.sq)}`, `and threatens ${ckbP(e.threat.type)} on ${ckbS(e.threat.sq)}`);
    default: return W && e.deflection && W.conceptText ? W.conceptText(e.deflection) : CCL("وفكّر ليه دي أقوى نقلة", "and think about why it's the strongest move");
  }
}
function coachStep2Text(S, m) {
  const e = coachTruth(S, m);
  if (!e) return CCL("🎯 خطوة 2: القطعة المتحددة بالدهبي هي البطل هنا.. فكر إيه أقوى مربع تروح له!", "🎯 Step 2: The piece circled in gold is the hero here. Which square is strongest for it?");
  return CCL(`🎯 خطوة 2: ${ckbP(e.piece)} في ${ckbS(e.from)} (المتحدد بالدهبي) هو البطل: ${coachTruthRole(e)}.`, `🎯 Step 2: ${ckbP(e.piece)} on ${ckbS(e.from)} (circled in gold) is the hero: ${coachTruthRole(e)}.`);
}
function coachStep3Text(S, m) {
  const e = coachTruth(S, m);
  if (!e) return CCL("✨ خطوة 3: نفّذ النقلة المشار إليها بالسهم وركّز ليه النقلة دي بتكسب!", "✨ Step 3: Play the move the arrow shows, and think about why it wins!");
  return CCL(`✨ خطوة 3: العب ${ckbP(e.piece)} إلى ${ckbS(e.to)} — ${coachTruthWhy(e)}`, `✨ Step 3: Play ${ckbP(e.piece)} to ${ckbS(e.to)} — ${coachTruthWhy(e)}`);
}
// خطوة 1: من أثر نقلة الحل الحقيقي. ولو الحل نقلة هادية من غير أثر واضح: قراءة الموقف، وبعدها سؤال الفكرة
function coachStep1Text(S, m) {
  const gt = coachTruthStep1(coachTruth(S, m));
  if (gt) return gt;
  const f = window.ChessPositionAnalyzer && S && S.game ? ChessPositionAnalyzer.features(S.game.fen()) : null, bits = [];
  if (f && f.aligned) bits.push(`${ckbP(f.aligned.a.type)} ${CCL("في", "on")} ${ckbS(f.aligned.a.sq)} ${CCL("و", "and")} ${ckbP(f.aligned.b.type)} ${CCL("في", "on")} ${ckbS(f.aligned.b.sq)} ${CCL("على نفس الخط", "are on the same line")}`);
  if (f && f.loose.length) bits.push(CCL(`في قطعة غير محمية في ${ckbS(f.loose[0].sq)}`, `there is an undefended piece on ${ckbS(f.loose[0].sq)}`));
  if (f && f.escapes === 0 && coachMotif(S, m) === "mate") bits.push(CCL(`ملك الخصم في ${ckbS(f.kingSq)} مالوش مربع هروب`, `the enemy king on ${ckbS(f.kingSq)} has no escape square`));
  if (!bits.length) return CCL(...COACH_STEP1[coachMotif(S, m)]);
  return CCL("💡 بص على موقف الخصم: ", "💡 Look at your opponent's position: ") + bits.join(CCL("، و", ", and ")) + CCL(".. إزاي نستغل ده؟", ". How can we use that?");
}
function coachHintLabel(st) {
  return st >= 3 ? CCL("💡 تم عرض التلميح", "💡 Hint shown") : st === 2 ? CCL("💡 مسار التكتيك (1)", "💡 Tactic path (1)")
    : st === 1 ? CCL("💡 تلميح القطعة (2)", "💡 Piece hint (2)") : CCL("💡 مساعدة الكوتش (3)", "💡 Coach help (3)");
}
function coachHint(m) {
  m = m || coachMode();
  if (!coachHintOk(m)) return;
  const S = coachState(m), want = coachWant(S, m);
  if (m === "analysis" && S && S.game && !want) return toast(CCL("المحرك لسه بيفكّر.. ثانية وجرّب تاني", "The engine is still thinking. Try again in a second"));
  if (!S || !S.game || !want || S.isRefuting || (m !== "analysis" && S.status !== "play")) return;
  const key = coachKey(S, m);
  if (S.coachKey !== key) { S.coachKey = key; S.coachStage = 0; }
  if (S.coachStage >= 3) return;
  S.coachStage++; S.coachAt = m === "analysis" ? key : S.idx; S.sel = null; S.coachPanel = null;
  if (m === "boss") { S.coachWorst = S.coachWorst || {}; S.coachWorst[S.aid] = Math.max(S.coachWorst[S.aid] || 0, S.coachStage); }
  coachSfx("hint");
  if (typeof arenaRefresh === "function") arenaRefresh();
}
window.coachHint = coachHint;
// زرار التلميح في شاشة الألغاز موجود من arena.js (onclick="puzHint()")، فبنوصّله بالمساعد الجديد
puzHint = function () { coachHint(coachMode() || "practice"); };
window.puzHint = puzHint;
window.puzHintLabel = function () { return coachHintLabel(coachStage(arena.puz, coachMode() || "practice")); };
function coachHintBtnHTML(m) {
  const S = coachState(m), st = coachStage(S, m), off = st >= 3 || (m !== "analysis" && (!!S.isRefuting || !coachWant(S, m) || S.status !== "play"));
  return `<button type="button" onclick="coachHint('${m}')" ${off ? "disabled" : ""} class="tap eca-coach-hint ${m === "analysis" ? "col-span-3" : "w-full"} rounded-xl text-xs font-bold disabled:opacity-40">${coachHintLabel(st)}</button>`;
}
window.coachHintBtnHTML = coachHintBtnHTML;
// الجايزة: ×1 من غير تلميح، و ×0.9 / ×0.75 / ×0.5 بعد كل مرحلة (بتتحسب لحظة ما اللغز يتحسب)
function coachRewardMult(S) { return COACH_MULT[Math.min(3, coachStage(S, "puzzles"))]; }
function coachBossMult(aid) { const w = (arena.boss.coachWorst || {})[aid] || 0; return COACH_MULT[Math.min(3, w)]; }
function coachAmount(base, mult) { return Math.max(1, Math.floor(base * mult)); }
window.coachRewardMult = coachRewardMult;
window.coachBossMult = coachBossMult;

// ================= الرسم فوق الرقعة (SVG بـ viewBox 800×800 بيكبر ويصغر مع الرقعة، حتى في وضع التكبير) =================
function coachSq(board, sq) {
  const cells = board.querySelectorAll(".eca-sq");
  for (let i = 0; i < cells.length; i++) if (cells[i].dataset.sq === sq) return [(i % 8) * 100 + 50, Math.floor(i / 8) * 100 + 50];
  return null;
}
function coachArrow(a, b, cls, color) {
  const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  const r = n => Math.round(n * 10) / 10;
  const x1 = a[0] + ux * 16, y1 = a[1] + uy * 16, x2 = b[0] - ux * 36, y2 = b[1] - uy * 36;
  const tip = [b[0] - ux * 8, b[1] - uy * 8], base = [b[0] - ux * 44, b[1] - uy * 44], px = -uy * 26, py = ux * 26;
  return `<line class="${cls}" x1="${r(x1)}" y1="${r(y1)}" x2="${r(x2)}" y2="${r(y2)}" pathLength="100" stroke="${color}" />`
    + `<polygon class="${cls}-head" points="${r(tip[0])},${r(tip[1])} ${r(base[0] + px)},${r(base[1] + py)} ${r(base[0] - px)},${r(base[1] - py)}" />`;
}
function coachPaint() {
  const mv = document.getElementById("mainView");
  if (!mv || typeof arena === "undefined") return;
  const m = coachMode();
  // رد عقابي لوضع مش ظاهر دلوقتي (رجع اللوبي، فتح تاب تاني، لغز جديد): بيتلغي ويرجع الرقعة
  [arena.puz, arena.boss].forEach(S => { if (S && S.refute && (!m || coachState(m) !== S || S.refute.game !== S.game)) coachRestore(S, true); });
  if (!m || !coachHintOk(m)) return;
  const S = coachState(m), board = mv.querySelector(".eca-board");
  if (!S || !board) return;
  if (m === "practice" || m === "lesson" || m === "dojo") {
    const btn = mv.querySelector('button[onclick="puzHint()"]');
    if (btn) { btn.classList.add("eca-coach-hint"); if (coachStage(S, m) >= 3 || S.isRefuting) btn.disabled = true; btn.innerHTML = coachHintLabel(coachStage(S, m)); }
  }
  let svg = "", above = "", below = "";
  const R = S.refute;
  if (R) {
    board.classList.add("eca-coach-lock");
    if (R.shown) {
      const title = R.diag ? CCL(...(CKB_TITLE[R.diag.type] || CKB_TITLE.MISSED_TACTICAL_WIN)) : CCL(...COACH_TAGS[R.ref ? R.kind : "F"]);
      if (R.ref) {
        const a = coachSq(board, R.ref.from), b = coachSq(board, R.ref.to);
        if (a && b) svg += coachArrow(a, b, "eca-co-ref", "#E50914");
        if (!R.diag) { const t = coachSq(board, R.ref.target); if (t) svg += `<circle class="eca-co-ring" cx="${t[0]}" cy="${t[1]}" r="44" />`; }
      } else { const t = coachSq(board, R.wrong); if (t) svg += `<rect class="eca-co-bad" x="${t[0] - 50}" y="${t[1] - 50}" width="100" height="100" />`; }
      // الأسهم التانية من تشخيص الغلطة: الشوكة، الحماية اللي اتشالت، خط الأشعة، دواير الخطر
      ((R.diag && R.diag.vectors) || []).forEach(v => {
        const a = coachSq(board, v.from || v.sq), b = v.to ? coachSq(board, v.to) : null;
        if (!a) return;
        if (v.kind === "ring") svg += `<circle class="eca-co-ring${v.tone === "amber" ? " eca-co-ring-amber" : ""}" cx="${a[0]}" cy="${a[1]}" r="44" />`;
        else if (v.kind === "dash" && b) svg += coachArrow(a, b, "eca-co-dash", "#F5C518");
        else if (v.kind === "dots" && b) svg += `<line class="eca-co-dots" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" />`;
        else if (v.kind === "xray" && b) svg += `<line class="eca-co-xray" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" />`;
        else if (v.kind === "badge") svg += `<g class="eca-co-badge"><circle cx="${a[0] + 28}" cy="${a[1] - 28}" r="24" /><text x="${a[0] + 28}" y="${a[1] - 20}" text-anchor="middle">${esc(v.text || "")}</text></g>`;
      });
      above += `<div class="eca-coach-toast eca-fs-keep" role="status"><b>${title}</b>${R.ref || R.diag ? `<button type="button" onclick="coachSkip()" class="tap eca-coach-skip">${CCL("🔄 فهمت السبب — جرب تاني", "🔄 Got it — try again")}</button>` : ""}</div>`;
    }
  }
  const P = S.coachPanel;
  if (P && P.game === S.game && P.idx === S.idx) below = P.html;
  if (!R) {
    const st = coachStage(S, m), here = m === "analysis" ? S.coachAt === coachKey(S, m) : S.coachAt === S.idx;
    const want = coachWant(S, m), live = m === "analysis" || S.status === "play";
    if (st && here && want && live) {
      const a = coachSq(board, want.slice(0, 2)), b = coachSq(board, want.slice(2, 4));
      const text = st === 1 ? coachStep1Text(S, m)
        : st === 2 ? coachStep2Text(S, m)
        : coachStep3Text(S, m);
      above += `<div class="eca-coach-bubble eca-fs-keep" role="status"><span aria-hidden="true">🧑‍🏫</span><p>${text}</p></div>`;
      if (st === 2 && a) svg += `<circle class="eca-co-spot" cx="${a[0]}" cy="${a[1]}" r="46" /><circle class="eca-co-radar" cx="${a[0]}" cy="${a[1]}" r="46" /><circle class="eca-co-radar eca-co-radar2" cx="${a[0]}" cy="${a[1]}" r="46" />`;
      if (st === 3 && a && b) svg += `<defs><linearGradient id="ecaCoGrad" gradientUnits="userSpaceOnUse" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"><stop offset="0" stop-color="#46D369" /><stop offset="1" stop-color="#F5C518" /></linearGradient></defs>` + coachArrow(a, b, "eca-co-hint", "url(#ecaCoGrad)");
    }
  }
  if (svg) board.insertAdjacentHTML("beforeend", `<svg class="eca-coach-svg" viewBox="0 0 800 800" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>`);
  if (above) board.insertAdjacentHTML("beforebegin", above);
  if (below) board.insertAdjacentHTML("afterend", below);
}
{
  const _r = render;
  render = function () { const out = _r.apply(this, arguments); try { coachPaint(); } catch (e) { console.warn("Coach overlay:", e); } return out; };
}
window.ecaCoach = { mode: coachMode, hintOk: coachHintOk, refuteOk: coachRefuteOk, state: coachState, stage: coachStage, want: coachWant, motif: coachMotif,
  step1: k => CCL(...COACH_STEP1[k] || COACH_STEP1.default), step1Text: coachStep1Text, step2Text: coachStep2Text, step3Text: coachStep3Text, truth: coachTruth, live: coachLive, mult: COACH_MULT, amount: coachAmount, tags: COACH_TAGS, show: COACH_SHOW,
  isRefuting: () => { const m = coachMode(); return !!(m && coachState(m) && coachState(m).isRefuting); } };
