// ECA — adventure.js: خريطة المغامرة + الرفيق + الإنجازات السرية + عجلة الحظ
// بيعتمد على: STEPS, calcStats, calcXP (core/extras) و ecaSfx (gamify.js) و fbEconomy (firebase.js)

// ================= خريطة المغامرة =================
const ECA_MAP = [
  { step: 1, icon: "🏝️", ar: "مملكة البيدق", en: "Pawn Kingdom", x: 22, y: 88 },
  { step: 2, icon: "🌲", ar: "قلعة الحصان", en: "Knight Castle", x: 72, y: 73 },
  { step: 3, icon: "⛰️", ar: "برج الفيل", en: "Bishop Tower", x: 28, y: 56 },
  { step: 4, icon: "🏰", ar: "حصن الطابية", en: "Rook Fortress", x: 74, y: 40 },
  { step: 5, icon: "🌋", ar: "إمبراطورية الوزير", en: "Queen Empire", x: 26, y: 24 },
  { step: 6, icon: "👑", ar: "عرش الملك", en: "King's Throne", x: 68, y: 8 }
];
function ecaMapClick(step) {
  const u = currUser(), en = lang === "en", level = Number(u && u.level) || 1;
  if (step === level) return switchTab("lessons");
  toast(step < level
    ? (en ? "You already finished this chapter!" : "خلصت الفصل ده قبل كده!")
    : (en ? "Locked. Pass your current step to reach it." : "مقفول. عدّي الـ Step الحالي عشان توصله."));
}
window.ecaMapClick = ecaMapClick;
function ecaMapHTML(stu) {
  const en = lang === "en", level = Number(stu.level) || 1, s = calcStats(stu), pet = ecaPetOf(stu);
  const nodes = ECA_MAP.map(n => {
    const state = n.step < level ? "done" : n.step === level ? "now" : "locked", name = en ? n.en : n.ar;
    const hero = (window.ecaShopCatalog || []).find(x => x.type === "hero" && x.step === n.step);
    const label = name + " • Step " + n.step + (state === "locked" ? (en ? " (locked)" : " (مقفول)") : "") + (hero ? " • " + (en ? "Hero: " + hero.en : "البطل: " + hero.title) : "");
    return `<button type="button" onclick="ecaMapClick(${n.step})" aria-label="${esc(label)}" title="${esc(label)}" class="eca-map-node is-${state}" style="left:${n.x}%;top:${n.y}%">
      <span class="eca-map-disc" aria-hidden="true">${state === "locked" ? "🔒" : n.icon}</span>
      <span class="eca-map-name">${esc(name)}</span>
      ${state === "now" ? `<span class="eca-map-pet" aria-hidden="true">${esc(pet.icon)}</span>` : ""}
      ${state === "done" ? `<span class="eca-map-check" aria-hidden="true">✓</span>` : ""}
      ${hero ? `<span class="eca-map-hero ${state === "done" ? "is-won" : ""}" aria-hidden="true">${esc(hero.icon)}</span>` : ""}
    </button>`;
  }).join("");
  const points = ECA_MAP.map(n => n.x + "," + n.y).join(" ");
  return `<section class="gold-card rounded-2xl p-4 space-y-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="font-display font-bold text-lg text-yellow-300">🗺️ ${en ? "Adventure map" : "خريطة المغامرة"}</h3>
      <span class="text-xs text-gray-300">${en ? "Lessons" : "الدروس"}: ${esc(s.attC)}/${esc(s.total)}</span>
    </div>
    <div class="eca-map">
      <svg class="eca-map-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="1 7" stroke-linecap="round" vector-effect="non-scaling-stroke" /></svg>
      ${nodes}
    </div>
  </section>`;
}

