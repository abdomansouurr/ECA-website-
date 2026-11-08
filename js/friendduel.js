// ECA — friendduel.js: تحدي صاحبك برابط
// الطالب بيعمل تحدي فيه 5 ألغاز من مستواه، ويبعت الرابط على واتساب. كل واحد بيحل على راحته،
// والنتيجة (الحلول ثم الوقت) بتتحدّث مباشرة. الفايز بياخد ⭐ 3 (مرة في اليوم).

const FD_PUZZLES = 5, FD_STARS = 3;
arena.friend = { status: "idle", id: "", doc: null, unsub: null, mine: null, mineBusy: false, game: null, sol: [], idx: 0, color: "w", flip: false, sel: null, last: null, flash: null, start: 0, busy: false, rewarded: {}, joining: false };
const FL = (ar, en) => lang === "en" ? en : ar;

// الرابط ?duel=ID بيتحفظ لحد ما الطالب يسجّل دخوله
(function () {
  try {
    const id = new URLSearchParams(location.search).get("duel");
    if (id && /^[A-Za-z0-9]{10,40}$/.test(id)) {
      sessionStorage.setItem("ECA_FDUEL", id);
      const url = new URL(location.href); url.searchParams.delete("duel");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  } catch (_) {}
})();

function fdSide(doc, uid) { return doc && doc.a === uid ? "ra" : doc && doc.b === uid ? "rb" : ""; }
function fdLink(id) { return location.origin + "/?duel=" + id; }
function fdPaint() { if (tab === "arena" && arena.sub === "friend") arenaRefresh(); }
function fdName(id, nick) { return id ? ecaStudentAlias({ id, nickname: nick || "" }) : FL("صاحبك", "Your friend"); }

function fdWatch(id) {
  const F = arena.friend;
  if (F.unsub) { F.unsub(); F.unsub = null; }
  Object.assign(F, { id, doc: null, status: "lobby", game: null });
  F.unsub = window.fbFriendWatch(id, doc => {
    if (F.id !== id) return;
    F.doc = doc;
    fdAfterDoc();
    fdPaint();
  });
}
async function fdAfterDoc() {
  const F = arena.friend, d = F.doc, u = currUser();
  if (!d || !u) return;
  // اللي فتح الرابط بيدخل التحدي لوحده
  if (d.status === "open" && d.a !== u.id && !d.b && !F.joining) {
    F.joining = true;
    try { await window.fbFriendJoin(F.id); } catch (e) { console.warn("Friend duel join failed:", e && e.code); toast(FL("ما قدرتش تدخل التحدي ده.", "You could not join this challenge.")); }
    F.joining = false;
  }
  // الفايز بياخد جايزته مرة واحدة
  if (d.status === "done" && d.winner === u.id && !F.rewarded[F.id] && window.fbEconomy) {
    F.rewarded[F.id] = true;
    try {
      const result = await window.fbEconomy({ op: "earn", source: "fduel", key: F.id, day: todayISO() });
      if (result && result.ok && !result.duplicate && window.ecaShowStudentReward) ecaShowStudentReward(result);
      else if (result && result.duplicate) toast(FL("كسبت! جايزة تحدي الأصحاب مرة في اليوم.", "You won! The friend challenge prize is once a day."));
    } catch (e) { console.warn("Friend duel prize failed:", e && e.code); }
    if (window.ecaFireworks) ecaFireworks(3);
    if (window.ecaCheer) ecaCheer("hype");
  }
}
async function fdCreate() {
  const F = arena.friend, u = currUser();
  if (!u || u.role !== "student" || F.busy || !window.fbFriendCreate) return;
  F.busy = true; fdPaint();
  try {
    const ids = await ecaPzPick(u.level, FD_PUZZLES);
    if (ids.length < FD_PUZZLES) throw new Error("bank");
    const id = await window.fbFriendCreate(Number(u.level) || 1, ids);
    fdWatch(id);
  } catch (e) { console.warn("Friend duel create failed:", e && (e.code || e.message)); toast(FL("التحدي ما اتعملش. حاول تاني.", "The challenge could not be created. Try again.")); }
  F.busy = false; fdPaint();
}
window.fdCreate = fdCreate;
function fdOpen(id) { if (/^[A-Za-z0-9]{10,40}$/.test(String(id))) { fdWatch(id); fdPaint(); } }
window.fdOpen = fdOpen;
function fdBack() { const F = arena.friend; if (F.unsub) { F.unsub(); F.unsub = null; } Object.assign(F, { status: "idle", id: "", doc: null, game: null, mine: null }); fdPaint(); }
window.fdBack = fdBack;
async function fdLoadMine() {
  const F = arena.friend;
  if (F.mineBusy || !window.fbFriendMine) return;
  F.mineBusy = true;
  try { F.mine = await window.fbFriendMine(); } catch (e) { console.warn("Friend duels list failed:", e && e.code); F.mine = []; }
  F.mineBusy = false; fdPaint();
}

// اللعب: كل لغز محاولة واحدة، والوقت بيتعدّ من أول ما اللغز يظهر
async function fdPlayNext() {
  const F = arena.friend, u = currUser(), d = F.doc, side = fdSide(d, u && u.id);
  if (!d || !side || F.busy) return;
  const n = Number((d[side] || {}).n) || 0;
  if (n >= FD_PUZZLES) { F.status = "lobby"; F.game = null; return fdPaint(); }
  F.busy = true; fdPaint();
  try {
    const p = await ecaPzFind(d.puzzles[n]);
    if (!p) throw new Error("puzzle missing");
    ecaPzSetup(F, p.fen, p.moves, true);
    F.status = "play"; F.start = Date.now(); F.num = n + 1;
  } catch (e) { console.warn("Friend duel puzzle failed:", e && e.message); toast(FL("اللغز ما اتحمّلش.", "The puzzle could not load.")); F.status = "lobby"; }
  F.busy = false; fdPaint();
  const card = document.getElementById("fdCard"); if (card) card.scrollIntoView({ block: "start" });
}
window.fdPlayNext = fdPlayNext;
function fdClick(sq) { const F = arena.friend; if (F.status !== "play" || F.busy) return; ecaPzClick(F, sq, fdMove); }
window.fdClick = fdClick;
async function fdMove(mv) {
  const F = arena.friend, result = ecaPzPlay(F, mv);
  if (result === "illegal" || result === "next") { if (result === "next" && window.ecaSfx) ecaSfx("ting"); return arenaRefresh(); }
  const solved = result === "solved", ms = Math.max(2000, Date.now() - F.start);
  F.status = "saving"; F.busy = true; arenaRefresh();
  if (solved) { if (window.ecaSfx) ecaSfx("ting"); } else if (window.ecaCheer) ecaCheer("retry");
  try { await window.fbFriendProgress(F.id, solved, ms); }
  catch (e) { console.warn("Friend duel progress failed:", e && e.code); toast(FL("النتيجة ما اتسجلتش. حاول تاني.", "The result was not saved. Try again.")); }
  F.busy = false;
  setTimeout(() => { if (F.status === "saving") { F.status = "lobby"; F.game = null; fdPlayNext(); } }, solved ? 500 : 900);
}
function fdCopy() {
  const F = arena.friend, link = fdLink(F.id);
  try { navigator.clipboard.writeText(link).then(() => toast(FL("الرابط اتنسخ", "Link copied"))); } catch (_) { toast(link); }
}
window.fdCopy = fdCopy;

function fdResultRow(label, a, b) { return `<tr><td class="text-start">${label}</td><td>${a}</td><td>${b}</td></tr>`; }
function arenaFriendHTML() {
  const F = arena.friend, u = currUser(), en = lang === "en";
  if (!u || u.role !== "student") return `<div class="gold-card rounded-2xl p-6 text-center text-sm text-gray-400">${FL("تحدي الأصحاب للطلاب بس.", "Friend challenges are for students.")}</div>`;
  const card = body => `<div id="fdCard" class="gold-card rounded-2xl p-5 space-y-4 max-w-xl w-full mx-auto" style="scroll-margin-top:124px"><h3 class="font-display font-bold text-lg text-yellow-300">🤝 ${FL("تحدي صاحبك", "Challenge a friend")}</h3>${body}</div>`;
  if (!F.id) {
    if (F.mine === null) fdLoadMine();
    const list = (F.mine || []).map(d => {
      const mine = fdSide(d, u.id), rival = mine === "ra" ? fdName(d.b, d.bn) : fdName(d.a, d.an);
      const state = d.status === "done" ? (d.winner === u.id ? FL("كسبت 🏆", "You won 🏆") : d.winner ? FL("خسرت", "You lost") : FL("تعادل", "Draw")) : d.status === "live" ? FL("شغّال", "In progress") : FL("مستني صاحبك", "Waiting for your friend");
      return `<div class="flex items-center justify-between gap-3 p-3 rounded-xl bg-black/30 border border-yellow-500/15"><div class="min-w-0"><b class="block truncate text-sm text-white">${d.b ? esc(rival) : FL("تحدي جديد", "New challenge")}</b><span class="text-xs text-gray-400">${esc(state)}</span></div><button type="button" data-fd="${esc(d.id)}" onclick="fdOpen(this.dataset.fd)" class="tap rounded-lg px-3 text-xs gold-btn">${FL("افتح", "Open")}</button></div>`;
    }).join("");
    return card(`<p class="text-sm text-gray-300">${FL(`اعمل تحدي فيه ${FD_PUZZLES} ألغاز من مستواك وابعته لصاحبك. اللي يحل أكتر يكسب، ولو اتعادلتوا اللي أسرع. الفايز بياخد ⭐ ${FD_STARS} (مرة في اليوم).`, `Create a challenge with ${FD_PUZZLES} puzzles from your Step and send it to a friend. Most solved wins, then the faster time. The winner gets ⭐ ${FD_STARS} (once a day).`)}</p>
      <button type="button" onclick="fdCreate()" ${F.busy || !ChessCls ? "disabled" : ""} class="tap w-full rounded-xl text-sm font-bold gold-btn disabled:opacity-40">${FL("اعمل تحدي جديد", "Create a challenge")}</button>
      ${list ? `<h4 class="text-sm font-bold text-white">${FL("تحدياتك", "Your challenges")}</h4><div class="space-y-2">${list}</div>` : ""}`);
  }
  const d = F.doc;
  if (!d) return card(`<p class="text-sm text-gray-300 text-center py-4">${FL("بنحمّل التحدي...", "Loading the challenge...")}</p>`);
  const side = fdSide(d, u.id), other = side === "ra" ? "rb" : "ra";
  if (!side && !(d.status === "open" && !d.b)) return card(`<p class="text-sm text-gray-300 text-center">${FL("التحدي ده مكتمل بطالبين تانيين.", "This challenge already has two players.")}</p><button type="button" onclick="fdBack()" class="tap w-full rounded-xl text-sm font-bold bg-zinc-800 text-white border border-yellow-500/30">${FL("رجوع", "Back")}</button>`);
  if (F.status === "play" || F.status === "saving") {
    return `<div id="fdCard" class="gold-card rounded-2xl p-3 sm:p-5 space-y-3 max-w-xl w-full mx-auto" style="scroll-margin-top:124px">
      <div class="flex items-center justify-between text-sm"><b class="text-white">🤝 ${FL("لغز", "Puzzle")} ${esc(F.num)} / ${FD_PUZZLES}</b><span class="text-gray-300">${FL("محاولة واحدة لكل لغز", "One try per puzzle")}</span></div>
      ${boardHTML({ game: F.game, flip: F.flip, sel: F.sel, targets: targetsOf(F.game, F.sel), last: F.last, flash: F.flash, onClick: "fdClick" })}
      <p class="text-center text-sm text-gray-300">${F.status === "saving" ? FL("بنسجّل...", "Saving...") : F.color === "w" ? FL("الدور على الأبيض", "White to move") : FL("الدور على الأسود", "Black to move")}</p>
    </div>`;
  }
  const me = d[side] || {}, them = d[other] || {}, myN = Number(me.n) || 0, theirN = Number(them.n) || 0;
  const meName = FL("انت", "You"), themName = side === "ra" ? fdName(d.b, d.bn) : fdName(d.a, d.an);
  const canPlay = myN < FD_PUZZLES && (side === "ra" ? ["open", "live"].includes(d.status) : d.status === "live");
  const share = side === "ra" && d.status === "open" ? `<div class="rounded-xl bg-black/30 border border-yellow-500/20 p-3 space-y-2">
      <p class="text-sm text-gray-200">${FL("ابعت الرابط ده لصاحبك:", "Send this link to your friend:")}</p>
      <input readonly value="${esc(fdLink(d.id))}" aria-label="${FL("رابط التحدي", "Challenge link")}" class="w-full min-h-[44px] rounded-lg bg-black border border-yellow-500/40 px-3 text-xs text-white" dir="ltr" />
      <div class="grid grid-cols-2 gap-2">
        <button type="button" onclick="fdCopy()" class="tap rounded-lg text-xs font-bold bg-zinc-800 text-white border border-yellow-500/30">${FL("انسخ الرابط", "Copy link")}</button>
        <a href="https://wa.me/?text=${encodeURIComponent(FL("تعالى نتحدى في 5 ألغاز شطرنج على منصة ECA! ", "Let's race on 5 chess puzzles on the ECA platform! ") + fdLink(d.id))}" target="_blank" rel="noopener noreferrer" class="tap rounded-lg text-xs font-bold text-white flex items-center justify-center" style="background:#16a34a">${FL("ابعت على واتساب", "Share on WhatsApp")}</a>
      </div>
    </div>` : "";
  const bar = (n, s) => `<div class="eca-quest-track" role="progressbar" aria-valuemin="0" aria-valuemax="${FD_PUZZLES}" aria-valuenow="${n}"><div style="width:${Math.round(n / FD_PUZZLES * 100)}%"></div></div><span class="text-xs text-gray-400">${n}/${FD_PUZZLES} • ✅ ${s}</span>`;
  const progress = `<div class="grid grid-cols-2 gap-3">
      <div class="space-y-1"><b class="text-sm text-white">${esc(meName)}</b>${bar(myN, Number(me.solved) || 0)}</div>
      <div class="space-y-1"><b class="block truncate text-sm text-white">${esc(themName)}</b>${d.b || side === "rb" ? bar(theirN, Number(them.solved) || 0) : `<span class="text-xs text-gray-400">${FL("لسه ما دخلش", "Not joined yet")}</span>`}</div>
    </div>`;
  let result = "";
  if (d.status === "done") {
    const acc = r => Math.round((Number(r.solved) || 0) / FD_PUZZLES * 100) + "%", sec = r => ((Number(r.ms) || 0) / 1000).toFixed(1) + (en ? "s" : " ث");
    result = `<div class="space-y-2"><p class="text-lg font-bold text-center ${d.winner === u.id ? "text-emerald-300" : "text-gray-200"}">${d.winner === u.id ? FL("كسبت التحدي! 🏆", "You won the challenge! 🏆") : d.winner ? FL("صاحبك كسب المرة دي!", "Your friend won this time!") : FL("تعادل!", "It's a draw!")}</p>
      <table class="w-full text-sm text-center text-white"><tr class="text-yellow-300"><th></th><th>${esc(meName)}</th><th class="truncate">${esc(themName)}</th></tr>
        ${fdResultRow(FL("الحلول", "Solved"), esc(me.solved || 0) + "/" + FD_PUZZLES, esc(them.solved || 0) + "/" + FD_PUZZLES)}
        ${fdResultRow(FL("الدقة", "Accuracy"), acc(me), acc(them))}
        ${fdResultRow(FL("الوقت", "Time"), sec(me), sec(them))}</table>
      ${window.ecaEmoteButton ? `<div class="flex items-center justify-center gap-2 text-sm text-gray-300">${FL("شجّع صاحبك:", "Cheer your friend:")} ${ecaEmoteButton(side === "ra" ? d.b : d.a)}</div>` : ""}</div>`;
  }
  return card(`${share}${progress}${result}
    ${canPlay ? `<button type="button" onclick="fdPlayNext()" ${F.busy || !ChessCls ? "disabled" : ""} class="tap w-full rounded-xl text-sm font-bold gold-btn disabled:opacity-40">${myN ? FL("كمّل", "Continue") : FL("ابدأ الألغاز", "Start the puzzles")}</button>` : ""}
    ${myN >= FD_PUZZLES && d.status !== "done" ? `<p class="text-sm text-gray-300 text-center">⏳ ${FL("خلّصت! مستنيين صاحبك يخلّص.", "Done! Waiting for your friend to finish.")}</p>` : ""}
    <button type="button" onclick="fdBack()" class="tap w-full rounded-xl text-sm font-bold bg-zinc-800 text-white border border-yellow-500/30">${FL("رجوع", "Back")}</button>`);
}

// فتح التحدي من الرابط بعد تسجيل الدخول، والخروج من الصفحة بيقفل اللغز المفتوح
{
  const _r = render;
  render = function () {
    const F = arena.friend, here = tab === "arena" && arena.sub === "friend";
    if (!here && F.status === "play") { F.status = "lobby"; F.game = null; }
    // متابعة التحدي بتقف لما الطالب يسيب التاب، وبترجع لما يرجعله
    if (!here && F.unsub) { F.unsub(); F.unsub = null; }
    const out = _r.apply(this, arguments), u = currUser();
    if (here && F.id && !F.unsub && u && !window.__authLoading && window.fbFriendWatch) fdOpen(F.id);
    if (u && u.role === "student" && !window.__authLoading && window.fbFriendWatch) {
      let pending = "";
      try { pending = sessionStorage.getItem("ECA_FDUEL") || ""; if (pending) sessionStorage.removeItem("ECA_FDUEL"); } catch (_) {}
      if (pending) { fdOpen(pending); arena.sub = "friend"; switchTab("arena"); }
    }
    return out;
  };
}
