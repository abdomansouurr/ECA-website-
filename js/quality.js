// ECA — quality.js: التراجع بعد حذف طالب، تذكير النسخة الاحتياطية الأسبوعية، وسجل الأخطاء للأدمن (eca-v7)
// بيعتمد على: db, deleteStudent, exportBackup, adminToolsBox, renderCoachHome, closeAddStu, editStuId, selStuId (core)

    const LQ = (ar, en) => lang === "en" ? en : ar;

    // ---------- شريط «تراجع» ----------
    let undoTimer = null, undoCommit = null;
    function showUndo(msg, onUndo, onCommit, ms) {
      if (undoCommit) { const c = undoCommit; undoCommit = null; clearTimeout(undoTimer); c(); }   // اللي قبله يتنفّذ فوراً
      let bar = document.getElementById("undoBar");
      if (!bar) { bar = document.createElement("div"); bar.id = "undoBar"; bar.setAttribute("role", "status"); bar.setAttribute("aria-live", "polite"); document.body.appendChild(bar); }
      bar.className = "fixed z-[60] left-1/2 -translate-x-1/2 w-[min(94vw,440px)] gold-card rounded-2xl p-3 flex items-center gap-3 border-2 border-yellow-500/50";
      bar.style.bottom = "calc(16px + env(safe-area-inset-bottom, 0px))";
      bar.innerHTML = `<div class="flex-1 min-w-0"><div class="text-sm font-bold text-white truncate">${esc(msg)}</div>
          <div class="mt-1.5 h-1 rounded-full bg-zinc-800 overflow-hidden"><div id="undoProg" class="h-full bg-yellow-500" style="width:100%;transition:width ${ms}ms linear"></div></div></div>
        <button id="undoBtn" class="tap px-4 rounded-xl text-xs gold-btn">${LQ("تراجع", "Undo")}</button>`;
      requestAnimationFrame(() => { const p = document.getElementById("undoProg"); if (p) p.style.width = "0%"; });
      undoCommit = onCommit;
      document.getElementById("undoBtn").onclick = () => { clearTimeout(undoTimer); undoCommit = null; bar.remove(); onUndo(); };
      undoTimer = setTimeout(() => { const c = undoCommit; undoCommit = null; bar.remove(); if (c) c(); }, ms);
    }

    // بيختفي الطالب فوراً، ثم يبدأ احتساب مهلة الاستعادة بعد تأكيد الحذف.
    window.__pendingDel = window.__pendingDel || new Set();
    deleteStudent = async function () {
      if (!window.isFinanceAdminUnlocked) return toast("حذف الطالب للأدمن بس");
      if (!editStuId) return;
      const s = db.users.find(u => u.id === editStuId); if (!s) return;
      if (!await window.ecaConfirm(trText("سيتم إخفاء الطالب ومنع دخوله، مع إمكانية استعادته خلال 30 يومًا.") + "\n" + s.name)) return;
      const id = editStuId, snap = s;
      window.__pendingDel.add(id);
      db.users = db.users.filter(u => u.id !== id);
      if (selStuId === id) selStuId = "";
      closeAddStu(); render();
      showUndo(LQ(`اتحذف ${s.name}`, `${s.name} deleted`), () => {
        window.__pendingDel.delete(id);
        if (!db.users.some(u => u.id === id)) db.users.push(snap);
        render(); toast("رجّعنا الطالب");
      }, async () => {
        window.__pendingDel.delete(id);
        const result = window.fbOnStudentDeleted ? await window.fbOnStudentDeleted(id, snap.name) : { ok: false };
        if (!result.ok) {
          if (!db.users.some(u => u.id === id)) db.users.push(snap);
          render();
          toast("تعذّر حذف الطالب؛ لم يتم تغيير بياناته.");
          return;
        }
        save(); render();
      }, 8000);
    };
    // لو الصفحة اتقفلت في المهلة: الطالب مابيتحذفش (الأمان أهم من السرعة)

    // ---------- تذكير النسخة الاحتياطية ----------
    const BK_KEY = "ECA_LAST_BACKUP", BK_DAYS = 7;
    function lastBackupDays() {
      try { const t = Number(localStorage.getItem(BK_KEY)); return t ? Math.floor((Date.now() - t) / 864e5) : null; } catch (_) { return null; }
    }
    {
      const _eb = exportBackup;
      exportBackup = function () { _eb.apply(this, arguments); try { localStorage.setItem(BK_KEY, String(Date.now())); } catch (_) {} if (tab === "home") render(); };
    }
    function backupBannerHTML() {
      const d = lastBackupDays();
      if (d !== null && d < BK_DAYS) return "";
      return `<div class="gold-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 border border-amber-500/40">
        <div class="text-xs"><b class="text-amber-300">${LQ("وقت النسخة الاحتياطية الأسبوعية", "Weekly backup time")}</b>
          <div class="text-[11px] text-gray-400 mt-0.5">${d === null ? LQ("مفيش نسخة اتنزّلت من الجهاز ده قبل كده.", "No backup downloaded on this device yet.") : LQ(`آخر نسخة من ${d} يوم.`, `Last backup ${d} days ago.`)} ${LQ("البيانات على Firebase، والنسخة دي احتياط لو حصل أي حاجة.", "Data lives on Firebase; this copy is a safety net.")}</div></div>
        <button onclick="exportBackup()" class="tap px-4 rounded-xl text-xs gold-btn">${LQ("نزّل نسخة دلوقتي", "Download now")}</button>
      </div>`;
    }
    {
      const _ch = renderCoachHome;
      renderCoachHome = function (c) { const b = backupBannerHTML(); return b ? `<div class="space-y-6">${b}${_ch(c)}</div>` : _ch(c); };
    }

    // ---------- سجل الأخطاء (للأدمن) ----------
    {
      const _at = adminToolsBox;
      adminToolsBox = function () {
        return _at().replace(/<\/div>\s*$/, `<button onclick="openDeletedStudents()" class="px-3 py-2 rounded-xl bg-zinc-900 border border-amber-500/40 text-amber-300">${LQ("الطلاب المحذوفون", "Deleted students")}</button><button onclick="openErrorsLog()" class="px-3 py-2 rounded-xl bg-zinc-900 border border-sky-500/40 text-sky-300">${LQ("سجل الأخطاء", "Error log")}</button></div>`);
      };
    }
    async function openDeletedStudents() {
      if (!window.isFinanceAdminUnlocked) return toast("استعادة الطالب للأدمن فقط");
      let modal = document.getElementById("deletedStudentsModal");
      if (!modal) { modal = document.createElement("div"); modal.id = "deletedStudentsModal"; modal.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3"; document.body.appendChild(modal); }
      modal.innerHTML = `<div class="gold-card rounded-2xl max-w-xl w-full p-5 max-h-[90vh] overflow-y-auto space-y-3"><p class="text-sm text-gray-300">${LQ("جاري تحميل الطلاب المحذوفين...", "Loading deleted students...")}</p></div>`;
      const result = window.fbListDeletedStudents ? await window.fbListDeletedStudents() : { ok: false, rows: [] };
      if (!result.ok) {
        modal.innerHTML = `<div class="gold-card rounded-2xl max-w-xl w-full p-5"><p class="text-sm text-red-300">${LQ("تعذّر تحميل قائمة الطلاب المحذوفين.", "Could not load deleted students.")}</p><button onclick="document.getElementById('deletedStudentsModal').remove()" class="mt-3 tap px-4 py-2 rounded-xl gold-btn">${LQ("إغلاق", "Close")}</button></div>`;
        return;
      }
      const rows = result.rows.sort((a, b) => b.deletedAt - a.deletedAt);
      modal.innerHTML = `<div class="gold-card rounded-2xl max-w-xl w-full p-5 max-h-[90vh] overflow-y-auto space-y-3">
        <div class="flex items-center justify-between gap-2"><h3 class="font-bold text-lg text-yellow-400">${LQ("الطلاب المحذوفون", "Deleted students")}</h3><button onclick="document.getElementById('deletedStudentsModal').remove()" aria-label="${LQ("إغلاق", "Close")}" class="tap px-3 py-2 rounded-xl bg-zinc-900 text-gray-300">✕</button></div>
        <p class="text-xs text-gray-400">${LQ("يمكن استعادة الطالب خلال 30 يومًا من الحذف، وبعدها تُمسح بياناته نهائيًا.", "Students can be restored within 30 days of deletion. After that, their data is permanently erased.")}</p>
        ${rows.length ? rows.map(s => {
          const remaining = s.expiresAt - Date.now();
          const canRestore = remaining > 0 && s.expiresAt > 0;
          return `<div class="rounded-xl border border-yellow-500/20 bg-black/30 p-3 flex flex-wrap items-center justify-between gap-3">
            <div class="min-w-0"><div class="font-bold text-sm text-white">${esc(s.name)}</div><div class="text-[11px] text-gray-400">${canRestore ? LQ(`متبقي ${Math.ceil(remaining / 86400000)} يوم`, `${Math.ceil(remaining / 86400000)} days left`) : LQ("انتهت مهلة الاستعادة", "Restore period expired")}</div></div>
            ${canRestore ? `<button onclick="restoreDeletedStudent('${esc(s.id)}')" class="tap px-4 py-2 rounded-xl text-xs gold-btn">${LQ("استعادة", "Restore")}</button>` : ""}
          </div>`;
        }).join("") : `<p class="text-sm text-gray-400">${LQ("لا يوجد طلاب محذوفون.", "No deleted students.")}</p>`}
      </div>`;
    }
    window.openDeletedStudents = openDeletedStudents;
    window.restoreDeletedStudent = async function (id) {
      if (!window.isFinanceAdminUnlocked) return toast("استعادة الطالب للأدمن فقط");
      if (!await window.ecaConfirm(LQ("هل تريد استعادة حساب هذا الطالب؟", "Restore this student's account?"))) return;
      const result = window.fbRestoreStudent ? await window.fbRestoreStudent(id) : { ok: false };
      if (!result.ok) {
        toast(result.code === "expired" ? LQ("انتهت مهلة الاستعادة المحددة بـ30 يومًا.", "The 30-day restore period has expired.") : LQ("تعذّرت استعادة الطالب.", "Could not restore the student."));
        return;
      }
      toast(LQ("تمت استعادة الطالب.", "Student restored."));
      await openDeletedStudents();
    };
    let errList = [];
    async function openErrorsLog() {
      let m = document.getElementById("errModal");
      if (!m) { m = document.createElement("div"); m.id = "errModal"; m.className = "fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3"; document.body.appendChild(m); }
      m.classList.remove("hidden");
      m.innerHTML = `<div class="gold-card rounded-2xl max-w-2xl w-full p-5 max-h-[90vh] overflow-y-auto space-y-3"><div class="text-xs text-gray-400">${LQ("جاري التحميل...", "Loading...")}</div></div>`;
      errList = (window.fbListErrors && await window.fbListErrors()) || [];
      const fmt = d => d ? d.toLocaleString(lang === "en" ? "en-GB" : "ar-EG", { dateStyle: "short", timeStyle: "short" }) : "";
      const who = uid => { const u = db.users.find(x => x.id === uid); return u ? u.name : (uid ? uid.slice(0, 6) + "…" : ""); };
      m.innerHTML = `<div class="gold-card rounded-2xl max-w-2xl w-full p-5 max-h-[90vh] overflow-y-auto space-y-3">
        <div class="flex justify-between items-center gap-2">
          <h3 class="font-display font-bold text-lg text-yellow-400">${LQ("سجل الأخطاء", "Error log")} (${errList.length})</h3>
          <div class="flex gap-2">
            ${errList.length ? `<button onclick="clearErrorsLog()" class="tap px-3 rounded-xl text-xs bg-red-500/15 text-red-300 border border-red-500/40">${LQ("مسح الكل", "Clear all")}</button>` : ""}
            <button onclick="document.getElementById('errModal').classList.add('hidden')" aria-label="${LQ("إغلاق", "Close")}" class="tap px-3 rounded-xl text-sm bg-zinc-900 text-gray-300">✕</button>
          </div>
        </div>
        <p class="text-[11px] text-gray-500">${LQ("أخطاء الجافاسكريبت اللي ظهرت عند المستخدمين (أقصى 10 لكل جلسة). لو نفس الخطأ متكرر، ابعته للمطوّر.", "JavaScript errors seen by users (max 10 per session). If one keeps repeating, send it to the developer.")}</p>
        ${errList.length ? errList.map(e => `<div class="rounded-xl bg-black/60 border border-zinc-800 p-3 space-y-1">
          <div dir="ltr" class="text-xs font-mono text-red-300 break-words">${esc(e.msg)}</div>
          <div dir="ltr" class="text-[10px] font-mono text-gray-500 break-all">${esc(e.src)}${e.line ? ":" + e.line : ""}</div>
          <div class="text-[10px] text-gray-400">${esc(fmt(e.at))} • ${esc(who(e.uid))} • ${esc(e.tab || "")} • ${esc(e.ver || "")}</div>
        </div>`).join("") : `<p class="text-xs text-emerald-300">${LQ("مفيش أخطاء متسجّلة.", "No errors recorded.")}</p>`}
      </div>`;
    }
    async function clearErrorsLog() {
      if (!await window.ecaConfirm(trText("مسح كل الأخطاء المتسجّلة؟"))) return;
      if (window.fbClearErrors && await window.fbClearErrors(errList.map(e => e.id))) { toast("اتمسحت"); openErrorsLog(); }
    }

    // أسماء التاسك بار
    DICT.push(["جدول اليوم", "Today"], ["متابعة الطلاب", "Students"], ["تسجيل الحضور", "Attendance"], ["الحسابات", "Finance"], ["المنهج", "Curriculum"],
      ["دروسي", "My lessons"], ["ساحة التدريب", "Training arena"], ["البطولات", "Tournaments"], ["لوحة المتصدرين", "Leaderboard"], ["الرتب والشارات", "Ranks & badges"],
      ["شهاداتي", "Certificates"], ["تقرير ولي الأمر", "Parent report"], ["عن الأكاديمية", "About"], ["تسجيل الدخول", "Sign in"], ["الرئيسية", "Home"],
      ["ربط حساب Google", "Link Google account"], ["تغيير كلمة السر", "Change password"], ["تسجيل الخروج", "Sign out"], ["البطل:", "Champion:"], ["المتصدر:", "Leader:"], ["مثبّت", "Pinned"], ["نسخ FEN", "Copy FEN"], ["تعديل", "Edit"], ["كمّل الحل", "Continue the solution"],
      ["نقلة صحيحة — استنى رد الخصم", "Correct — wait for the reply"], ["اللغز اتحل صح", "Puzzle solved"], ["لاقي أحسن نقلة", "Find the best move"]);
    DICT.push(["رجّعنا الطالب", "Student restored"], ["مسح كل الأخطاء المتسجّلة؟", "Clear all recorded errors?"], ["اتمسحت", "Cleared"],
      ["تعذّر حفظ الإعلان", "Couldn't save the announcement"]);
    DICT.sort((a, b) => b[0].length - a[0].length);
