// ECA — assist.js: الكوتش والأهل وأول مرة والراحة
// 1) «محتاجين انتباهك» في مركز الكوتش  2) سطر إنجاز وتشجيع في ملخص واتساب لولي الأمر
// 3) جولة أول مرة للطالب  4) يرجع لمكانه لما يفتح تاني  5) إعدادات الراحة (رقعة أكبر، ألوان لعمى الألوان، حركة أقل، خط أكبر)

const AS = (ar, en) => lang === "en" ? en : ar;
const asLS = { get(k) { try { return localStorage.getItem(k); } catch (_) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (_) {} } };
const asMotif = t => (window.lpThemeName ? lpThemeName(t) : t);

// ================= 1) محتاجين انتباهك (للكوتش) =================
// من البيانات اللي الكوتش شايفها أصلاً: آخر يوم تمرين، ونسبة الصح في كل فكرة تكتيكية
function asAlerts() {
  const todayT = Date.parse(todayISO() + "T12:00:00Z"), out = [];
  for (const s of cmdStudents()) {
    const a = s.arena || {}, days = (a.days || []).map(String).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort(), last = days[days.length - 1];
    const away = last ? Math.round((todayT - Date.parse(last + "T12:00:00Z")) / 864e5) : null;
    if (away === null) out.push({ s, sev: 1, icon: "🌱", text: AS("لسه ما بدأش يتمرّن على المنصة", "Has not started training yet") });
    else if (away >= 5) out.push({ s, sev: 10 + away, icon: "💤", text: AS(`ما اتمرّنش من ${away} يوم`, `No training for ${away} days`) });
    let weak = null;
    for (const t of Object.keys(a.mot || {})) {
      const tried = Number(a.mot[t].t) || 0, pct = tried ? (Number(a.mot[t].s) || 0) / tried : 1;
      if (tried >= 6 && pct < 0.5 && (!weak || pct < weak.pct)) weak = { t, pct, tried };
    }
    if (weak) out.push({ s, sev: 5 + (1 - weak.pct) * 5, icon: "🧩", text: AS(`بيغلط كتير في ${asMotif(weak.t)}: ${Math.round(weak.pct * 100)}% صح من ${weak.tried} لغز`, `Struggling with ${asMotif(weak.t)}: ${Math.round(weak.pct * 100)}% right of ${weak.tried}`) });
  }
  return out.sort((x, y) => y.sev - x.sev);
}
window.asAlerts = asAlerts;
let asAlertsAll = false;
function asAlertsMore() { asAlertsAll = !asAlertsAll; render(); }
window.asAlertsMore = asAlertsMore;
function asCheer(id) {
  if (!cmdStudents().some(s => s.id === id)) return;
  CMD.dropTo = "s:" + id; render();
  const el = document.getElementById("cmdDropTo");
  if (el) { el.scrollIntoView({ behavior: "smooth", block: "center" }); el.focus(); }
  toast(AS("اختار الجايزة وابعتها 🎁", "Pick the reward and send it 🎁"));
}
window.asCheer = asCheer;
function asReport(id) { if (!prStudent(id)) return; prCoachSid = id; render(); scrollTo(0, 0); }
window.asReport = asReport;
function asAlertsHTML() {
  const list = asAlerts(), shown = asAlertsAll ? list : list.slice(0, 6);
  const row = x => `<li class="flex flex-wrap items-center gap-2 py-2 border-b border-yellow-500/10">
      <span class="text-xl shrink-0" aria-hidden="true">${x.icon}</span>
      <div class="min-w-0 flex-1"><b class="block text-sm text-white truncate">${esc(x.s.name || "")}</b><span class="block text-xs text-gray-400">${esc(x.text)}${x.s.group ? " • " + esc(x.s.group) : ""}</span></div>
      <button type="button" onclick="asCheer('${esc(x.s.id)}')" title="${esc(AS("ابعتله تشجيع", "Send a cheer"))}" aria-label="${esc(AS("ابعتله تشجيع", "Send a cheer"))}" class="tap rounded-lg px-2 text-sm bg-zinc-800 border border-yellow-500/30">🎁</button>
      <button type="button" onclick="asReport('${esc(x.s.id)}')" title="${esc(AS("التقرير", "Report"))}" aria-label="${esc(AS("التقرير", "Report"))}" class="tap rounded-lg px-2 text-sm bg-zinc-800 border border-yellow-500/30">📊</button>
      ${x.s.parentPhone ? `<button type="button" onclick="prWhatsApp('${esc(x.s.id)}')" title="${esc(AS("ملخص لولي الأمر على واتساب", "WhatsApp summary to the parent"))}" aria-label="${esc(AS("ملخص لولي الأمر على واتساب", "WhatsApp summary to the parent"))}" class="tap rounded-lg px-2 text-sm bg-zinc-800 border border-yellow-500/30">📲</button>` : ""}
    </li>`;
  return `<section id="asAlerts" class="gold-card rounded-2xl p-5 space-y-2">
    <h3 class="font-display font-bold text-lg text-yellow-300">🔔 ${AS("محتاجين انتباهك", "Need your attention")}</h3>
    ${list.length ? `<ul>${shown.map(row).join("")}</ul>
      ${list.length > 6 ? `<button type="button" onclick="asAlertsMore()" class="tap w-full rounded-lg text-xs font-bold bg-zinc-900 text-gray-300 border border-yellow-500/20">${asAlertsAll ? AS("أقل", "Show less") : AS(`كل التنبيهات (${list.length})`, `All alerts (${list.length})`)}</button>` : ""}`
      : `<p class="text-sm text-gray-400">${AS("كل الطلاب ماشيين كويس 👌", "Every student is doing fine 👌")}</p>`}
  </section>`;
}
{
  const _cv = renderCommandView;
  renderCommandView = function (u) {
    const html = _cv.apply(this, arguments);
    return prCoachSid || !isStaffUser(u) ? html : `<div class="space-y-5">${asAlertsHTML()}${html}</div>`;
  };
}

