// ECA — command.js: مركز قيادة الكوتش
// المجموعات وطلابها + واجب الزعيم لمجموعة كاملة بضغطة + جوائز الحصة المباشرة.
// للكوتش والأدمن بس. القواعد في firestore.rules هي اللي بتحمي كل كتابة.

const CMD = {
  list: null, unsub: null, open: "", prog: null, progUnsub: null, busy: false, dropBusy: false,
  dropType: "stars", dropTo: "", dropAmt: "10", dropNote: "", q: "",
  draft: { title: "", group: "0", step: "1", motif: "", count: "10", due: "", puzzles: [] }
};
const CL = (ar, en) => lang === "en" ? en : ar;
const CMD_BAD = /[<>"'`]/;
const CMD_MOTIFS = {
  mateIn1: ["مات في نقلة", "Mate in 1"], mateIn2: ["مات في نقلتين", "Mate in 2"], mateIn3: ["مات في 3 نقلات", "Mate in 3"],
  fork: ["الشوكة", "Fork"], pin: ["التثبيت", "Pin"], skewer: ["السيخ", "Skewer"], discoveredAttack: ["الهجوم المكشوف", "Discovered attack"],
  doubleCheck: ["الكش المزدوج", "Double check"], hangingPiece: ["قطعة سايبة", "Hanging piece"], capturingDefender: ["أكل المدافع", "Capture the defender"],
  deflection: ["الإبعاد", "Deflection"], attraction: ["الجذب", "Attraction"], backRankMate: ["مات الصف الأخير", "Back-rank mate"],
  smotheredMate: ["المات المخنوق", "Smothered mate"], promotion: ["الترقية", "Promotion"], advancedPawn: ["البيدق المتقدم", "Advanced pawn"],
  sacrifice: ["التضحية", "Sacrifice"], trappedPiece: ["قطعة محبوسة", "Trapped piece"], interference: ["القطع", "Interference"],
  clearance: ["التفريغ", "Clearance"], xRayAttack: ["هجوم الأشعة", "X-ray attack"], quietMove: ["النقلة الهادية", "Quiet move"],
  defensiveMove: ["نقلة دفاعية", "Defensive move"], exposedKing: ["الملك المكشوف", "Exposed king"], kingsideAttack: ["هجوم على الملك", "Kingside attack"],
  pawnEndgame: ["نهايات البيادق", "Pawn endgame"], rookEndgame: ["نهايات الطوابي", "Rook endgame"], endgame: ["النهايات", "Endgame"], zugzwang: ["الزوجزفانج", "Zugzwang"]
};
function cmdMotifName(m) { return m ? (CMD_MOTIFS[m] ? CMD_MOTIFS[m][lang === "en" ? 1 : 0] : m) : CL("كل الأفكار", "Any motif"); }
window.cmdMotifName = cmdMotifName;
function cmdIsoIn(days) { const d = new Date(Date.now() + days * 864e5); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
function cmdStudents() { return (db.users || []).filter(u => u.role === "student").sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "ar")); }
function cmdMembers(g) { return cmdStudents().filter(u => (u.group || "") === g); }

