// ECA — announce.js: إعلانات الأكاديمية — الكوتش بيكتب، والطلبة بيشوفوها في الرئيسية (eca-v7)
// متخزّنة في meta/announcements { items: [{ id, text, at, until, aud, pin }] } — aud = "ALL" أو اسم مجموعة

    const LA = (ar, en) => lang === "en" ? en : ar;
    const ANN_MAX = 12;
    let annDraft = { text: "", days: 7, aud: "ALL", pin: false };
    function annActive(list) { const t = todayISO(); return (list || []).filter(a => !a.until || a.until >= t); }
    function annFor(u) { return annActive(db.announcements).filter(a => a.aud === "ALL" || a.aud === (u.group || "")); }
    function annSort(list) { return list.slice().sort((a, b) => (b.pin ? 1 : 0) - (a.pin ? 1 : 0) || (b.at || 0) - (a.at || 0)); }
    function annHidden() { try { return JSON.parse(localStorage.getItem("ECA_ANN_HIDDEN") || "[]"); } catch (_) { return []; } }
    function annHide(id) { const h = annHidden(); h.push(id); try { localStorage.setItem("ECA_ANN_HIDDEN", JSON.stringify(h.slice(-50))); } catch (_) {} render(); }

    function annPost() {
      if (!isCoach()) return;
      const text = String((document.getElementById("annText") || {}).value || "").replace(/[<>`]/g, "").trim().slice(0, 400);
      if (!text) return toast("اكتب نص الإعلان");
      const d = new Date(); d.setDate(d.getDate() + (Number(annDraft.days) || 7)); d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
      const item = { id: "a" + Date.now().toString(36), text, at: Date.now(), until: d.toISOString().slice(0, 10), aud: annDraft.aud || "ALL", pin: !!annDraft.pin };
      // بنشيل المنتهي ونحتفظ بأحدث ANN_MAX
      const items = [item].concat(annActive(db.announcements)).slice(0, ANN_MAX);
      db.announcements = items; annDraft = { text: "", days: 7, aud: "ALL", pin: false };
      if (window.fbSaveAnnouncements) window.fbSaveAnnouncements(items);
      keepScroll(render); toast("الإعلان اتنشر");
    }
    function annDelete(id) {
      if (!isCoach()) return;
      const items = (db.announcements || []).filter(a => a.id !== id);
      db.announcements = items; if (window.fbSaveAnnouncements) window.fbSaveAnnouncements(items); keepScroll(render);
    }
    function annCard(a, coach) {
      const aud = a.aud === "ALL" ? LA("الكل", "Everyone") : a.aud;
      return `<div class="rounded-xl ${a.pin ? "bg-yellow-500/10 border border-yellow-500/50" : "bg-black/60 border border-yellow-500/20"} p-3 space-y-1.5">
        <div class="text-sm text-white whitespace-pre-line leading-relaxed">${a.pin ? `<span class="text-[10px] font-bold text-yellow-300 me-1.5">${LA("مثبّت", "Pinned")}</span>` : ""}${esc(a.text)}</div>
        <div class="flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-500">
          <span>${new Date(a.at || Date.now()).toLocaleDateString(lang === "en" ? "en-GB" : "ar-EG", { day: "numeric", month: "short" })}${coach ? ` • ${esc(aud)} • ${LA("لحد", "until")} ${esc(a.until || "")}` : ""}</span>
          ${coach ? `<button onclick="annDelete('${a.id}')" class="tap px-2 rounded-lg text-[11px] text-red-300 border border-red-500/30">${LA("حذف", "Delete")}</button>`
            : a.pin ? "" : `<button onclick="annHide('${a.id}')" class="px-2 py-1 rounded-lg text-[11px] text-gray-400 hover:text-white">${LA("إخفاء", "Hide")} ✕</button>`}
        </div>
      </div>`;
    }

    function annCoachHTML() {
      const list = annSort(annActive(db.announcements));
      const pill = on => `tap px-3 rounded-xl text-[11px] font-bold ${on ? "gold-btn" : "bg-zinc-900 text-gray-300 border border-yellow-500/25"}`;
      return `<div class="gold-card rounded-2xl p-5 space-y-3">
        <h3 class="font-bold text-yellow-300">${LA("إعلانات الأكاديمية", "Academy announcements")}</h3>
        <textarea id="annText" rows="2" maxlength="400" oninput="annDraft.text=this.value" placeholder="${LA("مثلاً: مفيش حصص يوم الجمعة الجاية — أو: بطولة الشهر يوم 30 الساعة 5", "e.g. No classes next Friday — or: Monthly tournament on the 30th at 5 PM")}" class="w-full bg-black border border-yellow-500/40 rounded-xl px-3 py-2 text-sm text-white">${esc(annDraft.text)}</textarea>
        <div class="flex flex-wrap items-center gap-2">
          <select onchange="annDraft.aud=this.value" aria-label="${LA("مين يشوفه", "Audience")}" class="tap bg-black border border-yellow-500/40 rounded-xl px-2 text-xs text-white">
            <option value="ALL">${LA("كل الطلبة", "All students")}</option>
            ${(db.groups || []).map(g => `<option value="${esc(g)}" ${annDraft.aud === g ? "selected" : ""}>${esc(g)}</option>`).join("")}
          </select>
          <select onchange="annDraft.days=Number(this.value)" aria-label="${LA("المدة", "Duration")}" class="tap bg-black border border-yellow-500/40 rounded-xl px-2 text-xs text-white">
            ${[[1, LA("يوم", "1 day")], [3, LA("3 أيام", "3 days")], [7, LA("أسبوع", "1 week")], [14, LA("أسبوعين", "2 weeks")], [30, LA("شهر", "1 month")]].map(([v, l]) => `<option value="${v}" ${Number(annDraft.days) === v ? "selected" : ""}>${l}</option>`).join("")}
          </select>
          <button onclick="annDraft.pin=!annDraft.pin; annDraft.text=(document.getElementById('annText')||{}).value||''; keepScroll(render)" aria-pressed="${annDraft.pin}" class="${pill(annDraft.pin)}">${LA("تثبيت", "Pin")}</button>
          <button onclick="annPost()" class="tap px-4 rounded-xl text-xs gold-btn">${LA("انشر", "Post")}</button>
        </div>
        ${list.length ? `<div class="space-y-2">${list.map(a => annCard(a, true)).join("")}</div>` : `<p class="text-[11px] text-gray-500">${LA("مفيش إعلانات شغالة دلوقتي.", "No active announcements.")}</p>`}
      </div>`;
    }
    function annStudentHTML(u) {
      const hid = annHidden(), list = annSort(annFor(u)).filter(a => a.pin || !hid.includes(a.id));
      if (!list.length) return "";
      return `<div class="gold-card rounded-2xl p-5 space-y-3 border border-yellow-500/40">
        <h3 class="font-bold text-yellow-300">${LA("من الأكاديمية", "From the academy")}</h3>
        ${list.slice(0, 4).map(a => annCard(a, false)).join("")}
      </div>`;
    }

    {
      const _sh = renderStudentHome;
      renderStudentHome = function (s) { const a = annStudentHTML(s); return a ? `<div class="space-y-6">${a}${_sh(s)}</div>` : _sh(s); };
      const _ch = renderCoachHome;
      renderCoachHome = function (c) { return `<div class="space-y-6">${_ch(c)}${annCoachHTML()}</div>`; };
    }

    DICT.push(["اكتب نص الإعلان", "Write the announcement text"], ["الإعلان اتنشر", "Announcement posted"]);
    DICT.sort((a, b) => b[0].length - a[0].length);
