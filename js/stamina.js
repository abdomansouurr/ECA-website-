// ECA — stamina.js: تذكير الراحة
// بيعدّ وقت اللعب الفعلي بس (لمس أو ضغط في آخر دقيقتين والصفحة ظاهرة). بعد 45 دقيقة متواصلة
// بيقترح راحة 5 دقايق بشكل لطيف. لو الطالب غاب 10 دقايق أو أكتر العدّاد بيبدأ من الأول.

const STAMINA_LIMIT_MS = 45 * 60000, STAMINA_BREAK_S = 5 * 60, STAMINA_TICK_MS = 15000;
const STAMINA_ACTIVE_MS = 2 * 60000, STAMINA_RESET_MS = 10 * 60000, STAMINA_KEY = "ECA_STAMINA";
let staminaMs = 0, staminaLastInput = 0, staminaLastTick = Date.now(), staminaPending = false, staminaTimer = null;
try { const s = JSON.parse(sessionStorage.getItem(STAMINA_KEY) || "null"); if (s && Date.now() - s.at < STAMINA_RESET_MS) staminaMs = Number(s.ms) || 0; } catch (_) {}

function staminaSave() { try { sessionStorage.setItem(STAMINA_KEY, JSON.stringify({ ms: staminaMs, at: Date.now() })); } catch (_) {} }
["pointerdown", "keydown", "touchstart"].forEach(type => document.addEventListener(type, () => { staminaLastInput = Date.now(); }, { passive: true }));

// مش بنقاطع لعبة ولا امتحان ولا اختبار تحديد المستوى
function staminaBusy() {
  const a = typeof arena !== "undefined" ? arena : {}, play = s => s && ["play", "wrong", "live", "claiming"].includes(s.status);
  if (tab === "arena" && (play(a.rush) || play(a.duel) || play(a.speed) || (a.play && a.play.game && !a.play.over))) return true;
  if (typeof activeExam !== "undefined" && activeExam) return true;
  return !!document.querySelector("#ecaSpinModal, #ecaChestModal, #ecaMilestone, #ecaBreakModal");
}
function staminaTick() {
  const now = Date.now(), gap = now - staminaLastTick, u = currUser();
  staminaLastTick = now;
  if (!u || u.role !== "student") { staminaMs = 0; return; }
  if (document.hidden) return;
  if (now - staminaLastInput > STAMINA_RESET_MS || gap > STAMINA_RESET_MS) { staminaMs = 0; staminaSave(); return; }
  if (now - staminaLastInput <= STAMINA_ACTIVE_MS) staminaMs += Math.min(gap, STAMINA_TICK_MS * 2);
  staminaSave();
  if (staminaMs >= STAMINA_LIMIT_MS) staminaPending = true;
  if (staminaPending && !staminaBusy()) { staminaPending = false; staminaMs = 0; staminaSave(); ecaBreakOpen(); }
}
setInterval(staminaTick, STAMINA_TICK_MS);
window.ecaStaminaTick = staminaTick;
window.ecaStaminaSet = ms => { staminaMs = ms; staminaLastInput = Date.now(); staminaLastTick = Date.now(); };

function ecaBreakClose() {
  clearInterval(staminaTimer); staminaTimer = null;
  const el = document.getElementById("ecaBreakModal"); if (el) el.remove();
  staminaMs = 0; staminaSave();
}
window.ecaBreakClose = ecaBreakClose;
function ecaBreakOpen() {
  if (document.getElementById("ecaBreakModal")) return;
  const en = lang === "en", u = currUser();
  const mascot = u && typeof ecaPetOf === "function" && ecaPetOf(u).kind ? ecaPetOf(u).icon : "🦉";
  const el = document.createElement("div");
  el.id = "ecaBreakModal";
  el.className = "eca-spin-modal";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", en ? "Time for a short break" : "وقت راحة قصيرة");
  el.innerHTML = `<div class="gold-card rounded-2xl p-6 space-y-4 text-center eca-milestone-box">
    <div class="eca-pet" aria-hidden="true">${esc(mascot)}</div>
    <h3 class="font-display font-bold text-xl text-yellow-300">${en ? "Great training! Time to recharge" : "تمرين جامد! وقت تشحن طاقتك"}</h3>
    <p class="text-sm text-gray-200">${en ? "You have trained for 45 minutes. Rest your eyes, drink some water and stretch for 5 minutes. Your brain gets stronger while you rest." : "بقالك 45 دقيقة بتتمرن. ريّح عينك، واشرب مية، واتمطّع 5 دقايق. مخك بيقوى وانت مرتاح."}</p>
    <p class="text-4xl font-extrabold text-sky-300" id="ecaBreakLeft" dir="ltr" aria-live="polite">5:00</p>
    <button type="button" onclick="ecaBreakClose()" class="tap w-full rounded-xl text-sm font-bold gold-btn">${en ? "Back to training" : "رجوع للتمرين"}</button>
  </div>`;
  document.body.appendChild(el);
  const ends = Date.now() + STAMINA_BREAK_S * 1000;
  staminaTimer = setInterval(() => {
    const left = Math.max(0, Math.ceil((ends - Date.now()) / 1000)), t = document.getElementById("ecaBreakLeft");
    if (!t) { clearInterval(staminaTimer); return; }
    t.textContent = left ? Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0") : (en ? "Recharged! 🎉" : "اتشحنت! 🎉");
    if (!left) clearInterval(staminaTimer);
  }, 1000);
}
window.ecaBreakOpen = ecaBreakOpen;
