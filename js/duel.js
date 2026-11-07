// ECA — duel.js: تحدي مباشر 1 ضد 1، اللي يحل نفس اللغز الأول يكسب
// الأسماء المستعارة بس، ومفيش شات. الجايزة مرة واحدة في اليوم، والقواعد بتتأكد من الفائز.
const DUEL_SECONDS = 120, DUEL_STARS = 3, DUEL_OPEN_MS = 3 * 60 * 1000;
arena.duel = { status: "idle", id: "", doc: null, lobby: null, lobbyFailed: false, lobbyUnsub: null, unsub: null, timer: null, endsAt: 0, game: null, sol: [], idx: 0, color: "w", flip: false, sel: null, last: null, flash: null, won: false };

function duelStopTimer() { const D = arena.duel; clearInterval(D.timer); D.timer = null; }
function duelStopWatch() { const D = arena.duel; if (D.unsub) { D.unsub(); D.unsub = null; } }
function duelPaint() { if (tab === "arena" && arena.sub === "duel") arenaRefresh(); }
function duelReset() {
  duelStopTimer(); duelStopWatch();
  Object.assign(arena.duel, { status: "idle", id: "", doc: null, game: null, sel: null, last: null, flash: null, won: false });
}
function duelName(id, nickname) { return ecaStudentAlias({ id, nickname: nickname || "" }); }

// اللوبي بيشتغل بس وإنت فاتح صفحة التحدي
function duelLobbyWatch() {
  const D = arena.duel, u = currUser();
  const want = tab === "arena" && arena.sub === "duel" && D.status === "idle" && !!u && u.role === "student" && !!window.fbDuelLobby;
  if (want && !D.lobbyUnsub) {
    D.lobbyUnsub = window.fbDuelLobby(rows => { D.lobby = rows; D.lobbyFailed = false; duelPaint(); }, () => { D.lobbyFailed = true; duelPaint(); });
  } else if (!want && D.lobbyUnsub) {
    D.lobbyUnsub(); D.lobbyUnsub = null; D.lobby = null;
  }
}

function duelSetup() {
  const D = arena.duel, moves = D.doc.moves.split(" "), g = new ChessCls(D.doc.fen), first = uciMove(g, moves[0]);
  Object.assign(D, { game: g, sol: moves.slice(1), idx: 0, color: g.turn(), flip: g.turn() === "b", sel: null, last: [first.from, first.to], flash: null });
}
function duelBeginLive() {
  const D = arena.duel;
  D.status = "live";
  D.endsAt = Date.now() + DUEL_SECONDS * 1000;
  duelSetup();
  duelStopTimer();
  D.timer = setInterval(() => {
    const left = Math.max(0, Math.ceil((D.endsAt - Date.now()) / 1000)), el = document.getElementById("duelLeft");
    if (el) el.textContent = left;
    if (left <= 0) { duelStopTimer(); duelStopWatch(); D.status = "timeout"; D.game = null; duelPaint(); }
  }, 200);
  ecaSfx("combo", 3);
  duelPaint();
  const card = document.getElementById("duelCard");
  if (card) card.scrollIntoView({ block: "start" });
}
function duelFinish(won) {
  const D = arena.duel;
  duelStopTimer(); duelStopWatch();
  D.status = "done"; D.won = won; D.game = null; D.sel = null;
  if (won) { ecaSfx("levelup"); if (window.ecaFireworks) { ecaFireworks(3); ecaShake(); } if (window.ecaCheer) ecaCheer("hype"); }
  duelPaint();
}
function duelWatch(id) {
  const D = arena.duel;
  duelStopWatch();
  D.unsub = window.fbDuelWatch(id, doc => {
    if (D.id !== id) return;
    const me = currUser();
    if (!doc) { if (D.status === "waiting" || D.status === "live") { toast(lang === "en" ? "The duel was cancelled." : "التحدي اتلغى."); duelReset(); duelPaint(); } return; }
    D.doc = doc;
    if (doc.status === "live" && D.status === "waiting") return duelBeginLive();
    if (doc.status === "done" && D.status !== "done" && D.status !== "claiming") return duelFinish(doc.winner === me.id);
    duelPaint();
  });
}
async function duelCreate() {
  const D = arena.duel, en = lang === "en";
  if (!ChessCls || !window.fbDuelCreate || D.status !== "idle") return;
  D.status = "loading"; duelPaint();
  try {
    await loadPuzzleBank();
    const pool = window.ECA_PUZZLE_BANK.normal || [], row = pool[Math.floor(Math.random() * pool.length)], parts = row.split("|");
    const id = await window.fbDuelCreate(parts[1], parts[2]);
    Object.assign(D, { status: "waiting", id, doc: null });
    duelWatch(id);
  } catch (e) {
    console.warn("Duel create failed:", e && e.code);
    D.status = "idle";
    toast(en ? "The duel could not start. Try again." : "التحدي ما بدأش. حاول تاني.");
  }
  duelPaint();
}
window.duelCreate = duelCreate;
async function duelJoin(id) {
  const D = arena.duel, en = lang === "en";
  if (!ChessCls || !window.fbDuelJoin || D.status !== "idle" || !/^[A-Za-z0-9]{10,40}$/.test(String(id))) return;
  D.status = "loading"; duelPaint();
  try {
    const doc = await window.fbDuelJoin(id);
    if (!doc) throw new Error("taken");
    Object.assign(D, { id, doc });
    duelWatch(id);
    duelBeginLive();
  } catch (e) {
    console.warn("Duel join failed:", e && (e.code || e.message));
    D.status = "idle";
    toast(en ? "That duel is no longer available." : "التحدي ده مبقاش متاح.");
    duelPaint();
  }
}
window.duelJoin = duelJoin;
function duelCancel() {
  const D = arena.duel, id = D.id, wasWaiting = D.status === "waiting";
  duelReset();
  if (wasWaiting && id && window.fbDuelDelete) window.fbDuelDelete(id);
  duelPaint();
}
window.duelCancel = duelCancel;
function duelAgain() { duelReset(); duelPaint(); }
window.duelAgain = duelAgain;

