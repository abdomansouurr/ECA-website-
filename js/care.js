// ECA — care.js: ضد الإحباط
// سلّم تلميحات من 3 درجات بدل الحل على طول، ورسالة بتشرح الغلطة، واقتراح الدوجو في وقته (مش في نص لعبة)،
// و ecaIsPlaying() اللي بيقول لو الطالب في نص لعبة دلوقتي (عشان مفيش حاجة تقاطعه).

const CARE = (ar, en) => lang === "en" ? en : ar;

// ================= الطالب في نص لعبة؟ =================
function ecaIsPlaying() {
  if (tab !== "arena") return false;
  const s = arena.sub, on = x => !!x && ["play", "reply", "wrong", "hit", "block"].includes(x.status);
  if (s === "puzzles") return on(arena.puz);
  if (s === "play") return !!(arena.play && arena.play.game && !arena.play.over);
  return on({ boss: arena.boss, weekly: arena.weekly, rush: arena.rush, speed: arena.speed, friend: arena.friend, duel: arena.duel }[s]);
}
window.ecaIsPlaying = ecaIsPlaying;

// ================= سلّم التلميحات: القطعة ← المربع ← النقلة =================
function puzHintLevel() {
  const Z = arena.puz;
  return Z.hintGame === Z.game && Z.hintIdx === Z.idx ? Number(Z.hintLv) || 0 : 0;
}
function puzHintLabel() {
  const lv = puzHintLevel();
  return lv >= 2 ? CARE("💡 العب النقلة", "💡 Play the move") : `💡 ${CARE("تلميح", "Hint")} <span dir="ltr">${lv + 1}/3</span>`;
}
window.puzHintLabel = puzHintLabel;
puzHint = function () {
  const Z = arena.puz, want = Z.sol[Z.idx] || "";
  if (Z.status !== "play" || !Z.game || !want) return;
  const lv = Math.min(3, puzHintLevel() + 1);
  Object.assign(Z, { hintGame: Z.game, hintIdx: Z.idx, hintLv: lv, sel: null });
  puzCount(false);                                     // أي تلميح = اللغز ما اتحسبش صح (زي الأول)
  if (lv === 1) { Z.hint = want.slice(0, 2); Z.flash = null; toast(CARE("💡 القطعة المنوّرة هي مفتاح الحل.", "💡 The glowing piece is the key.")); }
  else if (lv === 2) { Z.hint = want.slice(0, 2); Z.flash = { [want.slice(2, 4)]: "goal" }; toast(CARE("💡 ودّيها للمربع المنوّر.", "💡 Move it to the glowing square.")); }
  else { Z.hint = null; Z.flash = null; const mv = { from: want.slice(0, 2), to: want.slice(2, 4) }; if (want[4]) mv.promotion = want[4]; return puzPlay(mv); }
  arenaRefresh();
};
window.puzHint = puzHint;

// ================= الغلطة بتتشرح: إيه اللي كان ناقص =================
function careWhy(fen, mv, want) {
  if (typeof ChessCls === "undefined" || !ChessCls || !fen || !want) return "";
  let sol = null;
  const c = new ChessCls(fen);
  try { sol = c.move({ from: want.slice(0, 2), to: want.slice(2, 4), promotion: want[4] || undefined }); } catch (_) {}
  if (!sol) return "";
  if (mv && mv.from === sol.from) return CARE("القطعة صح 👍 بس المربع غلط. بص على المربعات اللي تقدر تروحها.", "Right piece 👍 wrong square. Look where else it can go.");
  if (c.isCheckmate()) return CARE("فيه كش مات في نقلة واحدة! دوّر عليه 👀", "There's a mate in one! Find it 👀");
  if (sol.san.includes("+")) return CARE("جرّب نقلة فيها كش ♚", "Try a move that gives check ♚");
  if (sol.captured) return CARE("فيه قطعة تقدر تاكلها 🍽️", "There's a piece you can take 🍽️");
  if (sol.promotion) return CARE("فكّر في ترقية العسكري ♛", "Think about promoting a pawn ♛");
  return CARE("فكّر في قطعة تانية 🤔", "Think about a different piece 🤔");
}
window.careWhy = careWhy;
{
  const _pp = puzPlay;
  puzPlay = function (mv) {
    const Z = arena.puz, before = Z.status, fen = Z.game ? Z.game.fen() : "", want = Z.sol[Z.idx] || "";
    const out = _pp.apply(this, arguments);
    if (before === "play" && Z.status === "wrong") { const why = careWhy(fen, mv, want); if (why) toast(why); }
    return out;
  };
}

