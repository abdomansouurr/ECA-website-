// ECA — gamify.js: شريط اللاعب (HUD) + المؤثرات الصوتية + الأهداف اليومية
// بيعتمد على: calcXP, rankOf, streaks (extras.js) و todayISO, currUser, lang, toast (core.js)

// ================= المؤثرات الصوتية (Web Audio من غير ملفات) =================
const SFX_KEY = "ECA_SFX_OFF";
let sfxCtx = null;
window.ecaSfxMuted = false;
try { window.ecaSfxMuted = localStorage.getItem(SFX_KEY) === "1"; } catch (_) {}

// سياق صوت واحد للموقع كله. iOS Safari وكروم أندرويد بيبدأوه "suspended" لحد أول لمسة
function ecaAudio() {
  if (window.ecaSfxMuted) return null;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try {
    sfxCtx = sfxCtx || new Ctx();
    if (sfxCtx.state !== "running") sfxCtx.resume().catch(() => {});
    return sfxCtx;
  } catch (_) { return null; }
}
// أول لمسة (وبعد ما iOS يقطع الصوت بمكالمة أو رجوع من الخلفية) بتصحّي الصوت بصوت فاضي
(function () {
  const wake = () => {
    if (window.ecaSfxMuted || (sfxCtx && sfxCtx.state === "running")) return;
    const c = ecaAudio(); if (!c) return;
    try { const s = c.createBufferSource(); s.buffer = c.createBuffer(1, 1, 22050); s.connect(c.destination); s.start(0); } catch (_) {}
  };
  ["pointerdown", "touchstart", "keydown"].forEach(e => addEventListener(e, wake, { capture: true, passive: true }));
})();

