// ECA — lobby.js: لوبي ساحة التدريب
// بدل 13 زرار مرة واحدة: بطاقة «البطل» فوق (واجب الزعيم لو فيه، وإلا الـ Step الحالي)، وتحتها 3 تابات في كل تاب كارتين بس،
// وكل الألعاب التانية في درج «كل الألعاب» مقفول. الألعاب نفسها ما اتغيرتش: كل كارت بيفتح نفس arenaSub/الدوال اللي قبل كده.

const LB = (ar, en) => lang === "en" ? en : ar;
const LB_MODES = {
  play: ["🤖", "العب ضد الكمبيوتر", "Play the computer"], puzzles: ["🧩", "ألغاز على الرقعة", "Board puzzles"], lessons: ["📚", "ألغاز الدروس", "Lesson puzzles"],
  rush: ["⚡", "تحدي 60 ثانية", "Puzzle Rush"], duel: ["⚔️", "مبارزة مباشرة", "Live duel"], speed: ["🏆", "بطولة السرعة", "Speed arena"],
  cards: ["🃏", "ألبوم البطاقات", "Card album"], friend: ["🤝", "تحدي صاحبك", "Friend challenge"], weekly: ["🏅", "تحدي الأسبوع", "Weekly challenge"],
  boss: ["🐉", "واجب الزعيم", "Boss homework"], pawns: ["♟️", "حرب البيادق", "Pawn wars"], vision: ["👁️", "رؤية الرقعة", "Board vision"], analysis: ["🔍", "تحليل الأدوار", "Game analysis"]
};
function ecaModeName(k) { const m = LB_MODES[k]; return m ? m[0] + " " + (lang === "en" ? m[2] : m[1]) : LB("ساحة التدريب", "Training arena"); }
window.ecaModeName = ecaModeName;

// اللوبي هو أول حاجة في الساحة
if (arena.sub === "play" && !arena.play.game) arena.sub = "lobby";
arena.lobbyTab = "solo";
function lobbyTab(k) { if (!["solo", "arcade", "events"].includes(k)) return; arena.lobbyTab = k; render(); }
window.lobbyTab = lobbyTab;

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

// ================= بطاقة البطل =================
function lbHeroHTML(u) {
  const boss = lbBoss();
  if (boss) {
    const hp = boss.puzzles.length - (boss.solved || []).length;
    return `<section class="lb-hero lb-crimson" aria-label="${esc(LB("واجب الزعيم", "Boss homework"))}">
      <span class="lb-hero-icon" aria-hidden="true">${typeof bossFace === "function" ? bossFace(boss) : "🐉"}</span>
      <div class="lb-hero-body"><p class="lb-kicker">${LB("واجب الزعيم", "Boss homework")}</p>
        <h2 class="lb-hero-title">${esc(boss.title)}</h2>
        ${typeof bossBar === "function" ? bossBar(boss, "eca-boss-hp lb-hp") : ""}
        <p class="lb-sub" dir="auto">HP ${hp}/${boss.puzzles.length}</p></div>
      <button type="button" onclick="lbOpen('boss','${esc(boss.id)}')" class="tap lb-cta lb-pulse">⚔️ ${LB("هاجم الزعيم", "Attack the boss")}</button>
    </section>`;
  }
  const st = lbStep(u), name = lang === "en" ? st.node.en : st.node.ar;
  return `<section class="lb-hero lb-emerald" aria-label="${esc(LB("مغامرتك", "Your adventure"))}">
      <span class="lb-hero-icon" aria-hidden="true">${st.node.icon}</span>
      <div class="lb-hero-body"><p class="lb-kicker">${LB("مغامرتك", "Your adventure")}</p>
        <h2 class="lb-hero-title">${esc(name ? name + " • Step " + st.level : "Step " + st.level)}</h2>
        <p class="lb-sub">${LB(`حضرت ${st.s.attC} من ${st.s.total} درس`, `${st.s.attC} of ${st.s.total} lessons attended`)}</p></div>
      <button type="button" onclick="lbOpen('step')" class="tap lb-cta">🗺️ ${LB(`كمّل Step ${st.level}`, `Continue Step ${st.level}`)}</button>
    </section>`;
}