// ================= الدوجو في وقته: لما يبقى فيه ألغاز جاهزة للانتقام والطالب مش في نص لعبة =================
let careDojoAt = 0, careDojoN = 0, careDojoAsked = "";
function careDojoNudge() {
  const u = currUser();
  if (!u || u.role !== "student" || window.__authLoading || document.hidden || ecaIsPlaying() || typeof dojoDue !== "function") return;
  if (careDojoAsked !== u.id) { careDojoAsked = u.id; if (typeof dojoRefresh === "function") dojoRefresh(); return; }
  if (arena.puz.review) return;
  const n = dojoDue().length, now = Date.now();
  if (!n || now - careDojoAt < 30 * 60000 || (n <= careDojoN && now - careDojoAt < 3 * 3600000)) return;
  careDojoAt = now; careDojoN = n;
  toast(CARE(`🥋 عندك ${n} ${n === 1 ? "لغز" : "ألغاز"} تقدر تنتقم منها دلوقتي. اضغط «العب دلوقتي».`, `🥋 ${n} puzzle${n === 1 ? "" : "s"} ready for revenge. Tap «Play now».`));
  if (tab === "home") render();
}
window.careDojoNudge = careDojoNudge;
setInterval(careDojoNudge, 60000);
setTimeout(careDojoNudge, 8000);

// =====================================================================================
// المرحلة 3: ضد الانقطاع
// =====================================================================================

// ================= أي حاجة بتظهر فجأة تستنى لحد ما اللعبة تخلص =================
const careHeld = [];
function ecaWhenFree(fn) {
  if (!ecaIsPlaying()) return fn();
  if (careHeld.length < 8) careHeld.push(fn);
}
window.ecaWhenFree = ecaWhenFree;
setInterval(() => { while (careHeld.length && !ecaIsPlaying()) { try { careHeld.shift()(); } catch (e) { console.warn("Held popup failed:", e); } } }, 1000);
{
  // الإنجازات (fx.js كان بيستنى rush والمبارزات بس)
  const _fp = fxPlaying;
  fxPlaying = function () { return _fp.apply(this, arguments) || ecaIsPlaying(); };
  // جوايز الكوتش الفورية
  const _dn = dropNext;
  let careDropT = 0;
  dropNext = async function () {
    if (!DROP.showing && DROP.queue.length && ecaIsPlaying()) { clearTimeout(careDropT); careDropT = setTimeout(() => dropNext(), 1500); return; }
    return _dn.apply(this, arguments);
  };
  // تشجيع الزمايل
  const _ep = ecaEmotePop;
  ecaEmotePop = function (item, delay) { if (ecaIsPlaying()) return ecaWhenFree(() => _ep(item, 0)); return _ep.apply(this, arguments); };
}

