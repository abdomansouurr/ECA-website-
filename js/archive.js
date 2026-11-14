// ECA — archive.js: «📚 أرشيف أدواري»
// كل دور (مباشر، بطولة، ضد البوت، أو PGN مستورد) بيتحفظ مرة واحدة كمستند صغير (~1.5KB) في archivedGames/{gameId}
// ونسخة على الجهاز (eca_saved_games_{uid}). القايمة بتظهر من الجهاز فوراً، وبنجيب من السيرفر الأدوار الأحدث بس (15 في المرة).
// التحليل بيتعمل على رقعة التحليل بعد الدور، وملخصه (الدقة + درجة كل نقلة) بيتحفظ، فلما تفتح الدور تاني الشارات بتظهر في 0ms.

const AGT = (ar, en) => lang === "en" ? en : ar;
const AG_START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
const AG_TIER = { BRILLIANT: "R", GREAT: "G", BEST: "T", EXCELLENT: "E", GOOD: "O", BOOK: "K", INACCURACY: "I", MISTAKE: "M", MISSED_WIN: "W", BLUNDER: "X" };
const AG_TIER_OF = Object.keys(AG_TIER).reduce((o, k) => { o[AG_TIER[k]] = k; return o; }, {});
const AG_FILTERS = [["all", "الكل", "All"], ["arena", "أدوار البطولات", "Arena games"], ["pvp", "ضد الأصدقاء", "Vs friends"], ["bot", "ضد البوتات", "Vs bots"], ["review", "تحتاج مراجعة", "Needs review"]];
arena.archive = { filter: "all", busy: false, synced: "", err: false, importOpen: false };
function agUid() { return window.fbMyUid ? fbMyUid() : ""; }
function agIdOk(id) { return /^[A-Za-z0-9_-]{10,60}$/.test(String(id || "")); }
window.ecaArchiveTier = c => AG_TIER_OF[c] || null;

// ================= النسخة اللي على الجهاز =================
function agKey(uid) { return "eca_saved_games_" + uid; }
function agCache(uid) {
  try { const v = JSON.parse(localStorage.getItem(agKey(uid)) || "null"); if (v && Array.isArray(v.games)) return v; } catch (_) {}
  return { v: 1, games: [], end: false };
}
function agCachePut(uid, c) {
  c.games.sort((a, b) => (b.playedAt || 0) - (a.playedAt || 0));
  c.games = c.games.slice(0, 300);
  try { localStorage.setItem(agKey(uid), JSON.stringify(c)); } catch (_) {}
  return c;
}
function agMerge(uid, rows, extra) {
  const c = agCache(uid), byId = new Map(c.games.map(g => [g.gameId, g]));
  rows.forEach(r => byId.set(r.gameId, Object.assign({}, byId.get(r.gameId) || {}, r)));
  c.games = [...byId.values()];
  if (extra) Object.assign(c, extra);
  return agCachePut(uid, c);
}
function agFind(gid) { const uid = agUid(); return uid ? agCache(uid).games.find(g => g.gameId === gid) || null : null; }