// ================= بنك الألغاز حسب الـ Step والفكرة =================
function cmdPool(step) {
  const hw = window.ECA_HOMEWORK || {}, seen = new Set(), out = [];
  Object.keys(hw).filter(k => k.split("-")[0] === String(step)).forEach(k => ((hw[k] || {}).puzzles || []).forEach(p => {
    if (p && p.id && !seen.has(p.id)) { seen.add(p.id); out.push(p); }
  }));
  return out;
}
function cmdMotifs(step) {
  const count = {};
  cmdPool(step).forEach(p => (p.themes || []).forEach(t => { if (CMD_MOTIFS[t]) count[t] = (count[t] || 0) + 1; }));
  return Object.keys(count).filter(t => count[t] >= 3).sort((a, b) => count[b] - count[a]).map(t => [t, count[t]]);
}
function cmdDraft(key, value) {
  const D = CMD.draft;
  D[key] = String(value);
  if (key === "step") { D.motif = ""; D.puzzles = []; }
  if (key === "motif" || key === "count") D.puzzles = [];
  render();
}
window.cmdDraft = cmdDraft;
function cmdPick() {
  const D = CMD.draft, pool = cmdPool(D.step).filter(p => !D.motif || (p.themes || []).includes(D.motif));
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  D.puzzles = pool.slice(0, Math.min(20, Number(D.count) || 10)).map(p => String(p.id));
  if (!window.ECA_HOMEWORK) toast(CL("بنك الواجبات لسه بيتحمّل. استنى ثانية وجرّب تاني.", "The homework bank is still loading. Wait a second and try again."));
  else if (D.puzzles.length < 3) toast(CL("مفيش ألغاز كفاية للفكرة دي. اختار فكرة تانية.", "Not enough puzzles for this motif. Choose another one."));
  render();
}
window.cmdPick = cmdPick;
function cmdDropPuzzle(i) { CMD.draft.puzzles.splice(Number(i), 1); render(); }
window.cmdDropPuzzle = cmdDropPuzzle;
async function cmdAddPuzzle() {
  const inp = document.getElementById("cmdAddId"), id = ((inp && inp.value) || "").trim(), D = CMD.draft;
  if (!/^[A-Za-z0-9]{3,20}$/.test(id)) return toast(CL("رقم اللغز لازم يكون حروف وأرقام إنجليزي بس.", "A puzzle ID is English letters and digits only."));
  if (D.puzzles.includes(id)) return toast(CL("اللغز ده موجود في الباقة.", "That puzzle is already in the pack."));
  if (D.puzzles.length >= 20) return toast(CL("أقصى حاجة 20 لغز.", "20 puzzles at most."));
  const found = window.ecaBossFind ? await ecaBossFind(id) : null;
  if (!found) return toast(CL("ملقيناش اللغز ده في بنك الأكاديمية.", "That puzzle is not in the academy bank."));
  D.puzzles.push(id);
  render();
}
window.cmdAddPuzzle = cmdAddPuzzle;

// ================= إرسال واجب الزعيم =================
async function cmdBossSend() {
  const D = CMD.draft, group = (db.groups || [])[Number(D.group)], title = String(D.title || "").trim();
  if (CMD.busy) return;
  if (!group) return toast(CL("اختار المجموعة.", "Choose the group."));
  if (CMD_BAD.test(group)) return toast(CL("اسم المجموعة فيه رموز مش مسموحة. غيّر اسمها الأول.", "The group name has characters that are not allowed. Rename it first."));
  if (title.length < 2 || title.length > 80 || CMD_BAD.test(title)) return toast(CL("اكتب اسم للزعيم (من 2 لـ 80 حرف ومن غير رموز).", "Name the boss (2 to 80 characters, no symbols)."));
  if (D.puzzles.length < 3 || D.puzzles.length > 20) return toast(CL("الباقة لازم يكون فيها من 3 لـ 20 لغز.", "The pack needs 3 to 20 puzzles."));
  const due = /^\d{4}-\d{2}-\d{2}$/.test(D.due) ? new Date(D.due + "T23:59:00") : null;
  if (!due || isNaN(due) || due.getTime() <= Date.now() || due.getTime() > Date.now() + 60 * 864e5) return toast(CL("آخر ميعاد لازم يكون من النهاردة لحد 60 يوم.", "The deadline must be within the next 60 days."));
  if (!cmdMembers(group).length && !confirm(CL("المجموعة دي مفيهاش طلبة. تبعت الواجب برضه؟", "This group has no students. Send it anyway?"))) return;
  CMD.busy = true; render();
  try {
    await window.fbBossCreate({ title, group, step: Number(D.step) || 1, motif: D.motif, puzzles: D.puzzles.slice(), due });
    toast(CL("👹 الزعيم نزل على خريطة المجموعة!", "👹 The boss is on the group's map!"));
    Object.assign(D, { title: "", puzzles: [] });
  } catch (e) { console.warn("Boss homework failed:", e && e.code); toast(CL("الواجب ما اتبعتش. حاول تاني.", "The homework was not sent. Try again.")); }
  CMD.busy = false; render();
}
window.cmdBossSend = cmdBossSend;
async function cmdBossDelete(id) {
  if (!/^[A-Za-z0-9]{6,40}$/.test(id) || !confirm(CL("تمسح الواجب ده؟ تقدّم الطلبة فيه هيختفي من الخريطة.", "Delete this homework? It disappears from the students' map."))) return;
  try { await window.fbBossDelete(id); if (CMD.open === id) cmdToggle(id); toast(CL("الواجب اتمسح", "Homework deleted")); }
  catch (e) { console.warn("Boss delete failed:", e && e.code); toast(CL("ما اتمسحش. حاول تاني.", "It was not deleted. Try again.")); }
}
window.cmdBossDelete = cmdBossDelete;
function cmdToggle(id) {
  if (CMD.progUnsub) { CMD.progUnsub(); CMD.progUnsub = null; }
  CMD.prog = null;
  CMD.open = CMD.open === id ? "" : id;
  if (CMD.open && window.fbBossProgressWatch) {
    const want = CMD.open;
    CMD.progUnsub = window.fbBossProgressWatch(want, rows => { if (CMD.open !== want) return; CMD.prog = rows; cmdPaintList(); });
  }
  cmdPaintList();
}
window.cmdToggle = cmdToggle;

