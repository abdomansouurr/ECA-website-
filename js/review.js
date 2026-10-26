// ECA — review.js: مراجعة الألغاز الغلط بالتكرار المتباعد (Leitner) — eca-v7
// اللغز اللي الطالب غلط فيه في الساحة بيرجعله بعد يوم، ولو حله صح بيبعد: 3 ← 7 ← 14 ← 30 يوم، وبعدها «اتقن».
// المراجعة تمرين بس: مابتغيّرش عدّادات الألغاز ولا الـ XP (والقواعد كده كده بترفض إعادة نفس اللغز).
// بيعتمد على: arena, ChessCls, lastOf, uciMove, arenaRefresh, loadPuzzleBank (arena/core)

    const REV_GAPS = [1, 3, 7, 14, 30];
    const REV_MAX = 150;
    function revDate(days) { const d = new Date(); d.setDate(d.getDate() + days); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
    function revList(u) { return Object.entries((u && u.review) || {}).map(([id, r]) => ({ id, d: r.d, b: r.b || 0 })).sort((a, b) => a.d.localeCompare(b.d)); }
    function revDue(u) { const t = todayISO(); return revList(u).filter(x => x.d <= t); }

    // بتتنادى من جوه puzCount (نفس عملية تسجيل المحاولة)
    function reviewAdd(u, id, rating) {
      id = String(id || "").replace(/[^A-Za-z0-9]/g, ""); if (!id) return;
      u.review = u.review || {};
      u.review[id] = { d: revDate(REV_GAPS[0]), b: 0 };
      const ids = Object.keys(u.review);
      if (ids.length > REV_MAX) revList(u).slice(0, ids.length - REV_MAX).forEach(x => delete u.review[x.id]);
    }
    function reviewResult(id, solved) {
      const u = currUser(); if (!u || u.role !== "student" || !id) return;
      u.review = u.review || {};
      const cur = u.review[id] || { b: 0 };
      if (solved) {
        const b = (cur.b || 0) + 1;
        if (b >= REV_GAPS.length) { delete u.review[id]; toast("اتقنت اللغز ده — خرج من المراجعة"); }
        else { u.review[id] = { d: revDate(REV_GAPS[b]), b }; toast(LR(`صح! هيرجعلك بعد ${REV_GAPS[b]} يوم`, `Correct! It comes back in ${REV_GAPS[b]} days`)); }
      } else { u.review[id] = { d: revDate(REV_GAPS[0]), b: 0 }; }
      if (typeof markActiveDay === "function") markActiveDay(u);
      save();
    }
    const LR = (ar, en) => lang === "en" ? en : ar;

    // تحميل لغز المراجعة: من Lichess بالرقم، ولو مش متاح من البنك اللي جوه الموقع
    async function reviewLoad() {
      const Z = arena.puz, u = currUser();
      const due = revDue(u);
      if (!due.length) { Z.review = false; toast("خلّصت المراجعة — مفيش ألغاز مستحقة"); return puzLoad(); }
      if (!ChessCls || Z.status === "loading") return;
      const id = due[0].id;
      Z.status = "loading"; Z.sel = null; Z.hint = null; Z.flash = null; Z.review = true; arenaRefresh();
      const done = (g, sol, last, rating, themes) => Object.assign(Z, { game: g, sol, idx: 0, color: g.turn(), flip: g.turn() === "b", last, counted: false, status: "play", review: true,
        info: { id, rating: Number(rating) || 0, themes: themes || [] } });
      try {
        const r = await fetch("https://lichess.org/api/puzzle/" + encodeURIComponent(id), { headers: { Accept: "application/json" } });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const j = await r.json(), g = new ChessCls(); g.loadPgn(j.game.pgn);
        done(g, j.puzzle.solution || [], lastOf(g), j.puzzle.rating, (j.puzzle.themes || []).slice(0, 4).map(t => String(t).replace(/[^A-Za-z0-9]/g, "")));
      } catch (e) {
        try {
          const bank = await loadPuzzleBank();
          const row = Object.values(bank).flat().find(x => x.split("|")[0] === id);
          if (!row) throw new Error("not in bank");
          const [, fen, moves, rating] = row.split("|"), mv = moves.split(" ");
          const g = new ChessCls(fen), r0 = uciMove(g, mv[0]);
          done(g, mv.slice(1), [r0.from, r0.to], rating, []);
        } catch (_) {
          // اللغز مش متاح خالص → نشيله من المراجعة ونكمّل
          if (u && u.review) { delete u.review[id]; save(); }
          Z.status = "idle"; Z.review = false; return reviewLoad();
        }
      }
      arenaRefresh();
    }
    function reviewStart() { arena.puz.counted = true; reviewLoad(); }

    // puzLoad العادي بيخرج من وضع المراجعة
    {
      const _pl = puzLoad;
      puzLoad = function () { arena.puz.review = false; return _pl.apply(this, arguments); };
    }

    // الصندوق اللي جوه شاشة الألغاز
    function reviewBoxHTML() {
      const u = currUser(); if (!u || u.role !== "student") return "";
      const Z = arena.puz, due = revDue(u), all = revList(u);
      if (Z.review) return `<div class="rounded-xl bg-sky-500/10 border border-sky-500/40 p-3 space-y-2">
        <div class="text-xs font-bold text-sky-300">${LR("وضع المراجعة", "Review mode")} — ${LR(`فاضل ${Math.max(0, due.length - (Z.counted ? 0 : 1))} بعد ده`, `${Math.max(0, due.length - (Z.counted ? 0 : 1))} left after this`)}</div>
        <div class="flex gap-2">
          <button onclick="reviewLoad()" ${Z.status === "loading" ? "disabled" : ""} class="tap flex-1 rounded-xl text-xs bg-sky-500/20 text-sky-200 border border-sky-500/50 disabled:opacity-40">${LR("اللي بعده", "Next")}</button>
          <button onclick="puzLoad()" class="tap px-3 rounded-xl text-xs bg-zinc-900 text-gray-300 border border-zinc-700">${LR("خروج", "Exit")}</button>
        </div>
      </div>`;
      if (!all.length) return `<p class="text-[11px] text-gray-500">${LR("الألغاز اللي تغلط فيها هترجعلك هنا للمراجعة.", "Puzzles you miss will come back here for review.")}</p>`;
      return `<div class="rounded-xl bg-black/50 border border-sky-500/30 p-3 flex items-center justify-between gap-2">
        <div class="text-xs"><b class="text-sky-300">${LR("مراجعة الغلطات", "Review mistakes")}</b>
          <div class="text-[11px] text-gray-400">${due.length ? LR(`${due.length} لغز مستحق النهاردة`, `${due.length} due today`) : LR(`الجاي يوم ${all[0].d}`, `next on ${all[0].d}`)} • ${LR(`${all.length} في المراجعة`, `${all.length} in review`)}</div></div>
        ${due.length ? `<button onclick="reviewStart()" class="tap px-3 rounded-xl text-xs bg-sky-500/20 text-sky-200 border border-sky-500/50">${LR("ابدأ", "Start")}</button>` : ""}
      </div>`;
    }

    DICT.push(
      ["اتقنت اللغز ده — خرج من المراجعة", "Mastered — removed from review"],
      ["خلّصت المراجعة — مفيش ألغاز مستحقة", "Review done — nothing due"]
    );
    DICT.sort((a, b) => b[0].length - a[0].length);