// ================= الرفيق: بيكبر مع الخبرة =================
const ECA_PETS = {
  dragon: { ar: "التنين", en: "Dragon", stages: ["🥚", "🦎", "🐲", "🐉", "🐉"] },
  cat: { ar: "الأسد", en: "Lion", stages: ["🥚", "🐱", "😺", "🐈", "🦁"] }
};
const ECA_PET_XP = [0, 300, 1000, 2500, 5000];
const ECA_PET_NAMES = [["بيضة", "Egg"], ["صغير", "Baby"], ["شقي", "Young"], ["قوي", "Strong"], ["أسطوري", "Legendary"]];
function ecaPetOf(stu) {
  const kind = ((stu.arena || {}).pet in ECA_PETS) ? stu.arena.pet : "", xp = calcXP(stu).total;
  let stage = 0;
  ECA_PET_XP.forEach((min, i) => { if (xp >= min) stage = i; });
  const next = ECA_PET_XP[stage + 1], from = ECA_PET_XP[stage];
  return { kind, stage, xp, next, percent: next ? Math.min(100, Math.round((xp - from) / (next - from) * 100)) : 100, icon: kind ? ECA_PETS[kind].stages[stage] : "🥚" };
}
function ecaPetPick(kind) {
  const u = currUser();
  if (!u || u.role !== "student" || !ECA_PETS[kind]) return;
  u.arena = u.arena || {};
  u.arena.pet = kind;
  save();
  ecaSfx("ting");
  render();
}
window.ecaPetPick = ecaPetPick;
function ecaPetHTML(stu) {
  const en = lang === "en", p = ecaPetOf(stu);
  if (!p.kind) return `<section class="gold-card rounded-2xl p-4 space-y-3">
    <h3 class="font-display font-bold text-lg text-yellow-300">🥚 ${en ? "Choose your companion" : "اختار رفيقك"}</h3>
    <p class="text-sm text-gray-300">${en ? "It grows as you earn XP." : "هيكبر كل ما تجمع خبرة."}</p>
    <div class="grid grid-cols-2 gap-2">${Object.keys(ECA_PETS).map(k => `<button type="button" onclick="ecaPetPick('${k}')" class="tap rounded-xl px-3 text-sm font-bold gold-btn">${ECA_PETS[k].stages[4]} ${en ? ECA_PETS[k].en : ECA_PETS[k].ar}</button>`).join("")}</div>
  </section>`;
  const stageName = ECA_PET_NAMES[p.stage][en ? 1 : 0], petName = en ? ECA_PETS[p.kind].en : ECA_PETS[p.kind].ar;
  return `<section class="gold-card rounded-2xl p-4 flex items-center gap-4">
    <span class="eca-pet" aria-hidden="true">${esc(p.icon)}</span>
    <div class="min-w-0 flex-1">
      <h3 class="font-bold text-sm text-yellow-300">${esc(petName)} • ${esc(stageName)}</h3>
      <div class="eca-quest-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.percent}" aria-label="${en ? "Companion growth" : "نمو الرفيق"}"><div style="width:${p.percent}%"></div></div>
      <p class="text-xs text-gray-400 mt-1" dir="ltr">${p.next ? esc(p.xp) + " / " + esc(p.next) + " XP" : esc(p.xp) + " XP"}</p>
    </div>
  </section>`;
}

