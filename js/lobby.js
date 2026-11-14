// ECA — lobby.js: لوبي ساحة التدريب بشكل سينمائي
// فوق: «بيلبورد» كبير (واجب الزعيم لو فيه، وإلا الـ Step الحالي) بزرار «▶ العب الآن» وزرار «التفاصيل».
// تحته صفوف أفقية بتتسحب (وعلى الكمبيوتر بأسهم): كمّل تدريبك، السرعة والأصدقاء، حصريات الكوتش والبطولات، البطاقات والمتجر، وكل الألعاب.
// الألعاب نفسها ما اتغيرتش: كل كارت بيفتح نفس arenaSub/الدوال اللي قبل كده.

const LB = (ar, en) => lang === "en" ? en : ar;
const LB_MODES = {
  play: ["🤖", "العب ضد الكمبيوتر", "Play the computer"], puzzles: ["🧩", "ألغاز على الرقعة", "Board puzzles"], lessons: ["📚", "ألغاز الدروس", "Lesson puzzles"],
  rush: ["⚡", "تحدي 60 ثانية", "Puzzle Rush"], duel: ["⚔️", "مبارزة مباشرة", "Live duel"], speed: ["🏆", "بطولة السرعة", "Speed arena"],
  cards: ["🃏", "ألبوم البطاقات", "Card album"], friend: ["🤝", "تحدي صاحبك", "Friend challenge"], weekly: ["🏅", "تحدي الأسبوع", "Weekly challenge"],
  boss: ["🐉", "واجب الزعيم", "Boss homework"], pawns: ["♟️", "حرب البيادق", "Pawn wars"], vision: ["👁️", "رؤية الرقعة", "Board vision"], analysis: ["🔍", "تحليل الأدوار", "Game analysis"],
  live: ["⏱️", "شطرنج مباشر", "Live chess"], archive: ["📚", "أرشيف أدواري", "My games archive"]
};
function ecaModeName(k) { const m = LB_MODES[k]; return m ? m[0] + " " + (lang === "en" ? m[2] : m[1]) : LB("ساحة التدريب", "Training arena"); }
window.ecaModeName = ecaModeName;

// اللوبي هو أول حاجة في الساحة
if (arena.sub === "play" && !arena.play.game) arena.sub = "lobby";

// ================= البيانات =================
function lbBoss() { return ((arena.boss && arena.boss.list) || []).find(b => !b.done && b.dueMs > Date.now() && (b.solved || []).length < b.puzzles.length) || null; }
function lbStep(u) { const level = Math.min(6, Math.max(1, Number(u.level) || 1)); return { level, node: (typeof ECA_MAP !== "undefined" && ECA_MAP.find(n => n.step === level)) || { icon: "🗺️", ar: "", en: "" }, s: calcStats(u) }; }
let lbDojoAsked = "";
function lbDojo(u) {
  if (lbDojoAsked !== u.id && typeof dojoRefresh === "function") { lbDojoAsked = u.id; Promise.resolve(dojoRefresh()).then(() => { if (tab === "arena" && arena.sub === "lobby") render(); }); }
  const rows = typeof dojoRows !== "undefined" && dojoRows ? dojoRows : null;
  return { total: rows ? rows.length : null, due: typeof dojoDue === "function" ? dojoDue().length : 0 };
}
function lbClock(ms) {
  const s = Math.max(0, Math.floor(ms / 1000)), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
  return d ? LB(`${d} ي ${h} س`, `${d}d ${h}h`) : h ? LB(`${h} س ${m} د`, `${h}h ${m}m`) : `${m}:${String(sec).padStart(2, "0")}`;
}

