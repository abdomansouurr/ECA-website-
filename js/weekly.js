// ECA — weekly.js: تحدي الكوتش الأسبوعي + قاعة المشاهير
// الكوتش بيحط لغز للأسبوع في coachChallenges/{weekId}. كل طالب له محاولتين، واللي يحله بيدخل
// قاعة المشاهير بالاسم المستعار والأفاتار والإطار ووقت الحل.

const WK_ATTEMPTS = 2;
arena.weekly = { wk: "", doc: undefined, hof: null, att: null, unsub: null, status: "idle", game: null, sol: [], idx: 0, color: "w", flip: false, sel: null, last: null, flash: null, start: 0, busy: false, draft: null };
const WL = (ar, en) => lang === "en" ? en : ar;

function wkPaint() { if (tab === "arena" && (arena.sub === "weekly" || arena.sub === "lobby")) arenaRefresh(); else if (tab === "home") render(); }
function wkLifecycle() {
  const W = arena.weekly, u = currUser();
  const want = !!u && !window.__authLoading && !!window.fbWeeklyWatch && ((tab === "arena" && (arena.sub === "weekly" || arena.sub === "lobby")) || (tab === "home" && u.role === "student"));
  const wk = want ? ecaWeekKey() : "";
  if (wk === W.wk && (!want || W.unsub)) return;
  if (W.unsub) { W.unsub(); W.unsub = null; }
  Object.assign(W, { wk, doc: undefined, hof: null, att: null });
  if (!want) return;
  W.unsub = window.fbWeeklyWatch(wk, (doc, hof, att) => {
    if (W.wk !== wk) return;
    const changed = JSON.stringify(W.doc) !== JSON.stringify(doc);
    W.doc = doc; W.hof = hof; W.att = att;
    if (changed || tab === "arena") wkPaint();
  });
}

// ================= الطالب =================
async function wkStart() {
  const W = arena.weekly;
  if (!W.doc || W.busy || !ChessCls) return;
  W.busy = true; wkPaint();
  try {
    const r = await window.fbWeeklyAttempt(W.wk);
    if (r.solved) { W.status = "idle"; }
    else if (r.over) { toast(WL("خلّصت محاولاتك للأسبوع ده.", "You used both attempts this week.")); W.status = "idle"; }
    else { ecaPzSetup(W, W.doc.fen, W.doc.moves, !!W.doc.setup); W.status = "play"; W.start = Date.now(); }
  } catch (e) { console.warn("Weekly attempt failed:", e && e.code); toast(WL("المحاولة ما بدأتش. حاول تاني.", "The attempt could not start. Try again.")); }
  W.busy = false; wkPaint();
}
window.wkStart = wkStart;
function wkClick(sq) { const W = arena.weekly; if (W.status !== "play" || W.busy) return; ecaPzClick(W, sq, wkMove); }
window.wkClick = wkClick;
window.wkNoop = () => {};
async function wkMove(mv) {
  const W = arena.weekly, result = ecaPzPlay(W, mv);
  if (result === "illegal" || result === "next") { if (result === "next" && window.ecaSfx) ecaSfx("ting"); return arenaRefresh(); }
  if (result === "bad") {
    W.status = "wrong"; arenaRefresh();
    if (window.ecaCheer) ecaCheer("retry");
    setTimeout(() => { W.status = "idle"; W.game = null; wkPaint(); }, 900);
    return;
  }
  const ms = Math.max(1000, Date.now() - W.start);
  W.status = "saving"; W.busy = true; arenaRefresh();
  try {
    await window.fbWeeklySolved(W.wk, ms);
    toast(WL("🏅 دخلت قاعة المشاهير!", "🏅 You made the Hall of Fame!"));
    if (window.ecaFireworks) ecaFireworks(3);
    if (window.ecaCheer) ecaCheer("hype");
  } catch (e) { console.warn("Weekly solve failed:", e && e.code); toast(WL("الحل ما اتسجلش.", "Your solve was not saved.")); }
  W.busy = false; W.status = "idle"; W.game = null; wkPaint();
}

