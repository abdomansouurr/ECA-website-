    // ================= اختبار تحديد المستوى (Placement Test) =================
    // الطالب (من غير حساب): 12 لغز (2 سهل جداً، 2 سهل، 2 متوسط، 2 صعب، 4 صعب جداً) + 8 مواقف باختيارات.
    // دقيقة لكل سؤال، من غير أي إظهار لصح/غلط، والنتيجة بتتحفظ للكوتش بس. محاولة واحدة، والكوتش بس هو اللي يعيد فتحه.
    // الكوتش/الأدمن: صفحة «اختبار المستوى» فيها النتائج، اعتماد/تعديل المستوى، تصدير Excel، طباعة، إرسال واتساب، إعادة فتح الاختبار.
    const PT_PLAN = [["easiest", 2], ["easier", 2], ["normal", 2], ["harder", 2], ["hardest", 4]];
    const PT_SECONDS = 60, PT_CUR = "eca_pt_cur";
    const ptL = (a, e) => (typeof lang !== "undefined" && lang === "en") ? e : a;
    let PT = null;

    // نسبة الإجابات → المستوى المقترح (حدود الشريحة تدخل في الأعلى: 80% = المستوى 5، 60% = 4 ...)
    function ptLevel(pct) { return pct >= 100 ? 6 : pct >= 80 ? 5 : pct >= 60 ? 4 : pct >= 40 ? 3 : pct >= 20 ? 2 : 1; }
    // رقم الموبايل → مفتاح الوثيقة (أرقام فقط، 00/+20 → 0...)
    function ptPhoneKey(v) {
      let d = String(v || "").replace(/[\u0660-\u0669]/g, c => String(c.charCodeAt(0) - 0x660)).replace(/\D/g, "");
      if (d.startsWith("0020")) d = "0" + d.slice(4); else if (d.startsWith("20") && d.length === 12) d = "0" + d.slice(2);
      return d;
    }
    // مفتاح ربط الاختبار بالحساب: SHA-256(رقم الطالب + رقم ولي الأمر) — نفس الحساب في تسجيل الطالب وفي اعتماد الكوتش
    window.ecaPlKey = async (a, b) => {
      const x = ptPhoneKey(a), y = ptPhoneKey(b);
      if (!/^\d{8,15}$/.test(x) || !/^\d{8,15}$/.test(y)) return "";
      const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("eca-pl1|" + x + "|" + y));
      return Array.from(new Uint8Array(h)).map(v => v.toString(16).padStart(2, "0")).join("");
    };
    const ptShuffle = a => { a = a.slice(); for (let k = a.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [a[k], a[j]] = [a[j], a[k]]; } return a; };

    (function () {
      const st = document.createElement("style");
      st.textContent = `.pt-in{width:100%;height:42px;background:rgba(0,0,0,.85);border:1px solid rgba(234,179,8,.35);border-radius:10px;padding:0 12px;color:#fff;font-size:14px}
      .pt-in:focus{outline:none;border-color:#facc15}.pt-lb{display:block;font-size:12px;font-weight:700;color:#fde68a;margin-bottom:4px}
      .pt-opt{width:100%;display:flex;align-items:center;gap:10px;text-align:start;padding:12px 14px;border-radius:12px;background:rgba(24,24,27,.95);border:1px solid rgba(234,179,8,.3);color:#fff;font-weight:700;font-size:15px;transition:transform .08s,border-color .1s}
      .pt-opt:hover{border-color:#facc15}.pt-opt:active{transform:scale(.98)}.pt-opt b{width:26px;height:26px;border-radius:8px;background:#d4af37;color:#000;display:inline-flex;align-items:center;justify-content:center;font-size:13px;flex:none}
      .pt-mini .eca-board{grid-template-columns:repeat(8,minmax(0,1fr));grid-template-rows:repeat(8,minmax(0,1fr));border-radius:10px}.pt-mini .eca-sq{min-width:0;min-height:0;overflow:hidden}.pt-mini .eca-pc{font-size:20px}.pt-mini .eca-pimg{width:100%;height:100%}.pt-mini .eca-co{font-size:7px}`;
      document.head.appendChild(st);
    })();

    // ---------- صفحة التعريف (جنب «عن الأكاديمية») ----------
    function renderPlacementPage() {
      return `<div class="max-w-2xl mx-auto gold-card rounded-2xl p-6 space-y-4 mt-4">
        <div class="text-center space-y-1">
          <div class="text-xs font-bold tracking-widest text-yellow-400">PLACEMENT TEST</div>
          <h2 class="font-display font-extrabold text-2xl gold-gradient-text">${ptL("اختبار تحديد المستوى", "Level Placement Test")}</h2>
          <p class="text-sm text-gray-300">${ptL("اختبار بسيط عشان نحدد المستوى المناسب ليك في الأكاديمية.", "A short test so we can place you in the right level at the academy.")}</p>
        </div>
        <ul class="text-sm text-gray-300 space-y-2 list-disc ps-5">
          <li>${ptL("20 سؤال: 12 لغز شطرنج + 8 مواقف على الرقعة بتختار إجابتها من اختيارات.", "20 questions: 12 chess puzzles + 8 board positions with multiple-choice answers.")}</li>
          <li>${ptL("دقيقة واحدة لكل سؤال — لو الوقت خلص السؤال بيتحسب غلط وينتقل للي بعده.", "One minute per question — when time runs out the question counts as wrong and the next one appears.")}</li>
          <li>${ptL("مش هيظهرلك الصح والغلط أثناء الاختبار، والنتيجة بيشوفها الكوتش بس.", "You won't see right or wrong during the test; only the coach sees the result.")}</li>
          <li>${ptL("الاختبار بيتعمل مرة واحدة بس، ومش بيتعاد إلا بموافقة الكوتش.", "The test can be taken once only, and reopened only by the coach.")}</li>
          <li>${ptL("اقفل أي حاجة تانية وركّز، واستخدم موبايل أو جهاز بشاشة مريحة.", "Close other apps, stay focused, and use a comfortable screen.")}</li>
        </ul>
        <div class="text-center pt-2"><button onclick="ptOpen()" class="px-8 py-3 rounded-xl gold-btn font-bold">${ptL("ابدأ الاختبار", "Start the test")}</button></div>
      </div>`;
    }

    // ---------- الطالب: النافذة ----------
    function ptOpen() {
      if (PT) return;
      PT = { phase: "form", err: "", form: {}, qs: [], i: 0, answers: {}, timer: null, deadline: 0, locked: false, busy: false, q: Promise.resolve() };
      ptPaint();
    }
    function ptClose() {
      if (PT) clearInterval(PT.timer);
      PT = null; window.onbeforeunload = null;
      const el = document.getElementById("ptTest"); if (el) el.remove();
      document.body.style.overflow = "";
    }
    function ptFormSubmit() {
      if (!PT || PT.phase !== "form" || PT.busy) return;
      const v = id => (document.getElementById(id) || {}).value || "";
      const f = { name: v("ptName").trim(), age: Number(v("ptAge")), phone: v("ptPhone").trim(), parentPhone: v("ptParent").trim(), rating: v("ptRating").trim(), link: v("ptLink").trim(), mode: v("ptMode") };
      PT.form = f;
      const key = ptPhoneKey(f.phone), pk = ptPhoneKey(f.parentPhone);
      const bad = (m) => { PT.err = m; ptPaint(); };
      if (f.name.length < 3 || /[<>"'`]/.test(f.name)) return bad(ptL("اكتب الاسم بشكل صحيح.", "Enter a valid name."));
      if (!(f.age >= 3 && f.age <= 99)) return bad(ptL("اكتب السن بشكل صحيح.", "Enter a valid age."));
      if (!/^\d{8,15}$/.test(key)) return bad(ptL("رقم الطالب غير صحيح.", "The student phone number is invalid."));
      if (!/^\d{8,15}$/.test(pk)) return bad(ptL("رقم ولي الأمر غير صحيح.", "The parent phone number is invalid."));
      if (f.rating.length > 20 || /[<>"'`]/.test(f.rating)) return bad(ptL("التقييم غير صحيح.", "The rating is invalid."));
      if (f.link && !/^https:\/\/[^\s<>"'`]{3,180}$/.test(f.link)) return bad(ptL("اللينك لازم يبدأ بـ https://", "The link must start with https://"));
      if (f.mode !== "online" && f.mode !== "offline") return bad(ptL("اختار الحضور (أونلاين / أوفلاين).", "Choose attendance (online / offline)."));
      f.key = key; f.pk = pk;
      ptStart();
    }

    async function ptStart() {
      PT.busy = true; PT.err = ""; PT.phase = "loading"; ptPaint();
      try {
        await ensureChess();
        const bank = await loadPuzzleBank();
        const qs = [];
        for (const [k, n] of PT_PLAN) {
          const pool = ptShuffle(bank[k] || []); let got = 0;
          for (const row of pool) {
            if (got >= n) break;
            const [id, fen, moves] = row.split("|"), mv = moves.split(" ");
            try {
              const g = new ChessCls(fen), r0 = uciMove(g, mv[0]);
              qs.push({ kind: "p", id, game: g, sol: mv.slice(1), idx: 0, color: g.turn(), flip: g.turn() === "b", last: [r0.from, r0.to], sel: null, flash: null }); got++;
            } catch (_) {}
          }
          if (got < n) throw new Error("not enough puzzles: " + k);
        }
        const sits = ptShuffle(window.ECA_PLACEMENT_SITUATIONS || []).slice(0, 8);
        if (sits.length < 8) throw new Error("not enough situations");
        for (const s of sits) {
          const right = s.opts[s.ans];
          if (s.img) { const im = new Image(); im.src = s.img; }              // تحميل مسبق: السؤال اللي بعده يظهر فوراً
          const g = s.fen ? new ChessCls(s.fen) : null;
          qs.push({ kind: "s", sid: String(s.img || "").split("/").pop().replace(/\.\w+$/, ""), img: s.img || "", game: g, flip: g ? g.turn() === "b" : false, q: s.q, qe: s.qe, opts: ptShuffle(s.opts), right });
        }
        PT.qs = qs;
      } catch (e) {
        console.error(e); PT.busy = false; PT.phase = "form"; PT.err = ptL("تعذّر تحميل الاختبار — اتأكد من الإنترنت وجرّب تاني (محاولتك ما اتحسبتش).", "Could not load the test — check your connection and try again (your attempt was not used)."); return ptPaint();
      }
      // تسجيل المحاولة مقدّماً (create فقط): لو الرقم ده اتسجّل قبل كده القواعد بترفض → الاختبار مقفول
      const f = PT.form;
      let prior = ""; try { prior = (JSON.parse(localStorage.getItem("eca_pt_done") || "null") || {}).u || ""; } catch (_) {}
      const r = await window.fbPtStart({ id: f.key, name: f.name, age: f.age, phone: f.key, parentPhone: f.pk, rating: f.rating, link: f.link, mode: f.mode, total: PT.qs.length, lk: await ptLinkKey(f.link), prior });
      if (!PT) return;
      PT.busy = false;
      if (!r || !r.ok) {
        if (r && r.code === "permission-denied") { PT.phase = "locked"; return ptPaint(); }
        PT.phase = "form"; PT.err = ptL("تعذّر الحفظ — اتأكد من الإنترنت وجرّب تاني.", "Could not save — check your connection and try again."); return ptPaint();
      }
      try { localStorage.setItem(PT_CUR, JSON.stringify({ key: f.key, answers: {}, total: PT.qs.length, ts: Date.now() })); localStorage.setItem("eca_pt_done", JSON.stringify({ u: r.uid, key: f.key })); } catch (_) {}
      window.onbeforeunload = () => "";
      PT.phase = "play"; ptQuestion(0);
    }

    function ptQuestion(i) {
      PT.i = i; PT.locked = false; PT.busy = false;
      PT.deadline = Date.now() + PT_SECONDS * 1000; PT.t0 = Date.now();
      clearInterval(PT.timer);
      PT.timer = setInterval(() => {
        if (!PT || PT.phase !== "play" || PT.locked) return;
        const left = Math.max(0, PT.deadline - Date.now());
        const bar = document.getElementById("ptBar"), txt = document.getElementById("ptSec");
        if (bar) { bar.style.width = (left / (PT_SECONDS * 10)) + "%"; bar.style.background = left < 15000 ? "#ef4444" : "linear-gradient(90deg,#f3d266,#d4af37)"; }
        if (txt) txt.textContent = Math.ceil(left / 1000);
        if (left <= 0) ptAnswer(false, "timeout");
      }, 200);
      ptPaint();
    }

    function ptClick(sq) {
      if (!PT || PT.phase !== "play" || PT.locked || PT.busy) return;
      const q = PT.qs[PT.i]; if (q.kind !== "p") return;
      const g = q.game, mv = pickOrMove(q, sq, q.color);
      if (!mv) return ptPaint();
      // ترقية البيدق: اختيار القطعة زي Lichess — والقطعة غير قطعة الحل بتتحسب غلط
      if (mv.promotion && promoNeeded(q, mv.from, mv.to)) return promoShow(q, mv.from, mv.to, pc => ptPlay(Object.assign(mv, { promotion: pc })));
      ptPlay(mv);
    }
    function ptPlay(mv) {
      const q = PT.qs[PT.i], g = q.game;
      const want = q.sol[q.idx] || "";
      let r = null; try { r = g.move(mv); } catch (_) {}
      if (!r) return ptPaint();
      const ok = r.from + r.to + (r.promotion || "") === want || g.isCheckmate();   // قطعة الترقية الغلط = غلط زي Lichess
      q.last = [r.from, r.to]; q.sel = null;
      if (!ok) return ptAnswer(false, r.from + r.to);
      q.idx++;
      if (q.idx >= q.sol.length || g.isCheckmate()) return ptAnswer(true, "ok");
      PT.busy = true; ptPaint();                               // نقلة صح ولسه الحل مكمّل: الخصم بيرد
      setTimeout(() => {
        if (!PT || PT.qs[PT.i] !== q || PT.locked) return;
        try { const r2 = uciMove(g, q.sol[q.idx]); q.last = [r2.from, r2.to]; } catch (_) {}
        q.idx++; PT.busy = false;
        if (q.idx >= q.sol.length) return ptAnswer(true, "ok");
        ptPaint();
      }, 450);
    }
    function ptPick(k) {
      if (!PT || PT.phase !== "play" || PT.locked) return;
      const q = PT.qs[PT.i]; if (q.kind !== "s") return;
      const c = q.opts[k]; ptAnswer(c === q.right, c);
    }

    // الإجابة بتتسجّل وبينتقل للسؤال اللي بعده على طول من غير أي إظهار لصح/غلط
    function ptAnswer(ok, choice) {
      if (!PT || PT.locked || PT.phase !== "play") return;
      PT.locked = true; clearInterval(PT.timer);
      const i = PT.i, q = PT.qs[i];
      const a = { k: q.kind, ok: ok ? 1 : 0, c: String(choice || "").slice(0, 24), s: Math.min(PT_SECONDS, Math.round((Date.now() - PT.t0) / 1000)), q: String((q.kind === "p" ? q.id : q.sid) || "").slice(0, 16) };
      if (q.kind === "p") a.x = q.idx | 0;   // كام نقلة من الحل اتلعبت قبل الغلطة (عشان الكوتش يشوف نفس الوضع)
      PT.answers[i] = a;
      ptBackup();
      const key = PT.form.key, patch = {}; patch["answers." + i] = a;
      PT.q = PT.q.then(() => window.fbPtSave(key, patch)).catch(() => {});
      const next = () => { if (!PT) return; if (i + 1 < PT.qs.length) ptQuestion(i + 1); else ptFinish(); };
      if (q.kind === "p" && ok) { ptPaint(); setTimeout(next, 250); } else next();
    }
    function ptBackup() {
      try { localStorage.setItem(PT_CUR, JSON.stringify({ key: PT.form.key, answers: PT.answers, total: PT.qs.length, ts: Date.now() })); } catch (_) {}
    }
    function ptQuit() {
      if (!PT || PT.phase !== "play") return ptClose();
      if (!confirm(ptL("لو خرجت دلوقتي الأسئلة اللي فاضلة هتتحسب غلط ومش هتقدر تعيد الاختبار. متأكد؟", "If you quit now, the remaining questions count as wrong and you cannot retake the test. Sure?"))) return;
      clearInterval(PT.timer); PT.locked = true; ptFinish();
    }

    // حساب النتيجة وحفظها (بإعادة محاولة) — النتيجة ما بتظهرش للطالب
    function ptCompute(answers, total) {
      let c = 0; for (let k = 0; k < total; k++) if (answers[k] && answers[k].ok) c++;
      const pct = Math.round((c / total) * 100);
      return { correct: c, score: pct, suggested: ptLevel(pct) };
    }
    async function ptPush(key, answers, total) {
      const full = {}; for (let k = 0; k < total; k++) full[k] = answers[k] || { k: k < 12 ? "p" : "s", ok: 0, c: "none", s: PT_SECONDS };
      const res = ptCompute(full, total);
      const r = await window.fbPtSave(key, Object.assign({ answers: full, status: "done", total, finishedAt: Date.now() }, res), 4);
      return r && r.ok;
    }
    async function ptFinish() {
      clearInterval(PT.timer); PT.phase = "saving"; window.onbeforeunload = null; ptPaint();
      const key = PT.form.key, total = PT.qs.length;
      await PT.q.catch(() => {});
      const ok = await Promise.race([ptPush(key, PT.answers, total), new Promise(r => setTimeout(() => r(false), 15000))]);
      if (ok) { try { localStorage.removeItem(PT_CUR); } catch (_) {} }
      else { try { ptBackup(); } catch (_) {} setTimeout(ptRecover, 20000); }
      ptClose(); switchTab("about"); window.scrollTo(0, 0);
      toast(ptL("تم تسجيل إجاباتك ✅ هيتواصل معاك الكوتش بنتيجة تحديد المستوى.", "Your answers are saved ✅ The coach will contact you with your level."));
    }
    // لو الصفحة اتقفلت في النص أو النت فصل وقت الحفظ: بنكمّل الحفظ لما الموقع يفتح تاني (الأسئلة اللي ما اتجاوبتش = غلط)
    async function ptRecover() {
      let cur = null; try { cur = JSON.parse(localStorage.getItem(PT_CUR) || "null"); } catch (_) {}
      if (!cur || !cur.key || PT || !window.fbPtSave) return;
      const ok = await ptPush(cur.key, cur.answers || {}, cur.total || 20);
      if (ok) { try { localStorage.removeItem(PT_CUR); } catch (_) {} }
    }
    { let n = 0; const iv = setInterval(() => { if (window.fbPtSave || ++n > 40) { clearInterval(iv); if (window.fbPtSave) ptRecover(); } }, 1000); addEventListener("online", () => setTimeout(ptRecover, 1500)); }

    function ptPaint() {
      if (!PT) return;
      const _keepSet = pieceSet; pieceSet = "lichess";                 // اختبار تحديد المستوى دايماً بقطع Lichess
      try { ptPaint2(); } finally { pieceSet = _keepSet; }
    }
    function ptPaint2() {
      let el = document.getElementById("ptTest");
      if (!el) { el = document.createElement("div"); el.id = "ptTest"; document.body.appendChild(el); document.body.style.overflow = "hidden"; }
      const f = PT.form || {}, fld = (id, lb, type, val, ph, extra) => `<div><label class="pt-lb" for="${id}">${lb}</label><input id="${id}" class="pt-in" type="${type}" value="${esc(val || "")}" placeholder="${esc(ph || "")}" ${extra || ""} autocomplete="off" /></div>`;
      let body = "";
      if (PT.phase === "form") body = `
        <div class="gold-card rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between"><div class="font-display font-extrabold text-lg text-yellow-300">${ptL("بيانات الطالب", "Student details")}</div><button onclick="ptClose()" class="px-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-zinc-700 text-gray-300">${ptL("إلغاء", "Cancel")}</button></div>
          ${PT.err ? `<div class="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg p-2.5">${PT.err}</div>` : ""}
          ${fld("ptName", ptL("الاسم *", "Name *"), "text", f.name, "", 'maxlength="80"')}
          <div class="grid grid-cols-2 gap-3">${fld("ptAge", ptL("السن *", "Age *"), "number", f.age || "", "", 'min="3" max="99" inputmode="numeric"')}
            <div><label class="pt-lb" for="ptMode">${ptL("الحضور *", "Attendance *")}</label><select id="ptMode" class="pt-in"><option value="">—</option><option value="online" ${f.mode === "online" ? "selected" : ""}>Online</option><option value="offline" ${f.mode === "offline" ? "selected" : ""}>Offline</option></select></div></div>
          ${fld("ptPhone", ptL("رقم الطالب *", "Student phone *"), "tel", f.phone, "01xxxxxxxxx", 'dir="ltr" inputmode="tel" maxlength="20"')}
          ${fld("ptParent", ptL("رقم ولي الأمر *", "Parent phone *"), "tel", f.parentPhone, "01xxxxxxxxx", 'dir="ltr" inputmode="tel" maxlength="20"')}
          ${fld("ptRating", ptL("التقييم الحالي (إن وجد)", "Current rating (if any)"), "text", f.rating, "1200", 'maxlength="20" dir="ltr"')}
          ${fld("ptLink", ptL("لينك حسابك على chess.com أو lichess (إن وجد)", "Your chess.com / lichess link (if any)"), "url", f.link, "https://", 'dir="ltr" maxlength="200"')}
          <p class="text-[11px] text-gray-400">${ptL("بمجرد ما تبدأ الاختبار هيتحسب محاولتك، ومش هتقدر تعيده إلا بموافقة الكوتش.", "Once you start, your attempt is counted and can only be reopened by the coach.")}</p>
          <button onclick="ptFormSubmit()" class="w-full py-3 rounded-xl gold-btn font-bold">${ptL("ابدأ الاختبار", "Start the test")}</button>
        </div>`;
      else if (PT.phase === "loading") body = `<div class="gold-card rounded-2xl p-8 text-center space-y-3">${ICON("spinner", "w-9 h-9 mx-auto text-yellow-300 animate-spin")}<div class="font-bold text-yellow-300">${ptL("جاري تجهيز الاختبار...", "Preparing the test...")}</div></div>`;
      else if (PT.phase === "saving") body = `<div class="gold-card rounded-2xl p-8 text-center space-y-3">${ICON("spinner", "w-9 h-9 mx-auto text-yellow-300 animate-spin")}<div class="font-bold text-yellow-300">${ptL("جاري حفظ إجاباتك... متقفلش الصفحة", "Saving your answers... do not close the page")}</div></div>`;
      else if (PT.phase === "locked") body = `<div class="gold-card rounded-2xl p-8 text-center space-y-4"><div class="font-bold text-red-300 text-lg">${ptL("الاختبار ده اتعمل قبل كده بنفس رقم الموبايل", "This test was already taken with this phone number")}</div><p class="text-sm text-gray-300">${ptL("لإعادة الاختبار لازم تكلّم الكوتش وهو يفتحه ليك.", "To retake it, ask your coach to reopen it for you.")}</p><button onclick="ptClose()" class="px-6 py-2.5 rounded-xl gold-btn text-sm">${ptL("رجوع", "Back")}</button></div>`;
      else {
        const q = PT.qs[PT.i], left = Math.max(0, PT.deadline - Date.now()), n = PT.qs.length;
        const dots = PT.qs.map((_, k) => `<span class="w-2.5 h-2.5 rounded-full ${k < PT.i ? "bg-yellow-500" : k === PT.i ? "bg-yellow-300 animate-pulse" : "bg-zinc-700"}"></span>`).join("");
        let main = "";
        if (q.kind === "p") {
          const pm = Math.ceil(q.sol.length / 2), dn = Math.floor(q.idx / 2);
          main = `<div class="text-sm font-bold text-center text-yellow-300">${ptL("لغز", "Puzzle")} — ${q.color === "w" ? ptL("انت بالأبيض", "You are White") : ptL("انت بالأسود", "You are Black")}${pm > 1 ? ` <span class="text-gray-400 font-normal">(${dn + 1}/${pm})</span>` : ""}</div>
            <div style="max-width:min(100%, 62vh); margin:0 auto;">${boardHTML({ game: q.game, flip: q.flip, sel: q.sel, targets: PT.busy ? null : targetsOf(q.game, q.sel), last: q.last, onClick: "ptClick" })}</div>`;
        } else {
          main = `<div class="text-sm font-bold text-center text-yellow-300">${ptL(q.q, q.qe || q.q)}</div>
            <div style="max-width:min(100%, 54vh); margin:0 auto;">${q.img ? `<img src="${esc(q.img)}" alt="" draggable="false" style="width:100%;border-radius:14px;border:2px solid rgba(212,175,55,.5);display:block" />` : boardHTML({ game: q.game, flip: q.flip, onClick: "ptNoop" })}</div>
            <div class="grid gap-2" dir="ltr">${q.opts.map((o, k) => `<button class="pt-opt" onclick="ptPick(${k})"><b>${"ABCDEF"[k]}</b><span>${esc(o)}</span></button>`).join("")}</div>`;
        }
        body = `<div class="gold-card rounded-2xl p-4 space-y-3">
            <div class="flex flex-wrap justify-between items-center gap-2"><div class="font-display font-bold text-yellow-400">${ptL("اختبار تحديد المستوى", "Placement test")}</div><div class="text-sm text-gray-300" dir="ltr"><b class="text-white">${PT.i + 1}</b> / ${n}</div></div>
            <div class="flex flex-wrap gap-1 justify-center">${dots}</div>
            <div class="flex items-center gap-3"><div class="eval-bar flex-1" style="height:10px"><div id="ptBar" style="width:${left / (PT_SECONDS * 10)}%; background:linear-gradient(90deg,#f3d266,#d4af37)"></div></div><div class="text-sm font-extrabold text-yellow-300 w-10 text-center"><span id="ptSec">${Math.ceil(left / 1000)}</span></div></div>
          </div>
          <div class="space-y-3">${main}</div>
          <div class="text-center"><button onclick="ptQuit()" class="px-4 py-2 rounded-xl text-xs bg-red-500/15 border border-red-500/30 text-red-300">${ptL("إنهاء الاختبار", "End the test")}</button></div>`;
      }
      el.innerHTML = `<div class="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md overflow-y-auto p-3 sm:p-6"><div class="max-w-xl mx-auto space-y-3">${body}</div></div>`;
      if (typeof lang !== "undefined" && lang === "en" && typeof applyLang === "function") applyLang();
    }
    function ptNoop() {}
    // لينك حساب الشطرنج → بصمة (SHA-256) عشان نمنع الطالب يعيد الاختبار بنفس الحساب حتى لو غيّر اسمه وأرقامه
    async function ptLinkKey(link) {
      if (!link) return "";
      const t = String(link).toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/[?#].*$/, "").replace(/\/+$/, "");
      try { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(t)); return Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, "0")).join(""); } catch (_) { return ""; }
    }

    // ================= الكوتش / الأدمن =================
    const PTR = { list: null, loading: false, q: "", err: "", busy: false, open: {}, det: {} };
    async function ptLoad(force) {
      if (PTR.loading || (PTR.list && !force)) return;
      PTR.loading = true; PTR.err = ""; render();
      try {
        const r = await window.fbPtList();
        PTR.list = r.rows || [];
        if (r.ok && window.fbPlPublish && !PTR.__synced) { PTR.__synced = true; window.fbPlPublish(PTR.list.filter(x => x.levelBy && Number(x.level) >= 1).map(x => ({ phone: x.phone, parentPhone: x.parentPhone, level: Number(x.level) }))).catch(() => {}); } if (!r.ok) PTR.err = "تعذّر تحميل النتائج — اتأكد إن قواعد Firebase اتنشرت (firestore.rules).";
        if (window.fbPtCleanup) window.fbPtCleanup().catch(() => {});
      } catch (e) { PTR.err = "تعذّر تحميل النتائج."; PTR.list = PTR.list || []; }
      PTR.loading = false; render();
    }
    const ptFinal = r => Number(r.level) || Number(r.suggested) || 0;
    function ptMatch(r, q) {
      q = String(q || "").trim().toLowerCase(); if (!q) return true;
      const d = ptPhoneKey(q);
      return String(r.name || "").toLowerCase().includes(q) || (d.length >= 3 && (String(r.phone || "").includes(d) || String(r.parentPhone || "").includes(d)));
    }
    const ptDate = ts => { try { return new Date(ts).toLocaleString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); } catch (_) { return ""; } };

    // تنبيهات للكوتش: نفس رقم ولي الأمر / نفس حساب الشطرنج / نفس الجهاز / نفس الاسم عند طالب تاني (ممكن إخوات أو محاولة غش)
    function ptDupes(r) {
      const o = (PTR.list || []).filter(x => x.id !== r.id), out = [], nm = x => String(x.name || "").replace(/\s+/g, " ").trim().toLowerCase();
      const names = a => a.map(x => esc(x.name)).join("، ");
      let a = o.filter(x => x.parentPhone === r.parentPhone); if (a.length) out.push("نفس رقم ولي الأمر مع: " + names(a));
      a = o.filter(x => r.lk && x.lk === r.lk); if (a.length) out.push("نفس حساب الشطرنج مع: " + names(a));
      a = o.filter(x => r.owner && x.owner === r.owner); if (a.length) out.push("نفس الجهاز مع: " + names(a));
      a = o.filter(x => nm(x) === nm(r)); if (a.length) out.push("نفس الاسم عند طالب تاني");
      return out;
    }
    function ptRowCard(r, compact) {
      const done = r.status === "done", fin = ptFinal(r), by = Number(r.level) ? "كوتش: " + esc(r.levelCoach || "") : "النظام — لسه ما اتعتمدش";
      const dup = ptDupes(r);
      const opts = [1, 2, 3, 4, 5, 6].map(n => `<option value="${n}" ${fin === n ? "selected" : ""}>Level ${n}</option>`).join("");
      return `<div class="gold-card rounded-2xl p-4 space-y-2.5">
        <div class="flex flex-wrap items-start justify-between gap-2">
          <div><div class="font-bold text-white text-base">${esc(r.name)} <span class="text-xs text-gray-400 font-normal">(${esc(r.age)} سنة • ${r.mode === "online" ? "Online" : "Offline"})</span></div>
            <div class="text-xs text-gray-400 mt-0.5" dir="ltr">📱 ${esc(r.phone)} &nbsp;|&nbsp; 👨‍👦 ${esc(r.parentPhone)}</div></div>
          <span class="text-[11px] px-2 py-1 rounded-lg border ${done ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/10" : "border-amber-500/40 text-amber-300 bg-amber-500/10"}">${done ? "خلّص الاختبار" : "لم يكتمل"}</span>
        </div>
        ${dup.length ? `<div class="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-2">⚠️ ${dup.join(" • ")}</div>` : ""}
        <div class="text-xs text-gray-300 flex flex-wrap gap-x-4 gap-y-1"><span>التقييم: ${esc(r.rating) || "—"}</span><span>${r.link ? `<a href="${esc(r.link)}" target="_blank" rel="noopener" class="text-yellow-300 underline">حساب الشطرنج</a>` : "بدون لينك"}</span><span>${esc(ptDate(r.createdAt))}</span></div>
        ${done ? `<div class="flex flex-wrap items-center gap-2 text-sm"><span class="text-gray-300">النتيجة: <b class="text-white">${r.score}%</b> (${r.correct}/${r.total})</span><span class="text-gray-300">المقترح: <b class="text-yellow-300">Level ${r.suggested}</b></span>
          <span class="text-gray-300">المعتمد:</span><select onchange="ptSetLevel('${r.id}', this.value)" class="pt-in" style="width:auto;height:34px">${opts}</select><span class="text-[11px] text-gray-400">(${by})</span>
          ${Number(r.level) ? "" : `<button onclick="ptSetLevel('${r.id}', ${r.suggested})" class="px-3 py-1.5 rounded-lg text-xs gold-btn">اعتماد المقترح</button>`}</div>` : ""}
        ${done ? ptDetBlock(r) : ""}
        <div class="flex justify-end"><button onclick="ptReopen('${r.id}')" class="px-3 py-1.5 rounded-lg text-xs bg-red-500/15 border border-red-500/30 text-red-300">إعادة فتح الاختبار للطالب</button></div>
      </div>`;
    }

    function renderPlacementResults(u) {
      if (!PTR.list && !PTR.loading) setTimeout(() => ptLoad(), 0);
      const rows = (PTR.list || []).filter(r => ptMatch(r, PTR.q)), doneRows = rows.filter(r => r.status === "done");
      return `<div class="space-y-4">
        <div class="gold-card rounded-2xl p-4 space-y-3">
          <div class="flex flex-wrap justify-between items-center gap-2"><h2 class="font-display font-extrabold text-xl gold-gradient-text">نتائج اختبار تحديد المستوى</h2>
            <button onclick="ptLoad(true)" class="px-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">تحديث</button></div>
          <p class="text-xs text-gray-400">البحث بالاسم أو رقم الموبايل من خانة البحث فوق. الطالب ما بيشوفش النتيجة. المستوى المعتمد = اللي تختاره أنت، ولو ما عدّلتش بيتعتمد المقترح من النظام.</p>
          <div class="flex flex-wrap gap-2">
            <button onclick="ptExport('xlsx')" class="px-4 py-2 rounded-xl text-xs gold-btn">تحميل Excel (${doneRows.length})</button>
            <button onclick="ptExport('print')" class="px-4 py-2 rounded-xl text-xs bg-zinc-900 border border-yellow-500/40 text-yellow-300">طباعة</button>
            <button onclick="ptExport('wa')" class="px-4 py-2 rounded-xl text-xs font-bold" style="background:#059669;color:#fff">إرسال للإدارة واتساب</button>
          </div>
          <div class="text-[11px] text-gray-500">كل تقرير بتطلّعه بيتحفظ منه نسخة احتياطية في قاعدة البيانات لمدة 30 يوم ثم تتحذف تلقائياً.</div>
          ${PTR.err ? `<div class="text-sm text-red-300">${PTR.err}</div>` : ""}
        </div>
        ${PTR.loading && !PTR.list ? `<div class="text-center text-gray-400 py-8">جاري التحميل...</div>` : rows.length ? rows.map(r => ptRowCard(r)).join("") : `<div class="text-center text-gray-400 py-8">${PTR.q ? "مفيش نتايج للبحث ده." : "لسه محدش عمل الاختبار."}</div>`}
      </div>`;
    }
    // ---------- الكوتش: أخطاء الطالب في الاختبار (السؤال + إجابته + الصح) ----------
    const PT_DIFF = ["سهل جدًا", "سهل", "متوسط", "صعب", "صعب جدًا"];
    const ptDiffOf = i => PT_DIFF[i < 2 ? 0 : i < 4 ? 1 : i < 6 ? 2 : i < 8 ? 3 : 4];
    async function ptToggleDet(id) {
      PTR.open[id] = !PTR.open[id];
      const r = (PTR.list || []).find(x => x.id === id);
      if (PTR.open[id] && r && !PTR.det[id]) {
        PTR.det[id] = { loading: true }; render();
        try { PTR.det[id] = await ptBuildDet(r); } catch (e) { console.error(e); PTR.det[id] = { err: true }; }
      }
      render();
    }
    async function ptBuildDet(r) {
      const ans = r.answers || {}, total = Number(r.total) || 20, items = [];
      let idx = null;
      if (Object.keys(ans).some(k => ans[k] && ans[k].k === "p" && ans[k].q)) {
        await ensureChess(); const bank = await loadPuzzleBank(); idx = {};
        for (const lvl in bank) for (const row of bank[lvl]) idx[row.slice(0, row.indexOf("|"))] = row;
      }
      for (let i = 0; i < total; i++) {
        const a = ans[i] || null, it = { i, k: a ? a.k : (i < 12 ? "p" : "s"), ok: !!(a && a.ok), c: a ? String(a.c || "") : "none", s: a ? Number(a.s) || 0 : 0, q: (a && a.q) || "" };
        if (it.k === "p") it.diff = ptDiffOf(i);
        if (!it.ok && it.k === "p" && it.q && idx && idx[it.q]) {
          try {
            const mv = idx[it.q].split("|")[2].split(" "), sol = mv.slice(1), x = Math.max(0, Math.min(sol.length - 1, Number(a.x) || 0));
            const g = new ChessCls(idx[it.q].split("|")[1]); uciMove(g, mv[0]);
            for (let t = 0; t < x; t++) uciMove(g, sol[t]);
            it.fen = g.fen(); it.solFrom = sol[x].slice(0, 2); it.solTo = sol[x].slice(2, 4);
            it.solSan = uciMove(new ChessCls(it.fen), sol[x]).san;
            if (/^[a-h][1-8][a-h][1-8]$/.test(it.c)) { try { const m = new ChessCls(it.fen).move({ from: it.c.slice(0, 2), to: it.c.slice(2, 4), promotion: "q" }); it.wrongSan = m.san; } catch (_) {} }
          } catch (e) { console.warn("placement detail", it.q, e); }
        }
        if (it.k === "s" && it.q) {
          const sit = (window.ECA_PLACEMENT_SITUATIONS || []).find(s => s.img && s.img.indexOf("/" + it.q + ".") >= 0);
          if (sit) { it.img = sit.img; it.right = sit.opts[sit.ans]; }
        }
        items.push(it);
      }
      return { items };
    }
    function ptDetBlock(r) {
      const ans = r.answers || {}, total = Number(r.total) || 20; let wrong = 0;
      for (let k = 0; k < total; k++) if (!(ans[k] && ans[k].ok)) wrong++;
      const open = !!PTR.open[r.id];
      return `<div><button onclick="ptToggleDet('${r.id}')" class="px-3 py-1.5 rounded-lg text-xs bg-zinc-900 border border-yellow-500/30 text-yellow-300">${open ? "إخفاء" : "عرض"} تفاصيل الأخطاء (${wrong} من ${total})</button></div>${open ? ptDetHtml(r) : ""}`;
    }
    function ptDetHtml(r) {
      const d = PTR.det[r.id];
      if (!d || d.loading) return `<div class="text-xs text-gray-400 py-2">جاري تحميل التفاصيل…</div>`;
      if (d.err) return `<div class="text-xs text-red-300 py-2">تعذّر تحميل التفاصيل — جرّب تاني.</div>`;
      const its = d.items, P = its.filter(x => x.k === "p"), S = its.filter(x => x.k === "s");
      const byD = PT_DIFF.map(n => { const a = P.filter(x => x.diff === n); return a.length ? `<span class="px-2 py-0.5 rounded-md border ${a.every(x => x.ok) ? "border-emerald-500/40 text-emerald-300" : "border-red-500/40 text-red-300"}">${n}: ${a.filter(x => x.ok).length}/${a.length}</span>` : ""; }).join("");
      const quick = its.filter(x => !x.ok && x.c !== "timeout" && x.c !== "none" && x.s > 0 && x.s <= 3).length, slow = its.filter(x => x.c === "timeout").length;
      const wrong = its.filter(x => !x.ok);
      const card = x => {
        const head = `<div class="flex justify-between items-center text-[12px]"><b class="text-white">${x.k === "p" ? "لغز" : "موقف"} ${x.k === "p" ? x.i + 1 : x.i - 11} ${x.diff ? "• " + x.diff : ""}</b><span class="text-gray-400">${x.c === "none" ? "ما اتجاوبش" : x.c === "timeout" ? "الوقت خلص" : x.s + " ث"}</span></div>`;
        if (x.k === "p") {
          if (!x.fen) return `<div class="rounded-xl border border-red-500/20 p-2.5 space-y-1.5">${head}<div class="text-[12px] text-gray-400">${x.q ? "تعذّر عرض اللغز" : "الاختبار ده اتسجّل قبل التحديث — التفاصيل مش متاحة"}</div></div>`;
          const fl = {}; fl[x.solFrom] = "good"; fl[x.solTo] = "good";
          if (/^[a-h][1-8][a-h][1-8]$/.test(x.c)) { if (x.c.slice(0, 2) !== x.solFrom) fl[x.c.slice(0, 2)] = "bad"; fl[x.c.slice(2, 4)] = "bad"; }
          const g = new ChessCls(x.fen);
          return `<div class="rounded-xl border border-red-500/25 p-2.5 space-y-1.5">${head}<div style="max-width:210px" class="mx-auto pt-mini">${boardHTML({ game: g, flip: g.turn() === "b", flash: fl, onClick: "ptNoop" })}</div>
            <div class="text-[12px] text-gray-300">الحل: <b class="text-emerald-300" dir="ltr">${esc(x.solSan)}</b> &nbsp; ${x.wrongSan ? `الطالب لعب: <b class="text-red-300" dir="ltr">${esc(x.wrongSan)}</b>` : x.c === "timeout" ? "" : `الطالب لعب: <b class="text-red-300" dir="ltr">${esc(x.c)}</b>`}</div></div>`;
        }
        const pick = x.c === "timeout" || x.c === "none" ? "" : `اختار: <b class="text-red-300" dir="ltr">${esc(x.c)}</b> &nbsp; `;
        return `<div class="rounded-xl border border-red-500/25 p-2.5 space-y-1.5">${head}${x.img ? `<img src="${esc(x.img)}" alt="" loading="lazy" class="rounded-lg mx-auto" style="max-height:190px">` : `<div class="text-[12px] text-gray-400">${x.q ? "" : "الاختبار ده اتسجّل قبل التحديث — الصورة مش متاحة"}</div>`}
          <div class="text-[12px] text-gray-300">${pick}${x.right ? `الصح: <b class="text-emerald-300" dir="ltr">${esc(x.right)}</b>` : ""}</div></div>`;
      };
      return `<div class="rounded-xl border border-yellow-500/20 bg-black/30 p-3 space-y-3">
        <div class="flex flex-wrap gap-1.5 text-[11px] items-center"><span class="text-gray-300">ألغاز: <b class="text-white">${P.filter(x => x.ok).length}/${P.length}</b></span>${byD}<span class="text-gray-300 ms-2">مواقف: <b class="text-white">${S.filter(x => x.ok).length}/${S.length}</b></span></div>
        ${quick || slow ? `<div class="text-[11px] text-amber-300">${quick ? `⚠️ ${quick} إجابات غلط في 3 ثواني أو أقل (ممكن تخمين). ` : ""}${slow ? `${slow} أسئلة الوقت خلص فيها.` : ""}</div>` : ""}
        ${wrong.length ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">${wrong.map(card).join("")}</div>` : `<div class="text-sm text-emerald-300">جاوب كل الأسئلة صح 👏</div>`}
        <div class="text-[11px] text-gray-400">على الرقعة: <span class="text-emerald-300">الأخضر = الحل الصح</span> • <span class="text-red-300">الأحمر = الحركة اللي لعبها الطالب</span> (الرقعة من منظور اللاعب اللي عليه الدور).</div>
        <div class="text-[11px] text-gray-500">الأسئلة الصح: ${its.filter(x => x.ok).map(x => x.i + 1).join("، ") || "—"}</div>
      </div>`;
    }

    async function ptSetLevel(id, lv) {
      const r = (PTR.list || []).find(x => x.id === id); lv = Number(lv); if (!r || !(lv >= 1 && lv <= 6)) return;
      const cu = currUser(), nm = String((cu && cu.name) || "").slice(0, 80);
      const res = await window.fbPtUpdate(id, { level: lv, levelBy: "coach", levelCoach: nm, confirmedAt: Date.now() });
      if (res && res.ok) { r.level = lv; r.levelBy = "coach"; r.levelCoach = nm; if (window.fbPlPublish) window.fbPlPublish([{ phone: r.phone, parentPhone: r.parentPhone, level: lv }]); toast("تم اعتماد المستوى " + lv); } else toast("تعذّر الحفظ — جرّب تاني.");
      render();
    }
    async function ptReopen(id) {
      const r = (PTR.list || []).find(x => x.id === id); if (!r) return;
      if (!confirm("هتفتح الاختبار تاني للطالب «" + r.name + "»؟ نتيجته الحالية هتتمسح وهيقدر يعيده مرة واحدة.")) return;
      const res = await window.fbPtReopen(id, r);
      if (res && res.ok) { if (window.fbPlRemove) window.fbPlRemove(r.phone, r.parentPhone); PTR.list = PTR.list.filter(x => x.id !== id); toast("تم فتح الاختبار للطالب."); } else toast("تعذّر فتح الاختبار — جرّب تاني.");
      render();
    }

    // ---------- التقرير: Excel / طباعة / واتساب ----------
    const PT_HEAD = ["#", "الاسم", "السن", "رقم الطالب", "رقم ولي الأمر", "التقييم الحالي", "لينك الحساب", "النوع", "المستوى", "اسم الكوتش المعتمد", "تاريخ الاختبار"];
    function ptReportRows() {
      const rows = (PTR.list || []).filter(r => r.status === "done" && ptMatch(r, PTR.q)).sort((a, b) => (a.finishedAt || a.createdAt || 0) - (b.finishedAt || b.createdAt || 0));
      return rows.map((r, k) => [k + 1, r.name, r.age, r.phone, r.parentPhone, r.rating || "", r.link || "", r.mode === "online" ? "Online" : "Offline", "Level " + ptFinal(r), Number(r.level) ? (r.levelCoach || "كوتش") : "لم يُعتمد بعد (مقترح النظام)", ptDate(r.finishedAt || r.createdAt)]);
    }
    // ملف xlsx بسيط من غير مكتبات (zip بدون ضغط + XML)
    function ptXlsx(rows) {
      const x = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
      const col = n => String.fromCharCode(65 + n);
      const all = [PT_HEAD].concat(rows);
      const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView rightToLeft="1" workbookViewId="0"/></sheetViews><cols>${[5, 26, 7, 16, 16, 12, 34, 10, 11, 26, 18].map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join("")}</cols><sheetData>${all.map((r, ri) => `<row r="${ri + 1}">${r.map((v, ci) => `<c r="${col(ci)}${ri + 1}" t="inlineStr"${ri === 0 ? ' s="1"' : ""}><is><t xml:space="preserve">${x(v)}</t></is></c>`).join("")}</row>`).join("")}</sheetData></worksheet>`;
      const files = [
        ["[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`],
        ["_rels/.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`],
        ["xl/workbook.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Placement" sheetId="1" r:id="rId1"/></sheets></workbook>`],
        ["xl/_rels/workbook.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
        ["xl/styles.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF3D266"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`],
        ["xl/worksheets/sheet1.xml", sheet]
      ];
      const enc = new TextEncoder(), tbl = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
      const crc = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = tbl[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
      const parts = [], cen = []; let off = 0;
      const u16 = n => [n & 255, (n >> 8) & 255], u32 = n => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
      for (const [name, text] of files) {
        const nb = enc.encode(name), d = enc.encode(text), c = crc(d);
        const lh = new Uint8Array([0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(nb.length), ...u16(0)]);
        parts.push(lh, nb, d);
        cen.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(nb.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), nb);
        off += lh.length + nb.length + d.length;
      }
      const cl = cen.reduce((s, b) => s + b.length, 0);
      const end = new Uint8Array([0x50, 0x4b, 5, 6, ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cl), ...u32(off), ...u16(0)]);
      return new Blob([...parts, ...cen, end], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    }
    function ptPrint(rows) {
      const h = `<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>ECA — اختبار تحديد المستوى</title><style>body{font-family:Tahoma,Arial,sans-serif;padding:18px}h2{margin:0 0 4px}small{color:#555}table{border-collapse:collapse;width:100%;margin-top:12px;font-size:12px}th,td{border:1px solid #888;padding:5px 6px;text-align:center}th{background:#f3d266}td.l{direction:ltr}</style></head><body><h2>Egypt Chess Academy — نتائج اختبار تحديد المستوى</h2><small>${esc(ptDate(Date.now()))} • ${rows.length} طالب</small><table><tr>${PT_HEAD.map(t => `<th>${t}</th>`).join("")}</tr>${rows.map(r => `<tr>${r.map((c, i) => `<td${i === 3 || i === 4 ? ' class="l"' : ""}>${esc(c)}</td>`).join("")}</tr>`).join("")}</table></body></html>`;
      const f = document.createElement("iframe"); f.style.cssText = "position:fixed;left:-9999px;width:0;height:0;border:0"; document.body.appendChild(f);
      f.contentDocument.open(); f.contentDocument.write(h); f.contentDocument.close();
      setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (_) {} setTimeout(() => f.remove(), 3000); }, 300);
    }
    async function ptExport(kind) {
      const u = currUser(); if (!u || u.role !== "coach") return;
      const rows = ptReportRows(); if (!rows.length) return toast("مفيش نتايج جاهزة للتصدير.");
      if (window.fbPtSaveReport) window.fbPtSaveReport(rows).then(r => { if (!(r && r.ok)) toast("تنبيه: النسخة الاحتياطية ما اتحفظتش في قاعدة البيانات."); });
      if (kind === "print") return ptPrint(rows);
      const blob = ptXlsx(rows), name = "ECA-placement-" + todayISO() + ".xlsx", file = new File([blob], name, { type: blob.type });
      if (kind === "wa" && navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], title: "نتائج اختبار تحديد المستوى", text: "Egypt Chess Academy — نتائج اختبار تحديد المستوى (" + rows.length + " طالب)" }); return; } catch (e) { if (e && e.name === "AbortError") return; }
      }
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      if (kind === "wa") { toast("اتحمّل ملف Excel — ابعته للإدارة من واتساب."); setTimeout(() => window.open("https://wa.me/?text=" + encodeURIComponent("Egypt Chess Academy — نتائج اختبار تحديد المستوى (" + rows.length + " طالب) — الملف مرفق"), "_blank", "noopener"), 600); }
    }

    // البحث في خانة البحث العلوية: بالاسم أو الرقم → نتايج الاختبار (وإعادة الفتح)
    {
      const _cs = coachSearchStudent;
      coachSearchStudent = function (val) { if (tab === "placeresults") { PTR.q = val; return render(); } if (val && !PTR.list) ptLoad(); _cs(val); };
      const _rt = renderTrackerView;
      renderTrackerView = function () {
        const m = searchQ && PTR.list ? PTR.list.filter(r => ptMatch(r, searchQ)).slice(0, 5) : [];
        const box = m.length ? `<div class="mb-4 space-y-3"><div class="text-sm font-bold text-yellow-300">اختبار تحديد المستوى — نتايج مطابقة للبحث</div>${m.map(r => ptRowCard(r)).join("")}</div>` : "";
        return box + _rt();
      };
    }
