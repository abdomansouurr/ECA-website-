// ECA — gamenav.js: تكبير الرقعة (ملء الشاشة) في كل ألعاب الساحة + الرجوع للساحة من أي لعبة
// (زرار «العودة لساحة التدريب» أو زرار الرجوع في الموبايل/المتصفح) مع تنضيف العدادات وترجيع مكان اللوبي

// ================= تكبير الرقعة =================
// بنكبّر الصفحة كلها (مش عنصر الرقعة نفسه) لأن الرقعة بتترسم من جديد مع كل نقلة. ولو المتصفح مش بيدعم
// ملء الشاشة (زي آيفون) الكلاس .board-fullscreen-active لوحده بيغطي الشاشة
let ecaFsOn = false, ecaFsSub = "";
const ecaFsText = () => ecaFsOn ? (lang === "en" ? "Exit full screen" : "تصغير الرقعة") : (lang === "en" ? "Full screen board" : "تكبير الرقعة");
function ecaFsBtnHTML() {
  return `<button type="button" id="ecaFsBtn" onclick="ecaBoardFs()" class="tap eca-fs-btn" aria-pressed="${ecaFsOn}" title="${ecaFsText()}" aria-label="${ecaFsText()}">${ecaFsOn ? "🗗" : "⛶"}</button>`;
}
function ecaFsNative() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
function ecaBoardFs(on) {
  on = on === undefined ? !ecaFsOn : !!on;
  if (on === ecaFsOn) return;
  ecaFsOn = on; ecaFsSub = on && typeof arena !== "undefined" ? arena.sub : "";
  const root = document.documentElement, mv = document.getElementById("mainView");
  root.classList.toggle("eca-board-fs", on);
  if (mv) mv.classList.toggle("board-fullscreen-active", on);
  try {
    if (on) {
      const req = root.requestFullscreen || root.webkitRequestFullscreen;
      const p = req && req.call(root, { navigationUI: "hide" });
      if (p && p.catch) p.catch(() => {});   // من غير ضغطة حقيقية أو على آيفون: الكلاس كفاية
    } else if (ecaFsNative()) {
      const ex = document.exitFullscreen || document.webkitExitFullscreen;
      const p = ex && ex.call(document);
      if (p && p.catch) p.catch(() => {});
    }
  } catch (_) {}
  const b = document.getElementById("ecaFsBtn");
  if (b) b.outerHTML = ecaFsBtnHTML();
  if (on) { window.scrollTo(0, 0); if (mv) mv.scrollTop = 0; ecaFsLayout(); }
  else { if (mv) mv.style.removeProperty("--fs-board"); if (ecaFsRo) ecaFsRo.disconnect(); }
}
// في وضع التكبير بيفضل ظاهر: الرقعة + شريط اللعبة (رجوع/تصغير) + العدّاد وأزرار التحليل وسطر الحالة بس.
// كل حاجة تانية بتختفي بالـ CSS، وهنا بنحسب مقاس الرقعة من المساحة اللي فاضلة عشان الـ 64 مربع يبانوا كلهم من غير سكرول
const ECA_FS_KEEP = ["#rushLeft", "#visLeft", "#duelLeft", "#saLeft", "#anaEval", 'button[onclick="anaUndo()"]', "[aria-live]"];
function ecaFsLayout() {
  const mv = document.getElementById("mainView");
  if (!ecaFsOn || !mv) return;
  const board = mv.querySelector(".eca-board");
  if (!board) return;
  const bar = mv.querySelector(".eca-arena-bar");
  if (bar) bar.classList.add("eca-fs-keep");
  ECA_FS_KEEP.forEach(sel => mv.querySelectorAll(sel).forEach(el => {
    if (board.contains(el) || el.contains(board) || (bar && bar.contains(el))) return;
    // الصف اللي فيه العنصر بس (صف العدّادات أو صف الأزرار)، مش العمود كله
    const row = el.closest(".grid, .flex");
    (row && mv.contains(row) && !row.contains(board) ? row : el).classList.add("eca-fs-keep");
  }));
  const cs = getComputedStyle(mv), gap = parseFloat(cs.rowGap) || 0;
  const room = mv.clientHeight - (parseFloat(cs.paddingTop) || 0) - (parseFloat(cs.paddingBottom) || 0);
  const measure = () => {
    const keep = [...mv.querySelectorAll(".eca-fs-keep")].filter(k => !k.parentElement.closest(".eca-fs-keep"));
    return room - keep.reduce((s, k) => s + k.getBoundingClientRect().height, 0) - gap * keep.length;
  };
  let h = measure();
  // شاشة قصيرة: الرقعة أهم من الصفوف الزيادة، فبنسيب شريط اللعبة بس
  if (h < Math.min(window.innerWidth - 32, 320)) { mv.querySelectorAll(".eca-fs-keep").forEach(k => { if (k !== bar) k.classList.remove("eca-fs-keep"); }); h = measure(); }
  const side = Math.floor(Math.max(160, Math.min(window.innerWidth - 32, h)));
  mv.style.setProperty("--fs-board", side + "px");
  // صف بيكبر لوحده بعدين (تقييم المحرك بيتكتب بعد ما الرقعة تترسم مثلاً): نعيد الحساب
  if (window.ResizeObserver) {
    if (!ecaFsRo) ecaFsRo = new ResizeObserver(() => ecaFsRelayout());
    ecaFsRo.disconnect();
    mv.querySelectorAll(".eca-fs-keep").forEach(k => ecaFsRo.observe(k));
  }
}
let ecaFsRo = null;
let ecaFsRaf = 0;
const ecaFsRelayout = () => { if (!ecaFsOn || ecaFsRaf) return; ecaFsRaf = requestAnimationFrame(() => { ecaFsRaf = 0; ecaFsLayout(); }); };
window.ecaBoardFs = ecaBoardFs;
window.ecaFsBtnHTML = ecaFsBtnHTML;
window.ecaFsLayout = ecaFsLayout;
["fullscreenchange", "webkitfullscreenchange"].forEach(ev => document.addEventListener(ev, () => { if (!ecaFsNative() && ecaFsOn) ecaBoardFs(false); else ecaFsRelayout(); }));
window.addEventListener("resize", ecaFsRelayout);
document.addEventListener("keydown", e => { if (e.key === "Escape" && ecaFsOn) ecaBoardFs(false); });

