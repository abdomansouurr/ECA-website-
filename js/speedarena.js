// ECA — speedarena.js: بطولة السرعة الأسبوعية (30 دقيقة كل جمعة)
// الموعد بيتسجل لوحده في Firestore من أول زائر. الترتيب مباشر، والجوايز بتتعلن لما حساب كوتش أو أدمن يفتح المنصة بعد النهاية.
const SA_START_UTC_HOUR = 16, SA_MINUTES = 30, SA_WEEKDAY = 5, SA_TOP = 20;   // الجمعة 16:00 UTC، نفس القيم في firestore.rules
const SA_PRIZES = { 1: 50, 2: 30, 3: 20 }, SA_MEDALS = { 1: "🥇", 2: "🥈", 3: "🥉" }, SA_TIERS = ["easiest", "easier", "normal", "harder", "hardest"];
arena.speed = { status: "idle", arenas: null, id: "", endsAt: 0, score: 0, solved: 0, combo: 0, game: null, sol: [], idx: 0, color: "w", flip: false, sel: null, last: null, flash: null, seen: new Set(), rows: null, boardId: "", boardUnsub: null, timer: null, queue: [], sending: false, nextSendAt: 0 };

let saOpenUnsub = null, saEnsured = false, saClaimed = false, saCloseAt = 0, saBoardPaintTimer = null;

// ================= الموعد =================
function saNextSlot(now) {
  const d = new Date(now);
  d.setUTCHours(SA_START_UTC_HOUR, 0, 0, 0);
  while (d.getUTCDay() !== SA_WEEKDAY || d.getTime() + SA_MINUTES * 60000 <= now) d.setUTCDate(d.getUTCDate() + 1);
  return { id: d.toISOString().slice(0, 10), startsAt: new Date(d.getTime()), endsAt: new Date(d.getTime() + SA_MINUTES * 60000) };
}
function saActive() { const now = Date.now(); return (arena.speed.arenas || []).find(a => a.startsMs <= now && now < a.endsMs) || null; }
function saUpcoming() { const now = Date.now(); return (arena.speed.arenas || []).filter(a => a.startsMs > now).sort((x, y) => x.startsMs - y.startsMs)[0] || null; }
function saWhen(ms) { return new Date(ms).toLocaleString(lang === "en" ? "en-GB" : "ar-EG", { weekday: "long", hour: "numeric", minute: "2-digit" }); }
function saPaint() { if (tab === "arena" && arena.sub === "speed") arenaRefresh(); }

// ================= الترتيب المباشر: أول 20 بس، والرسم مجمّع عشان ما يقطعش اللعب =================
function saBoardWatch(id) {
  const S = arena.speed;
  if (S.boardId === id) return;
  if (S.boardUnsub) { S.boardUnsub(); S.boardUnsub = null; }
  S.boardId = id; S.rows = null;
  if (!id || !window.fbArenaBoard) return;
  S.boardUnsub = window.fbArenaBoard(id, SA_TOP, rows => { S.rows = rows; saBoardPaintSoon(); }, () => {});
}
function saBoardPaintSoon() {
  if (saBoardPaintTimer) return;
  saBoardPaintTimer = setTimeout(() => {
    saBoardPaintTimer = null;
    const el = document.getElementById("saBoard"), u = currUser();
    if (el && u) el.outerHTML = saBoardHTML(u);
  }, 500);
}
function saBoardHTML(u) {
  const S = arena.speed, en = lang === "en", catalog = window.ecaShopCatalog || [];
  const rows = (S.rows || []).filter(r => r.score > 0).sort((a, b) => b.score - a.score || a.atMs - b.atMs);
  return `<section id="saBoard" class="gold-card rounded-2xl p-4 space-y-2">
    <h4 class="font-bold text-sm text-yellow-300">🏆 ${en ? "Live standings" : "الترتيب المباشر"}</h4>
    ${rows.length ? `<ol class="space-y-2">${rows.map((r, i) => {
      const avatar = catalog.find(x => x.id === r.a && x.cat === "avatar"), me = r.id === u.id;
      return `<li class="eca-lb-row ${me ? "eca-lb-me" : ""}"${me ? ' aria-current="true"' : ""}><span class="eca-lb-pos">${SA_MEDALS[i + 1] || i + 1}</span><span class="eca-lb-av" aria-hidden="true">${avatar ? esc(avatar.icon) : "♟"}</span><b class="min-w-0 flex-1 truncate text-sm text-white">${esc(ecaStudentAlias({ id: r.id, nickname: r.n }))}</b><b class="text-sm text-emerald-300 whitespace-nowrap">${esc(r.score)}</b></li>`;
    }).join("")}</ol>` : `<p class="text-sm text-gray-400 text-center py-3">${S.rows ? (en ? "No points yet. Be the first!" : "لسه مفيش نقط. كن الأول!") : (en ? "Loading..." : "بنحمّل...")}</p>`}
  </section>`;
}