// ================= 2) ملخص واتساب: إنجاز الأسبوع وحاجة يشجّعه عليها =================
function asHighlight(stu, C) {
  const a = stu.arena || {}, n = C.cur.solved, d = C.cur.days.size, name = m => asMotif(m.t);
  if (a.evc && typeof ecaWeekKey === "function" && a.evc === ecaWeekKey()) return AS("كسب حدث الأسبوع في الأكاديمية 🎪", "won this week's academy event 🎪");
  if (n >= 20) return AS(`حل ${n} لغز الأسبوع ده 🧩`, `solved ${n} puzzles this week 🧩`);
  if (d >= 5) return AS(`اتمرّن ${d} أيام الأسبوع ده 🔥`, `trained ${d} days this week 🔥`);
  if (C.strong) return AS(`أقوى حاجة عنده ${name(C.strong)} 💪`, `is strongest at ${name(C.strong)} 💪`);
  if (n) return AS(`حل ${n} لغز الأسبوع ده`, `solved ${n} puzzles this week`);
  return "";
}
function asEncourage(C) {
  if (C.weak) return AS(`💬 شجّعه يحل ألغاز ${asMotif(C.weak.t)} كام دقيقة كل يوم.`, `💬 Encourage a few minutes of ${asMotif(C.weak.t)} puzzles each day.`);
  if (C.cur.days.size < 3) return AS("💬 شجّعه يتمرّن 10 دقايق كل يوم، الاستمرار أهم من الوقت.", "💬 Encourage 10 minutes a day; steady practice matters more than long sessions.");
  return AS("💬 قوله برافو! هو ماشي كويس جداً 👏", "💬 Tell them well done! They are doing great 👏");
}
{
  const _ps = prSummaryText;
  prSummaryText = function (stu) {
    const lines = _ps.apply(this, arguments).split("\n"), C = prCompute(stu), hl = asHighlight(stu, C);
    if (hl) lines.splice(3, 0, `🌟 ${AS("إنجاز الأسبوع", "Highlight")}: ${stu.name} ${hl}`);
    lines.push(asEncourage(C));
    return lines.join("\n");
  };
}

