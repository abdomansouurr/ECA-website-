// ECA — blunders.js: «اتعلم من أخطائك» — أخطاء أدوار الطالب نفسه بتتحول لألغاز شخصية
// بعد ما الدور يخلص (مباشر، بطولة، أو ضد بوت) أو بعد «تحليل الدور مع الجراند ماستر»، نقلات الطالب بتتفحص في الخلفية:
// أخطر غلطتين (?? خطأ فادح أو ⚡ فرصة فوز ضائعة، وقعة Win% ≥ 18 أو ≥ 220 سنتي) وكان فيه نقلة واضحة (بتكسب خامات، أو بتمات،
// أو بتصد تهديد خطير) → بيتحفظوا في users/{uid}/mistakeVault/blunder_{gameId}_{ply} + نسخة على الجهاز. نفس الموقف مابيتكررش.
// المحرك: Stockfish خاص بالفحص ده في Worker لوحده (مش طابور الجراند ماستر)، وبيقف خالص طول ما فيه دور شغال بالوقت أو لعبة/لغز شغال.
// بيعتمد على: arena, ChessCls, uciMove, currUser, dojoRefresh, GrandmasterMoveClassifier (gmcoach.js), PositionConceptAnalyzer (analyzer.js)

const BLT = (ar, en) => lang === "en" ? en : ar;
const BLX = { q: [], busy: false, w: null, dead: false, job: null, idle: 0, stopTick: 0, reviewed: new Set() };
const BLX_MOVETIME = 350, BLX_MAX_PLIES = 160;

// ================= الجهاز: الأدوار اللي اتفحصت + المواقف اللي اتحفظت =================
function blxUid() { return window.fbMyUid ? fbMyUid() : ""; }
function blxGet(k) { try { const v = JSON.parse(localStorage.getItem(k + blxUid()) || "[]"); return Array.isArray(v) ? v : []; } catch (_) { return []; } }
function blxPut(k, v, max) { try { localStorage.setItem(k + blxUid(), JSON.stringify(v.slice(-max))); } catch (_) {} }
const blxScanned = () => blxGet("eca_blunder_scanned_");
const blxCache = () => blxGet("eca_blunders_");
function blxFenKey(fen) { return String(fen).split(" ").slice(0, 4).join(" ") + " 0 1"; }

// ================= متى نشتغل: أبداً وقت دور بالوقت أو لعب =================
function blxPlaying() {
  const L = arena.live;
  if (L && L.doc && L.doc.status === "live" && !L.spect && L.color) return true;
  if (arena.play && arena.play.game && !arena.play.over) return true;
  return typeof ecaIsPlaying === "function" && ecaIsPlaying();
}

