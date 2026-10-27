// ECA — ux.js (eca-v28): تحسينات وصول وصور عامة. مفيهاش أي ألوان.
// ===== أنيميشن الستارة: فتح/غلق القوائم (نزول من فوق للفتح، وطلوع للغلق) =====
window.ecaCurtain = (function () {
  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)");
  var OUT = "cubic-bezier(.22,.9,.3,1)", IN = "cubic-bezier(.4,0,.8,.2)";
  var SHUT = { clipPath: "inset(0 0 100% 0)", opacity: 0 }, OPEN = { clipPath: "inset(0 0 0 0)", opacity: 1 };
  function still(el) { return (RM && RM.matches) || !el.animate; }
  function open(el) {
    if (still(el)) return;
    el.getAnimations().forEach(function (a) { a.cancel(); });
    var h = el.offsetHeight; if (!h) return;
    el.style.overflow = "hidden";
    var a = el.animate([Object.assign({ height: "0px" }, SHUT), Object.assign({ height: h + "px" }, OPEN)], { duration: 380, easing: OUT });
    a.onfinish = a.oncancel = function () { el.style.overflow = ""; };
  }
  function close(el, done) {
    if (still(el)) { if (done) done(); return; }
    var h = el.offsetHeight; el.style.overflow = "hidden";
    var a = el.animate([Object.assign({ height: h + "px" }, OPEN), Object.assign({ height: "0px" }, SHUT)], { duration: 260, easing: IN, fill: "forwards" });
    a.onfinish = function () { if (done) done(); a.cancel(); el.style.overflow = ""; };
  }
  return { open: open, close: close };
})();
// قوائم بتتعمل لها render من جديد (الدروس، مواعيد المجموعات): العنصر لازم يكون عليه data-curtain="مفتاح"
window.ecaCurtainToggle = function (key, flip) {
  var sel = '[data-curtain="' + key + '"]', el = document.querySelector(sel);
  if (el) { ecaCurtain.close(el, flip); return; }
  flip();
  var n = document.querySelector(sel); if (n) ecaCurtain.open(n);
};
// قوائم بتفضل في الصفحة وبس بتتخفي/بتظهر بكلاس hidden (قايمة الحساب)
window.ecaCurtainShow = function (el) { el.__closing = false; ecaCurtain.open(el); };
window.ecaCurtainHide = function (el) {
  if (el.__closing) return; el.__closing = true;
  ecaCurtain.close(el, function () { el.classList.add("hidden"); el.__closing = false; });
};
// <details> (الأسئلة الشائعة): نفس الحركة بالفتح والغلق
document.addEventListener("click", function (e) {
  var s = e.target.closest && e.target.closest("details > summary"); if (!s) return;
  var d = s.parentNode; if (d.tagName !== "DETAILS") return;
  var rm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (rm || !d.animate) return;
  e.preventDefault();
  if (d.__busy) return; d.__busy = true;
  var start = d.offsetHeight, opening = !d.open;
  d.style.overflow = "hidden";
  if (opening) d.open = true; else d.classList.add("closing");
  var end = opening ? d.scrollHeight : s.offsetHeight;
  var a = d.animate([{ height: start + "px" }, { height: end + "px" }], { duration: opening ? 340 : 240, easing: opening ? "cubic-bezier(.22,.9,.3,1)" : "cubic-bezier(.4,0,.8,.2)" });
  a.onfinish = a.oncancel = function () { if (!opening) d.open = false; d.classList.remove("closing"); d.style.overflow = ""; d.__busy = false; };
});

(function () {
  var SKIP = /eca-mark|eca-logo|favicon/;
  function fixImg(i) {
    if (!i.hasAttribute("alt")) i.setAttribute("alt", "");
    if (!i.hasAttribute("decoding")) i.setAttribute("decoding", "async");
    if (!i.hasAttribute("loading") && !SKIP.test(i.getAttribute("src") || "") && !i.closest("header")) i.setAttribute("loading", "lazy");
  }
  function fixBtn(b) {
    if (b.hasAttribute("aria-label") || b.hasAttribute("aria-labelledby")) return;
    if ((b.textContent || "").trim()) return;
    var t = b.getAttribute("title");
    if (t) b.setAttribute("aria-label", t);
  }
  function scan(root) {
    if (root.nodeType !== 1) return;
    if (root.tagName === "IMG") fixImg(root);
    if (root.tagName === "BUTTON") fixBtn(root);
    if (root.querySelectorAll) {
      root.querySelectorAll("img").forEach(fixImg);
      root.querySelectorAll("button").forEach(fixBtn);
    }
  }
  function start() {
    var mv = document.getElementById("mainView");
    if (mv && !mv.hasAttribute("tabindex")) mv.setAttribute("tabindex", "-1");
    scan(document.body);
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { m.addedNodes.forEach(scan); });
    }).observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
