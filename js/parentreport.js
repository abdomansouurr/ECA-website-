// ECA — parentreport.js: تقرير ولي الأمر الاحترافي
// بيترجم بيانات اللعب لمؤشرات تعليمية: وقت التمرين الفعلي، ودقة التكتيك، وسرعة الحساب، وإتقان الأفكار،
// والتعلم من الغلطات، وواجبات الزعيم، والحضور، وتشجيع الكوتش. كل الرسوم SVG/CSS من غير مكتبات.
// بيتعرض في تاب «تقرير ولي الأمر» في حساب الطالب (بقفل اختياري 4 أرقام) وفي مركز الكوتش.

const PRL = (ar, en) => lang === "en" ? en : ar;
const PR_KEEP_DAYS = 70;

// ================= تسجيل البيانات =================
// وقت التمرين: كل 30 ثانية الصفحة ظاهرة والطالب لمس الشاشة أو الكيبورد في آخر دقيقة ونص
const PR_TICK = 30, PR_IDLE = 90000, PR_FLUSH = 180;
let prLastInput = Date.now(), prPending = 0;
["pointerdown", "keydown", "touchstart", "wheel"].forEach(ev => addEventListener(ev, () => { prLastInput = Date.now(); }, { passive: true }));
function prPrune(map) {
  const keys = Object.keys(map || {}).filter(k => /^\d{4}-\d{2}-\d{2}$/.test(k)).sort();
  const out = {};
  keys.slice(-PR_KEEP_DAYS).forEach(k => { out[k] = map[k]; });
  return out;
}
function prFlush() {
  const u = currUser();
  if (!u || u.role !== "student" || window.__authLoading || prPending < 30) return;
  const a = u.arena = u.arena || {}, day = todayISO(), tm = Object.assign({}, a.tm || {});
  tm[day] = Math.min(86400, (Number(tm[day]) || 0) + prPending);
  a.tm = prPrune(tm);
  prPending = 0;
  save();
}
setInterval(() => {
  const u = currUser();
  if (!u || u.role !== "student" || window.__authLoading || document.hidden || Date.now() - prLastInput > PR_IDLE) return;
  prPending += PR_TICK;
  if (prPending >= PR_FLUSH) prFlush();
}, PR_TICK * 1000);
document.addEventListener("visibilitychange", () => { if (document.hidden) prFlush(); });
addEventListener("pagehide", prFlush);
window.ecaTrainingFlush = prFlush;

// دقة وسرعة الألغاز: بتتسجل جوه نفس كتابة محاولة اللغز. لكل يوم [جرّب، حل، ثواني الحل، نقلات الحل]
const PR_MOTIFS = typeof LP_NAMES === "object" ? LP_NAMES : {};
{
  const _pl = puzLoad;
  puzLoad = async function () { const r = await _pl.apply(this, arguments); const Z = arena.puz; if (Z.status === "play" && Z.game) Z.t0 = Date.now(); return r; };
  const _mc = window.ecaMotifCount;
  window.ecaMotifCount = function (a, themes, solved) {
    if (_mc) _mc(a, themes, solved);
    const Z = arena.puz, day = todayISO(), ps = Object.assign({}, a.ps || {});
    const row = Array.isArray(ps[day]) && ps[day].length === 4 ? ps[day].map(n => Number(n) || 0) : [0, 0, 0, 0];
    row[0]++;
    if (solved) {
      row[1]++;
      const secs = Z.t0 ? Math.round((Date.now() - Z.t0) / 1000) : 0;
      if (secs > 0 && secs < 600) { row[2] += secs; row[3] += Math.max(1, Math.ceil((Z.sol || []).length / 2)); }
    }
    ps[day] = row;
    a.ps = prPrune(ps);
    // الأفكار اللي مش في ألبوم الكروت بتتعد هنا كمان عشان خريطة الإتقان
    const album = typeof ECA_CARDS !== "undefined" ? ECA_CARDS : [];
    (themes || []).filter(t => PR_MOTIFS[t] && !album.some(c => c.id === t)).forEach(t => {
      a.mot = a.mot && typeof a.mot === "object" ? a.mot : {};
      const m = a.mot[t] = Object.assign({ s: 0, t: 0 }, a.mot[t]);
      m.t++; if (solved) m.s++;
    });
  };
}

