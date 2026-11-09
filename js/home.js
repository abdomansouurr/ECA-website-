// ECA — home.js: الصفحة الرئيسية للطالب كلوبي ألعاب (Bento)
// بدل ما كل ملف يلزق الكارت بتاعه فوق أو تحت (فكله نازل تحت بعضه)، الصفحة بتتبني هنا في أقسام وشبكة متناسقة.
// كل الكروت هي نفسها بنفس الدوال والأزرار؛ هنا بس مكانها. محتوى core (مهمة اليوم، كارت اللاعب، المتجر، الدرس الجاي)
// بيتعلّم بـ data-hm وبيتوزّع على الأماكن. أي حاجة من core مش متعلّمة بتنزل في الآخر عشان ما يضيعش حاجة.

const HM = (ar, en) => lang === "en" ? en : ar;
const hmCall = (name, ...args) => { try { return typeof window[name] === "function" ? window[name](...args) || "" : ""; } catch (e) { console.warn("Home card failed:", name, e); return ""; } };

// بيقسّم HTML محتوى core على الأماكن حسب data-hm
function hmSplit(html) {
  const t = document.createElement("template"); t.innerHTML = String(html || "").trim();
  const root = t.content.firstElementChild, out = { rest: "" };
  if (!root) return out;
  for (const el of [...root.children]) {
    if (el.id === "ecaShopCard") out.shop = el.outerHTML;
    else if (el.dataset && el.dataset.hm) out[el.dataset.hm] = el.outerHTML;
    else out.rest += el.outerHTML;
  }
  return out;
}

function hmBossTile() {
  const list = ((arena.boss && arena.boss.list) || []).filter(b => typeof bossActive === "function" && bossActive(b));
  if (!list.length) return "";
  const a = list[0];
  return `<section class="gold-card hm-boss rounded-2xl p-4 flex items-center gap-3">
    <span class="text-4xl shrink-0" aria-hidden="true">${bossFace(a)}</span>
    <div class="min-w-0 flex-1 space-y-1"><h3 class="font-bold text-sm text-red-300">👹 ${HM("واجب الزعيم", "Boss homework")}${list.length > 1 ? " (" + list.length + ")" : ""}</h3>
      <p class="text-xs text-gray-200 truncate">${esc(a.title)} • <span dir="ltr">HP ${bossHP(a)}/${a.puzzles.length}</span> • ${esc(bossDueText(a))}</p>${bossBar(a, "eca-boss-hp")}</div>
    <button type="button" onclick="lbOpen('boss','${esc(a.id)}')" class="tap shrink-0 rounded-lg px-3 text-xs font-bold gold-btn">⚔️ ${HM("حارب", "Fight")}</button>
  </section>`;
}

// قسم بعنوان؛ الكروت جوه "tiles" بترتيبها ومقاسها في الشبكة
let hmTileN = 0;
function hmTile(html, cls) { return html ? `<div class="hm-tile ${cls || ""}" style="--i:${hmTileN++}">${html}</div>` : ""; }
function hmSection(icon, title, inner, cls) { return inner.trim() ? `<section class="hm-sec ${cls || ""}" aria-label="${esc(title)}"><h2 class="hm-sec-title"><span aria-hidden="true">${icon}</span> ${esc(title)}</h2><div class="hm-grid">${inner}</div></section>` : ""; }

function hmHomeHTML(s) {
  hmTileN = 0;
  const core = hmSplit(hmCall("ecaHomeCore", s));
  const rail = [hmBossTile(), hmCall("wkHomeCardHTML", s), hmCall("funEventCardHTML", s), hmCall("tournamentHomeCard", s), hmCall("saTrophyCardHTML", s)].filter(Boolean);
  const ann = hmCall("annStudentHTML", s);
  const top = `<div class="hm-hero">${hmTile(core.player, "hm-player-tile")}${hmTile(hmCall("flCardHTML", s, false), "hm-play-tile")}</div>`;
  const now = hmTile(hmCall("ecaQuestsCardHTML", s), "hm-quests")
    + (rail.length ? `<div class="hm-tile hm-rail-tile" style="--i:${hmTileN++}"><div class="hm-rail" role="list">${rail.map(c => `<div class="hm-rail-item" role="listitem">${c}</div>`).join("")}</div></div>` : "");
  const journey = hmTile(hmCall("ecaMapHTML", s), "hm-map") + hmTile(hmCall("streakCardHTML", s), "hm-streak")
    + hmTile(core.mission, "hm-mission") + hmTile(core.lesson, "hm-lesson");
  const rewards = hmTile(hmCall("ecaSpinCardHTML", s), "hm-third") + hmTile(hmCall("ecaPetHTML", s), "hm-third") + hmTile(core.shop, "hm-full");
  const trophies = hmTile(hmCall("ecaAchHTML", s), "hm-half") + hmTile(hmCall("liCardHTML", s, true), "hm-half") + hmTile(core.rest, "hm-full") + hmTile(hmCall("homeExtrasHTML"), "hm-full");
  return `<div class="hm">
    ${ann ? hmTile(ann, "hm-ann") : ""}
    ${top}
    ${hmSection("⚡", HM("النهاردة", "Today"), now, "hm-now")}
    ${hmSection("🗺️", HM("رحلتك", "Your journey"), journey)}
    ${hmSection("🎁", HM("جوايز وتجهيزات", "Rewards and gear"), rewards)}
    ${hmSection("🏅", HM("إنجازاتك", "Your achievements"), trophies)}
  </div>`;
}
window.hmHomeHTML = hmHomeHTML;

{
  const _sh = renderStudentHome;
  renderStudentHome = function (s) {
    if (!window.ecaHomeCore) return _sh.apply(this, arguments);
    // الحركة بتشتغل لما الطالب يدخل الرئيسية بس، مش مع كل تحديث للصفحة
    const intro = render.__pg !== "home|" + s.id && !(document.documentElement.classList.contains("eca-calm"));
    return intro ? hmHomeHTML(s).replace('<div class="hm">', '<div class="hm hm-intro">') : hmHomeHTML(s);
  };
}