// ================= الرجوع للساحة =================
// كل لعبة بتدخلها من الساحة بتاخد خطوة في تاريخ المتصفح، فزرار الرجوع بيرجّعك للوبي بدل ما يخرّجك من الموقع
let ecaNavQuiet = false, ecaNavSkipPop = false;
const ecaLobbyMem = { y: 0, rows: {} };
function ecaGameTeardown() {
  ecaBoardFs(false);
  if (window.coachCancelAll) coachCancelAll();   // رد عقابي شغّال: المؤقت بيتلغي والرقعة بترجع
  const V = arena.vis;   // تدريب الرؤية: الخروج في النص بيلغي الجولة من غير نتيجة (زي تحدي 60 ثانية)
  if (V && V.timer) { clearInterval(V.timer); V.timer = null; V.active = false; V.target = ""; }
  const P = arena.puz;
  if (P && P.nextTimer) { clearTimeout(P.nextTimer); P.nextTimer = null; }
  const R = arena.rush;
  if (R && R.timer && typeof rushStop === "function") { rushStop(); R.status = "idle"; R.game = null; }
  try { if (typeof ECA_PROMO !== "undefined") ECA_PROMO = null; } catch (_) {}
  document.querySelectorAll(".eca-promo").forEach(el => el.remove());
}
function ecaLobbyRemember() {
  ecaLobbyMem.y = window.scrollY; ecaLobbyMem.rows = {};
  document.querySelectorAll("#mainView .nf-row").forEach(r => { const t = r.querySelector(".nf-track"); if (t) ecaLobbyMem.rows[r.dataset.row] = t.scrollLeft; });
}
function ecaLobbyRestore() {
  document.querySelectorAll("#mainView .nf-row").forEach(r => { const t = r.querySelector(".nf-track"), x = ecaLobbyMem.rows[r.dataset.row]; if (t && x) t.scrollLeft = x; });
  window.scrollTo(0, ecaLobbyMem.y);
}
{
  const _as = arenaSub;
  arenaSub = function (k) {
    const from = arena.sub, here = tab === "arena", st = history.state || {};
    if (here && from === "lobby" && k !== "lobby") ecaLobbyRemember();
    if (here && !ecaNavQuiet) {
      if (k !== "lobby") {
        const s = { tab: "arena", view: k };
        if (st.view) history.replaceState(s, "", "#arena"); else history.pushState(s, "", "#arena");
      } else if (st.view) {
        // ضغطة حقيقية على «العودة»: بنرجع خطوة فعلاً عشان زرار الرجوع بعدها مايرجعش للعبة
        const ev = window.event;
        if (ev && ev.isTrusted && ev.type === "click") { ecaNavSkipPop = true; history.back(); }
        else history.replaceState({ tab: "arena" }, "", "#arena");
      }
    }
    if (k === "lobby" && from !== "lobby") ecaGameTeardown();
    const out = _as.apply(this, arguments);
    if (here && k === "lobby" && from !== "lobby") ecaLobbyRestore();
    return out;
  };
}
window.addEventListener("popstate", e => {
  const st = e.state || {};
  // بعد ما core.js يغيّر التاب من نفس الحدث
  setTimeout(() => {
    if (ecaNavSkipPop) { ecaNavSkipPop = false; return; }
    if (tab !== "arena") { ecaBoardFs(false); return; }
    ecaNavQuiet = true;
    try {
      if (!st.view && arena.sub !== "lobby") arenaSub("lobby");
      // خطوة لعبة قديمة (الطالب كان خرج منها): بنفضل في اللوبي بدل ما اللعبة القديمة ترجع تفتح
      else if (st.view && arena.sub === "lobby") history.replaceState({ tab: "arena" }, "", "#arena");
    } finally { ecaNavQuiet = false; }
  }, 0);
});
{
  const _r = render;
  render = function () {
    const out = _r.apply(this, arguments);
    if (ecaFsOn) {
      if (tab !== "arena" || arena.sub !== ecaFsSub) ecaBoardFs(false);
      else { const mv = document.getElementById("mainView"); if (mv) mv.classList.add("board-fullscreen-active"); ecaFsLayout(); }
    }
    return out;
  };
}