// ================= الحساب =================
function prWeekOf(iso) {
  const t = new Date(iso + "T12:00:00Z");
  t.setUTCDate(t.getUTCDate() - (t.getUTCDay() + 1) % 7);   // الأسبوع بيبدأ السبت زي لوحة الصدارة
  return t.toISOString().slice(0, 10);
}
function prAddDays(iso, n) { const t = new Date(iso + "T12:00:00Z"); t.setUTCDate(t.getUTCDate() + n); return t.toISOString().slice(0, 10); }
function prDayLabel(iso) { const [, m, d] = iso.split("-").map(Number); return d + "/" + m; }
function prDuration(secs) {
  const m = Math.round((Number(secs) || 0) / 60), h = Math.floor(m / 60), r = m % 60;
  return lang === "en" ? (h ? `${h}h ${r}m` : `${r}m`) : (h ? `${h} س ${r} د` : `${r} د`);
}
function prCompute(stu) {
  const a = stu.arena || {}, tm = a.tm || {}, ps = a.ps || {}, today = todayISO(), thisWeek = prWeekOf(today);
  const weeks = []; for (let i = 7; i >= 0; i--) weeks.push(prAddDays(thisWeek, -7 * i));
  const wk = Object.fromEntries(weeks.map(w => [w, { secs: 0, tried: 0, solved: 0, s: 0, mv: 0, days: new Set() }]));
  Object.keys(tm).forEach(d => { const w = wk[prWeekOf(d)]; if (w) w.secs += Number(tm[d]) || 0; });
  Object.keys(ps).forEach(d => { const w = wk[prWeekOf(d)], r = ps[d]; if (w && Array.isArray(r)) { w.tried += +r[0] || 0; w.solved += +r[1] || 0; w.s += +r[2] || 0; w.mv += +r[3] || 0; } });
  (a.days || []).forEach(d => { const w = wk[prWeekOf(String(d))]; if (w) w.days.add(String(d)); });
  const month = today.slice(0, 7), monthSecs = Object.keys(tm).filter(d => d.startsWith(month)).reduce((n, d) => n + (Number(tm[d]) || 0), 0);
  const cur = wk[thisWeek], prev = wk[weeks[6]];
  const acc = w => w.tried ? Math.round(w.solved / w.tried * 100) : null, spm = w => w.mv ? Math.round(w.s / w.mv * 10) / 10 : null;
  const from30 = prAddDays(today, -29), active30 = new Set((a.days || []).map(String).filter(d => d >= from30 && d <= today)).size;
  const mot = a.mot || {}, motifs = Object.keys(mot).filter(t => PR_MOTIFS[t] && (Number((mot[t] || {}).t) || 0) > 0)
    .map(t => ({ t, tried: Number(mot[t].t) || 0, solved: Number(mot[t].s) || 0 })).map(m => Object.assign(m, { pct: Math.round(m.solved / m.tried * 100) }))
    .sort((x, y) => y.tried - x.tried).slice(0, 10);
  const strong = motifs.filter(m => m.tried >= 3).sort((x, y) => y.pct - x.pct)[0] || null, weak = motifs.filter(m => m.tried >= 3).sort((x, y) => x.pct - y.pct)[0] || null;
  const life = { tried: Number(a.puzTried) || 0, solved: Number(a.puzSolved) || 0 };
  return { weeks, wk, thisWeek, cur, prev, monthSecs, acc, spm, active30, motifs, strong: strong && weak && strong.t !== weak.t ? strong : strong, weak: weak && strong && weak.t !== strong.t ? weak : null, life,
    lifeAcc: life.tried ? Math.round(life.solved / life.tried * 100) : null };
}

// ================= بيانات من السيرفر (الخزنة، الواجبات، تشجيع الكوتش) =================
const PRD = { sid: "", at: 0, data: null, busy: false };
function prData(stu) {
  if (PRD.sid !== stu.id) Object.assign(PRD, { sid: stu.id, at: 0, data: null, busy: false });
  if (!PRD.busy && Date.now() - PRD.at > 120000 && window.fbReportData) {
    PRD.busy = true;
    const sid = stu.id;
    window.fbReportData(sid, stu.group || "").then(d => { if (PRD.sid !== sid) return; PRD.data = d || { vault: null, drops: null, bosses: null }; })
      .catch(() => { if (PRD.sid === sid) PRD.data = { vault: null, drops: null, bosses: null }; })
      .finally(() => { if (PRD.sid !== sid) return; PRD.busy = false; PRD.at = Date.now(); if (document.querySelector(".eca-pr")) render(); });
  }
  return PRD.data;
}

