// ECA — arena.js (اتفصل من index.html في eca-v3)
    const CHESS_JS_URL = "https://cdn.jsdelivr.net/npm/chess.js@1.0.0/+esm";
    const STOCKFISH_URL = "https://cdnjs.cloudflare.com/ajax/libs/stockfish.js/10.0.2/stockfish.js";   // Stockfish.js (GPL)
    const PIECE = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
    const FILES = "abcdefgh";
    // بوتات ساحة التدريب (من الأسهل للأصعب). ms = أقصى وقت تفكير بالملّي ثانية، rnd = نسبة النقلات العشوائية
    // التقييم تقريبي للتوضيح بس. الاسم والوصف والصورة تقدر تغيّرهم من هنا (img = مسار صورة اختياري)
    const LEVELS = [
      { name: "مبتدئ", elo: "~300", piece: "p", color: "#94a3b8", img: "img/bots/1.png", desc: "أنا مش شاطر أوي، مناسب جداً للمبتدئين. يلا نلعب!", skill: 0, depth: 1, ms: 60, rnd: .6 },
      { name: "متعلّم", elo: "~500", piece: "p", color: "#22c55e", img: "img/bots/2.png", desc: "بلعب نقلات لطيفة ومناسبة للمبتدئين.", skill: 1, depth: 2, ms: 100, rnd: .35 },
      { name: "متدرّب", elo: "~700", piece: "n", color: "#ec4899", img: "img/bots/3.png", desc: "بحب المفاجآت وممكن أوقعك وانت مش واخد بالك!", skill: 3, depth: 3, ms: 160, rnd: .15 },
      { name: "منافس", elo: "~900", piece: "n", color: "#f97316", img: "img/bots/4.png", desc: "متوازن — مش سهل أوي ومش صعب أوي.", skill: 5, depth: 4, ms: 220, rnd: .07 },
      { name: "استراتيجي", elo: "~1150", piece: "b", color: "#06b6d4", img: "img/bots/5.png", desc: "نقلاتي ممكن تفاجئ حتى اللاعبين اللي عندهم خبرة!", skill: 8, depth: 6, ms: 350, rnd: .02 },
      { name: "خبير", elo: "~1400", piece: "r", color: "#6366f1", img: "img/bots/6.png", desc: "بعرف استراتيجيات معقدة، جهّز نفسك!", skill: 11, depth: 9, ms: 550, rnd: 0 },
      { name: "أستاذ", elo: "~1700", piece: "q", color: "#d946ef", img: "img/bots/7.png", desc: "صعب جداً وبنصب فخاخ لخصومي.", skill: 15, depth: 12, ms: 800, rnd: 0 },
      { name: "جراند ماستر", elo: "2000+", piece: "k", color: "#d4af37", img: "img/bots/8.png", desc: "لاعب محترف — الأقوى بس هو اللي يقدر يكسبني.", skill: 20, depth: 18, ms: 1200, rnd: 0 }
    ];
    // صورة البوت: لو له صورة بنعرضها، غير كده دايرة بلونه وفيها قطعته
    function botAvatar(b, size) {
      size = size || 48;
      if (b.img) return `<img src="${esc(b.img)}" alt="" loading="lazy" class="rounded-full object-cover shrink-0 border-[3px] bg-white shadow-lg" style="width:${size}px;height:${size}px;border-color:${b.color}" />`;
      return `<div class="rounded-full shrink-0 flex items-center justify-center border-2 border-white/30 shadow-lg" style="width:${size}px;height:${size}px;background:radial-gradient(circle at 30% 30%, ${b.color}ee, ${b.color}88 60%, #050507)"><span style="font-size:${Math.round(size * .58)}px;line-height:1;color:#fff;text-shadow:0 1px 3px #000;font-family:'Segoe UI Symbol','DejaVu Sans',sans-serif">${PIECE[b.piece]}&#xFE0E;</span></div>`;
    }
    const PUZ_DIFF = [["daily", "لغز اليوم من Lichess"], ["easiest", "سهل جداً"],["easier", "سهل"], ["normal", "متوسط"], ["harder", "صعب"], ["hardest", "صعب جداً"]];
    const VIS_SECONDS = 30;

    const arena = {
      sub: "play",
      play: { game: null, level: 0, colorChoice: "w", color: "w", flip: false, sel: null, last: null, thinking: false, over: "" },
      puz: { game: null, sol: [], idx: 0, color: "w", flip: false, sel: null, last: null, flash: null, hint: null, status: "idle", diff: "easier", info: null, counted: false },
      vis: { active: false, target: "", score: 0, left: VIS_SECONDS, timer: null, attempts: [], coords: true, flip: false, flash: null, best: 0 }
    };
    const arenaRefresh = () => { if (tab === "arena") render(); };

    // ---------- تحميل مكتبة الشطرنج (أول مرة بس) ----------
    let ChessCls = null, chessLoading = false;
    function loadChess() {
      if (ChessCls || chessLoading) return;
      chessLoading = true;
      import(CHESS_JS_URL).then(m => { ChessCls = m.Chess; chessLoading = false; arenaRefresh(); })
        .catch(e => { chessLoading = false; console.error(e); toast("تعذّر تحميل مكتبة الشطرنج — اتأكد من الإنترنت"); });
    }

    // ---------- محرك Stockfish (Web Worker) ----------
    let sfWorker = null, sfPending = null, sfBusy = false, sfSkip = 0, sfFailed = false;
    function engine() {
      if (sfWorker || sfFailed) return sfWorker;
      try {
        sfWorker = new Worker(URL.createObjectURL(new Blob([`importScripts("${STOCKFISH_URL}");`], { type: "application/javascript" })));
        sfWorker.onmessage = e => {
          const m = String(e.data).match(/^bestmove\s+(\S+)/); if (!m) return;
          if (sfSkip > 0) { sfSkip--; return; }
          sfBusy = false; const cb = sfPending; sfPending = null; if (cb) cb(m[1]);
        };
        sfWorker.onerror = () => { sfFailed = true; sfWorker = null; sfBusy = false; const cb = sfPending; sfPending = null; if (cb) cb(null); };
        sfWorker.postMessage("uci");
      } catch (_) { sfFailed = true; sfWorker = null; }
      return sfWorker;
    }
    function engineMove(fen, lvl, cb) {
      const w = engine(); if (!w) return cb(null);
      if (sfBusy) { w.postMessage("stop"); sfSkip++; }
      sfBusy = true; sfPending = cb;
      w.postMessage("setoption name Skill Level value " + lvl.skill);
      w.postMessage("position fen " + fen);
      // حد أقصى للوقت: المحرك بيرد في وقت قصير ثابت بدل ما يقعد يحسب للعمق كله (ده اللي كان مخلّيه بطيء)
      w.postMessage("go depth " + lvl.depth + (lvl.ms ? " movetime " + lvl.ms : ""));
    }
    // تسخين المحرك أول ما الطالب يفتح «العب ضد الكمبيوتر» عشان أول نقلة ماتستناش تحميله
    function warmEngine() { const w = engine(); if (w && !w.__warm) { w.__warm = true; w.postMessage("isready"); } }

    // ---------- الرقعة ----------
    function targetsOf(g, sel) {
      const t = {}; if (!g || !sel) return t;
      g.moves({ square: sel, verbose: true }).forEach(m => { t[m.to] = m.captured ? "cap" : "mv"; });
      return t;
    }
    function boardHTML(o) {
      const g = o.game, b = g ? g.board() : null;
      let chk = null;
      if (g && g.inCheck()) b.forEach(row => row.forEach(p => { if (p && p.type === "k" && p.color === g.turn()) chk = p.square; }));
      let h = `<div class="eca-board mx-auto" dir="ltr">`;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const rank = o.flip ? r + 1 : 8 - r, file = o.flip ? 7 - c : c, sq = FILES[file] + rank;
        const p = b ? b[8 - rank][file] : null;
        const cls = ["eca-sq", (file + rank) % 2 === 0 ? "d" : "l"];
        if (o.last && o.last.includes(sq)) cls.push("last");
        if (o.sel === sq) cls.push("sel");
        if (o.hint === sq) cls.push("hint");
        if (chk === sq) cls.push("chk");
        if (o.flash && o.flash[sq]) cls.push(o.flash[sq]);
        if (o.targets && o.targets[sq]) cls.push(o.targets[sq]);
        let inner = p ? `<span class="eca-pc ${p.color}">${PIECE[p.type]}&#xFE0E;</span>` : "";
        if (o.coords !== false) {
          if (r === 7) inner += `<span class="eca-co f">${FILES[file]}</span>`;
          if (c === 0) inner += `<span class="eca-co r">${rank}</span>`;
        }
        h += `<div class="${cls.join(" ")}" data-sq="${sq}" onclick="${o.onClick}('${sq}')">${inner}</div>`;
      }
      return h + `</div>`;
    }
    // ضغطة على مربع: يا إما بتختار قطعة، يا إما بتحرّكها
    function pickOrMove(st, sq, myColor) {
      const g = st.game;
      if (st.sel) {
        const mv = g.moves({ square: st.sel, verbose: true }).find(m => m.to === sq);
        if (mv) { const from = st.sel; st.sel = null; return mv.promotion ? { from, to: sq, promotion: "q" } : { from, to: sq }; }
      }
      const p = g.get(sq);
      st.sel = p && p.color === myColor && g.turn() === myColor && st.sel !== sq ? sq : null;
      return null;
    }
    const lastOf = g => { const h = g.history({ verbose: true }); const m = h[h.length - 1]; return m ? [m.from, m.to] : null; };
    function uciMove(g, u) { return g.move(u.length > 4 ? { from: u.slice(0, 2), to: u.slice(2, 4), promotion: u[4] } : { from: u.slice(0, 2), to: u.slice(2, 4) }); }

    // إحصائيات الطالب بتتحفظ في حسابه (الكوتش بيشوفها في المتابعة)
    function recordArena(fn) {
      const u = currUser(); if (!u || u.role !== "student") return;
      u.arena = u.arena || {}; markActiveDay(u); fn(u.arena); save();
    }
    // أيام التمرين (لشارات الاستمرارية): بنسجّل النهاردة مرة واحدة
    function markActiveDay(u) {
      u.arena = u.arena || {};
      const d = todayISO(), days = u.arena.days = Array.isArray(u.arena.days) ? u.arena.days : [];
      if (!days.includes(d)) { days.push(d); if (days.length > 800) days.splice(0, days.length - 800); }
    }

    // ================= 1) العب ضد الكمبيوتر =================
    function playStart() {
      if (!ChessCls) return;
      const P = arena.play;
      P.game = new ChessCls(); P.over = ""; P.sel = null; P.last = null; P.thinking = false;
      P.color = P.colorChoice === "r" ? (Math.random() < .5 ? "w" : "b") : P.colorChoice;
      P.flip = P.color === "b";
      render();
      if (P.color === "b") playEngine();
    }
    function playClick(sq) {
      const P = arena.play; if (!P.game || P.over || P.thinking) return;
      const mv = pickOrMove(P, sq, P.color);
      if (mv) {
        let r = null; try { r = P.game.move(mv); } catch (_) {}
        if (r) { P.last = [r.from, r.to]; playCheckEnd(); if (!P.over) return playEngine(); }
      }
      arenaRefresh();
    }
    function playEngine() {
      const P = arena.play, g = P.game, lvl = LEVELS[P.level], fen = g.fen(), t0 = Date.now();
      P.thinking = true; arenaRefresh();
      const randomUci = () => { const ms = g.moves({ verbose: true }); const m = ms[Math.floor(Math.random() * ms.length)]; return m.from + m.to + (m.promotion || ""); };
      const apply = uci => {
        if (P.game !== g || g.fen() !== fen) return;                 // دور جديد أو تراجع
        let r = null; try { r = uciMove(g, uci || randomUci()); } catch (_) {}
        if (!r) try { r = uciMove(g, randomUci()); } catch (_) {}
        P.thinking = false; if (r) P.last = [r.from, r.to];
        playCheckEnd(); arenaRefresh();
      };
      const later = uci => setTimeout(() => apply(uci), Math.max(0, 350 - (Date.now() - t0)));   // أقل وقت عشان النقلة تبان طبيعية
      if (Math.random() < lvl.rnd) later(randomUci()); else engineMove(fen, lvl, later);
    }
    function playCheckEnd() {
      const P = arena.play, g = P.game;
      if (!g.isGameOver()) return;
      P.over = g.isCheckmate() ? (g.turn() === P.color ? "loss" : "win") : "draw";
      P.thinking = false;
      recordArena(a => {
        a.games = a.games || { w: 0, l: 0, d: 0 }; a.games[P.over[0] === "w" ? "w" : P.over[0] === "l" ? "l" : "d"]++;
        if (P.over === "win") a.bestWin = Math.max(a.bestWin || 0, P.level + 1);
        // ستريك الانتصارات ورا بعض (التعادل مابيقطعهوش، الخسارة بتصفّره)
        if (P.over === "win") { a.winStreak = (a.winStreak || 0) + 1; a.bestWinStreak = Math.max(a.bestWinStreak || 0, a.winStreak); }
        else if (P.over === "loss") a.winStreak = 0;
      });
      toast(P.over === "win" ? "كسبت ضد " + LEVELS[P.level].name + "! برافو عليك" : P.over === "loss" ? "" + LEVELS[P.level].name + " كسب — جرّب تاني" : "تعادل");
    }
    function playUndo() {
      const P = arena.play, g = P.game; if (!g || P.thinking || !g.history().length) return;
      g.undo(); if (g.turn() !== P.color && g.history().length) g.undo();
      P.over = ""; P.sel = null; P.last = lastOf(g); arenaRefresh();
    }
    function playResign() {
      const P = arena.play; if (!P.game || P.over) return;
      if (!confirm(trText("متأكد إنك عايز تستسلم؟"))) return;
      P.over = "loss"; P.thinking = false;
      recordArena(a => { a.games = a.games || { w: 0, l: 0, d: 0 }; a.games.l++; a.winStreak = 0; });
      arenaRefresh();
    }
    function playNew() { const P = arena.play; P.game = null; P.over = ""; P.sel = null; P.last = null; P.thinking = false; render(); }
    function botLine(b, P) {
      if (P.over === "win") return "أحسنت! كسبتني المرة دي";
      if (P.over === "loss") return "كسبت المرة دي — جرّب تاني!";
      if (P.over === "draw") return "تعادل! ماتش حلو";
      if (P.thinking) return "بفكّر...";
      if (P.game && P.game.inCheck() && P.game.turn() === P.color) return "كش!";
      return P.game && P.game.history().length ? "دورك" : "يلا نلعب!";
    }
    function arenaPlayHTML() {
      const P = arena.play, g = P.game, bot = LEVELS[P.level] || LEVELS[0];
      warmEngine();
      const pill = (v, label) => `<button onclick="arena.play.colorChoice='${v}'; render();" class="flex-1 py-2 rounded-xl text-xs font-bold border ${P.colorChoice === v ? 'border-yellow-400 text-yellow-300 bg-yellow-500/10' : 'border-zinc-800 text-gray-400'}">${label}</button>`;
      // قبل الدور: اختيار البوت
      if (!g) return `
        <div class="gold-card rounded-2xl p-5 space-y-4">
          <div>
            <h3 class="font-display font-bold text-lg text-yellow-400">اختار البوت اللي هتلعب ضده</h3>
            <p class="text-xs text-gray-400 mt-1">8 بوتات من الأسهل للأصعب — ابدأ من الأول وكل ما تكسب بوت جرّب اللي بعده.</p>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${LEVELS.map((b, i) => `
              <button onclick="arena.play.level=${i}; render();" class="eca-tile p-3 rounded-2xl text-center border-2 ${P.level === i ? 'bg-yellow-500/10' : 'bg-black/70 border-zinc-800'}" style="${P.level === i ? 'border-color:' + b.color : ''}">
                <div class="flex justify-center">${botAvatar(b, 56)}</div>
                <div class="text-sm font-bold text-white mt-2">${esc(b.name)}</div>
                <div class="text-[11px] font-bold" style="color:${b.color}" dir="ltr">${i + 1} • ${esc(b.elo)}</div>
              </button>`).join("")}
          </div>
          <div class="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-black/70 border border-yellow-500/20">
            ${botAvatar(bot, 64)}
            <div class="flex-1 min-w-[180px]">
              <div class="font-bold text-white">${esc(bot.name)} <span class="text-xs" style="color:${bot.color}" dir="ltr">(${esc(bot.elo)})</span></div>
              <p class="text-xs text-gray-400 mt-1">${esc(bot.desc)}</p>
            </div>
            <div class="w-full sm:w-auto sm:min-w-[260px] space-y-2">
              <div class="flex gap-2">${pill("w", "أبيض")}${pill("b", "أسود")}${pill("r", "عشوائي")}</div>
              <button onclick="playStart()" class="w-full py-3 rounded-xl text-sm gold-btn">ابدأ الدور</button>
            </div>
          </div>
          <p class="text-[10px] text-gray-500">التقييم جنب كل بوت تقريبي للتوضيح بس.</p>
        </div>`;
      const status = P.over === "win" ? "كسبت الدور!" : P.over === "loss" ? "خسرت الدور" : P.over === "draw" ? "الدور انتهى بالتعادل"
        : P.thinking ? "" + bot.name + " بيلعب..." : (g.inCheck() ? "كش! " : "") + "دورك — " + (P.color === "w" ? "انت بالأبيض" : "انت بالأسود");
      return `
        <div class="grid lg:grid-cols-5 gap-5">
          <div class="min-w-0 lg:col-span-3 gold-card rounded-2xl p-3 sm:p-5">
            ${boardHTML({ game: g, flip: P.flip, sel: P.sel, targets: targetsOf(g, P.sel), last: P.last, onClick: "playClick" })}
          </div>
          <div class="min-w-0 lg:col-span-2 space-y-4">
            <div class="gold-card rounded-2xl p-5 space-y-3">
              <div class="flex items-center gap-3">
                ${botAvatar(bot, 56)}
                <div class="min-w-0">
                  <div class="font-bold text-white">${esc(bot.name)} <span class="text-xs" style="color:${bot.color}" dir="ltr">(${esc(bot.elo)})</span></div>
                  <div class="mt-1 inline-block px-3 py-1 rounded-xl rounded-tr-none text-xs bg-white/10 text-gray-100 ${P.thinking ? 'animate-pulse' : ''}">${botLine(bot, P)}</div>
                </div>
              </div>
              <div class="text-sm font-bold ${P.over === 'win' ? 'text-emerald-300' : P.over === 'loss' ? 'text-red-300' : 'text-yellow-300'}">${status}</div>
              <div class="grid grid-cols-3 gap-2">
                <button onclick="playUndo()" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">تراجع</button>
                <button onclick="arena.play.flip=!arena.play.flip; render();" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">اقلب الرقعة</button>
                <button onclick="playResign()" ${P.over ? 'disabled' : ''} class="tap rounded-xl text-xs bg-red-500/20 border border-red-500/30 text-red-300 disabled:opacity-40">استسلام</button>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <button onclick="playStart()" class="tap rounded-xl text-xs gold-btn">دور تاني مع ${esc(bot.name)}</button>
                <button onclick="playNew()" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">اختار بوت تاني</button>
              </div>
              ${P.over === "win" && P.level < LEVELS.length - 1 ? `<button onclick="arena.play.level=${P.level + 1}; playStart();" class="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">العب ضد البوت اللي بعده: ${esc(LEVELS[P.level + 1].name)}</button>` : ''}
            </div>
            <div class="gold-card rounded-2xl p-4">
              <div class="text-xs font-bold text-yellow-400 mb-2">النقلات</div>
              ${movesListHTML(g)}
            </div>
          </div>
        </div>`;
    }

    // ================= 2) ألغاز على الرقعة (من Lichess) =================
    async function puzLoad() {
      const Z = arena.puz;
      if (!ChessCls || Z.status === "loading") return;
      Z.status = "loading"; Z.sel = null; Z.hint = null; Z.flash = null; arenaRefresh();
      try {
        const url = Z.diff === "daily" ? "https://lichess.org/api/puzzle/daily" : "https://lichess.org/api/puzzle/next?difficulty=" + encodeURIComponent(Z.diff);
        const r = await fetch(url, { headers: { Accept: "application/json" } });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json();
        const g = new ChessCls(); g.loadPgn(j.game.pgn);
        Object.assign(Z, { game: g, sol: j.puzzle.solution || [], idx: 0, color: g.turn(), flip: g.turn() === "b", last: lastOf(g), counted: false, status: "play",
          info: { id: String(j.puzzle.id).replace(/[^A-Za-z0-9]/g, ""), rating: Number(j.puzzle.rating) || 0, themes: (j.puzzle.themes || []).slice(0, 4).map(t => String(t).replace(/[^A-Za-z0-9]/g, "")) } });
      } catch (e) {
        // Lichess رافض (غالباً 429 من كتر الطلبات) → لغز من البنك اللي جوه الموقع بنفس الصعوبة
        console.warn("Lichess puzzle failed, using built-in bank:", e);
        try {
          const bank = await loadPuzzleBank();
          const pool = bank[Z.diff === "daily" ? "normal" : Z.diff] || [];
          const row = pool[Math.floor(Math.random() * pool.length)];
          const [id, fen, moves, rating] = row.split("|"), mv = moves.split(" ");
          const g = new ChessCls(fen), r0 = uciMove(g, mv[0]);
          Object.assign(Z, { game: g, sol: mv.slice(1), idx: 0, color: g.turn(), flip: g.turn() === "b", last: [r0.from, r0.to], counted: false, status: "play",
            info: { id: id.replace(/[^A-Za-z0-9]/g, ""), rating: Number(rating) || 0, themes: [] } });
        } catch (_) { Z.status = "error"; }
      }
      arenaRefresh();
    }
    function puzCount(solved) {
      const Z = arena.puz; if (Z.counted) return; Z.counted = true;
      if (Z.review && typeof reviewResult === "function") return reviewResult(Z.info && Z.info.id, solved);   // المراجعة مابتتحسبش في العدّادات
      const id = Z.info && Z.info.id; if (!id) return;          // من غير رقم لغز مانقدرش نسجّل محاولة
      recordAttempt("arena", id, solved, u => {
        const a = u.arena = u.arena || {}; markActiveDay(u);
        if (!solved && typeof reviewAdd === "function") reviewAdd(u, id, Z.info.rating);     // اللغز الغلط يدخل المراجعة
        a.puzTried = (a.puzTried || 0) + 1;
        if (solved) { a.puzSolved = (a.puzSolved || 0) + 1; a.puzStreak = (a.puzStreak || 0) + 1; a.puzBestStreak = Math.max(a.puzBestStreak || 0, a.puzStreak); }
        else a.puzStreak = 0;
      }).then(r => { if (!r.ok && r.code === "permission-denied") toast("اللغز ده اتحسب قبل كده — النتيجة مش هتتكرر"); });
    }
    function puzSolved() { const Z = arena.puz; Z.status = "solved"; Z.sel = null; puzCount(true); toast("برافو! اللغز اتحل"); }
    function puzClick(sq) {
      const Z = arena.puz, g = Z.game; if (Z.status !== "play" || !g) return;
      const mv = pickOrMove(Z, sq, Z.color);
      if (!mv) return arenaRefresh();
      const want = Z.sol[Z.idx] || "";
      let r = null; try { r = g.move(mv); } catch (_) {}
      if (!r) return arenaRefresh();
      // الترقية: لو النقلة صح بس الحل بيرقّي لقطعة غير الوزير، نصحّحها
      if (want.length === 5 && r.from + r.to === want.slice(0, 4) && r.promotion !== want[4]) { g.undo(); r = uciMove(g, want); }
      const ok = r.from + r.to + (r.promotion || "") === want || g.isCheckmate();
      Z.last = [r.from, r.to];
      if (!ok) {
        Z.status = "wrong"; Z.flash = { [r.to]: "bad" }; puzCount(false); arenaRefresh();
        setTimeout(() => { if (Z.game !== g) return; g.undo(); Z.flash = null; Z.last = lastOf(g); Z.status = "play"; arenaRefresh(); }, 750);
        return;
      }
      Z.idx++; Z.hint = null; Z.flash = { [r.to]: "good" };
      if (Z.idx >= Z.sol.length || g.isCheckmate()) { puzSolved(); return arenaRefresh(); }
      Z.status = "reply"; arenaRefresh();
      setTimeout(() => {
        if (Z.game !== g) return;
        try { const r2 = uciMove(g, Z.sol[Z.idx]); Z.last = [r2.from, r2.to]; } catch (_) {}
        Z.idx++; Z.flash = null; Z.status = "play";
        if (Z.idx >= Z.sol.length) puzSolved();
        arenaRefresh();
      }, 550);
    }
    function puzHint() { const Z = arena.puz; if (Z.status !== "play") return; Z.hint = (Z.sol[Z.idx] || "").slice(0, 2); Z.sel = null; puzCount(false); arenaRefresh(); }
    function puzShow() {
      const Z = arena.puz, g = Z.game; if (!g || (Z.status !== "play" && Z.status !== "wrong")) return;
      puzCount(false); Z.status = "shown"; Z.sel = null; Z.hint = null; Z.flash = null;
      const step = () => {
        if (Z.game !== g || Z.idx >= Z.sol.length) return arenaRefresh();
        try { const r = uciMove(g, Z.sol[Z.idx]); Z.last = [r.from, r.to]; } catch (_) {}
        Z.idx++; arenaRefresh(); setTimeout(step, 650);
      };
      step();
    }
    function arenaPuzHTML() {
      const Z = arena.puz;
      if (Z.status === "idle") setTimeout(puzLoad, 0);
      const busy = Z.status === "idle" || Z.status === "loading";
      const sideTxt = Z.color === "w" ? "انت بالأبيض" : "انت بالأسود";
      const status = busy ? "جاري تحميل لغز..." : Z.status === "error" ? "تعذّر تحميل اللغز — اتأكد من الإنترنت وجرّب تاني"
        : Z.status === "wrong" ? "مش دي النقلة — جرّب تاني" : Z.status === "reply" ? "صح! استنى رد الخصم..."
        : Z.status === "solved" ? "برافو! اللغز اتحل" : Z.status === "shown" ? "ده الحل — جرّب لغز جديد"
        : "لاقي أحسن نقلة — " + sideTxt;
      const u = currUser(), a = (u && u.role === "student" && u.arena) || {};
      return `
        <div class="grid lg:grid-cols-5 gap-5">
          <div class="min-w-0 lg:col-span-3 gold-card rounded-2xl p-3 sm:p-5">
            ${Z.game && !busy ? boardHTML({ game: Z.game, flip: Z.flip, sel: Z.sel, targets: targetsOf(Z.game, Z.sel), last: Z.last, flash: Z.flash, hint: Z.hint, onClick: "puzClick" })
              : `<div class="eca-board mx-auto items-center justify-center" style="display:flex"><span class="text-sm text-gray-400">${status}</span></div>`}
          </div>
          <div class="min-w-0 lg:col-span-2 space-y-4">
            <div class="gold-card rounded-2xl p-5 space-y-3">
              <div class="text-sm font-bold ${Z.status === 'solved' || Z.status === 'reply' ? 'text-emerald-300' : Z.status === 'wrong' || Z.status === 'error' ? 'text-red-300' : 'text-yellow-300'}">${status}</div>
              ${Z.info && !busy ? `<div class="flex flex-wrap gap-1.5 text-[11px]">
                <span class="px-2 py-0.5 rounded-lg bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">${Z.info.rating}</span>
                ${Z.info.themes.map(t => `<span dir="ltr" class="px-2 py-0.5 rounded-lg bg-zinc-900 text-gray-300 border border-zinc-800">${t}</span>`).join("")}
              </div>` : ''}
              <div class="grid grid-cols-3 gap-2">
                <button onclick="puzHint()" ${Z.status !== 'play' ? 'disabled' : ''} class="tap rounded-xl text-xs bg-zinc-900 border border-emerald-500/40 text-emerald-300 disabled:opacity-40">تلميح</button>
                <button onclick="puzShow()" ${Z.status !== 'play' && Z.status !== 'wrong' ? 'disabled' : ''} class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300 disabled:opacity-40">الحل</button>
                <button onclick="puzLoad()" ${busy ? 'disabled' : ''} class="tap rounded-xl text-xs gold-btn disabled:opacity-40">لغز جديد</button>
              </div>
              <label class="block text-xs text-gray-400">الصعوبة</label>
              <select onchange="arena.puz.diff=this.value; puzLoad();" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-sm text-yellow-300">
                ${PUZ_DIFF.map(([v, l]) => `<option value="${v}" ${Z.diff === v ? 'selected' : ''}>${l}</option>`).join("")}
              </select>
              ${typeof reviewBoxHTML === "function" ? reviewBoxHTML() : ""}
              ${Z.info && !busy ? `<a href="https://lichess.org/training/${Z.info.id}" target="_blank" rel="noopener" class="inline-block text-[11px] text-sky-400 hover:underline">فتح اللغز على Lichess ↗</a>` : ''}
            </div>
            ${u && u.role === "student" ? `<div class="gold-card rounded-2xl p-4 grid grid-cols-3 gap-2 text-center">
              <div><div class="text-lg font-extrabold text-emerald-300">${a.puzSolved || 0}</div><div class="text-[11px] text-gray-400">اتحلّت</div></div>
              <div><div class="text-lg font-extrabold text-yellow-300">${a.puzTried || 0}</div><div class="text-[11px] text-gray-400">جرّبت</div></div>
              <div><div class="text-lg font-extrabold text-sky-400">${a.puzStreak || 0}</div><div class="text-[11px] text-gray-400">ورا بعض</div></div>
            </div>` : ''}
            <p class="text-[11px] text-gray-500">الألغاز من قاعدة بيانات Lichess.org المفتوحة.</p>
          </div>
        </div>`;
    }

    // ================= 3) تدريب الرؤية (اعرف المربع) =================
    const randSq = () => FILES[Math.floor(Math.random() * 8)] + (1 + Math.floor(Math.random() * 8));
    function visStart() {
      const V = arena.vis;
      clearInterval(V.timer);
      Object.assign(V, { active: true, score: 0, attempts: [], left: VIS_SECONDS, target: randSq(), flash: null });
      V.timer = setInterval(() => {
        V.left--;
        const el = document.getElementById("visLeft"); if (el) el.textContent = V.left;
        if (V.left <= 0) visEnd();
      }, 1000);
      arenaRefresh();
    }
    function visEnd() {
      const V = arena.vis; clearInterval(V.timer); V.timer = null;
      if (!V.active) return;
      V.active = false; V.target = ""; V.best = Math.max(V.best, V.score);
      recordArena(a => { if (V.score > (a.visionBest || 0)) a.visionBest = V.score; });
      toast("خلص الوقت — نتيجتك: " + V.score);
      arenaRefresh();
    }
    function visClick(sq) {
      const V = arena.vis; if (!V.active) return;
      const ok = sq === V.target;
      V.attempts.unshift({ sq: V.target, ok }); if (ok) V.score++;
      V.flash = { [sq]: ok ? "good" : "bad" }; V.target = randSq();
      arenaRefresh();
      const f = V.flash; setTimeout(() => { if (V.flash === f) { V.flash = null; arenaRefresh(); } }, 260);
    }
    function arenaVisHTML() {
      const V = arena.vis, u = currUser();
      const best = Math.max(V.best, (u && u.role === "student" && u.arena && u.arena.visionBest) || 0);
      return `
        <div class="grid lg:grid-cols-5 gap-5">
          <div class="min-w-0 lg:col-span-3 gold-card rounded-2xl p-3 sm:p-5">
            ${boardHTML({ game: null, flip: V.flip, coords: V.coords, flash: V.flash, onClick: "visClick" })}
          </div>
          <div class="min-w-0 lg:col-span-2 space-y-4">
            <div class="gold-card rounded-2xl p-5 space-y-4 text-center">
              ${V.active ? `
                <div class="text-xs text-gray-400">اضغط على المربع ده بسرعة:</div>
                <div dir="ltr" class="vis-target gold-gradient-text eca-pop">${V.target}</div>
                <div class="flex justify-center gap-6 text-sm">
                  <div><b id="visLeft" class="text-yellow-300">${V.left}</b> <span class="text-gray-400 text-xs">ثانية</span></div>
                  <div><b class="text-emerald-300">${V.score}</b></div>
                </div>` : `
                <div class="text-sm text-gray-300">هيظهرلك اسم مربع (زي <b dir="ltr">e4</b>) — اضغط عليه على الرقعة. عندك ${VIS_SECONDS} ثانية.</div>
                ${V.attempts.length ? `<div class="text-lg font-bold text-emerald-300">آخر نتيجة: ${V.score}</div>` : ''}
                <button onclick="visStart()" class="w-full py-3 rounded-xl text-sm gold-btn">ابدأ</button>
                <div class="grid grid-cols-2 gap-2">
                  <button onclick="arena.vis.flip=!arena.vis.flip; render();" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">${V.flip ? 'من ناحية الأسود' : 'من ناحية الأبيض'}</button>
                  <button onclick="arena.vis.coords=!arena.vis.coords; render();" class="tap rounded-xl text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">${V.coords ? 'اخفي الإحداثيات' : 'اظهر الإحداثيات'}</button>
                </div>`}
              <div class="text-xs text-gray-400">أفضل نتيجة: <b class="text-yellow-300">${best}</b></div>
            </div>
            ${V.attempts.length ? `<div class="gold-card rounded-2xl p-4">
              <div dir="ltr" class="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                ${V.attempts.slice(0, 60).map(t => `<span class="px-2 py-0.5 rounded-lg text-xs font-bold ${t.ok ? 'bg-emerald-500/15 text-emerald-300' : 'bg-red-500/15 text-red-300'}">${t.ok ? '✓' : '✗'} ${t.sq}</span>`).join("")}
              </div>
            </div>` : ''}
          </div>
        </div>`;
    }

    // ================= الصفحة الرئيسية للساحة =================
    function renderArenaView(u) {
      if (arena.sub !== "vision") loadChess();
      const sub = arena.sub, a = (u.role === "student" && u.arena) || {}, gm = a.games || { w: 0, l: 0, d: 0 };
      const tb = (k, label) => `<button onclick="arena.sub='${k}'; render();" class="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold ${sub === k ? 'gold-btn' : 'bg-zinc-900 text-gray-300 border border-yellow-500/20'}">${label}</button>`;
      const body = sub === "vision" ? arenaVisHTML()
        : !ChessCls ? `<div class="gold-card rounded-2xl p-8 text-center text-sm text-gray-400">جاري تحميل الرقعة...</div>`
        : sub === "puzzles" ? arenaPuzHTML() : sub === "pawns" ? arenaPawnsHTML() : sub === "analysis" ? arenaAnaHTML() : arenaPlayHTML();
      return `
        <div class="space-y-5">
          <div class="gold-card rounded-2xl p-5 flex flex-wrap justify-between items-center gap-3">
            <div>
              <h2 class="font-display font-bold text-xl gold-gradient-text">ساحة التدريب</h2>
              <p class="text-xs text-gray-400 mt-1">العب ضد الكمبيوتر، حل ألغاز حقيقية على الرقعة، ودرّب عينك على المربعات.</p>
            </div>
            ${u.role === "student" ? `<div class="flex flex-wrap gap-2 text-[11px]">
              <span dir="ltr" class="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">${gm.w} ✓ · ${gm.d} = · ${gm.l} ✗</span>
              <span class="px-2.5 py-1 rounded-lg bg-yellow-500/15 text-yellow-300 border border-yellow-500/30">${a.puzSolved || 0}</span>
              <span class="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30">${a.visionBest || 0}</span>
            </div>` : ''}
          </div>
          <div class="flex flex-wrap gap-2 bg-black/60 p-2 rounded-2xl border border-yellow-500/20">
            ${tb("play", "العب ضد الكمبيوتر")}${tb("puzzles", "ألغاز على الرقعة")}${tb("pawns", "لعبة البيادق")}${tb("vision", "تدريب الرؤية")}${tb("analysis", "رقعة التحليل")}
          </div>
          <div class="flex flex-wrap items-center gap-3 text-[11px] text-gray-400">
            <span>ألوان الرقعة:</span>
            <label class="flex items-center gap-1">فاتح <input type="color" value="${boardColors.l}" onchange="setBoardColor('l', this.value)" class="w-8 h-6 rounded bg-transparent border-0 cursor-pointer" /></label>
            <label class="flex items-center gap-1">غامق <input type="color" value="${boardColors.d}" onchange="setBoardColor('d', this.value)" class="w-8 h-6 rounded bg-transparent border-0 cursor-pointer" /></label>
            ${BOARD_THEMES.map(t => `<button onclick="setBoardColor('l','${t[1]}'); setBoardColor('d','${t[2]}')" title="${t[0]}" class="w-6 h-6 rounded-md border border-yellow-500/30" style="background:linear-gradient(135deg, ${t[1]} 50%, ${t[2]} 50%)"></button>`).join("")}
          </div>
          ${body}
        </div>`;
    }

    // الكوتش يشوف نشاط الطالب في ساحة التدريب جوه صفحة المتابعة
    {
      const _prevTracker = renderTrackerView;
      renderTrackerView = function () {
        const html = _prevTracker();
        const students = db.users.filter(u => u.role === "student");
        const q = searchQ.toLowerCase();
        const filtered = students.filter(s => (grpFilter === "ALL" || s.group === grpFilter) && (!q || String(s.name || "").toLowerCase().includes(q) || String(s.username || "").toLowerCase().includes(q)));
        const sel = students.find(s => s.id === selStuId) || filtered[0];
        if (!sel) return html;
        const a = sel.arena || {}, gm = a.games || { w: 0, l: 0, d: 0 };
        return html + `
          <div class="gold-card rounded-2xl p-4 mt-4">
            <div class="text-xs font-bold text-yellow-300 mb-3">نشاط ${esc(sel.name)} في ساحة التدريب</div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div class="p-2 rounded-xl bg-black/70 border border-yellow-500/20"><div class="font-bold text-emerald-300">${gm.w} / ${gm.d} / ${gm.l}</div><div class="text-[11px] text-gray-400">فوز / تعادل / خسارة</div></div>
              <div class="p-2 rounded-xl bg-black/70 border border-yellow-500/20"><div class="font-bold text-yellow-300">${a.bestWin ? LEVELS[a.bestWin - 1].name : '—'}</div><div class="text-[11px] text-gray-400">أعلى مستوى كسبه</div></div>
              <div class="p-2 rounded-xl bg-black/70 border border-yellow-500/20"><div class="font-bold text-sky-400">${a.puzSolved || 0} / ${a.puzTried || 0}</div><div class="text-[11px] text-gray-400">ألغاز اتحلّت / جرّبها</div></div>
              <div class="p-2 rounded-xl bg-black/70 border border-yellow-500/20"><div class="font-bold text-white">${a.visionBest || 0}</div><div class="text-[11px] text-gray-400">أفضل نتيجة رؤية</div></div>
            </div>
          </div>`;
      };
    }

    // ترجمة نصوص الساحة للإنجليزي
    [
      ["ساحة التدريب", "Training Arena"], ["ساحة التدريب", "Training Arena"],
      ["العب ضد الكمبيوتر، حل ألغاز حقيقية على الرقعة، ودرّب عينك على المربعات.", "Play the computer, solve real puzzles on the board, and train your board vision."],
      ["العب ضد الكمبيوتر", "Play vs computer"], ["ألغاز على الرقعة", "Board puzzles"], ["تدريب الرؤية", "Vision training"],
      ["جاري تحميل الرقعة...", "Loading board..."], ["مستوى الكمبيوتر", "Computer level"],
      ["مبتدئ", "Novice"], ["متعلّم", "Learner"], ["متدرّب", "Apprentice"], ["منافس", "Challenger"], ["استراتيجي", "Strategist"], ["خبير", "Expert"], ["أستاذ", "Master"], ["جراند ماستر", "Grandmaster"],
      ["بيلعب نقلات عشوائية كتير — مناسب لأول مرة.", "Plays many random moves — great for a first game."],
      ["نقلات بسيطة وبيغلط كتير.", "Simple moves and frequent mistakes."], ["بيعرف يستغل الأخطاء الواضحة.", "Punishes obvious mistakes."],
      ["متوازن — مش سهل ومش صعب.", "Balanced — not too easy, not too hard."], ["بيخطط وبيعمل فخاخ بسيطة.", "Plans ahead and sets simple traps."],
      ["بيلعب تكتيك قوي — ركّز.", "Strong tactics — stay focused."], ["صعب جداً وبيعاقب على أي غلطة.", "Very tough; punishes every mistake."], ["أقوى مستوى — للأبطال بس.", "Strongest level — champions only."],
      ["أبيض", "White"], ["أسود", "Black"], ["عشوائي", "Random"],
      ["ابدأ الدور", "Start game"], ["دور جديد", "New game"], ["تراجع", "Undo"], ["اقلب الرقعة", "Flip board"], ["استسلام", "Resign"],
      ["النقلات", "Moves"], ["اختار المستوى واللون واضغط «ابدأ الدور».", "Pick a level and color, then press \"Start game\"."],
      ["كسبت الدور!", "You won!"], ["خسرت الدور", "You lost"], ["الدور انتهى بالتعادل", "The game is a draw"],
      ["الكمبيوتر بيفكر...", "Computer is thinking..."], ["كش! ", "Check! "], ["دورك — ", "Your move — "],
      ["انت بالأبيض", "you play White"], ["انت بالأسود", "you play Black"],
      ["كسبت! برافو عليك", "You won! Well done"], ["الكمبيوتر كسب — جرّب تاني", "The computer won — try again"], ["تعادل", "Draw"],
      ["متأكد إنك عايز تستسلم؟", "Are you sure you want to resign?"],
      ["جاري تحميل لغز...", "Loading puzzle..."], ["تعذّر تحميل اللغز — اتأكد من الإنترنت وجرّب تاني", "Couldn't load the puzzle — check your connection and retry"],
      ["مش دي النقلة — جرّب تاني", "Not the move — try again"], ["صح! استنى رد الخصم...", "Correct! Wait for the reply..."],
      ["برافو! اللغز اتحل", "Well done! Puzzle solved"], ["ده الحل — جرّب لغز جديد", "That's the solution — try a new puzzle"],
      ["لاقي أحسن نقلة — ", "Find the best move — "], ["تلميح", "Hint"], ["الحل", "Solution"], ["لغز جديد", "New puzzle"],
      ["الصعوبة", "Difficulty"], ["سهل جداً", "Easiest"], ["صعب جداً", "Hardest"], ["سهل", "Easy"], ["متوسط", "Normal"], ["صعب", "Hard"],
      ["فتح اللغز على Lichess ↗", "Open on Lichess ↗"], ["اتحلّت", "solved"], ["جرّبت", "tried"], ["ورا بعض", "streak"],
      ["الألغاز من قاعدة بيانات Lichess.org المفتوحة.", "Puzzles from the open Lichess.org database."], ["برافو! اللغز اتحل", "Well done! Puzzle solved"],
      ["اضغط على المربع ده بسرعة:", "Tap this square, fast:"], ["ثانية", "sec"], ["ابدأ", "Start"],
      ["هيظهرلك اسم مربع (زي", "A square name will appear (like"], ["— اضغط عليه على الرقعة. عندك", "— tap it on the board. You have"],
      ["آخر نتيجة:", "Last score:"], ["أفضل نتيجة:", "Best score:"], ["من ناحية الأسود", "Black's side"], ["من ناحية الأبيض", "White's side"],
      ["اخفي الإحداثيات", "Hide coordinates"], ["اظهر الإحداثيات", "Show coordinates"],
      ["خلص الوقت — نتيجتك: ", "Time's up — your score: "],
      ["نشاط", "Activity:"], ["في ساحة التدريب", "in the Training Arena"], ["فوز / تعادل / خسارة", "Win / Draw / Loss"], ["أعلى مستوى كسبه", "Highest level beaten"],
      ["ألغاز اتحلّت / جرّبها", "Puzzles solved / tried"], ["أفضل نتيجة رؤية", "Best vision score"],
      ["تعذّر تحميل مكتبة الشطرنج — اتأكد من الإنترنت", "Couldn't load the chess library — check your connection"]
    ].forEach(p => { if (!DICT.some(d => d[0] === p[0])) DICT.push(p); });
    DICT.sort((a, b) => b[0].length - a[0].length);