// ================= القايمة الرئيسية بترجّع الساحة للوبي =================
// أي ضغطة على تاب في القايمة (الرئيسية، ساحة التدريب، البطولات...) وانت جوه لعبة: اللعبة بتتقفل وعدّاداتها بتقف،
// والساحة ترجع للوبي. الكود اللي بيفتح لعبة بنفسه (switchTab ثم arenaSub) مش بيتأثر لأنه مش ضغطة على القايمة
function returnToArenaLobby() {
  if (typeof arena === "undefined" || arena.sub === "lobby") return false;
  ecaGameTeardown();
  if ((history.state || {}).view) history.replaceState({ tab: "arena" }, "", "#arena");
  arena.sub = "lobby";
  return true;
}
window.returnToArenaLobby = returnToArenaLobby;
window.exitActiveGame = returnToArenaLobby;
function ecaNavClick() {
  const ev = window.event, t = ev && ev.target;
  return !!(ev && ev.type === "click" && t && t.closest && t.closest(".nav-tab"));
}
{
  const _st = switchTab;
  switchTab = function (t) {
    const nav = ecaNavClick(), out = _st.apply(this, arguments);
    // بعد switchTab الأصلية: لو الطالب رفض يسيب دور شغّال (care.js) التاب ما اتغيرش ومش بنلمس حاجة
    if (nav && tab === t && returnToArenaLobby() && t === "arena") render();
    return out;
  };
}
