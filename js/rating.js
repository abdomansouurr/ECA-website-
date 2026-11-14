// ECA — rating.js: تصنيف الأكاديمية الرسمي (ECA Rating)
// كل طالب بيبدأ بـ 1000. التصنيف بيتحسب بعد الأدوار المباشرة بين طالبين بس (ودّي أو بطولة أرينا) — أدوار البوت تدريبية ومش مصنفة. Elo:
//   E = 1 / (1 + 10^((الخصم − انا) / 400)) ، K = 32 لأول 20 دور وبعدها 24 ، الجديد = max(600, round(القديم + K × (النتيجة − E)))
// الكتابة: transaction واحدة (firebase.js → fbRateGame) بتحسب من التصنيف اللي على السيرفر نفسه، وبتعمل users/{uid}/ratings/{gameId}
// في نفس العملية، والقواعد بتحد التغيير (−40..+40، عدد صحيح، وفي اتجاه النتيجة، ومرة واحدة لكل دور).
// تصنيف الخصم بيتقري من صفه في لوحة الصدارة (leaderboard/{uid}.r) — فيه الاسم المستعار بس.
// بيعتمد على: arena, currUser, esc, lang, render, arenaRefresh (+ live.js و archive.js)

const ERT = (ar, en) => lang === "en" ? en : ar;
const EcaRatingEngine = {
  START: 1000, FLOOR: 600, MAX_DELTA: 40,
  expected(me, opp) { return 1 / (1 + Math.pow(10, (Number(opp) - Number(me)) / 400)); },
  k(games) { return (Number(games) || 0) < 20 ? 32 : 24; },
  scoreOf(res) { return res === "win" ? 1 : res === "draw" ? 0.5 : 0; },
  next(old, opp, score, games) {
    old = Math.round(Number(old) || this.START);
    const raw = Math.round(old + this.k(games) * (score - this.expected(old, Number(opp) || this.START)));
    return Math.max(this.FLOOR, Math.max(old - this.MAX_DELTA, Math.min(old + this.MAX_DELTA, raw)));
  }
};
window.EcaRatingEngine = EcaRatingEngine;
function ecaRatingOf(u) { return u && Number.isInteger(u.ecaRating) ? u.ecaRating : EcaRatingEngine.START; }
function ecaRatingPeakOf(u) { return u && Number.isInteger(u.ecaPeakRating) ? u.ecaPeakRating : ecaRatingOf(u); }
window.ecaRatingOf = ecaRatingOf;

// ================= الشارة (البروفايل وتقرير ولي الأمر) =================
function ecaRatingBadgeHTML(u, compact) {
  if (!u || u.role !== "student") return "";
  const r = ecaRatingOf(u), n = Number(u.ecaRatedGamesCount) || 0, peak = ecaRatingPeakOf(u), me = typeof currUser === "function" ? currUser() : null;
  // الطالب وصل لرقم جديد (1100، 1200...): شهادة التصنيف من البروفايل
  const ms = !compact && me && me.id === u.id && peak >= 1100 && window.ecaCertOpenRating ? Math.floor(peak / 100) * 100 : 0;
  return `<span class="eca-elo-badge" title="${ERT("تصنيف الأكاديمية الرسمي", "Official academy rating")}">🏅 ${ERT("تصنيف ECA", "ECA rating")}: <b dir="ltr">${r}</b>${compact ? "" : `<i>${ERT(`أعلى تصنيف ${peak} • ${n} دور محسوب`, `Peak ${peak} • ${n} rated games`)}</i>`}</span>${ms ? ` <button type="button" onclick="ecaCertOpenRating(${ms})" class="tap eca-cert-cta">🎖️ ${ERT(`شهادة تصنيف ${ms}`, `Rating ${ms} certificate`)}</button>` : ""}`;
}
window.ecaRatingBadgeHTML = ecaRatingBadgeHTML;

