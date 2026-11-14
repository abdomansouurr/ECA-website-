// ECA — cardfx.js: كروت ساحة التدريب بتصحى لما تقف عليها بالماوس أو تلمسها
// كل كارت فيه 3 طبقات: خلفية (A) + بطل ثابت (B) + مؤثرات (C) مخفية لحد ما الكارت ياخد .hover-active
// كله SVG و CSS جوه الصفحة: مفيش صور ولا فيديو بتتحمّل. طبقة المؤثرات بتتبني بعد ما الصفحة تظهر (وقت فاضي)
const GameCardAnimator = (() => {
  const dots = (cls, list) => list.map(([x, y, d]) => `<i class="${cls}" style="--x:${x}px;--y:${y}px;--d:${d}s"></i>`).join("");
  const at = (cls, list) => list.map(([x, y, d, t]) => `<i class="${cls}" style="left:${x}%;top:${y}%;--d:${d}s">${t || ""}</i>`).join("");
  const ring = (cls, n, gap) => Array.from({ length: n }, (_, i) => `<i class="${cls}" style="--d:${(i * gap).toFixed(2)}s"></i>`).join("");
  const stage = html => `<span class="gc-stage">${html}</span>`;
  const sword = (cls, blade, edge) => `<svg class="gc-sword ${cls}" viewBox="0 0 20 80"><polygon points="10,0 14,8 14,56 6,56 6,8" fill="${blade}" stroke="${edge}" stroke-width="1.5" /><rect x="0" y="55" width="20" height="5" rx="2" fill="#F5C518" /><rect x="8" y="60" width="4" height="14" fill="#5b3a1a" /><circle cx="10" cy="77" r="3" fill="#F5C518" /></svg>`;
  // كل لعبة ليها بطل ثابت (B) ومؤثرات (C) خاصة بيها، ومفيش لعبتين بنفس الحركة
  const HERO = {
    daily: `<span class="gc-cal"><i class="gc-cal-top"></i><b>♞</b></span><span class="gc-dsun">☀️</span>`,
    target: `<span class="gc-target">🎯</span>`,
    map: `<svg class="gc-trail" viewBox="0 0 100 100" preserveAspectRatio="none"><path class="gc-trail-base" d="M8 92 C 40 92, 10 52, 46 50 S 70 14, 86 16" pathLength="100" /><path class="gc-trail-gold" d="M8 92 C 40 92, 10 52, 46 50 S 70 14, 86 16" pathLength="100" /></svg><span class="gc-castle">🏰</span><svg class="gc-compass" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#111827" stroke="#F5C518" stroke-width="2" /><polygon class="gc-needle" points="20,5 23.5,20 20,35 16.5,20" fill="#E50914" /><circle cx="20" cy="20" r="2.5" fill="#F5C518" /></svg>`,
    dojo: `<span class="gc-belt">🥋</span><span class="gc-lock">🔒</span>`,
    boss: `<span class="gc-dragon">🐉</span><span class="gc-hp"><i></i></span>`,
    speed: `<span class="gc-dclock"><b>0:</b><span class="gc-roll-win"><span class="gc-roll">${[59, 58, 57, 56, 55, 54, 53, 52, 51, 50].map(n => `<i>${n}</i>`).join("")}</span></span></span><span class="gc-pawn">♟</span>`,
    knights: `<span class="gc-kn gc-kn-l">♞</span><span class="gc-kn gc-kn-r">♞</span>`,
    duel: sword("gc-sword-r", "#ff8a8f", "#E50914") + sword("gc-sword-b", "#93c5fd", "#2563eb"),
    spin: `<span class="gc-wheel"></span><span class="gc-pin">▼</span>`,
    coach: `<span class="gc-board"></span><span class="gc-crown">👑</span>`,
    arena: `<span class="gc-trophy">🏆</span><span class="gc-glare"></span>`,
    event: `<span class="gc-bunting">${"<i></i>".repeat(6)}</span><span class="gc-tent">🎪</span>`,
    honor: `<span class="gc-rays"></span><span class="gc-podium"><i></i><i></i><i></i></span><span class="gc-medal">🏅</span>`,
    album: `<span class="gc-stack"><i>🃏</i><i>⚔️</i><i>♛</i></span>`,
    pieces: `<span class="gc-pedestal"></span><span class="gc-bigknight">♞</span>`,
    boards: `<span class="gc-tiles">${Array.from({ length: 9 }, (_, i) => `<i style="--d:${(((i % 3) + Math.floor(i / 3)) * 0.12).toFixed(2)}s"></i>`).join("")}</span>`,
    avatar: `<span class="gc-ava">🦁</span>`,
    frame: `<svg class="gc-frm" viewBox="0 0 60 60"><rect class="gc-frm-base" x="4" y="4" width="52" height="52" rx="6" /><rect class="gc-frm-line" x="4" y="4" width="52" height="52" rx="6" pathLength="100" /></svg><span class="gc-frm-in">♟</span>`,
    chest: `<svg class="gc-chest" viewBox="0 0 64 56"><g class="gc-lid"><path d="M6 22 Q32 2 58 22 Z" fill="#a16207" stroke="#F5C518" stroke-width="2" /></g><rect x="6" y="22" width="52" height="30" rx="3" fill="#78350f" stroke="#F5C518" stroke-width="2" /><rect x="28" y="26" width="8" height="10" rx="2" fill="#F5C518" /></svg>`,
    bot: `<span class="gc-bot">🤖</span><span class="gc-lane"><i>♙</i></span>`,
    puzzle: `<span class="gc-piece">🧩</span>`,
    vision: `<span class="gc-scope"></span><span class="gc-eye">👁️</span>`,
    pawns: `<span class="gc-march"><i>♟</i><i>♟</i><i>♟</i></span>`,
    analysis: `<span class="gc-mini"></span><span class="gc-an gc-an-n">♞</span><span class="gc-an gc-an-b">♝</span>`,
    live: `<span class="gc-chclock"><i class="gc-cc-face gc-cc-l">3:00</i><i class="gc-cc-face gc-cc-r">2:58</i><b class="gc-cc-btn gc-cc-btn-l"></b><b class="gc-cc-btn gc-cc-btn-r"></b></span>`,
    archive: `<span class="gc-books"><i class="gc-bk gc-bk1"></i><i class="gc-bk gc-bk2"></i><i class="gc-bk gc-bk3"></i></span><span class="gc-scroll">PGN</span>`
  };
  const FX = {
    daily: stage(`<i class="gc-page"></i>${ring("gc-dray", 3, 0.3)}`),
    target: stage(`<i class="gc-arrow"></i>${ring("gc-ripple", 3, 0.25)}`),
    map: stage(`<i class="gc-beacon"></i><i class="gc-beacon gc-beacon2"></i>`),
    dojo: `<i class="gc-slash"></i>` + stage(`<i class="gc-wave"></i><i class="gc-wave gc-wave2"></i>${dots("gc-frag", [[-18, 46, 0], [-6, 54, 0.15], [8, 50, 0.3], [18, 44, 0.45], [0, 58, 0.6]])}`),
    boss: stage(ring("gc-breath", 3, 0.35) + dots("gc-cinder", [[-30, -40, 0], [-12, -52, 0.25], [-40, -24, 0.5], [-22, -46, 0.75], [-48, -34, 1]])),
    speed: [22, 34, 46, 58, 70, 82].map((t, i) => `<i class="gc-line" style="top:${t}%;--d:${(i * 0.13).toFixed(2)}s"></i>`).join("") + stage(`<i class="gc-ghost">♟</i><i class="gc-ghost gc-ghost2">♟</i>`),
    knights: stage(`<i class="gc-flash"></i><i class="gc-shock gc-shock-c"></i><i class="gc-shock gc-shock-r"></i>`),
    duel: `<svg class="gc-bolt" viewBox="0 0 40 100" preserveAspectRatio="none"><polyline points="26,0 12,38 24,40 8,100" pathLength="100" vector-effect="non-scaling-stroke" /></svg><svg class="gc-bolt gc-bolt2" viewBox="0 0 40 100" preserveAspectRatio="none"><polyline points="14,0 28,34 16,38 30,100" pathLength="100" vector-effect="non-scaling-stroke" /></svg>`
      + stage(`<span class="gc-clash">${[0, 60, 120, 180, 240, 300].map(a => `<i style="--a:${a}deg"></i>`).join("")}</span>`),
    spin: stage(dots("gc-loot", [[-34, -56, 0], [30, -60, 0.2], [-10, -70, 0.4], [16, -50, 0.6], [-24, -44, 0.8], [36, -40, 1]])),
    coach: stage(ring("gc-radar", 2, 0.6) + at("gc-glint", [[18, 70, 0, "✦"], [52, 82, 0.4, "✦"], [80, 64, 0.8, "✦"], [36, 58, 1.2, "✦"]])),
    arena: `<i class="gc-beam gc-beam-r"></i><i class="gc-beam gc-beam-b"></i><i class="gc-beam gc-beam-g"></i>`
      + [["gc-burst-a", 0], ["gc-burst-b", 0.5]].map(([c, d]) => `<span class="gc-burst ${c}" style="--d:${d}s">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<i style="--a:${a}deg"></i>`).join("")}</span>`).join(""),
    event: at("gc-conf", [[8, -8, 0], [20, -8, 0.3], [33, -8, 0.6], [46, -8, 0.15], [58, -8, 0.45], [70, -8, 0.75], [82, -8, 0.2], [92, -8, 0.5]]),
    honor: stage(at("gc-sparkle", [[8, 24, 0, "✨"], [82, 14, 0.5, "✨"], [74, 58, 1, "✨"]])),
    album: stage(`<i class="gc-shine"></i>`),
    pieces: stage(`<svg class="gc-ltrail" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M40 86 V30 H74" pathLength="100" vector-effect="non-scaling-stroke" /></svg>`),
    boards: stage(`<i class="gc-brush">🖌️</i>`),
    avatar: stage(`<span class="gc-orbit"><i>🐯</i><i>🦊</i><i>🐼</i></span>`),
    frame: stage(ring("gc-gem", 4, 0.3)),
    chest: stage(`<i class="gc-glow"></i>${dots("gc-coin", [[-26, -48, 0], [-8, -60, 0.18], [10, -54, 0.36], [26, -44, 0.54], [0, -66, 0.72]])}`),
    bot: stage(`<span class="gc-think"><i></i><i></i><i></i></span>`),
    puzzle: stage(`<i class="gc-mag">🔍</i><i class="gc-bang">!</i>`),
    vision: stage(`<i class="gc-sweep"></i>${at("gc-coord", [[6, 10, 0, "e4"], [72, 6, 0.5, "g7"], [10, 70, 1, "b3"], [74, 72, 1.5, "d5"]])}`),
    pawns: stage(`<i class="gc-pcrown">👑</i>`),
    live: stage(`<i class="gc-livedot"></i>${ring("gc-tickring", 2, 0.5)}<i class="gc-cc-flag">⚑</i>`),
    archive: stage(`<i class="gc-pg gc-pg1"></i><i class="gc-pg gc-pg2"></i><i class="gc-pg gc-pg3"></i>${at("gc-acc", [[10, 66, 0, "!!"], [78, 58, 0.5, "★"], [44, 80, 1, "?!"]])}`),
    analysis: stage(`<i class="gc-tsq gc-tsq-a"></i><i class="gc-tsq gc-tsq-b"></i><svg class="gc-arrows" viewBox="0 0 4 4"><line class="gc-ar-g" x1="1.5" y1="2.5" x2="0.5" y2="0.5" pathLength="100" /><line class="gc-ar-g gc-ar-g2" x1="1.5" y1="2.5" x2="3.5" y2="1.5" pathLength="100" /><line class="gc-ar-y" x1="3.5" y1="3.5" x2="0.5" y2="0.5" pathLength="100" /></svg>`)
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
  // «حركة أقل» اللي الطالب اختارها من الموقع بس. إعداد الأنيميشن بتاع ويندوز ما بيوقفش معاينة الكارت لما الطالب يقف عليه بنفسه
  const calm = () => document.documentElement.classList.contains("eca-calm");
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
  // الماوس: شغّال دايماً، حتى على أجهزة ويندوز اللي فيها شاشة لمس (maxTouchPoints > 0). مع الكروت اللي بتترسم بعدين كمان (الاستماع على الصفحة كلها)
  const isMouse = e => e.pointerType === "mouse" || e.pointerType === "pen";
  const enter = e => { const card = cardOf(e.target); if (card) activate(card); };
  const leave = e => { const card = cardOf(e.target); if (card && !card.contains(e.relatedTarget)) sleep(card); };
  document.addEventListener("pointerover", e => { if (isMouse(e)) enter(e); });
  document.addEventListener("pointerout", e => { if (isMouse(e)) leave(e); });
  ["pointerenter", "mouseenter"].forEach(n => document.addEventListener(n, e => { if (n === "mouseenter" || isMouse(e)) { if (e.target.classList && e.target.classList.contains("game-card")) activate(e.target); } }, true));
  ["pointerleave", "mouseleave"].forEach(n => document.addEventListener(n, e => { if ((n === "mouseleave" && Date.now() - lastTouch > TOUCH_MS) || isMouse(e)) { if (e.target.classList && e.target.classList.contains("game-card")) sleep(e.target); } }, true));
  // أحداث الماوس القديمة (متصفحات من غير pointer events). بعد اللمس على طول بنتجاهل الخروج عشان الكارت اللي اتلمس يفضل صاحي
  document.addEventListener("mouseover", enter);
  document.addEventListener("mouseout", e => { if (Date.now() - lastTouch < TOUCH_MS) return; leave(e); });
  document.addEventListener("focusin", e => { const card = cardOf(e.target); if (card && card.matches(":focus-visible")) activate(card); });
  document.addEventListener("focusout", e => { const card = cardOf(e.target); if (card && card.isConnected) sleep(card); });
  document.addEventListener("click", e => {
    const card = cardOf(e.target);
    // الانتظار للمس بس: ضغطة الماوس بتفتح على طول حتى لو الشاشة اتلمست من شوية
    const touch = e.pointerType ? e.pointerType === "touch" : Date.now() - lastTouch <= TOUCH_MS + DELAY_MS;
    if (!card || !touch) return;
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
