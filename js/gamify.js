// ECA — gamify.js: شريط اللاعب (HUD) + المؤثرات الصوتية + الأهداف اليومية
// بيعتمد على: calcXP, rankOf, streaks (extras.js) و todayISO, currUser, lang, toast (core.js)

// ================= المؤثرات الصوتية (Web Audio من غير ملفات) =================
const SFX_KEY = "ECA_SFX_OFF";
let sfxCtx = null;
window.ecaSfxMuted = false;
try { window.ecaSfxMuted = localStorage.getItem(SFX_KEY) === "1"; } catch (_) {}

function sfxNotes(notes, gap, length, volume) {
  if (window.ecaSfxMuted) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  try {
    sfxCtx = sfxCtx || new Ctx();
    if (sfxCtx.state === "suspended") sfxCtx.resume().catch(() => {});
    notes.forEach((frequency, i) => {
      const osc = sfxCtx.createOscillator(), gain = sfxCtx.createGain(), start = sfxCtx.currentTime + i * gap;
      osc.type = "triangle";
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
      osc.connect(gain);
      gain.connect(sfxCtx.destination);
      osc.start(start);
      osc.stop(start + length + 0.02);
    });
  } catch (e) { console.warn("Sound unavailable:", e); }
}
// combo: النغمة بتعلى مع كل حل صح ورا بعض (لحد 10)
function ecaSfx(name, combo) {
  if (name === "ting") return sfxNotes([1318, 1760], 0.06, 0.22, 0.12);
  if (name === "combo") {
    const base = 660 * Math.pow(2, Math.min(Number(combo) || 1, 10) / 12);
    return sfxNotes([base, base * 1.26, base * 1.5], 0.07, 0.18, 0.12);
  }
  if (name === "levelup") return sfxNotes([523, 659, 784, 1047, 784, 1047, 1319], 0.11, 0.3, 0.14);
}
window.ecaSfx = ecaSfx;
function ecaToggleSfx() {
  window.ecaSfxMuted = !window.ecaSfxMuted;
  try { localStorage.setItem(SFX_KEY, window.ecaSfxMuted ? "1" : "0"); } catch (_) {}
  if (!window.ecaSfxMuted) ecaSfx("ting");
  ecaHudUpdate();
}
window.ecaToggleSfx = ecaToggleSfx;

