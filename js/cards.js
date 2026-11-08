// ECA — cards.js: ألبوم كروت التكتيك
// كل لغز بيتحل في «ألغاز على الرقعة» بيتعدّ للفكرة التكتيكية بتاعته (من تصنيف Lichess).
// 10 حلول بتفتح الكارت. العدّادات في arena.mot والكروت المفتوحة في arena.cards بملف الطالب.

const ECA_CARDS = [
  { id: "pin", icon: "📌", ar: "التثبيت", en: "Pin", step: 2 },
  { id: "fork", icon: "🍴", ar: "الشوكة", en: "Fork", step: 2 },
  { id: "discoveredAttack", icon: "💥", ar: "الهجوم المكشوف", en: "Discovered Attack", step: 3 },
  { id: "doubleCheck", icon: "⚔️", ar: "الكش المزدوج", en: "Double Check", step: 3 },
  { id: "deflection", icon: "🌀", ar: "الإبعاد", en: "Deflection", step: 4 },
  { id: "skewer", icon: "🗡️", ar: "السيخ", en: "Skewer", step: 3 },
  { id: "mateIn1", icon: "♚", ar: "مات في نقلة", en: "Mate in 1", step: 1 },
  { id: "mateIn2", icon: "👑", ar: "مات في نقلتين", en: "Mate in 2", step: 2 }
];
const CARD_NEED = 10;

// بتتنادى من جوه تسجيل محاولة اللغز في arena.js، فبتتحفظ مع نفس الكتابة
function ecaMotifCount(a, themes, solved) {
  const list = (themes || []).filter(t => ECA_CARDS.some(c => c.id === t));
  if (!list.length) return;
  a.mot = a.mot && typeof a.mot === "object" ? a.mot : {};
  a.cards = Array.isArray(a.cards) ? a.cards : [];
  list.forEach(t => {
    const m = a.mot[t] = Object.assign({ s: 0, t: 0 }, a.mot[t]);
    m.t++;
    if (solved) m.s++;
    if (m.s >= CARD_NEED && !a.cards.includes(t)) {
      a.cards.push(t);
      const card = ECA_CARDS.find(c => c.id === t), en = lang === "en";
      if (window.ecaMilestone) setTimeout(() => ecaMilestone({ icon: card.icon, big: true, title: en ? "New card unlocked!" : "كارت جديد اتفتح!", text: en ? `${card.en} is now in your album.` : `كارت ${card.ar} دخل ألبومك.` }), 600);
    }
  });
}
window.ecaMotifCount = ecaMotifCount;

function arenaCardsHTML() {
  const u = currUser(), en = lang === "en";
  if (!u || u.role !== "student") return `<div class="gold-card rounded-2xl p-6 text-center text-sm text-gray-400">${en ? "The album is for students." : "الألبوم للطلاب بس."}</div>`;
  const a = u.arena || {}, mot = a.mot || {}, owned = Array.isArray(a.cards) ? a.cards : [];
  const cards = ECA_CARDS.map(c => {
    const m = mot[c.id] || { s: 0, t: 0 }, on = owned.includes(c.id), name = en ? c.en : c.ar;
    if (!on) {
      const pct = Math.min(100, Math.round((m.s / CARD_NEED) * 100));
      return `<div class="eca-card is-locked" aria-label="${esc(name)} ${en ? "locked" : "مقفول"}">
        <div class="eca-card-face">
          <span class="eca-card-icon" aria-hidden="true">${c.icon}</span>
          <b class="eca-card-name">${esc(name)}</b>
          <span class="eca-card-lock">🔒 ${en ? `Solve ${CARD_NEED} ${esc(c.en)} puzzles to unlock` : `حل ${CARD_NEED} ألغاز ${esc(c.ar)} عشان تفتحه`}</span>
          <div class="eca-quest-track" role="progressbar" aria-valuemin="0" aria-valuemax="${CARD_NEED}" aria-valuenow="${Math.min(m.s, CARD_NEED)}"><div style="width:${pct}%"></div></div>
          <span class="eca-card-stat">${Math.min(m.s, CARD_NEED)} / ${CARD_NEED}</span>
        </div>
      </div>`;
    }
    const acc = m.t ? Math.round((m.s / m.t) * 100) : 0;
    return `<div class="eca-card is-on" tabindex="0" aria-label="${esc(name)}">
      <div class="eca-card-face">
        <span class="eca-card-step">Step ${c.step}</span>
        <span class="eca-card-icon" aria-hidden="true">${c.icon}</span>
        <b class="eca-card-name">${esc(name)}</b>
        <div class="eca-card-stats">
          <span><b>${esc(m.s)}</b>${en ? "solved" : "اتحل"}</span>
          <span><b>${esc(m.t)}</b>${en ? "tried" : "اتجرّب"}</span>
          <span><b>${esc(acc)}%</b>${en ? "accuracy" : "دقة"}</span>
        </div>
      </div>
    </div>`;
  }).join("");
  return `<div class="space-y-4">
    <div class="gold-card rounded-2xl p-5 space-y-2">
      <h3 class="font-display font-bold text-lg text-yellow-300">🃏 ${en ? "Tactical cards album" : "ألبوم كروت التكتيك"} <span class="text-sm text-gray-300">${owned.length} / ${ECA_CARDS.length}</span></h3>
      <p class="text-sm text-gray-300">${en ? `Every puzzle you solve in Board puzzles counts toward its tactic. Solve ${CARD_NEED} to unlock the card.` : `كل لغز بتحله في «ألغاز على الرقعة» بيتحسب للفكرة بتاعته. حل ${CARD_NEED} عشان تفتح الكارت.`}</p>
    </div>
    <div class="eca-cards">${cards}</div>
  </div>`;
}

// ميل الكارت مع حركة الماوس أو الصباع (من غير ما يتأثر الأداء: متغيرين CSS بس)
document.addEventListener("pointermove", e => {
  const card = e.target.closest && e.target.closest(".eca-card.is-on");
  if (!card || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;
  const b = card.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
  card.style.setProperty("--rx", ((0.5 - y) * 16).toFixed(1) + "deg");
  card.style.setProperty("--ry", ((x - 0.5) * 18).toFixed(1) + "deg");
  card.style.setProperty("--gx", (x * 100).toFixed(0) + "%");
  card.style.setProperty("--gy", (y * 100).toFixed(0) + "%");
});
document.addEventListener("pointerout", e => {
  const card = e.target.closest && e.target.closest(".eca-card.is-on");
  if (card && !card.contains(e.relatedTarget)) { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); }
});