// ================= الرسوم =================
function prBars(values, labels, opts) {
  const W = 340, H = 150, padB = 24, padT = 18, n = values.length, gw = W / n, max = Math.max(opts.min || 1, ...values.map(v => v || 0));
  let g = `<line x1="0" x2="${W}" y1="${H - padB}" y2="${H - padB}" stroke="var(--pr-line)"/>`;
  values.forEach((v, i) => {
    const h = (v || 0) / max * (H - padB - padT), x = i * gw + gw * 0.18, y = H - padB - h, last = i === n - 1;
    g += `<rect x="${x}" y="${y}" width="${gw * 0.64}" height="${Math.max(h, v ? 2 : 0)}" rx="4" fill="${last ? opts.color : opts.soft}"><title>${esc(labels[i])}: ${esc(opts.fmt(v))}</title></rect>`;
    if (v) g += `<text x="${x + gw * 0.32}" y="${y - 4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--pr-ink)">${esc(opts.fmt(v))}</text>`;
    g += `<text x="${i * gw + gw / 2}" y="${H - 7}" text-anchor="middle" font-size="11" fill="var(--pr-muted)">${esc(labels[i])}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" class="pr-chart" role="img" aria-label="${esc(opts.label)}">${g}</svg>`;
}
function prLine(values, labels, opts) {
  const W = 340, H = 150, padB = 24, padT = 18, padX = 14, n = values.length, gw = (W - 2 * padX) / Math.max(1, n - 1);
  const have = values.map((v, i) => [v, i]).filter(([v]) => v !== null && v !== undefined);
  let g = `<line x1="0" x2="${W}" y1="${H - padB}" y2="${H - padB}" stroke="var(--pr-line)"/>`;
  labels.forEach((l, i) => { g += `<text x="${padX + i * gw}" y="${H - 7}" text-anchor="middle" font-size="11" fill="var(--pr-muted)">${esc(l)}</text>`; });
  if (!have.length) return `<svg viewBox="0 0 ${W} ${H}" class="pr-chart" role="img" aria-label="${esc(opts.label)}">${g}<text x="${W / 2}" y="${H / 2}" text-anchor="middle" font-size="12" fill="var(--pr-muted)">${esc(PRL("لسه مفيش بيانات كفاية", "Not enough data yet"))}</text></svg>`;
  const hi = opts.max || Math.max(...have.map(([v]) => v)) * 1.15 || 1, lo = opts.min || 0;
  const yOf = v => padT + (H - padB - padT) * (1 - (v - lo) / Math.max(0.001, hi - lo));
  const pts = have.map(([v, i]) => [padX + i * gw, yOf(v), v, i]);
  g += `<polyline points="${pts.map(p => p[0] + "," + p[1]).join(" ")}" fill="none" stroke="${opts.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`;
  pts.forEach(p => { g += `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#fff" stroke="${opts.color}" stroke-width="2.5"><title>${esc(labels[p[3]])}: ${esc(opts.fmt(p[2]))}</title></circle><text x="${p[0]}" y="${p[1] - 9}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--pr-ink)">${esc(opts.fmt(p[2]))}</text>`; });
  return `<svg viewBox="0 0 ${W} ${H}" class="pr-chart" role="img" aria-label="${esc(opts.label)}">${g}</svg>`;
}
function prDonut(pct, color, label) {
  const r = 42, c = 2 * Math.PI * r, v = pct === null ? 0 : Math.max(0, Math.min(100, pct));
  return `<svg viewBox="0 0 110 110" class="pr-donut" role="img" aria-label="${esc(label)}"><circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--pr-line)" stroke-width="12"/>
    <circle cx="55" cy="55" r="${r}" fill="none" stroke="${color}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${(v / 100 * c).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 55 55)"/>
    <text x="55" y="61" text-anchor="middle" font-size="20" font-weight="800" fill="var(--pr-ink)">${pct === null ? "—" : v + "%"}</text></svg>`;
}

// ================= ملخص واتساب =================
function prSummaryText(stu) {
  const C = prCompute(stu), D = PRD.sid === stu.id ? PRD.data : null, s = calcStats(stu), en = lang === "en";
  const from = C.thisWeek, to = prAddDays(from, 6), acc = C.acc(C.cur), spm = C.spm(C.cur);
  const bosses = (D && D.bosses) || [], done = bosses.filter(b => b.done).length, open = bosses.filter(b => !b.done && b.dueMs > Date.now()).length;
  const drops = ((D && D.drops) || []).filter(d => d.atMs >= new Date(from + "T00:00:00").getTime()), praise = drops.find(d => d.note);
  const vault = D && D.vault, rate = vault && vault.total ? Math.round(vault.resolved / vault.total * 100) : null;
  const name = m => m ? (PR_MOTIFS[m.t] ? PR_MOTIFS[m.t][en ? 1 : 0] : m.t) : "";
  const lines = en ? [
    `📊 *Weekly report — Egypt Chess Academy*`, `👤 ${stu.name} • Step ${stu.level}`, `📅 Week: ${prDayLabel(from)} – ${prDayLabel(to)}`,
    `⏱️ Training time: ${prDuration(C.cur.secs)} (this month ${prDuration(C.monthSecs)})`,
    `🎯 Tactical accuracy: ${acc === null ? "—" : acc + "%"} (${C.cur.solved}/${C.cur.tried} puzzles)`,
    `⚡ Calculation speed: ${spm === null ? "—" : spm + " s per move"}`,
    C.strong ? `🧩 Strongest motif: ${name(C.strong)}${C.weak ? " • Needs practice: " + name(C.weak) : ""}` : "",
    rate !== null ? `🥋 Learning from mistakes: ${rate}% of past mistakes fixed` : "",
    bosses.length ? `👹 Boss homework: ${done} completed • ${open} in progress` : "",
    `📚 Lessons attended: ${s.attC}/${s.total} in Step ${stu.level}`,
    drops.length ? `🏅 Coach praise this week: ${drops.length}${praise ? ` — "${praise.note}"` : ""}` : ""
  ] : [
    `📊 *تقرير الأسبوع — Egypt Chess Academy*`, `👤 ${stu.name} • Step ${stu.level}`, `📅 الأسبوع: ${prDayLabel(from)} – ${prDayLabel(to)}`,
    `⏱️ وقت التمرين: ${prDuration(C.cur.secs)} (الشهر ده ${prDuration(C.monthSecs)})`,
    `🎯 دقة التكتيك: ${acc === null ? "—" : acc + "%"} (${C.cur.solved}/${C.cur.tried} لغز)`,
    `⚡ سرعة الحساب: ${spm === null ? "—" : spm + " ثانية لكل نقلة"}`,
    C.strong ? `🧩 أقوى فكرة: ${name(C.strong)}${C.weak ? " • محتاج تمرين: " + name(C.weak) : ""}` : "",
    rate !== null ? `🥋 التعلم من الأخطاء: ${rate}% من الغلطات القديمة اتصلّحت` : "",
    bosses.length ? `👹 واجب الزعيم: ${done} خلّص • ${open} شغّال` : "",
    `📚 الحضور: ${s.attC}/${s.total} درس في Step ${stu.level}`,
    drops.length ? `🏅 تشجيع الكوتش الأسبوع ده: ${drops.length}${praise ? ` — «${praise.note}»` : ""}` : ""
  ];
  return lines.filter(Boolean).join("\n");
}
function prWhatsApp(sid) {
  const stu = prStudent(sid);
  if (!stu) return;
  const text = prSummaryText(stu), staff = isStaffUser(currUser());
  const base = staff && typeof waLink === "function" ? waLink(stu.parentPhone) : "";
  window.open((base || "https://wa.me/") + "?text=" + encodeURIComponent(text), "_blank", "noopener");
}
window.prWhatsApp = prWhatsApp;
async function prCopy(sid) {
  const stu = prStudent(sid);
  if (!stu) return;
  try { await navigator.clipboard.writeText(prSummaryText(stu)); toast(PRL("الملخص اتنسخ", "Summary copied")); }
  catch (_) { toast(PRL("النسخ مش متاح على الجهاز ده", "Copying is not available on this device")); }
}
window.prCopy = prCopy;
function prPrint() {
  document.body.classList.add("eca-printing");
  const done = () => { document.body.classList.remove("eca-printing"); removeEventListener("afterprint", done); };
  addEventListener("afterprint", done);
  window.print();
  setTimeout(done, 1500);
}
window.prPrint = prPrint;
function prStudent(sid) { return (db.users || []).find(u => u.id === sid && u.role === "student") || null; }

// ================= التقرير =================
function renderParentReport(stu, opts) {
  opts = opts || {};
  const en = lang === "en", C = prCompute(stu), D = prData(stu), s = calcStats(stu);
  const loading = `<p class="pr-muted">${PRL("بنحمّل...", "Loading...")}</p>`;
  const wl = C.weeks.map(prDayLabel), acc = C.acc(C.cur), spm = C.spm(C.cur), prevSpm = C.spm(C.prev);
  const trend = spm !== null && prevSpm !== null ? (spm < prevSpm ? `<span class="pr-up">▲ ${PRL("أسرع", "faster")}</span>` : spm > prevSpm ? `<span class="pr-down">▼ ${PRL("أبطأ", "slower")}</span>` : "") : "";
  const kpi = (label, value, sub, extra) => `<div class="pr-kpi"><span class="pr-kpi-label">${label}</span><b class="pr-kpi-value">${value}</b><span class="pr-kpi-sub">${sub}${extra || ""}</span></div>`;
  const motifName = t => PR_MOTIFS[t] ? PR_MOTIFS[t][en ? 1 : 0] : t;
  const motifs = C.motifs.length ? `<ul class="pr-bars">${C.motifs.map(m => `<li><span class="pr-bar-name">${esc(motifName(m.t))}</span>
      <span class="pr-bar-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.pct}" aria-label="${esc(motifName(m.t))}"><i style="width:${m.pct}%;background:${m.pct >= 70 ? "var(--pr-green)" : m.pct >= 45 ? "var(--pr-gold)" : "var(--pr-red)"}"></i></span>
      <span class="pr-bar-val" dir="ltr">${m.pct}% <small>(${m.solved}/${m.tried})</small></span></li>`).join("")}</ul>`
    : `<p class="pr-muted">${PRL("الإحصائيات دي بتبدأ مع ألغاز «ألغاز على الرقعة» و«ألغاز الدروس».", "These start with the board puzzles and lesson puzzles.")}</p>`;
  const vault = D && D.vault, rate = vault && vault.total ? Math.round(vault.resolved / vault.total * 100) : null;
  const dojo = !D ? loading : !vault ? `<p class="pr-muted">—</p>` : `<div class="pr-dojo">${prDonut(rate, "var(--pr-teal)", PRL("نسبة الغلطات اللي اتصلّحت", "Share of mistakes fixed"))}
      <div><p><b>${vault.resolved}</b> ${PRL("من", "of")} <b>${vault.total}</b> ${PRL("غلطة قديمة اتحلّت صح بعد مراجعتها.", "past mistakes were solved correctly on review.")}</p>
      <p class="pr-muted">${PRL("الدوجو بيرجّع كل لغز غلط بعد نص ساعة، ويوم، و3 أيام، وأسبوع لحد ما يتحل.", "The Dojo brings each missed puzzle back after 30 minutes, a day, 3 days and a week until it is solved.")}</p></div></div>`;
  const bosses = !D ? loading : !(D.bosses || []).length ? `<p class="pr-muted">${PRL("مفيش واجبات زعيم لحد دلوقتي.", "No boss homework yet.")}</p>`
    : `<table class="pr-table"><thead><tr><th>${PRL("الواجب", "Homework")}</th><th>${PRL("التقدّم", "Progress")}</th><th>${PRL("الحالة", "Status")}</th></tr></thead><tbody>${D.bosses.slice(0, 8).map(b => {
      const total = b.puzzles.length, st = b.done ? `<span class="pr-pill pr-ok">✓ ${PRL("خلّص", "Completed")}</span>` : b.dueMs <= Date.now() ? `<span class="pr-pill pr-bad">${PRL("ما خلصش", "Missed")}</span>` : `<span class="pr-pill pr-wait">${PRL("شغّال", "Pending")}</span>`;
      return `<tr><td>${esc(b.title)}<small class="pr-muted"> • ${new Date(b.dueMs).toLocaleDateString(en ? "en-GB" : "ar-EG", { day: "numeric", month: "short" })}</small></td><td dir="ltr">${b.done ? total : b.solved}/${total}</td><td>${st}</td></tr>`;
    }).join("")}</tbody></table>`;
  const dropIcon = d => d.kind === "chest" ? "🎁" : d.stars ? "⭐" : "⚡", dropVal = d => d.kind === "chest" ? PRL("صندوق كنز", "Mystery chest") : d.stars ? "+" + d.stars + " ⭐" : "+" + d.xp + " XP";
  const praise = !D ? loading : !(D.drops || []).length ? `<p class="pr-muted">${PRL("لسه مفيش تشجيع من الكوتش في الحصص.", "No coach praise from class yet.")}</p>`
    : `<ul class="pr-feed">${D.drops.slice(0, 8).map(d => `<li><span class="pr-feed-icon" aria-hidden="true">${dropIcon(d)}</span><div><b>${esc(dropVal(d))}</b>${d.note ? ` <span>«${esc(d.note)}»</span>` : ""}<small class="pr-muted">${d.atMs ? new Date(d.atMs).toLocaleDateString(en ? "en-GB" : "ar-EG", { day: "numeric", month: "short" }) : ""}</small></div></li>`).join("")}</ul>`;
  const cnt = (o, step) => Object.keys(o || {}).filter(k => o[k] && k.split("-")[0] === String(step)).length, exams = stu.examState || {};
  const steps = STEPS.filter(x => x.lessons.length).map(x => { const e = exams[x.step], cur = Number(stu.level) === x.step;
    return `<tr class="${cur ? "pr-cur" : ""}"><td>${cur ? "▶ " : ""}Step ${x.step}</td><td dir="ltr">${cnt(stu.att, x.step)}/${x.lessons.length}</td><td dir="ltr">${cnt(stu.hw, x.step)}/${x.lessons.length}</td><td>${e ? (e.status === "passed" ? `<span class="pr-pill pr-ok">✓ ${esc(e.score)}%</span>` : `<span class="pr-pill pr-bad">${esc(e.score)}%</span>`) : x.step < Number(stu.level) ? "✓" : "—"}</td></tr>`; }).join("");
  const recent = (STEPS.find(x => x.step === Number(stu.level)) || { lessons: [] }).lessons.map((l, i) => ({ t: l.t, att: !!(stu.att || {})[stu.level + "-" + i], hw: !!(stu.hw || {})[stu.level + "-" + i] }));
  const certs = stu.certificates || [];
  const actions = `<div class="pr-actions eca-pr-noprint">
      <button type="button" onclick="prWhatsApp('${esc(stu.id)}')" class="pr-btn pr-btn-wa">💬 ${PRL("ملخص واتساب", "WhatsApp summary")}</button>
      <button type="button" onclick="prCopy('${esc(stu.id)}')" class="pr-btn">📋 ${PRL("انسخ الملخص", "Copy summary")}</button>
      <button type="button" onclick="prPrint()" class="pr-btn">🖨️ ${PRL("اطبع / احفظ PDF", "Print / save PDF")}</button>
      ${opts.back ? `<button type="button" onclick="${opts.back}" class="pr-btn">${PRL("رجوع", "Back")}</button>` : ""}
    </div>`;
  return `<article class="eca-pr" dir="${en ? "ltr" : "rtl"}" aria-label="${PRL("تقرير ولي الأمر", "Parent report")}">
    <header class="pr-head">
      <div class="pr-brand"><img src="img/eca-logo.jpg" alt="Egypt Chess Academy" class="pr-logo" /><div><span class="pr-eyebrow">Egypt Chess Academy</span><h2>${PRL("تقرير متابعة ولي الأمر", "Parent Progress Report")}</h2></div></div>
      <div class="pr-who"><b>${esc(stu.name || "")}</b><span>Step ${esc(stu.level || 1)}${stu.group ? " • " + esc(stu.group) : ""}${stu.coachName ? " • " + esc(stu.coachName) : ""}</span>
        <span dir="ltr">${prDayLabel(C.thisWeek)} – ${prDayLabel(prAddDays(C.thisWeek, 6))}</span></div>
    </header>
    ${actions}
    <section class="pr-kpis">
      ${kpi(PRL("وقت التمرين الفعلي", "Focused training"), prDuration(C.cur.secs), PRL("الأسبوع ده • الشهر: ", "This week • Month: ") + prDuration(C.monthSecs))}
      ${kpi(PRL("دقة التكتيك", "Tactical accuracy"), acc === null ? "—" : acc + "%", PRL(`الأسبوع ده (${C.cur.solved}/${C.cur.tried}) • الكلي ${C.lifeAcc === null ? "—" : C.lifeAcc + "%"}`, `This week (${C.cur.solved}/${C.cur.tried}) • Overall ${C.lifeAcc === null ? "—" : C.lifeAcc + "%"}`))}
      ${kpi(PRL("سرعة الحساب", "Calculation speed"), spm === null ? "—" : spm + PRL(" ث", "s"), PRL("ثانية لكل نقلة في الحل ", "seconds per solving move "), trend)}
      ${kpi(PRL("أيام التمرين", "Active days"), C.active30 + "/30", PRL("في آخر 30 يوم", "in the last 30 days"))}
    </section>
    <section class="pr-grid">
      <div class="pr-card"><h3>${PRL("ساعات التمرين أسبوعيًا", "Weekly training time")}</h3>${prBars(C.weeks.map(w => Math.round(C.wk[w].secs / 60)), wl, { color: "var(--pr-navy)", soft: "#c7d2fe", min: 30, fmt: v => v >= 60 ? (Math.round(v / 6) / 10) + (en ? "h" : "س") : v + (en ? "m" : "د"), label: PRL("رسم بياني لدقائق التمرين في آخر 8 أسابيع", "Training minutes over the last 8 weeks") })}</div>
      <div class="pr-card"><h3>${PRL("دقة التكتيك أسبوعيًا", "Weekly tactical accuracy")}</h3>${prLine(C.weeks.map(w => C.acc(C.wk[w])), wl, { color: "var(--pr-green)", max: 100, min: 0, fmt: v => v + "%", label: PRL("رسم بياني لدقة حل الألغاز", "Puzzle accuracy trend") })}</div>
      <div class="pr-card"><h3>${PRL("سرعة الحساب (ثانية لكل نقلة)", "Calculation speed (seconds per move)")}</h3>${prLine(C.weeks.map(w => C.spm(C.wk[w])), wl, { color: "var(--pr-gold)", fmt: v => v + (en ? "s" : "ث"), label: PRL("رسم بياني لسرعة الحساب", "Calculation speed trend") })}<p class="pr-muted">${PRL("كل ما الرقم يقل يبقى بيحسب أسرع.", "Lower means faster calculation.")}</p></div>
      <div class="pr-card"><h3>${PRL("التعلم من الأخطاء (الدوجو)", "Learning from mistakes (Dojo)")}</h3>${dojo}</div>
    </section>
    <section class="pr-card"><h3>${PRL("إتقان أفكار المنهج (Stappenmethode)", "Curriculum mastery (Stappenmethode)")}</h3>
      ${C.strong ? `<p class="pr-muted">${PRL("أقوى فكرة", "Strongest")}: <b>${esc(motifName(C.strong.t))}</b>${C.weak ? ` • ${PRL("محتاج تمرين", "Needs practice")}: <b>${esc(motifName(C.weak.t))}</b>` : ""}</p>` : ""}${motifs}</section>
    <section class="pr-grid">
      <div class="pr-card"><h3>${PRL("واجب الزعيم", "Boss homework")}</h3>${bosses}</div>
      <div class="pr-card"><h3>${PRL("تشجيع الكوتش في الحصة", "Coach praise in class")}</h3>${praise}</div>
    </section>
    <section class="pr-grid">
      <div class="pr-card"><h3>${PRL("الحضور والواجبات", "Attendance & homework")} — Step ${esc(stu.level)}</h3>
        <div class="pr-split"><div><span class="pr-muted">${PRL("الحضور", "Attendance")}</span><b>${s.attC}/${s.total}</b><span class="pr-bar-track"><i style="width:${s.attP}%;background:var(--pr-navy)"></i></span></div>
          <div><span class="pr-muted">${PRL("الواجبات", "Homework")}</span><b>${s.hwC}/${s.total}</b><span class="pr-bar-track"><i style="width:${s.hwP}%;background:var(--pr-gold)"></i></span></div></div>
        <ul class="pr-lessons">${recent.map(l => `<li><span>${esc(l.t)}</span><span>${l.att ? `<span class="pr-pill pr-ok">${PRL("حضر", "Attended")}</span>` : `<span class="pr-pill">${PRL("لسه", "Not yet")}</span>`}${l.hw ? ` <span class="pr-pill pr-ok">${PRL("واجب ✓", "HW ✓")}</span>` : ""}</span></li>`).join("")}</ul></div>
      <div class="pr-card"><h3>${PRL("التقدّم في المنهج", "Curriculum progress")}</h3>
        <table class="pr-table"><thead><tr><th>Step</th><th>${PRL("حضر", "Lessons")}</th><th>${PRL("الواجب", "Homework")}</th><th>${PRL("الامتحان", "Exam")}</th></tr></thead><tbody>${steps}</tbody></table>
        ${certs.length ? `<div class="pr-certs">${certs.map((c, i) => `<div><b>🎓 ${PRL("شهادة", "Certificate")} Step ${esc(c.step)}</b> <small class="pr-muted">${esc(c.score)}% • ${esc(c.date)}</small>${typeof previewAndDownloadCert === "function" && !isStaffUser(currUser()) ? ` <button type="button" onclick="previewAndDownloadCert('${esc(stu.id)}', ${i}, false)" class="pr-btn pr-btn-sm eca-pr-noprint">PDF</button>` : ""}</div>`).join("")}</div>` : ""}</div>
    </section>
    <footer class="pr-foot">${PRL("التقرير ده اتعمل تلقائيًا من نشاط الطالب على منصة الأكاديمية", "This report is generated automatically from the student's activity on the academy platform")} • ${new Date().toLocaleDateString(en ? "en-GB" : "ar-EG")}</footer>
  </article>`;
}
window.renderParentReport = renderParentReport;

// ================= القفل الاختياري برمز 4 أرقام (على الجهاز ده بس) =================
async function prHash(pin) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("eca-parent|" + pin)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join(""); }
function prPinKey(u) { return "ECA_PARENT_PIN_" + u.id; }
function prPinGet(u) { try { return localStorage.getItem(prPinKey(u)) || ""; } catch (_) { return ""; } }
function prUnlocked(u) { try { return sessionStorage.getItem("ECA_PARENT_OK_" + u.id) === "1"; } catch (_) { return true; } }
async function prPinSet() {
  const u = currUser(), a = (document.getElementById("prPinNew") || {}).value || "", b = (document.getElementById("prPinNew2") || {}).value || "";
  if (!u || !/^\d{4}$/.test(a)) return toast(PRL("الرمز 4 أرقام.", "The PIN is 4 digits."));
  if (a !== b) return toast(PRL("الرمزين مش زي بعض.", "The PINs do not match."));
  try { localStorage.setItem(prPinKey(u), await prHash(a)); sessionStorage.setItem("ECA_PARENT_OK_" + u.id, "1"); } catch (_) { return toast(PRL("الجهاز ده مش بيحفظ الرمز.", "This device cannot save the PIN.")); }
  toast(PRL("🔒 التقرير اتقفل بالرمز على الجهاز ده", "🔒 The report is locked with the PIN on this device")); render();
}
window.prPinSet = prPinSet;
async function prPinTry() {
  const u = currUser(), v = (document.getElementById("prPin") || {}).value || "";
  if (!u) return;
  if (await prHash(v) !== prPinGet(u)) { toast(PRL("الرمز غلط", "Wrong PIN")); return; }
  try { sessionStorage.setItem("ECA_PARENT_OK_" + u.id, "1"); } catch (_) {}
  render();
}
window.prPinTry = prPinTry;
async function prPinClear() {
  const u = currUser();
  if (!u || !confirm(PRL("تشيل القفل من التقرير على الجهاز ده؟", "Remove the PIN from this device?"))) return;
  try { localStorage.removeItem(prPinKey(u)); } catch (_) {}
  render();
}
window.prPinClear = prPinClear;
function prGateHTML(u) {
  const inp = "pr-input";
  if (prPinGet(u) && !prUnlocked(u)) return `<article class="eca-pr pr-gate" dir="${lang === "en" ? "ltr" : "rtl"}"><div class="pr-card"><h2>🔒 ${PRL("تقرير ولي الأمر", "Parent report")}</h2>
    <p class="pr-muted">${PRL("اكتب رمز ولي الأمر (4 أرقام).", "Enter the 4-digit parent PIN.")}</p>
    <input id="prPin" type="password" inputmode="numeric" maxlength="4" autocomplete="off" aria-label="${PRL("رمز ولي الأمر", "Parent PIN")}" onkeydown="if(event.key==='Enter')prPinTry()" class="${inp}" dir="ltr" />
    <button type="button" onclick="prPinTry()" class="pr-btn pr-btn-main">${PRL("افتح التقرير", "Open the report")}</button>
    <p class="pr-muted">${PRL("نسيت الرمز؟ امسح بيانات الموقع من إعدادات المتصفح، أو اطلب التقرير من الكوتش.", "Forgot it? Clear this site's data in the browser settings, or ask the coach for the report.")}</p></div></article>`;
  return "";
}
function prPinPanelHTML(u) {
  const has = !!prPinGet(u);
  return `<details class="pr-pin eca-pr-noprint"><summary>${has ? "🔒 " + PRL("التقرير مقفول برمز على الجهاز ده", "This report is PIN-locked on this device") : "🔓 " + PRL("اقفل التقرير برمز 4 أرقام (اختياري)", "Lock the report with a 4-digit PIN (optional)")}</summary>
    ${has ? `<button type="button" onclick="prPinClear()" class="pr-btn">${PRL("شيل القفل", "Remove the PIN")}</button>`
      : `<div class="pr-pin-row"><input id="prPinNew" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password" placeholder="••••" aria-label="${PRL("الرمز", "PIN")}" class="pr-input" dir="ltr" />
        <input id="prPinNew2" type="password" inputmode="numeric" maxlength="4" autocomplete="new-password" placeholder="••••" aria-label="${PRL("أكّد الرمز", "Confirm the PIN")}" class="pr-input" dir="ltr" />
        <button type="button" onclick="prPinSet()" class="pr-btn pr-btn-main">${PRL("اقفل", "Lock")}</button></div>
      <p class="pr-muted">${PRL("القفل على الجهاز ده بس، عشان الطالب ما يفتحش التقرير بالغلط. مش بديل لكلمة سر الحساب.", "The lock is on this device only, so the student does not open the report by accident. It does not replace the account password.")}</p>`}
  </details>`;
}

// ================= الأماكن =================
{
  const li = typeof liCardHTML === "function" ? liCardHTML : null;
  renderStudentParentView = function (u) {
    prFlush();
    return prGateHTML(u) || `<div class="space-y-5">${renderParentReport(u)}${prPinPanelHTML(u)}${li ? li(u, false) : ""}</div>`;
  };
}
// مركز الكوتش: تقرير أي طالب، والملخص بيتبعت لرقم ولي الأمر على واتساب
let prCoachSid = "";
function prCoachOpen() { const v = (document.getElementById("prCoachPick") || {}).value || ""; if (!prStudent(v)) return toast(PRL("اختار طالب.", "Choose a student.")); prCoachSid = v; render(); scrollTo(0, 0); }
window.prCoachOpen = prCoachOpen;
function prCoachClose() { prCoachSid = ""; render(); }
window.prCoachClose = prCoachClose;
{
  const _cv = renderCommandView;
  renderCommandView = function (u) {
    const stu = prCoachSid && prStudent(prCoachSid);
    if (stu) return renderParentReport(stu, { back: "prCoachClose()" });
    const html = _cv(u), studs = (db.users || []).filter(x => x.role === "student").sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "ar"));
    const card = `<section class="gold-card rounded-2xl p-5 space-y-3"><h3 class="font-display font-bold text-lg text-yellow-300">📊 ${PRL("تقارير أولياء الأمور", "Parent reports")}</h3>
      <p class="text-xs text-gray-400">${PRL("افتح تقرير أي طالب وابعت ملخص الأسبوع لولي الأمر على واتساب بضغطة.", "Open any student's report and send the weekly summary to the parent on WhatsApp in one tap.")}</p>
      <div class="flex gap-2"><select id="prCoachPick" aria-label="${PRL("الطالب", "Student")}" class="flex-1 min-h-[44px] rounded-lg bg-black border border-yellow-500/40 px-2 text-sm text-white">${studs.map(x => `<option value="${esc(x.id)}">${esc(x.name || "")}${x.group ? " • " + esc(x.group) : ""}</option>`).join("")}</select>
        <button type="button" onclick="prCoachOpen()" class="tap rounded-lg px-3 text-xs font-bold gold-btn">${PRL("افتح التقرير", "Open report")}</button></div></section>`;
    const at = html.indexOf('<div class="space-y-5">', html.indexOf('lg:grid-cols-2'));
    return at < 0 ? html + card : html.slice(0, at + 23) + card + html.slice(at + 23);
  };
  const _r = render;
  render = function () { if (tab !== "command" && prCoachSid) prCoachSid = ""; return _r.apply(this, arguments); };
}
