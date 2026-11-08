// ECA — social.js: إطارات النخبة لأول 3 في الأسبوع + التشجيع بالإيموجي + أدوات ألغاز مشتركة
// التشجيع بإيموجي جاهزة بس، ومفيش أي كتابة حرة بين الطلبة.

// ================= أدوات الألغاز المشتركة (التحدي بالرابط وتحدي الكوتش) =================
const ECA_PZ_TIERS = ["easiest", "easier", "normal", "harder", "hardest", "hardest"];
function ecaPzSetup(S, fen, moves, hasSetup) {
  const list = String(moves || "").trim().split(/\s+/).filter(Boolean), g = new ChessCls(fen);
  let last = null;
  if (hasSetup) { const first = uciMove(g, list.shift()); last = [first.from, first.to]; }
  Object.assign(S, { game: g, sol: list, idx: 0, color: g.turn(), flip: g.turn() === "b", sel: null, last, flash: null });
}
// النتيجة: illegal أو bad (نقلة غلط) أو next (كمّل) أو solved
function ecaPzPlay(S, mv) {
  const g = S.game;
  let r = null;
  try { r = g.move(mv); } catch (_) {}
  if (!r) return "illegal";
  S.last = [r.from, r.to];
  const ok = r.from + r.to + (r.promotion || "") === (S.sol[S.idx] || "") || g.isCheckmate();
  if (!ok) { S.flash = { [r.to]: "bad" }; return "bad"; }
  S.idx++;
  if (S.idx < S.sol.length && !g.isCheckmate()) {
    const reply = uciMove(g, S.sol[S.idx]);
    S.idx++;
    S.last = [reply.from, reply.to];
    if (S.idx < S.sol.length) return "next";
  }
  return "solved";
}
function ecaPzClick(S, sq, onMove) {
  if (!S.game) return;
  const mv = pickOrMove(S, sq, S.color);
  if (!mv) return arenaRefresh();
  if (mv.promotion && promoNeeded(S, mv.from, mv.to)) return promoShow(S, mv.from, mv.to, pc => onMove(Object.assign(mv, { promotion: pc })));
  onMove(mv);
}
async function ecaPzFind(id) {
  const bank = await loadPuzzleBank();
  for (const tier of Object.keys(bank)) {
    const row = bank[tier].find(x => x.split("|")[0] === id);
    if (row) { const p = row.split("|"); return { id, fen: p[1], moves: p[2] }; }
  }
  return null;
}
async function ecaPzPick(step, count) {
  const bank = await loadPuzzleBank(), pool = (bank[ECA_PZ_TIERS[Math.min(5, Math.max(0, (Number(step) || 1) - 1))]] || []).slice(), out = [];
  while (out.length < count && pool.length) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0].split("|")[0]);
  return out;
}

// ================= إطارات النخبة: أول 3 في ترتيب الأسبوع =================
const ECA_ELITE = { 1: ["النار الدهبية", "Golden Fire"], 2: ["البلازما الكهربائية", "Electric Plasma"], 3: ["النيون السايبر", "Neon Cyber"] };
let eliteTop = [], eliteAt = 0, eliteBusy = false;
function ecaEliteFromRows(rows) {
  const wk = ecaWeekKey();
  eliteTop = (rows || []).filter(r => r.wk === wk && Number(r.wx) > 0)
    .sort((a, b) => Number(b.wx) - Number(a.wx) || String(a.id).localeCompare(String(b.id))).slice(0, 3).map(r => r.id);
  eliteAt = Date.now();
}
window.ecaEliteFromRows = ecaEliteFromRows;
async function ecaEliteRefresh() {
  if (eliteBusy || !window.fbEliteTop || Date.now() - eliteAt < 5 * 60000) return;
  eliteBusy = true;
  try { ecaEliteFromRows(await window.fbEliteTop()); if (window.ecaHudUpdate) ecaHudUpdate(); }
  catch (e) { console.warn("Elite frames:", e && e.code); eliteAt = Date.now(); }
  eliteBusy = false;
}
function ecaEliteRank(uid) { const i = eliteTop.indexOf(uid); return i < 0 ? 0 : i + 1; }
function ecaEliteClass(uid) { const r = ecaEliteRank(uid); return r ? "eca-elite eca-elite-" + r : ""; }
function ecaEliteLabel(uid) { const r = ecaEliteRank(uid); return r ? (lang === "en" ? ECA_ELITE[r][1] : ECA_ELITE[r][0]) + " #" + r : ""; }
window.ecaEliteRank = ecaEliteRank;
window.ecaEliteClass = ecaEliteClass;
window.ecaEliteLabel = ecaEliteLabel;