function duelClick(sq) {
  const D = arena.duel;
  if (D.status !== "live" || !D.game) return;
  const mv = pickOrMove(D, sq, D.color);
  if (!mv) return arenaRefresh();
  if (mv.promotion && promoNeeded(D, mv.from, mv.to)) return promoShow(D, mv.from, mv.to, pc => duelPlay(Object.assign(mv, { promotion: pc })));
  duelPlay(mv);
}
window.duelClick = duelClick;
function duelPlay(mv) {
  const D = arena.duel, g = D.game;
  let r = null;
  try { r = g.move(mv); } catch (_) {}
  if (!r) return arenaRefresh();
  D.last = [r.from, r.to];
  const ok = r.from + r.to + (r.promotion || "") === (D.sol[D.idx] || "") || g.isCheckmate();
  if (!ok) {
    // الغلطة بترجّع اللغز من الأول، وبتاخد ثانية وقت
    D.flash = { [r.to]: "bad" }; D.status = "wrong";
    if (window.ecaCheer) ecaCheer("retry");
    arenaRefresh();
    setTimeout(() => { if (D.status === "wrong" && D.game === g) { D.status = "live"; duelSetup(); arenaRefresh(); } }, 1000);
    return;
  }
  D.idx++;
  if (D.idx < D.sol.length && !g.isCheckmate()) {
    const reply = uciMove(g, D.sol[D.idx]);
    D.idx++;
    D.last = [reply.from, reply.to];
    ecaSfx("ting");
    if (D.idx < D.sol.length) return arenaRefresh();
  }
  duelSolved();
}
async function duelSolved() {
  const D = arena.duel, id = D.id, en = lang === "en";
  D.status = "claiming"; duelStopTimer(); arenaRefresh();
  if (window.ecaOnSolve) window.ecaOnSolve();
  let won = false;
  try {
    won = await window.fbDuelWin(id);
  } catch (e) {
    console.warn("Duel win failed:", e && e.code);
    toast(en ? "Your win could not be saved." : "مكسبك ما اتسجلش.");
  }
  if (D.id !== id) return;
  duelFinish(won);
  if (!won) return;
  try {
    const result = await window.fbEconomy({ op: "earn", source: "duel", key: id, day: todayISO() });
    if (result && result.ok && !result.duplicate && window.ecaShowStudentReward) window.ecaShowStudentReward(result);
    else if (result && result.duplicate) toast(en ? "You already collected today's duel reward." : "خدت جايزة التحدي بتاعة النهاردة قبل كده.");
  } catch (e) {
    console.warn("Duel reward failed:", e && e.code);
    toast(en ? "Your reward could not be saved." : "الجايزة ما اتسجلتش.");
  }
  recordArena(a => { a.duelW = (Number(a.duelW) || 0) + 1; });
  duelPaint();
}

