// ECA — live.js: شطرنج مباشر بالوقت بين الطلاب + بطولات الأرينا
// - النقلة بتظهر على الرقعة فوراً (0ms) وبتتبعت في الخلفية. لو السيرفر رفضها بترجع (rollback).
// - الساعة: requestAnimationFrame + performance.now()، وأقل من 10 ثواني بتظهر بالعُشر.
// - تعويض النت: الوقت اللي بيتخصم = وقت تفكيرك على جهازك، والسيرفر بيسمح بفرق 300ms بس فوق الوقت الحقيقي (firestore.rules).
// - مفيش Stockfish ولا تصنيف نقلات وقت الدور خالص. التحليل بعد ما الدور يخلص بس (من الأرشيف).
// - الخصم: من اللوبي، أو برابط ?live=ID، أو توفيق البطولة، أو بوتات الأكاديمية (ساحة اللعب ضد الكمبيوتر).

const LV_TC = [[1, 0], [2, 1], [3, 0], [3, 2], [5, 0], [5, 3], [10, 0], [10, 5], [15, 10]];
const LVT = (ar, en) => lang === "en" ? en : ar;
const LV_WHY = {
  checkmate: ["كش مات", "Checkmate"], resign: ["استسلام", "Resignation"], timeout: ["الوقت خلص", "Time out"], draw: ["اتفاق على التعادل", "Draw agreed"],
  stalemate: ["بات (مفيش نقلات)", "Stalemate"], repetition: ["تكرار الوضع 3 مرات", "Threefold repetition"], fifty: ["قاعدة الخمسين نقلة", "Fifty-move rule"],
  material: ["مفيش قطع كفاية للكش مات", "Insufficient material"], abandon: ["الخصم ساب الدور", "Opponent left"], abort: ["اتلغى قبل أول نقلة", "Aborted"],
  illegal: ["نقلة غير قانونية — الدور اتلغى لحد حكم الكوتش", "Illegal move — the game is void until the coach rules"], forfeit: ["حكم الكوتش بعد مراجعة النقلات", "Coach ruling after reviewing the moves"]
};
const lvLsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (_) { return d; } };
const lvLsSet = (k, v) => { try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (_) {} };
arena.live = {
  view: "lobby", tci: Math.min(LV_TC.length - 1, Math.max(0, Number(lvLsGet("ECA_LIVE_TC", "3")) || 0)), side: "r", lobby: null, lobbyStop: null, busy: false,
  arenas: null, arenasStop: null, arTci: 3, arMin: 30, arStart: 0,
  id: "", doc: null, stop: null, rtStop: null, presStop: null, game: null, san: [], ucis: [], color: "", flip: false, sel: null, last: null, pre: [], spect: false, autoJoin: "",
  clk: { w: 0, b: 0, side: null, t0: 0 }, clkLog: [], off: null, rtt: 300, calQ: null, oppSeen: 0, oppHb: 0, over: null, inflight: false, bad: false,
  flagAt: 0, flagBusy: false, lowTick: 0, raf: 0, hb: 0, rec: null, recs: {}, done: {}, backId: "", disputes: null, disputesStop: null, judging: "",
  tid: "", ar: null, players: [], arStop: null, pairBusy: false, pairAt: 0, seenWait: {}, sinceAt: 0
};
function lvMe() { return window.fbMyUid ? fbMyUid() : ""; }
function lvStudent() { const u = typeof currUser === "function" ? currUser() : null; return !!u && u.role === "student"; }
function lvName(uid, nick) { return uid ? (window.ecaStudentAlias ? ecaStudentAlias({ id: uid, nickname: nick || "" }) : "ECA") : LVT("مستني خصم...", "Waiting..."); }
function lvFmt(ms) { ms = Math.max(0, ms); if (ms < 10000) return (Math.floor(ms / 100) / 10).toFixed(1); const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function lvRem(c) { const k = arena.live.clk; return k[c] - (k.side === c ? performance.now() - k.t0 : 0); }
function lvSrvNow() { return Date.now() + (arena.live.off || 0); }
function lvIdOk(id) { return /^[A-Za-z0-9]{10,40}$/.test(String(id || "")); }
function lvNoop() {}
window.lvNoop = lvNoop;

// ================= الأصوات (نفس AudioContext بتاع الموقع عن طريق sfxNotes) =================
const LV_SFX = { move: [[523], .02, .06, .045], capture: [[392, 262], .03, .08, .06], check: [[880, 1175], .05, .12, .06], castle: [[523, 659], .05, .08, .05],
  tick: [[1568], .02, .04, .035], start: [[523, 659, 784], .08, .16, .08], win: [[523, 659, 784, 1047], .09, .22, .1], loss: [[392, 330, 262], .11, .25, .08], draw: [[523, 523], .12, .18, .07] };
function lvSfx(kind) { const s = LV_SFX[kind]; if (s && typeof sfxNotes === "function") sfxNotes(s[0], s[1], s[2], s[3]); }
function lvMoveSfx(r, g) { lvSfx(g.inCheck() ? "check" : /[kq]/.test(r.flags || "") ? "castle" : r.captured ? "capture" : "move"); }

// ================= ساعة السيرفر (الفرق بين ساعة الجهاز وساعة السيرفر + زمن الرحلة) =================
function lvCalib(tSend, tAck, srv) {
  const L = arena.live; if (!srv || !tAck) return;
  const s = srv - (tSend + tAck) / 2;
  L.off = L.off == null ? s : L.off * .6 + s * .4;
  L.rtt = Math.max(40, Math.min(3000, L.rtt * .6 + (tAck - tSend) * .4));
}
function lvCalAck(q) { const L = arena.live; if (L.calQ !== q) return; q.tAck = Date.now(); if (q.srv) { lvCalib(q.tSend, q.tAck, q.srv); L.calQ = null; } }

// ================= فتح دور ومتابعته =================
// مصدرين: Firestore (السجل الرسمي اللي القواعد بتحسب منه النتيجة) وRealtime Database (ممر سريع للنقلات + «متصل/مش متصل»).
// النقلة اللي بتيجي من RTDB بتتعرض فوراً «مؤقتاً» بعد ما chess.js يتأكد إنها قانونية، وFirestore بيأكدها. لو اختلفوا، Firestore هو الصح.
function lvOpen(id, spect) {
  const L = arena.live;
  if (!lvIdOk(id) || !window.fbLiveWatch || typeof ChessCls === "undefined" || !ChessCls) return;
  if (L.id === id && L.stop) { L.view = "game"; return lvPaint(true); }
  lvClose();
  Object.assign(L, { view: "game", id, doc: null, game: new ChessCls(), san: [], ucis: [], color: "", flip: false, sel: null, last: null, pre: [], spect: !!spect, over: null,
    clk: { w: 0, b: 0, side: null, t0: 0 }, clkLog: [], oppSeen: Date.now(), oppHb: 0, inflight: false, bad: false, flagAt: 0, flagBusy: false, lowTick: 0, rec: L.recs[id] || null, calQ: null,
    prov: 0, provAt: 0, rtAt: 0, rt: null, sendQ: null, relayQ: null, mirrorQ: null, verifiedN: -1, flagged: "", rtMade: false, oppOnline: null, oppOffAt: 0, viaRt: 0, presOn: false });
  L.stop = window.fbLiveWatch(id, d => lvOnDoc(id, d));
  if (window.fbRtWatch && window.ecaLiveSync && ecaLiveSync.rtdb) L.rtStop = window.fbRtWatch(id, v => lvOnRt(id, v));
  lvBeatStart();
  lvPaint(true);
}
window.lvOpen = lvOpen;
function lvClose() {
  const L = arena.live;
  if (L.stop) { L.stop(); L.stop = null; }
  if (L.rtStop) { L.rtStop(); L.rtStop = null; }
  if (L.presStop) { L.presStop(); L.presStop = null; }
  if (L.presOn && window.fbPresenceOff) { fbPresenceOff(); L.presOn = false; }
  lvBeatStop();
  L.id = ""; L.doc = null; L.game = null; L.pre = []; L.sel = null; L.inflight = false; L.sendQ = null; L.prov = 0; L.rt = null; L.relayQ = null; L.mirrorQ = null;
  if (window.fbRtSleep) setTimeout(() => { if (!arena.live.id) fbRtSleep(); }, 1500);   // مفيش دور مفتوح: اتصال RTDB بيتقفل
}
function lvPlaying() { const L = arena.live, d = L.doc; return !!(d && d.status === "live" && !L.spect && L.color && !L.over); }
function lvToMove(n) { return n % 2 ? "b" : "w"; }

function lvOnDoc(id, d) {
  const L = arena.live; if (L.id !== id) return;
  if (!d) {
    if (L.doc && L.doc.status === "open" && !(L.doc.p || []).includes(lvMe())) toast(LVT("التحدي ده اتلغى", "This challenge was cancelled"));
    lvClose(); L.view = L.tid ? "arena" : "lobby"; return lvPaint(true);
  }
  const me = lvMe(), prev = L.doc;
  L.doc = d;
  if (!L.spect) { L.color = d.w === me ? "w" : d.b === me ? "b" : ""; if (!L.color && d.status !== "open") L.spect = true; }
  L.flip = !L.spect && L.color === "b";
  // اللي فتح رابط التحدي بيدخل لوحده
  if (d.status === "open" && L.autoJoin === id && !d.p.includes(me) && lvStudent() && window.fbLiveJoin) {
    L.autoJoin = "";
    window.fbLiveJoin(id).then(ok => { if (!ok) toast(LVT("ما قدرتش تدخل التحدي ده.", "You could not join this challenge.")); }).catch(e => { console.warn("Live join failed:", e && e.code); toast(LVT("ما قدرتش تدخل التحدي ده.", "You could not join this challenge.")); });
  }
  // ساعة السيرفر من كتاباتي اللي اتأكدت
  const q = L.calQ;
  if (q && !d.local) { const v = q.field === "at" ? (d.n === q.n ? d.at : 0) : (d[q.field] !== q.prev ? d[q.field] : 0); if (v) { q.srv = v; if (q.tAck) { lvCalib(q.tSend, q.tAck, v); L.calQ = null; } } }
  // الخصم موجود؟ (نبضته اتغيرت أو لعب)
  const oppHb = L.color === "w" ? d.hbb : d.hbw;
  if (oppHb && oppHb !== L.oppHb) { L.oppHb = oppHb; L.oppSeen = Date.now(); }
  // «متصل» على RTDB: ليا (onDisconnect) وللخصم (بيظهر فوراً لو النت قطع)
  if (!L.spect && L.color && ["open", "live"].includes(d.status)) {
    if (!L.presOn && window.fbPresenceOn) { fbPresenceOn(id); L.presOn = true; }
    const opp = L.color === "w" ? d.b : d.w;
    if (opp && !L.presStop && window.fbPresenceWatch) L.presStop = window.fbPresenceWatch(opp, v => lvOnPres(id, v));
  }
  // ممر النقلات السريع بيتعمل مع أول الدور (أي لاعب من الاتنين)
  if (!L.spect && L.color && d.status === "live" && d.n === 0 && !L.rtMade && window.fbRtCreate && window.ecaLiveSync && ecaLiveSync.rtdb) { L.rtMade = true; window.fbRtCreate(d).catch(() => {}); }
  if (!prev || (prev.status === "open" && d.status !== "open")) {
    lvRebuild(true);
    if (d.status === "live") lvStarted(!prev && d.n >= 2);
  } else {
    const g = L.game, have = L.san.length;
    const pending = (L.inflight || L.sendQ ? 1 : 0) + (L.prov > d.n ? 1 : 0);
    const prefixOk = L.ucis.slice(0, Math.min(d.n, have)).every((u, i) => d.moves[i] === u);
    if (!prefixOk || (d.n < have - pending)) lvRebuild(true);
    else if (d.n > have) {
      let r = null;
      for (const u of d.moves.slice(have)) {
        try { r = uciMove(g, u); } catch (_) { r = null; }
        if (!r) { L.bad = true; break; }
        L.san.push(r.san); L.ucis.push(u); L.last = [r.from, r.to]; lvMoveSfx(r, g);
      }
      // ساعتي بتبدأ من لحظة ما النقلة وصلتني (الخصم مايكسبش من بطء النت عندي)
      L.clk = { w: d.wt, b: d.bt, side: d.status === "live" && d.n >= 2 ? g.turn() : null, t0: performance.now() };
      L.clkLog[d.n - 1] = d.n % 2 ? d.wt : d.bt;
      L.oppSeen = Date.now(); L.lowTick = 0;
    } else if (L.prov && d.n >= L.prov) {
      // النقلة اللي جت من RTDB اتأكدت في السجل الرسمي: وقت الخصم من Firestore، وساعتي شغالة زي ما هي
      const mover = lvToMove(L.prov - 1); L.clk[mover] = mover === "w" ? d.wt : d.bt; L.clkLog[L.prov - 1] = L.clk[mover]; L.prov = 0;
    }
    if (prev.draw !== d.draw && d.draw && d.draw !== L.color && !L.spect) { lvSfx("draw"); toast(LVT("🤝 الخصم بيعرض تعادل", "🤝 Your opponent offers a draw")); }
    if (prev.bzw !== d.bzw || prev.bzb !== d.bzb) { const c = prev.bzw !== d.bzw ? "w" : "b"; L.clk[c] = c === "w" ? d.wt : d.bt; if (c !== L.color) toast(LVT("⚡ الخصم عمل برزرك!", "⚡ Your opponent went berserk!")); }
  }
  // نقلتي اللي كانت مستنية السجل الرسمي يلحق نقلة الخصم
  if (L.sendQ && d.n === L.sendQ.ctx.n - 1 && d.status === "live") { const s = L.sendQ; L.sendQ = null; lvSend(s.id, s.patch, s.ctx, s.retry); }
  const myTurn = d.status === "live" && !L.spect && L.color && L.color === lvToMove(d.n);
  // نقلة الخصم مش قانونية (اتكتبت من برة الموقع) → شكوى: الدور بيتلغي ويروح للكوتش
  if (myTurn && L.bad && L.san.length < d.n) lvFlag(d);
  // ادعاء نهاية (كش مات / تعادل) من الخصم: chess.js على جهازي بيتأكد منه في نفس اللحظة
  else if (myTurn && d.pend && L.verifiedN !== d.n && L.san.length === d.n) lvVerify(d);
  if (d.status === "over" && !L.over) lvFinish(d);
  else if (myTurn && !d.pend && L.game.turn() === L.color && L.pre.length && !L.inflight && !L.sendQ) { if (lvRunPremove()) return; }
  lvPaint();
}
// نقلة من ممر RTDB: بتتعرض فوراً لو قانونية ومكمّلة لنفس الدور بالظبط
function lvOnRt(id, v) {
  const L = arena.live; if (L.id !== id) return;
  L.rt = v;
  // الممر لحق السجل الرسمي: نبعت النقلة أو النهاية اللي كانت مستنياه
  if (v && L.relayQ && v.plyCount === L.relayQ.n - 1) { const q = L.relayQ; L.relayQ = null; if (L.ucis[q.n - 1] === q.uci) lvRelay(q); }
  if (v && L.mirrorQ && L.doc && v.plyCount === L.doc.n) { const p = L.mirrorQ; L.mirrorQ = null; lvRtMirror(p); }
  const d = L.doc;
  if (!v || !d || d.status !== "live" || L.over || v.status !== "live") return;
  if (v.whiteUid !== d.w || v.blackUid !== d.b || v.baseMs !== d.base || v.incrementMs !== d.inc) return;   // مش ممر الدور ده
  const have = L.san.length, mover = lvToMove(have);
  if (v.plyCount !== have + 1 || (!L.spect && mover === L.color) || v.uciMoves !== L.ucis.concat(v.lastMoveUci).join(" ")) return;
  let r = null; try { r = uciMove(L.game, v.lastMoveUci); } catch (_) { r = null; }
  if (!r) return;                                         // السجل الرسمي هو اللي هيحكم
  L.san.push(r.san); L.ucis.push(v.lastMoveUci); L.last = [r.from, r.to]; lvMoveSfx(r, L.game);
  L.prov = have + 1; L.provAt = Date.now(); L.rtAt = v.lastMoveAt; L.viaRt++;
  L.clk = { w: v.wTimeMs, b: v.bTimeMs, side: have + 1 >= 2 ? L.game.turn() : null, t0: performance.now() };
  L.clkLog[have] = mover === "w" ? v.wTimeMs : v.bTimeMs;
  L.oppSeen = Date.now(); L.lowTick = 0;
  if (!L.spect && L.color && L.game.turn() === L.color && L.pre.length && !L.inflight && !v.pendingTermination) { if (lvRunPremove()) return; }
  lvPaint();
}
function lvOnPres(id, v) {
  const L = arena.live; if (L.id !== id) return;
  L.oppOnline = v ? v.online !== false : null;
  L.oppOffAt = v && v.online === false ? Number(v.at) || Date.now() : 0;
  if (L.oppOnline) L.oppSeen = Date.now();
  const c = document.getElementById("lvConn"); if (c) { const h = lvConnHTML(); if (c.__h !== h) { c.__h = h; c.innerHTML = h; } }
}
function lvStarted(quiet) {
  const L = arena.live;
  L.oppSeen = Date.now();
  if (!quiet) lvSfx("start");
  if (!L.spect && L.color) { lvLsSet("eca_live_cur", L.id); if (!quiet) toast(LVT("🔥 الدور بدأ!", "🔥 The game has started!")); }
  // مفيش أي شغل محرك في الخلفية وقت الدور المباشر
  if (window.ecaGM && ecaGM.cancelWhere) ecaGM.cancelWhere(() => true, false);
}
// الرقعة والساعة من المستند الرسمي (أول مرة، أو بعد رفض نقلة، أو لو الممر السريع قال حاجة غلط)
function lvRebuild(resume) {
  const L = arena.live, d = L.doc; if (!d || !ChessCls) return;
  const g = new ChessCls(), san = [], ucis = []; let r = null;
  for (const u of d.moves) { try { r = uciMove(g, u); } catch (_) { r = null; } if (!r) { L.bad = true; break; } san.push(r.san); ucis.push(u); }
  L.game = g; L.san = san; L.ucis = ucis; L.last = typeof lastOf === "function" ? lastOf(g) : null; L.sel = null; L.inflight = false; L.sendQ = null; L.prov = 0;
  const run = d.status === "live" && d.n >= 2 ? lvToMove(d.n) : null;
  L.clk = { w: d.wt, b: d.bt, side: run, t0: performance.now() };
  // رجوع لدور شغال: الوقت اللي عدّى من آخر نقلة على ساعة السيرفر
  if (resume && run && d.at && !d.local) L.clk[run] -= Math.max(0, lvSrvNow() - d.at);
  for (let i = 0; i < d.n; i++) if (L.clkLog[i] == null) L.clkLog[i] = 0;
  if (d.n) L.clkLog[d.n - 1] = d.n % 2 ? d.wt : d.bt;
}

// ================= نهاية الدور بالاتفاق (Dual-Peer Consensus) =================
// اللاعب اللي عمل الكش مات مايقدرش يعلن الفوز لوحده: نقلته بتتكتب ومعاها pend، وجهاز الخصم بيتأكد بـ chess.js ويكتب النتيجة.
function lvVerify(d) {
  const L = arena.live, g = L.game; L.verifiedN = d.n;
  const half = Number(g.fen().split(" ")[4]) || 0;
  const ok = { checkmate: g.isCheckmate(), stalemate: g.isStalemate(), material: g.isInsufficientMaterial(), repetition: g.isThreefoldRepetition(), fifty: half >= 100 }[d.pend];
  if (!ok) return lvFlag(d);
  const side = lvToMove(d.n);
  lvWrite({ status: "over", res: d.pend === "checkmate" ? (side === "w" ? "0-1" : "1-0") : "1/2-1/2", why: d.pend, pend: "", draw: "" });
}
// نقلة غير قانونية أو ادعاء غلط: الدور بيتلغي (من غير نقط) ويروح للكوتش يحكم بعد ما يراجع النقلات
function lvFlag(d) {
  const L = arena.live; if (L.flagged === d.id) return;
  L.flagged = d.id;
  const side = lvToMove(d.n);
  lvWrite({ status: "over", res: "", why: "illegal", bad: side === "w" ? "b" : "w", badPly: d.n, draw: "" });
  toast(LVT("🚩 الخصم لعب نقلة غير قانونية — الدور اتلغى والكوتش هيراجعه", "🚩 Your opponent played an illegal move — the game is void and goes to the coach"));
}
// كتابة في السجل الرسمي، وبعدها نفس النهاية في ممر RTDB (عشان مايتكتبش فيه نقلات بعد كده)
function lvWrite(patch, msg) {
  const L = arena.live, d = L.doc; if (!d || !window.fbLivePatch) return Promise.resolve();
  return window.fbLivePatch(d.id, patch).then(() => lvRtMirror(patch)).catch(e => { console.warn("Live action failed:", e && e.code); if (msg) toast(msg); });
}
function lvRtMirror(p) {
  const L = arena.live, v = L.rt; if (!window.fbRtUpdate || !L.doc) return;
  if (!v || (v.status === "live" && v.plyCount < L.doc.n)) { if (p.status === "over") L.mirrorQ = p; return; }   // الممر متأخر: النهاية بتستنى
  if (v.status !== "live" || v.plyCount !== L.doc.n) return;
  if (p.status === "over") {
    if (!/^(checkmate|stalemate|repetition|fifty|material|resign|timeout|draw|abort|abandon|illegal)$/.test(p.why || "")) return;
    window.fbRtUpdate(L.id, { status: "finished", result: p.res || "", termination: p.why, pendingTermination: "", drawOfferedBy: "", illegalMoveAttempt: p.why === "illegal" ? p.bad || "" : "" }).catch(() => {});
  } else if (typeof p.draw === "string") window.fbRtUpdate(L.id, { drawOfferedBy: p.draw }).catch(() => {});
}

// ================= النقلة (0ms على الشاشة، والكتابة بعدها) =================
function lvEndOf(g) {
  if (g.isCheckmate()) return "checkmate";
  if (g.isStalemate()) return "stalemate";
  if (g.isInsufficientMaterial()) return "material";
  if (g.isThreefoldRepetition()) return "repetition";
  if (g.isDraw()) return "fifty";
  return "";
}
function lvMove(m) {
  const L = arena.live, d = L.doc, g = L.game;
  if (!d || d.status !== "live" || d.pend || L.over || L.spect || !L.color || g.turn() !== L.color || L.inflight || L.sendQ) return false;
  const before = L.san.length;
  if (before !== d.n && !(L.prov && before === L.prov)) return false;
  const t = performance.now(), side = L.color;
  let r = null; try { r = g.move(m); } catch (_) { r = null; }
  if (!r) { L.sel = null; lvPaint(); return false; }
  const key = side === "w" ? "wt" : "bt", stored = side === "w" ? d.wt : d.bt, inc = (side === "w" ? d.bzw : d.bzb) ? 0 : d.inc;
  let nt = stored;
  if (before >= 2) {
    // وقت التفكير على الجهاز، ولو النت أبطأ من 300ms بنخصم الفرق (السيرفر بيرفض أي وقت زيادة).
    // لو نقلة الخصم وصلت من RTDB، الحساب من وقتها هناك (السجل الرسمي لسه ما وصلش)
    const think = t - L.clk.t0, viaRt = L.prov && L.prov === before && L.rtAt && window.fbRtNow;
    const est = viaRt ? fbRtNow() + L.rtt / 2 - L.rtAt : L.off == null ? 0 : lvSrvNow() + L.rtt / 2 - d.at;
    const used = Math.max(think, est - 250);
    if (stored - used <= 0) { g.undo(); lvOnFlag(side); return false; }
    nt = Math.round(stored - used) + inc;
  }
  const n = before + 1, uci = r.from + r.to + (r.promotion || ""), pend = lvEndOf(g);
  L.san.push(r.san); L.ucis.push(uci); L.last = [r.from, r.to]; L.sel = null; L.inflight = true; L.lowTick = 0;
  L.clk = Object.assign(L.clk, { [side]: nt, side: n >= 2 ? (side === "w" ? "b" : "w") : null, t0: t });
  L.clkLog[n - 1] = nt;
  const patch = { n, [key]: nt, draw: "", pend }, ctx = { stored, inc, side, key, n, uci, nt, pend };
  lvMoveSfx(r, g);
  lvPaint();
  // الكتابة بعد ما النقلة تظهر (الشاشة مابتستناش النت): السجل الرسمي + الممر السريع
  Promise.resolve().then(() => { lvSend(d.id, patch, ctx); lvRelay(ctx); });
  return true;
}
window.lvMove = lvMove;
function lvSend(id, patch, ctx, retry) {
  const L = arena.live;
  if (L.id !== id) return;
  // نقلة الخصم لسه ما وصلتش السجل الرسمي (جت من RTDB): نقلتي بتستنى لحد ما يلحقها
  if (!L.doc || L.doc.n !== ctx.n - 1) { L.sendQ = { id, patch, ctx, retry }; return; }
  patch.moves = L.doc.moves.concat(ctx.uci);
  const q = { field: "at", n: ctx.n, tSend: Date.now(), tAck: 0, srv: 0 };
  L.calQ = q;
  window.fbLiveMove(id, patch).then(() => { if (L.id !== id) return; L.inflight = false; lvCalAck(q); })
    .catch(e => {
      if (L.id !== id) return;
      const d = L.doc;
      // النت كان أبطأ من المتوقع: نحسب الوقت من ساعة السيرفر بهامش أكبر ونبعت تاني مرة واحدة
      if (!retry && e && e.code === "permission-denied" && d && d.status === "live" && d.n === ctx.n - 1 && ctx.n - 1 >= 2) {
        const left = Math.round(ctx.stored - (lvSrvNow() - d.at) - 700);
        if (left > 0) { patch[ctx.key] = left + ctx.inc; L.clk[ctx.side] = patch[ctx.key]; L.clkLog[ctx.n - 1] = patch[ctx.key]; return lvSend(id, patch, ctx, true); }
      }
      console.warn("Live move failed:", e && e.code);
      L.inflight = false; lvRebuild(true);
      toast(LVT("⚠️ النقلة ما اتسجلتش — اتأكد من النت", "⚠️ The move was not saved — check your connection"));
      lvPaint();
    });
}
// الممر السريع: نفس النقلة في RTDB (database.rules.json: دورك بس، +1، صيغة UCI، والوقت مايزيدش)
function lvRelay(ctx) {
  const L = arena.live, v = L.rt;
  if (window.fbRtUpdate && (!v || (v.status === "live" && v.plyCount < ctx.n - 1))) { L.relayQ = ctx; return; }   // نقلة الخصم لسه ما وصلتش الممر: نقلتي بتستنى
  if (!v || !window.fbRtUpdate || v.status !== "live" || v.plyCount !== ctx.n - 1 || !L.doc || v.whiteUid !== L.doc.w) return;
  const key = ctx.side === "w" ? "wTimeMs" : "bTimeMs", old = Number(v[key]) || 0;
  let t = Math.min(ctx.nt, ctx.n - 1 >= 2 ? Math.round(old - (fbRtNow() + 150 - v.lastMoveAt)) + (Number(v.incrementMs) || 0) : old);
  if (t < 0) return;
  window.fbRtUpdate(L.id, { plyCount: ctx.n, turn: lvToMove(ctx.n), lastMoveUci: ctx.uci, uciMoves: (v.uciMoves ? v.uciMoves + " " : "") + ctx.uci, [key]: t, pendingTermination: ctx.pend || "", drawOfferedBy: "" }).catch(() => {});
}
// ضغطة على مربع: نقلة في دورك، أو premove وانت مستني
function liveClick(sq) {
  const L = arena.live, d = L.doc, g = L.game;
  if (!d || !g || L.spect || L.over || d.status !== "live" || !L.color) return;
  if (g.turn() !== L.color || L.inflight) return lvPremoveClick(sq);
  const mv = pickOrMove(L, sq, L.color);
  if (mv) {
    if (mv.promotion && typeof promoNeeded === "function" && promoNeeded(L, mv.from, mv.to)) return promoShow(L, mv.from, mv.to, pc => lvMove(Object.assign(mv, { promotion: pc })));
    return lvMove(mv);
  }
  if (L.pre.length) L.pre = [];
  lvPaint();
}
window.liveClick = liveClick;

// ================= premoves: طابور نقلات بتتلعب أول ما الخصم يلعب (لو لسه قانونية) =================
function lvVirtual() {
  const L = arena.live, map = {};
  L.game.board().forEach(row => row.forEach(p => { if (p) map[p.square] = { type: p.type, color: p.color }; }));
  L.pre.forEach(p => { map[p.to] = map[p.from]; delete map[p.from]; });
  return map;
}
function lvPseudo(pc, from, to) {
  if (!pc || from === to) return false;
  const dx = to.charCodeAt(0) - from.charCodeAt(0), dy = Number(to[1]) - Number(from[1]), ax = Math.abs(dx), ay = Math.abs(dy), dir = pc.color === "w" ? 1 : -1;
  switch (pc.type) {
    case "n": return (ax === 1 && ay === 2) || (ax === 2 && ay === 1);
    case "b": return ax === ay;
    case "r": return !ax || !ay;
    case "q": return ax === ay || !ax || !ay;
    case "k": return Math.max(ax, ay) === 1 || (!dy && ax === 2 && from[0] === "e" && from[1] === (pc.color === "w" ? "1" : "8"));
    case "p": return (!dx && (dy === dir || (dy === 2 * dir && from[1] === (pc.color === "w" ? "2" : "7")))) || (ax === 1 && dy === dir);
  }
  return false;
}
function lvPremoveClick(sq) {
  const L = arena.live, v = lvVirtual(), pc = v[sq], own = pc && pc.color === L.color;
  if (L.sel) {
    if (sq === L.sel) L.sel = null;
    else if (own) L.sel = sq;
    else if (L.pre.length < 5 && lvPseudo(v[L.sel], L.sel, sq)) { L.pre.push({ from: L.sel, to: sq }); L.sel = null; }
    else { L.pre = []; L.sel = null; }
  } else if (own) L.sel = sq;
  else L.pre = [];                       // ضغطة في أي حتة تانية = إلغاء الطابور
  lvPaint();
}
function lvRunPremove() {
  const L = arena.live, p = L.pre.shift(); if (!p) return false;
  const legal = L.game.moves({ square: p.from, verbose: true }).find(m => m.to === p.to);
  if (!legal) { L.pre = []; return false; }
  return lvMove({ from: p.from, to: p.to, promotion: legal.promotion ? "q" : undefined });
}

// ================= الوقت خلص =================
function lvNoMate(g, color) {
  let minors = 0;
  for (const row of g.board()) for (const p of row) { if (p && p.color === color && p.type !== "k") { if (p.type === "n" || p.type === "b") minors++; else return false; } }
  return minors <= 1;
}
function lvOnFlag(c) {
  const L = arena.live, d = L.doc; if (!d || L.spect || !L.color || L.flagBusy || d.status !== "live" || d.n < 2) return;
  const now = Date.now(); if (now - L.flagAt < 700) return;
  L.flagAt = now;
  let patch;
  if (c === L.color) {
    // وقتي أنا اللي خلص: بكتب خسارتي، إلا لو الخصم مايقدرش يكش مات (ساعتها هو بيكتب التعادل)
    if (lvNoMate(L.game, c === "w" ? "b" : "w")) return;
    patch = { status: "over", res: c === "w" ? "0-1" : "1-0", why: "timeout" };
  } else patch = lvNoMate(L.game, L.color) ? { status: "over", res: "1/2-1/2", why: "material" } : { status: "over", res: L.color === "w" ? "1-0" : "0-1", why: "timeout" };
  L.flagBusy = true;
  window.fbLivePatch(d.id, patch).then(() => lvRtMirror(patch)).catch(() => {}).then(() => { L.flagBusy = false; });   // لو السيرفر شايف إن لسه فيه وقت: بنحاول تاني
}

// ================= الأزرار: استسلام، تعادل، إلغاء، برزرك، إعلان الفوز =================
function lvAct(patch, msg) { return lvWrite(patch, msg); }
async function lvResign() {
  const L = arena.live; if (!lvPlaying()) return;
  if (window.ecaConfirm && !(await window.ecaConfirm(LVT("متأكد إنك عايز تستسلم؟", "Resign this game?")))) return;
  lvAct({ status: "over", res: L.color === "w" ? "0-1" : "1-0", why: "resign" });
}
function lvDrawOffer() { const L = arena.live; if (!lvPlaying() || L.doc.draw) return; lvAct({ draw: L.color }); toast(LVT("🤝 بعت عرض التعادل", "🤝 Draw offered")); }
function lvDrawAnswer(yes) { const L = arena.live; if (!lvPlaying() || !L.doc.draw || L.doc.draw === L.color) return; lvAct(yes ? { draw: "", status: "over", res: "1/2-1/2", why: "draw" } : { draw: "" }); }
function lvAbort() { const L = arena.live; if (!lvPlaying() || L.doc.n >= 2) return; lvAct({ status: "over", why: "abort" }); }
function lvCanBerserk() { const L = arena.live, d = L.doc; return lvPlaying() && d.mode === "arena" && !(L.color === "w" ? d.bzw : d.bzb) && (L.color === "w" ? d.n === 0 : d.n <= 1); }
function lvBerserk() {
  const L = arena.live, d = L.doc; if (!lvCanBerserk()) return;
  const half = Math.floor(d.base / 2), c = L.color;
  L.clk[c] = half; lvSfx("castle");
  lvAct(c === "w" ? { bzw: true, wt: half } : { bzb: true, bt: half }, LVT("البرزرك ما اتسجلش", "Berserk failed"));
  lvPaint();
}
function lvClaimAbandon() {
  const L = arena.live, d = L.doc; if (!lvPlaying()) return;
  if (d.n < 2) return lvAbort();
  lvAct({ status: "over", res: L.color === "w" ? "1-0" : "0-1", why: "abandon" }, LVT("لسه بدري — استنى الـ 30 ثانية تخلص", "Too early — wait for the 30 seconds"));
}
Object.assign(window, { lvResign, lvDrawOffer, lvDrawAnswer, lvAbort, lvBerserk, lvClaimAbandon });

// ================= نهاية الدور: صوت + أرشيف + نقط البطولة =================
function lvFinish(d) {
  const L = arena.live, me = L.color;
  L.over = { res: d.res, why: d.why }; L.pre = []; L.sel = null;
  L.clk = { w: d.wt, b: d.bt, side: null, t0: performance.now() };
  if (d.why === "timeout") L.clk[d.n % 2 ? "b" : "w"] = 0;   // اللي وقته خلص هو اللي كان عليه الدور
  if (L.presOn && window.fbPresenceOff) { fbPresenceOff(); L.presOn = false; }
  if (L.spect || !me || L.done[d.id]) return;
  L.done[d.id] = true;
  const won = d.res === (me === "w" ? "1-0" : "0-1"), lost = !!d.res && d.res !== "1/2-1/2" && !won;
  lvSfx(won ? "win" : lost ? "loss" : "draw");
  if (won && window.ecaFireworks) ecaFireworks(2);
  if (lvLsGet("eca_live_cur", "") === d.id) lvLsSet("eca_live_cur", null);
  if (d.res && window.ecaArchiveFromLive) { try { L.rec = L.recs[d.id] = ecaArchiveFromLive(d, L.game, L.clkLog); } catch (e) { console.warn("Live archive failed:", e); } }
  if (d.res && L.rec && window.ecaRateAfterLive) ecaRateAfterLive(d);
  if (d.res && L.rec && window.ecaBlunderScan) ecaBlunderScan(L.rec);
  if (d.mode === "arena" && d.tid) lvScore(d);
}
// نقط الدور بيسجّلها لاعب واحد (الفايز، أو الأبيض في التعادل) عشان الاتنين مايكتبوش في نفس اللحظة.
// التاني بيحاول بعد 4 ثواني لو الأول اختفى (العملية مابتكتبش حاجة لو النقط اتسجلت خلاص).
function lvScore(d, tries) {
  if (!window.fbLaScore) return;
  const first = (d.res === "0-1" ? "b" : "w") === arena.live.color;
  if (!tries && !first) return setTimeout(() => lvScore(d, 1), 4000);
  window.fbLaScore(d.tid, d.id).catch(e => { console.warn("Arena score failed:", e && e.code); if ((tries || 0) < 3) setTimeout(() => lvScore(d, (tries || 0) + 1), 1500); });
}

// ================= نبضة «أنا موجود» + فحص الاتصال كل ثانية =================
function lvBeatStart() { const L = arena.live; lvBeatStop(); L.hb = setInterval(lvBeat, 5000); }
function lvBeatStop() { const L = arena.live; if (L.hb) { clearInterval(L.hb); L.hb = 0; } }
function lvBeat() {
  const L = arena.live, d = L.doc; if (!d || L.spect || !L.color || !["open", "live"].includes(d.status) || !window.fbLiveBeat) return;
  const f = L.color === "w" ? "hbw" : "hbb";
  const q = L.calQ ? null : { field: f, prev: d[f], tSend: Date.now(), tAck: 0, srv: 0 };
  if (q) L.calQ = q;
  window.fbLiveBeat(d.id, L.color).then(() => { if (q) lvCalAck(q); }).catch(() => { if (q && L.calQ === q) L.calQ = null; });
}
document.addEventListener("visibilitychange", () => { if (!document.hidden && arena.live.doc) { lvBeat(); lvLoop(); } });
function lvConnHTML() {
  const L = arena.live, d = L.doc; if (!lvPlaying()) return "";
  const gap = Date.now() - L.oppSeen, off = L.oppOnline === false;
  if (gap < 12000 && !off) return "";
  // RTDB بيقول فوراً إن الخصم فصل (onDisconnect)، والإعلان بيتحسب على السيرفر من آخر نبضة (30 ثانية)
  const offFor = off && window.fbRtNow ? Math.max(0, fbRtNow() - L.oppOffAt) : 0;
  const left = gap >= 30000 ? 0 : Math.max(1, 30 - Math.floor(Math.max(gap, offFor) / 1000));
  return `<div class="lv-conn" role="alert"><b>⚠️ ${LVT("انقطع اتصال الخصم.. يحق لك إعلان الفوز خلال 30 ثانية إذا لم يعد", "Your opponent disconnected.. you can claim the win in 30 seconds if they don't return")}</b>
    ${left ? `<span class="lv-conn-n" dir="ltr">${left}s</span>` : `<button type="button" onclick="lvClaimAbandon()" class="tap lv-claim">${d.n < 2 ? "✖ " + LVT("إلغاء الدور", "Abort the game") : "🏆 " + LVT("إعلان الفوز", "Claim the win")}</button>`}</div>`;
}
setInterval(() => {
  const L = arena.live, here = tab === "arena" && arena.sub === "live";
  if (L.doc && L.doc.status === "live" && !L.over && L.clk.side && lvRem(L.clk.side) <= 0) lvOnFlag(L.clk.side);   // الرقعة مش ظاهرة (rAF واقف)
  if (!here) return;
  if (L.prov && L.doc && L.doc.n < L.prov && Date.now() - L.provAt > 6000) { lvRebuild(true); lvPaint(); }
  if (L.view === "game") { const c = document.getElementById("lvConn"); if (c) { const h = lvConnHTML(); if (c.__h !== h) { c.__h = h; c.innerHTML = h; } } }
  if (L.view === "arena" && L.ar) {
    const el = document.getElementById("lvArClock"); if (el) el.textContent = lvArClockText();
    const mine = L.players.find(p => p.uid === lvMe());
    if (mine && mine.wait && !mine.cur && Date.now() - L.sinceAt > 25000 && lvSrvNow() < L.ar.endAt && window.fbLaQueue) { L.sinceAt = Date.now(); window.fbLaQueue(L.tid, true).catch(() => {}); }
    lvPairTick();
  }
}, 1000);

// ================= الساعة على الشاشة (rAF) =================
function lvTick() {
  const L = arena.live; L.raf = 0;
  if (!(tab === "arena" && arena.sub === "live" && L.view === "game" && L.doc && L.doc.status !== "open")) return;
  ["w", "b"].forEach(c => {
    const el = document.getElementById("lvClk_" + c); if (!el) return;
    const rem = lvRem(c), txt = lvFmt(rem);
    if (el.textContent !== txt) el.textContent = txt;
    const low = rem < 10000; if (el.classList.contains("is-low") !== low) el.classList.toggle("is-low", low);
  });
  const d = L.doc;
  if (d.status === "live" && !L.over && L.clk.side) {
    const c = L.clk.side, rem = lvRem(c);
    if (!L.spect && c === L.color && rem < 10000 && rem > 0) { const s = Math.ceil(rem / 1000); if (s !== L.lowTick) { L.lowTick = s; lvSfx("tick"); } }
    if (rem <= 0) lvOnFlag(c);
  }
  if (d.status === "live" && !L.over) L.raf = requestAnimationFrame(lvTick);
}
function lvLoop() { const L = arena.live; if (!L.raf && typeof requestAnimationFrame === "function") L.raf = requestAnimationFrame(lvTick); }

// ================= الرسم: الرقعة بتترسم لوحدها (من غير الصفحة كلها) =================
function lvPaint(full) {
  const root = document.getElementById("lvRoot"), L = arena.live;
  if (!full && root && tab === "arena" && arena.sub === "live" && L.view === "game") {
    root.innerHTML = lvInner();
    if (lang === "en" && typeof applyLang === "function") applyLang();
    lvLoop();
    return;
  }
  if (tab === "arena" && arena.sub === "live") render();
}
function lvBarHTML(c) {
  const L = arena.live, d = L.doc, uid = c === "w" ? d.w : d.b, nick = c === "w" ? d.wn : d.bn, me = !L.spect && c === L.color;
  const bz = c === "w" ? d.bzw : d.bzb, pl = d.mode === "arena" ? L.players.find(p => p.uid === uid) : null, rem = lvRem(c);
  return `<div class="lv-bar${L.clk.side === c ? " is-run" : ""}${me ? " is-me" : ""}">
    <span class="lv-who"><i class="lv-dot lv-${c}" aria-hidden="true"></i><b>${esc(lvName(uid, nick))}</b>${window.ecaEloChip ? ecaEloChip(uid, d) : ""}${me ? `<em>${LVT("(انت)", "(you)")}</em>` : ""}${bz ? `<span class="lv-bz" title="Berserk">⚡</span>` : ""}${pl && pl.fire ? `<span class="lv-fire" title="Streak">🔥</span>` : ""}</span>
    <span class="lv-clock${rem < 10000 ? " is-low" : ""}" id="lvClk_${c}" dir="ltr" role="timer" aria-label="${c === "w" ? LVT("ساعة الأبيض", "White clock") : LVT("ساعة الأسود", "Black clock")}">${lvFmt(rem)}</span></div>`;
}
function lvBtn(fn, label, cls, off) { return `<button type="button" onclick="${fn}" class="tap lv-btn ${cls || ""}"${off ? " disabled" : ""}>${label}</button>`; }
function lvActionsHTML() {
  const L = arena.live, d = L.doc;
  if (L.spect) return `<p class="lv-spect">👁️ ${LVT("بتتفرّج على الدور", "You are spectating")}</p>`;
  if (!lvPlaying()) return "";
  if (d.pend && lvToMove(d.n) !== L.color) return `<p class="lv-claimwait" role="status">⏳ ${LVT("بنستنى جهاز الخصم يأكد", "Waiting for the opponent's device to confirm")} (${esc(LVT((LV_WHY[d.pend] || ["", ""])[0], (LV_WHY[d.pend] || ["", ""])[1]))})...</p>`;
  const b = [];
  if (d.n < 2) b.push(lvBtn("lvAbort()", "✖ " + LVT("إلغاء الدور", "Abort")));
  else {
    b.push(lvBtn("lvDrawOffer()", "🤝 " + (d.draw === L.color ? LVT("عرضت تعادل", "Draw offered") : LVT("عرض تعادل", "Offer draw")), "", !!d.draw));
    b.push(lvBtn("lvResign()", "🏳️ " + LVT("استسلام", "Resign"), "lv-resign"));
  }
  if (lvCanBerserk()) b.push(lvBtn("lvBerserk()", "⚡ " + LVT("برزرك", "Berserk"), "lv-bzbtn"));
  const tip = L.game.turn() !== L.color ? `<p class="lv-tip">${LVT("تقدر تعمل premove وانت مستني: اختار قطعتك ومربع الوصول (لحد 5 نقلات). أي ضغطة تانية بتلغيها.", "You can premove while you wait: pick a piece and its target (up to 5). Any other tap cancels.")}</p>` : "";
  return `<div class="lv-actions">${b.join("")}</div>${tip}`;
}
function lvDrawHTML() {
  const L = arena.live, d = L.doc; if (!lvPlaying() || !d.draw || d.draw === L.color) return "";
  return `<div class="lv-offer" role="alert"><b>🤝 ${LVT("الخصم بيعرض تعادل", "Your opponent offers a draw")}</b><div class="lv-actions">${lvBtn("lvDrawAnswer(true)", "✔ " + LVT("قبول", "Accept"), "lv-ok")}${lvBtn("lvDrawAnswer(false)", "✖ " + LVT("رفض", "Decline"))}</div></div>`;
}
function lvResultHTML() {
  const L = arena.live, d = L.doc; if (d.status !== "over") return "";
  const me = L.color, won = !L.spect && d.res === (me === "w" ? "1-0" : "0-1"), draw = d.res === "1/2-1/2";
  const accused = d.why === "illegal" && !L.spect && d.bad === me;
  const head = d.why === "illegal" ? (accused ? "⚠️ " + LVT("الخصم اشتكى من نقلتك — الكوتش هيراجع الدور", "Your opponent reported your move — the coach will review the game") : "🚩 " + LVT("الدور اتلغى (نقلة غير قانونية)", "Game void (illegal move)"))
    : !d.res ? "✖ " + LVT("الدور اتلغى", "Game aborted")
    : L.spect || !me ? (draw ? "🤝 " + LVT("تعادل", "Draw") : d.res === "1-0" ? "⚪ " + LVT("الأبيض كسب", "White won") : "⚫ " + LVT("الأسود كسب", "Black won"))
    : won ? "🏆 " + LVT("كسبت الدور!", "You won!") : draw ? "🤝 " + LVT("تعادل", "Draw") : "💔 " + LVT("خسرت الدور", "You lost");
  const why = LV_WHY[d.why] ? LVT(LV_WHY[d.why][0], LV_WHY[d.why][1]) : "";
  const arenaOn = d.mode === "arena" && L.ar && lvSrvNow() < L.ar.endAt && !L.spect;
  const next = arenaOn ? lvBtn("lvArenaBack(true)", "🏆 " + LVT("العودة إلى البطولة", "Back to the arena"), "gold-btn lv-back-arena")
    : d.mode === "arena" ? lvBtn("lvArenaBack(false)", "🏆 " + LVT("ترتيب البطولة", "Arena standings"))
    : lvBtn("lvBackLobby()", "⚔️ " + LVT("دور جديد", "New game"), "gold-btn");
  const review = d.res && !L.spect && me ? `<button type="button" onclick="lvAnalyze()" class="tap eca-gm-cta">🔬 ${LVT("تحليل الدور مع الجراند ماستر", "Analyze with the Grandmaster")}</button>
    <button type="button" onclick="lvPgn()" class="tap lv-btn">📋 ${LVT("نسخ / تحميل PGN", "Copy / download PGN")}</button>` : "";
  const rate = d.res && !L.spect && me && window.ecaRateLineHTML ? ecaRateLineHTML(d.id, won ? "win" : draw ? "draw" : "loss") : "";
  return `<div class="lv-result is-${won ? "win" : draw || !d.res ? "draw" : "loss"}" role="status"><b>${head}</b>${why ? `<span>${esc(why)}</span>` : ""}${rate}
    <div class="lv-result-acts">${review}${next}<button type="button" onclick="arenaSub('archive')" class="tap lv-btn">📚 ${LVT("أرشيف أدواري", "My games archive")}</button></div></div>`;
}
function lvMovesHTML() {
  const s = arena.live.san; if (!s.length) return "";
  let h = ""; for (let i = 0; i < s.length; i += 2) h += `<span class="lv-mv"><i>${i / 2 + 1}.</i>${esc(s[i])}${s[i + 1] ? " " + esc(s[i + 1]) : ""}</span>`;
  return `<div class="lv-moves" dir="ltr" aria-label="${LVT("النقلات", "Moves")}">${h}</div>`;
}
function lvWaitHTML(d) {
  const L = arena.live, mine = d.p.includes(lvMe());
  if (!mine) return `<div class="gold-card rounded-2xl p-6 text-center text-sm text-gray-300">⏳ ${LVT("بندخلك الدور...", "Joining the game...")}</div>`;
  const link = location.origin + "/?live=" + d.id, wa = "https://wa.me/?text=" + encodeURIComponent(LVT("تعالى نلعب شطرنج مباشر في أكاديمية ECA ", "Play live chess with me at ECA ") + "(" + d.tc + "): " + link);
  return `<div class="gold-card rounded-2xl p-5 space-y-3 text-center lv-wait">
    <div class="lv-pulse" aria-hidden="true">⚔️</div>
    <b class="block text-yellow-300">${LVT("مستني خصم", "Waiting for an opponent")} • <bdi dir="ltr">${esc(d.tc)}</bdi></b>
    <p class="text-xs text-gray-300">${LVT("ابعت الرابط لصاحبك، أو استنى حد من الأكاديمية يقبل التحدي من اللوبي.", "Send the link to a friend, or wait for someone at the academy to accept it in the lobby.")}</p>
    <input readonly dir="ltr" value="${esc(link)}" class="lv-link" aria-label="${LVT("رابط التحدي", "Challenge link")}" onclick="this.select()" />
    <div class="grid grid-cols-2 gap-2"><button type="button" onclick="lvCopyLink()" class="tap lv-btn">📋 ${LVT("نسخ الرابط", "Copy link")}</button><a href="${esc(wa)}" target="_blank" rel="noopener" class="tap lv-btn lv-wa">💬 ${LVT("واتساب", "WhatsApp")}</a></div>
    <button type="button" onclick="lvCancelOpen()" class="tap lv-btn">✖ ${LVT("إلغاء التحدي", "Cancel the challenge")}</button>
  </div>`;
}
function lvInner() {
  const L = arena.live, d = L.doc, g = L.game;
  if (!d || !g) return `<div class="gold-card rounded-2xl p-8 text-center text-sm text-gray-400">${LVT("بنحمّل الدور...", "Loading the game...")}</div>`;
  if (d.status === "open") return lvWaitHTML(d);
  const top = L.flip ? "w" : "b", bot = top === "w" ? "b" : "w";
  const myTurn = lvPlaying() && g.turn() === L.color && !L.inflight, fl = {};
  L.pre.forEach(p => { fl[p.from] = "lv-pf"; fl[p.to] = "lv-pt"; });
  const board = boardHTML({ game: g, flip: L.flip, sel: L.sel, targets: myTurn && typeof targetsOf === "function" ? targetsOf(g, L.sel) : null, last: L.last, flash: fl, onClick: L.spect ? "lvNoop" : "liveClick" });
  const head = `<div class="lv-head"><span class="lv-tag" dir="ltr">⏱ ${esc(d.tc)}</span><span class="lv-tag">${d.mode === "arena" ? "🏆 " + LVT("بطولة أرينا", "Arena") : "⚔️ " + LVT("ودّي", "Casual")}</span>${L.bad ? `<span class="lv-tag lv-bad">⚠️ ${LVT("نقلة غلط من الطرف التاني", "Invalid move from the other side")}</span>` : ""}</div>`;
  return `${head}<div class="lv-board-wrap">${lvBarHTML(top)}${board}${lvBarHTML(bot)}</div><div id="lvConn">${lvConnHTML()}</div>${lvDrawHTML()}${lvActionsHTML()}${lvResultHTML()}${lvMovesHTML()}
    ${L.spect ? `<button type="button" onclick="${d.mode === "arena" && L.tid ? "lvArenaBack(false)" : "lvBackLobby()"}" class="tap lv-btn w-full">↩ ${LVT("رجوع", "Back")}</button>` : ""}`;
}
function lvCopyLink() { const L = arena.live; if (!L.doc) return; try { navigator.clipboard.writeText(location.origin + "/?live=" + L.doc.id).then(() => toast(LVT("اتنسخ الرابط", "Link copied"))); } catch (_) {} }
async function lvCancelOpen() {
  const L = arena.live, d = L.doc; if (!d || d.status !== "open") return;
  try { await window.fbLiveDelete(d.id); } catch (e) { console.warn("Live cancel failed:", e && e.code); }
  lvClose(); L.view = "lobby"; lvPaint(true);
}
function lvBackLobby() { const L = arena.live; if (lvPlaying()) return; lvClose(); L.view = L.tid ? "arena" : "lobby"; lvPaint(true); }
function lvAnalyze() { const L = arena.live; if (!L.rec || !window.ecaArchiveOpen) return; L.backId = L.id; ecaArchiveOpen(L.rec, { sub: "live", back: LVT("↩ العودة للدور", "↩ Back to the game") }); }
function lvPgn() { const L = arena.live; if (L.rec && window.ecaArchivePgnOf) ecaArchivePgnOf(L.rec); }
Object.assign(window, { lvCopyLink, lvCancelOpen, lvBackLobby, lvAnalyze, lvPgn });

// ================= اللوبي: الوقت، اللون، ابحث عن خصم، تحدي برابط، التحديات المفتوحة، البطولات =================
function lvSetTc(i) { const L = arena.live; L.tci = Math.max(0, Math.min(LV_TC.length - 1, Number(i) || 0)); lvLsSet("ECA_LIVE_TC", String(L.tci)); render(); }
function lvSetSide(s) { arena.live.side = ["w", "b", "r"].includes(s) ? s : "r"; render(); }
function lvTcOf(i) { const t = LV_TC[i] || LV_TC[3]; return { base: t[0] * 60000, inc: t[1] * 1000, tc: t[0] + "+" + t[1] }; }
function lvFreshOpen(r) {
  const hb = r.w ? r.hbw : r.hbb, age = lvSrvNow() - hb;
  return r.mode === "pvp" && r.status === "open" && (arena.live.off == null ? age < 10 * 60000 : age < 45000) && lvSrvNow() - r.created < 30 * 60000;
}
async function lvCreate(withLink) {
  const L = arena.live; if (L.busy || !lvStudent() || !window.fbLiveCreate) return;
  const t = lvTcOf(L.tci), side = L.side === "r" ? (Math.random() < .5 ? "w" : "b") : L.side;
  L.busy = true; render();
  try { const id = await window.fbLiveCreate(t.base, t.inc, t.tc, side); L.busy = false; lvOpen(id); if (withLink) setTimeout(lvCopyLink, 300); }
  catch (e) { L.busy = false; console.warn("Live create failed:", e && (e.code || e.message)); toast(LVT("التحدي ما اتعملش. حاول تاني.", "The challenge could not be created. Try again.")); render(); }
}
async function lvQuick() {
  const L = arena.live; if (L.busy || !lvStudent()) return;
  const t = lvTcOf(L.tci), me = lvMe();
  const cand = (L.lobby || []).filter(r => r.tc === t.tc && !r.p.includes(me) && lvFreshOpen(r));
  L.busy = true; render();
  for (const r of cand) { try { if (await window.fbLiveJoin(r.id)) { L.busy = false; return lvOpen(r.id); } } catch (_) {} }
  L.busy = false;
  return lvCreate(false);
}
async function lvAccept(id) {
  const L = arena.live; if (!lvIdOk(id) || L.busy || !lvStudent()) return;
  L.busy = true;
  try { const ok = await window.fbLiveJoin(id); L.busy = false; if (ok) return lvOpen(id); toast(LVT("التحدي ده اتاخد خلاص", "This challenge was already taken")); }
  catch (e) { L.busy = false; console.warn("Live accept failed:", e && e.code); toast(LVT("ما قدرتش تدخل التحدي ده.", "You could not join this challenge.")); }
  render();
}
// بوتات الأكاديمية: نفس ساحة اللعب ضد الكمبيوتر بنفس الوقت (والدور بيتحفظ في الأرشيف)
function lvBots() {
  const t = LV_TC[arena.live.tci], label = t[0] + "+" + t[1];
  if (typeof PLAY_TC !== "undefined") { const i = PLAY_TC.findIndex(x => x[3] === label); if (i >= 0) { arena.play.tc = i; lvLsSet("ECA_TC_L", label); } }
  arenaSub("play");
}
Object.assign(window, { lvSetTc, lvSetSide, lvCreate, lvQuick, lvAccept, lvBots });

function lvLobbyHTML(u) {
  const L = arena.live, student = u.role === "student", me = lvMe(), t = lvTcOf(L.tci);
  const tcs = LV_TC.map((x, i) => `<button type="button" role="radio" aria-checked="${L.tci === i}" onclick="lvSetTc(${i})" class="tap lv-tc${L.tci === i ? " is-on" : ""}" dir="ltr">${x[0]}+${x[1]}</button>`).join("");
  const sides = [["w", "⚪", LVT("أبيض", "White")], ["r", "🎲", LVT("عشوائي", "Random")], ["b", "⚫", LVT("أسود", "Black")]]
    .map(s => `<button type="button" role="radio" aria-checked="${L.side === s[0]}" onclick="lvSetSide('${s[0]}')" class="tap lv-side${L.side === s[0] ? " is-on" : ""}" aria-label="${esc(s[2])}" title="${esc(s[2])}">${s[1]} <span>${esc(s[2])}</span></button>`).join("");
  const open = (L.lobby || []).filter(r => !r.p.includes(me) && lvFreshOpen(r));
  const rows = L.lobby === null ? `<p class="lv-empty">${LVT("بنحمّل...", "Loading...")}</p>` : open.length ? open.map(r => {
    const uid = r.w || r.b, nick = r.w ? r.wn : r.bn;
    return `<div class="lv-open"><span class="lv-who"><i class="lv-dot lv-${r.w ? "w" : "b"}" aria-hidden="true"></i><b>${esc(lvName(uid, nick))}</b></span><span class="lv-tag" dir="ltr">⏱ ${esc(r.tc)}</span>${student && lvIdOk(r.id) ? `<button type="button" onclick="lvAccept('${esc(r.id)}')" class="tap lv-btn gold-btn">⚔️ ${LVT("قبول", "Accept")}</button>` : ""}</div>`;
  }).join("") : `<p class="lv-empty">${LVT("مفيش تحديات مفتوحة دلوقتي — اعمل واحد!", "No open challenges right now — create one!")}</p>`;
  const resume = lvLsGet("eca_live_cur", "");
  return `<div class="lv space-y-4">
    ${student && lvIdOk(resume) ? `<button type="button" onclick="lvOpen('${esc(resume)}')" class="tap lv-resume">▶ ${LVT("ارجع لدورك المباشر", "Back to your live game")}</button>` : ""}
    <section class="gold-card rounded-2xl p-4 space-y-3 lv-new" aria-label="${LVT("دور جديد", "New game")}">
      <h3 class="font-bold text-yellow-300">⚔️ ${LVT("شطرنج مباشر — العب ضد زمايلك بالوقت", "Live chess — play your classmates on the clock")}</h3>
      <div><div class="lv-label">${LVT("الوقت (دقايق + ثواني زيادة لكل نقلة)", "Time (minutes + seconds added per move)")}</div><div class="lv-tcs" role="radiogroup">${tcs}</div></div>
      <div><div class="lv-label">${LVT("اللون", "Color")}</div><div class="lv-sides" role="radiogroup">${sides}</div></div>
      ${student ? `<div class="grid grid-cols-2 gap-2">
        <button type="button" onclick="lvQuick()" class="tap lv-btn gold-btn"${L.busy ? " disabled" : ""}>⚔️ ${LVT("ابحث عن خصم", "Find an opponent")} <bdi dir="ltr">${esc(t.tc)}</bdi></button>
        <button type="button" onclick="lvCreate(true)" class="tap lv-btn"${L.busy ? " disabled" : ""}>🔗 ${LVT("تحدي صاحبك برابط", "Challenge a friend by link")}</button>
      </div>` : `<p class="text-xs text-gray-400">${LVT("الطلاب هما اللي بيلعبوا. تقدر تعمل بطولة أرينا تحت وتتفرج على الأدوار.", "Students play. You can create an arena below and watch the games.")}</p>`}
      ${student ? `<button type="button" onclick="lvBots()" class="tap lv-btn w-full">🤖 ${LVT("العب ضد بوتات الأكاديمية بنفس الوقت — مباراة تدريبية (غير مصنفة - Unrated)", "Play the academy bots with this clock — training game (Unrated)")}</button>` : ""}
    </section>
    <section class="gold-card rounded-2xl p-4 space-y-2" aria-label="${LVT("تحديات مفتوحة", "Open challenges")}"><h3 class="font-bold text-yellow-300">🟢 ${LVT("تحديات مفتوحة", "Open challenges")}</h3>${rows}</section>
    ${lvArenasHTML(u)}
    ${u.role !== "student" && u.role !== "parent" ? lvDisputesHTML() : ""}
    <button type="button" onclick="arenaSub('archive')" class="tap lv-btn w-full">📚 ${LVT("أرشيف أدواري", "My games archive")}</button>
  </div>`;
}

// ================= بطولات الأرينا =================
function lvArStatus(a) {
  const now = lvSrvNow();
  if (now < a.startAt) return { k: "soon", t: LVT("تبدأ بعد ", "Starts in ") + lvClockText(a.startAt - now) };
  if (now < a.endAt) return { k: "live", t: "🔴 " + LVT("شغالة — باقي ", "LIVE — ") + lvClockText(a.endAt - now) + LVT("", " left") };
  return { k: "over", t: "🏁 " + LVT("خلصت", "Finished") };
}
function lvClockText(ms) { const s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function lvArClockText() { const a = arena.live.ar; return a ? lvArStatus(a).t : ""; }
function lvArenasHTML(u) {
  const L = arena.live, staff = u.role !== "student" && u.role !== "parent";
  const list = (L.arenas || []).slice().sort((x, y) => x.startAt - y.startAt).map(a => {
    const st = lvArStatus(a);
    return `<div class="lv-open"><span class="lv-who"><b>🏆 ${esc(a.name)}</b></span><span class="lv-tag" dir="ltr">⏱ ${esc(a.tc)}</span><span class="lv-tag lv-st-${st.k}">${esc(st.t)}</span>${lvIdOk(a.id) ? `<button type="button" onclick="lvArenaOpen('${esc(a.id)}')" class="tap lv-btn gold-btn">${st.k === "over" ? LVT("النتيجة", "Results") : LVT("ادخل", "Enter")}</button>` : ""}</div>`;
  }).join("");
  const create = staff ? `<div class="lv-create space-y-2">
      <b class="block text-sm text-yellow-300">➕ ${LVT("بطولة أرينا جديدة", "New arena tournament")}</b>
      <input id="lvArName" maxlength="60" class="lv-input" placeholder="${LVT("اسم البطولة (مثلاً: أرينا الجمعة)", "Arena name (e.g. Friday Arena)")}" aria-label="${LVT("اسم البطولة", "Arena name")}" />
      <div class="lv-tcs" role="radiogroup">${LV_TC.map((x, i) => `<button type="button" role="radio" aria-checked="${L.arTci === i}" onclick="arena.live.arTci=${i}; render();" class="tap lv-tc${L.arTci === i ? " is-on" : ""}" dir="ltr">${x[0]}+${x[1]}</button>`).join("")}</div>
      <div class="grid grid-cols-2 gap-2">${[30, 45].map(m => `<button type="button" onclick="arena.live.arMin=${m}; render();" class="tap lv-btn${L.arMin === m ? " gold-btn" : ""}">⏱ ${m} ${LVT("دقيقة", "min")}</button>`).join("")}</div>
      <div class="grid grid-cols-3 gap-2">${[[0, LVT("دلوقتي", "Now")], [5, LVT("بعد 5 د", "In 5 min")], [10, LVT("بعد 10 د", "In 10 min")]].map(s => `<button type="button" onclick="arena.live.arStart=${s[0]}; render();" class="tap lv-btn${L.arStart === s[0] ? " gold-btn" : ""}">${s[1]}</button>`).join("")}</div>
      <button type="button" onclick="lvArenaCreate()" class="tap lv-btn gold-btn w-full"${L.busy ? " disabled" : ""}>✅ ${LVT("ابدأ البطولة", "Create the arena")}</button>
    </div>` : "";
  return `<section class="gold-card rounded-2xl p-4 space-y-2" aria-label="${LVT("بطولات الأرينا", "Arena tournaments")}">
    <h3 class="font-bold text-yellow-300">🏆 ${LVT("بطولات الأرينا المباشرة", "Live arena tournaments")}</h3>
    <p class="text-xs text-gray-400">${LVT("فوز = 2، تعادل = 1. بعد فوزين ورا بعض 🔥 الفوز بـ 4. البرزرك ⚡ بينص وقتك ويديك +1 لو كسبت.", "Win = 2, draw = 1. After two wins in a row 🔥 a win is 4. Berserk ⚡ halves your clock for +1 on a win.")}</p>
    ${list || `<p class="lv-empty">${LVT("مفيش بطولات دلوقتي", "No arenas right now")}</p>`}${create}</section>`;
}
async function lvArenaCreate() {
  const L = arena.live; if (L.busy || !window.fbLaCreate) return;
  const el = document.getElementById("lvArName"), name = String(el ? el.value : "").replace(/[<>"'`]/g, "").trim().slice(0, 60);
  if (name.length < 2) return toast(LVT("اكتب اسم للبطولة", "Write a name for the arena"));
  const t = lvTcOf(L.arTci);
  L.busy = true; render();
  try { const id = await window.fbLaCreate(name, t.base, t.inc, t.tc, L.arMin, L.arStart); L.busy = false; toast(LVT("✅ البطولة اتعملت", "✅ Arena created")); lvArenaOpen(id); }
  catch (e) { L.busy = false; console.warn("Arena create failed:", e && (e.code || e.message)); toast(LVT("البطولة ما اتعملتش", "The arena could not be created")); render(); }
}
function lvArenaOpen(tid) {
  const L = arena.live; if (!lvIdOk(tid) || !window.fbLaWatch) return;
  if (L.arStop && L.tid !== tid) { L.arStop(); L.arStop = null; }
  L.tid = tid; L.view = "arena";
  if (L.ar && L.ar.id !== tid) { L.ar = null; L.players = []; }
  if (!L.arStop) L.arStop = window.fbLaWatch(tid, a => { if (L.tid !== tid) return; L.ar = a; lvArPaint(); }, rows => { if (L.tid !== tid) return; L.players = rows; lvOnPlayers(); });
  render();
}
function lvArenaLeave() { const L = arena.live; if (L.arStop) { L.arStop(); L.arStop = null; } L.tid = ""; L.ar = null; L.players = []; L.view = "lobby"; render(); }
function lvArenaBack(queue) { const L = arena.live; if (lvPlaying()) return; lvClose(); if (!L.tid) return lvBackLobby(); L.view = "arena"; render(); if (queue) lvQueue(true); }
async function lvQueue(on) {
  const L = arena.live; if (!L.tid || !lvStudent() || !window.fbLaQueue) return;
  // الدور اللي فات لسه نقطه ما اتسجلتش (الخصم خرج مثلاً): نسجّلها الأول، وبعدين الطابور
  const mine = L.players.find(p => p.uid === lvMe());
  if (on && mine && mine.cur && window.fbLaScore) { try { await window.fbLaScore(L.tid, mine.cur); } catch (_) {} }
  try { L.sinceAt = Date.now(); await window.fbLaQueue(L.tid, on); } catch (e) { console.warn("Arena queue failed:", e && e.code); toast(on ? LVT("البطولة مش شغالة دلوقتي", "The arena is not running now") : LVT("حاول تاني", "Try again")); }
}
function lvSpectate(gid) { if (lvIdOk(gid)) lvOpen(gid, true); }
Object.assign(window, { lvArenaCreate, lvArenaOpen, lvArenaLeave, lvArenaBack, lvQueue, lvSpectate });
function lvArPaint() { if (tab === "arena" && arena.sub === "live" && arena.live.view === "arena") render(); }
function lvOnPlayers() {
  const L = arena.live, me = lvMe(), mine = L.players.find(p => p.uid === me), now = Date.now();
  if (mine && mine.since && L.sinceAt && L.off == null && now - L.sinceAt < 10000) L.off = mine.since - L.sinceAt;   // ساعة السيرفر تقريباً (لتجاهل اللي سابوا الطابور)
  L.players.forEach(p => { if (p.wait && !p.cur) { if (!L.seenWait[p.uid]) L.seenWait[p.uid] = now; } else delete L.seenWait[p.uid]; });
  // اتوفّقت مع حد: الدور بيفتح لوحده
  if (mine && mine.cur && !L.done[mine.cur] && L.id !== mine.cur && tab === "arena" && arena.sub === "live") { lvOpen(mine.cur); return; }
  lvPairTick();
  lvArPaint();
}
// التوفيق: كل جهاز بيحسب نفس الأزواج (بالنقط ثم الـ id)، واللي الـ id بتاعه أصغر هو اللي بيعمل الدور
function lvPairTick() {
  const L = arena.live, a = L.ar, me = lvMe(); if (!a || L.pairBusy || !L.tid || !window.fbLaPair) return;
  const srv = lvSrvNow(), now = Date.now(); if (srv < a.startAt || srv >= a.endAt || now - L.pairAt < 600) return;
  const mine = L.players.find(p => p.uid === me); if (!mine || !mine.wait || mine.cur) return;
  const pool = L.players.filter(p => p.wait && !p.cur && (p.uid === me || L.off == null || srv - p.since < 70000))
    .sort((x, y) => y.pts - x.pts || (x.uid < y.uid ? -1 : 1));
  const used = new Set(), waited = u => now - (L.seenWait[u] || now);
  let opp = null;
  for (const x of pool) {
    if (used.has(x.uid)) continue;
    let best = null;
    for (const y of pool) {
      if (y.uid === x.uid || used.has(y.uid)) continue;
      const rematch = x.last === y.uid || y.last === x.uid;
      if (rematch && (pool.length > 2 || Math.min(waited(x.uid), waited(y.uid)) < 8000)) continue;   // مفيش ماتش ورا بعض مع نفس الخصم
      if (!best || Math.abs(y.pts - x.pts) < Math.abs(best.pts - x.pts)) best = y;
    }
    if (!best) continue;
    used.add(x.uid); used.add(best.uid);
    if (x.uid === me) opp = best; else if (best.uid === me) opp = x;
    if (opp) break;
  }
  if (!opp || me > opp.uid) return;
  L.pairBusy = true; L.pairAt = now;
  window.fbLaPair(L.tid, opp.uid, Math.random() < .5).then(gid => { L.pairBusy = false; if (gid) lvOpen(gid); })
    .catch(e => { L.pairBusy = false; console.warn("Arena pairing failed:", e && e.code); });
}
function lvArenaHTML(u) {
  const L = arena.live, a = L.ar, me = lvMe(), student = u.role === "student";
  if (!a) return `<div class="gold-card rounded-2xl p-8 text-center text-sm text-gray-400">${LVT("بنحمّل البطولة...", "Loading the arena...")}</div>`;
  const st = lvArStatus(a), mine = L.players.find(p => p.uid === me);
  const rows = L.players.slice().sort((x, y) => y.pts - x.pts || x.games.length - y.games.length).map((p, i) =>
    `<tr class="${p.uid === me ? "is-me" : ""}"><td>${i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}</td><td class="lv-pn"><b>${esc(lvName(p.uid, p.n))}</b>${window.ecaEloChip ? ecaEloChip(p.uid) : ""}${p.fire ? ` <span class="lv-fire" title="Streak">🔥</span>` : ""}</td><td dir="ltr"><b>${p.pts}</b></td><td>${p.games.length}</td>
      <td>${p.cur && lvIdOk(p.cur) && p.uid !== me ? `<button type="button" onclick="lvSpectate('${esc(p.cur)}')" class="tap lv-eye" title="${LVT("مشاهدة الدور", "Spectate")}" aria-label="${LVT("مشاهدة الدور", "Spectate")} (Spectate)">👁️</button>` : p.wait ? "⏳" : ""}</td></tr>`).join("");
  let action = "";
  if (student && st.k === "live") {
    action = mine && mine.cur ? `<button type="button" onclick="lvOpen('${esc(mine.cur)}')" class="tap lv-btn gold-btn w-full">▶ ${LVT("ارجع لدورك", "Back to your game")}</button>`
      : mine && mine.wait ? `<div class="lv-searching" role="status"><span class="lv-pulse" aria-hidden="true">⚔️</span><b>${LVT("بندوّر على خصم قريب من نقطك...", "Finding an opponent near your score...")}</b></div><button type="button" onclick="lvQueue(false)" class="tap lv-btn w-full">⏸ ${LVT("وقّف البحث عن خصم", "Stop searching")}</button>`
      : `<button type="button" onclick="lvQueue(true)" class="tap lv-btn gold-btn w-full lv-join">⚔️ ${LVT("انضم للبطولة (Join Next Game)", "Join Next Game")}</button>`;
  } else if (student && st.k === "soon") action = `<p class="lv-empty">${LVT("الانضمام للبطولة بيفتح أول ما تبدأ", "Joining opens when the arena starts")}</p>`;
  const podium = st.k === "over" && L.players.length ? `<div class="lv-podium">${L.players.slice().sort((x, y) => y.pts - x.pts).slice(0, 3).map((p, i) => `<div class="lv-pod lv-pod-${i + 1}"><span>${["🥇", "🥈", "🥉"][i]}</span><b>${esc(lvName(p.uid, p.n))}</b><i dir="ltr">${p.pts}</i>${window.ecaCertArenaBtn ? ecaCertArenaBtn(a, p, i + 1, u) : ""}</div>`).join("")}</div>` : "";
  return `<div class="lv space-y-4">
    <section class="gold-card rounded-2xl p-4 space-y-3 lv-arena">
      <div class="flex flex-wrap items-center gap-2"><h3 class="font-bold text-yellow-300 flex-1 min-w-0 truncate">🏆 ${esc(a.name)}</h3><span class="lv-tag" dir="ltr">⏱ ${esc(a.tc)}</span><span class="lv-tag lv-st-${st.k}" id="lvArClock">${esc(st.t)}</span></div>
      ${mine ? `<div class="lv-mine"><span>${LVT("نقطك", "Your points")}: <b dir="ltr">${mine.pts}</b></span>${mine.fire ? `<span class="lv-fire">🔥 ${LVT("فوزين ورا بعض — الفوز الجاي بـ 4!", "On fire — next win is worth 4!")}</span>` : ""}</div>` : ""}
      ${action}${podium}
    </section>
    <section class="gold-card rounded-2xl p-4" aria-label="${LVT("الترتيب", "Standings")}">
      <h3 class="font-bold text-yellow-300 mb-2">📊 ${LVT("الترتيب المباشر", "Live standings")}</h3>
      ${rows ? `<table class="lv-table"><thead><tr><th>#</th><th>${LVT("اللاعب", "Player")}</th><th>${LVT("نقط", "Pts")}</th><th>${LVT("أدوار", "Games")}</th><th></th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="lv-empty">${LVT("لسه محدش دخل", "Nobody has joined yet")}</p>`}
    </section>
    <button type="button" onclick="lvArenaLeave()" class="tap lv-btn w-full">↩ ${LVT("كل البطولات", "All arenas")}</button>
  </div>`;
}

function lvTourCardHTML(u) {
  return `<section class="gold-card rounded-2xl p-4 mb-4 lv-tour" aria-label="${LVT("بطولات الأرينا المباشرة", "Live arena tournaments")}"><div class="flex flex-wrap items-center gap-3"><span class="text-3xl" aria-hidden="true">⚡</span><div class="flex-1 min-w-0"><b class="block text-yellow-300">${LVT("بطولات الأرينا المباشرة", "Live arena tournaments")}</b><span class="text-xs text-gray-400">${u.role === "student" ? LVT("انضم للبطولة والعب أدوار بالوقت — الفوز 2 والـ 🔥 بـ 4", "Join the arena and play timed games — a win is 2, on fire 🔥 it is 4") : LVT("اعمل بطولة 30 أو 45 دقيقة وتابع الترتيب مباشر", "Create a 30 or 45 minute arena and follow the live standings")}</span></div><button type="button" onclick="lvGoArenas()" class="tap lv-btn gold-btn">🏆 ${LVT("البطولات المباشرة", "Live arenas")}</button></div></section>`;
}
function lvGoArenas() { arena.live.view = arena.live.tid ? "arena" : "lobby"; arena.sub = "live"; switchTab("arena"); }
window.lvGoArenas = lvGoArenas;

// ================= مراجعة الشكاوى (للكوتش): chess.js بيعيد الدور ويحدد مين اللي غلط =================
function lvVerdict(r) {
  const g = new ChessCls(); let badAt = -1;
  for (let i = 0; i < r.moves.length; i++) { let x = null; try { x = uciMove(g, r.moves[i]); } catch (_) { x = null; } if (!x) { badAt = i; break; } }
  const accused = r.bad === "w" ? "w" : "b", accuser = accused === "w" ? "b" : "w";
  if (badAt >= 0) return { cheat: lvToMove(badAt), kind: "move", ply: badAt + 1 };
  if (r.pend) {
    const half = Number(g.fen().split(" ")[4]) || 0;
    const ok = { checkmate: g.isCheckmate(), stalemate: g.isStalemate(), material: g.isInsufficientMaterial(), repetition: g.isThreefoldRepetition(), fifty: half >= 100 }[r.pend];
    return ok ? { cheat: accuser, kind: "false" } : { cheat: accused, kind: "claim" };
  }
  return { cheat: accuser, kind: "false" };
}
function lvDisputesHTML() {
  const L = arena.live, rows = L.disputes;
  if (rows === null) return "";
  const list = rows.filter(r => lvIdOk(r.id)).map(r => {
    const v = lvVerdict(r), who = c => (c === "w" ? "⚪ " : "⚫ ") + lvName(c === "w" ? r.w : r.b, c === "w" ? r.wn : r.bn), win = v.cheat === "w" ? "b" : "w";
    const why = v.kind === "move" ? LVT(`نقلة غير قانونية من ${who(v.cheat)} (النقلة ${v.ply})`, `Illegal move by ${who(v.cheat)} (ply ${v.ply})`)
      : v.kind === "claim" ? LVT(`ادعاء ${(LV_WHY[r.pend] || [r.pend])[0]} غلط من ${who(v.cheat)}`, `False ${r.pend} claim by ${who(v.cheat)}`)
      : LVT(`شكوى غلط من ${who(v.cheat)} — كل النقلات قانونية`, `False report by ${who(v.cheat)} — every move was legal`);
    return `<div class="lv-dispute" data-gid="${esc(r.id)}"><div class="lv-who"><b>${esc(who("w"))} vs ${esc(who("b"))}</b></div><span class="lv-tag" dir="ltr">⏱ ${esc(r.tc)}</span>
      <p class="lv-verdict is-${v.kind}">⚖️ ${esc(why)}</p>
      <button type="button" onclick="lvJudge('${esc(r.id)}')" class="tap lv-btn gold-btn"${L.judging === r.id ? " disabled" : ""}>⚖️ ${LVT("نفّذ الحكم", "Apply the ruling")}: ${esc(who(win))} ${LVT("يكسب", "wins")}</button></div>`;
  }).join("");
  return `<section class="gold-card rounded-2xl p-4 space-y-2" aria-label="${LVT("أدوار عليها شكوى", "Disputed games")}"><h3 class="font-bold text-yellow-300">🚩 ${LVT("أدوار عليها شكوى (مراجعة الكوتش)", "Disputed games (coach review)")}</h3>
    <p class="text-xs text-gray-400">${LVT("لما جهاز طالب يلاقي نقلة غير قانونية أو ادعاء كش مات غلط، الدور بيتلغي ويوصل هنا. الموقع بيعيد النقلات بـ chess.js ويقولك مين اللي غلط.", "When a student's device finds an illegal move or a false checkmate claim, the game is voided and lands here. The site replays the moves with chess.js and tells you who cheated.")}</p>
    ${list || `<p class="lv-empty">${LVT("مفيش شكاوى", "No disputes")}</p>`}</section>`;
}
async function lvJudge(gid) {
  const L = arena.live, r = (L.disputes || []).find(x => x.id === gid); if (!r || L.judging || !window.fbLivePatch) return;
  const v = lvVerdict(r), res = v.cheat === "w" ? "0-1" : "1-0";
  L.judging = gid; render();
  try { await window.fbLivePatch(gid, { res, why: "forfeit", judge: lvMe() }); toast(LVT("⚖️ الحكم اتسجل", "⚖️ Ruling saved")); }
  catch (e) { console.warn("Ruling failed:", e && e.code); toast(LVT("الحكم ما اتسجلش", "The ruling was not saved")); }
  L.judging = ""; render();
}
window.lvJudge = lvJudge;

// ================= الصفحة جوه ساحة التدريب =================
function lvHTML(u) {
  const L = arena.live;
  if (L.view === "game" && L.id) return `<div id="lvRoot" class="lv-game">${lvInner()}</div>`;
  if (L.view === "arena" && L.tid) return lvArenaHTML(u);
  return lvLobbyHTML(u);
}
{
  const _av = renderArenaView;
  renderArenaView = function (u) {
    if (arena.sub !== "live" || !u) return _av.apply(this, arguments);
    const keep = arenaPlayHTML;
    arenaPlayHTML = () => lvHTML(u);
    try { return _av.apply(this, arguments); } finally { arenaPlayHTML = keep; }
  };
}
// الاستماع بيقف لما الطالب يسيب الشاشة (إلا الدور الشغال نفسه)، والرابط ?live=ID بيفتح بعد الدخول
(function () {
  try {
    const id = new URLSearchParams(location.search).get("live");
    if (lvIdOk(id)) { sessionStorage.setItem("ECA_LIVE", id); const url = new URL(location.href); url.searchParams.delete("live"); history.replaceState(null, "", url.pathname + url.search + url.hash); }
  } catch (_) {}
})();
{
  const _r = render;
  render = function () {
    const L = arena.live, here = tab === "arena" && arena.sub === "live";
    if (!here) {
      if (L.lobbyStop) { L.lobbyStop(); L.lobbyStop = null; }
      if (L.arenasStop) { L.arenasStop(); L.arenasStop = null; }
      if (L.disputesStop) { L.disputesStop(); L.disputesStop = null; }
      if (L.arStop && !lvPlaying()) { L.arStop(); L.arStop = null; }
      if (L.stop && !lvPlaying() && !(L.doc && L.doc.status === "open")) lvClose();
    }
    if (here && L.view === "game" && !L.id) L.view = L.tid ? "arena" : "lobby";
    const out = _r.apply(this, arguments), u = typeof currUser === "function" ? currUser() : null;
    if (here && u && !window.__authLoading) {
      if (L.view === "lobby") {
        if (!L.lobbyStop && window.fbLiveLobby) L.lobbyStop = window.fbLiveLobby(rows => { L.lobby = rows; if (tab === "arena" && arena.sub === "live" && L.view === "lobby") render(); }, () => { L.lobby = []; });
        if (u.role !== "student" && u.role !== "parent" && !L.disputesStop && window.fbLiveDisputes) L.disputesStop = window.fbLiveDisputes(rows => { L.disputes = rows; if (tab === "arena" && arena.sub === "live" && L.view === "lobby") render(); }, () => { L.disputes = []; });
      }
      if (L.view !== "game" && !L.arenasStop && window.fbLaList) L.arenasStop = window.fbLaList(rows => { L.arenas = rows; if (tab === "arena" && arena.sub === "live" && L.view === "lobby") render(); }, () => { L.arenas = []; });
      if (L.view === "arena" && L.tid && !L.arStop) lvArenaOpen(L.tid);
      if (L.view === "game") lvLoop();
    }
    // صفحة البطولات (بتتحمّل لوحدها): كارت بطولات الأرينا المباشرة فوق
    const mv = tab === "tournaments" ? document.getElementById("mainView") : null;
    if (mv && u && u.role !== "parent" && !mv.querySelector(".lv-tour")) mv.insertAdjacentHTML("afterbegin", lvTourCardHTML(u));
    if (u && u.role === "student" && !window.__authLoading && window.fbLiveWatch) {
      let pending = "";
      try { pending = sessionStorage.getItem("ECA_LIVE") || ""; if (pending) sessionStorage.removeItem("ECA_LIVE"); } catch (_) {}
      if (lvIdOk(pending)) { L.autoJoin = pending; arena.sub = "live"; switchTab("arena"); lvOpen(pending); }
    }
    return out;
  };
}
// الخروج في نص دور مباشر = استسلام (بعد سؤال)
{
  const ask = () => window.confirm(LVT("الدور المباشر لسه شغّال. لو خرجت هتستسلم. تخرج؟", "Your live game is still on. Leaving resigns it. Leave?"));
  const leave = () => { const L = arena.live; if (lvPlaying()) window.fbLivePatch(L.doc.id, L.doc.n < 2 ? { status: "over", why: "abort" } : { status: "over", res: L.color === "w" ? "0-1" : "1-0", why: "resign" }).catch(() => {}); };
  const _st = switchTab;
  switchTab = function (t) { if (lvPlaying() && tab === "arena" && arena.sub === "live" && t !== "arena") { if (!ask()) return; leave(); } return _st.apply(this, arguments); };
  const _as = arenaSub;
  arenaSub = function (k) {
    const L = arena.live;
    if (lvPlaying() && tab === "arena" && arena.sub === "live" && k !== "live") { if (!ask()) return; leave(); }
    if (k === "live" && arena.sub !== "live" && !L.id) L.view = L.tid ? "arena" : "lobby";
    const out = _as.apply(this, arguments);
    // راجع من التحليل: نفس الدور بنتيجته
    if (k === "live" && L.backId && !L.id) { const id = L.backId; L.backId = ""; lvOpen(id); }
    else if (k !== "live" && k !== "analysis") L.backId = "";
    return out;
  };
  window.switchTab = switchTab; window.arenaSub = arenaSub;
}
