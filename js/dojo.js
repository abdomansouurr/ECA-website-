// ECA — dojo.js: «اتعلم من أخطائك» (Smart Dojo — خزنة الغلطات) — بيحل محل «مراجعة الغلطات» القديمة
// كل لغز الطالب بيغلط فيه في «ألغاز على الرقعة» بيتسجل في users/{uid}/mistakeVault/{puzzleId}
// وبيرجعله بالتكرار المتباعد. حله في الدوجو بيدّي «مكافأة العودة» (2 نجمة + 40 خبرة، 5 مرات في اليوم بالكتير).
// بيعتمد على: arena, ChessCls, lastOf, uciMove, arenaRefresh, loadPuzzleBank, puzLoad (arena.js) و review.js

const DOJO_GAPS_MIN = [30, 24 * 60, 3 * 24 * 60, 7 * 24 * 60];   // بعد كل غلطة: نص ساعة، يوم، 3 أيام، أسبوع
const DOJO_MOTIFS = ["pin", "fork", "discoveredAttack", "doubleCheck", "deflection", "skewer", "mateIn1", "mateIn2"];
let dojoRows = null, dojoLoading = false, dojoMigrated = false;
const DL = (ar, en) => lang === "en" ? en : ar;

function dojoNextAt(attempts) { return new Date(Date.now() + DOJO_GAPS_MIN[Math.min(DOJO_GAPS_MIN.length - 1, Math.max(0, attempts - 1))] * 60000); }
function dojoIsGame(r) { return !!r && r.source === "my_game_blunder"; }
function dojoDue(kind) {
  const now = Date.now(), rows = (dojoRows || []).filter(r => r.nextMs <= now && (!kind || (kind === "games") === dojoIsGame(r)));
  return kind === "games" ? rows.sort((a, b) => (b.playedAt || 0) - (a.playedAt || 0) || (a.ply || 0) - (b.ply || 0)) : rows.sort((a, b) => a.nextMs - b.nextMs);
}

async function dojoRefresh() {
  const u = currUser();
  if (!u || u.role !== "student" || !window.fbVaultList || dojoLoading) return;
  dojoLoading = true;
  try {
    // الغلطات اللي كانت في المراجعة القديمة بتتنقل للخزنة مرة واحدة
    if (!dojoMigrated && u.review && Object.keys(u.review).length) {
      dojoMigrated = true;
      const ids = Object.keys(u.review).filter(id => /^[A-Za-z0-9]{3,20}$/.test(id)).slice(0, 150);
      for (const id of ids) { try { await window.fbVaultFail(id, { motifs: [], step: Number(u.level) || 1, rating: 0 }); } catch (_) {} }
      u.review = {};
      save();
    }
    dojoRows = await window.fbVaultList();
  } catch (e) { console.warn("Dojo list failed:", e && e.code); }
  dojoLoading = false;
  if (tab === "arena" && arena.sub === "puzzles") arenaRefresh();
}

// اللغز الغلط في الساحة بيدخل الخزنة (بتتنادى من puzCount في arena.js)
reviewAdd = function (u, id) {
  id = String(id || "").replace(/[^A-Za-z0-9]/g, "");
  if (!id || !/^[A-Za-z0-9]{3,20}$/.test(id) || !window.fbVaultFail) return;
  const info = arena.puz.info || {};
  const motifs = (info.themes || []).filter(t => DOJO_MOTIFS.includes(t)).slice(0, 8);
  window.fbVaultFail(id, { motifs, step: Number(u.level) || 1, rating: Number(info.rating) || 0 })
    .then(() => dojoRefresh())
    .catch(e => console.warn("Mistake vault save failed:", e && e.code));
};

// نتيجة لغز الدوجو (بتتنادى من puzCount لما arena.puz.review = true)
reviewResult = async function (id, solved) {
  const u = currUser();
  if (!u || u.role !== "student" || !id) return;
  if (typeof markActiveDay === "function") { markActiveDay(u); save(); }
  if (!solved) {
    if (window.ecaCheer) ecaCheer("retry");
    try { await window.fbVaultFail(id, null); } catch (e) { console.warn("Dojo retry save failed:", e && e.code); }
    return dojoRefresh();
  }
  let result = null;
  try { result = await window.fbEconomy({ op: "earn", source: "dojo", key: id, day: todayISO(), mult: window.coachRewardMult ? coachRewardMult(arena.puz) : 1 }); }
  catch (e) { console.warn("Comeback bonus failed:", e && e.code); }
  try { await window.fbVaultResolve(id); } catch (e) { console.warn("Dojo resolve failed:", e && e.code); }
  const fromGame = String(id).startsWith("blunder_");
  if (fromGame) toast(DL("👏 ممتاز! صلحت خطأ مباراتك واتعلمت الفكرة الصح!", "👏 Excellent! You fixed your game mistake and learned the right idea!") + (result && result.ok && !result.duplicate ? " +" + (Number(result.xpDelta) || 0) + " XP" : ""));
  if (result && result.ok && !result.duplicate) {
    if (window.ecaShowStudentReward) ecaShowStudentReward(result);
    if (!fromGame) toast(DL("🥋 مكافأة العودة! انتقمت من اللغز ده", "🥋 Comeback bonus! You got your revenge on this puzzle"));
    if (window.ecaCheer) ecaCheer("hype");
    if (window.ecaConfetti) ecaConfetti(60);
  } else if (fromGame) {
    // الرسالة اتعرضت فوق
  } else if (result && result.code === "dojo-cap") {
    toast(DL("اتحل! مكافأة العودة 5 مرات في اليوم بس، كمّل تمرين", "Solved! The comeback bonus is limited to 5 a day. Keep training"));
  } else if (result && result.code === "dojo-early") {
    toast(DL("اتحل! المكافأة بتبدأ بعد نص ساعة من الغلطة", "Solved! The bonus starts 30 minutes after the mistake"));
  } else {
    toast(DL("اتحل! ومش هيرجعلك تاني", "Solved! It won't come back again"));
  }
  dojoRefresh();
};