// ================= البيلبورد =================
function lbBillboardHTML(u) {
  const boss = lbBoss(), st = lbStep(u);
  const b = boss ? {
    cls: "lb-crimson", art: typeof bossFace === "function" ? bossFace(boss) : "🐉", badge: LB("واجب الكوتش", "Coach homework"), title: boss.title,
    meta: [`<span class="nf-match">+10 ⭐</span>`, `<span dir="ltr">HP ${boss.puzzles.length - (boss.solved || []).length}/${boss.puzzles.length}</span>`, typeof bossDueText === "function" ? esc(bossDueText(boss)) : ""],
    play: `lbOpen('boss','${esc(boss.id)}')`, info: `arenaSub('boss')`, prog: (boss.puzzles.length - (boss.solved || []).length) / boss.puzzles.length
  } : {
    cls: "lb-emerald", art: st.node.icon, badge: LB("مغامرتك", "Your adventure"), title: (lang === "en" ? st.node.en : st.node.ar) + " • Step " + st.level,
    meta: [`<span class="nf-match">${LB("على قد مستواك", "At your level")}</span>`, esc(LB(`حضرت ${st.s.attC} من ${st.s.total} درس`, `${st.s.attC} of ${st.s.total} lessons attended`))],
    play: `lbOpen('step')`, info: `arenaSub('lessons')`, prog: st.s.total ? st.s.attC / st.s.total : 0
  };
  return `<section class="lb-hero nf-billboard ${b.cls}" aria-label="${esc(b.badge)}">
    <div class="nf-art" aria-hidden="true">${b.art}</div>
    <div class="nf-bb-body">
      <p class="nf-badge"><b>ECA</b> ${esc(b.badge)}</p>
      <h2 class="nf-bb-title">${esc(b.title)}</h2>
      <p class="nf-bb-meta">${b.meta.filter(Boolean).join(" <span aria-hidden=\"true\">•</span> ")}</p>
      <div class="nf-bb-actions">
        <button type="button" onclick="${b.play}" class="tap nf-btn-play">▶ ${LB("العب الآن", "Play now")}</button>
        <button type="button" onclick="${b.info}" class="tap nf-btn-info">ⓘ ${LB("التفاصيل", "Details")}</button>
      </div>
    </div>
    <span class="nf-bar" aria-hidden="true"><i style="width:${Math.round(b.prog * 100)}%"></i></span>
  </section>`;
}

// ================= الكروت والصفوف =================
// كارت = خلفية وأيقونة + عنوان + وسم أخضر + شريط أحمر تحت (لو فيه تقدّم). الكارت كله زرار واحد
function lbCard(c) {
  const label = [c.title, c.tag, c.prog != null ? Math.round(c.prog * 100) + "%" : ""].filter(Boolean).join(". ");
  const fx = c.fx && window.GameCardAnimator ? GameCardAnimator.media(c.fx) : "";
  return `<button type="button" onclick="${c.go}" class="nf-card ${c.accent || ""}${fx ? " game-card game-card-" + esc(c.fx) : ""}" aria-label="${esc(label)}">
      ${fx || `<span class="nf-card-art" aria-hidden="true">${c.icon}</span>`}
      ${c.badge ? `<span class="nf-tag-red">${esc(c.badge)}</span>` : ""}
      <span class="nf-card-info"><b class="nf-card-title">${esc(c.title)}</b><span class="nf-card-tag${c.live ? " nf-live" : ""}"${c.id ? ` id="${c.id}"` : ""}>${esc(c.tag)}</span>${c.sub ? `<span class="nf-card-sub">${c.sub}</span>` : ""}</span>
      ${c.prog != null ? `<span class="nf-bar" aria-hidden="true"><i style="width:${Math.round(Math.max(0, Math.min(1, c.prog)) * 100)}%"></i></span>` : ""}
    </button>`;
}
function lbPoster(c, n) {
  const fx = c.fx && window.GameCardAnimator ? GameCardAnimator.media(c.fx) : "";
  return `<button type="button" onclick="${c.go}" class="nf-poster-wrap${fx ? " game-card game-card-" + esc(c.fx) : ""}" aria-label="${esc(n + ". " + c.title + ". " + c.tag)}">
      <span class="nf-num" aria-hidden="true">${n}</span>
      <span class="nf-poster ${c.accent || ""}">${fx || `<span class="nf-card-art" aria-hidden="true">${c.icon}</span>`}<b class="nf-card-title">${esc(c.title)}</b><span class="nf-card-tag">${esc(c.tag)}</span></span>
    </button>`;
}
function lbRow(key, title, items, poster) {
  if (!items.length) return "";
  return `<section class="nf-row" data-row="${key}" aria-label="${esc(title)}">
    <h3 class="nf-row-title">${esc(title)}</h3>
    <div class="nf-lane">
      <button type="button" class="tap nf-chev nf-chev-prev" onclick="lbScroll(this,-1)" aria-label="${esc(LB("اللي قبل", "Previous"))}">‹</button>
      <div class="nf-track" role="list">${items.map((c, i) => `<div class="nf-item" role="listitem">${poster ? lbPoster(c, i + 1) : lbCard(c)}</div>`).join("")}</div>
      <button type="button" class="tap nf-chev nf-chev-next" onclick="lbScroll(this,1)" aria-label="${esc(LB("اللي بعده", "Next"))}">›</button>
    </div>
  </section>`;
}
function lbScroll(btn, dir) {
  const track = btn.parentElement.querySelector(".nf-track"); if (!track) return;
  const rtl = getComputedStyle(track).direction === "rtl";
  track.scrollBy({ left: (rtl ? -dir : dir) * track.clientWidth * 0.8, behavior: "smooth" });
}
window.lbScroll = lbScroll;