// ================= دور البوت: ما يضيعش بالغلط =================
// الخروج من الدور لسه بيتحسب خسارة (عشان محدش يهرب من دور خسران)، بس:
// 1) لو داس على تاب تاني بالغلط بيتسأل الأول. 2) لو الصفحة اتقفلت أو الموبايل فصل، الدور بيتحفظ ويقدر يكمّله خلال 15 دقيقة،
// ولو ما رجعش أو رفض بيتحسب خسارة زي الأول.
const CARE_RESUME = "ECA_BOT_RESUME", CARE_RESUME_MS = 15 * 60000;
function careGameLive() { const P = arena.play; return !!(P.game && !P.over && P.game.history().length); }
function careSaveGame() {
  const P = arena.play, u = currUser();
  if (!u || u.role !== "student" || !careGameLive()) return false;
  const rem = c => P.clk ? Math.max(0, P.clk[c] - (P.game.turn() === c ? Date.now() - P.clk.last : 0)) : 0;
  try {
    localStorage.setItem(CARE_RESUME, JSON.stringify({ uid: u.id, pgn: P.game.pgn(), level: P.level, coachLevel: P.coachLevel || 1, color: P.color, tc: P.tc, inc: P.inc || 0,
      clk: P.clk ? { w: rem("w"), b: rem("b") } : null, at: Date.now() }));
    return true;
  } catch (_) { return false; }
}
window.careSaveGame = careSaveGame;
function careResumeData() {
  let d = null;
  try { d = JSON.parse(localStorage.getItem(CARE_RESUME) || "null"); } catch (_) {}
  const u = currUser();
  return d && u && d.uid === u.id && typeof d.pgn === "string" ? d : null;
}
window.careResumeData = careResumeData;
function careResumeClear() { try { localStorage.removeItem(CARE_RESUME); } catch (_) {} }
// بيرجّع الدور زي ما كان (الساعة واقفة وهو غايب)
function careLoadGame(d) {
  const P = arena.play;
  if (d.level === COACH_BOT) { P.game = null; setCoachLevel(Math.max(1, Number(d.coachLevel) || 1)); } else P.level = Math.max(0, Math.min(LEVELS.length - 1, Number(d.level) || 0));
  const g = new ChessCls(); g.loadPgn(d.pgn);
  Object.assign(P, { game: g, over: "", reason: "", sel: null, pre: null, promo: null, thinking: false, color: d.color === "b" ? "b" : "w", tc: Number(d.tc) || 0, inc: Number(d.inc) || 0,
    clk: d.clk ? { w: Number(d.clk.w) || 0, b: Number(d.clk.b) || 0, last: Date.now() } : null, last: lastOf(g) });
  P.flip = P.color === "b";
}
function careResume() {
  const d = careResumeData();
  if (!d || typeof ChessCls === "undefined" || !ChessCls) return;
  careResumeClear();
  careLoadGame(d);
  arena.sub = "play"; if (tab !== "arena") switchTab("arena"); else render();
  if (arena.play.game.turn() !== arena.play.color) playEngine();
}
window.careResume = careResume;
async function careResumeDecline() {
  const d = careResumeData();
  if (!d || typeof ChessCls === "undefined" || !ChessCls) return;
  careResumeClear();
  careLoadGame(d);
  await playFinish("loss", "left");
  playNew();
}
window.careResumeDecline = careResumeDecline;
// الدور المحفوظ خلص وقته: بيتحسب خسارة أول ما الشطرنج يبقى جاهز
setInterval(() => {
  const d = careResumeData();
  if (d && Date.now() - d.at > CARE_RESUME_MS && typeof ChessCls !== "undefined" && ChessCls && !careGameLive()) careResumeDecline();
}, 5000);
function careResumeHTML() {
  const d = careResumeData();
  if (!d || Date.now() - d.at > CARE_RESUME_MS || careGameLive()) return "";
  const name = d.level === COACH_BOT ? "Coach" : (LEVELS[d.level] || {}).name || "";
  return `<div class="eca-play-strip rounded-2xl px-4 py-3 flex-wrap" role="region" aria-label="${esc(CARE("دور لسه ما خلصش", "Unfinished game"))}">
    <span class="text-2xl" aria-hidden="true">♟️</span>
    <span class="min-w-0 flex-1"><b class="block text-sm">${esc(CARE(`دورك ضد ${name} لسه ما خلصش`, `Your game against ${name} is not finished`))}</b>
      <span class="block text-xs opacity-80">${esc(CARE("كمّل من مكان ما وقفت. لو مش هتكمّله هيتحسب خسارة.", "Pick up where you left off. If you do not, it counts as a loss."))}</span></span>
    <button type="button" onclick="careResume()" class="tap rounded-xl px-4 text-xs font-bold gold-btn">▶ ${CARE("كمّل الدور", "Resume")}</button>
    <button type="button" onclick="careResumeDecline()" class="tap rounded-xl px-3 text-xs font-bold bg-black/30 text-white border border-white/30">${CARE("لا", "No")}</button>
  </div>`;
}
{
  const _av = renderArenaView;
  renderArenaView = function (u) {
    const html = _av.apply(this, arguments), r = u && u.role === "student" && arena.sub === "play" ? careResumeHTML() : "";
    return r ? `<div class="space-y-3">${r}${html}</div>` : html;
  };
  // تاب تاني في نص الدور: سؤال الأول
  const ask = () => window.confirm(CARE("الدور لسه شغّال. لو خرجت هيتحسب خسارة. تخرج؟", "Your game is still on. Leaving counts as a loss. Leave?"));
  const _st = switchTab;
  switchTab = function (t) { if (careGameLive() && tab === "arena" && arena.sub === "play" && t !== "arena" && !ask()) return; return _st.apply(this, arguments); };
  const _as = arenaSub;
  arenaSub = function (k) { if (careGameLive() && tab === "arena" && arena.sub === "play" && k !== "play" && !ask()) return; return _as.apply(this, arguments); };
  window.switchTab = switchTab; window.arenaSub = arenaSub;
}

