// ECA — progress.js: رسم بياني لتقدّم الطالب على مدار الشهور + ربط حساب Lichess (eca-v7)
// البيانات: أيام التمرين (arena.days)، الألغاز الصح من دفتر المحاولات، وتقييم Lichess الشهري لو الحساب مربوط.

    const LP = (ar, en) => lang === "en" ? en : ar;
    const PG = {};                                       // كاش لكل طالب: { st, att, li, liHist, liErr }
    const MON_AR = ["ينا", "فبر", "مار", "أبر", "ماي", "يون", "يول", "أغس", "سبت", "أكت", "نوف", "ديس"];
    const MON_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const LI_OK = /^[A-Za-z0-9_-]{2,30}$/;
    function lastMonths(n) {
      const out = [], d = new Date(); d.setDate(1);
      for (let i = 0; i < n; i++) { out.unshift(d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0")); d.setMonth(d.getMonth() - 1); }
      return out;
    }
    const monShort = m => (lang === "en" ? MON_EN : MON_AR)[Number(m.slice(5)) - 1];
    const refreshIf = tabs => { if (tabs.includes(tab)) keepScroll(render); };

    // ---------- Lichess ----------
    async function liFetchUser(name) {
      const r = await fetch("https://lichess.org/api/user/" + encodeURIComponent(name), { headers: { Accept: "application/json" } });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }
    function progLoad(u) {
      const P = PG[u.id] = PG[u.id] || {};
      if (P.st) return P;
      P.st = "loading";
      const jobs = [];
      if (window.fbStudentAttempts) jobs.push(window.fbStudentAttempts(u.id).then(l => { P.att = l || []; }).catch(() => { P.att = []; }));
      if (u.lichess && LI_OK.test(u.lichess)) {
        jobs.push(liFetchUser(u.lichess).then(j => { P.li = j; }).catch(() => { P.liErr = true; }));
        jobs.push(fetch("https://lichess.org/api/user/" + encodeURIComponent(u.lichess) + "/rating-history").then(r => r.ok ? r.json() : []).then(h => { P.liHist = h; }).catch(() => { P.liHist = []; }));
      }
      Promise.all(jobs).then(() => { P.st = "ok"; refreshIf(["home", "parent"]); });
      return P;
    }
    function progReset(id) { delete PG[id]; }

    async function liLink() {
      const u = currUser(); if (!u || u.role !== "student") return;
      const name = String((document.getElementById("liName") || {}).value || "").trim();
      if (!LI_OK.test(name)) return toast("اسم المستخدم على Lichess حروف إنجليزي وأرقام بس");
      toast("بندوّر على الحساب...");
      try {
        const j = await liFetchUser(name);
        if (!j) return toast("مفيش حساب بالاسم ده على Lichess");
        if (j.disabled || j.tosViolation) return toast("الحساب ده مقفول على Lichess");
        u.lichess = j.username || name; progReset(u.id); save(); render(); toast("اتربط حساب Lichess");
      } catch (_) { toast("تعذّر الوصول لـ Lichess — جرّب تاني"); }
    }
    function liUnlink() { const u = currUser(); if (!u || u.role !== "student") return; if (!confirm(trText("فك ربط حساب Lichess؟"))) return; delete u.lichess; u.lichess = ""; progReset(u.id); save(); render(); }

    function liCardHTML(u, editable) {
      const P = u.lichess ? progLoad(u) : null;
      if (!u.lichess) {
        if (!editable) return "";
        return `<div class="gold-card rounded-2xl p-4 space-y-2">
          <div class="text-sm font-bold text-yellow-300">${LP("اربط حسابك على Lichess", "Link your Lichess account")}</div>
          <p class="text-[11px] text-gray-400">${LP("هنعرض تقييمك الحقيقي على Lichess جنب تقييم الأكاديمية، ورسم بياني لتطوّره كل شهر.", "We'll show your real Lichess rating next to your academy rank, with a monthly progress chart.")}</p>
          <div class="flex gap-2"><input id="liName" dir="ltr" maxlength="30" placeholder="Lichess username" autocomplete="off" class="tap flex-1 min-w-0 bg-black border border-yellow-500/40 rounded-xl px-3 text-sm text-white" />
            <button onclick="liLink()" class="tap px-4 rounded-xl text-xs gold-btn">${LP("اربط", "Link")}</button></div>
        </div>`;
      }
      const pf = (P.li && P.li.perfs) || {}, xp = calcXP(u), rk = rankOf(xp.total);
      const chip = (icon, label, p) => p && p.games ? `<div class="rounded-xl bg-black/60 border border-zinc-800 p-2 text-center"><div class="text-lg font-extrabold text-white">${p.rating}${p.prov ? "?" : ""}</div><div class="text-[10px] text-gray-400">${icon} ${label}</div></div>` : "";
      const chips = [chip("", LP("ألغاز", "Puzzles"), pf.puzzle), chip("", "Rapid", pf.rapid), chip("", "Blitz", pf.blitz), chip("", "Classical", pf.classical)].filter(Boolean).join("");
      return `<div class="gold-card rounded-2xl p-4 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <a href="https://lichess.org/@/${encodeURIComponent(u.lichess)}" target="_blank" rel="noopener" dir="ltr" class="text-sm font-bold text-sky-300 hover:underline">lichess.org/@/${esc(u.lichess)} ↗</a>
          ${editable ? `<button onclick="liUnlink()" class="text-[11px] text-gray-500 hover:text-red-300">${LP("فك الربط", "Unlink")}</button>` : ""}
        </div>
        ${P.st !== "ok" ? `<div class="text-xs text-gray-400">${LP("جاري تحميل التقييم...", "Loading ratings...")}</div>`
          : P.liErr || !P.li ? `<div class="text-xs text-red-300">${LP("تعذّر تحميل بيانات Lichess دلوقتي.", "Couldn't load Lichess data right now.")}</div>`
          : `<div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <div class="rounded-xl bg-yellow-500/10 border border-yellow-500/40 p-2 text-center"><div class="text-sm font-extrabold text-yellow-300">${esc(rk.cur ? rk.cur.label : LP("بدون رتبة", "No rank"))}</div><div class="text-[10px] text-gray-400">ECA • ${xp.total.toLocaleString("en-US")} XP</div></div>
              ${chips || `<div class="col-span-2 text-[11px] text-gray-400 self-center">${LP("لسه مفيش أدوار أو ألغاز متقيّمة على الحساب ده.", "No rated games or puzzles on this account yet.")}</div>`}
            </div>`}
      </div>`;
    }

    // ---------- الرسم البياني ----------
    function liMonthly(hist, perf, months) {
      const h = (hist || []).find(x => x.name === perf); if (!h || !h.points || !h.points.length) return null;
      const pts = h.points.map(([y, m, d, r]) => ({ k: y + "-" + String(m + 1).padStart(2, "0"), r }));
      let last = null; const out = {};
      const first = months[0];
      pts.forEach(p => { if (p.k < first) last = p.r; });
      months.forEach(m => { pts.filter(p => p.k === m).forEach(p => { last = p.r; }); out[m] = last; });
      return Object.values(out).some(v => v !== null) ? out : null;
    }
    function chartSVG(months, series, line) {
      const W = 420, H = 230, padL = 28, padR = line ? 40 : 8, padT = 18, padB = 30;
      const iw = W - padL - padR, ih = H - padT - padB, gw = iw / months.length;
      const maxBar = Math.max(4, ...series.flatMap(s => months.map(m => s.v[m] || 0)));
      const niceMax = Math.ceil(maxBar / 4) * 4;
      const bw = Math.min(22, (gw - 8) / series.length);
      let g = "";
      for (let i = 0; i <= 4; i++) {
        const y = padT + ih - (ih * i) / 4;
        g += `<line x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}" stroke="currentColor" stroke-opacity=".12"/><text x="${padL - 6}" y="${y + 4}" text-anchor="end" font-size="12" fill="currentColor" fill-opacity=".55">${Math.round((niceMax * i) / 4)}</text>`;
      }
      months.forEach((m, mi) => {
        const x0 = padL + mi * gw + (gw - bw * series.length) / 2;
        series.forEach((s, si) => {
          const v = s.v[m] || 0, h = (v / niceMax) * ih, x = x0 + si * bw, y = padT + ih - h;
          g += `<rect x="${x + 2}" y="${y}" width="${bw - 4}" height="${Math.max(h, v ? 2 : 0)}" rx="4" fill="${s.c}"><title>${esc(s.name)}: ${v}</title></rect>`;
          if (v) g += `<text x="${x + bw / 2}" y="${y - 4}" text-anchor="middle" font-size="12" font-weight="700" fill="${s.c}">${v}</text>`;
        });
        g += `<text x="${padL + mi * gw + gw / 2}" y="${H - 12}" text-anchor="middle" font-size="13" fill="currentColor" fill-opacity=".75">${monShort(m)}</text>`;
      });
      if (line) {
        const vals = months.map(m => line.v[m]).filter(v => v !== null && v !== undefined);
        const lo = Math.floor((Math.min(...vals) - 30) / 50) * 50, hi = Math.ceil((Math.max(...vals) + 30) / 50) * 50;
        const yOf = v => padT + ih - ((v - lo) / Math.max(1, hi - lo)) * ih;
        const pts = months.map((m, mi) => line.v[m] == null ? null : [padL + mi * gw + gw / 2, yOf(line.v[m]), line.v[m]]).filter(Boolean);
        g += `<text x="${W - padR + 6}" y="${padT + 4}" font-size="11" fill="${line.c}">${hi}</text><text x="${W - padR + 6}" y="${padT + ih}" font-size="11" fill="${line.c}">${lo}</text>`;
        g += `<polyline points="${pts.map(p => p[0] + "," + p[1]).join(" ")}" fill="none" stroke="${line.c}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>`;
        pts.forEach(p => { g += `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="${line.c}"><title>${esc(line.name)}: ${p[2]}</title></circle>`; });
      }
      return `<svg viewBox="0 0 ${W} ${H}" class="w-full h-auto text-gray-200" role="img" aria-label="${LP("رسم بياني للتقدّم الشهري", "Monthly progress chart")}">${g}</svg>`;
    }
    function progressChartHTML(u) {
      const P = progLoad(u), months = lastMonths(6);
      const days = {}; Array.from(new Set((u.arena || {}).days || [])).forEach(d => { const k = String(d).slice(0, 7); days[k] = (days[k] || 0) + 1; });
      const solved = {}; (P.att || []).forEach(x => { if (x.ok && x.kind !== "exam" && x.day) { const k = x.day.slice(0, 7); solved[k] = (solved[k] || 0) + 1; } });
      const liPuz = liMonthly(P.liHist, "Puzzles", months) ? { name: LP("تقييم ألغاز Lichess", "Lichess puzzle rating"), c: "#38bdf8", v: liMonthly(P.liHist, "Puzzles", months) }
        : liMonthly(P.liHist, "Rapid", months) ? { name: "Lichess Rapid", c: "#38bdf8", v: liMonthly(P.liHist, "Rapid", months) } : null;
      const series = [{ name: LP("أيام التمرين", "Training days"), c: "#d4af37", v: days }, { name: LP("ألغاز صح", "Puzzles solved"), c: "#10b981", v: solved }];
      const legend = series.concat(liPuz ? [liPuz] : []).map(s => `<span class="inline-flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded" style="background:${s.c}"></span>${esc(s.name)}</span>`).join("");
      const firstLedger = months.find(m => solved[m]);
      return `<div class="gold-card rounded-2xl p-5 space-y-3">
        <h3 class="font-bold text-yellow-300">${LP("التقدّم على مدار الشهور", "Progress over the months")}</h3>
        ${P.st !== "ok" ? `<div class="h-40 rounded-xl bg-black/40 animate-pulse"></div>` : chartSVG(months, series, liPuz)}
        <div class="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-gray-300">${legend}</div>
        ${P.st === "ok" && !firstLedger ? `<p class="text-[10px] text-gray-500">${LP("عدد الألغاز الصح بيتحسب من وقت تفعيل دفتر المحاولات (v5).", "Solved puzzles are counted since the attempts ledger was enabled (v5).")}</p>` : ""}
      </div>`;
    }

    // ---------- الأماكن ----------
    {
      const _sh = renderStudentHome;
      renderStudentHome = function (s) { return `<div class="space-y-6">${_sh(s)}${liCardHTML(s, true)}</div>`; };
      const _pv = renderStudentParentView;
      renderStudentParentView = function (u) { return `<div class="space-y-5">${_pv(u)}${progressChartHTML(u)}${liCardHTML(u, false)}</div>`; };
    }

    DICT.push(
      ["اسم المستخدم على Lichess حروف إنجليزي وأرقام بس", "Lichess usernames use English letters and numbers only"], ["بندوّر على الحساب...", "Looking up the account..."],
      ["مفيش حساب بالاسم ده على Lichess", "No Lichess account with that name"], ["الحساب ده مقفول على Lichess", "That Lichess account is closed"],
      ["اتربط حساب Lichess", "Lichess account linked"], ["تعذّر الوصول لـ Lichess — جرّب تاني", "Couldn't reach Lichess — try again"], ["فك ربط حساب Lichess؟", "Unlink the Lichess account?"]
    );
    DICT.sort((a, b) => b[0].length - a[0].length);