// ================= المجموعات والطلبة =================
function cmdAddGroup() {
  const inp = document.getElementById("cmdNewGroup"), v = ((inp && inp.value) || "").trim();
  if (!v || v.length > 80 || CMD_BAD.test(v)) return toast(CL("اكتب اسم المجموعة (لحد 80 حرف ومن غير رموز).", "Enter a group name (up to 80 characters, no symbols)."));
  if ((db.groups || []).includes(v)) return toast(CL("المجموعة دي موجودة.", "That group already exists."));
  db.groups = [...(db.groups || []), v];
  save(); render();
  toast(CL("المجموعة اتضافت", "Group added"));
}
window.cmdAddGroup = cmdAddGroup;
function cmdDelGroup(i) {
  const g = (db.groups || [])[Number(i)];
  if (g === undefined) return;
  if (cmdMembers(g).length) return toast(CL("انقل طلبة المجموعة الأول.", "Move the group's students first."));
  if (!confirm(CL("تمسح المجموعة دي؟", "Delete this group?"))) return;
  db.groups = db.groups.filter((_, k) => k !== Number(i));
  if (db.groupSched && db.groupSched[g]) delete db.groupSched[g];
  save(); render();
}
window.cmdDelGroup = cmdDelGroup;
function cmdSetGroup(id, value) {
  const u = (db.users || []).find(x => x.id === id && x.role === "student");
  if (!u) return;
  u.group = value === "" ? "" : String((db.groups || [])[Number(value)] || "");
  save(); render();
  toast(CL("المجموعة اتغيّرت", "Group changed"));
}
window.cmdSetGroup = cmdSetGroup;

