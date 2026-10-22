// ECA — extras.js (اتفصل من index.html في eca-v3)
    // ================= بيانات الأكاديمية — عدّلها بنفسك =================
    // أي خانة فاضية مش هتظهر في الموقع. السعر الفاضي بيظهر «تواصل معنا للسعر».
    const ECA_INFO = {
      phone: "01229550034",
      whatsapp: "+201270002317",
      email: "egyptchessacademy@gmail.com",
      address: "Lakehouse - The Club, Cairo, Egypt",
      // من صفحات الأكاديمية على فيسبوك وإنستجرام
      stats: [["+25K", "متابع على فيسبوك"], ["+5K", "متابع على إنستجرام"], ["9", "أماكن تدريب"], ["6", "Steps في المنهج"]],
      branches: ["The Club - Lakehouse", "Steamulation Hub", "الرحاب", "Pegasus", "القطامية", "Beverly", "نادي الصيد - أكتوبر", "نادي الجزيرة", "نادي الصيد - الدقي"],
      achievements: [
        { icon: "", name: "عبدالرحمن سامح", text: "المركز الثاني عالمياً تحت 13 سنة في بطولة العالم للشطرنج بإسبانيا — إنجاز مشرّف يرفع اسم مصر." }
      ],
      facebook: "https://www.facebook.com/Egyptchessacademy",
      instagram: "https://www.instagram.com/egyptchessacademy",
      tiktok: "https://www.tiktok.com/@egyptchessacademy",
      youtube: "",
      plans: [
        { name: "حصص جماعية أوفلاين", price: "", unit: "جنيه / شهرياً", features: ["حضور في الأكاديمية مع الكوتش", "منهج ECA من Step 1 لحد Step 6", "متابعة الحضور والواجب على المنصة", "ملاحظات الكوتش لولي الأمر", "شهادة بعد اجتياز كل Step"] },
        { name: "حصص جماعية أونلاين", price: "", unit: "جنيه / شهرياً", features: ["حصص أونلاين من البيت", "نفس منهج ECA والواجبات", "ساحة التدريب: ألغاز ولعب ضد الكمبيوتر", "متابعة الحضور والواجب على المنصة", "شهادة بعد اجتياز كل Step"] },
        { name: "حصص خاصة", price: "", unit: "جنيه / الحصة", features: ["حصة فردية مع الكوتش", "خطة مخصصة لمستوى الطالب", "تحليل أدوار الطالب", "واجبات وتمارين إضافية", "مواعيد بالاتفاق مع الكوتش"] }
      ],
      reviews: []         // آراء حقيقية بس، مثال: { name: "الاسم", role: "ولي أمر", text: "الرأي" }
    };

    // ================= ألوان الرقعة (محفوظة على الجهاز) =================
    const BOARD_THEMES = [["كلاسيك", "#f0d9b5", "#b58863"], ["دهبي", "#f6e7b4", "#a8802a"], ["أخضر", "#eeeed2", "#769656"], ["أزرق", "#dee3e6", "#8ca2ad"], ["رمادي", "#e0e0e0", "#607d8b"]];
    let boardColors = { l: "#f0d9b5", d: "#b58863" };
    try { const s = JSON.parse(localStorage.getItem("ECA_BOARD") || "null"); if (s && /^#[0-9a-f]{6}$/i.test(s.l) && /^#[0-9a-f]{6}$/i.test(s.d)) boardColors = s; } catch (_) {}
    function applyBoardColors() { const st = document.documentElement.style; st.setProperty("--sq-l", boardColors.l); st.setProperty("--sq-d", boardColors.d); }
    function setBoardColor(k, v) {
      if (!/^#[0-9a-f]{6}$/i.test(v)) return;
      boardColors[k] = v; try { localStorage.setItem("ECA_BOARD", JSON.stringify(boardColors)); } catch (_) {}
      applyBoardColors(); arenaRefresh();
    }
    applyBoardColors();

    function movesListHTML(g) {
      const hist = g ? g.history() : [];
      let rows = "";
      for (let i = 0; i < hist.length; i += 2) rows += `<div class="flex gap-3 px-3 py-1 ${i % 4 === 0 ? 'bg-black/40' : ''}"><span class="w-6 text-gray-500">${i / 2 + 1}.</span><span class="w-16 text-white">${hist[i]}</span><span class="w-16 text-white">${hist[i + 1] || ''}</span></div>`;
      return `<div dir="ltr" class="text-xs font-mono max-h-56 overflow-y-auto rounded-xl border border-yellow-500/15">${rows || `<div class="p-3 text-center text-gray-500">—</div>`}</div>`;
    }

    // ================= 4) لعبة البيادق =================
    const PAWN_POSITIONS = [
      "4k3/pppppppp/8/8/8/8/PPPPPPPP/4K3 w - - 0 1", "k7/pppppppp/8/8/8/8/PPPPPPPP/K7 w - - 0 1", "7k/pppppppp/8/8/8/8/PPPPPPPP/7K w - - 0 1",
      "k7/pppppppp/8/8/8/8/PPPPPPPP/7K w - - 0 1", "7k/pppppppp/8/8/8/8/PPPPPPPP/K7 w - - 0 1", "8/ppkppp1p/8/8/8/8/PKPPPP1P/8 w - - 0 1",
      "4k3/ppp2ppp/8/8/8/8/PPP2PPP/3K4 w - - 0 1", "8/pppppppp/4k3/8/8/3K4/PPPPPPPP/8 w - - 0 1", "8/pppppppp/8/8/1K4k1/8/PPPPPPPP/8 w - - 0 1"
    ];
    const PAWN_ENGINE = { skill: 12, depth: 4, ms: 300 };
    arena.pawn = { idx: null, game: null, color: "w", flip: false, sel: null, last: null, thinking: false, over: "", started: false };
    function pawnPick(i) { arena.pawn.idx = i; pawnReset(); }
    function pawnReset() {
      const P = arena.pawn; if (P.idx === null || !ChessCls) return;
      Object.assign(P, { game: new ChessCls(PAWN_POSITIONS[P.idx]), color: "w", flip: false, sel: null, last: null, thinking: false, over: "", started: false });
      arenaRefresh();
    }
    function pawnSwap() {
      const P = arena.pawn; if (!P.game || P.started) return;
      P.color = P.color === "w" ? "b" : "w"; P.flip = P.color === "b";
      if (P.color === "b") pawnEngine(); else arenaRefresh();
    }
    function pawnCheck(r) {
      const P = arena.pawn, g = P.game;
      let res = "";
      if (r && (r.promotion || g.isCheckmate())) res = r.color === P.color ? "win" : "loss";   // أول بيدق يوصل للصف الأخير بيكسب
      else if (g.isGameOver()) res = "draw";
      if (!res) return;
      P.over = res; P.thinking = false; P.sel = null;
      recordArena(a => { if (res === "win") a.pawnWins = (a.pawnWins || 0) + 1; else if (res === "loss") a.pawnLosses = (a.pawnLosses || 0) + 1; });
      toast(res === "win" ? "بيدقك وصل الأول — كسبت!" : res === "loss" ? "بيدق الكمبيوتر وصل الأول" : "مفيش نقلات — تعادل");
    }
    function pawnClick(sq) {
      const P = arena.pawn; if (!P.game || P.over || P.thinking) return;
      const mv = pickOrMove(P, sq, P.color);
      if (mv) {
        let r = null; try { r = P.game.move(mv); } catch (_) {}
        if (r) { P.started = true; P.last = [r.from, r.to]; pawnCheck(r); if (!P.over) return pawnEngine(); }
      }
      arenaRefresh();
    }
    function pawnEngine() {
      const P = arena.pawn, g = P.game, fen = g.fen(), t0 = Date.now();
      P.thinking = true; P.started = true; arenaRefresh();
      engineMove(fen, PAWN_ENGINE, uci => setTimeout(() => {
        if (P.game !== g || g.fen() !== fen) return;
        let r = null; try { if (uci) r = uciMove(g, uci); } catch (_) {}
        if (!r) { const ms = g.moves({ verbose: true }); if (ms.length) r = g.move(ms[Math.floor(Math.random() * ms.length)]); }
        P.thinking = false; if (r) P.last = [r.from, r.to];
        pawnCheck(r); arenaRefresh();
      }, Math.max(0, 500 - (Date.now() - t0))));
    }
    function arenaPawnsHTML() {
      const P = arena.pawn;
      if (P.idx === null || !P.game) return `
        <div class="gold-card rounded-2xl p-5 space-y-4">
          <div>
            <h3 class="font-display font-bold text-lg text-yellow-400">لعبة البيادق — اختار وضع البداية</h3>
            <p class="text-xs text-gray-400 mt-1">مهمتك توصّل بيدق للصف الثامن لو انت بالأبيض (أو الصف الأول لو بالأسود). الكمبيوتر هيحاول يسبقك بنفس الشرط.</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            ${PAWN_POSITIONS.map((_, i) => `<button onclick="pawnPick(${i})" class="eca-tile p-2 rounded-xl bg-black/70 border border-yellow-500/25 flex flex-col items-center gap-2">
              <img src="img/${i + 1}_position.gif" alt="" loading="lazy" class="w-full aspect-square object-contain rounded-lg" />
              <span class="text-xs font-bold text-yellow-300">الوضع ${i + 1}</span>
            </button>`).join("")}
          </div>
        </div>`;
      const status = P.over === "win" ? "كسبت! بيدقك وصل الأول" : P.over === "loss" ? "الكمبيوتر وصل الأول" : P.over === "draw" ? "تعادل — مفيش نقلات"
        : P.thinking ? "الكمبيوتر بيفكر..." : "دورك — " + (P.color === "w" ? "انت بالأبيض" : "انت بالأسود");
      return `
        <div class="grid lg:grid-cols-5 gap-5">
          <div class="min-w-0 lg:col-span-3 gold-card rounded-2xl p-3 sm:p-5">
            ${boardHTML({ game: P.game, flip: P.flip, sel: P.sel, targets: targetsOf(P.game, P.sel), last: P.last, onClick: "pawnClick" })}
          </div>
          <div class="min-w-0 lg:col-span-2 space-y-4">
            <div class="gold-card rounded-2xl p-5 space-y-3">
              <div class="text-xs text-gray-400">لعبة البيادق — الوضع ${P.idx + 1}</div>
              <div class="text-sm font-bold ${P.over === 'win' ? 'text-emerald-300' : P.over === 'loss' ? 'text-red-300' : 'text-yellow-300'}">${status}</div>
              <p class="text-[11px] text-gray-400">أول بيدق يوصل للصف الأخير بيكسب الدور.</p>
              <div class="grid grid-cols-3 gap-2">
                <button onclick="pawnSwap()" ${P.started ? 'disabled' : ''} class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300 disabled:opacity-40">${P.color === 'w' ? 'العب بالأسود' : 'العب بالأبيض'}</button>
                <button onclick="pawnReset()" class="tap rounded-xl text-xs gold-btn">إعادة</button>
                <button onclick="arena.pawn.idx=null; render();" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">وضع تاني</button>
              </div>
            </div>
            <div class="gold-card rounded-2xl p-4">
              <div class="text-xs font-bold text-yellow-400 mb-2">النقلات</div>
              ${movesListHTML(P.game)}
            </div>
          </div>
        </div>`;
    }

    // ================= 5) رقعة التحليل (Stockfish + FEN/PGN) =================
    arena.ana = { game: null, flip: false, sel: null, last: null, ev: null, evFen: "", evTurn: "w", fenInp: "", pgnInp: "" };
    let anaWorker = null, anaRunning = false, anaSkip = 0;
    function anaEngine() {
      if (anaWorker) return anaWorker;
      try {
        anaWorker = new Worker(URL.createObjectURL(new Blob([`importScripts("${STOCKFISH_URL}");`], { type: "application/javascript" })));
        anaWorker.onmessage = e => anaOnMsg(String(e.data));
        anaWorker.onerror = () => { anaWorker = null; anaRunning = false; };
        anaWorker.postMessage("uci");
      } catch (_) { anaWorker = null; }
      return anaWorker;
    }
    function anaAnalyze() {
      const A = arena.ana, g = A.game; if (!g) return;
      A.ev = null; A.evFen = g.fen(); A.evTurn = g.turn();
      if (g.isGameOver()) { A.ev = { over: g.isCheckmate() ? "mate" : "draw" }; return anaPaint(); }
      const w = anaEngine(); if (!w) return anaPaint();
      if (anaRunning) { w.postMessage("stop"); anaSkip++; }
      anaRunning = true;
      // النسخة دي من Stockfish مش بتقدر توقف بحث شغال، فبنحدد وقت لكل تحليل عشان الوضع الجديد مايستناش
      w.postMessage("position fen " + A.evFen); w.postMessage("go depth 18 movetime 1800");
      anaPaint();
    }
    function anaOnMsg(line) {
      const A = arena.ana;
      if (line.startsWith("bestmove")) { if (anaSkip > 0) anaSkip--; else anaRunning = false; return; }
      if (anaSkip > 0 || !line.startsWith("info") || line.indexOf(" pv ") < 0) return;
      if (!A.game || A.game.fen() !== A.evFen) return;
      const cp = line.match(/ score cp (-?\d+)/), mt = line.match(/ score mate (-?\d+)/), sgn = A.evTurn === "w" ? 1 : -1;
      A.ev = { depth: +((line.match(/ depth (\d+)/) || [])[1] || 0), cp: cp ? sgn * Number(cp[1]) / 100 : null, mate: mt ? sgn * Number(mt[1]) : null, pv: (line.match(/ pv (.+)$/) || [])[1] || "" };
      anaPaint();
    }
    function anaEvalHTML() {
      const A = arena.ana, ev = A.ev;
      let pct = 50, txt = "المحرك بيحلل...", line = "";
      if (ev && ev.over) { txt = ev.over === "mate" ? "كش مات — الدور خلص" : "الدور تعادل"; pct = ev.over === "mate" ? (A.game.turn() === "w" ? 0 : 100) : 50; }
      else if (ev) {
        if (ev.mate !== null) { pct = ev.mate > 0 ? 100 : 0; txt = "كش مات في " + Math.abs(ev.mate) + " — " + (ev.mate > 0 ? "للأبيض" : "للأسود"); }
        else if (ev.cp !== null) { pct = 50 + Math.max(-10, Math.min(10, ev.cp)) * 5; txt = "التقييم: " + (ev.cp > 0 ? "+" : "") + ev.cp.toFixed(2) + " • العمق " + ev.depth; }
        try {
          const c = new ChessCls(A.evFen), san = [];
          for (const u of ev.pv.split(" ").slice(0, 8)) { const r = uciMove(c, u); if (!r) break; san.push(r.san); }
          line = san.join(" ");
        } catch (_) {}
      }
      return `
        <div class="eval-bar"><div style="width:${pct}%"></div></div>
        <div class="flex flex-wrap justify-between gap-2 mt-2 text-xs"><b class="text-yellow-300">${txt}</b></div>
        ${line ? `<div class="mt-1 text-[11px] text-gray-400">أحسن خط: <span dir="ltr" class="font-mono text-white break-all">${esc(line)}</span></div>` : ''}`;
    }
    function anaPaint() { const el = document.getElementById("anaEval"); if (el) { el.innerHTML = anaEvalHTML(); applyLang(); } }
    function anaClick(sq) {
      const A = arena.ana, g = A.game; if (!g) return;
      const mv = pickOrMove(A, sq, g.turn());
      if (mv) { let r = null; try { r = g.move(mv); } catch (_) {} if (r) { A.last = [r.from, r.to]; arenaRefresh(); return anaAnalyze(); } }
      arenaRefresh();
    }
    function anaSet(g) { const A = arena.ana; A.game = g; A.sel = null; A.last = lastOf(g); arenaRefresh(); anaAnalyze(); }
    function anaUndo() { const A = arena.ana; if (A.game && A.game.history().length) { A.game.undo(); anaSet(A.game); } }
    function anaLoadFen() {
      const f = String(arena.ana.fenInp || "").trim(); if (!f) return;
      try { anaSet(new ChessCls(f)); toast("اتحمّل الوضع"); } catch (_) { toast("الـ FEN ده مش صحيح"); }
    }
    function anaLoadPgn() {
      const p = String(arena.ana.pgnInp || "").trim(); if (!p) return;
      try { const c = new ChessCls(); c.loadPgn(p); anaSet(c); toast("اتحمّل الدور"); } catch (_) { toast("الـ PGN ده مش صحيح"); }
    }
    function anaCopyFen() { const A = arena.ana; if (!A.game) return; try { navigator.clipboard.writeText(A.game.fen()).then(() => toast("اتنسخ")); } catch (_) {} }
    function arenaAnaHTML() {
      const A = arena.ana;
      if (!A.game) { A.game = new ChessCls(); setTimeout(anaAnalyze, 0); }
      const g = A.game;
      return `
        <div class="grid lg:grid-cols-5 gap-5">
          <div class="min-w-0 lg:col-span-3 gold-card rounded-2xl p-3 sm:p-5 space-y-3">
            <div id="anaEval">${anaEvalHTML()}</div>
            ${boardHTML({ game: g, flip: A.flip, sel: A.sel, targets: targetsOf(g, A.sel), last: A.last, onClick: "anaClick" })}
          </div>
          <div class="min-w-0 lg:col-span-2 space-y-4">
            <div class="gold-card rounded-2xl p-5 space-y-3">
              <div class="text-xs text-gray-400">حرّك القطع للونين بحرية والمحرك هيقيّم الوضع على طول.</div>
              <div class="grid grid-cols-3 gap-2">
                <button onclick="anaUndo()" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">تراجع</button>
                <button onclick="arena.ana.flip=!arena.ana.flip; render();" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">اقلب الرقعة</button>
                <button onclick="anaSet(new ChessCls())" class="tap rounded-xl text-xs gold-btn">من الأول</button>
              </div>
              <label class="block text-xs text-gray-400">FEN</label>
              <div class="flex gap-2">
                <input id="anaFen" dir="ltr" value="${esc(A.fenInp)}" oninput="arena.ana.fenInp=this.value" placeholder="${esc(g.fen())}" class="flex-1 min-w-0 bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono" />
                <button onclick="anaLoadFen()" class="px-3 rounded-xl text-xs gold-btn">تحميل</button>
                <button onclick="anaCopyFen()" title="نسخ الـ FEN الحالي" class="px-3 rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">نسخ FEN</button>
              </div>
              <label class="block text-xs text-gray-400">PGN</label>
              <textarea id="anaPgn" dir="ltr" rows="3" oninput="arena.ana.pgnInp=this.value" placeholder="1. e4 e5 2. Nf3 Nc6 ..." class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono">${esc(A.pgnInp)}</textarea>
              <button onclick="anaLoadPgn()" class="w-full py-2 rounded-xl text-xs gold-btn">تحميل الدور</button>
            </div>
            <div class="gold-card rounded-2xl p-4">
              <div class="text-xs font-bold text-yellow-400 mb-2">النقلات</div>
              ${movesListHTML(g)}
            </div>
          </div>
        </div>`;
    }

    // ================= الرتب والشارات =================
    const RANKS = [
      { name: "البيدق", icon: "chess-pawn-icon.svg", lv: [1000, 3000, 5000] },
      { name: "الفيل", icon: "chess-bishop-icon.svg", lv: [7000, 9000, 11000] },
      { name: "الحصان", icon: "chess-knight-icon.svg", lv: [13000, 15000, 17000] },
      { name: "الطابية", icon: "chess-rook-icon.svg", lv: [19000, 21000, 23000] },
      { name: "الوزير", icon: "chess-queen-icon.svg", lv: [25000, 27000, 29000] },
      { name: "الملك", icon: "chess-king-icon.svg", lv: [31000, 33000, 35000] }
    ];
    const ROMAN = ["I", "II", "III"];
    function calcXP(s) {
      const cnt = o => Object.values(o || {}).filter(Boolean).length;
      const a = s.arena || {}, g = a.games || {};
      const parts = [
        ["الدروس اللي حضرها", cnt(s.att) * 150],
        ["الواجبات", cnt(s.hw) * 150],
        ["اللغز اليومي", ((s.puz && s.puz.c) || 0) * 50],
        ["ألغاز الساحة", (a.puzSolved || 0) * 60],
        ["أدوار ضد الكمبيوتر", (g.w || 0) * 200 + (g.d || 0) * 60],
        ["لعبة البيادق", (a.pawnWins || 0) * 120],
        ["تدريب الرؤية", (a.visionBest || 0) * 25],
        ["الشهادات", (s.certificates || []).length * 1500]
      ];
      return { total: parts.reduce((t, p) => t + p[1], 0), parts };
    }
    function rankOf(xp) {
      let cur = null, next = null;
      RANKS.forEach((r, ri) => r.lv.forEach((pts, li) => {
        const step = { ri, li, pts, label: r.name + " " + ROMAN[li], icon: r.icon };
        if (xp >= pts) cur = step; else if (!next) next = step;
      }));
      return { cur, next };
    }
    function streaks(days) {
      const ds = Array.from(new Set(days || [])).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
      let best = 0, run = 0, prev = null;
      ds.forEach(d => { const t = Date.parse(d + "T12:00:00Z"); run = prev !== null && t - prev === 864e5 ? run + 1 : 1; best = Math.max(best, run); prev = t; });
      const last = ds.length ? Date.parse(ds[ds.length - 1] + "T12:00:00Z") : 0, today = Date.parse(todayISO() + "T12:00:00Z");
      return { best, current: last && today - last <= 864e5 ? run : 0 };
    }
    function badgeList(s) {
      const a = s.arena || {}, g = a.games || {}, st = streaks(a.days), bs = a.puzBestStreak || 0;
      return [
        { cat: "أيام التمرين ورا بعض", items: [
          ["يومين", "اتمرّن يومين ورا بعض", "2-days.png", st.best >= 2], ["5 أيام", "اتمرّن 5 أيام ورا بعض", "5-days.png", st.best >= 5],
          ["أسبوع", "اتمرّن 7 أيام ورا بعض", "7-days.png", st.best >= 7], ["أسبوعين", "اتمرّن 14 يوم ورا بعض", "14-days.png", st.best >= 14],
          ["شهر", "اتمرّن 30 يوم ورا بعض", "30-days.png", st.best >= 30], ["3 شهور", "اتمرّن 90 يوم ورا بعض", "chess-pawn-icon.svg", st.best >= 90],
          ["6 شهور", "اتمرّن 180 يوم ورا بعض", "chess-rook-icon.svg", st.best >= 180], ["سنة", "اتمرّن 365 يوم ورا بعض", "1-year.png", st.best >= 365],
          ["سنتين", "اتمرّن 730 يوم ورا بعض", "2-years.svg", st.best >= 730]] },
        { cat: "ألغاز صح ورا بعض", items: [
          ["زحف البيادق", "حل 10 ألغاز صح ورا بعض", "chess-pawn-icon.svg", bs >= 10], ["هجمة الأحصنة", "حل 20 لغز صح ورا بعض", "chess-knight-icon.svg", bs >= 20],
          ["انتصار الأفيال", "حل 30 لغز صح ورا بعض", "chess-bishop-icon.svg", bs >= 30], ["سيطرة الطوابي", "حل 40 لغز صح ورا بعض", "chess-rook-icon.svg", bs >= 40],
          ["حكم الوزير", "حل 50 لغز صح ورا بعض", "chess-queen-icon.svg", bs >= 50], ["فتوحات الملك", "حل 100 لغز صح ورا بعض", "chess-king-icon.svg", bs >= 100]] },
        { cat: "إنجازات متنوعة", items: [
          ["أول انتصار", "اكسب أول دور ضد الكمبيوتر", "chess-knight-icon.svg", (g.w || 0) >= 1],
          ["قاهر الجراند ماستر", "اكسب ضد البوت «جراند ماستر»", "chess-king-icon.svg", (a.bestWin || 0) >= LEVELS.length],
          ["ملك البيادق", "اكسب 5 أدوار في لعبة البيادق", "chess-pawn-icon.svg", (a.pawnWins || 0) >= 5],
          ["عين الصقر", "جيب 20 نقطة أو أكتر في تدريب الرؤية", "chess_aim_target.jpg", (a.visionBest || 0) >= 20],
          ["أول شهادة", "اجتاز امتحان أول Step", "chess-queen-icon.svg", (s.certificates || []).length >= 1]] }
      ];
    }
    function renderRanksView(u) {
      const isStu = u.role === "student", xp = isStu ? calcXP(u) : null, rk = isStu ? rankOf(xp.total) : null;
      const base = rk && rk.cur ? rk.cur.pts : 0, nextPts = rk && rk.next ? rk.next.pts : base;
      const prog = rk && rk.next ? Math.round(((xp.total - base) / (nextPts - base)) * 100) : 100;
      const me = isStu ? `
        <div class="gold-card rounded-2xl p-5 grid md:grid-cols-3 gap-5 items-center">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 rounded-2xl bg-white/90 border-2 border-yellow-500 flex items-center justify-center p-2"><img src="img/${rk.cur ? rk.cur.icon : 'chess-pawn-icon.svg'}" alt="" class="w-full h-full object-contain ${rk.cur ? '' : 'badge-off'}" /></div>
            <div>
              <div class="text-xs text-gray-400">رتبتك الحالية</div>
              <div class="font-display text-2xl font-extrabold gold-gradient-text">${rk.cur ? rk.cur.label : 'لسه بدون رتبة'}</div>
              <div class="text-sm text-yellow-300 font-bold">${xp.total.toLocaleString()} XP</div>
            </div>
          </div>
          <div class="md:col-span-2 space-y-2">
            <div class="flex justify-between text-xs"><span class="text-gray-400">${rk.next ? 'الرتبة الجاية: <b class="text-yellow-300">' + rk.next.label + '</b>' : 'وصلت لأعلى رتبة!'}</span><span class="text-gray-400">${rk.next ? (nextPts - xp.total).toLocaleString() + ' XP فاضل' : ''}</span></div>
            <div class="eval-bar" style="height:12px"><div style="width:${Math.max(3, Math.min(100, prog))}%; background:linear-gradient(90deg,#f3d266,#d4af37)"></div></div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
              ${xp.parts.map(p => `<div class="p-2 rounded-xl bg-black/70 border border-yellow-500/15 text-center"><div class="text-sm font-bold text-white">${p[1].toLocaleString()}</div><div class="text-[10px] text-gray-400">${p[0]}</div></div>`).join("")}
            </div>
          </div>
        </div>` : "";
      const board = !isStu ? (() => {
        const list = db.users.filter(s => s.role === "student").map(s => ({ s, xp: calcXP(s).total })).sort((a, b) => b.xp - a.xp);
        return `<div class="gold-card rounded-2xl p-5">
          <h3 class="font-display font-bold text-lg text-yellow-400 mb-3">ترتيب الطلاب</h3>
          ${list.length ? `<div class="overflow-x-auto"><table class="w-full text-xs text-white">
            <thead><tr class="text-yellow-300 border-b border-yellow-500/25"><th class="py-2 text-start">#</th><th class="py-2 text-start">اسم الطالب</th><th class="py-2">Step</th><th class="py-2">الرتبة</th><th class="py-2">XP</th></tr></thead>
            <tbody>${list.map((x, i) => { const r = rankOf(x.xp); return `<tr class="border-b border-yellow-500/10"><td class="py-2">${i < 3 ? ['', '', ''][i] : i + 1}</td><td class="py-2 font-bold">${esc(x.s.name)}</td><td class="py-2 text-center">${esc(x.s.level)}</td><td class="py-2 text-center">${r.cur ? r.cur.label : '—'}</td><td class="py-2 text-center text-yellow-300">${x.xp.toLocaleString()}</td></tr>`; }).join("")}</tbody>
          </table></div>` : `<p class="text-xs text-gray-400">لا يوجد طلاب بعد.</p>`}
        </div>`;
      })() : "";
      const ranksGrid = `
        <div class="gold-card rounded-2xl p-5">
          <h3 class="font-display font-bold text-lg text-yellow-400 mb-1">الرتب</h3>
          <p class="text-xs text-gray-400 mb-4">بتجمع XP من حضور الدروس، والواجبات، والألغاز، والأدوار، وتدريب الرؤية، والشهادات.</p>
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${RANKS.map((r, ri) => `<div class="p-4 rounded-2xl bg-black/70 border ${rk && rk.cur && rk.cur.ri === ri ? 'border-yellow-400' : 'border-yellow-500/20'}">
              <div class="flex items-center gap-3 mb-3"><div class="w-12 h-12 rounded-xl bg-white/90 p-1.5"><img src="img/${r.icon}" alt="" class="w-full h-full object-contain ${isStu && xp.total < r.lv[0] ? 'badge-off' : ''}" /></div><b class="text-white text-base">${r.name}</b></div>
              ${r.lv.map((pts, li) => `<div class="flex justify-between text-xs py-1.5 border-t border-yellow-500/10 ${isStu && xp.total >= pts ? 'text-emerald-300 font-bold' : 'text-gray-400'}"><span>${isStu && xp.total >= pts ? '✓ ' : ''}${r.name} ${ROMAN[li]}</span><span dir="ltr">${pts.toLocaleString()} XP</span></div>`).join("")}
            </div>`).join("")}
          </div>
        </div>`;
      const badges = `
        <div class="gold-card rounded-2xl p-5 space-y-5">
          <h3 class="font-display font-bold text-lg text-yellow-400">الشارات</h3>
          ${badgeList(isStu ? u : {}).map(c => `<div>
            <div class="text-sm font-bold text-yellow-300 mb-2">${c.cat}</div>
            <div class="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
              ${c.items.map(b => `<div title="${esc(b[1])}" class="p-2 rounded-xl bg-black/70 border ${isStu && b[3] ? 'border-yellow-400' : 'border-yellow-500/15'} text-center">
                <div class="w-12 h-12 mx-auto rounded-xl bg-white/90 p-1.5"><img src="img/${b[2]}" alt="" loading="lazy" class="w-full h-full object-contain ${isStu && b[3] ? '' : 'badge-off'}" /></div>
                <div class="text-[11px] font-bold mt-1.5 ${isStu && b[3] ? 'text-yellow-300' : 'text-gray-400'}">${b[0]}</div>
                <div class="text-[10px] text-gray-500 leading-tight mt-0.5">${b[1]}</div>
              </div>`).join("")}
            </div>
          </div>`).join("")}
          ${isStu ? `<p class="text-[11px] text-gray-500">أيام تمرين ورا بعض دلوقتي: ${streaks((u.arena || {}).days).current} • أطول سلسلة: ${streaks((u.arena || {}).days).best}</p>` : ''}
        </div>`;
      return `
        <div class="space-y-5">
          <div class="gold-card rounded-2xl p-5">
            <h2 class="font-display font-bold text-xl gold-gradient-text">الرتب والشارات</h2>
            <p class="text-xs text-gray-400 mt-1">${isStu ? 'كل درس وواجب ولغز ودور بيقرّبك من الرتبة اللي بعدها.' : 'نظام الرتب والشارات للطلاب، وترتيبهم حسب الـ XP.'}</p>
          </div>
          ${me}${board}${ranksGrid}${badges}
        </div>`;
    }
    // اللغز اليومي في الرئيسية بيتحسب يوم تمرين
    { const _sp = solvePuzzle; solvePuzzle = function (i, ans) { const u = currUser(); if (u && u.role === "student") markActiveDay(u); return _sp(i, ans); }; }

    // ================= صفحات المعلومات =================
    const INFO_TABS = ["about", "courses", "private", "faq", "fairplay", "contact"];
    const INFO_NAMES = { about: "عن الأكاديمية", courses: "الكورسات والأسعار", private: "الحصص الخاصة", faq: "الأسئلة الشائعة", fairplay: "اللعب النظيف", contact: "تواصل معنا" };
    const sectionTitle = (small, big, desc) => `<div class="text-center max-w-2xl mx-auto space-y-2"><div class="text-xs font-bold tracking-widest text-yellow-400">${small}</div><h2 class="font-display font-extrabold text-2xl md:text-3xl gold-gradient-text">${big}</h2>${desc ? `<p class="text-sm text-gray-400">${desc}</p>` : ''}</div>`;
    const joinCTA = () => `
      <div class="gold-card rounded-2xl p-6 grid md:grid-cols-3 gap-6 items-center">
        <img src="img/chess_set.png" alt="" loading="lazy" class="w-full max-w-[240px] mx-auto opacity-90" />
        <div class="md:col-span-2 space-y-3 text-center md:text-start">
          <h3 class="font-display font-bold text-2xl gold-gradient-text">انضم وبقى لاعب أقوى!</h3>
          <p class="text-sm text-gray-300">احجز مكانك دلوقتي واكتشف إمكانياتك.</p>
          <button onclick="switchTab('contact')" class="px-6 py-3 rounded-xl text-sm gold-btn">انضم دلوقتي</button>
        </div>
      </div>`;
    function infoAbout() {
      const items = [
        ["اتعلم بالمنهج", "دروس منظمة من Step 1 لحد Step 6، وواجب بعد كل درس."],
        ["العب ضد الكمبيوتر", "اختار مستوى الصعوبة وواجه محرك Stockfish من «مبتدئ» لحد «جراند ماستر»."],
        ["حل الألغاز", "لغز يومي، وألغاز حقيقية من Lichess بكل المستويات."],
        ["حلّل أدوارك", "رقعة تحليل بالمحرك عشان تعرف غلطاتك وتتحسن."],
        ["تابع تقدمك", "رتب وشارات بتكبر مع كل درس وواجب ولغز ودور."],
        ["ولي الأمر في الصورة", "داشبورد لولي الأمر جوه حساب الطالب فيه الحضور والواجبات والتقييم وكل إحصائياته."]
      ];
      const why = [
        ["التركيز", "الطفل اللي مشتت ومش بيركز في المذاكرة، الشطرنج بيعلّمه يركّز في حاجة واحدة لمدة طويلة."],
        ["اتخاذ القرار", "كل نقلة قرار: بيتعلم يفكر قبل ما يتصرف، ويدوّر على الحل، ويخرج من المواقف الصعبة."],
        ["الصبر والتخطيط", "بيتعلم يخطط لكذا خطوة قدام، ويستنى الفرصة الصح."],
        ["الروح الرياضية", "يكسب بتواضع، ويتعلم من خسارته، ويحترم منافسه."]
      ];
      return `
        <div class="gold-card rounded-2xl p-6 grid md:grid-cols-2 gap-6 items-center">
          <div class="space-y-3">
            <div class="text-xs font-bold tracking-widest text-yellow-400">عن الأكاديمية</div>
            <h2 class="font-display font-extrabold text-2xl gold-gradient-text">Egypt Chess Academy</h2>
            <div dir="ltr" class="text-sm font-bold tracking-[.25em] text-yellow-300 text-start">WHERE MINDS, GROW STRONGER</div>
            <p class="text-sm text-gray-300 leading-7">Egypt Chess Academy (ECA) أكاديمية شطرنج في القاهرة، بتعلّم الشطرنج لكل الأعمار بطريقة ممتعة وسهلة مع مدربين متخصصين. بنبدأ مع الطالب من أول حركات القطع، ونطلع معاه لحد المستويات المتقدمة بمنهج من 6 Steps، وبنتابع كل طالب في الحضور والواجب والتقييم.</p>
            <p class="text-sm text-gray-300 leading-7">المنصة دي جزء من الأكاديمية: الطالب بيتعلم ويتمرن ويتابع تقدمه، والكوتش بيتابع الحضور والواجبات، وولي الأمر بيطمن على ابنه — كله في مكان واحد.</p>
          </div>
          <img src="img/eca-logo.jpg" alt="Egypt Chess Academy" loading="lazy" class="w-full max-w-xs mx-auto rounded-2xl bg-white border border-yellow-500/30 object-contain" />
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${ECA_INFO.stats.map(s => `<div class="gold-card rounded-2xl p-4 text-center"><div class="text-2xl font-extrabold gold-gradient-text" dir="ltr">${esc(s[0])}</div><div class="text-[11px] text-gray-400 mt-1">${esc(s[1])}</div></div>`).join("")}
        </div>
        ${ECA_INFO.achievements.length ? `<div class="gold-card rounded-2xl p-6 border-2 border-yellow-500/40">
          <h3 class="font-display font-bold text-xl text-yellow-400 mb-3">أبطالنا</h3>
          <div class="space-y-3">${ECA_INFO.achievements.map(a => `<div class="flex gap-3 items-start p-3 rounded-xl bg-black/70 border border-yellow-500/25"><span class="text-2xl">${esc(a.icon || "")}</span><div><b class="text-white">${esc(a.name)}</b><p class="text-sm text-gray-300 mt-0.5">${esc(a.text)}</p></div></div>`).join("")}</div>
        </div>` : ''}
        ${ECA_INFO.branches.length ? `<div class="gold-card rounded-2xl p-6">
          <h3 class="font-display font-bold text-xl text-yellow-400 mb-1">أماكن التدريب</h3>
          <p class="text-xs text-gray-400 mb-3">بندرّب في أكتر من مكان في القاهرة والجيزة — اسأل على أقرب مكان ليك ومواعيده.</p>
          <div class="flex flex-wrap gap-2">${ECA_INFO.branches.map(b => `<span class="px-3 py-1.5 rounded-xl text-xs font-bold bg-black/70 border border-yellow-500/30 text-yellow-200">${esc(b)}</span>`).join("")}</div>
          <button onclick="switchTab('contact')" class="mt-4 px-5 py-2.5 rounded-xl text-xs gold-btn">اسأل على المواعيد</button>
        </div>` : ''}
        <div class="gold-card rounded-2xl p-6 grid md:grid-cols-2 gap-6 items-center">
          <img src="img/chess-pieces-aboutUs.jpeg" alt="" loading="lazy" class="w-full rounded-2xl border border-yellow-500/30 object-cover max-h-72 md:order-none order-last" />
          <div class="space-y-3">
            <h3 class="font-display font-bold text-xl text-yellow-400">ليه الشطرنج لابنك؟</h3>
            <p class="text-sm text-gray-300 leading-7">الملعب ورقعة الشطرنج عالمين مختلفين، بس التفكير بيجمع بينهم. الشطرنج مش مجرد لعبة — ده تمرين للعقل بيبان أثره في المذاكرة وفي الحياة.</p>
            <div class="grid sm:grid-cols-2 gap-2">${why.map(w => `<div class="p-3 rounded-xl bg-black/70 border border-yellow-500/20"><b class="text-sm text-yellow-300">${w[0]}</b><p class="text-xs text-gray-400 mt-1 leading-5">${w[1]}</p></div>`).join("")}</div>
          </div>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          ${items.map(i => `<div class="eca-tile gold-card rounded-2xl p-5"><h4 class="font-bold text-yellow-300 mb-1">${i[0]}</h4><p class="text-xs text-gray-400 leading-6">${i[1]}</p></div>`).join("")}
        </div>
        <div class="gold-card rounded-2xl p-6 grid md:grid-cols-2 gap-6 items-center">
          <div class="space-y-3">
            <div class="text-xs font-bold tracking-widest text-yellow-400">ليه ECA؟</div>
            <h3 class="font-display font-bold text-2xl gold-gradient-text">عندنا استراتيجية مميزة</h3>
            <p class="text-sm text-gray-300 leading-7">متابعة شخصية لكل طالب بتساعده يتفوق في كل مرحلة: يتعلم، يحلل، ويكسب. وبأدوات حديثة بنساعد اللاعبين يطلّعوا كل إمكانياتهم.</p>
            <button onclick="switchTab('contact')" class="px-5 py-2.5 rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">ساعدنا نتحسن</button>
          </div>
          <img src="img/123_steps.webp" alt="" loading="lazy" class="w-full max-w-sm mx-auto rounded-2xl border border-yellow-500/30" />
        </div>
        ${joinCTA()}`;
    }
    function infoCourses() {
      const top = [["pawn_courses.png", "انضم كعضو", "عمر ما كان متأخر تبدأ تلعب شطرنج — اعمل حساب وابدأ تتعلم!"], ["coursware_courses.png", "المنهج والمواد", "هتلاقي دروس وتمارين وواجبات تساعدك تبقى لاعب أقوى."], ["classes_courses.png", "حصص أونلاين وأوفلاين", "حصص جماعية أو فردية تركّز فيها على نقط ضعفك وقوتك."]];
      const cls = [["pawn_classes.png", "شطرنج للمبتدئين", "ابدأ تتعلم الشطرنج من الأول خالص."], ["classicStrategy_classes.png", "استراتيجيات كلاسيكية", "حل تمارين بتبدأ من أسهل مستوى."], ["championStrategy_classes.png", "استراتيجيات الأبطال", "اتقن حل الألغاز وبقى بطل فيها!"], ["time_classes.png", "قيمة الوقت", "اصبر وذاكر باستمرار وهتشوف نتيجة شغلك بسرعة."], ["knight_classes.png", "فكّر زي خصمك", "النظري حلو بس لازم تلعب أدوار وتحلل نقلاتك ونقلات خصمك."], ["classes_courses.png", "حصص أونلاين", "شوف عروض الحصص الأونلاين، احضر حصة وجرّب بنفسك!"]];
      return `
        ${sectionTitle("الكورسات", "اتعلم معانا", "")}
        <div class="grid sm:grid-cols-3 gap-4">${top.map(t => `<div class="eca-tile gold-card rounded-2xl p-5 text-center space-y-2"><img src="img/${t[0]}" alt="" loading="lazy" class="h-16 mx-auto" /><h4 class="font-bold text-yellow-300">${t[1]}</h4><p class="text-xs text-gray-400 leading-6">${t[2]}</p></div>`).join("")}</div>
        ${sectionTitle("حصصنا", "اشترك واتعلم من حصصنا", "اكتشف إمكانياتك وادخل عالم الشطرنج اللي عمرك ما عرفته قبل كده!")}
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">${cls.map(t => `<div class="eca-tile gold-card rounded-2xl p-5 flex gap-4 items-start"><img src="img/${t[0]}" alt="" loading="lazy" class="w-14 h-14 object-contain shrink-0" /><div><h4 class="font-bold text-yellow-300">${t[1]}</h4><p class="text-xs text-gray-400 leading-6 mt-1">${t[2]}</p></div></div>`).join("")}</div>
        ${sectionTitle("الأسعار", "اختار نظامك", "احجز الحصص وقرّر تتعلم لوحدك ولا مع مجموعة من صحابك!")}
        <div class="grid md:grid-cols-3 gap-4">
          ${ECA_INFO.plans.map((p, i) => `<div class="gold-card rounded-2xl p-6 flex flex-col ${i === 1 ? 'border-2 border-yellow-400' : ''}">
            <div class="text-sm font-bold text-yellow-300">${esc(p.name)}</div>
            <div class="my-3">${p.price ? `<span class="text-4xl font-extrabold text-white">${esc(p.price)}</span> <span class="text-xs text-gray-400">${esc(p.unit)}</span>` : `<span class="text-lg font-bold text-white">تواصل معنا للسعر</span>`}</div>
            <ul class="space-y-2 text-xs text-gray-300 flex-1">${p.features.map(f => `<li class="flex gap-2"><span class="text-emerald-400">✓</span><span>${esc(f)}</span></li>`).join("")}</ul>
            <button onclick="contactSubject='${i}'; switchTab('contact')" class="mt-5 w-full py-2.5 rounded-xl text-xs gold-btn">احجز النظام ده</button>
          </div>`).join("")}
        </div>
        <p class="text-xs text-gray-400 text-center">* أسعار المجموعات بتتحدد بعد التواصل مع الكوتش، وحسب عدد الحصص وعدد الطلاب.</p>
        <div class="text-center"><button onclick="switchTab('private')" class="px-5 py-2.5 rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">اعرف أكتر عن الحصص الخاصة ←</button></div>`;
    }
    function infoPrivate() {
      const ben = [["المرونة", "اتعلم من أي مكان وفي أي وقت من غير مواصلات."], ["تدريب شخصي", "الحصص متفصّلة على مستواك انت."], ["أدوات تفاعلية", "شرح مباشر على الرقعة وتحليل لأدوارك."], ["بعد الحصة", "ملاحظات من الحصة وتمارين إضافية."], ["توفير", "توفّر وقت ومواصلات وتاخد تعليم بجودة عالية."]];
      return `
        ${sectionTitle("الحصص الخاصة", "اتعلم شطرنج من بيتك", "سنين خبرة في التدريس خلّتنا نعمل منهج مخصص لكل طالب حسب مستواه.")}
        <div class="grid lg:grid-cols-2 gap-5">
          <div class="gold-card rounded-2xl p-5 space-y-4">
            <img src="img/chess_private_lesson.jpg" alt="" loading="lazy" class="w-full rounded-2xl border border-yellow-500/30 object-cover max-h-80" />
            <p class="text-sm italic text-gray-300 text-center">«ممكن تتعلم من دور خسرته أكتر بكتير من دور كسبته» — خوسيه راؤول كابابلانكا</p>
          </div>
          <div class="gold-card rounded-2xl p-6 space-y-4">
            <h3 class="font-display font-bold text-xl text-yellow-400">مميزات الحصص الأونلاين</h3>
            <p class="text-sm text-gray-300 leading-7">الحصص الأونلاين طريقة مرنة وفعّالة تطوّر بيها مستواك من غير ما تتحرك من مكانك. بتدريب شخصي وأدوات تفاعلية بتتقدم بالسرعة اللي تناسبك.</p>
            <ul class="space-y-3">${ben.map(b => `<li class="flex gap-3 text-sm"><span class="text-emerald-400 font-bold">✓</span><span><b class="text-white">${b[0]}:</b> <span class="text-gray-300">${b[1]}</span></span></li>`).join("")}</ul>
          </div>
        </div>
        ${joinCTA()}
        ${ECA_INFO.reviews.length ? `
          ${sectionTitle("آراء", "قالوا إيه بعد الحصص", "")}
          <div class="grid md:grid-cols-2 gap-4">${ECA_INFO.reviews.map(r => `<div class="gold-card rounded-2xl p-5 space-y-3"><div class="text-yellow-400">★★★★★</div><p class="text-sm text-gray-300 leading-7">${esc(r.text)}</p><div class="text-xs"><b class="text-white">${esc(r.name)}</b> <span class="text-gray-400">— ${esc(r.role)}</span></div></div>`).join("")}</div>` : ''}`;
    }
    function infoFaq() {
      const qa = [
        ["ازاي ألعب ضد الكمبيوتر؟", "سجّل دخولك وادخل «ساحة التدريب» ← «العب ضد الكمبيوتر»، اختار المستوى واللون واضغط «ابدأ الدور»."],
        ["إيه قواعد الشطرنج؟", "الشطرنج بيتلعب على رقعة 8×8 وكل لاعب بيبدأ بـ 16 قطعة. الهدف إنك تعمل كش مات لملك الخصم. القواعد كلها موجودة في دروس Step 1."],
        ["أقدر ألعب مع صحابي؟", "الميزة دي لسه بنشتغل عليها. لحد ما تنزل، تقدر تتمرن ضد الكمبيوتر وفي لعبة البيادق."],
        ["ازاي أحسّن مستوايا؟", "اتمرن بانتظام، حل الواجبات واللغز اليومي، حلّل أدوارك في «رقعة التحليل»، والعب ضد مستويات أقوى من مستواك."],
        ["ولي الأمر يتابع ازاي؟", "ادخل على حساب ابنك ودوس «داشبورد ولي الأمر» — هتلاقي الحضور والواجبات والتقييم والامتحانات والشهادات ونشاطه في ساحة التدريب."],
        ["عندي مشكلة تقنية، أعمل إيه؟", "ابعتلنا من صفحة «تواصل معنا» واكتب تفاصيل المشكلة، ولو تقدر ابعت صورة للشاشة."]
      ];
      return `
        ${sectionTitle("الأسئلة الشائعة", "أسئلة بتتسأل كتير", "")}
        <div class="max-w-3xl mx-auto space-y-3">
          ${qa.map(q => `<details class="faq gold-card rounded-2xl"><summary class="flex justify-between items-center gap-3 p-4"><span class="font-bold text-sm text-white">${q[0]}</span><span class="faq-ic text-yellow-400 transition">▼</span></summary><p class="px-4 pb-4 text-sm text-gray-300 leading-7">${q[1]}</p></details>`).join("")}
        </div>
        <div class="gold-card rounded-2xl p-6 text-center space-y-3 max-w-3xl mx-auto">
          <h3 class="font-display font-bold text-xl text-yellow-400">مش لاقي إجابة سؤالك؟</h3>
          <p class="text-sm text-gray-400">ماتتردّدش وابعتلنا رسالة!</p>
          <button onclick="switchTab('contact')" class="px-6 py-2.5 rounded-xl text-xs gold-btn">تواصل معنا</button>
        </div>`;
    }
    function infoFair() {
      const g = [
        "العب نقلاتك بنفسك.", "ممنوع الغش أو استخدام أي وسيلة مش عادلة.", "ماتاخدش مساعدة من حد تاني وانت بتلعب — أهل أو صحاب أو لاعبين تانيين.",
        "ممنوع تستخدم محركات شطرنج أو برامج أو إضافات للمتصفح بتحلل الوضع وانت بتلعب.", "ماتستخدمش أي أداة بتقولك أحسن نقلة في الألغاز أو الامتحانات.",
        "رقعة التحليل للمذاكرة بعد الدور — مش أثناء الامتحان أو اللغز.", "ماتشاركش حسابك مع حد وماتستخدمش حساب حد تاني.",
        "ماتلعبش في النتايج أو تحاول تزوّد نقاطك بطريقة مش حقيقية.", "احترم زمايلك وماتضايقش حد وهو بيلعب.", "لو شاكك إن حد بيغش، بلّغ الكوتش — ماتردّش بالغش انت كمان."
      ];
      return `
        <div class="gold-card rounded-2xl p-8 text-center space-y-3">
          <h2 class="font-display font-extrabold text-3xl gold-gradient-text">اللعب النظيف</h2>
          <p class="text-sm text-gray-300 max-w-2xl mx-auto leading-7">اللعب النظيف هو أساس المنافسة الحقيقية والروح الرياضية. في الشطرنج، الأمانة بتخلّي التجربة ممتعة ومفيدة للكل. لما نلتزم بالقواعد دي بنعمل بيئة عادلة ومحترمة لكل اللاعبين.</p>
        </div>
        <div class="gold-card rounded-2xl p-6 max-w-3xl mx-auto">
          <h3 class="font-display font-bold text-xl text-yellow-400 mb-3">قواعد اللعب النظيف</h3>
          <ul class="divide-y divide-yellow-500/15">${g.map(x => `<li class="flex gap-3 py-3 text-sm text-gray-300"><span class="text-emerald-400">➜</span><span>${x}</span></li>`).join("")}</ul>
          <div class="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30">
            <div class="text-xs font-extrabold text-red-300 mb-1">تنبيه مهم</div>
            <p class="text-sm text-gray-300">لو الكوتش لاحظ إن فيه مخالفة لقواعد اللعب النظيف، هيتكلم مع الطالب وولي الأمر، وممكن نتايج الساحة أو الامتحان تتلغي.</p>
          </div>
        </div>`;
    }
    let contactSubject = "";
    function sendContact(ev) {
      ev.preventDefault();
      const v = id => String((document.getElementById(id) || {}).value || "").trim();
      const name = v("cName"), how = v("cHow"), subj = v("cSubj"), msg = v("cMsg");
      if (!name || !msg) return toast("اكتب اسمك والرسالة");
      const text = trText("رسالة من موقع ECA") + "\n" + trText("الاسم") + ": " + name + (how ? "\n" + trText("للتواصل") + ": " + how : "") + "\n" + trText("الموضوع") + ": " + subj + "\n\n" + msg;
      const wa = waLink(ECA_INFO.whatsapp);
      if (wa) window.open(wa + "?text=" + encodeURIComponent(text), "_blank", "noopener");
      else if (ECA_INFO.email) location.href = "mailto:" + ECA_INFO.email.replace(/[^\w.@+-]/g, "") + "?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(text);
      else return toast("بيانات التواصل لسه ما اتضافتش");
      ev.target.reset();
    }
    function infoContact() {
      const subjects = ["سؤال عام", "حجز / اشتراك", "فكرة لتحسين الموقع", "مشكلة تقنية"].concat(ECA_INFO.plans.map(p => "حجز: " + p.name));
      const pre = contactSubject !== "" && ECA_INFO.plans[+contactSubject] ? "حجز: " + ECA_INFO.plans[+contactSubject].name : "";
      const hasWay = !!(waLink(ECA_INFO.whatsapp) || ECA_INFO.email);
      const row = (ic, val, href) => val ? `<a ${href ? `href="${href}" target="_blank" rel="noopener"` : ''} class="flex items-center gap-3 text-sm text-gray-300 hover:text-yellow-300"><span class="text-xl">${ic}</span><span dir="ltr">${esc(val)}</span></a>` : "";
      const anyInfo = ECA_INFO.address || ECA_INFO.phone || ECA_INFO.email || ECA_INFO.whatsapp;
      return `
        ${sectionTitle("تواصل معنا", "إحنا هنا عشانك", "عايز تتواصل معانا أو تبلّغ عن مشكلة؟ املا الفورم واحكيلنا أكتر.")}
        <div class="grid lg:grid-cols-3 gap-5">
          <form onsubmit="sendContact(event)" class="lg:col-span-2 gold-card rounded-2xl p-6 space-y-3">
            <div class="grid sm:grid-cols-2 gap-3">
              <input id="cName" required placeholder="اسمك" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2.5 text-sm text-white" />
              <input id="cHow" placeholder="رقمك أو إيميلك (اختياري)" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2.5 text-sm text-white" />
            </div>
            <select id="cSubj" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2.5 text-sm text-yellow-300">${subjects.map(s => `<option ${s === pre ? 'selected' : ''}>${esc(s)}</option>`).join("")}</select>
            <textarea id="cMsg" required rows="5" placeholder="اكتب رسالتك..." class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2.5 text-sm text-white"></textarea>
            <button ${hasWay ? '' : 'disabled'} class="w-full py-3 rounded-xl text-sm gold-btn disabled:opacity-40">${waLink(ECA_INFO.whatsapp) ? 'ابعت على واتساب' : 'ابعت بالإيميل'}</button>
            ${hasWay ? '' : `<p class="text-[11px] text-amber-300">بيانات التواصل لسه ما اتضافتش — الأدمن يضيفها من ECA_INFO في كود الموقع.</p>`}
          </form>
          <div class="gold-card rounded-2xl p-6 space-y-4">
            <h3 class="font-display font-bold text-xl text-yellow-400">اتواصل معانا</h3>
            ${anyInfo ? `${row("", ECA_INFO.address)}${row("", ECA_INFO.phone, ECA_INFO.phone ? "tel:" + encodeURIComponent(ECA_INFO.phone) : "")}${row("", ECA_INFO.whatsapp, waLink(ECA_INFO.whatsapp))}${row("", ECA_INFO.email, ECA_INFO.email ? "mailto:" + ECA_INFO.email.replace(/[^\w.@+-]/g, "") : "")}
              <div class="flex flex-wrap gap-2 pt-2">${[["facebook", "Facebook"], ["instagram", "Instagram"], ["tiktok", "TikTok"], ["youtube", "YouTube"]].filter(s => /^https:\/\//.test(ECA_INFO[s[0]] || "")).map(s => `<a href="${esc(ECA_INFO[s[0]])}" target="_blank" rel="noopener" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500 hover:text-black">${s[1]}</a>`).join("")}</div>` :`<p class="text-sm text-gray-400">اسأل الكوتش في الحصة أو ابعت رسالة لولي الأمر على الواتساب.</p>`}
          </div>
        </div>
        ${ECA_INFO.address ? `<div class="gold-card rounded-2xl overflow-hidden h-72"><iframe title="map" loading="lazy" class="w-full h-full border-0" src="https://maps.google.com/maps?q=${encodeURIComponent(ECA_INFO.address)}&z=14&output=embed"></iframe></div>` : ''}`;
    }
    function renderInfoPage(t) {
      const pills = INFO_TABS.map(k => `<button onclick="switchTab('${k}')" class="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap ${t === k ? 'gold-btn' : 'bg-zinc-900 text-gray-300 border border-yellow-500/20'}">${INFO_NAMES[k]}</button>`).join("");
      const body = t === "courses" ? infoCourses() : t === "private" ? infoPrivate() : t === "faq" ? infoFaq() : t === "fairplay" ? infoFair() : t === "contact" ? infoContact() : infoAbout();
      return `<div class="space-y-6"><div class="flex gap-2 overflow-x-auto pb-1">${pills}</div>${body}</div>`;
    }

    // ================= الفوتر =================
    function renderFooter() {
      const f = document.getElementById("ecaFooter"); if (!f) return;
      const soc = [["facebook", "Facebook"], ["instagram", "Instagram"], ["tiktok", "TikTok"], ["youtube", "YouTube"]].filter(s => /^https:\/\//.test(ECA_INFO[s[0]])).map(s => [ECA_INFO[s[0]], s[1]]);
      const wa = waLink(ECA_INFO.whatsapp); if (wa) soc.push([wa, "WhatsApp"]);
      f.innerHTML = `
        <div class="max-w-7xl mx-auto px-4 py-6 grid gap-5 md:grid-cols-3 items-center text-xs">
          <div class="flex items-center gap-3">
            <img src="img/eca-logo.jpg" alt="ECA" class="w-14 h-14 rounded-xl bg-white object-contain shrink-0" />
            <p class="text-gray-400 italic">«الشطرنج قبل أي حاجة معركة مع نفسك» — جاري كاسباروف</p>
          </div>
          <div class="flex flex-wrap gap-x-4 gap-y-2 justify-center">
            ${INFO_TABS.map(k => `<button onclick="switchTab('${k}'); window.scrollTo(0,0);" class="text-gray-300 hover:text-yellow-300">${INFO_NAMES[k]}</button>`).join("")}
          </div>
          <div class="text-center md:text-end space-y-1">
            ${soc.length ? `<div class="flex flex-wrap gap-3 justify-center md:justify-end">${soc.map(s => `<a href="${esc(s[0])}" target="_blank" rel="noopener" class="${s[1] === 'WhatsApp' ? 'text-emerald-300' : 'text-yellow-300'} hover:underline">${s[1]}</a>`).join("")}</div>` : ''}
            <div class="text-gray-500">© ${new Date().getFullYear()} Egypt Chess Academy (ECA)</div>
          </div>
        </div>`;
    }
    renderFooter();

    // ================= الرئيسية: أوضاع اللعب + أخبار الشطرنج =================
    const news = { items: null, loading: false, failed: false };
    function loadNews() {
      if (news.items || news.loading || news.failed) return;
      news.loading = true;
      fetch("https://api.allorigins.win/get?url=" + encodeURIComponent("https://theweekinchess.com/twic-rss-feed"))
        .then(r => r.json()).then(d => {
          const x = new DOMParser().parseFromString(d.contents || "", "text/xml");
          news.items = Array.from(x.getElementsByTagName("item")).slice(0, 5).map(it => ({
            title: (it.getElementsByTagName("title")[0] || {}).textContent || "",
            link: (it.getElementsByTagName("link")[0] || {}).textContent || "",
            date: (it.getElementsByTagName("pubDate")[0] || {}).textContent || ""
          })).filter(n => n.title && /^https?:\/\//.test(n.link.trim()));
        }).catch(() => { news.failed = true; })
        .finally(() => { news.loading = false; if (tab === "home") render(); });
    }
    function homeExtrasHTML() {
      loadNews();
      const modes = [["play", "play", "العب ضد الكمبيوتر"], ["puzzles", "target", "ألغاز على الرقعة"], ["pawns", "pawn", "لعبة البيادق"], ["vision", "eye", "تدريب الرؤية"], ["analysis", "analysis", "رقعة التحليل"]];
      return `
        <div class="gold-card rounded-2xl p-5">
          <h3 class="font-display font-bold text-lg text-yellow-400 mb-3">اختار وضع اللعب</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            ${modes.map(m => `<button onclick="arena.sub='${m[0]}'; switchTab('arena')" class="eca-tile p-4 rounded-2xl bg-black/70 border border-yellow-500/25 text-center"><div class="mx-auto w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-300 flex items-center justify-center">${ICON(m[1], "w-6 h-6")}</div><div class="text-xs font-bold text-white mt-2">${m[2]}</div></button>`).join("")}
            <button onclick="switchTab('ranks')" class="eca-tile p-4 rounded-2xl bg-black/70 border border-yellow-500/25 text-center"><div class="mx-auto w-11 h-11 rounded-xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-300 flex items-center justify-center">${ICON("award", "w-6 h-6")}</div><div class="text-xs font-bold text-white mt-2">الرتب والشارات</div></button>
          </div>
        </div>
        ${news.items && news.items.length ? `<div class="gold-card rounded-2xl p-5">
          <h3 class="font-display font-bold text-lg text-yellow-400 mb-3">أخبار الشطرنج في العالم</h3>
          <div class="divide-y divide-yellow-500/15">
            ${news.items.map(n => `<a href="${esc(n.link.trim())}" target="_blank" rel="noopener" dir="ltr" class="block py-2.5 hover:bg-yellow-500/5 rounded-lg px-2"><div class="text-sm font-bold text-white">${esc(n.title)}</div><div class="text-[11px] text-gray-500">${esc(n.date)}</div></a>`).join("")}
          </div>
          <p class="text-[10px] text-gray-500 mt-2">المصدر: The Week in Chess</p>
        </div>` : ''}`;
    }
    {
      const _sh = renderStudentHome; renderStudentHome = function (s) { return `<div class="space-y-6">${_sh(s)}${homeExtrasHTML()}</div>`; };
      const _ch = renderCoachHome; renderCoachHome = function (c) { return `<div class="space-y-6">${retryBannerHTML(true)}${_ch(c)}${homeExtrasHTML()}</div>`; };
    }

    // ================= امتحان الترقية: ألغاز حقيقية بمؤقت =================
    // كل لغز دقيقة، والحل لازم يكمل لآخر نقلة: صح = ضوء أخضر، غلط أو خلص الوقت = ضوء أحمر، وبعدها اللغز اللي بعده على طول.
    // مفيش تلميح ولا ترجيع نقلة. النجاح من 70%.
    const EXAM_COUNT = 10, EXAM_SECONDS = 60, EXAM_PASS = 70;   // دقيقة لكل لغز، والحل لازم يكمل لآخر نقلة
    const EXAM_DIFF = { 1: "easiest", 2: "easiest", 3: "easier", 4: "normal", 5: "harder", 6: "hardest" };
    let EX = null;
    const ensureChess = () => ChessCls ? Promise.resolve(ChessCls) : import(CHESS_JS_URL).then(m => (ChessCls = m.Chess));

    openExamModal = function (lvl) {
      const u = currUser(); if (!u || u.role !== "student") return;
      const step = Number(lvl), stats = calcStats(u), st = (u.examState || {})[step];
      if (stats.attP < 100) return toast("يجب إتمام حضور 100% من دروس هذا المستوى أولاً لفتح الاختبار!");
      if (st && st.status === "failed") return toast("استنفدت محاولتك في هذا الاختبار. اطلب إعادة الاختبار من المدرب.");
      if (st && st.status === "passed") return;
      startPuzzleExam(step);
    };

    async function startPuzzleExam(step) {
      if (EX) return;
      EX = { step, list: [], i: 0, results: [], phase: "loading", loaded: 0, timer: null, deadline: 0, ring: "" };
      examPaint();
      try {
        await ensureChess();
        // الألغاز من البنك اللي جوه الموقع (ألغاز Lichess حقيقية) — مش محتاج Lichess وقت الامتحان،
        // فمفيش مشكلة الـ 429 (Too Many Requests) لما طلبة كتير يمتحنوا من نفس النت
        const bank = await loadPuzzleBank();
        const pool = (bank[EXAM_DIFF[step] || "normal"] || []).slice();
        for (let k = pool.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [pool[k], pool[j]] = [pool[j], pool[k]]; }
        for (const row of pool) {
          if (EX.list.length >= EXAM_COUNT) break;
          const [id, fen, moves] = row.split("|"), mv = moves.split(" ");
          try {
            const g = new ChessCls(fen);
            const r0 = uciMove(g, mv[0]);              // نقلة الخصم اللي قبل اللغز
            EX.list.push({ id, game: g, sol: mv.slice(1), idx: 0, color: g.turn(), flip: g.turn() === "b", last: [r0.from, r0.to], sel: null, flash: null });
          } catch (_) {}
        }
        if (!EX) return;
        if (EX.list.length < EXAM_COUNT) throw new Error("not enough puzzles");
      } catch (e) {
        console.error(e);
        if (EX) { EX.phase = "error"; examPaint(); }
        return;
      }
      // بنسجّل المحاولة كرسوب مقدّماً: لو الطالب قفل الصفحة في النص، المحاولة بتتحسب ومايقدرش يعيد من غير الكوتش
      // والبداية بتتسجّل كمحاولة في دفتر المحاولات (القواعد بتسمح بمحاولة واحدة لكل إعادة يوافق عليها الكوتش)
      const u = currUser(); u.examState = u.examState || {};
      const prev = u.examState[step] || {}, n = (prev.attempts || 0) + 1;
      const timeout = new Promise(res => setTimeout(() => res({ ok: true, slow: true }), 8000));   // أوفلاين: الكتابة بتستنى في الطابور
      const r = await Promise.race([recordAttempt("exam", step + "-" + n, false, s => {
        s.examState = s.examState || {};
        s.examState[step] = { status: "failed", score: 0, attempts: n, reqRetry: false, inProgress: true, date: todayISO() };
      }, { step: Number(step) }), timeout]);
      if (!EX) return;
      if (!r.ok) { toast("تعذّر بدء الامتحان. لو المحاولة اتحسبت قبل كده اطلب إعادة من الكوتش."); examClose(); return; }
      EX.phase = "play"; examQuestion(0);
    }

    function examQuestion(i) {
      EX.i = i; EX.ring = ""; EX.locked = false; EX.busy = false;
      EX.deadline = Date.now() + EXAM_SECONDS * 1000;
      clearInterval(EX.timer);
      EX.timer = setInterval(() => {
        if (!EX || EX.phase !== "play" || EX.locked) return;
        const left = Math.max(0, EX.deadline - Date.now());
        const bar = document.getElementById("exBar"), txt = document.getElementById("exSec");
        if (bar) { bar.style.width = (left / (EXAM_SECONDS * 10)) + "%"; bar.style.background = left < 15000 ? "#ef4444" : "linear-gradient(90deg,#f3d266,#d4af37)"; }
        if (txt) txt.textContent = Math.ceil(left / 1000);
        if (left <= 0) examAnswer(false, null);
      }, 100);
      examPaint();
    }

    // اللغز بيتحسب صح بس لو كل نقلات الحل صح لآخر نقلة (أي نقلة غلط في النص = اللغز غلط)
    function examClick(sq) {
      if (!EX || EX.phase !== "play" || EX.locked || EX.busy) return;
      const q = EX.list[EX.i], g = q.game;
      const mv = pickOrMove(q, sq, q.color);
      if (!mv) return examPaint();
      const want = q.sol[q.idx] || "";
      let r = null; try { r = g.move(mv); } catch (_) {}
      if (!r) return examPaint();
      if (want.length === 5 && r.from + r.to === want.slice(0, 4) && r.promotion !== want[4]) { g.undo(); r = uciMove(g, want); }
      const ok = r.from + r.to + (r.promotion || "") === want || g.isCheckmate();
      if (!ok) return examAnswer(false, r);
      q.idx++; q.sel = null; q.last = [r.from, r.to]; q.flash = { [r.to]: "good" };
      if (q.idx >= q.sol.length || g.isCheckmate()) return examAnswer(true, r);
      // نقلة صح ولسه الحل مكمّل: الخصم بيرد، والطالب يكمّل
      EX.busy = true; EX.ring = "step"; examPaint();
      setTimeout(() => {
        if (!EX || EX.list[EX.i] !== q || EX.locked) return;
        try { const r2 = uciMove(g, q.sol[q.idx]); q.last = [r2.from, r2.to]; } catch (_) {}
        q.idx++; q.flash = null; EX.busy = false; EX.ring = "";
        if (q.idx >= q.sol.length) return examAnswer(true, null);
        examPaint();
      }, 550);
    }

    function examAnswer(ok, r) {
      if (!EX || EX.locked) return;
      EX.locked = true; clearInterval(EX.timer);
      const q = EX.list[EX.i];
      EX.results.push(ok);
      q.sel = null;
      if (r) { q.last = [r.from, r.to]; q.flash = { [r.to]: ok ? "good" : "bad" }; }
      EX.ring = ok ? "ok" : "bad";
      examPaint();
      setTimeout(() => {
        if (!EX) return;
        if (EX.i + 1 < EX.list.length) examQuestion(EX.i + 1); else examFinish();
      }, 900);
    }

    function examQuit() {
      if (!EX) return;
      if (EX.phase !== "play") return examClose();
      if (!confirm(trText("لو خرجت دلوقتي الألغاز اللي فاضلة هتتحسب غلط. متأكد؟"))) return;
      clearInterval(EX.timer);
      while (EX.results.length < EX.list.length) EX.results.push(false);
      examFinish();
    }

    function examFinish() {
      clearInterval(EX.timer);
      const correct = EX.results.filter(Boolean).length;
      EX.score = Math.round((correct / EX.list.length) * 100);
      EX.phase = "done"; EX.ring = "";
      EX.outcome = recordExamResult(EX.step, EX.score, { noCertPopup: true }) || {};
      examPaint();
    }

    function examClose() {
      if (EX) clearInterval(EX.timer);
      EX = null;
      const el = document.getElementById("puzExam"); if (el) el.remove();
      document.body.style.overflow = "";
      render();
    }

    function examDots() {
      return EX.list.map((_, k) => {
        const r = EX.results[k];
        const cls = r === true ? "bg-emerald-500" : r === false ? "bg-red-500" : k === EX.i && EX.phase === "play" ? "bg-yellow-400 animate-pulse" : "bg-zinc-700";
        return `<span class="w-3 h-3 rounded-full ${cls}"></span>`;
      }).join("");
    }

    function examPaint() {
      if (!EX) return;
      let el = document.getElementById("puzExam");
      if (!el) { el = document.createElement("div"); el.id = "puzExam"; document.body.appendChild(el); document.body.style.overflow = "hidden"; }
      let body = "";
      if (EX.phase === "loading") body = `
        <div class="gold-card rounded-2xl p-8 text-center space-y-4">
          ${ICON("spinner", "w-9 h-9 mx-auto text-yellow-300 animate-spin")}
          <div class="font-bold text-yellow-300">جاري تجهيز ألغاز الاختبار...</div>
          <div class="text-sm text-gray-400" dir="ltr">${EX.loaded} / ${EXAM_COUNT}</div>
          <div class="eval-bar" style="height:10px"><div style="width:${(EX.loaded / EXAM_COUNT) * 100}%; background:linear-gradient(90deg,#f3d266,#d4af37)"></div></div>
          <p class="text-xs text-gray-400">${EXAM_COUNT} ألغاز حقيقية • دقيقة لكل لغز • لازم تكمّل الحل لآخر نقلة • النجاح من ${EXAM_PASS}%</p>
          <button onclick="examClose()" class="px-4 py-2 rounded-xl text-xs bg-zinc-900 border border-zinc-700 text-gray-300">إلغاء</button>
        </div>`;
      else if (EX.phase === "error") body = `
        <div class="gold-card rounded-2xl p-8 text-center space-y-4">
          ${ICON("offline", "w-10 h-10 mx-auto text-red-300")}
          <div class="font-bold text-red-300">تعذّر تحميل ألغاز الاختبار — اتأكد من الإنترنت وجرّب تاني.</div>
          <p class="text-xs text-gray-400">المحاولة دي ما اتحسبتش.</p>
          <button onclick="examClose()" class="px-5 py-2.5 rounded-xl text-xs gold-btn">رجوع</button>
        </div>`;
      else if (EX.phase === "done") {
        const correct = EX.results.filter(Boolean).length, passed = EX.score >= EXAM_PASS, o = EX.outcome || {};
        body = `
          <div class="gold-card rounded-2xl p-8 text-center space-y-4 border-2 ${passed ? 'border-emerald-500' : 'border-red-500'}">
            ${passed ? ICON("trophy", "w-14 h-14 mx-auto text-emerald-300") : ""}
            <div class="font-display text-2xl font-extrabold ${passed ? 'text-emerald-300' : 'text-red-300'}">${passed ? 'مبروك! نجحت في الاختبار' : 'ما نجحتش المرة دي'}</div>
            <div class="text-4xl font-extrabold text-white">${EX.score}%</div>
            <div class="text-sm text-gray-400">${correct} صح من ${EX.list.length} • المطلوب ${EXAM_PASS}%</div>
            <div class="flex flex-wrap justify-center gap-1.5">${examDots()}</div>
            <p class="text-sm text-gray-300">${passed ? 'اترقّيت لـ Step ' + (o.newLevel || '') + ' وطلعتلك شهادة.' : 'ابعت طلب إعادة الاختبار للكوتش من الصفحة الرئيسية.'}</p>
            <div class="flex flex-wrap justify-center gap-2">
              ${passed && o.certIdx !== undefined ? `<button onclick="const u=currUser(), k=${o.certIdx}; examClose(); previewAndDownloadCert(u.id, k, true);" class="px-5 py-2.5 rounded-xl text-xs gold-btn">عرض الشهادة</button>` : ''}
              <button onclick="examClose()" class="px-5 py-2.5 rounded-xl text-xs ${passed ? 'bg-zinc-900 border border-yellow-500/40 text-yellow-300' : 'gold-btn'}">رجوع للرئيسية</button>
            </div>
          </div>`;
      } else {
        const q = EX.list[EX.i], left = Math.max(0, EX.deadline - Date.now());
        const ring = EX.ring === "ok" ? "ring-8 ring-emerald-500 shadow-[0_0_40px_rgba(16,185,129,.8)]" : EX.ring === "bad" ? "ring-8 ring-red-500 shadow-[0_0_40px_rgba(239,68,68,.8)]" : "";
        const playerMoves = Math.ceil(q.sol.length / 2), done = Math.floor(q.idx / 2);
        const msg = EX.ring === "ok" ? `<span class="text-emerald-300">اللغز اتحل صح</span>` : EX.ring === "bad" ? `<span class="text-red-300">${q.flash ? 'نقلة غلط' : 'خلص الوقت'}</span>`
          : EX.ring === "step" ? `<span class="text-emerald-300">نقلة صحيحة — استنى رد الخصم</span>`
          : `${done ? 'كمّل الحل' : 'لاقي أحسن نقلة'} — ${q.color === 'w' ? 'انت بالأبيض' : 'انت بالأسود'}${playerMoves > 1 ? ` <span class="text-gray-400 font-normal">(نقلة ${done + 1} من ${playerMoves})</span>` : ''}`;
        body = `
          <div class="gold-card rounded-2xl p-4 space-y-3">
            <div class="flex flex-wrap justify-between items-center gap-2">
              <div class="font-display font-bold text-yellow-400">اختبار ترقية Step ${EX.step}</div>
              <div class="text-sm text-gray-300" dir="ltr"><b class="text-white">${EX.i + 1}</b> / ${EX.list.length}</div>
            </div>
            <div class="flex flex-wrap gap-1.5 justify-center">${examDots()}</div>
            <div class="flex items-center gap-3">
              <div class="eval-bar flex-1" style="height:10px"><div id="exBar" style="width:${left / (EXAM_SECONDS * 10)}%; transition:width .1s linear; background:linear-gradient(90deg,#f3d266,#d4af37)"></div></div>
              <div class="text-sm font-extrabold text-yellow-300 w-10 text-center"><span id="exSec">${Math.ceil(left / 1000)}</span></div>
            </div>
            <div class="text-sm font-bold text-center text-yellow-300">${msg}</div>
          </div>
          <div class="rounded-2xl transition-all duration-200 ${ring}" style="max-width:min(100%, 62vh); margin:0 auto;">
            ${boardHTML({ game: q.game, flip: q.flip, sel: q.sel, targets: EX.locked ? null : targetsOf(q.game, q.sel), last: q.last, flash: q.flash, onClick: "examClick" })}
          </div>
          <div class="text-center"><button onclick="examQuit()" class="px-4 py-2 rounded-xl text-xs bg-red-500/15 border border-red-500/30 text-red-300">إنهاء الاختبار</button></div>`;
      }
      el.innerHTML = `<div class="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md overflow-y-auto p-3 sm:p-6"><div class="max-w-xl mx-auto space-y-3">${body}</div></div>`;
      applyLang();
    }

    // ================= قائمة الشرف =================
    // الكوتش بيشوف كل الطلبة فبيحسبها ويحفظها في meta/honor، والطالب بيقراها من هناك
    const HONOR_TOP = 10;
    function computeHonor() {
      const studs = db.users.filter(s => s.role === "student");
      const row = (s, v, streak) => ({ id: s.id, n: String(s.name || ""), s: Number(s.level) || 1, v, st: streak || 0 });
      const top = (arr) => arr.filter(r => r.v > 0).sort((a, b) => b.v - a.v || b.st - a.st).slice(0, HONOR_TOP);
      return {
        puzzles: top(studs.map(s => { const a = s.arena || {}; return row(s, (a.puzSolved || 0) + ((s.puz && s.puz.c) || 0), a.puzBestStreak); })),
        games: top(studs.map(s => { const a = s.arena || {}; return row(s, ((a.games && a.games.w) || 0) + (a.pawnWins || 0), a.bestWinStreak); })),
        days: top(studs.map(s => { const a = s.arena || {}; const st = streaks(a.days); return row(s, st.best, st.current); }))
      };
    }
    let honorTimer = null, honorLast = "";
    function maybePublishHonor() {
      if (!isCoach() || !window.fbPublishHonor) return;
      clearTimeout(honorTimer);
      honorTimer = setTimeout(async () => {
        const data = computeHonor(), key = JSON.stringify(data);
        if (key === honorLast) return;
        if (await window.fbPublishHonor(Object.assign({ updated: Date.now() }, data))) honorLast = key;
      }, 4000);
    }
    { const _r = render; render = function () { _r(); maybePublishHonor(); }; }

    function renderHonorView(u) {
      const coach = u.role === "coach";
      const H = coach ? computeHonor() : (window.honorData || null);
      const medal = i => i < 3 ? ["", "", ""][i] : `<span class="text-gray-400">${i + 1}</span>`;
      const board = (title, icon, list, valLabel, stLabel, emptyMsg) => `
        <div class="gold-card rounded-2xl p-5">
          <h3 class="font-display font-bold text-lg text-yellow-400 mb-3">${icon} ${title}</h3>
          ${list && list.length ? `<div class="overflow-x-auto"><table class="w-full text-sm text-white">
            <thead><tr class="text-yellow-300 border-b border-yellow-500/25 text-xs"><th class="py-2 w-10">#</th><th class="py-2 text-start">اسم الطالب</th><th class="py-2">Step</th><th class="py-2">${valLabel}</th><th class="py-2">${stLabel}</th></tr></thead>
            <tbody>${list.map((r, i) => `<tr class="border-b border-yellow-500/10 ${r.id === u.id ? 'bg-yellow-500/15' : i < 3 ? 'bg-black/40' : ''}">
              <td class="py-2.5 text-center text-lg">${medal(i)}</td>
              <td class="py-2.5 font-bold ${i === 0 ? 'text-yellow-300' : ''}">${esc(r.n)}${r.id === u.id ? ' <span class="text-[10px] text-yellow-300">(انت)</span>' : ''}</td>
              <td class="py-2.5 text-center text-gray-300">${esc(r.s)}</td>
              <td class="py-2.5 text-center font-extrabold text-emerald-300">${esc(r.v)}</td>
              <td class="py-2.5 text-center font-bold text-amber-300">${esc(r.st)}</td>
            </tr>`).join("")}</tbody>
          </table></div>` : `<p class="text-xs text-gray-400">${emptyMsg}</p>`}
        </div>`;
      const myRank = (list) => { const i = (list || []).findIndex(r => r.id === u.id); return i >= 0 ? i + 1 : null; };
      return `
        <div class="space-y-5">
          <div class="gold-card rounded-2xl p-6 text-center space-y-2 border-2 border-yellow-500/40">
            ${ICON("trophy", "w-10 h-10 mx-auto text-yellow-300")}
            <h2 class="font-display font-extrabold text-2xl gold-gradient-text">قائمة الشرف</h2>
            <p class="text-xs text-gray-400">أكتر الطلبة حلّاً للألغاز وكسباً للأدوار في ECA — وأعلى ستريك وصل له كل واحد.</p>
            ${!coach && H ? `<div class="flex flex-wrap justify-center gap-2 pt-1 text-[11px]">
              ${myRank(H.puzzles) ? `<span class="px-2.5 py-1 rounded-lg bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">ترتيبك: ${myRank(H.puzzles)}</span>` : ''}
              ${myRank(H.games) ? `<span class="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">ترتيبك: ${myRank(H.games)}</span>` : ''}
            </div>` : ''}
          </div>
          ${!H ? `<div class="gold-card rounded-2xl p-8 text-center text-sm text-gray-400">قائمة الشرف لسه بتتجهّز — بتتحدّث لما الكوتش يفتح المنصة.</div>` : `
            ${board("أكتر الطلبة حلّاً للألغاز", "", H.puzzles, "ألغاز اتحلّت", "أعلى ستريك ألغاز", "لسه محدش حل ألغاز — ادخل ساحة التدريب وابدأ!")}
            ${board("أكتر الطلبة كسباً للأدوار", "", H.games, "أدوار كسبها", "أعلى ستريك انتصارات", "لسه محدش كسب دور — العب ضد الكمبيوتر أو لعبة البيادق!")}
            ${board("أطول ستريك تمرين", "", H.days, "أطول سلسلة (يوم)", "السلسلة الحالية", "لسه مفيش أيام تمرين متسجلة.")}
            ${H.updated ? `<p class="text-[11px] text-gray-500 text-center">آخر تحديث: <span dir="ltr">${new Date(H.updated).toLocaleString(lang === "en" ? "en-GB" : "ar-EG")}</span></p>` : ''}`}
          <p class="text-[11px] text-gray-500 text-center">الألغاز = ألغاز ساحة التدريب + اللغز اليومي • الأدوار = ضد الكمبيوتر + لعبة البيادق • بيظهر أول ${HONOR_TOP} في كل قائمة.</p>
        </div>`;
    }

    // ================= شهاداتي: كل شهادات الطالب في مكان واحد، متاحة في أي وقت =================
    function renderMyCertsView(u) {
      const certs = (u.certificates || []).map((c, i) => ({ c, i })).reverse();   // الأحدث الأول
      const s = calcStats(u), st = (u.examState || {})[Number(u.level)];
      const next = s.attP < 100 ? `فاضلك ${s.rem} درس في Step ${esc(u.level)} عشان يفتحلك امتحان الترقية.`
        : st && st.status === "failed" ? "ابعت طلب إعادة الاختبار للكوتش من الصفحة الرئيسية."
        : `امتحان Step ${esc(u.level)} متاح دلوقتي من الصفحة الرئيسية.`;
      return `
        <div class="space-y-5">
          <div class="gold-card rounded-2xl p-5 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 class="font-display font-bold text-xl gold-gradient-text">شهاداتي</h2>
              <p class="text-xs text-gray-400 mt-1">كل شهاداتك محفوظة هنا — تقدر تفتحها وتحمّلها بالعربي أو الإنجليزي في أي وقت.</p>
            </div>
            <div class="text-2xl font-extrabold text-yellow-300" dir="ltr">${certs.length}</div>
          </div>
          ${certs.length ? `<div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${certs.map(({ c, i }) => `
              <div class="gold-card rounded-2xl p-5 space-y-3 border border-yellow-500/40">
                <div class="flex items-center gap-3">
                  <div class="w-14 h-14 rounded-xl bg-white p-1 shrink-0"><img src="img/eca-mark.png" alt="ECA" class="w-full h-full object-contain" /></div>
                  <div>
                    <div class="font-bold text-white">شهادة إتمام Step ${esc(c.step)}</div>
                    <div class="text-[11px] text-gray-400"><span dir="ltr">${esc(c.date)}</span> • ${esc(c.score)}%</div>
                    <div class="text-[11px] text-gray-500">${esc(c.coachName || '')}</div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button onclick="previewAndDownloadCert('${u.id}', ${i}, true, 'ar')" class="tap rounded-xl text-xs gold-btn">عربي</button>
                  <button onclick="previewAndDownloadCert('${u.id}', ${i}, true, 'en')" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">English</button>
                </div>
              </div>`).join("")}
          </div>` : `
          <div class="gold-card rounded-2xl p-8 text-center space-y-3">
            ${ICON("certificate", "w-12 h-12 mx-auto text-yellow-300")}
            <div class="font-bold text-white">لسه مفيش شهادات</div>
            <p class="text-sm text-gray-400">الشهادة بتطلعلك لما تنجح في امتحان ترقية أي Step.</p>
          </div>`}
          <div class="gold-card rounded-2xl p-4 flex flex-wrap justify-between items-center gap-3 text-sm">
            <span class="text-gray-300">الشهادة الجاية: <b class="text-yellow-300">Step ${esc(u.level)}</b> — ${next}</span>
            <button onclick="switchTab('home')" class="px-4 py-2 rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">الصفحة الرئيسية ←</button>
          </div>
        </div>`;
    }

    // ================= داشبورد ولي الأمر (جوه حساب الطالب، من غير كود) =================
    function renderStudentParentView(u) {
      const s = calcStats(u), a = u.arena || {}, gm = a.games || { w: 0, l: 0, d: 0 };
      const xp = calcXP(u), rk = rankOf(xp.total), st = streaks(a.days);
      const earned = badgeList(u).reduce((n, c) => n + c.items.filter(b => b[3]).length, 0), allBadges = badgeList(u).reduce((n, c) => n + c.items.length, 0);
      const certs = u.certificates || [], exams = u.examState || {};
      const cnt = (o, step) => Object.keys(o || {}).filter(k => o[k] && k.split("-")[0] === String(step)).length;
      const games = (gm.w || 0) + (gm.l || 0) + (gm.d || 0);
      const puzAcc = a.puzTried ? Math.round(((a.puzSolved || 0) / a.puzTried) * 100) : null;
      const bar = (pct, color) => `<div class="eval-bar" style="height:10px"><div style="width:${Math.max(0, Math.min(100, pct))}%; background:${color}"></div></div>`;
      const kpi = (val, label, cls) => `<div class="p-4 rounded-2xl bg-black/70 border border-yellow-500/20 text-center"><div class="text-2xl font-extrabold ${cls}">${val}</div><div class="text-[11px] text-gray-400 mt-1">${label}</div></div>`;
      const lastDay = (a.days || []).slice().sort().pop();
      return `
        <div class="space-y-5">
          <div class="gold-card rounded-2xl p-5 flex flex-wrap justify-between items-center gap-4">
            <div>
              <h2 class="font-display font-bold text-xl gold-gradient-text">داشبورد ولي الأمر</h2>
              <p class="text-xs text-gray-400 mt-1">كل إحصائيات <b class="text-white">${esc(u.name)}</b> في مكان واحد.</p>
            </div>
            <button onclick="window.print()" class="px-4 py-2 rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">طباعة التقرير</button>
          </div>

          <div class="gold-card rounded-2xl p-5 grid md:grid-cols-3 gap-5 items-center">
            <div class="space-y-1">
              <div class="text-xs text-yellow-400 font-bold">STEP ${esc(u.level)}${u.group ? ' • ' + esc(u.group) : ''} • ${stuMode(u) === 'online' ? 'أونلاين' : 'أوفلاين'}</div>
              <div class="font-display text-2xl font-extrabold text-white">${esc(u.name)}</div>
              <div class="text-xs text-gray-400">@${esc(u.username || '')}${u.coachName ? ' • ' + esc(u.coachName) : ''}</div>
            </div>
            <div class="px-5 py-4 rounded-2xl border ${s.evalCls} text-center">
              <div class="text-[11px]">التقييم العام للطالب</div>
              <div class="text-xl font-extrabold mt-1">${s.evalText}</div>
              <div class="text-sm font-bold mt-1">${s.overall}%</div>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-14 h-14 rounded-xl bg-white/90 p-1.5 shrink-0"><img src="img/${rk.cur ? rk.cur.icon : 'chess-pawn-icon.svg'}" alt="" class="w-full h-full object-contain ${rk.cur ? '' : 'badge-off'}" /></div>
              <div>
                <div class="text-[11px] text-gray-400">الرتبة</div>
                <div class="font-bold text-yellow-300">${rk.cur ? rk.cur.label : 'لسه بدون رتبة'}</div>
                <div class="text-[11px] text-gray-400">${xp.total.toLocaleString()} XP • ${earned}/${allBadges} شارة</div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            ${kpi(s.attC + " / " + s.total, "الدروس اللي حضرها في Step " + esc(u.level), "text-emerald-300")}
            ${kpi(s.hwC + " / " + s.total, "الواجبات اللي حلّها", "text-yellow-300")}
            ${kpi(puzAcc !== null ? puzAcc + "%" : "—", "دقة حل الألغاز", "text-sky-400")}
            ${kpi(s.rem, "دروس فاضلة للامتحان", "text-white")}
          </div>

          <div class="grid lg:grid-cols-2 gap-5">
            <div class="gold-card rounded-2xl p-5 space-y-4">
              <h3 class="font-display font-bold text-lg text-yellow-400">التقدم في المنهج</h3>
              <div class="space-y-1"><div class="flex justify-between text-xs"><span class="text-gray-300">الحضور (Step ${esc(u.level)})</span><b class="text-emerald-300">${s.attP}%</b></div>${bar(s.attP, '#10b981')}</div>
              <div class="space-y-1"><div class="flex justify-between text-xs"><span class="text-gray-300">الواجبات (Step ${esc(u.level)})</span><b class="text-yellow-300">${s.hwP}%</b></div>${bar(s.hwP, '#d4af37')}</div>
              <div class="overflow-x-auto"><table class="w-full text-xs text-white mt-2">
                <thead><tr class="text-yellow-300 border-b border-yellow-500/25"><th class="py-2 text-start">Step</th><th class="py-2">حضر</th><th class="py-2">الواجب</th><th class="py-2">الامتحان</th></tr></thead>
                <tbody>${STEPS.filter(x => x.lessons.length).map(x => { const e = exams[x.step]; const cur = Number(u.level) === x.step; return `<tr class="border-b border-yellow-500/10 ${cur ? 'text-yellow-200 font-bold' : ''}"><td class="py-2">${cur ? '▶ ' : ''}Step ${x.step}</td><td class="py-2 text-center">${cnt(u.att, x.step)} / ${x.lessons.length}</td><td class="py-2 text-center">${cnt(u.hw, x.step)} / ${x.lessons.length}</td><td class="py-2 text-center">${e ? (e.status === 'passed' ? '<span class="text-emerald-300">✓ ' + e.score + '%</span>' : e.status === 'retry' ? '<span class="text-amber-300">إعادة متاحة</span>' : '<span class="text-red-300">✗ ' + e.score + '%' + '' + '</span>') : (x.step < Number(u.level) ? '✓' : '—')}</td></tr>`; }).join("")}</tbody>
              </table></div>
            </div>

            <div class="gold-card rounded-2xl p-5 space-y-3">
              <h3 class="font-display font-bold text-lg text-yellow-400">نشاطه في ساحة التدريب</h3>
              <div class="grid grid-cols-2 gap-2">
                ${kpi(gm.w + " / " + gm.d + " / " + gm.l, "ضد الكمبيوتر: فوز / تعادل / خسارة", "text-emerald-300")}
                ${kpi(a.bestWin ? LEVELS[a.bestWin - 1].name : "—", "أعلى مستوى كسبه", "text-yellow-300")}
                ${kpi((a.puzSolved || 0) + " / " + (a.puzTried || 0), "ألغاز اتحلّت / جرّبها" + (puzAcc !== null ? " (" + puzAcc + "%)" : ""), "text-sky-400")}
                ${kpi("" + (a.puzBestStreak || 0), "أطول سلسلة ألغاز صح", "text-white")}
                ${kpi(a.visionBest || 0, "أفضل نتيجة في تدريب الرؤية", "text-white")}
                ${kpi((a.pawnWins || 0) + " / " + (a.pawnLosses || 0), "لعبة البيادق: فوز / خسارة", "text-white")}
              </div>
              <div class="text-xs text-gray-400 pt-1">أيام تمرين ورا بعض دلوقتي: <b class="text-yellow-300">${st.current}</b> • أطول سلسلة: <b class="text-yellow-300">${st.best}</b>${lastDay ? ' • آخر تمرين: <b class="text-white" dir="ltr">' + lastDay + '</b>' : ''} • عدد الأدوار: <b class="text-white">${games}</b></div>
            </div>
          </div>

          <div class="grid lg:grid-cols-2 gap-5">
            <div class="gold-card rounded-2xl p-5">
              <h3 class="font-display font-bold text-lg text-yellow-400 mb-3">الشهادات</h3>
              ${certs.length ? `<div class="space-y-2">${certs.map((c, i) => `<div class="flex flex-wrap justify-between items-center gap-2 p-3 rounded-xl bg-black/70 border border-yellow-500/25">
                <div><div class="text-sm font-bold text-white">شهادة إتمام Step ${esc(c.step)}</div><div class="text-[11px] text-gray-400">${esc(c.score)}% • ${esc(c.date)}</div></div>
                <button onclick="previewAndDownloadCert('${u.id}', ${i}, false)" class="px-3 py-1.5 rounded-xl text-xs gold-btn">تحميل PDF</button>
              </div>`).join("")}</div>` : `<p class="text-xs text-gray-400">لسه مفيش شهادات — الشهادة بتطلع بعد ما ينجح في امتحان الـ Step.</p>`}
            </div>
            <div class="gold-card rounded-2xl p-5 space-y-3">
              <h3 class="font-display font-bold text-lg text-yellow-400">ملاحظات وتوصيات</h3>
              ${u.note ? `<div class="p-3 rounded-xl bg-black/80 border border-yellow-500/40"><b class="text-xs text-yellow-400">ملاحظة الكوتش:</b><p class="text-sm text-white mt-1">${esc(u.note)}</p></div>` : ''}
              <ul class="space-y-2 text-sm text-gray-300">
                ${s.rem > 0 ? `<li>فاضله <b class="text-white">${s.rem}</b> درس عشان يقدر يدخل امتحان Step ${esc(u.level)}.</li>` : `<li>خلّص حضور كل دروس Step ${esc(u.level)} — امتحان الترقية متاح.</li>`}
                ${s.hwP < 70 ? `<li>الواجبات محتاجة متابعة: حلّ ${s.hwC} من ${s.total}.</li>` : `<li>ملتزم في الواجبات (${s.hwP}%).</li>`}
                ${st.current === 0 ? `<li>ما اتمرّنش النهاردة ولا امبارح على المنصة — شجّعه يتمرّن في ساحة التدريب.</li>` : `<li>بيتمرّن ${st.current} يوم ورا بعض — كمّل!</li>`}
              </ul>
            </div>
          </div>
        </div>`;
    }

    // ترجمة الصفحات الجديدة للإنجليزي
    [
      ["لعبة البيادق", "Pawns game"], ["رقعة التحليل", "Analysis board"], ["ألوان الرقعة:", "Board colors:"], ["فاتح", "Light"], ["غامق", "Dark"],
      ["لغز اليوم من Lichess", "Lichess daily puzzle"],
      ["لعبة البيادق — اختار وضع البداية", "Pawns game — choose a starting position"],
      ["مهمتك توصّل بيدق للصف الثامن لو انت بالأبيض (أو الصف الأول لو بالأسود). الكمبيوتر هيحاول يسبقك بنفس الشرط.", "Your mission: get a pawn to the 8th rank as White (or the 1st rank as Black). The computer will race you to do the same."],
      ["الوضع", "Position"], ["لعبة البيادق — الوضع", "Pawns game — position"], ["أول بيدق يوصل للصف الأخير بيكسب الدور.", "The first pawn to reach the last rank wins."],
      ["كسبت! بيدقك وصل الأول", "You won! Your pawn got there first"], ["الكمبيوتر وصل الأول", "The computer got there first"], ["تعادل — مفيش نقلات", "Draw — no moves left"],
      ["بيدقك وصل الأول — كسبت!", "Your pawn got there first — you win!"], ["بيدق الكمبيوتر وصل الأول", "The computer's pawn got there first"], ["مفيش نقلات — تعادل", "No moves left — draw"],
      ["العب بالأسود", "Play Black"], ["العب بالأبيض", "Play White"], ["إعادة", "Reset"], ["وضع تاني", "Other position"],
      ["المحرك بيحلل...", "Engine is analyzing..."], ["كش مات — الدور خلص", "Checkmate — game over"], ["الدور تعادل", "The game is drawn"],
      ["كش مات في ", "Mate in "], ["للأبيض", "for White"], ["للأسود", "for Black"], ["التقييم: ", "Evaluation: "], [" • العمق ", " • depth "], ["أحسن خط:", "Best line:"],
      ["حرّك القطع للونين بحرية والمحرك هيقيّم الوضع على طول.", "Move pieces for both sides freely; the engine evaluates the position live."],
      ["من الأول", "Start position"], ["تحميل", "Load"], ["نسخ الـ FEN الحالي", "Copy current FEN"], ["تحميل الدور", "Load game"],
      ["اتحمّل الوضع", "Position loaded"], ["الـ FEN ده مش صحيح", "Invalid FEN"], ["اتحمّل الدور", "Game loaded"], ["الـ PGN ده مش صحيح", "Invalid PGN"],
      ["الرتب والشارات", "Ranks & Badges"], ["الرتب والشارات", "Ranks & Badges"], ["رتبتك الحالية", "Your current rank"], ["لسه بدون رتبة", "No rank yet"],
      ["الرتبة الجاية:", "Next rank:"], ["وصلت لأعلى رتبة!", "You reached the top rank!"], ["XP فاضل", "XP to go"],
      ["الدروس اللي حضرها", "Lessons attended"], ["الواجبات", "Homework"], ["اللغز اليومي", "Daily puzzle"], ["ألغاز الساحة", "Arena puzzles"],
      ["أدوار ضد الكمبيوتر", "Games vs computer"], ["تدريب الرؤية", "Vision training"], ["الشهادات", "Certificates"],
      ["ترتيب الطلاب", "Student leaderboard"], ["الرتبة", "Rank"], ["الرتب", "Ranks"], ["الشارات", "Badges"],
      ["بتجمع XP من حضور الدروس، والواجبات، والألغاز، والأدوار، وتدريب الرؤية، والشهادات.", "You earn XP from lessons attended, homework, puzzles, games, vision training and certificates."],
      ["البيدق", "Pawn"], ["الفيل", "Bishop"], ["الحصان", "Knight"], ["الطابية", "Rook"], ["الوزير", "Queen"], ["الملك", "King"],
      ["أيام التمرين ورا بعض", "Daily streaks"], ["ألغاز صح ورا بعض", "Tactics streaks"], ["إنجازات متنوعة", "Miscellaneous"],
      ["اتمرّن يومين ورا بعض", "Train 2 days in a row"], ["اتمرّن 5 أيام ورا بعض", "Train 5 days in a row"], ["اتمرّن 7 أيام ورا بعض", "Train 7 days in a row"], ["اتمرّن 14 يوم ورا بعض", "Train 14 days in a row"],
      ["اتمرّن 30 يوم ورا بعض", "Train 30 days in a row"], ["اتمرّن 90 يوم ورا بعض", "Train 90 days in a row"], ["اتمرّن 180 يوم ورا بعض", "Train 180 days in a row"], ["اتمرّن 365 يوم ورا بعض", "Train 365 days in a row"], ["اتمرّن 730 يوم ورا بعض", "Train 730 days in a row"],
      ["5 أيام", "5 days"], ["3 شهور", "3 months"], ["6 شهور", "6 months"],
      ["زحف البيادق", "Pawns' Progress"], ["هجمة الأحصنة", "Knights' Rally"], ["انتصار الأفيال", "Bishops' Triumph"], ["سيطرة الطوابي", "Rooks' Dominance"], ["حكم الوزير", "Queen's Reign"], ["فتوحات الملك", "King's Conquest"],
      ["حل 10 ألغاز صح ورا بعض", "Solve 10 puzzles in a row"], ["حل 20 لغز صح ورا بعض", "Solve 20 puzzles in a row"], ["حل 30 لغز صح ورا بعض", "Solve 30 puzzles in a row"], ["حل 40 لغز صح ورا بعض", "Solve 40 puzzles in a row"], ["حل 50 لغز صح ورا بعض", "Solve 50 puzzles in a row"], ["حل 100 لغز صح ورا بعض", "Solve 100 puzzles in a row"],
      ["أول انتصار", "First win"], ["اكسب أول دور ضد الكمبيوتر", "Win your first game vs the computer"], ["قاهر الجراند ماستر", "Grandmaster slayer"], ["اكسب ضد مستوى جراند ماستر", "Beat the Grandmaster level"],
      ["ملك البيادق", "Pawn king"], ["اكسب 5 أدوار في لعبة البيادق", "Win 5 pawns games"], ["عين الصقر", "Eagle eye"], ["جيب 20 نقطة أو أكتر في تدريب الرؤية", "Score 20+ in vision training"],
      ["أول شهادة", "First certificate"], ["اجتاز امتحان أول Step", "Pass your first Step exam"],
      ["أيام تمرين ورا بعض دلوقتي:", "Current daily streak:"], ["• أطول سلسلة:", "• Longest streak:"],
      ["كل درس وواجب ولغز ودور بيقرّبك من الرتبة اللي بعدها.", "Every lesson, homework, puzzle and game brings you closer to the next rank."],
      ["نظام الرتب والشارات للطلاب، وترتيبهم حسب الـ XP.", "The students' ranks & badges system and their XP leaderboard."],
      ["عن ECA", "About ECA"], ["عن الأكاديمية", "About us"], ["الكورسات والأسعار", "Courses & prices"], ["الحصص الخاصة", "Private lessons"],
      ["الأسئلة الشائعة", "FAQ"], ["اللعب النظيف", "Fair play"], ["تواصل معنا", "Contact us"],
      ["انضم وبقى لاعب أقوى!", "Join and become a better player!"], ["احجز مكانك دلوقتي واكتشف إمكانياتك.", "Sign up now and discover your potential."], ["انضم دلوقتي", "Join now"],
      ["عن الأكاديمية", "About us"],
      ["ECA أكاديمية شطرنج بتعلّم الطلاب من الصفر لحد المستويات المتقدمة بمنهج من 6 Steps. المنصة دي معمولة عشان الطالب يتعلم ويتمرن ويتابع تقدمه، والكوتش يتابع الحضور والواجبات، وولي الأمر يطمن على ابنه — كله في مكان واحد.", "ECA is a chess academy that teaches students from zero to advanced levels through a 6-Step curriculum. This platform lets students learn, practice and track progress, coaches follow attendance and homework, and parents stay informed — all in one place."],
      ["فلسفتنا", "Our philosophy"],
      ["الشطرنج للكل مهما كان السن أو المستوى. سواء عايز تلعب أدوار أو تحل ألغاز، عندنا مستويات صعوبة تناسب الكل. هدفنا بيئة سهلة وممتعة لتعلّم الشطرنج وإتقانه.", "Chess is for everyone, whatever the age or level. Whether you want to play games or solve puzzles, we have difficulty levels for all. Our goal is an accessible, enjoyable place to learn and master chess."],
      ["اتعلم بالمنهج", "Learn the curriculum"], ["دروس منظمة من Step 1 لحد Step 6، وواجب بعد كل درس.", "Structured lessons from Step 1 to Step 6, with homework after each lesson."],
      ["العب ضد الكمبيوتر", "Play vs computer"], ["اختار مستوى الصعوبة وواجه محرك Stockfish من «مبتدئ» لحد «جراند ماستر».", "Pick a difficulty and face the Stockfish engine from Novice to Grandmaster."],
      ["حل الألغاز", "Solve puzzles"], ["لغز يومي، وألغاز حقيقية من Lichess بكل المستويات.", "A daily puzzle plus real Lichess puzzles at every level."],
      ["حلّل أدوارك", "Analyze your games"], ["رقعة تحليل بالمحرك عشان تعرف غلطاتك وتتحسن.", "An engine-powered analysis board to spot mistakes and improve."],
      ["تابع تقدمك", "Track your progress"], ["رتب وشارات بتكبر مع كل درس وواجب ولغز ودور.", "Ranks and badges that grow with every lesson, homework, puzzle and game."],
      ["ولي الأمر في الصورة", "Parents in the loop"], ["كود متابعة لولي الأمر يشوف بيه الحضور والتقييم وملاحظات الكوتش.", "A follow-up code lets parents see attendance, rating and the coach's notes."],
      ["ليه ECA؟", "Why ECA?"], ["عندنا استراتيجية مميزة", "We have an amazing strategy"],
      ["متابعة شخصية لكل طالب بتساعده يتفوق في كل مرحلة: يتعلم، يحلل، ويكسب. وبأدوات حديثة بنساعد اللاعبين يطلّعوا كل إمكانياتهم.", "Personal follow-up helps every student excel at each stage: learn, analyze, win. With modern tools we help players reach their full potential."],
      ["ساعدنا نتحسن", "Help us improve"],
      ["الكورسات", "Courses"], ["اتعلم معانا", "Learn with us"], ["انضم كعضو", "Become a member"], ["عمر ما كان متأخر تبدأ تلعب شطرنج — اعمل حساب وابدأ تتعلم!", "It's never too late to start chess — create an account and start learning!"],
      ["المنهج والمواد", "Courseware"], ["هتلاقي دروس وتمارين وواجبات تساعدك تبقى لاعب أقوى.", "Lessons, exercises and homework to help you become a stronger player."],
      ["حصص أونلاين وأوفلاين", "Online & in-person classes"], ["حصص جماعية أو فردية تركّز فيها على نقط ضعفك وقوتك.", "Group or individual classes focused on your weak and strong sides."],
      ["حصصنا", "Our classes"], ["اشترك واتعلم من حصصنا", "Join and learn from our classes"], ["اكتشف إمكانياتك وادخل عالم الشطرنج اللي عمرك ما عرفته قبل كده!", "Discover your potential and dive into a world of chess you've never known!"],
      ["شطرنج للمبتدئين", "Chess for beginners"], ["ابدأ تتعلم الشطرنج من الأول خالص.", "Start learning chess from the very beginning."], ["استراتيجيات كلاسيكية", "Classic strategies"], ["حل تمارين بتبدأ من أسهل مستوى.", "Solve tasks starting from the easiest level."],
      ["استراتيجيات الأبطال", "Champion strategies"], ["اتقن حل الألغاز وبقى بطل فيها!", "Master puzzles and become a puzzle champion!"], ["قيمة الوقت", "Notions of time"], ["اصبر وذاكر باستمرار وهتشوف نتيجة شغلك بسرعة.", "Be patient, study consistently and you'll see results fast."],
      ["فكّر زي خصمك", "Opponent's thoughts"], ["النظري حلو بس لازم تلعب أدوار وتحلل نقلاتك ونقلات خصمك.", "Theory is good, but always play games and analyze your and your opponent's moves."],
      ["حصص أونلاين", "Online classes"], ["شوف عروض الحصص الأونلاين، احضر حصة وجرّب بنفسك!", "Check our online classes, join a lesson and see for yourself!"],
      ["الأسعار", "Prices"], ["اختار نظامك", "Choose your class"], ["احجز الحصص وقرّر تتعلم لوحدك ولا مع مجموعة من صحابك!", "Book classes and decide whether to learn alone or with a group of friends!"],
      ["تواصل معنا للسعر", "Contact us for pricing"], ["احجز النظام ده", "Join this class"],
      ["* أسعار المجموعات بتتحدد بعد التواصل مع الكوتش، وحسب عدد الحصص وعدد الطلاب.", "* Group prices are set after consulting the coach and depend on the number of classes and students."],
      ["اعرف أكتر عن الحصص الخاصة ←", "Learn more about private lessons →"],
      ["حصص جماعية أوفلاين", "In-person group classes"], ["حصص جماعية أونلاين", "Online group classes"], ["حصص خاصة", "Private lessons"], ["جنيه / شهرياً", "EGP / month"], ["جنيه / الحصة", "EGP / lesson"],
      ["حضور في الأكاديمية مع الكوتش", "In-person at the academy with the coach"], ["منهج ECA من Step 1 لحد Step 6", "ECA curriculum from Step 1 to Step 6"], ["متابعة الحضور والواجب على المنصة", "Attendance & homework tracking on the platform"],
      ["ملاحظات الكوتش لولي الأمر", "Coach's notes for parents"], ["شهادة بعد اجتياز كل Step", "A certificate after passing each Step"], ["حصص أونلاين من البيت", "Online classes from home"], ["نفس منهج ECA والواجبات", "Same ECA curriculum and homework"],
      ["ساحة التدريب: ألغاز ولعب ضد الكمبيوتر", "Training Arena: puzzles and games vs computer"], ["حصة فردية مع الكوتش", "One-on-one lesson with the coach"], ["خطة مخصصة لمستوى الطالب", "A plan tailored to the student's level"],
      ["تحليل أدوار الطالب", "Analysis of the student's games"], ["واجبات وتمارين إضافية", "Extra homework and exercises"], ["مواعيد بالاتفاق مع الكوتش", "Schedule agreed with the coach"],
      ["الحصص الخاصة", "Private lessons"], ["اتعلم شطرنج من بيتك", "Learn chess from your home"], ["سنين خبرة في التدريس خلّتنا نعمل منهج مخصص لكل طالب حسب مستواه.", "Years of teaching experience let us build an individual plan for each student's level."],
      ["«ممكن تتعلم من دور خسرته أكتر بكتير من دور كسبته» — خوسيه راؤول كابابلانكا", "\"You may learn much more from a game you lose than from a game you win.\" — José Raúl Capablanca"],
      ["مميزات الحصص الأونلاين", "Benefits of online classes"],
      ["الحصص الأونلاين طريقة مرنة وفعّالة تطوّر بيها مستواك من غير ما تتحرك من مكانك. بتدريب شخصي وأدوات تفاعلية بتتقدم بالسرعة اللي تناسبك.", "Online lessons are a flexible, effective way to improve without travelling. With personal coaching and interactive tools you progress at your own pace."],
      ["المرونة", "Convenience"], ["اتعلم من أي مكان وفي أي وقت من غير مواصلات.", "Learn anywhere, anytime, without commuting."], ["تدريب شخصي", "Personal coaching"], ["الحصص متفصّلة على مستواك انت.", "Lessons tailored to your level."],
      ["أدوات تفاعلية", "Interactive tools"], ["شرح مباشر على الرقعة وتحليل لأدوارك.", "Live demonstrations on the board and analysis of your games."], ["بعد الحصة", "After class"], ["ملاحظات من الحصة وتمارين إضافية.", "Notes from the lesson and extra tasks."],
      ["توفير", "Cost-effective"], ["توفّر وقت ومواصلات وتاخد تعليم بجودة عالية.", "Save time and travel while getting quality instruction."], ["قالوا إيه بعد الحصص", "What they said after class"],
      ["الأسئلة الشائعة", "Frequently asked questions"], ["أسئلة بتتسأل كتير", "Frequently asked questions"],
      ["ازاي ألعب ضد الكمبيوتر؟", "How do I play against the computer?"], ["سجّل دخولك وادخل «ساحة التدريب» ← «العب ضد الكمبيوتر»، اختار المستوى واللون واضغط «ابدأ الدور».", "Log in, open \"Training Arena\" → \"Play vs computer\", pick a level and color, then press \"Start game\"."],
      ["إيه قواعد الشطرنج؟", "What are the rules of chess?"], ["الشطرنج بيتلعب على رقعة 8×8 وكل لاعب بيبدأ بـ 16 قطعة. الهدف إنك تعمل كش مات لملك الخصم. القواعد كلها موجودة في دروس Step 1.", "Chess is played on an 8×8 board and each player starts with 16 pieces. The goal is to checkmate the opponent's king. All the rules are in the Step 1 lessons."],
      ["أقدر ألعب مع صحابي؟", "Can I play with friends?"], ["الميزة دي لسه بنشتغل عليها. لحد ما تنزل، تقدر تتمرن ضد الكمبيوتر وفي لعبة البيادق.", "That feature is in progress. Until then, practice against the computer and in the pawns game."],
      ["ازاي أحسّن مستوايا؟", "How can I improve?"], ["اتمرن بانتظام، حل الواجبات واللغز اليومي، حلّل أدوارك في «رقعة التحليل»، والعب ضد مستويات أقوى من مستواك.", "Practice regularly, do your homework and the daily puzzle, analyze your games on the \"Analysis board\" and play stronger levels."],
      ["ولي الأمر يتابع ازاي؟", "How do parents follow up?"], ["الكوتش بيدّي ولي الأمر «كود متابعة». ادخل «بوابة ولي الأمر» واكتب الكود عشان تشوف الحضور والتقييم وملاحظات الكوتش.", "The coach gives parents a follow-up code. Open the \"Parent Portal\" and enter it to see attendance, rating and the coach's notes."],
      ["عندي مشكلة تقنية، أعمل إيه؟", "I have a technical issue — what should I do?"], ["ابعتلنا من صفحة «تواصل معنا» واكتب تفاصيل المشكلة، ولو تقدر ابعت صورة للشاشة.", "Message us from the \"Contact us\" page with the details, and a screenshot if you can."],
      ["مش لاقي إجابة سؤالك؟", "Can't find what you're looking for?"], ["ماتتردّدش وابعتلنا رسالة!", "Don't hesitate to send us a message!"],
      ["اللعب النظيف هو أساس المنافسة الحقيقية والروح الرياضية. في الشطرنج، الأمانة بتخلّي التجربة ممتعة ومفيدة للكل. لما نلتزم بالقواعد دي بنعمل بيئة عادلة ومحترمة لكل اللاعبين.", "Fair play is the foundation of true competition and sportsmanship. In chess, honesty makes the experience rewarding for everyone. By following these rules we keep a fair, respectful environment for all players."],
      ["قواعد اللعب النظيف", "Fair play guidelines"], ["العب نقلاتك بنفسك.", "Make your own moves."], ["ممنوع الغش أو استخدام أي وسيلة مش عادلة.", "No cheating or unfair means."],
      ["ماتاخدش مساعدة من حد تاني وانت بتلعب — أهل أو صحاب أو لاعبين تانيين.", "Don't take help from anyone while playing — parents, friends or other players."],
      ["ممنوع تستخدم محركات شطرنج أو برامج أو إضافات للمتصفح بتحلل الوضع وانت بتلعب.", "Don't use engines, software or browser add-ons that analyze the position while you play."],
      ["ماتستخدمش أي أداة بتقولك أحسن نقلة في الألغاز أو الامتحانات.", "Don't use any tool that reveals the best move in puzzles or exams."], ["رقعة التحليل للمذاكرة بعد الدور — مش أثناء الامتحان أو اللغز.", "The analysis board is for studying after the game — not during an exam or puzzle."],
      ["ماتشاركش حسابك مع حد وماتستخدمش حساب حد تاني.", "Don't share your account or use someone else's."], ["ماتلعبش في النتايج أو تحاول تزوّد نقاطك بطريقة مش حقيقية.", "Don't manipulate results or inflate your points artificially."],
      ["احترم زمايلك وماتضايقش حد وهو بيلعب.", "Respect others and don't disrupt anyone's game."], ["لو شاكك إن حد بيغش، بلّغ الكوتش — ماتردّش بالغش انت كمان.", "If you suspect cheating, tell the coach — never answer it with cheating."],
      ["تنبيه مهم", "IMPORTANT"], ["لو الكوتش لاحظ إن فيه مخالفة لقواعد اللعب النظيف، هيتكلم مع الطالب وولي الأمر، وممكن نتايج الساحة أو الامتحان تتلغي.", "If the coach notices a fair-play violation, they'll talk with the student and parent, and arena or exam results may be cancelled."],
      ["تواصل معنا", "Contact us"], ["إحنا هنا عشانك", "We're here for you"], ["عايز تتواصل معانا أو تبلّغ عن مشكلة؟ املا الفورم واحكيلنا أكتر.", "Want to reach us or report an issue? Fill in the form and tell us more."],
      ["اسمك", "Your name"], ["رقمك أو إيميلك (اختياري)", "Your phone or email (optional)"], ["اكتب رسالتك...", "Write your message..."],
      ["سؤال عام", "General question"], ["حجز / اشتراك", "Booking / subscription"], ["فكرة لتحسين الموقع", "Idea to improve the site"], ["مشكلة تقنية", "Technical issue"], ["حجز:", "Booking:"],
      ["ابعت على واتساب", "Send on WhatsApp"], ["ابعت بالإيميل", "Send by email"], ["اتواصل معانا", "Get in touch"],
      ["بيانات التواصل لسه ما اتضافتش — الأدمن يضيفها من ECA_INFO في كود الموقع.", "Contact details aren't added yet — the admin can add them in ECA_INFO in the site code."],
      ["اسأل الكوتش في الحصة أو ابعت رسالة لولي الأمر على الواتساب.", "Ask the coach in class or message the parent on WhatsApp."],
      ["اكتب اسمك والرسالة", "Enter your name and message"], ["بيانات التواصل لسه ما اتضافتش", "Contact details aren't added yet"],
      ["رسالة من موقع ECA", "Message from the ECA website"], ["للتواصل", "Contact"], ["الموضوع", "Subject"],
      ["«الشطرنج قبل أي حاجة معركة مع نفسك» — جاري كاسباروف", "\"Chess is first and foremost a fight against yourself.\" — Garry Kasparov"],
      ["Egypt Chess Academy (ECA) أكاديمية شطرنج في القاهرة، بتعلّم الشطرنج لكل الأعمار بطريقة ممتعة وسهلة مع مدربين متخصصين. بنبدأ مع الطالب من أول حركات القطع، ونطلع معاه لحد المستويات المتقدمة بمنهج من 6 Steps، وبنتابع كل طالب في الحضور والواجب والتقييم.", "Egypt Chess Academy (ECA) is a chess academy in Cairo that teaches all ages in a fun, easy way with expert trainers. We start from how the pieces move and go all the way to advanced levels through a 6-Step curriculum, following each student's attendance, homework and progress."],
      ["المنصة دي جزء من الأكاديمية: الطالب بيتعلم ويتمرن ويتابع تقدمه، والكوتش بيتابع الحضور والواجبات، وولي الأمر بيطمن على ابنه — كله في مكان واحد.", "This platform is part of the academy: students learn, practice and track progress, coaches follow attendance and homework, and parents stay informed — all in one place."],
      ["متابع على فيسبوك", "Facebook followers"], ["متابع على إنستجرام", "Instagram followers"], ["أماكن تدريب", "Training locations"], ["Steps في المنهج", "Curriculum Steps"],
      ["أبطالنا", "Our champions"], ["عبدالرحمن سامح", "Abdelrahman Sameh"],
      ["المركز الثاني عالمياً تحت 13 سنة في بطولة العالم للشطرنج بإسبانيا — إنجاز مشرّف يرفع اسم مصر.", "2nd place in the world (Under-13) at the World Chess Championship in Spain — a proud achievement for Egypt."],
      ["أماكن التدريب", "Training locations"], ["بندرّب في أكتر من مكان في القاهرة والجيزة — اسأل على أقرب مكان ليك ومواعيده.", "We train at several places in Cairo and Giza — ask about the nearest one and its schedule."],
      ["اسأل على المواعيد", "Ask about schedules"], ["الرحاب", "Al Rehab"], ["القطامية", "Katameya"], ["نادي الصيد - أكتوبر", "Shooting Club - October"], ["نادي الجزيرة", "Gezira Club"], ["نادي الصيد - الدقي", "Shooting Club - Dokki"],
      ["ليه الشطرنج لابنك؟", "Why chess for your child?"],
      ["الملعب ورقعة الشطرنج عالمين مختلفين، بس التفكير بيجمع بينهم. الشطرنج مش مجرد لعبة — ده تمرين للعقل بيبان أثره في المذاكرة وفي الحياة.", "The sports field and the chessboard are different worlds, but thinking connects them. Chess isn't just a game — it trains the mind, and it shows in studying and in life."],
      ["التركيز", "Focus"], ["الطفل اللي مشتت ومش بيركز في المذاكرة، الشطرنج بيعلّمه يركّز في حاجة واحدة لمدة طويلة.", "A distracted child who can't focus on studying learns, through chess, to concentrate on one thing for a long time."],
      ["اتخاذ القرار", "Decision-making"], ["كل نقلة قرار: بيتعلم يفكر قبل ما يتصرف، ويدوّر على الحل، ويخرج من المواقف الصعبة.", "Every move is a decision: they learn to think before acting, look for solutions and get out of tough situations."],
      ["الصبر والتخطيط", "Patience & planning"], ["بيتعلم يخطط لكذا خطوة قدام، ويستنى الفرصة الصح.", "They learn to plan several steps ahead and wait for the right moment."],
      ["الروح الرياضية", "Sportsmanship"], ["يكسب بتواضع، ويتعلم من خسارته، ويحترم منافسه.", "Win humbly, learn from losses and respect the opponent."],
      ["كود دعوة أدمن جديد", "New admin invite code"], ["كود دعوة كوتش جديد", "New coach invite code"],
      ["الأدمن بيشوف الحسابات والداشبورد المالي ويقدر يطلّع أكواد كوتش وأدمن. متأكد إنك عايز تعمل كود أدمن؟", "An admin can see the accounts and the finance dashboard and can create coach and admin codes. Create an admin code?"],
      ["كود دعوة الأدمن (يُستخدم مرة واحدة):", "Admin invite code (single use):"], ["كود دعوة الكوتش (يُستخدم مرة واحدة):", "Coach invite code (single use):"],
      ["اتنسخ تلقائياً. ابعته للشخص ده يدخل بـ «دخول الكوتش بجوجل» ويكتب الكود.", "Copied automatically. Send it to that person: they sign in with \"Coach — Google\" and enter the code."],
      ["أتممت 100% من الحضور! اختبار الترقية متاح الآن: 10 ألغاز حقيقية • دقيقة لكل لغز • الحل كامل لآخر نقلة • النجاح من 70% (محاولة واحدة)", "100% attendance! The promotion exam is open: 10 real puzzles • 1 minute each • full solution required • pass mark 70% (one attempt)"],
      ["جاري تجهيز ألغاز الاختبار...", "Preparing exam puzzles..."], ["ألغاز حقيقية •", "real puzzles •"], ["• دقيقة لكل لغز • لازم تكمّل الحل لآخر نقلة • النجاح من", "• 1 minute per puzzle • you must finish the full solution • pass mark"],
      ["تعذّر تحميل ألغاز الاختبار — اتأكد من الإنترنت وجرّب تاني.", "Couldn't load the exam puzzles — check your connection and try again."], ["المحاولة دي ما اتحسبتش.", "This attempt wasn't counted."], ["رجوع", "Back"],
      ["مبروك! نجحت في الاختبار", "Congratulations! You passed"], ["ما نجحتش المرة دي", "Not this time"], ["صح من", "correct out of"], ["• المطلوب", "• required"],
      ["اترقّيت لـ Step", "You've been promoted to Step"], ["وطلعتلك شهادة.", "and earned a certificate."], ["ابعت طلب إعادة الاختبار للكوتش من الصفحة الرئيسية.", "Send an exam retry request to your coach from the home page."],
      ["عرض الشهادة", "View certificate"], ["رجوع للرئيسية", "Back to home"], ["اختبار ترقية Step", "Promotion exam: Step"],
      ["نقلة صحيحة!", "Correct move!"], ["نقلة غلط", "Wrong move"], ["خلص الوقت", "Time's up"], ["إنهاء الاختبار", "End exam"],
      ["لو خرجت دلوقتي الألغاز اللي فاضلة هتتحسب غلط. متأكد؟", "If you leave now, the remaining puzzles count as wrong. Are you sure?"],
      ["قائمة الشرف", "Honor roll"], ["قائمة الشرف", "Honor roll"], ["أكتر الطلبة حلّاً للألغاز وكسباً للأدوار في ECA — وأعلى ستريك وصل له كل واحد.", "ECA's top students in puzzles solved and games won — with each one's best streak."],
      ["ترتيبك:", "Your rank:"], ["ترتيبك:", "Your rank:"], ["قائمة الشرف لسه بتتجهّز — بتتحدّث لما الكوتش يفتح المنصة.", "The honor roll is being prepared — it updates when the coach opens the platform."],
      ["أكتر الطلبة حلّاً للألغاز", "Most puzzles solved"], ["ألغاز اتحلّت", "Puzzles solved"], ["أعلى ستريك ألغاز", "Best puzzle streak"], ["لسه محدش حل ألغاز — ادخل ساحة التدريب وابدأ!", "No puzzles solved yet — open the Training Arena and start!"],
      ["أكتر الطلبة كسباً للأدوار", "Most games won"], ["أدوار كسبها", "Games won"], ["أعلى ستريك انتصارات", "Best win streak"], ["لسه محدش كسب دور — العب ضد الكمبيوتر أو لعبة البيادق!", "No games won yet — play the computer or the pawns game!"],
      ["أطول ستريك تمرين", "Longest training streak"], ["أطول سلسلة (يوم)", "Longest streak (days)"], ["السلسلة الحالية", "Current streak"], ["لسه مفيش أيام تمرين متسجلة.", "No training days recorded yet."],
      ["آخر تحديث:", "Last updated:"], ["(انت)", "(you)"],
      ["الألغاز = ألغاز ساحة التدريب + اللغز اليومي • الأدوار = ضد الكمبيوتر + لعبة البيادق • بيظهر أول", "Puzzles = Training Arena + daily puzzle • Games = vs computer + pawns game • Showing the top"], ["في كل قائمة.", "in each list."],
      ["شهاداتي", "My certificates"], ["كل شهاداتك محفوظة هنا — تقدر تفتحها وتحمّلها بالعربي أو الإنجليزي في أي وقت.", "All your certificates are saved here — open and download them in Arabic or English any time."],
      ["عربي", "Arabic"], ["لسه مفيش شهادات", "No certificates yet"], ["الشهادة بتطلعلك لما تنجح في امتحان ترقية أي Step.", "You get a certificate when you pass any Step's promotion exam."],
      ["الشهادة الجاية:", "Next certificate:"], ["الصفحة الرئيسية ←", "Home →"], ["فاضلك", "You have"], ["درس في Step", "lessons left in Step"], ["عشان يفتحلك امتحان الترقية.", "before the promotion exam opens."],
      ["ابعت طلب إعادة الاختبار للكوتش من الصفحة الرئيسية.", "Send an exam retry request to your coach from the home page."], ["متاح دلوقتي من الصفحة الرئيسية.", "is open now from the home page."], ["امتحان Step", "Exam of Step"],
      ["لغة الشهادة:", "Certificate language:"], ["طباعة / حفظ كملف PDF", "Print / save as PDF"], ["تنزيل كصورة جاهزة", "Download as image"],
      ["دقة حل الألغاز", "Puzzle accuracy"], ["إعادة متاحة", "Retry allowed"], ["لازم الكوتش يوافق عشان تعيد الاختبار.", "The coach must approve before you can retake the exam."],
      ["المحاولة رقم", "Attempt no."], ["الكوتش رفض طلب الإعادة اللي فات — راجع الدروس وابعت طلب تاني لما تكون جاهز.", "The coach declined your last retry request — review the lessons and send another when you're ready."],
      ["إلغاء الطلب", "Cancel request"], ["إرسال طلب إعادة تاني", "Send another retry request"], ["إرسال طلب إعادة الاختبار للكوتش", "Request an exam retry from the coach"], ["إرسال طلب إعادة الاختبار للكوتش", "Request an exam retry from the coach"],
      ["تم إرسال طلب الإعادة للكوتش وبانتظار الموافقة", "Retry request sent — waiting for the coach's approval"],
      ["الكوتش وافق على إعادة الاختبار (درجتك اللي فاتت", "The coach approved a retake (your previous score"], ["). بالتوفيق!", "). Good luck!"], ["إعادة اختبار Step", "Retake exam: Step"],
      ["تم إلغاء طلب الإعادة", "Retry request cancelled"], ["رفض طلب الإعادة؟ الطالب هيقدر يبعت طلب تاني بعد كده.", "Decline this retry request? The student can send another one later."], ["تم رفض طلب الإعادة", "Retry request declined"],
      ["طلبات إعادة اختبار الترقية بانتظار موافقتك", "Exam retry requests waiting for your approval"], ["فتح المتابعة ←", "Open tracker →"], ["✓ موافقة", "✓ Approve"], ["✗ رفض", "✗ Decline"], ["(الدرجة السابقة:", "(previous score:"],
      ["تم إرسال طلب إعادة الاختبار للمدرب المسؤول", "Retry request sent to your coach"], ["تمت الموافقة على إعادة الاختبار للطالب", "Retake approved for"],
      ["بيدقو", "Pawny"], ["سمسم", "Simsim"], ["ميمي", "Mimi"], ["كابتن زيزو", "Captain Zizo"], ["نورا", "Nora"], ["الحصان الأسود", "Black Knight"], ["الفيل الحكيم", "Wise Bishop"], ["الطابية الحديد", "Iron Rook"], ["الوزيرة", "The Queen"], ["الملك ECA", "King ECA"],
      ["لسه بيتعلم القطع بتتحرك ازاي — بيلعب أي نقلة تقريباً.", "Still learning how the pieces move — plays almost any move."], ["بيحب يهجم بس بينسى يحمي قطعه.", "Loves to attack but forgets to defend."],
      ["بتعرف الشوكة بالحصان، بس بتغلط كتير.", "Knows the knight fork, but makes lots of mistakes."], ["بيلعب بسرعة وبيستغل القطع السايبة.", "Plays fast and grabs loose pieces."],
      ["هادية ومنظمة — بتطوّر قطعها صح.", "Calm and organised — develops pieces properly."], ["بيعمل فخاخ وتكتيكات مفاجئة.", "Sets traps and surprise tactics."],
      ["بيخطط من بدري وبيسيطر على الأقطار.", "Plans early and controls the diagonals."], ["قوية في النهايات وما بتسيبش أي غلطة.", "Strong in endgames and never misses a mistake."],
      ["هجوم مستمر وحسابات عميقة — ركّز كويس.", "Non-stop attacks and deep calculation — stay focused."], ["أقوى بوت في الأكاديمية — للأبطال بس.", "The academy's strongest bot — champions only."],
      ["اختار البوت اللي هتلعب ضده", "Choose your opponent bot"], ["8 بوتات من الأسهل للأصعب — ابدأ من الأول وكل ما تكسب بوت جرّب اللي بعده.", "8 bots from easiest to hardest — start at the first and move up each time you win."],
      ["التقييم جنب كل بوت تقريبي للتوضيح بس.", "Ratings next to each bot are approximate."], ["أحسنت! كسبتني المرة دي", "Well done! You beat me this time"], ["كسبت المرة دي — جرّب تاني!", "I won this time — try again!"],
      ["تعادل! ماتش حلو", "A draw! Good game"], ["بفكّر...", "Thinking..."], ["كش!", "Check!"], ["دورك", "Your move"], ["يلا نلعب!", "Let's play!"], ["بيلعب...", "is moving..."],
      ["دور تاني مع", "Rematch vs"], ["اختار بوت تاني", "Pick another bot"], ["العب ضد البوت اللي بعده:", "Play the next bot:"], ["كسبت ضد", "You beat"], ["! برافو عليك", "! Well done"], ["كسب — جرّب تاني", "won — try again"],
      ["قاهر الجراند ماستر", "Grandmaster slayer"], ["اكسب ضد البوت «جراند ماستر»", "Beat the \"Grandmaster\" bot"],
      ["أنا مش شاطر أوي، مناسب جداً للمبتدئين. يلا نلعب!", "I'm not very good, perfect for beginners. Let's play!"], ["بلعب نقلات لطيفة ومناسبة للمبتدئين.", "I make friendly, beginner-friendly moves."],
      ["بحب المفاجآت وممكن أوقعك وانت مش واخد بالك!", "I love surprises and can catch you off guard!"], ["متوازن — مش سهل أوي ومش صعب أوي.", "I'm balanced — not too easy, but not too hard."],
      ["نقلاتي ممكن تفاجئ حتى اللاعبين اللي عندهم خبرة!", "My moves can surprise even seasoned players!"], ["بعرف استراتيجيات معقدة، جهّز نفسك!", "I know complex strategies, prepare yourself!"],
      ["صعب جداً وبنصب فخاخ لخصومي.", "I'm very challenging and lay traps for my opponents."], ["لاعب محترف — الأقوى بس هو اللي يقدر يكسبني.", "I'm an expert player — only the best can beat me."],
      ["داشبورد ولي الأمر", "Parent dashboard"], ["كل إحصائيات", "All statistics of"], ["في مكان واحد.", "in one place."], ["طباعة التقرير", "Print report"],
      ["أونلاين", "Online"], ["أوفلاين", "In-person"], ["التقييم العام للطالب", "Overall student rating"], ["شارة", "badges"],
      ["الدروس اللي حضرها في Step", "Lessons attended in Step"], ["الواجبات اللي حلّها", "Homework done"], ["دروس فاضلة للامتحان", "Lessons left before the exam"],
      ["التقدم في المنهج", "Curriculum progress"], ["الحضور (Step", "Attendance (Step"], ["الواجبات (Step", "Homework (Step"], ["الامتحان", "Exam"],
      ["نشاطه في ساحة التدريب", "Training Arena activity"], ["ضد الكمبيوتر: فوز / تعادل / خسارة", "Vs computer: win / draw / loss"], ["أطول سلسلة ألغاز صح", "Longest correct-puzzle streak"],
      ["أفضل نتيجة في تدريب الرؤية", "Best vision-training score"], ["لعبة البيادق: فوز / خسارة", "Pawns game: win / loss"],
      ["أيام تمرين ورا بعض دلوقتي:", "Current daily streak:"], ["• آخر تمرين:", "• Last practice:"], ["• عدد الأدوار:", "• Games played:"],
      ["الشهادات", "Certificates"], ["شهادة إتمام Step", "Completion certificate, Step"], ["لسه مفيش شهادات — الشهادة بتطلع بعد ما ينجح في امتحان الـ Step.", "No certificates yet — one is issued after passing a Step exam."],
      ["ملاحظات وتوصيات", "Notes & recommendations"], ["ملاحظة الكوتش:", "Coach's note:"], ["فاضله", "Remaining:"], ["درس عشان يقدر يدخل امتحان Step", "lessons before the exam of Step"],
      ["خلّص حضور كل دروس Step", "Attended all lessons of Step"], ["— امتحان الترقية متاح.", "— the promotion exam is open."], ["الواجبات محتاجة متابعة: حلّ", "Homework needs follow-up: done"],
      ["ملتزم في الواجبات", "Consistent with homework"], ["ما اتمرّنش النهاردة ولا امبارح على المنصة — شجّعه يتمرّن في ساحة التدريب.", "No practice today or yesterday — encourage some Training Arena practice."],
      ["بيتمرّن", "Practising"], ["يوم ورا بعض — كمّل!", "days in a row — keep going!"],
      ["سجّل دخولك بحسابك. ولي الأمر يتابع ابنه من «داشبورد ولي الأمر» جوه حساب الطالب.", "Log in with your account. Parents follow their child from \"Parent dashboard\" inside the student account."],
      ["داشبورد لولي الأمر جوه حساب الطالب فيه الحضور والواجبات والتقييم وكل إحصائياته.", "A parent dashboard inside the student account with attendance, homework, rating and all statistics."],
      ["ادخل على حساب ابنك ودوس «داشبورد ولي الأمر» — هتلاقي الحضور والواجبات والتقييم والامتحانات والشهادات ونشاطه في ساحة التدريب.", "Open your child's account and tap \"Parent dashboard\" — you'll find attendance, homework, rating, exams, certificates and Training Arena activity."],
      ["اختار وضع اللعب", "Choose a game mode"], ["أخبار الشطرنج في العالم", "Chess world news"], ["المصدر: The Week in Chess", "Source: The Week in Chess"]
    ].forEach(p => { if (!DICT.some(d => d[0] === p[0])) DICT.push(p); });
    DICT.sort((a, b) => b[0].length - a[0].length);