// ================= تصنيف اللاعبين في الدور والبطولة =================
const ELO = {}, ELO_T = {}, ELO_GAME = {}, ELO_ASKED = {};
let eloWant = new Set(), eloTimer = 0;
function eloMine(uid) { const u = typeof currUser === "function" ? currUser() : null; return u && u.role === "student" && u.id === uid ? ecaRatingOf(u) : null; }
function eloOf(uid) { const m = eloMine(uid); return m != null ? m : ELO[uid] != null ? ELO[uid] : null; }
function eloPaint(id) { document.querySelectorAll(`[data-elo="${id}"]`).forEach(el => { if (!el.dataset.game) el.textContent = "🏅 " + eloOf(id); }); }
// الترتيب والقوايم: تصنيف عمره أقل من دقيقة بيتعرض من الكاش، والأقدم بيتجاب تاني
function eloFetchSoon(uid) {
  if (!/^[A-Za-z0-9]{10,40}$/.test(String(uid || "")) || !window.fbRatingsOf || (ELO[uid] != null && Date.now() - (ELO_T[uid] || 0) < 60000)) return;
  ELO_T[uid] = Date.now();
  eloWant.add(uid); clearTimeout(eloTimer);
  eloTimer = setTimeout(() => {
    const ids = [...eloWant]; eloWant = new Set();
    window.fbRatingsOf(ids).then(m => { Object.keys(m).forEach(id => { ELO[id] = m[id]; ELO_T[id] = Date.now(); eloPaint(id); }); }).catch(() => {});
  }, 60);
}
// تصنيف اللاعبين وقت بداية الدور (ده اللي بيتحسب بيه، حتى لو الخصم اتحدّث تصنيفه بعد كده):
// بيتجاب من السيرفر مرة لكل دور (مش من الكاش)، عشان دور بيبدأ بعد دور تاني على طول ياخد التصنيف الجديد
function eloSnap(d) {
  if (!d || !d.id || !d.w || !d.b || ELO_GAME[d.id] || ELO_ASKED[d.id] || !window.fbRatingsOf) return;
  ELO_ASKED[d.id] = true;
  window.fbRatingsOf([d.w, d.b], true).then(m => {
    [d.w, d.b].forEach(id => { if (m[id] != null) { ELO[id] = m[id]; ELO_T[id] = Date.now(); } });
    const w = eloOf(d.w), b = eloOf(d.b);
    ELO_GAME[d.id] = { w: w != null ? w : 1000, b: b != null ? b : 1000 };
    document.querySelectorAll(`[data-game="${d.id}"]`).forEach(el => { el.textContent = "🏅 " + ELO_GAME[d.id][el.dataset.elo === d.w ? "w" : "b"]; });
  }).catch(() => { ELO_ASKED[d.id] = false; });
}
// شارة صغيرة جنب اسم اللاعب (🏅 1016)
function ecaEloChip(uid, d) {
  if (!uid) return "";
  if (d) eloSnap(d); else eloFetchSoon(uid);
  const r = d ? (ELO_GAME[d.id] ? ELO_GAME[d.id][uid === d.w ? "w" : "b"] : null) : eloOf(uid);
  return `<span class="lv-elo" data-elo="${esc(uid)}"${d ? ` data-game="${esc(d.id)}"` : ""} dir="ltr" title="${ERT("تصنيف ECA", "ECA rating")}" aria-label="${ERT("تصنيف ECA", "ECA rating")} ${r == null ? "" : r}">🏅 ${r == null ? "…" : r}</span>`;
}
window.ecaEloChip = ecaEloChip;
window.ecaLiveRatingOf = (gid, c) => ELO_GAME[gid] ? ELO_GAME[gid][c] : null;