// ================= جوائز الحصة المباشرة =================
const CMD_DROP = { stars: { icon: "⭐", ar: "نجوم", en: "Stars", min: 1, max: 50, presets: [3, 5, 10, 20] }, xp: { icon: "⚡", ar: "خبرة إضافية", en: "XP boost", min: 10, max: 500, presets: [50, 100, 200, 300] }, chest: { icon: "🎁", ar: "صندوق كنز", en: "Mystery chest" } };
function cmdDropType(t) { if (!CMD_DROP[t]) return; CMD.dropType = t; if (t !== "chest") CMD.dropAmt = String(CMD_DROP[t].presets[1]); render(); }
window.cmdDropType = cmdDropType;
function cmdDropPreset(n) { CMD.dropAmt = String(n); const el = document.getElementById("cmdDropAmt"); if (el) el.value = String(n); }
window.cmdDropPreset = cmdDropPreset;
function cmdDropTargets(to) {
  if (/^g:\d+$/.test(to)) { const g = (db.groups || [])[Number(to.slice(2))]; return g === undefined ? [] : cmdMembers(g).map(u => u.id); }
  if (to.startsWith("s:")) { const u = cmdStudents().find(x => x.id === to.slice(2)); return u ? [u.id] : []; }
  return [];
}
async function cmdDropSend() {
  const type = CMD.dropType, spec = CMD_DROP[type], note = String(CMD.dropNote || "").trim(), uids = cmdDropTargets(CMD.dropTo);
  if (CMD.dropBusy) return;
  if (!uids.length) return toast(CL("اختار طالب أو مجموعة فيها طلبة.", "Choose a student or a group with students."));
  let amount = 0;
  if (type !== "chest") {
    amount = Math.floor(Number(CMD.dropAmt));
    if (!(amount >= spec.min && amount <= spec.max)) return toast(CL(`الكمية من ${spec.min} لـ ${spec.max}.`, `The amount must be ${spec.min} to ${spec.max}.`));
  }
  if (note.length > 80 || CMD_BAD.test(note)) return toast(CL("الرسالة لحد 80 حرف ومن غير رموز.", "The message is up to 80 characters, no symbols."));
  if (uids.length > 1 && !confirm(CL(`تبعت الجايزة لـ ${uids.length} طالب؟`, `Send this drop to ${uids.length} students?`))) return;
  CMD.dropBusy = true; render();
  try {
    const n = await window.fbDropSend(uids, { type, amount, note });
    toast(CL(`${spec.icon} الجايزة وصلت لـ ${n} طالب!`, `${spec.icon} Drop sent to ${n} student${n === 1 ? "" : "s"}!`));
    CMD.dropNote = "";
    if (window.ecaSfx) ecaSfx("ting");
  } catch (e) { console.warn("Live drop failed:", e && e.code); toast(CL("الجايزة ما اتبعتتش. حاول تاني.", "The drop was not sent. Try again.")); }
  CMD.dropBusy = false; render();
}
window.cmdDropSend = cmdDropSend;

