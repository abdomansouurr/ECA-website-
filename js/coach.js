// ECA — coach.js: الكوتش جنب الرقعة
// 1) الرد العقابي: نقلة غلط في (مغامرة الدروس، دوجو الانتقام، واجب الزعيم) → الخصم بيلعب الرد اللي بيعاقبها
//    بسهم أحمر ودايرة خطر وسبب بالعربي، وبعد 1.65 ثانية (أو «جرب تاني الآن») الرقعة بترجع للوضع قبل الغلطة بالظبط.
// 2) المساعد الذكي بمنهج الخطوات: سؤال على الفكرة ← القطعة ← السهم. كل مرحلة بتقلل جايزة اللغز (×0.9 ← ×0.75 ← ×0.5).
// الحل بيتقري من الذاكرة بس (S.sol / تحليل المحرك)، ومفيش نقلة من الحل بتتكتب في الصفحة كنص أو data-attribute.
// الأصوات من نفس AudioContext بتاع الموقع (sfxNotes في gamify.js).

const CCL = (ar, en) => lang === "en" ? en : ar;
const COACH_VAL = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const COACH_MULT = [1, 0.9, 0.75, 0.5];
const COACH_PAUSE = 250, COACH_SHOW = 1650, COACH_FALLBACK = 1100;
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
  const ref = findRefutationMove(pre, coachUci(r), want, S.refutations || (S.pz && S.pz.refutations));
  S.isRefuting = true;
  S.refute = { mode, game: S.game, pre, last0, wrong: r.to, ref, kind: ref ? ref.kind : "F", onDone, shown: false };
  coachTimers.push(setTimeout(() => {
    const R = S.refute;
    if (!R || R.game !== S.game) return;
    if (R.ref) { const m = coachTry(S.game, coachUci(R.ref)); if (m) S.last = [m.from, m.to]; else R.ref = null; }
    R.shown = true; coachSfx("warn");
    if (typeof arenaRefresh === "function") arenaRefresh();
    coachTimers.push(setTimeout(() => coachRestore(S), R.ref ? COACH_SHOW : COACH_FALLBACK));
  }, COACH_PAUSE));
}
function coachRestore(S, quiet) {
  coachClear();
  const R = S && S.refute;
  if (!R) return;
  S.refute = null; S.isRefuting = false;
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
    if (Z.status === "play" && coachRefuteOk(m) && coachIsWrong(Z, mv)) {
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
    if (B.status === "play" && B.game && !B.busy && coachIsWrong(B, mv)) {
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
  S.coachStage++; S.coachAt = m === "analysis" ? key : S.idx; S.sel = null;
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
  let svg = "", above = "";
  const R = S.refute;
  if (R) {
    board.classList.add("eca-coach-lock");
    if (R.shown) {
      const tag = COACH_TAGS[R.ref ? R.kind : "F"];
      if (R.ref) {
        const a = coachSq(board, R.ref.from), b = coachSq(board, R.ref.to), t = coachSq(board, R.ref.target);
        if (a && b) svg += coachArrow(a, b, "eca-co-ref", "#E50914");
        if (t) svg += `<circle class="eca-co-ring" cx="${t[0]}" cy="${t[1]}" r="44" />`;
      } else { const t = coachSq(board, R.wrong); if (t) svg += `<rect class="eca-co-bad" x="${t[0] - 50}" y="${t[1] - 50}" width="100" height="100" />`; }
      above += `<div class="eca-coach-toast eca-fs-keep" role="status"><b>${CCL(tag[0], tag[1])}</b>${R.ref ? `<button type="button" onclick="coachSkip()" class="tap eca-coach-skip">${CCL("🔄 جرب تاني الآن", "🔄 Try again now")}</button>` : ""}</div>`;
    }
  } else {
    const st = coachStage(S, m), here = m === "analysis" ? S.coachAt === coachKey(S, m) : S.coachAt === S.idx;
    const want = coachWant(S, m), live = m === "analysis" || S.status === "play";
    if (st && here && want && live) {
      const a = coachSq(board, want.slice(0, 2)), b = coachSq(board, want.slice(2, 4));
      const text = st === 1 ? CCL(...COACH_STEP1[coachMotif(S, m)])
        : st === 2 ? CCL("🎯 خطوة 2: القطعة المتحددة بالدهبي هي البطل هنا.. فكر إيه أقوى مربع تروح له!", "🎯 Step 2: The piece circled in gold is the hero here. Which square is strongest for it?")
        : CCL("✨ خطوة 3: نفّذ النقلة المشار إليها بالسهم وركّز ليه النقلة دي بتكسب!", "✨ Step 3: Play the move the arrow shows, and think about why it wins!");
      above += `<div class="eca-coach-bubble eca-fs-keep" role="status"><span aria-hidden="true">🧑‍🏫</span><p>${text}</p></div>`;
      if (st === 2 && a) svg += `<circle class="eca-co-spot" cx="${a[0]}" cy="${a[1]}" r="46" /><circle class="eca-co-radar" cx="${a[0]}" cy="${a[1]}" r="46" /><circle class="eca-co-radar eca-co-radar2" cx="${a[0]}" cy="${a[1]}" r="46" />`;
      if (st === 3 && a && b) svg += `<defs><linearGradient id="ecaCoGrad" gradientUnits="userSpaceOnUse" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"><stop offset="0" stop-color="#46D369" /><stop offset="1" stop-color="#F5C518" /></linearGradient></defs>` + coachArrow(a, b, "eca-co-hint", "url(#ecaCoGrad)");
    }
  }
  if (svg) board.insertAdjacentHTML("beforeend", `<svg class="eca-coach-svg" viewBox="0 0 800 800" preserveAspectRatio="none" aria-hidden="true">${svg}</svg>`);
  if (above) board.insertAdjacentHTML("beforebegin", above);
}
{
  const _r = render;
  render = function () { const out = _r.apply(this, arguments); try { coachPaint(); } catch (e) { console.warn("Coach overlay:", e); } return out; };
}
window.ecaCoach = { mode: coachMode, hintOk: coachHintOk, refuteOk: coachRefuteOk, state: coachState, stage: coachStage, want: coachWant, motif: coachMotif,
  step1: k => CCL(...COACH_STEP1[k] || COACH_STEP1.default), mult: COACH_MULT, amount: coachAmount, tags: COACH_TAGS,
  isRefuting: () => { const m = coachMode(); return !!(m && coachState(m) && coachState(m).isRefuting); } };
