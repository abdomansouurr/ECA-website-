    // ================= ساحة التدريب 2: سحب القطع، premoves، اللعب بالوقت، إنهاء اللعبة عند الخروج =================
    const aL = (a, e) => (typeof lang !== "undefined" && lang === "en") ? e : a;
    const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v; } catch (_) { return d; } };
    const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (_) {} };

    // ---------- 1) سحب القطع بالماوس أو باللمس (والضغطتين زي ما هم) ----------
    {
      let D = null;
      const endDrag = () => { if (D && D.ghost) D.ghost.remove(); if (D && D.s) D.s.classList.remove("dragsrc"); D = null; };
      document.addEventListener("pointerdown", e => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        const s = e.target.closest && e.target.closest(".eca-sq"); if (!s) return;
        const bd = s.closest(".eca-board[data-h]"); if (!bd) return;
        const pe = s.querySelector(".eca-pimg,.eca-pc"); if (!pe) return;
        endDrag(); D = { h: bd.dataset.h, from: s.dataset.sq, board: bd, s, pe, x: e.clientX, y: e.clientY, on: false, id: e.pointerId };
      }, true);
      document.addEventListener("pointermove", e => {
        if (!D || e.pointerId !== D.id) return;
        if (!D.on) {
          if (Math.hypot(e.clientX - D.x, e.clientY - D.y) < 8) return;
          D.on = true;
          const r = D.s.getBoundingClientRect(), g = D.pe.cloneNode(true);
          g.classList.remove("eca-slide"); g.classList.add("eca-ghost");
          g.style.cssText = "position:fixed;z-index:200;pointer-events:none;width:" + r.width + "px;height:" + r.height + "px;font-size:" + (r.width * .85) + "px;transform:translate(-50%,-50%) scale(1.12);filter:drop-shadow(0 6px 8px rgba(0,0,0,.45))";
          document.body.appendChild(g); D.ghost = g; D.s.classList.add("dragsrc");
        }
        D.ghost.style.left = e.clientX + "px"; D.ghost.style.top = e.clientY + "px";
        if (e.cancelable) e.preventDefault();
      }, true);
      document.addEventListener("pointerup", e => {
        if (!D || e.pointerId !== D.id) return;
        const d = D; if (!d.on) { D = null; return; }
        const sel = d.s.classList.contains("sel"); endDrag();
        const el = document.elementFromPoint(e.clientX, e.clientY), t = el && el.closest && el.closest(".eca-sq");
        if (!t || t.closest(".eca-board[data-h]") !== d.board || t.dataset.sq === d.from) return;   // رجّعها مكانها
        const fn = window[d.h]; if (typeof fn !== "function") return;
        window.__ecaNoAnim = true;                  // القطعة وصلت بإيد اللاعب، فمفيش انزلاق
        try { if (!sel) fn(d.from); fn(t.dataset.sq); } finally { window.__ecaNoAnim = false; }
      }, true);
      document.addEventListener("pointercancel", endDrag, true);
      window.addEventListener("blur", endDrag);
      // كليك يمين على رقعة اللعب = إلغاء الـ premove والاختيار
      document.addEventListener("contextmenu", e => {
        const bd = e.target.closest && e.target.closest('.eca-board[data-h="playClick"]'); if (!bd) return;
        e.preventDefault(); const P = arena.play; P.pre = null; P.sel = null; P.promo = null; arenaRefresh();
      });
    }

    // ---------- 2) اللعب ضد البوت: وقت + premoves + ترقية + إنهاء عند الخروج ----------
    const PLAY_TC = [[0, 0, "بدون وقت", "No clock"], [60, 0, "1+0", "1+0"], [180, 0, "3+0", "3+0"], [180, 2, "3+2", "3+2"], [300, 0, "5+0", "5+0"], [600, 0, "10+0", "10+0"], [900, 10, "15+10", "15+10"]];
    arena.play.tc = Math.min(PLAY_TC.length - 1, Number(lsGet("ECA_TC", "0")) || 0);
    arena.play.pre = null; arena.play.promo = null; arena.play.clk = null; arena.play.reason = "";
    const fmtClock = ms => { ms = Math.max(0, ms); if (ms < 10000) return (ms / 1000).toFixed(1); const s = Math.ceil(ms / 1000); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
    const clkRem = (P, c) => P.clk[c] - (P.game.turn() === c && !P.over ? Date.now() - P.clk.last : 0);
    function playClockSwitch(mover) {
      const P = arena.play, c = P.clk; if (!c) return;
      const now = Date.now(); c[mover] = Math.max(0, c[mover] - (now - c.last)) + P.inc * 1000; c.last = now;
    }
    // مفيش كش مات ممكن بالمادة اللي مع الطرف ده (ملك لوحده أو ملك + حصان/فيل)؟
    function noMatingMaterial(g, color) {
      let minors = 0;
      for (const row of g.board()) for (const p of row) { if (p && p.color === color && p.type !== "k") { if (p.type === "n" || p.type === "b") minors++; else return false; } }
      return minors <= 1;
    }
    function playFinish(over, reason) {
      const P = arena.play; if (P.over) return;
      P.over = over; P.reason = reason || ""; P.thinking = false; P.pre = null; P.sel = null; P.promo = null;
      recordArena(a => {
        a.games = a.games || { w: 0, l: 0, d: 0 }; a.games[over === "win" ? "w" : over === "loss" ? "l" : "d"]++;
        if (over === "win") a.bestWin = Math.max(a.bestWin || 0, P.level + 1);
        if (over === "win") { a.winStreak = (a.winStreak || 0) + 1; a.bestWinStreak = Math.max(a.bestWinStreak || 0, a.winStreak); }
        else if (over === "loss") a.winStreak = 0;
      });
      toast(reason === "left" ? aL("خرجت من الدور — اتحسب خسارة", "You left the game — counted as a loss")
        : over === "win" ? aL("كسبت ضد " + LEVELS[P.level].name + "! برافو عليك", "You won! Well done") : over === "loss" ? aL(LEVELS[P.level].name + " كسب — جرّب تاني", "You lost — try again") : aL("تعادل", "Draw"));
    }
    playCheckEnd = function () {
      const P = arena.play, g = P.game;
      if (!g || !g.isGameOver()) return;
      playFinish(g.isCheckmate() ? (g.turn() === P.color ? "loss" : "win") : "draw");
    };
    playStart = function () {
      if (!ChessCls) return;
      const P = arena.play, tc = PLAY_TC[P.tc] || PLAY_TC[0];
      P.game = new ChessCls(); P.over = ""; P.reason = ""; P.sel = null; P.last = null; P.thinking = false; P.pre = null; P.promo = null;
      P.color = P.colorChoice === "r" ? (Math.random() < .5 ? "w" : "b") : P.colorChoice; P.flip = P.color === "b";
      P.inc = tc[1]; P.clk = tc[0] ? { w: tc[0] * 1000, b: tc[0] * 1000, last: Date.now() } : null;
      render();
      if (P.color === "b") playEngine();
    };
    function playDo(mv) {
      const P = arena.play, g = P.game; let r = null;
      try { r = g.move(mv); } catch (_) {}
      if (!r) return arenaRefresh();
      P.last = [r.from, r.to]; P.sel = null; playClockSwitch(P.color); playCheckEnd();
      if (!P.over) return playEngine();
      arenaRefresh();
    }
    playClick = function (sq) {
      const P = arena.play, g = P.game; if (!g || P.over || P.promo) return;
      if (P.thinking) return playPremoveClick(sq);
      if (P.sel) {
        const m = g.moves({ square: P.sel, verbose: true }).find(m => m.to === sq && m.promotion);
        if (m) { P.promo = { from: P.sel, to: sq }; P.sel = null; return arenaRefresh(); }
      }
      const mv = pickOrMove(P, sq, P.color);
      if (mv) return playDo(mv);
      arenaRefresh();
    };
    function playPromote(t) { const P = arena.play; if (!P.promo) return; const m = P.promo; P.promo = null; playDo({ from: m.from, to: m.to, promotion: t }); }
    function playPromoCancel() { arena.play.promo = null; arenaRefresh(); }
    // premove: وانت مستني رد البوت اختار قطعتك ومربع الوصول، وهتتنفّذ أول ما البوت يلعب (لو لسه قانونية)
    function playPremoveClick(sq) {
      const P = arena.play, g = P.game, pc = g.get(sq), own = pc && pc.color === P.color;
      if (P.sel) { if (sq === P.sel) P.sel = null; else if (own) { P.sel = sq; P.pre = null; } else { P.pre = { from: P.sel, to: sq }; P.sel = null; } }
      else if (own) { P.sel = sq; P.pre = null; }
      else P.pre = null;
      arenaRefresh();
    }
    function playTryPremove() {
      const P = arena.play, g = P.game, p = P.pre; P.pre = null; if (!p) return false;
      let r = null; try { r = g.move({ from: p.from, to: p.to, promotion: "q" }); } catch (_) {}
      if (!r) return false;
      P.last = [r.from, r.to]; P.sel = null; playClockSwitch(P.color); playCheckEnd();
      if (!P.over) playEngine(); else arenaRefresh();
      return true;
    }
    playEngine = function () {
      const P = arena.play, g = P.game, lvl = LEVELS[P.level], fen = g.fen(), t0 = Date.now(), botC = P.color === "w" ? "b" : "w";
      P.thinking = true; arenaRefresh();
      const randomUci = () => { const ms = g.moves({ verbose: true }); const m = ms[Math.floor(Math.random() * ms.length)]; return m.from + m.to + (m.promotion || ""); };
      const apply = uci => {
        if (P.game !== g || g.fen() !== fen || P.over) return;                 // دور جديد أو تراجع أو خلص الوقت
        let r = null; try { r = uciMove(g, uci || randomUci()); } catch (_) {}
        if (!r) try { r = uciMove(g, randomUci()); } catch (_) {}
        P.thinking = false; if (r) { P.last = [r.from, r.to]; playClockSwitch(botC); }
        playCheckEnd();
        if (!P.over && P.pre && playTryPremove()) return;
        P.pre = null; arenaRefresh();
      };
      const later = uci => setTimeout(() => apply(uci), Math.max(0, 350 - (Date.now() - t0)));
      if (Math.random() < lvl.rnd) later(randomUci()); else engineMove(fen, lvl, later);
    };
    playUndo = function () {
      const P = arena.play, g = P.game; if (!g || P.thinking || !g.history().length) return;
      if (P.clk) return toast(aL("مفيش تراجع في الدور اللي بوقت", "No undo in timed games"));
      g.undo(); if (g.turn() !== P.color && g.history().length) g.undo();
      P.over = ""; P.sel = null; P.pre = null; P.promo = null; P.last = lastOf(g); arenaRefresh();
    };
    playResign = function () {
      const P = arena.play; if (!P.game || P.over) return;
      if (!confirm(trText("متأكد إنك عايز تستسلم؟"))) return;
      playFinish("loss", "resign"); arenaRefresh();
    };
    const _playNew = playNew; playNew = function () { const P = arena.play; P.pre = null; P.promo = null; P.clk = null; _playNew(); };

    // الدقّ بتاع الساعة (بيحدّث النص بس من غير ما يعيد رسم الرقعة، عشان السحب يفضل سلس)
    setInterval(() => {
      const P = arena.play;
      if (!P.game || !P.clk || P.over || tab !== "arena" || arena.sub !== "play") return;
      const turn = P.game.turn();
      ["w", "b"].forEach(c => {
        const rem = clkRem(P, c), el = document.getElementById("clk" + c);
        if (el) { el.textContent = fmtClock(rem); el.style.color = rem < 10000 ? "#f87171" : "#f3d266"; el.parentElement.style.boxShadow = turn === c ? "0 0 0 2px #d4af37" : "none"; }
      });
      if (clkRem(P, turn) <= 0) {
        P.clk[turn] = 0; P.clk.last = Date.now();
        const winner = turn === "w" ? "b" : "w";
        playFinish(noMatingMaterial(P.game, winner) ? "draw" : turn === P.color ? "loss" : "win", "time"); arenaRefresh();
      }
    }, 100);

    // لو اللاعب خرج من شاشة اللعب (تبويب تاني، ساحة تانية، خروج...) الدور بينتهي وبيتحسب عليه خسارة (لو كان لعب نقلة)
    function playGuard() {
      const P = arena.play; if (!P.game || P.over) return;
      if (tab === "arena" && arena.sub === "play") return;
      if (P.game.history().length) playFinish("loss", "left");
      P.game = null; P.over = ""; P.pre = null; P.promo = null; P.sel = null; P.thinking = false; P.clk = null;
    }
    { const _r = render; render = function () { playGuard(); return _r.apply(this, arguments); }; }
    window.addEventListener("pagehide", () => { const P = arena.play; if (P.game && !P.over && P.game.history().length) playFinish("loss", "left"); });
    window.addEventListener("beforeunload", e => { const P = arena.play; if (P.game && !P.over && P.game.history().length) { e.preventDefault(); e.returnValue = ""; } });

    // رقعة اللعب: الساعات + الـ premove + اختيار الترقية
    {
      const _bh = boardHTML;
      boardHTML = function (o) {
        if (o.onClick !== "playClick") return _bh(o);
        const P = arena.play, fl = Object.assign({}, o.flash || {});
        if (P.pre) { fl[P.pre.from] = "pre"; fl[P.pre.to] = "pre"; }
        let h = _bh(Object.assign({}, o, { flash: fl, targets: P.thinking ? null : o.targets }));
        if (P.promo) {
          const btn = t => `<button onclick="playPromote('${t}')" style="width:64px;height:64px;border-radius:14px;background:#f5ecd2;border:2px solid #d4af37;padding:4px"><img src="img/pieces/lichess/${P.color}${t.toUpperCase()}.svg" alt="${t}" style="width:100%;height:100%" /></button>`;
          h = `<div style="position:relative">${h}<div onclick="playPromoCancel()" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:10px;background:rgba(0,0,0,.6);border-radius:14px;z-index:20">${["q", "r", "b", "n"].map(btn).join("")}</div></div>`;
        }
        if (P.clk) {
          const bot = LEVELS[P.level] || LEVELS[0], top = P.flip ? "w" : "b", bot2 = top === "w" ? "b" : "w";
          const ck = c => `<div style="display:flex;align-items:center;justify-content:space-between;margin:6px 0;padding:6px 12px;border-radius:12px;background:#15110a;border:1px solid rgba(212,175,55,.35)"><span style="font-size:12px;font-weight:700;color:#e5e7eb">${c === P.color ? aL("انت", "You") : esc(bot.name)}</span><span id="clk${c}" dir="ltr" style="font-variant-numeric:tabular-nums;font-weight:800;font-size:22px;color:#f3d266">${fmtClock(clkRem(P, c))}</span></div>`;
          h = ck(top) + h + ck(bot2);
        }
        if (P.thinking && !P.over) h += `<div style="font-size:11px;color:#fb923c;text-align:center;margin-top:4px">${aL("تقدر تعمل premove: اختار قطعتك ومربع الوصول (كليك يمين يلغيه)", "You can premove: pick a piece and its target (right-click cancels)")}</div>`;
        return h;
      };
    }
    {
      const _ap = arenaPlayHTML;
      arenaPlayHTML = function () {
        let h = _ap(), P = arena.play;
        if (!P.game) {
          const tcb = PLAY_TC.map((t, i) => `<button onclick="arena.play.tc=${i}; lsSet('ECA_TC', ${i}); render();" class="px-3 py-1.5 rounded-lg text-xs font-bold border ${P.tc === i ? 'gold-btn' : 'bg-zinc-900 text-gray-300 border-yellow-500/20'}" dir="ltr">${aL(t[2], t[3])}</button>`).join("");
          h = h.replace('<button onclick="playStart()" class="w-full py-3 rounded-xl text-sm gold-btn">ابدأ الدور</button>',
            `<div><div class="text-[11px] text-gray-400 mb-1">${aL("الوقت", "Time control")}</div><div class="flex flex-wrap gap-1.5">${tcb}</div></div><button onclick="playStart()" class="w-full py-3 rounded-xl text-sm gold-btn">ابدأ الدور</button>`);
        } else {
          if (P.reason === "time") h = h.replace(">خسرت الدور<", ">" + aL("خسرت الدور — خلص وقتك", "You lost — out of time") + "<").replace(">كسبت الدور!<", ">" + aL("كسبت الدور — خلص وقت " + esc(LEVELS[P.level].name), "You won — opponent out of time") + "<");
        }
        return h;
      };
    }

    // ---------- 3) الألغاز بوقت ----------
    const PUZ_LIMITS = [[0, "بدون وقت", "No timer"], [15, "15 ثانية", "15 s"], [30, "30 ثانية", "30 s"], [60, "60 ثانية", "60 s"], [120, "دقيقتين", "2 min"]];
    arena.puz.limit = Number(lsGet("ECA_PUZLIM", "0")) || 0; arena.puz.deadline = 0; arena.puz.timedOut = false; arena.puz.leftMs = 0;
    { const _pl = puzLoad; puzLoad = function () { arena.puz.deadline = 0; arena.puz.timedOut = false; return _pl.apply(this, arguments); }; }
    setInterval(() => {
      const Z = arena.puz; if (tab !== "arena" || arena.sub !== "puzzles" || !Z.limit || !Z.game) return;
      const tid = Z.info && Z.info.id; if (Z._tid !== tid) { Z._tid = tid; Z.deadline = 0; Z.timedOut = false; Z.leftMs = Z.limit * 1000; }   // لغز جديد (حتى من المراجعة) = ساعة جديدة
      const live = Z.status === "play" || Z.status === "reply" || Z.status === "wrong", now = Date.now();
      if (live && !Z.deadline) Z.deadline = now + Z.limit * 1000;
      if (!Z.deadline) return;
      if (live) Z.leftMs = Math.max(0, Z.deadline - now);
      const bar = document.getElementById("puzBar"), sec = document.getElementById("puzSec");
      if (bar) { bar.style.width = (Z.leftMs / (Z.limit * 10)) + "%"; bar.style.background = Z.leftMs < 5000 ? "#ef4444" : "linear-gradient(90deg,#f3d266,#d4af37)"; }
      if (sec) sec.textContent = Math.ceil(Z.leftMs / 1000);
      if (Z.status === "play" && Z.leftMs <= 0 && !Z.timedOut) { Z.timedOut = true; puzShow(); }       // خلص الوقت = اللغز اتحسب غلط والحل بيتعرض
    }, 100);
    {
      const _az = arenaPuzHTML;
      arenaPuzHTML = function () {
        let h = _az(), Z = arena.puz;
        const opts = PUZ_LIMITS.map(l => `<option value="${l[0]}" ${Z.limit === l[0] ? "selected" : ""}>${aL(l[1], l[2])}</option>`).join("");
        h = h.replace('<label class="block text-xs text-gray-400">الصعوبة</label>',
          `<label class="block text-xs text-gray-400">${aL("وقت اللغز", "Puzzle timer")}</label><select onchange="arena.puz.limit=Number(this.value); lsSet('ECA_PUZLIM', this.value); arena.puz.deadline=0; arena.puz.leftMs=0; render();" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-sm text-yellow-300">${opts}</select><label class="block text-xs text-gray-400">الصعوبة</label>`);
        if (Z.limit && Z.game && Z.status !== "idle" && Z.status !== "loading") {
          const left = Z.deadline ? Z.leftMs : Z.limit * 1000;
          h = h.replace('<div class="grid grid-cols-3 gap-2">', `<div class="flex items-center gap-3"><div class="eval-bar flex-1" style="height:10px"><div id="puzBar" style="width:${left / (Z.limit * 10)}%; background:linear-gradient(90deg,#f3d266,#d4af37)"></div></div><div class="text-sm font-extrabold text-yellow-300 w-10 text-center"><span id="puzSec">${Math.ceil(left / 1000)}</span></div></div><div class="grid grid-cols-3 gap-2">`);
        }
        if (Z.timedOut) h = h.replace("ده الحل — جرّب لغز جديد", aL("خلص الوقت! ده الحل — جرّب لغز جديد", "Time's up! Here is the solution — try a new puzzle"));
        return h;
      };
    }
