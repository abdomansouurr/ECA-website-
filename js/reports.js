// ECA — reports.js: التقرير الشهري لولي الأمر (PDF) — بيترسم على canvas وبيتحط في PDF، وبيتبعت بضغطة (eca-v6)
// بيعتمد على: db, calcStats, stuAttStats, streaks, calcXP, rankOf, badgeList, waLink, esc, toast, lang, loadJsPDF (core/extras)

    let repMonth = todayISO().slice(0, 7), repLang = "ar";
    const REP_W = 1240, REP_H = 1754;
    const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    function monthLabel(m, L) { const [y, mm] = m.split("-").map(Number); return (L === "en" ? MONTHS_EN : MONTHS_AR)[mm - 1] + " " + y; }
    function monthOptions() {
      const out = [], d = new Date(); d.setDate(1);
      for (let i = 0; i < 12; i++) { const m = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); out.push(m); d.setMonth(d.getMonth() - 1); }
      return out;
    }

    // ---------- تجميع بيانات الشهر ----------
    async function reportData(s, month) {
      const att = stuAttStats(s.id, month), marked = att.p + att.l + att.a;
      const st = calcStats(s), a = s.arena || {}, g = a.games || {};
      const days = Array.from(new Set(a.days || [])).filter(d => String(d).startsWith(month));
      const sk = streaks(a.days), xp = calcXP(s), rk = rankOf(xp.total);
      const badges = badgeList(s).reduce((n, c) => n + c.items.filter(b => b[3]).length, 0);
      // ألغاز الشهر من دفتر المحاولات (الكوتش بس يقدر يقراه)
      let puz = null;
      if (window.fbStudentAttempts) {
        const list = await window.fbStudentAttempts(s.id);
        if (list) {
          const inM = list.filter(x => x.day && x.day.startsWith(month) && x.kind !== "exam");
          puz = { tried: inM.length, ok: inM.filter(x => x.ok).length };
        }
      }
      const certs = (s.certificates || []).filter(c => String(c.date || "").startsWith(month));
      return {
        att, marked, attRate: marked ? Math.round(((att.p + att.l) / marked) * 100) : null,
        st, days: days.length, sk, xp: xp.total, rank: rk.cur ? rk.cur.label : null, badges,
        puz, puzAll: { tried: a.puzTried || 0, ok: a.puzSolved || 0, dTried: (s.puz && s.puz.t) || 0, dOk: (s.puz && s.puz.c) || 0 },
        games: { w: g.w || 0, l: g.l || 0, d: g.d || 0 }, certs
      };
    }

    // ---------- الرسم ----------
    function wrapLines(ctx, text, maxW) {
      const out = [];
      String(text || "").split(/\n/).forEach(par => {
        let line = "";
        par.split(/\s+/).forEach(w => {
          const t = line ? line + " " + w : w;
          if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
        });
        out.push(line);
      });
      return out;
    }
    function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    async function buildReportCanvas(s, D, month, L, note) {
      const EN = L === "en", T = EN ? {
        title: "Monthly Progress Report", att: "Attendance", days: "Training days", puz: "Puzzle accuracy", solved: "Puzzles solved",
        xp: "Total XP", badges: "Badges", present: "Present", late: "Late", absent: "Absent", noAtt: "No classes recorded this month",
        progress: "Step progress", lessons: "Lessons attended", hw: "Homework done", highlights: "This month", note: "Coach's note",
        streak: "Current streak", best: "Best streak", games: "Games vs bots", exam: st => `Passed the Step ${st} exam`, rank: "Rank", noRank: "No rank yet",
        puzAllNote: "Puzzles (all time)", footer: "Egypt Chess Academy (ECA) — Where minds grow stronger", issued: "Issued", group: "Group", step: "Step",
        dayU: "days", noNote: "Keep training every day — we're proud of your progress!"
      } : {
        title: "التقرير الشهري", att: "نسبة الحضور", days: "أيام التمرين", puz: "دقة الألغاز", solved: "ألغاز اتحلّت",
        xp: "نقاط الخبرة XP", badges: "الشارات", present: "حاضر", late: "متأخر", absent: "غايب", noAtt: "مفيش حصص متسجّلة الشهر ده",
        progress: "التقدّم في المستوى", lessons: "الدروس اللي حضرها", hw: "الواجبات اللي خلّصها", highlights: "أبرز حاجات الشهر", note: "رسالة الكوتش",
        streak: "السلسلة الحالية", best: "أطول سلسلة", games: "أدوار ضد الكمبيوتر", exam: st => `نجح في امتحان Step ${st}`, rank: "الرتبة", noRank: "لسه بدون رتبة",
        puzAllNote: "الألغاز (من البداية)", footer: "أكاديمية مصر للشطرنج (ECA) — Where minds grow stronger", issued: "تاريخ الإصدار", group: "المجموعة", step: "المستوى",
        dayU: "يوم", noNote: "استمر في التمرين كل يوم — إحنا فخورين بتقدّمك!"
      };
      const FONT = EN ? "Inter, Cairo, sans-serif" : "Cairo, Inter, sans-serif";
      try { await Promise.all(["400", "700", "800"].map(w => document.fonts.load(`${w} 30px Cairo`))); } catch (_) {}
      const cv = document.createElement("canvas"); cv.width = REP_W; cv.height = REP_H;
      const ctx = cv.getContext("2d");
      ctx.direction = EN ? "ltr" : "rtl";
      const S = EN ? 80 : REP_W - 80;                         // بداية السطر حسب اللغة
      const align = EN ? "left" : "right", alignEnd = EN ? "right" : "left";
      const font = (w, px) => { ctx.font = `${w} ${px}px ${FONT}`; };
      const text = (t, x, y, w, px, color, al) => { font(w, px); ctx.fillStyle = color; ctx.textAlign = al || align; ctx.fillText(t, x, y); };
      const GOLD = "#b8912a", NAVY = "#0b0b14", INK = "#1f2937", MUTED = "#6b7280";

      // الخلفية والهيدر
      ctx.fillStyle = "#fbf8ef"; ctx.fillRect(0, 0, REP_W, REP_H);
      ctx.fillStyle = NAVY; ctx.fillRect(0, 0, REP_W, 250);
      ctx.fillStyle = GOLD; ctx.fillRect(0, 250, REP_W, 8);
      const logo = await new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = "img/eca-mark.png"; });
      const lx = EN ? REP_W - 80 - 150 : 80;
      ctx.fillStyle = "#fff"; rr(ctx, lx, 50, 150, 150, 24); ctx.fill();
      if (logo) ctx.drawImage(logo, lx + 12, 62, 126, 126);
      text("EGYPT CHESS ACADEMY", S, 100, "800", 34, "#e9c766");
      text(T.title, S, 165, "800", 56, "#ffffff");
      text(monthLabel(month, L), S, 218, "700", 30, "#d1d5db");

      // بيانات الطالب
      let y = 330;
      text(s.name, S, y, "800", 54, INK);
      const RANK_EN = { "البيدق": "Pawn", "الفيل": "Bishop", "الحصان": "Knight", "الطابية": "Rook", "الوزير": "Queen", "الملك": "King" };
      const rankTxt = D.rank ? (EN ? D.rank.replace(/^\S+/, w => RANK_EN[w] || w) : D.rank) : T.noRank;
      const meta = `${T.step} ${s.level}${s.group ? "  •  " + T.group + ": " + s.group : ""}  •  ${T.rank}: ${rankTxt}`;
      text(meta, S, y + 52, "400", 26, MUTED);

      // كروت الأرقام (3 × 2)
      const puzPct = D.puz && D.puz.tried ? Math.round((D.puz.ok / D.puz.tried) * 100) : (D.puzAll.tried ? Math.round((D.puzAll.ok / D.puzAll.tried) * 100) : null);
      const kpis = [
        [D.attRate === null ? "—" : D.attRate + "%", T.att, "#059669"],
        [String(D.days), T.days, "#b45309"],
        [puzPct === null ? "—" : puzPct + "%", T.puz, "#2563eb"],
        [String(D.puz ? D.puz.ok : D.puzAll.ok), D.puz ? T.solved : T.puzAllNote, "#7c3aed"],
        [D.xp.toLocaleString("en-US"), T.xp, GOLD],
        [String(D.badges), T.badges, "#db2777"]
      ];
      y = 450; const cw = (REP_W - 160 - 40) / 3, ch = 170;
      kpis.forEach((k, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const x = EN ? 80 + col * (cw + 20) : REP_W - 80 - cw - col * (cw + 20), yy = y + row * (ch + 20);
        ctx.fillStyle = "#ffffff"; rr(ctx, x, yy, cw, ch, 22); ctx.fill();
        ctx.strokeStyle = "#e5dcc3"; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = k[2]; rr(ctx, x, yy, cw, 10, 5); ctx.fill();
        text(k[0], x + cw / 2, yy + 95, "800", 58, k[2], "center");
        text(k[1], x + cw / 2, yy + 140, "700", 24, MUTED, "center");
      });

      // الحضور بالتفصيل
      y = 860;
      text(T.att, S, y, "800", 32, INK);
      const bx = 80, bw = REP_W - 160, by = y + 25, bh = 34;
      ctx.fillStyle = "#eee7d4"; rr(ctx, bx, by, bw, bh, 17); ctx.fill();
      if (D.marked) {
        const segs = [[D.att.p, "#10b981"], [D.att.l, "#f59e0b"], [D.att.a, "#ef4444"]];
        let cx = EN ? bx : bx + bw;
        ctx.save(); rr(ctx, bx, by, bw, bh, 17); ctx.clip();
        segs.forEach(([n, c]) => { const w = (n / D.marked) * bw; ctx.fillStyle = c; ctx.fillRect(EN ? cx : cx - w, by, w, bh); cx += EN ? w : -w; });
        ctx.restore();
        const legend = `${T.present}: ${D.att.p}   •   ${T.late}: ${D.att.l}   •   ${T.absent}: ${D.att.a}`;
        text(legend, S, by + bh + 42, "700", 24, MUTED);
      } else text(T.noAtt, S, by + bh + 42, "700", 24, MUTED);

      // التقدّم في المستوى
      y = 1040;
      text(`${T.progress} (Step ${s.level})`, S, y, "800", 32, INK);
      [[T.lessons, D.st.attP, "#10b981"], [T.hw, D.st.hwP, "#2563eb"]].forEach(([lab, pct, c], i) => {
        const yy = y + 30 + i * 70;
        text(`${lab}`, S, yy + 24, "700", 24, MUTED);
        text(`${pct}%`, EN ? REP_W - 80 : 80, yy + 24, "800", 26, c, alignEnd);
        ctx.fillStyle = "#eee7d4"; rr(ctx, 80, yy + 36, REP_W - 160, 16, 8); ctx.fill();
        const w = (Math.max(0, Math.min(100, pct)) / 100) * (REP_W - 160);
        ctx.fillStyle = c; rr(ctx, EN ? 80 : REP_W - 80 - w, yy + 36, Math.max(w, 1), 16, 8); ctx.fill();
      });

      // أبرز حاجات الشهر
      y = 1262;
      text(T.highlights, S, y, "800", 32, INK);
      const hl = [
        `${T.streak}: ${D.sk.current} ${T.dayU}   •   ${T.best}: ${D.sk.best} ${T.dayU}`,
        `${T.games}: ${D.games.w}W / ${D.games.d}D / ${D.games.l}L`
      ];
      D.certs.forEach(c => hl.push(`${T.exam(c.step)} (${c.score}%)`));
      hl.slice(0, 4).forEach((h, i) => text(h, S, y + 48 + i * 42, "400", 26, INK));

      // رسالة الكوتش
      y = 1478; const nh = 180;
      ctx.fillStyle = "#fff7e0"; rr(ctx, 80, y - 40, REP_W - 160, nh, 22); ctx.fill();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.stroke();
      text("" + T.note, EN ? 110 : REP_W - 110, y + 5, "800", 28, GOLD);
      // اتجاه الرسالة حسب لغتها هي (ممكن تكون عربي في تقرير إنجليزي)
      const nTxt = note || T.noNote, nRtl = /[\u0600-\u06FF]/.test(nTxt);
      ctx.direction = nRtl ? "rtl" : "ltr"; font("400", 25);
      wrapLines(ctx, nTxt, REP_W - 220).slice(0, 3).forEach((ln, i) => text(ln, nRtl ? REP_W - 110 : 110, y + 50 + i * 36, "400", 25, INK, nRtl ? "right" : "left"));
      ctx.direction = EN ? "ltr" : "rtl";

      // الفوتر
      ctx.fillStyle = NAVY; ctx.fillRect(0, REP_H - 70, REP_W, 70);
      text(T.footer, REP_W / 2, REP_H - 28, "700", 22, "#e9c766", "center");
      text(`${T.issued}: ${todayISO()}`, EN ? REP_W - 80 : 80, REP_H - 95, "400", 20, MUTED, alignEnd);
      return cv;
    }

    // ---------- النافذة ----------
    let repCache = null;
    async function openMonthlyReport(stuId) {
      if (!isCoach()) return;
      const s = db.users.find(u => u.id === stuId); if (!s) return;
      let m = document.getElementById("repModal");
      if (!m) { m = document.createElement("div"); m.id = "repModal"; m.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3"; document.body.appendChild(m); }
      m.classList.remove("hidden");
      m.innerHTML = `<div class="gold-card rounded-2xl max-w-2xl w-full p-5 max-h-[94vh] overflow-y-auto space-y-4">
        <div class="flex justify-between items-center gap-2">
          <h3 class="font-display font-bold text-lg text-yellow-400">التقرير الشهري — ${esc(s.name)}</h3>
          <button onclick="closeMonthlyReport()" aria-label="إغلاق" class="tap px-3 rounded-xl text-sm bg-zinc-900 text-gray-300">✕</button>
        </div>
        <div class="flex flex-wrap gap-2 items-center">
          <select id="repMonthSel" onchange="repMonth=this.value; renderReportPreview('${s.id}')" class="tap bg-black border border-yellow-500/40 rounded-xl px-3 text-xs text-white">
            ${monthOptions().map(x => `<option value="${x}" ${x === repMonth ? "selected" : ""}>${monthLabel(x, lang === "en" ? "en" : "ar")}</option>`).join("")}
          </select>
          <button onclick="repLang='ar'; renderReportPreview('${s.id}')" class="tap px-3 rounded-xl text-xs font-bold ${repLang === "ar" ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/25"}">عربي</button>
          <button onclick="repLang='en'; renderReportPreview('${s.id}')" class="tap px-3 rounded-xl text-xs font-bold ${repLang === "en" ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/25"}">English</button>
        </div>
        <label class="block text-xs text-gray-400">رسالة الكوتش في التقرير (بتتكتب للتقرير ده بس)
          <textarea id="repNote" rows="3" maxlength="400" class="mt-1 w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-sm text-white">${esc(s.note || "")}</textarea>
        </label>
        <button onclick="renderReportPreview('${s.id}')" class="tap px-4 rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">حدّث المعاينة</button>
        <div id="repPreview" class="rounded-xl overflow-hidden border border-yellow-500/30 bg-black/50 min-h-[200px] flex items-center justify-center text-xs text-gray-400">جاري تجهيز التقرير...</div>
        <div class="flex flex-wrap gap-2">
          <button onclick="shareMonthlyReport('${s.id}')" class="tap px-4 rounded-xl text-xs gold-btn">مشاركة PDF (واتساب)</button>
          <button onclick="downloadMonthlyReport('${s.id}')" class="tap px-4 rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">تنزيل PDF</button>
        </div>
        <p class="text-[11px] text-gray-500">على الموبايل «مشاركة» بتفتح واتساب والملف مرفق. على الكمبيوتر: نزّل الملف، وبعدين ابعته من واتساب ويب (الرسالة بتتفتح جاهزة).</p>
      </div>`;
      applyLang();
      renderReportPreview(s.id);
    }
    function closeMonthlyReport() { const m = document.getElementById("repModal"); if (m) m.classList.add("hidden"); }

    async function renderReportPreview(stuId) {
      const s = db.users.find(u => u.id === stuId); if (!s) return;
      const box = document.getElementById("repPreview"); if (!box) return;
      box.textContent = trText("جاري تجهيز التقرير...");
      try {
        const note = (document.getElementById("repNote") || {}).value || "";
        const D = await reportData(s, repMonth);
        const cv = await buildReportCanvas(s, D, repMonth, repLang, note);
        repCache = { stuId, month: repMonth, lang: repLang, cv, D };
        const url = cv.toDataURL("image/jpeg", 0.9);
        box.innerHTML = `<img src="${url}" alt="" class="w-full h-auto" />`;
        document.querySelectorAll("#repModal button").forEach(b => {
          if (/عربي|English/.test(b.textContent)) b.className = "tap px-3 rounded-xl text-xs font-bold " + ((b.textContent.includes("English") ? "en" : "ar") === repLang ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/25");
        });
      } catch (e) { console.error(e); box.textContent = trText("تعذّر تجهيز التقرير"); }
    }

    async function reportPdfFile(stuId) {
      if (!repCache || repCache.stuId !== stuId || repCache.month !== repMonth || repCache.lang !== repLang) await renderReportPreview(stuId);
      const s = db.users.find(u => u.id === stuId);
      const JsPDF = await loadJsPDF();
      const pdf = new JsPDF({ orientation: "portrait", unit: "px", format: [REP_W, REP_H], compress: true });
      pdf.addImage(repCache.cv.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, REP_W, REP_H);
      const safe = String(s.name || "student").replace(/[\\/:*?"<>|]+/g, "").trim().replace(/\s+/g, "-");
      const name = `ECA-Report-${safe}-${repMonth}.pdf`;
      return { blob: pdf.output("blob"), name, s };
    }
    function reportMsg(s) {
      const ml = monthLabel(repMonth, repLang);
      return repLang === "en"
        ? `Hello from Egypt Chess Academy (ECA)\nHere is ${s.name}'s monthly progress report for ${ml}\nThank you for your support!`
        : `أهلاً بحضرتك من Egypt Chess Academy (ECA)\nمرفق لحضرتك التقرير الشهري للبطل ${s.name} عن شهر ${ml}\nشكراً لمتابعتكم معانا!`;
    }
    async function downloadMonthlyReport(stuId) {
      try {
        const { blob, name, s } = await reportPdfFile(stuId);
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
        const wa = waLink(s.parentPhone || s.phone);
        if (wa) setTimeout(() => window.open(wa + "?text=" + encodeURIComponent(reportMsg(s)), "_blank", "noopener"), 600);
        toast("التقرير اتنزّل — ارفقه في محادثة ولي الأمر");
      } catch (e) { console.error(e); toast("تعذّر إنشاء الـ PDF"); }
    }
    async function shareMonthlyReport(stuId) {
      try {
        const { blob, name, s } = await reportPdfFile(stuId);
        const file = new File([blob], name, { type: "application/pdf" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text: reportMsg(s), title: name });
        } else downloadMonthlyReport(stuId);
      } catch (e) { if (e && e.name === "AbortError") return; console.error(e); downloadMonthlyReport(stuId); }
    }

    // ---------- كارت التقارير في «متابعة الطلاب» ----------
    function reportsCardHTML() {
      const studs = db.users.filter(u => u.role === "student" && (typeof grpFilter === "undefined" || grpFilter === "ALL" || u.group === grpFilter))
        .sort((a, b) => String(a.name).localeCompare(String(b.name), "ar"));
      return `<div class="gold-card rounded-2xl p-5 space-y-3 mt-6">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 class="font-bold text-yellow-300">التقارير الشهرية لأولياء الأمور</h3>
            <p class="text-[11px] text-gray-500">حضور الشهر، أيام التمرين، الألغاز، التقدّم، الإنجازات، ورسالة منك — PDF بيتبعت بضغطة.</p>
          </div>
          <select onchange="repMonth=this.value" class="tap bg-black border border-yellow-500/40 rounded-xl px-3 text-xs text-white">
            ${monthOptions().map(x => `<option value="${x}" ${x === repMonth ? "selected" : ""}>${monthLabel(x, lang === "en" ? "en" : "ar")}</option>`).join("")}
          </select>
        </div>
        ${studs.length ? `<div class="grid sm:grid-cols-2 gap-2">${studs.map(s => {
          const att = stuAttStats(s.id, repMonth), n = att.p + att.l + att.a;
          return `<button onclick="openMonthlyReport('${s.id}')" class="tap flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-black/60 border border-yellow-500/20 hover:border-yellow-500/50 text-start">
            <span class="text-sm font-bold text-white">${esc(s.name)}</span>
            <span class="text-[11px] text-gray-400">${n ? Math.round(((att.p + att.l) / n) * 100) + "% " : ""}</span>
          </button>`; }).join("")}</div>` : `<p class="text-xs text-gray-500">مفيش طلبة في الفلتر ده.</p>`}
      </div>`;
    }
    {
      const _tv = renderTrackerView;
      renderTrackerView = function () { return _tv() + reportsCardHTML(); };
    }

    DICT.push(
      ["التقارير الشهرية لأولياء الأمور", "Monthly reports for parents"], ["التقرير الشهري", "Monthly report"],
      ["حضور الشهر، أيام التمرين، الألغاز، التقدّم، الإنجازات، ورسالة منك — PDF بيتبعت بضغطة.", "Monthly attendance, training days, puzzles, progress, highlights and your message — a PDF sent in one tap."],
      ["رسالة الكوتش في التقرير (بتتكتب للتقرير ده بس)", "Coach's message in the report (for this report only)"], ["حدّث المعاينة", "Refresh preview"],
      ["جاري تجهيز التقرير...", "Preparing the report..."], ["تعذّر تجهيز التقرير", "Couldn't prepare the report"],
      ["مشاركة PDF (واتساب)", "Share PDF (WhatsApp)"], ["تنزيل PDF", "Download PDF"],
      ["على الموبايل «مشاركة» بتفتح واتساب والملف مرفق. على الكمبيوتر: نزّل الملف، وبعدين ابعته من واتساب ويب (الرسالة بتتفتح جاهزة).", "On mobile, “Share” opens WhatsApp with the file attached. On a computer: download the file, then send it from WhatsApp Web (the message opens ready)."],
      ["التقرير اتنزّل — ارفقه في محادثة ولي الأمر", "Report downloaded — attach it in the parent's chat"], ["تعذّر إنشاء الـ PDF", "Couldn't create the PDF"],
      ["مفيش طلبة في الفلتر ده.", "No students in this filter."]
    );
    DICT.sort((a, b) => b[0].length - a[0].length);