// تحميل لغز من الخزنة: من Lichess بالرقم، ولو مش متاح من البنك اللي جوه الموقع
reviewLoad = async function () {
  const Z = arena.puz;
  if (!dojoRows) await dojoRefresh();
  const due = dojoDue(Z.dojoKind || "");
  if (!due.length) { Z.review = false; Z.dojoKind = ""; toast(DL("خلّصت «اتعلم من أخطائك»! مفيش ألغاز مستحقة دلوقتي", "Learn from your mistakes: all done! Nothing is due right now")); return puzLoad(); }
  if (!ChessCls) return;
  // لو لغز تاني لسه بيتحمّل، نستنى يخلص ونبدأ الدوجو بعده
  if (Z.status === "loading") { if ((Z.dojoWait = (Z.dojoWait || 0) + 1) <= 40) setTimeout(reviewLoad, 250); return; }
  Z.dojoWait = 0;
  const row = due[0], id = row.id;
  Z.status = "loading"; Z.sel = null; Z.hint = null; Z.flash = null; Z.review = true; arenaRefresh();
  const done = (g, sol, last, rating, themes) => Object.assign(Z, { game: g, sol, idx: 0, color: g.turn(), flip: g.turn() === "b", last, counted: false, status: "play", review: true,
    info: { id, rating: Number(rating) || 0, themes: themes || [] } });
  if (dojoIsGame(row)) {
    let g = null; try { g = new ChessCls(row.fen); } catch (_) { g = null; }
    const sol = (row.solutionMovesUci || []).filter(u => /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(u));
    if (!g || !sol.length) {
      try { await window.fbVaultResolve(id); } catch (_) {}
      dojoRows = (dojoRows || []).filter(x => x.id !== id);
      Z.status = "idle"; Z.review = false; return reviewLoad();
    }
    done(g, sol, null, 0, row.motif ? [row.motif] : []);
    Z.info.blunder = row;
    return arenaRefresh();
  }
  try {
    const r = await fetch("https://lichess.org/api/puzzle/" + encodeURIComponent(id), { headers: { Accept: "application/json" } });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json(), g = new ChessCls(); g.loadPgn(j.game.pgn);
    done(g, j.puzzle.solution || [], lastOf(g), j.puzzle.rating, (j.puzzle.themes || []).slice(0, 8).map(t => String(t).replace(/[^A-Za-z0-9]/g, "")));
  } catch (e) {
    try {
      const bank = await loadPuzzleBank();
      const found = Object.values(bank).flat().find(x => x.split("|")[0] === id);
      if (!found) throw new Error("not in bank");
      const [, fen, moves, rating] = found.split("|"), mv = moves.split(" ");
      const g = new ChessCls(fen), r0 = uciMove(g, mv[0]);
      done(g, mv.slice(1), [r0.from, r0.to], rating, row.motifs);
    } catch (_) {
      // اللغز مش متاح خالص: بنقفله ونكمّل باللي بعده
      try { await window.fbVaultResolve(id); } catch (_) {}
      dojoRows = (dojoRows || []).filter(x => x.id !== id);
      Z.status = "idle"; Z.review = false; return reviewLoad();
    }
  }
  arenaRefresh();
};
// لغز بيتحمّل دلوقتي (زي لغز الدوجو) ما يتلغيش بطلب تحميل تاني، عشان وضع الدوجو ما يضيعش
{
  const _pl = puzLoad;
  puzLoad = function () { if (arena.puz.status === "loading") return; return _pl.apply(this, arguments); };
}
reviewStart = function (kind) { arena.puz.counted = true; arena.puz.dojoKind = kind === "games" || kind === "puzzles" ? kind : ""; reviewLoad(); };
window.reviewStart = reviewStart;
window.reviewLoad = reviewLoad;