// ================= الكروت =================
// كل كارت = أيقونة + عنوان وسطر قصير + حالة واحدة، والكارت كله زرار واحد
function lbCard(key, accent, icon, title, sub, pill, opts) {
  return `<button type="button" onclick="lbOpen('${key}')" class="lb-card ${accent}" aria-label="${esc(title + ". " + sub + ". " + pill)}">
      <span class="lb-card-icon" aria-hidden="true">${icon}</span>
      <span class="lb-card-title">${esc(title)}</span>
      <span class="lb-card-sub">${esc(sub)}</span>
      <span class="lb-pill${opts && opts.live ? " lb-live" : ""}"${opts && opts.id ? ` id="${opts.id}"` : ""}>${esc(pill)}</span>
    </button>`;
}
function lbCardsHTML(u) {
  const t = arena.lobbyTab, student = u.role === "student";
  if (t === "solo") {
    const st = lbStep(u), dj = student ? lbDojo(u) : { total: null, due: 0 };
    return lbCard("lessons", "lb-crimson", "🗺️", LB("مغامرة الدروس", "Lesson adventure"), LB(`ألغاز Step ${st.level}`, `Step ${st.level} puzzles`), LB("على قد مستواك", "At your level"))
      + lbCard("dojo", "lb-crimson", "🥋", LB("دوجو الانتقام", "Dojo revenge"), LB("انتقم من غلطاتك", "Beat your mistakes"),
        dj.due ? LB(`🔥 ${dj.due} جاهز للانتقام`, `🔥 ${dj.due} ready`) : dj.total ? LB(`${dj.total} في الخزنة`, `${dj.total} in the vault`) : LB("الخزنة فاضية", "Vault is empty"), { live: dj.due > 0 });
  }
  if (t === "arcade") {
    const best = student && typeof funRushBest === "function" ? funRushBest(u) : 0;
    return lbCard("rush", "lb-cyan", "⚡", LB("تحدي 60 ثانية", "Puzzle Rush"), LB("أسرع حل يكسب", "Fastest solver wins"), best ? LB(`أحسن نتيجة النهاردة: ${best}`, `Today's best: ${best}`) : LB("60 ثانية", "60 seconds"))
      + lbCard("friend", "lb-cyan", "🤝", LB("تحدي صاحبك", "Friend challenge"), LB("5 ألغاز، مين أسرع؟", "5 puzzles, who's faster?"), LB("ابعتله رابط", "Send a link"));
  }
  const W = arena.weekly, att = (W && W.att) || { n: 0, solved: false }, left = Math.max(0, 2 - (Number(att.n) || 0));
  const wkPill = !W || W.doc === undefined ? LB("بنحمّل...", "Loading...") : !W.doc ? LB("لسه ما نزلش", "Not posted yet") : att.solved ? LB("✓ حليته", "✓ Solved") : LB(`المحاولات ${left}/2`, `Attempts ${left}/2`);
  const live = typeof saActive === "function" ? saActive() : null, next = !live && typeof saUpcoming === "function" ? saUpcoming() : null;
  const saPill = live ? LB("🔴 شغّالة دلوقتي", "🔴 LIVE NOW") : next ? LB(`تبدأ بعد ${lbClock(next.startsMs - Date.now())}`, `Starts in ${lbClock(next.startsMs - Date.now())}`) : LB("بنحمّل...", "Loading...");
  return lbCard("weekly", "lb-emerald", "🏅", LB("تحدي الأسبوع", "Weekly challenge"), LB("لغز الكوتش للأسبوع", "Coach's puzzle"), wkPill)
    + lbCard("speed", "lb-emerald", "🏆", LB("بطولة السرعة", "Speed arena"), LB("الكل في نفس الوقت", "Everyone at once"), saPill, { live: !!live, id: "lbSaPill" });
}