// ================= Stockfish الخاص بالفحص (Worker لوحده) =================
function blxWorker() {
  if (BLX.w || BLX.dead) return BLX.w;
  if (typeof WebAssembly === "undefined" || typeof Worker === "undefined") { BLX.dead = true; return null; }
  try {
    BLX.w = new Worker(new URL("vendor/stockfish-19-lite-single.js", document.baseURI).href);
    BLX.w.onmessage = e => blxLine(String(e.data));
    BLX.w.onerror = () => blxKill(true);
    BLX.w.postMessage("uci"); BLX.w.postMessage("isready");
  } catch (_) { blxKill(true); }
  return BLX.w;
}
function blxKill(dead) {
  if (dead) BLX.dead = true;
  try { if (BLX.w) BLX.w.terminate(); } catch (_) {}
  BLX.w = null;
  const j = BLX.job; BLX.job = null;
  if (j) { clearTimeout(j.watch); j.resolve(null); }
}
function blxLine(line) {
  const job = BLX.job; if (!job) return;
  if (line.startsWith("bestmove")) {
    clearTimeout(job.watch); BLX.job = null;
    const lines = job.lines.filter(Boolean);
    job.resolve(job.stopped ? null : lines.length ? { fen: job.fen, lines, depth: job.depth, src: "sf", multi: job.multiPV } : null);
    return;
  }
  if (!line.startsWith("info") || line.indexOf(" pv ") < 0 || / (lower|upper)bound/.test(line)) return;
  const k = Number((line.match(/ multipv (\d+)/) || [0, 1])[1]) - 1; if (k < 0 || k >= job.multiPV) return;
  const cp = line.match(/ score cp (-?\d+)/), mt = line.match(/ score mate (-?\d+)/), d = +((line.match(/ depth (\d+)/) || [])[1] || 0);
  const pv = ((line.match(/ pv (.+)$/) || [])[1] || "").trim().split(/\s+/).filter(Boolean);
  if (!pv.length) return;
  job.lines[k] = { uci: pv[0], pv, cp: cp ? Number(cp[1]) : null, mate: mt ? Number(mt[1]) : null, depth: d };
  if (k === 0) job.depth = d;
}
function blxRun(fen, multiPV) {
  return new Promise(resolve => {
    const w = blxWorker(); if (!w) return resolve(null);
    const job = { fen, multiPV, lines: [], depth: 0, resolve, stopped: false };
    BLX.job = job;
    job.watch = setTimeout(() => { if (BLX.job === job) blxKill(false); }, BLX_MOVETIME + 8000);
    w.postMessage("setoption name MultiPV value " + multiPV);
    w.postMessage("position fen " + fen);
    w.postMessage("go depth 14 movetime " + BLX_MOVETIME);
  });
}
// لو دور بدأ والفحص شغال: المحرك بيقف على طول (stop) والموقف بيتعاد بعدين
setInterval(() => { const j = BLX.job; if (j && !j.stopped && blxPlaying() && BLX.w) { j.stopped = true; try { BLX.w.postMessage("stop"); } catch (_) {} } }, 300);
const blxWait = ms => new Promise(r => setTimeout(r, ms));
async function blxEval(fen, multiPV) {
  let g = null; try { g = new ChessCls(fen); } catch (_) { return null; }
  if (g.isGameOver()) return { fen, lines: [], depth: 99, src: "sf", multi: 9, over: g.isCheckmate() ? "mate" : g.isStalemate() ? "stalemate" : "draw" };
  for (let tries = 0; tries < 4; tries++) {
    while (blxPlaying() || document.hidden) await blxWait(1500);
    const r = await blxRun(fen, multiPV);
    if (r) return r;
    if (BLX.dead) return null;
  }
  return null;
}

