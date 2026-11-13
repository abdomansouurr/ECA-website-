// ECA — daily.js: لغز اليوم مرة واحدة في اليوم (اليوم بتوقيت القاهرة للكل) + عدّاد للغز الجاي
// القفل: arena.lastDailyPuzzleSolvedDate في ملف الطالب (بيتكتب مع جايزة لغز اليوم في نفس العملية، والقواعد بترفض جايزة تانية في نفس اليوم).
// جوه arena مش في أول الملف: القواعد بتحميه ببند واحد مع النجوم والخبرة، فمفيش عمليات زيادة على كل كتابة (حد الـ 1000)
// + نسخة في localStorage عشان القفل يظهر على طول بعد إعادة التحميل من غير ما يرمش.
const DLY = (ar, en) => lang === "en" ? en : ar;
function getDailyDateKey(d) {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Africa/Cairo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d || new Date());
  const p = t => parts.find(x => x.type === t).value;
  return p("year") + "-" + p("month") + "-" + p("day");
}
// الوقت الباقي لنص الليل بتوقيت القاهرة
function ecaDailyLeftMs(d) {
  d = d || new Date();
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Africa/Cairo", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(d);
  const p = t => Number(parts.find(x => x.type === t).value) || 0;
  return Math.max(0, (86400 - (p("hour") % 24) * 3600 - p("minute") * 60 - p("second")) * 1000 - d.getMilliseconds());
}
const ecaDailyCacheKey = (uid, day) => `eca_daily_solved_${uid}_${day}`;
function ecaDailySolved(u) {
  u = u || (typeof currUser === "function" ? currUser() : null);
  if (!u || u.role !== "student") return false;
  const day = getDailyDateKey();
  if ((u.arena || {}).lastDailyPuzzleSolvedDate === day) return true;
  try { return localStorage.getItem(ecaDailyCacheKey(u.id, day)) === "1"; } catch (_) { return false; }
}
function ecaDailyMark(u) { try { localStorage.setItem(ecaDailyCacheKey(u.id, getDailyDateKey()), "1"); } catch (_) {} }
function ecaDailyClock(ms) { const s = Math.ceil(ms / 1000), z = n => String(n).padStart(2, "0"); return z(Math.floor(s / 3600)) + ":" + z(Math.floor(s % 3600 / 60)) + ":" + z(s % 60); }
function ecaDailyLockedMsg() {
  const ms = ecaDailyLeftMs(), h = Math.floor(ms / 3600000), m = Math.floor(ms % 3600000 / 60000);
  return DLY(`أحسنت يا بطل! حليت لغز النهاردة خلاص 🎉 استعد للغز بكرة بعد ${h} ساعة و ${m} دقيقة`, `Well done, champ! You already solved today's puzzle 🎉 The next one comes in ${h}h ${m}m`);
}
// فتح لغز اليوم من اللوبي أو الإشعار
function ecaDailyOpen() {
  if (ecaDailySolved()) return toast(ecaDailyLockedMsg());
  const Z = arena.puz;
  Z.lesson = ""; Z.review = false; Z.diff = "daily"; Z.game = null; Z.status = "idle";
  if (typeof tab !== "undefined" && tab !== "arena") switchTab("arena");
  arenaSub("puzzles");
}
window.getDailyDateKey = getDailyDateKey;
window.ecaDailySolved = ecaDailySolved;
window.ecaDailyOpen = ecaDailyOpen;
window.ecaDailyLeftMs = ecaDailyLeftMs;
window.ecaDailyClock = ecaDailyClock;
{
  // لغز اليوم مقفول: أي محاولة تفتحه (القايمة، الإشعار، اللغز الجاي بعد الحل) بتروح لـ «سهل» مع رسالة
  const _pl = puzLoad;
  puzLoad = function () {
    const Z = arena.puz;
    if (Z.diff === "daily" && !Z.lesson && !Z.review && ecaDailySolved()) { toast(ecaDailyLockedMsg()); Z.diff = "easier"; }
    return _pl.apply(this, arguments);
  };
  // لغز اليوم اتحل: بيتقفل على الجهاز ده على طول (والسيرفر بيقفله مع الجايزة)
  const _pc = puzCount;
  puzCount = function (solved) {
    const Z = arena.puz, u = typeof currUser === "function" ? currUser() : null;
    if (solved && !Z.counted && Z.diff === "daily" && !Z.lesson && !Z.review && u && u.role === "student") ecaDailyMark(u);
    return _pc.apply(this, arguments);
  };
}
// كل ثانية: العدّاد في اللوبي بيتحدّث، وأول ما اليوم يتغير (نص الليل في القاهرة) الكارت بيتفتح لوحده
let ecaDailyDay = getDailyDateKey();
setInterval(() => {
  const day = getDailyDateKey();
  if (day !== ecaDailyDay) { ecaDailyDay = day; if (typeof tab !== "undefined" && (tab === "arena" || tab === "home")) render(); return; }
  const el = document.getElementById("lbDailyClock");
  if (el) el.textContent = ecaDailyClock(ecaDailyLeftMs());
}, 1000);