// ================= شريط اللاعب (HUD) =================
// العناصر بتتبني مرة واحدة وبعدها بنحدّث قيمها بس، عشان حركة شريط الخبرة تشتغل
function ecaHudBuild(el) {
  el.innerHTML = `<div class="eca-hud-inner">
    <img class="eca-hud-icon" id="ecaHudIcon" alt="" width="28" height="28" hidden />
    <div class="eca-hud-xp">
      <div class="eca-hud-row"><b id="ecaHudRank"></b><span id="ecaHudPoints" dir="ltr"></span></div>
      <div class="eca-hud-track" id="ecaHudTrack" role="progressbar" aria-valuemin="0" aria-valuemax="100"><div class="eca-hud-fill" id="ecaHudFill"></div></div>
    </div>
    <span class="eca-hud-stat" id="ecaHudStars"></span>
    <span class="eca-hud-stat" id="ecaHudStreak"></span>
    <button type="button" class="eca-hud-sound" id="ecaHudSound" onclick="ecaToggleSfx()"></button>
  </div>`;
}
function ecaXpProgress(xp) {
  const r = rankOf(xp), from = r.cur ? r.cur.pts : 0, to = r.next ? r.next.pts : from;
  return { rank: r, percent: to > from ? Math.min(100, Math.round(((xp - from) / (to - from)) * 100)) : 100, to };
}
function ecaShowLevelUp(label) {
  ecaSfx("levelup");
  const pop = document.createElement("div");
  pop.className = "eca-levelup";
  pop.setAttribute("role", "status");
  const title = document.createElement("b"), name = document.createElement("span");
  title.textContent = lang === "en" ? "Level up!" : "رتبة جديدة!";
  name.textContent = label;
  pop.append(title, name);
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), 2800);
}
// الترقية بتتحفظ لكل طالب على الجهاز، عشان الاحتفال يظهر مرة واحدة بس ومايظهرش مع أول تحميل
function ecaCheckLevelUp(u, rank) {
  const key = "ECA_RANK_" + u.id, pts = rank.cur ? rank.cur.pts : 0;
  let saved = null;
  try { saved = localStorage.getItem(key); } catch (_) {}
  if (saved !== null && pts > Number(saved) && rank.cur) ecaShowLevelUp(rank.cur.label);
  if (saved === null || pts > Number(saved)) { try { localStorage.setItem(key, String(pts)); } catch (_) {} }
}
function ecaHudUpdate() {
  const el = document.getElementById("ecaHud");
  if (!el) return;
  const u = currUser();
  if (!u || u.role !== "student") { el.hidden = true; el.innerHTML = ""; return; }
  el.hidden = false;
  if (!el.firstElementChild) ecaHudBuild(el);
  const en = lang === "en", a = u.arena || {}, xp = calcXP(u).total, p = ecaXpProgress(xp), cur = p.rank.cur;
  const icon = document.getElementById("ecaHudIcon");
  if (cur) { icon.hidden = false; if (icon.getAttribute("src") !== cur.icon) icon.setAttribute("src", cur.icon); } else icon.hidden = true;
  document.getElementById("ecaHudRank").textContent = cur ? cur.label : (en ? "No rank yet" : "لسه بدون رتبة");
  document.getElementById("ecaHudPoints").textContent = p.rank.next ? xp + " / " + p.to + " XP" : xp + " XP";
  document.getElementById("ecaHudFill").style.width = p.percent + "%";
  const track = document.getElementById("ecaHudTrack");
  track.setAttribute("aria-valuenow", String(p.percent));
  track.setAttribute("aria-label", en ? "Progress to the next rank" : "التقدم للرتبة الجاية");
  const stars = Number(a.stars) || 0, streak = streaks(a.days).current;
  const starsEl = document.getElementById("ecaHudStars"), streakEl = document.getElementById("ecaHudStreak");
  starsEl.textContent = "⭐ " + stars;
  starsEl.title = en ? "Your stars" : "نجومك";
  streakEl.textContent = "🔥 " + streak;
  streakEl.title = en ? "Training days in a row" : "أيام تمرين ورا بعض";
  const sound = document.getElementById("ecaHudSound"), soundLabel = window.ecaSfxMuted ? (en ? "Turn sound on" : "شغّل الصوت") : (en ? "Turn sound off" : "اقفل الصوت");
  sound.textContent = window.ecaSfxMuted ? "🔇" : "🔊";
  sound.title = soundLabel;
  sound.setAttribute("aria-label", soundLabel);
  ecaCheckLevelUp(u, p.rank);
}
window.ecaHudUpdate = ecaHudUpdate;
{ const _r = render; render = function () { const out = _r.apply(this, arguments); ecaHudUpdate(); return out; }; }