// ================= الإنجازات السرية =================
const ECA_ACH = [
  { id: "night-owl", icon: "🦉", ar: "بومة الليل", en: "Night Owl", dAr: "حليت لغز بعد نص الليل", dEn: "Solved a puzzle after midnight" },
  { id: "speed-demon", icon: "⚡", ar: "شيطان السرعة", en: "Speed Demon", dAr: "3 حلول ورا بعض، كل واحد في أقل من 10 ثواني", dEn: "3 solutions in a row, each under 10 seconds" },
  { id: "storm", icon: "🌪️", ar: "الإعصار", en: "The Storm", dAr: "15 لغز أو أكتر في تحدي 60 ثانية", dEn: "15 or more in Puzzle Rush" },
  { id: "coach-slayer", icon: "🤖", ar: "قاهر الكوتش", en: "Coach Slayer", dAr: "كسبت Coach مستوى 10", dEn: "Beat Coach level 10" },
  { id: "collector", icon: "🎒", ar: "الجامع", en: "The Collector", dAr: "اشتريت 5 عناصر من المتجر", dEn: "Bought 5 shop items" },
  { id: "duelist", icon: "⚔️", ar: "المبارز", en: "The Duelist", dAr: "كسبت أول تحدي مباشر", dEn: "Won your first live duel" }
];
function ecaAchUnlock(ids) {
  const u = currUser();
  if (!u || u.role !== "student") return;
  u.arena = u.arena || {};
  const have = Array.isArray(u.arena.ach) ? u.arena.ach : [], fresh = ids.filter(id => !have.includes(id));
  if (!fresh.length) return;
  u.arena.ach = [...have, ...fresh];
  save();
  const item = ECA_ACH.find(x => x.id === fresh[0]);
  if (window.ecaMilestone) ecaMilestone({ icon: item.icon, title: lang === "en" ? "Secret achievement!" : "إنجاز سري!", text: (lang === "en" ? item.en + ": " + item.dEn : item.ar + ": " + item.dAr) });
  else toast((lang === "en" ? "Secret achievement: " : "إنجاز سري: ") + item.icon + " " + (lang === "en" ? item.en : item.ar));
}
// الإنجازات اللي بتتحسب من بيانات الطالب نفسها
function ecaAchScan(u) {
  const a = u.arena || {}, shop = u.shop || {}, ids = [];
  if ((Number(a.rushBest) || 0) >= 15) ids.push("storm");
  if (a.cb && Number(a.cb.k) === 10) ids.push("coach-slayer");
  if ((shop.items || []).length + (shop.titles || []).length >= 5) ids.push("collector");
  if ((Number(a.duelW) || 0) >= 1) ids.push("duelist");
  if (ids.length) ecaAchUnlock(ids);
}
let ecaLastSolve = 0, ecaQuickRun = 0;
function ecaOnSolve() {
  const now = Date.now(), hour = new Date().getHours(), ids = [];
  ecaQuickRun = ecaLastSolve && now - ecaLastSolve < 10000 ? ecaQuickRun + 1 : 1;
  ecaLastSolve = now;
  if (hour >= 0 && hour < 5) ids.push("night-owl");
  if (ecaQuickRun >= 3) ids.push("speed-demon");
  if (ids.length) ecaAchUnlock(ids);
}
window.ecaOnSolve = ecaOnSolve;
{
  const _pc = puzCount;
  puzCount = function (solved) {
    const Z = arena.puz;
    if (solved && !Z.counted && !Z.review) {
      ecaOnSolve();
      const streak = Number(((currUser() || {}).arena || {}).puzStreak) || 0;
      if ((streak + 1) % 5 === 0 && window.ecaCheer) ecaCheer("hype");
    } else if (!solved && !Z.counted && !Z.review && window.ecaCheer) ecaCheer("retry");
    return _pc(solved);
  };
}
function ecaAchHTML(stu) {
  const en = lang === "en", have = Array.isArray((stu.arena || {}).ach) ? stu.arena.ach : [];
  return `<details class="gold-card rounded-2xl p-4 faq">
    <summary class="tap flex items-center justify-between gap-2 font-bold text-yellow-300"><span>🕵️ ${en ? "Secret achievements" : "الإنجازات السرية"}</span><span class="text-xs text-gray-300">${have.length}/${ECA_ACH.length}</span></summary>
    <div class="grid sm:grid-cols-2 gap-2 mt-3">${ECA_ACH.map(item => have.includes(item.id)
      ? `<div class="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-yellow-500/30"><span class="text-2xl" aria-hidden="true">${item.icon}</span><div class="min-w-0"><div class="text-sm font-bold text-white">${esc(en ? item.en : item.ar)}</div><div class="text-xs text-gray-400">${esc(en ? item.dEn : item.dAr)}</div></div></div>`
      : `<div class="flex items-center gap-3 p-3 rounded-xl bg-black/30 border border-gray-500/20 opacity-70"><span class="text-2xl" aria-hidden="true">🔒</span><div class="text-sm font-bold text-gray-400">${en ? "Secret" : "سر"}</div></div>`).join("")}</div>
  </details>`;
}

