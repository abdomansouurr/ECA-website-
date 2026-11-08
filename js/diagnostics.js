// ECA — diagnostics.js: فحص النظام (قراية بس). بيتحمّل وقت الطلب: window.runSystemDiagnostics()
// أو زرار «🩺 فحص النظام» في مركز الكوتش. مفيش أي كتابة في قاعدة البيانات: الرحلة الكاملة اللي بتكتب
// (واجب، جوايز، دوجو، زعيم، تقرير) بتتجرّب على المحاكي بـ npm run test:e2e.

(function () {
  const DL = (ar, en) => lang === "en" ? en : ar;
  const results = [];
  const add = (area, name, ok, detail) => results.push({ area, check: name, result: ok === null ? "INFO" : ok ? "PASS" : "FAIL", detail: detail === undefined ? "" : String(detail).slice(0, 160) });
  const isInt = v => Number.isInteger(v) && v >= 0;
  const denied = r => !r.ok && r.code === "permission-denied";

  async function checkApp(u) {
    add("app", "version", null, window.ECA_VERSION);
    add("app", "signed in and loaded", !!u && !window.__authLoading, u ? u.role : "signed out");
    add("app", "service worker", null, navigator.serviceWorker && navigator.serviceWorker.controller ? "active" : "not active (first visit or private window)");
    const fb = ["fbEconomy", "fbChest", "fbBoardWatch", "fbEliteTop", "fbSendEmote", "fbEmoteWatch", "fbFriendCreate", "fbWeeklyWatch", "fbVaultList", "fbBossMine", "fbBossHit", "fbBossWatchAll", "fbDropSend", "fbDropWatch", "fbReportData", "fbDiagRead"];
    const missingFb = fb.filter(n => typeof window[n] !== "function");
    add("app", "Firebase functions ready", !missingFb.length, missingFb.join(", ") || fb.length + " functions");
    const views = ["render", "renderArenaView", "arenaBossHTML", "arenaLessonsHTML", "renderCommandView", "renderParentReport", "ecaPzSetup", "ecaPzPlay", "ecaOpenChest", "ecaSpinOpen", "ecaEliteClass", "ecaEmoteButton", "ecaMotifCount", "ecaHudUpdate", "ecaMilestone", "loadPuzzleBank", "loadThemeBank", "lpDailyLesson"];
    const missingViews = views.filter(n => typeof window[n] !== "function");
    add("app", "site modules loaded", !missingViews.length, missingViews.join(", ") || views.length + " functions");
    const ids = ["mainView", "navButtons", "acctButtons"].concat(u && u.role === "student" ? ["ecaHud"] : []);
    const missingIds = ids.filter(id => !document.getElementById(id));
    add("app", "page elements", !missingIds.length, missingIds.join(", ") || ids.join(", "));
  }

  function checkListeners(u) {
    if (typeof window.ecaListeners !== "function") return add("listeners", "listener manager", false, "ecaListeners missing");
    const list = window.ecaListeners(), count = {};
    list.forEach(l => { count[l.name] = (count[l.name] || 0) + 1; });
    const dup = Object.keys(count).filter(n => count[n] > 1);
    add("listeners", "no duplicate listeners", !dup.length, dup.length ? dup.map(n => n + " ×" + count[n]).join(", ") : list.map(l => l.name).join(", "));
    const staffCore = u && u.role !== "student" ? 8 : 0;
    add("listeners", "open listeners stay small", list.length <= 10 + staffCore, list.length + " open");
    const offView = { leaderboard: tab !== "honor", duelLobby: !(tab === "arena" && arena.sub === "duel"), speedArenaBoard: !(tab === "arena" && arena.sub === "speed"), friendDuel: !(tab === "arena" && arena.sub === "friend"), assignments: tab !== "command" };
    const leaks = list.map(l => l.name).filter(n => offView[n]);
    add("listeners", "no listeners for closed views", !leaks.length, leaks.join(", ") || "ok");
  }

  async function checkBanks() {
    try {
      const bank = await loadPuzzleBank(), n = Object.values(bank).reduce((s, l) => s + l.length, 0);
      add("puzzles", "exam puzzle bank", n >= 500, n + " puzzles");
    } catch (e) { add("puzzles", "exam puzzle bank", false, e && e.message); }
    try {
      const tb = await loadThemeBank(), themes = Object.keys(tb.themes || {}), n = themes.reduce((s, t) => s + tb.themes[t].reduce((x, l) => x + l.length, 0), 0);
      add("puzzles", "lesson puzzle bank", themes.length >= 30 && n >= 3000, themes.length + " themes, " + n + " puzzles");
      const lessons = Object.keys(typeof ECA_LESSON_THEMES === "object" ? ECA_LESSON_THEMES : {}), empty = lessons.filter(k => !ECA_LESSON_THEMES[k].some(t => (tb.themes[t] || []).some(l => l.length)));
      add("puzzles", "every lesson has puzzles", !empty.length, empty.join(", ") || lessons.length + " lessons");
      if (typeof ChessCls !== "undefined" && ChessCls) {
        let bad = 0, tried = 0;
        themes.forEach(t => tb.themes[t].forEach(level => level.slice(0, 1).forEach(row => {
          tried++;
          const [, fen, moves] = row.split("|");
          try { const g = new ChessCls(fen); moves.split(" ").forEach(m => { if (!g.move({ from: m.slice(0, 2), to: m.slice(2, 4), promotion: m[4] })) throw 0; }); } catch (_) { bad++; }
        })));
        add("puzzles", "sample puzzles play legally", !bad, (tried - bad) + "/" + tried);
      } else add("puzzles", "sample puzzles play legally", null, DL("افتح ساحة التدريب مرة عشان مكتبة الشطرنج تتحمّل", "open the training arena once to load the chess library"));
    } catch (e) { add("puzzles", "lesson puzzle bank", false, e && e.message); }
  }

  async function checkStudent(u) {
    const a = u.arena || {}, shop = u.shop || {};
    add("profile", "stars and XP are whole numbers", isInt(Number(a.stars || 0)) && isInt(Number(a.xp || 0)), "⭐ " + (a.stars || 0) + " • XP " + (a.xp || 0));
    add("profile", "chest XP is inside total XP", (Number(a.chx) || 0) <= (Number(a.xp) || 0), "chx " + (a.chx || 0));
    const cards = Array.isArray(a.cards) ? a.cards : [], bad = cards.filter(c => !(typeof ECA_CARDS !== "undefined" && ECA_CARDS.some(x => x.id === c)) || ((a.mot || {})[c] || {}).s < 10);
    add("profile", "tactic cards match the solves", !bad.length, bad.join(", ") || cards.length + " cards");
    const days = k => Object.keys(a[k] || {}).length;
    add("profile", "training logs stay small", days("tm") <= 70 && days("ps") <= 70, "time " + days("tm") + " days • puzzles " + days("ps") + " days");
    add("profile", "streak freezes within limits", (Number(shop.freezes) || 0) <= 2, shop.freezes || 0);
    const hud = document.getElementById("ecaHudStars");
    add("HUD", "HUD shows the saved stars", !!hud && hud.textContent.includes(String(Number(a.stars) || 0)), hud ? hud.textContent : "no HUD");
    const row = await window.fbDiagRead("leaderboard/" + u.id, { data: true });
    if (row.ok && row.exists) add("leaderboard", "leaderboard XP leaves chest XP out", Number(row.data.xp) === (Number(a.xp) || 0) - (Number(a.chx) || 0), "board " + row.data.xp);
    else add("leaderboard", "leaderboard row", null, row.ok ? DL("لسه ما اتنشرش", "not published yet") : row.code);
    // القراية المسموحة
    for (const [name, path, opts] of [
      ["own receipts", "users/" + u.id + "/economy", {}], ["mistake vault", "users/" + u.id + "/mistakeVault", {}], ["live drops inbox", "liveDrops/" + u.id + "/drops", {}],
      ["notifications", "users/" + u.id + "/notifications", {}], ["group homework", "assignments", { where: ["group", u.group || "-"] }]
    ]) { const r = await window.fbDiagRead(path, opts); add("rules", "can read " + name, r.ok, r.ok ? r.n + " docs" : r.code); }
    // القراية الممنوعة
    const other = ((await window.fbDiagRead("leaderboard", { limit: 5 })).ids || []).find(id => id !== u.id);
    for (const [name, path, opts] of [
      ["finance", "finance/" + u.id, {}], ["all homework", "assignments", {}], ["staff list", "staff/" + (other || "x"), {}],
      ...(other ? [["another student's profile", "users/" + other, {}], ["another student's receipts", "users/" + other + "/economy", {}], ["another student's drops", "liveDrops/" + other + "/drops", {}]] : [])
    ]) { const r = await window.fbDiagRead(path, opts); add("rules", "blocked: " + name, denied(r), r.ok ? DL("اتقرا! ده غلط", "was readable!") : r.code); }
    const list = (arena.boss && arena.boss.list) || [], broken = list.filter(b => (b.solved || []).some(p => !b.puzzles.includes(p)) || b.solved.length > b.puzzles.length);
    add("boss", "boss HP matches the solves", !broken.length, list.length + " homework");
    try { const C = prCompute(u); add("parent report", "report numbers compute", Array.isArray(C.weeks) && C.weeks.length === 8, "this week " + prDuration(C.cur.secs) + " • " + C.motifs.length + " motifs"); }
    catch (e) { add("parent report", "report numbers compute", false, e && e.message); }
  }

  async function checkStaff(u) {
    const studs = (db.users || []).filter(x => x.role === "student");
    add("data", "students loaded", studs.length > 0, studs.length + " students");
    for (const [name, path, opts] of [["all homework", "assignments", { limit: 5 }], ["groups", "meta/groups", {}], ["attendance", "attendance", { limit: 1 }]]) {
      const r = await window.fbDiagRead(path, opts); add("rules", "can read " + name, r.ok, r.ok ? (r.n === undefined ? (r.exists ? "exists" : "missing") : r.n + " docs") : r.code);
    }
    const s = studs[0];
    if (s) {
      for (const [name, path] of [["a student's receipts", "users/" + s.id + "/economy"], ["a student's mistake vault", "users/" + s.id + "/mistakeVault"], ["a student's drops", "liveDrops/" + s.id + "/drops"]]) {
        const r = await window.fbDiagRead(path, {}); add("rules", "can read " + name, r.ok, r.ok ? r.n + " docs" : r.code);
      }
      try { const d = await window.fbReportData(s.id, s.group || ""); add("parent report", "report data loads", !!d && d.vault !== null && d.drops !== null, d ? `vault ${d.vault ? d.vault.total : "—"} • drops ${d.drops ? d.drops.length : "—"} • homework ${d.bosses ? d.bosses.length : "—"}` : "null"); }
      catch (e) { add("parent report", "report data loads", false, e && e.message); }
    }
    if (!u.isAdmin) { const r = await window.fbDiagRead("finance/" + (s ? s.id : "x"), {}); add("rules", "blocked: finance for coaches", denied(r), r.ok ? "readable!" : r.code); }
    const bad = studs.filter(x => CMD_BAD_SAFE(x.group));
    add("data", "group names are safe for homework", !bad.length, bad.length ? bad.length + " students in groups with < > \" ' `" : "ok");
  }
  const CMD_BAD_SAFE = g => /[<>"'`]/.test(String(g || ""));

  window.ecaDiagnosticsRun = async function () {
    results.length = 0;
    const u = currUser(), t0 = Date.now();
    await checkApp(u);
    if (u) checkListeners(u);
    await checkBanks();
    if (u && u.role === "student") await checkStudent(u);
    else if (u && isStaffUser(u)) await checkStaff(u);
    const pass = results.filter(r => r.result === "PASS").length, fail = results.filter(r => r.result === "FAIL").length;
    console.table(results);
    console.log(`ECA diagnostics: ${pass} PASS, ${fail} FAIL, ${results.length - pass - fail} INFO (${Date.now() - t0} ms)`);
    return { pass, fail, results: results.slice() };
  };

  // نافذة النتايج (لزرار مركز الكوتش)
  window.ecaDiagnosticsShow = async function () {
    const old = document.getElementById("ecaDiagModal"); if (old) old.remove();
    const el = document.createElement("div");
    el.id = "ecaDiagModal"; el.className = "eca-spin-modal"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-label", DL("فحص النظام", "System check"));
    el.innerHTML = `<div class="gold-card rounded-2xl p-5 space-y-3 w-full max-w-2xl max-h-[85vh] overflow-y-auto"><h3 class="font-bold text-lg text-yellow-300">🩺 ${DL("فحص النظام", "System check")}</h3><p class="text-sm text-gray-300" id="ecaDiagBody">${DL("بنفحص... (قراية بس، مفيش أي كتابة)", "Checking... (read-only, nothing is written)")}</p>
      <button type="button" onclick="document.getElementById('ecaDiagModal').remove()" class="tap w-full rounded-xl text-sm font-bold bg-zinc-800 text-white border border-yellow-500/30">${DL("اقفل", "Close")}</button></div>`;
    document.body.appendChild(el);
    const r = await window.ecaDiagnosticsRun(), body = document.getElementById("ecaDiagBody");
    if (!body) return r;
    body.innerHTML = `<b class="${r.fail ? "text-red-300" : "text-emerald-300"}">${r.pass} PASS • ${r.fail} FAIL</b><ul class="mt-2 space-y-1">${r.results.map(x => `<li class="text-xs"><span class="font-bold ${x.result === "FAIL" ? "text-red-300" : x.result === "PASS" ? "text-emerald-300" : "text-gray-400"}">${x.result}</span> <span class="text-gray-400">${esc(x.area)}</span> • <span class="text-white">${esc(x.check)}</span> <span class="text-gray-400" dir="auto">${esc(x.detail)}</span></li>`).join("")}</ul>`;
    return r;
  };
})();
