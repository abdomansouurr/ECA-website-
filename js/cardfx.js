// ECA — cardfx.js: كروت ساحة التدريب بتصحى لما تقف عليها بالماوس أو تلمسها
// كل كارت فيه 3 طبقات: خلفية (A) + بطل ثابت (B) + مؤثرات (C) مخفية لحد ما الكارت ياخد .hover-active
// كله SVG و CSS جوه الصفحة: مفيش صور ولا فيديو بتتحمّل. طبقة المؤثرات بتتبني بعد ما الصفحة تظهر (وقت فاضي)
const GameCardAnimator = (() => {
  const dots = (cls, list) => list.map(([x, y, d]) => `<i class="${cls}" style="--x:${x}px;--y:${y}px;--d:${d}s"></i>`).join("");
  const sword = (cls, blade, edge) => `<svg class="gc-sword ${cls}" viewBox="0 0 20 80"><polygon points="10,0 14,8 14,56 6,56 6,8" fill="${blade}" stroke="${edge}" stroke-width="1.5" /><rect x="0" y="55" width="20" height="5" rx="2" fill="#F5C518" /><rect x="8" y="60" width="4" height="14" fill="#5b3a1a" /><circle cx="10" cy="77" r="3" fill="#F5C518" /></svg>`;
  const HERO = {
    speed: `<svg class="gc-clock" viewBox="0 0 64 64"><rect x="6" y="18" width="52" height="38" rx="8" fill="#1f1f1f" stroke="#E50914" stroke-width="3" /><rect x="14" y="10" width="10" height="8" rx="2" fill="#E50914" /><rect x="40" y="12" width="10" height="6" rx="2" fill="#6b6b6b" /><circle cx="32" cy="37" r="13" fill="#fff" /><line class="gc-hand" x1="32" y1="37" x2="32" y2="27" stroke="#141414" stroke-width="3" stroke-linecap="round" /><circle cx="32" cy="37" r="2.5" fill="#E50914" /></svg><span class="gc-pawn">♟</span>`,
    dojo: `<span class="gc-belt">🥋</span><span class="gc-lock">🔒</span>`,
    duel: sword("gc-sword-r", "#ff8a8f", "#E50914") + sword("gc-sword-b", "#93c5fd", "#2563eb"),
    coach: `<span class="gc-board"></span><span class="gc-glass">🔍</span><span class="gc-crown">👑</span>`,
    arena: `<span class="gc-trophy">🏆</span><span class="gc-glare"></span>`
  };
  const FX = {
    speed: [22, 34, 46, 58, 70, 82].map((t, i) => `<i class="gc-line" style="top:${t}%;--d:${(i * 0.13).toFixed(2)}s"></i>`).join("")
      + `<span class="gc-stage"><i class="gc-fire"></i>${dots("gc-spark", [[26, -14, 0], [34, 4, 0.08], [22, 12, 0.16], [40, -6, 0.24], [30, 16, 0.32], [38, 10, 0.4]])}</span>`,
    dojo: `<i class="gc-slash"></i><span class="gc-stage"><i class="gc-wave"></i><i class="gc-wave gc-wave2"></i>${dots("gc-frag", [[-18, 46, 0], [-6, 54, 0.15], [8, 50, 0.3], [18, 44, 0.45], [0, 58, 0.6]])}</span>`,
    duel: `<svg class="gc-bolt" viewBox="0 0 40 100" preserveAspectRatio="none"><polyline points="26,0 12,38 24,40 8,100" pathLength="100" /></svg><svg class="gc-bolt gc-bolt2" viewBox="0 0 40 100" preserveAspectRatio="none"><polyline points="14,0 28,34 16,38 30,100" pathLength="100" /></svg>`
      + `<span class="gc-stage"><span class="gc-clash">${[0, 60, 120, 180, 240, 300].map(a => `<i style="--a:${a}deg"></i>`).join("")}</span></span>`,
    coach: `<span class="gc-stage"><i class="gc-scan"></i>${[[78, 4, 0], [92, 26, 0.35], [64, 18, 0.7]].map(([x, y, d]) => `<i class="gc-glint" style="left:${x}%;top:${y}%;--d:${d}s">✦</i>`).join("")}${dots("gc-dust", [[-24, -46, 0], [-10, -54, 0.3], [4, -40, 0.6], [14, -50, 0.9], [26, -44, 1.2], [-34, -52, 1.5]])}</span>`,
    arena: `<i class="gc-beam gc-beam-r"></i><i class="gc-beam gc-beam-b"></i><i class="gc-beam gc-beam-g"></i>`
      + [["gc-burst-a", 0], ["gc-burst-b", 0.5]].map(([c, d]) => `<span class="gc-burst ${c}" style="--d:${d}s">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<i style="--a:${a}deg"></i>`).join("")}</span>`).join("")
  };
  const KINDS = Object.keys(HERO);
  // الطبقات A و B بتترسم مع الكارت، و C فاضية لحد ما hydrate تملاها
  function media(kind) {
    if (!HERO[kind]) return "";
    return `<span class="game-card-media" aria-hidden="true"><span class="gc-bg"></span><span class="gc-hero">${HERO[kind]}</span><span class="gc-fx" data-fx="${kind}"></span></span>`;
  }
  function hydrate(root) {
    (root || document).querySelectorAll(".gc-fx[data-fx]:empty").forEach(el => { const fx = FX[el.dataset.fx]; if (fx) el.innerHTML = fx; });
  }
  let idle = 0, activeKey = "";
  function schedule() {
    // الصفحة اترسمت تاني والكارت لسه تحت الماوس أو الصباع: يفضل صاحي
    if (activeKey) { const card = [...document.querySelectorAll(".game-card")].find(c => c.getAttribute("onclick") === activeKey); if (card) { hydrate(card); card.classList.add("hover-active"); } else activeKey = ""; }
    if (idle || !document.querySelector("#mainView .gc-fx[data-fx]:empty")) return;
    const run = () => { idle = 0; hydrate(document.getElementById("mainView")); };
    idle = window.requestIdleCallback ? requestIdleCallback(run, { timeout: 400 }) : setTimeout(run, 60);
  }
  const calm = () => document.documentElement.classList.contains("eca-calm") || !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const cardOf = t => (t && t.closest ? t.closest(".game-card") : null);
  function activate(card) {
    document.querySelectorAll(".game-card.hover-active").forEach(c => { if (c !== card) c.classList.remove("hover-active"); });
    activeKey = card ? card.getAttribute("onclick") || "" : "";
    if (card) { hydrate(card); card.classList.add("hover-active"); }
  }
  function sleep(card) { card.classList.remove("hover-active"); if (card.getAttribute("onclick") === activeKey) activeKey = ""; }
  // اللمس: الكارت بيصحى، والضغطة بتستنى 150ms عشان الطفل يشوف الحركة، وضغطة تانية في الوقت ده بتتجاهل
  let lastTouch = 0, pending = 0;
  const TOUCH_MS = 900, DELAY_MS = 150;
  document.addEventListener("touchstart", e => { const card = cardOf(e.target); lastTouch = Date.now(); activate(card); }, { passive: true, capture: true });
  document.addEventListener("mouseover", e => { if (Date.now() - lastTouch < TOUCH_MS) return; const card = cardOf(e.target); if (card) activate(card); });
  document.addEventListener("mouseout", e => { if (Date.now() - lastTouch < TOUCH_MS) return; const card = cardOf(e.target); if (card && !card.contains(e.relatedTarget)) sleep(card); });
  document.addEventListener("focusin", e => { const card = cardOf(e.target); if (card && card.matches(":focus-visible")) activate(card); });
  document.addEventListener("focusout", e => { const card = cardOf(e.target); if (card && card.isConnected) sleep(card); });
  document.addEventListener("click", e => {
    const card = cardOf(e.target);
    if (!card || Date.now() - lastTouch > TOUCH_MS + DELAY_MS) return;
    if (card.dataset.gcGo) { delete card.dataset.gcGo; return; }   // دي الضغطة الحقيقية بعد الانتظار
    e.preventDefault(); e.stopImmediatePropagation();
    if (pending) return;
    activate(card);
    const go = card.getAttribute("onclick");
    const fire = () => {
      pending = 0;
      // لو الصفحة اترسمت تاني في الـ 150ms، بندوس نفس الكارت في الرسمة الجديدة
      const el = card.isConnected ? card : [...document.querySelectorAll(".game-card")].find(c => c.getAttribute("onclick") === go);
      if (el) { el.dataset.gcGo = "1"; el.click(); }
    };
    if (calm()) fire(); else pending = setTimeout(fire, DELAY_MS);
  }, true);
  return { media, hydrate, schedule, activate, sleep, KINDS };
})();
window.GameCardAnimator = GameCardAnimator;
{
  const _r = render;
  render = function () { const out = _r.apply(this, arguments); GameCardAnimator.schedule(); return out; };
}