// ================= الصفحة =================
const cmdInput = "mt-1 w-full min-h-[44px] rounded-lg bg-black border border-yellow-500/40 px-3 text-sm text-white";
function cmdDropHTML() {
  const groups = db.groups || [], studs = cmdStudents(), t = CMD.dropType, spec = CMD_DROP[t];
  if (!CMD.dropTo) CMD.dropTo = groups.length ? "g:0" : studs.length ? "s:" + studs[0].id : "";
  const opt = (v, label) => `<option value="${esc(v)}" ${CMD.dropTo === v ? "selected" : ""}>${esc(label)}</option>`;
  return `<section class="gold-card rounded-2xl p-5 space-y-3">
    <h3 class="font-display font-bold text-lg text-yellow-300">🎁 ${CL("جوائز الحصة المباشرة", "Live class drops")}</h3>
    <p class="text-xs text-gray-400">${CL("الجايزة بتظهر على شاشة الطالب في نفس اللحظة لو الموقع مفتوح عنده، أو أول ما يفتحه.", "The drop pops up on the student's screen right away if the app is open, or the next time they open it.")}</p>
    <label class="block text-xs text-gray-300">${CL("لمين؟", "Send to")}
      <select id="cmdDropTo" onchange="CMD.dropTo=this.value" class="${cmdInput}">
        ${groups.length ? `<optgroup label="${CL("المجموعات", "Groups")}">${groups.map((g, i) => opt("g:" + i, "👥 " + g + " (" + cmdMembers(g).length + ")")).join("")}</optgroup>` : ""}
        ${studs.length ? `<optgroup label="${CL("الطلبة", "Students")}">${studs.map(u => opt("s:" + u.id, u.name + (u.group ? " • " + u.group : ""))).join("")}</optgroup>` : ""}
      </select></label>
    <div class="grid grid-cols-3 gap-2" role="group" aria-label="${CL("نوع الجايزة", "Drop type")}">
      ${Object.keys(CMD_DROP).map(k => `<button type="button" onclick="cmdDropType('${k}')" aria-pressed="${t === k}" class="tap rounded-xl px-2 text-xs font-bold ${t === k ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/20"}">${CMD_DROP[k].icon} ${lang === "en" ? CMD_DROP[k].en : CMD_DROP[k].ar}</button>`).join("")}
    </div>
    ${t === "chest" ? `<p class="text-xs text-gray-300">${CL("صندوق كنز مجاني: خبرة، أو قطع نادرة، أو إطار أسطوري.", "A free mystery chest: XP, rare pieces or a legendary frame.")}</p>`
      : `<label class="block text-xs text-gray-300">${CL("الكمية", "Amount")} (${spec.min}–${spec.max})
        <input id="cmdDropAmt" type="number" inputmode="numeric" min="${spec.min}" max="${spec.max}" value="${esc(CMD.dropAmt)}" oninput="CMD.dropAmt=this.value" class="${cmdInput}" dir="ltr" /></label>
      <div class="flex flex-wrap gap-2">${spec.presets.map(n => `<button type="button" onclick="cmdDropPreset(${n})" class="tap rounded-lg px-3 text-xs font-bold bg-zinc-800 text-white border border-yellow-500/30">${spec.icon} ${n}</button>`).join("")}</div>`}
    <label class="block text-xs text-gray-300">${CL("رسالة قصيرة (اختياري)", "Short message (optional)")}
      <input id="cmdDropNote" maxlength="80" value="${esc(CMD.dropNote)}" oninput="CMD.dropNote=this.value" placeholder="${CL("حركة عبقرية!", "Brilliant move!")}" class="${cmdInput}" /></label>
    <button type="button" onclick="cmdDropSend()" ${CMD.dropBusy ? "disabled" : ""} class="tap w-full rounded-xl text-sm font-bold gold-btn disabled:opacity-40">${CMD.dropBusy ? CL("بنبعت...", "Sending...") : CL("ابعت الجايزة دلوقتي", "Send the drop now")}</button>
  </section>`;
}
function cmdGroupsHTML() {
  const groups = db.groups || [], studs = cmdStudents(), q = String(CMD.q || "").trim().toLowerCase();
  const sel = u => `<select onchange="cmdSetGroup('${esc(u.id)}', this.value)" aria-label="${CL("مجموعة", "Group of")} ${esc(u.name || "")}" class="min-h-[44px] max-w-[45%] rounded-lg bg-black border border-yellow-500/40 px-2 text-xs text-white">
      <option value="" ${!u.group ? "selected" : ""}>${CL("بدون مجموعة", "No group")}</option>${groups.map((g, i) => `<option value="${i}" ${u.group === g ? "selected" : ""}>${esc(g)}</option>`).join("")}</select>`;
  const row = u => `<li class="flex items-center justify-between gap-2 py-1.5 border-b border-yellow-500/10"><span class="min-w-0 truncate text-sm text-white">${esc(u.name || "")} <span class="text-xs text-gray-400">• Step ${esc(u.level || 1)}</span></span>${sel(u)}</li>`;
  const shown = q ? studs.filter(u => String(u.name || "").toLowerCase().includes(q) || String(u.username || "").toLowerCase().includes(q)) : studs;
  const loose = shown.filter(u => !u.group || !groups.includes(u.group));
  return `<section class="gold-card rounded-2xl p-5 space-y-3">
    <h3 class="font-display font-bold text-lg text-yellow-300">👥 ${CL("المجموعات والطلبة", "Groups & students")}</h3>
    <div class="flex gap-2"><input id="cmdNewGroup" maxlength="80" placeholder="${CL("مثلاً: Lake House - Step 1", "e.g. Lake House - Step 1")}" class="flex-1 min-h-[44px] rounded-lg bg-black border border-yellow-500/40 px-3 text-sm text-white" />
      <button type="button" onclick="cmdAddGroup()" class="tap rounded-lg px-3 text-xs font-bold gold-btn">${CL("ضيف مجموعة", "Add group")}</button></div>
    <input value="${esc(CMD.q)}" oninput="CMD.q=this.value; clearTimeout(window.__cmdQ); window.__cmdQ=setTimeout(()=>{ render(); const el=document.getElementById('cmdSearch'); if(el){ el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 300)" id="cmdSearch" placeholder="${CL("دوّر على طالب...", "Search students...")}" aria-label="${CL("دوّر على طالب", "Search students")}" class="w-full min-h-[44px] rounded-lg bg-black border border-yellow-500/40 px-3 text-sm text-white" />
    <div class="space-y-2">
      ${groups.map((g, i) => { const m = shown.filter(u => u.group === g); return `<details class="rounded-xl bg-black/30 border border-yellow-500/20 p-3" ${q && m.length ? "open" : ""}>
        <summary class="tap flex items-center justify-between gap-2 cursor-pointer"><b class="text-sm text-white truncate">👥 ${esc(g)}</b><span class="text-xs text-gray-300 whitespace-nowrap">${cmdMembers(g).length} ${CL("طالب", "students")}</span></summary>
        <ul class="mt-2">${m.map(row).join("") || `<li class="text-xs text-gray-400 py-2">${CL("مفيش طلبة هنا.", "No students here.")}</li>`}</ul>
        ${cmdMembers(g).length ? "" : `<button type="button" onclick="cmdDelGroup(${i})" class="tap mt-2 rounded-lg px-3 text-xs font-bold bg-zinc-800 text-red-300 border border-red-500/30">${CL("امسح المجموعة", "Delete group")}</button>`}
      </details>`; }).join("")}
      ${loose.length ? `<details class="rounded-xl bg-black/30 border border-red-500/30 p-3" open><summary class="tap flex items-center justify-between gap-2 cursor-pointer"><b class="text-sm text-red-300">${CL("طلبة من غير مجموعة", "Students without a group")}</b><span class="text-xs text-gray-300">${loose.length}</span></summary><ul class="mt-2">${loose.map(row).join("")}</ul></details>` : ""}
    </div>
  </section>`;
}
function cmdBossFormHTML() {
  const D = CMD.draft, groups = db.groups || [], motifs = cmdMotifs(D.step), loading = !window.ECA_HOMEWORK;
  if (!D.due) D.due = cmdIsoIn(7);
  return `<section class="gold-card rounded-2xl p-5 space-y-3">
    <h3 class="font-display font-bold text-lg text-yellow-300">👹 ${CL("واجب الزعيم للمجموعة", "Boss homework for a group")}</h3>
    <p class="text-xs text-gray-400">${CL("كل لغز يحله الطالب بيشيل نقطة من صحة الزعيم. لما الصحة توصل صفر بياخد ⭐ 10 و 200 خبرة، وبيظهر عندك «خلّص».", "Every puzzle a student solves takes 1 HP off the boss. At 0 HP they win ⭐ 10 and 200 XP, and you see «Completed».")}</p>
    <label class="block text-xs text-gray-300">${CL("اسم الزعيم", "Boss name")}<input maxlength="80" value="${esc(D.title)}" oninput="CMD.draft.title=this.value" placeholder="${CL("مثلاً: تنين الشوكة", "e.g. The Fork Dragon")}" class="${cmdInput}" /></label>
    <div class="grid grid-cols-2 gap-2">
      <label class="block text-xs text-gray-300">${CL("المجموعة", "Group")}<select onchange="cmdDraft('group', this.value)" class="${cmdInput}">${groups.map((g, i) => `<option value="${i}" ${String(i) === D.group ? "selected" : ""}>${esc(g)} (${cmdMembers(g).length})</option>`).join("") || `<option value="">${CL("ضيف مجموعة الأول", "Add a group first")}</option>`}</select></label>
      <label class="block text-xs text-gray-300">Step<select onchange="cmdDraft('step', this.value)" class="${cmdInput}">${[1, 2, 3, 4, 5, 6].map(s => `<option value="${s}" ${String(s) === D.step ? "selected" : ""}>Step ${s}</option>`).join("")}</select></label>
      <label class="block text-xs text-gray-300">${CL("الفكرة التكتيكية", "Motif")}<select onchange="cmdDraft('motif', this.value)" class="${cmdInput}"><option value="">${cmdMotifName("")}</option>${motifs.map(([m, n]) => `<option value="${esc(m)}" ${m === D.motif ? "selected" : ""}>${esc(cmdMotifName(m))} (${n})</option>`).join("")}</select></label>
      <label class="block text-xs text-gray-300">${CL("عدد الألغاز", "Puzzles")}<select onchange="cmdDraft('count', this.value)" class="${cmdInput}">${[5, 8, 10, 12, 15, 20].map(n => `<option value="${n}" ${String(n) === D.count ? "selected" : ""}>${n}</option>`).join("")}</select></label>
    </div>
    <label class="block text-xs text-gray-300">${CL("آخر ميعاد", "Deadline")}<input type="date" value="${esc(D.due)}" min="${cmdIsoIn(0)}" max="${cmdIsoIn(60)}" onchange="CMD.draft.due=this.value" class="${cmdInput}" dir="ltr" /></label>
    <button type="button" onclick="cmdPick()" ${loading ? "disabled" : ""} class="tap w-full rounded-xl text-sm font-bold bg-zinc-800 text-white border border-yellow-500/30 disabled:opacity-40">${loading ? CL("بنحمّل بنك الألغاز...", "Loading the puzzle bank...") : "🎲 " + CL("اختار الألغاز", "Pick the puzzles")}</button>
    ${D.puzzles.length ? `<div class="space-y-2"><p class="text-xs text-gray-300">${CL("الباقة", "Pack")}: <b class="text-white">${D.puzzles.length}</b> ${CL("لغز", "puzzles")} = <b class="text-red-300">${D.puzzles.length} HP</b></p>
      <ul class="flex flex-wrap gap-1.5">${D.puzzles.map((p, i) => `<li class="flex items-center gap-1 rounded-lg bg-black/40 border border-yellow-500/20 ps-2 text-xs text-gray-200" dir="ltr">${esc(p)}<button type="button" onclick="cmdDropPuzzle(${i})" aria-label="${CL("شيل اللغز", "Remove puzzle")} ${esc(p)}" title="${CL("شيل", "Remove")}" class="tap w-11 text-red-300">✕</button></li>`).join("")}</ul></div>` : ""}
    <div class="flex gap-2"><input id="cmdAddId" maxlength="20" dir="ltr" placeholder="${CL("رقم لغز (اختياري)", "Puzzle ID (optional)")}" class="flex-1 min-h-[44px] rounded-lg bg-black border border-yellow-500/40 px-3 text-sm text-white" />
      <button type="button" onclick="cmdAddPuzzle()" class="tap rounded-lg px-3 text-xs font-bold bg-zinc-800 text-white border border-yellow-500/30">${CL("ضيف", "Add")}</button></div>
    <button type="button" onclick="cmdBossSend()" ${CMD.busy || D.puzzles.length < 3 ? "disabled" : ""} class="tap w-full rounded-xl text-sm font-bold gold-btn disabled:opacity-40">${CMD.busy ? CL("بنبعت...", "Sending...") : "⚔️ " + CL("ابعت الواجب للمجموعة كلها", "Assign to the whole group")}</button>
  </section>`;
}
function cmdBossCardHTML(a) {
  const en = lang === "en", now = Date.now(), members = cmdMembers(a.group), total = a.puzzles.length, open = CMD.open === a.id, over = a.dueMs && a.dueMs < now;
  const due = a.dueMs ? new Date(a.dueMs).toLocaleDateString(en ? "en-GB" : "ar-EG", { day: "numeric", month: "short" }) : "";
  let table = "";
  if (open) {
    const prog = CMD.prog;
    table = prog === null ? `<p class="text-xs text-gray-400 py-2">${CL("بنحمّل...", "Loading...")}</p>`
      : `<p class="text-xs text-gray-300 py-1">${CL("خلّصوا", "Completed")}: <b class="text-emerald-300">${prog.filter(r => r.done).length}</b> / ${members.length}</p><ul class="space-y-1.5">${members.map(u => {
        const r = prog.find(x => x.uid === u.id) || { solved: 0, done: false }, left = Math.max(0, total - r.solved), pct = total ? Math.round(left / total * 100) : 0;
        return `<li class="flex items-center gap-2 text-xs"><span class="min-w-0 flex-1 truncate text-white">${esc(u.name || "")}</span>
          ${r.done ? `<b class="text-emerald-300 whitespace-nowrap">✅ ${CL("خلّص", "Completed")}</b>` : `<span class="eca-boss-hp" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${left}" aria-label="HP"><i style="width:${pct}%"></i></span><span class="text-gray-300 whitespace-nowrap" dir="ltr">${r.solved}/${total}</span>`}</li>`;
      }).join("") || `<li class="text-xs text-gray-400">${CL("المجموعة مفيهاش طلبة.", "The group has no students.")}</li>`}</ul>`;
  }
  return `<li class="rounded-xl bg-black/30 border ${over ? "border-zinc-700" : "border-red-500/40"} p-3 space-y-2">
    <div class="flex items-start justify-between gap-2"><div class="min-w-0"><b class="block text-sm text-white truncate">👹 ${esc(a.title)}</b>
      <span class="text-xs text-gray-400">👥 ${esc(a.group)} • Step ${esc(a.step)} • ${esc(cmdMotifName(a.motif))} • ${total} HP • ${over ? CL("انتهى", "Ended") : CL("لحد", "Due")} ${esc(due)}</span></div>
      <button type="button" onclick="cmdBossDelete('${esc(a.id)}')" aria-label="${CL("امسح الواجب", "Delete homework")}" title="${CL("امسح", "Delete")}" class="tap w-11 shrink-0 rounded-lg bg-zinc-800 text-red-300 border border-red-500/30">🗑</button></div>
    <button type="button" onclick="cmdToggle('${esc(a.id)}')" aria-expanded="${open}" class="tap w-full rounded-lg text-xs font-bold bg-zinc-800 text-white border border-yellow-500/30">${open ? CL("اقفل المتابعة", "Hide progress") : "📊 " + CL("متابعة الطلبة", "Student progress")}</button>
    ${table}
  </li>`;
}
function cmdBossListHTML() {
  if (CMD.list === null) return `<p class="text-sm text-gray-400">${CL("بنحمّل...", "Loading...")}</p>`;
  if (!CMD.list.length) return `<p class="text-sm text-gray-400">${CL("لسه مفيش واجبات زعيم.", "No boss homework yet.")}</p>`;
  return `<ul class="space-y-2">${CMD.list.map(cmdBossCardHTML).join("")}</ul>`;
}
function cmdPaintList() {
  const el = document.getElementById("cmdBossList");
  if (el) el.innerHTML = cmdBossListHTML(); else if (tab === "command") render();
}
function renderCommandView(u) {
  if (!isStaffUser(u)) return "";
  return `<div class="space-y-5 page-enter">
    <div class="gold-card rounded-2xl p-5"><h2 class="font-display font-bold text-xl gold-gradient-text">🛡️ ${CL("مركز قيادة الكوتش", "Coach Command Center")}</h2>
      <p class="text-xs text-gray-400 mt-1">${CL("المجموعات، وواجب الزعيم بضغطة واحدة، وجوائز فورية أثناء الحصة.", "Groups, one-click boss homework, and instant rewards during class.")}</p>
      <button type="button" onclick="showSystemDiagnostics()" class="tap mt-3 rounded-lg px-3 text-xs font-bold bg-zinc-800 text-white border border-yellow-500/30">🩺 ${CL("فحص النظام (قراية بس)", "System check (read-only)")}</button></div>
    <div class="grid lg:grid-cols-2 gap-5 items-start">
      <div class="space-y-5">${cmdDropHTML()}${cmdBossFormHTML()}</div>
      <div class="space-y-5">
        <section class="gold-card rounded-2xl p-5 space-y-3"><h3 class="font-display font-bold text-lg text-yellow-300">📜 ${CL("الواجبات اللي اتبعتت", "Assigned homework")}</h3><div id="cmdBossList">${cmdBossListHTML()}</div></section>
        ${cmdGroupsHTML()}
      </div>
    </div>
  </div>`;
}
window.renderCommandView = renderCommandView;

function cmdLifecycle() {
  const u = currUser(), want = !!u && isStaffUser(u) && !window.__authLoading && tab === "command" && !!window.fbBossWatchAll;
  if (want && !CMD.unsub) {
    CMD.unsub = window.fbBossWatchAll(rows => { CMD.list = rows; if (CMD.open && !rows.some(a => a.id === CMD.open)) cmdToggle(CMD.open); else cmdPaintList(); }, () => { CMD.list = []; cmdPaintList(); });
  } else if (!want && CMD.unsub) {
    CMD.unsub(); CMD.unsub = null; CMD.list = null;
    if (CMD.progUnsub) { CMD.progUnsub(); CMD.progUnsub = null; }
    CMD.open = ""; CMD.prog = null;
  }
}
{
  const _r = render;
  render = function () { const out = _r.apply(this, arguments); cmdLifecycle(); return out; };
}
