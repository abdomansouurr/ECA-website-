// ECA — flow.js: «العب دلوقتي» (النشاط الجاي للطالب بضغطة واحدة) + تحميل مسبق في الخلفية
// بيختار للطالب الحاجة الأهم دلوقتي بالترتيب: جوايز جاهزة، واجب الزعيم، مهمة الدرس، تحدي الأسبوع، الدوجو، دور ضد بوت،
// وبعدهم ألغاز دروس على قد مستواه من غير نهاية. فمحتاجش يفكر يعمل إيه بعد كده.

const FLL = (ar, en) => lang === "en" ? en : ar;

// ================= 1) تحميل مسبق: مكتبة الشطرنج وبنوك الألغاز في وقت فاضي بعد الدخول =================
let flWarmed = "";
function flWarmUp() {
  const u = currUser();
  if (!u || u.role !== "student" || window.__authLoading || flWarmed === u.id) return;
  const c = navigator.connection;
  if (c && (c.saveData || /(^|-)2g$/.test(String(c.effectiveType || "")))) return;   // باقة ضعيفة: نحمّل وقت الحاجة بس
  flWarmed = u.id;
  const idle = (f, ms) => window.requestIdleCallback ? requestIdleCallback(f, { timeout: ms }) : setTimeout(f, 1200);
  idle(() => {
    try { if (typeof loadChess === "function") loadChess(); } catch (_) {}
    idle(() => {
      if (window.loadThemeBank) loadThemeBank().catch(() => {});
      idle(() => { if (typeof loadPuzzleBank === "function") loadPuzzleBank().catch(() => {}); }, 6000);
    }, 5000);
  }, 3000);
}
window.flWarmUp = flWarmUp;

// ================= 2) النشاط الجاي =================
function flRandomLesson(u) {
  const level = Math.min(6, Number(u.level) || 1), att = u.att || {}, keys = Object.keys(ECA_LESSON_THEMES);
  let pool = keys.filter(k => lpStepOf(k) <= level && att[k] === true);
  if (!pool.length) pool = keys.filter(k => lpStepOf(k) <= level);
  return pool[Math.floor(Math.random() * pool.length)] || lpDailyLesson(u);
}
function flNext(u) {
  if (!u || u.role !== "student") return null;
  // دور بوت اتقطع (الصفحة اتقفلت أو النت فصل)
  const left = window.careResumeData ? careResumeData() : null;
  if (left && Date.now() - left.at < 15 * 60000 && !careGameLive()) return { key: "resume", icon: "♟️", title: FLL("كمّل دورك اللي فات", "Finish your last game"), sub: FLL("لسه قدامك وقت تكمّله", "There is still time to finish it") };
  // جوايز خلصت ومستنية الاستلام
  const ready = (typeof ECA_QUESTS !== "undefined" ? ECA_QUESTS : []).find(q => ecaQuestProgress(u, q.key) >= q.goal && !ecaQuestClaimed(u, q.key));
  if (ready) return { key: "claim", icon: "🎁", title: FLL("جوايزك مستنياك", "Your rewards are waiting"), sub: FLL(`استلم ⭐ ${ready.stars} من أهداف النهاردة`, `Claim ⭐ ${ready.stars} from today's quests`), q: ready.key };
  // حدث الأسبوع خلص ومستني الاستلام
  const ev = window.funEventState ? funEventState(u) : null;
  if (ev && ev.done && !ev.claimed) return { key: "eventClaim", icon: "🎪", title: FLL("كسبت حدث الأسبوع!", "You won the weekly event!"), sub: FLL("استلم جايزتك", "Claim your reward") };
  // واجب الزعيم
  const boss = ((arena.boss && arena.boss.list) || []).find(b => !b.done && b.dueMs > Date.now() && (b.solved || []).length < b.puzzles.length);
  if (boss) { const hp = boss.puzzles.length - (boss.solved || []).length; return { key: "boss", icon: "🐉", title: FLL("واجب الزعيم: ", "Boss homework: ") + boss.title, sub: FLL(`باقي ${hp} ضربة`, `${hp} hits to go`), id: boss.id }; }
  // مهمة الدرس
  if (typeof lpDailyCount === "function" && lpDailyCount(u) < LP_GOAL) {
    const k = lpDailyLesson(u), n = lpDailyCount(u);
    return { key: "lesson", icon: "📚", title: FLL("مهمة النهاردة: ", "Today's mission: ") + lpTitle(k), sub: FLL(`${n} من ${LP_GOAL} ألغاز`, `${n} of ${LP_GOAL} puzzles`), lesson: k };
  }
  // تحدي الأسبوع
  const W = arena.weekly;
  if (W && W.doc && W.att && !W.att.solved && (Number(W.att.n) || 0) < 2) return { key: "weekly", icon: "🏅", title: FLL("تحدي الأسبوع", "Challenge of the week"), sub: FLL("حلّه وادخل قاعة المشاهير", "Solve it to enter the Hall of Fame") };
  // حدث الأسبوع
  if (ev && !ev.done) return { key: "event", icon: "🎪", title: FLL("حدث الأسبوع: ", "Weekly event: ") + lpThemeName(ev.theme), sub: FLL(`${ev.n} من ${FUN_EVENT_GOAL} لغز`, `${ev.n} of ${FUN_EVENT_GOAL} puzzles`) };
  // الدوجو: ألغاز غلط جه وقت الانتقام منها
  const due = typeof dojoDue === "function" ? dojoDue().length : 0;
  if (due) return { key: "dojo", icon: "🥋", title: FLL("دوجو الانتقام", "Dojo Revenge"), sub: FLL(`${due} لغز تقدر تنتقم منه دلوقتي`, `${due} puzzles ready for revenge`) };
  // دور ضد بوت (هدف المكسب)
  if (ecaQuestProgress(u, "win") < 1) return { key: "bot", icon: "🤖", title: FLL("العب دور ضد بوت", "Play a game against a bot"), sub: FLL("اكسب وخد ⭐ 2", "Win to earn ⭐ 2") };
  // من غير نهاية: ألغاز درس على قد مستواه
  return { key: "more", icon: "🧩", title: FLL("ألغاز على قد مستواك", "Puzzles at your level"), sub: FLL("كمّل تدريب وزوّد خبرتك", "Keep training and grow your XP") };
}
window.flNext = flNext;

