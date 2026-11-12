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
  if (on) { const board = mv && mv.querySelector(".eca-board"); if (mv) mv.scrollTop = 0; if (board && board.scrollIntoView) board.scrollIntoView({ block: "nearest" }); }
}
window.ecaBoardFs = ecaBoardFs;
window.ecaFsBtnHTML = ecaFsBtnHTML;
["fullscreenchange", "webkitfullscreenchange"].forEach(ev => document.addEventListener(ev, () => { if (!ecaFsNative() && ecaFsOn) ecaBoardFs(false); }));
document.addEventListener("keydown", e => { if (e.key === "Escape" && ecaFsOn) ecaBoardFs(false); });

// ================= الرجوع للساحة =================
// كل لعبة بتدخلها من الساحة بتاخد خطوة في تاريخ المتصفح، فزرار الرجوع بيرجّعك للوبي بدل ما يخرّجك من الموقع
let ecaNavQuiet = false, ecaNavSkipPop = false;
const ecaLobbyMem = { y: 0, rows: {} };
function ecaGameTeardown() {
  ecaBoardFs(false);
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
      if (st.view && st.view !== arena.sub) arenaSub(st.view);
      else if (!st.view && arena.sub !== "lobby") arenaSub("lobby");
    } finally { ecaNavQuiet = false; }
  }, 0);
});
{
  const _r = render;
  render = function () {
    const out = _r.apply(this, arguments);
    if (ecaFsOn) {
      if (tab !== "arena" || arena.sub !== ecaFsSub) ecaBoardFs(false);
      else { const mv = document.getElementById("mainView"); if (mv) mv.classList.add("board-fullscreen-active"); }
    }
    return out;
  };
}
