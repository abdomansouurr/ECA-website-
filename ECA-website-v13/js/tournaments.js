// ECA — tournaments.js: البطولات الداخلية (دوري / سويسري) بالنتايج والترتيب (eca-v6)
// الكوتش بينشئ ويسجّل النتايج، والطلبة بيشوفوا الجولات والترتيب. بيعتمد على: db, esc, toast, render, keepScroll, isCoach, currUser, lang

    let trnSel = null, trnView = "rounds", trnForm = null;
    const T_RES = { "1-0": [1, 0], "0-1": [0, 1], "D": [0.5, 0.5] };
    const LT = (ar, en) => lang === "en" ? en : ar;
    const fmtPts = n => (Math.round(n * 2) / 2).toString().replace(".5", "½").replace(/^0½$/, "½");
    function trnId() { return "t" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
    function trnFind(id) { return (db.tournaments || []).find(t => t.id === id) || null; }
    function pName(t, pid) { const p = (t.players || []).find(x => x.id === pid); return p ? p.name : "—"; }
    function trnSave(t) { if (window.fbSaveTournament) window.fbSaveTournament(t); keepScroll(render); }

    // ---------- الترتيب ----------
    function standings(t) {
      const S = {};
      (t.players || []).forEach((p, i) => { S[p.id] = { id: p.id, name: p.name, seed: i, pts: 0, w: 0, d: 0, l: 0, played: 0, opp: [], res: {}, byes: 0, whites: 0 }; });
      (t.rounds || []).forEach(r => {
        (r.pairs || []).forEach(g => {
          const sc = T_RES[g.r]; if (!sc || !S[g.w] || !S[g.b]) return;
          const W = S[g.w], B = S[g.b];
          W.pts += sc[0]; B.pts += sc[1]; W.played++; B.played++; W.opp.push(g.b); B.opp.push(g.w);
          W.res[g.b] = (W.res[g.b] || 0) + sc[0]; B.res[g.w] = (B.res[g.w] || 0) + sc[1];
          if (g.r === "1-0") { W.w++; B.l++; } else if (g.r === "0-1") { B.w++; W.l++; } else { W.d++; B.d++; }
        });
        if (r.bye && S[r.bye]) { S[r.bye].byes++; if (t.format === "swiss") S[r.bye].pts += 1; }
      });
      const rows = Object.values(S);
      rows.forEach(x => {
        // سويسري: Buchholz (مجموع نقط الخصوم) — دوري: Sonneborn-Berger
        x.tb = t.format === "swiss" ? x.opp.reduce((n, o) => n + (S[o] ? S[o].pts : 0), 0)
          : Object.keys(x.res).reduce((n, o) => n + x.res[o] * (S[o] ? S[o].pts : 0), 0);
      });
      return rows.sort((a, b) => b.pts - a.pts || b.tb - a.tb || b.w - a.w || a.seed - b.seed);
    }
    function roundDone(r) { return (r.pairs || []).every(g => !!T_RES[g.r]); }

    // ---------- جدول الدوري (Circle method) ----------
    function rrSchedule(players, double) {
      const ids = players.map(p => p.id); if (ids.length % 2) ids.push(null);
      const n = ids.length, rounds = [];
      let arr = ids.slice();
      for (let r = 0; r < n - 1; r++) {
        const pairs = []; let bye = null;
        for (let i = 0; i < n / 2; i++) {
          const a = arr[i], b = arr[n - 1 - i];
          if (a === null || b === null) { bye = a === null ? b : a; continue; }
          pairs.push((r + i) % 2 === 0 ? { w: a, b, r: "" } : { w: b, b: a, r: "" });
        }
        rounds.push({ pairs, bye });
        arr = [arr[0], arr[n - 1], ...arr.slice(1, n - 1)];
      }
      if (double) rounds.slice().forEach(r => rounds.push({ pairs: r.pairs.map(g => ({ w: g.b, b: g.w, r: "" })), bye: r.bye }));
      return rounds;
    }

    // ---------- التوفيق السويسري ----------
    function swissNext(t) {
      const st = standings(t), byId = {}; st.forEach(x => byId[x.id] = x);
      const lvl = {}; (t.players || []).forEach(p => lvl[p.id] = Number(p.lvl) || 0);
      const order = st.slice().sort((a, b) => b.pts - a.pts || (lvl[b.id] - lvl[a.id]) || a.seed - b.seed).map(x => x.id);
      let bye = null;
      if (order.length % 2) {
        for (let i = order.length - 1; i >= 0; i--) if (!byId[order[i]].byes) { bye = order[i]; break; }
        if (bye === null) bye = order[order.length - 1];
        order.splice(order.indexOf(bye), 1);
      }
      const met = (a, b) => byId[a].opp.includes(b);
      let budget = 20000;
      function pairUp(list, allowRematch) {
        if (!list.length) return [];
        if (--budget < 0) return null;
        const [p, ...rest] = list;
        // زي النظام الهولندي: النص الأعلى من مجموعة النقط يقابل النص الأسفل (الأول ضد اللي في نص المجموعة)
        const grp = rest.filter(q => byId[q].pts === byId[p].pts), others = rest.filter(q => byId[q].pts !== byId[p].pts);
        const ti = Math.max(0, Math.floor((grp.length + 1) / 2) - 1);
        const cands = grp.slice(ti).concat(grp.slice(0, ti).reverse(), others);
        for (const q of cands) {
          if (!allowRematch && met(p, q)) continue;
          const sub = pairUp(rest.filter(x => x !== q), allowRematch);
          if (sub) return [[p, q], ...sub];
        }
        return null;
      }
      let pr = pairUp(order, false); if (!pr) { budget = 20000; pr = pairUp(order, true); }
      // الألوان: اللي لعب أبيض أقل ياخد الأبيض، ولو متساويين اللي لعب آخر ماتش أسود
      const colorBal = id => { let w = 0, b = 0, last = ""; (t.rounds || []).forEach(r => (r.pairs || []).forEach(g => { if (g.w === id) { w++; last = "w"; } else if (g.b === id) { b++; last = "b"; } })); return { d: w - b, last }; };
      const pairs = (pr || []).map(([a, b], i) => {
        const A = colorBal(a), B = colorBal(b);
        const aWhite = A.d !== B.d ? A.d < B.d : A.last !== B.last ? A.last === "b" : (t.rounds.length + i) % 2 === 0;
        return aWhite ? { w: a, b, r: "" } : { w: b, b: a, r: "" };
      });
      return { pairs, bye };
    }

    // ---------- أفعال الكوتش ----------
    function trnNew() { trnForm = { name: "", format: "swiss", rounds: 5, double: false, date: todayISO(), players: {}, guests: "", grp: "ALL" }; trnSel = null; render(); }
    function trnFormSet(k, v) { if (!trnForm) return; trnForm[k] = v; if (k === "format" || k === "grp") keepScroll(render); }
    function trnTogglePlayer(id) { if (!trnForm) return; trnForm.players[id] = !trnForm.players[id]; keepScroll(render); }
    function trnSelectGroup(on) {
      if (!trnForm) return;
      db.users.filter(u => u.role === "student" && (trnForm.grp === "ALL" || u.group === trnForm.grp)).forEach(u => { trnForm.players[u.id] = !!on; });
      keepScroll(render);
    }
    function trnCreate() {
      if (!isCoach() || !trnForm) return;
      const name = String((document.getElementById("trnName") || {}).value || trnForm.name || "").replace(/[<>"'`]/g, "").trim().slice(0, 80);
      if (!name) return toast("اكتب اسم البطولة");
      const studs = db.users.filter(u => u.role === "student" && trnForm.players[u.id]).map(u => ({ id: u.id, name: String(u.name || "").slice(0, 60), lvl: Number(u.level) || 1 }));
      const guests = String((document.getElementById("trnGuests") || {}).value || "").split(/\n/).map(x => x.replace(/[<>"'`]/g, "").trim()).filter(Boolean).slice(0, 40)
        .map(n => ({ id: "g" + Math.random().toString(36).slice(2, 9), name: n.slice(0, 60), lvl: 0, guest: true }));
      const players = studs.concat(guests);
      if (players.length < 3) return toast("البطولة محتاجة 3 لاعبين على الأقل");
      if (players.length > 64) return toast("الحد الأقصى 64 لاعب");
      const fmt = trnForm.format === "rr" ? "rr" : "swiss";
      const maxR = players.length - (players.length % 2 ? 0 : 1);
      const totalRounds = fmt === "rr" ? (players.length % 2 ? players.length : players.length - 1) * (trnForm.double ? 2 : 1)
        : Math.max(1, Math.min(Number((document.getElementById("trnRounds") || {}).value || trnForm.rounds) || 5, maxR, 15));
      if (fmt === "rr" && totalRounds > 60) return toast("عدد اللاعبين كبير على نظام الدوري — استخدم السويسري");
      const t = { id: trnId(), name, format: fmt, double: fmt === "rr" && !!trnForm.double, totalRounds, status: "running", createdAt: Date.now(),
        date: (document.getElementById("trnDate") || {}).value || todayISO(), players, rounds: [] };
      t.rounds = fmt === "rr" ? rrSchedule(players, t.double) : [swissNext(t)];
      db.tournaments = [t].concat(db.tournaments || []);
      trnForm = null; trnSel = t.id; trnView = "rounds";
      trnSave(t); toast("البطولة اتعملت والجولة الأولى جاهزة");
    }
    function trnResult(ri, gi, r) {
      if (!isCoach()) return;
      const t = trnFind(trnSel); if (!t || t.status === "done") return;
      const g = ((t.rounds[ri] || {}).pairs || [])[gi]; if (!g) return;
      g.r = g.r === r ? "" : r; trnSave(t);
    }
    function trnNextRound() {
      if (!isCoach()) return;
      const t = trnFind(trnSel); if (!t || t.format !== "swiss") return;
      const last = t.rounds[t.rounds.length - 1];
      if (last && !roundDone(last)) return toast("سجّل نتايج الجولة الحالية الأول");
      if (t.rounds.length >= t.totalRounds) return toast("كل الجولات خلصت — اضغط «إنهاء البطولة»");
      t.rounds.push(swissNext(t)); trnSave(t); toast(LT(`الجولة ${t.rounds.length} جاهزة`, `Round ${t.rounds.length} is ready`));
    }
    function trnUndoRound() {
      if (!isCoach()) return;
      const t = trnFind(trnSel); if (!t || t.format !== "swiss" || t.rounds.length < 2) return;
      const last = t.rounds[t.rounds.length - 1];
      if (last.pairs.some(g => g.r) && !confirm(trText("الجولة دي فيها نتايج متسجّلة. تمسحها؟"))) return;
      t.rounds.pop(); trnSave(t);
    }
    function trnFinish() {
      if (!isCoach()) return;
      const t = trnFind(trnSel); if (!t) return;
      if (!t.rounds.every(roundDone) && !confirm(trText("فيه ماتشات من غير نتيجة. تنهي البطولة برضه؟"))) return;
      t.status = "done"; t.finishedAt = Date.now(); trnSave(t); toast("البطولة خلصت — مبروك للأبطال!");
    }
    function trnReopen() { if (!isCoach()) return; const t = trnFind(trnSel); if (!t) return; t.status = "running"; delete t.finishedAt; trnSave(t); }
    async function trnDelete() {
      if (!isCoach()) return;
      const t = trnFind(trnSel); if (!t) return;
      if (!confirm(trText("حذف البطولة نهائياً؟") + "\n" + t.name)) return;
      db.tournaments = (db.tournaments || []).filter(x => x.id !== t.id); trnSel = null;
      if (window.fbDeleteTournament) await window.fbDeleteTournament(t.id);
      render(); toast("اتحذفت");
    }
    async function trnCopyStandings() {
      const t = trnFind(trnSel); if (!t) return;
      const medals = ["", "", ""];
      const rows = standings(t).map((x, i) => `${medals[i] || (i + 1) + "."} ${x.name} — ${fmtPts(x.pts)}`);
      const head = t.status === "done" ? LT(`النتيجة النهائية — ${t.name}`, `Final standings — ${t.name}`)
        : LT(`الترتيب بعد الجولة ${t.rounds.filter(roundDone).length} — ${t.name}`, `Standings after round ${t.rounds.filter(roundDone).length} — ${t.name}`);
      const txt = `Egypt Chess Academy (ECA)\n${head}\n\n${rows.join("\n")}\n\n`;
      try { await navigator.clipboard.writeText(txt); toast("الترتيب اتنسخ — الصقه في جروب الواتساب"); } catch (_) { prompt(trText("انسخ الرسالة:"), txt); }
    }

    // ---------- العرض ----------
    function myTournamentMatch(u) {
      for (const t of db.tournaments || []) {
        if (t.status !== "running" || !(t.players || []).some(p => p.id === u.id)) continue;
        const ri = t.rounds.length - 1, r = t.rounds[ri]; if (!r) continue;
        const g = r.pairs.find(x => (x.w === u.id || x.b === u.id) && !x.r);
        if (g) return { t, ri, g, white: g.w === u.id, opp: pName(t, g.w === u.id ? g.b : g.w) };
        if (r.bye === u.id) return { t, ri, bye: true };
      }
      return null;
    }
    function tournamentHomeCard(u) {
      const m = myTournamentMatch(u); if (!m) return "";
      return `<div class="gold-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border-2 border-yellow-500/40">
        <div>
          <div class="text-xs text-yellow-300 font-bold">${esc(m.t.name)} • ${LT("الجولة", "Round")} ${m.ri + 1}</div>
          <div class="text-sm font-bold text-white mt-1">${m.bye ? LT("عندك راحة الجولة دي (Bye)", "You have a bye this round") : `${m.white ? "♔" : "♚"} ${LT("ماتشك ضد", "Your game vs")} ${esc(m.opp)} — ${m.white ? LT("أبيض", "White") : LT("أسود", "Black")}`}</div>
        </div>
        <button onclick="trnSel='${m.t.id}'; trnView='rounds'; switchTab('tournaments')" class="tap px-4 rounded-xl text-xs gold-btn">${LT("افتح البطولة", "Open tournament")}</button>
      </div>`;
    }

    function trnFormHTML() {
      const F = trnForm, studs = db.users.filter(u => u.role === "student" && (F.grp === "ALL" || u.group === F.grp)).sort((a, b) => String(a.name).localeCompare(String(b.name), "ar"));
      const nSel = Object.values(F.players).filter(Boolean).length;
      const pill = on => `tap px-3 rounded-xl text-xs font-bold ${on ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/25"}`;
      return `<div class="gold-card rounded-2xl p-5 space-y-4">
        <div class="flex justify-between items-center"><h2 class="font-display font-bold text-xl gold-gradient-text">بطولة جديدة</h2>
          <button onclick="trnForm=null; render();" class="tap px-3 rounded-xl text-xs bg-zinc-900 text-gray-300">✕</button></div>
        <div class="grid sm:grid-cols-2 gap-3">
          <label class="text-xs text-gray-400">اسم البطولة<input id="trnName" value="${esc(F.name)}" oninput="trnForm.name=this.value" maxlength="80" placeholder="مثلاً: بطولة أكتوبر للناشئين" class="mt-1 w-full tap bg-black border border-yellow-500/40 rounded-xl px-3 text-sm text-white" /></label>
          <label class="text-xs text-gray-400">${LT("التاريخ", "Date")}<input id="trnDate" type="date" value="${esc(F.date)}" onchange="trnForm.date=this.value" class="mt-1 w-full tap bg-black border border-yellow-500/40 rounded-xl px-3 text-sm text-white" /></label>
        </div>
        <div class="space-y-2">
          <div class="text-xs text-gray-400">${LT("النظام", "Format")}</div>
          <div class="flex flex-wrap gap-2">
            <button onclick="trnFormSet('format','swiss')" class="${pill(F.format === "swiss")}">🇨🇭 سويسري</button>
            <button onclick="trnFormSet('format','rr')" class="${pill(F.format === "rr")}">دوري (كل واحد ضد الكل)</button>
          </div>
          ${F.format === "swiss" ? `<label class="text-xs text-gray-400 flex items-center gap-2">عدد الجولات<input id="trnRounds" type="number" min="1" max="15" value="${F.rounds}" onchange="trnForm.rounds=Number(this.value)" class="tap w-20 bg-black border border-yellow-500/40 rounded-xl px-2 text-sm text-white" /></label>
            <p class="text-[11px] text-gray-500">السويسري مناسب للعدد الكبير: كل جولة بيتقابل أصحاب النقط المتقاربة، ومفيش حد بيقابل نفس الخصم مرتين.</p>`
          : `<label class="text-xs text-gray-400 flex items-center gap-2"><input type="checkbox" ${F.double ? "checked" : ""} onchange="trnForm.double=this.checked" /> دوري من دورين (ذهاب وإياب بالألوان معكوسة)</label>
            <p class="text-[11px] text-gray-500">الدوري مناسب لحد 10 لاعبين تقريباً: كل لاعب بيقابل الكل، والجدول كله بيتعمل مرة واحدة.</p>`}
        </div>
        <div class="space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div class="text-xs text-gray-400">${LT(`اللاعبين (${nSel} طالب)`, `Players (${nSel} students)`)}</div>
            <div class="flex flex-wrap gap-2">
              <select onchange="trnFormSet('grp', this.value)" class="tap bg-black border border-yellow-500/40 rounded-xl px-2 text-xs text-white">
                <option value="ALL">كل المجموعات</option>${(db.groups || []).map(g => `<option value="${esc(g)}" ${F.grp === g ? "selected" : ""}>${esc(g)}</option>`).join("")}
              </select>
              <button onclick="trnSelectGroup(true)" class="tap px-3 rounded-xl text-[11px] bg-zinc-900 text-yellow-300 border border-yellow-500/30">اختار الكل</button>
              <button onclick="trnSelectGroup(false)" class="tap px-3 rounded-xl text-[11px] bg-zinc-900 text-gray-300 border border-zinc-700">${LT("مسح الاختيار", "Clear")}</button>
            </div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-64 overflow-y-auto">
            ${studs.map(u => `<button onclick="trnTogglePlayer('${u.id}')" aria-pressed="${!!F.players[u.id]}" class="tap px-2 rounded-xl text-[11px] font-bold text-start ${F.players[u.id] ? "bg-yellow-500/20 text-yellow-200 border border-yellow-500/60" : "bg-black/60 text-gray-300 border border-zinc-800"}">${F.players[u.id] ? "✓ " : ""}${esc(u.name)} <span class="text-gray-500">S${esc(String(u.level || 1))}</span></button>`).join("") || `<p class="text-xs text-gray-500">مفيش طلبة.</p>`}
          </div>
          <label class="block text-xs text-gray-400">لاعبين من بره الأكاديمية (اسم في كل سطر — اختياري)
            <textarea id="trnGuests" rows="2" oninput="trnForm.guests=this.value" class="mt-1 w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-sm text-white">${esc(F.guests)}</textarea></label>
        </div>
        <button onclick="trnCreate()" class="tap px-5 rounded-xl text-sm gold-btn">ابدأ البطولة</button>
      </div>`;
    }

    function trnListHTML(u) {
      const coach = u.role === "coach";
      const list = (db.tournaments || []).filter(t => coach || (t.players || []).some(p => p.id === u.id) || t.status === "done");
      const badge = t => t.status === "done" ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-gray-300">${LT("خلصت", "Finished")}</span>`
        : `<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">● ${LT("شغّالة", "Live")}</span>`;
      return `<div class="space-y-5">
        <div class="gold-card rounded-2xl p-5 flex flex-wrap justify-between items-center gap-3">
          <div><h2 class="font-display font-bold text-xl gold-gradient-text">البطولات الداخلية</h2>
            <p class="text-xs text-gray-400">${coach ? "اعمل بطولة دوري أو سويسري، سجّل النتايج، والترتيب بيتحسب لوحده." : "بطولاتك ونتايجك وترتيبك."}</p></div>
          ${coach ? `<button onclick="trnNew()" class="tap px-4 rounded-xl text-xs gold-btn">بطولة جديدة</button>` : ""}
        </div>
        ${coach ? "" : tournamentHomeCard(u)}
        ${list.length ? `<div class="grid sm:grid-cols-2 gap-3">${list.map(t => {
          const top = standings(t)[0], done = t.rounds.filter(roundDone).length;
          return `<button onclick="trnSel='${t.id}'; trnView='rounds'; render();" class="gold-card rounded-2xl p-4 text-start space-y-2 hover:border-yellow-500/60">
            <div class="flex items-center justify-between gap-2"><span class="font-bold text-yellow-300">${esc(t.name)}</span>${badge(t)}</div>
            <div class="text-[11px] text-gray-400">${t.format === "rr" ? LT("دوري", "Round robin") : LT("🇨🇭 سويسري", "🇨🇭 Swiss")} • ${t.players.length} ${LT("لاعب", "players")} • ${LT(`جولة ${done}/${t.totalRounds}`, `round ${done}/${t.totalRounds}`)} • ${esc(t.date || "")}</div>
            ${top && top.played ? `<div class="text-xs text-white">${t.status === "done" ? LT("البطل:", "Champion:") : LT("المتصدر:", "Leader:")} ${esc(top.name)} — ${fmtPts(top.pts)}</div>` : ""}
          </button>`; }).join("")}</div>`
          : `<div class="gold-card rounded-2xl p-6 text-center text-xs text-gray-400">${coach ? "مفيش بطولات لسه. اضغط «بطولة جديدة»." : "لسه مفيش بطولات ليك. الكوتش هيعلن عن البطولة الجاية!"}</div>`}
      </div>`;
    }

    function trnDetailHTML(u, t) {
      const coach = u.role === "coach", me = u.id, st = standings(t);
      const cur = t.rounds.length - 1, last = t.rounds[cur];
      const canNext = coach && t.status === "running" && t.format === "swiss" && t.rounds.length < t.totalRounds && last && roundDone(last);
      const resBtn = (ri, gi, g, r, label) => `<button onclick="trnResult(${ri},${gi},'${r}')" class="tap min-w-[44px] px-2 rounded-lg text-xs font-bold ${g.r === r ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/25"}">${label}</button>`;
      const resTxt = r => r === "1-0" ? "1 – 0" : r === "0-1" ? "0 – 1" : r === "D" ? "½ – ½" : "…";
      const roundHTML = (r, ri) => `<div class="rounded-2xl bg-black/60 border border-yellow-500/20 p-4 space-y-2">
        <div class="flex items-center justify-between"><span class="font-bold text-yellow-300">${LT("الجولة", "Round")} ${ri + 1}</span>
          <span class="text-[11px] ${roundDone(r) ? "text-emerald-300" : "text-gray-500"}">${roundDone(r) ? "" : `${r.pairs.filter(g => T_RES[g.r]).length}/${r.pairs.length}`}</span></div>
        ${r.pairs.map((g, gi) => {
          const mine = g.w === me || g.b === me;
          return `<div class="flex flex-wrap items-center justify-between gap-2 py-1.5 px-2 rounded-xl ${mine ? "bg-yellow-500/10 border border-yellow-500/40" : ""}">
            <div class="text-sm text-white flex-1 min-w-[150px]"><span class="text-gray-400">♔</span> <b>${esc(pName(t, g.w))}</b> <span class="text-gray-500 mx-1">vs</span> <span class="text-gray-400">♚</span> <b>${esc(pName(t, g.b))}</b></div>
            ${coach && t.status === "running" ? `<div class="flex gap-1">${resBtn(ri, gi, g, "1-0", "1–0")}${resBtn(ri, gi, g, "D", "½")}${resBtn(ri, gi, g, "0-1", "0–1")}</div>`
              : `<span class="text-sm font-extrabold ${g.r ? "text-yellow-300" : "text-gray-500"}">${resTxt(g.r)}</span>`}
          </div>`; }).join("")}
        ${r.bye ? `<div class="text-[11px] text-gray-400 px-2">${LT("راحة", "Bye")}: ${esc(pName(t, r.bye))}${t.format === "swiss" ? LT(" (+1 نقطة)", " (+1 point)") : ""}</div>` : ""}
      </div>`;
      const tableHTML = `<div class="overflow-x-auto"><table class="w-full text-xs text-white">
        <thead><tr class="text-yellow-300 border-b border-yellow-500/30"><th class="py-2 px-2 text-start">#</th><th class="py-2 px-2 text-start">${LT("اللاعب", "Player")}</th>
          <th class="py-2 px-2">${LT("نقط", "Pts")}</th><th class="py-2 px-2">${LT("لعب", "P")}</th><th class="py-2 px-2">${LT("ف", "W")}</th><th class="py-2 px-2">${LT("ت", "D")}</th><th class="py-2 px-2">${LT("خ", "L")}</th>
          <th class="py-2 px-2" title="${t.format === "swiss" ? "Buchholz" : "Sonneborn-Berger"}">${t.format === "swiss" ? "BH" : "SB"}</th></tr></thead>
        <tbody class="divide-y divide-yellow-500/10">${st.map((x, i) => `<tr class="${x.id === me ? "bg-yellow-500/10" : ""}">
          <td class="py-2 px-2 font-bold">${["", "", ""][i] && x.played ? ["", "", ""][i] : i + 1}</td><td class="py-2 px-2 font-bold">${esc(x.name)}</td>
          <td class="py-2 px-2 text-center font-extrabold text-yellow-300">${fmtPts(x.pts)}</td><td class="py-2 px-2 text-center">${x.played}</td>
          <td class="py-2 px-2 text-center text-emerald-300">${x.w}</td><td class="py-2 px-2 text-center">${x.d}</td><td class="py-2 px-2 text-center text-red-300">${x.l}</td>
          <td class="py-2 px-2 text-center text-gray-400">${fmtPts(x.tb)}</td></tr>`).join("")}</tbody></table></div>
        <p class="text-[10px] text-gray-500 mt-2">${t.format === "swiss" ? LT("كسر التعادل: Buchholz (مجموع نقط الخصوم)، بعدين عدد الانتصارات.", "Tie-break: Buchholz (sum of opponents' points), then wins.") : LT("كسر التعادل: Sonneborn-Berger، بعدين عدد الانتصارات.", "Tie-break: Sonneborn-Berger, then wins.")}</p>`;
      const tabBtn = (v, label) => `<button onclick="trnView='${v}'; render();" class="tap px-4 rounded-xl text-xs font-bold ${trnView === v ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/25"}">${label}</button>`;
      return `<div class="space-y-5">
        <div class="gold-card rounded-2xl p-5 space-y-3">
          <div class="flex flex-wrap justify-between items-start gap-3">
            <div>
              <button onclick="trnSel=null; render();" class="text-[11px] text-gray-400 hover:text-yellow-300">${LT("→ كل البطولات", "← All tournaments")}</button>
              <h2 class="font-display font-bold text-xl gold-gradient-text mt-1">${esc(t.name)}</h2>
              <p class="text-xs text-gray-400">${t.format === "rr" ? (t.double ? LT("دوري من دورين", "Double round robin") : LT("دوري", "Round robin")) : LT("🇨🇭 سويسري", "🇨🇭 Swiss")} • ${t.players.length} ${LT("لاعب", "players")} • ${LT(`${t.rounds.filter(roundDone).length} من ${t.totalRounds} جولة`, `${t.rounds.filter(roundDone).length} of ${t.totalRounds} rounds`)} • ${esc(t.date || "")}</p>
            </div>
            ${t.status === "done" && st[0] ? `<div class="text-center text-yellow-300">${ICON("trophy", "w-8 h-8 mx-auto")}<div class="text-xs font-bold mt-1">${esc(st[0].name)}</div></div>` : ""}
          </div>
          <div class="flex flex-wrap gap-2">
            ${tabBtn("rounds", LT("الجولات", "Rounds"))}${tabBtn("table", LT("الترتيب", "Standings"))}
            <button onclick="trnCopyStandings()" class="tap px-3 rounded-xl text-xs bg-zinc-900 text-emerald-300 border border-emerald-500/40">${LT("الترتيب للواتساب", "Standings for WhatsApp")}</button>
          </div>
          ${coach ? `<div class="flex flex-wrap gap-2 pt-2 border-t border-yellow-500/15">
            ${canNext ? `<button onclick="trnNextRound()" class="tap px-4 rounded-xl text-xs gold-btn">${LT("اعمل الجولة الجاية", "Pair next round")}</button>` : ""}
            ${t.status === "running" && t.format === "swiss" && t.rounds.length > 1 ? `<button onclick="trnUndoRound()" class="tap px-3 rounded-xl text-xs bg-zinc-900 text-gray-300 border border-zinc-700">${LT("الغي آخر جولة", "Undo last round")}</button>` : ""}
            ${t.status === "running" ? `<button onclick="trnFinish()" class="tap px-3 rounded-xl text-xs bg-zinc-900 text-yellow-300 border border-yellow-500/40">${LT("إنهاء البطولة", "Finish tournament")}</button>`
              : `<button onclick="trnReopen()" class="tap px-3 rounded-xl text-xs bg-zinc-900 text-gray-300 border border-zinc-700">${LT("افتحها تاني", "Reopen")}</button>`}
            <button onclick="trnDelete()" class="tap px-3 rounded-xl text-xs bg-red-500/15 text-red-300 border border-red-500/40">${LT("حذف", "Delete")}</button>
          </div>` : ""}
        </div>
        ${trnView === "table" ? `<div class="gold-card rounded-2xl p-5">${tableHTML}</div>`
          : `<div class="space-y-3">${t.rounds.map((r, ri) => ({ r, ri })).reverse().map(x => roundHTML(x.r, x.ri)).join("")}</div>`}
      </div>`;
    }

    function renderTournamentsView(u) {
      if (u.role === "coach" && trnForm) return trnFormHTML();
      const t = trnSel ? trnFind(trnSel) : null;
      return t ? trnDetailHTML(u, t) : trnListHTML(u);
    }

    // ماتش البطولة في رئيسية الطالب + شارات البطولات
    {
      const _sh = renderStudentHome;
      renderStudentHome = function (s) { const c = tournamentHomeCard(s); return c ? `<div class="space-y-6">${c}${_sh(s)}</div>` : _sh(s); };
      const _bl = badgeList;
      badgeList = function (s) {
        const mine = (db.tournaments || []).filter(t => (t.players || []).some(p => p.id === s.id));
        const won = mine.some(t => t.rounds.some(r => r.pairs.some(g => (g.w === s.id && g.r === "1-0") || (g.b === s.id && g.r === "0-1"))));
        const places = mine.filter(t => t.status === "done").map(t => standings(t).findIndex(x => x.id === s.id));
        return _bl(s).concat([{ cat: "البطولات", items: [
          ["أول بطولة", "شارك في أول بطولة داخلية", "chess-pawn-icon.svg", mine.length >= 1],
          ["أول فوز في بطولة", "اكسب ماتش في بطولة", "chess-knight-icon.svg", won],
          ["منصة التتويج", "اطلع من أول 3 في بطولة", "chess-rook-icon.svg", places.some(p => p >= 0 && p <= 2)],
          ["بطل الأكاديمية", "اكسب المركز الأول في بطولة", "chess-king-icon.svg", places.some(p => p === 0)]] }]);
      };
    }

    DICT.push(
      ["البطولات الداخلية", "Internal tournaments"], ["البطولات", "Tournaments"], ["بطولة جديدة", "New tournament"],
      ["اعمل بطولة دوري أو سويسري، سجّل النتايج، والترتيب بيتحسب لوحده.", "Create a round-robin or Swiss tournament, enter results, and standings update automatically."],
      ["بطولاتك ونتايجك وترتيبك.", "Your tournaments, results and standings."], ["مفيش بطولات لسه. اضغط «بطولة جديدة».", "No tournaments yet. Tap «New tournament»."],
      ["لسه مفيش بطولات ليك. الكوتش هيعلن عن البطولة الجاية!", "No tournaments for you yet. Your coach will announce the next one!"],
      ["اسم البطولة", "Tournament name"], ["مثلاً: بطولة أكتوبر للناشئين", "e.g. October Juniors Cup"],
      ["🇨🇭 سويسري", "🇨🇭 Swiss"], ["دوري (كل واحد ضد الكل)", "Round robin (everyone plays everyone)"], ["عدد الجولات", "Rounds"],
      ["السويسري مناسب للعدد الكبير: كل جولة بيتقابل أصحاب النقط المتقاربة، ومفيش حد بيقابل نفس الخصم مرتين.", "Swiss suits bigger groups: players with similar scores meet each round, and nobody meets the same opponent twice."],
      ["دوري من دورين (ذهاب وإياب بالألوان معكوسة)", "Double round robin (second leg with colours reversed)"],
      ["الدوري مناسب لحد 10 لاعبين تقريباً: كل لاعب بيقابل الكل، والجدول كله بيتعمل مرة واحدة.", "Round robin suits up to about 10 players: everyone meets everyone, and the whole schedule is made at once."],
      ["كل المجموعات", "All groups"], ["اختار الكل", "Select all"], ["مفيش طلبة.", "No students."],
      ["لاعبين من بره الأكاديمية (اسم في كل سطر — اختياري)", "Guest players (one name per line — optional)"], ["ابدأ البطولة", "Start tournament"],
      ["اكتب اسم البطولة", "Enter a tournament name"], ["البطولة محتاجة 3 لاعبين على الأقل", "A tournament needs at least 3 players"],
      ["الحد الأقصى 64 لاعب", "Maximum 64 players"], ["عدد اللاعبين كبير على نظام الدوري — استخدم السويسري", "Too many players for round robin — use Swiss"],
      ["البطولة اتعملت والجولة الأولى جاهزة", "Tournament created and round 1 is ready"], ["سجّل نتايج الجولة الحالية الأول", "Enter the current round's results first"],
      ["كل الجولات خلصت — اضغط «إنهاء البطولة»", "All rounds are done — tap «Finish tournament»"], ["الجولة دي فيها نتايج متسجّلة. تمسحها؟", "This round has results. Delete it?"],
      ["فيه ماتشات من غير نتيجة. تنهي البطولة برضه؟", "Some games have no result. Finish anyway?"], ["البطولة خلصت — مبروك للأبطال!", "Tournament finished — congrats to the winners!"],
      ["حذف البطولة نهائياً؟", "Delete this tournament permanently?"], ["اتحذفت", "Deleted"], ["الترتيب اتنسخ — الصقه في جروب الواتساب", "Standings copied — paste them in the WhatsApp group"],
      ["تعذّر حفظ البطولة", "Couldn't save the tournament"],
      ["أول بطولة", "First tournament"], ["شارك في أول بطولة داخلية", "Play in your first internal tournament"], ["أول فوز في بطولة", "First tournament win"],
      ["اكسب ماتش في بطولة", "Win a game in a tournament"], ["منصة التتويج", "Podium"], ["اطلع من أول 3 في بطولة", "Finish top 3 in a tournament"],
      ["بطل الأكاديمية", "Academy champion"], ["اكسب المركز الأول في بطولة", "Win first place in a tournament"]
    );
    DICT.sort((a, b) => b[0].length - a[0].length);