// ================= بناء المستند =================
function agNewId(prefix) { return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function agClean(s, max) { return String(s || "").replace(/[<>"'`]/g, "").trim().slice(0, max) || "?"; }
function agPgnTc(tc) { const m = /^(\d+)\+(\d+)$/.exec(tc || ""); return m ? Number(m[1]) * 60 + "+" + m[2] : "-"; }
function agClk(cs) { const t = Math.max(0, Math.round(cs)) / 100, h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = (t % 60).toFixed(1); return h + ":" + String(m).padStart(2, "0") + ":" + s.padStart(4, "0"); }
function agSans(rec) {
  const g = new ChessCls(), out = [];
  for (const u of String(rec.uciMoves || "").split(" ").filter(Boolean)) { let r = null; try { r = uciMove(g, u); } catch (_) {} if (!r) break; out.push(r.san); }
  return out;
}
function agPgnText(rec, sans, clocks) {
  const d = new Date(rec.playedAt || Date.now()), pad = n => String(n).padStart(2, "0");
  const ev = { arena: "ECA Arena", pvp: "ECA Live", bot: "ECA vs Bot", import: "ECA Import" }[rec.mode] || "ECA";
  const head = [["Event", ev], ["Site", "Egypt Chess Academy"], ["Date", d.getFullYear() + "." + pad(d.getMonth() + 1) + "." + pad(d.getDate())], ["White", rec.whiteName], ["Black", rec.blackName], ["Result", rec.result],
    ["TimeControl", agPgnTc(rec.timeControl)], ["Termination", rec.termination || "normal"]].concat(rec.openingNameAr ? [["Opening", rec.openingNameAr]] : [])
    .map(([k, v]) => `[${k} "${String(v).replace(/["\\<>`]/g, "")}"]`).join("\n");
  let body = "";
  sans.forEach((s, i) => { body += (i % 2 ? "" : (i / 2 + 1) + ". ") + s + (clocks && clocks[i] > 0 ? ` {[%clk ${agClk(clocks[i])}]}` : "") + " "; });
  return head + "\n\n" + body + rec.result;
}
// o: { gameId, game, white: { uid, name, rating }, black, mode, tc, result, termination, clocks (ms), participants }
function ecaArchiveBuild(o) {
  const h = o.game.history({ verbose: true }), sans = h.map(m => m.san);
  const op = window.EcaOpeningBook ? EcaOpeningBook.opening(h.slice(0, 24).map(m => m.after)) : null;
  const rate = v => v == null || !isFinite(v) ? null : Math.max(0, Math.min(4000, Math.round(v)));
  const rec = {
    gameId: o.gameId, whiteUid: o.white.uid || "", whiteName: agClean(o.white.name, 40), whiteRating: rate(o.white.rating),
    blackUid: o.black.uid || "", blackName: agClean(o.black.name, 40), blackRating: rate(o.black.rating), mode: o.mode,
    timeControl: /^[0-9+-]{1,12}$/.test(o.tc || "") ? o.tc : "-", result: ["1-0", "0-1", "1/2-1/2"].includes(o.result) ? o.result : "*",
    termination: String(o.termination || "").replace(/[^a-z-]/g, "").slice(0, 20), pgn: "",
    uciMoves: h.map(m => m.from + m.to + (m.promotion || "")).join(" "),
    clockTimesCentisec: (o.clocks || []).slice(0, h.length).map(ms => Math.max(0, Math.round((Number(ms) || 0) / 10))),
    openingNameAr: op ? String(op.ar + (op.eco ? " (" + op.eco + ")" : "")).replace(/[<>`]/g, "").slice(0, 160) : "",
    analysisSummary: null, playedAt: Date.now(), participantUids: o.participants
  };
  rec.pgn = agPgnText(rec, sans).replace(/[<>`]/g, "").slice(0, 20000);
  return rec;
}
// الحفظ: على الجهاز الأول (يظهر حتى من غير نت)، وبعدين على السيرفر
async function ecaArchiveSave(rec) {
  const uid = agUid(); if (!uid || !window.fbArchiveSave || !agIdOk(rec.gameId)) return null;
  const had = agFind(rec.gameId);
  if (had && !had.pending) return "exists";
  agMerge(uid, [Object.assign({}, rec, { pending: true })]);
  try { const r = await window.fbArchiveSave(rec); agMerge(uid, [{ gameId: rec.gameId, pending: false, localTime: true }]); agPaint(); return r; }
  catch (e) { console.warn("Archive save failed:", e && e.code); return null; }
}
window.ecaArchiveBuild = ecaArchiveBuild; window.ecaArchiveSave = ecaArchiveSave;
// دور مباشر خلص (live.js): مستند واحد للاتنين، اسمه نفس id الدور
window.ecaArchiveFromLive = function (d, game, clocks) {
  const name = (uid, nick) => window.ecaStudentAlias ? ecaStudentAlias({ id: uid, nickname: nick || "" }) : "ECA";
  const rec = ecaArchiveBuild({ gameId: d.id, game, white: { uid: d.w, name: name(d.w, d.wn), rating: null }, black: { uid: d.b, name: name(d.b, d.bn), rating: null },
    mode: d.mode === "arena" ? "arena" : "pvp", tc: d.tc, result: d.res, termination: d.why, clocks, participants: [d.w, d.b] });
  ecaArchiveSave(rec);
  return rec;
};
// دور ضد البوت خلص: بيتحفظ لوحده (من غير ما الطالب يعمل حاجة)
function agBotRec(P) {
  const uid = agUid(), u = typeof currUser === "function" ? currUser() : null;
  if (!uid || !u || u.role !== "student" || !P.game || P.game.history().length < 2) return null;
  const coach = typeof COACH_BOT !== "undefined" && P.level === COACH_BOT, lv = coach ? (typeof COACH_LEVELS !== "undefined" ? COACH_LEVELS[(P.coachLevel || 1) - 1] : null) : (typeof LEVELS !== "undefined" ? LEVELS[P.level] : null);
  const botName = coach ? "Coach " + (P.coachLevel || 1) : (lv && lv.name) || "Bot", botRating = lv ? parseInt(String(lv.elo || "").replace(/[^0-9]/g, ""), 10) : null;
  const me = { uid, name: window.ecaStudentAlias ? ecaStudentAlias(u) : "ECA", rating: null }, bot = { uid: "bot-" + (coach ? "c" + (P.coachLevel || 1) : P.level + 1), name: botName, rating: botRating };
  const g = P.game, res = P.over === "draw" ? "1/2-1/2" : (P.over === "win") === (P.color === "w") ? "1-0" : "0-1";
  const why = P.reason === "resign" ? "resign" : P.reason === "time" ? "timeout" : P.reason === "left" ? "abandon" : g.isCheckmate() ? "checkmate" : g.isStalemate() ? "stalemate" : g.isThreefoldRepetition() ? "repetition" : g.isInsufficientMaterial() ? "material" : g.isDraw() ? "fifty" : "";
  const tc = typeof PLAY_TC !== "undefined" && P.clk && PLAY_TC[P.tc] ? PLAY_TC[P.tc][3] : "-";
  return ecaArchiveBuild({ gameId: agNewId("bot"), game: g, white: P.color === "w" ? me : bot, black: P.color === "w" ? bot : me, mode: "bot", tc, result: res, termination: why, clocks: P.clkLog || [], participants: [uid] });
}
{
  const _r = render;
  render = function () {
    const P = arena.play;
    if (P && P.game && P.over && P._agGame !== P.game) { P._agGame = P.game; try { const rec = agBotRec(P); if (rec) { P._agRec = rec; ecaArchiveSave(rec); } } catch (e) { console.warn("Bot archive failed:", e); } }
    return _r.apply(this, arguments);
  };
}

// ================= القايمة: من الجهاز فوراً + الأحدث من السيرفر =================
async function agSync(older) {
  const A = arena.archive, uid = agUid(); if (!uid || A.busy || !window.fbArchiveList) return;
  A.busy = true; A.err = false; agPaint();
  try {
    const c = agCache(uid), real = c.games.filter(g => !g.pending && !g.localTime && g.playedAt);   // وقت السيرفر بس
    if (older) {
      const oldest = real.length ? Math.min(...real.map(g => g.playedAt)) : Date.now() + 864e5;
      const rows = await window.fbArchiveList(uid, { before: oldest, limit: 15 });
      agMerge(uid, rows.map(r => Object.assign(r, { pending: false, localTime: false })), { end: rows.length < 15 });
    } else {
      const newest = real.length ? Math.max(...real.map(g => g.playedAt)) : 0;
      for (let page = 0, after = newest; page < 10; page++) {
        const rows = await window.fbArchiveList(uid, after ? { after, limit: 15 } : { limit: 15 });
        agMerge(uid, rows.map(r => Object.assign(r, { pending: false, localTime: false })), newest ? null : { end: rows.length < 15 });
        if (rows.length < 15 || !newest) break;
        after = Math.max(...rows.map(r => r.playedAt));
      }
      // الأدوار اللي ما اتحفظتش على السيرفر (النت كان فاصل): محاولة تانية
      for (const g of agCache(uid).games.filter(x => x.pending)) { const rec = Object.assign({}, g); delete rec.pending; await ecaArchiveSave(rec); }
    }
    A.synced = uid;
  } catch (e) { console.warn("Archive list failed:", e && e.code); A.err = true; }
  A.busy = false; agPaint();
}
function agPaint() { if (tab === "arena" && arena.sub === "archive") render(); }
function agSide(g, uid) { return g.blackUid === uid ? "b" : "w"; }
function agResult(g, uid) {
  if (g.result === "1/2-1/2") return "draw";
  if (g.result === "*") return "none";
  if (g.whiteUid !== uid && g.blackUid !== uid) return g.result === "1-0" ? "white" : "black";
  return (g.result === "1-0") === (agSide(g, uid) === "w") ? "win" : "loss";
}
function agRowHTML(g, uid) {
  if (!agIdOk(g.gameId)) return "";
  const res = agResult(g, uid), side = agSide(g, uid);
  const badge = { win: ["فوز", "Win"], loss: ["خسارة", "Loss"], draw: ["تعادل", "Draw"], none: ["—", "—"], white: ["1-0", "1-0"], black: ["0-1", "0-1"] }[res];
  const n = g.uciMoves ? g.uciMoves.split(" ").filter(Boolean).length : 0, s = g.analysisSummary;
  const acc = s ? Number(side === "w" ? s.whiteAccuracy : s.blackAccuracy) : null;
  const date = g.playedAt ? new Date(g.playedAt).toLocaleDateString(lang === "en" ? "en-GB" : "ar-EG", { day: "numeric", month: "short", year: "numeric" }) : "";
  const icon = { arena: "🏆", pvp: "⚔️", bot: "🤖", import: "📥" }[g.mode] || "♟";
  return `<article class="ag-row" data-res="${res}" data-mode="${esc(g.mode)}" data-gid="${esc(g.gameId)}">
    <div class="ag-top"><span class="ag-mode" aria-hidden="true">${icon}</span><b class="ag-players"><bdi>⚪ ${esc(g.whiteName)}</bdi> <span class="ag-vs">vs</span> <bdi>⚫ ${esc(g.blackName)}</bdi></b><span class="ag-res is-${res}">${esc(AGT(badge[0], badge[1]))}</span></div>
    <div class="ag-meta"><span dir="ltr">⏱ ${esc(g.timeControl)}</span>${g.openingNameAr ? `<span>📖 ${esc(g.openingNameAr)}</span>` : ""}${date ? `<span>📅 ${esc(date)}</span>` : ""}<span>♟ ${Math.ceil(n / 2)} ${AGT("نقلة", "moves")}</span>
      ${acc != null && isFinite(acc) ? `<span class="ag-acc">🎯 ${acc.toFixed(1)}%</span>` : `<span class="ag-need">🔎 ${AGT("تحتاج مراجعة", "Needs review")}</span>`}${g.pending ? `<span class="ag-need">☁️ ${AGT("لسه هيترفع", "Not uploaded yet")}</span>` : ""}</div>
    <div class="ag-actions"><button type="button" onclick="ecaArchiveAnalyze('${esc(g.gameId)}')" class="tap eca-gm-cta">🔬 ${AGT("تحليل الدور مع الجراند ماستر", "Analyze with the Grandmaster")}</button><button type="button" onclick="ecaArchivePgn('${esc(g.gameId)}')" class="tap ag-pgn">📋 ${AGT("نسخ / تحميل PGN", "Copy / download PGN")}</button></div>
  </article>`;
}
function arenaArchiveHTML(u) {
  const A = arena.archive, uid = agUid();
  if (!uid) return `<div class="gold-card rounded-2xl p-8 text-center text-sm text-gray-400">${AGT("سجّل دخول الأول", "Log in first")}</div>`;
  if (A.synced !== uid && !A.busy) setTimeout(() => agSync(false), 0);
  const c = agCache(uid), f = A.filter;
  const list = c.games.filter(g => f === "all" || (f === "review" ? !g.analysisSummary : g.mode === f));
  const chips = AG_FILTERS.map(x => `<button type="button" role="tab" aria-selected="${f === x[0]}" onclick="ecaArchiveFilter('${x[0]}')" class="tap ag-chip${f === x[0] ? " is-on" : ""}">${esc(AGT(x[1], x[2]))} <b>${x[0] === "all" ? c.games.length : c.games.filter(g => x[0] === "review" ? !g.analysisSummary : g.mode === x[0]).length}</b></button>`).join("");
  return `<div class="ag space-y-4">
    <section class="gold-card rounded-2xl p-4 space-y-3">
      <div class="flex flex-wrap items-center gap-2"><h3 class="font-bold text-yellow-300 flex-1">📚 ${AGT("أرشيف أدواري", "My games archive")}</h3>${A.busy ? `<span class="ag-sync" role="status">⏳ ${AGT("بنحدّث...", "Syncing...")}</span>` : ""}</div>
      <p class="text-xs text-gray-400">${AGT("كل أدوارك محفوظة هنا: المباشرة، البطولات، وضد البوتات. حلّل أي دور مع الجراند ماستر، والتحليل بيتحفظ.", "All your games are kept here: live, arena and bot games. Analyze any game with the Grandmaster — the analysis is saved.")}</p>
      <div class="ag-chips" role="tablist">${chips}</div>
      <button type="button" onclick="arena.archive.importOpen=!arena.archive.importOpen; render();" class="tap ag-pgn w-full" aria-expanded="${A.importOpen}">📥 ${AGT("استيراد PGN", "Import PGN")}</button>
      ${A.importOpen ? `<div class="space-y-2"><textarea id="agPgnIn" dir="ltr" rows="4" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono" placeholder="[Event &quot;...&quot;]&#10;1. e4 e5 2. Nf3 ..." aria-label="PGN"></textarea><button type="button" onclick="ecaArchiveImport()" class="tap ag-pgn gold-btn w-full">📥 ${AGT("استيراد وحفظ وتحليل", "Import, save and analyze")}</button></div>` : ""}
    </section>
    ${A.err ? `<p class="text-xs text-red-300 text-center">${AGT("ما قدرناش نوصل للسيرفر — بنعرض المحفوظ على جهازك.", "Could not reach the server — showing what is saved on this device.")}</p>` : ""}
    <div class="ag-list space-y-3">${list.length ? list.map(g => agRowHTML(g, uid)).join("") : `<div class="gold-card rounded-2xl p-6 text-center text-sm text-gray-400">${A.busy ? AGT("بنحمّل أدوارك...", "Loading your games...") : AGT("مفيش أدوار هنا لسه — العب دور مباشر أو ضد البوت وهيتحفظ لوحده.", "No games here yet — play a live or bot game and it is saved automatically.")}</div>`}</div>
    ${!c.end && c.games.length ? `<button type="button" onclick="ecaArchiveMore()" class="tap ag-pgn w-full"${A.busy ? " disabled" : ""}>⬇ ${AGT("اعرض أدوار أقدم", "Show older games")}</button>` : ""}
  </div>`;
}
function ecaArchiveFilter(k) { if (AG_FILTERS.some(x => x[0] === k)) { arena.archive.filter = k; render(); } }
function ecaArchiveMore() { agSync(true); }

// ================= PGN: نسخ + تحميل =================
function ecaArchivePgnOf(rec) {
  if (!rec) return;
  let txt = rec.pgn;
  try { txt = agPgnText(rec, agSans(rec), rec.clockTimesCentisec); } catch (_) {}
  try { if (navigator.clipboard) navigator.clipboard.writeText(txt).catch(() => {}); } catch (_) {}
  try {
    const a = document.createElement("a"), url = URL.createObjectURL(new Blob([txt], { type: "application/x-chess-pgn" }));
    a.href = url; a.download = "eca-" + rec.gameId + ".pgn"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  } catch (_) {}
  toast(AGT("📋 اتنسخ الـ PGN واتحمّل", "📋 PGN copied and downloaded"));
  return txt;
}
async function ecaArchivePgn(gid) { const g = agFind(gid) || (window.fbArchiveGet ? await window.fbArchiveGet(gid).catch(() => null) : null); if (g) ecaArchivePgnOf(g); }

// ================= التحليل على رقعة التحليل (والملخص بيتحفظ) =================
function ecaArchiveOpen(rec, back) {
  if (typeof anaLoadLine !== "function" || !rec) return;
  const uid = agUid(), side = agSide(rec, uid), s = rec.analysisSummary;
  const opp = side === "w" ? rec.blackName : rec.whiteName;
  anaLoadLine(AG_START, String(rec.uciMoves || "").split(" ").filter(Boolean), {
    ply: 0, flip: side === "b", review: { side, bot: opp, summary: s || null }, clocks: rec.clockTimesCentisec, tiers: s ? String(s.compactMoveTiers || "") : "",
    archive: { gid: rec.gameId, had: !!(s && s.compactMoveTiers), saved: false },
    from: { sub: (back && back.sub) || "archive", label: "📊 " + rec.whiteName + " vs " + rec.blackName + (rec.openingNameAr ? " • " + rec.openingNameAr : ""), back: (back && back.back) || AGT("↩ العودة للأرشيف", "↩ Back to the archive") }
  });
  arenaSub("analysis");
}
async function ecaArchiveAnalyze(gid) {
  if (!agIdOk(gid)) return;
  let g = agFind(gid);
  if (!g && window.fbArchiveGet) { try { g = await window.fbArchiveGet(gid); } catch (_) {} }
  if (!g) return toast(AGT("الدور ده مش موجود", "This game was not found"));
  ecaArchiveOpen(g);
}
// الدقة ودرجة كل نقلة بعد ما المراجعة تخلص (extras.js بينادي دي)
function agSummaryOf(line) {
  const acc = c => {
    const l = line.filter(m => m.rv && m.rv.color === c); if (!l.length) return 0;
    const v = l.reduce((s, m) => s + (m.rv.tier === "BOOK" ? 100 : (window.ecaGM ? Number(ecaGM.accuracy(m.rv.winLoss)) || 0 : 0)), 0) / l.length;
    return Math.max(0, Math.min(100, Math.round(v * 10) / 10));
  };
  const counts = {};
  line.forEach(m => { counts[m.rv.tier] = (counts[m.rv.tier] || 0) + 1; });
  return { whiteAccuracy: acc("w"), blackAccuracy: acc("b"), tierCounts: counts, compactMoveTiers: line.map(m => AG_TIER[m.rv.tier] || ".").join("").slice(0, 700), at: Date.now() };
}
window.ecaArchiveMaybeSave = function (A) {
  const ar = A.archive; if (!ar || ar.saved || ar.busy || !A.line.length || !A.line.every(m => m.rv)) return;
  const sum = agSummaryOf(A.line), uid = agUid();
  if (A.review) A.review.summary = sum;
  if (uid) agMerge(uid, [{ gameId: ar.gid, analysisSummary: sum }]);   // فتحة الدور الجاية: الشارات من الجهاز على طول
  if (ar.had || !window.fbArchiveSummary) { ar.saved = true; return; }
  ar.busy = true;
  window.fbArchiveSummary(ar.gid, sum).then(() => { ar.saved = true; }).catch(e => console.warn("Archive summary failed:", e && e.code)).then(() => { ar.busy = false; });
};
// استيراد PGN (من الوضع الأصلي بس، عشان الدور يتحفظ بنقلاته)
async function ecaArchiveImport(text) {
  const el = document.getElementById("agPgnIn") || document.getElementById("anaPgn");
  const p = String(text != null ? text : el ? el.value : "").trim();
  if (!p) return toast(AGT("الصق الـ PGN الأول", "Paste a PGN first"));
  let g; try { g = new ChessCls(); g.loadPgn(p); } catch (_) { return toast(AGT("الـ PGN ده مش صحيح", "This PGN is not valid")); }
  const h = g.history({ verbose: true });
  if (!h.length) return toast(AGT("الدور ده مفيهوش نقلات", "This game has no moves"));
  if (h[0].before !== AG_START) { if (typeof anaSet === "function") { arenaSub("analysis"); anaSet(g); } return toast(AGT("الدور ده بيبدأ من وضع خاص — اتحمّل للتحليل من غير حفظ", "This game starts from a custom position — loaded for analysis without saving")); }
  const hd = (typeof g.getHeaders === "function" ? g.getHeaders() : typeof g.header === "function" ? g.header() : {}) || {}, uid = agUid();
  const res = ["1-0", "0-1", "1/2-1/2"].includes(hd.Result) ? hd.Result : g.isCheckmate() ? (g.turn() === "w" ? "0-1" : "1-0") : g.isDraw() ? "1/2-1/2" : "*";
  const tcm = /^(\d+)\+(\d+)$/.exec(hd.TimeControl || ""), tc = tcm ? Math.round(Number(tcm[1]) / 60) + "+" + tcm[2] : "-";
  const rec = ecaArchiveBuild({ gameId: agNewId("imp"), game: g, white: { uid: "", name: hd.White || AGT("الأبيض", "White"), rating: Number(hd.WhiteElo) || null }, black: { uid: "", name: hd.Black || AGT("الأسود", "Black"), rating: Number(hd.BlackElo) || null },
    mode: "import", tc, result: res, termination: g.isCheckmate() ? "checkmate" : "", clocks: [], participants: uid ? [uid] : [] });
  if (uid) ecaArchiveSave(rec);
  arena.archive.importOpen = false;
  ecaArchiveOpen(rec);
  toast(AGT("📥 الدور اتحفظ في أرشيفك", "📥 The game was saved to your archive"));
}
Object.assign(window, { ecaArchiveFilter, ecaArchiveMore, ecaArchivePgn, ecaArchivePgnOf, ecaArchiveOpen, ecaArchiveAnalyze, ecaArchiveImport });

// ================= أماكن الوصول: الساحة، رقعة التحليل، والصفحة الرئيسية (البروفايل) =================
{
  const _av = renderArenaView;
  renderArenaView = function (u) {
    if (arena.sub !== "archive" || !u) return _av.apply(this, arguments);
    const keep = arenaPlayHTML;
    arenaPlayHTML = () => arenaArchiveHTML(u);
    try { return _av.apply(this, arguments); } finally { arenaPlayHTML = keep; }
  };
}
if (typeof arenaAnaHTML === "function") {
  const _aa = arenaAnaHTML;
  arenaAnaHTML = function () {
    const h = _aa.apply(this, arguments);
    return h.replace('<button onclick="anaLoadPgn()" class="w-full py-2 rounded-xl text-xs gold-btn">تحميل الدور</button>',
      `<button onclick="anaLoadPgn()" class="w-full py-2 rounded-xl text-xs gold-btn">تحميل الدور</button><div class="grid grid-cols-2 gap-2"><button type="button" onclick="ecaArchiveImport()" class="tap ag-pgn">📥 ${AGT("استيراد PGN للأرشيف", "Import PGN to the archive")}</button><button type="button" onclick="arenaSub('archive')" class="tap ag-pgn">📚 ${AGT("أرشيف أدواري", "My games archive")}</button></div>`);
  };
}
{
  const _sh = renderStudentHome;
  renderStudentHome = function (s) {
    const h = _sh.apply(this, arguments);
    const n = s && s.id ? agCache(s.id).games.length : 0;
    return `<div class="space-y-6">${h}<section class="gold-card rounded-2xl p-4 ag-home" aria-label="${AGT("أرشيف أدواري", "My games archive")}"><div class="flex flex-wrap items-center gap-3"><span class="text-3xl" aria-hidden="true">📚</span><div class="flex-1 min-w-0"><b class="block text-yellow-300">${AGT("أرشيف أدواري", "My games archive")}</b><span class="text-xs text-gray-400">${n ? AGT(`${n} دور محفوظ — حلّلهم مع الجراند ماستر`, `${n} saved games — analyze them with the Grandmaster`) : AGT("أدوارك المباشرة وضد البوتات بتتحفظ هنا", "Your live and bot games are saved here")}</span></div><button type="button" onclick="switchTab('arena'); arenaSub('archive');" class="tap ag-pgn gold-btn">${AGT("افتح الأرشيف", "Open the archive")}</button></div></section></div>`;
  };
}