function arenaDuelHTML() {
  const D = arena.duel, u = currUser(), en = lang === "en";
  if (!u || u.role !== "student") return `<div class="gold-card rounded-2xl p-6 text-center text-sm text-gray-400">${en ? "Duels are for students." : "التحدي المباشر للطلاب بس."}</div>`;
  const card = body => `<div class="gold-card rounded-2xl p-5 space-y-4 max-w-xl w-full mx-auto"><h3 class="font-display font-bold text-lg text-yellow-300">⚔️ ${en ? "Live duel" : "تحدي مباشر"}</h3>${body}</div>`;
  if (D.status === "live" || D.status === "wrong" || D.status === "claiming") {
    const rival = D.doc && (D.doc.a === u.id ? duelName(D.doc.b, D.doc.bn) : duelName(D.doc.a, D.doc.an));
    const left = Math.max(0, Math.ceil((D.endsAt - Date.now()) / 1000));
    return `<div id="duelCard" class="gold-card rounded-2xl p-3 sm:p-5 space-y-3 max-w-xl w-full mx-auto" style="scroll-margin-top:124px">
      <div class="flex items-center justify-between gap-2 text-sm"><b class="text-white truncate">⚔️ ${esc(rival || "")}</b><b class="text-sky-400 whitespace-nowrap"><span id="duelLeft">${left}</span> ${en ? "sec" : "ثانية"}</b></div>
      ${boardHTML({ game: D.game, flip: D.flip, sel: D.sel, targets: targetsOf(D.game, D.sel), last: D.last, flash: D.flash, onClick: "duelClick" })}
      <p class="text-center text-sm text-gray-300">${D.status === "claiming" ? (en ? "Checking who solved first..." : "بنشوف مين حل الأول...") : D.status === "wrong" ? (en ? "Wrong move. Try again!" : "نقلة غلط. حاول تاني!") : D.color === "w" ? (en ? "White to move" : "الدور على الأبيض") : (en ? "Black to move" : "الدور على الأسود")}</p>
    </div>`;
  }
  if (D.status === "waiting") return card(`<p class="text-sm text-gray-300 text-center py-4">⏳ ${en ? "Waiting for another student to join..." : "مستنيين طالب تاني يدخل..."}</p>
    <button type="button" onclick="duelCancel()" class="tap w-full rounded-xl text-sm font-bold bg-zinc-800 text-white border border-yellow-500/30">${en ? "Cancel" : "إلغاء"}</button>`);
  if (D.status === "loading") return card(`<p class="text-sm text-gray-300 text-center py-4">${en ? "Loading..." : "بنحمّل..."}</p>`);
  if (D.status === "done" || D.status === "timeout") return card(`<p class="text-lg font-bold text-center ${D.won ? "text-emerald-300" : "text-gray-200"}">${D.status === "timeout" ? (en ? "Time's up! Nobody won." : "الوقت خلص! محدش كسب.") : D.won ? (en ? "You won the duel! 🏆" : "كسبت التحدي! 🏆") : (en ? "Your rival solved it first. Next time!" : "منافسك حل الأول. المرة الجاية!")}</p>
    <button type="button" onclick="duelAgain()" class="tap w-full rounded-xl text-sm font-bold gold-btn">${en ? "Back to duels" : "رجوع للتحديات"}</button>`);
  const now = Date.now();
  const rows = (D.lobby || []).filter(r => r.a !== u.id && r.createdMs && now - r.createdMs < DUEL_OPEN_MS);
  return card(`<p class="text-sm text-gray-300">${en ? `Race another student to solve the same puzzle. The first win each day earns ⭐ ${DUEL_STARS}.` : `سابق طالب تاني على حل نفس اللغز. أول مكسب في اليوم جايزته ⭐ ${DUEL_STARS}.`}</p>
    <button type="button" onclick="duelCreate()" ${ChessCls ? "" : "disabled"} class="tap w-full rounded-xl text-sm font-bold gold-btn disabled:opacity-40">${en ? "Start a duel" : "ابدأ تحدي"}</button>
    <h4 class="text-sm font-bold text-white">${en ? "Open duels" : "تحديات مفتوحة"}</h4>
    ${D.lobbyFailed ? `<p class="text-sm text-gray-400 text-center py-2">${en ? "Duels could not load." : "تعذّر تحميل التحديات."}</p>`
      : rows.length ? `<div class="space-y-2">${rows.map(r => `<div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/30 border border-yellow-500/15"><b class="min-w-0 truncate text-sm text-white">${esc(duelName(r.a, r.an))}</b><button type="button" data-duel-id="${esc(r.id)}" onclick="duelJoin(this.dataset.duelId)" class="tap rounded-lg px-3 text-xs font-bold gold-btn">${en ? "Join" : "ادخل"}</button></div>`).join("")}</div>`
      : `<p class="text-sm text-gray-400 text-center py-2">${en ? "No open duels. Start one!" : "مفيش تحديات مفتوحة. ابدأ واحد!"}</p>`}`);
}

// الخروج من صفحة التحدي بيلغيه
{
  const _r = render;
  render = function () {
    const D = arena.duel, here = tab === "arena" && arena.sub === "duel";
    if (!here && (D.status === "waiting" || D.status === "live" || D.status === "wrong")) duelCancel();
    const out = _r.apply(this, arguments);
    duelLobbyWatch();
    return out;
  };
}