// كل كارت ليه حركة خاصة بيه لما يصحى (cardfx.js)، ومفيش لعبة متكررة في صفين
const LB_MORE = { play: "bot", puzzles: "puzzle", vision: "vision", pawns: "pawns", analysis: "analysis", archive: "archive" };
function lbRowsHTML(u) {
  const student = u.role === "student", st = lbStep(u), dj = student ? lbDojo(u) : { total: null, due: 0 }, boss = lbBoss();
  const mission = student && typeof lpDailyCount === "function" ? lpDailyCount(u) : 0, goal = typeof LP_GOAL !== "undefined" ? LP_GOAL : 10;
  // لغز اليوم: مرة واحدة في اليوم، وبعد الحل الكارت بيقول اتحل ومعاه عدّاد للغز الجاي (daily.js بيحدّثه كل ثانية)
  const dDone = student && window.ecaDailySolved ? ecaDailySolved(u) : false;
  const cont = [
    student && { go: "lbOpen('daily')", accent: "nf-gold", fx: "daily", icon: "📅", title: LB("لغز اليوم", "Daily puzzle"), done: dDone,
      tag: dDone ? LB("✅ تم حل لغز اليوم بنجاح", "✅ Today's puzzle solved") : LB("مرة في اليوم • +1 ⭐", "Once a day • +1 ⭐"),
      sub: dDone && window.ecaDailyClock ? `⏳ ${esc(LB("اللغز القادم بعد", "Next puzzle in"))}: <b id="lbDailyClock" dir="ltr">${ecaDailyClock(ecaDailyLeftMs())}</b>` : "" },
    student && { go: "lbOpen('step')", accent: "nf-red", fx: "target", icon: "🎯", title: LB("مهمة الدرس", "Lesson mission"), tag: LB(`${Math.min(mission, goal)} من ${goal} • +5 ⭐`, `${Math.min(mission, goal)} of ${goal} • +5 ⭐`), prog: Math.min(1, mission / goal) },
    { go: "lbOpen('lessons')", accent: "nf-teal", fx: "map", icon: "🗺️", title: LB("مغامرة الدروس", "Lesson adventure"), tag: LB(`Step ${st.level} • على قد مستواك`, `Step ${st.level} • at your level`), prog: st.s.total ? st.s.attC / st.s.total : 0 },
    { go: "lbOpen('dojo')", accent: "nf-red", fx: "dojo", icon: "🥋", title: LB("اتعلم من أخطائك", "Learn from your mistakes"), tag: dj.due ? LB(`🔥 ${dj.due} جاهز • 2x`, `🔥 ${dj.due} ready • 2x`) : dj.total ? LB(`${dj.total} في الخزنة`, `${dj.total} in the vault`) : LB("الخزنة فاضية", "Vault is empty"), live: dj.due > 0 },
    boss ? { go: `lbOpen('boss','${esc(boss.id)}')`, accent: "nf-red", fx: "boss", icon: typeof bossFace === "function" ? bossFace(boss) : "🐉", title: boss.title, tag: LB(`HP ${boss.puzzles.length - (boss.solved || []).length} • +10 ⭐`, `HP ${boss.puzzles.length - (boss.solved || []).length} • +10 ⭐`), prog: (boss.puzzles.length - (boss.solved || []).length) / boss.puzzles.length }
      : { go: "lbOpen('boss')", accent: "nf-red", fx: "boss", icon: "🐉", title: LB("واجب الزعيم", "Boss homework"), tag: LB("مفيش زعيم دلوقتي", "No boss right now") }
  ].filter(Boolean);
  const best = student && typeof funRushBest === "function" ? funRushBest(u) : 0, spun = student && typeof ecaSpinDone === "function" && ecaSpinDone(u);
  const pvp = [
    { go: "lbOpen('live')", accent: "nf-red", fx: "live", icon: "⏱️", badge: "LIVE", title: LB("شطرنج مباشر", "Live chess"), tag: LB("بالوقت • ضد زمايلك • بطولات أرينا", "On the clock • vs classmates • arenas"), live: true },
    { go: "lbOpen('rush')", accent: "nf-violet", fx: "speed", icon: "⚡", title: LB("تحدي 60 ثانية", "Puzzle Rush"), tag: best ? LB(`أحسن نتيجة النهاردة: ${best}`, `Today's best: ${best}`) : LB("60 ثانية • +5 ⭐", "60 seconds • +5 ⭐") },
    { go: "lbOpen('friend')", accent: "nf-violet", fx: "knights", icon: "🤝", title: LB("تحدي صاحبك", "Friend challenge"), tag: LB("5 ألغاز • +3 ⭐", "5 puzzles • +3 ⭐") },
    { go: "lbOpen('duel')", accent: "nf-violet", fx: "duel", icon: "⚔️", title: LB("مبارزة مباشرة", "Live duel"), tag: LB("1 ضد 1 • +3 ⭐", "1v1 • +3 ⭐") },
    student && { go: "lbOpen('spin')", accent: "nf-gold", fx: "spin", icon: "🎡", title: LB("عجلة الحظ", "Lucky spin"), tag: spun ? LB("✓ لفّيت النهاردة", "✓ Spun today") : LB("لفّة النهاردة جاهزة", "Today's spin is ready"), live: !spun }
  ].filter(Boolean);
  const W = arena.weekly, att = (W && W.att) || { n: 0, solved: false }, left = Math.max(0, 2 - (Number(att.n) || 0));
  const wkTag = !W || W.doc === undefined ? LB("بنحمّل...", "Loading...") : !W.doc ? LB("لسه ما نزلش", "Not posted yet") : att.solved ? LB("✓ حليته", "✓ Solved") : LB(`المحاولات ${left}/2`, `Attempts ${left}/2`);
  const live = typeof saActive === "function" ? saActive() : null, next = !live && typeof saUpcoming === "function" ? saUpcoming() : null;
  const saTag = live ? LB("🔴 شغّالة دلوقتي", "🔴 LIVE NOW") : next ? LB(`تبدأ بعد ${lbClock(next.startsMs - Date.now())}`, `Starts in ${lbClock(next.startsMs - Date.now())}`) : LB("بنحمّل...", "Loading...");
  const ev = student && window.funEventState ? funEventState(u) : null;
  const originals = [
    { go: "lbOpen('weekly')", accent: "nf-red", fx: "coach", icon: "🏅", badge: "ECA ORIGINAL", title: LB("تحدي الأسبوع", "Weekly challenge"), tag: wkTag },
    { go: "lbOpen('speed')", accent: "nf-gold", fx: "arena", icon: "🏆", title: LB("بطولة السرعة", "Speed arena"), tag: saTag, live: !!live, id: "lbSaPill" },
    ev && { go: ev.done && !ev.claimed ? "funEventClaim()" : "funEventStart()", accent: "nf-teal", fx: "event", icon: "🎪", badge: "ECA ORIGINAL", title: LB("حدث الأسبوع: ", "Weekly event: ") + (window.lpThemeName ? lpThemeName(ev.theme) : ev.theme), tag: ev.claimed ? LB("✓ خلّصته", "✓ Done") : LB(`${ev.n}/15 • +8 ⭐`, `${ev.n}/15 • +8 ⭐`), prog: ev.n / 15 },
    { go: "lbOpen('honor')", accent: "nf-gold", fx: "honor", icon: "👑", title: LB("لوحة الشرف", "Hall of Fame"), tag: LB("الأوائل الأسبوع ده", "This week's top players") }
  ].filter(Boolean);
  const posters = [
    { go: "lbOpen('cards')", accent: "nf-violet", fx: "album", icon: "🃏", title: LB("ألبوم البطاقات", "Card album"), tag: LB("اجمع البطاقات", "Collect them all") },
    student && { go: "lbOpen('shop:piece')", accent: "nf-red", fx: "pieces", icon: "♞", title: LB("قطع جديدة", "New pieces"), tag: LB("من المتجر", "In the shop") },
    student && { go: "lbOpen('shop:board')", accent: "nf-teal", fx: "boards", icon: "🎨", title: LB("رقع جديدة", "New boards"), tag: LB("من المتجر", "In the shop") },
    student && { go: "lbOpen('shop:avatar')", accent: "nf-gold", fx: "avatar", icon: "🦁", title: LB("أفاتار", "Avatars"), tag: LB("من المتجر", "In the shop") },
    student && { go: "lbOpen('shop:frame')", accent: "nf-violet", fx: "frame", icon: "🖼️", title: LB("إطارات", "Frames"), tag: LB("من المتجر", "In the shop") },
    student && { go: "lbOpen('shop:tools')", accent: "nf-red", fx: "chest", icon: "🛍️", title: LB("متجر النجوم", "Star shop"), tag: LB("بوتات وتلميحات", "Bots and hints") }
  ].filter(Boolean);
  // باقي الألعاب (اللي مش في صف فوق): كل لعبة من الـ 13 موجودة مرة واحدة بس في الساحة
  const all = Object.keys(LB_MORE).map(k => ({ go: `lbOpen('${k}')`, accent: "nf-dark", fx: LB_MORE[k], icon: LB_MODES[k][0], title: lang === "en" ? LB_MODES[k][2] : LB_MODES[k][1], tag: LB("العب", "Play") }));
  return lbRow("continue", LB("كمّل تدريبك", "Continue training"), cont)
    + lbRow("pvp", LB("تحديات السرعة والأصدقاء", "Speed and friends"), pvp)
    + lbRow("originals", LB("حصريات الكوتش والبطولات", "Coach originals and live events"), originals)
    + lbRow("top", LB("بطاقات التكتيك والمتجر", "Tactic cards and rewards"), posters, true)
    + lbRow("all", LB("ألعاب تانية", "More games"), all);
}