function wkHallHTML(hof, meId) {
  const en = lang === "en", catalog = window.ecaShopCatalog || [];
  if (!hof || !hof.length) return `<p class="text-sm text-gray-400 text-center py-2">${WL("لسه محدش حله. كن الأول!", "Nobody has solved it yet. Be the first!")}</p>`;
  return `<ol class="space-y-2">${hof.map((r, i) => {
    const avatar = catalog.find(x => x.id === r.a && x.cat === "avatar"), frame = catalog.some(x => x.id === r.f && x.cat === "frame") ? "eca-frame-" + r.f : "";
    const elite = window.ecaEliteClass ? ecaEliteClass(r.uid) : "", me = r.uid === meId;
    return `<li class="eca-lb-row ${me ? "eca-lb-me" : ""}"><span class="eca-lb-pos">${["🥇", "🥈", "🥉"][i] || i + 1}</span><span class="eca-lb-av eca-frame ${frame} ${elite}" aria-hidden="true">${avatar ? esc(avatar.icon) : "♟"}</span><b class="min-w-0 flex-1 truncate text-sm text-white">🏅 ${esc(ecaStudentAlias({ id: r.uid, nickname: r.n }))}</b><b class="text-sm text-emerald-300 whitespace-nowrap" dir="ltr">${(Number(r.ms) / 1000).toFixed(1)}${en ? "s" : " ث"}</b></li>`;
  }).join("")}</ol>`;
}