// ================= 3) جولة أول مرة (3 خطوات، مرة واحدة، تقدر تتخطاها) =================
const AS_TOUR = [
  { icon: "♞", ar: ["أهلاً يا بطل!", "هنا هتتعلّم شطرنج بالألغاز: كل لغز فيه نقلة سحرية، وانت هتلاقيها."], en: ["Welcome, champion!", "Here you learn chess with puzzles: each one hides a winning move for you to find."] },
  { icon: "⭐", ar: ["كل لغز = نجوم", "النجوم بتفتح بوتات وإطارات وألقاب في المتجر، وبتطلّعك في الترتيب."], en: ["Every puzzle = stars", "Stars unlock bots, frames and titles in the shop, and lift you up the leaderboard."] },
  { icon: "▶", ar: ["مش عارف تبدأ منين؟", "دوس «العب دلوقتي» وهو يختارلك أحسن حاجة تعملها دلوقتي."], en: ["Not sure where to start?", "Tap «Play now» and it picks the best thing to do right now."] }
];
let asTourStep = 0;
function asTourKey(u) { return "ECA_TOUR_" + String((u && u.id) || ""); }
function asTourDue() {
  const u = currUser();
  if (!u || u.role !== "student" || window.__authLoading || tab !== "home" || asLS.get(asTourKey(u)) === "1" || document.getElementById("ecaTour")) return false;
  const a = u.arena || {};
  return (Number(a.puzTried) || 0) < 3 && (a.days || []).length <= 1 && !(window.ecaIsPlaying && ecaIsPlaying());
}
function asTourShow() {
  const old = document.getElementById("ecaTour"), s = AS_TOUR[asTourStep], en = lang === "en", last = asTourStep === AS_TOUR.length - 1;
  const el = old || document.createElement("div");
  el.id = "ecaTour"; el.className = "eca-spin-modal"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "ecaTourTitle");
  el.innerHTML = `<div class="gold-card rounded-2xl p-6 w-full max-w-sm text-center space-y-3">
      <div class="eca-tour-icon" aria-hidden="true">${s.icon}</div>
      <h2 id="ecaTourTitle" class="font-display font-bold text-xl text-yellow-300">${esc((en ? s.en : s.ar)[0])}</h2>
      <p class="text-sm text-gray-200">${esc((en ? s.en : s.ar)[1])}</p>
      <div class="flex justify-center gap-1.5" aria-hidden="true">${AS_TOUR.map((_, i) => `<span class="eca-tour-dot${i === asTourStep ? " is-on" : ""}"></span>`).join("")}</div>
      <div class="flex gap-2 pt-1">
        <button type="button" onclick="asTourEnd(false)" class="tap flex-1 rounded-xl text-xs font-bold bg-zinc-800 text-white border border-yellow-500/30">${AS("تخطّي", "Skip")}</button>
        <button type="button" onclick="${last ? "asTourEnd(true)" : "asTourNext()"}" class="tap flex-1 rounded-xl text-sm font-bold gold-btn">${last ? "▶ " + AS("يلا نبدأ", "Let's go") : AS("التالي", "Next")}</button>
      </div></div>`;
  if (!old) document.body.appendChild(el);
  const go = el.querySelector(".gold-btn"); if (go) go.focus();
}
function asTourNext() { asTourStep = Math.min(AS_TOUR.length - 1, asTourStep + 1); asTourShow(); }
function asTourEnd(play) {
  asLS.set(asTourKey(currUser()), "1");
  const el = document.getElementById("ecaTour"); if (el) el.remove();
  if (play && window.ecaPlayNow) ecaPlayNow();
}
window.asTourNext = asTourNext;
window.asTourEnd = asTourEnd;
window.asTourDue = asTourDue;
document.addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("ecaTour")) asTourEnd(false); });

// ================= 4) يرجع لمكانه لما يفتح تاني (خلال 6 ساعات) =================
const AS_PLACE = "ECA_LAST_PLACE";
let asPlaceReady = "";
function asPlaceSave() {
  const u = currUser();
  if (!u || u.role !== "student" || asPlaceReady !== u.id) return;
  const place = tab === "arena" ? { tab, sub: arena.sub === "play" ? "puzzles" : arena.sub, lesson: arena.sub === "puzzles" && !arena.puz.review ? arena.puz.lesson || "" : "" }
    : ["home", "lessons", "honor", "ranks"].includes(tab) ? { tab } : null;
  if (place) asLS.set(AS_PLACE, JSON.stringify(Object.assign({ uid: u.id, at: Date.now() }, place)));
}
function asPlaceRestore() {
  const u = currUser();
  if (!u || u.role !== "student" || window.__authLoading || asPlaceReady === u.id) return;
  asPlaceReady = u.id;
  let p = null; try { p = JSON.parse(asLS.get(AS_PLACE) || "null"); } catch (_) {}
  if (!p || p.uid !== u.id || Date.now() - p.at > 6 * 3600e3 || tab !== "home" || !p.tab || p.tab === "home") return;
  if (p.tab === "arena" && p.lesson && window.lpStart) lpStart(p.lesson);
  else { if (p.tab === "arena" && typeof p.sub === "string") arena.sub = p.sub; switchTab(p.tab); }
  toast(AS("رجّعناك لمكانك 👋", "Back where you left off 👋"));
}
window.asPlaceRestore = asPlaceRestore;