// ================= بعد الدور: المعاينة على طول + الكتابة في الخلفية بالترتيب =================
const RTP = {};          // gameId → { before, after, delta, final }
const RTA = new Set();   // العدّاد اتحرك مرة لكل دور
const RTQ = { busy: false, timer: 0, pending: 0 };
function rtqKey() { return "eca_rate_q_" + (window.fbMyUid ? fbMyUid() : ""); }
function rtqLoad() { try { const v = JSON.parse(localStorage.getItem(rtqKey()) || "[]"); return Array.isArray(v) ? v.filter(x => x && typeof x.gameId === "string" && (x.mode === "pvp" || x.mode === "arena")) : []; } catch (_) { return []; } }
function rtqSave(q) { try { localStorage.setItem(rtqKey(), JSON.stringify(q.slice(0, 30))); } catch (_) {} }
function rtPreview(it) {
  const u = currUser(); if (!u || u.role !== "student" || RTP[it.gameId]) return;
  const before = ecaRatingOf(u), after = EcaRatingEngine.next(before, it.opp, EcaRatingEngine.scoreOf(it.res), Number(u.ecaRatedGamesCount) || 0);
  RTP[it.gameId] = { before, after, delta: after - before, final: false, peak0: ecaRatingPeakOf(u) };
}
function ecaRateQueue(it) {
  const u = currUser(); if (!u || u.role !== "student" || !window.fbRateGame || !/^[A-Za-z0-9_-]{10,60}$/.test(String(it.gameId || ""))) return;
  // التصنيف للأدوار المباشرة بين طالبين بس (ودّي أو بطولة)، مش البوتات
  if (!(Number(it.opp) > 0) || !["pvp", "arena"].includes(it.mode)) return;
  rtPreview(it);
  const q = rtqLoad(); if (!q.some(x => x.gameId === it.gameId)) q.push({ gameId: it.gameId, mode: it.mode, res: it.res, opp: Math.round(it.opp), tries: 0 });
  rtqSave(q); rtqPump();
}
async function rtArchiveReady(gid) {
  let s = null; try { s = window.ecaArchiveWhenSaved ? await ecaArchiveWhenSaved(gid) : null; } catch (_) {}
  if (s === "saved" || s === "exists") return true;
  const c = window.ecaArchiveCached ? ecaArchiveCached(gid) : null;
  return !!(c && !c.pending);
}
async function rtqPump() {
  if (RTQ.busy || !window.fbRateGame) return;
  RTQ.busy = true; clearTimeout(RTQ.timer);
  try {
    const q = rtqLoad();
    while (q.length) {
      const it = q[0];
      // التصنيف بيتحسب بعد ما الدور يتسجّل في الأرشيف (القواعد بتقرا النتيجة من هناك)
      if (!(await rtArchiveReady(it.gameId))) { it.tries = (it.tries || 0) + 1; if (it.tries > 6) q.shift(); rtqSave(q); if (q.length) RTQ.timer = setTimeout(rtqPump, 15000); break; }
      let r = null;
      try {
        r = await window.fbRateGame({ gameId: it.gameId, mode: it.mode, opp: it.opp, res: it.res, calc: (before, games) => EcaRatingEngine.next(before, it.opp, EcaRatingEngine.scoreOf(it.res), games) });
      } catch (e) { r = { ok: false, code: e && e.code }; console.debug("Rating save postponed:", e && e.code); }
      if (r && r.ok) {
        const p = RTP[it.gameId] || {};
        RTP[it.gameId] = { before: r.before, after: r.after, delta: r.delta, final: true, peak0: p.peak0 != null ? p.peak0 : r.before };
        q.shift(); rtqSave(q); rtPaint(it.gameId);
        continue;
      }
      it.tries = (it.tries || 0) + 1;
      if (it.tries > 4) q.shift();
      rtqSave(q);
      if (q.length) RTQ.timer = setTimeout(rtqPump, 10000);
      break;
    }
  } finally { RTQ.busy = false; }
}
window.ecaRatePump = rtqPump;
// شهادة لما التصنيف يعدّي رقم جديد (1100، 1200، ...)
function rtMilestone(p) { if (!p || !p.final || p.after < 1100) return 0; const m = Math.floor(p.after / 100) * 100; return m > (p.peak0 || 0) ? m : 0; }
function ecaRateLineHTML(gid, outcome) {
  const p = RTP[gid]; if (!p) return "";
  const cls = p.delta > 0 ? "is-up" : p.delta < 0 ? "is-down" : "is-even", anim = !RTA.has(gid);
  const sign = p.delta > 0 ? "+" : p.delta < 0 ? "−" : "±";
  const ms = rtMilestone(p);
  const cert = ms && window.ecaCertOpenRating ? `<button type="button" onclick="ecaCertOpenRating(${ms})" class="tap eca-cert-cta">🎖️ ${ERT(`شهادة إنجاز: تصنيف ${ms}`, `Certificate: rating ${ms}`)}</button>` : "";
  if (anim) setTimeout(() => rtAnimate(gid), 30);
  return `<div class="eca-rate-line ${cls}" data-rate-gid="${esc(gid)}" role="status"><span>${p.delta < 0 ? "📉" : "📈"} ${ERT("تصنيف الأكاديمية", "Academy rating")}:</span>
    <b class="eca-rate-num" dir="ltr">${anim ? p.before : p.after}</b> <span class="eca-rate-delta" dir="ltr">(${sign}${Math.abs(p.delta)})</span>${cert}</div>`;
}
window.ecaRateLineHTML = ecaRateLineHTML;
function rtAnimate(gid) {
  const p = RTP[gid]; if (!p || RTA.has(gid)) return;
  RTA.add(gid);
  const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const set = v => document.querySelectorAll(`[data-rate-gid="${gid}"] .eca-rate-num`).forEach(el => { el.textContent = v; });
  if (reduce || typeof requestAnimationFrame !== "function") return set(p.after);
  const t0 = performance.now(), dur = 900;
  const step = t => {
    const q = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - q, 3), cur = RTP[gid] || p;
    set(Math.round(cur.before + (cur.after - cur.before) * e));
    if (q < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
// النتيجة النهائية من السيرفر وصلت: السطر بيتحدّث مكانه (من غير ما الصفحة تترسم تاني)
function rtPaint(gid) {
  const el = document.querySelector(`[data-rate-gid="${gid}"]`);
  if (!el) return;
  const t = document.createElement("template"); t.innerHTML = ecaRateLineHTML(gid).trim();
  if (t.content.firstElementChild) el.replaceWith(t.content.firstElementChild);
}

// دور مباشر خلص (live.js → lvFinish)
window.ecaRateAfterLive = function (d) {
  const L = arena.live, me = L.color; if (!d || !d.res || L.spect || !me || !["pvp", "arena"].includes(d.mode)) return;
  const res = d.res === "1/2-1/2" ? "draw" : d.res === (me === "w" ? "1-0" : "0-1") ? "win" : "loss", oc = me === "w" ? "b" : "w", oppUid = me === "w" ? d.b : d.w;
  const snap = ELO_GAME[d.id], go = opp => ecaRateQueue({ gameId: d.id, mode: d.mode, res, opp });
  if (snap && snap[oc] != null) return go(snap[oc]);
  // تصنيف الخصم لسه بيتجاب: الدور الجاي بيستنى (RTQ.pending) لحد ما ده يتسجّل
  RTQ.pending++;
  const late = opp => { RTQ.pending = Math.max(0, RTQ.pending - 1); go(opp); if (arena.live.id === d.id && typeof lvPaint === "function") lvPaint(true); };
  if (window.fbRatingsOf) window.fbRatingsOf([oppUid], true).then(m => late(m[oppUid] || 1000)).catch(() => late(ELO[oppUid] != null ? ELO[oppUid] : 1000)); else late(1000);
};
// الدور الجاي (الطابور، تحدي جديد، أو قبول تحدي) مايبدأش غير بعد ما تصنيف الدور اللي فات يتسجّل ويتنشر،
// عشان الخصم الجاي يقرا التصنيف الجديد مش القديم. لو النت بطيء بنكمّل بعد 8 ثواني (التصنيف بيتسجّل بعدين)
window.ecaRateSettled = (ms = 8000) => new Promise(resolve => {
  const t0 = Date.now();
  const check = () => {
    const left = rtqLoad().length + RTQ.pending;
    if ((!left && !RTQ.busy) || Date.now() - t0 > ms) return resolve(!left);
    setTimeout(check, 100);
  };
  check();
});
for (const name of ["lvQueue", "lvCreate", "lvQuick", "lvAccept"]) {
  const fn = window[name] || (typeof globalThis[name] === "function" ? globalThis[name] : null);
  if (typeof fn !== "function") continue;
  const wrapped = async function (...args) {
    if (name !== "lvQueue" || args[0]) await window.ecaRateSettled();
    return fn.apply(this, args);
  };
  if (name === "lvQueue") lvQueue = wrapped; else if (name === "lvCreate") lvCreate = wrapped; else if (name === "lvQuick") lvQuick = wrapped; else lvAccept = wrapped;
  window[name] = wrapped;
}
// أدوار البوت تدريبية: مش بتغيّر التصنيف (النجوم والخبرة و«اتعلم من أخطائك» شغالين عادي)
const RT_UNRATED = () => `<div class="eca-unrated" role="note">🤖 ${ERT("مباراة تدريبية (غير مصنفة - Unrated)", "Training game (Unrated)")}<span>${ERT("النجوم والخبرة بتتحسب، والتصنيف بيتغير في الأدوار المباشرة والبطولات بس", "Stars and XP still count; the rating changes only in live games and arenas")}</span></div>`;
if (typeof arenaPlayHTML === "function") {
  const _ap = arenaPlayHTML;
  arenaPlayHTML = function () {
    const h = _ap.apply(this, arguments), P = arena.play;
    if (!P || !P.game) return h;
    return h.replace('<div class="grid grid-cols-3 gap-2">', RT_UNRATED() + '<div class="grid grid-cols-3 gap-2">');
  };
}

// ================= تقرير ولي الأمر: التصنيف + آخر الأدوار =================
const RTH = {};
function rtHistory(sid) {
  const c = RTH[sid];
  if (c && (c.rows || c.busy) && Date.now() - c.t < 120000) return c.rows;
  RTH[sid] = { rows: c ? c.rows : null, busy: true, t: Date.now() };
  if (window.fbRatingHistory) window.fbRatingHistory(sid, 5).then(rows => { RTH[sid] = { rows, busy: false, t: Date.now() }; render(); })
    .catch(() => { RTH[sid] = { rows: [], busy: false, t: Date.now() }; });
  return RTH[sid].rows;
}
function rtParentCardHTML(stu) {
  const rows = rtHistory(stu.id) || [];
  const resTxt = r => r === "win" ? ERT("فوز", "Win") : r === "draw" ? ERT("تعادل", "Draw") : ERT("خسارة", "Loss");
  const modeTxt = m => m === "arena" ? ERT("بطولة", "Arena") : m === "bot" ? ERT("بوت", "Bot") : ERT("ودّي", "Friendly");
  const list = rows.length ? `<ul class="pr-elo-list">${rows.map(r => `<li><span>${esc(modeTxt(r.mode))} • ${esc(resTxt(r.res))}</span><b dir="ltr" class="${r.delta > 0 ? "is-up" : r.delta < 0 ? "is-down" : ""}">${r.delta > 0 ? "+" : ""}${Number(r.delta) || 0} → ${Number(r.after) || 0}</b></li>`).join("")}</ul>`
    : `<p class="pr-muted">${ERT("لسه مفيش أدوار محسوبة. التصنيف بيتحسب بعد الأدوار المباشرة والبطولات وأدوار البوتات.", "No rated games yet. The rating counts live games, arenas and bot games.")}</p>`;
  return `<section class="pr-card pr-elo"><h3>🏅 ${ERT("تصنيف ECA (تصنيف الأكاديمية الرسمي)", "ECA rating (official academy rating)")}</h3>
    <div class="pr-elo-top"><b dir="ltr">${ecaRatingOf(stu)}</b><span>${ERT(`أعلى تصنيف: ${ecaRatingPeakOf(stu)} • أدوار محسوبة: ${Number(stu.ecaRatedGamesCount) || 0}`, `Peak: ${ecaRatingPeakOf(stu)} • Rated games: ${Number(stu.ecaRatedGamesCount) || 0}`)}</span></div>${list}</section>`;
}
if (typeof renderParentReport === "function") {
  const _pr = renderParentReport;
  renderParentReport = function (stu) {
    const h = _pr.apply(this, arguments);
    if (!stu || !h || h.indexOf('<section class="pr-grid">') < 0) return h;
    return h.replace('<section class="pr-grid">', rtParentCardHTML(stu) + '<section class="pr-grid">');
  };
}

// أدوار اتقفلت والنت فاصل: بتتحسب أول ما الطالب يرجع
addEventListener("online", () => setTimeout(rtqPump, 2000));
setTimeout(() => { if (rtqLoad().length) rtqPump(); }, 6000);