function lbLobbyHTML(u) {
  const student = u.role === "student";
  return `<div class="lb nf space-y-2">
    ${student && typeof careResumeHTML === "function" ? careResumeHTML() : ""}
    ${student ? lbBillboardHTML(u) : `<section class="lb-hero nf-billboard lb-emerald"><div class="nf-art" aria-hidden="true">🎮</div><div class="nf-bb-body"><h2 class="nf-bb-title">${LB("ساحة التدريب", "Training arena")}</h2><p class="nf-bb-meta">${LB("كل ألعاب الطلاب في مكان واحد", "All the student games in one place")}</p></div></section>`}
    ${lbRowsHTML(u)}
  </div>`;
}

// ================= الفتح =================
function lbGo(fn) { let tries = 0; const go = () => { if (typeof ChessCls !== "undefined" && ChessCls) fn(); else if (++tries < 60) setTimeout(go, 200); }; go(); }
function lbShop(t) {
  if (typeof ecaShopTab !== "undefined") ecaShopTab = t;
  switchTab("home");
  setTimeout(() => { const el = document.getElementById("ecaShopCard"); if (el) el.scrollIntoView({ block: "start", behavior: "smooth" }); }, 80);
}
function lbOpen(key, id) {
  const u = currUser();
  if (window.ecaSfx) ecaSfx("ting");
  if (key === "step") return u && window.lpStart ? lpStart(lpDailyLesson(u)) : arenaSub("lessons");
  if (key === "boss") { arenaSub("boss"); if (id && window.ecaBossOpen) lbGo(() => ecaBossOpen(id)); return; }
  if (key === "dojo") { arenaSub("puzzles"); if (typeof reviewStart === "function") lbGo(() => reviewStart()); return; }
  if (key === "spin") return window.ecaSpinOpen ? ecaSpinOpen() : undefined;
  if (key === "daily") return window.ecaDailyOpen ? ecaDailyOpen() : undefined;
  if (key === "honor") return switchTab("honor");
  if (String(key).startsWith("shop:")) return lbShop(String(key).slice(5));
  if (LB_MODES[key]) arenaSub(key);
}
window.lbOpen = lbOpen;

{
  const _av = renderArenaView;
  renderArenaView = function (u) {
    if (arena.sub !== "lobby" || !u) return _av.apply(this, arguments);
    loadChess();
    return lbLobbyHTML(u);
  };
}
// عدّاد البطولة بيتحدّث كل ثانية من غير ما الصفحة كلها تترسم
setInterval(() => {
  if (tab !== "arena" || arena.sub !== "lobby") return;
  const el = document.getElementById("lbSaPill"), next = typeof saUpcoming === "function" ? saUpcoming() : null;
  if (!el || !next || (typeof saActive === "function" && saActive())) return;
  const left = next.startsMs - Date.now();
  if (left <= 0) return render();
  el.textContent = LB(`تبدأ بعد ${lbClock(left)}`, `Starts in ${lbClock(left)}`);
}, 1000);
// الشريط اللي فوق بيبقى مصمت لما الصفحة تنزل (ثيم Game)
{
  const onScroll = () => document.documentElement.classList.toggle("eca-scrolled", window.scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}
