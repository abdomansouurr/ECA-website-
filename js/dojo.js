// ECA — dojo.js: دوجو الانتقام (خزنة الغلطات) — بيحل محل «مراجعة الغلطات» القديمة
// كل لغز الطالب بيغلط فيه في «ألغاز على الرقعة» بيتسجل في users/{uid}/mistakeVault/{puzzleId}
// وبيرجعله بالتكرار المتباعد. حله في الدوجو بيدّي «مكافأة العودة» (2 نجمة + 40 خبرة، 5 مرات في اليوم بالكتير).
// بيعتمد على: arena, ChessCls, lastOf, uciMove, arenaRefresh, loadPuzzleBank, puzLoad (arena.js) و review.js

const DOJO_GAPS_MIN = [30, 24 * 60, 3 * 24 * 60, 7 * 24 * 60];   // بعد كل غلطة: نص ساعة، يوم، 3 أيام، أسبوع
const DOJO_MOTIFS = ["pin", "fork", "discoveredAttack", "doubleCheck", "deflection", "skewer", "mateIn1", "mateIn2"];
let dojoRows = null, dojoLoading = false, dojoMigrated = false;
const DL = (ar, en) => lang === "en" ? en : ar;

function dojoNextAt(attempts) { return new Date(Date.now() + DOJO_GAPS_MIN[Math.min(DOJO_GAPS_MIN.length - 1, Math.max(0, attempts - 1))] * 60000); }
function dojoDue() { const now = Date.now(); return (dojoRows || []).filter(r => r.nextMs <= now).sort((a, b) => a.nextMs - b.nextMs); }

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
  if (result && result.ok && !result.duplicate) {
    if (window.ecaShowStudentReward) ecaShowStudentReward(result);
    toast(DL("🥋 مكافأة العودة! انتقمت من اللغز ده", "🥋 Comeback bonus! You got your revenge on this puzzle"));
    if (window.ecaCheer) ecaCheer("hype");
    if (window.ecaConfetti) ecaConfetti(60);
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
  const due = dojoDue();
  if (!due.length) { Z.review = false; toast(DL("خلّصت الدوجو! مفيش ألغاز مستحقة دلوقتي", "Dojo cleared! Nothing is due right now")); return puzLoad(); }
  if (!ChessCls) return;
  // لو لغز تاني لسه بيتحمّل، نستنى يخلص ونبدأ الدوجو بعده
  if (Z.status === "loading") { if ((Z.dojoWait = (Z.dojoWait || 0) + 1) <= 40) setTimeout(reviewLoad, 250); return; }
  Z.dojoWait = 0;
  const row = due[0], id = row.id;
  Z.status = "loading"; Z.sel = null; Z.hint = null; Z.flash = null; Z.review = true; arenaRefresh();
  const done = (g, sol, last, rating, themes) => Object.assign(Z, { game: g, sol, idx: 0, color: g.turn(), flip: g.turn() === "b", last, counted: false, status: "play", review: true,
    info: { id, rating: Number(rating) || 0, themes: themes || [] } });
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
reviewStart = function () { arena.puz.counted = true; reviewLoad(); };
window.reviewStart = reviewStart;
window.reviewLoad = reviewLoad;

// الصندوق اللي جوه شاشة الألغاز
reviewBoxHTML = function () {
  const u = currUser(); if (!u || u.role !== "student") return "";
  if (dojoRows === null) { dojoRefresh(); return `<p class="text-xs text-gray-400">${DL("بنحمّل الدوجو...", "Loading the dojo...")}</p>`; }
  const Z = arena.puz, due = dojoDue(), all = dojoRows || [];
  if (Z.review) return `<div class="rounded-xl bg-violet-500/10 border border-violet-500/40 p-3 space-y-2">
    <div class="text-sm font-bold text-violet-300">🥋 ${DL("دوجو الانتقام", "Dojo Revenge")} — ${DL(`فاضل ${Math.max(0, due.length - 1)} بعد ده`, `${Math.max(0, due.length - 1)} left after this`)}</div>
    <p class="text-xs text-gray-300">${DL("حله صح وخد مكافأة العودة: ⭐ 2 و40 خبرة.", "Solve it for the comeback bonus: ⭐ 2 and 40 XP.")}</p>
    <div class="flex gap-2">
      <button onclick="reviewLoad()" ${Z.status === "loading" ? "disabled" : ""} class="tap flex-1 rounded-xl text-xs bg-violet-500/20 text-violet-200 border border-violet-500/50 disabled:opacity-40">${DL("اللي بعده", "Next")}</button>
      <button onclick="puzLoad()" class="tap px-3 rounded-xl text-xs bg-zinc-900 text-gray-300 border border-zinc-700">${DL("خروج", "Exit")}</button>
    </div>
  </div>`;
  if (!all.length) return `<p class="text-xs text-gray-400">🥋 ${DL("الألغاز اللي تغلط فيها بتروح دوجو الانتقام، وترجعلك عشان تنتقم منها.", "Puzzles you miss go to the Dojo, so you can come back for revenge.")}</p>`;
  const next = all.slice().sort((a, b) => a.nextMs - b.nextMs)[0];
  return `<div class="rounded-xl bg-black/40 border border-violet-500/40 p-3 flex items-center justify-between gap-2">
    <div class="text-xs"><b class="text-violet-300">🥋 ${DL("دوجو الانتقام", "Dojo Revenge")}</b>
      <div class="text-xs text-gray-400">${due.length ? DL(`${due.length} لغز مستني انتقامك`, `${due.length} waiting for revenge`) : DL("الجاي " + new Date(next.nextMs).toLocaleString("ar-EG", { weekday: "short", hour: "numeric", minute: "2-digit" }), "Next " + new Date(next.nextMs).toLocaleString("en-GB", { weekday: "short", hour: "numeric", minute: "2-digit" }))} • ${DL(`${all.length} في الخزنة`, `${all.length} in the vault`)}</div></div>
    ${due.length ? `<button onclick="reviewStart()" class="tap px-3 rounded-xl text-xs font-bold bg-violet-500/25 text-violet-100 border border-violet-500/60">${DL("انتقم", "Fight")}</button>` : ""}
  </div>`;
};