// الصندوق اللي جوه شاشة الألغاز
reviewBoxHTML = function () {
  const u = currUser(); if (!u || u.role !== "student") return "";
  if (dojoRows === null) { dojoRefresh(); return `<p class="text-xs text-gray-400">${DL("بنحمّل «اتعلم من أخطائك»...", "Loading Learn from your mistakes...")}</p>`; }
  const Z = arena.puz, due = dojoDue(Z.review ? Z.dojoKind || "" : ""), all = dojoRows || [];
  const bl = Z.review && Z.info && Z.info.blunder;
  const blBanner = bl ? `<div class="eca-blunder-banner" role="note"><b>🔥 ${DL("موقف حقيقي من مباراتك", "A real position from your game")}</b>
      <p>${DL("مباراة سابقة ضد:", "Previous game vs:")} <b>${esc(bl.opponentName || "?")}</b> • ${DL("النقلة التي لعبتها وقتها:", "The move you played then:")} <b dir="ltr">${esc(bl.wrongMovePlayedSan || "")} (${String(bl.customPromptAr || "").includes("⚡") ? "⚡" : "??"})</b></p>
      <p class="eca-blunder-ask">${esc(lang === "en" ? "Can you find the right move this time?" : bl.customPromptAr || "")}</p></div>` : "";
  if (Z.review) return `<div class="rounded-xl bg-violet-500/10 border border-violet-500/40 p-3 space-y-2">${blBanner}
    <div class="text-sm font-bold text-violet-300">🥋 ${DL("اتعلم من أخطائك", "Learn from your mistakes")} <span dir="ltr">(Smart Dojo)</span> — ${DL(`فاضل ${Math.max(0, due.length - 1)} بعد ده`, `${Math.max(0, due.length - 1)} left after this`)}</div>
    <p class="text-xs text-gray-300">${DL("حله صح وخد مكافأة العودة: ⭐ 2 و40 خبرة.", "Solve it for the comeback bonus: ⭐ 2 and 40 XP.")}</p>
    <div class="flex gap-2">
      <button onclick="reviewLoad()" ${Z.status === "loading" ? "disabled" : ""} class="tap flex-1 rounded-xl text-xs bg-violet-500/20 text-violet-200 border border-violet-500/50 disabled:opacity-40">${DL("اللي بعده", "Next")}</button>
      <button onclick="puzLoad()" class="tap px-3 rounded-xl text-xs bg-zinc-900 text-gray-300 border border-zinc-700">${DL("خروج", "Exit")}</button>
    </div>
  </div>`;
  if (!all.length) return `<p class="text-xs text-gray-400">🥋 ${DL("الألغاز اللي تغلط فيها وأخطاء أدوارك بتروح «اتعلم من أخطائك»، وترجعلك عشان تصلّحها.", "Puzzles you miss and mistakes from your games go to Learn from your mistakes, so you can fix them.")}</p>`;
  const next = all.slice().sort((a, b) => a.nextMs - b.nextMs)[0];
  const dueG = dojoDue("games").length, dueP = dojoDue("puzzles").length, allG = all.filter(dojoIsGame).length;
  const tabs = `<div class="eca-dojo-tabs" role="group" aria-label="${DL("نوع الأخطاء", "Mistake type")}">
      <button type="button" onclick="reviewStart('games')" class="tap eca-dojo-tab is-games" data-dojo-kind="games" ${dueG ? "" : "disabled"}>🔥 ${DL(`أخطاء مبارياتي (${allG})`, `My game mistakes (${allG})`)}</button>
      <button type="button" onclick="reviewStart('puzzles')" class="tap eca-dojo-tab" data-dojo-kind="puzzles" ${dueP ? "" : "disabled"}>🥋 ${DL(`ألغاز غلطت فيها (${all.length - allG})`, `Missed puzzles (${all.length - allG})`)}</button></div>`;
  return tabs + `<div class="rounded-xl bg-black/40 border border-violet-500/40 p-3 flex items-center justify-between gap-2">
    <div class="text-xs"><b class="text-violet-300">🥋 ${DL("اتعلم من أخطائك", "Learn from your mistakes")} <span dir="ltr">(Smart Dojo)</span></b>
      <div class="text-xs text-gray-400">${due.length ? DL(`${due.length} لغز مستني انتقامك`, `${due.length} waiting for revenge`) : DL("الجاي " + new Date(next.nextMs).toLocaleString("ar-EG", { weekday: "short", hour: "numeric", minute: "2-digit" }), "Next " + new Date(next.nextMs).toLocaleString("en-GB", { weekday: "short", hour: "numeric", minute: "2-digit" }))} • ${DL(`${all.length} في الخزنة`, `${all.length} in the vault`)}</div></div>
    ${due.length ? `<button onclick="reviewStart()" class="tap px-3 rounded-xl text-xs font-bold bg-violet-500/25 text-violet-100 border border-violet-500/60">${DL("انتقم", "Fight")}</button>` : ""}
  </div>`;
};