function lbLobbyHTML(u) {
  const student = u.role === "student", a = (student && u.arena) || {}, gm = a.games || { w: 0, l: 0, d: 0 };
  const tabs = [["solo", "🎯", "التدريب الذكي", "Smart training"], ["arcade", "⚡", "سرعة وتحدي", "Speed & duels"], ["events", "🏆", "أحداث خاصة", "Events"]];
  const all = Object.keys(LB_MODES);
  return `<div class="lb space-y-4">
    ${student && typeof careResumeHTML === "function" ? careResumeHTML() : ""}
    <div class="lb-top">
      ${student ? lbHeroHTML(u) : `<section class="lb-hero lb-emerald"><span class="lb-hero-icon" aria-hidden="true">🎮</span><div class="lb-hero-body"><h2 class="lb-hero-title">${LB("ساحة التدريب", "Training arena")}</h2><p class="lb-sub">${LB("كل ألعاب الطلاب في مكان واحد", "All the student games in one place")}</p></div></section>`}
      ${student ? `<section class="lb-stats gold-card" aria-label="${esc(LB("أرقامك", "Your numbers"))}">
        <div><b>${Number(a.puzSolved) || 0}</b><span>${LB("لغز اتحل", "puzzles solved")}</span></div>
        <div><b dir="ltr">${gm.w}/${gm.w + gm.l + gm.d}</b><span>${LB("مكسب ضد البوتات", "wins vs bots")}</span></div>
        <div><b>⭐ ${Number(a.stars) || 0}</b><span>${LB("نجومك", "your stars")}</span></div>
      </section>` : ""}
    </div>
    <div class="lb-tabs" role="tablist" aria-label="${esc(LB("نوع اللعب", "Game type"))}">
      ${tabs.map(([k, i, ar, en]) => `<button type="button" role="tab" aria-selected="${arena.lobbyTab === k}" onclick="lobbyTab('${k}')" class="tap lb-tab${arena.lobbyTab === k ? " is-on" : ""}"><span aria-hidden="true">${i}</span> ${lang === "en" ? en : ar}</button>`).join("")}
    </div>
    <div class="lb-cards" role="tabpanel">${lbCardsHTML(u)}</div>
    <details class="lb-all gold-card">
      <summary class="tap">🎮 ${LB(`كل الألعاب (${all.length})`, `All games (${all.length})`)}</summary>
      <div class="lb-chips">${all.map(k => `<button type="button" onclick="arenaSub('${k}')" class="tap lb-chip">${esc(ecaModeName(k))}</button>`).join("")}</div>
    </details>
  </div>`;
}

// ================= الفتح =================
function lbGo(fn) { let tries = 0; const go = () => { if (typeof ChessCls !== "undefined" && ChessCls) fn(); else if (++tries < 60) setTimeout(go, 200); }; go(); }
function lbOpen(key, id) {
  const u = currUser();
  if (window.ecaSfx) ecaSfx("ting");
  if (key === "step") return u && window.lpStart ? lpStart(lpDailyLesson(u)) : arenaSub("lessons");
  if (key === "boss") { arenaSub("boss"); if (id && window.ecaBossOpen) lbGo(() => ecaBossOpen(id)); return; }
  if (key === "dojo") { arenaSub("puzzles"); if (typeof reviewStart === "function") lbGo(() => reviewStart()); return; }
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
  if (tab !== "arena" || arena.sub !== "lobby" || arena.lobbyTab !== "events") return;
  const el = document.getElementById("lbSaPill"), next = typeof saUpcoming === "function" ? saUpcoming() : null;
  if (!el || !next || (typeof saActive === "function" && saActive())) return;
  const left = next.startsMs - Date.now();
  if (left <= 0) return render();
  el.textContent = LB(`تبدأ بعد ${lbClock(left)}`, `Starts in ${lbClock(left)}`);
}, 1000);