// ================= هل الغلطة دي تنفع لغز؟ =================
function blxCandidate(rv, color) {
  if (!rv || rv.color !== color || !["BLUNDER", "MISSED_WIN"].includes(rv.tier)) return false;
  if (!(rv.winLoss >= 18 || rv.cpLoss >= 220)) return false;
  if (!rv.bestUci || rv.bestUci === rv.uci || !/^[a-h][1-8][a-h][1-8][qrbn]?$/.test(rv.bestUci)) return false;
  const opp = color === "w" ? "b" : "w";
  const mates = !!(rv.best && rv.best.mate > 0);
  const wins = !!(rv.bestLine && (rv.bestLine.mate === color || rv.bestLine.net >= 150));
  const defends = !!(rv.refLine && (rv.refLine.mate === opp || rv.refLine.net <= -200)) && (rv.bestCp - rv.afterCp >= 200);
  return mates || wins || defends;
}
function blxMotif(rv, color) {
  if (rv.best && rv.best.mate > 0) return "mate";
  if (rv.bestLine && (rv.bestLine.mate === color || rv.bestLine.net >= 150)) return "tactic";
  return "defence";
}
// نقلات تانية بنفس القوة تقريباً بتتقبل كحل (عشان الطالب مايتقالوش «غلط» على نقلة كويسة)
function blxAlts(pre, best, played) {
  const C = window.GrandmasterMoveClassifier; if (!pre || !pre.lines || !C) return [];
  const top = pre.lines[0], ev = l => C.evCp(l);
  if (!top) return [];
  return pre.lines.slice(1).filter(l => l && l.uci && l.uci !== best && l.uci !== played && /^[a-h][1-8][a-h][1-8][qrbn]?$/.test(l.uci)
    && (top.mate > 0 ? l.mate > 0 : ev(l) >= ev(top) - 60)).map(l => l.uci).slice(0, 3);
}
const blxClean = (s, max) => String(s || "").replace(/[<>"'`]/g, "").trim().slice(0, max) || "?";

// ================= فحص دور واحد =================
async function blxScan(job) {
  const rec = job.rec, uid = blxUid(), u = typeof currUser === "function" ? currUser() : null;
  if (!rec || !uid || !u || u.role !== "student" || !window.fbVaultBlunderAdd || !window.GrandmasterMoveClassifier || !window.PositionConceptAnalyzer) return;
  if (!["arena", "pvp", "bot"].includes(rec.mode) || !/^[A-Za-z0-9]{6,40}$/.test(String(rec.gameId || ""))) return;
  const color = rec.whiteUid === uid ? "w" : rec.blackUid === uid ? "b" : "";
  if (!color || blxScanned().includes(rec.gameId)) return;
  const ucis = String(rec.uciMoves || "").split(" ").filter(Boolean).slice(0, BLX_MAX_PLIES);
  const g = new ChessCls(), fens = [g.fen()], sans = [];
  for (const m of ucis) { let r = null; try { r = uciMove(g, m); } catch (_) { r = null; } if (!r) break; sans.push(r.san); fens.push(g.fen()); }
  const C = window.GrandmasterMoveClassifier, found = [];
  for (let i = 0; i < sans.length; i++) {
    if (fens[i].split(" ")[1] !== color) continue;
    let rv = job.reviews && job.reviews[i], pre = null;
    if (rv) pre = window.ecaGM ? ecaGM.get(fens[i]) : null;
    else {
      pre = await blxEval(fens[i], 3); if (!pre) return;
      // النقلة هي أحسن نقلة: مفيش غلطة، ومش محتاجين نحلل اللي بعدها
      if (pre.lines && pre.lines[0] && pre.lines[0].uci === ucis[i]) continue;
      const post = await blxEval(fens[i + 1], 1); if (!post) return;
      try { rv = C.review({ preFen: fens[i], uci: ucis[i], pre, post, ply: i, prevFen: i ? fens[i - 1] : null, prevUci: i ? ucis[i - 1] : null }); } catch (_) { rv = null; }
    }
    if (blxCandidate(rv, color)) found.push({ i, rv, pre });
    await blxWait(0);
  }
  const keep = found.sort((a, b) => (b.rv.winLoss - a.rv.winLoss) || (b.rv.cpLoss - a.rv.cpLoss)).slice(0, 2);
  const fensSaved = new Set(blxCache().map(x => x.fen)), opp = blxClean(color === "w" ? rec.blackName : rec.whiteName, 40);
  let added = 0;
  for (const c of keep) {
    const fen = blxFenKey(fens[c.i]), san = String(sans[c.i]).replace(/[^A-Za-z0-9+#=-]/g, "").slice(0, 10);
    if (fensSaved.has(fen)) continue;
    try { if (window.fbVaultHasFen && await window.fbVaultHasFen(fen)) { fensSaved.add(fen); continue; } } catch (_) {}
    const missed = c.rv.tier === "MISSED_WIN";
    const row = {
      puzzleId: `blunder_${rec.gameId}_${c.i}`, source: "my_game_blunder", opponentName: opp, gameMode: rec.mode,
      playedAt: Math.round(Number(rec.playedAt) || Date.now()), fen, ply: c.i, step: Number(u.level) || 1,
      wrongMovePlayedUci: ucis[c.i], wrongMovePlayedSan: san.length >= 2 ? san : ucis[c.i],
      solutionMovesUci: [c.rv.bestUci], altUci: blxAlts(c.pre, c.rv.bestUci, ucis[c.i]), motif: blxMotif(c.rv, color),
      customPromptAr: blxClean(`🔥 موقف حقيقي من مباراتك ضد ${opp}! أنت لعبت (${san}) وكانت ${missed ? "فرصة فوز ضائعة (⚡)" : "خطأ فادح (??)"}.. هل تقدر تلاقي النقلة الصح اللي كانت هتكسبك؟`, 300)
    };
    try {
      if (await window.fbVaultBlunderAdd(row)) { added++; fensSaved.add(fen); const cache = blxCache(); cache.push(row); blxPut("eca_blunders_", cache, 60); }
    } catch (e) { console.debug("Personal puzzle save postponed:", e && e.code); return; }
  }
  const scanned = blxScanned(); scanned.push(rec.gameId); blxPut("eca_blunder_scanned_", scanned, 300);
  if (added) {
    if (typeof dojoRefresh === "function") dojoRefresh();
    if (!blxPlaying() && typeof toast === "function") toast(BLT(`🔥 ${added === 1 ? "غلطة من دورك اتحولت للغز" : added + " غلطات من دورك اتحولوا لألغاز"} في «اتعلم من أخطائك»`, `🔥 ${added} mistake${added === 1 ? "" : "s"} from your game became puzzles in Learn from your mistakes`));
  }
}
async function blxPump() {
  if (BLX.busy) return;
  BLX.busy = true; clearTimeout(BLX.idle);
  try { while (BLX.q.length) { const job = BLX.q.shift(); try { await blxScan(job); } catch (e) { console.debug("Personal puzzle scan stopped:", e && e.message); } } }
  finally {
    BLX.busy = false;
    // المحرك بيتقفل بعد دقيقة من غير شغل (ميموري الموبايل)
    BLX.idle = setTimeout(() => { if (!BLX.busy && !BLX.q.length) blxKill(false); }, 60000);
  }
}
// rec = مستند الأرشيف (archive.js)، reviews = تحليل كل نقلة لو الطالب عمل «تحليل الدور» (من غير محرك تاني)
function extractPersonalBlunderPuzzles(rec, reviews) {
  if (!rec || !rec.gameId || BLX.q.some(j => j.rec.gameId === rec.gameId)) return;
  BLX.q.push({ rec, reviews: reviews || null });
  setTimeout(blxPump, reviews ? 0 : 1500);
}
window.extractPersonalBlunderPuzzles = extractPersonalBlunderPuzzles;
window.ecaBlunderScan = rec => extractPersonalBlunderPuzzles(rec, null);

// دور ضد بوت خلص (archive.js بيحفظه في render)
{
  const _r = render;
  render = function () {
    const out = _r.apply(this, arguments), P = arena.play;
    if (P && P.over && P._agRec && P._blRec !== P._agRec) { P._blRec = P._agRec; extractPersonalBlunderPuzzles(P._agRec, null); }
    return out;
  };
}
// «تحليل الدور» على رقعة التحليل خلص: الغلطات من نفس التحليل (مفيش شغل محرك زيادة)
if (typeof window.ecaArchiveMaybeSave === "function") {
  const _ms = window.ecaArchiveMaybeSave;
  window.ecaArchiveMaybeSave = function (A) {
    const out = _ms.apply(this, arguments);
    const ar = A && A.archive;
    if (ar && ar.gid && !BLX.reviewed.has(ar.gid) && A.line && A.line.length && A.line.every(m => m.rv)) {
      BLX.reviewed.add(ar.gid);
      const rec = window.ecaArchiveCached ? ecaArchiveCached(ar.gid) : null;
      if (rec) extractPersonalBlunderPuzzles(rec, A.line.map(m => m.rv));
    }
    return out;
  };
}
// حل لغز من دورك: أي نقلة بنفس قوة الحل بتتقبل
if (typeof puzPlay === "function") {
  const _pp = puzPlay;
  puzPlay = function (mv) {
    const Z = arena.puz, bl = Z && Z.review && Z.info && Z.info.blunder;
    if (bl && Z.idx === 0 && mv && mv.from && mv.to && Array.isArray(bl.altUci)) {
      const u = mv.from + mv.to + (mv.promotion || "");
      if (bl.altUci.includes(u) && Z.sol[0] !== u) Z.sol = [u];
    }
    return _pp.apply(this, arguments);
  };
}