// ================= 5) إعدادات الراحة =================
const AS_COMFORT = "ECA_COMFORT", AS_OPTS = [
  ["big", "eca-big-board", "🔍", ["رقعة أكبر", "Bigger board"], ["مريحة على التابلت والموبايل الكبير", "Easier on tablets and large phones"]],
  ["cb", "eca-cb", "🎨", ["ألوان لعمى الألوان", "Colour-blind friendly"], ["الرقعة والإشارات بالأزرق والبرتقالي بدل الأحمر والأخضر", "Board and highlights in blue and orange instead of red and green"]],
  ["calm", "eca-calm", "🧘", ["حركة أقل", "Less motion"], ["من غير أنيميشن ولا كونفيتي ولا اهتزاز", "No animations, confetti or shaking"]],
  ["text", "eca-big-text", "🔠", ["خط أكبر", "Bigger text"], ["كل الكلام في الموقع أكبر شوية", "All text a little larger"]]
];
function asComfortGet() { let o = {}; try { o = JSON.parse(asLS.get(AS_COMFORT) || "{}") || {}; } catch (_) {} return o; }
function asComfortApply() { const o = asComfortGet(), h = document.documentElement; AS_OPTS.forEach(([k, cls]) => h.classList.toggle(cls, !!o[k])); }
function asComfortToggle(k) {
  if (!AS_OPTS.some(x => x[0] === k)) return;
  const o = asComfortGet(); o[k] = !o[k]; asLS.set(AS_COMFORT, JSON.stringify(o)); asComfortApply(); asComfortOpen();
}
function asComfortOpen() {
  const old = document.getElementById("ecaComfort"), o = asComfortGet(), en = lang === "en";
  const el = old || document.createElement("div");
  el.id = "ecaComfort"; el.className = "eca-spin-modal"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "ecaComfortTitle");
  el.innerHTML = `<div class="gold-card rounded-2xl p-5 w-full max-w-sm space-y-3">
      <h2 id="ecaComfortTitle" class="font-display font-bold text-lg text-yellow-300">👁️ ${AS("راحة العين والحركة", "Comfort settings")}</h2>
      ${AS_OPTS.map(([k, , icon, t, d]) => `<button type="button" onclick="asComfortToggle('${k}')" role="switch" aria-checked="${!!o[k]}" class="tap w-full flex items-center gap-3 rounded-xl px-3 py-2 text-start ${o[k] ? "bg-yellow-500/15 border border-yellow-400/60" : "bg-black/20 border border-yellow-500/15"}">
          <span class="text-xl" aria-hidden="true">${icon}</span><span class="min-w-0 flex-1"><b class="block text-sm text-white">${esc(en ? t[1] : t[0])}</b><span class="block text-xs text-gray-400">${esc(en ? d[1] : d[0])}</span></span>
          <span class="text-xs font-bold ${o[k] ? "text-emerald-300" : "text-gray-500"}">${o[k] ? AS("شغّال", "On") : AS("مقفول", "Off")}</span></button>`).join("")}
      <button type="button" onclick="asComfortClose()" class="tap w-full rounded-xl text-sm font-bold gold-btn">${AS("تمام", "Done")}</button>
    </div>`;
  if (!old) { document.body.appendChild(el); const b = el.querySelector("button"); if (b) b.focus(); }
}
function asComfortClose() { const el = document.getElementById("ecaComfort"); if (el) el.remove(); }
window.asComfortOpen = asComfortOpen;
window.asComfortToggle = asComfortToggle;
window.asComfortClose = asComfortClose;
document.addEventListener("keydown", e => { if (e.key === "Escape") asComfortClose(); });
asComfortApply();
// «حركة أقل»: من غير كونفيتي ولا ألعاب نارية ولا اهتزاز
["ecaConfetti", "ecaFireworks", "ecaShake"].forEach(n => {
  const f = window[n];
  if (typeof f === "function") window[n] = function () { if (document.documentElement.classList.contains("eca-calm")) return; return f.apply(this, arguments); };
});

// ================= التوصيل بالـ render =================
{
  const _r = render;
  render = function () {
    const out = _r.apply(this, arguments);
    asPlaceRestore();
    asPlaceSave();
    if (asTourDue()) { asTourStep = 0; asTourShow(); }
    return out;
  };
}