// ================= الأهداف اليومية =================
// لازم نفس النجوم في firestore.rules (questStars) وفي awardStudentActivity
const ECA_QUESTS = [
  { key: "daily", goal: 1, stars: 1, ar: "حل لغز اليوم صح", en: "Solve today's puzzle" },
  { key: "puzzles", goal: 3, stars: 2, ar: "حل 3 ألغاز في ساحة التدريب", en: "Solve 3 puzzles in the training arena" },
  { key: "win", goal: 1, stars: 2, ar: "اكسب دور ضد أي بوت", en: "Win a game against any bot" }
];
// العدّادات بتتحدّث جوه نفس عملية حفظ المحاولة أو الدور
function ecaQuestBump(a, kind) {
  const day = todayISO();
  if (a.qd !== day) { a.qd = day; a.qp = 0; a.qw = 0; }
  if (kind === "puzzles") a.qp = (Number(a.qp) || 0) + 1;
  if (kind === "win") a.qw = (Number(a.qw) || 0) + 1;
}
window.ecaQuestBump = ecaQuestBump;
function ecaQuestProgress(u, key) {
  const a = u.arena || {}, today = a.qd === todayISO();
  if (key === "puzzles") return today ? Number(a.qp) || 0 : 0;
  if (key === "win") return today ? Number(a.qw) || 0 : 0;
  const done = (u.puzDone || {})[typeof puzDayKey === "function" ? puzDayKey(u.level) : ""];
  return done && done.ok ? 1 : 0;
}
function ecaQuestClaimed(u, key) {
  const c = (u.arena || {}).qc;
  return !!(c && c.d === todayISO() && Array.isArray(c.k) && c.k.includes(key));
}
const ecaQuestBusy = new Set();
async function ecaClaimQuest(key) {
  const u = currUser(), quest = ECA_QUESTS.find(q => q.key === key);
  if (!u || u.role !== "student" || !quest || ecaQuestBusy.has(key)) return;
  if (ecaQuestProgress(u, key) < quest.goal || ecaQuestClaimed(u, key)) return;
  ecaQuestBusy.add(key);
  render();
  try { await window.ecaAwardStudentActivity("quest", key); }
  finally { ecaQuestBusy.delete(key); render(); }
}
window.ecaClaimQuest = ecaClaimQuest;
function ecaQuestsCardHTML(u) {
  const en = lang === "en";
  const rows = ECA_QUESTS.map(q => {
    const value = Math.min(ecaQuestProgress(u, q.key), q.goal), claimed = ecaQuestClaimed(u, q.key), ready = value >= q.goal && !claimed, busy = ecaQuestBusy.has(q.key);
    const action = claimed
      ? `<span class="eca-quest-done">✓ ${en ? "Claimed" : "اتاخدت"}</span>`
      : ready
        ? `<button type="button" onclick="ecaClaimQuest('${q.key}')" ${busy ? "disabled" : ""} class="tap px-4 rounded-xl text-xs font-bold gold-btn">${busy ? "…" : (en ? "Claim" : "استلم")} ⭐ ${q.stars}</button>`
        : `<span class="eca-quest-reward">⭐ ${q.stars}</span>`;
    return `<div class="eca-quest${claimed ? " is-claimed" : ""}">
      <div class="eca-quest-text">
        <div class="eca-quest-title">${en ? q.en : q.ar}</div>
        <div class="eca-quest-track" role="progressbar" aria-valuemin="0" aria-valuemax="${q.goal}" aria-valuenow="${value}" aria-label="${en ? q.en : q.ar}"><div style="width:${Math.round((value / q.goal) * 100)}%"></div></div>
      </div>
      <span class="eca-quest-count" dir="ltr">${value}/${q.goal}</span>
      ${action}
    </div>`;
  }).join("");
  return `<section class="gold-card rounded-2xl p-4 space-y-3" aria-label="${en ? "Daily quests" : "أهداف اليوم"}">
    <h3 class="font-bold text-yellow-300">🎯 ${en ? "Daily quests" : "أهداف اليوم"}</h3>
    ${rows}
  </section>`;
}
{
  const _sh = renderStudentHome;
  renderStudentHome = function (s) { return `<div class="space-y-6">${ecaQuestsCardHTML(s)}${_sh(s)}</div>`; };
}

// ================= ربط الأصوات باللحظات المهمة =================
{
  const _pc = puzCount;
  puzCount = function (solved) {
    const Z = arena.puz, u = currUser();
    if (solved && !Z.counted && !Z.review) {
      const streak = (u && u.arena && Number(u.arena.puzStreak)) || 0;
      if (streak >= 1) ecaSfx("combo", streak + 1); else ecaSfx("ting");
    }
    return _pc(solved);
  };
  const _aw = awardStudentActivity;
  awardStudentActivity = function (source, key, score) {
    if (source === "lesson" || (source === "puzzle" && key === "daily")) ecaSfx("ting");
    return _aw(source, key, score);
  };
}