// ================= عجلة الحظ =================
// الجايزة محسوبة من الحساب واليوم، والقواعد بتحسبها بنفس الطريقة، فمفيش إعادة لف بتحديث الصفحة
const ECA_WHEEL = [
  { stars: 1, label: "⭐ 1", color: "#2563eb" }, { stars: 2, label: "⭐ 2", color: "#9333ea" }, { stars: 3, label: "⭐ 3", color: "#0891b2" },
  { stars: 5, label: "⭐ 5", color: "#ca8a04" }, { xp: 100, label: "⚡ 100", color: "#db2777" }, { freeze: true, label: "🧊", color: "#0284c7" }
];
function ecaSpinDay() { return window.ecaCairoDay ? window.ecaCairoDay() : todayISO(); }
function ecaSpinDone(u) { return ((u && u.arena) || {}).sp === ecaSpinDay(); }
function ecaSpinClose() { const el = document.getElementById("ecaSpinModal"); if (el) el.remove(); }
window.ecaSpinClose = ecaSpinClose;
function ecaSpinOpen() {
  const u = currUser(), en = lang === "en";
  if (!u || u.role !== "student" || document.getElementById("ecaSpinModal")) return;
  const step = 360 / ECA_WHEEL.length;
  const stops = ECA_WHEEL.map((seg, i) => `${seg.color} ${i * step}deg ${(i + 1) * step}deg`).join(",");
  const el = document.createElement("div");
  el.id = "ecaSpinModal";
  el.className = "eca-spin-modal";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", en ? "Lucky wheel" : "عجلة الحظ");
  el.innerHTML = `<div class="gold-card rounded-2xl p-5 space-y-4 text-center eca-spin-box">
    <h3 class="font-display font-bold text-xl text-yellow-300">🎡 ${en ? "Lucky wheel" : "عجلة الحظ"}</h3>
    <div class="eca-wheel-wrap">
      <div class="eca-wheel-pin" aria-hidden="true">▼</div>
      <div class="eca-wheel" id="ecaWheel" style="background:conic-gradient(${stops})">${ECA_WHEEL.map((seg, i) => `<span style="transform:rotate(${i * step + step / 2}deg) translateY(-92px) rotate(${-(i * step + step / 2)}deg)">${esc(seg.label)}</span>`).join("")}</div>
    </div>
    <p class="text-sm font-bold text-white min-h-[44px]" id="ecaSpinResult" aria-live="polite">${en ? "One free spin every day!" : "لفة مجانية كل يوم!"}</p>
    <div class="flex gap-2">
      <button type="button" id="ecaSpinBtn" onclick="ecaSpinGo()" class="tap flex-1 rounded-xl text-sm font-bold gold-btn">${en ? "Spin" : "لف العجلة"}</button>
      <button type="button" onclick="ecaSpinClose()" class="tap flex-1 rounded-xl text-sm font-bold bg-zinc-800 text-white border border-yellow-500/30">${en ? "Close" : "اقفل"}</button>
    </div>
  </div>`;
  document.body.appendChild(el);
}
window.ecaSpinOpen = ecaSpinOpen;
async function ecaSpinGo() {
  const btn = document.getElementById("ecaSpinBtn"), resultEl = document.getElementById("ecaSpinResult"), en = lang === "en";
  if (!btn || btn.disabled || !window.fbEconomy) return;
  btn.disabled = true;
  let result = null;
  try { result = await window.fbEconomy({ op: "earn", source: "spin" }); }
  catch (e) { console.warn("Lucky wheel:", e && e.code); }
  if (!document.getElementById("ecaSpinModal")) return;
  if (!result || !result.ok) { resultEl.textContent = en ? "The spin could not be saved. Try again." : "اللفة ما اتسجلتش. حاول تاني."; btn.disabled = false; return; }
  if (result.duplicate) { resultEl.textContent = en ? "You already spun today. Come back tomorrow!" : "لفيت النهاردة. استنى لبكرة!"; return; }
  const index = result.starsDelta ? ECA_WHEEL.findIndex(s => s.stars === result.starsDelta) : result.xpDelta ? 4 : 5;
  const step = 360 / ECA_WHEEL.length, wheel = document.getElementById("ecaWheel");
  wheel.style.transform = `rotate(${360 * 5 + 360 - (index * step + step / 2)}deg)`;
  const still = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  setTimeout(() => {
    if (!document.getElementById("ecaSpinModal")) return;
    ecaSfx("levelup");
    resultEl.textContent = index === 5 ? (en ? "You won a Streak Freeze! 🧊" : "كسبت حماية سلسلة! 🧊")
      : index === 4 ? (en ? "You won 100 XP! ⚡" : "كسبت 100 خبرة! ⚡")
      : (en ? `You won ${result.starsDelta} stars! ⭐` : `كسبت ${result.starsDelta} نجوم! ⭐`);
    render();
  }, still ? 50 : 3700);
}
window.ecaSpinGo = ecaSpinGo;
document.addEventListener("keydown", e => { if (e.key === "Escape") ecaSpinClose(); });
function ecaSpinCardHTML(stu) {
  const en = lang === "en", done = ecaSpinDone(stu);
  return `<section class="gold-card rounded-2xl p-4 flex items-center justify-between gap-3">
    <div class="min-w-0"><h3 class="font-bold text-sm text-yellow-300">🎡 ${en ? "Lucky wheel" : "عجلة الحظ"}</h3>
      <p class="text-xs text-gray-400">${done ? (en ? "Come back tomorrow for a new spin." : "ارجع بكرة للفة جديدة.") : (en ? "Your free spin is ready!" : "لفتك المجانية جاهزة!")}</p></div>
    <button type="button" onclick="ecaSpinOpen()" ${done ? "disabled" : ""} class="tap rounded-lg px-3 text-xs font-bold gold-btn disabled:opacity-40">${en ? "Spin" : "لف"}</button>
  </section>`;
}
// بتفتح لوحدها مرة واحدة في اليوم على الصفحة الرئيسية
let ecaSpinAuto = false;
function ecaSpinAutoOpen(u) {
  if (ecaSpinAuto || tab !== "home" || !window.fbEconomy || ecaSpinDone(u)) return;
  const key = "ECA_SPIN_SEEN_" + u.id, day = ecaSpinDay();
  ecaSpinAuto = true;
  try { if (localStorage.getItem(key) === day) return; } catch (_) {}
  setTimeout(() => {
    // لو الطالب ساب الرئيسية قبل ما تفتح، تستنى زيارته الجاية ليها
    if (tab !== "home") { ecaSpinAuto = false; return; }
    try { localStorage.setItem(key, day); } catch (_) {}
    ecaSpinOpen();
  }, 1500);
}

// ================= ربطهم بالصفحة الرئيسية =================
{
  const _sh = renderStudentHome;
  renderStudentHome = function (s) {
    return `<div class="space-y-6">
      <div class="grid sm:grid-cols-2 gap-3">${ecaPetHTML(s)}${ecaSpinCardHTML(s)}</div>
      ${ecaMapHTML(s)}
      ${_sh(s)}
      ${ecaAchHTML(s)}
    </div>`;
  };
  const _r = render;
  render = function () {
    const out = _r.apply(this, arguments), u = currUser();
    if (u && u.role === "student" && !window.__authLoading) { ecaAchScan(u); ecaSpinAutoOpen(u); }
    return out;
  };
}