// ================= الكوتش: إعداد لغز الأسبوع =================
async function wkRandom() {
  const W = arena.weekly, diff = (document.getElementById("wkDiff") || {}).value || "normal";
  const bank = await loadPuzzleBank(), pool = bank[diff] || [], row = pool[Math.floor(Math.random() * pool.length)];
  if (!row) return;
  const p = row.split("|");
  W.draft = { fen: p[1], moves: p[2], setup: true };
  wkPreview();
}
window.wkRandom = wkRandom;
function wkCustom() {
  const W = arena.weekly, fen = ((document.getElementById("wkFen") || {}).value || "").trim(), moves = ((document.getElementById("wkMoves") || {}).value || "").trim().toLowerCase();
  try {
    const g = new ChessCls(fen), list = moves.split(/\s+/).filter(Boolean);
    if (!list.length || !/^[a-h1-8qrbn ]+$/.test(moves)) throw new Error("moves");
    list.forEach(m => { if (!uciMove(g, m)) throw new Error("illegal"); });
    W.draft = { fen, moves: list.join(" "), setup: false };
    wkPreview();
  } catch (_) { toast(WL("الوضع أو النقلات مش صحيحة. اكتب FEN ونقلات الحل بالشكل e2e4.", "The position or moves are not valid. Enter a FEN and the solution moves like e2e4.")); }
}
window.wkCustom = wkCustom;
function wkPreview() { const W = arena.weekly; ecaPzSetup(W, W.draft.fen, W.draft.moves, W.draft.setup); W.status = "preview"; wkPaint(); }
async function wkPublish() {
  const W = arena.weekly, title = ((document.getElementById("wkTitle") || {}).value || "").trim().slice(0, 80);
  if (!W.draft) return toast(WL("اختار اللغز الأول.", "Choose the puzzle first."));
  if (/[<>"'`]/.test(title)) return toast(WL("العنوان فيه رموز مش مسموحة.", "The title has characters that are not allowed."));
  try {
    await window.fbWeeklySave(W.wk, Object.assign({ title: title || WL("تحدي الأسبوع", "Challenge of the week") }, W.draft));
    toast(WL("تحدي الأسبوع اتنشر", "The weekly challenge is live"));
    W.draft = null; W.status = "idle"; W.game = null;
  } catch (e) { console.warn("Weekly save failed:", e && e.code); toast(WL("ما اتنشرش. حاول تاني.", "It was not published. Try again.")); }
  wkPaint();
}
window.wkPublish = wkPublish;

// ================= الصفحة =================
function arenaWeeklyHTML() {
  const W = arena.weekly, u = currUser(), en = lang === "en";
  if (!u) return "";
  const staff = u.role === "coach";
  const head = `<h3 class="font-display font-bold text-lg text-yellow-300">🎯 ${WL("تحدي الكوتش الأسبوعي", "Coach's weekly challenge")}</h3>`;
  if (W.doc === undefined) return `<div class="gold-card rounded-2xl p-5 max-w-xl w-full mx-auto">${head}<p class="text-sm text-gray-300 py-3">${WL("بنحمّل...", "Loading...")}</p></div>`;
  const board = onClick => boardHTML({ game: W.game, flip: W.flip, sel: W.sel, targets: targetsOf(W.game, W.sel), last: W.last, flash: W.flash, onClick });
  const hall = `<div class="gold-card rounded-2xl p-5 space-y-3 max-w-xl w-full mx-auto"><h4 class="font-bold text-yellow-300">🏅 ${WL("قاعة المشاهير", "Hall of Fame")}</h4>${wkHallHTML(W.hof, u.id)}</div>`;
  if (staff) {
    return `<div class="space-y-4">
      <div class="gold-card rounded-2xl p-5 space-y-3 max-w-xl w-full mx-auto">${head}
        <p class="text-sm text-gray-300">${W.doc ? WL("لغز الأسبوع ده: ", "This week: ") + esc(W.doc.title) : WL("لسه مفيش تحدي للأسبوع ده.", "No challenge for this week yet.")}</p>
        <label class="block text-xs text-gray-300">${WL("العنوان", "Title")}<input id="wkTitle" maxlength="80" class="mt-1 w-full min-h-[44px] rounded-lg bg-black border border-yellow-500/40 px-3 text-sm text-white" value="${esc(W.doc ? W.doc.title : "")}" /></label>
        <div class="flex flex-wrap items-end gap-2">
          <label class="text-xs text-gray-300">${WL("الصعوبة", "Difficulty")}<select id="wkDiff" class="mt-1 block min-h-[44px] rounded-lg bg-black border border-yellow-500/40 px-2 text-sm text-white">${PUZ_DIFF.filter(x => x[0] !== "daily").map(([v, l]) => `<option value="${v}">${esc(trText(l))}</option>`).join("")}</select></label>
          <button type="button" onclick="wkRandom()" class="tap rounded-lg px-3 text-xs font-bold bg-zinc-800 text-white border border-yellow-500/30">${WL("لغز عشوائي", "Random puzzle")}</button>
        </div>
        <details><summary class="tap text-xs text-sky-300 cursor-pointer">${WL("أو اكتب لغز بنفسك", "Or enter your own puzzle")}</summary>
          <div class="space-y-2 mt-2"><input id="wkFen" placeholder="FEN" dir="ltr" class="w-full min-h-[44px] rounded-lg bg-black border border-yellow-500/40 px-3 text-xs text-white" />
          <input id="wkMoves" placeholder="${WL("نقلات الحل: e2e4 e7e5 ...", "Solution moves: e2e4 e7e5 ...")}" dir="ltr" class="w-full min-h-[44px] rounded-lg bg-black border border-yellow-500/40 px-3 text-xs text-white" />
          <button type="button" onclick="wkCustom()" class="tap rounded-lg px-3 text-xs font-bold bg-zinc-800 text-white border border-yellow-500/30">${WL("معاينة", "Preview")}</button></div></details>
        ${W.status === "preview" && W.game ? `${board("wkNoop")}<button type="button" onclick="wkPublish()" class="tap w-full rounded-xl text-sm font-bold gold-btn">${WL("انشر تحدي الأسبوع", "Publish the weekly challenge")}</button>` : ""}
      </div>${hall}</div>`;
  }
  if (!W.doc) return `<div class="space-y-4"><div class="gold-card rounded-2xl p-5 space-y-2 max-w-xl w-full mx-auto">${head}<p class="text-sm text-gray-300">${WL("الكوتش لسه ما نزّلش تحدي الأسبوع. ارجع بعدين!", "Your coach has not posted this week's challenge yet. Check back soon!")}</p></div></div>`;
  const att = W.att || { n: 0, solved: false }, left = Math.max(0, WK_ATTEMPTS - (Number(att.n) || 0));
  if (W.status === "play" || W.status === "wrong" || W.status === "saving") {
    return `<div class="gold-card rounded-2xl p-3 sm:p-5 space-y-3 max-w-xl w-full mx-auto">${head}${board("wkClick")}
      <p class="text-center text-sm text-gray-300">${W.status === "wrong" ? WL("نقلة غلط. المحاولة دي خلصت.", "Wrong move. This attempt is over.") : W.status === "saving" ? WL("بنسجّل...", "Saving...") : W.color === "w" ? WL("الدور على الأبيض", "White to move") : WL("الدور على الأسود", "Black to move")}</p></div>`;
  }
  return `<div class="space-y-4"><div class="gold-card rounded-2xl p-5 space-y-3 max-w-xl w-full mx-auto">${head}
    <p class="text-base font-bold text-white">${esc(W.doc.title)}</p>
    ${att.solved ? `<p class="text-sm font-bold text-emerald-300">🏅 ${WL("حليته! اسمك في قاعة المشاهير.", "Solved! You are in the Hall of Fame.")}</p>`
      : left ? `<p class="text-sm text-gray-300">${WL(`عندك ${left} من ${WK_ATTEMPTS} محاولات. نقلة غلط واحدة بتنهي المحاولة، والوقت بيتحسب.`, `You have ${left} of ${WK_ATTEMPTS} attempts. One wrong move ends the attempt, and your time counts.`)}</p>
        <button type="button" onclick="wkStart()" ${W.busy || !ChessCls ? "disabled" : ""} class="tap w-full rounded-xl text-sm font-bold gold-btn disabled:opacity-40">${WL("ابدأ المحاولة", "Start an attempt")}</button>`
      : `<p class="text-sm text-gray-300">${WL("خلّصت محاولاتك. حظ أحسن الأسبوع الجاي!", "No attempts left. Good luck next week!")}</p>`}
  </div>${hall}</div>`;
}

// كارت على الرئيسية
function wkHomeCardHTML(stu) {
  const W = arena.weekly, en = lang === "en";
  if (!W.doc) return "";
  const att = W.att || {}, done = !!att.solved;
  return `<section class="gold-card rounded-2xl p-4 flex items-center justify-between gap-3 border border-yellow-500/40">
    <div class="min-w-0"><h3 class="font-bold text-sm text-yellow-300">🎯 ${WL("تحدي الكوتش الأسبوعي", "Coach's weekly challenge")}</h3>
      <p class="text-xs text-gray-300 truncate">${esc(W.doc.title)}${done ? " • 🏅" : ""}</p></div>
    <button type="button" onclick="arena.sub='weekly'; switchTab('arena')" class="tap min-w-[44px] rounded-lg px-3 text-xs font-bold gold-btn">${done ? WL("القاعة", "Hall") : WL("حلّه", "Solve")}</button>
  </section>`;
}
{
  const _sh = renderStudentHome;
  renderStudentHome = function (s) { const c = wkHomeCardHTML(s); return c ? `<div class="space-y-6">${c}${_sh(s)}</div>` : _sh(s); };
  const _r = render;
  render = function () {
    const W = arena.weekly;
    if (!(tab === "arena" && arena.sub === "weekly") && ["play", "wrong"].includes(W.status)) { W.status = "idle"; W.game = null; }
    const out = _r.apply(this, arguments);
    wkLifecycle();
    return out;
  };
}