function sfxNotes(notes, gap, length, volume) {
  try {
    if (!ecaAudio()) return;
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
    <span class="eca-hud-avatar" id="ecaHudAvatar" aria-hidden="true" hidden></span>
    <img class="eca-hud-icon" id="ecaHudIcon" alt="" width="28" height="28" hidden />
    <div class="eca-hud-xp">
      <div class="eca-hud-row"><b id="ecaHudRank"></b><span id="ecaHudPoints" dir="ltr"></span></div>
      <div class="eca-hud-track" id="ecaHudTrack" role="progressbar" aria-valuemin="0" aria-valuemax="100"><div class="eca-hud-fill" id="ecaHudFill"></div></div>
    </div>
    <span class="eca-hud-stat" id="ecaHudStars"></span>
    <span class="eca-hud-stat" id="ecaHudStreak"></span>
    <span class="eca-hud-stat" id="ecaHudFreeze" hidden></span>
    <button type="button" class="eca-hud-sound" id="ecaHudSound" onclick="ecaToggleSfx()"></button>
  </div>`;
}
function ecaXpProgress(xp) {
  const r = rankOf(xp), from = r.cur ? r.cur.pts : 0, to = r.next ? r.next.pts : from;
  return { rank: r, percent: to > from ? Math.min(100, Math.round(((xp - from) / (to - from)) * 100)) : 100, to };
}
function ecaShowLevelUp(label) {
  ecaSfx("levelup");
  if (window.ecaFireworks) { ecaFireworks(3); ecaShake(); }
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
  const avatarEl = document.getElementById("ecaHudAvatar"), avatar = ecaAvatarOf(u);
  const elite = window.ecaEliteClass ? ecaEliteClass(u.id) : "";
  avatarEl.hidden = !avatar && !elite; avatarEl.textContent = avatar || "♟";
  const frame = window.ecaFrameOf ? ecaFrameOf(u) : "";
  avatarEl.className = "eca-hud-avatar eca-frame" + (frame ? " eca-frame-" + frame : "") + (elite ? " " + elite : "");
  if (elite) avatarEl.title = ecaEliteLabel(u.id); else avatarEl.removeAttribute("title");
  const icon = document.getElementById("ecaHudIcon");
  if (cur) { icon.hidden = false; if (icon.getAttribute("src") !== cur.icon) icon.setAttribute("src", cur.icon); } else icon.hidden = true;
  document.getElementById("ecaHudRank").textContent = cur ? cur.label : (en ? "No rank yet" : "لسه بدون رتبة");
  document.getElementById("ecaHudPoints").textContent = p.rank.next ? xp + " / " + p.to + " XP" : xp + " XP";
  document.getElementById("ecaHudFill").style.width = p.percent + "%";
  const track = document.getElementById("ecaHudTrack");
  track.setAttribute("aria-valuenow", String(p.percent));
  track.setAttribute("aria-label", en ? "Progress to the next rank" : "التقدم للرتبة الجاية");
  const stars = Number(a.stars) || 0, streak = ecaStreak(u).current, freezes = Number((u.shop || {}).freezes) || 0;
  const freezeEl = document.getElementById("ecaHudFreeze");
  freezeEl.hidden = !freezes;
  freezeEl.textContent = "🧊 " + freezes;
  freezeEl.title = en ? "Streak Freezes" : "حماية السلسلة";
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
{ const _r = render; render = function () { ecaCosmeticsApply(); const out = _r.apply(this, arguments); ecaHudUpdate(); return out; }; }

// ================= جايزة Coach: لأعلى مستوى في اليوم =================
function ecaCoachRewardText(level) {
  const en = lang === "en", u = currUser(), cb = (u && u.arena && u.arena.cb) || {};
  const best = cb.d === todayISO() ? Number(cb.k) || 0 : 0, stars = level - best;
  if (stars <= 0) return en ? `You already won level ${best} today. Beat a higher level for more stars.` : `كسبت مستوى ${best} النهاردة. اكسب مستوى أعلى عشان نجوم أكتر.`;
  return en ? `Win at this level: +${stars} stars and ${stars * 20} XP (the reward counts your highest level today)` : `لو كسبت المستوى ده: +${stars} نجوم و${stars * 20} خبرة (الجايزة لأعلى مستوى تكسبه في اليوم)`;
}

// ================= لوحة الصدارة المباشرة =================
function ecaWeekKey() {
  const t = new Date(todayISO() + "T12:00:00Z");
  t.setUTCDate(t.getUTCDate() - (t.getUTCDay() + 1) % 7);   // الأسبوع بيبدأ يوم السبت
  return t.toISOString().slice(0, 10);
}
window.ecaWeekKey = ecaWeekKey;
const LB_TOP = 50;
let lbRows = null, lbFailed = false, lbUnsub = null, lbTab = "global";
function lbWatch() {
  const want = tab === "honor" && !!currUser() && !!window.fbBoardWatch;
  if (want && !lbUnsub) {
    lbUnsub = window.fbBoardWatch(rows => { lbRows = rows; lbFailed = false; if (window.ecaEliteFromRows) ecaEliteFromRows(rows); lbPaint(); }, () => { lbFailed = true; lbPaint(); });
  } else if (!want && lbUnsub) {
    lbUnsub(); lbUnsub = null; lbRows = null; lbFailed = false;
  }
}
function ecaLbSkeleton(en) {
  const row = `<li class="eca-lb-row" aria-hidden="true"><span class="eca-skel eca-skel-dot"></span><span class="eca-skel eca-skel-line"></span><span class="eca-skel eca-skel-num"></span></li>`;
  return `<ol class="space-y-2" role="status" aria-label="${en ? "Loading the leaderboard" : "بنحمّل اللوحة"}">${row.repeat(5)}</ol>`;
}
function lbPaint() {
  const el = document.getElementById("ecaLiveBoard"), u = currUser();
  if (el && u) el.outerHTML = ecaLiveBoardHTML(u);
}
function lbTabSet(key) { lbTab = key; lbPaint(); }
window.lbTabSet = lbTabSet;
function ecaLiveBoardHTML(u) {
  const en = lang === "en", isStudent = u.role === "student", wk = ecaWeekKey();
  const tabs = [["global", en ? "Global" : "الكل"], ...(isStudent ? [["group", en ? "My group" : "مجموعتي"]] : []), ["weekly", en ? "This week" : "الأسبوع ده"]];
  const active = tabs.some(t => t[0] === lbTab) ? lbTab : "global";
  const score = r => active === "weekly" ? (r.wk === wk ? Number(r.wx) || 0 : 0) : Number(r.xp) || 0;
  const list = (lbRows || []).filter(r => score(r) > 0 && (active !== "group" || (u.group && r.g === u.group)))
    .sort((a, b) => score(b) - score(a) || String(a.id).localeCompare(String(b.id)));
  const catalog = window.ecaShopCatalog || [];
  const row = (r, i) => {
    const me = r.id === u.id, avatar = catalog.find(x => x.id === r.a && x.cat === "avatar"), title = catalog.find(x => x.id === r.t && x.type === "title");
    return `<li class="eca-lb-row ${me ? "eca-lb-me" : ""}"${me ? ' aria-current="true"' : ""}>
      <span class="eca-lb-pos">${i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</span>
      <span class="eca-lb-av eca-frame ${window.ecaEliteClass ? ecaEliteClass(r.id) : ""}" aria-hidden="true">${avatar ? esc(avatar.icon) : "♟"}</span>
      <span class="min-w-0 flex-1"><b class="block truncate text-sm text-white">${esc(ecaStudentAlias({ id: r.id, nickname: r.n }))}</b>${title ? `<span class="block truncate text-xs text-gray-400">${esc(en ? title.en : title.title)}</span>` : ""}</span>
      <b class="text-sm text-emerald-300 whitespace-nowrap" dir="ltr">${esc(score(r))} XP</b>
      ${window.ecaEmoteButton ? ecaEmoteButton(r.id) : ""}
    </li>`;
  };
  const myIndex = list.findIndex(r => r.id === u.id);
  const empty = lbFailed ? (en ? "The leaderboard could not load. Try again later." : "تعذّر تحميل اللوحة. حاول تاني بعد شوية.")
    : !lbRows ? (en ? "Loading..." : "بنحمّل اللوحة...")
    : active === "group" && !u.group ? (en ? "You are not in a group yet." : "لسه مش في مجموعة.")
    : active === "weekly" ? (en ? "No points yet this week. Be the first!" : "لسه محدش جمع نقط الأسبوع ده. كن الأول!")
    : (en ? "No points yet. Train to get on the board!" : "لسه مفيش نقط. اتدرب وادخل اللوحة!");
  return `<section id="ecaLiveBoard" class="gold-card rounded-2xl p-5 space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="font-display font-bold text-lg text-yellow-300">🏆 ${en ? "Live leaderboard" : "الترتيب المباشر"}</h3>
      ${myIndex >= 0 ? `<span class="text-xs font-bold text-yellow-300">${en ? "Your rank" : "ترتيبك"}: #${myIndex + 1}</span>` : ""}
    </div>
    <div class="flex flex-wrap gap-2" role="tablist">${tabs.map(t => `<button type="button" role="tab" aria-selected="${active === t[0]}" onclick="lbTabSet('${t[0]}')" class="tap rounded-lg px-3 text-xs font-bold ${active === t[0] ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/20"}">${t[1]}</button>`).join("")}</div>
    ${list.length ? `<ol class="space-y-2">${list.slice(0, LB_TOP).map(row).join("")}${myIndex >= LB_TOP ? row(list[myIndex], myIndex) : ""}</ol>` : !lbRows && !lbFailed ? ecaLbSkeleton(en) : `<p class="text-sm text-gray-400 text-center py-4">${empty}</p>`}
    <p class="text-xs text-gray-500 text-center">${en ? "Ranked by training XP from puzzles, games and rewards. Only nicknames are shown." : "الترتيب بخبرة التدريب من الألغاز والألعاب والجوايز، وبتظهر الأسماء المستعارة بس."}</p>
  </section>`;
}
{ const _hv = renderHonorView; renderHonorView = function (u) { return `<div class="space-y-5">${ecaLiveBoardHTML(u)}${_hv(u)}</div>`; }; }
{ const _r = render; render = function () { const out = _r.apply(this, arguments); lbWatch(); return out; }; }

// ================= الرقعة والقطع من المتجر =================
function ecaEquipped(u, cat, slot) {
  const shop = (u && u.role === "student" && u.shop) || {}, id = (shop.eq || {})[slot];
  return id && window.ecaOwnsItem(u, id) && window.ecaShopCatalog.some(x => x.id === id && x.cat === cat) ? id : "";
}
function ecaCosmeticsApply() {
  const u = currUser(), root = document.documentElement.dataset, board = ecaEquipped(u, "board", "b"), piece = ecaEquipped(u, "piece", "p");
  if (board) root.ecab = board; else delete root.ecab;
  if (piece) { root.ecap = piece; if (pieceSet === "lichess") pieceSet = "classic"; } else delete root.ecap;
}
function ecaSetEq(slot, id) {
  const u = currUser(), shop = u.shop || {};
  u.shop = Object.assign({}, shop, { eq: Object.assign({}, shop.eq || {}, { [slot]: id }) });
  ecaCosmeticsApply();
  save();
}
function ecaEquip(slot, id) {
  const u = currUser(), cat = { b: "board", p: "piece", a: "avatar", f: "frame" }[slot];
  if (!u || u.role !== "student" || !cat) return;
  if (id && !window.ecaOwnsItem(u, id)) return;
  if (id && !window.ecaShopCatalog.some(x => x.id === id && x.cat === cat)) return;
  ecaSetEq(slot, id);
  if (id) ecaSfx("ting");
  render();
}
window.ecaEquip = ecaEquip;
// اختيار ألوان أو قطع يدويًا بيرجّع الاختيار اليدوي مكان اللي من المتجر
{
  const _color = setBoardColor, _pieces = setPieceSet;
  setBoardColor = function (k, v) { if (ecaEquipped(currUser(), "board", "b")) ecaSetEq("b", ""); return _color(k, v); };
  setPieceSet = function (k) { if (ecaEquipped(currUser(), "piece", "p")) ecaSetEq("p", ""); return _pieces(k); };
}

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

// ================= تحدي 60 ثانية (Puzzle Rush) =================
// الألغاز من البنك المحلي وبتصعب مع النتيجة. النتيجة بتتحسب هنا بس، وجائزتها مرة في اليوم
const RUSH_SECONDS = 60, RUSH_TIERS = ["easiest", "easier", "normal", "harder", "hardest"];
arena.rush = { status: "idle", game: null, sol: [], idx: 0, color: "w", flip: false, sel: null, last: null, flash: null, score: 0, combo: 0, mistakes: 0, endsAt: 0, timer: null, seen: new Set() };
function rushStop() { const R = arena.rush; clearInterval(R.timer); R.timer = null; }
function rushNext() {
  const R = arena.rush, bank = window.ECA_PUZZLE_BANK, tier = RUSH_TIERS[Math.min(RUSH_TIERS.length - 1, Math.floor(R.score / 5))];
  const pool = bank[tier] || [], fresh = pool.filter(row => !R.seen.has(row)), list = fresh.length ? fresh : pool;
  const row = list[Math.floor(Math.random() * list.length)];
  R.seen.add(row);
  const parts = row.split("|"), moves = parts[2].split(" "), g = new ChessCls(parts[1]), first = uciMove(g, moves[0]);
  Object.assign(R, { game: g, sol: moves.slice(1), idx: 0, color: g.turn(), flip: g.turn() === "b", sel: null, last: [first.from, first.to], flash: null });
}
async function rushStart() {
  const R = arena.rush;
  if (!ChessCls || R.status === "loading") return;
  R.status = "loading"; arenaRefresh();
  try { await loadPuzzleBank(); }
  catch (e) { console.warn("Puzzle bank failed:", e); R.status = "idle"; toast(lang === "en" ? "Could not load the puzzles. Try again." : "تعذّر تحميل الألغاز. حاول مرة أخرى."); return arenaRefresh(); }
  rushStop();
  Object.assign(R, { status: "play", score: 0, combo: 0, mistakes: 0, endsAt: Date.now() + RUSH_SECONDS * 1000, seen: new Set() });
  rushNext();
  R.timer = setInterval(() => {
    const left = Math.max(0, Math.ceil((R.endsAt - Date.now()) / 1000)), el = document.getElementById("rushLeft");
    if (el) el.textContent = left;
    if (left <= 0) rushEnd();
  }, 200);
  arenaRefresh();
  const card = document.getElementById("rushCard");
  if (card) card.scrollIntoView({ block: "start" });
}
window.rushStart = rushStart;
async function rushEnd() {
  const R = arena.rush;
  if (R.status !== "play") return;
  rushStop();
  R.status = "done"; R.game = null; R.sel = null;
  const score = R.score;
  arenaRefresh();
  await recordArena(a => { if (score > (a.rushBest || 0)) a.rushBest = score; });
  if (score >= 3 && window.ecaAwardStudentActivity) await window.ecaAwardStudentActivity("rush", todayISO(), score);
  arenaRefresh();
}
function rushClick(sq) {
  const R = arena.rush, g = R.game;
  if (R.status !== "play" || !g || Date.now() >= R.endsAt) return;
  const mv = pickOrMove(R, sq, R.color);
  if (!mv) return arenaRefresh();
  if (mv.promotion && promoNeeded(R, mv.from, mv.to)) return promoShow(R, mv.from, mv.to, pc => rushPlay(Object.assign(mv, { promotion: pc })));
  rushPlay(mv);
}
window.rushClick = rushClick;
function rushPlay(mv) {
  const R = arena.rush, g = R.game;
  let r = null;
  try { r = g.move(mv); } catch (_) {}
  if (!r) return arenaRefresh();
  R.last = [r.from, r.to];
  const ok = r.from + r.to + (r.promotion || "") === (R.sol[R.idx] || "") || g.isCheckmate();
  if (!ok) {
    R.combo = 0; R.mistakes++; R.flash = { [r.to]: "bad" }; R.status = "wrong";
    if (window.ecaCheer) ecaCheer("retry");
    arenaRefresh();
    setTimeout(() => { if (R.status === "wrong" && R.game === g) { R.status = "play"; rushNext(); arenaRefresh(); } }, 450);
    return;
  }
  R.idx++;
  if (R.idx < R.sol.length && !g.isCheckmate()) {
    const reply = uciMove(g, R.sol[R.idx]);
    R.idx++;
    if (reply) R.last = [reply.from, reply.to];
    R.flash = { [r.to]: "good" };
    if (R.idx < R.sol.length) return arenaRefresh();
  }
  R.score++; R.combo++;
  if (window.ecaOnSolve) window.ecaOnSolve();
  if (R.combo % 5 === 0 && window.ecaShake) { ecaShake(); ecaConfetti(50); if (window.ecaCheer) ecaCheer("hype"); }
  if (R.combo >= 2) ecaSfx("combo", R.combo); else ecaSfx("ting");
  rushNext();
  arenaRefresh();
}
// الخروج من التحدي بيلغيه من غير نتيجة
{
  const _r = render;
  render = function () {
    const R = arena.rush;
    if ((R.status === "play" || R.status === "wrong") && !(tab === "arena" && arena.sub === "rush")) { rushStop(); R.status = "idle"; R.game = null; }
    return _r.apply(this, arguments);
  };
}
function arenaRushHTML() {
  const R = arena.rush, u = currUser(), en = lang === "en", best = (u && u.role === "student" && u.arena && u.arena.rushBest) || 0, active = R.status === "play" || R.status === "wrong";
  const left = active ? Math.max(0, Math.ceil((R.endsAt - Date.now()) / 1000)) : RUSH_SECONDS;
  const stat = (id, value, label, cls) => `<div class="p-2 rounded-xl bg-black/40 border border-yellow-500/20 text-center"><div ${id ? `id="${id}"` : ""} class="text-2xl font-extrabold ${cls}" dir="ltr">${value}</div><div class="text-xs text-gray-400">${label}</div></div>`;
  const stars = Math.min(5, Math.floor(R.score / 3));
  const panel = active ? "" : `<div class="space-y-3 text-center">
    ${R.status === "done" ? `<p class="text-lg font-bold text-yellow-300">${en ? "Your score" : "نتيجتك"}: ${R.score}</p><p class="text-sm text-gray-300">${stars ? (en ? `Worth ${stars} stars, once a day` : `تستاهل ${stars} نجوم، مرة في اليوم`) : (en ? "Solve 3 or more to earn stars" : "حل 3 ألغاز أو أكتر عشان تكسب نجوم")}</p>` : `<p class="text-sm text-gray-300">${en ? "Solve as many puzzles as you can in 60 seconds. They get harder as you go, and every 3 solved earns a star (up to 5)." : "حل أكبر عدد من الألغاز في 60 ثانية. الألغاز بتصعب مع الوقت، وكل 3 ألغاز بنجمة (لحد 5 نجوم)."}</p>`}
    <button type="button" onclick="rushStart()" ${R.status === "loading" ? "disabled" : ""} class="tap w-full rounded-xl text-sm gold-btn">${R.status === "loading" ? (en ? "Loading…" : "جاري التحميل…") : R.status === "done" ? (en ? "Play again" : "العب تاني") : (en ? "Start" : "ابدأ")}</button>
  </div>`;
  const stats = `<div class="grid grid-cols-3 gap-2">
    ${stat("rushLeft", left, en ? "Seconds" : "ثانية", "text-sky-400")}
    ${stat("", R.score, en ? "Score" : "النتيجة", "text-emerald-300")}
    ${stat("", best, en ? "Best" : "أحسن نتيجة", "text-yellow-300")}
  </div>`;
  // أثناء اللعب العداد فوق الرقعة، عشان يفضل باين على الموبايل من غير سكرول
  if (active) return `<div id="rushCard" class="gold-card rounded-2xl p-3 sm:p-5 space-y-3 max-w-xl w-full mx-auto" style="scroll-margin-top:124px">
    ${stats}
    ${boardHTML({ game: R.game, flip: R.flip, sel: R.sel, targets: targetsOf(R.game, R.sel), last: R.last, flash: R.flash, onClick: "rushClick" })}
    <p class="text-center text-sm text-gray-300">${R.color === "w" ? (en ? "White to move" : "الدور على الأبيض") : (en ? "Black to move" : "الدور على الأسود")}${R.combo >= 2 ? ` • <b class="text-yellow-300">🔥 ${en ? "Combo" : "كومبو"} x${R.combo}</b>` : ""}</p>
  </div>`;
  return `<div class="gold-card rounded-2xl p-5 space-y-4 max-w-xl w-full mx-auto">
    <h3 class="font-display font-bold text-lg text-yellow-300">⚡ ${en ? "Puzzle Rush" : "تحدي 60 ثانية"}</h3>
    ${stats}
    ${panel}
  </div>`;
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