// هو أصلاً جوه النشاط ده؟ (عشان الشريط ما يزنّش عليه)
function flHere(n) {
  if (!n || tab !== "arena") return false;
  if (n.key === "lesson" || n.key === "more") return arena.sub === "puzzles" && !!arena.puz.lesson;
  if (n.key === "event") return arena.sub === "puzzles" && arena.puz.lesson === "ev";
  return { boss: "boss", weekly: "weekly", bot: "play", dojo: "puzzles", resume: "play" }[n.key] === arena.sub;
}

function flGo(fn) { let tries = 0; const go = () => { if (typeof ChessCls !== "undefined" && ChessCls) fn(); else if (++tries < 60) setTimeout(go, 200); }; go(); }
function ecaPlayNow() {
  const u = currUser(), n = flNext(u);
  if (!n) return;
  if (window.ecaSfx) ecaSfx("ting");
  if (n.key === "resume") return careResume();
  if (n.key === "eventClaim") return funEventClaim();
  if (n.key === "event") return funEventStart();
  if (n.key === "claim") { if (tab !== "home") switchTab("home"); return ecaClaimQuest(n.q); }
  if (n.key === "lesson") return lpStart(n.lesson);
  if (n.key === "more") return lpStart(flRandomLesson(u));
  arena.sub = { boss: "boss", weekly: "weekly", bot: "play", dojo: "puzzles" }[n.key];
  if (tab !== "arena") switchTab("arena"); else render();
  if (n.key === "boss" && window.ecaBossOpen) flGo(() => ecaBossOpen(n.id));
  if (n.key === "dojo" && typeof reviewStart === "function") flGo(() => reviewStart());
}
window.ecaPlayNow = ecaPlayNow;

function flCardHTML(u, compact) {
  const n = flNext(u);
  if (!n || (compact && flHere(n))) return "";
  const label = FLL("العب دلوقتي", "Play now");
  if (compact) return `<button type="button" onclick="ecaPlayNow()" class="eca-play-strip tap w-full rounded-2xl px-4 text-start" aria-label="${esc(label + ": " + n.title)}">
      <span class="text-2xl shrink-0" aria-hidden="true">${n.icon}</span>
      <span class="min-w-0 flex-1"><b class="block truncate text-sm">${esc(n.title)}</b><span class="block truncate text-xs opacity-80">${esc(n.sub)}</span></span>
      <span class="shrink-0 text-xs font-bold">▶ ${label}</span></button>`;
  return `<section class="eca-play-now rounded-2xl p-4 sm:p-5 flex items-center gap-4" aria-label="${esc(label)}">
      <span class="eca-play-icon shrink-0" aria-hidden="true">${n.icon}</span>
      <div class="min-w-0 flex-1"><p class="text-xs font-bold opacity-80">${FLL("الخطوة الجاية", "Up next")}</p>
        <h2 class="font-display font-bold text-lg leading-snug truncate">${esc(n.title)}</h2>
        <p class="text-xs opacity-80 truncate">${esc(n.sub)}</p></div>
      <button type="button" onclick="ecaPlayNow()" class="tap shrink-0 rounded-xl px-5 text-sm font-bold gold-btn">▶ ${label}</button>
    </section>`;
}

// الصفحة الرئيسية: الكارت فوق كل حاجة. الساحة: شريط صغير فوق التابات
{
  const _sh = renderStudentHome;
  renderStudentHome = function (s) { const c = flCardHTML(s, false); return c ? `<div class="space-y-6">${c}${_sh(s)}</div>` : _sh(s); };
  const _av = renderArenaView;
  renderArenaView = function (u) { const html = _av.apply(this, arguments); const c = u && u.role === "student" ? flCardHTML(u, true) : ""; return c ? `<div class="space-y-3">${c}${html}</div>` : html; };
  const _r = render;
  render = function () { const out = _r.apply(this, arguments); flWarmUp(); return out; };
}