// ================= «ثبّت التطبيق» بعد تالت يوم زيارة، مرة كل أسبوعين بالكتير =================
const CARE_VISITS = "ECA_VISIT_DAYS", CARE_INSTALL_NO = "ECA_INSTALL_LATER";
function careVisitDays() {
  let days = [];
  try { days = JSON.parse(localStorage.getItem(CARE_VISITS) || "[]"); } catch (_) {}
  if (!Array.isArray(days)) days = [];
  const today = todayISO();
  if (!days.includes(today)) { days = days.concat(today).slice(-10); try { localStorage.setItem(CARE_VISITS, JSON.stringify(days)); } catch (_) {} }
  return days.length;
}
function careInstallCheck() {
  const u = currUser(), standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  if (!u || standalone || document.getElementById("ecaInstallCard") || ecaIsPlaying()) return false;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent), can = typeof deferredInstall !== "undefined" && !!deferredInstall;
  if (!can && !ios) return false;
  let later = 0; try { later = Number(localStorage.getItem(CARE_INSTALL_NO)) || 0; } catch (_) {}
  if (careVisitDays() < 3 || Date.now() - later < 14 * 864e5) return false;
  const el = document.createElement("div");
  el.id = "ecaInstallCard"; el.className = "eca-install-card"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", CARE("ثبّت التطبيق", "Install the app"));
  el.innerHTML = `<img src="icon-192.png" alt="" width="44" height="44" class="rounded-xl shrink-0">
    <div class="min-w-0 flex-1"><b class="block text-sm">${esc(CARE("ثبّت ECA على موبايلك", "Install ECA on your phone"))}</b>
      <span class="block text-xs opacity-80">${esc(ios && !can ? CARE("اضغط زرار المشاركة ⬆️ وبعدين «إضافة إلى الشاشة الرئيسية».", "Tap Share ⬆️ then «Add to Home Screen».") : CARE("يفتح على طول كأنه تطبيق، من غير المتصفح.", "Opens straight away like an app, no browser bars."))}</span></div>
    ${can ? `<button type="button" onclick="careInstallYes()" class="tap rounded-xl px-4 text-xs font-bold gold-btn">${esc(CARE("ثبّت", "Install"))}</button>` : ""}
    <button type="button" onclick="careInstallLater()" class="tap rounded-xl px-3 text-xs font-bold" aria-label="${esc(CARE("مش دلوقتي", "Not now"))}">✕</button>`;
  document.body.appendChild(el);
  return true;
}
window.careInstallCheck = careInstallCheck;
function careInstallLater() { try { localStorage.setItem(CARE_INSTALL_NO, String(Date.now())); } catch (_) {} const el = document.getElementById("ecaInstallCard"); if (el) el.remove(); }
function careInstallYes() { careInstallLater(); if (typeof installApp === "function") installApp(); }
window.careInstallLater = careInstallLater;
window.careInstallYes = careInstallYes;
setTimeout(careInstallCheck, 20000);
// الموبايل ممكن يقفل الصفحة وهي في الخلفية من غير pagehide: بنحفظ الدور أول ما تستخبى، ولو رجع والصفحة لسه عايشة بنمسح الحفظ
document.addEventListener("visibilitychange", () => { if (document.hidden) careSaveGame(); else if (careGameLive()) careResumeClear(); });