// ================= اللعب =================
function saStop() { const S = arena.speed; clearInterval(S.timer); S.timer = null; }
function saNextPuzzle() {
  const S = arena.speed, bank = window.ECA_PUZZLE_BANK, tier = SA_TIERS[Math.min(SA_TIERS.length - 1, Math.floor(S.solved / 5))];
  const pool = bank[tier] || [], fresh = pool.filter(row => !S.seen.has(row)), list = fresh.length ? fresh : pool;
  const row = list[Math.floor(Math.random() * list.length)];
  S.seen.add(row);
  const parts = row.split("|"), moves = parts[2].split(" "), g = new ChessCls(parts[1]), first = uciMove(g, moves[0]);
  Object.assign(S, { game: g, sol: moves.slice(1), idx: 0, color: g.turn(), flip: g.turn() === "b", sel: null, last: [first.from, first.to], flash: null });
}
async function saJoin() {
  const S = arena.speed, active = saActive(), en = lang === "en";
  if (!active || !ChessCls || S.status !== "idle") return;
  S.status = "loading"; saPaint();
  try {
    await loadPuzzleBank();
    const mine = await window.fbArenaJoin(active.id);
    Object.assign(S, { status: "play", id: active.id, endsAt: active.endsMs, score: mine.score, solved: mine.solved, combo: 0, seen: new Set(), queue: [], sending: false, nextSendAt: mine.atMs + 2100 });
    saNextPuzzle();
    saStop();
    S.timer = setInterval(() => {
      const left = Math.max(0, Math.ceil((S.endsAt - Date.now()) / 1000)), el = document.getElementById("saLeft");
      if (el) el.textContent = saClock(left);
      if (left <= 0) saFinish();
    }, 250);
    saPaint();
    const card = document.getElementById("saCard");
    if (card) card.scrollIntoView({ block: "start" });
  } catch (e) {
    console.warn("Speed arena join failed:", e && e.code);
    S.status = "idle";
    toast(en ? "You could not join the tournament. Try again." : "ما قدرتش تدخل البطولة. حاول تاني.");
    saPaint();
  }
}
window.saJoin = saJoin;
function saClock(left) { return Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0"); }
function saFinish() {
  const S = arena.speed;
  if (S.status !== "play" && S.status !== "wrong") return;
  saStop();
  S.status = "done"; S.game = null; S.sel = null;
  saPaint();
}
function saClick(sq) {
  const S = arena.speed;
  if (S.status !== "play" || !S.game || Date.now() >= S.endsAt) return;
  const mv = pickOrMove(S, sq, S.color);
  if (!mv) return arenaRefresh();
  if (mv.promotion && promoNeeded(S, mv.from, mv.to)) return promoShow(S, mv.from, mv.to, pc => saPlay(Object.assign(mv, { promotion: pc })));
  saPlay(mv);
}
window.saClick = saClick;
function saPlay(mv) {
  const S = arena.speed, g = S.game;
  let r = null;
  try { r = g.move(mv); } catch (_) {}
  if (!r) return arenaRefresh();
  S.last = [r.from, r.to];
  const ok = r.from + r.to + (r.promotion || "") === (S.sol[S.idx] || "") || g.isCheckmate();
  if (!ok) {
    S.combo = 0; S.flash = { [r.to]: "bad" }; S.status = "wrong";
    arenaRefresh();
    setTimeout(() => { if (S.status === "wrong" && S.game === g) { S.status = "play"; saNextPuzzle(); arenaRefresh(); } }, 450);
    return;
  }
  S.idx++;
  if (S.idx < S.sol.length && !g.isCheckmate()) {
    const reply = uciMove(g, S.sol[S.idx]);
    S.idx++;
    S.last = [reply.from, reply.to];
    if (S.idx < S.sol.length) return arenaRefresh();
  }
  // 3 حلول ورا بعض أو أكتر: كل حل بنقطتين
  S.combo++;
  const gain = S.combo >= 3 ? 2 : 1;
  S.score += gain; S.solved++;
  S.queue.push({ score: S.score, solved: S.solved });
  saFlush();
  if (window.ecaOnSolve) window.ecaOnSolve();
  if (S.combo >= 2) ecaSfx("combo", S.combo); else ecaSfx("ting");
  if (S.combo % 5 === 0 && window.ecaShake) ecaShake();
  saNextPuzzle();
  arenaRefresh();
}
// القواعد بتقبل حل واحد كل ثانيتين، فالحلول الأسرع بتستنى دورها
async function saFlush() {
  const S = arena.speed;
  if (S.sending || !S.queue.length) return;
  S.sending = true;
  const id = S.id;
  while (S.queue.length && S.id === id) {
    const wait = S.nextSendAt - Date.now();
    if (wait > 0) await new Promise(r => setTimeout(r, wait));
    const item = S.queue[0];
    try {
      await window.fbArenaSolve(id, item.score, item.solved);
      S.queue.shift();
      S.nextSendAt = Date.now() + 2100;
    } catch (e) {
      console.warn("Speed arena score failed:", e && e.code);
      if (Date.now() >= S.endsAt) { S.queue = []; break; }
      S.nextSendAt = Date.now() + 3000;
    }
  }
  S.sending = false;
}
function saReset() { const S = arena.speed; saStop(); Object.assign(S, { status: "idle", id: "", game: null, sel: null, flash: null, queue: [] }); saPaint(); }
window.saReset = saReset;

// ================= كوتش أو أدمن: بطولة تجريبية =================
async function saStartNow() {
  const u = currUser(), en = lang === "en";
  if (!u || u.role !== "coach" || !window.fbArenaStartNow) return;
  if (!confirm(en ? "Start a 30-minute tournament for all students now?" : "تبدأ بطولة 30 دقيقة لكل الطلبة دلوقتي؟")) return;
  try { await window.fbArenaStartNow(SA_MINUTES); toast(en ? "The tournament started." : "البطولة بدأت."); }
  catch (e) { console.warn("Speed arena start failed:", e && e.code); toast(en ? "The tournament could not start." : "البطولة ما بدأتش."); }
}
window.saStartNow = saStartNow;

// ================= الصفحة =================
function arenaSpeedHTML() {
  const S = arena.speed, u = currUser(), en = lang === "en", active = saActive(), next = saUpcoming();
  if (u) saBoardWatch(S.status === "play" || S.status === "wrong" || S.status === "done" ? S.id : active ? active.id : "");
  if (S.status === "play" || S.status === "wrong") {
    return `<div class="space-y-4 max-w-xl w-full mx-auto">
      <div id="saCard" class="gold-card rounded-2xl p-3 sm:p-5 space-y-3" style="scroll-margin-top:124px">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div><b class="block text-xl text-sky-400" id="saLeft" dir="ltr">${saClock(Math.max(0, Math.ceil((S.endsAt - Date.now()) / 1000)))}</b><span class="text-xs text-gray-400">${en ? "Time left" : "الوقت"}</span></div>
          <div><b class="block text-xl text-emerald-300">${esc(S.score)}</b><span class="text-xs text-gray-400">${en ? "Points" : "النقط"}</span></div>
          <div><b class="block text-xl text-yellow-300">${S.combo >= 3 ? "🔥 x2" : esc(S.combo)}</b><span class="text-xs text-gray-400">${en ? "Streak" : "ورا بعض"}</span></div>
        </div>
        ${boardHTML({ game: S.game, flip: S.flip, sel: S.sel, targets: targetsOf(S.game, S.sel), last: S.last, flash: S.flash, onClick: "saClick" })}
        <p class="text-center text-sm text-gray-300">${S.color === "w" ? (en ? "White to move" : "الدور على الأبيض") : (en ? "Black to move" : "الدور على الأسود")}</p>
      </div>
      ${saBoardHTML(u)}
    </div>`;
  }
  const head = `<h3 class="font-display font-bold text-lg text-yellow-300">🏟️ ${en ? "Speed Arena" : "بطولة السرعة"}</h3>`;
  const rules = `<p class="text-sm text-gray-300">${en ? `Solve as many puzzles as you can in ${SA_MINUTES} minutes. Each solution is 1 point, and 3 in a row make every solution 2 points. Prizes: 🥇 ⭐ 50, 🥈 ⭐ 30, 🥉 ⭐ 20 and a golden trophy.` : `حل أكبر عدد من الألغاز في ${SA_MINUTES} دقيقة. كل حل بنقطة، و3 حلول ورا بعض تخلي كل حل بنقطتين. الجوايز: 🥇 ⭐ 50، 🥈 ⭐ 30، 🥉 ⭐ 20 وكأس دهبي.`}</p>`;
  let action = "";
  if (S.status === "done") action = `<p class="text-lg font-bold text-center text-emerald-300">${en ? "Time's up! Your points" : "الوقت خلص! نقطك"}: ${esc(S.score)}</p>
    <p class="text-xs text-gray-400 text-center">${en ? "Prizes are announced after the tournament closes." : "الجوايز بتتعلن بعد قفل البطولة."}</p>
    <button type="button" onclick="saReset()" class="tap w-full rounded-xl text-sm font-bold bg-zinc-800 text-white border border-yellow-500/30">${en ? "Back" : "رجوع"}</button>`;
  else if (S.status === "loading") action = `<p class="text-sm text-gray-300 text-center py-3">${en ? "Loading..." : "بنحمّل..."}</p>`;
  else if (active && u && u.role === "student") action = `<button type="button" onclick="saJoin()" ${ChessCls ? "" : "disabled"} class="tap w-full rounded-xl text-sm font-bold gold-btn disabled:opacity-40">${en ? "Join now" : "ادخل البطولة"}</button>`;
  else if (active) action = `<p class="text-sm font-bold text-emerald-300 text-center">${en ? "A tournament is running now." : "فيه بطولة شغالة دلوقتي."}</p>`;
  else action = `<p class="text-sm font-bold text-sky-300 text-center">${next ? (en ? "Next tournament: " : "البطولة الجاية: ") + esc(saWhen(next.startsMs)) : (en ? "Checking the schedule..." : "بنشوف الموعد...")}</p>`;
  const staffBtn = u && u.role === "coach" && !active ? `<button type="button" onclick="saStartNow()" class="tap w-full rounded-xl text-sm font-bold bg-zinc-800 text-white border border-yellow-500/30">${en ? "Start a tournament now" : "ابدأ بطولة دلوقتي"}</button>` : "";
  return `<div class="space-y-4 max-w-xl w-full mx-auto">
    <div class="gold-card rounded-2xl p-5 space-y-4">${head}${rules}${action}${staffBtn}</div>
    ${active || S.status === "done" ? saBoardHTML(u) : ""}
  </div>`;
}

// ================= الكؤوس على الصفحة الرئيسية =================
function saTrophyCardHTML(stu) {
  const en = lang === "en", list = Array.isArray((stu.arena || {}).tr) ? stu.arena.tr : [], active = saActive(), next = saUpcoming();
  const status = active ? (en ? "A tournament is live now!" : "البطولة شغالة دلوقتي!") : next ? (en ? "Next: " : "الجاية: ") + saWhen(next.startsMs) : "";
  return `<section class="gold-card rounded-2xl p-4 flex items-center justify-between gap-3">
    <div class="min-w-0"><h3 class="font-bold text-sm text-yellow-300">🏟️ ${en ? "Speed Arena" : "بطولة السرعة"}${list.length ? " • 🏆 " + esc(list.length) : ""}</h3>
      ${list.length ? `<p class="text-sm" aria-label="${en ? "Your trophies" : "كؤوسك"}">${list.slice(-8).map(t => SA_MEDALS[String(t).split("|")[1]] || "🏆").join(" ")}</p>` : ""}
      <p class="text-xs text-gray-400">${esc(status)}</p></div>
    <button type="button" onclick="tab='arena'; arenaSub('speed')" class="tap rounded-lg px-3 text-xs font-bold ${active ? "gold-btn" : "bg-zinc-800 text-white border border-yellow-500/30"}">${en ? "Open" : "افتح"}</button>
  </section>`;
}
{
  const _sh = renderStudentHome;
  renderStudentHome = function (s) { return `<div class="space-y-6">${saTrophyCardHTML(s)}${_sh(s)}</div>`; };
}

// ================= الجوايز: الطالب بياخد جايزته لوحده لما يفتح الموقع بعد القفل =================
async function saClaimWins(u) {
  if (saClaimed || !window.fbArenaMyWins || !window.fbEconomy) return;
  saClaimed = true;
  const en = lang === "en";
  try {
    const wins = await window.fbArenaMyWins(), have = (u.arena && u.arena.tr) || [];
    for (const win of wins) {
      if (have.some(t => String(t).startsWith(win.id + "|"))) continue;
      const result = await window.fbEconomy({ op: "earn", source: "arena", key: win.id, rank: win.rank, day: todayISO() });
      if (result && result.ok && !result.duplicate && window.ecaMilestone) {
        ecaMilestone({ icon: SA_MEDALS[win.rank], big: true, title: en ? "Golden trophy!" : "كأس دهبي!", text: en ? `You finished #${win.rank} in the Speed Arena: +${SA_PRIZES[win.rank]} stars!` : `خلصت رقم ${win.rank} في بطولة السرعة: +${SA_PRIZES[win.rank]} نجمة!` });
      }
    }
  } catch (e) { console.warn("Speed arena prize:", e && e.code); saClaimed = false; }
}
// ربط البطولة بدورة الرسم
function saLifecycle() {
  const u = currUser(), S = arena.speed, here = tab === "arena" && arena.sub === "speed";
  if ((S.status === "play" || S.status === "wrong") && !here) { saStop(); Object.assign(S, { status: "idle", game: null, sel: null }); }
  if (!u) {
    if (saOpenUnsub) { saOpenUnsub(); saOpenUnsub = null; }
    saEnsured = false; saClaimed = false; S.arenas = null;
    return;
  }
  if (window.__authLoading || !window.fbArenaWatchOpen) return;
  if (!saOpenUnsub) saOpenUnsub = window.fbArenaWatchOpen(rows => { S.arenas = rows; saPaint(); }, () => {});
  if (!saEnsured) { saEnsured = true; const slot = saNextSlot(Date.now()); window.fbArenaEnsure(slot.id, slot.startsAt, slot.endsAt).catch(e => { console.warn("Speed arena schedule:", e && e.code); saEnsured = false; }); }
  if (u.role === "student") saClaimWins(u);
  if (u.role === "coach" && Date.now() > saCloseAt) { saCloseAt = Date.now() + 60000; if (window.fbArenaCloseDue) window.fbArenaCloseDue().catch(e => console.warn("Speed arena close:", e && e.code)); }
}
{
  const _r = render;
  render = function () { const out = _r.apply(this, arguments); saLifecycle(); return out; };
}
