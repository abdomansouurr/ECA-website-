// ECA — boss.js: واجب الزعيم عند الطالب + استلام جوائز الحصة المباشرة
// الكوتش بيبعت باقة ألغاز لمجموعة كاملة. الزعيم بيظهر على خريطة المغامرة، وصحته = عدد الألغاز،
// وكل حل صح بيشيل نقطة. لما الصحة توصل صفر الطالب بياخد ⭐ 10 و 200 خبرة بإيصال القواعد بتتأكد منه.

arena.boss = { key: "", list: null, unsub: null, aid: "", status: "idle", busy: false, game: null, sol: [], idx: 0, color: "w", flip: false, sel: null, last: null, flash: null, pid: "", pz: null, lastHit: 0, claimed: {} };
const BL = (ar, en) => lang === "en" ? en : ar;
const BOSS_FACES = ["👹", "🐲", "👾", "🦂", "🧌", "🐙"];
const BOSS_STARS = 10, BOSS_XP = 200;
function bossFace(a) { let h = 0; for (const c of String(a.id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return BOSS_FACES[h % BOSS_FACES.length]; }
function bossHP(a) { return Math.max(0, a.puzzles.length - (a.solved || []).length); }
function bossActive(a) { return !a.done && a.dueMs > Date.now(); }
function bossDueText(a) {
  const days = Math.ceil((a.dueMs - Date.now()) / 864e5);
  if (a.dueMs <= Date.now()) return BL("الوقت خلص", "Time is up");
  return days <= 1 ? BL("آخر يوم!", "Last day!") : BL(`باقي ${days} أيام`, `${days} days left`);
}
function bossBar(a, cls) {
  const total = a.puzzles.length, hp = bossHP(a), pct = total ? Math.round(hp / total * 100) : 0;
  return `<span class="${cls}" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${hp}" aria-label="HP ${hp}/${total}"><i style="width:${pct}%"></i></span>`;
}

// ================= إيجاد اللغز: بنك واجبات الدروس، وبعده بنك ألغاز الامتحانات =================
let bossIndex = null;
function bossHwIndex() {
  if (bossIndex) return bossIndex;
  const hw = window.ECA_HOMEWORK;
  if (!hw) return null;
  bossIndex = {};
  Object.keys(hw).forEach(k => ((hw[k] || {}).puzzles || []).forEach(p => {
    if (p && p.id && p.f && Array.isArray(p.m) && !bossIndex[p.id]) bossIndex[p.id] = { fen: p.f, moves: p.m.join(" "), setup: false };
  }));
  return bossIndex;
}
async function ecaBossFind(id) {
  if (!/^[A-Za-z0-9]{3,20}$/.test(String(id))) return null;
  if (!window.ECA_HOMEWORK && window.loadModule) { try { await loadModule("homework"); } catch (_) {} }
  const idx = bossHwIndex();
  if (idx && idx[id]) return idx[id];
  const b = window.ecaPzFind ? await ecaPzFind(id) : null;
  if (b) return { fen: b.fen, moves: b.moves, setup: true };
  try {
    const tb = window.loadThemeBank ? await loadThemeBank() : null;
    for (const t of Object.keys((tb && tb.themes) || {})) for (const level of tb.themes[t]) {
      const row = level.find(r => r.split("|")[0] === id);
      if (row) { const p = row.split("|"); return { fen: p[1], moves: p[2], setup: true }; }
    }
  } catch (_) {}
  return null;
}
window.ecaBossFind = ecaBossFind;

// ================= المتابعة اللحظية لواجبات مجموعة الطالب =================
function bossPaint() {
  if (tab === "arena" && arena.sub === "boss") arenaRefresh();
  else if (tab === "home") render();
}
function bossLifecycle() {
  const B = arena.boss, u = currUser();
  const want = u && u.role === "student" && !window.__authLoading && window.fbBossMine ? u.id + "|" + (u.group || "") : "";
  if (want === B.key) return;
  if (B.unsub) { B.unsub(); B.unsub = null; }
  Object.assign(B, { key: want, list: want && !u.group ? [] : null, aid: "", status: "idle", game: null });
  if (!want || !u.group) return;
  B.unsub = window.fbBossMine(u.group, rows => {
    if (B.key !== want) return;
    const prev = B.list || [];
    rows.forEach(r => { const p = prev.find(x => x.id === r.id); if (p && (p.solved || []).length > r.solved.length) { r.solved = p.solved; r.done = p.done; } });
    const before = JSON.stringify(B.list);
    B.list = rows.sort((x, y) => x.dueMs - y.dueMs);
    rows.filter(r => r.done).forEach(r => bossClaim(r, false));
    if (before !== JSON.stringify(B.list) && !["play", "hit", "block"].includes(B.status)) bossPaint();
  });
}
// الجايزة بتتطلب مرة واحدة في الجلسة، والإيصال بيمنع التكرار على السيرفر
async function bossClaim(a, celebrate) {
  const B = arena.boss;
  if (B.claimed[a.id] || !window.fbEconomy) return;
  B.claimed[a.id] = true;
  let res = null;
  try { res = await window.fbEconomy({ op: "earn", source: "boss", key: a.id, mult: window.coachBossMult ? coachBossMult(a.id) : 1 }); }
  catch (e) { console.warn("Boss reward failed:", e && e.code); }
  if (!res || !res.ok) { B.claimed[a.id] = false; return; }
  if (res.duplicate) return;
  if (!celebrate) toast(BL(`🏆 جايزة الزعيم: +${BOSS_STARS} ⭐ و +${BOSS_XP} خبرة`, `🏆 Boss reward: +${BOSS_STARS} ⭐ and +${BOSS_XP} XP`));
  else if (window.ecaMilestone) ecaMilestone({ icon: "🏆", big: true, title: BL("هزمت الزعيم!", "Boss defeated!"), text: BL(`${a.title}: +${BOSS_STARS} ⭐ و +${BOSS_XP} خبرة`, `${a.title}: +${BOSS_STARS} ⭐ and +${BOSS_XP} XP`) });
  if (window.ecaHudUpdate) ecaHudUpdate();
}

// ================= المعركة =================
function ecaBossOpen(aid) {
  if (!/^[A-Za-z0-9]{6,40}$/.test(String(aid))) return;
  Object.assign(arena.boss, { aid, status: "idle", game: null, busy: false });
  arena.sub = "boss";
  switchTab("arena");
}
window.ecaBossOpen = ecaBossOpen;
function bossBack() { Object.assign(arena.boss, { aid: "", status: "idle", game: null }); arenaRefresh(); }
window.bossBack = bossBack;
function bossCur() { return (arena.boss.list || []).find(a => a.id === arena.boss.aid) || null; }
async function bossNext() {
  const B = arena.boss, a = bossCur();
  if (!a || B.busy || typeof ChessCls === "undefined" || !ChessCls) return;
  if (!bossActive(a)) { B.status = "idle"; B.game = null; return arenaRefresh(); }
  const pid = a.puzzles.find(p => !(a.solved || []).includes(p));
  if (!pid) return;
  B.busy = true; B.status = "loading"; arenaRefresh();
  const pz = await ecaBossFind(pid);
  B.busy = false;
  if (!pz) { B.status = "idle"; toast(BL("اللغز ده مش موجود. كلّم الكوتش.", "This puzzle is missing. Tell your coach.")); return arenaRefresh(); }
  try { ecaPzSetup(B, pz.fen, pz.moves, pz.setup); }
  catch (e) { B.status = "idle"; toast(BL("اللغز ده فيه مشكلة. كلّم الكوتش.", "This puzzle is broken. Tell your coach.")); return arenaRefresh(); }
  Object.assign(B, { pid, pz, status: "play" });
  arenaRefresh();
}
window.bossNext = bossNext;
function bossClick(sq) { const B = arena.boss; if (B.status !== "play" || B.busy) return; ecaPzClick(B, sq, bossMove); }
window.bossClick = bossClick;
window.bossNoop = () => {};
function bossSfx(kind) {
  if (typeof sfxNotes !== "function") return;
  if (kind === "hit") sfxNotes([1568, 1175, 784, 392], 0.035, 0.14, 0.13);
  else if (kind === "block") sfxNotes([220, 196, 165], 0.07, 0.2, 0.12);
}
// المؤثرات بتتحط بعد ما الصفحة تترسم، عشان الرسم ما يمسحهاش
function bossFx(kind) {
  const face = document.getElementById("ecaBossFace"), stage = document.getElementById("ecaBossStage");
  bossSfx(kind);
  if (!face || !stage) return;
  face.classList.remove("is-hit", "is-block"); void face.offsetWidth; face.classList.add(kind === "hit" ? "is-hit" : "is-block");
  if (kind === "hit") {
    const slash = document.createElement("span"); slash.className = "eca-boss-slash"; slash.setAttribute("aria-hidden", "true"); slash.textContent = "⚔️";
    const dmg = document.createElement("span"); dmg.className = "eca-boss-dmg"; dmg.setAttribute("aria-hidden", "true"); dmg.textContent = "-1 HP";
    stage.appendChild(slash); stage.appendChild(dmg);
    setTimeout(() => { slash.remove(); dmg.remove(); }, 1000);
  } else if (window.ecaShake) ecaShake();
}
async function bossMove(mv) {
  const B = arena.boss, a = bossCur(), result = ecaPzPlay(B, mv);
  if (!a) return;
  if (result === "illegal" || result === "next") { if (result === "next" && window.ecaSfx) ecaSfx("ting"); return arenaRefresh(); }
  if (result === "bad") {
    // الزعيم صد الضربة: نفس اللغز بيرجع من الأول
    B.status = "block"; arenaRefresh(); bossFx("block");
    if (window.ecaCheer) ecaCheer("retry");
    setTimeout(() => { if (arena.boss.status === "block" && arena.boss.pz) { ecaPzSetup(B, B.pz.fen, B.pz.moves, B.pz.setup); B.status = "play"; if (tab === "arena" && arena.sub === "boss") arenaRefresh(); } }, 900);
    return;
  }
  B.status = "hit"; B.busy = true; arenaRefresh(); bossFx("hit");
  // القواعد بتقبل ضربة كل ثانيتين على الأكتر
  const wait = B.lastHit + 2300 - Date.now();
  await new Promise(r => setTimeout(r, Math.max(700, wait)));
  try {
    let res = null;
    for (let tries = 0; ; tries++) {
      try { res = await window.fbBossHit(a.id, B.pid); break; }
      catch (e) {
        if (tries >= 3 || !(!navigator.onLine || (e && e.code === "unavailable"))) throw e;
        if (tries === 0) toast(BL("مفيش نت: الضربة هتتسجّل أول ما يرجع.", "No internet: the hit will be saved when you're back online."));
        await new Promise(r => { if (navigator.onLine) setTimeout(r, 3000); else addEventListener("online", () => setTimeout(r, 1500), { once: true }); });
      }
    }
    B.lastHit = Date.now();
    a.solved = res.solved.map(String); a.done = !!res.done;
  } catch (e) {
    console.warn("Boss hit failed:", e && e.code);
    toast(BL("الضربة ما اتسجلتش. حاول تاني.", "The hit was not saved. Try again."));
    B.busy = false; B.status = "idle"; B.game = null;
    return arenaRefresh();
  }
  B.busy = false;
  if (a.done) {
    B.status = "won"; B.game = null; arenaRefresh();
    if (window.ecaSfx) ecaSfx("levelup");
    if (window.ecaFireworks) ecaFireworks(4);
    if (window.ecaCheer) ecaCheer("hype");
    bossClaim(a, true);
    return;
  }
  B.status = "idle"; B.game = null;
  if (tab === "arena" && arena.sub === "boss") bossNext(); else B.status = "idle";
}

// ================= الصفحات =================
function bossCardHTML(a) {
  const over = !a.done && a.dueMs <= Date.now(), total = a.puzzles.length;
  return `<li class="rounded-xl bg-black/30 border ${a.done ? "border-emerald-500/40" : over ? "border-zinc-700" : "border-red-500/40"} p-3 flex items-center gap-3">
    <span class="text-4xl shrink-0" aria-hidden="true">${a.done ? "🏆" : bossFace(a)}</span>
    <div class="min-w-0 flex-1 space-y-1"><b class="block text-sm text-white truncate">${esc(a.title)}</b>
      ${bossBar(a, "eca-boss-hp")}
      <span class="block text-xs text-gray-400"><span dir="ltr">HP ${bossHP(a)}/${total}</span> • ${a.done ? BL("اتهزم ✓", "Defeated ✓") : esc(bossDueText(a))}</span></div>
    ${bossActive(a) ? `<button type="button" onclick="ecaBossOpen('${esc(a.id)}')" class="tap shrink-0 rounded-lg px-3 text-xs font-bold gold-btn">⚔️ ${BL("حارب", "Fight")}</button>` : ""}
  </li>`;
}
function arenaBossHTML() {
  const B = arena.boss, u = currUser();
  const head = `<h3 class="font-display font-bold text-lg text-yellow-300">👹 ${BL("واجب الزعيم", "Boss homework")}</h3>`;
  const wrap = body => `<div class="gold-card rounded-2xl p-3 sm:p-5 space-y-3 max-w-xl w-full mx-auto">${body}</div>`;
  if (!u || u.role !== "student") return wrap(`${head}<p class="text-sm text-gray-300">${BL("الواجبات بتتبعت من «مركز الكوتش».", "Homework is sent from the Coach Command Center.")}</p>`);
  if (!u.group) return wrap(`${head}<p class="text-sm text-gray-300">${BL("لسه مش في مجموعة. الكوتش هيضيفك قريب.", "You are not in a group yet. Your coach will add you soon.")}</p>`);
  if (B.list === null) return wrap(`${head}<p class="text-sm text-gray-300">${BL("بنحمّل...", "Loading...")}</p>`);
  const a = bossCur();
  if (!a) return wrap(`${head}${B.list.length ? `<ul class="space-y-2">${B.list.map(bossCardHTML).join("")}</ul>` : `<p class="text-sm text-gray-300">${BL("مفيش زعيم دلوقتي. استنى واجب الكوتش الجاي!", "No boss right now. Wait for your coach's next homework!")}</p>`}`);
  const total = a.puzzles.length, hp = bossHP(a), playing = ["play", "hit", "block", "loading"].includes(B.status) && B.game;
  const stage = `<div class="eca-boss-stage" id="ecaBossStage">
    <span class="eca-boss-face" id="ecaBossFace" aria-hidden="true">${a.done ? "💀" : bossFace(a)}</span>
    <b class="text-base text-white text-center">${esc(a.title)}</b>
    ${bossBar(a, "eca-boss-bar")}
    <span class="text-sm font-bold text-red-300" dir="ltr">HP ${hp}/${total}</span>
    <span class="text-xs text-gray-400">${esc(cmdMotifNameSafe(a.motif))} • ${a.done ? BL("اتهزم", "Defeated") : esc(bossDueText(a))}</span>
  </div>`;
  const back = `<button type="button" onclick="bossBack()" class="tap rounded-lg px-3 text-xs font-bold bg-zinc-800 text-white border border-yellow-500/30">${BL("→ كل الزعامات", "← All bosses")}</button>`;
  if (a.done) return wrap(`${back}${stage}<p class="text-center text-sm font-bold text-emerald-300">🏆 ${BL(`هزمته! خدت ${BOSS_STARS} ⭐ و ${BOSS_XP} خبرة.`, `You beat it! You earned ${BOSS_STARS} ⭐ and ${BOSS_XP} XP.`)}</p>`);
  if (!bossActive(a)) return wrap(`${back}${stage}<p class="text-center text-sm text-gray-300">${BL("الوقت خلص قبل ما الزعيم يتهزم.", "Time ran out before the boss was defeated.")}</p>`);
  if (playing) {
    const msg = B.status === "block" ? BL("🛡️ الزعيم صد الضربة! جرّب تاني.", "🛡️ The boss blocked it! Try again.")
      : B.status === "hit" ? BL("⚔️ ضربة قوية!", "⚔️ Direct hit!")
      : B.color === "w" ? BL("اضرب بالحل الصح • الدور على الأبيض", "Strike with the right move • White to move") : BL("اضرب بالحل الصح • الدور على الأسود", "Strike with the right move • Black to move");
    return wrap(`${back}${stage}${boardHTML({ game: B.game, flip: B.flip, sel: B.sel, targets: targetsOf(B.game, B.sel), last: B.last, flash: B.flash, onClick: B.status === "play" ? "bossClick" : "bossNoop" })}
      <p class="text-center text-sm font-bold ${B.status === "block" ? "text-red-300" : "text-gray-200"}" aria-live="polite">${msg}</p>
      ${window.coachHintBtnHTML ? coachHintBtnHTML("boss") : ""}`);
  }
  return wrap(`${back}${stage}<p class="text-sm text-gray-300 text-center">${BL("كل لغز تحله بيشيل نقطة من صحة الزعيم. النقلة الغلط مش بتخسرك حاجة، بس الزعيم بيصدها.", "Every puzzle you solve takes 1 HP. A wrong move costs nothing, but the boss blocks it.")}</p>
    <button type="button" onclick="bossNext()" ${B.busy ? "disabled" : ""} class="tap w-full rounded-xl text-sm font-bold gold-btn disabled:opacity-40">⚔️ ${B.status === "loading" ? BL("بنجهّز...", "Getting ready...") : BL("ابدأ المعركة", "Start the battle")}</button>`);
}
function cmdMotifNameSafe(m) { return window.cmdMotifName ? cmdMotifName(m) : (m || ""); }
window.arenaBossHTML = arenaBossHTML;

// ================= على الخريطة وفي الرئيسية =================
{
  const _m = ecaMapHTML;
  ecaMapHTML = function (stu) {
    const html = _m(stu), list = (arena.boss.list || []).filter(bossActive);
    if (!list.length) return html;
    const a = list[0], level = Number(stu.level) || 1, spot = ECA_MAP.find(n => n.step === level) || ECA_MAP[0];
    const label = BL("الزعيم", "Boss") + ": " + a.title + " • HP " + bossHP(a) + "/" + a.puzzles.length + (list.length > 1 ? " • +" + (list.length - 1) : "");
    const node = `<button type="button" onclick="ecaBossOpen('${esc(a.id)}')" aria-label="${esc(label)}" title="${esc(label)}" class="eca-boss-node" style="left:${100 - spot.x}%;top:${spot.y}%">
      <span class="eca-boss-disc" aria-hidden="true">${bossFace(a)}</span>${bossBar(a, "eca-boss-hp")}
      <span class="eca-map-name">${esc(a.title)}${list.length > 1 ? " +" + (list.length - 1) : ""}</span></button>`;
    return html.replace('<div class="eca-map">', () => '<div class="eca-map">' + node);
  };
  const _sh = renderStudentHome;
  renderStudentHome = function (s) {
    const list = (arena.boss.list || []).filter(bossActive);
    if (!list.length) return _sh(s);
    const a = list[0];
    return `<div class="space-y-6"><section class="gold-card rounded-2xl p-4 flex items-center gap-3 border border-red-500/40">
      <span class="text-4xl shrink-0" aria-hidden="true">${bossFace(a)}</span>
      <div class="min-w-0 flex-1 space-y-1"><h3 class="font-bold text-sm text-red-300">👹 ${BL("واجب الزعيم", "Boss homework")}${list.length > 1 ? " (" + list.length + ")" : ""}</h3>
        <p class="text-xs text-gray-200 truncate">${esc(a.title)} • <span dir="ltr">HP ${bossHP(a)}/${a.puzzles.length}</span> • ${esc(bossDueText(a))}</p>${bossBar(a, "eca-boss-hp")}</div>
      <button type="button" onclick="ecaBossOpen('${esc(a.id)}')" class="tap shrink-0 rounded-lg px-3 text-xs font-bold gold-btn">⚔️ ${BL("حارب", "Fight")}</button>
    </section>${_sh(s)}</div>`;
  };
}

// ================= جوائز الحصة المباشرة =================
const DROP = { unsub: null, uid: "", queue: [], seen: {}, showing: false };
function dropFanfare() { if (typeof sfxNotes === "function") sfxNotes([523, 659, 784, 1047, 1319, 1568, 2093], 0.09, 0.32, 0.14); }
function dropClose() {
  const el = document.getElementById("ecaDropModal");
  if (el) el.remove();
  DROP.showing = false;
  setTimeout(dropNext, 300);
}
window.dropClose = dropClose;
function dropShow(item, res) {
  const en = lang === "en", el = document.createElement("div");
  let icon = "⭐", amount = "+" + item.amount + " ⭐", sub = "";
  if (item.type === "xp") { icon = "⚡"; amount = "+" + item.amount + " XP"; }
  if (item.type === "chest") {
    const prize = res.item ? (window.ecaShopCatalog || []).find(x => x.id === res.item) : null;
    icon = prize ? prize.icon || "🎁" : "🎁";
    amount = prize ? (en ? prize.en : prize.title) : "+" + res.xpDelta + " XP";
    sub = prize ? (en ? "Saved in My items. Use it from the shop." : "اتحفظ في مخزونك. استخدمه من المتجر.") : res.duplicate ? (en ? "You already had that item, so it turned into XP." : "العنصر ده كان معاك، فاتحوّل لخبرة.") : (en ? "Mystery chest: XP boost!" : "صندوق الكنز: خبرة إضافية!");
  }
  el.id = "ecaDropModal";
  el.className = "eca-drop-modal";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-label", en ? "A reward from your coach" : "مكافأة من الكوتش");
  el.innerHTML = `<div class="eca-drop-rays" aria-hidden="true"></div>
    <div class="eca-drop-box gold-card rounded-2xl p-6 space-y-3">
      <div class="eca-drop-icon" aria-hidden="true">${esc(icon)}</div>
      <h3 class="font-display font-bold text-2xl text-yellow-300">🎉 ${en ? "Your coach sent you a reward!" : "الكوتش بعتلك مكافأة!"}</h3>
      <p class="text-3xl font-black text-white" dir="auto">${esc(amount)}</p>
      ${sub ? `<p class="text-xs text-gray-300">${esc(sub)}</p>` : ""}
      <p id="ecaDropNote" class="text-base font-bold text-emerald-300"></p>
      <button type="button" onclick="dropClose()" class="tap w-full rounded-xl text-sm font-bold gold-btn">${en ? "Awesome 🙌" : "تمام 🙌"}</button>
    </div>`;
  document.body.appendChild(el);
  if (item.note) el.querySelector("#ecaDropNote").textContent = "«" + item.note + "»";
  const btn = el.querySelector("button"); if (btn) btn.focus();
  dropFanfare();
  if (window.ecaFireworks) ecaFireworks(3); else if (window.ecaConfetti) ecaConfetti(120);
  if (window.ecaCheer) ecaCheer("hype");
}
async function dropNext() {
  if (DROP.showing || !DROP.queue.length || !currUser()) return;
  const item = DROP.queue.shift();
  DROP.showing = true;
  let res = null;
  try { res = item.type === "chest" ? await window.fbChest(item.id) : await window.fbEconomy({ op: "earn", source: "drop", key: item.id }); }
  catch (e) { console.warn("Live drop claim failed:", e && e.code); }
  // في الصندوق duplicate معناها إن العنصر كان معاه فاتحوّل لخبرة، مش إن الجايزة اتصرفت قبل كده
  if (!res || !res.ok || (item.type !== "chest" && res.duplicate)) { DROP.showing = false; return dropNext(); }
  if (window.ecaHudUpdate) ecaHudUpdate();
  dropShow(item, res);
}
function dropLifecycle() {
  const u = currUser(), want = u && u.role === "student" && !window.__authLoading && window.fbDropWatch ? u.id : "";
  if (want === DROP.uid) return;
  if (DROP.unsub) { DROP.unsub(); DROP.unsub = null; }
  DROP.uid = want; DROP.queue = [];
  if (!want) return;
  DROP.unsub = window.fbDropWatch(items => {
    items.forEach(it => { if (["stars", "xp", "chest"].includes(it.type) && !DROP.seen[it.id]) { DROP.seen[it.id] = true; DROP.queue.push(it); } });
    dropNext();
  });
}
document.addEventListener("keydown", e => { if (e.key === "Escape" && document.getElementById("ecaDropModal")) dropClose(); });

{
  const _r = render;
  render = function () {
    const B = arena.boss;
    if (!(tab === "arena" && arena.sub === "boss") && ["play", "block"].includes(B.status)) { B.status = "idle"; B.game = null; }
    const out = _r.apply(this, arguments);
    bossLifecycle();
    dropLifecycle();
    return out;
  };
}