// ================= التشجيع بالإيموجي =================
const ECA_EMOTES = ["👏", "🔥", "🧠", "⚔️", "🏆"];
let emoteNextAt = 0, emoteUnsub = null, emoteUid = "";
function ecaEmoteButton(targetId) {
  const u = currUser();
  if (!u || u.role !== "student" || !targetId || targetId === u.id || !/^[A-Za-z0-9_-]{1,128}$/.test(targetId)) return "";
  const label = lang === "en" ? "Send a cheer" : "ابعت تشجيع";
  return `<button type="button" data-emote-to="${esc(targetId)}" onclick="ecaEmoteOpen(this)" aria-label="${label}" title="${label}" class="eca-emote-btn">👏</button>`;
}
window.ecaEmoteButton = ecaEmoteButton;
function ecaEmoteClose() { const m = document.getElementById("ecaEmoteMenu"); if (m) m.remove(); }
function ecaEmoteOpen(btn) {
  ecaEmoteClose();
  const to = btn.dataset.emoteTo, b = btn.getBoundingClientRect(), en = lang === "en";
  const menu = document.createElement("div");
  menu.id = "ecaEmoteMenu";
  menu.className = "eca-emote-menu";
  menu.setAttribute("role", "menu");
  menu.style.top = Math.min(innerHeight - 70, b.bottom + 6) + "px";
  menu.style.left = Math.max(8, Math.min(innerWidth - 290, b.left - 120)) + "px";
  menu.innerHTML = ECA_EMOTES.map((e, i) => `<button type="button" role="menuitem" data-emote-to="${esc(to)}" data-e="${i}" onclick="ecaEmoteSend(this)" aria-label="${en ? "Send" : "ابعت"} ${e}">${e}</button>`).join("");
  document.body.appendChild(menu);
  const first = menu.querySelector("button"); if (first) first.focus();
}
window.ecaEmoteOpen = ecaEmoteOpen;
document.addEventListener("click", e => { if (!e.target.closest || !e.target.closest("#ecaEmoteMenu, .eca-emote-btn")) ecaEmoteClose(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") ecaEmoteClose(); });
async function ecaEmoteSend(btn) {
  const en = lang === "en", to = btn.dataset.emoteTo, e = ECA_EMOTES[Number(btn.dataset.e)];
  ecaEmoteClose();
  if (!e || !window.fbSendEmote) return;
  const wait = Math.ceil((emoteNextAt - Date.now()) / 1000);
  if (wait > 0) return toast(en ? `Wait ${wait} seconds before the next cheer.` : `استنى ${wait} ثانية قبل التشجيع الجاي.`);
  emoteNextAt = Date.now() + 10000;
  try { await window.fbSendEmote(to, e); toast((en ? "Cheer sent " : "التشجيع اتبعت ") + e); if (window.ecaSfx) ecaSfx("ting"); }
  catch (err) { console.warn("Emote failed:", err && err.code); toast(en ? "The cheer was not sent. Try again in a few seconds." : "التشجيع ما اتبعتش. حاول بعد ثواني."); }
}
window.ecaEmoteSend = ecaEmoteSend;
function ecaEmotePop(item, delay) {
  setTimeout(() => {
    const pop = document.createElement("div"), en = lang === "en";
    pop.className = "eca-emote-pop";
    pop.setAttribute("role", "status");
    const icon = document.createElement("span"); icon.className = "eca-emote-pop-icon"; icon.textContent = ECA_EMOTES.includes(item.e) ? item.e : "👏";
    const text = document.createElement("span"); text.textContent = (en ? "{n} cheered you!" : "{n} بيشجّعك!").replace("{n}", ecaStudentAlias({ id: item.from, nickname: item.n }));
    pop.appendChild(icon); pop.appendChild(text);
    document.body.appendChild(pop);
    if (window.ecaSfx) ecaSfx("ting");
    setTimeout(() => pop.remove(), 3200);
  }, delay);
}
function ecaEmoteLifecycle() {
  const u = currUser(), want = u && u.role === "student" && !window.__authLoading ? u.id : "";
  if (want === emoteUid) return;
  if (emoteUnsub) { emoteUnsub(); emoteUnsub = null; }
  emoteUid = want;
  if (!want || !window.fbEmoteWatch) { if (!window.fbEmoteWatch) emoteUid = ""; return; }
  emoteUnsub = window.fbEmoteWatch(items => {
    items.slice(0, 3).forEach((item, i) => ecaEmotePop(item, i * 1200));
    items.forEach(item => window.fbEmoteDelete(item.id).catch(() => {}));
  });
}

// ================= ربطهم بدورة الرسم =================
{
  const _r = render;
  render = function () {
    const out = _r.apply(this, arguments);
    if (currUser() && !window.__authLoading) { ecaEliteRefresh(); ecaEmoteLifecycle(); }
    else ecaEmoteLifecycle();
    return out;
  };
}
