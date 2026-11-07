// ECA — loot.js: صندوق الكنز الغامض + أبطال الخريطة
// الجايزة محسوبة من الحساب ورقم الصندوق، والقواعد بتحسبها بنفس الطريقة، فمفيش اختيار للجايزة.

const ECA_CHEST_COST = 40;
const ECA_RARITY = { rare: ["نادر", "Rare", "#38bdf8"], legendary: ["أسطوري", "Legendary", "#facc15"] };

// ================= الأبطال: كل Step بتعدّيه بيفتح بطل =================
function ecaHeroesUnlocked(u) {
  const level = Number(u && u.level) || 1;
  return (window.ecaShopCatalog || []).filter(x => x.type === "hero" && level > x.step);
}
// أول ما بطل جديد يتفتح بتظهر نافذة احتفال، مرة واحدة لكل بطل
function ecaHeroCheck(u) {
  if (!u || u.role !== "student" || !window.ecaMilestone) return;
  const key = "ECA_HEROES_SEEN_" + u.id, unlocked = ecaHeroesUnlocked(u);
  let seen = null;
  try { seen = localStorage.getItem(key); } catch (_) { return; }
  try { localStorage.setItem(key, String(unlocked.length)); } catch (_) {}
  if (seen === null) return;   // أول مرة على الجهاز ده: من غير نافذة للأبطال القديمة
  const en = lang === "en";
  unlocked.slice(Number(seen) || 0).forEach(hero => ecaMilestone({
    icon: hero.icon, big: true,
    title: en ? "New hero unlocked!" : "بطل جديد اتفتح!",
    text: en ? `${hero.en} joined you for passing Step ${hero.step}. Use it as your avatar from the shop.` : `${hero.title} انضم ليك عشان عدّيت Step ${hero.step}. استخدمه كأفاتار من المتجر.`
  }));
}
{
  const _r = render;
  render = function () { const out = _r.apply(this, arguments), u = currUser(); if (u && !window.__authLoading) ecaHeroCheck(u); return out; };
}

// ================= صندوق الكنز =================
function ecaChestClose() { const el = document.getElementById("ecaChestModal"); if (el) el.remove(); }
window.ecaChestClose = ecaChestClose;
function ecaOpenChest() {
  const u = currUser(), en = lang === "en";
  if (!u || u.role !== "student" || document.getElementById("ecaChestModal")) return;
  const stars = Number((u.arena || {}).stars) || 0;
  const el = document.createElement("div");
  el.id = "ecaChestModal";
  el.className = "eca-spin-modal";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", en ? "Mystery chest" : "صندوق الكنز");
  el.innerHTML = `<div class="gold-card rounded-2xl p-6 space-y-4 text-center eca-spin-box">
    <h3 class="font-display font-bold text-xl text-yellow-300">🎁 ${en ? "Mystery chest" : "صندوق الكنز"}</h3>
    <div class="eca-chest-stage"><div class="eca-chest" id="ecaChest" aria-hidden="true">🎁</div><div class="eca-chest-flash" id="ecaChestFlash"></div></div>
    <div id="ecaChestPrize" class="min-h-[96px] space-y-1" aria-live="polite"><p class="text-sm text-gray-300">${en ? "XP boosts, rare piece sets or legendary avatar frames." : "خبرة إضافية، أو قطع نادرة، أو إطار أفاتار أسطوري."}</p></div>
    <div class="flex gap-2">
      <button type="button" id="ecaChestBtn" onclick="ecaChestGo()" ${stars < ECA_CHEST_COST ? "disabled" : ""} class="tap flex-1 rounded-xl text-sm font-bold gold-btn disabled:opacity-40">${en ? "Open" : "افتح"} (⭐ ${ECA_CHEST_COST})</button>
      <button type="button" onclick="ecaChestClose()" class="tap flex-1 rounded-xl text-sm font-bold bg-zinc-800 text-white border border-yellow-500/30">${en ? "Close" : "اقفل"}</button>
    </div>
  </div>`;
  document.body.appendChild(el);
}
window.ecaOpenChest = ecaOpenChest;
async function ecaChestGo() {
  const btn = document.getElementById("ecaChestBtn"), box = document.getElementById("ecaChestPrize"), chest = document.getElementById("ecaChest"), en = lang === "en";
  if (!btn || btn.disabled || !window.fbChest) return;
  btn.disabled = true;
  chest.classList.add("is-shaking");
  let result = null;
  try { result = await window.fbChest(); }
  catch (e) { console.warn("Mystery chest:", e && e.code); }
  const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  await new Promise(r => setTimeout(r, still ? 50 : 1200));
  if (!document.getElementById("ecaChestModal")) return;
  chest.classList.remove("is-shaking");
  if (!result || !result.ok) {
    box.innerHTML = "";
    const p = document.createElement("p");
    p.className = "text-sm text-gray-300";
    p.textContent = result && result.code === "insufficient-stars" ? (en ? "You need more stars." : "محتاج نجوم أكتر.") : (en ? "The chest could not be opened. Try again." : "الصندوق ما اتفتحش. حاول تاني.");
    box.appendChild(p);
    btn.disabled = false;
    return;
  }
  chest.textContent = "✨";
  const flash = document.getElementById("ecaChestFlash");
  if (flash) flash.classList.add("is-on");
  const item = result.item ? (window.ecaShopCatalog || []).find(x => x.id === result.item) : null;
  const rarity = item ? ECA_RARITY[item.rarity] : null;
  box.innerHTML = item
    ? `<div class="text-4xl" aria-hidden="true">${esc(item.icon || "")}</div><p class="text-lg font-bold text-white">${esc(en ? item.en : item.title)}</p><p class="text-xs font-bold" style="color:${rarity ? rarity[2] : "#38bdf8"}">${esc(rarity ? (en ? rarity[1] : rarity[0]) : "")}</p><p class="text-xs text-gray-400">${en ? "Saved in My items. Use it from the shop." : "اتحفظ في مخزونك. استخدمه من المتجر."}</p>`
    : `<div class="text-4xl" aria-hidden="true">⚡</div><p class="text-lg font-bold text-white">+${esc(result.xpDelta)} XP</p><p class="text-xs text-gray-400">${result.duplicate ? (en ? "You already had that item, so it turned into XP." : "العنصر ده كان معاك، فاتحوّل لخبرة.") : (en ? "XP boost!" : "خبرة إضافية!")}</p>`;
  if (item && item.rarity === "legendary") { if (window.ecaFireworks) ecaFireworks(4); if (window.ecaCheer) ecaCheer("hype"); }
  else if (window.ecaConfetti) ecaConfetti(80);
  if (window.ecaSfx) ecaSfx("levelup");
  btn.textContent = (en ? "Open another" : "افتح تاني") + " (⭐ " + ECA_CHEST_COST + ")";
  btn.disabled = (Number(((currUser() || {}).arena || {}).stars) || 0) < ECA_CHEST_COST;
  setTimeout(() => { const f = document.getElementById("ecaChestFlash"); if (f) f.classList.remove("is-on"); const c = document.getElementById("ecaChest"); if (c) c.textContent = "🎁"; }, 1800);
  render();
}
window.ecaChestGo = ecaChestGo;
document.addEventListener("keydown", e => { if (e.key === "Escape") ecaChestClose(); });
